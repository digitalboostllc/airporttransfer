import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/notifications';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // Always return success for security (don't reveal if email exists)
    if (!user) {
      return NextResponse.json({ 
        success: true, 
        message: 'If an account with that email exists, you will receive a password reset link.' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Save reset token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    });

    // Send reset email
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    const emailTemplate = {
      to: user.email,
      subject: 'Reset Your Venboo Password',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Reset Your Password</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              Hello ${user.fullName},
            </p>
            
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              You requested to reset your password for your Venboo account. Click the button below to create a new password:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666; line-height: 1.6;">
              This link will expire in 24 hours for security reasons.
            </p>
            
            <p style="font-size: 14px; color: #666; line-height: 1.6;">
              If you didn't request this password reset, please ignore this email or contact our support team.
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="font-size: 12px; color: #999; text-align: center;">
                Best regards,<br>
                The Venboo Team<br>
                <a href="mailto:support@venboo.com" style="color: #ff6b6b;">support@venboo.com</a>
              </p>
            </div>
          </div>
        </div>
      `,
      text: `
        Hello ${user.fullName},

        You requested to reset your password for your Venboo account. 

        Click this link to create a new password: ${resetUrl}

        This link will expire in 24 hours for security reasons.

        If you didn't request this password reset, please ignore this email.

        Best regards,
        The Venboo Team
        support@venboo.com
      `
    };

    await sendEmail(emailTemplate);

    return NextResponse.json({ 
      success: true, 
      message: 'If an account with that email exists, you will receive a password reset link.' 
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}
