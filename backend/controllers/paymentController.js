const Stripe = require('stripe');
const Order = require('../models/Order');
const Cart = require('../models/Cart');

// Initialize Stripe. We'll use the secret key from env variables.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const getValidImageUrl = (url) => {
  if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
    return url;
  }
  return '';
};

// Helper function to create order from Stripe Checkout Session metadata
const createOrderFromSession = async (session) => {
  // Check if order with this stripeSessionId already exists (idempotency)
  let order = await Order.findOne({ stripeSessionId: session.id });
  if (order) {
    if (order.paymentStatus !== 'Paid') {
      order.paymentStatus = 'Paid';
      if (session.payment_intent) {
        order.paymentIntentId = typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent.id;
      }
      await order.save();
    }
    return order;
  }

  const {
    userId,
    deliveryCharge,
    fullName,
    mobile,
    street,
    city,
    state,
    pincode,
    itemCount,
  } = session.metadata;

  const items = [];
  const count = parseInt(itemCount, 10) || 0;
  for (let i = 0; i < count; i++) {
    const itemData = JSON.parse(session.metadata[`item_${i}`]);
    items.push({
      foodItemId: itemData.foodItemId,
      name: itemData.name,
      price: itemData.price,
      quantity: itemData.quantity,
      image: itemData.image || undefined,
    });
  }

  // Get total paid amount (session.amount_total is in cents/paise)
  const totalAmount = session.amount_total / 100;

  order = await Order.create({
    userId,
    items,
    totalAmount,
    deliveryCharge: parseFloat(deliveryCharge) || 0,
    address: {
      fullName,
      mobile,
      street,
      city,
      state,
      pincode,
    },
    paymentMethod: 'Stripe',
    paymentStatus: 'Paid',
    stripeSessionId: session.id,
    paymentIntentId: typeof session.payment_intent === 'string'
      ? session.payment_intent
      : (session.payment_intent ? session.payment_intent.id : undefined),
    status: 'Pending',
  });

  // Clear the user's cart
  const cart = await Cart.findOne({ userId });
  if (cart) {
    cart.items = [];
    await cart.save();
  }

  return order;
};

// @desc    Create Stripe Checkout Session
// @route   POST /api/payment/create-checkout-session
// @access  Private
const createCheckoutSession = async (req, res) => {
  try {
    const { items, deliveryCharge, address } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items to check out' });
    }

    if (!address || !address.fullName || !address.mobile || !address.street || !address.city || !address.state || !address.pincode) {
      return res.status(400).json({ success: false, message: 'Please provide complete delivery address' });
    }

    // Construct line items for Stripe Checkout
    const lineItems = items.map((item) => {
      const imgUrl = getValidImageUrl(item.image);
      const productData = {
        name: item.name,
      };
      if (imgUrl) {
        productData.images = [imgUrl];
      }

      return {
        price_data: {
          currency: 'inr',
          product_data: productData,
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      };
    });

    // Add Delivery Fee line item
    const charge = parseFloat(deliveryCharge) || 0;
    if (charge > 0) {
      lineItems.push({
        price_data: {
          currency: 'inr',
          product_data: {
            name: 'Delivery Fee',
          },
          unit_amount: Math.round(charge * 100),
        },
        quantity: 1,
      });
    }

    // Add GST Line Item
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const gst = Math.round(subtotal * 0.05);
    if (gst > 0) {
      lineItems.push({
        price_data: {
          currency: 'inr',
          product_data: {
            name: 'GST & Taxes (5%)',
          },
          unit_amount: Math.round(gst * 100),
        },
        quantity: 1,
      });
    }

    // Dynamic origin for redirects
    const origin = req.headers.origin || 'http://localhost:3000';

    // Prepare metadata
    const metadata = {
      userId: req.user._id.toString(),
      deliveryCharge: charge.toString(),
      fullName: address.fullName,
      mobile: address.mobile,
      street: address.street,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      itemCount: items.length.toString(),
    };

    items.forEach((item, index) => {
      metadata[`item_${index}`] = JSON.stringify({
        foodItemId: item.foodItemId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image || '',
      });
    });

    // Create session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/payment-cancel`,
      metadata,
    });

    return res.status(200).json({ success: true, sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Stripe Payment and Create Order
// @route   POST /api/payment/verify
// @access  Private
const verifyPayment = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'Session ID is required' });
    }

    // Retrieve checkout session from Stripe securely
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return res.status(404).json({ success: false, message: 'Checkout session not found' });
    }

    // Confirm that the payment was successful
    if (session.payment_status === 'paid') {
      const order = await createOrderFromSession(session);
      return res.status(200).json({ success: true, message: 'Payment verified and order created', data: order });
    } else {
      return res.status(400).json({ success: false, message: `Payment not completed. Status: ${session.payment_status}` });
    }
  } catch (error) {
    console.error('Error verifying Stripe payment:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Stripe Webhook handler
// @route   POST /api/payment/webhook
// @access  Public
const handleWebhook = async (req, res) => {
  let event = req.body;
  const signature = req.headers['stripe-signature'];

  if (process.env.STRIPE_WEBHOOK_SECRET && signature) {
    try {
      event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  } else {
    // If no secret configured (local testing), parse from buffer
    if (Buffer.isBuffer(req.body)) {
      try {
        event = JSON.parse(req.body.toString());
      } catch (err) {
        console.error('Failed to parse webhook JSON body:', err.message);
        return res.status(400).send(`Parsing error: ${err.message}`);
      }
    }
  }

  // Handle checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    try {
      // Retrieve full session details including metadata
      const fullSession = await stripe.checkout.sessions.retrieve(session.id);
      if (fullSession.payment_status === 'paid') {
        await createOrderFromSession(fullSession);
        console.log(`Order successfully created for session: ${fullSession.id}`);
      }
    } catch (error) {
      console.error('Error handling webhook checkout.session.completed:', error.message);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  return res.status(200).json({ received: true });
};

module.exports = {
  createCheckoutSession,
  verifyPayment,
  handleWebhook,
};
