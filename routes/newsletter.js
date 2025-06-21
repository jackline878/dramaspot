// routes/newsletter.js
const express = require('express');
const router = express.Router();
const { Subscriber } = require('../models');

router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: 'Email is required' });

    const [subscriber, created] = await Subscriber.findOrCreate({
      where: { email },
      defaults: { is_verified: false }
    });

    if (!created) {
      return res.status(200).json({ message: 'Already subscribed' });
    }

    // (Optional) Send verification or welcome email here

    res.status(201).json({ message: 'Subscribed successfully', subscriber });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
