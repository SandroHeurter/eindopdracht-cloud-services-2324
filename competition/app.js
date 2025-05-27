require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const submissionRouter = require('./routes/submission.routes');
const path = require('path');
const targetRoutes = require('./routes/target.routes');


const app = express();
const PORT = process.env.PORT || 3010;

// Middleware
app.use(express.json());
app.use('/api/targets', targetRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// MongoDB connectie
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Verbonden met MongoDB (competition-service)'))
.catch((err) => {
  console.error('❌ Fout bij verbinden met MongoDB:', err.message);
  process.exit(1);
});

// Routes
app.use('/api/submissions', submissionRouter);

// Test endpoint
app.get('/', (req, res) => {
  res.send('Competition-service is live!');
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Competition-service draait op poort ${PORT}`);
});
