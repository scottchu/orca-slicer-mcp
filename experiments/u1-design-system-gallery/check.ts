import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';
const require = createRequire(resolve(import.meta.dir, '../../plugins/u1-print-studio/app/package.json'));
const { chromium } = require('@playwright/test');
const url = process.argv[2], output = process.argv[3];
if (!url?.startsWith('http://127.0.0.1:') || !output?.startsWith('/')) throw Error('Pass loopback URL and private evidence directory');
mkdirSync(output, { recursive:true });
const browser = await chromium.launch({headless:true});
const results:any[]=[];
try {
 const page = await browser.newPage({viewport:{width:1100,height:1000}, reducedMotion:'no-preference'});
 const errors:string[]=[];page.on('pageerror',(error:Error)=>errors.push(error.message));
 await page.goto(url);await page.screenshot({path:`${output}/desktop.png`,fullPage:true});
 for (const width of [320,390]) for (const scale of [100,200]) {
  await page.getByLabel('Max card width').selectOption(String(width));await page.getByLabel('Text size').selectOption(String(scale));
  for (const scenario of ['ready','zero','missing','stale','extreme']) {
   await page.getByLabel('Temperature case').selectOption(scenario);
   const cards=page.locator('[data-card]');
   const measured=await cards.evaluateAll((nodes:any[])=>nodes.map(n=>({width:n.getBoundingClientRect().width,height:n.getBoundingClientRect().height,overflow:n.scrollWidth>n.clientWidth,valueFont:getComputedStyle(n.querySelector('.degree')).fontSize,text:n.innerText,labels:[...n.querySelectorAll('[aria-label]')].map((e:any)=>e.getAttribute('aria-label'))})));
   if(measured.some((m:any)=>m.width!==width||m.overflow))throw Error(`Overflow/width ${width}/${scale}/${scenario}: ${JSON.stringify(measured)}`);
   results.push({width,scale,scenario,measured});
   await page.locator('.comparison').screenshot({path:`${output}/thermal-${width}-${scale}-${scenario}.png`});
  }
  await page.getByLabel('Temperature case').selectOption('ready');
  const geometry=[];
  for(const phase of ['ready','loading','refresh','failure','retry','recovered']){
   await page.getByLabel('Acquisition').selectOption(phase);
   const data=await page.locator('[data-card]').evaluateAll((nodes:any[])=>nodes.map(n=>({height:n.getBoundingClientRect().height,labels:[...n.querySelectorAll('[aria-label]')].map((e:any)=>e.getAttribute('aria-label')),busy:n.getAttribute('aria-busy')})));
   if(['failure','retry','loading'].includes(phase)&&data.some((d:any)=>d.labels.some((v:string)=>/Actual:|Target:/.test(v))))throw Error('Masked telemetry accessible');
   if (phase === 'failure' || phase === 'retry') { const animated = await page.locator('[data-card] [data-loading-value]').evaluateAll((nodes:any[])=>nodes.some(n=>getComputedStyle(n).animationName!=='none')); if(animated) throw Error('Failed state animates'); }
   geometry.push({phase,data});
  }
  if(geometry.some(g=>g.data.some((d:any,i:number)=>Math.abs(d.height-geometry[0].data[i].height)>1)))throw Error('State geometry changed');
  results.push({width,scale,geometry});
 }
 await page.getByLabel('Text size').selectOption('100');await page.getByLabel('Acquisition').selectOption('ready');
 await page.getByText('03 / Progress & Camera contract references').click();
 const radio=page.getByRole('radio',{name:'Auto',exact:true});await radio.focus();await page.keyboard.press('ArrowRight');
 if(await page.getByRole('radio',{name:'Live',exact:true}).getAttribute('aria-checked')!=='true')throw Error('Switch keyboard');
 await page.getByText('02 / Value specimens & duration choice').click();await page.screenshot({path:`${output}/expanded.png`,fullPage:true});
 await page.setViewportSize({width:390,height:1000});await page.screenshot({path:`${output}/phone.png`,fullPage:true});
 if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Phone page overflow');
 if(errors.length)throw Error(errors.join('\n'));
 writeFileSync(`${output}/checks.json`,JSON.stringify({results,errors},null,2));
 console.log(`Passed ${results.length} matrix/transition records; keyboard Switch; phone overflow; zero page errors.`);
} finally {await browser.close();}
