const neo4j = require("neo4j-driver");
const fs = require("fs");
const path = require("path");

class Neo4jSetup {
  constructor() {
    this.driver = null;
  }

  async connect() {
    try {
      // Try to read from .env file
      const envPath = path.join(process.cwd(), ".env");
      let config = {
        uri: "bolt://localhost:7687",
        username: "neo4j",
        password: "password",
      };

      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, "utf-8");
        const uriMatch = envContent.match(/REACT_APP_NEO4J_URI=(.+)/);
        const userMatch = envContent.match(/REACT_APP_NEO4J_USERNAME=(.+)/);
        const passMatch = envContent.match(/REACT_APP_NEO4J_PASSWORD=(.+)/);

        if (uriMatch) config.uri = uriMatch[1];
        if (userMatch) config.username = userMatch[1];
        if (passMatch) config.password = passMatch[1];
      }

      console.log(`🔌 Connecting to Neo4j at ${config.uri}...`);

      this.driver = neo4j.driver(
        config.uri,
        neo4j.auth.basic(config.username, config.password)
      );

      // Test connection
      const session = this.driver.session();
      await session.run("RETURN 1");
      await session.close();

      console.log("✅ Successfully connected to Neo4j!");
      return true;
    } catch (error) {
      console.error("❌ Failed to connect to Neo4j:", error.message);
      console.log("\n🔧 Setup Instructions:");
      console.log("1. Download Neo4j Desktop from https://neo4j.com/download/");
      console.log(
        '2. Create a new database called "happy-tuesdays-knowledge-graph"'
      );
      console.log("3. Start the database");
      console.log("4. Update your .env file with the correct credentials");
      return false;
    }
  }

  async setupConstraints() {
    const session = this.driver.session();
    try {
      console.log("🔧 Setting up database constraints...");

      // Create unique constraints for better performance
      const constraints = [
        "CREATE CONSTRAINT component_name_file IF NOT EXISTS FOR (c:Component) REQUIRE (c.name, c.file) IS UNIQUE",
        "CREATE CONSTRAINT file_path IF NOT EXISTS FOR (f:File) REQUIRE f.path IS UNIQUE",
        "CREATE CONSTRAINT function_name_file IF NOT EXISTS FOR (fn:Function) REQUIRE (fn.name, fn.file) IS UNIQUE",
      ];

      for (const constraint of constraints) {
        try {
          await session.run(constraint);
          console.log("  ✓ Constraint created");
        } catch (error) {
          if (error.message.includes("already exists")) {
            console.log("  ✓ Constraint already exists");
          } else {
            console.log("  ⚠️ Constraint creation failed:", error.message);
          }
        }
      }

      console.log("✅ Database constraints setup complete!");
    } finally {
      await session.close();
    }
  }

  async createIndexes() {
    const session = this.driver.session();
    try {
      console.log("📊 Creating performance indexes...");

      const indexes = [
        "CREATE INDEX component_file IF NOT EXISTS FOR (c:Component) ON (c.file)",
        "CREATE INDEX file_extension IF NOT EXISTS FOR (f:File) ON (f.extension)",
        "CREATE INDEX component_type IF NOT EXISTS FOR (c:Component) ON (c.type)",
      ];

      for (const index of indexes) {
        try {
          await session.run(index);
          console.log("  ✓ Index created");
        } catch (error) {
          if (error.message.includes("already exists")) {
            console.log("  ✓ Index already exists");
          } else {
            console.log("  ⚠️ Index creation failed:", error.message);
          }
        }
      }

      console.log("✅ Performance indexes setup complete!");
    } finally {
      await session.close();
    }
  }

  async validateSetup() {
    const session = this.driver.session();
    try {
      console.log("🔍 Validating database setup...");

      // Check if we have any data
      const nodeCount = await session.run("MATCH (n) RETURN count(n) as count");
      const componentCount = await session.run(
        "MATCH (c:Component) RETURN count(c) as count"
      );
      const fileCount = await session.run(
        "MATCH (f:File) RETURN count(f) as count"
      );

      const totalNodes = nodeCount.records[0].get("count").toNumber();
      const totalComponents = componentCount.records[0].get("count").toNumber();
      const totalFiles = fileCount.records[0].get("count").toNumber();

      console.log(`📈 Database Statistics:`);
      console.log(`  Total Nodes: ${totalNodes}`);
      console.log(`  Components: ${totalComponents}`);
      console.log(`  Files: ${totalFiles}`);

      if (totalNodes === 0) {
        console.log(
          '\n⚠️  Database is empty. Run "npm run build-graph" to populate it.'
        );
      } else {
        console.log("\n✅ Database validation complete!");
      }

      return true;
    } finally {
      await session.close();
    }
  }

  async createSampleQueries() {
    console.log("📝 Creating sample queries file...");

    const sampleQueries = `// Happy Tuesdays Knowledge Graph - Sample Queries
// Copy these into Neo4j Browser or VS Code Neo4j extension

// 1. Get all React components in Happy Tuesdays
MATCH (c:Component)
RETURN c.name, c.file, c.props, c.hooks
ORDER BY c.name;

// 2. Find the main Desktop component and its relationships
MATCH (desktop:Component)
WHERE desktop.name CONTAINS 'Desktop' OR desktop.name CONTAINS 'App'
OPTIONAL MATCH (desktop)-[r]-(related)
RETURN desktop, r, related;

// 3. Get file structure overview
MATCH (f:File)-[:CONTAINS]->(c:Component)
RETURN f.path, f.name, collect(c.name) as components
ORDER BY f.path;

// 4. Find components that use state (hooks)
MATCH (c:Component)
WHERE size(c.hooks) > 0
RETURN c.name, c.hooks, c.file
ORDER BY size(c.hooks) DESC;

// 5. Get component dependency tree
MATCH path = (root:Component)-[:USES*1..3]->(leaf:Component)
WHERE NOT (root)<-[:USES]-()
RETURN path
LIMIT 10;

// 6. Find all Windows 98 "apps" (Notepad, Paint, etc.)
MATCH (app:Component)
WHERE app.name IN ['Notepad', 'Paint', 'Calculator', 'DOOM', 'FileExplorer', 'Taskbar']
OPTIONAL MATCH (app)-[r]-(related:Component)
RETURN app.name, type(r), related.name;

// 7. Get components with the most dependencies
MATCH (c:Component)
OPTIONAL MATCH (c)-[:USES]->(dep:Component)
RETURN c.name, c.file, count(dep) as dependencies
ORDER BY dependencies DESC
LIMIT 10;

// 8. Find unused components (potential cleanup candidates)
MATCH (c:Component)
WHERE NOT (c)<-[:USES]-()
RETURN c.name, c.file;

// 9. Get all files and their component counts
MATCH (f:File)
OPTIONAL MATCH (f)-[:CONTAINS]->(c:Component)
RETURN f.name, f.extension, count(c) as component_count
ORDER BY component_count DESC;

// 10. Full graph visualization (use with caution on large datasets)
MATCH (n)-[r]-(m)
RETURN n, r, m
LIMIT 100;
`;

    const queriesPath = path.join(process.cwd(), "neo4j-sample-queries.cypher");
    try {
      fs.writeFileSync(queriesPath, sampleQueries);
      console.log(`✅ Sample queries saved to: ${queriesPath}`);
    } catch (error) {
      console.warn(`⚠️ Could not write sample queries file: ${error.message}`);
    }
  }

  async close() {
    if (this.driver) {
      await this.driver.close();
    }
  }
}

async function main() {
  console.log("🚀 Setting up Neo4j for Happy Tuesdays...\n");

  const setup = new Neo4jSetup();

  try {
    const connected = await setup.connect();
    if (!connected) {
      process.exit(1);
    }

    await setup.setupConstraints();
    await setup.createIndexes();
    await setup.validateSetup();
    await setup.createSampleQueries();

    console.log("\n🎉 Neo4j setup complete!");
    console.log("\nNext steps:");
    console.log('1. Run "npm run build-graph" to analyze your codebase');
    console.log("2. Open Neo4j Browser or VS Code Neo4j extension");
    console.log("3. Use the sample queries in neo4j-sample-queries.cypher");
    console.log(
      "4. Add the GraphVisualizer component to your Happy Tuesdays desktop"
    );
  } catch (error) {
    console.error("❌ Setup failed:", error);
    process.exit(1);
  } finally {
    await setup.close();
  }
}

if (require.main === module) {
  main();
}

module.exports = Neo4jSetup;
