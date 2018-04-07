#!/bin/bash

cd ..

git clone git@github.com:nodejs/node -b v9.11.1
git -C node apply ./misc/browser_shim.patch
ln -s ../node/lib/internal ./node_modules/internal
