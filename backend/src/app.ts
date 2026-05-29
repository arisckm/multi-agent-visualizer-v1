import cors from "cors";
import express, { type Express } from "express";
import { z } from "zod";

const positionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

const nodeSchema = z.object({
  id: z.string(),
  type: z.string().optional(),
  data: z.object({
    label: z.string().trim().min(1, "Each agent needs a display name"),
    prompt: z.string().optional().default(""),
  }),
  position: positionSchema,
});

const edgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  animated: z.boolean().optional(),
  type: z.string().optional(),
  sourceHandle: z.string().nullable().optional(),
  targetHandle: z.string().nullable().optional(),
});

const workflowSchema = z.object({
  nodes: z.array(nodeSchema),
  edges: z.array(edgeSchema),
});

/** Mount API routes at `/api` locally, or at `/` when Vercel routes `/api/*` to this service. */
export function createApp(): Express {
  const app = express();

  app.use(
    cors({
      origin: process.env.FRONTEND_URL ?? true,
    }),
  );
  app.use(express.json({ limit: "2mb" }));

  const api = express.Router();

  api.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  api.get("/templates/workflow", (_req, res) => {
    res.json({
      nodes: [
        {
          id: "agent-planner",
          type: "agent",
          data: { label: "Planner Agent", prompt: "Break task into steps" },
          position: { x: 100, y: 140 },
        },
        {
          id: "agent-researcher",
          type: "agent",
          data: { label: "Research Agent", prompt: "Collect supporting facts" },
          position: { x: 380, y: 80 },
        },
        {
          id: "agent-builder",
          type: "agent",
          data: { label: "Builder Agent", prompt: "Implement best approach" },
          position: { x: 380, y: 220 },
        },
      ],
      edges: [
        { id: "e1", source: "agent-planner", target: "agent-researcher" },
        { id: "e2", source: "agent-planner", target: "agent-builder" },
      ],
    });
  });

  api.post("/workflows/validate", (req, res) => {
    const parsed = workflowSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        valid: false,
        errors: parsed.error.issues.map((issue) => issue.message),
      });
    }

    const { nodes, edges } = parsed.data;
    const missingEdgeLinks = edges.filter(
      (edge) =>
        !nodes.some((node) => node.id === edge.source) ||
        !nodes.some((node) => node.id === edge.target),
    );

    if (nodes.length === 0) {
      return res.status(400).json({ valid: false, errors: ["Workflow must have at least one node"] });
    }

    if (missingEdgeLinks.length > 0) {
      return res.status(400).json({
        valid: false,
        errors: [
          `${missingEdgeLinks.length} connection(s) point to deleted agents. Remove broken lines or reconnect them.`,
        ],
      });
    }

    return res.json({ valid: true, errors: [] });
  });

  api.post("/runs/simulate", (req, res) => {
    const parsed = workflowSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid workflow payload" });
    }

    const events = parsed.data.nodes.map((node, index) => ({
      nodeId: node.id,
      label: node.data.label,
      startedAtMs: index * 1200,
      completedAtMs: index * 1200 + 950,
    }));

    return res.json({
      runId: `run-${Date.now()}`,
      durationMs: events.length * 1200,
      events,
    });
  });

  const mountPath = process.env.VERCEL ? "/" : "/api";
  app.use(mountPath, api);

  return app;
}
