import { mount } from 'svelte';
import BedMeshLabRoot from './lib/bed-mesh/BedMeshLabRoot.svelte';
import './lib/common/tokens.css';
import './lib/observation/observation.css';

mount(BedMeshLabRoot, { target: document.body });
