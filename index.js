const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');

const app = express(); // 👈 This should come before any `app.use(...)`

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', require('./routes/products'));
app.use('/api/users', require('./routes/users'));
app.use('/api/designers', require('./routes/designers'));
const orderRoutes = require('./routes/orders');
app.use('/api/orders', orderRoutes);

app.get('/', (req, res) => {
  res.send('API is running ✅');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
