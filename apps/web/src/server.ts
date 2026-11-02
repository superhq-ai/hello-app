import { openDb } from "@hello/db";
import { handler } from "./app";

const db = openDb();
const server = Bun.serve({
  port: Number(process.env.PORT ?? 8080),
  hostname: "0.0.0.0",
  fetch: handler(db),
});

console.log(`listening on ${server.url}`);

process.on("SIGTERM", () => {
  server.stop();
  db.close();
  process.exit(0);
});
