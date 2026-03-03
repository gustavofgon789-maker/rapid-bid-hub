import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  anuncioId: string;
  userId: string;
  images: { id: string; url: string; ordem: number }[];
  onImagesChange: (images: { id: string; url: string; ordem: number }[]) => void;
  maxImages?: number;
}

const ImageUpload = ({ anuncioId, userId, images, onImagesChange, maxImages = 5 }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remaining = maxImages - images.length;
    if (remaining <= 0) {
      toast.error(`Máximo de ${maxImages} imagens permitido.`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remaining);
    setUploading(true);

    try {
      const newImages: { id: string; url: string; ordem: number }[] = [];

      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} é maior que 5MB.`);
          continue;
        }

        const ext = file.name.split(".").pop();
        const path = `${userId}/${anuncioId}/${Date.now()}_${i}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("anuncio-imagens")
          .upload(path, file);

        if (uploadError) {
          toast.error(`Erro ao enviar ${file.name}`);
          continue;
        }

        const { data: urlData } = supabase.storage
          .from("anuncio-imagens")
          .getPublicUrl(path);

        const ordem = images.length + i;
        const { data: imgRow, error: insertError } = await supabase
          .from("anuncio_imagens")
          .insert({ anuncio_id: anuncioId, url: urlData.publicUrl, ordem })
          .select()
          .single();

        if (insertError) {
          toast.error("Erro ao salvar imagem.");
          continue;
        }

        newImages.push({ id: imgRow.id, url: imgRow.url, ordem: imgRow.ordem });
      }

      onImagesChange([...images, ...newImages]);
      if (newImages.length > 0) toast.success(`${newImages.length} imagem(ns) enviada(s)!`);
    } catch {
      toast.error("Erro inesperado no upload.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = async (img: { id: string; url: string }) => {
    try {
      // Extract storage path from URL
      const urlParts = img.url.split("/anuncio-imagens/");
      if (urlParts[1]) {
        await supabase.storage.from("anuncio-imagens").remove([decodeURIComponent(urlParts[1])]);
      }
      await supabase.from("anuncio_imagens").delete().eq("id", img.id);
      onImagesChange(images.filter((i) => i.id !== img.id));
      toast.success("Imagem removida.");
    } catch {
      toast.error("Erro ao remover imagem.");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        {images.map((img) => (
          <div key={img.id} className="relative w-24 h-24 rounded-lg overflow-hidden border border-border group">
            <img src={img.url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => handleRemove(img)}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-24 h-24 rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <ImagePlus className="w-5 h-5" />
                <span className="text-[10px]">Adicionar</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleUpload}
        className="hidden"
      />

      <p className="text-xs text-muted-foreground">
        {images.length}/{maxImages} imagens • Máx. 5MB cada
      </p>
    </div>
  );
};

export default ImageUpload;
