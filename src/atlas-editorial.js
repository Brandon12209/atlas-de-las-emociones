import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EMOTIONS } from './atlas-content.js';

/*
 * PGI | ATLAS EDITORIAL V0.4
 * El GLB V2 ya contiene color y detalles horneados.
 * Este visor no altera sus imágenes ni añade iluminación artificial.
 * No utiliza MToon ni EffectComposer ni modelos externos.
 */
const MODEL_URL = '/models/MITA_V2_TEST.glb';
const gallery = document.querySelector('.gallery');
const host = document.querySelector('#pgi-viewer');
const fallback = document.querySelector('#fallback-imagen');
const status = document.querySelector('#viewer-status');
const handCard = document.querySelector('#hand-card');
const marker = document.querySelector('#hover-marker');
const handButton = document.querySelector('#hand-explore');
const detail = document.querySelector('#part-detail');
const detailTitle = document.querySelector('#detail-title');
const detailBody = document.querySelector('#detail-body');
const editorialPanel = document.querySelector('#panel-editorial');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMock = new URLSearchParams(window.location.search).has('mock');

let selectedEmotion = 'alegria';
let activePart = null;

function updateEmotion(key) {
  const item = EMOTIONS[key];
  if (!item) return;
  selectedEmotion = key;
  for (const tab of document.querySelectorAll('.emotion-tab')) {
    const isActive = tab.dataset.emotion === key;
    tab.classList.toggle('is-active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
  }
  const fields = {
    'emocion-titulo': item.name,
    'emocion-lead': item.lead,
    'numero-grande': item.index,
    'numero-emocion': item.index,
    'sala-numero': item.index,
    'interpretive-title': item.heading,
    'interpretive-body': item.interpretation,
    'info-definicion': item.definition,
    'info-funcion': item.function,
    'info-desencadenantes': item.triggers,
    'info-pensamientos': item.thoughts,
    'info-cuerpo': item.body,
    'info-conductas': item.behaviors,
    'info-regulacion': item.regulation,
    'info-ejemplo': item.example,
  };
  for (const [id, value] of Object.entries(fields)) {
    const node = document.getElementById(id);
    if (node) {
      // Conservar punto rojo decorativo del título.
      if (id === 'emocion-titulo') {
        node.replaceChildren(document.createTextNode(value));
        const period = document.createElement('span');
        period.className = 'hero-punct'; period.textContent = '.';
        node.appendChild(period);
      } else node.textContent = value;
    }
  }
  const availability = document.querySelector('#model-availability');
  availability.classList.toggle('is-pending', key !== 'alegria');
  availability.lastElementChild.textContent = key === 'alegria'
    ? 'PIEZA TRIDIMENSIONAL DISPONIBLE · ALEGRÍA'
    : 'PIEZA 3D PENDIENTE · SE MUESTRA REFERENCIA DE ALEGRÍA';
  if (key !== 'alegria') {
    detail.hidden = true;
    hideHandCard();
  }
}
document.querySelectorAll('.emotion-tab').forEach((b) => {
  b.addEventListener('click', () => updateEmotion(b.dataset.emotion));
});
document.querySelector('#close-detail').addEventListener('click', () => { detail.hidden = true; });

function showDetail(part, scroll = false) {
  const descriptions = {
    mano: ['La mano.', 'En esta representación de alegría, los brazos elevados y los dedos abiertos acompañan una postura expansiva. El gesto puede transmitir entusiasmo, aunque no demuestra por sí mismo qué siente una persona.'],
    cabeza: ['El rostro.', 'La sonrisa, la apertura de la boca y la dirección de la mirada ayudan a construir esta expresión de alegría. El pequeño tatuaje de lágrima forma parte del diseño original del personaje.'],
    torso: ['La postura.', 'El torso erguido y los hombros abiertos participan en la expresión corporal elegida para el modelo. Las emociones no tienen una postura única ni obligatoria.'],
    falda: ['El vestuario.', 'El uniforme es parte del diseño del personaje; no constituye un indicador psicológico ni permite inferir una emoción.'],
    piernas: ['Las piernas.', 'La flexión de ambas piernas sugiere el instante de un salto festivo. Es un recurso de representación visual, no una regla sobre la alegría.'],
  };
  const [title, body] = descriptions[part] || descriptions.torso;
  activePart = part;
  detailTitle.textContent = title;
  detailBody.textContent = body;
  detail.hidden = false;
  if (scroll) detail.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth', block: 'center' });
}

let scene, camera, renderer, controls, model;
let defaultCamera, defaultTarget, bounds, radius;
let visible = true;
let framePending = false;
let flight = null;
const raycaster = new THREE.Raycaster();
const normalizedPointer = new THREE.Vector2();
let handHoverTimer = null;
let hideTimer = null;
let handPoint = null;
let hoverX = 0;
let hoverY = 0;
let hoveringHand = false;

function hideHandCard() {
  if (handHoverTimer) clearTimeout(handHoverTimer);
  if (hideTimer) clearTimeout(hideTimer);
  handHoverTimer = null;
  hideTimer = null;
  hoveringHand = false;
  handCard.hidden = true;
  marker.style.display = 'none';
}
function scheduleHide() {
  if (hideTimer) clearTimeout(hideTimer);
  hideTimer = setTimeout(hideHandCard, 260);
}
handCard.addEventListener('pointerenter', () => { if (hideTimer) clearTimeout(hideTimer); });
handCard.addEventListener('pointerleave', hideHandCard);
handButton.addEventListener('click', () => {
  if (selectedEmotion !== 'alegria') updateEmotion('alegria');
  if (handPoint) focusPoint(handPoint);
  showDetail('mano', true);
  hideHandCard();
});

function draw() {
  if (!visible || document.hidden || framePending || !renderer) return;
  framePending = true;
  requestAnimationFrame((now) => {
    framePending = false;
    if (flight) {
      const t = THREE.MathUtils.clamp((now - flight.start) / flight.duration, 0, 1);
      const ease = t * t * (3 - 2 * t);
      camera.position.lerpVectors(flight.fromCamera, flight.toCamera, ease);
      controls.target.lerpVectors(flight.fromTarget, flight.toTarget, ease);
      camera.lookAt(controls.target);
      if (t >= 1) {
        flight = null;
        controls.enabled = true;
        controls.update();
      } else draw();
    } else controls.update();
    renderer.render(scene, camera);
  });
}
function flyTo(position, target, duration = 660) {
  if (!camera || !controls) return;
  if (reducedMotion) duration = 1;
  flight = {
    start: performance.now(), duration,
    fromCamera: camera.position.clone(), fromTarget: controls.target.clone(),
    toCamera: position.clone(), toTarget: target.clone(),
  };
  controls.enabled = false;
  draw();
}
function focusPoint(worldPoint) {
  if (!model || !bounds) return;
  // Limitar el centro de enfoque para evitar tomas intrusivas bajo la falda.
  const point = worldPoint.clone();
  const minSafeY = bounds.min.y + bounds.getSize(new THREE.Vector3()).y * .45;
  point.y = Math.max(point.y, minSafeY);
  const direction = camera.position.clone().sub(controls.target).normalize();
  const distance = Math.max(controls.minDistance * 1.1,
    Math.min(radius * 1.8, camera.position.distanceTo(point) * .62));
  flyTo(point.clone().addScaledVector(direction, distance), point, 650);
}
function focusHand() {
  if (!model || !bounds) return;
  let glove = null;
  model.traverse((obj) => {
    if (obj.isMesh && /glove/i.test(obj.name) && !glove) glove = obj;
  });
  if (!glove) return;
  // Bounding box incluye ambas manos. Enfocamos la derecha de la imagen.
  const b = new THREE.Box3().setFromObject(glove);
  const point = new THREE.Vector3(
    b.min.x * .1 + b.max.x * .9,
    b.min.y * .12 + b.max.y * .88,
    (b.min.z + b.max.z) * .5,
  );
  handPoint = point;
  focusPoint(point);
  showDetail('mano', true);
}
document.querySelector('#view-hand').addEventListener('click', () => {
  if (selectedEmotion !== 'alegria') updateEmotion('alegria');
  focusHand();
});
document.querySelector('#reset-view').addEventListener('click', () => {
  if (defaultCamera) flyTo(defaultCamera, defaultTarget, 700);
  detail.hidden = true;
  hideHandCard();
});

function classifyHit(hit) {
  let n = hit.object;
  let name = '';
  for (let i = 0; n && i < 4; i++, n = n.parent) name += ` ${n.name}`;
  if (/glove/i.test(name)) return 'mano';
  if (/head|hair|hat|face/i.test(name)) return 'cabeza';
  if (/skirt/i.test(name)) return 'falda';
  if (/pantyhose|shoe/i.test(name)) return 'piernas';
  if (/sweater|body/i.test(name)) return 'torso';
  return 'torso';
}
function getHit(event) {
  if (!model || !camera || !renderer) return null;
  const rect = renderer.domElement.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;
  normalizedPointer.set(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1,
  );
  raycaster.setFromCamera(normalizedPointer, camera);
  return raycaster.intersectObject(model, true).find((i) => i.object.visible) || null;
}
function positionCard() {
  const rect = gallery.getBoundingClientRect();
  const x = hoverX - rect.left;
  const y = hoverY - rect.top;
  const cardWidth = 290;
  const toLeft = x > rect.width * .55;
  handCard.style.left = `${Math.max(18, Math.min(rect.width - Math.min(cardWidth, rect.width - 36) - 18, x + (toLeft ? -cardWidth - 18 : 22)))}px`;
  handCard.style.top = `${Math.max(145, Math.min(rect.height - 138, y))}px`;
  marker.style.left = `${x}px`;
  marker.style.top = `${y}px`;
}
function registerHover(event) {
  if (selectedEmotion !== 'alegria' || event.pointerType === 'touch') return;
  hoverX = event.clientX;
  hoverY = event.clientY;
  const hit = getHit(event);
  if (hit && classifyHit(hit) === 'mano') {
    handPoint = hit.point.clone();
    if (!hoveringHand) {
      hideHandCard();
      hoveringHand = true;
      handHoverTimer = setTimeout(() => {
        if (!hoveringHand) return;
        positionCard();
        marker.style.display = 'block';
        handCard.hidden = false;
      }, 3000);
    }
    if (!handCard.hidden) positionCard();
    renderer.domElement.style.cursor = 'pointer';
  } else {
    // Mantener la tarjeta si el usuario está desplazándose del lienzo hacia ella.
    if (hoveringHand) scheduleHide();
    renderer.domElement.style.cursor = hit ? 'crosshair' : 'grab';
  }
}

function installInteractions() {
  renderer.domElement.addEventListener('pointermove', registerHover);
  renderer.domElement.addEventListener('pointerleave', scheduleHide);
  renderer.domElement.addEventListener('dblclick', (event) => {
    event.preventDefault();
    hideHandCard();
    if (selectedEmotion !== 'alegria') updateEmotion('alegria');
    const hit = getHit(event);
    if (!hit) return;
    const part = classifyHit(hit);
    focusPoint(hit.point);
    showDetail(part, false);
  });
  renderer.domElement.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'touch') return;
    const hit = getHit(event);
    if (hit && classifyHit(hit) === 'mano') {
      handPoint = hit.point.clone();
      showDetail('mano', false);
    }
  });
}

function convertToUnlit(source) {
  if (!source || source.isMeshBasicMaterial) return source;
  // Reutiliza exactamente la textura, filtro y colores del GLB V2.
  const output = new THREE.MeshBasicMaterial({
    name: source.name,
    color: source.color?.clone() || new THREE.Color(0xffffff),
    map: source.map || null,
    vertexColors: !!source.vertexColors,
    side: source.side,
    transparent: !!source.transparent,
    opacity: source.opacity,
    alphaTest: source.alphaTest,
    depthWrite: source.depthWrite,
    depthTest: source.depthTest,
    toneMapped: false,
    fog: false,
  });
  return output;
}

async function initViewer() {
  scene = new THREE.Scene();
  // La transparencia deja ver el fondo infinito diseñado en CSS.
  scene.background = null;
  camera = new THREE.PerspectiveCamera(40, 1, .015, 100);
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.shadowMap.enabled = false;
  renderer.domElement.setAttribute('aria-label', 'Modelo 3D de Mita: arrastrar para girar, doble clic para enfocar');
  host.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = .09;
  controls.enablePan = false;
  controls.enableZoom = true;
  controls.minPolarAngle = 0.12;
  controls.maxPolarAngle = Math.PI * .40; // Camara superior a 72 grados, sin angulo inferior.
  controls.rotateSpeed = .78;
  controls.zoomSpeed = .82;
  controls.addEventListener('change', draw);
  installInteractions();

  new ResizeObserver(() => {
    const w = Math.max(1, host.clientWidth);
    const h = Math.max(1, host.clientHeight);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    draw();
  }).observe(host);
  new IntersectionObserver(([entry]) => {
    visible = !!entry?.isIntersecting;
    if (visible) draw();
  }).observe(host);
  document.addEventListener('visibilitychange', draw);

  const loader = new GLTFLoader();
  loader.load(MODEL_URL, ({ scene: loaded }) => {
    model = loaded;
    const materialCache = new Map();
    model.traverse((obj) => {
      if (!obj.isMesh) return;
      const convert = (mat) => {
        if (!mat) return mat;
        if (!materialCache.has(mat.uuid)) materialCache.set(mat.uuid, convertToUnlit(mat));
        return materialCache.get(mat.uuid);
      };
      obj.material = Array.isArray(obj.material) ? obj.material.map(convert) : convert(obj.material);
      obj.castShadow = false;
      obj.receiveShadow = false;
    });
    scene.add(model);
    bounds = new THREE.Box3().setFromObject(model);
    if (bounds.isEmpty()) throw new Error('El GLB V2 no contiene geometría visible.');
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    radius = Math.max(size.length() * .5, .5);
    camera.near = Math.max(.008, radius * .008);
    camera.far = Math.max(30, radius * 30);
    camera.updateProjectionMatrix();
    controls.minDistance = Math.max(.23, radius * .33);
    controls.maxDistance = Math.max(12, radius * 8);
    defaultTarget = center.clone();
    const verticalFov = THREE.MathUtils.degToRad(camera.fov);
    const distance = Math.max(size.y / (2 * Math.tan(verticalFov * .5)) * 1.12, radius * 2.2);
    defaultCamera = center.clone().add(new THREE.Vector3(0, size.y * .15, distance));
    camera.position.copy(defaultCamera);
    controls.target.copy(defaultTarget);
    controls.update();
    gallery.classList.add('has-model');
    status.textContent = 'Pieza tridimensional lista.';
    fallback.setAttribute('aria-hidden', 'true');
    draw();
    console.info('PGI | Atlas editorial V0.4: GLB V2 cargado, color unlit, sin luces externas', { meshes: model.children.length });
  }, (progress) => {
    if (progress.total > 0) status.textContent = `Preparando el modelo 3D · ${Math.min(100, Math.round(progress.loaded / progress.total * 100))} %`;
  }, (error) => {
    console.error('PGI | No se pudo cargar V2:', error);
    status.textContent = 'Vista de referencia. GLB V2 pendiente en public/models/MITA_V2_TEST.glb';
    fallback.style.opacity = '1';
    host.style.pointerEvents = 'none';
  });
}

if (isMock) {
  status.textContent = 'VISTA DE COMPOSICIÓN · LA PIEZA 3D SE CARGARÁ EN EL SITIO LOCAL';
  document.querySelector('#view-hand').disabled = true;
  document.querySelector('#reset-view').disabled = true;
} else initViewer().catch((error) => {
  console.error('PGI | Error inicializando visor', error);
  status.textContent = 'No se pudo iniciar WebGL. Se conserva una imagen de referencia.';
});
