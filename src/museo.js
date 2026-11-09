import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import './museo.css';

// PGI v0.3
// Solo inspeccion. Sin WASD, sin edicion del personaje.
// Modelo temporal. Sustituiremos esta URL por un GLB autorizado.

const MODEL_URL = '/models/MITA_ATLAS_FIDELIDAD_V1.glb';
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const museum = document.createElement('section');

museum.id = 'pgi-museo';
museum.setAttribute(
  'aria-label',
  'Exhibicion interactiva del Atlas de las Emociones'
);

museum.innerHTML = `
  <header class="pgi-header">
    <div class="pgi-brand">
      <span class="pgi-mark">PGI</span>
      <div>
        <span class="pgi-eyebrow">ATLAS DE LAS EMOCIONES</span>
        <h2>Exploracion tridimensional</h2>
      </div>
    </div>
    <div class="pgi-version">
      SALA 01 <span class="pgi-dot"></span> PROTOTIPO
    </div>
  </header>

  <div class="pgi-loader" role="status" aria-live="polite">
    <span class="pgi-loader-label">
      Preparando la pieza tridimensional...
    </span>
    <progress max="100" value="0"></progress>
  </div>

  <div class="pgi-focus" hidden>
    <span class="pgi-eyebrow">VISTA DE DETALLE</span>
    <strong>Punto seleccionado</strong>
    <p>
      Examina la zona mediante orbita y zoom.
      El modelo permanece intacto.
    </p>
    <button type="button" data-action="reset">
      Volver a vista completa
    </button>
  </div>

  <div class="pgi-bottom">
    <div class="pgi-instruction">
      Arrastra para girar <b>·</b>
      Rueda para acercar <b>·</b>
      Doble clic para enfocar
    </div>

    <div class="pgi-actions"
         role="group"
         aria-label="Controles de la camara">

      <button type="button"
              data-action="minus"
              title="Alejar"
              aria-label="Alejar camara">−</button>

      <button type="button"
              data-action="plus"
              title="Acercar"
              aria-label="Acercar camara">+</button>

      <button type="button"
              data-action="reset"
              title="Vista completa">Vista completa</button>

      <button type="button"
              data-action="fullscreen"
              title="Pantalla completa"
              aria-label="Activar pantalla completa">⛶</button>

      <button type="button"
              data-action="help"
              title="Ayuda"
              aria-label="Mostrar ayuda">?</button>
    </div>
  </div>

  <div class="pgi-status" role="status" aria-live="polite">
    Iniciando motor 3D...
  </div>

  <dialog class="pgi-help">
    <h3>Como explorar la pieza</h3>
    <p><strong>Girar:</strong> arrastra con el boton izquierdo
    del raton o con un dedo.</p>
    <p><strong>Acercar:</strong> rueda del raton,
    botones + / − o gesto de dos dedos.</p>
    <p><strong>Enfocar:</strong> doble clic sobre una
    parte visible del personaje.</p>
    <p><strong>Volver:</strong> pulsa Vista completa.</p>
    <p>No existe modo de caminar.
    El personaje no cambia sus expresiones ni su apariencia.</p>
    <button type="button" data-action="close-help">Cerrar</button>
  </dialog>
`;

document.body.append(museum);

const $ = (selector) => museum.querySelector(selector);

const status = $('.pgi-status');
const loader = $('.pgi-loader');
const loaderText = $('.pgi-loader-label');
const progress = loader.querySelector('progress');
const focusPanel = $('.pgi-focus');
const help = $('.pgi-help');

const setStatus = (message) => {
  status.textContent = message;
};

// ESCENA

const scene = new THREE.Scene();
scene.background = new THREE.Color('#111216');
scene.fog = new THREE.Fog('#111216', 12, 28);

const camera = new THREE.PerspectiveCamera(43, 1, 0.04, 90);
camera.position.set(3.5, 2.2, 5.8);

let renderer;

try {
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance'
  });
} catch (error) {
  loaderText.textContent =
    'No se pudo iniciar WebGL. Comprueba la aceleracion de hardware.';
  console.error('PGI / WebGL', error);
  throw error;
}

renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.domElement.setAttribute(
  'aria-label',
  'Visor tridimensional interactivo'
);

museum.prepend(renderer.domElement);

// ORBITA

const controls = new OrbitControls(camera, renderer.domElement);

controls.enableRotate = true;
controls.enableZoom = true;
controls.enablePan = false;
controls.enableDamping = true;

controls.dampingFactor = 0.075;
controls.rotateSpeed = 0.64;
controls.zoomSpeed = 0.72;
controls.autoRotate = false;

controls.minPolarAngle = 0.10;
controls.maxPolarAngle = Math.PI - 0.10;

controls.minDistance = 0.55;
controls.maxDistance = 12;

controls.target.set(0, 1.4, 0);
controls.update();

// ESCENOGRAFIA

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(16, 80),
  new THREE.MeshStandardMaterial({
    color: '#22242a',
    roughness: 0.9,
    metalness: 0.03
  })
);

floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const backdrop = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 11),
  new THREE.MeshStandardMaterial({
    color: '#191a20',
    roughness: 1
  })
);

backdrop.position.set(0, 3.5, -6);
scene.add(backdrop);

const pedestal = new THREE.Mesh(
  new THREE.CylinderGeometry(1.08, 1.15, 0.43, 80),
  new THREE.MeshStandardMaterial({
    color: '#5e6068',
    metalness: 0.35,
    roughness: 0.35
  })
);

pedestal.position.y = 0.215;
pedestal.receiveShadow = true;
pedestal.castShadow = true;
scene.add(pedestal);

const edge = new THREE.Mesh(
  new THREE.TorusGeometry(1.085, 0.014, 8, 96),
  new THREE.MeshStandardMaterial({
    color: '#a46b60',
    metalness: 0.55,
    roughness: 0.31
  })
);

edge.position.y = 0.43;
edge.rotation.x = -Math.PI / 2;
scene.add(edge);

// ILUMINACION

scene.add(
  new THREE.HemisphereLight('#f8f2e9', '#313744', 2.2)
);

const key = new THREE.DirectionalLight('#ffebd7', 2.6);
key.position.set(3, 7, 5);
key.castShadow = true;
key.shadow.mapSize.set(1024, 1024);
key.shadow.camera.left = -5;
key.shadow.camera.right = 5;
key.shadow.camera.top = 6;
key.shadow.camera.bottom = -5;
key.shadow.bias = -0.00015;
scene.add(key);

const fill = new THREE.DirectionalLight('#b1c8e9', 1.1);
fill.position.set(-4, 3, -2);
scene.add(fill);

// ESTADO

let exhibit = null;
let rafId = 0;
let move = null;
let isHome = true;

const homePosition = new THREE.Vector3(3.5, 2.2, 5.8);
const homeTarget = new THREE.Vector3(0, 1.4, 0);

// RENDERIZADO CUANDO ES NECESARIO

function requestFrame() {
  if (!rafId && !document.hidden) {
    rafId = requestAnimationFrame(renderFrame);
  }
}

function renderFrame(time) {
  rafId = 0;
  let moving = false;

  if (move) {
    const t = Math.min(
      1,
      (time - move.started) / move.duration
    );

    const eased = t * t * (3 - 2 * t);

    camera.position.lerpVectors(
      move.startCamera,
      move.endCamera,
      eased
    );

    controls.target.lerpVectors(
      move.startTarget,
      move.endTarget,
      eased
    );

    camera.lookAt(controls.target);
    moving = true;

    if (t >= 1) {
      move = null;
      controls.enabled = true;
      controls.update();
    }
  } else {
    moving = controls.update();
  }

  renderer.render(scene, camera);

  if (move || moving) {
    requestFrame();
  }
}

controls.addEventListener('change', requestFrame);

controls.addEventListener('start', () => {
  isHome = false;
  renderer.domElement.style.cursor = 'grabbing';
  requestFrame();
});

controls.addEventListener('end', () => {
  renderer.domElement.style.cursor = 'grab';
  requestFrame();
});

renderer.domElement.style.cursor = 'grab';

renderer.domElement.addEventListener(
  'contextmenu',
  (event) => event.preventDefault()
);

// TRANSICIONES

function glideTo(position, target, duration = 520) {
  isHome = false;

  if (reduceMotion) {
    move = null;
    camera.position.copy(position);
    controls.target.copy(target);
    controls.enabled = true;
    controls.update();
    requestFrame();
    return;
  }

  move = {
    started: performance.now(),
    duration,
    startCamera: camera.position.clone(),
    startTarget: controls.target.clone(),
    endCamera: position.clone(),
    endTarget: target.clone()
  };

  controls.enabled = false;
  requestFrame();
}

// ZOOM SUAVE

function zoomBy(factor) {
  if (!exhibit) return;

  const offset = camera.position
    .clone()
    .sub(controls.target);

  const distance = THREE.MathUtils.clamp(
    offset.length() * factor,
    controls.minDistance,
    controls.maxDistance
  );

  if (Math.abs(distance - offset.length()) < 0.001) {
    return;
  }

  const next = controls.target
    .clone()
    .add(offset.normalize().multiplyScalar(distance));

  glideTo(next, controls.target.clone(), 360);

  setStatus(
    factor < 1
      ? 'Acercando camara...'
      : 'Alejando camara...'
  );
}

// VISTA COMPLETA

function resetView() {
  focusPanel.hidden = true;

  glideTo(homePosition, homeTarget, 620);
  isHome = true;

  setStatus('Vista completa restaurada.');
}

// SELECCION POR RAYCASTER

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function pick(event) {
  const rect = renderer.domElement.getBoundingClientRect();

  pointer.set(
    (event.clientX - rect.left) / rect.width * 2 - 1,
    -((event.clientY - rect.top) / rect.height * 2 - 1)
  );

  raycaster.setFromCamera(pointer, camera);

  return raycaster.intersectObject(exhibit, true)[0];
}

renderer.domElement.addEventListener(
  'dblclick',
  (event) => {
    if (!exhibit) return;

    const hit = pick(event);

    if (!hit) {
      setStatus('Selecciona una parte visible del modelo.');
      return;
    }

    const point = hit.point.clone();

    const direction = camera.position
      .clone()
      .sub(point)
      .normalize();

    const distance = THREE.MathUtils.clamp(
      camera.position.distanceTo(point) * 0.47,
      controls.minDistance * 1.3,
      Math.min(2, controls.maxDistance)
    );

    const destination = point
      .clone()
      .addScaledVector(direction, distance);

    focusPanel.hidden = false;

    glideTo(destination, point, 580);

    setStatus(
      'Enfoque activado. Puedes seguir girando y acercando.'
    );
  }
);

// BOTONES

museum.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const action = button.dataset.action;

  if (action === 'plus') zoomBy(0.78);
  if (action === 'minus') zoomBy(1.28);
  if (action === 'reset') resetView();

  if (action === 'help') help.showModal();
  if (action === 'close-help') help.close();

  if (action === 'fullscreen') {
    try {
      if (document.fullscreenElement === museum) {
        await document.exitFullscreen();
      } else {
        await museum.requestFullscreen();
      }
    } catch (error) {
      setStatus(
        'El navegador no permitio pantalla completa.'
      );

      console.warn('PGI / Pantalla completa', error);
    }
  }
});

// ENCUADRE AUTOMATICO

function updateHomePosition() {
  if (!exhibit) return;

  const bounds = new THREE.Box3().setFromObject(exhibit);
  const sphere = bounds.getBoundingSphere(new THREE.Sphere());

  homeTarget.copy(sphere.center);

  const vFov = THREE.MathUtils.degToRad(camera.fov) / 2;
  const hFov = Math.atan(
    Math.tan(vFov) * camera.aspect
  );

  const distance =
    sphere.radius /
    Math.sin(Math.min(vFov, hFov)) * 1.22;

  homePosition.copy(homeTarget).add(
    new THREE.Vector3(
      distance * 0.26,
      distance * 0.09,
      distance
    )
  );

  controls.minDistance = Math.max(
    0.35,
    sphere.radius * 0.44
  );

  controls.maxDistance = Math.max(
    distance * 2.6,
    8
  );

  camera.near = Math.max(
    0.02,
    sphere.radius * 0.025
  );

  camera.far = Math.max(
    75,
    distance * 6
  );

  camera.updateProjectionMatrix();
}

// PANTALLAS Y RESOLUCION

function resize() {
  const w = Math.max(1, museum.clientWidth);
  const h = Math.max(1, museum.clientHeight);

  camera.aspect = w / h;
  camera.updateProjectionMatrix();

  const maxPixels = 1800000;

  const pixelRatio = Math.min(
    window.devicePixelRatio || 1,
    1.6,
    Math.sqrt(maxPixels / (w * h))
  );

  renderer.setPixelRatio(pixelRatio);
  renderer.setSize(w, h, false);

  if (exhibit) {
    updateHomePosition();

    if (isHome && !move) {
      camera.position.copy(homePosition);
      controls.target.copy(homeTarget);
      controls.update();
    }
  }

  requestFrame();
}

new ResizeObserver(resize).observe(museum);
resize();

document.addEventListener('visibilitychange', () => {
  if (document.hidden && rafId) {
    cancelAnimationFrame(rafId);
    rafId = 0;
  } else {
    requestFrame();
  }
});

renderer.domElement.addEventListener(
  'webglcontextlost',
  (event) => {
    event.preventDefault();
    setStatus(
      'Se perdio el contexto grafico. Esperando recuperacion...'
    );
  }
);

renderer.domElement.addEventListener(
  'webglcontextrestored',
  () => {
    setStatus('Contexto grafico recuperado.');
    requestFrame();
  }
);

// CARGAR MODELO DE PRUEBA

new GLTFLoader().load(
  MODEL_URL,

  ({ scene: model }) => {
    const box = new THREE.Box3().setFromObject(model);
    const height = box.getSize(new THREE.Vector3()).y;

    if (!(height > 0.001)) {
      loaderText.textContent =
        'El modelo no tiene dimensiones validas.';
      return;
    }

    // Solo escala y posicion de exhibicion.
    // No cambia mallas, expresiones ni poses.

    model.scale.multiplyScalar(2.35 / height);

    const scaled = new THREE.Box3().setFromObject(model);
    const center = scaled.getCenter(new THREE.Vector3());

    model.position.x -= center.x;
    model.position.z -= center.z;
    model.position.y += 0.43 - scaled.min.y;

    model.traverse((part) => {
      if (part.isMesh) {
        part.castShadow = true;
        part.receiveShadow = true;
      }
    });

    scene.add(model);
    exhibit = model;
    loader.hidden = true;

    updateHomePosition();

    camera.position.copy(homePosition);
    controls.target.copy(homeTarget);
    controls.update();

    isHome = true;

    setStatus(
      'Pieza cargada. Orbita, zoom y doble clic disponibles.'
    );

    requestFrame();
  },

  (event) => {
    if (event.lengthComputable && event.total > 0) {
      const percent = Math.round(
        event.loaded / event.total * 100
      );

      progress.value = percent;

      loaderText.textContent =
        `Descargando modelo: ${percent}%`;
    }
  },

  (error) => {
    progress.hidden = true;

    loaderText.textContent =
      'No se pudo cargar el modelo. Revisa internet.';

    setStatus('Error al cargar la pieza.');

    console.error('PGI / GLB', error);
  }
);

requestFrame();

console.info(
  'PGI v0.3: orbita, zoom y enfoque. Sin Walk Mode.'
);