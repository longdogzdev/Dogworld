
/* INTRO */

setTimeout(() => {
  document.getElementById('intro').classList.add('hide');
}, 3000);


/* 3D GLOBE */

const container = document.getElementById('globe');

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  45,
  1,
  0.1,
  100
);

camera.position.z = 3.2;

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

const globe = new THREE.Group();
scene.add(globe);

const textureLoader = new THREE.TextureLoader();

textureLoader.load(
  'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
  (texture) => {
    const geometry = new THREE.SphereGeometry(1, 64, 64);

    const material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 1
    });

    globe.add(new THREE.Mesh(geometry, material));
  }
);

scene.add(new THREE.AmbientLight(0xffffff, 1.5));

const light = new THREE.DirectionalLight(0xffffff, 1.5);
light.position.set(3, 2, 4);
scene.add(light);


/* CONTROLS */

const controls = new THREE.OrbitControls(
  camera,
  renderer.domElement
);

controls.enableDamping = true;
controls.enableZoom = false;
controls.autoRotate = false;


/* RESIZE */

function resize() {
  const width = container.clientWidth;
  const height = container.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
}

resize();
window.addEventListener('resize', resize);


/* RENDER */

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();


/* DOG API */

const card = document.getElementById('dogCard');
const image = document.getElementById('dogImage');
const name = document.getElementById('dogName');
const button = document.getElementById('newDog');

const seenDogs = new Set();
let loading = false;

async function randomDog() {
  if (loading) return;

  loading = true;
  button.disabled = true;
  button.textContent = 'Loading...';

  name.textContent = 'Finding a dog...';
  card.style.display = 'block';

  try {
    let url = '';

    for (let i = 0; i < 15; i++) {
      const response = await fetch(
        'https://dog.ceo/api/breeds/image/random'
      );

      if (!response.ok) {
        throw new Error('API unavailable');
      }

      const data = await response.json();

      if (!data.message) {
        throw new Error('No image');
      }

      url = data.message;

      if (!seenDogs.has(url)) break;
    }

    // รอจนรูปโหลดเสร็จ
    const loadedImage = new Image();

    await new Promise((resolve, reject) => {
      loadedImage.onload = resolve;
      loadedImage.onerror = reject;
      loadedImage.src = url;
    });

    seenDogs.add(url);

    image.src = url;
    name.textContent = 'A random dog';

  } catch (error) {
    name.textContent = 'Could not load dog. Try again.';
    console.error(error);

  } finally {
    loading = false;
    button.disabled = false;
    button.textContent = 'Another dog';
  }
}


/* BUTTON */

button.addEventListener('click', randomDog);



let pointerStartX = 0;
let pointerStartY = 0;
let moved = false;

renderer.domElement.addEventListener('pointerdown', (event) => {
  pointerStartX = event.clientX;
  pointerStartY = event.clientY;
  moved = false;
});

renderer.domElement.addEventListener('pointermove', (event) => {
  const dx = event.clientX - pointerStartX;
  const dy = event.clientY - pointerStartY;

  if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
    moved = true;
  }
});

renderer.domElement.addEventListener('pointerup', () => {
  if (moved) return;

  if (card.style.display === 'block') {
    card.style.display = 'none';
  } else {
    randomDog();
  }
});
