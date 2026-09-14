# Deployment Guide

## Local Development

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd free-api

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev
```

Server will run on `http://localhost:3000`

## Production Deployment

### Heroku

```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# View logs
heroku logs --tail
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

**Build and run:**

```bash
docker build -t free-api .
docker run -p 3000:3000 free-api
```

### Railway

1. Push code to GitHub
2. Go to https://railway.app
3. Click "New Project" → "Deploy from GitHub repo"
4. Select this repository
5. Add environment variables
6. Deploy!

### Render

1. Go to https://render.com
2. Click "New" → "Web Service"
3. Connect GitHub repository
4. Set build command: `npm install`
5. Set start command: `npm start`
6. Add environment variables
7. Deploy!

### DigitalOcean App Platform

1. Go to https://cloud.digitalocean.com/apps
2. Click "Create App"
3. Connect GitHub repository
4. Configure build settings
5. Set environment variables
6. Deploy!

## Using the API

Once deployed, you can access:
- API Root: `https://your-domain.com/api`
- Documentation: `https://your-domain.com/api/docs`
- Health Check: `https://your-domain.com/api/health`

## API Rate Limiting (Optional)

For production, add rate limiting:

```bash
npm install express-rate-limit
```

Add to `server.js`:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

## Monitoring

### Health Check

```bash
curl https://your-domain.com/api/health
```

### Using UptimeRobot (Free)

1. Go to https://uptimerobot.com
2. Create monitor for health endpoint
3. Get alerts if API goes down
