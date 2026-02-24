import type { InternalNote } from '@/types';

export interface CreateNoteDTO {
  contactId: string;
  authorName: string;
  content: string;
}

export interface InternalNoteRepository {
  findById(id: string): Promise<InternalNote | null>;
  create(data: CreateNoteDTO): Promise<InternalNote>;
  update(id: string, content: string): Promise<InternalNote>;
  delete(id: string): Promise<void>;
  listByContact(contactId: string): Promise<InternalNote[]>;
}
