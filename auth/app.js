require('dotenv').config();

console.log("Auth-service is gestart!");

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3020;

// Middleware
app.use(express.json());

// ⬇️ Hier koppel je de routes
const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

// Test endpoint
app.get('/', (req, res) => {
  res.send('Auth-service is live!');
});

// MongoDB connectie
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Verbonden met MongoDB'))
.catch((err) => {
  console.error('❌ Fout bij verbinden met MongoDB:', err);
  process.exit(1);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Auth-service draait op poort ${PORT}`);
});
