
-- Add a Row Level Security policy for appointments that allows admins to do all operations
CREATE POLICY "Admins can manage all appointments"
ON public.appointments
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.user_profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Add a policy that allows users to manage their own appointments
CREATE POLICY "Users can manage their own appointments"
ON public.appointments
FOR ALL
TO authenticated
USING (
  user_id = auth.uid()
);

-- Add policy for users to create appointments without a user_id
CREATE POLICY "Users can create appointments without user_id"
ON public.appointments
FOR INSERT
TO authenticated
WITH CHECK (true);

