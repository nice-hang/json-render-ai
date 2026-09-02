#!/bin/sh
set -eu
cd "$(dirname "$0")"
node tools/serve-static.mjs app-dist 8080
