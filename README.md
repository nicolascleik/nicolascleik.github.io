# Nicolas Cleik | Software Engineer Portfolio

![Project Status](https://img.shields.io/badge/status-live-success?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)
![Tech Stack](https://img.shields.io/badge/stack-Vanilla%20JS%20%7C%20CSS3%20%7C%20HTML5-orange?style=flat-square)

> A high-performance, data-driven portfolio engineered to demonstrate scalable frontend architecture fundamentals without the overhead of heavy frameworks.

🔗 **Live Demo:** [cleik.dev](https://cleik.dev)

---

## Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture & Engineering Decisions](#-architecture--engineering-decisions)
  - [Data-Driven UI (JSON Architecture)](#1-data-driven-ui-json-architecture)
  - [Custom Internationalization (i18n)](#2-custom-internationalization-i18n)
  - [Performance & Core Web Vitals](#3-performance--core-web-vitals)
- [Project Structure](#-project-structure)
- [Local Development](#-local-development)
- [Contact](#-contact)

---

## Overview

This project represents a transition from "clean code" to **scalable architecture**. The goal was to build a robust, responsive, and interactive Single Page Application (SPA) feel using only **Vanilla JavaScript**, ensuring maximum performance and complete control over the DOM.

The system is designed to be content-agnostic, meaning the UI renders dynamically based on structured data, effectively separating the **Data Layer** from the **View Layer**.

---

## Key Features

* **Dynamic Internationalization (i18n):** Full support for English and Portuguese, featuring automatic browser language detection and state persistence via LocalStorage.
* **JSON-Based Rendering:** All content (Profile, Projects, Experience) is fetched and rendered asynchronously from a structured JSON file.
* **Responsive & Adaptive:** Fluid layout optimized for 4K displays down to small mobile viewports, with specific touch-target adjustments.
* **Cyberpunk/Tech Aesthetic:** Custom CSS variables, neon accents, and a pure CSS 3D wireframe animation (No WebGL required).
* **Smart Modal System:**
    * **Hybrid PDF Viewer:** Detects mobile User-Agents to serve Google Docs Viewer, bypassing native browser limitations.
    * **Project Carousel:** Dynamic image slider for project showcases.
    * **Scroll Locking:** Enhanced UX preventing background scrolling when modals are active.
* **🔍 SEO Optimized:** Implements JSON-LD (Schema.org), Open Graph tags, Twitter Cards, and semantic HTML fallbacks for crawlers.

---

## Architecture & Engineering Decisions

### 1. Data-Driven UI (JSON Architecture)
Instead of hardcoding content into the HTML, this project implements a **Headless-like approach**.
* **Decision:** Decouple content from structure.
* **Implementation:** A `content.json` file acts as the database. The `script.js` fetches this data and hydrates the DOM.
* **Benefit:** Scalability. Adding a new project or updating a job description requires no code changes, only a JSON update.

### 2. Custom Internationalization (i18n)
* **Decision:** Avoid heavy libraries like `i18next` to keep the bundle size minimal.
* **Implementation:** A lightweight custom solution using `data-i18n` attributes.
    * **SEO Strategy:** The HTML is pre-populated with English content (Server-Side/Static simulation) to ensure search engine crawlers index the page correctly before JS execution.
    * **UX:** Automatic language detection based on `navigator.language`.

### 3. Performance & Core Web Vitals
* **Vanilla JS:** Removing framework overhead ensures sub-second Time-to-Interactive (TTI).
* **CSS Hardware Acceleration:** The 3D Cube animation uses `transform-style: preserve-3d` and GPU-accelerated properties, avoiding heavy JavaScript animations.
* **Cache Busting:** Asset versioning (`?v=1.x`) is implemented to ensure users always receive the latest build.

---

## Project Structure

```bash
/
├── index.html          # Semantic Markup & SEO Fallbacks
├── style/
│   └── style.css       # CSS Variables, Grid/Flexbox, Responsiveness
├── script/
│   └── script.js       # Controller Logic, Fetch API, i18n System
├── data/
│   └── content.json    # Structured Data Source (EN/PT)
└── assets/             # Optimized Media Resources

```

---

## Local Development

Since this project fetches data via `fetch()` API, you might encounter CORS policies if opening the `index.html` directly from the file system (`file://`).

To run it locally, use a simple HTTP server:

**Using Python:**

```bash
# Inside the project folder
python -m http.server 8000
# Access localhost:8000

```

**Using VS Code:**

1. Install the **Live Server** extension.
2. Right-click `index.html` and select **"Open with Live Server"**.

---

## Contact

**Nicolas Cleik** - Software Engineer

* [LinkedIn](https://www.linkedin.com/in/nicolascleik/)
* [GitHub](https://github.com/nicolascleik)
* [Email](mailto:nicolascleik@gmail.com)

---

*Designed & Engineered by Nicolas Cleik.*