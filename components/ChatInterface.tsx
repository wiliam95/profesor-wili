import React, { useRef, useEffect, useState } from 'react';
import { Send, Paperclip, Mic, Copy, Check, StopCircle, Share, Trash2, Camera } from 'lucide-react';
import { Message, Role, Attachment, ModelType } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  activeModel: ModelType;
  isInternetEnabled: boolean;
  isMemoryEnabled: boolean;
  onSendMessage: (text: string, attachments: Attachment[]) => void;
  onClear: () => void;
  onStopGeneration?: () => void;
  onToggleInternet: () => void;
  onToggleMemory: () => void;
  onModelChange: (model: ModelType) => void;
  onNewChat: () => void;
  onFeatureClick?: (featureId: string) => void;
  onOpenSettings?: () => void;
  onOpenNotifications?: () => void;
  onOpenProfile?: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  isLoading,
  onSendMessage,
  onStopGeneration,
  onClear,
  onFeatureClick
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const textBeforeRef = useRef<string>('');
  const [copiedId, setCopiedId] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = () => {
    if (!inputText.trim() && attachments.length === 0) return;
    onSendMessage(inputText, attachments);
    setInputText('');
    setAttachments([]);
    if (inputRef.current) inputRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const validFiles = Array.from(files).filter(f => f.size <= 10 * 1024 * 1024);
    const atts: Attachment[] = await Promise.all(
      validFiles.slice(0, 5).map(f => new Promise<Attachment>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            type: f.type.startsWith('image/') ? 'image' : 'file',
            data: String(reader.result).split(',')[1] || '',
            mimeType: f.type,
            name: f.name,
            size: f.size
          });
        };
        reader.readAsDataURL(f);
      }))
    );
    setAttachments(prev => [...prev, ...atts].slice(0, 10));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const startVoice = () => {
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      alert("Browser tidak mendukung input suara.");
      return;
    }
    const recognition = new SR();
    recognition.lang = 'id-ID';
    recognition.continuous = false;
    recognition.interimResults = true;

    setIsRecording(true);
    recognitionRef.current = recognition;
    textBeforeRef.current = inputText + (inputText && !inputText.endsWith(' ') ? ' ' : '');

    const sessionId = Date.now();
    (window as any)._voiceSessionId = sessionId;
    (window as any)._lastVoiceResult = '';

    recognition.onresult = (e: any) => {
      if ((window as any)._voiceSessionId !== sessionId) return;
      const lastResultIndex = e.results.length - 1;
      const result = e.results[lastResultIndex];
      const transcript = result[0].transcript.trim();

      if (result.isFinal) {
        if (transcript === (window as any)._lastVoiceResult) return;
        (window as any)._lastVoiceResult = transcript;
        const newText = textBeforeRef.current + transcript;
        textBeforeRef.current = newText + ' ';
        setInputText(newText);
      } else {
        setInputText(textBeforeRef.current + transcript);
      }
    };

    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => {
      setIsRecording(false);
      if ((window as any)._voiceSessionId === sessionId) {
        (window as any)._voiceSessionId = null;
        (window as any)._lastVoiceResult = '';
      }
    };

    recognition.start();
  };

  const stopVoice = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsRecording(false);
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(''), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[--bg-secondary]">
      <div className="h-14 px-6 flex items-center justify-between border-b border-[--border-subtle] bg-[--bg-primary]">
        <h1 className="text-lg font-semibold text-[--text-primary]">
          {messages.length > 0
            ? messages.find(m => m.role === Role.USER)?.text.slice(0, 40) || 'New Chat'
            : 'New Chat'}
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const text = messages.map(m => `${m.role}: ${m.text}`).join('\n\n');
              if (navigator.share) {
                navigator.share({ title: 'Chat Export', text }).catch(() => { });
              } else {
                navigator.clipboard.writeText(text);
              }
            }}
            className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-[--bg-hover] text-[--text-muted] transition-colors"
            title="Share Chat"
          >
            <Share size={20} />
          </button>
          <button
            onClick={() => {
              if (window.confirm('Hapus semua pesan?')) onClear();
            }}
            className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-[--bg-hover] text-[--text-muted] transition-colors"
            title="Clear Chat"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto px-6 py-6"
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        <div className="max-w-[800px] mx-auto">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full pb-24">
              <div className="w-16 h-16 bg-[--accent-primary] rounded-full flex items-center justify-center text-white text-2xl font-semibold mb-6">
                W
              </div>
              <h2 className="text-xl font-semibold text-[--text-primary] mb-2">
                Apa yang bisa saya bantu hari ini?
              </h2>
              <p className="text-[--text-muted] text-sm">
                Tanyakan apa saja kepada saya
              </p>
            </div>
          )}

          {messages.length > 0 && (
            <div className="space-y-6">
              {messages.map((msg) => (
                <div key={msg.id}>
                  {msg.role === Role.USER ? (
                    <div className="flex justify-end">
                      <div className="bg-[--bubble-user] text-white px-4 py-3 rounded-2xl rounded-br-sm max-w-[80%]">
                        <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {msg.attachments.map((a, i) => (
                              <span key={i} className="text-xs bg-white/10 px-2 py-1 rounded">📎 {a.name}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <div className="w-9 h-9 bg-[--accent-primary] rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                        W
                      </div>
                      <div className="flex-1 min-w-0 max-w-[80%]">
                        <div>
                          <MarkdownRenderer content={msg.text} onFeatureClick={onFeatureClick} />
                        </div>
                        {!msg.isStreaming && (
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => copyText(msg.text, msg.id)}
                              className="flex items-center gap-1 px-2 py-1 text-xs text-[--text-muted] hover:text-[--text-primary] hover:bg-[--bg-hover] rounded transition-colors"
                            >
                              {copiedId === msg.id ? <><Check size={12} /> Disalin</> : <><Copy size={12} /> Salin</>}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-9 h-9 bg-[--accent-primary] rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    W
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-[--accent-primary] rounded-full animate-pulse" />
                      <div className="w-2 h-2 bg-[--accent-primary] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                      <div className="w-2 h-2 bg-[--accent-primary] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                    </div>
                    {onStopGeneration && (
                      <button onClick={onStopGeneration} className="flex items-center gap-1 text-xs text-[--text-muted] hover:text-red-500">
                        <StopCircle size={14} /> Berhenti
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4 bg-[--bg-secondary] border-t border-[--border-subtle]">
        <div className="max-w-[800px] mx-auto">
          {isDragOver && (
            <div className="mb-3 p-6 border-2 border-dashed border-[--accent-primary] bg-[--accent-subtle] rounded-xl text-center text-[--accent-primary] text-sm">
              Drop file di sini
            </div>
          )}

          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {attachments.map((a, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-[--bg-tertiary] rounded-lg text-sm text-[--text-secondary]">
                  <span className="truncate max-w-[150px]">📎 {a.name}</span>
                  <button onClick={() => setAttachments(p => p.filter((_, idx) => idx !== i))} className="text-[--text-muted] hover:text-[--text-primary]">×</button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 bg-[--bg-tertiary] border border-[--border-primary] rounded-3xl px-4 py-3 focus-within:border-[--accent-primary] transition-colors">
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder="Ketik pesan..."
              className="flex-1 bg-transparent text-[15px] text-[--text-primary] placeholder:text-[--text-muted] resize-none focus:outline-none max-h-[200px]"
              rows={1}
            />
            <div className="flex gap-1">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-9 h-9 flex items-center justify-center rounded-md text-[--text-muted] hover:text-[--text-primary] hover:bg-[--bg-hover] transition-colors"
                title="Lampirkan file"
              >
                <Paperclip size={20} />
              </button>
              <button
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.capture = 'environment';
                  input.onchange = (e) => handleFiles((e.target as HTMLInputElement).files);
                  input.click();
                }}
                className="w-9 h-9 flex items-center justify-center rounded-md text-[--text-muted] hover:text-[--text-primary] hover:bg-[--bg-hover] transition-colors"
                title="Ambil foto"
              >
                <Camera size={20} />
              </button>
              <button
                onClick={isRecording ? stopVoice : startVoice}
                className={`w-9 h-9 flex items-center justify-center rounded-md transition-colors ${isRecording ? 'text-red-500 bg-red-500/20' : 'text-[--text-muted] hover:text-[--text-primary] hover:bg-[--bg-hover]'
                  }`}
                title="Input suara"
              >
                <Mic size={20} className={isRecording ? 'animate-pulse' : ''} />
              </button>
              <button
                onClick={handleSend}
                disabled={!inputText.trim() && attachments.length === 0}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${inputText.trim() || attachments.length > 0
                    ? 'bg-[--accent-primary] text-white hover:bg-[--accent-hover]'
                    : 'bg-[--accent-primary] text-white opacity-50 cursor-not-allowed'
                  }`}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <input type="file" ref={fileInputRef} className="hidden" multiple accept=".pdf,.png,.jpg,.jpeg,.webp" onChange={(e) => handleFiles(e.target.files)} />
    </div>
  );
};