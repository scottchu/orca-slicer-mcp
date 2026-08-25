# U1 print status card

Use this compact layout for meaningful observations. Omit unavailable fields
instead of filling them with guesses.

```text
## U1 Print  [state icon] State

████████░░  81.8%   Layer 158/188

Tool 2 · Black PLA · 220/220 C
Bed 55/55 C · No printer errors
Elapsed 26m · Estimated remaining 6m

Camera: four parts upright and attached; no visible spaghetti.
Next check: 2m — the job is inside its final 10 minutes.
```

State icons:

- `🟢` printing normally
- `🟡` starting, finishing, stale, or visually uncertain
- `🔴` error or visually obvious failure
- `✅` telemetry-verified complete

Round the bar to ten cells. Keep exact numeric progress beside it so the visual
does not replace evidence. The final card must distinguish telemetry completion
from physical acceptance by the user.
