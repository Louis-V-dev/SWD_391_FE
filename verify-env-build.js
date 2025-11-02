#!/usr/bin/env node

/**
 * Build-time Environment Variable Verification
 * This script runs DURING the build to verify environment variables are correctly set
 */

console.log('\n🔍 Verifying Build-Time Environment Variables...\n');

const requiredEnvVars = {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
  NODE_ENV: process.env.NODE_ENV
};

let hasErrors = false;

// Check if required variables are set
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    console.error(`❌ ERROR: ${key} is not set!`);
    hasErrors = true;
  } else {
    console.log(`✅ ${key}: ${value}`);
  }
});

// Production-specific checks
if (process.env.NODE_ENV === 'production') {
  console.log('\n🏭 Production Build - Running additional checks...\n');
  
  if (requiredEnvVars.NEXT_PUBLIC_API_URL?.includes('localhost')) {
    console.error('❌ CRITICAL: NEXT_PUBLIC_API_URL contains "localhost" in production build!');
    console.error('   Current value:', requiredEnvVars.NEXT_PUBLIC_API_URL);
    console.error('   This will be BAKED into the JavaScript bundle!');
    hasErrors = true;
  }
  
  if (requiredEnvVars.NEXT_PUBLIC_API_URL?.includes('127.0.0.1')) {
    console.error('❌ CRITICAL: NEXT_PUBLIC_API_URL contains "127.0.0.1" in production build!');
    hasErrors = true;
  }
  
  if (requiredEnvVars.NEXT_PUBLIC_API_URL?.includes(':8080')) {
    console.error('❌ CRITICAL: NEXT_PUBLIC_API_URL contains ":8080" in production build!');
    hasErrors = true;
  }
}

if (hasErrors) {
  console.error('\n❌ Environment variable verification FAILED!');
  console.error('Fix these issues before building for production.\n');
  process.exit(1);
}

console.log('\n✅ All environment variables verified successfully!\n');
console.log('These values will be BAKED into the Next.js build.\n');

