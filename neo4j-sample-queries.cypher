// Hydra98 Knowledge Graph - Sample Queries (Fixed for Visual Display)
// Copy these into Neo4j Browser or VS Code Neo4j extension
// 1. Get all React components in Hydra98
MATCH path = (parent:Component)-[:USES*1..2]->(child:Component)
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

// 4. Find components that use state (hooks) - show nodes and relationships
MATCH (c:Component)
WHERE size(c.hooks) > 0
OPTIONAL MATCH (c)-[r]-(related)
RETURN c, r, related
ORDER BY size(c.hooks) DESC
LIMIT 150;

// 5. Get component dependency tree
MATCH path = (root:Component)-[:USES*1..3]->(leaf:Component)
WHERE NOT (root)<-[:USES]-()
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

// 7. Get components with the most dependencies - show full graph
MATCH (c:Component)
OPTIONAL MATCH (c)-[r:USES]->(dep:Component)
WITH c, count(dep) AS dependencies, collect(dep) AS deps, collect(r) AS rels
ORDER BY dependencies DESC
LIMIT 50
UNWIND range(0, size(deps) - 1) AS i
RETURN c, rels[i], deps[i];

// 8. Find unused components and their file relationships
MATCH (c:Component)
WHERE NOT (c)<-[:USES]-()
OPTIONAL MATCH (f:File)-[:CONTAINS]->(c)
RETURN c, f
LIMIT 100;

// 9. Get all files and their contained components
MATCH (f:File)
OPTIONAL MATCH (f)-[r:CONTAINS]->(c:Component)
RETURN f, r, c
ORDER BY f.name
LIMIT 200;

// 10. Full graph visualization (use with caution on large datasets)
MATCH (n)-[r]-(m)
RETURN n, r, m
LIMIT 1000;

// BONUS: Show component hierarchy with file context
MATCH (f:File)-[:CONTAINS]->(parent:Component)-[:USES]->(child:Component)
RETURN f, parent, child
LIMIT 200;

// BONUS: Find circular dependencies
MATCH path = (c1:Component)-[:USES*2..4]->(c1)
RETURN path
LIMIT 50;