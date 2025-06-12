#!/usr/bin/env node
import { ShatteredMoonMCPServer } from './server/index.js';
import logger from './utils/logger.js';

async function main() {
  try {
    const server = new ShatteredMoonMCPServer();
    await server.start();
  } catch (error) {
    logger.error('Fatal error', { error });
    process.exit(1);
  }
}

// Run the server
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});