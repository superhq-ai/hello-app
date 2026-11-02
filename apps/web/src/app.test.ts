import { expect, test } from "bun:test";
import { migrate, openDb } from "@hello/db";
import { handler } from "./app";

function app() {
  const db = openDb(":memory:");
  migrate(db);
  return handler(db);
}

test("migrations apply once", () => {
  const db = openDb(":memory:");
  expect(migrate(db)).toEqual(["001_init.sql"]);
  expect(migrate(db)).toEqual([]);
});

test("the page counts visits", async () => {
  const fetch = app();
  await fetch(new Request("http://app/"));
  const html = await (await fetch(new Request("http://app/"))).text();
  expect(html).toContain("Visit 2;");
});

test("a note is kept and escaped", async () => {
  const fetch = app();
  const form = new FormData();
  form.set("body", "<b>hi</b>");
  const posted = await fetch(new Request("http://app/notes", { method: "POST", body: form }));
  expect(posted.status).toBe(303);
  const html = await (await fetch(new Request("http://app/"))).text();
  expect(html).toContain("&lt;b&gt;hi&lt;/b&gt;");
  const { notes } = await (await fetch(new Request("http://app/api/notes"))).json();
  expect(notes.map((n: { body: string }) => n.body)).toEqual(["<b>hi</b>"]);
});

test("health answers", async () => {
  const res = await app()(new Request("http://app/health"));
  expect(await res.json()).toEqual({ ok: true });
});
