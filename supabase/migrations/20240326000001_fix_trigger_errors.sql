-- Fix trigger errors and add better error handling for signup flow

-- First, let's drop the existing trigger and function to recreate them properly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create a more robust trigger function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    full_name_val TEXT;
    phone_number_val TEXT;
    date_of_birth_val DATE;
    error_message TEXT;
BEGIN
    -- Extract values from user metadata with proper error handling
    full_name_val := COALESCE(NEW.raw_user_meta_data->>'full_name', 'Unknown User');
    phone_number_val := COALESCE(NEW.raw_user_meta_data->>'phone_number', 'Not provided');
    
    -- Handle date_of_birth with proper parsing
    BEGIN
        date_of_birth_val := COALESCE((NEW.raw_user_meta_data->>'date_of_birth')::DATE, CURRENT_DATE);
    EXCEPTION
        WHEN OTHERS THEN
            date_of_birth_val := CURRENT_DATE;
            RAISE LOG 'Invalid date_of_birth for user %: %, using current date', NEW.id, NEW.raw_user_meta_data->>'date_of_birth';
    END;

    -- Log the attempt
    RAISE LOG 'Creating patient profile for user % with name: %, phone: %, dob: %', 
        NEW.id, full_name_val, phone_number_val, date_of_birth_val;

    -- Insert into patients table with comprehensive error handling
    BEGIN
        INSERT INTO public.patients (
            id, 
            full_name, 
            phone_number, 
            date_of_birth
        )
        VALUES (
            NEW.id,
            full_name_val,
            phone_number_val,
            date_of_birth_val
        )
        ON CONFLICT (id) DO UPDATE SET
            full_name = EXCLUDED.full_name,
            phone_number = EXCLUDED.phone_number,
            date_of_birth = EXCLUDED.date_of_birth,
            updated_at = NOW();
        
        RAISE LOG 'Successfully created/updated patient profile for user %', NEW.id;
        
    EXCEPTION
        WHEN OTHERS THEN
            error_message := SQLERRM;
            RAISE LOG 'Error creating patient profile for user %: %', NEW.id, error_message;
            
            -- Don't fail the user creation, just log the error
            -- This prevents the entire signup from failing due to profile creation issues
            RETURN NEW;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Ensure the patients table has the correct structure and constraints
DO $$
BEGIN
    -- Add any missing columns with proper defaults
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'patients' AND column_name = 'phone_number') THEN
        ALTER TABLE public.patients ADD COLUMN phone_number TEXT NOT NULL DEFAULT 'Not provided';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'patients' AND column_name = 'date_of_birth') THEN
        ALTER TABLE public.patients ADD COLUMN date_of_birth DATE NOT NULL DEFAULT CURRENT_DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'patients' AND column_name = 'medical_history') THEN
        ALTER TABLE public.patients ADD COLUMN medical_history TEXT;
    END IF;
    
    -- Ensure the primary key constraint exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE table_name = 'patients' AND constraint_type = 'PRIMARY KEY') THEN
        ALTER TABLE public.patients ADD CONSTRAINT patients_pkey PRIMARY KEY (id);
    END IF;
    
    -- Ensure the foreign key constraint exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE table_name = 'patients' AND constraint_name LIKE '%auth_users%') THEN
        ALTER TABLE public.patients ADD CONSTRAINT patients_id_fkey 
            FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error ensuring table structure: %', SQLERRM;
END $$;

-- Recreate RLS policies with better error handling
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.patients;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.patients;
DROP POLICY IF EXISTS "Users can update own profile" ON public.patients;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.patients;

-- Create improved policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.patients FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON public.patients FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.patients FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
    ON public.patients FOR DELETE
    USING (auth.uid() = id);

-- Add a policy for service role to manage profiles (for admin operations)
CREATE POLICY "Service role can manage all profiles"
    ON public.patients FOR ALL
    USING (auth.role() = 'service_role');

-- Create a function to manually create profiles if needed
CREATE OR REPLACE FUNCTION public.create_patient_profile_manual(
    user_id UUID,
    user_full_name TEXT DEFAULT 'Unknown User',
    user_phone TEXT DEFAULT 'Not provided',
    user_dob DATE DEFAULT CURRENT_DATE
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    INSERT INTO public.patients (
        id, 
        full_name, 
        phone_number, 
        date_of_birth
    )
    VALUES (
        user_id,
        user_full_name,
        user_phone,
        user_dob
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        phone_number = EXCLUDED.phone_number,
        date_of_birth = EXCLUDED.date_of_birth,
        updated_at = NOW();
    
    SELECT json_build_object(
        'success', true,
        'message', 'Profile created/updated successfully',
        'user_id', user_id
    ) INTO result;
    
    RETURN result;
    
EXCEPTION
    WHEN OTHERS THEN
        SELECT json_build_object(
            'success', false,
            'message', SQLERRM,
            'user_id', user_id
        ) INTO result;
        
        RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.create_patient_profile_manual(UUID, TEXT, TEXT, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_patient_profile_manual(UUID, TEXT, TEXT, DATE) TO service_role; 