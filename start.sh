#!/bin/sh
node listener.js &
npm run server &
x-www-browser http://localhost:3000