const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const fs = require("fs");
const path = require("path");

class EnhancedParser {
  constructor() {
    this.componentUsages = [];
    this.imports = [];
    this.hookUsages = [];
  }

  parseWithTypeInfo(filePath) {
    const content = fs.readFileSync(filePath, "utf-8");

    // Skip files that shouldn't be parsed
    const skipPatterns = [
      /node_modules/,
      /\.min\./,
      /\.test\./,
      /\.spec\./,
      /build\//,
      /dist\//,
      /public\//,
      /\.stories\./,
    ];

    if (skipPatterns.some((pattern) => pattern.test(filePath))) {
      return null;
    }

    try {
      return parser.parse(content, {
        sourceType: "unambiguous",
        plugins: [
          "jsx",
          ["typescript", { isTSX: true }],
          "classProperties",
          "dynamicImport",
          "optionalChaining",
          "nullishCoalescingOperator",
        ],
        errorRecovery: true,
      });
    } catch (error) {
      console.warn(`Parsing error in ${filePath}: ${error.message}`);
      return null;
    }
  }

  isReactComponent(name, node, filePath) {
    if (!/^[A-Z]/.test(name)) return false;

    const componentPatterns = [
      () => this.returnsJSX(node),
      () => this.usesHooks(node),
      () => this.hasReactProperties(node),
      () => /Component|Screen|Page|View|Modal|Dialog/.test(filePath),
    ];

    return componentPatterns.some((pattern) => pattern());
  }

  returnsJSX(node) {
    const nodeStr = JSON.stringify(node);
    return (
      nodeStr.includes("JSXElement") ||
      nodeStr.includes("JSXFragment") ||
      nodeStr.includes("createElement")
    );
  }

  usesHooks(node) {
    const nodeStr = JSON.stringify(node);
    const hookPattern = /"name":"use[A-Z]\w*"/g;
    return hookPattern.test(nodeStr);
  }

  hasReactProperties(node) {
    // Check for displayName, propTypes, defaultProps
    return false; // Implement if needed
  }

  enrichComponentMetadata(component, ast, filePath) {
    return {
      ...component,
      id: `${component.name}:${filePath}`,
      loc: ast.loc ? ast.loc.end.line - ast.loc.start.line : 0,
      complexity: this.calculateComplexity(ast),
      componentType: this.inferComponentType(component.name, filePath),
      lastModified: fs.statSync(filePath).mtime.toISOString(),
    };
  }

  inferComponentType(name, filePath) {
    if (filePath.includes("/pages/")) return "page";
    if (filePath.includes("/Apps/")) return "app";
    if (filePath.includes("/apps/")) return "app";
    if (filePath.includes("/hooks/")) return "hook";
    if (filePath.includes("/contexts/")) return "context";
    if (filePath.includes("/common/")) return "common";
    if (name.includes("Page")) return "page";
    if (name.includes("App")) return "app";
    return "component";
  }

  calculateComplexity(node) {
    const nodeStr = JSON.stringify(node);
    let complexity = 1;
    const patterns = [
      "IfStatement",
      "ConditionalExpression",
      "LogicalExpression",
      "ForStatement",
      "WhileStatement",
      "DoWhileStatement",
    ];
    patterns.forEach((pattern) => {
      const matches = nodeStr.match(new RegExp(pattern, "g"));
      if (matches) complexity += matches.length;
    });
    return complexity;
  }

  resolveImportPath(source, fromFile) {
    if (source.startsWith(".")) {
      const dir = path.dirname(fromFile);
      const resolved = path.resolve(dir, source);

      // Try different extensions
      const extensions = [
        ".js",
        ".jsx",
        ".ts",
        ".tsx",
        "/index.js",
        "/index.jsx",
      ];
      for (const ext of extensions) {
        if (fs.existsSync(resolved + ext)) {
          return path.relative(process.cwd(), resolved + ext);
        }
      }
      return path.relative(process.cwd(), resolved);
    }
    return source; // node_module or alias
  }
}

module.exports = EnhancedParser;
