import { useState } from 'react';
import { ConversationSidebar } from '@/components/chat/ConversationSidebar';
import { ChatArea } from '@/components/chat/ChatArea';
import { ContactPanel } from '@/components/chat/ContactPanel';
import { conversations as mockConversations, currentAgent } from '@/data/mockData';
import { Conversation } from '@/types';

const ChatPage = () => {
  const [conversations] = useState<Conversation[]>(mockConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(mockConversations[0]);
  const [showContactPanel, setShowContactPanel] = useState(true);
  const [filter, setFilter] = useState<'all' | 'mine' | 'unassigned' | 'bot'>('all');

  const filteredConversations = conversations.filter((conv) => {
    if (filter === 'mine') return conv.assignedAgentId === currentAgent.id;
    if (filter === 'unassigned') return !conv.assignedAgentId;
    if (filter === 'bot') return conv.messages.some((m) => m.sender === 'bot');
    return true;
  });

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <ConversationSidebar
        conversations={filteredConversations}
        selectedId={selectedConversation?.id || null}
        onSelect={(conv) => setSelectedConversation(conv)}
        filter={filter}
        onFilterChange={setFilter}
        allCount={conversations.length}
        mineCount={conversations.filter(c => c.assignedAgentId === currentAgent.id).length}
        unassignedCount={conversations.filter(c => !c.assignedAgentId).length}
        botCount={conversations.filter(c => c.messages.some(m => m.sender === 'bot')).length}
      />
      
      {selectedConversation ? (
        <ChatArea
          conversation={selectedConversation}
          onToggleContactPanel={() => setShowContactPanel(!showContactPanel)}
        />
      ) : (
        <div className="flex flex-1 items-center justify-center bg-muted/30">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <span className="text-2xl">🍊</span>
            </div>
            <h2 className="text-lg font-semibold text-foreground">Orange Viagens</h2>
            <p className="mt-1 text-sm text-muted-foreground">Selecione uma conversa para começar</p>
          </div>
        </div>
      )}
      
      {selectedConversation && showContactPanel && (
        <ContactPanel
          contact={selectedConversation.contact}
          onClose={() => setShowContactPanel(false)}
        />
      )}
    </div>
  );
};

export default ChatPage;
