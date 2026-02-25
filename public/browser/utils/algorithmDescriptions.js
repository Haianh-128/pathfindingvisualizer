var descriptions = {
  dijkstra: {
    name: "Dijkstra's Algorithm",
    shortDescription: "Expands the cheapest known node first to guarantee the lowest-cost path.",
    category: "weighted",
    guaranteesOptimal: true,
    complete: true,
    badges: ["weighted", "optimal", "complete", "no-heuristic"],
    howItWorks: [
      "1. Initialize start cost to 0 and every other node to Infinity.",
      "2. Repeatedly pick the unvisited node with the smallest current cost g(n).",
      "3. Relax each neighbor: if going through the current node is cheaper, update the neighbor cost and predecessor.",
      "4. Mark the current node as visited so it will not be processed again.",
      "5. Stop when the target is finalized or no reachable node remains."
    ],
    pseudocode: [
      "for each node v:",
      "  dist[v] = Infinity",
      "  prev[v] = null",
      "dist[start] = 0",
      "while unvisited not empty:",
      "  current = argmin(dist[v]) over unvisited v",
      "  if current == target: break",
      "  for each neighbor in neighbors(current):",
      "    candidate = dist[current] + edgeCost(current, neighbor)",
      "    if candidate < dist[neighbor]:",
      "      dist[neighbor] = candidate",
      "      prev[neighbor] = current",
      "return reconstructPath(prev, target)"
    ],
    keyInsight: "When all edge costs are non-negative, finalizing the lowest g(n) node first locks in its optimal cost.",
    characteristics: {
      dataStructure: "Priority queue (current implementation uses linear selection)",
      timeComplexity: "Array: O(V^2); Binary heap: O((V + E) log V)",
      spaceComplexity: "O(V)",
      usesHeuristic: false,
      selectionRule: "Select the unvisited node with minimum g(n)",
      bestFor: "Weighted grids when guaranteed optimality matters more than speed.",
      weakness: "Can explore many extra nodes when the target is far and the map is open.",
      notesOnGridWeights: "Fully weight-aware and optimal for non-negative costs."
    },
    pitfalls: [
      "Using negative edge costs breaks optimality guarantees.",
      "Assuming linear-scan behavior represents best possible performance.",
      "Forgetting to reset node state between runs can produce stale paths."
    ],
    visualBehavior: [
      "Expands outward in a broad wave from the start.",
      "Search frontier grows evenly in open space.",
      "Usually visits more nodes than A* before reaching the target."
    ]
  },
  astar: {
    name: "A* Search",
    shortDescription: "Combines exact cost-so-far and estimated remaining cost to focus search efficiently.",
    category: "weighted",
    guaranteesOptimal: true,
    complete: true,
    badges: ["weighted", "optimal", "complete", "heuristic"],
    howItWorks: [
      "1. Track g(n) as true cost from start and h(n) as estimated cost to target.",
      "2. Rank nodes by f(n) = g(n) + h(n) and expand the smallest f(n).",
      "3. Relax neighbors with better g(n), then recompute their f(n).",
      "4. Continue until target is selected or open set becomes empty.",
      "5. Reconstruct the path from predecessor pointers."
    ],
    pseudocode: [
      "open = {start}",
      "g[start] = 0",
      "f[start] = h(start)",
      "while open not empty:",
      "  current = argmin(f[v]) over v in open",
      "  if current == target: break",
      "  remove current from open",
      "  for each neighbor in neighbors(current):",
      "    tentativeG = g[current] + edgeCost(current, neighbor)",
      "    if tentativeG < g[neighbor]:",
      "      prev[neighbor] = current",
      "      g[neighbor] = tentativeG",
      "      f[neighbor] = tentativeG + h(neighbor)",
      "      add neighbor to open",
      "return reconstructPath(prev, target)"
    ],
    keyInsight: "A good admissible heuristic sharply reduces search while preserving optimality.",
    characteristics: {
      dataStructure: "Priority queue (open set)",
      timeComplexity: "Typical heap form: O((V + E) log V)",
      spaceComplexity: "O(V)",
      usesHeuristic: true,
      selectionRule: "Select node with minimum f(n) = g(n) + h(n)",
      bestFor: "Fast optimal routing when a trustworthy heuristic is available.",
      weakness: "Bad heuristics can make A* approach Dijkstra-level exploration.",
      notesOnGridWeights: "Weight-aware through g(n); heuristic must stay admissible for guaranteed optimality."
    },
    pitfalls: [
      "Using an overestimating heuristic can lose optimality.",
      "Confusing greedy best-first behavior with A* by ignoring g(n).",
      "Inconsistent heuristic design can increase node reprocessing."
    ],
    visualBehavior: [
      "Frontier tends to bend toward the target instead of expanding uniformly.",
      "Often forms a focused corridor compared to Dijkstra.",
      "On hard obstacle layouts, expansion broadens when heuristic guidance weakens."
    ]
  },
  greedy: {
    name: "Greedy Best-first Search",
    shortDescription: "Chases the target aggressively using only heuristic distance.",
    category: "weighted",
    guaranteesOptimal: false,
    complete: true,
    badges: ["weighted", "not-optimal", "complete", "heuristic"],
    howItWorks: [
      "1. Evaluate each frontier node only by h(n), estimated distance to target.",
      "2. Expand the node with the smallest h(n).",
      "3. Add reachable neighbors and continue choosing best-looking node.",
      "4. Stop when target is found or frontier is exhausted."
    ],
    pseudocode: [
      "open = {start}",
      "while open not empty:",
      "  current = argmin(h(v)) over v in open",
      "  if current == target: break",
      "  remove current from open",
      "  mark current visited",
      "  for each neighbor in neighbors(current):",
      "    if neighbor not visited: add neighbor to open",
      "return reconstructPath(prev, target)"
    ],
    keyInsight: "Greedy is often fast to find a path, but it can ignore cheaper alternatives because it does not optimize g(n).",
    characteristics: {
      dataStructure: "Priority queue ordered by h(n)",
      timeComplexity: "Typical heap form: O((V + E) log V)",
      spaceComplexity: "O(V)",
      usesHeuristic: true,
      selectionRule: "Select node with minimum h(n)",
      bestFor: "Quick approximate routing when speed matters more than path quality.",
      weakness: "Path quality can be poor on weighted or trap-like maps.",
      notesOnGridWeights: "Can cross expensive weighted nodes if they look closer to target."
    },
    pitfalls: [
      "Assuming it returns shortest path because it reaches target quickly.",
      "Using it on heavily weighted maps where g(n) matters.",
      "Ignoring tie-break behavior that changes path shape significantly."
    ],
    visualBehavior: [
      "Appears as a narrow beam aimed at the target.",
      "Can commit to dead-end corridors and backtrack late.",
      "Usually explores fewer nodes than optimal algorithms, but with higher path cost."
    ]
  },
  swarm: {
    name: "Swarm Algorithm",
    shortDescription: "Uses a blended score of traveled cost and target direction for faster practical routing.",
    category: "weighted",
    guaranteesOptimal: false,
    complete: true,
    badges: ["weighted", "not-optimal", "complete", "heuristic"],
    howItWorks: [
      "1. Build a composite score from movement cost and heuristic guidance.",
      "2. Expand the frontier node with best composite score.",
      "3. Relax neighbors and update predecessor information when a better score appears.",
      "4. Continue until target is reached or no candidates remain."
    ],
    pseudocode: [
      "open = {start}",
      "while open not empty:",
      "  current = argmin(score(v)) over v in open",
      "  if current == target: break",
      "  remove current from open",
      "  for each neighbor in neighbors(current):",
      "    candidate = blendedCost(current, neighbor, target)",
      "    if candidate < best[neighbor]:",
      "      best[neighbor] = candidate",
      "      prev[neighbor] = current",
      "      add neighbor to open",
      "return reconstructPath(prev, target)"
    ],
    keyInsight: "Swarm trades guaranteed optimality for a practical speed-path-quality balance.",
    characteristics: {
      dataStructure: "Priority queue with blended score",
      timeComplexity: "Typical heap form: O((V + E) log V)",
      spaceComplexity: "O(V)",
      usesHeuristic: true,
      selectionRule: "Select node with minimum blended score",
      bestFor: "Interactive visualizations where fast feedback is preferred over strict optimality.",
      weakness: "Score design is variant-dependent and can produce unstable path quality.",
      notesOnGridWeights: "Weight handling exists but can be dominated by heuristic pull."
    },
    pitfalls: [
      "Treating Swarm as equivalent to A* or Dijkstra.",
      "Over-interpreting path quality from a single run.",
      "Ignoring that score tuning heavily changes behavior."
    ],
    visualBehavior: [
      "Frontier is directional, but broader than Greedy.",
      "Exploration tends to arc around major obstacles.",
      "Path quality varies more than A* across different maps."
    ]
  },
  convergentSwarm: {
    name: "Convergent Swarm Algorithm",
    shortDescription: "Applies strong heuristic bias (for example h^7) to converge on the target very quickly.",
    category: "weighted",
    guaranteesOptimal: false,
    complete: true,
    badges: ["weighted", "not-optimal", "complete", "heuristic"],
    howItWorks: [
      "1. Amplify heuristic influence to strongly prioritize target-facing nodes.",
      "2. Expand nodes using this aggressive composite score.",
      "3. Relax neighbors and keep chasing the most target-aligned frontier.",
      "4. Stop at target or exhaustion of reachable nodes."
    ],
    pseudocode: [
      "open = {start}",
      "while open not empty:",
      "  current = argmin(g(v) + h(v)^k) over v in open",
      "  if current == target: break",
      "  remove current from open",
      "  for each neighbor in neighbors(current):",
      "    candidate = g(current) + edgeCost + h(neighbor)^k",
      "    if candidate < best[neighbor]:",
      "      best[neighbor] = candidate",
      "      prev[neighbor] = current",
      "      add neighbor to open",
      "return reconstructPath(prev, target)"
    ],
    keyInsight: "Strong heuristic amplification makes it very fast but more likely to miss lower-cost routes.",
    characteristics: {
      dataStructure: "Priority queue with heavily weighted heuristic score",
      timeComplexity: "Typical heap form: O((V + E) log V)",
      spaceComplexity: "O(V)",
      usesHeuristic: true,
      selectionRule: "Select node with minimum g(n) + h(n)^k",
      bestFor: "Rapid visual convergence demos where near-target behavior is preferred.",
      weakness: "High risk of expensive detours on weighted or maze-like maps.",
      notesOnGridWeights: "Can under-value weight penalties when heuristic exponent dominates."
    },
    pitfalls: [
      "Assuming faster convergence implies lower path cost.",
      "Using very high heuristic powers without validating path quality.",
      "Comparing against optimal algorithms without cost normalization."
    ],
    visualBehavior: [
      "Forms a sharp beam toward target almost immediately.",
      "Explores very little of the map before committing.",
      "Can visibly snap through expensive regions if they are directionally attractive."
    ]
  },
  bidirectional: {
    name: "Bidirectional Swarm Algorithm",
    shortDescription: "Runs forward and backward heuristic searches that meet in the middle.",
    category: "weighted",
    guaranteesOptimal: false,
    complete: "variant-dependent",
    badges: ["weighted", "not-optimal", "variant-dependent", "heuristic"],
    howItWorks: [
      "1. Start one frontier at the source and another at the target.",
      "2. Alternate expansions from both sides using their scoring rule.",
      "3. Detect intersection between frontiers.",
      "4. Stitch partial paths through the meeting point."
    ],
    pseudocode: [
      "frontA = {start}",
      "frontB = {target}",
      "while frontA not empty and frontB not empty:",
      "  expandBest(frontA)",
      "  expandBest(frontB)",
      "  if intersection(frontA, frontB) found:",
      "    midpoint = intersection node",
      "    break",
      "return combinePath(start -> midpoint, midpoint -> target)"
    ],
    keyInsight: "Meeting in the middle can cut search depth, but path optimality depends on scoring and merge logic.",
    characteristics: {
      dataStructure: "Two coordinated priority frontiers",
      timeComplexity: "Practical speed often better than single-source variants",
      spaceComplexity: "O(V)",
      usesHeuristic: true,
      selectionRule: "Expand best-scored node from both sides and merge at meeting node",
      bestFor: "Large open maps where reducing search depth yields visible speedups.",
      weakness: "Path merge and score asymmetry can hurt quality or consistency.",
      notesOnGridWeights: "Weight influence can differ per frontier and affect merge quality."
    },
    pitfalls: [
      "Assuming all bidirectional variants are automatically optimal.",
      "Ignoring asymmetry between forward and backward score updates.",
      "Misreading meeting-point quality as final path quality."
    ],
    visualBehavior: [
      "Two colored expansions grow toward each other.",
      "Search often looks faster because depth per side is reduced.",
      "Final path depends strongly on where frontiers intersect."
    ]
  },
  bfs: {
    name: "Breadth-first Search",
    shortDescription: "Expands level-by-level with a queue and guarantees shortest paths in unweighted grids.",
    category: "unweighted",
    guaranteesOptimal: true,
    complete: true,
    badges: ["unweighted", "optimal", "complete", "no-heuristic"],
    howItWorks: [
      "1. Enqueue the start node and mark it discovered.",
      "2. Dequeue in FIFO order and explore all valid neighbors.",
      "3. Enqueue undiscovered neighbors with current as predecessor.",
      "4. Stop when target is discovered or queue is empty."
    ],
    pseudocode: [
      "queue = [start]",
      "visited[start] = true",
      "while queue not empty:",
      "  current = queue.shift()",
      "  if current == target: break",
      "  for each neighbor in neighbors(current):",
      "    if not visited[neighbor]:",
      "      visited[neighbor] = true",
      "      prev[neighbor] = current",
      "      queue.push(neighbor)",
      "return reconstructPath(prev, target)"
    ],
    keyInsight: "FIFO expansion guarantees the first time a node is reached is through the fewest-edge route.",
    characteristics: {
      dataStructure: "Queue (FIFO)",
      timeComplexity: "O(V + E)",
      spaceComplexity: "O(V)",
      usesHeuristic: false,
      selectionRule: "Expand oldest discovered node first",
      bestFor: "Unweighted shortest path and clear educational traversal behavior.",
      weakness: "Inefficient on weighted maps because edge costs are ignored.",
      notesOnGridWeights: "Weights are not supported semantically; weighted nodes act like normal traversable cells."
    },
    pitfalls: [
      "Applying BFS to weighted routing and expecting cheapest path cost.",
      "Forgetting that queue order depends on neighbor ordering.",
      "Confusing shortest number of steps with lowest weighted cost."
    ],
    visualBehavior: [
      "Expands in concentric layers from the start.",
      "Produces a broad wavefront around obstacles.",
      "Usually visits many nodes before reaching distant targets."
    ]
  },
  dfs: {
    name: "Depth-first Search",
    shortDescription: "Follows one branch as deep as possible before backtracking.",
    category: "unweighted",
    guaranteesOptimal: false,
    complete: true,
    badges: ["unweighted", "not-optimal", "complete", "no-heuristic"],
    howItWorks: [
      "1. Push start onto a stack.",
      "2. Pop the most recent node and visit it.",
      "3. Push its unvisited neighbors and continue diving.",
      "4. Backtrack automatically when dead ends are reached.",
      "5. Stop at target or when stack is empty."
    ],
    pseudocode: [
      "stack = [start]",
      "visited[start] = true",
      "while stack not empty:",
      "  current = stack.pop()",
      "  if current == target: break",
      "  for each neighbor in neighbors(current):",
      "    if not visited[neighbor]:",
      "      visited[neighbor] = true",
      "      prev[neighbor] = current",
      "      stack.push(neighbor)",
      "return reconstructPath(prev, target)"
    ],
    keyInsight: "DFS is memory-light and simple, but branch-first behavior can produce long non-optimal detours.",
    characteristics: {
      dataStructure: "Stack (LIFO)",
      timeComplexity: "O(V + E)",
      spaceComplexity: "O(V)",
      usesHeuristic: false,
      selectionRule: "Expand most recently discovered node first",
      bestFor: "Fast reachability checks and structure exploration, not shortest paths.",
      weakness: "Path quality is highly sensitive to neighbor order.",
      notesOnGridWeights: "Ignores edge weights entirely and is unsuitable for weighted optimization."
    },
    pitfalls: [
      "Using DFS when shortest path quality matters.",
      "Assuming low node count means good path quality.",
      "Ignoring deterministic neighbor order effects in comparisons."
    ],
    visualBehavior: [
      "Creates long, narrow tendrils before broad coverage.",
      "Backtracking appears as sudden direction changes.",
      "Can reach target quickly by chance or very late on adversarial layouts."
    ]
  }
};

function getAlgorithmKey(algorithm, heuristic) {
  if (algorithm === "CLA") {
    if (heuristic === "extraPoweredManhattanDistance") return "convergentSwarm";
    return "swarm";
  }
  return algorithm;
}

module.exports = { descriptions: descriptions, getAlgorithmKey: getAlgorithmKey };
