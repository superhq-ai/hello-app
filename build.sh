#!/bin/sh
# The build command of the app: sh build.sh
set -eu

# Bun goes on the sandbox disk once and stays for later releases.
if ! command -v bun >/dev/null 2>&1; then
  if ! command -v unzip >/dev/null 2>&1; then
    export DEBIAN_FRONTEND=noninteractive
    apt-get update -qq
    apt-get install -y -qq unzip >/dev/null
  fi
  curl -fsSL https://bun.sh/install | BUN_INSTALL=/usr/local bash -s "bun-v1.3.5" 2>/dev/null
fi

bun --version
bun install --frozen-lockfile --production
