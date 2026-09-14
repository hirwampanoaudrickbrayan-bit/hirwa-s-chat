const express = require('express');
const axios = require('axios');
const router = express.Router();

// Cache for news
let newsCache = {};
const CACHE_DURATION = 600000; // 10 minutes

// Get latest news
router.get('/latest', async (req, res) => {
  try {
    const { country = 'us', category = 'general', limit = 10 } = req.query;

    // Using free NewsAPI.org endpoint (or alternative free news source)
    const response = await axios.get('https://newsapi.org/v2/top-headlines', {
      params: {
        country: country.toLowerCase(),
        category: category.toLowerCase(),
        pageSize: Math.min(parseInt(limit), 100),
        apiKey: process.env.NEWSAPI_KEY || 'demo' // Demo key for testing
      }
    }).catch(() => {
      // Fallback to alternative free news source if primary fails
      return {
        data: {
          articles: [],
          status: 'error'
        }
      };
    });

    // If API key is demo, use mock data
    if (response.data.status === 'error' || !response.data.articles) {
      return res.json({
        source: 'mock',
        category,
        country,
        articles: getMockNews(parseInt(limit))
      });
    }

    res.json({
      source: 'NewsAPI',
      totalResults: response.data.totalResults,
      category,
      country,
      articles: response.data.articles.map(article => ({
        title: article.title,
        description: article.description,
        source: article.source.name,
        author: article.author,
        publishedAt: article.publishedAt,
        url: article.url,
        image: article.urlToImage
      }))
    });
  } catch (error) {
    console.error('News API Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch latest news' });
  }
});

// Search news
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 10, sortBy = 'publishedAt' } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query (q) is required' });
    }

    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: q,
        pageSize: Math.min(parseInt(limit), 100),
        sortBy,
        apiKey: process.env.NEWSAPI_KEY || 'demo'
      }
    }).catch(() => {
      return { data: { articles: [] } };
    });

    // If API key is demo, use mock data
    if (!response.data.articles || response.data.articles.length === 0) {
      return res.json({
        source: 'mock',
        query: q,
        articles: getMockNews(parseInt(limit)).filter(a => 
          a.title.toLowerCase().includes(q.toLowerCase())
        )
      });
    }

    res.json({
      source: 'NewsAPI',
      query: q,
      totalResults: response.data.totalResults,
      articles: response.data.articles.map(article => ({
        title: article.title,
        description: article.description,
        source: article.source.name,
        author: article.author,
        publishedAt: article.publishedAt,
        url: article.url,
        image: article.urlToImage
      }))
    });
  } catch (error) {
    console.error('News Search Error:', error.message);
    res.status(500).json({ error: 'Failed to search news' });
  }
});

// Get news by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { country = 'us', limit = 10 } = req.query;

    const validCategories = ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'];

    if (!validCategories.includes(category.toLowerCase())) {
      return res.status(400).json({
        error: 'Invalid category',
        validCategories
      });
    }

    const response = await axios.get('https://newsapi.org/v2/top-headlines', {
      params: {
        country: country.toLowerCase(),
        category: category.toLowerCase(),
        pageSize: Math.min(parseInt(limit), 100),
        apiKey: process.env.NEWSAPI_KEY || 'demo'
      }
    }).catch(() => {
      return { data: { articles: [] } };
    });

    // Use mock data if API fails
    if (!response.data.articles || response.data.articles.length === 0) {
      return res.json({
        source: 'mock',
        category,
        articles: getMockNews(parseInt(limit))
      });
    }

    res.json({
      source: 'NewsAPI',
      category,
      country,
      articles: response.data.articles.map(article => ({
        title: article.title,
        description: article.description,
        source: article.source.name,
        author: article.author,
        publishedAt: article.publishedAt,
        url: article.url,
        image: article.urlToImage
      }))
    });
  } catch (error) {
    console.error('Category News Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch category news' });
  }
});

// Mock news data for demo
function getMockNews(limit) {
  const mockArticles = [
    {
      title: 'Latest Technology Breakthroughs in AI',
      description: 'New advancements in artificial intelligence are transforming industries worldwide.',
      source: 'Tech Daily',
      author: 'John Tech',
      publishedAt: new Date().toISOString(),
      url: 'https://example.com/tech-ai',
      image: null
    },
    {
      title: 'Global Markets Show Positive Growth',
      description: 'Stock markets across the globe are experiencing positive momentum.',
      source: 'Finance News',
      author: 'Jane Market',
      publishedAt: new Date().toISOString(),
      url: 'https://example.com/markets',
      image: null
    },
    {
      title: 'Sports: Champion Team Wins Championship',
      description: 'Historic victory as team claims their 5th championship title.',
      source: 'Sports Today',
      author: 'Mike Sports',
      publishedAt: new Date().toISOString(),
      url: 'https://example.com/sports',
      image: null
    },
    {
      title: 'Health: New Medical Discoveries',
      description: 'Scientists announce breakthrough in disease prevention research.',
      source: 'Health Weekly',
      author: 'Dr. Health',
      publishedAt: new Date().toISOString(),
      url: 'https://example.com/health',
      image: null
    }
  ];

  return mockArticles.slice(0, limit);
}

module.exports = router;
