const fs = require("fs");
const path = require("path");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const neo4j = require("neo4j-driver");

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

class Hydra98GraphBuilder {
  constructor() {
    this.session = driver.session();
    this.components = new Map();
    this.functions = new Map();
    this.dependencies = new Set();
    this.componentNameCount = new Map(); // Track name occurrences
  }

  async clearDatabase() {
    await this.session.run("MATCH (n) DETACH DELETE n");
    console.log("Database cleared");
  }

  // Generate unique component name if duplicates exist
  getUniqueComponentName(name, filePath) {
    const key = `${name}:${filePath}`;

    // If this exact name+path combo exists, use it
    if (this.components.has(key)) {
      return name;
    }

    // Check if this name exists in other files
    let nameExists = false;
    for (const [existingKey, component] of this.components) {
      if (component.name === name && component.file !== filePath) {
        nameExists = true;
        break;
      }
    }

    // If name exists elsewhere, make it unique
    if (nameExists) {
      // Extract parent directory name
      const parentDir = path.basename(path.dirname(filePath));
      const uniqueName = `${name}_${parentDir}`;
      console.log(`⚠️ Duplicate component name "${name}" found in ${filePath}`);
      console.log(`  → Renaming to "${uniqueName}" for uniqueness`);
      return uniqueName;
    }

    return name;
  }

  parseFile(filePath) {
    const content = fs.readFileSync(filePath, "utf-8");
    const relativePath = path.relative(process.cwd(), filePath);

    try {
      const ast = parser.parse(content, {
        sourceType: "module",
        plugins: ["jsx", "typescript", "decorators-legacy"],
      });

      const fileNode = {
        type: "File",
        name: path.basename(filePath),
        path: relativePath,
        extension: path.extname(filePath),
      };

      let currentComponent = null;
      const fileFunctions = [];
      const fileImports = [];

      // Store reference to this for use in callbacks
      const self = this;

      traverse(ast, {
        // React Class Components
        ClassDeclaration(astPath) {
          try {
            const name = astPath.node.id ? astPath.node.id.name : "anonymous";
            console.log(`Checking class: ${name} in ${relativePath}`);

            // Check if it extends Component or React.Component
            if (astPath.node.superClass) {
              const isReactClass =
                astPath.node.superClass.name === "Component" ||
                (astPath.node.superClass.type === "MemberExpression" &&
                  astPath.node.superClass.object.name === "React" &&
                  astPath.node.superClass.property.name === "Component");

              if (isReactClass) {
                const uniqueName = self.getUniqueComponentName(
                  name,
                  relativePath
                );
                currentComponent = {
                  name: uniqueName,
                  originalName: name, // Keep track of original name
                  type: "Component",
                  file: relativePath,
                  props: [],
                  hooks: [],
                  componentType: "class",
                };
                const key = `${uniqueName}:${relativePath}`;
                self.components.set(key, currentComponent);
                console.log(
                  `✓ Found React class component: ${uniqueName} (original: ${name})`
                );
              }
            }
          } catch (error) {
            console.log(
              `Error processing class in ${relativePath}:`,
              error.message
            );
          }
        },

        // React Function Components
        FunctionDeclaration(astPath) {
          try {
            const name = astPath.node.id ? astPath.node.id.name : "anonymous";
            console.log(`Checking function: ${name} in ${relativePath}`);

            if (self.isReactComponent(name, astPath.node)) {
              const uniqueName = self.getUniqueComponentName(
                name,
                relativePath
              );
              currentComponent = {
                name: uniqueName,
                originalName: name,
                type: "Component",
                file: relativePath,
                props: self.extractProps(astPath.node),
                hooks: self.extractHooks(astPath.node),
                componentType: "function",
              };
              const key = `${uniqueName}:${relativePath}`;
              self.components.set(key, currentComponent);
              console.log(
                `✓ Found React function component: ${uniqueName} (original: ${name})`
              );
            } else {
              fileFunctions.push({
                name,
                type: "Function",
                file: relativePath,
              });
            }
          } catch (error) {
            console.log(
              `Error processing function in ${relativePath}:`,
              error.message
            );
          }
        },

        // Arrow Function Components
        VariableDeclarator(astPath) {
          try {
            if (
              astPath.node.init &&
              (astPath.node.init.type === "ArrowFunctionExpression" ||
                astPath.node.init.type === "FunctionExpression")
            ) {
              const name = astPath.node.id ? astPath.node.id.name : "anonymous";
              console.log(
                `Checking arrow function: ${name} in ${relativePath}`
              );

              if (self.isReactComponent(name, astPath.node.init)) {
                const uniqueName = self.getUniqueComponentName(
                  name,
                  relativePath
                );
                currentComponent = {
                  name: uniqueName,
                  originalName: name,
                  type: "Component",
                  file: relativePath,
                  props: self.extractProps(astPath.node.init),
                  hooks: self.extractHooks(astPath.node.init),
                  componentType: "arrow",
                };
                const key = `${uniqueName}:${relativePath}`;
                self.components.set(key, currentComponent);
                console.log(
                  `✓ Found React arrow component: ${uniqueName} (original: ${name})`
                );
              }
            }
          } catch (error) {
            console.log(
              `Error processing variable in ${relativePath}:`,
              error.message
            );
          }
        },

        // Import statements
        ImportDeclaration(astPath) {
          try {
            const source = astPath.node.source.value;
            const imports = astPath.node.specifiers.map((spec) => ({
              name: spec.local.name,
              imported: spec.imported ? spec.imported.name : "default",
              source,
            }));
            fileImports.push(...imports);
          } catch (error) {
            console.log(
              `Error processing import in ${relativePath}:`,
              error.message
            );
          }
        },

        // JSX Elements (component usage)
        JSXElement(astPath) {
          try {
            if (astPath.node.openingElement.name.type === "JSXIdentifier") {
              const componentName = astPath.node.openingElement.name.name;
              if (
                currentComponent &&
                componentName !== currentComponent.originalName
              ) {
                self.dependencies.add({
                  from: currentComponent.name,
                  to: componentName,
                  type: "USES",
                  context: "jsx",
                });
              }
            }
          } catch (error) {
            console.log(
              `Error processing JSX in ${relativePath}:`,
              error.message
            );
          }
        },
      });

      return {
        file: fileNode,
        functions: fileFunctions,
        imports: fileImports,
        component: currentComponent,
      };
    } catch (error) {
      console.warn(`Could not parse ${filePath}:`, error.message);
      return null;
    }
  }

  isReactComponent(name, node) {
    // Check if function name starts with capital letter (React convention)
    if (!/^[A-Z]/.test(name)) return false;

    // Check if function returns JSX
    let returnsJSX = false;

    try {
      if (node.body && node.body.type === "BlockStatement") {
        // Look for return statements with JSX
        const hasReturnJSX = node.body.body.some(
          (stmt) =>
            stmt.type === "ReturnStatement" &&
            stmt.argument &&
            (stmt.argument.type === "JSXElement" ||
              stmt.argument.type === "JSXFragment")
        );
        returnsJSX = hasReturnJSX;
      } else if (
        node.body &&
        (node.body.type === "JSXElement" || node.body.type === "JSXFragment")
      ) {
        returnsJSX = true;
      }
    } catch (error) {
      // If we can't analyze the node, assume it's not a React component
      return false;
    }

    return returnsJSX;
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
    try {
      const hooks = [];
      // Convert node to string safely
      let nodeStr = "";
      if (typeof node.toString === "function") {
        nodeStr = node.toString();
      } else if (node.body) {
        // Fallback: just look for common hook patterns in the source
        nodeStr = JSON.stringify(node);
      }

      const hookMatches = nodeStr.match(/use[A-Z]\w*/g) || [];
      return [...new Set(hookMatches)];
    } catch (error) {
      // If hook extraction fails, return empty array
      return [];
    }
  }

  async buildGraph() {
    console.log("Building Hydra98 knowledge graph...");

    await this.clearDatabase();

    // Scan src directory
    const srcDir = path.join(process.cwd(), "src");
    const jsxFiles = this.getJSXFiles(srcDir);

    const parsedFiles = [];
    for (const file of jsxFiles) {
      const parsed = this.parseFile(file);
      if (parsed) parsedFiles.push(parsed);
    }

    // Create nodes
    await this.createNodes(parsedFiles);

    // Create relationships
    await this.createRelationships();

    // Log summary of any renamed components
    console.log("\n📊 Component Renaming Summary:");
    let renamedCount = 0;
    for (const [key, component] of this.components) {
      if (component.name !== component.originalName) {
        console.log(
          `  ${component.originalName} → ${component.name} (in ${component.file})`
        );
        renamedCount++;
      }
    }
    if (renamedCount === 0) {
      console.log("  No components needed renaming!");
    }

    console.log(`\n✅ Knowledge graph created with:`);
    console.log(`- ${this.components.size} React components`);
    console.log(`- ${this.dependencies.size} dependencies`);
    console.log(`- ${parsedFiles.length} files processed`);
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
        item !== "build"
      ) {
        files.push(...this.getJSXFiles(fullPath));
      } else if (stat.isFile() && /\.(jsx?|tsx?)$/.test(item)) {
        // Skip minified files and other problematic files
        if (
          item.includes(".min.") ||
          item.includes("three.") ||
          item.includes("webamp") ||
          fullPath.includes("node_modules") ||
          fullPath.includes("lib\\three") ||
          fullPath.includes("lib/three")
        ) {
          console.log(`Skipping minified/library file: ${fullPath}`);
          continue;
        }
        files.push(fullPath);
      }
    }

    return files;
  }

  async createNodes(parsedFiles) {
    // Create file nodes
    for (const parsed of parsedFiles) {
      await this.session.run(
        `CREATE (f:File {
          name: $name,
          path: $path,
          extension: $extension
        })`,
        parsed.file
      );

      // Create component nodes (skip stories and generic defaults)
      if (
        parsed.component &&
        !parsed.file.path.includes(".stories.") &&
        parsed.component.name !== "Default"
      ) {
        try {
          await this.session.run(
            `CREATE (c:Component {
              name: $name,
              originalName: $originalName,
              file: $file,
              type: $type,
              props: $props,
              hooks: $hooks,
              componentType: $componentType
            })`,
            {
              ...parsed.component,
              originalName:
                parsed.component.originalName || parsed.component.name,
              props: parsed.component.props || [],
              hooks: parsed.component.hooks || [],
              componentType: parsed.component.componentType || "function",
            }
          );
          console.log(
            `✓ Created component: ${parsed.component.name} in ${parsed.component.file}`
          );

          // Link component to file
          await this.session.run(
            `MATCH (f:File {path: $filePath}), (c:Component {name: $componentName, file: $filePath})
             MERGE (f)-[:CONTAINS]->(c)`,
            {
              filePath: parsed.file.path,
              componentName: parsed.component.name,
            }
          );
        } catch (error) {
          console.warn(
            `Could not create component ${parsed.component.name} in ${parsed.component.file}:`,
            error.message
          );
        }
      }

      // Create function nodes
      for (const func of parsed.functions) {
        try {
          await this.session.run(
            `MERGE (fn:Function {
              name: $name,
              file: $file,
              type: $type
            })`,
            func
          );

          await this.session.run(
            `MATCH (f:File {path: $filePath}), (fn:Function {name: $functionName, file: $filePath})
             MERGE (f)-[:CONTAINS]->(fn)`,
            {
              filePath: parsed.file.path,
              functionName: func.name,
            }
          );
        } catch (error) {
          console.warn(
            `Could not create function ${func.name} in ${func.file}:`,
            error.message
          );
        }
      }
    }
  }

  async createRelationships() {
    // Create component dependencies
    for (const dep of this.dependencies) {
      try {
        await this.session.run(
          `MATCH (from:Component {name: $from}), (to:Component {name: $to})
           CREATE (from)-[:${dep.type}]->(to)`,
          { from: dep.from, to: dep.to }
        );
      } catch (error) {
        // Dependencies might reference original names, try with possible renamed versions
        console.warn(
          `Could not create relationship from ${dep.from} to ${dep.to}:`,
          error.message
        );
      }
    }
  }

  async close() {
    await this.session.close();
    await driver.close();
  }
}

// Run the builder
async function main() {
  const builder = new Hydra98GraphBuilder();
  try {
    await builder.buildGraph();
  } catch (error) {
    console.error("Error building graph:", error);
  } finally {
    await builder.close();
  }
}

if (require.main === module) {
  main();
}

module.exports = Hydra98GraphBuilder;
