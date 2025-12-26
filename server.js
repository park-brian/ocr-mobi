import express from 'express';
import { pathToFileURL } from "url";

/**
 * Create an Express server serving static files from the current directory.
 * @returns {import('http').Server} The HTTP server instance.
 */
export function createServer() {
    const app = express();
    app.use(express.static('.'));
    return app;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    const { PORT = 3000 } = process.env;
    createServer().listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
}
