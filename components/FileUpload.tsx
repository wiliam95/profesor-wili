// FileUpload.tsx - Claude AI Style File Upload Component
import React, { useState, useRef, useCallback, memo } from 'react';
import { Upload, X, File, Image, FileText, Code, AlertCircle, Check } from 'lucide-react';
import { Attachment } from '../types';

interface FileUploadProps {
    onFilesSelected: (attachments: Attachment[]) => void;
    maxFiles?: number;
    maxSizeMB?: number;
    acceptedTypes?: string[];
    attachments: Attachment[];
    onRemoveAttachment: (index: number) => void;
}

export const FileUpload: React.FC<FileUploadProps> = memo(({
    onFilesSelected, maxFiles = 10, maxSizeMB = 20, acceptedTypes = ['image/*', 'text/*', 'application/pdf', '.py', '.js', '.ts', '.json', '.md'],
    attachments, onRemoveAttachment
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const processFiles = useCallback(async (files: FileList | File[]) => {
        setError(null);
        const fileArray = Array.from(files);
        if (fileArray.length + attachments.length > maxFiles) {
            setError(`Maximum ${maxFiles} files allowed`);
            return;
        }

        const newAttachments: Attachment[] = [];
        for (const file of fileArray) {
            if (file.size > maxSizeMB * 1024 * 1024) {
                setError(`${file.name} exceeds ${maxSizeMB}MB limit`);
                continue;
            }

            const reader = new FileReader();
            const attachment = await new Promise<Attachment>((resolve) => {
                reader.onload = () => {
                    const base64 = (reader.result as string).split(',')[1];
                    resolve({
                        type: file.type.startsWith('image/') ? 'image' : 'file',
                        data: base64,
                        mimeType: file.type || 'application/octet-stream',
                        name: file.name,
                        size: file.size
                    });
                };
                reader.readAsDataURL(file);
            });
            newAttachments.push(attachment);
        }

        if (newAttachments.length > 0) onFilesSelected(newAttachments);
    }, [attachments.length, maxFiles, maxSizeMB, onFilesSelected]);

    const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
    const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); }, []);
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files.length > 0) processFiles(e.dataTransfer.files);
    }, [processFiles]);

    const getFileIcon = (attachment: Attachment) => {
        if (attachment.type === 'image') return <Image className="w-4 h-4" />;
        const ext = attachment.name?.split('.').pop()?.toLowerCase();
        if (['js', 'ts', 'py', 'jsx', 'tsx', 'json'].includes(ext || '')) return <Code className="w-4 h-4" />;
        return <FileText className="w-4 h-4" />;
    };

    return (
        <div className="space-y-3">
            <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${isDragging ? 'border-orange-500 bg-orange-500/10' : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/50'
                    }`}>
                <input ref={fileInputRef} type="file" multiple accept={acceptedTypes.join(',')} onChange={(e) => e.target.files && processFiles(e.target.files)} className="hidden" />
                <Upload className={`w-8 h-8 mx-auto mb-3 ${isDragging ? 'text-orange-400' : 'text-slate-500'}`} />
                <p className="text-sm text-slate-400 mb-1">
                    {isDragging ? 'Drop files here' : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs text-slate-600">Max {maxSizeMB}MB per file • Up to {maxFiles} files</p>
            </div>

            {error && (
                <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" /><span>{error}</span>
                </div>
            )}

            {attachments.length > 0 && (
                <div className="space-y-2">
                    {attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center gap-3 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg group">
                            {attachment.type === 'image' ? (
                                <img src={`data:${attachment.mimeType};base64,${attachment.data}`} alt={attachment.name} className="w-10 h-10 rounded object-cover" />
                            ) : (
                                <div className="w-10 h-10 rounded bg-slate-700 flex items-center justify-center text-slate-400">{getFileIcon(attachment)}</div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-slate-200 truncate">{attachment.name}</p>
                                <p className="text-xs text-slate-500">{attachment.size ? `${(attachment.size / 1024).toFixed(1)} KB` : 'Unknown size'}</p>
                            </div>
                            <button onClick={() => onRemoveAttachment(index)} className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-slate-700 rounded-lg transition-all">
                                <X className="w-4 h-4 text-slate-500" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
});

FileUpload.displayName = 'FileUpload';
export default FileUpload;
