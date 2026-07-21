import type { MailClientConfig, SendMailInput, SendMailResponse } from "./types.js";
import { MailClientError } from "./errors.js";

export class MailClient {
    private baseUrl: string;
    private apiKey: string;

    constructor(config: MailClientConfig) {
        this.baseUrl = config.baseUrl.replace(/\/$/, "");
        this.apiKey = config.apiKey;
    }

    async send(input: SendMailInput): Promise<SendMailResponse> {
        const res = await fetch(`${this.baseUrl}/api/mail`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": this.apiKey,
            },
            body: JSON.stringify(input),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new MailClientError(
                data?.error ?? "Erreur inconnue lors de l'envoi",
                res.status,
                data
            );
        }

        return data as SendMailResponse;
    }
}