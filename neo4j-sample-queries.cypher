// Hydra98 Knowledge Graph - Sample Queries
// Copy these into Neo4j Browser or VS Code Neo4j extension

// 1. Get all React components in Hydra98
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
