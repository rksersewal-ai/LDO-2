import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import type { IncomingMessage, ServerResponse } from "node:http";

const rawPort = process.env.PORT;

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH;

if (!basePath) {
  throw new Error(
    "BASE_PATH environment variable is required but was not provided.",
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock API Plugin
// Handles /api/* requests directly inside the Vite dev server.
// This is required in Replit's proxied environment where cross-port requests
// (browser → localhost:PORT) are not reachable from the browser.
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_USERS: Record<string, { password: string; user: object }> = {
  admin: {
    password: "admin123",
    user: {
      id: "user-admin-001",
      username: "admin",
      name: "System Administrator",
      designation: "Administrator",
      role: "admin",
      department: "IT",
      email: "admin@ldo2.local",
    },
  },
  "a.kowalski": {
    password: "ldo2pass",
    user: {
      id: "user-ak-001",
      username: "a.kowalski",
      name: "Adam Kowalski",
      designation: "Senior Engineer",
      role: "engineer",
      department: "Engineering",
      email: "a.kowalski@ldo2.local",
    },
  },
  "m.chen": {
    password: "ldo2pass",
    user: {
      id: "user-mc-001",
      username: "m.chen",
      name: "Ming Chen",
      designation: "Supervisor",
      role: "supervisor",
      department: "Operations",
      email: "m.chen@ldo2.local",
    },
  },
  "s.patel": {
    password: "ldo2pass",
    user: {
      id: "user-sp-001",
      username: "s.patel",
      name: "Sandeep Patel",
      designation: "Reviewer",
      role: "reviewer",
      department: "Quality",
      email: "s.patel@ldo2.local",
    },
  },
};

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => resolve(body));
    req.on("error", () => resolve("{}"));
  });
}

function jsonResponse(res: ServerResponse, status: number, data: object) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });
  res.end(JSON.stringify(data));
}

function mockApiPlugin(): Plugin {
  return {
    name: "mock-api",
    configureServer(server) {
      server.middlewares.use(
        async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
          const url = req.url ?? "";

          // Only handle /api/ routes
          if (!url.startsWith("/api/")) {
            return next();
          }

          // Handle CORS preflight
          if (req.method === "OPTIONS") {
            return jsonResponse(res, 204, {});
          }

          // POST /api/auth/login/
          if (url === "/api/auth/login/" && req.method === "POST") {
            const body = await readBody(req);
            let creds: { username?: string; password?: string } = {};
            try {
              creds = JSON.parse(body);
            } catch {
              return jsonResponse(res, 400, { detail: "Invalid JSON" });
            }

            const { username = "", password = "" } = creds;
            const record = MOCK_USERS[username];

            if (!record || record.password !== password) {
              return jsonResponse(res, 401, {
                detail:
                  "Invalid credentials. Please verify your username and password.",
              });
            }

            return jsonResponse(res, 200, {
              token: `mock_jwt_${username}_${Date.now()}`,
              user: record.user,
            });
          }

          // POST /api/auth/logout/
          if (url === "/api/auth/logout/" && req.method === "POST") {
            return jsonResponse(res, 200, { message: "Logged out successfully" });
          }

          // GET /api/auth/me/  (session refresh)
          if (url === "/api/auth/me/" && req.method === "GET") {
            const authHeader = req.headers["authorization"] ?? "";
            const token = authHeader.replace("Bearer ", "");
            const usernameMatch = token.match(/^mock_jwt_(.+?)_\d+$/);
            const username = usernameMatch?.[1] ?? "";
            const record = MOCK_USERS[username];

            if (!record) {
              return jsonResponse(res, 401, { detail: "Invalid token" });
            }

            return jsonResponse(res, 200, { user: record.user });
          }

          // Default: 404 for unknown /api/ routes
          return jsonResponse(res, 404, {
            detail: `API endpoint not found: ${req.method} ${url}`,
          });
        },
      );
    },
  };
}

export default defineConfig({
  base: basePath,
  plugins: [
    mockApiPlugin(),
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
