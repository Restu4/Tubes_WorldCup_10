# Project Proposal: FIFA World Cup 2026 What-If Tournament Simulator

## 1. Executive Summary

**Project Name:** FIFA World Cup 2026 — What-If Tournament Simulator

**Course:** Web Advanced (IF2210)

**Team:** Tubes

**Proposed Stack:** Node.js, Express, Prisma ORM, SQLite, Vanilla JavaScript, CSS3

---

The FIFA World Cup 2026 What-If Tournament Simulator is a full-stack web application that allows users to simulate, explore, and visualize a fictional World Cup tournament. It provides a complete tournament lifecycle from group stage setup through knockout rounds, culminating in a champion. The application features an interactive knockout bracket with a custom-built rendering engine, real-time standings computation, and a modern glassmorphism user interface.

---

## 2. Project Objectives

1. **Demonstrate mastery of MVC architecture** — Implement a clean separation of concerns using the Model-View-Controller pattern with Service and Repository layers.

2. **Build a full-stack CRUD application** — Develop Create, Read, Update, and Delete operations across multiple related entities (teams, matches, groups, tournaments).

3. **Implement authentication and authorization** — Secure admin endpoints with JWT-based authentication and bcrypt password hashing.

4. **Design a custom data visualization system** — Create an interactive tournament bracket with animated connector lines, responsive sizing, and real-time data binding.

5. **Apply modern CSS design principles** — Use glassmorphism, CSS custom properties, animations, and responsive grid layouts for a professional user interface.

6. **Develop a comprehensive seed data system** — Pre-populate the database with 24 national teams, 6 groups, and full match results for a complete tournament simulation.

---

## 3. Key Features

### Admin Features
- **Authentication** — Secure JWT-based login with bcrypt password hashing
- **Team Management** — Create, edit, and delete teams with group assignment
- **Match Result Input** — Modal-based score entry with auto-winner determination
- **Tournament Control** — Setup group matches, advance to knockout, reset tournament

### Public Features
- **Dashboard** — Key tournament statistics (teams, groups, matches played, champion)
- **Standings** — Group standings with points, goal difference, and advancement indicators
- **Match Browser** — Filterable match list with status badges (FT, LIVE, PEN, ET, NS)
- **Interactive Bracket** — Custom-built knockout bracket with animated connectors, champion card, and third-place display

### Technical Features
- **Responsive Design** — Desktop-first with adaptive layouts for various screen sizes
- **Glassmorphism UI** — Modern aesthetic with backdrop blur, subtle shadows, and consistent spacing
- **Micro Animations** — Card entrance animations, hover effects, skeleton loading states
- **RESTful API** — 19 endpoints following resource-oriented design patterns
- **Input Validation** — Server-side validation with express-validator
- **Consistent Response Format** — Standardized `{ success, message, data }` envelope

---

## 4. Technology Stack

### Backend

| Component       | Technology       | Purpose                              |
| --------------- | ---------------- | ------------------------------------ |
| Runtime         | Node.js          | JavaScript server-side execution     |
| Web Framework   | Express          | HTTP server, routing, middleware     |
| ORM             | Prisma           | Type-safe database access            |
| Database        | SQLite           | Embedded relational database         |
| Authentication  | jsonwebtoken     | JWT token generation and verification |
| Password Hashing| bcryptjs         | Secure password storage              |
| Validation      | express-validator| Request data validation              |
| Security        | helmet, cors     | HTTP security headers, CORS          |
| Logging         | morgan           | HTTP request logging                 |

### Frontend

| Component       | Technology       | Purpose                              |
| --------------- | ---------------- | ------------------------------------ |
| Markup          | HTML5            | Semantic document structure          |
| Styling         | CSS3             | Design system with custom properties |
| Interactivity   | Vanilla JS (ES6) | DOM manipulation, API calls, state   |
| HTTP Client     | Fetch API        | REST API communication               |
| Typography      | Inter (Google)   | Modern sans-serif typeface           |

### Architecture Pattern

**Backend:** MVC + Service + Repository
- **Models:** Prisma schema (Admin, Tournament, Group, Team, Match)
- **Controllers:** Request parsing, response formatting
- **Services:** Business logic, validation, orchestration
- **Repositories:** Database queries via Prisma

**Frontend:** Layered Module System
- **API Layer:** Centralized HTTP client with JWT injection
- **Logic Layer:** Page-specific controllers (app.js, admin.js)
- **Presentation Layer:** CSS design system, bracket engine

---

## 5. Database Design

### Entity Relationship

```
Tournament (1) ──── (N) Group (1) ──── (N) Team
                    (1) ──── (N) Match

Match ──── Team (home/away/winner)
```

### Models

**Admin** — Stores hashed admin password
**Tournament** — Tracks lifecycle status (NOT_STARTED → GROUP_STAGE → KNOCKOUT → FINISHED)
**Group** — Named groups (A–F) belonging to a tournament
**Team** — National team with name, 3-letter code, optional flag URL
**Match** — Fixture between two teams with phase (GROUP/KNOCKOUT), round, scores, winner

### Key Design Decisions

- **No enums** — SQLite does not support enum types; string fields used instead
- **Standings computed on-the-fly** — No separate standings table; calculated from match results via service
- **Auto-creating groups** — Groups created dynamically when teams are assigned to them
- **Cascade behavior** — `onDelete: RESTRICT` for team references (cannot delete teams that have played); `onDelete: SET NULL` for group references

---

## 6. API Design

19 RESTful endpoints following resource-oriented conventions:

- **Auth** (1): Login → JWT
- **Teams** (5): CRUD with group assignment
- **Groups** (2): List groups, group standings
- **Matches** (4): List, filter, get, update result
- **Tournament** (4): Status, setup, advance, reset
- **Bracket** (1): Knockout bracket grouped by round
- **Standings** (2): All standings, group standings

All responses use the format: `{ success: boolean, message: string, data: any }`

---

## 7. Bracket Architecture

The knockout bracket is a custom-built rendering engine (no third-party library):

1. **Data Layer** — Fetches knockout matches from API, transforms to structured format
2. **Tree Builder** — Constructs a binary tree from match data, assigns left/right/center sides, wires parent-child relationships
3. **Position Calculator** — Computes Y positions bottom-up (average of children), X positions based on column assignment
4. **Renderer** — Creates DOM elements at computed positions with staggered animations
5. **Connector** — Draws L-shaped connector lines between parent-child pairs, handles both left→right and right→left flow

**Key properties:** Mirror symmetry, responsive scaling via viewport-based calculation, column compaction (removes unused rounds), dynamic round labels.

---

## 8. User Interface Design

### Color System
- **Primary:** Blue (#2563eb)
- **Background:** Gray (#f8fafc)
- **Surface:** White with glassmorphism (rgba + backdrop-filter)
- **Accents:** Green (success), Gold (champion), Red (danger/live)
- **Text:** Navy (#0f172a) to Gray (#94a3b8)

### Design Principles
- **8px spacing system** — Consistent gaps and padding
- **Glassmorphism** — Backdrop blur for depth without compromising readability
- **Card-based layout** — Information grouped into elevated containers
- **Micro-interactions** — Hover lifts, button transitions, skeleton loading
- **Typography** — Inter font family, weight range 400–900

---

## 9. Seed Data

The application is pre-seeded with:

- **24 national teams** across 6 groups (A–F), 4 teams per group
- **Group stage results** — 36 group matches with realistic scores
- **Knockout rounds** — Round of 16, Quarter-finals, Semi-finals, Final, Third Place
- **Champion:** Argentina (defeats Japan 3–1 in the final)
- **Third place:** Portugal (defeats Morocco 2–0)

---

## 10. Development Timeline

| Phase       | Tasks                                              | Duration  |
| ----------- | -------------------------------------------------- | --------- |
| **Phase 1** | Backend setup: Express, Prisma, SQLite, JWT, routes| Week 1    |
| **Phase 2** | API implementation: controllers, services, repos   | Week 1–2  |
| **Phase 3** | Seed data and database seeding                     | Week 2    |
| **Phase 4** | Frontend SPA: public pages, admin panel            | Week 2–3  |
| **Phase 5** | Bracket engine: layout, renderer, connectors       | Week 3    |
| **Phase 6** | UI refinement, animations, responsive design       | Week 3–4  |
| **Phase 7** | Testing, bug fixes, documentation                  | Week 4    |

---

## 11. Conclusion

The FIFA World Cup 2026 What-If Tournament Simulator demonstrates a complete full-stack web application with:

- **Clean architecture** following MVC + Service + Repository patterns
- **Modern UI** with glassmorphism, animations, and responsive design
- **Complex visualization** with a custom bracket rendering engine
- **Production-quality practices** with JWT auth, input validation, and error handling
- **Data-driven design** with comprehensive seed data and on-the-fly computations

The application is self-contained, runs entirely on local infrastructure (SQLite), and requires no external API dependencies, making it an ideal demonstration of full-stack web development principles.
