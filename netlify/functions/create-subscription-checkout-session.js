require('dotenv').config();
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const YOUR_DOMAIN = 'https://winrate-simulator.netlify.app';

app.use(cors({
  origin: YOUR_DOMAIN,
}));
app.use(express.json());

const stripeSession = async (priceId) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${YOUR_DOMAIN}/success`,
      cancel_url: `${YOUR_DOMAIN}/canceled`,
    });
    return session;
  } catch (e) {
    throw new Error(e.message);
  }
};

app.post('/create-subscription-checkout-session', async (req, res) => {
  try {
    const { plan } = req.body;
    const session = await stripeSession(plan);
    res.send({ session });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

module.exports.handler = serverless(app);
