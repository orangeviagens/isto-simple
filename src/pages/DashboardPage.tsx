import { BarChart3, Clock, MessageSquare, SmilePlus, Users, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { agents, conversations } from '@/data/mockData';

const stats = [
  { label: 'Conversas abertas', value: '24', icon: MessageSquare, change: '+3 hoje' },
  { label: 'Tempo médio resposta', value: '3min', icon: Clock, change: '-12%' },
  { label: 'Encerradas hoje', value: '18', icon: BarChart3, change: '+5' },
  { label: 'Satisfação', value: '4.8/5', icon: SmilePlus, change: '+0.2' },
];

const DashboardPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border bg-card px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm">✈️</span>
            </div>
            <h1 className="text-base font-bold text-foreground">Orange Viagens</h1>
          </div>
          <nav className="flex gap-1">
            {[
              { label: 'Chat', path: '/' },
              { label: 'Dashboard', path: '/dashboard' },
              { label: 'Equipe', path: '/team' },
              { label: 'Configurações', path: '/settings' },
            ].map(item => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  item.path === '/dashboard' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-6">
        {/* Stats */}
        <div className="mb-6 grid grid-cols-4 gap-4">
          {stats.map(stat => (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{stat.label}</span>
                <stat.icon className="h-4 w-4 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <span className="text-[11px] text-lead-won">{stat.change}</span>
            </div>
          ))}
        </div>

        {/* Team performance */}
        <div className="mb-6 rounded-xl border border-border bg-card p-4 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-foreground flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" /> Conversas por atendente
          </h3>
          <div className="space-y-3">
            {agents.filter(a => a.status !== 'offline').map(agent => (
              <div key={agent.id} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {agent.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-foreground">{agent.name}</span>
                    <span className="text-xs text-muted-foreground">{agent.activeConversations} conversas</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${(agent.activeConversations / 8) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Urgent conversations */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-destructive" /> Aguardando resposta (urgentes)
          </h3>
          <div className="space-y-2">
            {conversations.filter(c => c.unreadCount > 0).slice(0, 5).map(conv => (
              <button
                key={conv.id}
                onClick={() => navigate('/')}
                className="flex w-full items-center justify-between rounded-lg p-3 text-left hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                    {conv.contact.name.split(' ').slice(0, 2).map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{conv.contact.name}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-xs">{conv.lastMessage}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-destructive-foreground">
                    {conv.unreadCount}
                  </span>
                  <span className="text-[11px] text-muted-foreground">{conv.lastMessageTime}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
