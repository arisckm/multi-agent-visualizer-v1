export type AgentRole =
  | "planner"
  | "researcher"
  | "builder"
  | "reviewer"
  | "coder"
  | "custom";

export type AgentTypeDef = {
  role: AgentRole;
  label: string;
  defaultPrompt: string;
  description: string;
  color: string;
  icon: string;
};

export const AGENT_TYPES: AgentTypeDef[] = [
  {
    role: "planner",
    label: "Planner",
    defaultPrompt: "Break the task into clear steps and assign work.",
    description: "Orchestrates the workflow",
    color: "#8b5cf6",
    icon: "◈",
  },
  {
    role: "researcher",
    label: "Researcher",
    defaultPrompt: "Gather facts, references, and constraints.",
    description: "Collects context and sources",
    color: "#06b6d4",
    icon: "◎",
  },
  {
    role: "builder",
    label: "Builder",
    defaultPrompt: "Implement the solution from the plan.",
    description: "Produces the main output",
    color: "#22c55e",
    icon: "▣",
  },
  {
    role: "coder",
    label: "Coder",
    defaultPrompt: "Write and refine code for the task.",
    description: "Handles implementation details",
    color: "#f59e0b",
    icon: "{ }",
  },
  {
    role: "reviewer",
    label: "Reviewer",
    defaultPrompt: "Validate quality, correctness, and gaps.",
    description: "Checks results before finish",
    color: "#ec4899",
    icon: "✓",
  },
  {
    role: "custom",
    label: "Custom Agent",
    defaultPrompt: "Describe what this agent should do.",
    description: "Blank agent you configure",
    color: "#64748b",
    icon: "◇",
  },
];

export function getAgentType(role: AgentRole): AgentTypeDef {
  return AGENT_TYPES.find((t) => t.role === role) ?? AGENT_TYPES[AGENT_TYPES.length - 1];
}
