const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const teamRoutes = require('./routes/teamRoutes');
const tournamentRoutes = require('./routes/tournamentRoutes');
const matchRoutes = require('./routes/matchRoutes');
const standingRoutes = require('./routes/standingRoutes');
const groupRoutes = require('./routes/groupRoutes');
const bracketRoutes = require('./routes/bracketRoutes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running', data: null });
});

app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/tournament', tournamentRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/standings', standingRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/bracket', bracketRoutes);

app.use(errorHandler);

module.exports = app;
