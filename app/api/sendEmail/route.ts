// app/api/sendEmail/route.ts
import nodemailer from 'nodemailer';
import crypto from 'crypto';

export async function POST(request: Request): Promise<Response> {
  try {
    const ticketNum = crypto.randomInt(1000000000)

    // Parse the JSON body from the incoming request
    const { name, email, message } = await request.json();

    // Create a transporter object using Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER, // Your Gmail address
        pass: process.env.GMAIL_PASS, // Your Gmail App Password
      },
    });

    // Define the email options
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: [process.env.GMAIL_USER, email],
      cc: process.env.GMAIL_USER, // Sends the email to your Gmail account
      subject: `New Service Request from ${name} Ticket Num: ${ticketNum}`,
      text: `You have a new service request.\n\nName: ${name}\nEmail: ${email}\nMessage: ${message}`,
    };

    // Send the email using NodeMailer
    await transporter.sendMail(mailOptions);

    // Return a successful response
    return new Response(
      JSON.stringify({ message: 'Email sent successfully' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    // Return an error response if something goes wrong
    return new Response(
      JSON.stringify({ message: 'Error sending email' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
