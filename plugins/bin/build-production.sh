#!/bin/bash sh

set -e

# insall dependencies
pnpm i

# clear
rm -rf libs
rm -rf dist

# async ts build --emitDeclarationOnly
tsc --declaration --emitDeclarationOnly &

# vite build libs
# vite build esm libs, for downward compatibility
vite build --config=vite.config.esm.ts

# vite build dist
# build plugins
BUILD_MODULE=plugins vite build --mode=production

# build components, for downward compatibility
BUILD_MODULE=components vite build --mode=production

# typedoc build
# typedoc --options ./typedoc.json

# for downward compatibility
cp dist/index.es.js dist/index.js

rm -rf temp