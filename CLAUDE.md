# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

-   `npm start` - Start the MCP server
-   `npm run dev` - Start the server with file watching for development
-   `npm test` - Run tests (when available)
-   `npm run lint` - Run ESLint on source files
-   `npm run build` - Run build script (when available)

## Architecture Overview

This is a **Model Context Protocol (MCP) server** that provides AI-powered assistance for iOS developers using the FrameLayoutKit framework. The server offers tools to generate Swift UIKit code using FrameLayoutKit's syntax, convert existing Auto Layout code, validate layouts, and provide migration guidance.

### Key Components

The codebase is structured as a single-file Node.js application (`src/index.js`) with the following main classes:

1. **FrameLayoutGenerator** - Core code generator for all FrameLayoutKit layout types
2. **ViewControllerGenerator** - Generates complete view controllers with FrameLayoutKit layouts
3. **AutoLayoutConverter** - Converts existing Auto Layout code to FrameLayoutKit syntax
4. **FrameLayoutValidator** - Validates FrameLayoutKit code for syntax and semantic correctness
5. **MigrationAnalyzer** - Analyzes projects and generates migration guides

### MCP Tools Provided

The server exposes 5 MCP tools:

-   `generate-framelayout` - Generate FrameLayoutKit code for various layout types
-   `convert-autolayout` - Convert Auto Layout code to FrameLayoutKit
-   `validate-framelayout` - Validate FrameLayoutKit code
-   `generate-viewcontroller` - Generate complete view controllers
-   `generate-migration-guide` - Create migration guides for projects

### Supported Layout Types

-   **FrameLayout** - Single view container with padding and alignment
-   **VStackLayout/HStackLayout** - Vertical/horizontal stacks
-   **ZStackLayout** - Overlapping views
-   **DoubleFrameLayout** - Two-view layouts with distribution control
-   **GridFrameLayout** - Multi-row/column grid layouts
-   **ScrollStackView** - Scrollable stacks
-   **FlowFrameLayout** - Wrapping flow layouts

### FrameLayoutKit Syntax Rules

When generating or validating FrameLayoutKit code, ensure:

-   Use `+` operator for adding views to layouts
-   Use `<+` and `+>` operators for DoubleFrameLayout (left and right views)
-   All views are automatically wrapped in FrameLayout instances
-   Method chaining syntax: `layout.spacing(10).padding(16).distribution(.center)`
-   **CRITICAL**: Never use AutoLayout alongside FrameLayoutKit (NSLayoutConstraint, anchors, etc.)

### Code Generation Patterns

The generator follows consistent patterns:

1. Create views section with closure-based initialization
2. Create and configure layout section with method chaining
3. Add views to layout using operators
4. For ViewControllers: Include viewDidLayoutSubviews with frame assignment

### Validation Rules

The validator enforces strict rules:

-   **CRITICAL ERRORS**: Detects any AutoLayout usage (NSLayoutConstraint, anchors, etc.)
-   **SYNTAX ERRORS**: Invalid FrameLayoutKit method usage
-   **SEMANTIC WARNINGS**: Logical issues like empty grids or too many views in DoubleFrameLayout

## Development Notes

-   ES modules are used throughout (`"type": "module"` in package.json)
-   Single file architecture keeps all logic in `src/index.js`
-   No external testing framework currently configured
-   Examples are provided in `examples/usage-examples.js`
-   The server uses stdio transport for MCP communication

## Testing the Server

Start the server with `npm start` and test with MCP clients like Claude Desktop or VS Code Continue extension. Use the examples in `examples/usage-examples.js` as reference for tool usage.
