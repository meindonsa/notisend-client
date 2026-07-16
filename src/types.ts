export interface MailClientConfig {
    baseUrl: string;
    apiKey: string;
}

export interface Attachment {
    filename: string;
    content: string; // base64
    contentType?: string;
}

export interface SendMailInput {
    to: string | string[];
    from?: string;
    subject: string;
    html?: string;
    text?: string;
    cc?: string | string[];
    bcc?: string | string[];
    attachments?: Attachment[];
}

export interface SendMailResponse {
    success: true;
    messageId: string;
}