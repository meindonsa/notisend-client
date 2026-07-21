export interface MailClientConfig {
    baseUrl: string;
    apiKey: string;
}

export type TemplateType =
    | "simple"
    | "welcome"
    | "reset-password"
    | "forgot-password"
    | "otp";

export interface Attachment {
    filename: string;
    content: string; // base64
    contentType?: string;
}

export interface SendMailInput {
    from?: string;
    to: string | string[];
    subject: string;
    cc?: string | string[];
    bcc?: string | string[];
    attachment?: Attachment | Attachment[];
    text?: string;
    link?: string;
    value?: string;
    templateType?: TemplateType;
}

export interface SendMailResponse {
    success: true;
    messageId: string;
}