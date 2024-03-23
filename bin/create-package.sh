#!/bin/bash

set -e

TYPE="$1"
NAME="$2"

case $TYPE in
  "lib")
    mkdir ./packages/$NAME
    cp -r ./templates/lib-backend/* packages/$NAME
    gsed -i "s/PACKAGE-NAME/$NAME/g" packages/$NAME/package.json
    ;;
  *)
    echo "Invalid type"
    exit 1
    ;;
esac
