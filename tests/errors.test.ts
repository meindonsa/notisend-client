import { describe, it, expect } from "vitest";
import { MailClientError } from "../src/errors.js";

describe("MailClientError", () => {
    it("porte bien le message, le status et les détails", () => {
        const err = new MailClientError("Erreur test", 400, { field: "to" });

        expect(err.message).toBe("Erreur test");
        expect(err.status).toBe(400);
        expect(err.details).toEqual({ field: "to" });
        expect(err.name).toBe("MailClientError");
    });

    it("est bien une instance d'Error", () => {
        const err = new MailClientError("Erreur", 500);
        expect(err).toBeInstanceOf(Error);
    });
});