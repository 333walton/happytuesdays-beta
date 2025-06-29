// DEPRECATED - These queries are for the original knowledge graph builder (build-knowledge-graph.js)
// For the enhanced V2 builder, use neo4j-sample-queries-v2.cypher instead
// Hydra98 Knowledge Graph - Updated Queries for V2
// The V2 parser creates: RENDERS (not USES), IMPORTS, USES_HOOK, CONTAINS
// 1. Get all React components and their rendering relationships
MATCH path = (parent:Component)-[:RENDERS*1..2]->(child:Component)
RETURN path
LIMIT 500;

// 2. Find the main Desktop component and its relationships
MATCH (desktop:Component)
WHERE desktop.name CONTAINS 'Desktop' OR desktop.name CONTAINS 'App'
OPTIONAL MATCH (desktop)-[r]-(related)
RETURN desktop, r, related;

// 3. Get file structure overview with visual nodes
MATCH (f:File)-[:CONTAINS]->(c:Component)
RETURN f, c
ORDER BY f.path
LIMIT 300;

// 4. Find components that use hooks - show nodes and relationships
MATCH (c:Component)-[h:USES_HOOK]->(hook)
WITH c, collect(hook) AS hooks
OPTIONAL MATCH (c)-[r]-(related)
RETURN c, r, related, size(hooks) AS hookCount
ORDER BY hookCount DESC
LIMIT 150;

// 5. Get component render tree (instead of dependency tree)
MATCH path = (root:Component)-[:RENDERS*1..3]->(leaf:Component)
WHERE NOT (root)<-[:RENDERS]-()
RETURN path
LIMIT 100;

// 6. Find all Windows 98 "apps" and their relationships
MATCH (app:Component)
WHERE
  app.name IN [
    'Notepad',
    'Paint',
    'Calculator',
    'DOOM',
    'FileExplorer',
    'Taskbar'
  ]
OPTIONAL MATCH (app)-[r]-(related:Component)
RETURN app, r, related;

// 7. Get components with the most render dependencies
MATCH (c:Component)
OPTIONAL MATCH (c)-[r:RENDERS]->(dep:Component)
WITH c, count(dep) AS dependencies, collect(dep) AS deps, collect(r) AS rels
ORDER BY dependencies DESC
LIMIT 50
UNWIND range(0, size(deps) - 1) AS i
RETURN c, rels[i], deps[i];

// 8. Find unused components (this should work as-is)
MATCH (c:Component)
WHERE NOT (c)<-[:RENDERS]-()
RETURN c.name, c.file;

// 9. Get all files and their contained components (this should work)
MATCH (f:File)
OPTIONAL MATCH (f)-[r:CONTAINS]->(c:Component)
RETURN f, r, c
ORDER BY f.name
LIMIT 200;

// 10. Full graph visualization (this should work)
MATCH (n)-[r]-(m)
RETURN n, r, m
LIMIT 1000;

// BONUS: Show component hierarchy with file context
MATCH (f:File)-[:CONTAINS]->(parent:Component)-[:RENDERS]->(child:Component)
RETURN f, parent, child
LIMIT 200;

// BONUS: Find circular render dependencies
MATCH path = (c1:Component)-[:RENDERS*2..4]->(c1)
RETURN path
LIMIT 50;

// NEW: Find import relationships between files
MATCH (f1:File)-[:IMPORTS]->(f2:File)
RETURN f1.path, f2.path
LIMIT 50;

// NEW: Show components by type
MATCH (c:Component)
RETURN c.componentType AS type, count(c) AS count
ORDER BY count DESC;

// NEW: Find most complex components
MATCH (c:Component)
WHERE c.complexity > 10
RETURN c.name, c.complexity, c.componentType, c.file
ORDER BY c.complexity DESC
LIMIT 20;