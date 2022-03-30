#!/bin/sh

# update assets
git pull

# install node packages
npm install

# build application
npm run build && echo "[$(date)] Updated assets"
