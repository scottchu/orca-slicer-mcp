<script lang="ts">
  import CameraWidget from './CameraWidget.svelte';
  import type { CameraMode, CameraSessionState } from '../../lib/client/camera/session';
  import type { VideoSurfacePort } from '../../lib/client/media/playback';
  import { createBrowserCamera } from '../../lib/client/camera/runtime';
  let cameraState = $state<CameraSessionState>({ mode: 'snapshot', phase: 'loading', snapshot: null, liveAt: null, fps: null, refreshing: false, feedback: null });
  let feedback = $state('');
  let controller: ReturnType<typeof createBrowserCamera> | null = null;
  const ready = (surface: VideoSurfacePort) => {
    const current = createBrowserCamera(surface); controller = current;
    const unsubscribe = current.subscribe((value) => { cameraState = value.camera; feedback = value.feedback; });
    current.start();
    return () => { unsubscribe(); current.dispose(); if (controller === current) controller = null; };
  };
  const refresh = () => { void controller?.refresh(); };
  const selectMode = (mode: CameraMode) => { void controller?.selectMode(mode); };
  const notify = (message: string) => controller?.notify(message);
</script>

<CameraWidget state={cameraState} {feedback} onready={ready} onfeedback={notify} onrefresh={refresh} onmode={selectMode} />
