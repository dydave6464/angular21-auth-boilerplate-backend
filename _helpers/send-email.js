const nodemailer = require('nodemailer');

module.exports = sendEmail;

async function sendEmail({ to, subject, html, from = process.env.EMAIL_FROM }) {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        // STARTTLS on 587, SMTPS on 465
        secure: parseInt(process.env.SMTP_PORT || '587', 10) === 465,
        auth: process.env.SMTP_USER
            ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
            : undefined,
    });

    const info = await transporter.sendMail({ from, to, subject, html });

    // Ethereal exposes a preview URL — handy when SMTP creds aren't real.
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
        console.log('Email preview URL:', previewUrl);
    }
    return info;
}
