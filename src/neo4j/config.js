import neo4j from "neo4j-driver";

// Neo4j connection configuration for Happy Tuesdays
const NEO4J_CONFIG = {
  uri: process.env.REACT_APP_NEO4J_URI || "bolt://localhost:7687",
  username: process.env.REACT_APP_NEO4J_USERNAME || "neo4j",
  password: process.env.REACT_APP_NEO4J_PASSWORD || "your-password",
};

// Create Neo4j driver instance
const driver = neo4j.driver(
  NEO4J_CONFIG.uri,
  neo4j.auth.basic(NEO4J_CONFIG.username, NEO4J_CONFIG.password),
  {
    // Additional configuration for Happy Tuesdays
    maxConnectionLifetime: 3 * 60 * 60 * 1000, // 3 hours
    maxConnectionPoolSize: 50,
    connectionTimeout: 20 * 1000, // 20 seconds
    disableLosslessIntegers: true,
  }
);

// Happy Tuesdays-specific queries
export const HYDRA98_QUERIES = {
  // Get all Windows/Components in the desktop
  getAllWindows: `
    MATCH (c:Component)
    WHERE c.name CONTAINS 'Window' OR c.name CONTAINS 'App'
    RETURN c.name, c.file, c.props, c.hooks
    ORDER BY c.name
  `,

  // Get component dependencies (for understanding app structure)
  getComponentDependencies: `
    MATCH (c1:Component)-[r:USES]->(c2:Component)
    RETURN c1.name as from, c2.name as to, type(r) as relationship
  `,

  // Get all desktop apps and their relationships
  getDesktopApps: `
    MATCH (c:Component)
    WHERE c.name IN ['Notepad', 'Paint', 'DOOM', 'Calculator', 'FileExplorer']
    OPTIONAL MATCH (c)-[r]-(related)
    RETURN c, r, related
  `,

  // Get files and their components (for understanding file structure)
  getFileStructure: `
    MATCH (f:File)-[:CONTAINS]->(c:Component)
    RETURN f.path, f.name, collect(c.name) as components
    ORDER BY f.path
  `,

  // Get components that use hooks (for state management understanding)
  getHookUsage: `
    MATCH (c:Component)
    WHERE size(c.hooks) > 0
    RETURN c.name, c.hooks, c.file
    ORDER BY size(c.hooks) DESC
  `,

  // Get components with props (for understanding data flow)
  getPropsFlow: `
    MATCH (c:Component)
    WHERE size(c.props) > 0
    RETURN c.name, c.props, c.file
  `,
};

// Helper class for Happy Tuesdays-specific database operations
export class Hydra98Database {
  constructor() {
    this.driver = driver;
  }

  async getSession() {
    return this.driver.session();
  }

  async runQuery(query, parameters = {}) {
    const session = await this.getSession();
    try {
      const result = await session.run(query, parameters);
      return result.records.map((record) => record.toObject());
    } finally {
      await session.close();
    }
  }

  // Get all Happy Tuesdays desktop components
  async getDesktopComponents() {
    return await this.runQuery(HYDRA98_QUERIES.getAllWindows);
  }

  // Get component relationships for dependency visualization
  async getComponentGraph() {
    return await this.runQuery(HYDRA98_QUERIES.getComponentDependencies);
  }

  // Get specific app information
  async getAppInfo(appName) {
    const query = `
      MATCH (c:Component {name: $appName})
      OPTIONAL MATCH (c)-[r]-(related)
      RETURN c, collect({rel: type(r), node: related}) as relationships
    `;
    return await this.runQuery(query, { appName });
  }

  // Get file structure for understanding codebase organization
  async getCodebaseStructure() {
    return await this.runQuery(HYDRA98_QUERIES.getFileStructure);
  }

  async close() {
    await this.driver.close();
  }
}

export default driver;
