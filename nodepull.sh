#!/bin/bash

git clone git@github.com:nodejs/node -b v9.11.1
git -C node apply browser.patch
ln -s ../node/lib/internal ./node_modules/internal
