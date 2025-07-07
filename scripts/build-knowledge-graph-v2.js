const fs = require("fs");
const path = require("path");
const traverse = require("@babel/traverse").default;
const neo4j = require("neo4j-driver");
const EnhancedParser = require("./enhanced-parser");

// Load environment variables
require("dotenv").config();

// Neo4j connection using environment variables
const NEO4J_URI = process.env.REACT_APP_NEO4J_URI || "bolt://localhost:7687";
const NEO4J_USERNAME = process.env.REACT_APP_NEO4J_USERNAME || "neo4j";
const NEO4J_PASSWORD = process.env.REACT_APP_NEO4J_PASSWORD || "neo4j";

const driver = neo4j.driver(
  NEO4J_URI,
  neo4j.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD)
);

class Hydra98GraphBuilderV2 {
  constructor() {
    this.session = driver.session();
    this.parser = new EnhancedParser();
    this.components = new Map();
    this.files = new Map();
    this.relationships = new Set();
    this.processedFiles = 0;
    this.totalFiles = 0;
  }

  async clearDatabase() {
    console.log("🗑️ Clearing existing database...");
    await this.session.run("MATCH (n) DETACH DELETE n");
    console.log("✅ Database cleared");
  }

  async setupConstraintsAndIndexes() {
    console.log("🔧 Setting up database constraints and indexes...");

    const constraints = [
      "CREATE CONSTRAINT component_unique IF NOT EXISTS FOR (c:Component) REQUIRE c.id IS UNIQUE",
      "CREATE CONSTRAINT file_unique IF NOT EXISTS FOR (f:File) REQUIRE f.path IS UNIQUE",
    ];

    const indexes = [
      "CREATE INDEX component_name IF NOT EXISTS FOR (c:Component) ON (c.name)",
      "CREATE INDEX component_type IF NOT EXISTS FOR (c:Component) ON (c.componentType)",
      "CREATE INDEX file_extension IF NOT EXISTS FOR (f:File) ON (f.extension)",
      "CREATE INDEX component_complexity IF NOT EXISTS FOR (c:Component) ON (c.complexity)",
    ];

    for (const constraint of constraints) {
      try {
        await this.session.run(constraint);
        console.log("  ✓ Constraint created/verified");
      } catch (error) {
        if (!error.message.includes("already exists")) {
          console.warn(`  ⚠️ Constraint issue: ${error.message}`);
        }
      }
    }

    for (const index of indexes) {
      try {
        await this.session.run(index);
        console.log("  ✓ Index created/verified");
      } catch (error) {
        if (!error.message.includes("already exists")) {
          console.warn(`  ⚠️ Index issue: ${error.message}`);
        }
      }
    }

    console.log("✅ Database setup complete");
  }

  parseFile(filePath) {
    const relativePath = path.relative(process.cwd(), filePath);

    try {
      console.log(`📄 Parsing: ${relativePath}`);

      const ast = this.parser.parseWithTypeInfo(filePath);
      if (!ast) {
        console.log(`  ⚠️ Skipped: ${relativePath}`);
        return null;
      }

      const fileNode = {
        path: relativePath,
        name: path.basename(filePath),
        extension: path.extname(filePath),
        size: fs.statSync(filePath).size,
        lastModified: fs.statSync(filePath).mtime.toISOString(),
      };

      const components = [];
      const imports = [];
      const componentUsages = [];
      const hookUsages = [];

      // Store reference for use in callbacks
      const self = this;

      traverse(ast, {
        // Import statements
        ImportDeclaration(astPath) {
          try {
            const source = astPath.node.source.value;
            const resolvedPath = self.parser.resolveImportPath(
              source,
              filePath
            );

            astPath.node.specifiers.forEach((spec) => {
              imports.push({
                name: spec.local.name,
                imported: spec.imported ? spec.imported.name : "default",
                source: source,
                resolvedPath: resolvedPath,
              });
            });
          } catch (error) {
            console.warn(`    Import parsing error: ${error.message}`);
          }
        },

        // React Components
        FunctionDeclaration(astPath) {
          self.processComponentNode(
            astPath,
            "function",
            components,
            filePath,
            relativePath
          );
        },

        VariableDeclarator(astPath) {
          if (
            astPath.node.init &&
            (astPath.node.init.type === "ArrowFunctionExpression" ||
              astPath.node.init.type === "FunctionExpression")
          ) {
            self.processComponentNode(
              astPath,
              "arrow",
              components,
              filePath,
              relativePath
            );
          }
        },

        ClassDeclaration(astPath) {
          self.processComponentNode(
            astPath,
            "class",
            components,
            filePath,
            relativePath
          );
        },

        // JSX Elements (component usage)
        JSXElement(astPath) {
          try {
            if (astPath.node.openingElement.name.type === "JSXIdentifier") {
              const componentName = astPath.node.openingElement.name.name;
              if (/^[A-Z]/.test(componentName)) {
                componentUsages.push({
                  component: componentName,
                  file: relativePath,
                });
              }
            }
          } catch (error) {
            // Ignore JSX parsing errors
          }
        },

        // Hook usage
        CallExpression(astPath) {
          try {
            if (
              astPath.node.callee.name &&
              /^use[A-Z]/.test(astPath.node.callee.name)
            ) {
              hookUsages.push({
                hook: astPath.node.callee.name,
                file: relativePath,
              });
            }
          } catch (error) {
            // Ignore hook parsing errors
          }
        },
      });

      this.processedFiles++;
      const progress = Math.round(
        (this.processedFiles / this.totalFiles) * 100
      );
      console.log(
        `  ✓ Parsed (${progress}%): ${components.length} components, ${imports.length} imports`
      );

      return {
        file: fileNode,
        components,
        imports,
        componentUsages,
        hookUsages,
      };
    } catch (error) {
      console.warn(`  ❌ Parse error in ${relativePath}: ${error.message}`);
      return null;
    }
  }

  processComponentNode(
    astPath,
    componentType,
    components,
    filePath,
    relativePath
  ) {
    try {
      let name;
      let node;

      if (componentType === "class") {
        name = astPath.node.id ? astPath.node.id.name : "anonymous";
        node = astPath.node;

        // Check if it extends Component
        if (!astPath.node.superClass) return;
        const isReactClass =
          astPath.node.superClass.name === "Component" ||
          (astPath.node.superClass.type === "MemberExpression" &&
            astPath.node.superClass.object.name === "React" &&
            astPath.node.superClass.property.name === "Component");
        if (!isReactClass) return;
      } else {
        name = astPath.node.id ? astPath.node.id.name : "anonymous";
        node = componentType === "arrow" ? astPath.node.init : astPath.node;
      }

      if (this.parser.isReactComponent(name, node, filePath)) {
        const basicComponent = {
          name,
          type: "Component",
          file: relativePath,
          props: this.extractProps(node),
          hooks: this.extractHooks(node),
          componentType,
        };

        const enrichedComponent = this.parser.enrichComponentMetadata(
          basicComponent,
          astPath.node,
          filePath
        );

        components.push(enrichedComponent);
      }
    } catch (error) {
      console.warn(`    Component processing error: ${error.message}`);
    }
  }

  extractProps(node) {
    try {
      if (
        node.params &&
        node.params[0] &&
        node.params[0].type === "ObjectPattern"
      ) {
        return node.params[0].properties
          .map((prop) => (prop.key ? prop.key.name : "unknown"))
          .filter(Boolean);
      }
    } catch (error) {
      // If prop extraction fails, return empty array
    }
    return [];
  }

  extractHooks(node) {
    const hooks = [];
    try {
      const nodeStr = JSON.stringify(node);
      const hookMatches = nodeStr.match(/"name":"use[A-Z]\w*"/g);
      if (hookMatches) {
        hookMatches.forEach((match) => {
          const hookName = match.match(/"name":"(use[A-Z]\w*)"/)[1];
          hooks.push(hookName);
        });
      }
    } catch (error) {
      // If hook extraction fails, return empty array
    }
    return [...new Set(hooks)];
  }

  async buildGraph() {
    console.log("🚀 Building Happy Tuesdays Knowledge Graph V2...\n");

    await this.clearDatabase();
    await this.setupConstraintsAndIndexes();

    // Scan src directory
    const srcDir = path.join(process.cwd(), "src");
    const jsxFiles = this.getJSXFiles(srcDir);
    this.totalFiles = jsxFiles.length;

    console.log(`\n📊 Found ${this.totalFiles} files to process\n`);

    const parsedFiles = [];
    for (const file of jsxFiles) {
      const parsed = this.parseFile(file);
      if (parsed) parsedFiles.push(parsed);
    }

    console.log("\n🏗️ Creating nodes and relationships...");

    // Create nodes
    await this.createNodes(parsedFiles);

    // Create relationships
    await this.createRelationships(parsedFiles);

    console.log(`\n✅ Knowledge Graph V2 created successfully!`);
    console.log(`📈 Statistics:`);
    console.log(
      `  - Files processed: ${this.processedFiles}/${this.totalFiles}`
    );
    console.log(`  - Components found: ${this.components.size}`);
    console.log(`  - Files stored: ${this.files.size}`);
    console.log(`  - Relationships: ${this.relationships.size}`);
  }

  getJSXFiles(dir) {
    const files = [];
    let items;

    try {
      items = fs.readdirSync(dir);
    } catch (error) {
      console.warn(`Could not read directory ${dir}:`, error.message);
      return files;
    }

    for (const item of items) {
      const fullPath = path.join(dir, item);
      let stat;

      try {
        stat = fs.statSync(fullPath);
      } catch (error) {
        console.warn(`Could not stat ${fullPath}:`, error.message);
        continue;
      }

      if (
        stat.isDirectory() &&
        item !== "node_modules" &&
        item !== ".git" &&
        item !== "build" &&
        item !== "dist"
      ) {
        files.push(...this.getJSXFiles(fullPath));
      } else if (stat.isFile() && /\.(jsx?|tsx?)$/.test(item)) {
        // Skip problematic files
        if (
          item.includes(".min.") ||
          item.includes("three.") ||
          item.includes("webamp") ||
          fullPath.includes("node_modules")
        ) {
          continue;
        }
        files.push(fullPath);
      }
    }

    return files;
  }

  async createNodes(parsedFiles) {
    console.log("  📁 Creating file nodes...");

    for (const parsed of parsedFiles) {
      // Create file node
      await this.session.run(
        `CREATE (f:File {
          path: $path,
          name: $name,
          extension: $extension,
          size: $size,
          lastModified: $lastModified
        })`,
        parsed.file
      );

      this.files.set(parsed.file.path, parsed.file);

      // Create component nodes
      for (const component of parsed.components) {
        try {
          await this.session.run(
            `CREATE (c:Component {
              id: $id,
              name: $name,
              file: $file,
              componentType: $componentType,
              props: $props,
              hooks: $hooks,
              loc: $loc,
              complexity: $complexity,
              lastModified: $lastModified
            })`,
            {
              id: component.id,
              name: component.name,
              file: component.file,
              componentType: component.componentType,
              props: component.props || [],
              hooks: component.hooks || [],
              loc: component.loc || 0,
              complexity: component.complexity || 1,
              lastModified: component.lastModified,
            }
          );

          this.components.set(component.id, component);

          // Link component to file
          await this.session.run(
            `MATCH (f:File {path: $filePath}), (c:Component {id: $componentId})
             MERGE (f)-[:CONTAINS]->(c)`,
            {
              filePath: component.file,
              componentId: component.id,
            }
          );
        } catch (error) {
          console.warn(
            `    Could not create component ${component.name}: ${error.message}`
          );
        }
      }
    }

    console.log(
      `  ✓ Created ${this.files.size} files and ${this.components.size} components`
    );
  }

  async createRelationships(parsedFiles) {
    console.log("  🔗 Creating relationships...");

    let relationshipCount = 0;

    for (const parsed of parsedFiles) {
      // Create import relationships
      for (const imp of parsed.imports) {
        try {
          if (imp.resolvedPath && imp.resolvedPath.startsWith("src/")) {
            await this.session.run(
              `MATCH (from:File {path: $fromFile})
               MATCH (to:File {path: $toFile})
               MERGE (from)-[:IMPORTS {name: $importName, type: $importType}]->(to)`,
              {
                fromFile: parsed.file.path,
                toFile: imp.resolvedPath,
                importName: imp.name,
                importType: imp.imported,
              }
            );
            relationshipCount++;
          }
        } catch (error) {
          // Ignore import relationship errors
        }
      }

      // Create component usage relationships
      for (const usage of parsed.componentUsages) {
        try {
          // Find components that match the usage
          const matchingComponents = Array.from(
            this.components.values()
          ).filter((comp) => comp.name === usage.component);

          for (const targetComponent of matchingComponents) {
            // Find source components in this file
            const sourceComponents = parsed.components;

            for (const sourceComponent of sourceComponents) {
              if (sourceComponent.name !== targetComponent.name) {
                await this.session.run(
                  `MATCH (from:Component {id: $fromId})
                   MATCH (to:Component {id: $toId})
                   MERGE (from)-[:RENDERS]->(to)`,
                  {
                    fromId: sourceComponent.id,
                    toId: targetComponent.id,
                  }
                );
                relationshipCount++;
              }
            }
          }
        } catch (error) {
          // Ignore usage relationship errors
        }
      }

      // Create hook usage relationships
      for (const hookUsage of parsed.hookUsages) {
        try {
          // Create hook node if it doesn't exist
          await this.session.run(`MERGE (h:Hook {name: $hookName})`, {
            hookName: hookUsage.hook,
          });

          // Link components to hooks
          const fileComponents = parsed.components;
          for (const component of fileComponents) {
            if (component.hooks && component.hooks.includes(hookUsage.hook)) {
              await this.session.run(
                `MATCH (c:Component {id: $componentId})
                 MATCH (h:Hook {name: $hookName})
                 MERGE (c)-[:USES_HOOK]->(h)`,
                {
                  componentId: component.id,
                  hookName: hookUsage.hook,
                }
              );
              relationshipCount++;
            }
          }
        } catch (error) {
          // Ignore hook relationship errors
        }
      }
    }

    this.relationships = new Set(Array(relationshipCount).keys());
    console.log(`  ✓ Created ${relationshipCount} relationships`);
  }

  async close() {
    await this.session.close();
    await driver.close();
  }
}

// Run the builder
async function main() {
  const builder = new Hydra98GraphBuilderV2();
  try {
    await builder.buildGraph();
  } catch (error) {
    console.error("❌ Error building graph:", error);
    console.error(error.stack);
  } finally {
    await builder.close();
  }
}

if (require.main === module) {
  main();
}

module.exports = Hydra98GraphBuilderV2;
