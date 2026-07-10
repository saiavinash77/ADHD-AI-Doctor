import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import DodoPayments from 'dodopayments';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Dodo Payments Initialization - Fail if token not provided
  if (!process.env.DODO_PAYMENTS_TOKEN) {
    console.error('⚠️  CRITICAL: DODO_PAYMENTS_TOKEN must be set in environment variables');
    console.error('Payment endpoints will not work without proper credentials');
  }
  
  console.log('🔑 Initializing Dodo Payments with token:', process.env.DODO_PAYMENTS_TOKEN?.substring(0, 20) + '...');
  
  const dodoClient = new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_TOKEN || '',
    environment: 'test_mode' // Explicitly set test mode
  });

  // Body parser
  app.use(express.json());

  // API Route: Create Dodo Payments Checkout Session
  app.post('/api/create-checkout-session', async (req, res) => {
    try {
      const { priceId, quantity = 1, customerId, successUrl, cancelUrl } = req.body;

      if (!priceId) {
        return res.status(400).json({ error: 'Product ID is required' });
      }

      // Create checkout session using the recommended Checkout Sessions API
      const session = await dodoClient.checkoutSessions.create({
        product_cart: [
          {
            product_id: priceId,
            quantity: quantity
          }
        ],
        customer: customerId ? {
          email: customerId,
          name: customerId.split('@')[0] // Use email prefix as name
        } : undefined,
        return_url: successUrl || `${req.headers.origin || 'http://localhost:3000'}?payment=success`
      });

      res.json({
        sessionId: session.session_id,
        checkoutUrl: session.checkout_url
      });
    } catch (error) {
      console.error('Dodo Payments Checkout Session Creation Failed:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to create checkout session',
        details: error.body || error.response?.data || null
      });
    }
  });

  // API Route: Verify Payment via Webhook
  app.post('/api/webhook/dodo-payments', async (req, res) => {
    try {
      const signature = req.headers['x-dodo-signature'];
      const webhookSecret = process.env.DODO_WEBHOOK_SECRET;

      if (!webhookSecret) {
        console.error('Webhook secret not configured');
        return res.status(500).json({ error: 'Webhook not properly configured' });
      }

      // Verify webhook signature (if applicable)
      // Note: Check Dodo Payments documentation for exact verification method
      
      const event = req.body;

      // Handle different event types
      switch (event.event_type) {
        case 'payment.succeeded':
          console.log('Payment succeeded:', event.payment_id);
          // Update your database here
          break;
        case 'payment.failed':
          console.log('Payment failed:', event.payment_id);
          break;
        case 'subscription.created':
          console.log('Subscription created:', event.subscription_id);
          break;
        case 'subscription.cancelled':
          console.log('Subscription cancelled:', event.subscription_id);
          break;
        default:
          console.log('Unhandled event type:', event.event_type);
      }

      res.json({ status: 'ok', received: true });
    } catch (error) {
      console.error('Webhook processing failed:', error);
      res.status(400).json({ error: 'Webhook processing failed' });
    }
  });

  // API Route: Get Payment Status
  app.get('/api/payment-status/:paymentId', async (req, res) => {
    try {
      const { paymentId } = req.params;
      
      const payment = await dodoClient.payments.retrievePayment(paymentId);
      
      res.json({
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        payment_id: payment.payment_id
      });
    } catch (error) {
      console.error('Failed to retrieve payment status:', error);
      res.status(500).json({ error: 'Failed to retrieve payment status' });
    }
  });

  // Setup Vite middleware or serve static build
  if (process.env.NODE_ENV !== 'production' && process.env.DISABLE_VITE_MIDDLEWARE !== 'true') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    
    // Catch-all to serve index.html for react routes
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server starting on http://0.0.0.0:${PORT}`);
  });
}

startServer();

