#!/bin/bash

cd ..

cp node_modules/ipfs/src/cli/bin.js ipfs_bin.js
patch ipfs_bin.js misc/ipfs_bin.patch
node misc/cmdPatch.js
