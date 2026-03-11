#!/bin/bash

SOURCE="public/projects"
DEST="public/optimized"

mkdir -p "$DEST"

find "$SOURCE" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) | while read img; do

  filename=$(basename "$img")
  name="${filename%.*}"
  dir=$(basename "$(dirname "$img")")

  mkdir -p "$DEST/$dir"

  echo "Processing $img"

  convert "$img" -quality 82 "$DEST/$dir/$name.webp"

  convert "$img" -resize 480  -quality 82 "$DEST/$dir/$name-480.webp"
  convert "$img" -resize 768  -quality 82 "$DEST/$dir/$name-768.webp"
  convert "$img" -resize 1200 -quality 82 "$DEST/$dir/$name-1200.webp"
  convert "$img" -resize 1600 -quality 82 "$DEST/$dir/$name-1600.webp"

done
