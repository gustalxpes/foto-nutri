-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  daily_calories_goal INTEGER DEFAULT 2000,
  daily_carbs_goal INTEGER DEFAULT 250,
  daily_protein_goal INTEGER DEFAULT 150,
  daily_fat_goal INTEGER DEFAULT 65,
  daily_fiber_goal INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create meals table
CREATE TABLE public.meals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  datetime TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  meal_type TEXT NOT NULL CHECK (meal_type IN ('café', 'almoço', 'jantar', 'lanche', 'outro')),
  image_url TEXT,
  servings DECIMAL(3,1) NOT NULL DEFAULT 1.0,
  foods TEXT[] DEFAULT '{}',
  calories INTEGER NOT NULL DEFAULT 0,
  carbs INTEGER NOT NULL DEFAULT 0,
  protein INTEGER NOT NULL DEFAULT 0,
  fat INTEGER NOT NULL DEFAULT 0,
  fiber INTEGER NOT NULL DEFAULT 0,
  confidence DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

-- Meals policies
CREATE POLICY "Users can view their own meals" 
ON public.meals FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meals" 
ON public.meals FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meals" 
ON public.meals FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meals" 
ON public.meals FOR DELETE 
USING (auth.uid() = user_id);

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to auto-create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();