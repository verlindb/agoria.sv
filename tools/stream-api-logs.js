#!/usr/bin/env node
/**
 * Streams API resource logs from the Aspire dashboard consolelogs endpoint.
 * Usage: node tools/stream-api-logs.js [dashboardUrl] [resourceName]
 * Defaults: dashboardUrl=https://localhost:17287, resourceName=api
 */
const https = require('https');
const process = require('process');

const dashboardBase = process.argv[2] || 'https://localhost:17287';
const resource = process.argv[3] || 'api';
const url = `${dashboardBase.replace(/\/$/, '')}/consolelogs/resource/${encodeURIComponent(resource)}`;

console.error(`[stream-api-logs] Connecting to ${url}`);

const req = https.request(url, { method: 'GET', rejectUnauthorized: false }, res => {
  if (res.statusCode !== 200) {
    console.error(`[stream-api-logs] Non-200 status: ${res.statusCode}`);
  }
  res.setEncoding('utf8');
  res.on('data', chunk => {
    // The endpoint may send NDJSON or lines separated by newlines. Print raw.
    process.stdout.write(chunk);
  });
  res.on('end', () => {
    console.error('\n[stream-api-logs] Stream ended');
  });
});

req.on('error', err => {
  console.error('[stream-api-logs] Error:', err.message);
  process.exitCode = 1;
});

req.end();
