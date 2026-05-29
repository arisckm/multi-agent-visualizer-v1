type RunEvent = {
  nodeId: string;
  label: string;
  startedAtMs: number;
  completedAtMs: number;
};

type RunTimelineProps = {
  events: RunEvent[];
  elapsedMs: number;
  isRunning: boolean;
};

export function RunTimeline({ events, elapsedMs, isRunning }: RunTimelineProps) {
  const maxMs = events.reduce((max, e) => Math.max(max, e.completedAtMs), 1);

  return (
    <footer className="run-timeline">
      <div className="timeline-header">
        <h2>Run timeline</h2>
        <span className={`run-state${isRunning ? " active" : ""}`}>
          {isRunning ? "Simulating…" : events.length ? "Completed" : "Idle"}
        </span>
        <span className="elapsed">{(elapsedMs / 1000).toFixed(1)}s</span>
      </div>

      {events.length === 0 ? (
        <p className="panel-hint">Run a simulation to see each agent&apos;s start and end times.</p>
      ) : (
        <div className="timeline-tracks">
          {events.map((event) => {
            const left = (event.startedAtMs / maxMs) * 100;
            const width = Math.max(((event.completedAtMs - event.startedAtMs) / maxMs) * 100, 4);
            const done = elapsedMs >= event.completedAtMs;
            const running = elapsedMs >= event.startedAtMs && !done;

            return (
              <div key={`${event.nodeId}-${event.startedAtMs}`} className="timeline-row">
                <span className="timeline-label">{event.label}</span>
                <div className="timeline-bar-track">
                  <div
                    className={`timeline-bar${done ? " done" : running ? " running" : ""}`}
                    style={{ left: `${left}%`, width: `${width}%` }}
                  />
                </div>
                <span className="timeline-time">
                  {(event.startedAtMs / 1000).toFixed(1)}s – {(event.completedAtMs / 1000).toFixed(1)}s
                </span>
              </div>
            );
          })}
        </div>
      )}
    </footer>
  );
}
