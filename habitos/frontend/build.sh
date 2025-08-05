#!/bin/bash

# Build the React app
npm run build

# Copy _redirects file to dist directory for SPA routing
cp public/_redirects dist/

# Copy 404.html for SPA routing fallback
cp public/404.html dist/

# Create a fallback index.html for SPA routing
# This ensures all routes serve the main app
echo "/*    /index.html   200" > dist/_redirects

# Also create a .htaccess file for Apache-style servers
cat > dist/.htaccess << 'EOF'
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
EOF

echo "Build completed with comprehensive SPA routing configuration" 