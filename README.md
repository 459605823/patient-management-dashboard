# Patient Management Dashboard

A full-stack dashboard for browsing, searching, creating, and editing patient records. Built with React, TypeScript, Tailwind CSS, Express, and MySQL, with shared validation schemas.

online demo: http://8.140.255.182:32222/

## Local Development

**Requirements:** Node.js 22.13+ (22.x) or 24.x, npm 10+, and a running MySQL instance.

Run all commands from the project root.

1. Install dependencies:

   ```sh
   npm ci
   ```

2. Copy `.env.example` to `.env` if it does not already exist. Create a local MySQL database and update the `DATABASE_*` variables to match your connection.

3. Initialize the patient table and optionally load sample data:

   ```sh
   npm run db:init
   npm run seed # Optional: add synthetic patient records
   ```

4. Start the API and frontend in separate terminals:

   ```sh
   npm run dev:backend
   ```

   ```sh
   npm run dev:frontend
   ```

5. Open http://127.0.0.1:5174. API requests under `/api` are proxied to the backend on port `3001` by default. Use browser DevTools to inspect requests and the backend terminal to check server errors. Both servers reload when their source files change. If you edit `packages/shared`, run `npm run dev:shared` in another terminal to rebuild it automatically.

To check types, run tests, or verify the production build:

```sh
npm run typecheck
npm run test:unit
npm run build
```
