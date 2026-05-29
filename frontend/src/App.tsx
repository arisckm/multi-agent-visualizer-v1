import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  addEdge,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
} from "reactflow";
import "reactflow/dist/style.css";
import "./App.css";
import { AgentNode, type AgentNodeData } from "./components/AgentNode";
import { NodePalette } from "./components/NodePalette";
import { PropertiesPanel } from "./components/PropertiesPanel";
import { RunTimeline } from "./components/RunTimeline";
import { AGENT_TYPES, type AgentTypeDef } from "./constants/agentTypes";

type RunEvent = {
  nodeId: string;
  label: string;
  startedAtMs: number;
  completedAtMs: number;
};

const nodeTypes = { agent: AgentNode };

const initialNodes: Node<AgentNodeData>[] = [
  {
    id: "1",
    type: "agent",
    data: { label: "Planner", prompt: "Plan work", role: "planner", status: "idle" },
    position: { x: 80, y: 140 },
  },
  {
    id: "2",
    type: "agent",
    data: { label: "Researcher", prompt: "Gather context", role: "researcher", status: "idle" },
    position: { x: 380, y: 60 },
  },
  {
    id: "3",
    type: "agent",
    data: { label: "Builder", prompt: "Implement output", role: "builder", status: "idle" },
    position: { x: 380, y: 220 },
  },
];

const initialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2", animated: true },
  { id: "e1-3", source: "1", target: "3", animated: true },
];

let nodeIdCounter = 10;

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [events, setEvents] = useState<RunEvent[]>([]);
  const [elapsedMs, setElapsedMs] = useState(0);
  const intervalRef = useRef<number | null>(null);

  const apiBase = useMemo(() => {
    const fromEnv = import.meta.env.VITE_API_URL?.replace(/\/$/, "");
    if (fromEnv) return fromEnv;
    if (import.meta.env.PROD) return "/api";
    return "http://localhost:4000/api";
  }, []);

  const selectedNode = useMemo(
    () => (selectedNodeId ? (nodes.find((n) => n.id === selectedNodeId) as Node<AgentNodeData> | undefined) ?? null : null),
    [nodes, selectedNodeId],
  );

  useEffect(() => {
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, []);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges],
  );

  const addAgent = useCallback(
    (type: AgentTypeDef) => {
      nodeIdCounter += 1;
      const id = `agent-${nodeIdCounter}`;
      const offset = nodes.length * 36;

      const newNode: Node<AgentNodeData> = {
        id,
        type: "agent",
        position: { x: 120 + (offset % 280), y: 80 + offset },
        data: {
          label: type.label,
          prompt: type.defaultPrompt,
          role: type.role,
          status: "idle",
        },
      };

      setNodes((prev) => [...prev, newNode]);
      setSelectedNodeId(id);
    },
    [nodes.length, setNodes],
  );

  const updateNode = useCallback(
    (id: string, patch: Partial<AgentNodeData>) => {
      setNodes((prev) =>
        prev.map((node) => (node.id === id ? { ...node, data: { ...node.data, ...patch } } : node)),
      );
    },
    [setNodes],
  );

  const deleteNode = useCallback(
    (id: string) => {
      setNodes((prev) => prev.filter((n) => n.id !== id));
      setEdges((prev) => prev.filter((e) => e.source !== id && e.target !== id));
      setSelectedNodeId((current) => (current === id ? null : current));
    },
    [setNodes, setEdges],
  );

  const updateNodeStatuses = useCallback(
    (currentMs: number, activeEvents: RunEvent[]) => {
      const statusByNode = new Map<string, AgentNodeData["status"]>();
      activeEvents.forEach((event) => {
        if (currentMs >= event.completedAtMs) statusByNode.set(event.nodeId, "done");
        else if (currentMs >= event.startedAtMs) statusByNode.set(event.nodeId, "running");
        else statusByNode.set(event.nodeId, "idle");
      });

      setNodes((prev) =>
        prev.map((node) => ({
          ...node,
          data: { ...node.data, status: statusByNode.get(node.id) ?? "idle" },
        })),
      );
    },
    [setNodes],
  );

  const resetRunState = useCallback(() => {
    setEvents([]);
    setElapsedMs(0);
    setNodes((prev) => prev.map((n) => ({ ...n, data: { ...n.data, status: "idle" as const } })));
  }, [setNodes]);

  const simulateRun = async () => {
    const payload = {
      nodes: nodes.map((n) => ({
        id: n.id,
        type: "agent",
        data: { label: n.data.label, prompt: n.data.prompt },
        position: n.position,
      })),
      edges,
    };

    const validation = await fetch(`${apiBase}/workflows/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!validation.ok) {
      alert("Workflow is invalid. Add at least one agent and connect edges correctly.");
      return;
    }

    const runResponse = await fetch(`${apiBase}/runs/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!runResponse.ok) {
      alert("Could not start simulated run.");
      return;
    }

    const run = (await runResponse.json()) as { durationMs: number; events: RunEvent[] };
    setEvents(run.events);
    setElapsedMs(0);
    setIsRunning(true);
    updateNodeStatuses(0, run.events);

    if (intervalRef.current) window.clearInterval(intervalRef.current);

    const started = Date.now();
    intervalRef.current = window.setInterval(() => {
      const ms = Date.now() - started;
      setElapsedMs(ms);
      updateNodeStatuses(ms, run.events);
      if (ms >= run.durationMs) {
        setIsRunning(false);
        if (intervalRef.current) window.clearInterval(intervalRef.current);
      }
    }, 100);
  };

  const loadTemplate = async () => {
    const response = await fetch(`${apiBase}/templates/workflow`);
    if (!response.ok) return;
    const template = (await response.json()) as {
      nodes: Array<{ id: string; data: { label: string; prompt?: string }; position: { x: number; y: number } }>;
      edges: Edge[];
    };

    const roleFromLabel = (label: string): AgentNodeData["role"] => {
      const match = AGENT_TYPES.find((t) => t.label.toLowerCase() === label.toLowerCase());
      return match?.role ?? "custom";
    };

    setNodes(
      template.nodes.map((n) => ({
        id: n.id,
        type: "agent",
        position: n.position,
        data: {
          label: n.data.label,
          prompt: n.data.prompt ?? "",
          role: roleFromLabel(n.data.label),
          status: "idle" as const,
        },
      })),
    );
    setEdges(template.edges.map((e) => ({ ...e, animated: true })));
    resetRunState();
  };

  const saveWorkflow = () => {
    const blob = new Blob([JSON.stringify({ nodes, edges }, null, 2)], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = "workflow.json";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(href);
  };

  const loadWorkflowFromFile: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const parsed = JSON.parse(text) as { nodes: Node<AgentNodeData>[]; edges: Edge[] };
    setNodes(parsed.nodes.map((n) => ({ ...n, type: "agent", data: { ...n.data, status: "idle" } })));
    setEdges(parsed.edges);
    resetRunState();
    event.target.value = "";
  };

  return (
    <div className="app-shell">
      <header className="top-bar">
        <div className="brand">
          <span className="brand-mark">⬡</span>
          <div>
            <h1>Multi-Agent Visualizer</h1>
            <p>Design orchestration flows · simulate execution</p>
          </div>
        </div>
        <div className="actions">
          <button type="button" className="btn-secondary" onClick={loadTemplate}>
            Template
          </button>
          <button type="button" className="btn-secondary" onClick={saveWorkflow}>
            Save JSON
          </button>
          <label className="btn-secondary file-input">
            Load JSON
            <input type="file" accept="application/json" onChange={loadWorkflowFromFile} />
          </label>
          <button type="button" className="btn-primary" disabled={isRunning || nodes.length === 0} onClick={simulateRun}>
            {isRunning ? "Running…" : "▶ Simulate"}
          </button>
        </div>
      </header>

      <div className="workspace">
        <NodePalette onAddAgent={addAgent} nodeCount={nodes.length} />

        <main className="canvas-wrap">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, node) => setSelectedNodeId(node.id)}
            onPaneClick={() => setSelectedNodeId(null)}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            deleteKeyCode={["Backspace", "Delete"]}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#334155" />
            <MiniMap
              nodeColor={(n) => {
                const role = (n.data as AgentNodeData).role;
                return AGENT_TYPES.find((t) => t.role === role)?.color ?? "#64748b";
              }}
              maskColor="rgba(15, 23, 42, 0.75)"
            />
            <Controls showInteractive={false} />
          </ReactFlow>
          <div className="canvas-hint">
            Drag between handles to connect agents · Select a node to edit · Delete key removes selection
          </div>
        </main>

        <PropertiesPanel selectedNode={selectedNode} onUpdate={updateNode} onDelete={deleteNode} />
      </div>

      <RunTimeline events={events} elapsedMs={elapsedMs} isRunning={isRunning} />
    </div>
  );
}

export default App;
