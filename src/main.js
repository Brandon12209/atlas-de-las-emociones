import '@google/model-viewer';

console.log('PGI | Atlas de las Emociones');

customElements.whenDefined('model-viewer').then(() => {
  console.log('Motor 3D cargado correctamente');
});

// PGI_VISOR_PRUEBA: modelo temporal
const visor = document.createElement("model-viewer");
visor.src = "https://modelviewer.dev/shared-assets/models/Astronaut.glb";
visor.alt = "Astronauta de prueba en 3D";
visor.setAttribute("camera-controls", "");
visor.setAttribute("auto-rotate", "");
visor.setAttribute("shadow-intensity", "1");
visor.style.cssText = "display:block;width:100%;height:70vh;background:#10151d;";
document.body.append(visor);
