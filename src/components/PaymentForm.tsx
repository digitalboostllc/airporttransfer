'use client';

import React, { useState, useEffect } from 'react';
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import { formatPrice } from '@/lib/stripe';

// Load Stripe outside of component to avoid recreating on every render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentFormProps {
  clientSecret: string;
  amount: number;
  currency?: string;
  bookingReference: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

interface CheckoutFormProps {
  amount: number;
  currency?: string;
  bookingReference: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

function CheckoutForm({ amount, currency = 'MAD', bookingReference, onSuccess, onError }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!stripe) return;

    const clientSecret = new URLSearchParams(window.location.search).get(
      'payment_intent_client_secret'
    );

    if (!clientSecret) return;

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent?.status) {
        case 'succeeded':
          setMessage('Payment succeeded!');
          onSuccess();
          break;
        case 'processing':
          setMessage('Your payment is processing.');
          break;
        case 'requires_payment_method':
          setMessage('Your payment was not successful, please try again.');
          break;
        default:
          setMessage('Something went wrong.');
          break;
      }
    });
  }, [stripe, onSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/booking/success?booking=${bookingReference}`,
      },
      redirect: 'if_required',
    });

    if (error) {
      if (error.type === 'card_error' || error.type === 'validation_error') {
        setMessage(error.message || 'An error occurred');
        onError(error.message || 'Payment failed');
      } else {
        setMessage('An unexpected error occurred');
        onError('An unexpected error occurred');
      }
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      setMessage('Payment succeeded!');
      onSuccess();
    }

    setIsLoading(false);
  };

  const paymentElementOptions = {
    layout: 'tabs' as const,
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        {/* Payment Header */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
            <CreditCard className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Secure Payment</h3>
            <p className="text-sm text-gray-600">{formatPrice(amount, currency)}</p>
          </div>
        </div>

        {/* Security Badge */}
        <div className="flex items-center justify-center mb-4 p-3 bg-gray-50 rounded-lg">
          <Lock className="w-4 h-4 text-gray-500 mr-2" />
          <span className="text-sm text-gray-600">
            Your payment is secured by Stripe
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <PaymentElement 
              options={paymentElementOptions}
              onReady={() => setIsComplete(true)}
            />
          </div>

          {message && (
            <div className={`flex items-center p-3 rounded-lg mb-4 ${
              message.includes('succeeded') 
                ? 'bg-green-50 text-green-700' 
                : 'bg-red-50 text-red-700'
            }`}>
              {message.includes('succeeded') ? (
                <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              )}
              <span className="text-sm">{message}</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={!stripe || !elements || isLoading}
            className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Processing Payment...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Lock className="w-4 h-4 mr-2" />
                Pay {formatPrice(amount, currency)}
              </div>
            )}
          </Button>
        </form>

        {/* Payment Security Info */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Powered by Stripe • SSL Encrypted • PCI Compliant
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentForm({ 
  clientSecret, 
  amount, 
  currency = 'MAD', 
  bookingReference, 
  onSuccess, 
  onError 
}: PaymentFormProps) {
  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#16a34a',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#dc2626',
        fontFamily: 'Inter, system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
  };

  return (
    <Elements options={options} stripe={stripePromise}>
      <CheckoutForm
        amount={amount}
        currency={currency}
        bookingReference={bookingReference}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  );
}
