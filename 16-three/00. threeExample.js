import * as THREE from "three";

import Stats from "./examples/jsm/libs/stats.module.js";

import { OrbitControls } from "./examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "./examples/jsm/environments/RoomEnvironment.js";

import { GLTFLoader } from "./examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "./examples/jsm/loaders/DRACOLoader.js";

let mixer;

let w = 800, h = 800;

const clock = new THREE.Clock();
const container = document.getElementById("app");

const stats = new Stats();
container.appendChild(stats.dom);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(w, h);
renderer.outputEncoding = THREE.sRGBEncoding;
container.appendChild(renderer.domElement);

const pmremGenerator = new THREE.PMREMGenerator(renderer);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbfe3dd);
scene.environment = pmremGenerator.fromScene(
  new RoomEnvironment(),
  0.04
).texture;

const camera = new THREE.PerspectiveCamera(
  40,
  w / h,
  1,
  100
);
camera.position.set(5, 2, 8);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.5, 0);
controls.update();
controls.enablePan = false;
controls.enableDamping = true;

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("./examples/js/libs/draco/gltf/");

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);
loader.load(
  "./examples/models/gltf/LittlestTokyo.glb",
  function (gltf) {
    const model = gltf.scene;
    model.position.set(1, 1, 0);
    model.scale.set(0.01, 0.01, 0.01);
    scene.add(model);

    mixer = new THREE.AnimationMixer(model);
    mixer.clipAction(gltf.animations[0]).play();

    animate();
  },
  undefined,
  function (e) {
    console.error(e);
  }
);

window.onresize = function () {
  camera.aspect = w / h;
  camera.updateProjectionMatrix();

  renderer.setSize(w, h);
};

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  mixer.update(delta);

  controls.update();

  stats.update();

  renderer.render(scene, camera);
}
