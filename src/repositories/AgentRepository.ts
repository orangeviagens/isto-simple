import type { Agent, AgentStatus } from '@/types';

export interface CreateAgentDTO {
  name: string;
  email: string;
  avatar?: string;
  status?: AgentStatus;
}

export interface UpdateAgentDTO {
  name?: string;
  email?: string;
  avatar?: string;
  status?: AgentStatus;
  activeConversations?: number;
}

export interface AgentRepository {
  findById(id: string): Promise<Agent | null>;
  findByEmail(email: string): Promise<Agent | null>;
  create(data: CreateAgentDTO): Promise<Agent>;
  update(id: string, data: UpdateAgentDTO): Promise<Agent>;
  list(): Promise<Agent[]>;
  listOnline(): Promise<Agent[]>;
  getLeastBusy(): Promise<Agent | null>;
}
