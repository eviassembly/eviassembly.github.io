import {samples,record} from './samples.js';
import {contactEmail} from './contact-config.js';
const $=id=>document.getElementById(id);
let current=samples[0], selected=null, task='compose', relationIndex=0, angle=-28, exploded=0, category='All', query='', story='parts';
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const shade=(hex,k)=>'#'+hex.slice(1).match(/../g).map(v=>Math.max(0,Math.min(255,Math.round(parseInt(v,16)*k))).toString(16).padStart(2,'0')).join('');
function draw(sample,rotation=-28,spread=0,highlight=[],inspected=null,viewport=null){
 const role=id=>highlight.indexOf(id), roleColor=id=>role(id)===0?'#247362':'#97602a';
 const rad=rotation*Math.PI/180, project=([x,y,z])=>[x*Math.cos(rad)+z*Math.sin(rad),-y*.92+(-x*Math.sin(rad)+z*Math.cos(rad))*.4,-x*Math.sin(rad)+z*Math.cos(rad)];
 const faces=[],points=[];
 sample.parts.forEach(part=>{
  const vertices=[];
  for(let i=0;i<8;i++){
   let x=(i&1?1:-1)*part.size[0]/2,y=(i&2?1:-1)*part.size[1]/2,z=(i&4?1:-1)*part.size[2]/2;
   if(part.angle){const ox=x;x=x*Math.cos(part.angle)-y*Math.sin(part.angle);y=ox*Math.sin(part.angle)+y*Math.cos(part.angle);}
   const p=project([x+part.p[0]+part.explode[0]*spread,y+part.p[1]+part.explode[1]*spread,z+part.p[2]+part.explode[2]*spread]);vertices.push(p);points.push(p);
  }
  // Original planar handle rings belong to the blade–handle group.
  if(part.handle_ring){
   const ringPoint=(t,inner)=>{
    let x=Math.cos(t)*(inner ? .22 : .34),y=-1.9+Math.sin(t)*(inner ? .30 : .43);
    const ox=x;x=x*Math.cos(part.angle)-y*Math.sin(part.angle);y=ox*Math.sin(part.angle)+y*Math.cos(part.angle);
    const v=project([x+part.p[0]+part.explode[0]*spread,y+part.p[1]+part.explode[1]*spread,part.p[2]+part.size[2]/2+part.explode[2]*spread]);points.push(v);return v;
   };
   for(let i=0;i<32;i++){
    const a=i*Math.PI/16,b=(i+1)*Math.PI/16,pts=[ringPoint(a,false),ringPoint(b,false),ringPoint(b,true),ringPoint(a,true)];
    faces.push({part,pts,depth:pts.reduce((v,p)=>v+p[2],0)/4,fill:part.color});
   }
  }
  [[0,1,3,2],[4,6,7,5],[0,4,5,1],[2,3,7,6],[0,2,6,4],[1,5,7,3]].forEach((ids,i)=>faces.push({part,pts:ids.map(n=>vertices[n]),depth:ids.reduce((v,n)=>v+vertices[n][2],0)/4,fill:shade(part.color,[.83,1,.72,1.13,.88,.98][i])}));
 });
 const cx=(Math.min(...points.map(p=>p[0]))+Math.max(...points.map(p=>p[0])))/2,cy=(Math.min(...points.map(p=>p[1]))+Math.max(...points.map(p=>p[1])))/2;
 const width=viewport?.width||640,height=viewport?.height||400,ox=width/2,oy=height*.48;
 const spanX=Math.max(...points.map(p=>p[0]))-Math.min(...points.map(p=>p[0])),spanY=Math.max(...points.map(p=>p[1]))-Math.min(...points.map(p=>p[1]));
 const scale=viewport?Math.min((width-80)/spanX,(height-70)/spanY):76, screen=p=>`${(ox+(p[0]-cx)*scale).toFixed(2)},${(oy+(p[1]-cy)*scale).toFixed(2)}`;
 faces.sort((a,b)=>a.depth-b.depth);
 // Render the selected relationship over faded context, so a hidden guide is visible.
 if(highlight.length)faces.sort((a,b)=>(role(a.part.id)<0?0:role(a.part.id)===0?2:1)-(role(b.part.id)<0?0:role(b.part.id)===0?2:1));
 const badges=highlight.map((id,i)=>{
  const part=sample.parts.find(p=>p.id===id),point=project(part.p.map((v,k)=>v+part.explode[k]*spread));
  const px=ox+(point[0]-cx)*scale,py=oy+(point[1]-cy)*scale,bx=Math.max(18,Math.min(width-18,px+(i===0?-32:32))),by=Math.max(18,Math.min(height-18,py+(i===0?-26:26))),color=roleColor(id);
  return `<g pointer-events="none" aria-hidden="true"><line x1="${px}" y1="${py}" x2="${bx}" y2="${by}" stroke="${color}" stroke-width="1.5"/><circle cx="${bx}" cy="${by}" r="15" fill="${color}" stroke="white" stroke-width="2"/><text x="${bx}" y="${by+4.5}" text-anchor="middle" font-family="ShowcaseInter, sans-serif" font-size="14" font-weight="600" fill="white">${i===0?'A':'B'}</text></g>`;
 }).join('');
 const names=highlight.map(id=>sample.parts.find(p=>p.id===id).name).join(' and ');
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHTML(sample.name)}: original conceptual part geometry${names?'; highlighted: '+escapeHTML(names):''}"><ellipse cx="${ox}" cy="${height*.91}" rx="${width*.21}" ry="${height*.035}" fill="#203f2c" opacity=".045"/>${faces.map(f=>{
  const index=role(f.part.id),active=index>=0,inspect=inspected===f.part.id;
  return `<polygon class="part-face" data-part="${f.part.id}" data-relation-role="${active?index===0?'A':'B':'context'}" points="${f.pts.map(screen).join(' ')}" fill="${active?roleColor(f.part.id):f.fill}" stroke="${inspect?'#172d25':active?shade(roleColor(f.part.id),.72):'#52675d'}" stroke-width="${inspect?3:active?1.5:.55}" stroke-dasharray="${inspect?'5 2':'none'}" stroke-linejoin="round" opacity="${highlight.length && !active && !inspect ? .13 : 1}"><title>${escapeHTML(f.part.name)}${active?' · relationship part '+(index===0?'A':'B'):''}</title></polygon>`;
 }).join('')}${badges}</svg>`;
}
function renderObject(){
 const r=current.relations[relationIndex];
 $('object-view').innerHTML=draw(current,angle,exploded,[r.from,r.to],selected,{width:$('object-view').clientWidth,height:$('object-view').clientHeight});
 $('parts').querySelectorAll('button').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.part===selected));b.dataset.relationRole=b.dataset.part===r.from?'A':b.dataset.part===r.to?'B':'context';});
 $('part-status').textContent=selected?`Inspecting: ${current.parts.find(p=>p.id===selected).name} · Part ID: ${selected}. A + B remain highlighted.`:'Select a part to inspect it. A + B identify the current relationship.';
 $('toggle-explode').setAttribute('aria-pressed',String(exploded>0));$('toggle-explode').textContent=exploded>0?'Assemble parts':'Explode parts';
}
const plainRelations={
 cabinet:['The rail keeps the drawer moving along a straight path.','The side panel helps carry the top panel’s load.'],
 chair:['The attached leg carries part of the seat’s load to the floor.','The backrest gives a seated person something to lean against.'],
 table:['The leg helps hold the tabletop above the floor.','The connecting apron helps keep the leg from moving sideways.'],
 door:['The hinge holds the panel while letting it swing.','The handle gives a person a place to grip and move the panel.'],
 scissors:['The pivot holds the blades together while allowing them to turn.','The two aligned cutting edges work together as the blades close.']
};
const relationTitles={
 cabinet:['Rail guides drawer','Side panel supports top'],
 chair:['Leg supports seat','Backrest supports the sitter'],
 table:['Leg supports tabletop','Apron steadies leg'],
 door:['Hinge lets panel swing','Handle helps move panel'],
 scissors:['Pivot lets blade turn','Blades work together to cut']
};
// Stable part/type keys survive reordering and display-copy edits.
const relationKey=r=>`${r.from}~${r.to}~${r.type}`;
function syncExplorerURL(focusExplorer=true){
 const url=new URL(location.href);url.searchParams.set('object',current.id);url.searchParams.set('relation',relationKey(current.relations[relationIndex]));
 if(focusExplorer)url.hash='samples';
 history.replaceState(null,'',url);
}
function restoreExplorerURL(){
 const params=new URLSearchParams(location.search);
 setSample(params.get('object'),false,params.get('relation'));
 if(params.has('object')||params.has('relation'))syncExplorerURL(false);
}
function relationSummary(){return plainRelations[current.id][relationIndex];}
function renderStory(){
 const r=current.relations[relationIndex];
 $('story-text').textContent=story==='parts'?relationSummary():story==='conditions'?r.conditions:`Conditional prediction: ${r.intervention}`;
 $('story-text').dataset.story=story;
 document.querySelectorAll('button[data-story]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.story===story)));
}
function renderRelation(){
 const r=current.relations[relationIndex];
 $('relation-from').textContent=current.parts.find(p=>p.id===r.from).name;$('relation-to').textContent=current.parts.find(p=>p.id===r.to).name;
 $('object-summary').textContent=relationSummary();
 $('mechanism-title').textContent=r.type.replaceAll('_',' ').replace(/^./,c=>c.toUpperCase());
 ['mechanism','conditions','result','intervention'].forEach(id=>$(id).textContent=r[id]);renderStory();
}

function renderTask(){ $('task-answer').textContent=current.tasks[task];$('task-answer').setAttribute('aria-labelledby',`tab-${task}`);document.querySelectorAll('[data-task]').forEach(b=>{b.setAttribute('aria-selected',String(b.dataset.task===task));b.tabIndex=b.dataset.task===task?0:-1;}); }
function setSample(id,updateURL=true,requestedRelation=null){
 current=samples.find(s=>s.id===id)||samples[0];selected=null;relationIndex=Math.max(0,current.relations.findIndex(r=>relationKey(r)===requestedRelation));story='parts';angle=-28;exploded=0;$('explode').value=0;$('rotation').value=-28;
 $('object-title').textContent=current.name;$('object-category').textContent=`${current.category.toUpperCase()} / ${current.parts.length} PART GROUPS`;$('mechanism-title').textContent=current.mechanism;$('object-summary').textContent=current.summary;$('relation-count').textContent=`${current.relations.length} relations`;$('download-label').textContent=`Download object JSON · ${current.relations.length} relations`;
 $('relation-select').innerHTML=current.relations.map((r,i)=>`<option value="${i}">${escapeHTML(relationTitles[current.id][i])}</option>`).join('');
 $('relation-select').value=String(relationIndex);
 $('parts').innerHTML=current.parts.map(p=>`<button data-part="${p.id}" aria-pressed="false">${escapeHTML(p.name)}</button>`).join('');
 $('download-status').textContent='';renderObject();renderRelation();renderTask();renderCatalog();
 if(updateURL)syncExplorerURL();
}
function renderCatalog(){
 const filtered=samples.filter(s=>(category==='All'||s.category===category)&&`${s.name} ${s.category} ${s.mechanism}`.toLowerCase().includes(query.toLowerCase()));
 $('catalog').innerHTML=filtered.map(s=>`<button class="object-card" data-object="${s.id}" aria-label="Explore ${escapeHTML(s.name)}" aria-pressed="${s.id===current.id}">${draw(s,-28,.12)}<span class="card-caption"><strong>${escapeHTML(s.name)}</strong><span>${s.parts.length} part groups · ${escapeHTML(s.category)}</span></span></button>`).join('');$('empty').hidden=filtered.length>0;
}
document.querySelector('.filters').innerHTML=['All',...new Set(samples.map(s=>s.category))].map(c=>`<button data-category="${c}" aria-pressed="${c==='All'}">${c==='All'?'All objects':c}</button>`).join('');
document.querySelector('.filters').addEventListener('click',e=>{const b=e.target.closest('[data-category]');if(!b)return;category=b.dataset.category;document.querySelector('.filter-disclosure').open=false;document.querySelectorAll('[data-category]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.category===category)));renderCatalog();});
$('search').addEventListener('input',e=>{query=e.target.value;document.querySelector('.filter-disclosure').open=false;renderCatalog();});
$('clear-search').addEventListener('click',()=>{$('search').value='';query='';document.querySelector('[data-category="All"]').click();$('search').focus();});
$('catalog').addEventListener('click',e=>{const b=e.target.closest('[data-object]');if(b){const id=b.dataset.object;setSample(id);$('catalog').querySelector(`[data-object="${id}"]`)?.focus({preventScroll:true});}});
$('parts').addEventListener('click',e=>{const b=e.target.closest('[data-part]');if(b){selected=selected===b.dataset.part?null:b.dataset.part;renderObject();}});
$('relation-select').addEventListener('change',e=>{relationIndex=Number(e.target.value);selected=null;story='parts';renderRelation();renderObject();syncExplorerURL();});
document.querySelector('.story-steps').addEventListener('click',e=>{const b=e.target.closest('button[data-story]');if(b){story=b.dataset.story;renderStory();}});
$('toggle-explode').addEventListener('click',()=>{exploded=exploded>0?0:1;$('explode').value=exploded*100;renderObject();});
$('explode').addEventListener('input',e=>{exploded=Number(e.target.value)/100;renderObject();});
$('rotation').addEventListener('input',e=>{angle=Number(e.target.value);renderObject();});
$('reset-view').addEventListener('click',()=>{selected=null;angle=-28;exploded=0;$('explode').value=0;$('rotation').value=-28;renderObject();});
let pointer=null;
$('object-view').addEventListener('pointerdown',e=>{if(e.button!==0)return;pointer={id:e.pointerId,x:e.clientX,y:e.clientY,angle,part:e.target.closest('[data-part]')?.dataset.part,moved:false};$('object-view').setPointerCapture(e.pointerId);});
$('object-view').addEventListener('pointermove',e=>{if(!pointer||pointer.id!==e.pointerId)return;const dx=e.clientX-pointer.x;if(Math.abs(dx)>5)pointer.moved=true;if(pointer.moved){angle=((pointer.angle+dx*.55+540)%360)-180;$('rotation').value=angle;renderObject();}});
$('object-view').addEventListener('pointerup',e=>{if(!pointer||pointer.id!==e.pointerId)return;if(!pointer.moved&&pointer.part){selected=selected===pointer.part?null:pointer.part;$('advanced-view').open=true;renderObject();}pointer=null;});
$('object-view').addEventListener('pointercancel',()=>pointer=null);
document.querySelector('.task-tabs').addEventListener('click',e=>{const b=e.target.closest('[data-task]');if(b){task=b.dataset.task;renderTask();}});
document.querySelector('.task-tabs').addEventListener('keydown',e=>{const buttons=[...document.querySelectorAll('[data-task]')],i=buttons.indexOf(document.activeElement);if(i<0)return;let next=i;if(e.key==='ArrowRight')next=(i+1)%4;else if(e.key==='ArrowLeft')next=(i+3)%4;else if(e.key==='Home')next=0;else if(e.key==='End')next=3;else return;e.preventDefault();buttons[next].click();buttons[next].focus();});
$('download').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(record(current),null,2)+'\n'],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`eviassembly-${current.id}-illustrative.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('download-status').textContent='Sample exported with provenance and review status.';});
$('hero-object').innerHTML=draw(samples[0],-30,.6);
restoreExplorerURL();
window.addEventListener('popstate',()=>{
 const params=new URLSearchParams(location.search);
 if(params.get('object')!==current.id||params.get('relation')!==relationKey(current.relations[relationIndex]))restoreExplorerURL();
});

const filterDisclosure=document.querySelector('.filter-disclosure');
document.addEventListener('click',e=>{if(!filterDisclosure.contains(e.target))filterDisclosure.open=false;});
filterDisclosure.addEventListener('keydown',e=>{if(e.key==='Escape'){filterDisclosure.open=false;filterDisclosure.querySelector('summary').focus();}});

// Consistent same-page navigation, with an accessible mobile menu.
const menu=$('menu-toggle'),nav=$('main-nav');
function closeMenu(){menu.setAttribute('aria-expanded','false');nav.removeAttribute('data-open');}
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.toggleAttribute('data-open',open);});
nav.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.getAttribute('aria-expanded')==='true'){closeMenu();menu.focus();}});
document.addEventListener('click',e=>{if(!e.target.closest('.header'))closeMenu();});
window.matchMedia('(max-width: 740px)').addEventListener('change',closeMenu);
const sections=[...document.querySelectorAll('main>section[id]')];
const observer=new IntersectionObserver(entries=>{
 const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);
 if(visible[0])nav.querySelectorAll('a').forEach(a=>{if(a.hash==='#'+visible[0].target.id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
},{rootMargin:'-15% 0px -65% 0px',threshold:0});sections.forEach(s=>observer.observe(s));

// One public email contact; no enquiry form or submission endpoint.
if(contactEmail&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)){
 $('contact-address').textContent=contactEmail;
 $('contact-address').href=`mailto:${contactEmail}`;
 $('contact-instructions').textContent=contactEmail.endsWith('.example')?'Preview address only — this inbox cannot receive email. Our real contact address will be added before launch.':'Email us to discuss your objects, data needs and next steps.';
}

// Readable mobile defaults: optional record and service details stay expandable.
const mobileDetails=window.matchMedia('(max-width: 740px)');
function setDetailDefaults(){document.querySelectorAll('.responsive-details').forEach(el=>el.open=!mobileDetails.matches);}
setDetailDefaults();mobileDetails.addEventListener('change',setDetailDefaults);

new ResizeObserver(()=>renderObject()).observe($('object-view'));
$('copy-email').hidden=false;
$('copy-email').addEventListener('click',async()=>{
 const email=$('contact-address').textContent;
 try{
  if(!navigator.clipboard?.writeText)throw new Error('Clipboard unavailable');
  await navigator.clipboard.writeText(email);
  $('copy-status').textContent='Email address copied.';
 }catch{
  // HTTP previews may not expose Clipboard API. Select the visible address instead.
  const selection=window.getSelection(),range=document.createRange();range.selectNodeContents($('contact-address'));selection.removeAllRanges();selection.addRange(range);
  let copied=false;try{copied=document.execCommand('copy');}catch{}
  $('copy-status').textContent=copied?'Email address copied.':'Email address selected. Copy it using your browser’s Copy command.';
 }
});

// The comparison always shows the cabinet relation, independently of the explorer selection.
const caseModel=$('case-model');
function renderCaseModel(){const cabinet=samples.find(s=>s.id==='cabinet'),r=cabinet.relations[0];caseModel.innerHTML=draw(cabinet,-28,0,[r.from,r.to],null,{width:caseModel.clientWidth,height:caseModel.clientHeight});}
new ResizeObserver(renderCaseModel).observe(caseModel);renderCaseModel();
