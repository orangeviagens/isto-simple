import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Settings,
  Users,
  Bot,
  Plug,
  Building2,
  MessageSquare,
  LayoutDashboard,
  LogOut,
  ChevronLeft,
} from 'lucide-react';

const settingsNav = [
  { label: 'Geral', path: '/settings', icon: Building2, end: true },
  { label: 'Equipe', path: '/settings/team', icon: Users },
  { label: 'IA & Chatbot', path: '/settings/ai', icon: Bot },
  { label: 'Integrações', path: '/settings/integrations', icon: Plug },
];

const SettingsLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { agent, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-border bg-card">
        {/* Header */}
        <div className="border-b border-border p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm">✈️</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground">Orange Messenger</h1>
              <p className="text-[11px] text-muted-foreground">Configurações</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Voltar ao Chat
          </button>
        </div>

        {/* Quick Nav */}
        <div className="border-b border-border px-3 py-2">
          <div className="flex gap-1">
            <button
              onClick={() => navigate('/')}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Chat
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Dashboard
            </button>
          </div>
        </div>

        {/* Settings Navigation */}
        <nav className="flex-1 overflow-y-auto p-3">
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Configurações
          </p>
          <div className="space-y-0.5">
            {settingsNav.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Footer - Agent Info */}
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {agent?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '??'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{agent?.name || 'Agente'}</p>
              <p className="text-[11px] text-muted-foreground truncate">{agent?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default SettingsLayout;
