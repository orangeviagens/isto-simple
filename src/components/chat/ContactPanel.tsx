import { X, Copy, ExternalLink, Plus } from 'lucide-react';
import { Contact, LEAD_STATUS_LABELS, LeadStatus } from '@/types';
import { useState } from 'react';
import { internalNotes, agents } from '@/data/mockData';

interface Props {
  contact: Contact;
  onClose: () => void;
}

const leadColors: Record<LeadStatus, string> = {
  new: 'bg-lead-new/15 text-lead-new border-lead-new/30',
  attending: 'bg-lead-attending/15 text-lead-attending border-lead-attending/30',
  proposal: 'bg-lead-proposal/15 text-lead-proposal border-lead-proposal/30',
  negotiation: 'bg-lead-negotiation/15 text-lead-negotiation border-lead-negotiation/30',
  won: 'bg-lead-won/15 text-lead-won border-lead-won/30',
  lost: 'bg-lead-lost/15 text-lead-lost border-lead-lost/30',
};

const tagColors = [
  'bg-primary/10 text-primary',
  'bg-secondary/30 text-secondary-foreground',
  'bg-lead-proposal/10 text-lead-proposal',
  'bg-whatsapp/10 text-whatsapp',
  'bg-lead-new/10 text-lead-new',
];

export function ContactPanel({ contact, onClose }: Props) {
  const [newNote, setNewNote] = useState('');
  const notes = internalNotes.filter(n => n.contactId === contact.id);
  const assignedAgent = agents.find(a => a.id === contact.assignedAgent);
  const initials = contact.name.split(' ').slice(0, 2).map(n => n[0]).join('');

  return (
    <div className="flex h-full w-[320px] min-w-[280px] flex-col border-l border-border bg-card overflow-y-auto scrollbar-thin">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <h3 className="text-sm font-semibold text-foreground">Dados do contato</h3>
        <button onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Contact info */}
      <div className="border-b border-border p-4">
        <div className="flex flex-col items-center">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-xl font-bold text-secondary-foreground">
            {initials}
          </div>
          <h4 className="text-base font-semibold text-foreground">{contact.name}</h4>
          <div className="mt-1 flex items-center gap-1">
            <span className="text-xs text-muted-foreground">{contact.phone}</span>
            <button className="text-muted-foreground hover:text-foreground" onClick={() => navigator.clipboard.writeText(contact.phone)}>
              <Copy className="h-3 w-3" />
            </button>
          </div>
          {contact.email && <span className="mt-0.5 text-xs text-muted-foreground">{contact.email}</span>}
          {contact.crmId && (
            <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
              ID CRM: {contact.crmId}
            </div>
          )}
          <button className="mt-2 flex items-center gap-1 rounded-md bg-muted px-3 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground">
            <ExternalLink className="h-3 w-3" /> Abrir no CRM
          </button>
        </div>
      </div>

      {/* Lead info */}
      <div className="border-b border-border p-4">
        <h5 className="mb-3 text-xs font-semibold text-foreground uppercase tracking-wider">Informações do Lead</h5>
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Status</span>
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${leadColors[contact.leadStatus]}`}>
              {LEAD_STATUS_LABELS[contact.leadStatus]}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Origem</span>
            <span className="text-xs text-foreground">WhatsApp</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Atendente</span>
            <span className="text-xs text-foreground">{assignedAgent?.name || 'Não atribuído'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Primeiro contato</span>
            <span className="text-xs text-foreground">{new Date(contact.firstContactDate).toLocaleDateString('pt-BR')}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Última mensagem</span>
            <span className="text-xs text-foreground">{new Date(contact.lastMessageDate).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="mt-3">
          <span className="text-xs text-muted-foreground">Tags</span>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {contact.tags.map((tag, i) => (
              <span key={tag} className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${tagColors[i % tagColors.length]}`}>
                {tag}
              </span>
            ))}
            <button className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground">
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Travel history */}
      {contact.travelHistory.length > 0 && (
        <div className="border-b border-border p-4">
          <h5 className="mb-3 text-xs font-semibold text-foreground uppercase tracking-wider">Histórico de viagens</h5>
          <div className="space-y-2">
            {contact.travelHistory.map((travel, i) => (
              <div key={i} className="flex items-center justify-between rounded-md bg-muted/50 p-2">
                <div>
                  <span className="text-xs font-medium text-foreground">{travel.destination}</span>
                  <span className="ml-2 text-[10px] text-muted-foreground">{travel.date}</span>
                </div>
                <span className={`text-[10px] font-medium ${travel.status === 'completed' ? 'text-lead-won' : travel.status === 'ongoing' ? 'text-lead-new' : 'text-lead-lost'}`}>
                  {travel.status === 'completed' ? 'Concluída' : travel.status === 'ongoing' ? 'Em andamento' : 'Cancelada'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Internal notes */}
      <div className="p-4">
        <h5 className="mb-3 text-xs font-semibold text-foreground uppercase tracking-wider">Notas internas</h5>
        <div className="space-y-2">
          {notes.map(note => (
            <div key={note.id} className="rounded-md bg-note p-2.5 border border-note-border">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold text-note-author">{note.authorName}</span>
                <span className="text-[10px] text-note-text">{new Date(note.timestamp).toLocaleDateString('pt-BR')}</span>
              </div>
              <p className="text-xs text-note-author">{note.content}</p>
            </div>
          ))}
          {notes.length === 0 && <p className="text-xs text-muted-foreground italic">Nenhuma nota ainda</p>}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Adicionar nota..."
            className="flex-1 rounded-md border border-border bg-muted/30 px-2 py-1.5 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button className="rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}
