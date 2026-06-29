// --- MOTOR 3D: PALOMAS FLOTANTES Y ALEATORIAS ---
const canvas = document.getElementById('heroCanvas');

// Escena y Cámara
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 8;

// Renderizador ultra fluido y transparente
const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Iluminación ambiental y puntual para dar volumen 3D
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xd32f2f, 2, 50); // Luz roja de fondo
pointLight.position.set(0, 0, 2);
scene.add(pointLight);

// Grupo para contener todas las palomas
const birdsGroup = new THREE.Group();
scene.add(birdsGroup);

// Geometría estilizada de una paloma en baja poligonización (Efecto premium abstracto)
function createBirdGeometry() {
    const geometry = new THREE.BufferGeometry();
    
    // Vértices que definen el cuerpo y las alas desplegadas
    const vertices = new Float32Array([
        0.0,  0.0,  0.3,   // 0: Cabeza
        0.0,  0.0, -0.5,   // 1: Cola
       -0.6,  0.2, -0.1,   // 2: Ala Izquierda Extremo
        0.6,  0.2, -0.1,   // 3: Ala Derecha Extremo
        0.0, -0.1,  0.0    /* 4: Pecho */
    ]);
    
    // Caras (Triángulos)
    const indices = [
        0, 2, 4, // Ala izq frontal
        2, 1, 4, // Ala izq trasera
        0, 4, 3, // Ala der frontal
        4, 1, 3  // Ala der trasera
    ];
    
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
}

// Material blanco puro, brillante y suave
const birdMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    flatShading: true,
    shininess: 80
});

// Crear múltiples palomas con datos de vuelo independientes
const birdsData = [];
const numBirds = 15; // Cantidad de palomas simultáneas

for (let i = 0; i < numBirds; i++) {
    const birdMesh = new THREE.Mesh(createBirdGeometry(), birdMaterial);
    
    // Posición inicial aleatoria en el espacio tridimensional
    birdMesh.position.set(
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 5
    );
    
    // Escala aleatoria para dar sensación de profundidad
    const randomScale = 0.4 + Math.random() * 0.4;
    birdMesh.scale.set(randomScale, randomScale, randomScale);
    
    birdsGroup.add(birdMesh);
    
    // Guardamos las físicas individuales de cada ave
    birdsData.push({
        mesh: birdMesh,
        speedX: 0.02 + Math.random() * 0.03,
        speedY: (Math.random() - 0.5) * 0.015,
        speedZ: (Math.random() - 0.5) * 0.01,
        wingSpeed: 8 + Math.random() * 6,
        phase: Math.random() * 10
    });
}

// Interacción suave con el movimiento del ratón (Efecto Parallax)
let mouseX = 0, mouseY = 0;
document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) - 0.5;
    mouseY = (e.clientY / window.innerHeight) - 0.5;
});

// Bucle de animación (Render loop)
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();
    
    birdsData.forEach((bird) => {
        // Movimiento de traslación (Vuelo hacia la derecha)
        bird.mesh.position.x += bird.speedX;
        bird.mesh.position.y += bird.speedY;
        bird.mesh.position.z += bird.speedZ;
        
        // Simulación del aleteo modificando la rotación de las alas en el tiempo
        const positionAttribute = bird.mesh.geometry.attributes.position;
        const wingFlap = Math.sin(elapsedTime * bird.wingSpeed + bird.phase) * 0.25;
        
        // Modificamos dinámicamente la altura Y de las puntas de las alas (Vértices indexados 2 y 3)
        positionAttribute.setY(2, 0.2 + wingFlap);
        positionAttribute.setY(3, 0.2 + wingFlap);
        positionAttribute.needsUpdate = true;
        
        // Orientación del ave según su dirección de vuelo
        bird.mesh.rotation.y = Math.PI / 2 + (bird.speedY * 2);
        bird.mesh.rotation.z = wingFlap * 0.2;

        // Si la paloma se sale de los límites de la pantalla, reaparece en el lado izquierdo
        if (bird.mesh.position.x > 10) {
            bird.mesh.position.x = -10;
            bird.mesh.position.y = (Math.random() - 0.5) * 8;
        }
    });
    
    // Rotación e interacción de la cámara basada en el ratón del usuario
    camera.position.x += (mouseX * 2 - camera.position.x) * 0.05;
    camera.position.y += (-mouseY * 2 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);
    
    renderer.render(scene, camera);
}

// Controlar redimensionamiento de pantalla
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Iniciar animación
animate();