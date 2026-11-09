import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {PARTS} from './region-content.js';

export async function createViewer(host, onDetail, config) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement; host.append(canvas);
  canvas.tabIndex = 0; canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', config.character+'. Modelo tridimensional. Pulsa una zona para leer su explicación. Flechas para girar, Mayús y flechas para desplazar, más y menos para zoom, Inicio para restablecer.');
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1,1,1,-1,.01,50);
  camera.position.set(0,.95,5);
  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0,.95,0); controls.enableDamping=true; controls.dampingFactor=.085;
  controls.rotateSpeed=.65; controls.zoomSpeed=.65; controls.panSpeed=.65;
  controls.minZoom=.65; controls.maxZoom=10; controls.minPolarAngle=.18; controls.maxPolarAngle=Math.PI-.18;
  controls.touches.ONE=THREE.TOUCH.ROTATE; controls.touches.TWO=THREE.TOUCH.DOLLY_PAN;
  let model, frame=false, flight=null, enabled=true, visible=true, lastPart=null, dwell=null, hideTimer=null, dragging=false, pointerDown=null, clickTimer=null, pointerTravel=0;
  let viewHeight=2.02; const homeTarget=new THREE.Vector3(0,.95,0), homePosition=new THREE.Vector3(.12,1.01,5);
  const centers={rostro:new THREE.Vector3(0,1.60,.07),manoL:new THREE.Vector3(.25,1.46,.07),manoR:new THREE.Vector3(-.25,1.46,.07),torso:new THREE.Vector3(0,1.20,0),piernas:new THREE.Vector3(0,.49,0),postura:new THREE.Vector3(0,.95,0)};
  const gallery=host.closest('.gallery'), card=document.querySelector('#hotspot-card');
  const meshes=[]; const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();
  function draw(){
    if(frame||!visible||document.hidden)return;
    frame=true; requestAnimationFrame((now)=>{frame=false;
      if(flight){const t=Math.min(1,(now-flight.start)/flight.duration),e=1-Math.pow(1-t,3); camera.position.lerpVectors(flight.from,flight.to,e);controls.target.lerpVectors(flight.oldTarget,flight.target,e);camera.zoom=THREE.MathUtils.lerp(flight.oldZoom,flight.zoom,e);camera.updateProjectionMatrix();if(t===1)flight=null;}
      controls.update();renderer.render(scene,camera);if(flight)draw();
    });
  }
  controls.addEventListener('change',draw);
  controls.addEventListener('start',()=>{flight=null;hideCard();});
  function resize(){const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);const aspect=w/h;viewHeight=Math.max(2.02,1.05/aspect);camera.left=-viewHeight*aspect/2;camera.right=viewHeight*aspect/2;camera.top=viewHeight/2;camera.bottom=-viewHeight/2;camera.updateProjectionMatrix();renderer.setSize(w,h,false);draw();}
  new ResizeObserver(resize).observe(host);
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)draw();}).observe(host);
  document.addEventListener('visibilitychange',draw);
  function announce(text){document.querySelector('#camera-status').textContent=text;}
  function go(target,position,zoom,label){flight={from:camera.position.clone(),to:position.clone(),oldTarget:controls.target.clone(),target:target.clone(),oldZoom:camera.zoom,zoom:THREE.MathUtils.clamp(zoom,.65,10),start:performance.now(),duration:reduced?1:760};announce(label);draw();}
  function reset(){hideCard();go(homeTarget,homePosition,1,'Vista general');onDetail(null);}
  function focus(part){if(!model||!enabled||!PARTS[part])return;const center=centers[part];let offset=part==='manoL'?new THREE.Vector3(.18,.05,3):part==='manoR'?new THREE.Vector3(-.18,.05,3):new THREE.Vector3(0,.02,3);if(config.emotion==='enojo'&&part==='manoL')offset.set(-2,.15,2);go(center,center.clone().add(offset),viewHeight/PARTS[part].height,PARTS[part].title);hideCard();onDetail(part);}
  function hit(event){if(!model||!enabled)return null;const b=canvas.getBoundingClientRect();pointer.set((event.clientX-b.left)/b.width*2-1,-(event.clientY-b.top)/b.height*2+1);ray.setFromCamera(pointer,camera);return ray.intersectObjects(meshes,false)[0]||null;}
  function partFor(h){if(!h)return null;const n=h.object.material.name;
    if(/Head|Hair|Hat|Glasses/i.test(n))return 'rostro';
    const left=h.point.distanceTo(centers.manoL),right=h.point.distanceTo(centers.manoR);
    if(/Gloves/i.test(n)||(/Body/i.test(n)&&Math.min(left,right)<.17))return left<right?'manoL':'manoR';
    if(/Pantyhose|Shoes|Skirt/i.test(n)||h.point.y<.88)return 'piernas';
    return 'torso';
  }
  function hideCard(){clearTimeout(dwell);clearTimeout(hideTimer);dwell=null;lastPart=null;card.hidden=true;}
  function showCard(part,x,y){const rect=gallery.getBoundingClientRect();card.hidden=false;document.querySelector('#hotspot-title').textContent=PARTS[part].title;document.querySelector('#hotspot-summary').textContent=PARTS[part].short;card.style.left=`${Math.max(12,Math.min(x-rect.left+18,rect.width-card.offsetWidth-12))}px`;card.style.top=`${Math.max(40,Math.min(y-rect.top-30,rect.height-card.offsetHeight-140))}px`;card.dataset.part=part;}
  canvas.addEventListener('pointermove',e=>{if(pointerDown)pointerTravel=Math.max(pointerTravel,Math.hypot(e.clientX-pointerDown.x,e.clientY-pointerDown.y));if(dragging||e.pointerType==='touch')return;const p=partFor(hit(e));if(p===lastPart)return;hideCard();lastPart=p;if(p)dwell=setTimeout(()=>showCard(p,e.clientX,e.clientY),650);});
  canvas.addEventListener('pointerleave',()=>{clearTimeout(dwell);hideTimer=setTimeout(hideCard,180);});
  card.addEventListener('pointerenter',()=>clearTimeout(hideTimer));card.addEventListener('pointerleave',hideCard);
  document.querySelector('#hotspot-focus').addEventListener('click',()=>focus(card.dataset.part));
  canvas.addEventListener('pointerdown',e=>{dragging=true;pointerTravel=0;pointerDown={x:e.clientX,y:e.clientY,time:performance.now()};hideCard();});
  canvas.addEventListener('pointerup',e=>{dragging=false;if(e.button===0&&pointerDown&&pointerTravel<7&&performance.now()-pointerDown.time<700){const p=partFor(hit(e));if(p){clearTimeout(clickTimer);clickTimer=setTimeout(()=>focus(p),240);}}pointerDown=null;});
  canvas.addEventListener('pointercancel',()=>{dragging=false;pointerDown=null;});
  canvas.addEventListener('dblclick',e=>{clearTimeout(clickTimer);const h=hit(e);if(!h)return;const direction=camera.position.clone().sub(controls.target).normalize();go(h.point,h.point.clone().addScaledVector(direction,3),Math.min(8,Math.max(3,camera.zoom*1.7)),'Detalle de la superficie seleccionada');const p=partFor(h);if(p)onDetail(p);});
  function orbit(angle){const v=camera.position.clone().sub(controls.target);v.applyAxisAngle(new THREE.Vector3(0,1,0),angle);go(controls.target,controls.target.clone().add(v),camera.zoom,'Cámara girada');}
  function pan(x,y){const scale=viewHeight/camera.zoom*.09;const right=new THREE.Vector3().setFromMatrixColumn(camera.matrix,0),up=new THREE.Vector3().setFromMatrixColumn(camera.matrix,1);const offset=right.multiplyScalar(x*scale).addScaledVector(up,y*scale);go(controls.target.clone().add(offset),camera.position.clone().add(offset),camera.zoom,'Cámara desplazada');}
  function action(name){if(!enabled)return;if(name==='reset')reset();else if(name==='left')orbit(-Math.PI/9);else if(name==='right')orbit(Math.PI/9);else if(name==='in'||name==='out')go(controls.target,camera.position,camera.zoom*(name==='in'?1.25:.8),name==='in'?'Acercamiento':'Alejamiento');else if(name==='pan'){const active=controls.mouseButtons.LEFT!==THREE.MOUSE.PAN;controls.mouseButtons.LEFT=active?THREE.MOUSE.PAN:THREE.MOUSE.ROTATE;controls.touches.ONE=active?THREE.TOUCH.PAN:THREE.TOUCH.ROTATE;document.querySelector('[data-camera="pan"]').setAttribute('aria-pressed',active);announce(active?'Arrastra para desplazar':'Arrastra para girar');}else if(name==='full'){if(document.fullscreenElement)document.exitFullscreen();else gallery.requestFullscreen?.().catch(()=>announce('Pantalla completa no disponible'));}}
  canvas.addEventListener('keydown',e=>{if(!enabled)return;const k=e.key;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','Home'].includes(k))e.preventDefault();if(k==='Home')reset();else if(k==='+'||k==='=')action('in');else if(k==='-')action('out');else if(k.startsWith('Arrow')){if(e.shiftKey)pan(k==='ArrowLeft'?-1:k==='ArrowRight'?1:0,k==='ArrowUp'?1:k==='ArrowDown'?-1:0);else if(k==='ArrowLeft'||k==='ArrowRight')orbit(k==='ArrowLeft'?-.18:.18);else{const v=camera.position.clone().sub(controls.target);const spherical=new THREE.Spherical().setFromVector3(v);spherical.phi=THREE.MathUtils.clamp(spherical.phi+(k==='ArrowUp'?-.15:.15),.18,Math.PI-.18);go(controls.target,controls.target.clone().add(new THREE.Vector3().setFromSpherical(spherical)),camera.zoom,'Cámara inclinada');}}});
  document.querySelectorAll('[data-camera]').forEach(b=>b.addEventListener('click',()=>action(b.dataset.camera)));
  document.querySelectorAll('[data-focus]').forEach(b=>b.addEventListener('click',()=>focus(b.dataset.focus)));
  resize();controls.update();
  const url=config.url;
  const gltf=await new GLTFLoader().loadAsync(url,event=>{if(event.total)document.querySelector('#load-progress').value=event.loaded/event.total*100;});
  model=gltf.scene;
  model.traverse(o=>{if(!o.isMesh)return;const convert=mat=>{
    const result=new THREE.MeshBasicMaterial({name:mat.name,map:mat.emissiveMap||mat.map,color:mat.emissiveMap?mat.emissive:mat.color,side:mat.name.endsWith('_OUTLINE')?THREE.FrontSide:mat.side,toneMapped:false,transparent:mat.transparent,opacity:mat.opacity,depthWrite:!mat.transparent});
    if(mat.name.includes('Glasses_WEB_RADIANCE'))result.depthWrite=true;
    if(result.map)result.map.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
    if(mat.name.includes('Head_WEB_OUTLINE'))return new THREE.ShaderMaterial({name:mat.name,side:THREE.FrontSide,transparent:true,depthWrite:false,uniforms:{ink:{value:result.color}},vertexShader:'varying vec3 vN; varying vec3 vV; void main(){ vec4 p=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=-p.xyz;gl_Position=projectionMatrix*p;}',fragmentShader:`uniform vec3 ink; varying vec3 vN; varying vec3 vV;
      void main(){float c=abs(dot(normalize(vN),normalize(vV)));float eta=1./.95;float g=sqrt(max(0.,eta*eta-1.+c*c));float a=(g-c)/(g+c);float b=(c*(g+c)-1.)/(c*(g-c)+1.);float f=.5*a*a*(1.+b*b);gl_FragColor=vec4(ink,clamp(f/.154546,0.,1.));
      #include <colorspace_fragment>
      }`});
    return result;
  };o.material=Array.isArray(o.material)?o.material.map(convert):convert(o.material);const mats=Array.isArray(o.material)?o.material:[o.material];if(!mats.every(m=>m.name.endsWith('_OUTLINE')))meshes.push(o);});
  scene.add(model);scene.updateMatrixWorld(true);
  const handBounds={L:new THREE.Box3(),R:new THREE.Box3()};
  for(const m of meshes){if(!/Gloves/i.test(m.material.name))continue;const p=m.geometry.attributes.position;for(let i=0;i<p.count;i++){const v=new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(m.matrixWorld);handBounds[v.x>0?'L':'R'].expandByPoint(v);}}
  for(const side of ['L','R'])if(!handBounds[side].isEmpty())handBounds[side].getCenter(centers[`mano${side}`]);
  if(config.emotion!=='alegria'){
    const response=await fetch(`/emotions/${config.emotion}/landmarks.json`);if(!response.ok)throw Error('Missing model landmarks');
    const landmarks=await response.json();for(const [key,value] of Object.entries(landmarks))if(centers[key])centers[key].fromArray(value);
  }
  document.querySelector('.viewer-loading').hidden=true;canvas.dataset.ready='true';reset();
  const api={setEnabled(value){enabled=value;model.visible=value;controls.enabled=value;canvas.tabIndex=value?0:-1;canvas.setAttribute('aria-hidden',!value);hideCard();draw();},focus,reset};
  if(import.meta.env.DEV||new URLSearchParams(location.search).has('qa'))window.__ATLAS_TEST__={
    ready:true,renderer,scene,camera,controls,model,centers,focus,reset,draw,
    metrics(){return{meshes:meshes.length,triangles:renderer.info.render.triangles,textures:renderer.info.memory.textures,bounds:new THREE.Box3().setFromObject(model),zoom:camera.zoom,target:controls.target.toArray(),position:camera.position.toArray(),materials:meshes.map(m=>({name:m.name,material:m.material.name,map:!!m.material.map}))};},
    project(part){const p=centers[part].clone().project(camera),r=canvas.getBoundingClientRect();return{x:r.left+(p.x+1)*r.width/2,y:r.top+(1-p.y)*r.height/2};},
    capture({angle=0,target=[0,.95,0],height=2.1,width=768,pixels=1024}={}){flight=null;controls.enableDamping=false;const t=new THREE.Vector3(...target);controls.target.copy(t);camera.position.copy(t).add(new THREE.Vector3(Math.sin(angle)*5,0,Math.cos(angle)*5));camera.zoom=1;camera.left=-height*width/pixels/2;camera.right=-camera.left;camera.top=height/2;camera.bottom=-height/2;camera.updateProjectionMatrix();controls.update();renderer.setPixelRatio(1);renderer.setSize(width,pixels,false);renderer.render(scene,camera);return canvas.toDataURL('image/png');},
  };
  return api;
}
