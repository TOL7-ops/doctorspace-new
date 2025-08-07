-- Fix signup flow by ensuring proper table structure and triggers

-- First, let's check if we need to create a profiles table or fix the patients table
-- The current setup uses patients table as the profile table

-- Drop the existing trigger to recreate it properly
drop trigger if exists on_auth_user_created on auth.users;

-- Drop the existing function to recreate it
drop function if exists public.handle_new_user();

-- Create an improved function to handle user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
    -- Insert into patients table with proper error handling
    insert into public.patients (
        id, 
        full_name, 
        phone_number, 
        date_of_birth
    )
    values (
        new.id,
        coalesce(new.raw_user_meta_data->>'full_name', 'Unknown User'),
        coalesce(new.raw_user_meta_data->>'phone_number', 'Not provided'),
        coalesce((new.raw_user_meta_data->>'date_of_birth')::date, current_date)
    )
    on conflict (id) do nothing; -- Prevent duplicate insertions
    
    return new;
exception
    when others then
        -- Log the error but don't fail the user creation
        raise log 'Error creating patient profile for user %: %', new.id, sqlerrm;
        return new;
end;
$$ language plpgsql security definer;

-- Create the trigger
create trigger on_auth_user_created
    after insert on auth.users
    for each row
    execute function public.handle_new_user();

-- Ensure RLS policies are correct
-- Drop existing policies to recreate them
drop policy if exists "Public profiles are viewable by everyone" on public.patients;
drop policy if exists "Users can insert their own profile" on public.patients;
drop policy if exists "Users can update own profile" on public.patients;

-- Create improved policies
create policy "Public profiles are viewable by everyone"
    on public.patients for select
    using (true);

create policy "Users can insert their own profile"
    on public.patients for insert
    with check (auth.uid() = id);

create policy "Users can update own profile"
    on public.patients for update
    using (auth.uid() = id);

-- Add a policy for users to delete their own profile (optional)
create policy "Users can delete own profile"
    on public.patients for delete
    using (auth.uid() = id);

-- Ensure the patients table has the correct structure
-- Add any missing columns if they don't exist
do $$
begin
    -- Add phone_number column if it doesn't exist
    if not exists (select 1 from information_schema.columns 
                   where table_name = 'patients' and column_name = 'phone_number') then
        alter table public.patients add column phone_number text not null default 'Not provided';
    end if;
    
    -- Add date_of_birth column if it doesn't exist
    if not exists (select 1 from information_schema.columns 
                   where table_name = 'patients' and column_name = 'date_of_birth') then
        alter table public.patients add column date_of_birth date not null default current_date;
    end if;
    
    -- Add medical_history column if it doesn't exist
    if not exists (select 1 from information_schema.columns 
                   where table_name = 'patients' and column_name = 'medical_history') then
        alter table public.patients add column medical_history text;
    end if;
end $$; 