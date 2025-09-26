// Client-side agency utilities using API routes

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

// Create pending agency via API
export async function createPendingAgency(
  userId: string, 
  agencyData: AgencyRegistrationData
): Promise<{ success: boolean; agencyId?: string; error?: string }> {
  try {
    const response = await fetch('/api/agencies/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, agencyData }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error || 'Failed to register agency' };
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Agency registration error:', error);
    return { success: false, error: 'Failed to register agency' };
  }
}

