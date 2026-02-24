import { useState } from 'react';
import { Bot, BookOpen, MessageCircle, Zap, Save, Brain, Sparkles, AlertTriangle } from 'lucide-react';

const AISettingsPage = () => {
  const [saved, setSaved] = useState(false);

  const [config, setConfig] = useState({
    aiEnabled: true,
    aiMode: 'copilot',
    model: 'claude-sonnet',
    temperature: 0.3,
    maxTokens: 500,
    // Playbook
    companyContext: `A Orange Viagens é uma agência de viagens premium especializada em roteiros personalizados. Atendemos clientes exigentes que buscam experiências únicas de viagem.

Nossos principais serviços:
- Pacotes nacionais e internacionais
- Viagens corporativas
- Lua de mel e viagens românticas
- Roteiros de aventura
- Cruzeiros

Trabalhamos com as melhores companhias aéreas e hotéis parceiros. Temos condições especiais de pagamento e parcelamento.`,
    toneOfVoice: 'Profissional, acolhedor e entusiasmado. Use emojis com moderação (✈️, 🌴, 😊). Sempre trate o cliente pelo nome. Demonstre conhecimento sobre os destinos.',
    restrictions: `- Nunca forneça preços sem verificar disponibilidade real
- Não faça promessas de disponibilidade
- Sempre confirme datas e número de passageiros
- Encaminhe para um atendente humano em caso de reclamações
- Não compartilhe informações de outros clientes`,
    // Quick replies
    quickReplies: [
      { id: '1', trigger: '/ola', response: 'Olá! 👋 Sou da Orange Viagens. Como posso ajudar você hoje?' },
      { id: '2', trigger: '/preco', response: 'Para consultar valores, preciso de algumas informações: destino, datas de ida e volta, e número de passageiros. Pode me passar?' },
      { id: '3', trigger: '/pagamento', response: 'Trabalhamos com: PIX (5% desconto), cartão em até 12x, e boleto bancário. Qual forma prefere?' },
      { id: '4', trigger: '/documentos', response: 'Para viagens internacionais você precisará de: passaporte válido (mín. 6 meses), visto (quando aplicável), e comprovante de vacinação.' },
    ],
    // Auto responses
    autoResponseEnabled: false,
    autoResponseDelay: 5,
    fallbackMessage: 'Desculpe, não entendi sua pergunta. Vou encaminhar para um atendente humano que poderá ajudá-lo melhor!',
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const updateConfig = (key: string, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const updateQuickReply = (id: string, field: 'trigger' | 'response', value: string) => {
    setConfig(prev => ({
      ...prev,
      quickReplies: prev.quickReplies.map(qr =>
        qr.id === id ? { ...qr, [field]: value } : qr
      ),
    }));
  };

  const addQuickReply = () => {
    setConfig(prev => ({
      ...prev,
      quickReplies: [...prev.quickReplies, { id: Date.now().toString(), trigger: '/', response: '' }],
    }));
  };

  const removeQuickReply = (id: string) => {
    setConfig(prev => ({
      ...prev,
      quickReplies: prev.quickReplies.filter(qr => qr.id !== id),
    }));
  };

  return (
    <div className="p-6 max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          IA & Chatbot
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure o assistente de IA, playbook de atendimento e respostas rápidas.
        </p>
      </div>

      <div className="space-y-6">
        {/* AI Mode */}
        <section className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              Assistente de IA
            </h3>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={config.aiEnabled}
                onChange={e => updateConfig('aiEnabled', e.target.checked)}
                className="peer sr-only"
              />
              <div className="h-5 w-9 rounded-full bg-muted peer-checked:bg-primary after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full" />
            </label>
          </div>

          {config.aiEnabled && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-2">Modo de operação</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'copilot', label: 'Copiloto', desc: 'Sugere respostas para o atendente aprovar', icon: Sparkles },
                    { value: 'auto', label: 'Automático', desc: 'Responde sozinho com supervisão', icon: Zap },
                    { value: 'hybrid', label: 'Híbrido', desc: 'Auto para simples, copiloto para complexo', icon: Brain },
                  ].map(mode => (
                    <button
                      key={mode.value}
                      onClick={() => updateConfig('aiMode', mode.value)}
                      className={`rounded-lg border p-3 text-left transition-colors ${
                        config.aiMode === mode.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/30'
                      }`}
                    >
                      <mode.icon className={`h-4 w-4 mb-2 ${config.aiMode === mode.value ? 'text-primary' : 'text-muted-foreground'}`} />
                      <p className="text-sm font-medium text-foreground">{mode.label}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{mode.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Modelo</label>
                  <select
                    value={config.model}
                    onChange={e => updateConfig('model', e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="claude-haiku">Claude Haiku (rápido)</option>
                    <option value="claude-sonnet">Claude Sonnet (balanceado)</option>
                    <option value="claude-opus">Claude Opus (avançado)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Criatividade: {config.temperature}
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.1}
                    value={config.temperature}
                    onChange={e => updateConfig('temperature', parseFloat(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Preciso</span>
                    <span>Criativo</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Playbook */}
        <section className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            Playbook de Atendimento
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Contexto da empresa
              </label>
              <textarea
                value={config.companyContext}
                onChange={e => updateConfig('companyContext', e.target.value)}
                rows={6}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none font-mono text-[13px]"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                Descreva sua empresa, serviços e informações que a IA deve saber.
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Tom de voz
              </label>
              <textarea
                value={config.toneOfVoice}
                onChange={e => updateConfig('toneOfVoice', e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                Como a IA deve se comunicar com os clientes.
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-yellow-500" />
                Restrições e regras
              </label>
              <textarea
                value={config.restrictions}
                onChange={e => updateConfig('restrictions', e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none font-mono text-[13px]"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                O que a IA NÃO deve fazer. Uma regra por linha.
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Mensagem de fallback
              </label>
              <textarea
                value={config.fallbackMessage}
                onChange={e => updateConfig('fallbackMessage', e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                Quando a IA não souber responder, usa esta mensagem.
              </p>
            </div>
          </div>
        </section>

        {/* Quick Replies */}
        <section className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-primary" />
              Respostas Rápidas
            </h3>
            <button
              onClick={addQuickReply}
              className="flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
            >
              <span className="text-sm">+</span> Adicionar
            </button>
          </div>
          <div className="space-y-3">
            {config.quickReplies.map(qr => (
              <div key={qr.id} className="rounded-lg border border-border p-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-muted-foreground font-mono">Gatilho:</span>
                    <input
                      type="text"
                      value={qr.trigger}
                      onChange={e => updateQuickReply(qr.id, 'trigger', e.target.value)}
                      className="w-28 rounded-md border border-border bg-muted/50 px-2 py-1 text-xs font-mono text-foreground focus:border-primary focus:outline-none"
                      placeholder="/comando"
                    />
                  </div>
                  <div className="flex-1" />
                  <button
                    onClick={() => removeQuickReply(qr.id)}
                    className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                  >
                    <span className="text-xs">✕</span>
                  </button>
                </div>
                <textarea
                  value={qr.response}
                  onChange={e => updateQuickReply(qr.id, 'response', e.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none resize-none"
                  placeholder="Texto da resposta rápida..."
                />
              </div>
            ))}
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

export default AISettingsPage;
