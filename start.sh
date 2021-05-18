#!/bin/sh
node /usr/lib/eth-trick/listener.js &
npm run --prefix /usr/lib/eth-trick/ server &
x-www-browser http://localhost:3000