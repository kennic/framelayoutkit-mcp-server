# Cách sử dụng FrameLayoutKit MCP Server trong Claude Code

## Cách 1: Cấu hình Local (Sau khi publish)

### 1. Cài đặt package:
```bash
npm install -g framelayoutkit-mcp-server
```

### 2. Tạo file cấu hình Claude Code:
Tạo file `~/.claude/mcp_settings.json`:

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

## Cách 2: Cấu hình Development (Hiện tại)

### 1. Trong thư mục project này:
```bash
# Chạy server local
npm start
```

### 2. Cấu hình Claude Code với path local:
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

## Cách 3: Cấu hình trong IDE (Cursor)

Đã có sẵn file `.cursor/mcp.json` - cần cập nhật:

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

## Sử dụng trong Claude Code

Sau khi cấu hình, bạn có thể sử dụng các tools:

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

Với chainable DSL syntax mới, output sẽ như:

```swift
let stackLayout = VStackLayout {
    ($0 + titleLabel).padding(5).fixedContentHeight(44)
    ($0 + submitButton).padding(10).fixedHeight(50)
}.spacing(10).distribution(.center).padding(20)
```