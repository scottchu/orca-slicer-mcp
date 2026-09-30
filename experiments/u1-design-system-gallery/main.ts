import { mount } from 'svelte';
import '@common/tokens.css';
import Gallery from './Gallery.svelte';
mount(Gallery, { target: document.getElementById('app')! });
