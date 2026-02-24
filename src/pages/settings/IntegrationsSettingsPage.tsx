import { useState } from 'react';
import { Plug, MessageSquare, BarChart3, CheckCircle2, XCircle, ExternalLink, RefreshCw, Save, Database } from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
  config: Record<string, string>;
}

const IntegrationsSettingsPage = () => {
  const [saved, setSaved] = useState(false);

  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'whatsapp',
      name: 'WhatsApp Business API',
      description: 'Enviar e receber mensagens via WhatsApp Cloud API da Meta.',
      icon: MessageSquare,
      color: 'text-green-600 bg-green-50',
      status: 'connected',
      lastSync: 'Há 2 minutos',
      config: {
        phoneNumberId: '1025591183969414',
        businessAccountId: '1358706386274992',
        appId: '771239678944172',
        webhookUrl: 'https://xdbveregzbkmqswfyvmn.supabase.co/functions/v1/whatsapp-webhook',
        verifyToken: 'orange-messenger-verify-2026',
        apiVersion: 'v21.0',
      },
    },
    {
      id: 'zoho',
      name: 'Zoho CRM',
      description: 'Sincronizar contatos, leads e negociações com o Zoho CRM.',
      icon: Database,
      color: 'text-red-600 bg-red-50',
      status: 'disconnected',
      config: {
        clientId: '',
        clientSecret: '',
        redirectUri: 'https://orange-messenger.netlify.app/settings/integrations/zoho/callback',
        scope: 'ZohoCRM.modules.ALL,ZohoCRM.settings.ALL',
        domain: 'https://accounts.zoho.com',
      },
    },
    {
      id: 'analytics',
      name: 'Google Analytics',
      description: 'Rastrear eventos e métricas de atendimento no GA4.',
      icon: BarChart3,
      color: 'text-yellow-600 bg-yellow-50',
      status: 'disconnected',
      config: {
        measurementId: '',
        streamId: '',
      },
    },
  ]);

  const [expandedId, setExpandedId] = useState<string | null>('whatsapp');

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const updateIntegrationConfig = (integrationId: string, key: string, value: string) => {
    setIntegrations(prev =>
      prev.map(i =>
        i.id === integrationId
          ? { ...i, config: { ...i.config, [key]: value } }
          : i
      )
    );
  };

  const configLabels: Record<string, string> = {
    phoneNumberId: 'Phone Number ID',
    businessAccountId: 'Business Account ID',
    appId: 'App ID',
    webhookUrl: 'Webhook URL',
    verifyToken: 'Verify Token',
    apiVersion: 'API Version',
    clientId: 'Client ID',
    clientSecret: 'Client Secret',
    redirectUri: 'Redirect URI',
    scope: 'Scope',
    domain: 'Auth Domain',
    measurementId: 'Measurement ID',
    streamId: 'Stream ID',
  };

  const sensitiveFields = ['clientSecret', 'verifyToken'];

  return (
    <div className="p-6 max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Plug className="h-5 w-5 text-primary" />
          Integrações
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Conecte o Orange Messenger com suas ferramentas favoritas.
        </p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
          <CheckCircle2 className="h-8 w-8 text-green-500" />
          <div>
            <p className="text-xl font-bold text-foreground">
              {integrations.filter(i => i.status === 'connected').length}
            </p>
            <p className="text-[11px] text-muted-foreground">Conectadas</p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
          <XCircle className="h-8 w-8 text-muted-foreground" />
          <div>
            <p className="text-xl font-bold text-foreground">
              {integrations.filter(i => i.status === 'disconnected').length}
            </p>
            <p className="text-[11px] text-muted-foreground">Disponíveis</p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
          <Plug className="h-8 w-8 text-primary" />
          <div>
            <p className="text-xl font-bold text-foreground">{integrations.length}</p>
            <p className="text-[11px] text-muted-foreground">Total</p>
          </div>
        </div>
      </div>

      {/* Integrations List */}
      <div className="space-y-4">
        {integrations.map(integration => (
          <div
            key={integration.id}
            className="rounded-xl border border-border bg-card overflow-hidden"
          >
            {/* Integration Header */}
            <button
              onClick={() => setExpandedId(expandedId === integration.id ? null : integration.id)}
              className="flex w-full items-center gap-4 p-4 text-left hover:bg-muted/20 transition-colors"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${integration.color}`}>
                <integration.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground">{integration.name}</h3>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      integration.status === 'connected'
                        ? 'bg-green-50 text-green-700'
                        : integration.status === 'error'
                        ? 'bg-red-50 text-red-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      integration.status === 'connected' ? 'bg-green-500' :
                      integration.status === 'error' ? 'bg-red-500' : 'bg-gray-400'
                    }`} />
                    {integration.status === 'connected' ? 'Conectado' :
                     integration.status === 'error' ? 'Erro' : 'Desconectado'}
                  </span>
                </div>
                <p className="text-[12px] text-muted-foreground mt-0.5">{integration.description}</p>
                {integration.lastSync && (
                  <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                    <RefreshCw className="h-3 w-3" />
                    Última sincronização: {integration.lastSync}
                  </p>
                )}
              </div>
              <svg
                className={`h-4 w-4 text-muted-foreground transition-transform ${expandedId === integration.id ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Expanded Config */}
            {expandedId === integration.id && (
              <div className="border-t border-border px-4 py-4 bg-muted/5">
                <div className="space-y-3">
                  {Object.entries(integration.config).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                        {configLabels[key] || key}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type={sensitiveFields.includes(key) ? 'password' : 'text'}
                          value={value}
                          onChange={e => updateIntegrationConfig(integration.id, key, e.target.value)}
                          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs font-mono text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          readOnly={key === 'webhookUrl' || key === 'redirectUri'}
                        />
                        {(key === 'webhookUrl' || key === 'redirectUri') && (
                          <button
                            onClick={() => navigator.clipboard.writeText(value)}
                            className="rounded-md border border-border px-2.5 py-1 text-[11px] text-muted-foreground hover:bg-muted transition-colors"
                          >
                            Copiar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex items-center gap-2">
                  {integration.status === 'connected' ? (
                    <>
                      <button className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors">
                        <RefreshCw className="h-3.5 w-3.5" />
                        Sincronizar agora
                      </button>
                      <button className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
                        <ExternalLink className="h-3.5 w-3.5" />
                        Abrir painel
                      </button>
                      <button className="ml-auto flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors">
                        Desconectar
                      </button>
                    </>
                  ) : (
                    <button className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                      <Plug className="h-3.5 w-3.5" />
                      Conectar {integration.name}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Future Integrations */}
      <section className="mt-8 rounded-xl border border-dashed border-border bg-card/50 p-6 text-center">
        <Plug className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
        <h3 className="text-sm font-semibold text-foreground mb-1">Mais integrações em breve</h3>
        <p className="text-[12px] text-muted-foreground max-w-md mx-auto">
          Estamos trabalhando em integrações com Hubspot, RD Station, Stripe, Calendly e muito mais.
          Fique ligado nas atualizações!
        </p>
      </section>

      {/* Save Button */}
      <div className="flex items-center gap-3 pt-6 pb-8">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Save className="h-4 w-4" />
          Salvar integrações
        </button>
        {saved && (
          <span className="text-sm text-lead-won font-medium animate-in fade-in">
            ✓ Integrações salvas!
          </span>
        )}
      </div>
    </div>
  );
};

export default IntegrationsSettingsPage;
