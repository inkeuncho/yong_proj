/**
 * WAQI Data Fetcher for AirLens
 * Fetches real-time air quality data from WAQI API
 * Saves to app/data/waqi/ directory
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 환경변수에서 토큰 가져오기
const WAQI_TOKEN = process.env.WAQI_TOKEN;

if (!WAQI_TOKEN) {
  console.error('❌ WAQI_TOKEN not found in environment variables');
  process.exit(1);
}

// 출력 디렉토리
const OUTPUT_DIR = path.join(__dirname, '../app/data/waqi');

// 주요 도시 목록 (전 세계 주요 도시)
const CITIES = [
  // 한국
  'seoul', 'busan', 'incheon', 'daegu', 'daejeon', 'gwangju', 'ulsan',
  
  // 아시아
  'beijing', 'shanghai', 'guangzhou', 'shenzhen', 'chengdu',
  'tokyo', 'osaka', 'delhi', 'mumbai', 'bangkok',
  'singapore', 'hong-kong', 'taipei', 'manila', 'jakarta',
  'hanoi', 'kuala-lumpur',
  
  // 유럽
  'london', 'paris', 'berlin', 'madrid', 'rome',
  'amsterdam', 'brussels', 'vienna', 'warsaw', 'prague',
  
  // 북미
  'new-york', 'los-angeles', 'chicago', 'houston', 'toronto',
  'vancouver', 'mexico-city',
  
  // 남미
  'sao-paulo', 'rio-de-janeiro', 'buenos-aires', 'santiago',
  
  // 오세아니아
  'sydney', 'melbourne', 'auckland',
  
  // 중동
  'dubai', 'riyadh',
  
  // 아프리카
  'cairo', 'johannesburg', 'nairobi'
];

/**
 * 특정 도시의 대기질 데이터 가져오기
 */
async function fetchCityData(city) {
  try {
    const url = `https://api.waqi.info/feed/${city}/?token=${WAQI_TOKEN}`;
    const response = await axios.get(url, {
      timeout: 10000  // 10초 타임아웃
    });
    
    if (response.data.status === 'ok') {
      const data = response.data.data;
      
      return {
        city: city,
        aqi: data.aqi,
        dominentpol: data.dominentpol || 'pm25',
        time: {
          s: data.time.s,
          tz: data.time.tz,
          v: data.time.v
        },
        location: {
          name: data.city.name,
          geo: data.city.geo,
          url: data.city.url
        },
        pollutants: {
          pm25: data.iaqi?.pm25?.v || null,
          pm10: data.iaqi?.pm10?.v || null,
          o3: data.iaqi?.o3?.v || null,
          no2: data.iaqi?.no2?.v || null,
          so2: data.iaqi?.so2?.v || null,
          co: data.iaqi?.co?.v || null
        },
        weather: {
          temperature: data.iaqi?.t?.v || null,
          pressure: data.iaqi?.p?.v || null,
          humidity: data.iaqi?.h?.v || null,
          wind: data.iaqi?.w?.v || null
        },
        attribution: data.attributions?.map(attr => ({
          name: attr.name,
          url: attr.url
        })) || []
      };
    } else {
      console.warn(`⚠️  ${city}: ${response.data.data}`);
      return null;
    }
  } catch (error) {
    if (error.response) {
      console.error(`❌ ${city}: HTTP ${error.response.status}`);
    } else if (error.code === 'ECONNABORTED') {
      console.error(`❌ ${city}: Timeout`);
    } else {
      console.error(`❌ ${city}: ${error.message}`);
    }
    return null;
  }
}

/**
 * 전 세계 지도 데이터 가져오기 (모든 측정소)
 */
async function fetchGlobalMap() {
  try {
    const url = `https://api.waqi.info/v2/map/bounds?latlng=-90,-180,90,180&token=${WAQI_TOKEN}`;
    const response = await axios.get(url, { timeout: 30000 });
    
    if (response.data.status === 'ok') {
      console.log(`✅ Global map: ${response.data.data.length} stations`);
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error('❌ Failed to fetch global map:', error.message);
    return [];
  }
}

/**
 * 메인 함수
 */
async function main() {
  console.log('🌍 AirLens WAQI Data Fetcher');
  console.log('=' .repeat(50));
  console.log(`📅 Started at: ${new Date().toISOString()}`);
  console.log(`🏙️  Cities to fetch: ${CITIES.length}`);
  console.log('');
  
  // 출력 디렉토리 생성
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`📁 Created directory: ${OUTPUT_DIR}`);
  }
  
  // 1. 주요 도시 데이터 수집
  console.log('📥 Fetching city data...');
  const results = [];
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < CITIES.length; i++) {
    const city = CITIES[i];
    process.stdout.write(`  [${i + 1}/${CITIES.length}] ${city}...`);
    
    const data = await fetchCityData(city);
    if (data) {
      results.push(data);
      successCount++;
      console.log(' ✅');
    } else {
      failCount++;
      console.log(' ❌');
    }
    
    // API rate limit 방지 (1초 대기)
    if (i < CITIES.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log('');
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log('');
  
  // 2. 전 세계 지도 데이터 수집 (옵션)
  console.log('🗺️  Fetching global map data...');
  const globalStations = await fetchGlobalMap();
  
  // 3. 결과 저장
  const timestamp = new Date().toISOString();
  const dateStr = timestamp.split('T')[0];
  
  // 도시별 데이터
  const cityOutput = {
    updated_at: timestamp,
    count: results.length,
    source: 'WAQI API',
    cities: results
  };
  
  // latest.json - 최신 데이터
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'latest.json'),
    JSON.stringify(cityOutput, null, 2)
  );
  console.log('💾 Saved: latest.json');
  
  // 날짜별 히스토리
  const historyDir = path.join(OUTPUT_DIR, 'history');
  if (!fs.existsSync(historyDir)) {
    fs.mkdirSync(historyDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(historyDir, `${dateStr}.json`),
    JSON.stringify(cityOutput, null, 2)
  );
  console.log(`💾 Saved: history/${dateStr}.json`);
  
  // 전 세계 측정소 데이터
  if (globalStations.length > 0) {
    const globalOutput = {
      updated_at: timestamp,
      count: globalStations.length,
      source: 'WAQI API (Global Map)',
      stations: globalStations.map(station => ({
        uid: station.uid,
        aqi: station.aqi,
        location: {
          lat: station.lat,
          lon: station.lon
        },
        station: station.station
      }))
    };
    
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'global-stations.json'),
      JSON.stringify(globalOutput, null, 2)
    );
    console.log(`💾 Saved: global-stations.json (${globalStations.length} stations)`);
  }
  
  // 통계 요약
  const stats = {
    last_updated: timestamp,
    total_cities: CITIES.length,
    successful: successCount,
    failed: failCount,
    global_stations: globalStations.length
  };
  
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'stats.json'),
    JSON.stringify(stats, null, 2)
  );
  console.log('💾 Saved: stats.json');
  
  console.log('');
  console.log('=' .repeat(50));
  console.log('✅ Data fetch completed!');
  console.log(`📊 Total files created: ${successCount > 0 ? 4 : 0}`);
  console.log(`📅 Finished at: ${new Date().toISOString()}`);
}

// 실행
main().catch(error => {
  console.error('');
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
