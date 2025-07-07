# Phase 3, Project 1: Weather Timeline Visualizer

This is a visually-rich, data-driven weather forecasting application built with vanilla JavaScript. It fetches live weather data from a public API and transforms it into a beautiful, interactive interface featuring custom-built, animated SVG graphs and dynamic, weather-responsive backgrounds.

### Key Features

-   **Live Weather Data:** Fetches real-time and 7-day forecast data from the free, no-key-required Open-Meteo API.
-   **Custom SVG Graph:** The hourly forecast is displayed as a custom-built, animated SVG line graph, generated entirely with JavaScript. This is not a chart library.
-   **Layered Data Visualization:** The graph includes a secondary area chart representing the probability of precipitation, creating a rich, multi-layered data view.
-   **Interactive Tooltips:** Hovering over the hourly graph reveals a tooltip with precise time, temperature, and precipitation information for that hour.
-   **Dynamic Theming:** The entire app's background is a CSS gradient that changes dynamically based on the current weather conditions and time of day (e.g., sunny, cloudy, rainy, night).
-   **Animated Weather Icons:** Key weather icons have subtle, looping CSS animations (a spinning sun, falling rain) to make the UI feel more alive and polished.
-   **Asynchronous Logic:** Built with modern `async/await` syntax for clean, readable handling of API calls and potential errors.

---

### Core JavaScript Concepts Covered

This project is a deep dive into asynchronous JavaScript and data visualization, serving as a perfect entry point into data-driven applications.

#### 1. Asynchronous JavaScript (`async/await` & `fetch`)

The core of the application is its ability to fetch external data without freezing the user interface. This is accomplished using the `fetch` API and modern `async/await` syntax, which provides a clean and manageable way to handle asynchronous operations and errors.

**Example: Chaining API calls to get weather data (`script.js`)**

```javascript
async function fetchWeatherForCity(city) {
    try {
        // 1. First, call the geocoding API to get coordinates for the city
        const geoResponse = await fetch(`${GEOCODE_API_URL}?name=${city}&count=1`);
        const geoData = await geoResponse.json();
        const { latitude, longitude, name } = geoData.results;

        // 2. Then, use those coordinates to call the weather forecast API
        // Note the different parameter names for current/hourly ('weather_code') vs daily ('weathercode')
        const weatherParams = `latitude=${latitude}&longitude=${longitude}¤t=temperature_2m,weather_code&hourly=temperature_2m,weather_code&daily=weathercode,temperature_2m_max,temperature_2m_min`;
        const weatherResponse = await fetch(`${WEATHER_API_URL}?${weatherParams}`);
        const weatherData = await weatherResponse.json();
        
        // 3. Process and render the final data
        processAndRenderWeather(name, weatherData);

    } catch (error) {
        // Handle any errors from either API call
        showError(error.message);
    }
}
```

#### 2. Dynamic SVG Generation from Data

The hourly temperature graph is not a pre-built image or a third-party library. It is an `<svg>` element that is generated and manipulated entirely by JavaScript. The code calculates the scale, maps data points to `(x, y)` coordinates, and constructs the `points` attribute for an SVG `<polyline>` to draw the line, demonstrating a fundamental understanding of vector graphics on the web.

**Example: Generating the temperature line path (`script.js`)**

```javascript
function renderHourlyChart(data) {
    // ... setup scales (xScale, yScaleTemp) ...

    // Map each temperature value to a coordinate string "x,y"
    const tempPathData = data.temp.map((temp, i) => `${xScale(i)},${yScaleTemp(temp)}`).join(' ');
    
    // Inject the generated path into the SVG element's innerHTML
    hourlyChart.innerHTML += `<polyline class="temp-path" points="${tempPathData}"></polyline>`;
}
```

#### 3. Data Processing and Mapping

A key skill demonstrated is the ability to take raw, sometimes complex, JSON data from an API and transform it into a format that's easy for the application to use. This includes mapping numerical weather codes to human-readable descriptions and visual icons.

**Example: The `getWeatherInfo` helper function (`script.js`)**

```javascript
function getWeatherInfo(code, isDay) {
    // A map object to translate codes to useful information
    const weatherMap = {
        0: { desc: 'Clear sky', icon: '☀️', bg: 'var(--bg-day-clear)' },
        // ... more codes
    };
    let info = weatherMap[code] || { desc: 'Unknown', icon: '🤷' };
    
    // Handle special cases, like night time
    if (!isDay && code <= 2) {
        info.icon = '🌙';
        info.bg = 'var(--bg-night-clear)';
    }
    return info;
}
```

### How to Run

1.  Save the three files (`index.html`, `style.css`, `script.js`) in the same folder.
2.  Open `index.html` in your web browser. The app will load a default forecast for "Tokyo."