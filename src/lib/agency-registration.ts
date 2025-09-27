import { PrismaClient } from '@prisma/client';
import { sendEmail } from './notifications';

const prisma = new PrismaClient();

export interface AgencyRegistrationData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  licenseNumber?: string;
  description?: string;
  websiteUrl?: string;
}

export interface AgencyApprovalEmailData {
  agencyName: string;
  contactEmail: string;
  contactName: string;
  reason?: string;
}

// Create agency during user registration
export async function createPendingAgency(
  userId: string, 
  agencyData: AgencyRegistrationData
): Promise<{ success: boolean; agencyId?: string; error?: string }> {
  try {
    // Generate slug from agency name
    const slug = agencyData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    // Check if slug already exists
    const existingAgency = await prisma.agency.findUnique({
      where: { slug }
    });

    if (existingAgency) {
      return { success: false, error: 'Agency name already taken' };
    }

    // Create the agency
    const agency = await prisma.agency.create({
      data: {
        name: agencyData.name,
        slug,
        email: agencyData.email,
        phone: agencyData.phone,
        address: agencyData.address,
        city: agencyData.city,
        licenseNumber: agencyData.licenseNumber,
        description: agencyData.description,
        websiteUrl: agencyData.websiteUrl,
        status: 'pending'
      }
    });

    // Link user to agency
    await prisma.user.update({
      where: { id: userId },
      data: { 
        agencyId: agency.id,
        role: 'agency_owner'
      }
    });

    // Send admin notification about new agency registration
    await sendAgencyRegistrationNotification(agency.id, agencyData);

    return { success: true, agencyId: agency.id };
  } catch (error) {
    console.error('Create pending agency error:', error);
    return { success: false, error: 'Failed to register agency' };
  }
}

// Send admin notification about new agency registration
export async function sendAgencyRegistrationNotification(
  agencyId: string,
  agencyData: AgencyRegistrationData
): Promise<boolean> {
  try {
    const template = {
      to: 'admin@carrental.ma', // Replace with actual admin email
      subject: `New Agency Registration - ${agencyData.name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>New Agency Registration</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
                .header { background: linear-gradient(135deg, #7c3aed, #3b82f6); color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background: white; }
                .agency-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
                .action-button { background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 5px; }
                .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
                .info-item { margin: 10px 0; }
                .label { font-weight: bold; color: #4a5568; }
                .value { color: #2d3748; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🏢 New Agency Registration</h1>
                <p>A new agency has registered and is awaiting approval</p>
            </div>
            
            <div class="content">
                <div class="agency-card">
                    <h2>${agencyData.name}</h2>
                    
                    <div class="info-grid">
                        <div class="info-item">
                            <div class="label">📧 Email</div>
                            <div class="value">${agencyData.email}</div>
                        </div>
                        <div class="info-item">
                            <div class="label">📞 Phone</div>
                            <div class="value">${agencyData.phone}</div>
                        </div>
                        <div class="info-item">
                            <div class="label">📍 Address</div>
                            <div class="value">${agencyData.address}, ${agencyData.city}</div>
                        </div>
                        ${agencyData.licenseNumber ? `
                        <div class="info-item">
                            <div class="label">🆔 License</div>
                            <div class="value">${agencyData.licenseNumber}</div>
                        </div>
                        ` : ''}
                        ${agencyData.websiteUrl ? `
                        <div class="info-item">
                            <div class="label">🌐 Website</div>
                            <div class="value">${agencyData.websiteUrl}</div>
                        </div>
                        ` : ''}
                    </div>
                    
                    ${agencyData.description ? `
                    <div class="info-item">
                        <div class="label">📝 Description</div>
                        <div class="value">${agencyData.description}</div>
                    </div>
                    ` : ''}
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <h3>Action Required</h3>
                    <p>Please review this agency registration and take appropriate action:</p>
                    
                    <a href="http://localhost:3000/admin/dashboard" class="action-button">
                        🔍 Review in Admin Panel
                    </a>
                </div>
                
                <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 20px 0;">
                    <strong>⚠️ Note:</strong> New agencies cannot add cars or receive bookings until approved.
                </div>
            </div>
        </body>
        </html>
      `,
      text: `
        New Agency Registration: ${agencyData.name}
        
        Contact: ${agencyData.email}
        Phone: ${agencyData.phone}
        Address: ${agencyData.address}, ${agencyData.city}
        ${agencyData.licenseNumber ? `License: ${agencyData.licenseNumber}` : ''}
        ${agencyData.websiteUrl ? `Website: ${agencyData.websiteUrl}` : ''}
        
        Please review this registration in the admin panel: http://localhost:3000/admin/dashboard
      `
    };

    return await sendEmail(template);
  } catch (error) {
    console.error('Send agency registration notification error:', error);
    return false;
  }
}

// Send agency approval email
export async function sendAgencyApprovalEmail(approvalData: AgencyApprovalEmailData): Promise<boolean> {
  try {
    const template = {
      to: approvalData.contactEmail,
      subject: `🎉 Agency Approved - ${approvalData.agencyName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Agency Approved</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
                .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; }
                .content { padding: 30px; background: white; }
                .success-card { background: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
                .action-button { background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px; }
                .steps { background: #f0f9ff; border-radius: 8px; padding: 20px; margin: 20px 0; }
                .step { margin: 10px 0; padding: 5px 0; border-left: 3px solid #3b82f6; padding-left: 15px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🎉 Congratulations!</h1>
                <h2>Your Agency Has Been Approved</h2>
            </div>
            
            <div class="content">
                <div class="success-card">
                    <h2>Welcome to CarRental, ${approvalData.agencyName}!</h2>
                    <p>Your agency registration has been approved and you can now start adding cars and receiving bookings.</p>
                </div>
                
                <div class="steps">
                    <h3>🚀 Next Steps:</h3>
                    <div class="step">1️⃣ <strong>Add Your Cars:</strong> Upload your vehicle fleet to start receiving bookings</div>
                    <div class="step">2️⃣ <strong>Set Up Pricing:</strong> Configure your rental rates and policies</div>
                    <div class="step">3️⃣ <strong>Manage Bookings:</strong> Handle customer inquiries and confirmations</div>
                    <div class="step">4️⃣ <strong>Track Performance:</strong> Monitor your earnings and analytics</div>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="http://localhost:3000/agency/dashboard" class="action-button">
                        🏢 Access Agency Dashboard
                    </a>
                </div>
                
                <div style="background: #dbeafe; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <h4>📞 Need Help?</h4>
                    <p>Our support team is here to help you get started:</p>
                    <p><strong>Email:</strong> support@carrental.ma</p>
                    <p><strong>Phone:</strong> +212 6 00 00 00 00</p>
                    <p><strong>Hours:</strong> Monday-Friday, 9 AM - 6 PM</p>
                </div>
            </div>
        </body>
        </html>
      `,
      text: `
        Congratulations! Your Agency Has Been Approved
        
        Welcome to CarRental, ${approvalData.agencyName}!
        
        Your agency registration has been approved and you can now start adding cars and receiving bookings.
        
        Next Steps:
        1. Add Your Cars - Upload your vehicle fleet
        2. Set Up Pricing - Configure rental rates
        3. Manage Bookings - Handle customer inquiries
        4. Track Performance - Monitor earnings
        
        Access your dashboard: http://localhost:3000/agency/dashboard
        
        Need help? Contact support@carrental.ma or +212 6 00 00 00 00
      `
    };

    return await sendEmail(template);
  } catch (error) {
    console.error('Send agency approval email error:', error);
    return false;
  }
}

// Send agency rejection email
export async function sendAgencyRejectionEmail(
  rejectionData: AgencyApprovalEmailData
): Promise<boolean> {
  try {
    const template = {
      to: rejectionData.contactEmail,
      subject: `Agency Registration Update - ${rejectionData.agencyName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Agency Registration Update</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
                .header { background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 30px; text-align: center; }
                .content { padding: 30px; background: white; }
                .rejection-card { background: #fef2f2; border: 1px solid #f87171; border-radius: 8px; padding: 20px; margin: 20px 0; }
                .action-button { background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Agency Registration Update</h1>
                <h2>${rejectionData.agencyName}</h2>
            </div>
            
            <div class="content">
                <div class="rejection-card">
                    <h3>Registration Status Update</h3>
                    <p>We regret to inform you that your agency registration could not be approved at this time.</p>
                    
                    ${rejectionData.reason ? `
                    <div style="background: white; border-radius: 6px; padding: 15px; margin: 15px 0;">
                        <strong>Reason:</strong><br>
                        ${rejectionData.reason}
                    </div>
                    ` : ''}
                </div>
                
                <div style="background: #e0f2fe; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <h4>📝 What's Next?</h4>
                    <p>If you believe this decision was made in error or if you've addressed the concerns mentioned, you're welcome to:</p>
                    <ul>
                        <li>Contact our support team for clarification</li>
                        <li>Submit a new registration with updated information</li>
                        <li>Provide additional documentation if required</li>
                    </ul>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="http://localhost:3000/register?type=agency" class="action-button">
                        📝 Register Again
                    </a>
                </div>
                
                <div style="background: #dbeafe; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <h4>📞 Contact Support</h4>
                    <p><strong>Email:</strong> support@carrental.ma</p>
                    <p><strong>Phone:</strong> +212 6 00 00 00 00</p>
                    <p><strong>Hours:</strong> Monday-Friday, 9 AM - 6 PM</p>
                </div>
            </div>
        </body>
        </html>
      `,
      text: `
        Agency Registration Update - ${rejectionData.agencyName}
        
        We regret to inform you that your agency registration could not be approved at this time.
        
        ${rejectionData.reason ? `Reason: ${rejectionData.reason}` : ''}
        
        If you believe this was an error or have addressed the concerns, you can:
        - Contact support at support@carrental.ma
        - Submit a new registration
        - Provide additional documentation
        
        Register again: http://localhost:3000/register?type=agency
      `
    };

    return await sendEmail(template);
  } catch (error) {
    console.error('Send agency rejection email error:', error);
    return false;
  }
}

const agencyRegistrationService = {
  createPendingAgency,
  sendAgencyRegistrationNotification,
  sendAgencyApprovalEmail,
  sendAgencyRejectionEmail
};

export default agencyRegistrationService;
