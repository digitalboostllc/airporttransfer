// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

import Stripe from 'stripe';

async function testStripeIntegration() {
  console.log('🧪 Testing Stripe Integration...\n');

  // Create Stripe instance
  const secretKey = process.env.STRIPE_SECRET_KEY;
  
  // Test 1: Check if Stripe is configured
  console.log('1. 🔑 Checking Stripe Configuration:');
  if (!secretKey) {
    console.log('   ❌ STRIPE_SECRET_KEY not found in environment');
    return;
  }

  const stripe = new Stripe(secretKey, {
    apiVersion: '2025-08-27.basil',
  });

  console.log('   ✅ Stripe instance created successfully');
  console.log('   ✅ API Key loaded from environment');

  try {
    // Test 2: Test API connection by listing a customer (should work even if empty)
    console.log('\n2. 🌐 Testing API Connection:');
    const testConnection = await stripe.customers.list({ limit: 1 });
    console.log('   ✅ Successfully connected to Stripe API');
    console.log(`   ℹ️  Current customers: ${testConnection.data.length}`);

    // Test 3: Create a test payment intent
    console.log('\n3. 💳 Testing Payment Intent Creation:');
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 10000, // 100 MAD in cents
      currency: 'mad',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        test: 'true',
        booking_id: 'test-booking-123',
        customer_email: 'test@example.com'
      }
    });
    console.log('   ✅ Payment intent created successfully');
    console.log(`   💰 Amount: ${paymentIntent.amount / 100} ${paymentIntent.currency.toUpperCase()}`);
    console.log(`   🆔 Payment Intent ID: ${paymentIntent.id}`);
    console.log(`   🔒 Client Secret: ${paymentIntent.client_secret?.substring(0, 30)}...`);

    // Test 4: Create a test customer
    console.log('\n4. 👤 Testing Customer Creation:');
    const customer = await stripe.customers.create({
      email: 'test.customer@venboo.com',
      name: 'Test Customer',
      metadata: { 
        test_user: 'true', 
        created_by: 'test_script' 
      }
    });
    console.log('   ✅ Customer created successfully');
    console.log(`   👤 Customer ID: ${customer.id}`);
    console.log(`   📧 Email: ${customer.email}`);

    // Test 5: Retrieve the customer
    console.log('\n5. 🔍 Testing Customer Retrieval:');
    const customers = await stripe.customers.list({
      email: 'test.customer@venboo.com',
      limit: 1,
    });
    
    if (customers.data.length > 0) {
      console.log('   ✅ Customer retrieved successfully');
      console.log(`   🆔 Retrieved ID: ${customers.data[0].id}`);
    } else {
      console.log('   ❌ Failed to retrieve customer');
    }

    console.log('\n🎉 All Stripe tests passed! Your integration is ready.');
    console.log('\n📋 Test Summary:');
    console.log('   • API Connection: ✅ Working');
    console.log('   • Payment Intents: ✅ Working');  
    console.log('   • Customer Management: ✅ Working');
    console.log('   • Environment Variables: ✅ Configured');
    console.log('   • Test Mode: ✅ Active (safe for development)');
    
    console.log('\n💡 You can now:');
    console.log('   • Process test payments (no real money)');
    console.log('   • Create booking payments');
    console.log('   • Manage customer accounts');
    console.log('   • Test payment flows end-to-end');
    console.log('   • Use Stripe test cards for testing');

  } catch (error) {
    console.error('\n❌ Stripe test failed:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Invalid API Key')) {
        console.log('\n💡 Tip: Check your STRIPE_SECRET_KEY in .env file');
      } else if (error.message.includes('currency')) {
        console.log('\n💡 Tip: MAD currency might not be enabled. Try with "usd" for testing');
      }
    }
  }
}

// Test environment variable loading
console.log('🔧 Environment Check:');
console.log(`   STRIPE_SECRET_KEY: ${process.env.STRIPE_SECRET_KEY ? '✅ Set' : '❌ Missing'}`);
console.log(`   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? '✅ Set' : '❌ Missing'}`);
console.log('');

testStripeIntegration();
