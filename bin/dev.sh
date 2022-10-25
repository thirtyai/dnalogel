#!/bin/bash sh

set -e

function stop() {
  if [ -f ../plugins/bin/dev.cache ]; then
    cd ../plugins
    sh bin/stop-watch.sh
  fi
}

trap 'stop' INT TERM HUP

cd plugins

sh bin/build-development.sh

if [ ! -f bin/dev.cache ]; then
  echo 'exit 1'
  exit 0
fi

echo "Building plugins done."

cd ../examples

npm run dev