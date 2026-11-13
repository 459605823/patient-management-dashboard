import { createApp } from './app.js';
import { createDatabase } from './database.js';

const port = Number(process.env.PORT ?? 3001);
const host = process.env.HOST ?? '127.0.0.1';

const database = createDatabase();
try {
  const server = createApp(database).listen(port, host, () => {
    console.log(`API listening on http://${host}:${port}`);
  });
  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.once(signal, () =>
      server.close(() => {
        database.$client.end();
      }),
    );
  }
} catch (error) {
  await database.$client.end();
  console.error(error);
  process.exit(1);
}
