#!/bin/bash

npx webpack
rm -rf deploy
mkdir deploy
cp -r dist index.html deploy
mkdir -p deploy/node_modules/xterm/dist
cp node_modules/xterm/dist/xterm.css deploy/node_modules/xterm/dist/xterm.css
HASH=$(ipfs add -Qr deploy)
LINK="/ipfs/$HASH"
ipfs-dnslink-update cloudflare ipfs-cli.mkg20001.io "$LINK"
