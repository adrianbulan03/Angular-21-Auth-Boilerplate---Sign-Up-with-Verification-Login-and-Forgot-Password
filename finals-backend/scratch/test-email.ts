import nodemailer from 'nodemailer';
import config from '../src/config.json';

async function testEmail() {
    console.log('Testing email sending with configuration:');
    console.log(JSON.stringify(config.smtOptions, null, 2));

    const transporter = nodemailer.createTransport(config.smtOptions);

    try {
        await transporter.verify();
        console.log('Server is ready to take our messages');

        const info = await transporter.sendMail({
            from: config.emailform,
            to: config.emailform, // Send to self
            subject: 'Test Email from Boilerplate',
            text: 'If you see this, the email configuration is working!',
            html: '<b>If you see this, the email configuration is working!</b>'
        });

        console.log('Message sent: %s', info.messageId);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

testEmail();
