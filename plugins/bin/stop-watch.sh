function stop_by_string {
  ps aux | grep "$1" | grep -v grep | awk '{print $2}' | xargs kill -9
}

stop_by_string 'tsc --declaration --emitDeclarationOnly --watch'
stop_by_string 'vite.js build --mode=development --watch'

rm -rf bin/dev.cache

echo "\033[31m \nExit Successful \033[0m"