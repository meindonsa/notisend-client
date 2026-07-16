import type { MailClientConfig, SendMailInput, SendMailResponse } from "./types.js";
import { MailClientError } from "./errors.js";

export class MailClient {
    private baseUrl: string;
    private apiKey: string;

    constructor(config: MailClientConfig) {
        this.baseUrl = config.baseUrl.replace(/\/$/, "");
        this.apiKey = config.apiKey;
    }

    private async request<T>(path: string, body: unknown): Promise<T> {
        const res = await fetch(`${this.baseUrl}${path}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": this.apiKey,
            },
            body: JSON.stringify(body),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new MailClientError(
                data?.error ?? "Erreur inconnue lors de l'envoi",
                res.status,
                data
            );
        }

        return data as T;
    }

    async sendMail(input: SendMailInput): Promise<SendMailResponse> {
        return this.request<SendMailResponse>("/api/mail/send", input);
    }

    async sendInvoice(input: {
        to: string;
        clientName: string;
        invoiceNumber: string;
        amount: string;
        pdfBase64: string;
    }): Promise<SendMailResponse> {
        return this.request<SendMailResponse>("/api/mail/send-invoice", input);
    }
}