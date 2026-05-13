import nodemailer from "nodemailer"
import config from "../config.json"

export default async function sendEmail({to, subject, html, from = config.emailform}:any){
    try {
        const transporter = nodemailer.createTransport(config.smtpOptions);
        console.log(`Attempting to send email to: ${to}`);
        await transporter.sendMail({from, to, subject, html});
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
        throw error; // Rethrow so the calling function knows it failed
    }
}