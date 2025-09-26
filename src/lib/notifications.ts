import { Booking } from './bookings';
import { User } from './auth';

// Email template interfaces
interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  text: string;
}

// Mock email service - in production, you'd use services like:
// - SendGrid
// - AWS SES
// - Mailgun
// - Nodemailer with SMTP
export async function sendEmail(template: EmailTemplate): Promise<boolean> {
  // Mock implementation - in production this would send actual emails
  console.log('📧 Email would be sent:', {
    to: template.to,
    subject: template.subject,
    preview: template.text.substring(0, 100) + '...'
  });
  
  // Simulate email sending delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return true; // Return true to simulate successful sending
}

// Generate booking confirmation email
export function generateBookingConfirmationEmail(
  booking: Booking,
  user: User
): EmailTemplate {
  const bookingId = `CR-${booking.id.slice(-8)}`;
  const carName = `${booking.car.make} ${booking.car.model} ${booking.car.year}`;
  const pickupDate = new Date(booking.pickupDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const returnDate = new Date(booking.returnDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const subject = `Booking Confirmed - ${carName} (${bookingId})`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; background-color: #f5f5f5; }
            .container { background-color: white; margin: 20px; padding: 0; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #ef4444, #f97316); color: white; padding: 30px 40px; border-radius: 10px 10px 0 0; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
            .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
            .content { padding: 40px; }
            .booking-card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 25px; margin: 25px 0; }
            .car-info { display: flex; align-items: center; margin-bottom: 20px; }
            .car-image { width: 80px; height: 60px; background-color: #e5e7eb; border-radius: 6px; margin-right: 15px; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #6b7280; }
            .car-details h3 { margin: 0 0 5px 0; font-size: 20px; color: #1f2937; }
            .car-details p { margin: 0; color: #6b7280; font-size: 14px; }
            .booking-details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 25px; }
            .detail-item { }
            .detail-label { font-weight: 600; color: #374151; font-size: 14px; margin-bottom: 5px; }
            .detail-value { color: #1f2937; font-size: 16px; }
            .total-section { background-color: #10b981; color: white; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center; }
            .total-amount { font-size: 32px; font-weight: bold; margin: 0; }
            .total-label { font-size: 16px; opacity: 0.9; margin: 5px 0 0 0; }
            .next-steps { background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0; }
            .next-steps h4 { color: #1e40af; margin: 0 0 15px 0; }
            .next-steps ul { margin: 0; padding-left: 20px; color: #1e40af; }
            .next-steps li { margin: 8px 0; }
            .contact-info { background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center; }
            .contact-info h4 { color: #0f172a; margin: 0 0 10px 0; }
            .contact-info p { margin: 5px 0; color: #475569; }
            .footer { background-color: #f8fafc; padding: 20px 40px; border-radius: 0 0 10px 10px; text-align: center; color: #6b7280; font-size: 14px; }
            .footer a { color: #ef4444; text-decoration: none; }
            .status-badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 14px; font-weight: 600; text-transform: uppercase; }
            .status-confirmed { background-color: #d1fae5; color: #065f46; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Booking Confirmed!</h1>
                <p>Your car rental is all set, ${user.name}!</p>
            </div>
            
            <div class="content">
                <div class="booking-card">
                    <div class="car-info">
                        <div class="car-image">
                            🚗 Car
                        </div>
                        <div class="car-details">
                            <h3>${carName}</h3>
                            <p>${booking.car.agency.name} • ${booking.car.category.toUpperCase()}</p>
                        </div>
                        <span class="status-badge status-confirmed">Confirmed</span>
                    </div>
                    
                    <div class="booking-details">
                        <div class="detail-item">
                            <div class="detail-label">📅 Pickup Date</div>
                            <div class="detail-value">${pickupDate}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">📅 Return Date</div>
                            <div class="detail-value">${returnDate}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">📍 Pickup Location</div>
                            <div class="detail-value">${booking.pickupLocation}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">🆔 Booking ID</div>
                            <div class="detail-value">${bookingId}</div>
                        </div>
                    </div>
                </div>
                
                <div class="total-section">
                    <div class="total-amount">${booking.totalAmount} MAD</div>
                    <p class="total-label">Total Amount</p>
                </div>
                
                <div class="next-steps">
                    <h4>📋 What's Next?</h4>
                    <ul>
                        <li>Bring a valid driver's license and credit card</li>
                        <li>Arrive 15 minutes early for pickup</li>
                        <li>Present this confirmation email or booking ID</li>
                        <li>Inspect the vehicle before driving</li>
                    </ul>
                </div>
                
                <div class="contact-info">
                    <h4>Need Help?</h4>
                    <p><strong>📞 Phone:</strong> +212 6 00 00 00 00</p>
                    <p><strong>✉️ Email:</strong> support@venboo.com</p>
                    <p><strong>🕒 Available:</strong> 24/7</p>
                </div>
            </div>
            
            <div class="footer">
                <p>© 2024 CarRental Morocco. All rights reserved.</p>
                <p>
                    <a href="#">View Booking Online</a> | 
                    <a href="#">Modify Booking</a> | 
                    <a href="#">Contact Support</a>
                </p>
            </div>
        </div>
    </body>
    </html>
  `;

  const text = `
    Booking Confirmation - ${carName}
    
    Dear ${user.name},
    
    Great news! Your car rental booking has been confirmed.
    
    BOOKING DETAILS:
    - Booking ID: ${bookingId}
    - Car: ${carName}
    - Agency: ${booking.car.agency.name}
    - Pickup: ${pickupDate}
    - Return: ${returnDate}
    - Location: ${booking.pickupLocation}
    - Total: ${booking.totalAmount} MAD
    
    WHAT'S NEXT:
    - Bring a valid driver's license and credit card
    - Arrive 15 minutes early for pickup
    - Present this confirmation or booking ID: ${bookingId}
    - Inspect the vehicle before driving
    
    NEED HELP?
    Phone: +212 6 00 00 00 00
    Email: support@venboo.com
    Available: 24/7
    
    Thank you for choosing Venboo!
    
    Best regards,
    The Venboo Team
  `;

  return {
    to: user.email,
    subject,
    html,
    text
  };
}

// Generate booking cancellation email
export function generateBookingCancellationEmail(
  booking: Booking,
  user: User
): EmailTemplate {
  const bookingId = `CR-${booking.id.slice(-8)}`;
  const carName = `${booking.car.make} ${booking.car.model} ${booking.car.year}`;

  const subject = `Booking Cancelled - ${carName} (${bookingId})`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; background-color: #f5f5f5; }
            .container { background-color: white; margin: 20px; padding: 0; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 30px 40px; border-radius: 10px 10px 0 0; text-align: center; }
            .content { padding: 40px; text-align: center; }
            .refund-info { background-color: #ecfccb; border: 1px solid #bef264; border-radius: 8px; padding: 20px; margin: 25px 0; }
            .footer { background-color: #f8fafc; padding: 20px 40px; border-radius: 0 0 10px 10px; text-align: center; color: #6b7280; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>❌ Booking Cancelled</h1>
                <p>Your booking has been successfully cancelled</p>
            </div>
            
            <div class="content">
                <p>Dear ${user.name},</p>
                <p>We've processed your cancellation request for booking <strong>${bookingId}</strong>.</p>
                <p><strong>Cancelled Car:</strong> ${carName}</p>
                
                <div class="refund-info">
                    <h4>💰 Refund Information</h4>
                    <p>If you paid online, your refund of <strong>${booking.totalAmount} MAD</strong> will be processed within 3-5 business days.</p>
                </div>
                
                <p>We're sorry to see your travel plans change. We hope to serve you again in the future!</p>
            </div>
            
            <div class="footer">
                <p>© 2024 CarRental Morocco. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;

  const text = `
    Booking Cancelled - ${carName}
    
    Dear ${user.name},
    
    We've processed your cancellation request for booking ${bookingId}.
    
    Cancelled Car: ${carName}
    Original Amount: ${booking.totalAmount} MAD
    
    REFUND: If you paid online, your refund will be processed within 3-5 business days.
    
    We're sorry to see your travel plans change. We hope to serve you again in the future!
    
    Best regards,
    The Venboo Team
  `;

  return {
    to: user.email,
    subject,
    html,
    text
  };
}

// Send booking confirmation notification
export async function sendBookingConfirmation(booking: Booking, user: User): Promise<boolean> {
  try {
    const template = generateBookingConfirmationEmail(booking, user);
    return await sendEmail(template);
  } catch (error) {
    console.error('Send booking confirmation error:', error);
    return false;
  }
}

// Send booking cancellation notification
export async function sendBookingCancellation(booking: Booking, user: User): Promise<boolean> {
  try {
    const template = generateBookingCancellationEmail(booking, user);
    return await sendEmail(template);
  } catch (error) {
    console.error('Send booking cancellation error:', error);
    return false;
  }
}

// Send agency notification about new booking
export async function sendAgencyBookingNotification(booking: Booking, agencyEmail: string): Promise<boolean> {
  try {
    const bookingId = `CR-${booking.id.slice(-8)}`;
    const carName = `${booking.car.make} ${booking.car.model} ${booking.car.year}`;
    const customerName = typeof booking.contactDetails === 'string' 
      ? JSON.parse(booking.contactDetails).name 
      : booking.contactDetails.name;

    const template: EmailTemplate = {
      to: agencyEmail,
      subject: `New Booking Alert - ${carName} (${bookingId})`,
      html: `
        <h2>🚗 New Booking Received!</h2>
        <p><strong>Booking ID:</strong> ${bookingId}</p>
        <p><strong>Car:</strong> ${carName}</p>
        <p><strong>Customer:</strong> ${customerName}</p>
        <p><strong>Pickup:</strong> ${new Date(booking.pickupDate).toLocaleDateString()}</p>
        <p><strong>Return:</strong> ${new Date(booking.returnDate).toLocaleDateString()}</p>
        <p><strong>Amount:</strong> ${booking.totalAmount} MAD</p>
        
        <p>Please log in to your agency dashboard to manage this booking.</p>
      `,
      text: `New Booking: ${carName} for ${customerName}. Booking ID: ${bookingId}. Amount: ${booking.totalAmount} MAD.`
    };

    return await sendEmail(template);
  } catch (error) {
    console.error('Send agency notification error:', error);
    return false;
  }
}

const notificationService = {
  sendEmail,
  generateBookingConfirmationEmail,
  generateBookingCancellationEmail,
  sendBookingConfirmation,
  sendBookingCancellation,
  sendAgencyBookingNotification
};

export default notificationService;
