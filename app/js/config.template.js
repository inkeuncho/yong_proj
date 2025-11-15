/**
 * API Configuration
 *
 * ✅ ALL DATA FROM OFFICIAL INTERNATIONAL AGENCIES ONLY
 * This application uses ONLY data from verified international organizations:
 *
 * 🇪🇺 EU Copernicus CAMS - European Union official atmospheric monitoring
 *    ✅ NO API KEY NEEDED - WORKS IMMEDIATELY via Open-Meteo!
 *
 * OPTIONAL (for additional ground station data):
 * 🌍 WAQI - World Air Quality Index (11,000+ stations) - Token required
 * ☁️ OpenWeather - Global meteorological data - API key required
 * 🏛️ OpenAQ - Government monitoring stations - API key required
 *
 * ✅ THE APP WORKS WITHOUT ANY API KEYS!
 * All pages use EU Copernicus CAMS data by default (via Open-Meteo).
 * Optional APIs below can enhance accuracy with ground station data.
 */

const API_CONFIG = {
  /**
   * WAQI (World Air Quality Index) - OPTIONAL ⚙️
   * Coverage: 11,000+ stations worldwide
   * Data: Real-time PM2.5, PM10, O3, NO2, SO2, CO
   * Free: Yes (token required)
   * Status: NOT REQUIRED - App works without it
   *
   * How to get FREE token (optional):
   * 1. Visit: https://aqicn.org/data-platform/token
   * 2. Enter your email
   * 3. Check email for token
   * 4. Paste token below
   */
  waqi: {
    token: null, // Optional: 'your-token-here' (DO NOT commit actual tokens!)
    enabled: false // Optional: Set to true after adding token
  },

  /**
   * OpenWeather Air Pollution API - OPTIONAL ⚙️
   * Coverage: Global coordinates-based data
   * Data: PM2.5, PM10, CO, NO, NO2, O3, SO2, NH3
   * Free: 1,000,000 calls/month
   * Status: NOT REQUIRED - App works without it
   *
   * How to get FREE API key (optional):
   * 1. Visit: https://home.openweathermap.org/users/sign_up
   * 2. Create free account
   * 3. Generate API key from dashboard
   * 4. Paste API key below
   */
  openweather: {
    apiKey: null, // Optional: 'your-api-key-here'
    enabled: false // Optional: Set to true after adding key
  },

  /**
   * OpenAQ API v3 - OPTIONAL ⚙️
   * Coverage: Varies by region (good in US, Europe, India, China)
   * Data: PM2.5 from government monitoring stations
   * Free: Yes (API key required)
   * Status: NOT REQUIRED - App works without it
   *
   * How to get FREE API key (optional):
   * 1. Visit: https://explore.openaq.org/register
   * 2. Create account
   * 3. Generate API key
   * 4. Paste API key below
   */
  openaq: {
    apiKey: null, // Optional: 'your-api-key-here'
    enabled: false // Optional: Set to true after adding key
  }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.API_CONFIG = API_CONFIG;
}
