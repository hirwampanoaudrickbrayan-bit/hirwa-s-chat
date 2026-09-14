const express = require('express');
const axios = require('axios');
const router = express.Router();

// Cache for crypto data
let cryptoCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 300000; // 5 minutes

// Get top cryptocurrencies
router.get('/prices', async (req, res) => {
  try {
    const { currency = 'usd', limit = 10 } = req.query;

    // Check cache
    const cacheKey = `crypto_prices_${currency}_${limit}`;
    if (cryptoCache && Date.now() - cacheTimestamp < CACHE_DURATION) {
      return res.json({
        ...cryptoCache,
        cached: true,
        cacheAge: Math.floor((Date.now() - cacheTimestamp) / 1000)
      });
    }

    // Free CoinGecko API
    const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
      params: {
        vs_currency: currency.toLowerCase(),
        order: 'market_cap_desc',
        per_page: Math.min(parseInt(limit), 250),
        sparkline: false
      }
    });

    const cryptoData = {
      currency,
      lastUpdated: new Date().toISOString(),
      cryptocurrencies: response.data.map(crypto => ({
        id: crypto.id,
        symbol: crypto.symbol.toUpperCase(),
        name: crypto.name,
        currentPrice: crypto.current_price,
        marketCap: crypto.market_cap,
        marketCapRank: crypto.market_cap_rank,
        volume24h: crypto.total_volume,
        priceChange24h: crypto.price_change_24h,
        priceChangePercent24h: crypto.price_change_percentage_24h,
        image: crypto.image
      }))
    };

    cryptoCache = cryptoData;
    cacheTimestamp = Date.now();

    res.json({ ...cryptoData, cached: false });
  } catch (error) {
    console.error('Crypto API Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch cryptocurrency prices', details: error.message });
  }
});

// Get specific cryptocurrency
router.get('/price/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { currency = 'usd' } = req.query;

    const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${id.toLowerCase()}`, {
      params: {
        vs_currency: currency.toLowerCase(),
        sparkline: false
      }
    });

    res.json({
      id: response.data.id,
      symbol: response.data.symbol.toUpperCase(),
      name: response.data.name,
      currency,
      market_data: {
        currentPrice: response.data.market_data.current_price[currency.toLowerCase()],
        marketCap: response.data.market_data.market_cap[currency.toLowerCase()],
        totalVolume: response.data.market_data.total_volume[currency.toLowerCase()],
        priceChange24h: response.data.market_data.price_change_24h[currency.toLowerCase()],
        priceChangePercent24h: response.data.market_data.price_change_percentage_24h,
        ath: response.data.market_data.ath[currency.toLowerCase()],
        atl: response.data.market_data.atl[currency.toLowerCase()]
      },
      description: response.data.description.en?.substring(0, 200),
      image: response.data.image.large,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Crypto Details Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch cryptocurrency details' });
  }
});

// Get market data
router.get('/market', async (req, res) => {
  try {
    const { currency = 'usd' } = req.query;

    const response = await axios.get('https://api.coingecko.com/api/v3/global', {
      params: { vs_currency: currency.toLowerCase() }
    });

    res.json({
      currency,
      marketCap: response.data.data.total_market_cap[currency.toLowerCase()],
      totalVolume: response.data.data.total_volume[currency.toLowerCase()],
      btcDominance: response.data.data.btc_market_cap_percentage,
      ethDominance: response.data.data.eth_market_cap_percentage,
      activeCryptocurrencies: response.data.data.active_cryptocurrencies,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Market Data Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch market data' });
  }
});

module.exports = router;
