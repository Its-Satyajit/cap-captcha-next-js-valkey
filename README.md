
# Next.js CAP Challenge with Valkey

A full-stack, high-performance implementation of a cryptographic proof-of-work (CAP) challenge system. Built with Next.js 15 (App Router & Turbopack), Valkey for in-memory storage, and the `@pitininja/cap-react-widget`.

This project serves as a modern blueprint for integrating server-side challenges into a web application for purposes like rate-limiting or bot protection, without relying on third-party services.

---

## Table of Contents

- [Core Concept](#core-concept)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation & Setup](#installation--setup)
- [Available Scripts](#available-scripts)
- [Environment Variables](#environment-variables)
- [How It Works](#how-it-works)
- [Future Improvements](#future-improvements)
- [License](#license)

---

## Core Concept

This application implements a CAP challenge system. Unlike traditional CAPTCHAs that require user interaction (like identifying images), this system operates on a proof-of-work model:

1.  **Challenge**: The server generates a complex but solvable cryptographic puzzle.
2.  **Solve**: The client's browser uses CPU resources to solve this puzzle without user interaction.
3.  **Redeem**: The client submits the solution to the server.
4.  **Verify**: The server validates the solution. If correct, it proves that the client expended real computational effort, making automated abuse costly and impractical.

This entire process is managed by the `@cap.js/server` library on the backend and visualized by the `@pitininja/cap-react-widget` on the frontend.

---

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) 15 (with Turbopack)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [Valkey](https://valkey.io/) (a high-performance fork of Redis)
- **CAP Implementation**:
  - Server: [@cap.js/server](https://www.npmjs.com/package/@cap.js/server)
  - Client: [@pitininja/cap-react-widget](https://www.npmjs.com/package/@pitininja/cap-react-widget)
- **Database Client**: [iovalkey](https://www.npmjs.com/package/iovalkey)
- **Package Manager**: [pnpm](https://pnpm.io/)
- **Linting & Formatting**: [Biome](https://biomejs.dev/)

---

## Project Structure

The project follows a standard Next.js App Router structure with a clear separation of concerns.

```text
.
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── challenge/     # API route to create a new challenge
│   │   │   │   └── route.ts
│   │   │   └── redeem/        # API route to redeem a solved challenge
│   │   │       └── route.ts
│   │   ├── layout.tsx         # Root layout, imports global CSS
│   │   └── page.tsx           # The main home page with the CAP widget
│   │   └── page.module.css    # Scoped styles for the home page
│   │
│   └── lib/
│       ├── api-helpers.ts     # Helpers for consistent API responses
│       ├── cap.ts             # Configuration for the @cap.js/server instance
│       ├── config.ts          # Centralized constants (keys, expiration times)
│       ├── db.ts              # Valkey database client initialization
│       └── env.ts             # Environment variable management
│
├── .env.example               # Example environment variables
├── next.config.ts             # Next.js configuration
└── package.json               # Project scripts and dependencies
```

---

## Getting Started

Follow these steps to get the project running on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (v22.x or later recommended)
- [pnpm](https://pnpm.io/installation) (v10.x or later)
- [Docker](https://www.docker.com/products/docker-desktop/) (for running Valkey)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Its-Satyajit/cap-captcha-next-js-valkey.git
    cd cap-captcha-next-js-valkey
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

3.  **Start the Valkey database:**
    This project uses Docker to run a Valkey instance. This command will start a container in the background.
    ```bash
    docker run -d --name my-valkey -p 6379:6379 valkey/valkey
    ```
    You can check if it's running with `docker ps`.

4.  **Set up environment variables:**
    Create a `.env` file in the project root by copying the example file.
    ```bash
    cp .env.example .env
    ```
    The default values are already configured to connect to the local Docker container.

5.  **Run the development server:**
    ```bash
    pnpm dev
    ```

6.  **Open the application:**
    Navigate to [http://localhost:3000](http://localhost:3000) in your browser. You should see the CAP challenge widget ready to be solved.

---

## Available Scripts

- `pnpm dev`: Starts the Next.js development server with Turbopack.
- `pnpm build`: Builds the application for production.
- `pnpm start`: Starts the production server.
- `pnpm lint`: Checks the code for linting errors using Biome.
- `pnpm format`: Formats all files in the project using Biome.


---

## Environment Variables

The application requires the following environment variables, defined in a `.env` file:

- `VALKEY_URL`: The connection string for the Valkey database.
  - **Default**: `valkey://localhost:6379`

---

## How It Works

The application flow is orchestrated between the client, the Next.js API, and the Valkey database.

1.  **Page Load**: The user visits the home page. The `CapWidget` is loaded dynamically on the client-side to avoid SSR errors.
2.  **Challenge Request**: The widget automatically makes a `POST` request to `/api/challenge`.
3.  **Challenge Creation**: The API route uses the `@cap.js/server` instance to generate a new cryptographic challenge. This challenge data is stored in Valkey with a short expiration time (e.g., 5 minutes).
4.  **Client-Side Solving**: The widget receives the challenge and begins solving it in the browser using Web Workers.
5.  **Redemption Request**: Once solved, the widget automatically makes a `POST` request to `/api/redeem`, sending the original token and the calculated solutions.
6.  **Redemption Verification**: The API route retrieves the original challenge data from Valkey using the token. It verifies that the provided solutions are correct.
7.  **Token Issuance**: If verification succeeds, the challenge key is deleted from Valkey, and a new, longer-lived token key is stored to confirm successful redemption. The final success token is sent back to the client.
8.  **UI Update**: The `onSolve` callback is triggered in the React component, updating the UI to show a success message.

---

## License

Distributed under the MIT License. See `LICENSE` for more information.