import type { Database } from "@/types/database";

type CareerNode = Database["public"]["Tables"]["career_nodes"]["Row"];
type CareerEdge = Database["public"]["Tables"]["career_edges"]["Row"];

export type PathResult = {
  nodeIds: string[];
  edgeIds: string[];
  totalMonths: number;
};

export function findShortestPath(
  nodes: CareerNode[],
  edges: CareerEdge[],
  fromId: string,
  toId: string
): PathResult | null {
  if (fromId === toId) return { nodeIds: [fromId], edgeIds: [], totalMonths: 0 };

  const adj = new Map<string, { to: string; edgeId: string; weight: number }[]>();
  for (const node of nodes) adj.set(node.id, []);
  for (const edge of edges) {
    adj.get(edge.from_node_id)?.push({
      to: edge.to_node_id,
      edgeId: edge.id,
      weight: edge.avg_transition_months,
    });
  }

  const dist = new Map<string, number>();
  const prev = new Map<string, { nodeId: string; edgeId: string } | null>();
  for (const node of nodes) dist.set(node.id, Infinity);
  dist.set(fromId, 0);
  prev.set(fromId, null);

  const queue: [number, string][] = [[0, fromId]];

  while (queue.length > 0) {
    queue.sort((a, b) => a[0] - b[0]);
    const [cost, u] = queue.shift()!;
    if (cost > (dist.get(u) ?? Infinity)) continue;
    if (u === toId) break;

    for (const { to, edgeId, weight } of adj.get(u) ?? []) {
      const newCost = cost + weight;
      if (newCost < (dist.get(to) ?? Infinity)) {
        dist.set(to, newCost);
        prev.set(to, { nodeId: u, edgeId });
        queue.push([newCost, to]);
      }
    }
  }

  if ((dist.get(toId) ?? Infinity) === Infinity) return null;

  const nodeIds: string[] = [];
  const edgeIds: string[] = [];
  let cur: string | null = toId;
  while (cur !== null) {
    nodeIds.unshift(cur);
    const p = prev.get(cur);
    if (p) {
      edgeIds.unshift(p.edgeId);
      cur = p.nodeId;
    } else {
      cur = null;
    }
  }

  return { nodeIds, edgeIds, totalMonths: dist.get(toId)! };
}
