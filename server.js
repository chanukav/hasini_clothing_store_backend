require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hasini_clothing_store')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// Basic Route
app.get('/', (req, res) => {
  res.json({ message: 'Hasini Clothing Store Backend API is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
