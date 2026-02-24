import { useState, useEffect } from 'react';
import { ConversationSidebar } from '@/components/chat/ConversationSidebar';
import { ChatArea } from '@/components/chat/ChatArea';
import { ContactPanel } from '@/components/chat/ContactPanel';
import { useAuth } from '@/contexts/AuthContext';
import { useConversations } from '@/hooks/useConversations';
import { useMessages } from '@/hooks/useMessages';
import { Conversation } from '@/types';

const ChatPage = () => {
  const { agent } = useAuth();
  const { conversations, loading } = useConversations();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showContactPanel, setShowContactPanel] = useState(true);
  const [filter, setFilter] = useState<'all' | 'mine' | 'unassigned' | 'bot'>('all');

  // Load messages for selected conversation
  const { messages } = useMessages(selectedConversation?.id ?? null);

  // Auto-select first conversation when loaded
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0]);
    }
  }, [conversations, selectedConversation]);

  // Update selected conversation with real messages
  const enrichedConversation = selectedConversation
    ? { ...selectedConversation, messages }
    : null;

  const filteredConversations = conversations.filter((conv) => {
    if (filter === 'mine') return conv.assignedAgentId === agent?.id;
    if (filter === 'unassigned') return !conv.assignedAgentId;
    if (filter === 'bot') return conv.messages.some((m) => m.sender === 'bot');
    return true;
  });

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Carregando conversas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <ConversationSidebar
        conversations={filteredConversations}
        selectedId={selectedConversation?.id || null}
        onSelect={(conv) => setSelectedConversation(conv)}
        filter={filter}
        onFilterChange={setFilter}
        allCount={conversations.length}
        mineCount={conversations.filter(c => c.assignedAgentId === agent?.id).length}
        unassignedCount={conversations.filter(c => !c.assignedAgentId).length}
        botCount={conversations.filter(c => c.messages.some(m => m.sender === 'bot')).length}
      />

      {enrichedConversation ? (
        <ChatArea
          conversation={enrichedConversation}
          onToggleContactPanel={() => setShowContactPanel(!showContactPanel)}
        />
      ) : (
        <div className="flex flex-1 items-center justify-center bg-muted/30">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <span className="text-2xl">🍊</span>
            </div>
            <h2 className="text-lg font-semibold text-foreground">Orange Viagens</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {conversations.length === 0
                ? 'Nenhuma conversa ainda'
                : 'Selecione uma conversa para começar'}
            </p>
          </div>
        </div>
      )}

      {enrichedConversation && showContactPanel && (
        <ContactPanel
          contact={enrichedConversation.contact}
          onClose={() => setShowContactPanel(false)}
        />
      )}
    </div>
  );
};

export default ChatPage;
