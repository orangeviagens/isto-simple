import { useState } from 'react';
import { Building2, Clock, MessageSquare, Globe, Save, Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const GeneralSettingsPage = () => {
  const { agent } = useAuth();
  const [saved, setSaved] = useState(false);

  const [config, setConfig] = useState({
    companyName: 'Orange Viagens',
    whatsappNumber: '+55 11 99999-9999',
    timezone: 'America/Sao_Paulo',
    language: 'pt-BR',
    businessHoursEnabled: true,
    businessHoursStart: '08:00',
    businessHoursEnd: '18:00',
    businessDays: ['seg', 'ter', 'qua', 'qui', 'sex'],
    welcomeMessage: 'Olá! 👋 Bem-vindo à Orange Viagens! Como posso ajudar você hoje?',
    awayMessage: 'Obrigado por entrar em contato! Nosso horário de atendimento é de segunda a sexta, das 8h às 18h. Responderemos assim que possível!',
    closingMessage: 'Obrigado pelo contato! Se precisar de mais ajuda, estamos à disposição. Boa viagem! ✈️',
    autoAssignEnabled: true,
    autoAssignStrategy: 'round-robin',
    maxConversationsPerAgent: 5,
    inactivityTimeout: 30,
    notifyNewConversation: true,
    notifyUnreadAfter: 5,
    soundEnabled: true,
  });

  const handleSave = () => {
    // TODO: Save to Supabase
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const updateConfig = (key: string, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const toggleDay = (day: string) => {
    setConfig(prev => ({
      ...prev,
      businessDays: prev.businessDays.includes(day)
        ? prev.businessDays.filter(d => d !== day)
        : [...prev.businessDays, day],
    }));
  };

  const allDays = [
    { key: 'seg', label: 'Seg' },
    { key: 'ter', label: 'Ter' },
    { key: 'qua', label: 'Qua' },
    { key: 'qui', label: 'Qui' },
    { key: 'sex', label: 'Sex' },
    { key: 'sab', label: 'Sáb' },
    { key: 'dom', label: 'Dom' },
  ];

  return (
    <div className="p-6 max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          Configurações Gerais
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure as informações básicas da sua empresa e comportamento do sistema.
        </p>
      </div>

      <div className="space-y-6">
        {/* Company Info */}
        <section className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            Informações da Empresa
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Nome da empresa</label>
              <input
                type="text"
                value={config.companyName}
                onChange={e => updateConfig('companyName', e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Número WhatsApp</label>
                <input
                  type="text"
                  value={config.whatsappNumber}
                  onChange={e => updateConfig('whatsappNumber', e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Fuso horário</label>
                <select
                  value={config.timezone}
                  onChange={e => updateConfig('timezone', e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
                  <option value="America/Manaus">Manaus (GMT-4)</option>
                  <option value="America/Belem">Belém (GMT-3)</option>
                  <option value="America/Fortaleza">Fernando de Noronha (GMT-2)</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Business Hours */}
        <section className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Horário de Atendimento
            </h3>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={config.businessHoursEnabled}
                onChange={e => updateConfig('businessHoursEnabled', e.target.checked)}
                className="peer sr-only"
              />
              <div className="h-5 w-9 rounded-full bg-muted peer-checked:bg-primary after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full" />
            </label>
          </div>

          {config.businessHoursEnabled && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Início</label>
                  <input
                    type="time"
                    value={config.businessHoursStart}
                    onChange={e => updateConfig('businessHoursStart', e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Fim</label>
                  <input
                    type="time"
                    value={config.businessHoursEnd}
                    onChange={e => updateConfig('businessHoursEnd', e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-2">Dias de atendimento</label>
                <div className="flex gap-2">
                  {allDays.map(day => (
                    <button
                      key={day.key}
                      onClick={() => toggleDay(day.key)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                        config.businessDays.includes(day.key)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Auto Messages */}
        <section className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            Mensagens Automáticas
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Mensagem de boas-vindas</label>
              <textarea
                value={config.welcomeMessage}
                onChange={e => updateConfig('welcomeMessage', e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">Enviada quando um novo contato inicia conversa.</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Mensagem fora do horário</label>
              <textarea
                value={config.awayMessage}
                onChange={e => updateConfig('awayMessage', e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">Enviada automaticamente fora do horário de atendimento.</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Mensagem de encerramento</label>
              <textarea
                value={config.closingMessage}
                onChange={e => updateConfig('closingMessage', e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">Enviada quando o atendente encerra a conversa.</p>
            </div>
          </div>
        </section>

        {/* Distribution & Notifications */}
        <section className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            Distribuição & Notificações
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Distribuição automática</p>
                <p className="text-[11px] text-muted-foreground">Atribuir conversas automaticamente aos agentes</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={config.autoAssignEnabled}
                  onChange={e => updateConfig('autoAssignEnabled', e.target.checked)}
                  className="peer sr-only"
                />
                <div className="h-5 w-9 rounded-full bg-muted peer-checked:bg-primary after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full" />
              </label>
            </div>

            {config.autoAssignEnabled && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Estratégia</label>
                  <select
                    value={config.autoAssignStrategy}
                    onChange={e => updateConfig('autoAssignStrategy', e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="round-robin">Round Robin (rodízio)</option>
                    <option value="least-busy">Menos ocupado</option>
                    <option value="random">Aleatório</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Máx. conversas por agente</label>
                  <input
                    type="number"
                    value={config.maxConversationsPerAgent}
                    onChange={e => updateConfig('maxConversationsPerAgent', parseInt(e.target.value))}
                    min={1}
                    max={20}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            )}

            <div className="border-t border-border pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Notificar novas conversas</p>
                  <p className="text-[11px] text-muted-foreground">Som e notificação ao receber nova conversa</p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={config.notifyNewConversation}
                    onChange={e => updateConfig('notifyNewConversation', e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="h-5 w-9 rounded-full bg-muted peer-checked:bg-primary after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full" />
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Sons de notificação</p>
                  <p className="text-[11px] text-muted-foreground">Reproduzir som ao receber mensagens</p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={config.soundEnabled}
                    onChange={e => updateConfig('soundEnabled', e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="h-5 w-9 rounded-full bg-muted peer-checked:bg-primary after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full" />
                </label>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  Alertar sem resposta após (minutos)
                </label>
                <input
                  type="number"
                  value={config.inactivityTimeout}
                  onChange={e => updateConfig('inactivityTimeout', parseInt(e.target.value))}
                  min={1}
                  max={120}
                  className="w-32 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Save Button */}
        <div className="flex items-center gap-3 pt-2 pb-8">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Save className="h-4 w-4" />
            Salvar configurações
          </button>
          {saved && (
            <span className="text-sm text-lead-won font-medium animate-in fade-in">
              ✓ Configurações salvas!
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default GeneralSettingsPage;
