"use client";

import { useCallback, useState, useEffect, useMemo } from "react";
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  type NodeTypes,
  type Connection,
} from "reactflow";
import "reactflow/dist/style.css";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database";

type CareerNode = Database["public"]["Tables"]["career_nodes"]["Row"];
type CareerEdge = Database["public"]["Tables"]["career_edges"]["Row"];

const LEVEL_Y: Record<string, number> = {
  entry: 0,
  mid: 180,
  senior: 360,
  lead: 540,
  executive: 720,
};

const CATEGORY_X: Record<string, number> = {
  Engineering: 0,
  "AI/ML": 300,
  Data: 600,
  Product: 900,
  Design: 1200,
  Business: 1500,
};

function CareerNodeCard({ data }: { data: { node: CareerNode; isActive: boolean; isHighlighted: boolean } }) {
  const { node, isActive, isHighlighted } = data;
  return (
    <div
      className={cn(
        "px-3 py-2 rounded-lg border text-xs font-medium transition-all cursor-pointer select-none min-w-[140px] text-center",
        isActive
          ? "bg-brand text-primary-foreground border-brand shadow-lg shadow-brand/20"
          : isHighlighted
          ? "bg-brand-subtle border-brand/50 text-foreground"
          : "bg-card border-border text-foreground hover:border-brand/40"
      )}
    >
      <p className="font-semibold text-[11px] leading-tight">{node.title}</p>
      <p
        className={cn(
          "mt-1 tabular font-bold text-[13px]",
          isActive ? "text-primary-foreground/80" : "text-brand"
        )}
      >
        RM {(node.avg_salary_myr_min / 1000).toFixed(0)}k–{(node.avg_salary_myr_max / 1000).toFixed(0)}k
      </p>
    </div>
  );
}

const nodeTypes: NodeTypes = {
  careerNode: CareerNodeCard,
};

export function CareerPathExplorer({
  nodes: careerNodes,
  edges: careerEdges,
  currentRole,
  seeking,
}: {
  nodes: CareerNode[];
  edges: CareerEdge[];
  currentRole: string | null;
  seeking: string;
}) {
  const [selectedNode, setSelectedNode] = useState<CareerNode | null>(null);
  const [targetNodeId, setTargetNodeId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const categories = useMemo(() => Array.from(new Set(careerNodes.map((n) => n.category))), [careerNodes]);

  const visibleNodes = useMemo(() => {
    if (filterCategory === "all") return careerNodes;
    return careerNodes.filter((n) => n.category === filterCategory);
  }, [careerNodes, filterCategory]);

  const currentNode = careerNodes.find(
    (n) => n.title.toLowerCase() === (currentRole?.toLowerCase() ?? "")
  );

  // Build RF nodes
  const categoryNodes = useMemo(() => {
    const catMap: Record<string, number> = {};
    return visibleNodes.map((node) => {
      const cat = node.category;
      if (!(cat in catMap)) catMap[cat] = 0;
      const xOffset = catMap[cat] * 160;
      catMap[cat]++;
      const catBase = CATEGORY_X[cat] ?? Object.keys(CATEGORY_X).length * 300;
      return {
        id: node.id,
        type: "careerNode",
        position: { x: catBase + xOffset, y: LEVEL_Y[node.level] ?? 0 },
        data: {
          node,
          isActive: node.id === currentNode?.id,
          isHighlighted: false,
        },
      } as Node;
    });
  }, [visibleNodes, currentNode]);

  const [rfNodes, setRfNodes, onNodesChange] = useNodesState(categoryNodes);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    setRfNodes(categoryNodes);
  }, [categoryNodes, setRfNodes]);

  useEffect(() => {
    const visibleIds = new Set(visibleNodes.map((n) => n.id));
    const edges: Edge[] = careerEdges
      .filter((e) => visibleIds.has(e.from_node_id) && visibleIds.has(e.to_node_id))
      .map((e) => ({
        id: e.id,
        source: e.from_node_id,
        target: e.to_node_id,
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: "oklch(0.35 0.016 258)", strokeWidth: 1 },
        animated: false,
      }));
    setRfEdges(edges);
  }, [careerEdges, visibleNodes, setRfEdges]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const careerNode = careerNodes.find((n) => n.id === node.id);
      setSelectedNode(careerNode ?? null);
    },
    [careerNodes]
  );

  const selectedEdge = careerEdges.find(
    (e) =>
      (currentNode && e.from_node_id === currentNode.id && e.to_node_id === selectedNode?.id) ||
      (currentNode && e.to_node_id === currentNode.id && e.from_node_id === selectedNode?.id)
  );

  return (
    <div className="flex h-screen">
      {/* Graph */}
      <div className="flex-1 relative">
        {/* Filter bar */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2">
          <span className="text-xs text-muted-foreground font-medium mr-1">Filter:</span>
          {["all", ...categories].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterCategory(cat)}
              className={cn(
                "text-xs px-2.5 py-1 rounded-md transition-colors font-medium",
                filterCategory === cat
                  ? "bg-brand text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {cat === "all" ? "All" : cat}
            </button>
          ))}
        </div>

        <ReactFlow
          nodes={rfNodes}
          edges={rfEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.3}
          maxZoom={1.5}
          style={{ background: "oklch(0.13 0.012 258)" }}
        >
          <Background color="oklch(0.26 0.014 258)" gap={24} />
          <Controls />
          <MiniMap
            nodeColor={(n) =>
              (n.data as { isActive: boolean }).isActive ? "oklch(0.82 0.14 72)" : "oklch(0.26 0.014 258)"
            }
            style={{ background: "oklch(0.17 0.012 258)", border: "1px solid oklch(0.26 0.014 258)" }}
          />
        </ReactFlow>
      </div>

      {/* Detail panel */}
      <aside
        className={cn(
          "w-80 shrink-0 border-l border-border bg-card flex flex-col transition-all",
          selectedNode ? "translate-x-0" : "translate-x-full hidden"
        )}
      >
        {selectedNode && (
          <>
            <div className="px-5 py-4 border-b border-border flex items-start justify-between">
              <div>
                <h2 className="font-heading font-semibold text-base">{selectedNode.title}</h2>
                <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                  {selectedNode.level} · {selectedNode.category}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNode(null)}
                className="text-muted-foreground hover:text-foreground transition-colors text-lg leading-none"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5">
              {/* Salary */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">Salary range (MYR/month)</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-brand tabular font-bold text-2xl font-heading">
                    RM {(selectedNode.avg_salary_myr_min / 1000).toFixed(0)}k
                  </span>
                  <span className="text-muted-foreground text-sm">–</span>
                  <span className="text-brand tabular font-bold text-2xl font-heading">
                    RM {(selectedNode.avg_salary_myr_max / 1000).toFixed(0)}k
                  </span>
                </div>
              </div>

              {/* Time in role */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">Typical time in role</p>
                <p className="text-foreground font-medium tabular">
                  ~{selectedNode.typical_years_in_role} year{selectedNode.typical_years_in_role !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Description */}
              {selectedNode.description && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">About this role</p>
                  <p className="text-sm text-foreground leading-relaxed">{selectedNode.description}</p>
                </div>
              )}

              {/* Transition from current */}
              {selectedEdge && currentNode && (
                <div className="bg-background rounded-lg border border-border p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">
                    From {currentNode.title}
                  </p>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-brand tabular font-semibold text-sm">
                      ~{selectedEdge.avg_transition_months} months
                    </span>
                    <span className="text-xs text-muted-foreground">avg. transition time</span>
                  </div>
                  {selectedEdge.skill_gaps && selectedEdge.skill_gaps.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Skills to develop:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedEdge.skill_gaps.map((gap) => (
                          <span
                            key={gap}
                            className="text-xs bg-secondary border border-border px-2.5 py-1 rounded-full text-muted-foreground"
                          >
                            {gap}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Salary delta */}
              {currentNode && selectedNode.id !== currentNode.id && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">Salary delta</p>
                  {(() => {
                    const currentMid = (currentNode.avg_salary_myr_min + currentNode.avg_salary_myr_max) / 2;
                    const targetMid = (selectedNode.avg_salary_myr_min + selectedNode.avg_salary_myr_max) / 2;
                    const delta = targetMid - currentMid;
                    const pct = ((delta / currentMid) * 100).toFixed(0);
                    return (
                      <p className={cn("font-semibold tabular text-lg", delta >= 0 ? "text-success" : "text-destructive")}>
                        {delta >= 0 ? "+" : ""}RM {Math.abs(delta / 1000).toFixed(1)}k/mo ({delta >= 0 ? "+" : ""}{pct}%)
                      </p>
                    );
                  })()}
                </div>
              )}
            </div>
          </>
        )}

        {!selectedNode && (
          <div className="flex-1 flex items-center justify-center px-8 text-center">
            <div>
              <p className="text-4xl mb-3">◈</p>
              <p className="text-sm text-muted-foreground">Click any role to see salary, transition time, and skill gaps</p>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
