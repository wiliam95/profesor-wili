import React, { useRef, useEffect, useState } from 'react';
import {
  Send, Paperclip, Mic, Copy, Check, ChevronDown, StopCircle, Share, Trash2, Edit, MoreHorizontal
} from 'lucide-react';
import { Message, Role, Attachment, ModelType } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { AI_MODELS } from '../constants';

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
  onToggleArtifacts?: () => void;
  onOpenSettings?: () => void;
  onOpenNotifications?: () => void;
  onOpenProfile?: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  isLoading,
  activeModel,
  onSendMessage,
  onModelChange,
  onFeatureClick,
  onStopGeneration,
  onToggleArtifacts,
  onOpenSettings,
  onOpenNotifications,
  onOpenProfile
}) => {
  const [inputText, setInputText] = useState('');
  const [showModelSelector, setShowModelSelector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const textBeforeRef = useRef<string>('');
  const [copiedId, setCopiedId] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Get model name
  const getModelName = () => {
    const models = [
      { id: 'sonnet-4.5', name: 'Claude Sonnet 4.5' },
      { id: 'opus-4.1', name: 'Claude Opus 4.1' },
      { id: 'haiku-4.5', name: 'Claude Haiku 4.5' },
    ];
    for (const group of AI_MODELS) {
      const found = group.models.find(m => m.id === activeModel);
      if (found) return found.name;
    }
    return "Claude Sonnet 4.5";
  };

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
      alert("Browser Anda tidak mendukung input suara. Silakan gunakan Chrome, Edge, atau Safari.");
      return;
    }
    const recognition = new SR();
    recognition.lang = 'id-ID';
    recognition.interimResults = true;
    recognition.continuous = true; // Enable continuous dictation

    setIsRecording(true);
    recognitionRef.current = recognition;

    // Store current text to avoid duplication/overwriting issues
    textBeforeRef.current = inputText + (inputText && !inputText.endsWith(' ') ? ' ' : '');


    recognition.onresult = (e: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = e.resultIndex; i < e.results.length; ++i) {
        if (e.results[i].isFinal) {
          finalTranscript += e.results[i][0].transcript;
        } else {
          interimTranscript += e.results[i][0].transcript;
        }
      }

      // Android Fix V2: Strict Dedup
      const cleanFinal = finalTranscript.trim();
      const currentFull = textBeforeRef.current.trim();

      if (cleanFinal && !currentFull.endsWith(cleanFinal)) {
        // Double check overlap to avoid "Hello Hello world" -> "Hello world"
        // If the new phrase is NOT just a repetition of the last few words
        textBeforeRef.current += (textBeforeRef.current ? ' ' : '') + cleanFinal;
      }

      const display = textBeforeRef.current + (interimTranscript ? ' ' + interimTranscript : '');
      setInputText(display);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      // Optional: Auto-restart if we wanted truly continuous, but for now let's stop to be safe
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
    <div className="chat-area flex flex-col h-full bg-[--bg-secondary]">

      {/* Chat Header - 56px */}
      <div className="chat-header h-14 px-6 flex items-center justify-between border-b border-[--border-subtle] bg-[--bg-primary]">
        <div className="flex items-center gap-4">
          <h1 className="chat-title text-lg font-semibold text-[--text-primary] flex items-center gap-2">
            {messages.length > 0
              ? messages.find(m => m.role === Role.USER)?.text.slice(0, 40) || 'New Chat'
              : 'New Chat'}
            <Edit size={16} className="text-[--text-muted] cursor-pointer hover:text-[--text-primary]" />
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="model-display flex items-center gap-2 px-3 py-2 bg-[--bg-tertiary] border border-[--border-primary] rounded-md text-sm text-[--text-secondary]">
            🤖 AI (Free Unlimited - 100% Private)
          </div>
          <div className="header-actions flex gap-2">
            <button className="header-btn w-9 h-9 flex items-center justify-center rounded-md hover:bg-[--bg-hover] text-[--text-muted] transition-colors">
              <Share size={20} />
            </button>
            <button className="header-btn w-9 h-9 flex items-center justify-center rounded-md hover:bg-[--bg-hover] text-[--text-muted] transition-colors">
              <Trash2 size={20} />
            </button>
            {/* Redundant settings removed - access via Sidebar */}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        className="messages-container flex-1 overflow-y-auto px-6 py-6"
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        <div className="messages-wrapper max-w-[800px] mx-auto">

          {/* Empty State */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full pb-24">
              <div className="w-16 h-16 bg-[--accent-primary] rounded-full flex items-center justify-center text-white text-2xl font-semibold mb-6">
                W
              </div>
              <h2 className="text-xl font-semibold text-[--text-primary] mb-2">
                Apa yang bisa saya bantu hari ini?
              </h2>
              <p className="text-[--text-muted] text-sm mb-8">
                Tanyakan apa saja kepada saya
              </p>
            </div>
          )}

          {/* Messages */}
          {messages.length > 0 && (
            <div className="space-y-6">
              {messages.map((msg) => (
                <div key={msg.id} className={`message ${msg.role === Role.USER ? 'message-user' : 'message-ai'}`}>
                  {msg.role === Role.USER ? (
                    /* User Message - Right aligned, dark bubble */
                    <div className="flex justify-end">
                      <div className="message-bubble bg-[--bubble-user] text-[--text-primary] px-4 py-3 rounded-2xl rounded-br-sm max-w-[80%]">
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
                    /* AI Message - Left aligned, transparent bg, with avatar */
                    <div className="flex gap-3">
                      <div className="message-avatar w-9 h-9 bg-[--accent-primary] rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                        W
                      </div>
                      <div className="message-content flex-1 min-w-0 max-w-[80%]">
                        <div className="message-bubble">
                          <MarkdownRenderer content={msg.text} onFeatureClick={onFeatureClick} />
                        </div>
                        {!msg.isStreaming && (
                          <div className="message-actions flex gap-2 mt-2">
                            <button
                              onClick={() => copyText(msg.text, msg.id)}
                              className="action-btn flex items-center gap-1 px-2 py-1 text-xs text-[--text-muted] hover:text-[--text-primary] hover:bg-[--bg-hover] rounded transition-colors"
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

              {/* Loading */}
              {isLoading && (
                <div className="message message-ai flex gap-3">
                  <div className="message-avatar w-9 h-9 bg-[--accent-primary] rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    W
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="typing-indicator flex gap-1">
                      <div className="typing-dot w-2 h-2 bg-[--accent-primary] rounded-full" />
                      <div className="typing-dot w-2 h-2 bg-[--accent-primary] rounded-full" />
                      <div className="typing-dot w-2 h-2 bg-[--accent-primary] rounded-full" />
                    </div>
                    {onStopGeneration && (
                      <button onClick={onStopGeneration} className="flex items-center gap-1 text-xs text-[--text-muted] hover:text-[--error]">
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

      {/* Input Area - Fixed bottom */}
      <div className="chat-input-area p-4 bg-[--bg-secondary] border-t border-[--border-subtle]">
        <div className="chat-input-wrapper max-w-[800px] mx-auto">

          {/* Drag Drop Zone */}
          {isDragOver && (
            <div className="mb-3 p-6 border-2 border-dashed border-[--accent-primary] bg-[--accent-subtle] rounded-xl text-center text-[--accent-primary] text-sm">
              Drop file di sini (PDF, gambar, maks 10MB)
            </div>
          )}

          {/* Attachments */}
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

          {/* Input Box - Rounded 24px */}
          <div className="chat-input-box flex items-center gap-3 bg-[--bg-tertiary] border border-[--border-primary] rounded-3xl px-4 py-3 focus-within:border-[--accent-primary] transition-colors">
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder="Ketik pesan..."
              className="chat-textarea flex-1 bg-transparent text-[15px] text-[--text-primary] placeholder:text-[--text-muted] resize-none focus:outline-none max-h-[200px]"
              rows={1}
              aria-label="Kirim pesan"
            />
            <div className="input-actions flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="input-btn w-9 h-9 flex items-center justify-center rounded-md text-[--text-muted] hover:text-[--text-primary] transition-colors"
                title="Lampirkan file"
              >
                <Paperclip size={20} />
              </button>
              <button
                onClick={isRecording ? stopVoice : startVoice}
                className={`input-btn w-9 h-9 flex items-center justify-center rounded-md transition-colors ${isRecording ? 'recording text-[--error]' : 'text-[--text-muted] hover:text-[--text-primary]'
                  }`}
                title="Input suara"
              >
                <div className={`scan-line ${isRecording ? 'active' : ''}`}></div>
                <Mic size={20} className={isRecording ? 'animate-pulse text-red-500' : ''} />
              </button>
              <button
                onClick={handleSend}
                disabled={!inputText.trim() && attachments.length === 0}
                className={`send-btn w-10 h-10 flex items-center justify-center rounded-full transition-all ${inputText.trim() || attachments.length > 0
                  ? 'active bg-[--accent-primary] text-white hover:bg-[--accent-hover]'
                  : 'bg-[--accent-primary] text-white opacity-50 cursor-not-allowed'
                  }`}
                aria-label="Kirim pesan"
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
