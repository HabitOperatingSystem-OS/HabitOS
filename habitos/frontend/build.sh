#!/bin/bash

# Build the React app
npm run build

# Copy _redirects file to dist directory for SPA routing
cp public/_redirects dist/

echo "Build completed with SPA routing configuration" 