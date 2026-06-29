# FIFA World Cup 2026 — What-If Tournament Simulator

A full-stack web application that simulates the FIFA World Cup 2026 tournament. Users can explore group standings, match results, and an interactive knockout bracket with real-time visualizations.

## Features

- **Tournament Lifecycle** — Full workflow from group stage setup to knockout bracket and champion crowning
- **Admin Authentication** — JWT-based login for secure admin operations
- **Team Management** — CRUD operations with group assignment and validation
- **Auto Match Generation** — Automatic round-robin group stage match creation
- **Live Standings** — Points, goal difference, and tiebreaker sorting computed on-the-fly
- **Interactive Knockout Bracket** — Custom-built bracket engine with animated connector lines, responsive sizing, and champion card
- **Third Place Playoff** — Full third-place match support with dedicated display
- **Glassmorphism UI** — Modern design with backdrop blur, smooth animations, and responsive layout
- **24 Teams, 6 Groups** — Pre-seeded with realistic match results

## Tech Stack

| Layer          | Technology                                      |
| -------------- | ----------------------------------------------- |
| **Backend**    | Node.js, Express, Prisma ORM, SQLite            |
| **Auth**       | JWT (jsonwebtoken), bcryptjs                    |
| **Validation** | express-validator                               |
| **Frontend**   | Vanilla JavaScript SPA, CSS3, HTML5             |
| **Font**       | Inter (Google Fonts)                            |
| **Design**     | Glassmorphism, CSS custom properties, animations |

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# 1. Clone and install backend dependencies
cd backend
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env if needed (defaults work for local development)

# 3. Initialize database and seed data
npx prisma db push
node prisma/seed.js

# 4. Start the server
npm start
```

The server runs on `http://localhost:3000`.

### Frontend

Open `frontend/index.html` in your browser (direct file open or via a local server).

### Default Admin Access

- Password: `admin123`
- Login at `frontend/admin.html`

## API Overview

| Method | Endpoint                       | Auth | Description                       |
| ------ | ------------------------------ | ---- | --------------------------------- |
| GET    | `/api/health`                  | —    | Server health check               |
| POST   | `/api/auth/login`              | —    | Login, returns JWT token          |
| GET    | `/api/teams`                   | —    | List all teams                    |
| POST   | `/api/teams`                   | JWT  | Create a team                     |
| PUT    | `/api/teams/:id`               | JWT  | Update a team                     |
| DELETE | `/api/teams/:id`               | JWT  | Delete a team                     |
| GET    | `/api/groups`                  | —    | List all groups                   |
| GET    | `/api/groups/:id/standings`    | —    | Standings for a specific group    |
| GET    | `/api/matches`                 | —    | List all matches (filterable)     |
| PUT    | `/api/matches/:id/result`      | JWT  | Update match result               |
| GET    | `/api/standings`               | —    | Standings for all groups          |
| GET    | `/api/bracket`                 | —    | Knockout bracket grouped by round |
| GET    | `/api/tournament/status`       | —    | Current tournament status         |
| POST   | `/api/tournament/setup`        | JWT  | Generate group stage matches      |
| POST   | `/api/tournament/advance`      | JWT  | Advance to knockout stage         |
| POST   | `/api/tournament/reset`        | JWT  | Reset tournament data             |

All POST/PUT/DELETE endpoints require `Authorization: Bearer <token>` header.

## Project Structure

```
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   └── seed.js                # 24-team seed data
│   └── src/
│       ├── server.js              # Entry point
│       ├── app.js                 # Express setup
│       ├── config/                # Environment config
│       ├── constants/             # App constants
│       ├── middleware/            # Auth, validation, error handling
│       ├── utils/                 # Prisma client, response helpers
│       ├── routes/                # Route definitions
│       ├── controllers/           # Request handlers
│       ├── services/              # Business logic
│       └── repositories/         # Data access layer
│
└── frontend/
    ├── index.html                 # Public SPA
    ├── admin.html                 # Admin panel
    ├── css/
    │   ├── style.css              # Design system & components
    │   └── bracket-theme.css      # Bracket visualization styles
    └── js/
        ├── api.js                 # HTTP client
        ├── app.js                 # Public page logic
        ├── admin.js               # Admin panel logic
        ├── flags.js               # Flag emoji map
        ├── bracket.js             # Bracket entry point
        ├── bracket-api.js         # Bracket data fetching
        ├── bracket-adapter.js     # Data transformation
        └── Bracket*.js            # Layout engine, renderer, connectors
```

## Architecture

### Backend (MVC + Service + Repository)

```
server.js → app.js → routes → controllers → services → repositories → Prisma → SQLite
                                            ↕
                                       validators/middleware/auth
```

### Bracket Rendering Pipeline

```
BracketAPI.fetch() → BracketAdapter.transform() → BracketLayout.build()
  → BracketRenderer.render() + BracketConnector.render()
```

The bracket engine builds a binary tree from knockout match data, computes X/Y positions bottom-up (mirror symmetry), and renders cards with animated connector lines.

## License

MIT
