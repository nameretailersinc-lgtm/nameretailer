# SMTP email

Password reset emails use the SMTP settings in the server environment:

```dotenv
MAIL_TRANSPORT=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-mailbox@gmail.com
SMTP_PASSWORD=your-google-app-password
SMTP_FROM="Name Retailer <your-mailbox@gmail.com>"
```

For Gmail, enable Google 2-Step Verification and create an App Password. The four display groups can be pasted with spaces; the mail transport removes those separators for Gmail. Other providers' password spaces remain unchanged. Port 587 uses required STARTTLS; port 465 uses TLS from connection start. See [Nodemailer's Gmail guide](https://nodemailer.com/guides/using-gmail).

Restart the application after changing the environment. Set the same variables in the deployed server's environment to enable deployed email.

Run `npm run check:services` to verify the SMTP connection and authentication. The check sends no email and prints no credentials. Actual password resets send through the same verified transport. Payment receipts remain available in the customer's order history; automatic order email notifications are not implemented.

`MAIL_TRANSPORT=local` captures development emails under `.local/mail`. Local capture is disabled in production. `MAIL_TRANSPORT=disabled` disables sending, including when SMTP credentials are present.
