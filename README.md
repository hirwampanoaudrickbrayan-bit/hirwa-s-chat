<!-- readme.md -->

# 🚀 Free Data API

A comprehensive, production-ready free API that combines multiple data sources including weather, todos, jokes, cryptocurrency, and news. Built with Node.js and Express.

## Features

✅ **Weather Data** - Real-time weather and forecasts (Open-Meteo)
✅ **Todo Management** - Full CRUD operations with in-memory storage
✅ **Jokes** - Random jokes and category-based jokes (JokeAPI)
✅ **Cryptocurrency** - Live crypto prices and market data (CoinGecko)
✅ **News** - Latest news articles by category and search (NewsAPI)
✅ **CORS Enabled** - Access from any frontend
✅ **Caching** - Smart caching for better performance
✅ **Error Handling** - Comprehensive error messages
✅ **Documentation** - Built-in API documentation

## Quick Start

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd free-api

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start the server
npm start
```

The API will be available at `http://localhost:3000`

### Development Mode

```bash
npm run dev
```

## API Documentation

Visit `http://localhost:3000/api/docs` for full API documentation or explore the endpoints below.

### Base Endpoints

- **API Root**: `GET /api` - Get API information
- **Health Check**: `GET /api/health` - Server health status
- **Documentation**: `GET /api/docs` - Full API documentation

### Weather Endpoints

```
GET /api/weather/current?city=London
GET /api/weather/forecast?city=London&days=7
```

**Response Example:**
```json
{
  "location": {
    "city": "London",
    "country": "United Kingdom",
    "latitude": 51.5085,
    "longitude": -0.1257
  },
  "current": {
    "temperature": 15.2,
    "humidity": 72,
    "windSpeed": 8.5,
    "weatherCode": 2
  },
  "timestamp": "2024-01-20T10:30:00Z"
}
```

### Todos Endpoints

```
GET    /api/todos                 # Get all todos
GET    /api/todos?completed=true  # Filter by completion status
GET    /api/todos/:id             # Get specific todo
POST   /api/todos                 # Create new todo
PUT    /api/todos/:id             # Update todo
DELETE /api/todos/:id             # Delete todo
DELETE /api/todos/completed/all   # Delete all completed todos
```

**Create Todo Example:**
```json
POST /api/todos
{
  "title": "Buy groceries",
  "completed": false
}
```

**Response:**
```json
{
  "id": 4,
  "title": "Buy groceries",
  "completed": false,
  "createdAt": "2024-01-20T10:30:00Z",
  "updatedAt": "2024-01-20T10:30:00Z"
}
```

### Jokes Endpoints

```
GET /api/jokes/random                    # Get random joke
GET /api/jokes/category/programming      # Get jokes by category
GET /api/jokes/all                       # Get all available jokes
```

**Response Example:**
```json
{
  "joke": {
    "setup": "Why do programmers prefer dark mode?",
    "delivery": "Because light attracts bugs!"
  },
  "type": "twopart",
  "category": "programming"
}
```

### Cryptocurrency Endpoints

```
GET /api/crypto/prices                   # Get top 10 cryptocurrencies
GET /api/crypto/prices?limit=50          # Get top N cryptocurrencies
GET /api/crypto/price/bitcoin            # Get specific crypto
GET /api/crypto/market                   # Get market data
```

**Response Example:**
```json
{
  "currency": "usd",
  "lastUpdated": "2024-01-20T10:30:00Z",
  "cryptocurrencies": [
    {
      "id": "bitcoin",
      "symbol": "BTC",
      "name": "Bitcoin",
      "currentPrice": 42500,
      "marketCap": 830000000000,
      "marketCapRank": 1,
      "volume24h": 28000000000,
      "priceChange24h": 1200.50,
      "priceChangePercent24h": 2.9,
      "image": "https://..."
    }
  ]
}
```

### News Endpoints

```
GET /api/news/latest                     # Get latest news
GET /api/news/latest?country=us          # Get news by country
GET /api/news/latest?category=technology # Get news by category
GET /api/news/search?q=bitcoin           # Search news
GET /api/news/category/sports            # Get news by category
```

**Response Example:**
```json
{
  "source": "NewsAPI",
  "totalResults": 38,
  "category": "technology",
  "country": "us",
  "articles": [
    {
      "title": "New AI Model Breaks Records",
      "description": "Scientists announce breakthrough...",
      "source": "Tech News Daily",
      "author": "Jane Smith",
      "publishedAt": "2024-01-20T10:30:00Z",
      "url": "https://example.com/article",
      "image": "https://example.com/image.jpg"
    }
  ]
}
```

## Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
PORT=3000
NODE_ENV=development

# Optional API Keys (for enhanced functionality)
NEWSAPI_KEY=your_news_api_key_here
OPENWEATHERMAP_API_KEY=your_weather_key_here

# Redis (optional for distributed caching)
REDIS_URL=redis://localhost:6379
```

## Features in Detail

### Weather
- Real-time weather data using **Open-Meteo** (no API key required)
- 5-16 day forecast support
- Caching for improved performance
- Multi-language support

### Todos
- Full CRUD operations
- Filter by completion status
- In-memory persistence (resets on server restart)
- Timestamps for creation and updates

### Jokes
- Random joke generation
- Category-based jokes (general, programming, knock-knock)
- Powered by free **JokeAPI**

### Cryptocurrency
- Top 250 cryptocurrencies
- Real-time pricing
- Market cap and 24h volume
- Price changes and ATH/ATL data
- Powered by free **CoinGecko API**

### News
- Latest news by country and category
- News search functionality
- Multiple categories (business, entertainment, technology, sports, health, etc.)
- Mock fallback data for demo purposes

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error description",
  "message": "Detailed message",
  "details": "Additional context (if applicable)"
}
```

## Performance & Caching

- **Weather**: 10 minute cache
- **Crypto**: 5 minute cache
- **Jokes**: 1 hour cache
- **News**: 10 minute cache
- **Todos**: No cache (immediate updates)

## CORS Configuration

The API has CORS enabled for all origins. To restrict this, modify `server.js`:

```javascript
app.use(cors({
  origin: 'https://yourdomain.com'
}));
```

## Deployment

### Heroku
```bash
heroku create your-app-name
git push heroku main
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## Rate Limiting

Consider adding rate limiting for production:

```bash
npm install express-rate-limit
```

## Testing

Test the API using cURL or Postman:

```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Get weather
curl "http://localhost:3000/api/weather/current?city=London"

# Create a todo
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Test task"}'
```

## Free API Tiers Used

- **Weather**: Open-Meteo (unlimited free)
- **Jokes**: JokeAPI (unlimited free)
- **Cryptocurrency**: CoinGecko (500 calls/minute free)
- **News**: NewsAPI (100 requests/day free tier, mock fallback)

## License

MIT License - feel free to use this project for personal and commercial purposes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues or questions, please open an issue on GitHub.

---

**Happy API Building! 🎉**
