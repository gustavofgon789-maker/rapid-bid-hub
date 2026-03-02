-- Add new lance_status values for transaction flow
ALTER TYPE public.lance_status ADD VALUE IF NOT EXISTS 'recusado';
ALTER TYPE public.lance_status ADD VALUE IF NOT EXISTS 'aguardando_pagamento';
ALTER TYPE public.lance_status ADD VALUE IF NOT EXISTS 'pago';
ALTER TYPE public.lance_status ADD VALUE IF NOT EXISTS 'enviado';
ALTER TYPE public.lance_status ADD VALUE IF NOT EXISTS 'recebido';
ALTER TYPE public.lance_status ADD VALUE IF NOT EXISTS 'finalizado';
ALTER TYPE public.lance_status ADD VALUE IF NOT EXISTS 'cancelado';

-- Add cancelado to anuncio_status
ALTER TYPE public.anuncio_status ADD VALUE IF NOT EXISTS 'cancelado';