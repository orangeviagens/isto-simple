import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, Mic, Zap, StickyNote, ArrowDown, UserPlus, ArrowRightLeft, X, Bot } from 'lucide-react';
import { Conversation, Message, LEAD_STATUS_LABELS, LeadStatus } from '@/types';
import { agents, quickReplies } from '@/data/mockData';
import { ChatBubble } from './ChatBubble';

interface Props {
  conversation: Conversation;
  onToggleContactPanel: () => void;
  onSendMessage?: (content: string, contactPhone: string, senderName?: string) => Promise<any>;
  sending?: boolean;
}

const leadColors: Record<LeadStatus, string> = {
  new: 'bg-lead-new/15 text-lead-new',
  attending: 'bg-lead-attending/15 text-lead-attending',
  proposal: 'bg-lead-proposal/15 text-lead-proposal',
  negotiation: 'bg-lead-negotiation/15 text-lead-negotiation',
  won: 'bg-lead-won/15 text-lead-won',
  lost: 'bg-lead-lost/15 text-lead-lost',
};

export function ChatArea({ conversation, onToggleContactPanel, onSendMessage, sending }: Props) {
  const [message, setMessage] = useState('');
  const [isNoteMode, setIsNoteMode] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showAiSuggestion, setShowAiSuggestion] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation.messages]);

  const handleSend = async () => {
    if (!message.trim() || sending) return;
    const content = message.trim();
    setMessage('');
    setIsNoteMode(false);
    setShowAiSuggestion(false);
    setSendError(null);

    if (onSendMessage && !isNoteMode) {
      try {
        await onSendMessage(content, conversation.contact.phone);
      } catch (err) {
        setSendError(err instanceof Error ? err.message : 'Erro ao enviar');
        setMessage(content); // Restore message on error
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const assignedAgent = agents.find(a => a.id === conversation.assignedAgentId);

  // Group messages by date
  const groupedMessages: { date: string; messages: Message[] }[] = [];
  conversation.messages.forEach((msg) => {
    const date = new Date(msg.timestamp).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
    const today = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
    const label = date === today ? 'Hoje' : date === yesterday ? 'Ontem' : date;
    
    const existing = groupedMessages.find(g => g.date === label);
    if (existing) {
      existing.messages.push(msg);
    } else {
      groupedMessages.push({ date: label, messages: [msg] });
    }
  });

  return (
    <div className="flex flex-1 flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={onToggleContactPanel} className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground hover:opacity-80">
            {conversation.contact.name.split(' ').slice(0, 2).map(n => n[0]).join('')}
          </button>
          <div>
            <button onClick={onToggleContactPanel} className="text-sm font-semibold text-foreground hover:underline">
              {conversation.contact.name}
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{conversation.contact.phone}</span>
              <span className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-medium ${leadColors[conversation.contact.leadStatus]}`}>
                {LEAD_STATUS_LABELS[conversation.contact.leadStatus]}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {assignedAgent && (
            <span className="mr-2 text-[11px] text-muted-foreground">
              Atendido por: <strong>{assignedAgent.name}</strong>
            </span>
          )}
          <button className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground" title="Atribuir para mim">
            <UserPlus className="h-4 w-4" />
          </button>
          <button className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground" title="Transferir">
            <ArrowRightLeft className="h-4 w-4" />
          </button>
          <button className="rounded-lg px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10">
            Encerrar
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--border)) 1px, transparent 0)', backgroundSize: '24px 24px' }}>
        {groupedMessages.map((group) => (
          <div key={group.date}>
            <div className="my-4 flex items-center justify-center">
              <span className="rounded-lg bg-chat-system px-3 py-1 text-[11px] font-medium text-muted-foreground shadow-sm">
                {group.date}
              </span>
            </div>
            {group.messages.map((msg) => (
              <ChatBubble key={msg.id} message={msg} />
            ))}
          </div>
        ))}

        {conversation.isTyping && (
          <div className="mb-2 flex justify-start">
            <div className="rounded-chat rounded-bl-sm bg-chat-incoming px-4 py-3">
              <div className="flex items-center gap-1">
                <span className="typing-dot h-2 w-2 rounded-full bg-muted-foreground" />
                <span className="typing-dot h-2 w-2 rounded-full bg-muted-foreground" />
                <span className="typing-dot h-2 w-2 rounded-full bg-muted-foreground" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* AI Suggestion */}
      {showAiSuggestion && (
        <div className="mx-4 mb-2 animate-slide-in rounded-lg border border-primary/20 bg-primary/5 p-3">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-primary">
            <Bot className="h-3.5 w-3.5" />
            Sugestão IA
          </div>
          <p className="text-sm text-foreground">
            "Que ótimo saber do seu interesse! Para o destino mencionado, temos pacotes especiais neste mês. Posso enviar um orçamento personalizado?"
          </p>
          <div className="mt-2 flex gap-2">
            <button onClick={() => { setMessage('Que ótimo saber do seu interesse! Para o destino mencionado, temos pacotes especiais neste mês. Posso enviar um orçamento personalizado?'); setShowAiSuggestion(false); }} className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
              Usar
            </button>
            <button onClick={() => setShowAiSuggestion(false)} className="rounded-md bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              Descartar
            </button>
          </div>
        </div>
      )}

      {/* Quick Replies dropdown */}
      {showQuickReplies && (
        <div className="mx-4 mb-2 max-h-48 animate-slide-in overflow-y-auto rounded-lg border border-border bg-card p-2 shadow-lg scrollbar-thin">
          {quickReplies.map(qr => (
            <button
              key={qr.id}
              onClick={() => { setMessage(qr.content); setShowQuickReplies(false); }}
              className="flex w-full flex-col rounded-md p-2 text-left hover:bg-muted"
            >
              <span className="text-[10px] font-medium text-primary">{qr.category}</span>
              <span className="text-xs text-foreground">{qr.content}</span>
            </button>
          ))}
        </div>
      )}

      {/* Quick actions bar */}
      <div className="flex items-center gap-1 border-t border-border bg-card px-4 py-1.5">
        <button onClick={() => { setShowQuickReplies(!showQuickReplies); setShowAiSuggestion(false); }} className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
          <Zap className="h-3 w-3" /> Respostas rápidas
        </button>
        <button onClick={() => { setShowAiSuggestion(!showAiSuggestion); setShowQuickReplies(false); }} className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
          <Bot className="h-3 w-3" /> Sugestão IA
        </button>
        <button onClick={() => setIsNoteMode(!isNoteMode)} className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${isNoteMode ? 'bg-note text-note-author' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
          <StickyNote className="h-3 w-3" /> Nota interna
        </button>
      </div>

      {/* Input */}
      <div className={`flex items-end gap-2 border-t border-border p-3 ${isNoteMode ? 'bg-note' : 'bg-card'}`}>
        <button className="flex-shrink-0 rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
          <Smile className="h-5 w-5" />
        </button>
        <button className="flex-shrink-0 rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
          <Paperclip className="h-5 w-5" />
        </button>
        <div className="relative flex-1">
          {isNoteMode && (
            <div className="absolute -top-6 left-0 flex items-center gap-1 text-[10px] font-medium text-note-text">
              <StickyNote className="h-3 w-3" /> Nota interna — não será enviada ao cliente
            </div>
          )}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isNoteMode ? 'Escreva uma nota interna...' : 'Digite uma mensagem...'}
            rows={1}
            className={`w-full resize-none rounded-lg border py-2.5 pl-3 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 ${
              isNoteMode
                ? 'border-note-border bg-note focus:ring-note-border'
                : 'border-border bg-muted/30 focus:ring-primary/30'
            }`}
          />
        </div>
        <button className="flex-shrink-0 rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
          <Mic className="h-5 w-5" />
        </button>
        <button onClick={handleSend} disabled={sending || !message.trim()} className={`flex-shrink-0 rounded-lg p-2.5 text-primary-foreground shadow-sm transition-colors ${sending || !message.trim() ? 'bg-primary/50 cursor-not-allowed' : 'bg-primary hover:bg-primary/90'}`}>
          {sending ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Error banner */}
      {sendError && (
        <div className="flex items-center justify-between bg-destructive/10 px-4 py-2 text-xs text-destructive">
          <span>{sendError}</span>
          <button onClick={() => setSendError(null)} className="ml-2 font-medium hover:underline">Fechar</button>
        </div>
      )}
    </div>
  );
}
