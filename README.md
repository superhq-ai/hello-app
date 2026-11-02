# hello-app

An example app for [SuperHQ Apps](https://app.superhq.ai): a Bun monorepo
with a web server and a SQLite database that stays on the sandbox disk
across deploys.

```
apps/web        the server, Bun.serve on PORT
packages/db     bun:sqlite, migrations and queries
Procfile        what runs
build.sh        the build command
```

## Deploy it

In the console, open Apps, then New app, and pick this repository. Set:

- Build command: `sh build.sh`
- Start command: leave it empty, the Procfile says what runs

Each deploy then runs, in a new release directory:

1. `sh build.sh`, which installs Bun on the first deploy and then the
   workspace packages
2. `release` from the Procfile, which applies new migrations
3. `web` from the Procfile, which serves on port 8080

The database is `/srv/app/data/hello.db`, outside the release
directories, so every deploy finds the same file. Set `SQLITE_PATH` to
put it elsewhere.

## Run it here

```
bun install
SQLITE_PATH=./hello.db bun run migrate
SQLITE_PATH=./hello.db bun run dev
bun test
```
