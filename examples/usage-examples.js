// Example usage of FrameLayoutKit MCP Server tools

// Example 1: Generate a VStackLayout with three labels
const example1Request = {
    tool: "generate-framelayout",
    arguments: {
        layoutType: "VStackLayout",
        views: [
            {
                name: "titleLabel",
                type: "UILabel",
                text: "Welcome to FrameLayoutKit"
            },
            {
                name: "subtitleLabel",
                type: "UILabel",
                text: "Build layouts easily"
            },
            {
                name: "descriptionLabel",
                type: "UILabel",
                text: "A powerful layout framework for iOS"
            }
        ],
        configuration: {
            spacing: 12,
            padding: 20,
            distribution: "fill",
            alignment: {
                vertical: "center",
                horizontal: "center"
            }
        }
    }
};

// Expected output:
/*
let stackLayout = VStackLayout()
stackLayout.spacing = 12
stackLayout.distribution = .fill
stackLayout.padding(20)

// Add views to stack
let titleLabel = {
    let label = UILabel()
    label.text = "Welcome to FrameLayoutKit"
    return label
}()
stackLayout + titleLabel
let subtitleLabel = {
    let label = UILabel()
    label.text = "Build layouts easily"
    return label
}()
stackLayout + subtitleLabel
let descriptionLabel = {
    let label = UILabel()
    label.text = "A powerful layout framework for iOS"
    return label
}()
stackLayout + descriptionLabel
*/

// Example 2: Generate a DoubleFrameLayout with image and text
const example2Request = {
    tool: "generate-framelayout",
    arguments: {
        layoutType: "DoubleFrameLayout",
        views: [
            {
                name: "iconImageView",
                type: "UIImageView",
                image: "systemName: star.fill"
            },
            {
                name: "textLabel",
                type: "UILabel",
                text: "Featured Item"
            }
        ],
        configuration: {
            axis: "horizontal",
            spacing: 8,
            distribution: "left",
            padding: {
                top: 10,
                left: 15,
                bottom: 10,
                right: 15
            }
        }
    }
};

// Example 3: Convert Auto Layout code
const example3Request = {
    tool: "convert-autolayout",
    arguments: {
        swiftCode: `
let stackView = UIStackView()
stackView.axis = .vertical
stackView.distribution = .fillEqually
stackView.spacing = 10

stackView.addArrangedSubview(label1)
stackView.addArrangedSubview(label2)
stackView.addArrangedSubview(label3)

NSLayoutConstraint.activate([
    stackView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 20),
    stackView.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 16),
    stackView.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -16)
])
`,
        options: {
            preserveComments: true,
            useOperatorSyntax: true,
            migrationStrategy: "conservative"
        }
    }
};

// Expected output:
/*
let stackView = VStackLayout()
stackView.axis = .vertical
stackView.distribution = .equal
stackView.spacing = 10

stackView + label1
stackView + label2
stackView + label3

// TODO: Convert to FrameLayoutKit
NSLayoutConstraint.activate([
    stackView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 20),
    stackView.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 16),
    stackView.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -16)
])
*/

// Example 4: Generate a GridFrameLayout
const example4Request = {
    tool: "generate-framelayout",
    arguments: {
        layoutType: "GridFrameLayout",
        views: [
            { name: "cell1", type: "UIView" },
            { name: "cell2", type: "UIView" },
            { name: "cell3", type: "UIView" },
            { name: "cell4", type: "UIView" },
            { name: "cell5", type: "UIView" },
            { name: "cell6", type: "UIView" }
        ],
        configuration: {
            rows: 2,
            columns: 3,
            spacing: 10,
            axis: "horizontal"
        }
    }
};

// Example 5: Generate a ScrollStackView
const example5Request = {
    tool: "generate-framelayout",
    arguments: {
        layoutType: "ScrollStackView",
        views: Array.from({ length: 10 }, (_, i) => ({
            name: `itemLabel${i + 1}`,
            type: "UILabel",
            text: `Item ${i + 1}`
        })),
        configuration: {
            axis: "vertical",
            spacing: 8,
            padding: 16,
            distribution: "fill"
        }
    }
};

// Example 6: Generate a FlowFrameLayout for tags
const example6Request = {
    tool: "generate-framelayout",
    arguments: {
        layoutType: "FlowFrameLayout",
        views: [
            { name: "tag1", type: "UIButton", text: "Swift" },
            { name: "tag2", type: "UIButton", text: "iOS" },
            { name: "tag3", type: "UIButton", text: "FrameLayoutKit" },
            { name: "tag4", type: "UIButton", text: "UIKit" },
            { name: "tag5", type: "UIButton", text: "Layout" }
        ],
        configuration: {
            axis: "horizontal",
            interItemSpacing: 8,
            lineSpacing: 12,
            distribution: "left",
            padding: 16
        }
    }
};

// Example 7: Validate FrameLayoutKit code
const example7Request = {
    tool: "validate-framelayout",
    arguments: {
        swiftCode: `
let doubleLayout = DoubleFrameLayout()
doubleLayout <+ imageView
doubleLayout +> label
doubleLayout +> anotherLabel // Error: multiple right views

let stack = VStackLayout()
stack + + view1 // Error: double + operator
`,
        checkLevel: "full"
    }
};

// Expected validation output:
/*
# FrameLayoutKit Validation Report

❌ **2 Errors Found:**

1. Multiple +> operators. DoubleFrameLayout can only have one right view.
2. Double + operator detected. Each + should have a view on both sides.

⚠️ **1 Warnings:**

1. DoubleFrameLayout should only contain 2 views, but more were added
*/

// Example 8: Complex layout combining multiple layout types
const example8Request = {
    tool: "generate-framelayout",
    arguments: {
        layoutType: "VStackLayout",
        views: [
            {
                name: "headerView",
                type: "UIView",
                properties: {
                    backgroundColor: ".systemBlue"
                }
            },
            {
                name: "contentScroll",
                type: "UIScrollView"
            },
            {
                name: "buttonRow",
                type: "UIView"
            }
        ],
        configuration: {
            spacing: 0,
            distribution: "top",
            padding: 0
        }
    }
};

// Then you could generate inner layouts:
const headerLayoutRequest = {
    tool: "generate-framelayout",
    arguments: {
        layoutType: "FrameLayout",
        views: [{
            name: "headerLabel",
            type: "UILabel",
            text: "My App"
        }],
        configuration: {
            padding: 20,
            alignment: {
                vertical: "center",
                horizontal: "center"
            }
        }
    }
};

// Export examples for testing
export const examples = {
    basicVStack: example1Request,
    doubleLayout: example2Request,
    autoLayoutConversion: example3Request,
    gridLayout: example4Request,
    scrollStack: example5Request,
    flowLayout: example6Request,
    validation: example7Request,
    complexLayout: example8Request
};