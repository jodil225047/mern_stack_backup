require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const applicationRoutes = require('./routes/applicationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const { success } = require('./utils/response');
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));
app.get('/api/health', (req, res) => success(res, 200, 'ApplyPilot API is running.', { server: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));
app.use('/api/applications', applicationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use(notFound);
app.use(errorHandler);
const port = process.env.PORT || 5000;
if (require.main === module) {
  connectDB().then(() => app.listen(port, () => console.log(`ApplyPilot API listening on http://localhost:${port}`)))
    .catch(error => { console.error(`Startup failed: ${error.message}`); process.exit(1); });
}
module.exports = app;
