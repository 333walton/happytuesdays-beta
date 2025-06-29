const EnhancedParser = require("./enhanced-parser");
const path = require("path");

async function debugEnhancedParser() {
  console.log("🔍 Enhanced Parser Debug Test\n");

  const parser = new EnhancedParser();
  const testFile = path.join(
    process.cwd(),
    "src/components/DesktopView/DesktopView.js"
  );

  try {
    console.log(`📁 Debug testing file: ${testFile}`);
    console.log("=" * 60);

    // Step 1: Parse the file
    console.log("\n🔧 Step 1: Parsing AST...");
    const ast = parser.parseWithTypeInfo(testFile);

    if (!ast) {
      console.log("❌ Failed to parse file - check skip patterns");
      return;
    }

    console.log("✅ AST parsed successfully");
    console.log(`   AST type: ${ast.type}`);
    console.log(`   AST body length: ${ast.body ? ast.body.length : "N/A"}`);

    // Step 2: Test component detection methods
    console.log("\n🔧 Step 2: Testing component detection methods...");

    const componentName = "DesktopView";
    console.log(`\n   Testing component: ${componentName}`);

    // Test each detection method individually
    console.log("\n   🎯 Testing returnsJSX():");
    const hasJSX = parser.returnsJSX(ast);
    console.log(`      Result: ${hasJSX ? "✅ YES" : "❌ NO"}`);
    if (hasJSX) {
      const nodeStr = JSON.stringify(ast);
      console.log(`      JSXElement found: ${nodeStr.includes("JSXElement")}`);
      console.log(
        `      JSXFragment found: ${nodeStr.includes("JSXFragment")}`
      );
      console.log(
        `      createElement found: ${nodeStr.includes("createElement")}`
      );
    }

    console.log("\n   🪝 Testing usesHooks():");
    const usesHooks = parser.usesHooks(ast);
    console.log(`      Result: ${usesHooks ? "✅ YES" : "❌ NO"}`);
    if (usesHooks) {
      const nodeStr = JSON.stringify(ast);
      const hookMatches = nodeStr.match(/"name":"use[A-Z]\w*"/g);
      console.log(
        `      Hook patterns found: ${
          hookMatches ? hookMatches.join(", ") : "None"
        }`
      );
    }

    console.log("\n   📏 Testing hasReactProperties():");
    const hasProps = parser.hasReactProperties(ast);
    console.log(`      Result: ${hasProps ? "✅ YES" : "❌ NO"}`);

    console.log("\n   📂 Testing file path pattern:");
    const filePathMatch = /Component|Screen|Page|View|Modal|Dialog/.test(
      testFile
    );
    console.log(
      `      File path contains component keywords: ${
        filePathMatch ? "✅ YES" : "❌ NO"
      }`
    );

    // Step 3: Test overall component detection
    console.log("\n🔧 Step 3: Overall component detection...");
    const isComponent = parser.isReactComponent(componentName, ast, testFile);
    console.log(
      `\n   Final result: ${
        isComponent ? "✅ DETECTED AS COMPONENT" : "❌ NOT DETECTED"
      }`
    );

    // Step 4: Test metadata enrichment
    if (isComponent) {
      console.log("\n🔧 Step 4: Testing metadata enrichment...");

      const basicComponent = {
        name: componentName,
        type: "Component",
        file: path.relative(process.cwd(), testFile),
        props: [],
        hooks: [],
      };

      console.log("\n   📊 Calculating complexity...");
      const complexity = parser.calculateComplexity(ast);
      console.log(`      Complexity: ${complexity}`);

      console.log("\n   🏷️ Inferring component type...");
      const componentType = parser.inferComponentType(componentName, testFile);
      console.log(`      Component type: ${componentType}`);

      console.log("\n   📈 Enriching metadata...");
      const enrichedComponent = parser.enrichComponentMetadata(
        basicComponent,
        ast,
        testFile
      );

      console.log("   ✅ Enriched component data:");
      console.log(`      ID: ${enrichedComponent.id}`);
      console.log(`      Name: ${enrichedComponent.name}`);
      console.log(`      File: ${enrichedComponent.file}`);
      console.log(`      Component Type: ${enrichedComponent.componentType}`);
      console.log(`      Lines of Code: ${enrichedComponent.loc}`);
      console.log(`      Complexity: ${enrichedComponent.complexity}`);
      console.log(`      Last Modified: ${enrichedComponent.lastModified}`);
    }

    // Step 5: Show AST structure sample
    console.log("\n🔧 Step 5: AST Structure Sample...");
    const astSample = JSON.stringify(ast, null, 2).substring(0, 500);
    console.log("   First 500 characters of AST:");
    console.log("   " + "─".repeat(50));
    console.log(astSample + "...");
    console.log("   " + "─".repeat(50));

    // Step 6: Summary
    console.log("\n🎉 Debug Test Summary:");
    console.log("=" * 60);
    console.log(`✅ File parsing: ${ast ? "Working" : "Failed"}`);
    console.log(`✅ JSX detection: ${hasJSX ? "Working" : "Failed"}`);
    console.log(
      `✅ Hook detection: ${usesHooks ? "Working" : "No hooks detected"}`
    );
    console.log(
      `✅ Component detection: ${isComponent ? "Working" : "Failed"}`
    );
    console.log(
      `✅ Metadata enrichment: ${isComponent ? "Working" : "Skipped"}`
    );

    if (!isComponent) {
      console.log("\n⚠️ Component not detected. Possible reasons:");
      console.log("   - Component name doesn't start with capital letter");
      console.log("   - No JSX elements found");
      console.log("   - No React hooks found");
      console.log("   - File path doesn't match component patterns");
      console.log("   - AST structure is unexpected");
    }
  } catch (error) {
    console.error("❌ Debug test failed:", error.message);
    console.error("Stack trace:", error.stack);
  }
}

// Run the debug test
if (require.main === module) {
  debugEnhancedParser();
}

module.exports = debugEnhancedParser;
