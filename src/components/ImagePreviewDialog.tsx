import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface ImagePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  title?: string;
}

const ImagePreviewDialog = ({ open, onOpenChange, imageUrl, title }: ImagePreviewDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-2">
        <DialogTitle className="sr-only">{title || "Preview Gambar"}</DialogTitle>
        <AspectRatio ratio={4 / 3}>
          <img
            src={imageUrl}
            alt={title || "Preview"}
            className="w-full h-full object-contain rounded-md bg-muted"
          />
        </AspectRatio>
      </DialogContent>
    </Dialog>
  );
};

export default ImagePreviewDialog;
