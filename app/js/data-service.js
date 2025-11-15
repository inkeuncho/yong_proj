/**
 * Our World In Data API Integration Service
 * Fetches and processes air pollution data from OWID
 */

export class OWIDDataService {
  constructor() {
    this.baseURL = 'https://ourworldindata.org/grapher';
    this.cache = new Map();
    this.cacheExpiry = 3600000; // 1 hour
  }

  /**
   * Fetch PM2.5 air pollution data
   * @returns {Promise<Array>} Processed PM2.5 data
   */
  async fetchPM25Data() {
    const cacheKey = 'pm25-data';
    
    if (this.isCacheValid(cacheKey)) {
      console.log('✅ Using cached PM2.5 data');
      return this.cache.get(cacheKey).data;
    }

    try {
      const url = `${this.baseURL}/pm25-air-pollution.csv?v=1&csvType=full&useColumnShortNames=true`;
      console.log('📡 Fetching PM2.5 data from OWID...');
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'AirLens/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const csvText = await response.text();
      const data = this.parseCSV(csvText);
      const processedData = this.processPM25Data(data);
      
      this.setCache(cacheKey, processedData);
      console.log(`✅ Loaded ${processedData.length} PM2.5 records`);
      
      return processedData;
    } catch (error) {
      console.error('❌ Failed to fetch PM2.5 data:', error);
      return this.getFallbackData();
    }
  }

  /**
   * Fetch long-run air pollution data
   * @returns {Promise<Array>} Historical air pollution data
   */
  async fetchHistoricalData() {
    const cacheKey = 'historical-data';
    
    if (this.isCacheValid(cacheKey)) {
      console.log('✅ Using cached historical data');
      return this.cache.get(cacheKey).data;
    }

    try {
      const url = `${this.baseURL}/long-run-air-pollution.csv?v=1&csvType=full&useColumnShortNames=true`;
      console.log('📡 Fetching historical data from OWID...');
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'AirLens/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const csvText = await response.text();
      const data = this.parseCSV(csvText);
      const processedData = this.processHistoricalData(data);
      
      this.setCache(cacheKey, processedData);
      console.log(`✅ Loaded ${processedData.length} historical records`);
      
      return processedData;
    } catch (error) {
      console.error('❌ Failed to fetch historical data:', error);
      return [];
    }
  }

  /**
   * Parse CSV text into array of objects
   */
  parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map(line => {
      const values = this.parseCSVLine(line);
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = values[index]?.trim() || '';
      });
      return obj;
    });
  }

  /**
   * Parse CSV line handling quoted values
   */
  parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current);
    
    return values;
  }

  /**
   * Process PM2.5 data into usable format
   */
  processPM25Data(data) {
    const countryMap = new Map();

    data.forEach(row => {
      const country = row.Entity;
      const year = parseInt(row.Year);
      const pm25 = parseFloat(row.concentrations_of_fine_particulate_matter__pm2_5__residence_area_type_total || 0);

      if (!country || isNaN(year) || isNaN(pm25)) return;

      if (!countryMap.has(country)) {
        countryMap.set(country, {
          name: country,
          code: row.Code || '',
          data: []
        });
      }

      countryMap.get(country).data.push({
        year,
        pm25: pm25
      });
    });

    // Sort data by year
    countryMap.forEach(country => {
      country.data.sort((a, b) => a.year - b.year);
    });

    return Array.from(countryMap.values());
  }

  /**
   * Process historical pollution data
   */
  processHistoricalData(data) {
    const countryMap = new Map();

    data.forEach(row => {
      const country = row.Entity;
      const year = parseInt(row.Year);

      if (!country || isNaN(year)) return;

      if (!countryMap.has(country)) {
        countryMap.set(country, {
          name: country,
          code: row.Code || '',
          emissions: []
        });
      }

      const emissions = {
        year,
        nox: parseFloat(row.emissions__pollutant_nox__sector_all_sectors || 0),
        so2: parseFloat(row.emissions__pollutant_so2__sector_all_sectors || 0),
        co: parseFloat(row.emissions__pollutant_co__sector_all_sectors || 0),
        voc: parseFloat(row.emissions__pollutant_voc__sector_all_sectors || 0),
        pm25: parseFloat(row.emissions__pollutant_pm2_5__sector_all_sectors || 0),
        pm10: parseFloat(row.emissions__pollutant_pm10__sector_all_sectors || 0)
      };

      countryMap.get(country).emissions.push(emissions);
    });

    // Sort by year
    countryMap.forEach(country => {
      country.emissions.sort((a, b) => a.year - b.year);
    });

    return Array.from(countryMap.values());
  }

  /**
   * Get coordinates for countries (approximate centers)
   */
  getCountryCoordinates() {
    return {
      'China': { lat: 35.8617, lon: 104.1954 },
      'India': { lat: 20.5937, lon: 78.9629 },
      'United States': { lat: 37.0902, lon: -95.7129 },
      'Indonesia': { lat: -0.7893, lon: 113.9213 },
      'Pakistan': { lat: 30.3753, lon: 69.3451 },
      'Brazil': { lat: -14.2350, lon: -51.9253 },
      'Nigeria': { lat: 9.0820, lon: 8.6753 },
      'Bangladesh': { lat: 23.6850, lon: 90.3563 },
      'Russia': { lat: 61.5240, lon: 105.3188 },
      'Mexico': { lat: 23.6345, lon: -102.5528 },
      'Japan': { lat: 36.2048, lon: 138.2529 },
      'Ethiopia': { lat: 9.1450, lon: 40.4897 },
      'Philippines': { lat: 12.8797, lon: 121.7740 },
      'Egypt': { lat: 26.8206, lon: 30.8025 },
      'Vietnam': { lat: 14.0583, lon: 108.2772 },
      'Turkey': { lat: 38.9637, lon: 35.2433 },
      'Iran': { lat: 32.4279, lon: 53.6880 },
      'Germany': { lat: 51.1657, lon: 10.4515 },
      'Thailand': { lat: 15.8700, lon: 100.9925 },
      'United Kingdom': { lat: 55.3781, lon: -3.4360 },
      'France': { lat: 46.2276, lon: 2.2137 },
      'Italy': { lat: 41.8719, lon: 12.5674 },
      'South Africa': { lat: -30.5595, lon: 22.9375 },
      'South Korea': { lat: 35.9078, lon: 127.7669 },
      'Colombia': { lat: 4.5709, lon: -74.2973 },
      'Spain': { lat: 40.4637, lon: -3.7492 },
      'Argentina': { lat: -38.4161, lon: -63.6167 },
      'Kenya': { lat: -0.0236, lon: 37.9062 },
      'Poland': { lat: 51.9194, lon: 19.1451 },
      'Canada': { lat: 56.1304, lon: -106.3468 },
      'Australia': { lat: -25.2744, lon: 133.7751 },
      'Saudi Arabia': { lat: 23.8859, lon: 45.0792 },
      'Peru': { lat: -9.1900, lon: -75.0152 },
      'Malaysia': { lat: 4.2105, lon: 101.9758 },
      'Iraq': { lat: 33.2232, lon: 43.6793 },
      'Nepal': { lat: 28.3949, lon: 84.1240 },
      'Venezuela': { lat: 6.4238, lon: -66.5897 },
      'Chile': { lat: -35.6751, lon: -71.5430 }
    };
  }

  /**
   * Merge PM2.5 data with coordinates
   */
  async getEnrichedData() {
    const pm25Data = await this.fetchPM25Data();
    const coordinates = this.getCountryCoordinates();
    
    return pm25Data.map(country => {
      const coords = coordinates[country.name] || { lat: 0, lon: 0 };
      return {
        ...country,
        latitude: coords.lat,
        longitude: coords.lon
      };
    }).filter(country => country.data.length > 0);
  }

  /**
   * Cache management
   */
  isCacheValid(key) {
    if (!this.cache.has(key)) return false;
    const cached = this.cache.get(key);
    return Date.now() - cached.timestamp < this.cacheExpiry;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clearCache() {
    this.cache.clear();
  }

  /**
   * Fallback data if API fails
   */
  getFallbackData() {
    console.log('⚠️  Using fallback data');
    return [
      {
        name: 'China',
        code: 'CHN',
        latitude: 35.8617,
        longitude: 104.1954,
        data: [{ year: 2021, pm25: 47.5 }]
      },
      {
        name: 'India',
        code: 'IND',
        latitude: 20.5937,
        longitude: 78.9629,
        data: [{ year: 2021, pm25: 58.1 }]
      },
      {
        name: 'United States',
        code: 'USA',
        latitude: 37.0902,
        longitude: -95.7129,
        data: [{ year: 2021, pm25: 7.8 }]
      }
    ];
  }
}
