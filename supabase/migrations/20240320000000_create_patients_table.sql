-- Drop existing table if it exists
drop table if exists public.patients cascade;

-- Create patients table
create table if not exists public.patients (
    id uuid references auth.users(id) primary key,
    full_name text not null,
    phone_number text not null,
    date_of_birth date not null,
    medical_history text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.patients enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone"
    on public.patients for select
    using (true);

create policy "Users can insert their own profile"
    on public.patients for insert
    with check (auth.uid() = id);

create policy "Users can update own profile"
    on public.patients for update
    using (auth.uid() = id);

-- Create trigger for updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
create trigger handle_updated_at
    before update on public.patients
    for each row
    execute procedure public.handle_updated_at();

-- Create a function to handle user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
    -- Add a small delay to ensure the user is fully created in auth.users
    perform pg_sleep(0.5);
    
    insert into public.patients (id, full_name, phone_number, date_of_birth)
    values (
        new.id,
        coalesce(new.raw_user_meta_data->>'full_name', 'Unknown'),
        coalesce(new.raw_user_meta_data->>'phone_number', 'Not provided'),
        coalesce((new.raw_user_meta_data->>'date_of_birth')::date, current_date)
    );
    return new;
end;
$$ language plpgsql security definer;

-- Drop and recreate the trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row
    execute function public.handle_new_user(); 