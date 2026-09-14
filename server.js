const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const weatherRoutes = require('./routes/weather');
const todoRoutes = require('./routes/todos');
const jokeRoutes = require('./routes/jokes');
const cryptoRoutes = require('./routes/crypto');
const newsRoutes = require('./routes/news');

// API Routes
app.use('/api/weather', weatherRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/jokes', jokeRoutes);
app.use('/api/crypto', cryptoRoutes);
app.use('/api/news', newsRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Documentation
app.get('/api', (req, res) => {
  res.json({
    name: 'Free Data API',
    version: '1.0.0',
    description: 'A comprehensive free API with multiple data sources',
    endpoints: {
      weather: '/api/weather',
      todos: '/api/todos',
      jokes: '/api/jokes',
      crypto: '/api/crypto',
      news: '/api/news',
      health: '/api/health'
    },
    documentation: '/api/docs'
  });
});

// Documentation
app.get('/api/docs', (req, res) => {
  res.json({
    weather: {
      description: 'Get weather data for any location',
      endpoints: [
        { method: 'GET', path: '/api/weather/current?city=London', description: 'Get current weather' },
        { method: 'GET', path: '/api/weather/forecast?city=London&days=5', description: 'Get weather forecast' }
      ]
    },
    todos: {
      description: 'Manage todo tasks',
      endpoints: [
        { method: 'GET', path: '/api/todos', description: 'Get all todos' },
        { method: 'POST', path: '/api/todos', description: 'Create a new todo', body: { title: 'string', completed: 'boolean' } },
        { method: 'GET', path: '/api/todos/:id', description: 'Get a specific todo' },
        { method: 'PUT', path: '/api/todos/:id', description: 'Update a todo' },
        { method: 'DELETE', path: '/api/todos/:id', description: 'Delete a todo' }
      ]
    },
    jokes: {
      description: 'Get random jokes',
      endpoints: [
        { method: 'GET', path: '/api/jokes/random', description: 'Get a random joke' },
        { method: 'GET', path: '/api/jokes/category/:category', description: 'Get joke by category' },
        { method: 'GET', path: '/api/jokes/all', description: 'Get all available jokes' }
      ]
    },
    crypto: {
      description: 'Get cryptocurrency data',
      endpoints: [
        { method: 'GET', path: '/api/crypto/prices', description: 'Get top 10 crypto prices' },
        { method: 'GET', path: '/api/crypto/price/:id', description: 'Get specific crypto price' },
        { method: 'GET', path: '/api/crypto/market', description: 'Get market data' }
      ]
    },
    news: {
      description: 'Get news articles',
      endpoints: [
        { method: 'GET', path: '/api/news/latest', description: 'Get latest news' },
        { method: 'GET', path: '/api/news/search?q=technology', description: 'Search news by keyword' },
        { method: 'GET', path: '/api/news/category/:category', description: 'Get news by category' }
      ]
    }
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: 'Visit /api/docs for documentation',
    path: req.path
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Free API Server running on http://localhost:${PORT}`);
  console.log(`📚 Documentation: http://localhost:${PORT}/api/docs`);
});
