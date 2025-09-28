import nodemailer from 'nodemailer';

export interface EmailTemplate {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  from?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: {
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }[];
}

export interface EmailConfig {
  provider: 'smtp' | 'sendgrid' | 'mock';
  smtp?: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  sendgrid?: {
    apiKey: string;
  };
  defaultFrom: string;
  defaultReplyTo?: string;
}

class EmailService {
  private config: EmailConfig;
  private transporter: nodemailer.Transporter | null = null;

  constructor(config: EmailConfig) {
    this.config = config;
    this.initializeTransporter();
  }

  private async initializeTransporter() {
    if (this.config.provider === 'mock') {
      return; // No transporter needed for mock
    }

    if (this.config.provider === 'smtp' && this.config.smtp) {
      this.transporter = nodemailer.createTransport({
        host: this.config.smtp.host,
        port: this.config.smtp.port,
        secure: this.config.smtp.secure,
        auth: {
          user: this.config.smtp.auth.user,
          pass: this.config.smtp.auth.pass,
        },
      });
    } else if (this.config.provider === 'sendgrid' && this.config.sendgrid) {
      // SendGrid with nodemailer
      this.transporter = nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: 'apikey',
          pass: this.config.sendgrid.apiKey,
        },
      });
    }
  }

  async sendEmail(template: EmailTemplate): Promise<{ success: boolean; error?: string; messageId?: string }> {
    try {
      if (this.config.provider === 'mock') {
        return this.mockSendEmail(template);
      }

      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      const mailOptions = {
        from: template.from || this.config.defaultFrom,
        to: Array.isArray(template.to) ? template.to.join(', ') : template.to,
        subject: template.subject,
        text: template.text,
        html: template.html,
        replyTo: template.replyTo || this.config.defaultReplyTo,
        cc: template.cc?.join(', '),
        bcc: template.bcc?.join(', '),
        attachments: template.attachments,
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      console.log('✅ Email sent successfully:', {
        to: template.to,
        subject: template.subject,
        messageId: result.messageId
      });

      return {
        success: true,
        messageId: result.messageId
      };

    } catch (error) {
      console.error('❌ Email sending failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown email error'
      };
    }
  }

  private async mockSendEmail(template: EmailTemplate): Promise<{ success: boolean; messageId: string }> {
    // Mock implementation for development
    console.log('📧 [MOCK] Email would be sent:', {
      to: template.to,
      subject: template.subject,
      preview: template.text.substring(0, 100) + '...',
      timestamp: new Date().toISOString()
    });
    
    // Simulate sending delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      success: true,
      messageId: `mock-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
    };
  }

  async sendBulkEmails(templates: EmailTemplate[]): Promise<{
    success: boolean;
    results: Array<{ success: boolean; error?: string; messageId?: string }>;
  }> {
    const results = await Promise.allSettled(
      templates.map(template => this.sendEmail(template))
    );

    const processedResults = results.map(result => 
      result.status === 'fulfilled' 
        ? result.value 
        : { success: false, error: result.reason?.message || 'Unknown error' }
    );

    const successCount = processedResults.filter(r => r.success).length;

    return {
      success: successCount === templates.length,
      results: processedResults
    };
  }

  async verifyConnection(): Promise<boolean> {
    if (this.config.provider === 'mock') {
      return true;
    }

    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email service verification failed:', error);
      return false;
    }
  }
}

// Email template helpers
export class EmailTemplateBuilder {
  static getHeader(title: string): string {
    return `
      <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">${title}</h1>
      </div>
    `;
  }

  static getFooter(): string {
    return `
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
        <p style="font-size: 12px; color: #999;">
          Best regards,<br>
          The Venboo Team<br>
          <a href="mailto:support@venboo.com" style="color: #ff6b6b;">support@venboo.com</a>
        </p>
        <p style="font-size: 11px; color: #ccc; margin-top: 15px;">
          You're receiving this email because you have an account with Venboo. 
          If you no longer wish to receive these emails, you can 
          <a href="#" style="color: #ff6b6b;">unsubscribe here</a>.
        </p>
      </div>
    `;
  }

  static wrapContent(content: string): string {
    return `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
          ${content}
          ${this.getFooter()}
        </div>
      </div>
    `;
  }

  static createBookingStatusEmail(
    customerName: string,
    bookingReference: string,
    carName: string,
    newStatus: string,
    statusColor: string,
    message: string
  ): { html: string; text: string } {
    const html = `
      ${this.getHeader(`Booking ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`)}
      ${this.wrapContent(`
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Hello ${customerName},
        </p>
        
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          ${message}
        </p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1f2937; margin-top: 0;">Booking Details</h3>
          <p><strong>Booking Reference:</strong> ${bookingReference}</p>
          <p><strong>Car:</strong> ${carName}</p>
          <p><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${newStatus.toUpperCase()}</span></p>
        </div>
      `)}
    `;

    const text = `
      Hello ${customerName},

      ${message}

      Booking Details:
      - Reference: ${bookingReference}
      - Car: ${carName}
      - Status: ${newStatus.toUpperCase()}

      Best regards,
      The Venboo Team
      support@venboo.com
    `;

    return { html, text };
  }
}

// Initialize email service based on environment
export const getEmailService = (): EmailService => {
  const config: EmailConfig = {
    provider: (process.env.EMAIL_PROVIDER as 'mock' | 'smtp' | 'sendgrid') || 'mock',
    defaultFrom: process.env.EMAIL_FROM || 'Venboo <noreply@venboo.com>',
    defaultReplyTo: process.env.EMAIL_REPLY_TO || 'support@venboo.com',
    smtp: process.env.SMTP_HOST ? {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      }
    } : undefined,
    sendgrid: process.env.SENDGRID_API_KEY ? {
      apiKey: process.env.SENDGRID_API_KEY
    } : undefined,
  };

  return new EmailService(config);
};

export default EmailService;
