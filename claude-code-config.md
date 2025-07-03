# How to use FrameLayoutKit MCP Server in Claude Code

## Method 1: Local Configuration (After publishing)

### 1. Install the package:

```bash
npm install -g framelayoutkit-mcp-server
```

### 2. Create Claude Code configuration file:

Create the file `~/.claude/mcp_settings.json`:

```json
{
  "mcpServers": {
    "framelayoutkit": {
      "command": "framelayoutkit-mcp-server",
      "description": "FrameLayoutKit MCP Server - generates Swift UIKit code using FrameLayoutKit syntax"
    }
  }
}
```

## Method 2: Development Configuration (Current)

### 1. In this project directory:

```bash
# Run local server
npm start
```

### 2. Configure Claude Code with local path:

```json
{
  "mcpServers": {
    "framelayoutkit": {
      "command": "node",
      "args": ["/Users/namkennic/Projects/Personal/Frameworks/framelayoutkit-mcp-server/src/index.js"],
      "description": "FrameLayoutKit MCP Server - Local Development"
    }
  }
}
```

## Method 3: IDE Configuration (Cursor)

The `.cursor/mcp.json` file already exists - needs to be updated:

```json
{
  "mcpServers": {
    "framelayoutkit": {
      "command": "node",
      "args": [
        "/Users/namkennic/Projects/Personal/Frameworks/framelayoutkit-mcp-server/src/index.js"
      ],
      "description": "FrameLayoutKit MCP Server - generates Swift UIKit code using FrameLayoutKit syntax"
    }
  }
}
```

## Usage in Claude Code

After configuration, you can use the tools:

### 1. Generate FrameLayoutKit Code:

```
Generate a VStackLayout with a label and button using FrameLayoutKit
```

### 2. Convert AutoLayout to FrameLayoutKit:

```
Convert this AutoLayout code to FrameLayoutKit:
[paste your AutoLayout code]
```

### 3. Validate FrameLayoutKit Code:

```
Validate this FrameLayoutKit code:
[paste your FrameLayoutKit code]
```

### 4. Generate View Controller:

```
Generate a view controller with login form using FrameLayoutKit
```

### 5. Generate Migration Guide:

```
Create a migration guide for converting my iOS project to FrameLayoutKit
```

## Available Tools:

1. **generate-framelayout** - Generate FrameLayoutKit code for iOS layouts
2. **convert-autolayout** - Convert Auto Layout code to FrameLayoutKit syntax
3. **validate-framelayout** - Validate FrameLayoutKit code for correctness
4. **generate-viewcontroller** - Generate complete view controllers
5. **generate-migration-guide** - Create migration guides for projects

## Example Output:

With the new chainable DSL syntax, the output will be like:

```swift
let stackLayout = VStackLayout {
    ($0 + titleLabel).padding(5).fixedContentHeight(44)
    ($0 + submitButton).padding(10).fixedHeight(50)
}.spacing(10).distribution(.center).padding(20)
```
