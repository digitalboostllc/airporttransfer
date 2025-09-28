import { getEmailService, EmailTemplateBuilder, type EmailTemplate } from './email-service';
import { Booking } from './bookings';
import { User } from './auth';

// Enhanced email notification service
class EmailNotificationService {
  private emailService = getEmailService();

  // Booking confirmation email
  async sendBookingConfirmation(
    booking: Booking,
    customer: User
  ): Promise<{ success: boolean; error?: string }> {
    const carName = `${booking.car.make} ${booking.car.model} ${booking.car.year}`;
    const pickupDate = new Date(booking.pickupDatetime).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const returnDate = new Date(booking.dropoffDatetime).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const html = `
      ${EmailTemplateBuilder.getHeader('🎉 Booking Confirmed!')}
      ${EmailTemplateBuilder.wrapContent(`
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Hello ${customer.name},
        </p>
        
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Great news! Your booking has been confirmed. We're excited to provide you with an excellent rental experience.
        </p>
        
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #16a34a; margin-top: 0;">✅ Booking Confirmed</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div>
              <strong>Booking Reference:</strong><br>
              <span style="font-family: monospace; font-size: 18px; color: #16a34a;">${booking.bookingReference}</span>
            </div>
            <div>
              <strong>Total Amount:</strong><br>
              <span style="font-size: 18px; font-weight: bold; color: #16a34a;">${booking.totalPrice} MAD</span>
            </div>
          </div>
        </div>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1f2937; margin-top: 0;">🚗 Car Details</h3>
          <p><strong>Vehicle:</strong> ${carName}</p>
          <p><strong>Category:</strong> ${booking.car.category}</p>
          <p><strong>Agency:</strong> ${booking.car.agency.name}</p>
        </div>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1f2937; margin-top: 0;">📅 Rental Period</h3>
          <p><strong>Pickup:</strong> ${pickupDate}</p>
          <p><strong>Return:</strong> ${returnDate}</p>
          <p><strong>Duration:</strong> ${Math.ceil((new Date(booking.dropoffDatetime).getTime() - new Date(booking.pickupDatetime).getTime()) / (1000 * 60 * 60 * 24))} days</p>
        </div>
        
        <div style="background: #dbeafe; border: 1px solid #93c5fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1d4ed8; margin-top: 0;">ℹ️ Next Steps</h3>
          <ul style="margin: 0; padding-left: 20px; color: #1e40af;">
            <li>Keep this confirmation email for your records</li>
            <li>Bring a valid driving license and ID for pickup</li>
            <li>Contact us if you need to make any changes</li>
            <li>Check your email for pickup location details closer to your rental date</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/profile" 
             style="background: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            View My Booking
          </a>
        </div>
      `)}
    `;

    const text = `
      Booking Confirmed!

      Hello ${customer.name},

      Great news! Your booking has been confirmed.

      Booking Details:
      - Reference: ${booking.bookingReference}
      - Car: ${carName}
      - Pickup: ${pickupDate}
      - Return: ${returnDate}
      - Total: ${booking.totalPrice} MAD

      Next Steps:
      - Keep this confirmation email
      - Bring valid driving license and ID
      - Contact us for any changes

      Best regards,
      The Venboo Team
      support@venboo.com
    `;

    const template: EmailTemplate = {
      to: customer.email,
      subject: `Booking Confirmed - ${booking.bookingReference}`,
      html,
      text
    };

    return await this.emailService.sendEmail(template);
  }

  // Booking status update email
  async sendBookingStatusUpdate(
    booking: Booking,
    customer: User,
    newStatus: string,
    message?: string
  ): Promise<{ success: boolean; error?: string }> {
    const carName = `${booking.car.make} ${booking.car.model} ${booking.car.year}`;
    
    const statusConfig = {
      'confirmed': { color: '#16a34a', icon: '✅', title: 'Booking Confirmed' },
      'in_progress': { color: '#2563eb', icon: '🚗', title: 'Rental Started' },
      'completed': { color: '#059669', icon: '🏁', title: 'Rental Completed' },
      'cancelled': { color: '#dc2626', icon: '❌', title: 'Booking Cancelled' },
      'pending': { color: '#d97706', icon: '⏳', title: 'Booking Pending' }
    };

    const config = statusConfig[newStatus as keyof typeof statusConfig] || statusConfig.pending;
    const defaultMessage = message || `Your booking status has been updated to ${newStatus}.`;

    const { html, text } = EmailTemplateBuilder.createBookingStatusEmail(
      customer.name,
      booking.bookingReference,
      carName,
      newStatus,
      config.color,
      defaultMessage
    );

    const template: EmailTemplate = {
      to: customer.email,
      subject: `${config.title} - ${booking.bookingReference}`,
      html: `${EmailTemplateBuilder.getHeader(`${config.icon} ${config.title}`)}${html}`,
      text
    };

    return await this.emailService.sendEmail(template);
  }

  // Payment confirmation email
  async sendPaymentConfirmation(
    booking: Booking,
    customer: User,
    paymentDetails: {
      amount: number;
      currency: string;
      paymentMethod: string;
      transactionId: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    const carName = `${booking.car.make} ${booking.car.model} ${booking.car.year}`;

    const html = `
      ${EmailTemplateBuilder.getHeader('💳 Payment Confirmed')}
      ${EmailTemplateBuilder.wrapContent(`
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Hello ${customer.name},
        </p>
        
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Your payment has been successfully processed. Here are the details:
        </p>
        
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #16a34a; margin-top: 0;">💸 Payment Details</h3>
          <p><strong>Amount:</strong> ${paymentDetails.amount} ${paymentDetails.currency}</p>
          <p><strong>Method:</strong> ${paymentDetails.paymentMethod}</p>
          <p><strong>Transaction ID:</strong> ${paymentDetails.transactionId}</p>
          <p><strong>Status:</strong> <span style="color: #16a34a; font-weight: bold;">COMPLETED</span></p>
        </div>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1f2937; margin-top: 0;">🚗 Booking Information</h3>
          <p><strong>Reference:</strong> ${booking.bookingReference}</p>
          <p><strong>Car:</strong> ${carName}</p>
        </div>
        
        <p style="font-size: 14px; color: #666; margin-top: 30px;">
          This email serves as your payment receipt. Please keep it for your records.
        </p>
      `)}
    `;

    const text = `
      Payment Confirmed

      Hello ${customer.name},

      Your payment has been successfully processed.

      Payment Details:
      - Amount: ${paymentDetails.amount} ${paymentDetails.currency}
      - Method: ${paymentDetails.paymentMethod}
      - Transaction ID: ${paymentDetails.transactionId}
      - Status: COMPLETED

      Booking: ${booking.bookingReference}
      Car: ${carName}

      This email serves as your payment receipt.

      Best regards,
      The Venboo Team
      support@venboo.com
    `;

    const template: EmailTemplate = {
      to: customer.email,
      subject: `Payment Receipt - ${booking.bookingReference}`,
      html,
      text
    };

    return await this.emailService.sendEmail(template);
  }

  // Reminder emails
  async sendBookingReminder(
    booking: Booking,
    customer: User,
    reminderType: 'pickup' | 'return' | 'review'
  ): Promise<{ success: boolean; error?: string }> {
    const carName = `${booking.car.make} ${booking.car.model} ${booking.car.year}`;
    
    let subject: string;
    let title: string;
    let message: string;
    let cta: { text: string; url: string } | null = null;

    switch (reminderType) {
      case 'pickup':
        subject = `Reminder: Car Pickup Tomorrow - ${booking.bookingReference}`;
        title = '📅 Pickup Reminder';
        message = `Don't forget! Your car rental pickup is scheduled for tomorrow. Please arrive on time with your driving license and ID.`;
        cta = {
          text: 'View Pickup Details',
          url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/profile`
        };
        break;
      case 'return':
        subject = `Reminder: Car Return Today - ${booking.bookingReference}`;
        title = '🚗 Return Reminder';
        message = `Your rental period ends today. Please return the car by the agreed time to avoid extra charges.`;
        cta = {
          text: 'View Return Details',
          url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/profile`
        };
        break;
      case 'review':
        subject = `How was your experience? Leave a review - ${booking.bookingReference}`;
        title = '⭐ Share Your Experience';
        message = `We hope you enjoyed your rental experience! Please take a moment to leave a review and help other customers.`;
        cta = {
          text: 'Write Review',
          url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/profile`
        };
        break;
    }

    const html = `
      ${EmailTemplateBuilder.getHeader(title)}
      ${EmailTemplateBuilder.wrapContent(`
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Hello ${customer.name},
        </p>
        
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          ${message}
        </p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1f2937; margin-top: 0;">📋 Booking Details</h3>
          <p><strong>Reference:</strong> ${booking.bookingReference}</p>
          <p><strong>Car:</strong> ${carName}</p>
          <p><strong>Agency:</strong> ${booking.car.agency.name}</p>
        </div>
        
        ${cta ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${cta.url}" 
               style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              ${cta.text}
            </a>
          </div>
        ` : ''}
      `)}
    `;

    const text = `
      ${title}

      Hello ${customer.name},

      ${message}

      Booking Details:
      - Reference: ${booking.bookingReference}
      - Car: ${carName}
      - Agency: ${booking.car.agency.name}

      Best regards,
      The Venboo Team
      support@venboo.com
    `;

    const template: EmailTemplate = {
      to: customer.email,
      subject,
      html,
      text
    };

    return await this.emailService.sendEmail(template);
  }

  // Agency notification email
  async sendAgencyBookingNotification(
    booking: Booking,
    agencyEmail: string,
    notificationType: 'new' | 'cancelled' | 'modified'
  ): Promise<{ success: boolean; error?: string }> {
    const carName = `${booking.car.make} ${booking.car.model} ${booking.car.year}`;
    
    let subject: string;
    let title: string;
    let message: string;

    switch (notificationType) {
      case 'new':
        subject = `New Booking Received - ${booking.bookingReference}`;
        title = '🎉 New Booking';
        message = 'You have received a new booking! The customer has completed payment and the booking is confirmed.';
        break;
      case 'cancelled':
        subject = `Booking Cancelled - ${booking.bookingReference}`;
        title = '❌ Booking Cancelled';
        message = 'A booking has been cancelled. Please update your availability accordingly.';
        break;
      case 'modified':
        subject = `Booking Modified - ${booking.bookingReference}`;
        title = '✏️ Booking Modified';
        message = 'A booking has been modified. Please review the updated details.';
        break;
    }

    const html = `
      ${EmailTemplateBuilder.getHeader(title)}
      ${EmailTemplateBuilder.wrapContent(`
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Hello,
        </p>
        
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          ${message}
        </p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1f2937; margin-top: 0;">📋 Booking Details</h3>
          <p><strong>Reference:</strong> ${booking.bookingReference}</p>
          <p><strong>Customer:</strong> ${booking.customerName}</p>
          <p><strong>Email:</strong> ${booking.customerEmail}</p>
          <p><strong>Phone:</strong> ${booking.customerPhone}</p>
          <p><strong>Car:</strong> ${carName}</p>
          <p><strong>Pickup:</strong> ${new Date(booking.pickupDatetime).toLocaleDateString()}</p>
          <p><strong>Return:</strong> ${new Date(booking.dropoffDatetime).toLocaleDateString()}</p>
          <p><strong>Total:</strong> ${booking.totalPrice} MAD</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/agency/dashboard" 
             style="background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            View in Dashboard
          </a>
        </div>
      `)}
    `;

    const text = `
      ${title}

      ${message}

      Booking Details:
      - Reference: ${booking.bookingReference}
      - Customer: ${booking.customerName}
      - Email: ${booking.customerEmail}
      - Phone: ${booking.customerPhone}
      - Car: ${carName}
      - Pickup: ${new Date(booking.pickupDatetime).toLocaleDateString()}
      - Return: ${new Date(booking.dropoffDatetime).toLocaleDateString()}
      - Total: ${booking.totalPrice} MAD

      Best regards,
      The Venboo Platform
      support@venboo.com
    `;

    const template: EmailTemplate = {
      to: agencyEmail,
      subject,
      html,
      text
    };

    return await this.emailService.sendEmail(template);
  }
}

// Export singleton instance
export const emailNotificationService = new EmailNotificationService();

// Export individual functions for backward compatibility
export const sendBookingConfirmation = (booking: Booking, customer: User) =>
  emailNotificationService.sendBookingConfirmation(booking, customer);

export const sendBookingStatusUpdate = (booking: Booking, customer: User, newStatus: string, message?: string) =>
  emailNotificationService.sendBookingStatusUpdate(booking, customer, newStatus, message);

export const sendPaymentConfirmation = (booking: Booking, customer: User, paymentDetails: { amount: number; currency: string; paymentMethod: string; transactionId: string }) =>
  emailNotificationService.sendPaymentConfirmation(booking, customer, paymentDetails);

export const sendBookingReminder = (booking: Booking, customer: User, reminderType: 'pickup' | 'return' | 'review') =>
  emailNotificationService.sendBookingReminder(booking, customer, reminderType);

export const sendAgencyBookingNotification = (booking: Booking, agencyEmail: string, notificationType: 'new' | 'cancelled' | 'modified') =>
  emailNotificationService.sendAgencyBookingNotification(booking, agencyEmail, notificationType);
