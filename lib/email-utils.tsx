import nodemailer from 'nodemailer';

let transporter: any = null;

function getTransporter() {
  if (transporter) return transporter;

  const emailServer = process.env.EMAIL_SERVER;
  const emailPort = parseInt(process.env.EMAIL_PORT || '587', 10);
  const emailSecure = process.env.EMAIL_SECURE === 'true';
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;

  if (!emailServer || !emailUser || !emailPassword) {
    console.error('[v0] Email configuration incomplete:', {
      hasServer: !!emailServer,
      hasUser: !!emailUser,
      hasPassword: !!emailPassword,
    });
    return null;
  }

  try {
    transporter = nodemailer.createTransport({
      host: emailServer,
      port: emailPort,
      secure: emailSecure,
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
    });

    console.log('[v0] Email transporter initialized successfully');
    return transporter;
  } catch (error) {
    console.error('[v0] Failed to create email transporter:', error);
    return null;
  }
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const emailFrom = process.env.EMAIL_FROM;

    if (!emailFrom) {
      console.error('[v0] EMAIL_FROM not configured');
      return { success: false, error: 'Email sender not configured' };
    }

    const transport = getTransporter();
    if (!transport) {
      console.error('[v0] Email transporter not available');
      return { success: false, error: 'Email service not available' };
    }

    const mailOptions = {
      from: emailFrom,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    };

    console.log('[v0] Sending email to:', to);
    const result = await transport.sendMail(mailOptions);
    console.log('[v0] Email sent successfully:', result.messageId);

    return { success: true };
  } catch (error) {
    console.error('[v0] Failed to send email:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

export async function sendVerificationCodeEmail(
  email: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  const subject = 'Your Verification Code';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Verify Your Email</h2>
      <p>Your verification code is:</p>
      <h1 style="text-align: center; color: #e74c3c; letter-spacing: 5px;">${code}</h1>
      <p>This code will expire in 10 minutes.</p>
      <p>If you didn't request this code, please ignore this email.</p>
    </div>
  `;

  return sendEmail(email, subject, html);
}

export async function sendPasswordResetEmail(
  email: string,
  resetLink: string
): Promise<{ success: boolean; error?: string }> {
  const subject = 'Reset Your Password';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Reset Your Password</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #e74c3c; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
        Reset Password
      </a>
      <p>Or copy this link: ${resetLink}</p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    </div>
  `;

  return sendEmail(email, subject, html);
}
