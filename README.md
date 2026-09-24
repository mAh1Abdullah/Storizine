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
- **Book Lending Tracker (BookBuddy+ Feature):** Track loaned books with borrower name, contact information (email/phone), loan date, and due date. Features a dedicated "Lent Out" filter tab and one-click book return flow directly on book cards.
- **Mobile Barcode Scanning (BookBuddy+ Feature):** Client-side ISBN camera barcode scanner powered by `html5-qrcode`. Point your camera at any physical book barcode to instantly resolve metadata (title, author, cover, page count, and edition details) from Open Library. Includes quick test simulation for non-camera environments.
- **Physical & Virtual Collection Tracker:** Track owned editions (`Hardcover`, `Paperback`, `Special Edition`, `Ebook`, `Audiobook`), shelf/room locations, and purchase costs.
- **Progress Tracking:** Live page counts, percentage sliders, date started, date finished, and read-count trackers (for re-readers).
- **Guided Journal Prompts & Aesthetic Planner View (Goodnotes Feature):** Expand reviews with structured dropdowns for *Plot Twist Rating*, *Pacing & Atmospheric Tone*, *Would I Re-read?*, *Emotional Impact*, and *Worldbuilding Notes*. Includes an **"Export Aesthetic Journal Card"** generator that renders Goodnotes-style digital planner sheets and exports high-DPI PNG graphics or printable PDFs via `html-to-image`.

### 4. Reader Graph Analytics & Printable PDF Reports
- **Executive Summary:** Live statistical overview tracking total library count, finished books, total pages read, average star rating, and goal completion rates.
- **"Ahead / Behind" Schedule Metric (Goodreads Feature):** Real-time reading pace calculation based on the day of the year:
  $$\text{Expected} = \text{Annual Goal} \times \left(\frac{\text{Current Day of Year}}{365}\right)$$
  Displays dynamic color-coded pace alerts (e.g. *"🎉 You are 2 books ahead of schedule!"* or *"⏳ You are 1 book behind schedule"*) on the reading challenge card.
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
- **Live Community Rating Lookups (Goodreads Feature):** Live public consensus ratings and reader review counts queried from Open Library and Google Books API directly inside the search modal (`OpenLibraryModal.tsx`), allowing users to verify community acclaim before saving or purchasing.
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

### 4. Language Assistant & Inline Term Explainer
- **Endpoint:** `POST /api/ai/explain-term`
- **Description:** Returns contextual definitions, etymology, and historical literary background for highlighted words or passages using Gemini 2.5 Flash.
- **Request Body:**
  ```json
  {
    "term": "palimpsest",
    "contextSentence": "The ancient city was a palimpsest of forgotten empires.",
    "bookTitle": "The Chronicler of Veridia",
    "author": "Evelyn Vance"
  }
  ```
- **Response Body:**
  ```json
  {
    "success": true,
    "data": {
      "term": "palimpsest",
      "partOfSpeech": "noun",
      "definition": "A manuscript or piece of writing material on which later writing has been superimposed on effaced earlier writing.",
      "historicalContext": "Common in medieval monastic libraries where parchment was scarce and reused.",
      "etymology": "From Ancient Greek παλίμψηστος (palímpsēstos), from palin ('again') + psēstos ('scraped').",
      "literarySignificance": "Evokes themes of hidden memory, multi-layered history, and the persistence of the past."
    }
  }
  ```

### 5. File Bucket & Upload API (.epub / .pdf)
- **Endpoint:** `POST /api/upload`
- **Description:** Stores uploaded `.epub` and `.pdf` files onto the persistent backend storage.
- **Request Body:**
  ```json
  {
    "filename": "my-novel.epub",
    "fileData": "data:application/epub+zip;base64,...",
    "fileType": "epub"
  }
  ```
- **Endpoint:** `GET /api/files/:filename`
- **Description:** Streams uploaded book files with byte-range requests and correct MIME headers (`application/epub+zip` or `application/pdf`).

### 6. Annotations & Highlighting Table API
- **Endpoint:** `GET /api/annotations?bookId=:id`
- **Endpoint:** `POST /api/annotations`
- **Schema:**
  ```sql
  CREATE TABLE annotations (
    id UUID PRIMARY KEY,
    book_id UUID REFERENCES books(id),
    user_id UUID REFERENCES users(id),
    cfi_range TEXT NOT NULL,
    color VARCHAR(20) DEFAULT 'yellow',
    note TEXT,
    highlighted_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```

### 7. Real-Time Reading Position Sync
- **Endpoint:** `GET /api/reading-progress/:bookId`
- **Endpoint:** `POST /api/reading-progress`
- **Description:** Debounced sync saving the exact EPUB Canonical Fragment Identifier (`cfi`) and completion percentage, allowing seamless cross-device resumption via `initialLocation={savedCfi}`.

---

## 🖥️ Readest & Foliate Core Reader Engine

Storizine embeds the **Foliate Core Reader** inside an iframe-isolated container:
- **Iframe CSS Isolation:** Completely insulates the reading canvas from host stylesheet interference, providing clean reflowable pagination.
- **Multi-Format Binding:** Reads local and remote `.epub`, `.pdf`, `.txt`, `.markdown`, and `.mobi` files.
- **Display Toolbar:**
  - **Font Size Scaler:** 12pt to 72pt range.
  - **Line Height:** 1.0x to 2.8x fine slider.
  - **Page Margin Padding:** 12px to 96px for full-bleed or narrow columns.
  - **Themes:** *Parchment (Day)*, *Sepia (Warm Book Paper)*, *Night (Slate)*, *OLED Night (True #000000 Black)*, and *Warm Amber (Blue-Light Shift)*.
  - **Typefaces:** *Merriweather*, *Georgia*, *Inter*, *OpenDyslexic*, *Cinzel*, and *Fira Code*.

### 🔍 Readest WordLens & Gemini AI Contextual Selection
- **Offline WordLens:** Highlight any single word to pull instant definitions, phonetic pronunciations, grammar tags, and Bengali translations directly from `data/wordlens/*.json` without network access.
- **Gemini Literary Subtext & Themes (`POST /api/ai/explain`):** Highlight any sentence or paragraph to trigger Gemini Flash, unpacking literary subtext, identifying motifs, and translating between English and Bengali.
- **Native Browser Text-to-Speech (TTS):** Audio narration using `window.speechSynthesis`.

---

## 📦 Tauri v2 Desktop & Mobile Packaging

Adopted the Readest Tauri v2 configuration (`src-tauri/tauri.conf.json` & `src-tauri/Cargo.toml`):
- **Local File Associations:** Registers `.epub`, `.pdf`, `.mobi`, `.txt`, and `.markdown` as system-level document types.
- **Cross-Platform Native Installers:**
  - macOS: `.dmg`
  - Windows: `.exe` / `.msi`
  - Linux: `.deb` / `.AppImage`
  - Android: `.apk`
- **Build Command:**
  ```bash
  npm run build:client
  cargo tauri build
  ```

---

## 📱 Progressive Web App (PWA) & Offline Reading

Storizine is a fully compliant Progressive Web App:
- **Offline Reading Engine:** Parsed books, excerpts, notes, and CFI positions are cached in the browser's **IndexedDB** (`idb`).
- **Service Worker Caching:** Handled automatically by `vite-plugin-pwa` with CacheFirst policies for fonts, scripts, and static assets.
- **Installability:** One-click install prompt on Chrome, Edge, and Android, plus step-by-step "Add to Home Screen" instructions for iOS Safari.
- **Offline Mode Indicator:** Non-intrusive status banner alerts the reader when navigating without network connectivity.

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
