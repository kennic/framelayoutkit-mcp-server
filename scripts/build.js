#!/usr/bin/env node

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = dirname(__dirname);

console.log("Building FrameLayoutKit MCP Server...");

// Create dist directory
const distDir = join(rootDir, "dist");
if (!existsSync(distDir)) {
    mkdirSync(distDir, { recursive: true });
}

// Copy main file
const srcFile = join(rootDir, "src", "index.js");
const distFile = join(distDir, "index.js");

const content = readFileSync(srcFile, "utf8");
writeFileSync(distFile, content);

// Create web distribution index.html
const webContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FrameLayoutKit MCP Server</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
        }
        .hero {
            text-align: center;
            padding: 40px 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 10px;
            margin-bottom: 30px;
        }
        .install-box {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        code {
            background: #f1f3f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Monaco', 'Menlo', monospace;
        }
        pre {
            background: #2d3748;
            color: #e2e8f0;
            padding: 15px;
            border-radius: 8px;
            overflow-x: auto;
        }
        .feature {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin: 15px 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>
    <div class="hero">
        <h1>FrameLayoutKit MCP Server</h1>
        <p>AI-powered assistance for iOS developers using FrameLayoutKit framework</p>
    </div>

    <div class="install-box">
        <h2>🚀 Quick Install</h2>
        <pre><code>npx install-mcp https://mcp.framelayoutkit.dev/sse --client claude</code></pre>
        <p>Or via npm:</p>
        <pre><code>npm install -g @namkennic/framelayoutkit-mcp</code></pre>
    </div>

    <h2>✨ Features</h2>
    
    <div class="feature">
        <h3>🎨 Code Generation</h3>
        <p>Generate FrameLayoutKit code for various layout types including VStack, HStack, Grid, and Flow layouts.</p>
    </div>

    <div class="feature">
        <h3>🔄 Auto Layout Conversion</h3>
        <p>Convert existing Auto Layout code to FrameLayoutKit syntax with intelligent migration suggestions.</p>
    </div>

    <div class="feature">
        <h3>✅ Code Validation</h3>
        <p>Validate FrameLayoutKit code for syntax and semantic correctness with detailed error reporting.</p>
    </div>

    <div class="feature">
        <h3>📱 View Controller Generator</h3>
        <p>Generate complete view controllers with FrameLayoutKit layouts and proper lifecycle methods.</p>
    </div>

    <div class="feature">
        <h3>📋 Migration Guides</h3>
        <p>Analyze projects and generate comprehensive migration guides for converting to FrameLayoutKit.</p>
    </div>

    <h2>🛠 Available Tools</h2>
    <ul>
        <li><code>generate-framelayout</code> - Generate FrameLayoutKit code for iOS layouts</li>
        <li><code>convert-autolayout</code> - Convert Auto Layout code to FrameLayoutKit syntax</li>
        <li><code>validate-framelayout</code> - Validate FrameLayoutKit code for correctness</li>
        <li><code>generate-viewcontroller</code> - Generate complete view controllers</li>
        <li><code>generate-migration-guide</code> - Create migration guides for projects</li>
    </ul>

    <h2>📚 Documentation</h2>
    <p>For detailed documentation and examples, visit the <a href="https://github.com/kennic/FrameLayoutKit">FrameLayoutKit repository</a>.</p>

    <footer style="text-align: center; margin-top: 50px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
        <p>Made with ❤️ by <a href="https://github.com/namkennic">Nam Kennic</a></p>
    </footer>
</body>
</html>`;

writeFileSync(join(distDir, "index.html"), webContent);

// Create SSE endpoint simulation for web distribution
const sseContent = `#!/usr/bin/env node

// SSE (Server-Sent Events) endpoint for web distribution
// This simulates the MCP server for web-based installation

import { createServer } from "http";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const server = createServer((req, res) => {
    // CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.url === "/sse") {
        // Return the MCP server installation script
        res.setHeader("Content-Type", "application/javascript");
        const mcpServer = readFileSync(join(__dirname, "index.js"), "utf8");
        res.writeHead(200);
        res.end(mcpServer);
    } else if (req.url === "/" || req.url === "/index.html") {
        // Serve the web page
        const html = readFileSync(join(__dirname, "index.html"), "utf8");
        res.setHeader("Content-Type", "text/html");
        res.writeHead(200);
        res.end(html);
    } else {
        res.writeHead(404);
        res.end("Not Found");
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(\`FrameLayoutKit MCP Server running at http://localhost:\${PORT}\`);
    console.log("SSE endpoint available at /sse");
});
`;

writeFileSync(join(distDir, "server.js"), sseContent);

console.log("✅ Build completed successfully!");
console.log(`📁 Output directory: ${distDir}`);
console.log("📦 Files created:");
console.log("  - index.js (MCP Server)");
console.log("  - index.html (Web distribution page)");
console.log("  - server.js (SSE endpoint for web distribution)");