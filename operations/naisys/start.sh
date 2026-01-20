#!/bin/bash
# Make executable with: chmod +x operations/naisys/start.sh
# Change to script directory to load .env file
cd "$(dirname "$0")"
node ~/NAISYS/apps/naisys/dist/naisys.js program-director.yaml --supervisor