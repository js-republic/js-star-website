#!/usr/bin/env bash

export PRODUCTION_ENV=PRODUCTION
export PORT=5000

cd build
node app.js &
cd ..

echo $! > test/output/site.pid
nightwatch -c nightwatch.json

isTestPassed=$?

kill -9 $(cat test/output/site.pid)
rm -Rf test/output/site.pid build/node_modules

exit $isTestPassed