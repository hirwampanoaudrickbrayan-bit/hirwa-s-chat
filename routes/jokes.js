const express = require('express');
const axios = require('axios');
const router = express.Router();

// Cache for jokes
let jokeCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 3600000; // 1 hour

// Get all jokes from free joke API
async function getAllJokes() {
  try {
    // Check cache
    if (jokeCache && Date.now() - cacheTimestamp < CACHE_DURATION) {
      return jokeCache;
    }

    // Fetch from free Joke API
    const response = await axios.get('https://v2.jokeapi.dev/joke/Any?amount=30');
    
    if (response.data.jokes) {
      jokeCache = response.data.jokes;
      cacheTimestamp = Date.now();
      return jokeCache;
    }

    return [];
  } catch (error) {
    console.error('Joke API Error:', error.message);
    return [];
  }
}

// Get random joke
router.get('/random', async (req, res) => {
  try {
    const response = await axios.get('https://v2.jokeapi.dev/joke/Any');
    
    res.json({
      joke: response.data.setup && response.data.delivery 
        ? { setup: response.data.setup, delivery: response.data.delivery }
        : { text: response.data.joke },
      type: response.data.type,
      category: response.data.category
    });
  } catch (error) {
    console.error('Random Joke Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch joke' });
  }
});

// Get joke by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const validCategories = ['general', 'programming', 'knock-knock'];

    if (!validCategories.includes(category.toLowerCase())) {
      return res.status(400).json({
        error: 'Invalid category',
        validCategories
      });
    }

    const response = await axios.get(`https://v2.jokeapi.dev/joke/${category}?amount=5`);
    
    res.json({
      category,
      jokes: response.data.jokes.map(j => ({
        text: j.setup && j.delivery ? { setup: j.setup, delivery: j.delivery } : { text: j.joke },
        type: j.type
      }))
    });
  } catch (error) {
    console.error('Category Joke Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch jokes' });
  }
});

// Get all available jokes
router.get('/all', async (req, res) => {
  try {
    const jokes = await getAllJokes();
    
    res.json({
      total: jokes.length,
      jokes: jokes.slice(0, 20).map(j => ({
        text: j.setup && j.delivery ? { setup: j.setup, delivery: j.delivery } : { text: j.joke },
        type: j.type,
        category: j.category
      }))
    });
  } catch (error) {
    console.error('All Jokes Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch jokes' });
  }
});

module.exports = router;
