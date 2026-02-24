import { Agent, Conversation, Contact, Message, InternalNote, QuickReply } from '@/types';

export const agents: Agent[] = [
  { id: 'a1', name: 'Ana Silva', email: 'ana@orangeviagens.com', status: 'online', activeConversations: 5, avgResponseTime: '2min' },
  { id: 'a2', name: 'Carlos Mendes', email: 'carlos@orangeviagens.com', status: 'online', activeConversations: 3, avgResponseTime: '4min' },
  { id: 'a3', name: 'Juliana Costa', email: 'juliana@orangeviagens.com', status: 'away', activeConversations: 2, avgResponseTime: '3min' },
  { id: 'a4', name: 'Rafael Oliveira', email: 'rafael@orangeviagens.com', status: 'offline', activeConversations: 0, avgResponseTime: '5min' },
  { id: 'a5', name: 'Mariana Santos', email: 'mariana@orangeviagens.com', status: 'online', activeConversations: 4, avgResponseTime: '2min' },
];

const contacts: Contact[] = [
  { id: 'c1', name: 'Pedro Henrique Souza', phone: '+55 11 98765-4321', email: 'pedro@gmail.com', crmId: 'gtEYhkmxVE4o', tags: ['Lua de mel', 'Europa'], leadStatus: 'proposal', assignedAgent: 'a1', firstContactDate: '2025-01-15', lastMessageDate: '2025-02-24', travelHistory: [{ destination: 'Cancún', date: 'Mar/2025', status: 'completed' }] },
  { id: 'c2', name: 'Fernanda Lima', phone: '+55 21 99876-5432', email: 'fernanda@hotmail.com', tags: ['Família', 'Orlando'], leadStatus: 'new', firstContactDate: '2025-02-23', lastMessageDate: '2025-02-24', travelHistory: [] },
  { id: 'c3', name: 'Ricardo Almeida', phone: '+55 31 97654-3210', tags: ['Corporativo'], leadStatus: 'attending', assignedAgent: 'a2', firstContactDate: '2025-02-10', lastMessageDate: '2025-02-24', travelHistory: [{ destination: 'São Paulo', date: 'Jan/2025', status: 'completed' }] },
  { id: 'c4', name: 'Camila Ferreira', phone: '+55 11 96543-2109', email: 'camila.f@gmail.com', tags: ['Europa', 'Mochilão'], leadStatus: 'negotiation', assignedAgent: 'a1', firstContactDate: '2025-01-20', lastMessageDate: '2025-02-23', travelHistory: [{ destination: 'Lisboa', date: 'Jun/2026', status: 'ongoing' }] },
  { id: 'c5', name: 'Bruno Martins', phone: '+55 41 95432-1098', tags: ['Lua de mel', 'Maldivas'], leadStatus: 'won', assignedAgent: 'a5', firstContactDate: '2024-12-05', lastMessageDate: '2025-02-22', travelHistory: [{ destination: 'Maldivas', date: 'Abr/2025', status: 'ongoing' }] },
  { id: 'c6', name: 'Larissa Nascimento', phone: '+55 11 94321-0987', email: 'larissa.n@outlook.com', tags: ['Família'], leadStatus: 'new', firstContactDate: '2025-02-24', lastMessageDate: '2025-02-24', travelHistory: [] },
  { id: 'c7', name: 'Thiago Barbosa', phone: '+55 85 93210-9876', tags: ['Bariloche', 'Aventura'], leadStatus: 'attending', assignedAgent: 'a3', firstContactDate: '2025-02-18', lastMessageDate: '2025-02-24', travelHistory: [] },
  { id: 'c8', name: 'Isabela Rocha', phone: '+55 71 92109-8765', email: 'isa.rocha@gmail.com', tags: ['Paris', 'Romântico'], leadStatus: 'proposal', assignedAgent: 'a2', firstContactDate: '2025-02-01', lastMessageDate: '2025-02-23', travelHistory: [] },
  { id: 'c9', name: 'Mateus Cardoso', phone: '+55 61 91098-7654', tags: ['Corporativo', 'Nacional'], leadStatus: 'lost', firstContactDate: '2025-01-05', lastMessageDate: '2025-02-20', travelHistory: [] },
  { id: 'c10', name: 'Juliana Pereira', phone: '+55 11 90987-6543', email: 'ju.pereira@gmail.com', tags: ['Orlando', 'Família'], leadStatus: 'attending', assignedAgent: 'a5', firstContactDate: '2025-02-15', lastMessageDate: '2025-02-24', travelHistory: [{ destination: 'Orlando', date: 'Jul/2025', status: 'ongoing' }] },
  { id: 'c11', name: 'André Moreira', phone: '+55 19 99887-6655', tags: ['Cancún'], leadStatus: 'new', firstContactDate: '2025-02-24', lastMessageDate: '2025-02-24', travelHistory: [] },
  { id: 'c12', name: 'Patrícia Vieira', phone: '+55 47 98776-5544', email: 'pat.vieira@yahoo.com', tags: ['Europa', 'Grupo'], leadStatus: 'negotiation', assignedAgent: 'a1', firstContactDate: '2025-02-08', lastMessageDate: '2025-02-23', travelHistory: [] },
];

function makeMessages(convId: string, contactName: string, scenario: 'travel_inquiry' | 'booking' | 'bot_interaction' | 'proposal' | 'general'): Message[] {
  const today = '2025-02-24';
  const base: Message[] = [];

  if (scenario === 'travel_inquiry') {
    base.push(
      { id: `${convId}-1`, conversationId: convId, sender: 'client', content: 'Olá! Vi no Instagram de vocês um pacote pra Cancún. Ainda tem disponibilidade pra março?', timestamp: `${today}T09:15:00`, type: 'text', status: 'read' },
      { id: `${convId}-2`, conversationId: convId, sender: 'agent', senderName: 'Ana Silva', content: 'Olá! Bem-vindo à Orange Viagens! 🍊 Sim, temos pacotes disponíveis para Cancún em março. Quantas pessoas seriam?', timestamp: `${today}T09:17:00`, type: 'text', status: 'read' },
      { id: `${convId}-3`, conversationId: convId, sender: 'client', content: 'Seriam 2 adultos. Queríamos all-inclusive se possível. Qual o valor?', timestamp: `${today}T09:20:00`, type: 'text', status: 'read' },
      { id: `${convId}-4`, conversationId: convId, sender: 'agent', senderName: 'Ana Silva', content: 'Ótima escolha! Para 2 adultos, all-inclusive em Cancún por 7 noites, temos pacotes a partir de R$ 8.900 por pessoa, incluindo aéreo, hotel 5 estrelas e transfers. Vou preparar um orçamento detalhado!', timestamp: `${today}T09:22:00`, type: 'text', status: 'read' },
      { id: `${convId}-5`, conversationId: convId, sender: 'client', content: 'Parece ótimo! Pode me mandar o orçamento sim 😊', timestamp: `${today}T09:25:00`, type: 'text', status: 'read' },
      { id: `${convId}-6`, conversationId: convId, sender: 'agent', senderName: 'Ana Silva', content: 'Perfeito! Pode me informar as datas exatas desejadas e os nomes completos para eu montar a proposta?', timestamp: `${today}T09:27:00`, type: 'text', status: 'delivered' },
    );
  } else if (scenario === 'bot_interaction') {
    base.push(
      { id: `${convId}-1`, conversationId: convId, sender: 'client', content: 'Oi, boa noite! Quero informações sobre pacotes para Orlando.', timestamp: `${today}T22:30:00`, type: 'text', status: 'read' },
      { id: `${convId}-2`, conversationId: convId, sender: 'bot', senderName: 'Bot IA', content: 'Olá! 🤖 Nosso horário de atendimento é de 8h às 20h, mas posso te ajudar com algumas informações! Temos pacotes para Orlando a partir de R$ 6.500 por pessoa (7 noites). Inclui aéreo + hotel. Gostaria que um atendente entre em contato amanhã?', timestamp: `${today}T22:30:30`, type: 'text', status: 'read' },
      { id: `${convId}-3`, conversationId: convId, sender: 'client', content: 'Sim, por favor! Somos uma família de 4 (2 adultos e 2 crianças)', timestamp: `${today}T22:32:00`, type: 'text', status: 'read' },
      { id: `${convId}-4`, conversationId: convId, sender: 'bot', senderName: 'Bot IA', content: 'Anotado! ✅ Um de nossos consultores vai te contatar amanhã pela manhã. Para adiantar, temos pacotes família com parques inclusos. Boa noite!', timestamp: `${today}T22:32:30`, type: 'text', status: 'read' },
      { id: `${convId}-5`, conversationId: convId, sender: 'system', content: 'Conversa transferida para Mariana Santos', timestamp: `${today}T08:00:00`, type: 'text' },
      { id: `${convId}-6`, conversationId: convId, sender: 'agent', senderName: 'Mariana Santos', content: 'Bom dia, Fernanda! Vi que você tem interesse em Orlando para a família. Vou montar um pacote especial com ingressos dos parques inclusos! 🎢', timestamp: `${today}T08:15:00`, type: 'text', status: 'delivered' },
    );
  } else if (scenario === 'proposal') {
    base.push(
      { id: `${convId}-1`, conversationId: convId, sender: 'client', content: 'Oi Ana! Recebi a proposta para Lisboa. Ficou perfeita!', timestamp: '2025-02-23T14:00:00', type: 'text', status: 'read' },
      { id: `${convId}-2`, conversationId: convId, sender: 'agent', senderName: 'Ana Silva', content: 'Que bom, Camila! 😊 Consegui um upgrade no hotel para vocês. O valor ficou em R$ 12.400 por pessoa com aéreo direto pela TAP.', timestamp: '2025-02-23T14:05:00', type: 'text', status: 'read' },
      { id: `${convId}-3`, conversationId: convId, sender: 'client', content: 'Aceitamos parcelamento?', timestamp: '2025-02-23T14:10:00', type: 'text', status: 'read' },
      { id: `${convId}-4`, conversationId: convId, sender: 'agent', senderName: 'Ana Silva', content: 'Sim! Parcelamos em até 10x no cartão sem juros, ou à vista com 5% de desconto via PIX. O que prefere?', timestamp: '2025-02-23T14:12:00', type: 'text', status: 'read' },
      { id: `${convId}-5`, conversationId: convId, sender: 'client', content: 'Vou conversar com meu marido e te dou um retorno até sexta!', timestamp: '2025-02-23T14:15:00', type: 'text', status: 'read' },
    );
  } else if (scenario === 'booking') {
    base.push(
      { id: `${convId}-1`, conversationId: convId, sender: 'system', content: 'Conversa iniciada via WhatsApp', timestamp: '2025-02-22T10:00:00', type: 'text' },
      { id: `${convId}-2`, conversationId: convId, sender: 'client', content: 'Mariana, quero confirmar a reserva das Maldivas! 🏝️', timestamp: '2025-02-22T10:05:00', type: 'text', status: 'read' },
      { id: `${convId}-3`, conversationId: convId, sender: 'agent', senderName: 'Mariana Santos', content: 'Que maravilha, Bruno! 🎉 Sua reserva foi confirmada! Enviaremos os detalhes por email. Preciso do passaporte e RG para finalizar.', timestamp: '2025-02-22T10:10:00', type: 'text', status: 'read' },
      { id: `${convId}-4`, conversationId: convId, sender: 'client', content: 'Vou enviar agora!', timestamp: '2025-02-22T10:12:00', type: 'text', status: 'read' },
      { id: `${convId}-5`, conversationId: convId, sender: 'client', content: 'Passaporte_Bruno.pdf', timestamp: '2025-02-22T10:15:00', type: 'document', fileName: 'Passaporte_Bruno.pdf', status: 'read' },
      { id: `${convId}-6`, conversationId: convId, sender: 'agent', senderName: 'Mariana Santos', content: 'Recebido! Tudo certinho. Vou emitir os bilhetes e envio a confirmação final até amanhã. Boa viagem! ✈️', timestamp: '2025-02-22T10:20:00', type: 'text', status: 'read' },
    );
  } else {
    base.push(
      { id: `${convId}-1`, conversationId: convId, sender: 'client', content: 'Olá! Gostaria de informações sobre viagens.', timestamp: `${today}T10:00:00`, type: 'text', status: 'read' },
      { id: `${convId}-2`, conversationId: convId, sender: 'agent', senderName: 'Carlos Mendes', content: 'Olá! Bem-vindo à Orange Viagens! 🍊 Como posso ajudar?', timestamp: `${today}T10:02:00`, type: 'text', status: 'delivered' },
    );
  }
  return base;
}

export const conversations: Conversation[] = [
  { id: 'conv1', contact: contacts[0], messages: makeMessages('conv1', contacts[0].name, 'travel_inquiry'), unreadCount: 2, lastMessage: 'Pode me informar as datas exatas desejadas...', lastMessageTime: '09:27', assignedAgentId: 'a1' },
  { id: 'conv2', contact: contacts[1], messages: makeMessages('conv2', contacts[1].name, 'bot_interaction'), unreadCount: 0, lastMessage: 'Bom dia, Fernanda! Vi que você tem interesse...', lastMessageTime: '08:15', assignedAgentId: 'a5' },
  { id: 'conv3', contact: contacts[2], messages: makeMessages('conv3', contacts[2].name, 'general'), unreadCount: 1, lastMessage: 'Olá! Bem-vindo à Orange Viagens!', lastMessageTime: '10:02', assignedAgentId: 'a2' },
  { id: 'conv4', contact: contacts[3], messages: makeMessages('conv4', contacts[3].name, 'proposal'), unreadCount: 0, lastMessage: 'Vou conversar com meu marido...', lastMessageTime: 'Ontem', assignedAgentId: 'a1' },
  { id: 'conv5', contact: contacts[4], messages: makeMessages('conv5', contacts[4].name, 'booking'), unreadCount: 0, lastMessage: 'Recebido! Tudo certinho...', lastMessageTime: '22 Fev', assignedAgentId: 'a5' },
  { id: 'conv6', contact: contacts[5], messages: makeMessages('conv6', contacts[5].name, 'general'), unreadCount: 3, lastMessage: 'Olá! Gostaria de informações...', lastMessageTime: '11:45', isTyping: true },
  { id: 'conv7', contact: contacts[6], messages: makeMessages('conv7', contacts[6].name, 'general'), unreadCount: 0, lastMessage: 'Olá! Bem-vindo à Orange Viagens!', lastMessageTime: '14:30', assignedAgentId: 'a3' },
  { id: 'conv8', contact: contacts[7], messages: makeMessages('conv8', contacts[7].name, 'proposal'), unreadCount: 1, lastMessage: 'Vou conversar com meu marido...', lastMessageTime: 'Ontem', assignedAgentId: 'a2' },
  { id: 'conv9', contact: contacts[8], messages: makeMessages('conv9', contacts[8].name, 'general'), unreadCount: 0, lastMessage: 'Olá! Bem-vindo à Orange Viagens!', lastMessageTime: '20 Fev' },
  { id: 'conv10', contact: contacts[9], messages: makeMessages('conv10', contacts[9].name, 'bot_interaction'), unreadCount: 0, lastMessage: 'Bom dia! Vi que você tem interesse...', lastMessageTime: '08:30', assignedAgentId: 'a5' },
  { id: 'conv11', contact: contacts[10], messages: makeMessages('conv11', contacts[10].name, 'travel_inquiry'), unreadCount: 4, lastMessage: 'Pode me informar as datas...', lastMessageTime: '09:50' },
  { id: 'conv12', contact: contacts[11], messages: makeMessages('conv12', contacts[11].name, 'proposal'), unreadCount: 0, lastMessage: 'Vou conversar e te dou retorno...', lastMessageTime: 'Ontem', assignedAgentId: 'a1' },
];

export const quickReplies: QuickReply[] = [
  { id: 'qr1', category: 'Saudações', title: 'Boas-vindas', content: 'Olá! Bem-vindo à Orange Viagens! 🍊 Como posso ajudar?' },
  { id: 'qr2', category: 'Orçamento', title: 'Solicitar datas', content: 'Vou preparar seu orçamento. Pode me informar as datas desejadas?' },
  { id: 'qr3', category: 'Documentos', title: 'Solicitar docs', content: 'Para prosseguir, preciso do seu passaporte e RG.' },
  { id: 'qr4', category: 'Pagamento', title: 'Formas de pagamento', content: 'Aceitamos cartão (até 10x sem juros), PIX e transferência bancária.' },
  { id: 'qr5', category: 'Finalização', title: 'Reserva confirmada', content: 'Sua reserva foi confirmada! 🎉 Enviaremos os detalhes por email.' },
  { id: 'qr6', category: 'Saudações', title: 'Fora do horário', content: 'Nosso horário de atendimento é de 8h às 20h. Retornaremos em breve!' },
];

export const internalNotes: InternalNote[] = [
  { id: 'n1', contactId: 'c1', authorName: 'Ana Silva', content: 'Cliente interessado em Cancún all-inclusive. Orçamento em preparação.', timestamp: '2025-02-24T09:30:00' },
  { id: 'n2', contactId: 'c4', authorName: 'Ana Silva', content: 'Proposta enviada para Lisboa. Aguardando retorno até sexta.', timestamp: '2025-02-23T14:20:00' },
  { id: 'n3', contactId: 'c5', authorName: 'Mariana Santos', content: 'Reserva confirmada. Passaporte recebido. Emitir bilhetes.', timestamp: '2025-02-22T10:25:00' },
];

export const currentAgent: Agent = agents[0];
