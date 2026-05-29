import type { Node } from "reactflow";
import type { AgentNodeData } from "./AgentNode";
import { AGENT_TYPES } from "../constants/agentTypes";

type PropertiesPanelProps = {
  selectedNode: Node<AgentNodeData> | null;
  onUpdate: (id: string, patch: Partial<AgentNodeData>) => void;
  onDelete: (id: string) => void;
};

export function PropertiesPanel({ selectedNode, onUpdate, onDelete }: PropertiesPanelProps) {
  if (!selectedNode) {
    return (
      <aside className="side-panel properties-panel empty">
        <div className="panel-header">
          <h2>Properties</h2>
        </div>
        <p className="panel-hint">Select a node on the canvas to edit its label, role, and prompt.</p>
      </aside>
    );
  }

  const { id, data } = selectedNode;

  return (
    <aside className="side-panel properties-panel">
      <div className="panel-header">
        <h2>Properties</h2>
        <span className="badge mono">{id}</span>
      </div>

      <label className="field">
        <span>Display name</span>
        <input
          value={data.label}
          onChange={(e) => onUpdate(id, { label: e.target.value })}
          placeholder="Agent name"
        />
      </label>

      <label className="field">
        <span>Agent role</span>
        <select value={data.role} onChange={(e) => onUpdate(id, { role: e.target.value as AgentNodeData["role"] })}>
          {AGENT_TYPES.map((t) => (
            <option key={t.role} value={t.role}>
              {t.label}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>System prompt</span>
        <textarea
          value={data.prompt}
          onChange={(e) => onUpdate(id, { prompt: e.target.value })}
          rows={5}
          placeholder="What should this agent do?"
        />
      </label>

      <div className="property-meta">
        <span>Status</span>
        <strong className={`status-pill status-${data.status ?? "idle"}`}>{data.status ?? "idle"}</strong>
      </div>

      <button type="button" className="btn-danger" onClick={() => onDelete(id)}>
        Delete node
      </button>
    </aside>
  );
}
