#!/bin/bash

npm run build
rm -rf deploy
mkdir deploy
cp dist/main.js index.html deploy
mkdir -p deploy/node_modules/xterm/dist
cp node_modules/xterm/dist/xterm.css deploy/node_modules/xterm/dist/xterm.css
HASH=$(ipfs add -Qr deploy)
LINK="/ipfs/$HASH"
ipfs-dnslink-update cf ipfs-cli.mkg20001.io "$LINK"
