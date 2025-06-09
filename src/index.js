#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Initialize MCP Server
const server = new Server({
    name: "framelayoutkit-assistant",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {}
    }
});

// Tool: Generate FrameLayoutKit code
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "generate-framelayout",
                description: "Generate FrameLayoutKit code for iOS layouts",
                inputSchema: {
                    type: "object",
                    properties: {
                        layoutType: {
                            type: "string",
                            enum: ["FrameLayout", "VStackLayout", "HStackLayout", "ZStackLayout",
                                "DoubleFrameLayout", "GridFrameLayout", "ScrollStackView", "FlowFrameLayout"]
                        },
                        views: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    type: {
                                        type: "string",
                                        enum: ["UILabel", "UIButton", "UIImageView", "UITextField", "UITextView",
                                            "UIView", "UIStackView", "UIScrollView", "UITableView", "UICollectionView"]
                                    },
                                    properties: { type: "object" },
                                    text: { type: "string" },
                                    image: { type: "string" }
                                },
                                required: ["name", "type"]
                            }
                        },
                        configuration: {
                            type: "object",
                            properties: {
                                axis: { type: "string", enum: ["horizontal", "vertical"] },
                                spacing: { type: "number" },
                                padding: { type: "number" },
                                distribution: {
                                    type: "string",
                                    enum: ["left", "center", "right", "top", "bottom", "equal", "fill", "justified"]
                                },
                                rows: { type: "number" },
                                columns: { type: "number" },
                                interItemSpacing: { type: "number" },
                                lineSpacing: { type: "number" },
                                isOverlapped: { type: "boolean" }
                            }
                        }
                    },
                    required: ["layoutType", "views"]
                }
            },
            {
                name: "convert-autolayout",
                description: "Convert Auto Layout code to FrameLayoutKit syntax",
                inputSchema: {
                    type: "object",
                    properties: {
                        swiftCode: { type: "string" },
                        options: {
                            type: "object",
                            properties: {
                                preserveComments: { type: "boolean", default: true },
                                generateHelperMethods: { type: "boolean", default: false },
                                useOperatorSyntax: { type: "boolean", default: true },
                                migrationStrategy: {
                                    type: "string",
                                    enum: ["conservative", "aggressive"],
                                    default: "conservative"
                                }
                            }
                        }
                    },
                    required: ["swiftCode"]
                }
            },
            {
                name: "validate-framelayout",
                description: "Validate FrameLayoutKit code for syntax and semantic correctness",
                inputSchema: {
                    type: "object",
                    properties: {
                        swiftCode: { type: "string" },
                        checkLevel: {
                            type: "string",
                            enum: ["syntax", "semantic", "full"],
                            default: "full"
                        }
                    },
                    required: ["swiftCode"]
                }
            },
            {
                name: "generate-viewcontroller",
                description: "Generate complete view controller with FrameLayoutKit layouts",
                inputSchema: {
                    type: "object",
                    properties: {
                        className: { type: "string", default: "CustomViewController" },
                        layoutStructure: {
                            type: "object",
                            properties: {
                                mainLayout: {
                                    type: "string",
                                    enum: ["VStackLayout", "HStackLayout", "FrameLayout", "ScrollStackView"]
                                },
                                views: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            name: { type: "string" },
                                            type: { type: "string" },
                                            text: { type: "string" },
                                            properties: { type: "object" }
                                        },
                                        required: ["name", "type"]
                                    }
                                },
                                configuration: { type: "object" }
                            },
                            required: ["mainLayout", "views"]
                        }
                    },
                    required: ["layoutStructure"]
                }
            },
            {
                name: "generate-migration-guide",
                description: "Generate a migration guide for converting projects to FrameLayoutKit",
                inputSchema: {
                    type: "object",
                    properties: {
                        projectPath: { type: "string" },
                        swiftFiles: {
                            type: "array",
                            items: { type: "string" }
                        },
                        outputFormat: {
                            type: "string",
                            enum: ["markdown", "html", "json"],
                            default: "markdown"
                        }
                    }
                }
            }
        ]
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    switch (name) {
        case "generate-framelayout": {
            const { layoutType, views, configuration = {} } = args;
            const generator = new FrameLayoutGenerator();
            const code = generator.generateLayout(layoutType, views, configuration);

            return {
                content: [{
                    type: "text",
                    text: code
                }]
            };
        }

        case "convert-autolayout": {
            const { swiftCode, options = {} } = args;
            const converter = new AutoLayoutConverter();
            const result = await converter.convert(swiftCode, options);

            return {
                content: [{
                    type: "text",
                    text: result.code
                }]
            };
        }

        case "validate-framelayout": {
            const { swiftCode, checkLevel = "full" } = args;
            const validator = new FrameLayoutValidator();
            const result = await validator.validate(swiftCode, checkLevel);

            return {
                content: [{
                    type: "text",
                    text: result.report
                }]
            };
        }

        case "generate-viewcontroller": {
            const { className = "CustomViewController", layoutStructure } = args;
            const generator = new ViewControllerGenerator();
            const code = generator.generateViewController(className, layoutStructure);

            return {
                content: [{
                    type: "text",
                    text: code
                }]
            };
        }

        case "generate-migration-guide": {
            const { projectPath, swiftFiles, outputFormat = "markdown" } = args;
            const analyzer = new MigrationAnalyzer();
            const guide = await analyzer.analyzeMigrationPath(projectPath, swiftFiles);

            return {
                content: [{
                    type: "text",
                    text: guide.formatted[outputFormat]
                }]
            };
        }

        default:
            throw new Error(`Unknown tool: ${name}`);
    }
});

// Main FrameLayout code generator class
class FrameLayoutGenerator {
    generateLayout(layoutType, views, config) {
        switch (layoutType) {
            case "FrameLayout":
                return this.generateFrameLayout(views[0], config);
            case "VStackLayout":
                return this.generateStackLayout("VStackLayout", views, config);
            case "HStackLayout":
                return this.generateStackLayout("HStackLayout", views, config);
            case "ZStackLayout":
                return this.generateZStackLayout(views, config);
            case "DoubleFrameLayout":
                return this.generateDoubleFrameLayout(views, config);
            case "GridFrameLayout":
                return this.generateGridLayout(views, config);
            case "ScrollStackView":
                return this.generateScrollStackView(views, config);
            case "FlowFrameLayout":
                return this.generateFlowLayout(views, config);
            default:
                throw new Error(`Unknown layout type: ${layoutType}`);
        }
    }

    generateFrameLayout(view, config) {
        let code = '';

        // Create view
        code += `// Create view\n`;
        code += `let ${view.name} = ${this.generateViewCreation(view)}\n`;

        // Create and configure layout
        code += `\n// Create and configure layout\n`;
        code += `let ${view.name}Layout = FrameLayout()\n`;

        // Build method chain
        const chainMethods = [];

        if (config.padding !== undefined) {
            if (typeof config.padding === 'number') {
                chainMethods.push(`.padding(${config.padding})`);
            } else {
                chainMethods.push(`.padding(top: ${config.padding.top}, left: ${config.padding.left}, bottom: ${config.padding.bottom}, right: ${config.padding.right})`);
            }
        }

        if (config.alignment) {
            chainMethods.push(`.align(.${config.alignment.vertical || 'center'}, .${config.alignment.horizontal || 'center'})`);
        }

        // Apply method chain if we have any configurations
        if (chainMethods.length > 0) {
            code += `${view.name}Layout\n`;
            chainMethods.forEach(method => {
                code += `    ${method}\n`;
            });
        }

        // Add view to layout
        code += `\n// Add view to layout\n`;
        code += `${view.name}Layout + ${view.name}\n`;

        return code;
    }

    generateStackLayout(stackType, views, config) {
        let code = '';

        // Create views section
        code += `// Create views\n`;
        views.forEach(view => {
            code += `let ${view.name} = ${this.generateViewCreation(view)}\n`;
        });

        // Create and configure layout section
        code += `\n// Create and configure layout\n`;
        code += `let stackLayout = ${stackType}()\n`;

        // Build method chain
        const chainMethods = [];

        if (config.distribution) {
            chainMethods.push(`.distribution(.${config.distribution})`);
        }

        if (config.spacing !== undefined) {
            chainMethods.push(`.spacing(${config.spacing})`);
        }

        if (config.padding !== undefined) {
            if (typeof config.padding === 'number') {
                chainMethods.push(`.padding(${config.padding})`);
            } else {
                chainMethods.push(`.padding(top: ${config.padding.top}, left: ${config.padding.left}, bottom: ${config.padding.bottom}, right: ${config.padding.right})`);
            }
        }

        // Apply method chain if we have any configurations
        if (chainMethods.length > 0) {
            code += `stackLayout\n`;
            chainMethods.forEach((method, index) => {
                if (index === chainMethods.length - 1) {
                    code += `    ${method}\n`;
                } else {
                    code += `    ${method}\n`;
                }
            });
        }

        // Add views to layout
        code += `\n// Add views to layout\n`;
        views.forEach(view => {
            code += `stackLayout + ${view.name}\n`;
        });

        return code;
    }

    generateDoubleFrameLayout(views, config) {
        if (views.length !== 2) {
            throw new Error("DoubleFrameLayout requires exactly 2 views");
        }

        let code = '';

        // Create views
        code += `// Create views\n`;
        code += `let ${views[0].name} = ${this.generateViewCreation(views[0])}\n`;
        code += `let ${views[1].name} = ${this.generateViewCreation(views[1])}\n`;

        // Create and configure layout
        code += `\n// Create and configure layout\n`;
        code += `let doubleLayout = DoubleFrameLayout()\n`;

        // Build method chain
        const chainMethods = [];

        if (config.axis) {
            chainMethods.push(`.axis(.${config.axis})`);
        }

        if (config.spacing !== undefined) {
            chainMethods.push(`.spacing(${config.spacing})`);
        }

        if (config.distribution) {
            chainMethods.push(`.distribution(.${config.distribution})`);
        }

        if (config.isOverlapped) {
            chainMethods.push(`.isOverlapped(true)`);
        }

        // Apply method chain if we have any configurations
        if (chainMethods.length > 0) {
            code += `doubleLayout\n`;
            chainMethods.forEach(method => {
                code += `    ${method}\n`;
            });
        }

        // Add views to layout
        code += `\n// Add views to layout\n`;
        code += `doubleLayout <+ ${views[0].name}\n`;
        code += `doubleLayout +> ${views[1].name}\n`;

        // Configure individual frame layouts if needed
        if (config.padding) {
            code += `\n// Configure padding for individual layouts\n`;
            if (typeof config.padding === 'number') {
                code += `doubleLayout.leftFrameLayout.padding(${config.padding})\n`;
                code += `doubleLayout.rightFrameLayout.padding(${config.padding})\n`;
            } else {
                code += `doubleLayout.leftFrameLayout.padding(top: ${config.padding.top}, left: ${config.padding.left}, bottom: ${config.padding.bottom}, right: ${config.padding.right})\n`;
                code += `doubleLayout.rightFrameLayout.padding(top: ${config.padding.top}, left: ${config.padding.left}, bottom: ${config.padding.bottom}, right: ${config.padding.right})\n`;
            }
        }

        return code;
    }

    generateGridLayout(views, config) {
        let code = `let gridLayout = GridFrameLayout()\n`;

        // Configure grid structure
        code += `gridLayout.rows = ${config.rows || 2}\n`;
        code += `gridLayout.columns = ${config.columns || 3}\n`;

        if (config.axis) {
            code += `gridLayout.axis = .${config.axis}\n`;
        }

        if (config.spacing !== undefined) {
            code += `gridLayout.verticalSpacing = ${config.spacing}\n`;
            code += `gridLayout.horizontalSpacing = ${config.spacing}\n`;
        }

        // Create views array
        code += `\n// Create views\n`;
        code += `var gridViews: [UIView] = []\n`;

        views.forEach(view => {
            code += `let ${view.name} = ${this.generateViewCreation(view)}\n`;
            code += `gridViews.append(${view.name})\n`;
        });

        code += `\n// Assign views to grid\n`;
        code += `gridLayout.views = gridViews\n`;

        return code;
    }

    generateScrollStackView(views, config) {
        let code = '';

        // Create views
        code += `// Create views\n`;
        views.forEach(view => {
            code += `let ${view.name} = ${this.generateViewCreation(view)}\n`;
        });

        // Create and configure layout
        code += `\n// Create and configure layout\n`;
        code += `let scrollStack = ScrollStackView()\n`;

        // Build method chain
        const chainMethods = [];

        if (config.axis) {
            chainMethods.push(`.axis(.${config.axis})`);
        }

        if (config.spacing !== undefined) {
            chainMethods.push(`.spacing(${config.spacing})`);
        }

        if (config.distribution) {
            chainMethods.push(`.distribution(.${config.distribution})`);
        }

        if (config.padding !== undefined) {
            if (typeof config.padding === 'number') {
                chainMethods.push(`.padding(${config.padding})`);
            } else {
                chainMethods.push(`.padding(top: ${config.padding.top}, left: ${config.padding.left}, bottom: ${config.padding.bottom}, right: ${config.padding.right})`);
            }
        }

        // Apply method chain if we have any configurations
        if (chainMethods.length > 0) {
            code += `scrollStack\n`;
            chainMethods.forEach(method => {
                code += `    ${method}\n`;
            });
        }

        // Add views to layout
        code += `\n// Add views to layout\n`;
        views.forEach(view => {
            code += `scrollStack + ${view.name}\n`;
        });

        return code;
    }

    generateFlowLayout(views, config) {
        let code = '';

        // Create views
        code += `// Create views\n`;
        views.forEach(view => {
            code += `let ${view.name} = ${this.generateViewCreation(view)}\n`;
        });

        // Create and configure layout
        code += `\n// Create and configure layout\n`;
        code += `let flowLayout = FlowFrameLayout()\n`;

        // Build method chain
        const chainMethods = [];

        if (config.axis) {
            chainMethods.push(`.axis(.${config.axis})`);
        }

        if (config.interItemSpacing !== undefined) {
            chainMethods.push(`.interItemSpacing(${config.interItemSpacing})`);
        }

        if (config.lineSpacing !== undefined) {
            chainMethods.push(`.lineSpacing(${config.lineSpacing})`);
        }

        if (config.distribution) {
            chainMethods.push(`.distribution(.${config.distribution})`);
        }

        if (config.padding !== undefined) {
            if (typeof config.padding === 'number') {
                chainMethods.push(`.padding(${config.padding})`);
            } else {
                chainMethods.push(`.padding(top: ${config.padding.top}, left: ${config.padding.left}, bottom: ${config.padding.bottom}, right: ${config.padding.right})`);
            }
        }

        // Apply method chain if we have any configurations
        if (chainMethods.length > 0) {
            code += `flowLayout\n`;
            chainMethods.forEach(method => {
                code += `    ${method}\n`;
            });
        }

        // Add views to layout
        code += `\n// Add views to layout\n`;
        views.forEach(view => {
            code += `flowLayout + ${view.name}\n`;
        });

        return code;
    }

    generateZStackLayout(views, config) {
        let code = `let zStackLayout = ZStackLayout()\n`;

        if (config.spacing !== undefined) {
            code += `zStackLayout.spacing = ${config.spacing}\n`;
        }

        // Add views (they will overlap)
        code += `\n// Add overlapping views\n`;
        views.forEach(view => {
            code += `let ${view.name} = ${this.generateViewCreation(view)}\n`;
            code += `zStackLayout + ${view.name}\n`;
        });

        return code;
    }

    generateViewCreation(view) {
        switch (view.type) {
            case "UILabel":
                let labelCode = `{\n    let label = UILabel()\n`;
                if (view.text) {
                    labelCode += `    label.text = "${view.text}"\n`;
                }
                labelCode += `    return label\n}()`;
                return labelCode;

            case "UIButton":
                let buttonCode = `{\n    let button = UIButton(type: .system)\n`;
                if (view.text) {
                    buttonCode += `    button.setTitle("${view.text}", for: .normal)\n`;
                }
                buttonCode += `    return button\n}()`;
                return buttonCode;

            case "UIImageView":
                let imageCode = `{\n    let imageView = UIImageView()\n`;
                if (view.image) {
                    imageCode += `    imageView.image = UIImage(${view.image.startsWith('system') ? 'systemName: ' : 'named: '}"${view.image}")\n`;
                }
                imageCode += `    return imageView\n}()`;
                return imageCode;

            case "UITextField":
                let textFieldCode = `{\n    let textField = UITextField()\n`;
                if (view.text) {
                    textFieldCode += `    textField.placeholder = "${view.text}"\n`;
                }
                textFieldCode += `    return textField\n}()`;
                return textFieldCode;

            case "UITextView":
                let textViewCode = `{\n    let textView = UITextView()\n`;
                if (view.text) {
                    textViewCode += `    textView.text = "${view.text}"\n`;
                }
                textViewCode += `    return textView\n}()`;
                return textViewCode;

            default:
                return `{\n    let view = ${view.type}()\n    return view\n}()`;
        }
    }

    generatePadding(layoutName, padding) {
        if (typeof padding === 'number') {
            return `${layoutName}.padding(${padding})\n`;
        } else {
            return `${layoutName}.padding(top: ${padding.top}, left: ${padding.left}, bottom: ${padding.bottom}, right: ${padding.right})\n`;
        }
    }

    paddingValue(padding) {
        if (typeof padding === 'number') {
            return `${padding}`;
        } else {
            return `top: ${padding.top}, left: ${padding.left}, bottom: ${padding.bottom}, right: ${padding.right}`;
        }
    }
}

// Complete View Controller generator
class ViewControllerGenerator {
    generateViewController(className, layoutStructure) {
        let code = '';

        // Import and class declaration
        code += `import UIKit\n`;
        code += `import FrameLayoutKit\n\n`;
        code += `class ${className}: UIViewController {\n\n`;

        // Properties for views
        code += `    // MARK: - UI Components\n`;
        layoutStructure.views.forEach(view => {
            code += `    private lazy var ${view.name} = ${this.generateLazyViewProperty(view)}\n`;
        });

        // Main layout property
        code += `    private lazy var frameLayout = ${layoutStructure.mainLayout}()\n\n`;

        // ViewDidLoad
        code += `    override func viewDidLoad() {\n`;
        code += `        super.viewDidLoad()\n`;
        code += `        view.backgroundColor = .systemBackground\n`;
        code += `        setupLayout()\n`;
        code += `    }\n\n`;

        // ViewDidLayoutSubviews
        code += `    override func viewDidLayoutSubviews() {\n`;
        code += `        super.viewDidLayoutSubviews()\n`;
        code += `        frameLayout.frame = view.bounds\n`;
        code += `    }\n\n`;

        // Setup layout method
        code += `    // MARK: - Layout Setup\n`;
        code += `    private func setupLayout() {\n`;

        // Configure main layout
        if (layoutStructure.configuration) {
            const config = layoutStructure.configuration;
            code += `        // Configure main layout\n`;
            const chainMethods = [];

            if (config.spacing !== undefined) {
                chainMethods.push(`.spacing(${config.spacing})`);
            }
            if (config.distribution) {
                chainMethods.push(`.distribution(.${config.distribution})`);
            }
            if (config.padding !== undefined) {
                if (typeof config.padding === 'number') {
                    chainMethods.push(`.padding(${config.padding})`);
                } else {
                    chainMethods.push(`.padding(top: ${config.padding.top}, left: ${config.padding.left}, bottom: ${config.padding.bottom}, right: ${config.padding.right})`);
                }
            }

            if (chainMethods.length > 0) {
                code += `        frameLayout\n`;
                chainMethods.forEach(method => {
                    code += `            ${method}\n`;
                });
                code += `\n`;
            }
        }

        // Add views to layout
        code += `        // Add views to layout\n`;
        layoutStructure.views.forEach(view => {
            if (view.properties && view.properties.fixedHeight) {
                code += `        (frameLayout + ${view.name}).fixedHeight(${view.properties.fixedHeight})\n`;
            } else {
                code += `        frameLayout + ${view.name}\n`;
            }
        });

        // Add layout to view hierarchy
        code += `\n        // Add to view hierarchy\n`;
        code += `        view.addSubview(frameLayout)\n`;
        code += `    }\n`;
        code += `}\n`;

        return code;
    }

    generateLazyViewProperty(view) {
        const frameLayoutGenerator = new FrameLayoutGenerator();
        let viewCreation = frameLayoutGenerator.generateViewCreation(view);

        // Remove the outer closure and return statement for lazy property
        viewCreation = viewCreation.replace(/^\{\s*\n/, '').replace(/\s*return \w+\s*\n\}.*$/, '');

        // Fix indentation for lazy property
        const lines = viewCreation.split('\n');
        const indentedLines = lines.map(line => line ? `        ${line}` : line);

        return `{\n${indentedLines.join('\n')}\n    }()`;
    }
}

// Auto Layout to FrameLayoutKit converter
class AutoLayoutConverter {
    async convert(swiftCode, options) {
        const warnings = [];
        const suggestions = [];
        let convertedCode = swiftCode;

        // Parse the Swift code to identify Auto Layout patterns
        const patterns = this.identifyAutoLayoutPatterns(swiftCode);

        // Convert NSLayoutConstraint to FrameLayoutKit
        if (patterns.hasNSLayoutConstraints) {
            const constraintConversion = this.convertNSLayoutConstraints(swiftCode, options);
            convertedCode = constraintConversion.code;
            warnings.push(...constraintConversion.warnings);
            suggestions.push(...constraintConversion.suggestions);
        }

        // Convert UIStackView to StackFrameLayout
        if (patterns.hasStackViews) {
            const stackConversion = this.convertStackViews(convertedCode, options);
            convertedCode = stackConversion.code;
            warnings.push(...stackConversion.warnings);
        }

        // Convert layout anchors to FrameLayoutKit
        if (patterns.hasLayoutAnchors) {
            const anchorConversion = this.convertLayoutAnchors(convertedCode, options);
            convertedCode = anchorConversion.code;
            suggestions.push(...anchorConversion.suggestions);
        }

        return {
            code: convertedCode,
            warnings,
            suggestions,
            stats: {
                constraintsConverted: patterns.constraintCount,
                stackViewsConverted: patterns.stackViewCount,
                totalChanges: warnings.length + suggestions.length
            }
        };
    }

    identifyAutoLayoutPatterns(code) {
        return {
            hasNSLayoutConstraints: /NSLayoutConstraint/.test(code),
            hasStackViews: /UIStackView/.test(code),
            hasLayoutAnchors: /\.(topAnchor|bottomAnchor|leadingAnchor|trailingAnchor|centerXAnchor|centerYAnchor)/.test(code),
            constraintCount: (code.match(/NSLayoutConstraint/g) || []).length,
            stackViewCount: (code.match(/UIStackView/g) || []).length
        };
    }

    convertNSLayoutConstraints(code, options) {
        const warnings = [];
        const suggestions = [];
        let convertedCode = code;

        // Pattern to match NSLayoutConstraint.activate
        const activatePattern = /NSLayoutConstraint\.activate\(\[([\s\S]*?)\]\)/g;

        convertedCode = convertedCode.replace(activatePattern, (match, constraints) => {
            const suggestion = this.suggestFrameLayoutEquivalent(constraints);
            suggestions.push(suggestion);

            if (options.migrationStrategy === 'aggressive') {
                return suggestion.code;
            } else {
                warnings.push(`Manual review needed for constraint conversion at: ${match.substring(0, 50)}...`);
                return `// TODO: Convert to FrameLayoutKit\n${match}`;
            }
        });

        return { code: convertedCode, warnings, suggestions };
    }

    convertStackViews(code, options) {
        const warnings = [];
        let convertedCode = code;

        // Pattern to match UIStackView initialization
        const stackViewPattern = /let\s+(\w+)\s*=\s*UIStackView\(\)/g;

        convertedCode = convertedCode.replace(stackViewPattern, (match, varName) => {
            warnings.push(`Converted UIStackView '${varName}' to VStackLayout. Review axis and distribution settings.`);
            return `let ${varName} = VStackLayout()`;
        });

        // Convert axis property
        convertedCode = convertedCode.replace(/\.axis\s*=\s*\.horizontal/g, '.axis = .horizontal');
        convertedCode = convertedCode.replace(/\.axis\s*=\s*\.vertical/g, '.axis = .vertical');

        // Convert distribution
        convertedCode = convertedCode.replace(/\.distribution\s*=\s*\.fillEqually/g, '.distribution = .equal');
        convertedCode = convertedCode.replace(/\.distribution\s*=\s*\.equalCentering/g, '.distribution = .center');

        // Convert arrangedSubviews
        convertedCode = convertedCode.replace(/(\w+)\.addArrangedSubview\((\w+)\)/g, '$1 + $2');

        return { code: convertedCode, warnings };
    }

    convertLayoutAnchors(code, options) {
        const suggestions = [];
        let convertedCode = code;

        // Common anchor patterns
        const anchorPatterns = [
            {
                pattern: /(\w+)\.centerXAnchor\.constraint\(equalTo:\s*(\w+)\.centerXAnchor\)/g,
                suggestion: 'Use .align(.center, .center) in FrameLayoutKit'
            },
            {
                pattern: /(\w+)\.topAnchor\.constraint\(equalTo:\s*(\w+)\.topAnchor,\s*constant:\s*(\d+)\)/g,
                suggestion: 'Use .padding(top: $3) in FrameLayoutKit'
            }
        ];

        anchorPatterns.forEach(({ pattern, suggestion }) => {
            if (pattern.test(code)) {
                suggestions.push({
                    pattern: pattern.toString(),
                    suggestion,
                    code: '// ' + suggestion
                });
            }
        });

        return { code: convertedCode, suggestions };
    }

    suggestFrameLayoutEquivalent(constraints) {
        // Analyze constraints and suggest FrameLayoutKit equivalent
        const hasEqualWidths = /widthAnchor.*equalTo.*widthAnchor/.test(constraints);
        const hasCenterAlignment = /centerXAnchor.*equalTo.*centerXAnchor/.test(constraints);

        let suggestedLayout = '';
        let explanation = '';

        if (hasEqualWidths) {
            suggestedLayout = 'DoubleFrameLayout().distribution(.equal)';
            explanation = 'Equal width constraints suggest using DoubleFrameLayout with .equal distribution';
        } else if (hasCenterAlignment) {
            suggestedLayout = 'FrameLayout().align(.center, .center)';
            explanation = 'Center alignment constraints can be replaced with FrameLayout alignment';
        }

        return {
            code: suggestedLayout,
            explanation
        };
    }
}

// FrameLayoutKit code validator
class FrameLayoutValidator {
    async validate(swiftCode, checkLevel) {
        const errors = [];
        const warnings = [];
        const suggestions = [];

        // Syntax validation
        if (checkLevel === 'syntax' || checkLevel === 'full') {
            const syntaxErrors = this.validateSyntax(swiftCode);
            errors.push(...syntaxErrors);
        }

        // Semantic validation
        if (checkLevel === 'semantic' || checkLevel === 'full') {
            const semanticIssues = this.validateSemantics(swiftCode);
            warnings.push(...semanticIssues.warnings);
            suggestions.push(...semanticIssues.suggestions);
        }

        // Generate report
        const report = this.generateValidationReport(errors, warnings, suggestions);

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            suggestions,
            report
        };
    }

    validateSyntax(code) {
        const errors = [];

        // CHECK FOR FORBIDDEN AUTOLAYOUT CODE - THIS IS CRITICAL
        const autoLayoutChecks = [
            {
                pattern: /NSLayoutConstraint/,
                error: 'CRITICAL ERROR: NSLayoutConstraint detected! FrameLayoutKit should NEVER use AutoLayout constraints.'
            },
            {
                pattern: /\.constraint\(/,
                error: 'CRITICAL ERROR: AutoLayout constraint method detected! Use FrameLayoutKit methods instead.'
            },
            {
                pattern: /translatesAutoresizingMaskIntoConstraints/,
                error: 'CRITICAL ERROR: AutoLayout mask constraint detected! FrameLayoutKit handles layout automatically.'
            },
            {
                pattern: /\.activate\(\[/,
                error: 'CRITICAL ERROR: NSLayoutConstraint.activate detected! Use FrameLayoutKit operators instead.'
            },
            {
                pattern: /\.(topAnchor|bottomAnchor|leadingAnchor|trailingAnchor|centerXAnchor|centerYAnchor)/,
                error: 'CRITICAL ERROR: AutoLayout anchors detected! Use FrameLayoutKit alignment methods instead.'
            }
        ];

        autoLayoutChecks.forEach(check => {
            if (check.pattern.test(code)) {
                errors.push(check.error);
            }
        });

        // Check for incorrect FrameLayoutKit syntax
        const frameLaoutSyntaxChecks = [
            {
                pattern: /\.centerLayout\(\)/,
                error: 'SYNTAX ERROR: .centerLayout() does not exist. Use (layout + view).aligns(.center, .center) instead.'
            },
            {
                pattern: /\.frameLayout\(height:/,
                error: 'SYNTAX ERROR: .frameLayout(height:) is incorrect. Use (layout + view).fixedHeight() instead.'
            },
            {
                pattern: /\.frameLayout\(width:/,
                error: 'SYNTAX ERROR: .frameLayout(width:) is incorrect. Use (layout + view).fixedWidth() instead.'
            }
        ];

        frameLaoutSyntaxChecks.forEach(check => {
            if (check.pattern.test(code)) {
                errors.push(check.error);
            }
        });

        // Check for common syntax errors
        const syntaxChecks = [
            {
                pattern: /\+\s*\+/,
                error: 'Double + operator detected. Each + should have a view on both sides.'
            },
            {
                pattern: /<\+.*<\+/,
                error: 'Multiple <+ operators. DoubleFrameLayout can only have one left view.'
            },
            {
                pattern: /\+>.*\+>/,
                error: 'Multiple +> operators. DoubleFrameLayout can only have one right view.'
            }
        ];

        syntaxChecks.forEach(check => {
            if (check.pattern.test(code)) {
                errors.push(check.error);
            }
        });

        // Validate method chaining
        const chainPattern = /\)\s*\.\s*\w+\(/g;
        const chains = code.match(chainPattern) || [];
        chains.forEach(chain => {
            if (!this.isValidChainMethod(chain)) {
                errors.push(`Invalid chain method: ${chain}`);
            }
        });

        return errors;
    }

    validateSemantics(code) {
        const warnings = [];
        const suggestions = [];

        // Check for semantic issues
        if (/GridFrameLayout.*views\s*=\s*\[\]/.test(code)) {
            warnings.push('GridFrameLayout has empty views array');
        }

        if (/DoubleFrameLayout.*\n.*\+\s*\w+\s*\n.*\+\s*\w+\s*\n.*\+\s*\w+/.test(code)) {
            warnings.push('DoubleFrameLayout should only contain 2 views, but more were added');
        }

        if (/distribution\s*=\s*\.justified.*isJustified\s*=\s*false/.test(code)) {
            suggestions.push('When using .justified distribution, consider setting isJustified = true');
        }

        if (/ScrollStackView.*axis\s*=\s*\.horizontal.*frame\.height\s*=\s*\d{3,}/.test(code)) {
            suggestions.push('Horizontal ScrollStackView has large height. Consider reducing for better UX.');
        }

        return { warnings, suggestions };
    }

    isValidChainMethod(chain) {
        const validMethods = [
            // Layout configuration methods
            'padding', 'align', 'aligns', 'spacing', 'distribution', 'axis',
            // Size methods
            'fixedSize', 'fixedWidth', 'fixedHeight', 'minSize', 'maxSize',
            'flexible', 'flexibleWidth', 'flexibleHeight',
            // Grid layout methods
            'rows', 'columns', 'interItemSpacing', 'lineSpacing',
            // Utility methods
            'debug', 'isOverlapped', 'fitToSuperview'
        ];

        const methodMatch = chain.match(/\.(\w+)\(/);
        if (methodMatch) {
            return validMethods.includes(methodMatch[1]);
        }

        return false;
    }

    generateValidationReport(errors, warnings, suggestions) {
        let report = '# FrameLayoutKit Validation Report\n\n';

        if (errors.length === 0) {
            report += '✅ **No syntax errors found**\n\n';
        } else {
            report += `❌ **${errors.length} Errors Found:**\n\n`;
            errors.forEach((error, index) => {
                report += `${index + 1}. ${error}\n`;
            });
            report += '\n';
        }

        if (warnings.length > 0) {
            report += `⚠️ **${warnings.length} Warnings:**\n\n`;
            warnings.forEach((warning, index) => {
                report += `${index + 1}. ${warning}\n`;
            });
            report += '\n';
        }

        if (suggestions.length > 0) {
            report += `💡 **${suggestions.length} Suggestions:**\n\n`;
            suggestions.forEach((suggestion, index) => {
                report += `${index + 1}. ${suggestion}\n`;
            });
        }

        return report;
    }
}

// Migration analyzer for projects
class MigrationAnalyzer {
    async analyzeMigrationPath(projectPath, swiftFiles) {
        const analysis = {
            complexity: 'medium',
            estimatedEffort: '2-3 weeks',
            fileCount: 0,
            recommendations: [],
            formatted: {}
        };

        // Analyze project structure or individual files
        if (projectPath) {
            // Would analyze entire project
            analysis.fileCount = 50; // Example
            analysis.recommendations.push('Start with view controllers that use simple layouts');
            analysis.recommendations.push('Migrate UIStackView usage first as it maps well to StackFrameLayout');
        } else if (swiftFiles) {
            analysis.fileCount = swiftFiles.length;
            // Analyze each file
            swiftFiles.forEach(file => {
                if (file.includes('ViewController')) {
                    analysis.recommendations.push(`${file}: Good candidate for migration`);
                }
            });
        }

        // Generate formatted outputs
        analysis.formatted.markdown = this.generateMarkdownGuide(analysis);
        analysis.formatted.json = JSON.stringify(analysis, null, 2);
        analysis.formatted.html = this.generateHTMLGuide(analysis);

        return analysis;
    }

    generateMarkdownGuide(analysis) {
        let guide = '# FrameLayoutKit Migration Guide\n\n';
        guide += `## Project Overview\n\n`;
        guide += `- **Files to migrate:** ${analysis.fileCount}\n`;
        guide += `- **Complexity:** ${analysis.complexity}\n`;
        guide += `- **Estimated effort:** ${analysis.estimatedEffort}\n\n`;

        guide += `## Migration Strategy\n\n`;
        guide += `### Phase 1: Preparation\n`;
        guide += `1. Add FrameLayoutKit to your project\n`;
        guide += `2. Create a feature branch for migration\n`;
        guide += `3. Set up the MCP server for assistance\n\n`;

        guide += `### Phase 2: Migration\n`;
        analysis.recommendations.forEach((rec, index) => {
            guide += `${index + 1}. ${rec}\n`;
        });

        guide += `\n### Phase 3: Testing\n`;
        guide += `1. Visual regression testing\n`;
        guide += `2. Performance benchmarking\n`;
        guide += `3. User acceptance testing\n`;

        return guide;
    }

    generateHTMLGuide(analysis) {
        return `<!DOCTYPE html>
<html>
<head>
    <title>FrameLayoutKit Migration Guide</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 40px; }
        h1 { color: #333; }
        h2 { color: #666; }
        .metric { background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>FrameLayoutKit Migration Guide</h1>
    <div class="metric">
        <strong>Files to migrate:</strong> ${analysis.fileCount}<br>
        <strong>Complexity:</strong> ${analysis.complexity}<br>
        <strong>Estimated effort:</strong> ${analysis.estimatedEffort}
    </div>
    <h2>Recommendations</h2>
    <ul>
        ${analysis.recommendations.map(rec => `<li>${rec}</li>`).join('\n        ')}
    </ul>
</body>
</html>`;
    }
}

// Start the server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("FrameLayoutKit MCP Server started successfully");
}

main().catch(error => {
    console.error("Failed to start server:", error);
    process.exit(1);
});