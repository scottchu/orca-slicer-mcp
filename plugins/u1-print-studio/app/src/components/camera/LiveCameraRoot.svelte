<script lang="ts">
  import CameraWidget from './CameraWidget.svelte';
  import type { CameraMode, CameraSessionState } from '../../lib/client/camera/session';
  import type { VideoSurfacePort } from '../../lib/client/media/playback';
  import { createBrowserCamera } from '../../lib/client/camera/runtime';
  import { type PresentationFactory } from '../../lib/client/media/presentation';
  let { initialSnapshot = 'request', presentation = 'document' }: { initialSnapshot?: 'request' | 'host-result'; presentation?: 'host' | 'document' } = $props();
  let cameraState = $state<CameraSessionState>({ mode: 'auto', phase: 'loading', snapshot: null, liveAt: null, fps: null, refreshing: false, feedback: null });
  let feedback = $state('');
  let controller: ReturnType<typeof createBrowserCamera> | null = null;
  const present: PresentationFactory = (surface) => {
    if (!controller) throw new Error('Camera runtime is not ready');
    return controller.presentation(surface);
  };
  const ready = (surface: VideoSurfacePort) => {
    const current = createBrowserCamera(surface, initialSnapshot, presentation); controller = current;
    const unsubscribe = current.subscribe((value) => { cameraState = value.camera; feedback = value.feedback; });
    current.start();
    return () => { unsubscribe(); current.dispose(); if (controller === current) { controller = null; } };
  };
  const selectMode = (mode: CameraMode) => { void controller?.selectMode(mode); };
  const notify = (message: string) => controller?.notify(message);
</script>

<CameraWidget presentation={present} state={cameraState} {feedback} onready={ready} onfeedback={notify} onmode={selectMode} />
