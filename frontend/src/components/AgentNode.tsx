import { Handle, Position, type NodeProps } from "reactflow";
import { getAgentType, type AgentRole } from "../constants/agentTypes";

export type AgentNodeData = {
  label: string;
  prompt: string;
  role: AgentRole;
  status?: "idle" | "running" | "done";
};

export function AgentNode({ data, selected }: NodeProps<AgentNodeData>) {
  const typeDef = getAgentType(data.role);
  const status = data.status ?? "idle";

  return (
    <div className={`agent-node status-${status}${selected ? " selected" : ""}`} style={{ "--agent-color": typeDef.color } as React.CSSProperties}>
      <Handle type="target" position={Position.Left} className="agent-handle" />
      <div className="agent-node-header">
        <span className="agent-icon">{typeDef.icon}</span>
        <div>
          <div className="agent-label">{data.label}</div>
          <div className="agent-role">{typeDef.label}</div>
        </div>
        <span className={`status-pill status-${status}`}>{status}</span>
      </div>
      <p className="agent-prompt">{data.prompt || "No prompt set"}</p>
      <Handle type="source" position={Position.Right} className="agent-handle" />
    </div>
  );
}
