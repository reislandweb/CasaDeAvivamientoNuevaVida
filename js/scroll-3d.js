    // --- MOTOR 3D: SISTEMA DE PARTICULAS DE LUZ (AVIVAMIENTO GLOBAL) ---
    import * as THREE from 'three';

    let scene, camera, renderer;
    let particleGeometry, particleSystem;
    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;

    const particleCount = 1500; // Cantidad de destellos en pantalla

    init();
    animate();

    function init() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;

    scene = new THREE.Scene();

    // Cámara con campo de visión amplio para dar profundidad estelar
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 500);
    camera.position.z = 50;

    // Renderizador fluido con fondo transparente
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    // --- CREACIÓN DEL SISTEMA DE DESTELLOS ---
    particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];

    for (let i = 0; i < particleCount * 3; i += 3) {
        // Distribuimos las partículas en un cubo gigante invisible
        positions[i] = (Math.random() - 0.5) * 150;     // X (Ancho)
        positions[i + 1] = (Math.random() - 0.5) * 150; // Y (Alto)
        positions[i + 2] = (Math.random() - 0.5) * 100; // Z (Profundidad)

        // Velocidad individual de subida y balanceo lateral
        velocities.push({
        y: Math.random() * 0.05 + 0.02, // Velocidad de ascenso vertical
        x: (Math.random() - 0.5) * 0.02 // Balanceo horizontal
        });
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.userData = { velocities: velocities };

    // --- DISEÑO DEL DESTELLO (Material Premium) ---
    // Creamos un destello circular difuminado por código (sin usar imágenes externas)
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 16;
    pCanvas.height = 16;
    const pCtx = pCanvas.getContext('2d');
    const gradient = pCtx.createRadialGradient(8, 8, 0, 8, 8, 8);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');      // Centro blanco brillante
    gradient.addColorStop(0.3, 'rgba(212, 175, 55, 0.6)');   // Halo dorado de Avivamiento
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');             // Difuminado a transparente
    pCtx.fillStyle = gradient;
    pCtx.fillRect(0, 0, 16, 16);

    const texture = new THREE.CanvasTexture(pCanvas);

    const particleMaterial = new THREE.PointsMaterial({
        size: 0.8,
        map: texture,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending, // Hace que brille el doble si se cruzan entre sí
        depthWrite: false
    });

    // Juntamos la geometría y el material en el sistema definitivo
    particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // Eventos interactivos
    window.addEventListener('resize', onWindowResize);
    document.addEventListener('mousemove', onMouseMove);
    }

    function onMouseMove(event) {
    mouseX = (event.clientX - window.innerWidth / 2) * 0.02;
    mouseY = (event.clientY - window.innerHeight / 2) * 0.02;
    }

    function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function animate() {
    requestAnimationFrame(animate);

    const positions = particleGeometry.attributes.position.array;
    const velocities = particleGeometry.userData.velocities;

    // 1. ANIMACIÓN DE ASCENSO (Efecto chispas flotantes)
    let velIndex = 0;
    for (let i = 0; i < positions.length; i += 3) {
        // Aplicamos su velocidad de subida base + un empujón extra según cuánto scroll hagas
        const scrollPush = window.scrollY * 0.0002;
        positions[i + 1] += velocities[velIndex].y + scrollPush; // Sube en Y
        positions[i] += velocities[velIndex].x;                  // Oscila en X

        // Si una partícula se sale por la parte de arriba, la devolvemos abajo del todo
        if (positions[i + 1] > 75) {
        positions[i + 1] = -75;
        positions[i] = (Math.random() - 0.5) * 150;
        }

        velIndex++;
    }
    particleGeometry.attributes.position.needsUpdate = true;

    // 2. INTERACCIÓN SUAVE CON EL RATÓN (Efecto viento o gravedad al mover el cursor)
    targetX += (mouseX - targetX) * 0.05;
    targetY += (mouseY - targetY) * 0.05;

    // El sistema de partículas entero se balancea con elegancia siguiendo el mouse
    particleSystem.rotation.y = targetX * 0.1;
    particleSystem.rotation.x = targetY * 0.1;

    renderer.render(scene, camera);
    }