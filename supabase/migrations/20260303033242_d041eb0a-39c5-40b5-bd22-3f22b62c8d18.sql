
-- Create storage bucket for listing images
INSERT INTO storage.buckets (id, name, public) VALUES ('anuncio-imagens', 'anuncio-imagens', true);

-- Storage policies
CREATE POLICY "Anyone can view listing images"
ON storage.objects FOR SELECT
USING (bucket_id = 'anuncio-imagens');

CREATE POLICY "Authenticated users can upload listing images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'anuncio-imagens' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own listing images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'anuncio-imagens' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own listing images"
ON storage.objects FOR DELETE
USING (bucket_id = 'anuncio-imagens' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create anuncio_imagens table
CREATE TABLE public.anuncio_imagens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  anuncio_id UUID NOT NULL REFERENCES public.anuncios(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.anuncio_imagens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Images are viewable by everyone"
ON public.anuncio_imagens FOR SELECT
USING (true);

CREATE POLICY "Sellers can insert images for their listings"
ON public.anuncio_imagens FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.anuncios
    WHERE anuncios.id = anuncio_imagens.anuncio_id
    AND anuncios.vendedor_id = auth.uid()
  )
);

CREATE POLICY "Sellers can delete images for their listings"
ON public.anuncio_imagens FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.anuncios
    WHERE anuncios.id = anuncio_imagens.anuncio_id
    AND anuncios.vendedor_id = auth.uid()
  )
);
