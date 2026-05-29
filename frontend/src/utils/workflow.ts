import type { Edge, Node } from "reactflow";
import type { AgentNodeData } from "../components/AgentNode";

export type RunEvent = {
  nodeId: string;
  label: string;
  startedAtMs: number;
  completedAtMs: number;
};

export function buildApiPayload(nodes: Node<AgentNodeData>[], edges: Edge[]) {
  const nodeIds = new Set(nodes.map((n) => n.id));
  const validEdges = edges.filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target));

  return {
    nodes: nodes.map((n) => ({
      id: n.id,
      type: "agent",
      data: { label: n.data.label.trim(), prompt: n.data.prompt ?? "" },
      position: n.position,
    })),
    edges: validEdges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      animated: e.animated,
    })),
    validEdges,
  };
}

export function validateWorkflowLocally(nodes: Node<AgentNodeData>[], edges: Edge[]): string[] {
  const errors: string[] = [];

  if (nodes.length === 0) {
    errors.push("Add at least one agent from the palette.");
    return errors;
  }

  const unnamed = nodes.filter((n) => !n.data.label?.trim());
  if (unnamed.length > 0) {
    errors.push(
      `${unnamed.length} agent(s) have no name. Select each node and set a display name in Properties.`,
    );
  }

  const nodeIds = new Set(nodes.map((n) => n.id));
  const brokenEdges = edges.filter((e) => !nodeIds.has(e.source) || !nodeIds.has(e.target));
  if (brokenEdges.length > 0) {
    errors.push(
      `${brokenEdges.length} connection(s) point to deleted agents. Delete those lines (select edge → Delete) or reconnect them.`,
    );
  }

  return errors;
}

export const DEFAULT_TEMPLATE = {
  nodes: [
    {
      id: "1",
      type: "agent" as const,
      data: { label: "Planner", prompt: "Plan work", role: "planner" as const, status: "idle" as const },
      position: { x: 80, y: 140 },
    },
    {
      id: "2",
      type: "agent" as const,
      data: { label: "Researcher", prompt: "Gather context", role: "researcher" as const, status: "idle" as const },
      position: { x: 380, y: 60 },
    },
    {
      id: "3",
      type: "agent" as const,
      data: { label: "Builder", prompt: "Implement output", role: "builder" as const, status: "idle" as const },
      position: { x: 380, y: 220 },
    },
  ],
  edges: [
    { id: "e1-2", source: "1", target: "2", animated: true },
    { id: "e1-3", source: "1", target: "3", animated: true },
  ],
};

export function simulateLocally(nodes: Node<AgentNodeData>[]): { durationMs: number; events: RunEvent[] } {
  const events = nodes.map((node, index) => ({
    nodeId: node.id,
    label: node.data.label.trim() || "Agent",
    startedAtMs: index * 1200,
    completedAtMs: index * 1200 + 950,
  }));

  return {
    durationMs: events.length * 1200,
    events,
  };
}
