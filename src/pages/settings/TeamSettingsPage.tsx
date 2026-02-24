import { useState, useEffect } from 'react';
import { Users, Plus, Shield, Pencil, Trash2, Search, UserCheck, UserX } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface AgentRow {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  max_concurrent_chats: number;
  open_conversations_count: number;
  created_at: string;
}

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  supervisor: 'Supervisor',
  agent: 'Atendente',
  viewer: 'Visualizador',
};

const roleBadgeColors: Record<string, string> = {
  admin: 'bg-destructive/10 text-destructive',
  supervisor: 'bg-purple-100 text-purple-700',
  agent: 'bg-primary/10 text-primary',
  viewer: 'bg-muted text-muted-foreground',
};

const statusLabels: Record<string, string> = {
  online: 'Online',
  away: 'Ausente',
  offline: 'Offline',
};

const statusDot: Record<string, string> = {
  online: 'bg-status-online',
  away: 'bg-status-away',
  offline: 'bg-status-offline',
};

const TeamSettingsPage = () => {
  const { agent: currentAgent } = useAuth();
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<AgentRow | null>(null);

  // New agent form
  const [newAgent, setNewAgent] = useState({
    name: '',
    email: '',
    role: 'agent',
    max_concurrent_chats: 5,
  });

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setAgents(data || []);
    } catch (err) {
      console.error('Error loading agents:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAgents = agents.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleUpdateRole = async (agentId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('agents')
        .update({ role: newRole })
        .eq('id', agentId);

      if (error) throw error;
      setAgents(prev => prev.map(a => a.id === agentId ? { ...a, role: newRole } : a));
    } catch (err) {
      console.error('Error updating role:', err);
    }
  };

  const handleUpdateMaxChats = async (agentId: string, max: number) => {
    try {
      const { error } = await supabase
        .from('agents')
        .update({ max_concurrent_chats: max })
        .eq('id', agentId);

      if (error) throw error;
      setAgents(prev => prev.map(a => a.id === agentId ? { ...a, max_concurrent_chats: max } : a));
    } catch (err) {
      console.error('Error updating max chats:', err);
    }
  };

  return (
    <div className="p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Gestão de Equipe
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie os atendentes, permissões e capacidade da sua equipe.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Total de agentes</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{agents.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <UserCheck className="h-4 w-4 text-lead-won" />
            <span className="text-xs text-muted-foreground">Online agora</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {agents.filter(a => a.status === 'online').length}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <UserX className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Offline</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {agents.filter(a => a.status === 'offline').length}
          </p>
        </div>
      </div>

      {/* Search + Add */}
      <div className="flex items-center justify-between mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar agente..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm text-foreground w-64 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Adicionar agente
        </button>
      </div>

      {/* Agents Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Agente</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Função</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Conversas</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Máx.</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  <div className="mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  Carregando equipe...
                </td>
              </tr>
            ) : filteredAgents.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Nenhum agente encontrado.
                </td>
              </tr>
            ) : (
              filteredAgents.map(agent => (
                <tr key={agent.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {agent.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card ${statusDot[agent.status] || 'bg-gray-400'}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {agent.name}
                          {agent.id === currentAgent?.id && (
                            <span className="ml-1.5 text-[10px] text-muted-foreground">(você)</span>
                          )}
                        </p>
                        <p className="text-[11px] text-muted-foreground">{agent.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={agent.role}
                      onChange={e => handleUpdateRole(agent.id, e.target.value)}
                      disabled={agent.id === currentAgent?.id}
                      className={`rounded-md px-2 py-1 text-xs font-medium border-0 cursor-pointer ${roleBadgeColors[agent.role] || 'bg-muted text-foreground'} ${agent.id === currentAgent?.id ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      <option value="admin">Administrador</option>
                      <option value="supervisor">Supervisor</option>
                      <option value="agent">Atendente</option>
                      <option value="viewer">Visualizador</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      agent.status === 'online' ? 'bg-green-50 text-green-700' :
                      agent.status === 'away' ? 'bg-yellow-50 text-yellow-700' :
                      'bg-gray-50 text-gray-500'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${statusDot[agent.status]}`} />
                      {statusLabels[agent.status] || agent.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm font-medium text-foreground">{agent.open_conversations_count || 0}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="number"
                      value={agent.max_concurrent_chats}
                      onChange={e => handleUpdateMaxChats(agent.id, parseInt(e.target.value))}
                      min={1}
                      max={20}
                      className="w-14 rounded-md border border-border bg-background px-2 py-1 text-center text-sm text-foreground focus:border-primary focus:outline-none"
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        title="Editar"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      {agent.id !== currentAgent?.id && (
                        <button
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                          title="Remover"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Roles & Permissions Info */}
      <section className="mt-6 rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          Níveis de Acesso
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { role: 'admin', desc: 'Acesso total. Pode gerenciar equipe, configurações, integrações e ver todos os dados.' },
            { role: 'supervisor', desc: 'Pode ver todas as conversas, relatórios e gerenciar atendentes da equipe.' },
            { role: 'agent', desc: 'Atende conversas atribuídas, usa respostas rápidas e vê contatos.' },
            { role: 'viewer', desc: 'Apenas visualiza conversas e relatórios. Não pode responder nem editar.' },
          ].map(item => (
            <div key={item.role} className="rounded-lg border border-border p-3">
              <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium ${roleBadgeColors[item.role]}`}>
                {roleLabels[item.role]}
              </span>
              <p className="mt-2 text-[12px] text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default TeamSettingsPage;
