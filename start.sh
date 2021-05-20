#!/bin/sh
node /usr/lib/eth-trick/listener.js &&
npm run --prefix /usr/lib/eth-trick/ server &&
sleep 10s &&
x-www-browser http://localhost:3000