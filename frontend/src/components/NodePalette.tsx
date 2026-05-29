import { AGENT_TYPES, type AgentTypeDef } from "../constants/agentTypes";

type NodePaletteProps = {
  onAddAgent: (type: AgentTypeDef) => void;
  nodeCount: number;
};

export function NodePalette({ onAddAgent, nodeCount }: NodePaletteProps) {
  return (
    <aside className="side-panel palette-panel">
      <div className="panel-header">
        <h2>Agent Palette</h2>
        <span className="badge">{nodeCount} nodes</span>
      </div>
      <p className="panel-hint">Click an agent type to add it to the canvas.</p>
      <div className="palette-list">
        {AGENT_TYPES.map((type) => (
          <button
            key={type.role}
            type="button"
            className="palette-card"
            style={{ "--card-accent": type.color } as React.CSSProperties}
            onClick={() => onAddAgent(type)}
          >
            <span className="palette-icon">{type.icon}</span>
            <div className="palette-card-body">
              <strong>{type.label}</strong>
              <span>{type.description}</span>
            </div>
            <span className="palette-add">+</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
