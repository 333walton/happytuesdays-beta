// Queries for Enhanced Knowledge Graph V2 (build-knowledge-graph-v2.js)
// Relationships: CONTAINS, RENDERS, USES_HOOK
// Last updated: [today's date]
// Hydra98 Knowledge Graph - Updated Queries for V2
// The V2 parser creates: RENDERS (not USES), IMPORTS, USES_HOOK, CONTAINS
// Hydra98 Knowledge Graph V2 - Working Queries
// Based on actual relationships: CONTAINS, RENDERS, USES_HOOK
// 1. Get all React components and their render relationships
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
MATCH (c:Component)-[:USES_HOOK]->(h)
WITH c, count(h) AS hookCount
OPTIONAL MATCH (c)-[r]-(related)
RETURN c, r, related, hookCount
ORDER BY hookCount DESC
LIMIT 150;

// 5. Get component render tree
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
RETURN c, dependencies, deps;

// 8. Find unused components (not rendered by others)
MATCH (c:Component)
WHERE NOT (c)<-[:RENDERS]-() AND NOT (c)<-[:CONTAINS]-(:File)
RETURN c.name, c.file;

// 9. Get all files and their contained components
MATCH (f:File)
OPTIONAL MATCH (f)-[r:CONTAINS]->(c:Component)
RETURN f, r, c
ORDER BY f.name
LIMIT 200;

// 10. Full graph visualization
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

// Components by type distribution - AS GRAPH
MATCH (c:Component)
WHERE c.componentType IS NOT NULL
WITH c.componentType AS type, collect(c) AS components
UNWIND components AS comp
RETURN comp;

// Most complex components - WITH RELATIONSHIPS
MATCH (c:Component)
WHERE c.complexity > 10
OPTIONAL MATCH (c)-[r]-(related)
RETURN c, r, related;

// Hook usage patterns - AS GRAPH
MATCH (c:Component)-[r:USES_HOOK]->(h)
RETURN c, r, h;

// Component render chains - AS GRAPH
MATCH path = (c:Component)-[:RENDERS*]->(end:Component)
WHERE NOT (end)-[:RENDERS]->()
RETURN path
LIMIT 20;

// Show the most connected component and its network
MATCH (c:Component)
WITH c
ORDER BY c.pagerank DESC
LIMIT 1
MATCH path = (c)-[r*0..2]-(connected)
RETURN path;

// Show all components and relationships (visual)
MATCH (c:Component)-[r:RENDERS]-(other:Component)
RETURN c, r, other
LIMIT 100;

// Show top connected components WITH their relationships (visual)
MATCH (c:Component)
WHERE c.pagerank > 3
MATCH (c)-[r]-(connected)
RETURN c, r, connected;

// Component complexity analysis with context
MATCH (c:Component)
WHERE c.complexity > 5
OPTIONAL MATCH (c)-[:USES_HOOK]->(h)
OPTIONAL MATCH (c)-[r:RENDERS]-(related)
WITH
  c,
  count(DISTINCT h) AS hookCount,
  count(DISTINCT related) AS connectionCount
RETURN
  c,
  c.complexity AS complexity,
  hookCount,
  connectionCount,
  (c.complexity + hookCount * 2 + connectionCount) AS totalComplexity
ORDER BY totalComplexity DESC
LIMIT 20;

// Find component clusters (highly interconnected components)
MATCH (c1:Component)-[:RENDERS]-(c2:Component)
WITH c1, count(DISTINCT c2) AS connections
WHERE connections > 3
MATCH (c1)-[r:RENDERS]-(connected)
RETURN c1, r, connected;

// Impact Analysis - What breaks if I change a component?
MATCH (source:Component {name: 'DesktopView'})
MATCH path = (source)<-[:RENDERS*]-(dependent:Component)
RETURN path;

// Impact Analysis - What breaks if I change a component?
MATCH (source:Component {name: 'TaskBar'})
MATCH path = (source)<-[:RENDERS*]-(dependent:Component)
RETURN path;