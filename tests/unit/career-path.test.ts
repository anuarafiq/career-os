import { describe, it, expect } from "vitest";
import { findShortestPath } from "@/lib/career-path";
import type { Database } from "@/types/database";

type CareerNode = Database["public"]["Tables"]["career_nodes"]["Row"];
type CareerEdge = Database["public"]["Tables"]["career_edges"]["Row"];

const node = (id: string): CareerNode => ({
  id,
  title: id,
  level: "entry",
  avg_salary_myr_min: 3000,
  avg_salary_myr_max: 5000,
  typical_years_in_role: 2,
  category: "Engineering",
  description: null,
});

const edge = (id: string, from: string, to: string, months: number): CareerEdge => ({
  id,
  from_node_id: from,
  to_node_id: to,
  avg_transition_months: months,
  skill_gaps: [],
});

describe("findShortestPath", () => {
  it("returns single node path when from === to", () => {
    const nodes = [node("a")];
    const result = findShortestPath(nodes, [], "a", "a");
    expect(result).toEqual({ nodeIds: ["a"], edgeIds: [], totalMonths: 0 });
  });

  it("finds direct path between two connected nodes", () => {
    const nodes = [node("a"), node("b")];
    const edges = [edge("e1", "a", "b", 12)];
    const result = findShortestPath(nodes, edges, "a", "b");
    expect(result).toEqual({ nodeIds: ["a", "b"], edgeIds: ["e1"], totalMonths: 12 });
  });

  it("returns null when no path exists", () => {
    const nodes = [node("a"), node("b"), node("c")];
    const edges = [edge("e1", "a", "b", 12)];
    const result = findShortestPath(nodes, edges, "a", "c");
    expect(result).toBeNull();
  });

  it("picks the cheaper path over the direct path", () => {
    // a→b direct costs 24, a→c→b costs 6+6=12
    const nodes = [node("a"), node("b"), node("c")];
    const edges = [
      edge("e1", "a", "b", 24),
      edge("e2", "a", "c", 6),
      edge("e3", "c", "b", 6),
    ];
    const result = findShortestPath(nodes, edges, "a", "b");
    expect(result?.totalMonths).toBe(12);
    expect(result?.nodeIds).toEqual(["a", "c", "b"]);
    expect(result?.edgeIds).toEqual(["e2", "e3"]);
  });

  it("handles multi-hop path", () => {
    const nodes = [node("a"), node("b"), node("c"), node("d")];
    const edges = [
      edge("e1", "a", "b", 6),
      edge("e2", "b", "c", 12),
      edge("e3", "c", "d", 18),
    ];
    const result = findShortestPath(nodes, edges, "a", "d");
    expect(result?.totalMonths).toBe(36);
    expect(result?.nodeIds).toEqual(["a", "b", "c", "d"]);
  });

  it("returns null when fromId is not in nodes", () => {
    const nodes = [node("b")];
    const result = findShortestPath(nodes, [], "a", "b");
    expect(result).toBeNull();
  });
});
