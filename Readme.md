# Notisend-client
Notisend for javascript clients

## Usage
```ts
import { MailClient } from "@meindonsa/notisend-client";

const mailClient = new MailClient({
  baseUrl: "https://mail.tondomaine.com",
  apiKey: "MAIL_API_KEY,
});

await mailClient.send({
  to: "client@example.com",
  subject: "Votre code de connexion",
  templateType: "otp",
  text: "Voici votre code à usage unique :",
  value: "482913",
});
```