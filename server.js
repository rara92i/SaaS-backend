require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(cors({
  origin: 'https://winrate-simulator.netlify.app',
}));
app.use(express.json());

const port = process.env.PORT || 4242;
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
      success_url: process.env.REACT_APP_SUCCESS_URL,
      cancel_url: process.env.REACT_APP_CANCEL_URL,
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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})