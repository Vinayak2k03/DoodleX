This is a monorepo project containing multiple applications and shared packages using Turborepo.

## Project Structure

### Apps

- **http-server**: HTTP API server
- **web**: Frontend web application
- **ws-server**: WebSocket server

### Packages

- **backend-common**: Shared code for backend services
- **common**: Common utilities used across all applications
- **db**: Database access layer
- **eslint-config**: Shared ESLint configuration
- **typescript-config**: Shared TypeScript configuration
- **ui**: Shared UI components

## Getting Started

### Prerequisites

Make sure you have the following installed:

- [Docker](https://www.docker.com/get-started) and [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/) (for local development)
- [pnpm](https://pnpm.io/) (package manager)

### Running the Project

To start all services using Docker, run the following command:

```bash
docker-compose up --build
