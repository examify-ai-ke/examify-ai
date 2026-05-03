#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://fastapi.localhost/api/v1';
const OPENAPI_URL = `${API_URL}/openapi.json`;
const OUTPUT_DIR = path.join(__dirname, '../src/types/generated');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'api.ts');

console.log('🔄 Generating API types from OpenAPI schema...');
console.log(`📡 Fetching schema from: ${OPENAPI_URL}`);

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

try {
  // Generate TypeScript types from OpenAPI schema
  execSync(
    `npx openapi-typescript "${OPENAPI_URL}" --output "${OUTPUT_FILE}"`,
    { stdio: 'inherit' }
  );
  
  console.log('✅ API types generated successfully!');
  console.log(`📁 Output: ${OUTPUT_FILE}`);
} catch (error) {
  console.error('❌ Failed to generate API types:', error.message);
  console.error('');
  console.error('Make sure:');
  console.error('1. Your backend is running and accessible');
  console.error('2. The OpenAPI endpoint is available');
  console.error('3. You have internet connection');
  process.exit(1);
}
