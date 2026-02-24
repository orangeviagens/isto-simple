import { MessageSquare } from 'lucide-react';
import { Conversation, LEAD_STATUS_LABELS, LeadStatus } from '@/types';

interface Props {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}

const leadColors: Record<LeadStatus, string> = {
  new: 'bg-lead-new/15 text-lead-new',
  attending: 'bg-lead-attending/15 text-lead-attending',
  proposal: 'bg-lead-proposal/15 text-lead-proposal',
  negotiation: 'bg-lead-negotiation/15 text-lead-negotiation',
  won: 'bg-lead-won/15 text-lead-won',
  lost: 'bg-lead-lost/15 text-lead-lost',
};

export function ConversationItem({ conversation, isSelected, onClick }: Props) {
  const { contact, unreadCount, lastMessage, lastMessageTime, isTyping } = conversation;
  const initials = contact.name.split(' ').slice(0, 2).map(n => n[0]).join('');

  return (
    <button
      onClick={onClick}
      className={`flex w-full items-start gap-3 border-b border-border/50 p-3 text-left transition-colors ${
        isSelected
          ? 'bg-primary/5 border-l-2 border-l-primary'
          : unreadCount > 0
          ? 'bg-accent/50 hover:bg-accent'
          : 'hover:bg-muted/50'
      }`}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
          {initials}
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-whatsapp">
          <MessageSquare className="h-2.5 w-2.5 text-primary-foreground" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={`text-sm truncate ${unreadCount > 0 ? 'font-bold text-foreground' : 'font-medium text-foreground'}`}>
            {contact.name}
          </span>
          <span className={`text-[10px] flex-shrink-0 ${unreadCount > 0 ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>
            {lastMessageTime}
          </span>
        </div>

        <div className="mt-0.5 flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground truncate">
            {isTyping ? (
              <span className="flex items-center gap-1 text-primary italic">
                digitando
                <span className="flex gap-0.5">
                  <span className="typing-dot h-1 w-1 rounded-full bg-primary" />
                  <span className="typing-dot h-1 w-1 rounded-full bg-primary" />
                  <span className="typing-dot h-1 w-1 rounded-full bg-primary" />
                </span>
              </span>
            ) : lastMessage}
          </span>
          {unreadCount > 0 && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
              {unreadCount}
            </span>
          )}
        </div>

        <div className="mt-1">
          <span className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-medium ${leadColors[contact.leadStatus]}`}>
            {LEAD_STATUS_LABELS[contact.leadStatus]}
          </span>
        </div>
      </div>
    </button>
  );
}
