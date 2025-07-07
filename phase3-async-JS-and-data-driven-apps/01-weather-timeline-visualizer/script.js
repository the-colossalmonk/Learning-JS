document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    const cityInput = document.getElementById('city-input');
    const searchBtn = document.getElementById('search-btn');
    const weatherCard = document.getElementById('weather-card');
    const weatherContent = document.getElementById('weather-content');
    const loadingIndicator = document.getElementById('loading-indicator');
    const errorMessage = document.getElementById('error-message');
    const cityNameEl = document.getElementById('city-name');
    const currentTimeEl = document.getElementById('current-time');
    const weatherIconEl = document.getElementById('weather-icon');
    const currentTempEl = document.getElementById('current-temp');
    const weatherDescEl = document.getElementById('weather-description');
    const hourlyChart = document.getElementById('hourly-chart');
    const chartTooltip = document.getElementById('tooltip');
    const dailyTimeline = document.getElementById('daily-timeline');

    // --- API & State ---
    const GEOCODE_API_URL = 'https://geocoding-api.open-meteo.com/v1/search';
    const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';
    
    // --- Weather Code Mapping ---
    function getWeatherInfo(code, isDay) {
        const weatherMap = {
            0: { desc: 'Clear sky', icon: '☀️', bg: 'var(--bg-day-clear)' },
            1: { desc: 'Mainly clear', icon: '🌤️', bg: 'var(--bg-day-clear)' },
            2: { desc: 'Partly cloudy', icon: '⛅', bg: 'var(--bg-day-cloudy)' },
            3: { desc: 'Overcast', icon: '☁️', bg: 'var(--bg-day-cloudy)' },
            45: { desc: 'Fog', icon: '🌫️', bg: 'var(--bg-day-cloudy)' },
            48: { desc: 'Depositing rime fog', icon: '🌫️', bg: 'var(--bg-day-cloudy)' },
            51: { desc: 'Light drizzle', icon: '🌦️', bg: 'var(--bg-rain)' },
            53: { desc: 'Moderate drizzle', icon: '🌦️', bg: 'var(--bg-rain)' },
            55: { desc: 'Dense drizzle', icon: '🌦️', bg: 'var(--bg-rain)' },
            61: { desc: 'Slight rain', icon: '🌧️', bg: 'var(--bg-rain)' },
            63: { desc: 'Moderate rain', icon: '🌧️', bg: 'var(--bg-rain)' },
            65: { desc: 'Heavy rain', icon: '🌧️', bg: 'var(--bg-rain)' },
            71: { desc: 'Slight snow fall', icon: '🌨️', bg: 'var(--bg-snow)' },
            73: { desc: 'Moderate snow fall', icon: '🌨️', bg: 'var(--bg-snow)' },
            75: { desc: 'Heavy snow fall', icon: '🌨️', bg: 'var(--bg-snow)' },
            80: { desc: 'Slight rain showers', icon: '🌧️', bg: 'var(--bg-rain)' },
            81: { desc: 'Moderate rain showers', icon: '🌧️', bg: 'var(--bg-rain)' },
            82: { desc: 'Violent rain showers', icon: '🌧️', bg: 'var(--bg-rain)' },
            95: { desc: 'Thunderstorm', icon: '⛈️', bg: 'var(--bg-rain)' },
        };
        let info = weatherMap[code] || { desc: 'Unknown', icon: '🤷', bg: 'var(--bg-day-cloudy)' };
        if (!isDay && code <= 2) {
            info.icon = '🌙';
            info.bg = code === 0 ? 'var(--bg-night-clear)' : 'var(--bg-night-cloudy)';
        }
        return info;
    }

    // --- Core Functions ---
    async function fetchWeatherForCity(city) {
        showLoading();
        try {
            // 1. Geocode city name to get coordinates
            const geoResponse = await fetch(`${GEOCODE_API_URL}?name=${city}&count=1`);
            if (!geoResponse.ok) throw new Error('Failed to fetch location data.');
            const geoData = await geoResponse.json();
            if (!geoData.results || geoData.results.length === 0) {
                throw new Error('City not found. Please try again.');
            }
            const { latitude, longitude, name } = geoData.results[0];

            // 2. Fetch weather data using coordinates
            // *** THE MAIN FIX IS HERE: Corrected API parameter names based on API docs ***
            // `current` and `hourly` use 'weather_code', while `daily` uses 'weathercode'.
            const weatherParams = `latitude=${latitude}&longitude=${longitude}&current=temperature_2m,is_day,weather_code&hourly=temperature_2m,precipitation_probability,weather_code&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`;
            
            const weatherResponse = await fetch(`${WEATHER_API_URL}?${weatherParams}`);
            if (!weatherResponse.ok) throw new Error('Failed to fetch weather data.');
            const weatherData = await weatherResponse.json();
            
            processAndRenderWeather(name, weatherData);

        } catch (error) {
            showError(error.message);
        } finally {
            hideLoading();
        }
    }

    function processAndRenderWeather(name, data) {
        weatherContent.classList.remove('hidden');
        errorMessage.classList.add('hidden');
        
        const { current, daily, hourly } = data;
        const now = new Date();
        
        // Update current conditions (uses `current.weather_code`)
        const weatherInfo = getWeatherInfo(current.weather_code, current.is_day);
        weatherCard.style.background = weatherInfo.bg;
        cityNameEl.textContent = name;
        currentTimeEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        currentTempEl.textContent = Math.round(current.temperature_2m);
        weatherDescEl.textContent = weatherInfo.desc;
        weatherIconEl.innerHTML = getAnimatedIcon(weatherInfo.icon);
        
        // Prepare data for today's hourly chart
        const todayHourlyData = {
            time: hourly.time.slice(0, 24),
            temp: hourly.temperature_2m.slice(0, 24),
            precip: hourly.precipitation_probability.slice(0, 24),
        };
        renderHourlyChart(todayHourlyData);

        // Render 7-day forecast
        renderDailyForecast(daily);
    }

    // --- Rendering Sub-Components ---
    function renderHourlyChart(data) {
        hourlyChart.innerHTML = '';
        const width = hourlyChart.clientWidth;
        const height = hourlyChart.clientHeight;
        const padding = { top: 20, right: 20, bottom: 40, left: 40 };

        const tempValues = data.temp;
        const precipValues = data.precip;

        const minTemp = Math.min(...tempValues);
        const maxTemp = Math.max(...tempValues);
        
        const xScale = (i) => padding.left + (i / 23) * (width - padding.left - padding.right);
        const yScaleTemp = (temp) => height - padding.bottom - ((temp - minTemp) / (maxTemp - minTemp)) * (height - padding.top - padding.bottom);

        // Draw grid lines and labels
        hourlyChart.innerHTML += `
            <line class="grid-line" x1="${padding.left}" y1="${yScaleTemp(maxTemp)}" x2="${width - padding.right}" y2="${yScaleTemp(maxTemp)}"></line>
            <text class="axis-label" x="${padding.left - 10}" y="${yScaleTemp(maxTemp) + 5}">${Math.round(maxTemp)}°</text>
            <line class="grid-line" x1="${padding.left}" y1="${yScaleTemp(minTemp)}" x2="${width - padding.right}" y2="${yScaleTemp(minTemp)}"></line>
            <text class="axis-label" x="${padding.left - 10}" y="${yScaleTemp(minTemp) + 5}">${Math.round(minTemp)}°</text>
        `;
        
        const precipPathData = precipValues.map((p, i) => {
            const x = xScale(i);
            const y = height - padding.bottom;
            const barHeight = (p / 100) * (height - padding.top - padding.bottom);
            return `${x},${y - barHeight}`;
        }).join(' ');
        hourlyChart.innerHTML += `<polygon class="precip-area" points="${xScale(0)},${height-padding.bottom} ${precipPathData} ${xScale(23)},${height-padding.bottom}"></polygon>`;
        
        const tempPathData = tempValues.map((temp, i) => `${xScale(i)},${yScaleTemp(temp)}`).join(' ');
        hourlyChart.innerHTML += `<polyline class="temp-path" points="${tempPathData}"></polyline>`;
        
        data.time.forEach((time, i) => {
            const x = xScale(i);
            if (i % 3 === 0) {
                hourlyChart.innerHTML += `<text class="axis-label" x="${x}" y="${height - padding.bottom + 20}" text-anchor="middle">${new Date(time).getHours()}:00</text>`;
            }
            const hotspot = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            hotspot.setAttribute('x', x - (width / 48));
            hotspot.setAttribute('y', 0);
            hotspot.setAttribute('width', width / 24);
            hotspot.setAttribute('height', height);
            hotspot.setAttribute('fill', 'transparent');
            hotspot.addEventListener('mouseover', () => showTooltip(data, i, x));
            hotspot.addEventListener('mouseout', () => chartTooltip.classList.add('hidden'));
            hourlyChart.appendChild(hotspot);
        });
    }

    function renderDailyForecast(dailyData) {
        if (!dailyData || !dailyData.time) {
            dailyTimeline.innerHTML = '<p>Daily forecast data is unavailable.</p>';
            return;
        }

        dailyTimeline.innerHTML = '';
        for (let i = 0; i < 7; i++) {
            const date = new Date(dailyData.time[i]);
            const dayName = i === 0 ? 'Today' : date.toLocaleDateString([], { weekday: 'short' });
            
            // *** THE SECOND FIX IS HERE: Accessing `weathercode` (no underscore) for the daily data ***
            const weatherInfo = getWeatherInfo(dailyData.weathercode[i], true);
            
            const maxTemp = Math.round(dailyData.temperature_2m_max[i]);
            const minTemp = Math.round(dailyData.temperature_2m_min[i]);

            const card = document.createElement('div');
            card.className = 'day-card';
            card.innerHTML = `
                <div class="day-name">${dayName}</div>
                <div class="weather-icon">${getAnimatedIcon(weatherInfo.icon, false)}</div>
                <div class="temp-range">${maxTemp}° / ${minTemp}°</div>
            `;
            dailyTimeline.appendChild(card);
        }
    }
    
    // --- UI Helpers & Animations ---
    function showLoading() {
        weatherContent.classList.add('hidden');
        errorMessage.classList.add('hidden');
        loadingIndicator.classList.remove('hidden');
    }
    function hideLoading() {
        loadingIndicator.classList.add('hidden');
    }
    function showError(message) {
        weatherContent.classList.add('hidden');
        loadingIndicator.classList.add('hidden');
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
    }
    function showTooltip(data, index, x) {
        const time = new Date(data.time[index]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const temp = Math.round(data.temp[index]);
        const precip = data.precip[index];
        chartTooltip.innerHTML = `<strong>${time}</strong><br>${temp}°C<br>${precip}% Rain`;
        chartTooltip.style.left = `${x}px`;
        chartTooltip.classList.remove('hidden');
    }
    function getAnimatedIcon(icon, isLarge = true) {
        if(icon === '☀️') return `<span class="icon-sunny">${icon}</span>`;
        if(icon === '🌧️') return `<span class="icon-rainy">${'<span>💧</span>'.repeat(isLarge ? 3:2)}</span>`;
        if(icon === '☁️' || icon === '⛅' || icon === '🌤️') return `<span class="icon-cloudy">${icon}</span>`;
        return icon;
    }

    // --- Event Listeners ---
    searchBtn.addEventListener('click', () => {
        const city = cityInput.value.trim();
        if(city) fetchWeatherForCity(city);
    });
    cityInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const city = cityInput.value.trim();
            if(city) fetchWeatherForCity(city);
        }
    });

    // --- Initial Load ---
    fetchWeatherForCity('Tokyo');
});