-- Add policy to allow all authenticated users to view media for thumbnails
CREATE POLICY "Allow authenticated users to view all media"
ON public.media
FOR SELECT
TO authenticated
USING (true);