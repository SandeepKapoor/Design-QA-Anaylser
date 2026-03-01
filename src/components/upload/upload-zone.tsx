'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, X, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface UploadZoneProps {
    label: string
    file: File | null
    onFileSelect: (file: File | null) => void
}

export function UploadZone({ label, file, onFileSelect }: UploadZoneProps) {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            onFileSelect(acceptedFiles[0])
        }
    }, [onFileSelect])

    const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
        onDrop,
        accept: {
            'image/png': ['.png'],
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/webp': ['.webp'],
        },
        maxSize: 10 * 1024 * 1024,
        multiple: false,
    })

    if (file) {
        const objectUrl = URL.createObjectURL(file)
        return (
            <div className="relative w-full aspect-[4/3] sm:aspect-video rounded-xl overflow-hidden border border-border group">
                <img
                    src={objectUrl}
                    alt={label}
                    className="w-full h-full object-contain bg-surface-primary"
                />
                <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => onFileSelect(null)}
                        className="rounded-full shadow-lg"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>
                <div className="absolute bottom-3 left-3 bg-surface-elevated/80 backdrop-blur-md px-3 py-1.5 rounded-md text-xs font-medium border border-border flex items-center gap-2">
                    <ImageIcon className="h-3 w-3 text-accent-cyan" />
                    <span className="truncate max-w-[150px]">{file.name}</span>
                </div>
            </div>
        )
    }

    return (
        <div
            {...getRootProps()}
            className={`
        w-full aspect-[4/3] sm:aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-300 ease-out
        ${isDragActive ? 'border-accent-cyan bg-accent-cyan/5 scale-[1.02]' : 'border-border bg-surface-primary hover:border-border-active hover:bg-surface-elevated'}
        ${isDragReject ? 'border-accent-warm bg-accent-warm/10' : ''}
      `}
        >
            <input {...getInputProps()} />
            <div className={`p-4 rounded-full mb-4 ${isDragActive ? 'bg-accent-cyan/20 text-accent-cyan' : 'bg-surface-elevated text-text-secondary'} transition-colors`}>
                <UploadCloud className="h-8 w-8" />
            </div>
            <h3 className="font-medium text-lg text-text-primary mb-1">{label}</h3>
            <p className="text-sm text-text-secondary">
                {isDragActive
                    ? "Drop to upload..."
                    : "Drag & drop or click to select"}
            </p>
            <p className="text-xs text-text-secondary mt-4 opacity-70">
                PNG, JPG, WebP · max 10 MB
            </p>
        </div>
    )
}
