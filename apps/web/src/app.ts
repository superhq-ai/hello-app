import type { Database } from "bun:sqlite";
import { addNote, latestNotes, NOTE_MAX, type Note, visit } from "@hello/db";

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);

function page(visits: number, notes: Note[]): string {
  const items = notes.length
    ? notes.map((n) => `<li><span>${escape(n.body)}</span><time>${escape(n.created_at)} UTC</time></li>`).join("")
    : `<li class="empty">No notes yet.</li>`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Hello from SuperHQ</title>
<style>
  :root { color-scheme: dark; --bg: #0e0e12; --fg: #eceae4; --dim: #8b8a86; --line: #24242c; }
  body { margin: 0; background: var(--bg); color: var(--fg); font: 15px/1.5 ui-sans-serif, system-ui, sans-serif; }
  main { max-width: 34rem; margin: 0 auto; padding: 4rem 1rem; }
  h1 { font-size: 1.6rem; font-weight: 500; margin: 0 0 .25rem; }
  p { color: var(--dim); margin: 0 0 2rem; }
  form { display: flex; gap: .5rem; margin-bottom: 1.5rem; }
  input { flex: 1; min-width: 0; background: #16161c; color: var(--fg); border: 1px solid var(--line); border-radius: 6px; padding: .5rem .75rem; font: inherit; }
  button { background: var(--fg); color: var(--bg); border: 0; border-radius: 999px; padding: .5rem 1rem; font: inherit; cursor: pointer; }
  ul { list-style: none; margin: 0; padding: 0; border: 1px solid var(--line); border-radius: 8px; }
  li { display: flex; justify-content: space-between; gap: 1rem; padding: .6rem .9rem; border-bottom: 1px solid var(--line); }
  li:last-child { border-bottom: 0; }
  li span { overflow-wrap: anywhere; }
  time, .empty { color: var(--dim); font-size: .85rem; white-space: nowrap; }
</style>
</head>
<body>
<main>
  <h1>Hello from SuperHQ</h1>
  <p>A Bun app with SQLite on the sandbox disk. Visit ${visits}; the count and the notes stay across deploys.</p>
  <form method="post" action="/notes">
    <input name="body" maxlength="${NOTE_MAX}" placeholder="Leave a note" required autocomplete="off">
    <button>Add</button>
  </form>
  <ul>${items}</ul>
</main>
</body>
</html>`;
}

export function handler(db: Database) {
  return async (req: Request): Promise<Response> => {
    const url = new URL(req.url);
    if (url.pathname === "/health") return Response.json({ ok: true });
    if (url.pathname === "/" && req.method === "GET") {
      return new Response(page(visit(db), latestNotes(db)), { headers: { "content-type": "text/html; charset=utf-8" } });
    }
    if (url.pathname === "/notes" && req.method === "POST") {
      const form = await req.formData();
      const body = form.get("body");
      addNote(db, typeof body === "string" ? body : "");
      return new Response(null, { status: 303, headers: { location: "/" } });
    }
    if (url.pathname === "/api/notes" && req.method === "GET") return Response.json({ notes: latestNotes(db) });
    return new Response("Not found", { status: 404 });
  };
}
