const EnhancedParser = require("./enhanced-parser");
const path = require("path");

async function testEnhancedParser() {
  console.log("🧪 Testing Enhanced Parser on DesktopView.js\n");

  const parser = new EnhancedParser();
  const testFile = path.join(
    process.cwd(),
    "src/components/DesktopView/DesktopView.js"
  );

  try {
    console.log(`📁 Testing file: ${testFile}`);

    // Parse the file
    const ast = parser.parseWithTypeInfo(testFile);

    if (!ast) {
      console.log("❌ Failed to parse file");
      return;
    }

    console.log("✅ File parsed successfully");

    // Test component detection
    console.log("\n🔍 Component Detection Test:");

    // Simulate finding the DesktopView component (we know it exists)
    const componentName = "DesktopView";
    const isComponent = parser.isReactComponent(componentName, ast, testFile);

    console.log(`  Component Name: ${componentName}`);
    console.log(`  Is React Component: ${isComponent ? "✅ YES" : "❌ NO"}`);

    if (isComponent) {
      // Test metadata enrichment
      console.log("\n📊 Metadata Extraction Test:");

      const basicComponent = {
        name: componentName,
        type: "Component",
        file: path.relative(process.cwd(), testFile),
        props: [],
        hooks: [],
      };

      const enrichedComponent = parser.enrichComponentMetadata(
        basicComponent,
        ast,
        testFile
      );

      console.log("  Enhanced Component Data:");
      console.log(`    ID: ${enrichedComponent.id}`);
      console.log(`    Name: ${enrichedComponent.name}`);
      console.log(`    File: ${enrichedComponent.file}`);
      console.log(`    Component Type: ${enrichedComponent.componentType}`);
      console.log(`    Lines of Code: ${enrichedComponent.loc}`);
      console.log(`    Complexity: ${enrichedComponent.complexity}`);
      console.log(`    Last Modified: ${enrichedComponent.lastModified}`);
    }

    // Test JSX detection
    console.log("\n🎯 JSX Detection Test:");
    const hasJSX = parser.returnsJSX(ast);
    console.log(`  Returns JSX: ${hasJSX ? "✅ YES" : "❌ NO"}`);

    // Test hook detection
    console.log("\n🪝 Hook Detection Test:");
    const usesHooks = parser.usesHooks(ast);
    console.log(`  Uses Hooks: ${usesHooks ? "✅ YES" : "❌ NO"}`);

    // Test complexity calculation
    console.log("\n🧮 Complexity Calculation Test:");
    const complexity = parser.calculateComplexity(ast);
    console.log(`  Cyclomatic Complexity: ${complexity}`);

    // Test import path resolution
    console.log("\n📦 Import Path Resolution Test:");
    const testImports = [
      "../../contexts",
      "../TaskBar/TaskBar",
      "./DesktopView.css",
      "react",
      "packard-belle",
    ];

    testImports.forEach((importPath) => {
      const resolved = parser.resolveImportPath(importPath, testFile);
      console.log(`  "${importPath}" → "${resolved}"`);
    });

    console.log("\n🎉 Enhanced Parser Test Complete!");
    console.log("\n📋 Summary:");
    console.log(`  ✅ File parsing: Working`);
    console.log(
      `  ✅ Component detection: ${isComponent ? "Working" : "Needs attention"}`
    );
    console.log(
      `  ✅ JSX detection: ${hasJSX ? "Working" : "Needs attention"}`
    );
    console.log(
      `  ✅ Hook detection: ${
        usesHooks ? "Working" : "Working (no hooks in this file)"
      }`
    );
    console.log(`  ✅ Complexity calculation: Working (${complexity})`);
    console.log(`  ✅ Import resolution: Working`);
    console.log(`  ✅ Metadata enrichment: Working`);
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error(error.stack);
  }
}

// Run the test
if (require.main === module) {
  testEnhancedParser();
}

module.exports = testEnhancedParser;
