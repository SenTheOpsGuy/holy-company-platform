#!/bin/bash

# The Holy Company - Complete Build Script
# This script generates all remaining files for the application

echo "🕉️  Building The Holy Company Platform..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Step 1: Creating directory structure...${NC}"
mkdir -p app/{api,\(auth\),\(dashboard\),admin,payment}
mkdir -p app/api/{webhooks,pujas,games,offerings,content,admin,users,upload}
mkdir -p components/{ui,puja,games,content,admin,shared}
mkdir -p public/{audio/chants,images/deities}

echo -e "${GREEN}✓ Directories created${NC}"
echo ""

echo -e "${BLUE}Step 2: Installing dependencies...${NC}"
npm install

echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

echo -e "${BLUE}Step 3: Setting up Prisma...${NC}"
npx prisma generate

echo -e "${GREEN}✓ Prisma client generated${NC}"
echo ""

echo "📝 NEXT STEPS:"
echo ""
echo "1. ADD ENVIRONMENT VARIABLES:"
echo "   Edit .env.local and add:"
echo "   - DATABASE_URL (from Vercel Postgres)"
echo "   - BLOB_READ_WRITE_TOKEN (from Vercel Blob)"
echo "   - CASHFREE_APP_ID and CASHFREE_SECRET_KEY"
echo "   - BREVO_API_KEY"
echo ""
echo "2. SETUP DATABASE:"
echo "   npx prisma db push"
echo "   npx prisma db seed"
echo ""
echo "3. ADD AUDIO FILES:"
echo "   Download free temple sounds and add to public/audio/"
echo "   - temple-bell.mp3"
echo "   - shankha.mp3"
echo "   - nagada.mp3"
echo "   - chants/{deity}.mp3 (8 files)"
echo ""
echo "4. RUN APPLICATION:"
echo "   npm run dev"
echo ""
echo "5. CONTINUE BUILD:"
echo "   Run the generate-all-files.sh script to create"
echo "   all pages, components, and API routes"
echo ""
echo "🎉 Initial setup complete!"
