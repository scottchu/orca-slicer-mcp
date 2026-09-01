<script lang="ts">
  import CameraWidget from './CameraWidget.svelte';
  import type { CameraSessionState } from './session';
  import type { VideoSurfacePort } from '../media/playback';
  import { createBrowserCamera } from './runtime';
  let cameraState = $state<CameraSessionState>({ phase: 'loading', snapshot: null, liveAt: null, fps: null, refreshing: false, feedback: null });
  let feedback = $state('');
  let controller: ReturnType<typeof createBrowserCamera> | null = null;
  const ready = (surface: VideoSurfacePort) => {
    const current = createBrowserCamera(surface); controller = current;
    const unsubscribe = current.subscribe((value) => { cameraState = value.camera; feedback = value.feedback; });
    current.start();
    return () => { unsubscribe(); current.dispose(); if (controller === current) controller = null; };
  };
  const refresh = () => { void controller?.refresh(); };
  const live = () => { void controller?.goLive(); };
  const close = () => controller?.close();
  const notify = (message: string) => controller?.notify(message);
</script>

<CameraWidget state={cameraState} {feedback} onready={ready} onfeedback={notify} onrefresh={refresh} onlive={live} onclose={close} />
