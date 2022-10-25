#!/bin/bash sh

set -e

# ts build
trap 'sh bin/stop-watch.sh' INT TERM HUP

npx tsc --declaration --emitDeclarationOnly --watch &

BUILD_MODULE=plugins npx vite build --mode=development --watch &

BUILD_MODULE=plugins npx vite build --mode=development

echo "end" > bin/dev.cache