require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const clientRoutes = require('./routes/clientRoutes');
const projectRoutes = require('./routes/projectRoutes');
const activityRoutes = require('./routes/activityRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api', clientRoutes);
app.use('/api', projectRoutes);
app.use('/api', activityRoutes);
app.use('/api', dashboardRoutes);


app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Origami CES API running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Origami CES API listening on port ${PORT}`);
});