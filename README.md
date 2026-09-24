# Storizine & BookForest

> **A modern Writer's Portfolio, Literary Magazine, and Personal Reading Sanctuary.**  
> Featuring an Author Showcase, Serialized Works Explorer, Goodreads-style Reading Tracker, Physical & Virtual Library Collection Manager, and AI-Powered Literary Companion.

---

## 📖 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
  - [1. Author Portfolio & Works Showcase](#1-author-portfolio--works-showcase)
  - [2. Storizine Literary Magazine & Serialized Works](#2-storizine-literary-magazine--serialized-works)
  - [3. BookForest Reading Tracker & Collection Shelves](#3-bookforest-reading-tracker--collection-shelves)
  - [4. Reader Graph Analytics & Printable PDF Reports](#4-reader-graph-analytics--printable-pdf-reports)
  - [5. Reading Goals & Custom Challenges](#5-reading-goals--custom-challenges)
  - [6. External Book & Social Integrations](#6-external-book--social-integrations)
  - [7. Gemini AI Reading Companion & Review Assistant](#7-gemini-ai-reading-companion--review-assistant)
  - [8. Protected Author CMS Dashboard & Data Portability](#8-protected-author-cms-dashboard--data-portability)
- [Technology Stack](#technology-stack)
- [Project Directory Structure](#project-directory-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Application](#running-the-application)
  - [Building for Production](#building-for-production)
- [API Documentation](#api-documentation)
- [Authentication & Access Control](#authentication--access-control)
- [Export & Backup Features](#export--backup-features)
- [License & Acknowledgements](#license--acknowledgements)

---

## Overview

**Storizine & BookForest** is an all-in-one web application built for authors, literary enthusiasts, and passionate book collectors. It seamlessly connects an author's public identity with an immersive reading log and community space:

1. **For Readers:** Discover published novels, browse serialized webfiction across English and Bengali, read sample chapters, explore curated quotes, and join literary clubs.
2. **For Book Collectors:** Track personal reading progress (Read, Currently Reading, Want to Read, DNF), record physical shelf locations, log specific edition details, and analyze reading moods and speeds with interactive charts.
3. **For Authors:** Manage bibliography, announce upcoming release milestones, update bio and social links, configure annual reading challenges, and export full library catalogs via JSON or CSV.

The app is crafted with a warm, bookish design language, featuring parchment tones, crisp typography, and full dark/light mode toggle support.

---

## Key Features

### 1. Author Portfolio & Works Showcase
- **Author Identity:** Comprehensive author bio, pen names, literary awards, social platform links (Wattpad, Webnovel, Facebook, Goodreads), and signature quotes.
- **Published Bibliography:** Filterable catalog of books with publication year, genres, cover art, page counts, ISBNs, and editorial reviews.
- **Interactive Sample Chapter Reader:** Distraction-free chapter reader overlay with progress bar, custom typography settings, and book excerpt preview.
- **Upcoming Releases & Milestones:** Timeline tracking for works-in-progress, cover reveals, ARC signups, and release dates.
- **Vendor Links:** Direct purchase and reading links (Amazon, Barnes & Noble, Wattpad, Webnovel, Smashwords, etc.).

### 2. Storizine Literary Magazine & Serialized Works
- **Curated Fiction Directory:** Hub for stories across fantasy, science fiction, thrillers, and young adult adventures.
- **Bilingual Work Support:** Rich metadata supporting dual English and Bengali titles, original series designations, and subcategories.
- **Reading Work Filter:** Fast searching by keyword, series, or genre tags.

### 3. BookForest Reading Tracker & Collection Shelves
- **Goodreads & StoryGraph Style Shelves:** Categorize titles under `Read`, `Currently Reading`, `Want to Read`, and `Did Not Finish (DNF)`.
- **Physical & Virtual Collection Tracker:** Track owned editions (`Hardcover`, `Paperback`, `Special Edition`, `Ebook`, `Audiobook`), shelf/room locations, and purchase costs.
- **Progress Tracking:** Live page counts, percentage sliders, date started, date finished, and read-count trackers (for re-readers).
- **Personal Literary Journal:** 5-star ratings, comprehensive reviews, favorite quotes collection, and custom tags.

### 4. Reader Graph Analytics & Printable PDF Reports
- **Executive Summary:** Live statistical overview tracking total library count, finished books, total pages read, average star rating, and goal completion rates.
- **Visual Analytics:** Interactive Recharts visualizations:
  - Reading Status Distribution (Donut Chart)
  - Owned Edition Formats Breakdown (Bar Chart)
  - Narrative Moods & Atmospheric Tones (Pacing analysis)
  - Reading Pace & Speed Metrics (Fast, Average, Slow)
  - Page Count Length Spread (<200, 200–350, 350–500, 500+ pages)
- **Printable PDF Export:** Fully configured `@media print` stylesheets allowing readers to generate clean, printer-friendly PDF reading summaries with one click.

### 5. Reading Goals & Custom Challenges
- **Annual Targets:** Set and update yearly book completion goals and total page targets.
- **Custom Reading Marathons:** Create dynamic milestones (e.g., *"Finish 5 Sci-Fi Classics"*, *"Read 10 Books Over 500 Pages"*, *"Complete Non-Fiction Sprint"*).
- **Dynamic Counters:** Increment/decrement progress counts directly with automatic completion badge status.
- **BookForest Preview:** Direct integration of goal progress cards within the BookForest statistics dashboard.

### 6. External Book & Social Integrations
- **Project Gutenberg Classics:** Discover and import public domain masterworks directly into your BookForest shelves.
- **Open Library Search:** Search millions of titles by title/author with one-click catalog import.
- **The StoryGraph Mood Explorer:** Explore reading stats categorized by emotional moods, pace, and length distributions.
- **Fable Social Reading Lounge & Book Clubs:** Join community discussions, read along with featured book clubs, and share notes with fellow readers.
- **Goodreads Choice Awards & Quotes:** Curated showcases of award-winning literature and inspiring literary quotes.

### 7. Gemini AI Reading Companion & Review Assistant
Powered by the server-side **Google Gemini 2.5 Flash** model via the `@google/genai` SDK:
- **AI Review Polish:** Transforms quick, unpolished bullet points into structured 2-paragraph literary critiques with identified themes and atmospheric reading vibes.
- **Personalized Recommendations:** Analyzes user reading history and preferred genres to recommend tailored titles with rationale and vibe tags.
- **One-Click Wishlist Addition:** Directly add recommended books into the *Want to Read* shelf.

### 8. Protected Author CMS Dashboard & Data Portability
- **Passcode Authentication:** Secure access to author content management features.
- **Author Profile CMS:** Update author name, title, bio, avatar URL, social links, and featured quote in real-time.
- **Bibliography & Milestones Editor:** Add, edit, or delete published books and upcoming titles.
- **Complete Data Export:**
  - **JSON Backup:** Full snapshot of your BookForest library for safe offline storage.
  - **CSV Export:** Formatted spreadsheet file ready for Excel, Google Sheets, or Notion import.

---

## Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Routing** | [React Router v7](https://reactrouter.com/) |
| **Build Tool & Bundler** | [Vite 6](https://vitejs.dev/) + [esbuild](https://esbuild.github.io/) |
| **Styling & CSS** | [Tailwind CSS v4](https://tailwindcss.com/) with `@tailwindcss/vite` |
| **Icons & UI** | [Lucide React](https://lucide.dev/), [Motion](https://motion.dev/) |
| **Data Visualization** | [Recharts](https://recharts.org/) |
| **Markdown Rendering** | [react-markdown](https://github.com/remarkjs/react-markdown) |
| **Backend & Server** | [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/) with `tsx` |
| **Artificial Intelligence** | [Google GenAI SDK](https://www.npmjs.com/package/@google/genai) (`gemini-2.5-flash`) |

---

## Project Directory Structure

```text
├── .env.example                 # Example environment variables definition
├── .gitignore                   # Git ignore patterns
├── index.html                   # HTML entry point with metadata & fonts
├── metadata.json                # Applet configuration & server capability flags
├── package.json                 # Project dependencies and npm scripts
├── server.ts                    # Express server with Vite middleware & Gemini AI endpoints
├── tsconfig.json                # TypeScript compiler configuration
├── vite.config.ts               # Vite bundler configuration with Tailwind CSS plugin
│
└── src/
    ├── main.tsx                 # React DOM mount point & BrowserRouter
    ├── App.tsx                  # Core application routes, modal state, and layout
    ├── index.css                # Global styles, Tailwind directives & print rules
    ├── types.ts                 # TypeScript type definitions & interfaces
    │
    ├── components/
    │   ├── Header.tsx                     # Top navigation, search bar, dark mode & user menu
    │   ├── PortfolioView.tsx              # Public author portfolio, bibliography & upcoming works
    │   ├── StorizineView.tsx              # Literary magazine, serialized fiction & stories hub
    │   ├── BookForestView.tsx             # Goodreads-style reading tracker, shelves & stats
    │   ├── ReaderGraphSection.tsx         # Comprehensive visual analytics & printable PDF reports
    │   ├── WriterDashboardView.tsx        # Author CMS portal, bibliography editor & goal settings
    │   ├── AICompanionModal.tsx           # Gemini-powered book advisor & review generator
    │   ├── AddBookForestModal.tsx         # Add or edit BookForest reading entries
    │   ├── AddPublishedBookModal.tsx      # Add books to author portfolio/upcoming works
    │   ├── SampleChapterModal.tsx         # Distraction-free chapter preview reader
    │   ├── LoginModal.tsx                 # Passcode authentication modal for author portal
    │   ├── GutenbergClassicsModal.tsx     # Project Gutenberg public domain classic browser
    │   ├── OpenLibraryModal.tsx           # Open Library book search and import modal
    │   ├── StoryGraphModal.tsx            # StoryGraph-inspired reading metrics modal
    │   ├── FableLoungeModal.tsx           # Fable-style reading clubs and social lounge
    │   ├── ClubsSection.tsx               # Community book club discussions
    │   ├── GoodreadsChoiceAwardsSection.tsx # Award-winning books showcase
    │   ├── GoodreadsQuotesSection.tsx     # Literary quotes collection & copy tool
    │   ├── GoodreadsYearInBooksSection.tsx # Year in review visual showcase
    │   └── LibrarySection.tsx             # Physical and virtual collection manager
    │
    ├── data/
    │   ├── initialData.ts                 # Default author profile, books, and library data
    │   ├── storizineData.ts               # Storizine works, chapters, and series info
    │   ├── goodreadsData.ts               # Curated quotes and award categories
    │   └── gutenbergClassics.ts           # Curated public domain titles
    │
    └── utils/
        └── exportUtils.ts                 # JSON and CSV export generators for BookForest
```

---

## Getting Started

### Prerequisites
- **Node.js**: Version 18.0.0 or higher
- **npm** or **bun**: Package manager

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mAh1Abdullah/Storizine.git
   cd Storizine
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

### Environment Variables

Create a `.env` file in the root directory based on `.env.example`:

```bash
cp .env.example .env
```

Populate the following variables:

```env
# Gemini API Key for AI Reading Companion & Review Assistant
GEMINI_API_KEY="your-gemini-api-key-here"

# Application URL
APP_URL="http://localhost:3000"
```

> **Note:** The core portfolio, reading tracker, and catalog features function completely offline without an API key. An API key is only required for the optional AI Companion and Review Polish assistant.

### Running the Application

Start the full-stack development server (Express + Vite on port 3000):

```bash
npm run dev
```

Open your browser and navigate to:
```
http://localhost:3000
```

### Building for Production

To create an optimized production build:

```bash
npm run build
```

This compiles both the client-side SPA into `/dist` and bundles `server.ts` into `/dist/server.cjs`.

To run the production server:

```bash
npm start
```

---

## API Documentation

The server exposes backend routes via Express:

### 1. Health Check
- **Endpoint:** `GET /api/health`
- **Description:** Verifies server status and Gemini API key availability.
- **Response:**
  ```json
  {
    "status": "ok",
    "geminiConfigured": true,
    "app": "Writer's Portfolio & BookForest Engine"
  }
  ```

### 2. AI Review Assistant
- **Endpoint:** `POST /api/ai/review-assistant`
- **Description:** Generates a refined, eloquent book review based on the reader's rough thoughts.
- **Request Body:**
  ```json
  {
    "bookTitle": "The Chronos Whisperer",
    "author": "mAh Abdullah",
    "userRating": 5,
    "notes": "Incredible clockwork worldbuilding, loved the protagonist's journey through time."
  }
  ```
- **Response Body:**
  ```json
  {
    "success": true,
    "data": {
      "polishedReview": "...",
      "keyThemes": ["Temporal Mechanics", "Victorian Intrigue"],
      "suggestedReadingVibe": "Rainy Sunday with Earl Grey tea",
      "memorableTakeaway": "A haunting reflection on the cost of mastering time."
    }
  }
  ```

### 3. AI Book Recommendations
- **Endpoint:** `POST /api/ai/recommend-books`
- **Description:** Suggests books to add to the user's *Want to Read* list based on their reading history and taste.
- **Request Body:**
  ```json
  {
    "readHistory": [
      { "title": "Dune", "genre": "Sci-Fi", "userRating": 5 },
      { "title": "Project Hail Mary", "genre": "Sci-Fi", "userRating": 5 }
    ],
    "preferredGenres": ["Science Fiction", "Speculative Fiction", "Adventure"]
  }
  ```
- **Response Body:**
  ```json
  {
    "success": true,
    "data": {
      "recommendations": [
        {
          "title": "Children of Time",
          "author": "Adrian Tchaikovsky",
          "genre": "Science Fiction",
          "blurb": "An epic journey of evolution and humanity's survival.",
          "whyRecommended": "Matches your appreciation for vast scale and thoughtful speculative biology.",
          "vibeTag": "Mind-bending Worldbuilding"
        }
      ]
    }
  }
  ```

---

## Authentication & Access Control

- **Public Routes:**
  - `/` (Home / Author Portfolio)
  - `/storizine` (Literary magazine, serialized works, and excerpt viewer)
- **Protected Routes:**
  - `/bookforest` (Personal reading shelves, collection logs, and stats)
  - `/account` (Author CMS dashboard, bibliography editor, and goal management)
- **Authentication Mechanism:**
  - Interactive passcode modal (`LoginModal`).
  - In demo/development mode, entering any passcode or clicking **"Quick Demo Login"** immediately unlocks the portal.

---

## Export & Data Portability

Data ownership and privacy are first-class citizens in BookForest:

1. **JSON Backup (`BookForest_Library_Backup_YYYY-MM-DD.json`):**
   - Exports the complete schema including ratings, custom tags, review notes, progress pages, and shelf locations.
2. **CSV Spreadsheet (`BookForest_Library_Export_YYYY-MM-DD.csv`):**
   - Clean, tabular export with proper quotation escaping for Excel, Google Sheets, or Notion databases.
3. **Printable Executive Analytics:**
   - Dedicated print stylesheet (`@media print`) enables clean browser PDF export (`Ctrl+P` / `Cmd+P` or via the **"Print / Save PDF Report"** button).

---

## License & Acknowledgements

- **Author & Creator:** [mAh Abdullah](https://github.com/mAh1Abdullah)
- **Design Inspiration:** Curated bookish interfaces inspired by Goodreads, The StoryGraph, and Fable.
- **Typography:** Serif & handwriting font pairings tailored for warm reading atmospheres.
- **Public Domain Classics:** Powered by metadata from [Project Gutenberg](https://www.gutenberg.org/) and [Open Library](https://openlibrary.org/).
