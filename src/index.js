#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { execFileSync } from "child_process";

// Schema definitions for FrameLayoutKit components
const ViewTypeSchema = z.enum([
    "UILabel", "UIButton", "UIImageView", "UITextField", "UITextView",
    "UIView", "UIStackView", "UIScrollView", "UITableView", "UICollectionView"
]);

const AlignmentSchema = z.object({
    vertical: z.enum(["top", "center", "bottom", "fill", "fit"]).optional(),
    horizontal: z.enum(["left", "center", "right", "fill", "fit"]).optional()
});

const EdgeInsetsSchema = z.object({
    top: z.number().default(0),
    left: z.number().default(0),
    bottom: z.number().default(0),
    right: z.number().default(0)
});

const LayoutTypeSchema = z.enum([
    "FrameLayout", "VStackLayout", "HStackLayout", "ZStackLayout",
    "DoubleFrameLayout", "GridFrameLayout", "ScrollStackView", "FlowFrameLayout"
]);

const DistributionSchema = z.enum([
    "left", "center", "right", "top", "bottom", "equal", "fill", "justified"
]);

// Initialize MCP Server
const server = new McpServer({
    name: "framelayoutkit-assistant",
    version: "1.0.0",
    description: "MCP server for FrameLayoutKit iOS framework - generates Swift UIKit code using FrameLayoutKit syntax"
});

// Tool: Generate FrameLayoutKit code
server.tool("generate-framelayout",
    {
        layoutType: LayoutTypeSchema,
        views: z.array(z.object({
            name: z.string(),
            type: ViewTypeSchema,
            properties: z.record(z.any()).optional(),
            text: z.string().optional(),
            image: z.string().optional()
        })),
        configuration: z.object({
            axis: z.enum(["horizontal", "vertical"]).optional(),
            spacing: z.number().optional(),
            padding: z.union([z.number(), EdgeInsetsSchema]).optional(),
            distribution: DistributionSchema.optional(),
            alignment: AlignmentSchema.optional(),
            // Grid specific
            rows: z.number().optional(),
            columns: z.number().optional(),
            // Flow specific
            interItemSpacing: z.number().optional(),
            lineSpacing: z.number().optional(),
            // Double specific
            isOverlapped: z.boolean().optional()
        }).optional()
    },
    async ({ layoutType, views, configuration = {} }) => {
        const generator = new FrameLayoutGenerator();
        const code = generator.generateLayout(layoutType, views, configuration);

        return {
            content: [{
                type: "text",
                text: code,
                metadata: {
                    language: "swift",
                    framework: "FrameLayoutKit"
                }
            }]
        };
    }
);

// Tool: Convert Auto Layout to FrameLayoutKit
server.tool("convert-autolayout",
    {
        swiftCode: z.string(),
        options: z.object({
            preserveComments: z.boolean().default(true),
            generateHelperMethods: z.boolean().default(false),
            useOperatorSyntax: z.boolean().default(true),
            migrationStrategy: z.enum(["conservative", "aggressive"]).default("conservative")
        }).optional()
    },
    async ({ swiftCode, options = {} }) => {
        const converter = new AutoLayoutConverter();
        const result = await converter.convert(swiftCode, options);

        return {
            content: [{
                type: "text",
                text: result.code,
                metadata: {
                    warnings: result.warnings,
                    suggestions: result.suggestions,
                    conversionStats: result.stats
                }
            }]
        };
    }
);

// Tool: Validate FrameLayoutKit code
server.tool("validate-framelayout",
    {
        swiftCode: z.string(),
        checkLevel: z.enum(["syntax", "semantic", "full"]).default("full")
    },
    async ({ swiftCode, checkLevel }) => {
        const validator = new FrameLayoutValidator();
        const result = await validator.validate(swiftCode, checkLevel);

        return {
            content: [{
                type: "text",
                text: result.report,
                metadata: {
                    isValid: result.isValid,
                    errors: result.errors,
                    warnings: result.warnings,
                    suggestions: result.suggestions
                }
            }]
        };
    }
);

// Tool: Generate migration guide
server.tool("generate-migration-guide",
    {
        projectPath: z.string().optional(),
        swiftFiles: z.array(z.string()).optional(),
        outputFormat: z.enum(["markdown", "html", "json"]).default("markdown")
    },
    async ({ projectPath, swiftFiles, outputFormat }) => {
        const analyzer = new MigrationAnalyzer();
        const guide = await analyzer.analyzeMigrationPath(projectPath, swiftFiles);

        return {
            content: [{
                type: "text",
                text: guide.formatted[outputFormat],
                metadata: {
                    complexity: guide.complexity,
                    estimatedEffort: guide.estimatedEffort,
                    fileCount: guide.fileCount
                }
            }]
        };
    }
);

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
        let code = `let ${view.name}Layout = FrameLayout()\n`;
        code += `let ${view.name} = ${this.generateViewCreation(view)}\n`;

        // Assign view using + operator
        code += `${view.name}Layout + ${view.name}\n`;

        // Apply configuration
        if (config.padding) {
            code += this.generatePadding(`${view.name}Layout`, config.padding);
        }

        if (config.alignment) {
            code += `${view.name}Layout.align(`;
            code += `.${config.alignment.vertical || 'center'}, `;
            code += `.${config.alignment.horizontal || 'center'})\n`;
        }

        return code;
    }

    generateStackLayout(stackType, views, config) {
        let code = `let stackLayout = ${stackType}()\n`;

        // Configure stack properties
        if (config.spacing !== undefined) {
            code += `stackLayout.spacing = ${config.spacing}\n`;
        }

        if (config.distribution) {
            code += `stackLayout.distribution = .${config.distribution}\n`;
        }

        if (config.padding) {
            code += this.generatePadding('stackLayout', config.padding);
        }

        // Create and add views
        code += `\n// Add views to stack\n`;
        views.forEach((view, index) => {
            code += `let ${view.name} = ${this.generateViewCreation(view)}\n`;
            code += `stackLayout + ${view.name}\n`;

            // Add spacing between specific items if needed
            if (index < views.length - 1 && config.spacing === undefined) {
                code += `stackLayout + 8 // Default spacing\n`;
            }
        });

        return code;
    }

    generateDoubleFrameLayout(views, config) {
        if (views.length !== 2) {
            throw new Error("DoubleFrameLayout requires exactly 2 views");
        }

        let code = `let doubleLayout = DoubleFrameLayout()\n`;

        // Configure properties
        if (config.axis) {
            code += `doubleLayout.axis = .${config.axis}\n`;
        }

        if (config.spacing !== undefined) {
            code += `doubleLayout.spacing = ${config.spacing}\n`;
        }

        if (config.distribution) {
            code += `doubleLayout.distribution = .${config.distribution}\n`;
        }

        if (config.isOverlapped) {
            code += `doubleLayout.isOverlapped = true\n`;
        }

        // Create views
        code += `\n// Create views\n`;
        code += `let ${views[0].name} = ${this.generateViewCreation(views[0])}\n`;
        code += `let ${views[1].name} = ${this.generateViewCreation(views[1])}\n`;

        // Assign views using operators
        code += `\n// Assign views using operators\n`;
        code += `doubleLayout <+ ${views[0].name}\n`;
        code += `doubleLayout +> ${views[1].name}\n`;

        // Configure individual frame layouts if needed
        if (config.padding) {
            code += `\n// Configure padding\n`;
            code += `doubleLayout.leftFrameLayout.padding(${this.paddingValue(config.padding)})\n`;
            code += `doubleLayout.rightFrameLayout.padding(${this.paddingValue(config.padding)})\n`;
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
        let code = `let scrollStack = ScrollStackView()\n`;

        // Configure properties
        if (config.axis) {
            code += `scrollStack.axis = .${config.axis}\n`;
        }

        if (config.spacing !== undefined) {
            code += `scrollStack.spacing = ${config.spacing}\n`;
        }

        if (config.padding) {
            code += this.generatePadding('scrollStack', config.padding);
        }

        if (config.distribution) {
            code += `scrollStack.distribution = .${config.distribution}\n`;
        }

        // Add views
        code += `\n// Add views to scroll stack\n`;
        views.forEach(view => {
            code += `let ${view.name} = ${this.generateViewCreation(view)}\n`;
            code += `scrollStack + ${view.name}\n`;
        });

        return code;
    }

    generateFlowLayout(views, config) {
        let code = `let flowLayout = FlowFrameLayout()\n`;

        // Configure properties
        if (config.axis) {
            code += `flowLayout.axis = .${config.axis}\n`;
        }

        if (config.interItemSpacing !== undefined) {
            code += `flowLayout.interItemSpacing = ${config.interItemSpacing}\n`;
        }

        if (config.lineSpacing !== undefined) {
            code += `flowLayout.lineSpacing = ${config.lineSpacing}\n`;
        }

        if (config.distribution) {
            code += `flowLayout.distribution = .${config.distribution}\n`;
        }

        if (config.padding) {
            code += this.generatePadding('flowLayout', config.padding);
        }

        // Add views
        code += `\n// Add views to flow layout\n`;
        views.forEach(view => {
            code += `let ${view.name} = ${this.generateViewCreation(view)}\n`;
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
                let labelCode = `UILabel()`;
                if (view.text) {
                    labelCode = `{\n    let label = UILabel()\n`;
                    labelCode += `    label.text = "${view.text}"\n`;
                    labelCode += `    return label\n}()`;
                }
                return labelCode;

            case "UIButton":
                let buttonCode = `{\n    let button = UIButton(type: .system)\n`;
                if (view.text) {
                    buttonCode += `    button.setTitle("${view.text}", for: .normal)\n`;
                }
                buttonCode += `    return button\n}()`;
                return buttonCode;

            case "UIImageView":
                if (view.image) {
                    return `UIImageView(image: UIImage(${view.image.startsWith('system') ? 'systemName: ' : 'named: '}"${view.image}"))`;
                }
                return `UIImageView()`;

            default:
                return `${view.type}()`;
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
            'padding', 'align', 'fixedSize', 'spacing', 'distribution',
            'axis', 'rows', 'columns', 'debug', 'flexible', 'minSize', 'maxSize'
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
const transport = new StdioServerTransport();
server.connect(transport);

console.error("FrameLayoutKit MCP Server started successfully");