'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { CreditCard, Lock, Check, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentData {
  amount: number;
  currency: string;
  description: string;
  metadata: Record<string, string>;
}

interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret: string;
}

// Props for new transfer booking flow
interface TransferPaymentProps {
  paymentData: PaymentData;
  onSuccess: (paymentIntent: PaymentIntent) => void;
  onError: (error: string) => void;
  className?: string;
  disabled?: boolean;
}

// Props for existing car booking flow  
interface CarPaymentProps {
  clientSecret: string;
  amount: number;
  currency: string;
  bookingReference: string;
  onSuccess: () => Promise<void>;
  onError: (error: string) => void;
  className?: string;
  disabled?: boolean;
}

// Union type for all payment form props
type PaymentFormProps = TransferPaymentProps | CarPaymentProps;

// Type guard functions
const isTransferPayment = (props: PaymentFormProps): props is TransferPaymentProps => {
  return 'paymentData' in props;
};

const isCarPayment = (props: PaymentFormProps): props is CarPaymentProps => {
  return 'clientSecret' in props;
};

const CheckoutForm: React.FC<PaymentFormProps> = (props) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extract common props
  const { onSuccess, onError, disabled = false } = props;
  
  // Determine payment type and extract specific props
  const isTransfer = isTransferPayment(props);
  const isCar = isCarPayment(props);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || isProcessing || disabled) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      let clientSecret: string;
      
      if (isTransfer) {
        // Create payment intent for transfer booking
        const response = await fetch('/api/payments/create-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(props.paymentData),
        });

        if (!response.ok) {
          throw new Error('Failed to create payment intent');
        }

        const data = await response.json();
        clientSecret = data.clientSecret;
      } else if (isCar) {
        // Use existing client secret for car booking
        clientSecret = props.clientSecret;
      } else {
        throw new Error('Invalid payment configuration');
      }

      // Confirm payment with Stripe
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      });

      if (result.error) {
        setError(result.error.message || 'Payment failed');
        onError(result.error.message || 'Payment failed');
      } else {
        // Payment succeeded - handle based on payment type
        if (isTransfer) {
          (onSuccess as TransferPaymentProps['onSuccess'])(result.paymentIntent as PaymentIntent);
        } else if (isCar) {
          await (onSuccess as CarPaymentProps['onSuccess'])();
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '14px',
        color: '#1f2937',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        '::placeholder': {
          color: '#9ca3af',
        },
        iconColor: '#6b7280',
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444',
      },
    },
    hidePostalCode: false,
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Payment Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
          <Lock className="w-4 h-4 text-green-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-800">Secure Payment</h3>
          <p className="text-xs text-gray-600">Your payment information is encrypted and secure</p>
        </div>
      </div>

      {/* Payment Amount */}
      <div className="bg-gray-50 rounded-lg p-3 text-center">
        <p className="text-xs text-gray-600 mb-1">Total Amount</p>
        <p className="text-lg font-bold text-gray-800">
          {isTransfer && `${props.paymentData.amount.toFixed(2)} ${props.paymentData.currency.toUpperCase()}`}
          {isCar && `${props.amount.toFixed(2)} ${props.currency.toUpperCase()}`}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {isTransfer && props.paymentData.description}
          {isCar && `Booking Reference: ${props.bookingReference}`}
        </p>
      </div>

      {/* Card Element */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
          <CreditCard className="w-3 h-3" />
          Card Information
        </label>
        <div className={cn(
          "p-3 border border-gray-300 rounded-lg bg-white transition-all duration-200",
          error ? "border-red-500 ring-1 ring-red-500" : "focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500"
        )}>
          <CardElement
            options={cardElementOptions}
            onChange={(event) => {
              setCardComplete(event.complete);
              if (event.error) {
                setError(event.error.message);
              } else {
                setError(null);
              }
            }}
          />
        </div>
        {error && (
          <div className="flex items-center gap-1 text-xs text-red-600">
            <X className="w-3 h-3" />
            {error}
          </div>
        )}
      </div>

      {/* Security Notice */}
      <div className="flex items-center gap-2 text-xs text-gray-600 bg-blue-50 p-2 rounded-lg">
        <Lock className="w-3 h-3 text-blue-600" />
        <span>Secured by Stripe • 256-bit SSL encryption</span>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!stripe || !cardComplete || isProcessing || disabled}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <Lock className="w-4 h-4" />
            {isTransfer && `Pay ${props.paymentData.amount.toFixed(2)} ${props.paymentData.currency.toUpperCase()}`}
            {isCar && `Pay ${props.amount.toFixed(2)} ${props.currency.toUpperCase()}`}
          </>
        )}
      </Button>

      {/* Trust Indicators */}
      <div className="flex items-center justify-center gap-3 text-xs text-gray-500 pt-2">
        <div className="flex items-center gap-1">
          <Check className="w-3 h-3 text-green-500" />
          <span>Instant confirmation</span>
        </div>
        <div className="flex items-center gap-1">
          <Check className="w-3 h-3 text-green-500" />
          <span>Secure payments</span>
        </div>
      </div>
    </form>
  );
};

const PaymentForm: React.FC<PaymentFormProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  );
};

export default PaymentForm;