import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getEmailService, EmailTemplateBuilder } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { testType, recipientEmail } = await request.json();

    if (!testType || !recipientEmail) {
      return NextResponse.json({ error: 'testType and recipientEmail are required' }, { status: 400 });
    }

    const emailService = getEmailService();

    let emailTemplate;

    switch (testType) {
      case 'connection':
        // Test email service connection
        const isConnected = await emailService.verifyConnection();
        return NextResponse.json({ 
          success: isConnected,
          message: isConnected ? 'Email service connection successful' : 'Email service connection failed'
        });

      case 'simple':
        emailTemplate = {
          to: recipientEmail,
          subject: 'Venboo Email Test - Simple',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #ff6b6b;">📧 Email Test Successful!</h1>
              <p>This is a simple test email from your Venboo application.</p>
              <p>If you're reading this, your email configuration is working correctly!</p>
              <hr>
              <p style="color: #666; font-size: 12px;">
                Sent at: ${new Date().toISOString()}<br>
                From: Venboo Email Service
              </p>
            </div>
          `,
          text: `
            Email Test Successful!
            
            This is a simple test email from your Venboo application.
            If you're reading this, your email configuration is working correctly!
            
            Sent at: ${new Date().toISOString()}
            From: Venboo Email Service
          `
        };
        break;

      case 'booking':
        emailTemplate = {
          to: recipientEmail,
          subject: 'Venboo Email Test - Booking Template',
          html: `
            ${EmailTemplateBuilder.getHeader('🎉 Test Booking Confirmed')}
            ${EmailTemplateBuilder.wrapContent(`
              <p style="font-size: 16px; color: #333; line-height: 1.6;">
                Hello Test User,
              </p>
              
              <p style="font-size: 16px; color: #333; line-height: 1.6;">
                This is a <strong>test booking confirmation email</strong> to verify your email templates are working correctly.
              </p>
              
              <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #16a34a; margin-top: 0;">✅ Test Booking Details</h3>
                <p><strong>Reference:</strong> TEST-${Date.now()}</p>
                <p><strong>Car:</strong> Tesla Model 3 2024</p>
                <p><strong>Agency:</strong> Test Car Rental</p>
                <p><strong>Total:</strong> 500 MAD</p>
                <p><strong>Status:</strong> <span style="color: #16a34a; font-weight: bold;">CONFIRMED</span></p>
              </div>
              
              <div style="background: #dbeafe; border: 1px solid #93c5fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1d4ed8; margin-top: 0;">🧪 This is a Test</h3>
                <p style="color: #1e40af; margin: 0;">
                  This email template test was triggered by an administrator.
                  Your email configuration is working correctly!
                </p>
              </div>
            `)}
          `,
          text: `
            Test Booking Confirmed
            
            Hello Test User,
            
            This is a test booking confirmation email to verify your email templates are working correctly.
            
            Test Booking Details:
            - Reference: TEST-${Date.now()}
            - Car: Tesla Model 3 2024
            - Agency: Test Car Rental
            - Total: 500 MAD
            - Status: CONFIRMED
            
            This is a Test:
            This email template test was triggered by an administrator.
            Your email configuration is working correctly!
            
            Best regards,
            The Venboo Team
            support@venboo.com
          `
        };
        break;

      case 'all':
        // Send multiple test emails
        const testEmails = [
          {
            to: recipientEmail,
            subject: 'Venboo Email Test 1/3 - Connection Test',
            html: `<h1>✅ Test 1: Connection Successful</h1><p>Your email service is connected and working.</p>`,
            text: 'Test 1: Connection Successful. Your email service is connected and working.'
          },
          {
            to: recipientEmail,
            subject: 'Venboo Email Test 2/3 - Template Test',
            html: EmailTemplateBuilder.wrapContent(`<h2>🎨 Test 2: Template System</h2><p>Your HTML email templates are rendering correctly.</p>`),
            text: 'Test 2: Template System. Your HTML email templates are rendering correctly.'
          },
          {
            to: recipientEmail,
            subject: 'Venboo Email Test 3/3 - Bulk Email Test',
            html: `<h1>📧 Test 3: Bulk Email</h1><p>Your email service can send multiple emails. Test completed successfully!</p>`,
            text: 'Test 3: Bulk Email. Your email service can send multiple emails. Test completed successfully!'
          }
        ];

        const bulkResult = await emailService.sendBulkEmails(testEmails);
        
        return NextResponse.json({
          success: bulkResult.success,
          message: `Bulk email test completed. ${bulkResult.results.filter(r => r.success).length}/${bulkResult.results.length} emails sent successfully.`,
          details: bulkResult.results
        });

      default:
        return NextResponse.json({ error: 'Invalid testType. Use: connection, simple, booking, or all' }, { status: 400 });
    }

    // Send single test email
    const result = await emailService.sendEmail(emailTemplate);

    return NextResponse.json({
      success: result.success,
      message: result.success 
        ? `Test email sent successfully to ${recipientEmail}` 
        : `Failed to send test email: ${result.error}`,
      messageId: result.messageId,
      error: result.error
    });

  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send test email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
