# Bytecare NJ Technology — Technical Architecture & Codebase Documentation

> **Status:** Production Ready  
> **Location:** Bullapar, VIP, 1st floor, Near Basuda Sweet, Kamrup (R), Assam 781015  
> **Contact:** WhatsApp / Primary: `+91 86385 94006` | Alternate: `+91 97077 01954`  
> **Lead Technician / Founder:** Jyotimoni Bezbaruah  
> **Design Theme:** Cyber Navy & Neon Teal (Kamrup (R), Assam) — Light & Dark Mode Enabled

---

## Table of Contents
1. [Executive Overview](#1-executive-overview)
2. [High-Level Architecture & Technology Stack](#2-high-level-architecture--technology-stack)
3. [Core Workings & Functional Modules](#3-core-workings--functional-modules)
   - [3.1 Service Catalog & Presentation](#31-service-catalog--presentation)
   - [3.2 Live Repair Tracking Portal](#32-live-repair-tracking-portal)
   - [3.3 Online Booking & Site Survey Engine](#33-online-booking--site-survey-engine)
   - [3.4 Interactive Floating WhatsApp Support Widget](#34-interactive-floating-whatsapp-support-widget)
   - [3.5 Workshop Gallery & Lead Technician Showcase](#35-workshop-gallery--lead-technician-showcase)
   - [3.6 Customer Feedback & Review Moderation System](#36-customer-feedback--review-moderation-system)
   - [3.7 Contact, Geolocation & Routing Engine](#37-contact-geolocation--routing-engine)
   - [3.8 Shop Administration Dashboard](#38-shop-administration-dashboard-adminhtml)
4. [Design System, Aesthetics & Motion Language](#4-design-system-aesthetics--motion-language)
   - [4.1 Light & Dark Mode Theme Architecture](#41-light--dark-mode-theme-architecture)
   - [4.2 Color Palette & Semantic Tokens](#42-color-palette--semantic-tokens)
   - [4.3 Typography Hierarchy](#43-typography-hierarchy)
   - [4.4 Micro-Interactions, Motions & Animations](#44-micro-interactions-motions--animations)
   - [4.5 Full Viewport Responsive Layout](#45-full-viewport-responsive-layout)
5. [Data Architecture & REST API Specification](#5-data-architecture--rest-api-specification)
   - [5.1 Database Model & Persistence Layer](#51-database-model--persistence-layer)
   - [5.2 Public Endpoints](#52-public-endpoints)
   - [5.3 Protected Admin Endpoints](#53-protected-admin-endpoints)
6. [Deployment & Operations](#6-deployment--operations)

---

## 1. Executive Overview

**Bytecare NJ Technology** is a full-stack web application designed for a premier computer hardware repair, IT maintenance, and surveillance installation center operating in **Kamrup (R), Assam** (Shop Address: *Bullapar, VIP, 1st floor, Near Basuda Sweet, Assam 781015*), founded and managed by lead hardware engineer **Jyotimoni Bezbaruah**.

The website serves two key roles:
1. **Customer-Facing Portal (`/` or `/index.html`)**: Allows residents, institutions, and businesses in Kamrup (R) to explore IT hardware repair services, book repair pickups or CCTV site surveys, track ongoing repairs live with tracking numbers or phone numbers, view authentic workbench photos, read customer reviews, and initiate instant encrypted conversations over WhatsApp (+91 86385 94006).
2. **Shop Operations Admin Portal (`/admin.html`)**: Enables shop technicians to authenticate, view real-time repair metrics, advance repair ticket statuses (from diagnosis to completion), log internal diagnostic notes, set pricing, triage contact inquiries, manage service showcase images (including CCTV and Passport Photo printing), update the owner profile in the Why Us section, and moderate customer reviews before publication. Admin access is discreetly decoupled from public navigation.

---

## 2. High-Level Architecture & Technology Stack

The project follows a lean, high-performance architecture optimized for sub-second load times, high SEO visibility, zero build step requirements, and dual-mode runtime (standalone Node.js server or serverless cloud deployment).

```
                      +------------------------------------------+
                      |               Client Browser             |
                      |  - HTML5 Semantic Structure              |
                      |  - Custom CSS3 Design System (Vanilla)   |
                      |  - Light & Dark Mode Engine (Vanilla)    |
                      |  - ES6+ Client Runtime (app.js/admin.js) |
                      +--------------------+---------------------+
                                           |
                    HTTP / HTTPS Requests  |  REST API / Static Assets
                                           v
    +--------------------------------------------------------------------------+
    |                         Hosting & Runtime Layer                          |
    |                                                                          |
    |   [Option A: Local / VPS Server]     |   [Option B: Serverless Netlify]  |
    |   - Node.js Runtime                  |   - Netlify Edge CDN (public/)    |
    |   - Express.js (server.js)           |   - AWS Lambda (functions/api.js) |
    |   - Serving public/ on PORT 3000     |   - serverless-http wrapper       |
    +--------------------------------------+-----------------------------------+
                                           |
                                           v
    +--------------------------------------------------------------------------+
    |                      Data Persistence Layer (`db.js`)                    |
    |   - Atomic File-backed JSON store (`data/db.json`)                       |
    |   - Auto-initialization with Kamrup (R) seed records                     |
    |   - Dynamic service images & owner profile persistence                   |
    |   - Zero native external dependencies (uses Node.js `fs` & `path`)       |
    +--------------------------------------------------------------------------+
```

### Technology Highlights
- **Backend Runtime**: Node.js & Express (`server.js`)
- **Serverless Bridge**: `serverless-http` via `functions/api.js` configured with `netlify.toml`
- **Data Engine**: File-based JSON database abstraction (`db.js`) located at `data/db.json`
- **Frontend Core**: Vanilla Semantic HTML5, Vanilla Modern CSS3 (BEM-inspired utility tokens), and modular Vanilla ES6+ JavaScript (`public/js/app.js` and `public/js/admin.js`)
- **Third-Party Integrations**: WhatsApp Click-to-Chat API (`wa.me/918638594006`), Google Fonts (`Chakra Petch`, `Inter`, `IBM Plex Mono`), Google Maps Embed API

---

## 3. Core Workings & Functional Modules

### 3.1 Service Catalog & Presentation
The catalog highlights four specialized services offered at the Kamrup (R) bench:
1. **Laptop Repair**: Screen & LCD swaps, chip-level motherboard restoration, hinge fabrication, battery/thermal overhauls. Multi-image showcase.
2. **PCs Repair**: Custom rigs, SMPS & power supply voltage repair, malware/ransomware removal, RAM/NVMe speed tuning. Multi-image showcase.
3. **Passport Size Photo Printing**: Instant 5–10 minute high-gloss official prints (passport, visa, stamp size) with WhatsApp soft-copy delivery. Dedicated photographic studio setup images.
4. **CCTV Installation**: Free on-site survey in Kamrup (R), 1080p/4K IP camera setups, DVR/NVR surveillance hard drive configurations, and smartphone live streaming. Dedicated surveillance installation images.

Each service card features interactive multi-image carousel navigation (dots and arrow controls), technical spec bullets, pricing/turnaround tags, and direct booking modal triggers.

### 3.2 Live Repair Tracking Portal
Customers can check their repair status without calling the shop.
- **Search Identifiers**: Works with either a **Tracking ID** (format: `BC-XXXX-KMR`, e.g., `BC-8942-KMR`) or a **10-digit mobile number** (e.g., `8638594006` or `9707701954`).
- **Real-Time Visual Stepper**: Displays a 5-step progress bar:
  1. `Received` (Pending initial intake)
  2. `Diagnosing` (Technician inspecting rails, voltage, components)
  3. `In Repair` (Parts replaced, soldering, firmware re-flash)
  4. `Ready Pickup` (QA tested, cleaned, awaiting customer pickup)
  5. `Delivered` (Paid and collected)
- **Technician Notes & Estimated Cost**: Pulls live diagnostic updates entered by the technician alongside the estimated total cost in INR (₹).
- **Direct WhatsApp Escalation**: Each tracked ticket result renders a direct WhatsApp link to `+91 86385 94006` pre-filled with the exact Ticket ID and device model for fast chat with Jyotimoni Bezbaruah.

### 3.3 Online Booking & Site Survey Engine
Users can schedule a repair drop-off or request a CCTV security survey through a clean modal dialog.
- **Workflow**:
  1. User enters name, mobile number, optional email, device model, and problem summary.
  2. Frontend sends a `POST` request to `/api/bookings`.
  3. Backend generates a unique tracking code via `generateTrackingId()` (`BC-<4-random-digits>-KMR`).
  4. The record is prepended to `data/db.json` with status `Pending`.
  5. The modal closes, a success toast notification appears, the Tracking ID is automatically loaded into the Tracker Widget, and the screen scrolls smoothly to the tracking section.

### 3.4 Interactive Floating WhatsApp Support Widget
WhatsApp communication is directed to **+91 86385 94006**.
- **Radar Pulse Wave**: The floating button features an animated radar wave (`@keyframes wa-pulse`) and an unread message badge (`1`) to catch visitor attention.
- **Expandable Support Drawer**:
  - Displays an avatar with an active green "Online" status indicator.
  - Features an introductory greeting: *Welcome to Bytecare NJ Technology (Kamrup R)*.
  - **Quick Action Chips**: One-tap pre-written messages:
    - 💻 *Laptop / PC Repair Quote*
    - 📹 *CCTV Installation & Survey in Kamrup (R)*
    - 🖨️ *Passport Size Photo Printing*
    - 🔍 *Track My Repair Ticket*
  - **Custom Message Field**: Allows custom text typing; pressing "Enter" or clicking the send button encodes the URI and launches WhatsApp directly.
- **Shop Contact**: Automatically targets `+91 86385 94006`.

### 3.5 Workshop Gallery & Lead Technician Showcase
To establish trust over generic service websites, the page showcases authentic, unedited workshop photographs taken at the facility:
- ThinkPad FHD screen panel swap
- Dell motherboard copper heatsink & chip-level rebuild
- Commercial CCTV Security System Monitoring Hub
- Passport Size Photo Printing Studio
- PC RGB cooler bench testing & SMPS multimeter diagnostic
- Jyotimoni Bezbaruah at the tech counter & diagnostics desk
- 1TB WD storage & DDR4 RAM installations
- HP ProBook thermal paste refresh

### 3.6 Customer Feedback & Review Moderation System
- **Public Feed**: Fetches approved testimonials via `GET /api/reviews`, rendering star ratings, customer feedback quotes, and localized tags (e.g., "VIP Road, Kamrup (R)", "Mirza, Kamrup (R)", "Palashbari").
- **Review Submission Modal**: Allows customers to submit their experience, star rating (1 to 5), and service type.
- **Moderation Workflow**: Newly submitted reviews are stored with `approved: false` and are kept hidden from the public feed until authorized by the shop administrator in the admin dashboard.

### 3.7 Contact, Geolocation & Routing Engine
- **Direct Phone Dialers**: One-touch call buttons for primary (`+91 86385 94006`) and alternate lines (`+91 97077 01954`).
- **Interactive Inquiry Form**: Submits messages to `/api/contact` or launches pre-filled WhatsApp conversations to `8638594006`.
- **Embedded Google Maps**: Interactive Google Maps iframe focused on Bullapar, VIP, Near Basuda Sweet, Kamrup (R), Assam (PIN: 781015) alongside an external deep-link button for turn-by-turn driving directions.

### 3.8 Shop Administration Dashboard (`/admin.html`)
The back-office admin portal is accessible at `/admin.html` (or `/admin`, or via keyboard shortcut `Ctrl+Shift+A`):
- **Authentication**: Secured with password verification against `ADMIN_PASSWORD` (default: `admin123`). Returns an administrative Bearer token saved in `localStorage`.
- **Live Counter Cards**: Total Repairs, Active Jobs, Ready for Pickup, Unread Inquiries.
- **Tab 1 — Repair & CCTV Job Tickets**: Update statuses, technician internal notes, estimated costs.
- **Tab 2 — Services & Multi-Image Gallery Manager**: View all services, manage multiple images per service, pick presets (CCTV setup, passport photo studio, etc.), add new URLs, and remove images.
- **Tab 3 — Owner Profile Manager**: View and modify the owner/lead technician photo, founder name, title, and bio for the "Why Us" section.
- **Tab 4 — Customer Inquiries**: Manage unread contact messages and toggle to replied.
- **Tab 5 — Moderate Reviews**: Approve or reject user reviews.

---

## 4. Design System, Aesthetics & Motion Language

### 4.1 Light & Dark Mode Theme Architecture
- Integrated dual-theme support using native CSS custom properties and `data-theme` attribute on `<html>`.
- Zero Flash of Unstyled Content (FOUC) ensured via pre-render `<script>` in `<head>`.
- Toggle button in the navbar with Sun/Moon icons, smooth 20° rotation and scale animation on hover.
- Theme preference is automatically saved to `localStorage.getItem('bytecare-theme')` and respects `prefers-color-scheme`.

### 4.2 Color Palette & Semantic Tokens
- **Primary Accent**: Neon Teal (`#17b6d4`), Hover: `#1cd7fa`, Glow: `rgba(23, 182, 212, 0.35)`
- **Cyber Navy Darkest**: `#061530` / `#050e21`
- **Cyber Navy Brand**: `#0b2a52` (Light mode) / `#7fe3ef` (Dark mode headers)
- **Backgrounds**:
  - Light mode: Body `#f8fafc`, Card `#ffffff`, Light Section `#f0f6fc`
  - Dark mode: Body `#050e21`, Card `#091f42`, Light Section `#061530`
- **Status Palette Tokens**:
  - Pending: Amber Gold (`#f59e0b`)
  - Diagnosing: Electric Blue (`#3b82f6`)
  - In Repair: Royal Violet (`#8b5cf6`)
  - Ready for Pickup: Emerald Green (`#10b981`)
  - Completed: Cyan Teal (`#06b6d4`)
  - Unread / Alert: Crimson Red (`#ef4444`)

### 4.3 Typography Hierarchy
1. Display / Brand: `'Chakra Petch', sans-serif`
2. Body Copy: `'Inter', sans-serif`
3. Monospace / Telemetry: `'IBM Plex Mono', monospace`

### 4.4 Micro-Interactions, Motions & Animations
- Full hardware bench boot sequence with animated oscilloscope and reticles.
- Pulsing live system status dot.
- Spring-curve WhatsApp chat widget drawer.
- Interactive multi-image service slides with smooth cross-fade.
- Smooth scrolling (`scroll-behavior: smooth`) with `scroll-padding-top: 85px` for sticky header offset.
- Floating "Back to Top" button with smooth elevation and fade.

### 4.5 Full Viewport Responsive Layout
- Fluid container with `max-width: min(1560px, 95vw)` and `clamp(1rem, 2.5vw, 2.5rem)` padding, expanding gracefully across ultra-wide monitors without cramped artificial bounds.
- Edge-to-edge navbar spanning full viewport width.
- Responsive mobile menu drawer with backdrop blur and touch targets.

---

## 5. Data Architecture & REST API Specification

### 5.1 Public Endpoints

| Method | Endpoint | Description | Payload / Params |
|---|---|---|---|
| `GET` | `/api/services` | Retrieve list of shop services with multiple images | None |
| `GET` | `/api/owner` | Retrieve owner/founder profile details for Why Us | None |
| `POST` | `/api/bookings` | Create new repair or survey booking | `{ customerName, phone, email, serviceType, deviceModel, problemDescription }` |
| `GET` | `/api/bookings/track/:identifier` | Search repair tickets by ID or phone number | `identifier` (e.g. `BC-8942-KMR` or `8638594006`) |
| `POST` | `/api/contact` | Submit general contact inquiry | `{ name, phone, email, subject, message }` |
| `GET` | `/api/reviews` | Retrieve approved customer reviews | None (filters `approved === true`) |
| `POST` | `/api/reviews` | Submit new customer review for moderation | `{ name, location, rating, comment, service }` |
| `GET` | `/api/gallery-images` | List available image files in `public/images` | None |

### 5.2 Protected Admin Endpoints
*All admin endpoints (except `/login`) require the header: `Authorization: Bearer bytecare-admin-secret-token-2026`.*

| Method | Endpoint | Description | Payload / Response |
|---|---|---|---|
| `POST` | `/api/admin/login` | Verify administrator password | `{ password: "admin123" }` |
| `GET` | `/api/admin/stats` | Summary counts of tickets, statuses, and unread contacts | Returns summary statistics |
| `GET` | `/api/admin/bookings` | Fetch all repair tickets | Returns full array of tickets |
| `PATCH` | `/api/admin/bookings/:id` | Update repair ticket status, notes, or cost | `{ status?, techNotes?, estimatedCost? }` |
| `GET` | `/api/admin/services` | Fetch all services | Returns list of services with images |
| `PATCH` | `/api/admin/services/:id` | Update service details or title | `{ tagline?, details? }` |
| `POST` | `/api/admin/services/:id/images` | Add new image URL to a service | `{ imageUrl: "/images/..." }` |
| `DELETE` | `/api/admin/services/:id/images/:index` | Remove image by index from a service | `id`, `index` |
| `PATCH` | `/api/admin/owner` | Update owner portrait, name, role, bio | `{ image, name, role, bio }` |
| `GET` | `/api/admin/contacts` | Fetch all customer inquiries | Returns list of contact submissions |
| `PATCH` | `/api/admin/contacts/:id` | Update inquiry status | `{ status: "Replied" \| "Unread" }` |
| `GET` | `/api/admin/reviews` | Fetch all reviews (including pending) | Returns complete review list |
| `PATCH` | `/api/admin/reviews/:id` | Approve or reject review | `{ approved: true \| false }` |

---

## 6. Deployment & Operations

### Local Development
```bash
# Run local development server
npm run dev
# or
node server.js
```
Listens on `http://localhost:3000`.

### Netlify Deployment
```toml
[build]
  command = "pnpm install"
  publish = "public"
  functions = "functions"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200

[[redirects]]
  from = "/admin"
  to = "/admin.html"
  status = 200
```

---

*Document compiled for Bytecare NJ Technology — Kamrup (R), Assam.*
