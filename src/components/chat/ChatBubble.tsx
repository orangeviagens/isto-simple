import { Check, CheckCheck, Bot, FileText } from 'lucide-react';
import { Message } from '@/types';

interface Props {
  message: Message;
}

export function ChatBubble({ message }: Props) {
  const { sender, content, timestamp, status, type, senderName, fileName } = message;
  const time = new Date(timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  if (sender === 'system') {
    return (
      <div className="my-3 flex justify-center">
        <span className="rounded-lg bg-chat-system px-3 py-1.5 text-[11px] text-muted-foreground italic">
          {content}
        </span>
      </div>
    );
  }

  const isOutgoing = sender === 'agent';
  const isBot = sender === 'bot';

  const bubbleColor = isOutgoing
    ? 'bg-chat-outgoing'
    : isBot
    ? 'bg-chat-bot'
    : 'bg-chat-incoming';

  const bubbleRadius = isOutgoing
    ? 'rounded-chat rounded-br-sm'
    : 'rounded-chat rounded-bl-sm';

  return (
    <div className={`mb-2 flex ${isOutgoing ? 'justify-end' : 'justify-start'} animate-slide-in`}>
      <div className={`max-w-[65%] ${bubbleColor} ${bubbleRadius} px-3 py-2 shadow-sm`}>
        {/* Sender name for bot */}
        {isBot && (
          <div className="mb-1 flex items-center gap-1 text-[10px] font-semibold text-lead-new">
            <Bot className="h-3 w-3" />
            {senderName}
          </div>
        )}
        {isOutgoing && senderName && (
          <div className="mb-1 text-[10px] font-semibold text-primary">
            {senderName}
          </div>
        )}

        {/* Content */}
        {type === 'document' ? (
          <div className="flex items-center gap-2 rounded-md bg-background/50 p-2">
            <FileText className="h-8 w-8 text-destructive" />
            <div>
              <p className="text-xs font-medium text-foreground">{fileName}</p>
              <p className="text-[10px] text-muted-foreground">PDF • Clique para abrir</p>
            </div>
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{content}</p>
        )}

        {/* Footer */}
        <div className={`mt-1 flex items-center gap-1 ${isOutgoing ? 'justify-end' : 'justify-end'}`}>
          <span className="text-[10px] text-muted-foreground">{time}</span>
          {isOutgoing && status && (
            <span className="text-muted-foreground">
              {status === 'sent' && <Check className="h-3 w-3" />}
              {status === 'delivered' && <CheckCheck className="h-3 w-3" />}
              {status === 'read' && <CheckCheck className="h-3 w-3 text-lead-new" />}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
