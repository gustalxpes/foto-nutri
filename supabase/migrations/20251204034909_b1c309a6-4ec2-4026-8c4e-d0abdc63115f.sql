-- Add diet_days column to profiles table (array of weekday numbers 0-6, where 0=Sunday)
ALTER TABLE public.profiles 
ADD COLUMN diet_days integer[] DEFAULT ARRAY[1,2,3,4,5];