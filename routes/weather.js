const express = require('express');
const axios = require('axios');
const router = express.Router();

// In-memory cache for weather data
const weatherCache = {};

// Get current weather
router.get('/current', async (req, res) => {
  try {
    const { city } = req.query;
    
    if (!city) {
      return res.status(400).json({ error: 'City parameter is required' });
    }

    // Check cache
    const cacheKey = `weather_${city}`;
    if (weatherCache[cacheKey] && Date.now() - weatherCache[cacheKey].timestamp < 600000) {
      return res.json({
        ...weatherCache[cacheKey].data,
        cached: true,
        cacheAge: Math.floor((Date.now() - weatherCache[cacheKey].timestamp) / 1000)
      });
    }

    // Using free weather API - Open-Meteo (no API key required)
    const response = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
      params: { name: city, count: 1, language: 'en', format: 'json' }
    });

    if (!response.data.results || response.data.results.length === 0) {
      return res.status(404).json({ error: 'City not found' });
    }

    const location = response.data.results[0];
    
    // Get weather data
    const weatherResponse = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: location.latitude,
        longitude: location.longitude,
        current: 'temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m'
      }
    });

    const weatherData = {
      location: {
        city: location.name,
        country: location.country,
        latitude: location.latitude,
        longitude: location.longitude
      },
      current: {
        temperature: weatherResponse.data.current.temperature_2m,
        humidity: weatherResponse.data.current.relative_humidity_2m,
        windSpeed: weatherResponse.data.current.wind_speed_10m,
        weatherCode: weatherResponse.data.current.weather_code
      },
      timestamp: new Date().toISOString()
    };

    // Cache the result
    weatherCache[cacheKey] = {
      data: weatherData,
      timestamp: Date.now()
    };

    res.json({ ...weatherData, cached: false });
  } catch (error) {
    console.error('Weather API Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch weather data', details: error.message });
  }
});

// Get weather forecast
router.get('/forecast', async (req, res) => {
  try {
    const { city, days } = req.query;
    const forecastDays = Math.min(parseInt(days) || 7, 16);

    if (!city) {
      return res.status(400).json({ error: 'City parameter is required' });
    }

    // Geocoding
    const geoResponse = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
      params: { name: city, count: 1, language: 'en', format: 'json' }
    });

    if (!geoResponse.data.results || geoResponse.data.results.length === 0) {
      return res.status(404).json({ error: 'City not found' });
    }

    const location = geoResponse.data.results[0];

    // Get forecast
    const forecastResponse = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: location.latitude,
        longitude: location.longitude,
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum',
        timezone: 'auto'
      }
    });

    res.json({
      location: {
        city: location.name,
        country: location.country
      },
      forecast: forecastResponse.data.daily.time.slice(0, forecastDays).map((date, idx) => ({
        date,
        tempMax: forecastResponse.data.daily.temperature_2m_max[idx],
        tempMin: forecastResponse.data.daily.temperature_2m_min[idx],
        precipitation: forecastResponse.data.daily.precipitation_sum[idx],
        weatherCode: forecastResponse.data.daily.weather_code[idx]
      }))
    });
  } catch (error) {
    console.error('Forecast API Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch forecast data' });
  }
});

module.exports = router;
