<div align="center">
  
# ✨ DoodleX ✨

**🎨 Real-time Collaborative Drawing Platform 🎨**

*Create, collaborate, and share stunning drawings instantly with anyone, anywhere.*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Turborepo](https://img.shields.io/badge/Turborepo-^2.4-orange?logo=turborepo&logoColor=white)](https://turbo.build/repo)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker&logoColor=white)](https://www.docker.com/)

</div>

---

## 📋 Overview

DoodleX is a modern, real-time collaborative drawing application built with a robust tech stack, designed for seamless creativity and teamwork. Whether you're sketching ideas with colleagues, creating art with friends, or teaching concepts visually, DoodleX provides the perfect digital canvas for your needs.

## 🚀 Features

- **🖌️ Real-time Collaboration:** See cursors and drawings update live as others draw
- **🎭 Multiple Drawing Tools:** Pens, shapes, colors, and more
- **🔒 Room Management:** Create private or public drawing spaces
- **🤖 AI Drawing Generation:** Generate basic shapes or complex images from text prompts (using Google Gemini)
- **👤 Authentication:** Secure user login and session management
- **📱 Responsive Design:** Works beautifully on desktop and mobile devices
- **💾 Persistent Storage:** Drawings and rooms are saved to a PostgreSQL database

## 🔧 Tech Stack

<div align="center">

| Category | Technologies |
|:--------:|:-------------|
| **Architecture** | [Turborepo](https://turbo.build/repo) |
| **Frontend** | [Next.js](https://nextjs.org/), [React](https://reactjs.org/), [Tailwind CSS](https://tailwindcss.com/), [TypeScript](https://www.typescriptlang.org/), [Framer Motion](https://www.framer.com/motion/) |
| **Backend (HTTP)** | [Node.js](https://nodejs.org/), [Express](https://expressjs.com/), [TypeScript](https://www.typescriptlang.org/) |
| **Backend (WebSocket)** | [Node.js](https://nodejs.org/), [ws](https://github.com/websockets/ws), [TypeScript](https://www.typescriptlang.org/) |
| **Database** | [PostgreSQL](https://www.postgresql.org/) |
| **ORM** | [Prisma](https://www.prisma.io/) |
| **AI Integration** | [Google Gemini API](https://ai.google.dev/) |
| **Containerization** | [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/) |
| **Package Manager** | [pnpm](https://pnpm.io/) |

</div>

## 🏗️ Project Structure

This project uses a monorepo structure managed by Turborepo:

```
/
├── apps/
│   ├── http-server/    # Express API server
│   ├── web/            # Next.js frontend application
│   └── ws-server/      # WebSocket server for real-time features
├── packages/
│   ├── ai/             # AI generation logic
│   ├── backend-common/ # Shared code for backend services
│   ├── common/         # Utilities shared across all apps/packages
│   ├── db/             # Prisma schema, client, migrations
│   ├── eslint-config/  # Shared ESLint configuration
│   ├── typescript-config/ # Shared TypeScript configuration
│   └── ui/             # Shared React UI components (using Shadcn UI)
├── docker/             # Dockerfiles for different services
├── .github/            # GitHub Actions workflows (CI/CD)
├── .env.example        # Example environment variables
├── docker-compose.yml  # Docker Compose for development
├── docker-compose.prod.yml # Docker Compose for production
└── turbo.json          # Turborepo configuration
```

## 🏁 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v22 or later recommended)
- [pnpm](https://pnpm.io/installation) (v9.0.0 or later)
- [Docker](https://www.docker.com/get-started) & [Docker Compose](https://docs.docker.com/compose/install/)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/DoodleX.git
cd DoodleX
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Variables

Copy the example environment file and fill in your actual secrets and configuration values.

```bash
cp .env.example .env
# Now edit .env with your details (DB credentials, JWT secret, API keys, etc.)
```

> ⚠️ **Important:** Do not commit your `.env` file!

Refer to `.env.example` for the required variables.

### 4. Generate Prisma Client

```bash
pnpm run db:generate
```

### 5. Running Locally (Development)

This command uses Turborepo to start all applications (`web`, `http-server`, `ws-server`) in development mode with hot-reloading.

```bash
# Ensure your local PostgreSQL is running and accessible
# Update DATABASE_URL in .env accordingly

# Start all apps in dev mode
pnpm run dev
```

You can now access:
- Web App: `http://localhost:3000`
- HTTP Server: `http://localhost:3001`
- WebSocket Server: `ws://localhost:8080`

### 6. Running with Docker (Recommended for Production-like Environment)

This uses Docker Compose to build images and run all services (including PostgreSQL) in containers.

```bash
# Make sure Docker Desktop or Docker Engine is running

# Build and start all services defined in docker-compose.yml
docker-compose up --build -d

# To use production configuration (requires .env file for secrets)
# docker-compose -f docker-compose.prod.yml up --build -d
```

> **Note:** The production setup (`docker-compose.prod.yml`) relies on environment variables being sourced externally (e.g., via deploy.sh loading a .env file on the server). See the Deployment section.

## 🐳 Docker Services

- `postgres`: PostgreSQL database service
- `backend`: HTTP API server (`apps/http-server`)
- `ws`: WebSocket server (`apps/ws-server`)
- `frontend`: Next.js web application (`apps/web`)

## ☁️ Deployment

This project is configured for deployment to a Virtual Machine (like DigitalOcean) using Docker Compose and Nginx as a reverse proxy.

- **CI/CD:** GitHub Actions (`.github/workflows/deploy.yml`) trigger deployment on pushes to the `main` branch
- **Server Setup:** The workflow SSHes into the target VM, pulls the latest code, and runs the `deploy.sh` script
- **Secrets Management:** Secrets are managed via a `.env` file located at `/opt/doodlex/.env` on the production server, which is sourced by `deploy.sh` (This file must not be committed to Git)
- **Process:** `deploy.sh` sources secrets, stops old containers, builds new images, starts new containers, and cleans up old images
- **SSL:** Nginx is configured with Let's Encrypt for HTTPS, including auto-renewal

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
