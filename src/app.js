import './exhibition.css';
import './pages.css';
import './regions.css';
import {EMOTIONS} from './emotion-content.js';
import {REFERENCES,studyLinks} from './research.js';
import {PARTS,REGIONS} from './region-content.js';
import {MODELS} from './model-registry.js';
const $=s=>document.querySelector(s);
const current=document.body.dataset.emotion||'alegria';
let viewer=null,lastPart=null;
if($('#emotion-title')){
 const d=EMOTIONS[current],m=MODELS[current];
 $('#emotion-title').textContent=d.name;$('#emotion-subtitle').textContent=d.subtitle;
 for(const field of ['definition','function','triggers','body','example','regulation','thoughts','behaviors','expression','practice'])$('#'+field).innerHTML=d[field];
 $('#piece-state').textContent=m.state;$('#character-name').textContent=m.character;
 $('.gallery').setAttribute('aria-label','Exploración tridimensional de '+m.character);
 $('#load-status').textContent='Preparando la pieza…';
 $('#academic-portrait').src=m.portrait;$('#academic-portrait').alt='Rostro de '+m.character+' en la pose de '+d.name.toLowerCase();
}
function showDetail(part){
 lastPart=part||lastPart;
 const active=Boolean(part);
 $('#overview-panel').hidden=active;$('#focus-detail').hidden=!active;
 $('#panel-general').setAttribute('aria-pressed',String(!active));$('#panel-region').setAttribute('aria-pressed',String(active));
 $('#panel-region').disabled=!lastPart;
 document.querySelectorAll('[data-focus]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.focus===part)));
 if(!active)return;
 const detail=REGIONS[current][part];
 $('#focus-title').textContent=PARTS[part].title;$('#region-emotion').textContent=EMOTIONS[current].name+' · '+PARTS[part].title;
 $('#region-observation').textContent=detail.observation;$('#focus-text').textContent=detail.meaning;
 $('#region-question').textContent=detail.question;$('#region-sources').innerHTML=studyLinks(detail.refs);
 $('#detail-status').textContent='Panel actualizado: '+EMOTIONS[current].name+', '+PARTS[part].title;
 const article=$('#ficha');if(matchMedia('(max-width:760px)').matches||article.getBoundingClientRect().top< -150)article.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
}
if($('#panel-general')){
 $('#panel-general').onclick=()=>showDetail(null);
 $('#panel-region').onclick=()=>{if(lastPart)showDetail(lastPart);};
}
if($('#bibliography'))$('#bibliography').innerHTML=REFERENCES.map(([id,label,text,url,note])=>'<li id="ref-'+id+'">'+text+' <a href="'+url+'" target="_blank" rel="noreferrer">'+url+'</a><p class="source-scope"><strong>Qué aporta y qué limita:</strong> '+note+'</p></li>').join('');
const flower='<svg viewBox="0 0 100 100"><path d="M50 24C28-10 2 28 29 39C-9 41 9 79 36 65C24 104 68 110 65 73C92 102 116 64 80 51C120 27 78-3 66 30C69 0 39-1 50 24Z"/><circle cx="53" cy="49" r="7"/></svg>';
const floral=$('.floral-field');
if(floral)[[43,24,290],[29,56,54],[66,33,55],[18,68,45],[74,64,65],[83,15,47],[34,13,35],[57,73,32],[7,25,34],[91,77,31]].forEach(([x,y,s],i)=>{const wrap=document.createElement('div');wrap.innerHTML=flower;const svg=wrap.firstChild;svg.style.cssText=`left:${x}%;top:${y}%;width:${s}px;transform:rotate(${i*37}deg)`;floral.append(svg);});
const help=$('#help');$('#help-open').onclick=()=>help.showModal();$('#help-close').onclick=$('#help-done').onclick=()=>help.close();
help.addEventListener('click',e=>{if(e.target===help){const r=help.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)help.close();}});
const menu=$('#mobile-menu'),toggle=$('#menu-toggle');toggle.onclick=()=>{const open=menu.hidden;menu.hidden=!open;toggle.setAttribute('aria-expanded',open);toggle.setAttribute('aria-label',open?'Cerrar navegación':'Abrir navegación');};
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){menu.hidden=true;toggle.setAttribute('aria-expanded',false);toggle.focus();}});
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
if(!reduced){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}}),{threshold:.08});document.querySelectorAll('.reveal').forEach(node=>{node.classList.add('will-reveal');observer.observe(node);});}
if($('.cover-art')&&!reduced&&matchMedia('(pointer:fine)').matches){$('.cover').addEventListener('pointermove',e=>{const r=e.currentTarget.getBoundingClientRect();$('.cover-art').style.setProperty('--parallax',`${(e.clientX/r.width-.5)*9}px`);});$('.cover').addEventListener('pointerleave',()=>$('.cover-art').style.setProperty('--parallax','0px'));}
if($('#viewer')){
 try{const {createViewer}=await import('./viewer.js');viewer=await createViewer($('#viewer'),showDetail,{...MODELS[current],emotion:current});}
 catch(error){console.error('No se pudo cargar la pieza:',error);$('#load-status').textContent='La pieza 3D no pudo cargarse. La ficha académica sigue disponible. Recarga para volver a intentarlo.';$('#load-progress').hidden=true;document.querySelectorAll('[data-focus],.camera-toolbar button').forEach(b=>b.disabled=true);}
}

if(location.hash){const target=document.getElementById(decodeURIComponent(location.hash.slice(1)));if(target){let node=target.parentElement;while(node){if(node.tagName==='DETAILS')node.open=true;node=node.parentElement;}requestAnimationFrame(()=>target.scrollIntoView());}}
