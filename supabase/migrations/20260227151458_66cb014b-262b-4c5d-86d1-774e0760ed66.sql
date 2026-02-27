
-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_completo TEXT NOT NULL,
  cpf_cnpj TEXT,
  whatsapp TEXT NOT NULL,
  cidade TEXT NOT NULL DEFAULT '',
  estado TEXT NOT NULL DEFAULT '',
  reputacao NUMERIC(3,2) NOT NULL DEFAULT 5.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Categories enum
CREATE TYPE public.categoria_tipo AS ENUM ('Celulares', 'Carros', 'Caminhões', 'Motos', 'Outros');

-- Anuncio status enum
CREATE TYPE public.anuncio_status AS ENUM ('ativo', 'aguardando_escolha', 'finalizado');

-- Lance status enum
CREATE TYPE public.lance_status AS ENUM ('pendente', 'aceito');

-- Anuncios table
CREATE TABLE public.anuncios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendedor_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  categoria public.categoria_tipo NOT NULL DEFAULT 'Outros',
  motivo_urgencia TEXT,
  preco_minimo NUMERIC(12,2) NOT NULL,
  duracao_dias INT NOT NULL DEFAULT 7,
  data_fim TIMESTAMPTZ NOT NULL,
  status public.anuncio_status NOT NULL DEFAULT 'ativo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.anuncios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anuncios are viewable by everyone" ON public.anuncios FOR SELECT USING (true);
CREATE POLICY "Users can create their own anuncios" ON public.anuncios FOR INSERT WITH CHECK (auth.uid() = vendedor_id);
CREATE POLICY "Users can update their own anuncios" ON public.anuncios FOR UPDATE USING (auth.uid() = vendedor_id);
CREATE POLICY "Users can delete their own anuncios" ON public.anuncios FOR DELETE USING (auth.uid() = vendedor_id);

-- Lances table
CREATE TABLE public.lances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anuncio_id UUID NOT NULL REFERENCES public.anuncios(id) ON DELETE CASCADE,
  comprador_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  valor NUMERIC(12,2) NOT NULL,
  status public.lance_status NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lances are viewable by everyone" ON public.lances FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create lances" ON public.lances FOR INSERT WITH CHECK (auth.uid() = comprador_id);
CREATE POLICY "Lance owner can update" ON public.lances FOR UPDATE USING (auth.uid() = comprador_id);
-- Vendedor can also update lance status (accept)
CREATE POLICY "Vendedor can accept lances" ON public.lances FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.anuncios WHERE anuncios.id = lances.anuncio_id AND anuncios.vendedor_id = auth.uid())
);

-- Validation trigger: new lance must be > current highest lance
CREATE OR REPLACE FUNCTION public.validate_lance_valor()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  max_lance NUMERIC(12,2);
  min_preco NUMERIC(12,2);
BEGIN
  SELECT preco_minimo INTO min_preco FROM public.anuncios WHERE id = NEW.anuncio_id;
  
  IF NEW.valor < min_preco THEN
    RAISE EXCEPTION 'Lance deve ser maior ou igual ao preço mínimo de %', min_preco;
  END IF;

  SELECT COALESCE(MAX(valor), 0) INTO max_lance FROM public.lances WHERE anuncio_id = NEW.anuncio_id;
  
  IF max_lance > 0 AND NEW.valor <= max_lance THEN
    RAISE EXCEPTION 'Lance deve ser maior que o lance atual de %', max_lance;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_lance_before_insert
BEFORE INSERT ON public.lances
FOR EACH ROW
EXECUTE FUNCTION public.validate_lance_valor();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_anuncios_updated_at BEFORE UPDATE ON public.anuncios FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for lances
ALTER PUBLICATION supabase_realtime ADD TABLE public.lances;
