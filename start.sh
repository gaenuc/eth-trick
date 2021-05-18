#!/bin/sh
node /usr/lib/eth-trick/listener.js &
npm run /usr/lib/eth-trick/server &
x-www-browser http://localhost:3000