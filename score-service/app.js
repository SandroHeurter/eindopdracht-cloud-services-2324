require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const scoreRoutes = require('./routes/score.routes');

const app = express();

app.use(express.json());

// MongoDB connectie
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Verbonden met MongoDB (score-service)'))
  .catch(err => console.error('❌ MongoDB fout:', err));

// Routes
app.use('/api/score', scoreRoutes);

// Fallback route
app.use((req, res) => {
  res.status(404).send('Not found');
});

// Server starten
const port = process.env.PORT || 3020;
app.listen(port, () => {
  console.log(`🚀 Score-service draait op poort ${port}`);
});
