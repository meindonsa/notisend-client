import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MailClient } from "../src/client.js";
import { MailClientError } from "../src/errors.js";

describe("MailClient", () => {
    const config = {
        baseUrl: "http://localhost:3000",
        apiKey: "test-api-key",
    };

    let client: MailClient;

    beforeEach(() => {
        client = new MailClient(config);
        vi.stubGlobal("fetch", vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    describe("constructor", () => {
        it("retire le slash final du baseUrl", async () => {
            const clientWithSlash = new MailClient({
                ...config,
                baseUrl: "http://localhost:3000/",
            });

            (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
                new Response(JSON.stringify({ success: true, messageId: "123" }), {
                    status: 200,
                })
            );

            await clientWithSlash.send({
                to: "meindonsa1999@gmail.com",
                subject: "Test",
                templateType: "simple",
                text: "Test",
            });

            const calledUrl = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
            expect(calledUrl).toBe("http://localhost:3000/api/mail");
        });
    });

    describe("send", () => {
        it("envoie une requête POST correcte avec les bons headers", async () => {
            (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
                new Response(JSON.stringify({ success: true, messageId: "msg-123" }), {
                    status: 200,
                })
            );

            const result = await client.send({
                to: "meindonsa1999@gmail.com",
                subject: "Bienvenue",
                templateType: "welcome",
                text: "Salut",
                link: "https://example.com/start",
            });

            expect(fetch).toHaveBeenCalledWith(
                "http://localhost:3000/api/mail",
                expect.objectContaining({
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-api-key": "test-api-key",
                    },
                    body: JSON.stringify({
                        to: "meindonsa1999@gmail.com",
                        subject: "Bienvenue",
                        templateType: "welcome",
                        text: "Salut",
                        link: "https://example.com/start",
                    }),
                })
            );

            expect(result).toEqual({ success: true, messageId: "msg-123" });
        });

        it("gère les destinataires multiples", async () => {
            (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
                new Response(JSON.stringify({ success: true, messageId: "msg-456" }), {
                    status: 200,
                })
            );

            await client.send({
                to: ["meindonsa1999@gmail.com", "b@example.com"],
                subject: "Test",
                templateType: "simple",
                text: "Contenu texte",
            });

            const body = JSON.parse(
                (fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body
            );
            expect(body.to).toEqual(["meindonsa1999@gmail.com", "b@example.com"]);
        });

        it("envoie une requête pour un template otp avec value", async () => {
            (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
                new Response(JSON.stringify({ success: true, messageId: "otp-1" }), {
                    status: 200,
                })
            );

            await client.send({
                to: "meindonsa1999@gmail.com",
                subject: "Votre code",
                templateType: "otp",
                text: "Voici votre code :",
                value: "482913",
            });

            const body = JSON.parse(
                (fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body
            );
            expect(body.templateType).toBe("otp");
            expect(body.value).toBe("482913");
        });

        it("envoie une requête avec une pièce jointe", async () => {
            (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
                new Response(JSON.stringify({ success: true, messageId: "att-1" }), {
                    status: 200,
                })
            );

            await client.send({
                to: "meindonsa1999@gmail.com",
                subject: "Document",
                templateType: "simple",
                text: "Voici le document",
                attachment: {
                    filename: "doc.pdf",
                    content: "base64content",
                    contentType: "application/pdf",
                },
            });

            const body = JSON.parse(
                (fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body
            );
            expect(body.attachment).toEqual({
                filename: "doc.pdf",
                content: "base64content",
                contentType: "application/pdf",
            });
        });

        it("utilise templateType simple par défaut si non fourni", async () => {
            (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
                new Response(JSON.stringify({ success: true, messageId: "def-1" }), {
                    status: 200,
                })
            );

            await client.send({
                to: "meindonsa1999@gmail.com",
                subject: "Test",
                text: "Contenu",
            });

            const body = JSON.parse(
                (fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body
            );
            expect(body.templateType).toBeUndefined();
        });

        it("lève une MailClientError si le serveur répond avec une erreur", async () => {
            (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
                new Response(
                    JSON.stringify({ error: "Échec de l'envoi de l'email" }),
                    { status: 500 }
                )
            );

            await expect(
                client.send({
                    to: "meindonsa1999@gmail.com",
                    subject: "Test",
                    templateType: "simple",
                    text: "Test",
                })
            ).rejects.toThrow(MailClientError);
        });

        it("inclut le status et les détails dans l'erreur", async () => {
            const errorBody = { error: "Non autorisé", details: "API key invalide" };

            (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
                new Response(JSON.stringify(errorBody), { status: 401 })
            );

            try {
                await client.send({
                    to: "meindonsa1999@gmail.com",
                    subject: "Test",
                    templateType: "simple",
                    text: "Test",
                });
                expect.fail("Une erreur aurait dû être levée");
            } catch (err) {
                expect(err).toBeInstanceOf(MailClientError);
                expect((err as MailClientError).status).toBe(401);
                expect((err as MailClientError).details).toEqual(errorBody);
            }
        });

        it("propage une erreur réseau (fetch qui échoue)", async () => {
            (fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
                new Error("Network error")
            );

            await expect(
                client.send({
                    to: "meindonsa1999@gmail.com",
                    subject: "Test",
                    templateType: "simple",
                    text: "Test",
                })
            ).rejects.toThrow("Network error");
        });
    });
});