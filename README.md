# FrameLayoutKit MCP Server

A Model Context Protocol (MCP) server for FrameLayoutKit, providing AI-powered assistance for iOS developers using the FrameLayoutKit framework. This server helps generate Swift UIKit code using FrameLayoutKit's intuitive syntax, convert existing Auto Layout code, validate layouts, and provide migration guidance.

## Features

### 🚀 Code Generation

Generate FrameLayoutKit code for all layout types:

-   **FrameLayout** - Single view container with padding and alignment
-   **VStackLayout/HStackLayout** - Vertical/horizontal stacks
-   **ZStackLayout** - Overlapping views
-   **DoubleFrameLayout** - Two-view layouts with distribution control
-   **GridFrameLayout** - Multi-row/column grid layouts
-   **ScrollStackView** - Scrollable stacks
-   **FlowFrameLayout** - Wrapping flow layouts

### 🔄 Auto Layout Conversion

Convert existing UIKit Auto Layout code to FrameLayoutKit:

-   NSLayoutConstraint conversion
-   UIStackView migration
-   Layout anchor transformation
-   Preserves code structure and comments

### ✅ Code Validation

Validate FrameLayoutKit code for:

-   Syntax correctness
-   Semantic validity
-   Best practices
-   Performance optimization suggestions

### 📋 Migration Assistance

Generate comprehensive migration guides:

-   Project-wide analysis
-   File-by-file recommendations
-   Effort estimation
-   Step-by-step migration strategy

## Installation

```bash
# Clone the repository
git clone https://github.com/kennic/framelayoutkit-mcp.git
cd framelayoutkit-mcp

# Install dependencies
npm install

# Start the server
npm start
```

## Configuration

### For Claude Desktop

Add to your Claude configuration file:

```json
{
  "mcpServers": {
    "framelayoutkit": {
      "command": "node",
      "args": ["/path/to/framelayoutkit-mcp/src/index.js"],
      "env": {}
    }
  }
}
```

### For VS Code with Continue

Add to your Continue configuration:

```json
{
  "models": [{
    "title": "Claude with FrameLayoutKit",
    "provider": "anthropic",
    "model": "claude-3-sonnet",
    "mcpServers": [{
      "name": "framelayoutkit",
      "command": "node",
      "args": ["./framelayoutkit-mcp/src/index.js"]
    }]
  }]
}
```

## Usage Examples

### Generate a VStackLayout

```javascript
// Request
{
  "tool": "generate-framelayout",
  "arguments": {
    "layoutType": "VStackLayout",
    "views": [
      {
        "name": "titleLabel",
        "type": "UILabel",
        "text": "Welcome"
      },
      {
        "name": "button",
        "type": "UIButton",
        "text": "Get Started"
      }
    ],
    "configuration": {
      "spacing": 20,
      "padding": 16,
      "distribution": "center"
    }
  }
}
```

Generated Swift code:

```swift
let stackLayout = VStackLayout()
stackLayout.spacing = 20
stackLayout.distribution = .center
stackLayout.padding(16)

// Add views to stack
let titleLabel = {
    let label = UILabel()
    label.text = "Welcome"
    return label
}()
stackLayout + titleLabel
let button = {
    let button = UIButton(type: .system)
    button.setTitle("Get Started", for: .normal)
    return button
}()
stackLayout + button
```

### Convert Auto Layout to FrameLayoutKit

```javascript
// Request
{
  "tool": "convert-autolayout",
  "arguments": {
    "swiftCode": "/* Your existing Auto Layout code */",
    "options": {
      "migrationStrategy": "conservative",
      "useOperatorSyntax": true
    }
  }
}
```

### Validate FrameLayoutKit Code

```javascript
// Request
{
  "tool": "validate-framelayout",
  "arguments": {
    "swiftCode": "/* Your FrameLayoutKit code */",
    "checkLevel": "full"
  }
}
```

## FrameLayoutKit Syntax Verification

The MCP server correctly implements FrameLayoutKit's syntax patterns:

### ✅ Operator Usage

-   `+` operator for adding views to layouts
-   `<+` and `+>` operators for DoubleFrameLayout
-   Chainable method syntax

### ✅ Layout Properties

-   Correct alignment enums (`.top`, `.center`, `.bottom`, `.fill`, `.fit`)
-   Distribution options per layout type
-   Proper padding/spacing application

### ✅ View Wrapping

-   All views automatically wrapped in FrameLayout instances
-   Individual item configuration support
-   Correct frame calculation delegation

### ✅ Layout Hierarchies

-   Proper nesting of layout types
-   Correct parent-child relationships
-   Internal stack management for Grid and Flow layouts

## Architecture

The server is built with:

-   **Node.js** with ES modules
-   **@modelcontextprotocol/sdk** for MCP implementation
-   **Zod** for schema validation
-   Modular class structure for each tool

### Key Components

1. **FrameLayoutGenerator** - Generates FrameLayoutKit code
2. **AutoLayoutConverter** - Converts Auto Layout to FrameLayoutKit
3. **FrameLayoutValidator** - Validates syntax and semantics
4. **MigrationAnalyzer** - Analyzes projects for migration

## Contributing

Contributions are welcome! Please ensure:

-   Code follows FrameLayoutKit's official syntax
-   All generated code is valid Swift
-   Tests cover new functionality
-   Documentation is updated

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:

-   GitHub Issues: [framelayoutkit-mcp/issues](https://github.com/kennic/framelayoutkit-mcp/issues)
-   FrameLayoutKit Documentation: [FrameLayoutKit Docs](https://github.com/kennic/FrameLayoutKit)

## Acknowledgments

-   FrameLayoutKit by Nam Kennic
-   Anthropic's Model Context Protocol
-   The iOS development community
