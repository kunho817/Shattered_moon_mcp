#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("./server/index.js");
const logger_js_1 = __importDefault(require("./utils/logger.js"));
async function main() {
    try {
        const server = new index_js_1.ShatteredMoonMCPServer();
        await server.start();
    }
    catch (error) {
        logger_js_1.default.error('Fatal error', { error });
        process.exit(1);
    }
}
// Run the server
main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map