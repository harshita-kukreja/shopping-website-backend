const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/orders
router.post('/', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { items } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'No items in order' });
  }

  try {
    const client = await pool.connect();
    await client.query('BEGIN');

    const totalPrice = items.reduce((sum, item) => {
      return sum + item.quantity * item.price_each;
    }, 0);

    const orderResult = await client.query(
      'INSERT INTO orders (user_id, total_price, status, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id',
      [userId, totalPrice, 'pending']
    );

    const orderId = orderResult.rows[0].id;

    for (let item of items) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price_each) VALUES ($1, $2, $3, $4)',
        [orderId, item.product_id, item.quantity, item.price_each]
      );
    }

    await client.query('COMMIT');
    client.release();

    res.status(201).json({ message: 'Order placed', order_id: orderId });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Order failed' });
  }
});

// GET /api/orders/my-orders
router.get('/my-orders', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

module.exports = router;
