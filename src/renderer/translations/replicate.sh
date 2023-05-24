#!/bin/bash

MASTER=en.json

for file in *.json; do
    if [ "$file" != "$MASTER" ]; then
        
        jq -s '.[0] * .[1]' en.json $file > temp.json && cp temp.json $file
        
    fi
done
