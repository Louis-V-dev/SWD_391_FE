#!/bin/bash

##############################################################################
# Deployment Diagnosis Script
# Run this to quickly check if your deployment will work correctly
##############################################################################

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Green Loop Frontend - Deployment Diagnostic"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: Run this script from the green-loop-fe directory"
  exit 1
fi

echo "📋 Step 1: Checking for problematic .env files..."
echo "────────────────────────────────────────────────────────────────────"

if [ -f ".env.local" ]; then
  echo "❌ ERROR: .env.local file found!"
  echo "   This file should NOT be in the repository"
  echo "   It will override environment variables during build"
  echo "   Action: Delete it or ensure it's in .gitignore"
  exit 1
else
  echo "✅ No .env.local file (good)"
fi

if [ -f ".env.production" ]; then
  echo "⚠️  WARNING: .env.production file found"
  echo "   Contents:"
  cat .env.production | sed 's/^/   | /'
  echo ""
fi

echo ""
echo "📋 Step 2: Checking GitHub Secrets (if you have gh CLI)..."
echo "────────────────────────────────────────────────────────────────────"

if command -v gh &> /dev/null; then
  echo "Fetching secrets..."
  gh secret list 2>/dev/null || echo "⚠️  Could not fetch secrets (need repo access)"
else
  echo "⚠️  GitHub CLI not installed - skip this check"
  echo "   Install: https://cli.github.com/"
fi

echo ""
echo "📋 Step 3: Checking current environment variables..."
echo "────────────────────────────────────────────────────────────────────"

check_env_var() {
  local var_name=$1
  local var_value="${!var_name}"
  
  if [ -z "$var_value" ]; then
    echo "❌ $var_name: NOT SET"
    return 1
  elif echo "$var_value" | grep -q "localhost"; then
    echo "⚠️  $var_name: $var_value (contains localhost!)"
    return 1
  else
    echo "✅ $var_name: $var_value"
    return 0
  fi
}

check_env_var "NEXT_PUBLIC_API_URL"
check_env_var "NEXT_PUBLIC_WS_URL"

echo ""
echo "📋 Step 4: Checking last build output..."
echo "────────────────────────────────────────────────────────────────────"

if [ ! -d ".next" ]; then
  echo "⚠️  No .next directory found - app hasn't been built yet"
else
  echo "Searching for localhost references in built files..."
  
  if grep -r "localhost:8080" .next/static 2>/dev/null | head -n 3; then
    echo ""
    echo "❌ CRITICAL: Found localhost:8080 in built bundle!"
    echo "   This means the last build used incorrect environment variables"
    echo "   Action: Clean build and rebuild with correct env vars"
    exit 1
  else
    echo "✅ No localhost:8080 found in built static files"
  fi
fi

echo ""
echo "📋 Step 5: Verifying package.json scripts..."
echo "────────────────────────────────────────────────────────────────────"

if grep -q "prebuild.*verify-env-build" package.json; then
  echo "✅ prebuild script configured to verify environment"
else
  echo "⚠️  prebuild script not found - environment won't be verified before build"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Diagnosis Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎯 What to do next:"
echo ""
echo "   1. Ensure GitHub Secrets are set correctly:"
echo "      - NEXT_PUBLIC_API_URL"
echo "      - NEXT_PUBLIC_WS_URL"
echo "      - (and other NEXT_PUBLIC_* secrets)"
echo ""
echo "   2. Trigger a new deployment:"
echo "      $ git commit --allow-empty -m 'Force rebuild'"
echo "      $ git push origin develop"
echo ""
echo "   3. After deployment, check:"
echo "      https://greenloop-fe.azurewebsites.net/env-check"
echo ""
echo "   4. If issues persist, see:"
echo "      DEPLOYMENT_ENV_TROUBLESHOOTING.md"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"


