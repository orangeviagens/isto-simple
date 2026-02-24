import type { MessageType } from '@/types';

export interface WhatsAppMessage {
  to: string;           // Phone in E.164 format: 5591984559787
  type: MessageType;
  content: string;
  mediaUrl?: string;
  fileName?: string;
  templateName?: string;
  templateParams?: string[];
}

export interface WhatsAppWebhookPayload {
  messageId: string;
  from: string;         // Sender phone E.164
  timestamp: string;
  type: MessageType;
  content: string;
  mediaId?: string;
  mimeType?: string;
}

export interface WhatsAppStatusPayload {
  messageId: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface WhatsAppService {
  /** Send a text message */
  sendText(to: string, text: string): Promise<string>;

  /** Send a media message (image, document, audio) */
  sendMedia(to: string, type: MessageType, mediaUrl: string, caption?: string): Promise<string>;

  /** Send a template (HSM) message */
  sendTemplate(to: string, templateName: string, params?: string[], language?: string): Promise<string>;

  /** Mark a message as read */
  markAsRead(messageId: string): Promise<void>;

  /** Download media by its ID */
  downloadMedia(mediaId: string): Promise<{ url: string; mimeType: string }>;

  /** Verify webhook signature from Meta */
  verifyWebhookSignature(signature: string, body: string): boolean;

  /** Parse incoming webhook payload */
  parseWebhook(body: unknown): WhatsAppWebhookPayload | WhatsAppStatusPayload | null;
}
