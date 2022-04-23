#!/usr/bin/env bash

zola build

pushd exercises
mkdir -p dist/manual-pagination
yarn parcel build --dist-dir dist/manual-pagination --public-url /exercises/manual-pagination manual-pagination/index.html
popd

mkdir public/exercises
rm exercises/dist/*.map
cp -r exercises/dist/* public/exercises

rsync --progress -r public/* ana@gelez.xyz:/var/www/cours-spc