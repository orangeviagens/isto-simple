import type { QuickReply } from '@/types';

export interface CreateQuickReplyDTO {
  category: string;
  title: string;
  content: string;
}

export interface QuickReplyRepository {
  findById(id: string): Promise<QuickReply | null>;
  create(data: CreateQuickReplyDTO): Promise<QuickReply>;
  update(id: string, data: Partial<CreateQuickReplyDTO>): Promise<QuickReply>;
  delete(id: string): Promise<void>;
  list(category?: string): Promise<QuickReply[]>;
  listCategories(): Promise<string[]>;
}
