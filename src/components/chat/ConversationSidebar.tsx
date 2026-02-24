import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MessageSquare, User, Users, Bot, Settings, ChevronDown } from 'lucide-react';
import { Conversation, AgentStatus } from '@/types';
import { currentAgent } from '@/data/mockData';
import { ConversationItem } from './ConversationItem';

interface Props {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (conv: Conversation) => void;
  filter: 'all' | 'mine' | 'unassigned' | 'bot';
  onFilterChange: (f: 'all' | 'mine' | 'unassigned' | 'bot') => void;
  allCount: number;
  mineCount: number;
  unassignedCount: number;
  botCount: number;
}

const statusColors: Record<AgentStatus, string> = {
  online: 'bg-status-online',
  away: 'bg-status-away',
  offline: 'bg-status-offline',
};

export function ConversationSidebar({ conversations, selectedId, onSelect, filter, onFilterChange, allCount, mineCount, unassignedCount, botCount }: Props) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [agentStatus, setAgentStatus] = useState<AgentStatus>(currentAgent.status);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const filtered = conversations.filter(
    (c) =>
      c.contact.name.toLowerCase().includes(search.toLowerCase()) ||
      c.contact.phone.includes(search) ||
      c.lastMessage.toLowerCase().includes(search.toLowerCase())
  );

  const filters = [
    { key: 'all' as const, label: 'Todas', icon: MessageSquare, count: allCount },
    { key: 'mine' as const, label: 'Minhas', icon: User, count: mineCount },
    { key: 'unassigned' as const, label: 'Não atribuídas', icon: Users, count: unassignedCount },
    { key: 'bot' as const, label: 'Bot', icon: Bot, count: botCount },
  ];

  return (
    <div className="flex h-full w-[320px] min-w-[280px] flex-col border-r border-border bg-card">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg">✈️</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground">Orange Viagens</h1>
            <p className="text-[10px] text-muted-foreground">Mensageiro WhatsApp</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar conversas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-muted/50 py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Filters */}
        <div className="mt-3 flex gap-1">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => onFilterChange(f.key)}
              className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                filter === f.key
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <f.icon className="h-3 w-3" />
              <span>{f.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {filtered.map((conv) => (
          <ConversationItem
            key={conv.id}
            conversation={conv}
            isSelected={conv.id === selectedId}
            onClick={() => onSelect(conv)}
          />
        ))}
        {filtered.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Nenhuma conversa encontrada
          </div>
        )}
      </div>

      {/* Agent footer */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {currentAgent.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card ${statusColors[agentStatus]}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{currentAgent.name}</p>
            <div className="relative">
              <button
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
              >
                {agentStatus === 'online' ? 'Online' : agentStatus === 'away' ? 'Ausente' : 'Offline'}
                <ChevronDown className="h-3 w-3" />
              </button>
              {showStatusDropdown && (
                <div className="absolute bottom-full left-0 mb-1 rounded-lg border border-border bg-card p-1 shadow-lg">
                  {(['online', 'away', 'offline'] as AgentStatus[]).map(s => (
                    <button
                      key={s}
                      onClick={() => { setAgentStatus(s); setShowStatusDropdown(false); }}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-xs hover:bg-muted"
                    >
                      <div className={`h-2 w-2 rounded-full ${statusColors[s]}`} />
                      {s === 'online' ? 'Online' : s === 'away' ? 'Ausente' : 'Offline'}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <button onClick={() => navigate('/settings')} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground" title="Configurações">
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
