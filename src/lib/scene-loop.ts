type Scheduler = {
  request: (callback: (time: number) => void) => number;
  cancel: (id: number) => void;
  render: (dt: number) => void;
};

export function sceneCanAnimate(state: {
  visible: boolean;
  hidden: boolean;
  reduced: boolean;
  paused: boolean;
}) {
  return state.visible && !state.hidden && !state.reduced && !state.paused;
}

/** At most one pending frame; suspended time never enters the simulation. */
export function createSceneLoop(
  scheduler: Scheduler,
  fps: number | (() => number),
) {
  let running = false;
  let disposed = false;
  let frame: number | null = null;
  let last: number | null = null;
  function tick(time: number) {
    frame = null;
    if (!running || disposed) return;
    const limit = typeof fps === "function" ? fps() : fps;
    if (last === null || time - last >= 1000 / limit - 0.5) {
      scheduler.render(
        last === null ? 0 : Math.min((time - last) / 1000, 0.065),
      );
      last = time;
    }
    if (running && !disposed) frame = scheduler.request(tick);
  }
  return {
    setActive(active: boolean) {
      if (disposed || running === active) return;
      running = active;
      last = null;
      if (frame !== null) scheduler.cancel(frame);
      frame = active ? scheduler.request(tick) : null;
    },
    dispose() {
      disposed = true;
      running = false;
      if (frame !== null) scheduler.cancel(frame);
      frame = null;
    },
  };
}
