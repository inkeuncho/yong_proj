# 🌍 AirLens - See the Air

> **Interactive global air quality visualization**
> Real-time PM2.5 monitoring • AI-powered predictions • Advanced 3D visualization

[![Deploy](https://github.com/joymin5655/Finedust_proj/actions/workflows/deploy.yml/badge.svg)](https://github.com/joymin5655/Finedust_proj/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

**Live Demo:** [https://joymin5655.github.io/Finedust_proj/app/](https://joymin5655.github.io/Finedust_proj/app/)

---

## 🎯 What is AirLens?

AirLens transforms complex air quality data into an intuitive, beautiful 3D visualization. Using **official EU Copernicus CAMS data** (no API keys required), explore global PM2.5 levels in real-time, predict air quality from sky photos using AI, and discover pollution patterns across the globe - all on an interactive Earth globe.

### 🌟 Key Highlights

- **🇪🇺 Official EU Data**: Real-time data from EU Copernicus CAMS (ECMWF)
- **🌍 3D Globe Visualization**: 174+ cities worldwide with live PM2.5 data
- **📸 Camera AI**: Upload sky photos to predict PM2.5 using multimodal AI
- **🎨 Beautiful Interface**: Smooth animations, responsive design, dark mode

---

## ✨ Features

### 🌐 Interactive 3D Globe
Built with **Three.js**:
- **Realistic 3D Earth** with NASA Blue Marble texture
- **Color-coded PM2.5 markers** for 174+ cities
- **Country policy visualization** with historical trends
- **Smooth OrbitControls** for intuitive navigation
- **60 FPS rendering** using WebGL

### 📸 Camera AI - PM2.5 Predictor
**Sky Image Analysis with Machine Learning**:
- Upload sky photos to estimate PM2.5 levels
- Browser-based processing (no server uploads)
- Drag & drop support

### 📊 Data Analysis Tools
- **Global Statistics Dashboard**
- **Historical Timeline** (1990-2021)
- **WHO Air Quality Guidelines**
- **Interactive Charts**

---

## 🚀 Quick Start

### View Live
Visit: **[https://joymin5655.github.io/Finedust_proj/app/](https://joymin5655.github.io/Finedust_proj/app/)**

### Run Locally

```bash
# Clone the repository
git clone https://github.com/joymin5655/Finedust_proj.git
cd Finedust_proj

# Serve with any static server
python3 -m http.server 8000
# or
npx serve app

# Then open: http://localhost:8000/app/
```

---

## 🛠️ Technology Stack

### Frontend
- **Vanilla JavaScript** - Pure ES6+ JavaScript
- **Three.js** - 3D graphics and WebGL rendering
- **Chart.js** - Data visualization

### Visualization
- **Three.js Globe** - Interactive 3D Earth
- **WebGL** - Hardware-accelerated graphics
- **Custom shaders** - Realistic atmospheric effects

### Data Sources
- **EU Copernicus CAMS** - Official PM2.5 data (174+ cities)
- **WHO Guidelines** - Air quality standards
- **Historical Data** - Pollution trends (1990-2021)

---

## 📁 Project Structure

```
Finedust_proj/
├── app/                     # Main application
│   ├── index.html          # Home page
│   ├── globe.html          # 3D Globe view
│   ├── camera.html         # Camera AI predictor
│   ├── settings.html       # Settings
│   ├── about.html          # About page
│   ├── research.html       # Research data
│   ├── 404.html            # Error page
│   ├── css/                # Stylesheets
│   ├── js/                 # JavaScript modules
│   ├── data/               # Data files
│   ├── assets/             # Images & textures
│   └── public/             # Static assets
├── archive/                # Archived versions
└── README.md              # This file
```

---

## 🌍 Data Coverage

### Air Quality Monitoring
- **174+ Cities** worldwide
- **Real-time PM2.5 data** from EU Copernicus CAMS
- **Historical trends** from 1990-2021
- **WHO guideline comparisons**

### Countries Covered
Europe, North America, Asia, South America, Africa, Oceania

---

## 🎨 Screenshots

### 3D Globe View
Interactive Earth with real-time PM2.5 markers for 174+ cities.

### Camera AI Predictor
Upload sky photos to predict PM2.5 levels using machine learning.

### Dark Mode
Fully responsive dark mode for comfortable viewing.

---

## 📊 How It Works

### 1. Data Collection
- Fetches official EU Copernicus CAMS PM2.5 data
- No API keys required - public data source
- Updates automatically

### 2. 3D Visualization
- Renders Earth using NASA Blue Marble texture
- Maps PM2.5 data to 3D coordinates
- Color-codes markers by pollution level

### 3. Camera AI Prediction
- Analyzes sky photo characteristics
- Estimates PM2.5 from atmospheric opacity
- Browser-based ML processing

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **EU Copernicus CAMS** - Official PM2.5 data
- **NASA** - Earth textures
- **Three.js** - 3D rendering
- **Chart.js** - Data visualization

---

## 📧 Contact

- **GitHub**: [@joymin5655](https://github.com/joymin5655)
- **Project**: [AirLens](https://github.com/joymin5655/Finedust_proj)

---

**Made with ❤️ for a cleaner planet**
