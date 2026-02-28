
CREATE POLICY "Users can delete their own lances"
ON public.lances
FOR DELETE
USING (auth.uid() = comprador_id);
