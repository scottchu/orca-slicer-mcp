import { mount } from 'svelte';
import ObservationLab from '../../components/lab/ObservationLab.svelte';
import '../../components/common/tokens.css';
import '../../components/observation/observation.css';

const titles: Record<string, string> = {
  overview: 'Overview', progress: 'Print Progress', thermals: 'Thermals',
  heads: 'Heads & Filaments', jobs: 'Current Job', job_history: 'Job History',
  queue: 'Print Queue', fans: 'Fans & Air'
};
const route = location.pathname.replace(/\/$/, '').slice('/dashboard/lab/'.length) || 'directory';
document.title = titles[route] ?? 'Observation Lab';
document.documentElement.dataset.u1LabRoute = route;
mount(ObservationLab, { target: document.body });
