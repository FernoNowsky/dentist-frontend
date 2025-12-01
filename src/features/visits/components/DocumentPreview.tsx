import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';
import { FileText, Image as ImageIcon, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DocumentPreviewProps {
    documentId?: string;
    file?: File;
    className?: string;
    title?: string;
}

export function DocumentPreview({ documentId, file, className, title }: DocumentPreviewProps) {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [isImage, setIsImage] = useState(true);

    useEffect(() => {
        if (file) {
            if (!file.type.startsWith('image/')) {
                setIsImage(false);
                return;
            }
            const url = URL.createObjectURL(file);
            setImageUrl(url);
            return () => URL.revokeObjectURL(url);
        } else if (documentId) {
            setLoading(true);
            apiRequest<Blob>(`/documents/${documentId}/file`, {
                method: 'get',
                responseType: 'blob'
            }).then((blob) => {
                if (!blob.type.startsWith('image/')) {
                    setIsImage(false);
                    return;
                }
                const url = URL.createObjectURL(blob);
                setImageUrl(url);
                // Clean up on unmount or id change
                return () => URL.revokeObjectURL(url);
            }).catch(() => {
                setError(true);
            }).finally(() => {
                setLoading(false);
            });
        }
    }, [documentId, file]);

    if (loading) {
        return (
            <div className={cn("flex items-center justify-center bg-muted rounded-md", className)}>
                <Spinner size="sm" />
            </div>
        );
    }

    if (error || !isImage) {
        return (
            <div className={cn("flex flex-col items-center justify-center bg-muted rounded-md p-2 text-muted-foreground", className)}>
                <FileText className="h-8 w-8 mb-1" />
                <span className="text-xs text-center truncate w-full px-1">{title || "Dokument"}</span>
            </div>
        );
    }

    if (imageUrl) {
        return (
            <Dialog>
                <div className={cn("relative overflow-hidden rounded-md border border-border bg-muted group", className)}>
                    <img
                        src={imageUrl}
                        alt={title || "Podgląd dokumentu"}
                        className="w-full h-full object-cover"
                    />
                    <DialogTrigger asChild>
                        <Button
                            variant="secondary"
                            size="icon"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 bg-background/80 hover:bg-background"
                        >
                            <Maximize2 className="h-4 w-4" />
                        </Button>
                    </DialogTrigger>
                </div>
                <DialogContent className="max-w-[90vw] max-h-[90vh] w-auto h-auto p-0 overflow-hidden bg-transparent border-none shadow-none">
                    <img
                        src={imageUrl}
                        alt={title || "Podgląd dokumentu"}
                        className="w-full h-full object-contain max-h-[90vh]"
                    />
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <div className={cn("flex items-center justify-center bg-muted rounded-md", className)}>
            <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
        </div>
    );
}
