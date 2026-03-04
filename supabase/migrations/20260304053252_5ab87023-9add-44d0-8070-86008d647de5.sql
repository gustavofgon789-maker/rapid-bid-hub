
-- Create notifications table for bidders
CREATE TABLE public.notificacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  lida BOOLEAN NOT NULL DEFAULT false,
  tipo TEXT NOT NULL DEFAULT 'info',
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notificacoes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
  ON public.notificacoes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow insert via service role or authenticated (for cancellation flow)
CREATE POLICY "Authenticated users can insert notifications"
  ON public.notificacoes FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add cascade delete for anuncio_imagens
ALTER TABLE public.anuncio_imagens DROP CONSTRAINT IF EXISTS anuncio_imagens_anuncio_id_fkey;
ALTER TABLE public.anuncio_imagens
  ADD CONSTRAINT anuncio_imagens_anuncio_id_fkey
  FOREIGN KEY (anuncio_id) REFERENCES public.anuncios(id) ON DELETE CASCADE;

-- Add cascade delete for lances
ALTER TABLE public.lances DROP CONSTRAINT IF EXISTS lances_anuncio_id_fkey;
ALTER TABLE public.lances
  ADD CONSTRAINT lances_anuncio_id_fkey
  FOREIGN KEY (anuncio_id) REFERENCES public.anuncios(id) ON DELETE CASCADE;
