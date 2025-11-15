-- Make content-media bucket public so media can be viewed
UPDATE storage.buckets 
SET public = true 
WHERE id = 'content-media';