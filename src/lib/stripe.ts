import Stripe from 'stripe';
import { loadStripe } from '@stripe/stripe-js';

// Server-side Stripe instance
export const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil',
    })
  : null;

// Client-side Stripe instance
export const getStripe = () => {
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined');
  }
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
};

// Payment intent creation
export async function createPaymentIntent(
  amount: number, // in cents (MAD)
  currency: string = 'mad',
  metadata: Record<string, string> = {}
): Promise<Stripe.PaymentIntent> {
  if (!stripe) {
    throw new Error('Stripe not configured - STRIPE_SECRET_KEY missing');
  }
  return await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency: currency.toLowerCase(),
    automatic_payment_methods: {
      enabled: true,
    },
    metadata,
  });
}

// Confirm payment intent
export async function confirmPaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  if (!stripe) {
    throw new Error('Stripe not configured - STRIPE_SECRET_KEY missing');
  }
  return await stripe.paymentIntents.retrieve(paymentIntentId);
}

// Create customer
export async function createStripeCustomer(
  email: string,
  name: string,
  metadata: Record<string, string> = {}
): Promise<Stripe.Customer> {
  if (!stripe) {
    throw new Error('Stripe not configured - STRIPE_SECRET_KEY missing');
  }
  return await stripe.customers.create({
    email,
    name,
    metadata,
  });
}

// Get customer by email
export async function getStripeCustomer(email: string): Promise<Stripe.Customer | null> {
  if (!stripe) {
    throw new Error('Stripe not configured - STRIPE_SECRET_KEY missing');
  }
  const customers = await stripe.customers.list({
    email,
    limit: 1,
  });
  
  return customers.data.length > 0 ? customers.data[0] : null;
}

// Calculate platform fee (commission for Venboo)
export function calculatePlatformFee(amount: number, feePercentage: number = 0.05): number {
  return Math.round(amount * feePercentage * 100) / 100; // 5% default commission
}

// Format amount for display (MAD)
export function formatPrice(amount: number, currency: string = 'MAD'): string {
  return new Intl.NumberFormat('en-MA', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}
