// Neo4j Impact Analysis Queries for Hydra98
// Use these to understand component dependencies and impacts
// 1. Components that would break if DesktopView is removed
MATCH (target:Component {name: 'DesktopView'})
MATCH (dependent:Component)-[:RENDERS]->(target)
RETURN dependent.name AS `Would Break`, dependent.file AS Location;

// Example: What depends on TaskBar?
MATCH (target:Component {name: 'TaskBar'})
MATCH (dependent:Component)-[:RENDERS]->(target)
RETURN dependent.name AS `Would Break`, dependent.file AS Location;

// Example: What depends on App?
MATCH (target:Component {name: 'App'})
MATCH (dependent:Component)-[:RENDERS]->(target)
RETURN dependent.name AS `Would Break`, dependent.file AS Location;

// 2. Circular dependency detection - CRITICAL for refactoring
MATCH path = (c:Component)-[:RENDERS*2..5]->(c)
RETURN path;

// 3. Most "central" components (highest betweenness)
MATCH (c:Component)
WITH c
MATCH path = (c1:Component)-[:RENDERS*1..3]-(c2:Component)
WHERE c IN nodes(path) AND c <> c1 AND c <> c2 AND c1 <> c2
WITH c, count(DISTINCT path) AS betweenness
WHERE betweenness > 0
RETURN c.name, c.componentType, betweenness
ORDER BY betweenness DESC
LIMIT 10;

// 4. Find orphaned components (no relationships)
MATCH (c:Component)
WHERE NOT (c)-[:RENDERS]-() AND NOT (c)-[:USES_HOOK]-()
RETURN c.name AS `Orphaned Component`, c.file AS Location, c.complexity;

// 5. Components with most dependencies (fragile components)
MATCH (c:Component)
OPTIONAL MATCH (c)-[:RENDERS]->(dep:Component)
OPTIONAL MATCH (c)-[:USES_HOOK]->(h)
WITH c, count(DISTINCT dep) AS renderDeps, count(DISTINCT h) AS hookDeps
WHERE renderDeps + hookDeps > 5
RETURN
  c.name,
  c.file,
  renderDeps,
  hookDeps,
  (renderDeps + hookDeps) AS totalDeps
ORDER BY totalDeps DESC;

// 6. Find paths between App and Button components
MATCH
  path =
    (start:Component {name: 'App'})-[:RENDERS*1..5]-
    (end:Component {name: 'Button'})
RETURN path
LIMIT 10;

// 7. Components that render the most other components
MATCH (c:Component)
OPTIONAL MATCH (c)-[:RENDERS]->(rendered:Component)
WITH c, count(rendered) AS rendersCount
WHERE rendersCount > 0
RETURN c.name, c.componentType, rendersCount
ORDER BY rendersCount DESC
LIMIT 20;

// 8. Hooks usage analysis
MATCH (c:Component)-[:USES_HOOK]->(h:Hook)
RETURN h.name AS Hook, count(c) AS UsageCount
ORDER BY UsageCount DESC;

// 9. Find components by type
MATCH (c:Component)
WHERE c.componentType = 'app'
RETURN c.name, c.file, c.complexity
ORDER BY c.complexity DESC;

// 10. Component chains - trace render paths
MATCH path = (start:Component)-[:RENDERS*1..4]->(end:Component)
WHERE NOT (end)-[:RENDERS]->() AND start.name = 'App'
RETURN path;

 (no graph)