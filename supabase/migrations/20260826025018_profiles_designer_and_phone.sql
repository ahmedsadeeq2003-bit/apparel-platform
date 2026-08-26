-- Signup now asks "are you a graphic designer?" and collects a phone
-- number. `phone` already existed on public.profiles (baseline schema)
-- but was never populated by the signup trigger; `is_designer` is new.
-- Both are read from auth.users.raw_user_meta_data, the same mechanism
-- handle_new_user() already uses for full_name.

alter table public.profiles add column is_designer boolean not null default false;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  insert into public.profiles (id, full_name, phone, is_designer)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone',
    coalesce((new.raw_user_meta_data ->> 'is_designer')::boolean, false)
  );
  return new;
end;
$$;
