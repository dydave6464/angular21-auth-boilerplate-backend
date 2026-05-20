module.exports = sendEmail;

// Uses Brevo's HTTPS API (port 443) instead of SMTP — Render free-tier
// reliably blocks outbound SMTP but allows HTTPS, so this is the only
// reliable path to email delivery from a free Render service.
//
// Brevo Transactional Email API: https://developers.brevo.com/reference/sendtransacemail
async function sendEmail({ to, subject, html, from = process.env.EMAIL_FROM }) {
    if (!process.env.BREVO_API_KEY) {
        throw new Error('BREVO_API_KEY is not set');
    }
    if (!from) {
        throw new Error('EMAIL_FROM is not set');
    }

    const payload = {
        sender: { email: from },
        to: [{ email: to }],
        subject,
        htmlContent: html,
    };

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'content-type': 'application/json',
            'api-key': process.env.BREVO_API_KEY,
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Brevo send error (${response.status}):`, errorBody);
        throw new Error(`Brevo API returned ${response.status}: ${errorBody}`);
    }

    const data = await response.json();
    console.log(`Email sent to ${to} (messageId ${data.messageId})`);
    return data;
}
