/**
 * Live Data Service - Real-Time Financial & Weather Data
 * All APIs are FREE with no API key required
 */

/**
 * Get cryptocurrency price (Bitcoin, Ethereum, dll)
 */
export async function getCryptoPrice(symbol = 'bitcoin', currency = 'usd') {
    try {
        console.log(`[LiveData] Fetching crypto: ${symbol}`);

        const symbolMap = {
            'bitcoin': 'bitcoin',
            'btc': 'bitcoin',
            'ethereum': 'ethereum',
            'eth': 'ethereum',
            'bnb': 'binancecoin',
            'solana': 'solana',
            'sol': 'solana',
            'cardano': 'cardano',
            'ada': 'cardano',
            'xrp': 'ripple',
            'ripple': 'ripple',
            'dogecoin': 'dogecoin',
            'doge': 'dogecoin'
        };

        const coinId = symbolMap[symbol.toLowerCase()] || symbol.toLowerCase();

        const response = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=${currency}&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`
        );

        if (!response.ok) throw new Error('CoinGecko API failed');

        const data = await response.json();

        if (!data[coinId]) {
            throw new Error(`Cryptocurrency "${symbol}" not found`);
        }

        const price = data[coinId][currency];
        const change24h = data[coinId][`${currency}_24h_change`];
        const marketCap = data[coinId][`${currency}_market_cap`];
        const volume = data[coinId][`${currency}_24h_vol`];

        const result = {
            success: true,
            symbol: symbol.toUpperCase(),
            coinId: coinId,
            price: price,
            currency: currency.toUpperCase(),
            change24h: change24h ? change24h.toFixed(2) : 'N/A',
            marketCap: marketCap,
            volume24h: volume,
            timestamp: new Date().toISOString(),
            formatted: `${currency.toUpperCase()} ${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        };

        console.log(`[LiveData] ✓ Crypto price: ${result.formatted}`);
        return result;

    } catch (error) {
        console.error(`[LiveData] ✗ Crypto error: ${error.message}`);
        return {
            success: false,
            error: error.message,
            symbol: symbol
        };
    }
}

/**
 * Get stock price (via Yahoo Finance)
 */
export async function getStockPrice(symbol) {
    try {
        console.log(`[LiveData] Fetching stock: ${symbol}`);

        const response = await fetch(
            `https://query1.finance.yahoo.com/v8/finance/chart/${symbol.toUpperCase()}?interval=1d&range=1d`
        );

        if (!response.ok) throw new Error('Yahoo Finance API failed');

        const data = await response.json();

        if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
            throw new Error(`Stock symbol "${symbol}" not found`);
        }

        const result = data.chart.result[0];
        const meta = result.meta;
        const quote = result.indicators.quote[0];

        const currentPrice = meta.regularMarketPrice;
        const previousClose = meta.previousClose;
        const change = currentPrice - previousClose;
        const changePercent = (change / previousClose) * 100;

        const stockData = {
            success: true,
            symbol: symbol.toUpperCase(),
            name: meta.longName || meta.shortName || symbol,
            price: currentPrice,
            currency: meta.currency,
            change: change.toFixed(2),
            changePercent: changePercent.toFixed(2),
            previousClose: previousClose,
            open: quote.open[0],
            high: quote.high[0],
            low: quote.low[0],
            volume: quote.volume[0],
            timestamp: new Date(meta.regularMarketTime * 1000).toISOString(),
            formatted: `${meta.currency} ${currentPrice.toFixed(2)}`
        };

        console.log(`[LiveData] ✓ Stock price: ${stockData.formatted}`);
        return stockData;

    } catch (error) {
        console.error(`[LiveData] ✗ Stock error: ${error.message}`);
        return {
            success: false,
            error: error.message,
            symbol: symbol
        };
    }
}

/**
 * Get weather data (via Open-Meteo - Free, No API Key)
 */
export async function getWeather(city) {
    try {
        console.log(`[LiveData] Fetching weather: ${city}`);

        // Geocoding untuk dapat koordinat
        const geoResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );

        if (!geoResponse.ok) throw new Error('Geocoding failed');

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error(`City "${city}" not found`);
        }

        const location = geoData.results[0];
        const lat = location.latitude;
        const lon = location.longitude;

        // Get weather data
        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&forecast_days=1`
        );

        if (!weatherResponse.ok) throw new Error('Weather API failed');

        const weatherData = await weatherResponse.json();
        const current = weatherData.current_weather;
        const daily = weatherData.daily;

        // Weather code mapping
        const weatherCodes = {
            0: 'Clear sky',
            1: 'Mainly clear',
            2: 'Partly cloudy',
            3: 'Overcast',
            45: 'Foggy',
            48: 'Foggy',
            51: 'Light drizzle',
            53: 'Moderate drizzle',
            55: 'Dense drizzle',
            61: 'Slight rain',
            63: 'Moderate rain',
            65: 'Heavy rain',
            71: 'Slight snow',
            73: 'Moderate snow',
            75: 'Heavy snow',
            80: 'Slight rain showers',
            81: 'Moderate rain showers',
            82: 'Violent rain showers',
            95: 'Thunderstorm',
            96: 'Thunderstorm with hail',
            99: 'Thunderstorm with hail'
        };

        const result = {
            success: true,
            city: location.name,
            country: location.country,
            coordinates: { lat, lon },
            temperature: current.temperature,
            windSpeed: current.windspeed,
            weatherCode: current.weathercode,
            weatherDescription: weatherCodes[current.weathercode] || 'Unknown',
            tempMax: daily.temperature_2m_max[0],
            tempMin: daily.temperature_2m_min[0],
            precipitation: daily.precipitation_sum[0],
            timestamp: current.time,
            formatted: `${current.temperature}°C, ${weatherCodes[current.weathercode] || 'Unknown'}`
        };

        console.log(`[LiveData] ✓ Weather: ${result.formatted}`);
        return result;

    } catch (error) {
        console.error(`[LiveData] ✗ Weather error: ${error.message}`);
        return {
            success: false,
            error: error.message,
            city: city
        };
    }
}

/**
 * Get currency exchange rate
 */
export async function getCurrencyRate(from = 'USD', to = 'IDR') {
    try {
        console.log(`[LiveData] Fetching rate: ${from} to ${to}`);

        const response = await fetch(
            `https://api.exchangerate-api.com/v4/latest/${from.toUpperCase()}`
        );

        if (!response.ok) throw new Error('Exchange rate API failed');

        const data = await response.json();

        if (!data.rates[to.toUpperCase()]) {
            throw new Error(`Currency "${to}" not found`);
        }

        const rate = data.rates[to.toUpperCase()];

        const result = {
            success: true,
            from: from.toUpperCase(),
            to: to.toUpperCase(),
            rate: rate,
            timestamp: data.date,
            formatted: `1 ${from.toUpperCase()} = ${rate.toFixed(2)} ${to.toUpperCase()}`
        };

        console.log(`[LiveData] ✓ Exchange rate: ${result.formatted}`);
        return result;

    } catch (error) {
        console.error(`[LiveData] ✗ Currency error: ${error.message}`);
        return {
            success: false,
            error: error.message,
            from: from,
            to: to
        };
    }
}

/**
 * Auto-detect and fetch appropriate live data based on query
 */
export async function autoFetchLiveData(query) {
    const q = query.toLowerCase();

    // Crypto detection
    if (/\b(bitcoin|btc|ethereum|eth|crypto|cryptocurrency|harga\s+(bitcoin|btc|eth))\b/i.test(q)) {
        const symbol = q.match(/\b(bitcoin|btc|ethereum|eth|bnb|solana|sol|cardano|ada|xrp|dogecoin|doge)\b/i);
        return await getCryptoPrice(symbol ? symbol[0] : 'bitcoin', 'usd');
    }

    // Stock detection
    if (/\b(stock|saham|nasdaq|nyse|aapl|googl|msft|tsla)\b/i.test(q)) {
        const symbol = q.match(/\b(aapl|googl|msft|tsla|amzn|meta|nflx|nvda)\b/i);
        return await getStockPrice(symbol ? symbol[0] : 'AAPL');
    }

    // Weather detection
    if (/\b(weather|cuaca|temperature|suhu)\b/i.test(q)) {
        const city = q.match(/\b(jakarta|bandung|surabaya|medan|bali|yogyakarta|london|tokyo|new york|singapore)\b/i);
        return await getWeather(city ? city[0] : 'Jakarta');
    }

    // Currency detection
    if (/\b(kurs|exchange rate|convert|usd|idr|eur|gbp|jpy)\b/i.test(q)) {
        const match = q.match(/\b([a-z]{3})\s+(?:to|ke)\s+([a-z]{3})\b/i);
        if (match) {
            return await getCurrencyRate(match[1], match[2]);
        }
        return await getCurrencyRate('USD', 'IDR');
    }

    return null;
}

export default {
    getCryptoPrice,
    getStockPrice,
    getWeather,
    getCurrencyRate,
    autoFetchLiveData
};
