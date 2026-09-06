import { createObservationPresentation, type ObservationView } from "./observation-presentation.js";
import type { ObservationSnapshot } from "./observation-store.js";

export const observationPayload = (
  snapshot: ObservationSnapshot,
  view: ObservationView
) => {
  const presentation = createObservationPresentation(snapshot, view);
  const module = view === "bed_mesh" ? "bed mesh" : view;
  const state = presentation.module.state;
  return {
    content: [{
      type: "text" as const,
      text: `U1 ${module} observation is ${state}.`,
    }],
    structuredContent: presentation,
    _meta: {},
  };
};
