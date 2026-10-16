import { EmailOutboxRecord, UserRole } from '../types';

// In-memory outbox storage with size cap
const outbox: EmailOutboxRecord[] = [];

function baseEmailTemplate(title: string, subtitle: string, contentHtml: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 24px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 16px rgba(15, 23, 42, 0.05); }
    .header { background: linear-gradient(135deg, #064e3b 0%, #065f46 100%); color: #ffffff; padding: 32px 28px; text-align: center; }
    .badge { display: inline-block; background: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 9999px; padding: 4px 12px; font-size: 11px; font-family: monospace; letter-spacing: 1px; margin-bottom: 12px; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 800; }
    .header p { margin: 6px 0 0; font-size: 13px; opacity: 0.9; }
    .body { padding: 32px 28px; font-size: 14px; line-height: 1.6; color: #334155; }
    .otp-box { background: #f0fdf4; border: 2px dashed #16a34a; border-radius: 16px; padding: 20px; text-align: center; margin: 24px 0; }
    .otp-code { font-family: monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #15803d; }
    .otp-expiry { font-size: 12px; color: #166534; margin-top: 8px; font-weight: 600; }
    .footer { background: #f8fafc; padding: 20px 28px; font-size: 11px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; }
    .alert-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 12px 16px; color: #991b1b; font-size: 12px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">গণপ্রজাতন্ত্রী বাংলাদেশ • RELIEF AI NATIONAL GRID</div>
      <h1>${title}</h1>
      <p>${subtitle}</p>
    </div>
    <div class="body">
      ${contentHtml}
    </div>
    <div class="footer">
      <p>Relief AI National Emergency & Disaster Response Grid • Ministry of Disaster Management & Relief</p>
      <p>This is an automated operational security dispatch. Please do not reply directly to this email.</p>
    </div>
  </div>
</body>
</html>
  `;
}

export const emailService = {
  /**
   * Dispatches an email, stores it in the outbox, and logs operational confirmation.
   */
  async sendEmail(options: {
    to: string;
    toName?: string;
    subject: string;
    type: EmailOutboxRecord['type'];
    otpCode?: string;
    htmlContent: string;
    textContent: string;
  }): Promise<EmailOutboxRecord> {
    const record: EmailOutboxRecord = {
      id: `mail-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      to: options.to.toLowerCase().trim(),
      toName: options.toName,
      subject: options.subject,
      type: options.type,
      otpCode: options.otpCode,
      htmlContent: options.htmlContent,
      textContent: options.textContent,
      sentAt: new Date().toISOString(),
      delivered: true,
    };

    // Store in outbox (keep last 500 records)
    outbox.unshift(record);
    if (outbox.length > 500) outbox.pop();

    if (process.env.NODE_ENV === 'production') {
      console.log(`[ReliefAI Email] Dispatched ${options.type} notification to ${options.to}`);
    } else {
      console.log(
        `[ReliefAI Email] Dispatched to ${options.to} | Subject: "${options.subject}" | OTP: ${options.otpCode || 'N/A'}`
      );
    }

    return record;
  },

  /**
   * 1. Citizen / Personnel Verification OTP Email
   */
  async sendVerificationOtpEmail(
    toEmail: string,
    toName: string,
    otpCode: string,
    expiresMinutes: number = 10
  ): Promise<EmailOutboxRecord> {
    const subject = `[Relief AI] Security Verification Code: ${otpCode}`;
    const html = baseEmailTemplate(
      'Account Verification',
      'জাতীয় দুর্যোগ প্ল্যাটফর্ম যাচাইকরণ কোড',
      `
      <p>Hello <strong>${toName || 'Responder'}</strong>,</p>
      <p>Thank you for registering on the <strong>Relief AI Bangladesh National Crisis Grid</strong>. To complete your account activation and verify your identity, please enter the following 6-digit verification code:</p>

      <div class="otp-box">
        <div class="otp-code">${otpCode}</div>
        <div class="otp-expiry">Valid for ${expiresMinutes} minutes only</div>
      </div>

      <p>Enter this code on the verification screen to activate your account and gain access to disaster telemetry and family safety beacon tools.</p>

      <div class="alert-box">
        <strong>Security Warning:</strong> Never share this code with anyone. Relief AI administrators or Fire Service commanders will never ask for your verification code.
      </div>
      `
    );

    return this.sendEmail({
      to: toEmail,
      toName,
      subject,
      type: 'verification_otp',
      otpCode,
      htmlContent: html,
      textContent: `Relief AI Verification Code: ${otpCode}. Valid for ${expiresMinutes} minutes. Do not share with anyone.`,
    });
  },

  /**
   * 2. Password Reset OTP Email
   */
  async sendPasswordResetOtpEmail(
    toEmail: string,
    toName: string,
    otpCode: string,
    expiresMinutes: number = 10
  ): Promise<EmailOutboxRecord> {
    const subject = `[Relief AI] Password Reset Code: ${otpCode}`;
    const html = baseEmailTemplate(
      'Password Reset Request',
      'পাসওয়ার্ড রিসেট সিকিউরিটি কোড',
      `
      <p>Hello <strong>${toName || 'User'}</strong>,</p>
      <p>A password reset request was initiated for your Relief AI account associated with <strong>${toEmail}</strong>.</p>

      <div class="otp-box">
        <div class="otp-code">${otpCode}</div>
        <div class="otp-expiry">Expires in ${expiresMinutes} minutes</div>
      </div>

      <p>If you requested this reset, enter this 6-digit code on the password reset page to create your new secure password.</p>

      <div class="alert-box">
        If you did not request this password reset, please ignore this email immediately. Your account remains protected.
      </div>
      `
    );

    return this.sendEmail({
      to: toEmail,
      toName,
      subject,
      type: 'password_reset_otp',
      otpCode,
      htmlContent: html,
      textContent: `Relief AI Password Reset Code: ${otpCode}. Valid for ${expiresMinutes} minutes. If you did not request this, ignore this email.`,
    });
  },

  /**
   * 3. Email Change Verification OTP Email
   */
  async sendEmailChangeOtpEmail(
    toEmail: string,
    toName: string,
    otpCode: string,
    expiresMinutes: number = 10
  ): Promise<EmailOutboxRecord> {
    const subject = `[Relief AI] Confirm Email Address Change: ${otpCode}`;
    const html = baseEmailTemplate(
      'Verify New Email Address',
      'নতুন ইমেল ঠিকানা যাচাইকরণ',
      `
      <p>Hello <strong>${toName || 'User'}</strong>,</p>
      <p>You requested to update your registered email address on Relief AI to <strong>${toEmail}</strong>.</p>

      <div class="otp-box">
        <div class="otp-code">${otpCode}</div>
        <div class="otp-expiry">Expires in ${expiresMinutes} minutes</div>
      </div>

      <p>Please enter this code in your account settings to confirm ownership and finalize the email change.</p>
      `
    );

    return this.sendEmail({
      to: toEmail,
      toName,
      subject,
      type: 'email_change_otp',
      otpCode,
      htmlContent: html,
      textContent: `Relief AI Email Change Code: ${otpCode}. Valid for ${expiresMinutes} minutes.`,
    });
  },

  /**
   * 4. Welcome & Account Activated Email
   */
  async sendWelcomeEmail(toEmail: string, toName: string, role: UserRole): Promise<EmailOutboxRecord> {
    const subject = `Welcome to Relief AI Bangladesh - Account Activated`;
    const html = baseEmailTemplate(
      'Welcome to Relief AI',
      'জাতীয় সংকট ব্যবস্থাপনা প্ল্যাটফর্মে স্বাগতম',
      `
      <p>Hello <strong>${toName}</strong>,</p>
      <p>Your email address has been successfully verified! Your account is now fully active with clearance role: <strong>${role.toUpperCase()}</strong>.</p>

      <div style="background: #f1f5f9; border-radius: 12px; padding: 16px; margin: 20px 0;">
        <h4 style="margin: 0 0 8px; color: #0f172a;">Platform Capabilities Available:</h4>
        <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #475569;">
          <li>Interactive Bangladesh Tactical Map & River Hydrology telemetry</li>
          <li>1-Touch Emergency SOS beacon and real-time triage updates</li>
          <li>Cyclone and Flood shelter occupancy tracking across high-risk districts</li>
          <li>Secure Role-Based Dashboard access</li>
        </ul>
      </div>

      <p>Thank you for contributing to Bangladesh's national disaster preparedness and civil response network.</p>
      `
    );

    return this.sendEmail({
      to: toEmail,
      toName,
      subject,
      type: 'welcome',
      htmlContent: html,
      textContent: `Welcome to Relief AI Bangladesh, ${toName}. Your account is activated as ${role}.`,
    });
  },

  /**
   * 5. NGO Application Received Email
   */
  async sendNgoApplicationReceivedEmail(
    toEmail: string,
    focalName: string,
    orgName: string,
    applicationId: string
  ): Promise<EmailOutboxRecord> {
    const subject = `[Relief AI] NGO Accreditation Application Received: ${orgName}`;
    const html = baseEmailTemplate(
      'NGO Application Received',
      'এনজিও নিবন্ধন আবেদন গ্রহণ করা হয়েছে',
      `
      <p>Dear <strong>${focalName}</strong>,</p>
      <p>We have successfully received the institutional accreditation application for <strong>${orgName}</strong>.</p>

      <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px; margin: 20px 0;">
        <div style="font-size: 12px; color: #1e40af; font-weight: bold; text-transform: uppercase;">Application Reference ID</div>
        <div style="font-size: 20px; font-weight: 800; color: #1e3a8a; font-family: monospace; margin-top: 4px;">${applicationId}</div>
      </div>

      <p>Our verification officers and Command Administration team will review your submitted registration credentials and relief capabilities. You will receive an official approval notification and activation link via email upon completion.</p>
      `
    );

    return this.sendEmail({
      to: toEmail,
      toName: focalName,
      subject,
      type: 'ngo_applied',
      htmlContent: html,
      textContent: `Relief AI: Application for ${orgName} received with ID ${applicationId}. Our administration is reviewing your submission.`,
    });
  },

  /**
   * 6. NGO Application Approved & Account Activated Email
   */
  async sendNgoApprovedEmail(
    toEmail: string,
    focalName: string,
    orgName: string,
    tempPassword: string,
    otpCode: string
  ): Promise<EmailOutboxRecord> {
    const subject = `[Relief AI] NGO Accreditation APPROVED: ${orgName}`;
    const html = baseEmailTemplate(
      'NGO Accreditation Approved',
      'এনজিও আবেদন অনুমোদিত ও সক্রিয়',
      `
      <p>Dear <strong>${focalName}</strong>,</p>
      <p>Congratulations! The Command Administration has approved the humanitarian accreditation for <strong>${orgName}</strong>.</p>

      <p>Your official NGO Logistics account has been provisioned on the Relief AI National Mesh. Here are your initial credentials:</p>

      <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 16px; margin: 20px 0; font-family: monospace; font-size: 13px;">
        <div><strong>Email:</strong> ${toEmail}</div>
        <div style="margin-top: 6px;"><strong>Temporary Password:</strong> ${tempPassword}</div>
      </div>

      <p>To verify your email and activate your account on your first login, use the following activation code:</p>

      <div class="otp-box">
        <div class="otp-code">${otpCode}</div>
        <div class="otp-expiry">Activation Code Valid for 24 Hours</div>
      </div>

      <p>Please log in at <a href="/auth/login" style="color: #059669; font-weight: bold;">Relief AI Portal</a> and change your password in settings upon entry.</p>
      `
    );

    return this.sendEmail({
      to: toEmail,
      toName: focalName,
      subject,
      type: 'ngo_approved',
      otpCode,
      htmlContent: html,
      textContent: `Relief AI: NGO Accreditation for ${orgName} has been approved. Email: ${toEmail}, Temp Pass: ${tempPassword}, Activation OTP: ${otpCode}.`,
    });
  },

  /**
   * 7. Account Provisioned Notification Email (Rescue Team, Government)
   */
  async sendAccountProvisionedEmail(
    toEmail: string,
    toName: string,
    role: UserRole,
    identifier: string,
    tempPassword: string,
    otpCode: string
  ): Promise<EmailOutboxRecord> {
    const roleLabels: Record<string, string> = {
      rescue_team: 'Tactical Search & Rescue Responder (FSCD)',
      government: 'Government Civil Defense Agency Officer',
      admin: 'Incident Command Administrator (ICS-400)',
    };

    const subject = `[Relief AI] Official Credentials Provisioned: ${roleLabels[role] || role}`;
    const html = baseEmailTemplate(
      'Official Clearance Provisioned',
      'অফিসিয়াল এক্সেস ও ক্রেডেনশিয়াল প্রদান',
      `
      <p>Greetings <strong>${toName}</strong>,</p>
      <p>An official institutional account has been provisioned for you by the Command Authority as <strong>${roleLabels[role] || role}</strong> (${identifier}).</p>

      <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 16px; margin: 20px 0; font-family: monospace; font-size: 13px;">
        <div><strong>Login Email:</strong> ${toEmail}</div>
        <div style="margin-top: 6px;"><strong>Initial Password:</strong> ${tempPassword}</div>
      </div>

      <p>On your first sign in, please verify your email using this 6-digit verification code:</p>

      <div class="otp-box">
        <div class="otp-code">${otpCode}</div>
        <div class="otp-expiry">First-Login Verification OTP</div>
      </div>

      <p>Visit <a href="/auth/login" style="color: #059669; font-weight: bold;">Relief AI Login</a> to sign in and access your authorized dashboard.</p>
      `
    );

    return this.sendEmail({
      to: toEmail,
      toName,
      subject,
      type: 'account_provisioned',
      otpCode,
      htmlContent: html,
      textContent: `Relief AI: Official account provisioned for ${toName} (${role}). Temp Password: ${tempPassword}. First-Login OTP: ${otpCode}.`,
    });
  },

  /**
   * Outbox inspector for development and admin audit
   */
  getOutbox(): EmailOutboxRecord[] {
    if (process.env.NODE_ENV === 'production') return [];
    return [...outbox];
  },

  getLatestEmailFor(email: string): EmailOutboxRecord | undefined {
    if (process.env.NODE_ENV === 'production') return undefined;
    const clean = email.toLowerCase().trim();
    return outbox.find((item) => item.to === clean);
  },
};
