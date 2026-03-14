const container = document.getElementById('canvas-container');
const header = document.querySelector('header');
const backToTopBtn = document.getElementById('back-to-top');
const progressCircle = document.querySelector('.progress-ring-circle');
const circleCircumference = 289; // Calculated from 2 * PI * r (r=46)

// Handle Sticky Header and Scroll Progress
window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    
    // Header
    if (scrollTop > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }

    // Scroll Progress Calculation
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolledPercentage = scrollTop / scrollHeight;
    const strokeDraw = circleCircumference * scrolledPercentage;
    
    if (progressCircle) {
        // dashoffset starts at full circumference (hidden) and reduces towards 0 (fully drawn)
        progressCircle.style.strokeDashoffset = circleCircumference - strokeDraw;
    }

    // Back to Top visibility
    if (scrollTop > 500) {
        backToTopBtn.classList.add('visible');
    } else {
        backToTopBtn.classList.remove('visible');
    }
});

// Scroll to top click
if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Mobile Menu Toggle
const menuToggle = document.getElementById('menu-toggle');
const nav = document.querySelector('nav');

if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        nav.classList.toggle('active');
    });

    // Close menu when a link is clicked
    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            nav.classList.remove('active');
        });
    });
}

// Custom Cursor Elements
const cursorDot = document.getElementById('cursor-dot');
const cursorGlow = document.getElementById('cursor-glow');

// Cursor Trailing State
let cursorX = window.innerWidth / 2;
let cursorY = window.innerHeight / 2;
let glowX = cursorX;
let glowY = cursorY;

// Setup Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(0, 10, 14); // Isometric-ish view from front-top

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

// --- Background Particles ---
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 3000;
const posArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 15;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

const particlesMaterial = new THREE.PointsMaterial({
    size: 0.015,
    color: 0x00f0ff,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
});

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
dirLight.position.set(5, 12, 5);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
dirLight.shadow.camera.near = 0.5;
dirLight.shadow.camera.far = 25;
dirLight.shadow.camera.left = -8;
dirLight.shadow.camera.right = 8;
dirLight.shadow.camera.top = 8;
dirLight.shadow.camera.bottom = -8;
dirLight.shadow.bias = -0.001;
scene.add(dirLight);

const fillLight = new THREE.DirectionalLight(0xaabbff, 0.4);
fillLight.position.set(-8, 5, -5);
scene.add(fillLight);

// --- 3D Scene Group ---
const desktopScene = new THREE.Group();
desktopScene.position.set(0, -1, 0); // perfectly centered in relative canvas
scene.add(desktopScene);

// Materials matching the reference image closely (Pink/Purple pastel theme with dark devices)
const matDarkBox = new THREE.MeshStandardMaterial({ color: 0x464c6c, roughness: 0.6 }); // Server tower
const matPrinter = new THREE.MeshStandardMaterial({ color: 0xead8d3, roughness: 0.5 }); // Printer body
const matMonitorBody = new THREE.MeshStandardMaterial({ color: 0x3d415b, roughness: 0.4 }); // Dark monitor body
const matRetroPCBody = new THREE.MeshStandardMaterial({ color: 0xe6dfda, roughness: 0.6 }); // Retro PC body
const matScreenOff = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.3 }); // Dark screen
const matScreenOn = new THREE.MeshStandardMaterial({ color: 0x66c2ff, emissive: 0x33aaff, emissiveIntensity: 0.6, roughness: 0.2 }); // Glowing Cyan screen
const matKeys = new THREE.MeshStandardMaterial({ color: 0x4dd0e1, roughness: 0.4 }); // Cyan keyboard keys
const matDarkKeys = new THREE.MeshStandardMaterial({ color: 0x3d415b, roughness: 0.4 }); // Dark keys
const matPhoneOff = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.2 });

const matWire = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });
const matHighlight = new THREE.MeshBasicMaterial({ color: 0xff0055 }); // Color for "wire message" pulse

function enableShadows(obj) {
    if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
    }
    if (obj.children) obj.children.forEach(enableShadows);
}

// Array to hold all screens/devices that can "turn on"
const lightableScreens = [];
// Array of node points for the animated wire message to traverse (Left to Right)
const wireNodes = [];

// 1. Server Tower (Left)
const serverGroup = new THREE.Group();
serverGroup.position.set(-4.5, 0, -1);
desktopScene.add(serverGroup);
wireNodes.push(serverGroup.position);

const serverBody = new THREE.Mesh(new THREE.BoxGeometry(1.6, 3.2, 2.0), matDarkBox);
serverBody.position.y = 1.6;
serverGroup.add(serverBody);

for(let i=0; i<4; i++) {
    const drive = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, 0.1), matScreenOff);
    drive.position.set(0, 2.8 - i*0.2, 1.0);
    serverGroup.add(drive);
}
const sLight1 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.05), matScreenOff);
sLight1.position.set(-0.4, 3.0, 1.01);
serverGroup.add(sLight1);
const sLight2 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.05), matScreenOff);
sLight2.position.set(-0.1, 3.0, 1.01);
serverGroup.add(sLight2);
lightableScreens.push(sLight1, sLight2);

// 2. Printer
const printerGroup = new THREE.Group();
printerGroup.position.set(-2, 0, -1.2);
desktopScene.add(printerGroup);
wireNodes.push(printerGroup.position);

const pBody = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.0, 1.4), matPrinter);
pBody.position.y = 0.5;
printerGroup.add(pBody);
const pTop = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.05, 0.8), matDarkBox);
pTop.position.set(0, 1.0, -0.1);
printerGroup.add(pTop);
const pTray = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, 0.8), matDarkBox);
pTray.position.set(0, 0.2, 0.7);
printerGroup.add(pTray);

// 3. Modern Monitor (Center)
const monitorGroup = new THREE.Group();
monitorGroup.position.set(0.5, 0, -1.5);
desktopScene.add(monitorGroup);
wireNodes.push(monitorGroup.position);

const mStand = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.1, 0.8), matMonitorBody);
mStand.position.y = 0.05;
monitorGroup.add(mStand);
const mNeck = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.8, 0.2), matMonitorBody);
mNeck.position.y = 0.4;
monitorGroup.add(mNeck);
const mPanel = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.6, 0.2), matMonitorBody);
mPanel.position.set(0, 1.4, 0.1);
monitorGroup.add(mPanel);
const mScreen = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.4), matScreenOff);
mScreen.position.set(0, 1.4, 0.21);
monitorGroup.add(mScreen);
lightableScreens.push(mScreen);

// 4. Retro PC (Right)
const retroGroup = new THREE.Group();
retroGroup.position.set(3.5, 0, -1.5);
desktopScene.add(retroGroup);
wireNodes.push(retroGroup.position);

const rBody = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.0, 2.0), matRetroPCBody);
rBody.position.y = 1.0;
retroGroup.add(rBody);
const rScreen = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.0), matScreenOff);
rScreen.position.set(0, 1.2, 1.01);
retroGroup.add(rScreen);
lightableScreens.push(rScreen);
const rVent = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.2, 0.1), matMonitorBody);
rVent.position.set(0, 0.4, 1.0);
retroGroup.add(rVent);

// 5. Laptop (Front Left)
const laptopGroup = new THREE.Group();
laptopGroup.position.set(-4.5, 0, 1.5);
desktopScene.add(laptopGroup);

const lBase = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.1, 1.2), matMonitorBody);
lBase.position.set(0, 0.05, 0);
laptopGroup.add(lBase);
const lTop = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.0, 0.1), matMonitorBody);
lTop.position.set(0, 0.55, -0.6);
lTop.rotation.x = -0.1;
laptopGroup.add(lTop);
const lScreen = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.8), matScreenOff);
lScreen.position.set(0, 0.55, -0.53);
lScreen.rotation.x = -0.1;
laptopGroup.add(lScreen);
lightableScreens.push(lScreen);
const lKeys = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.02, 0.6), matDarkKeys);
lKeys.position.set(0, 0.11, 0.1);
laptopGroup.add(lKeys);

// 6. Center Keyboard & Mouse
const kbGroup = new THREE.Group();
kbGroup.position.set(0.5, 0, 0.5);
desktopScene.add(kbGroup);

const kbBase = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.1, 0.8), matMonitorBody);
kbBase.position.y = 0.05;
kbBase.rotation.x = 0.05; // tilt
kbGroup.add(kbBase);
const kbKeys = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.05, 0.6), matKeys);
kbKeys.position.set(0, 0.1, 0);
kbKeys.rotation.x = 0.05;
kbGroup.add(kbKeys);

const mouseG = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.4), matMonitorBody);
mouseG.position.set(1.8, 0.05, 0.6);
desktopScene.add(mouseG);

// 7. Retro Keyboard
const rkbGroup = new THREE.Group();
rkbGroup.position.set(3.5, 0, 0.5);
desktopScene.add(rkbGroup);
const rkbBase = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.1, 0.6), matRetroPCBody);
rkbBase.position.y = 0.05;
rkbGroup.add(rkbBase);
const rkbKeys = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.05, 0.4), matMonitorBody);
rkbKeys.position.set(0, 0.1, 0);
rkbGroup.add(rkbKeys);

// 8. Phones & Tablets (Front Row)
function createDevice(width, height, isTablet, posX, posZ) {
    const devGroup = new THREE.Group();
    devGroup.position.set(posX, 0, posZ);
    
    const base = new THREE.Mesh(new THREE.BoxGeometry(width, 0.05, height), matMonitorBody);
    base.position.y = 0.025;
    devGroup.add(base);

    const scr = new THREE.Mesh(new THREE.PlaneGeometry(width * 0.8, height * 0.8), matPhoneOff);
    scr.rotation.x = -Math.PI / 2;
    scr.position.y = 0.051;
    devGroup.add(scr);
    lightableScreens.push(scr);
    
    desktopScene.add(devGroup);
    return devGroup;
}

createDevice(0.4, 0.8, false, -2.5, 2.0); // Phone 1
createDevice(0.5, 0.9, false, -1.2, 2.0); // Phone 2
createDevice(1.2, 0.9, true, 0.5, 2.2); // Tablet Landscape
createDevice(1.0, 1.4, true, 2.5, 2.5); // Tablet Portrait

enableShadows(desktopScene);

// --- Draw Wiring Underneath ---
const wirePath = new THREE.Group();
desktopScene.add(wirePath);

for(let i=0; i<wireNodes.length-1; i++) {
    const start = wireNodes[i];
    const end = wireNodes[i+1];
    const dist = start.distanceTo(end);
    
    const wireGeo = new THREE.CylinderGeometry(0.02, 0.02, dist);
    const wireLine = new THREE.Mesh(wireGeo, matWire);
    
    wireLine.position.set((start.x + end.x) / 2, 0.01, (start.z + end.z) / 2);
    wireLine.rotation.z = Math.PI / 2;
    wireLine.lookAt(end.x, 0.01, end.z);
    
    wirePath.add(wireLine);
}

const sparkGeo = new THREE.SphereGeometry(0.15, 8, 8);
const spark = new THREE.Mesh(sparkGeo, matHighlight);
spark.position.copy(wireNodes[0]);
spark.position.y = 0.1;
spark.visible = false;
desktopScene.add(spark);


// --- Interaction Logic ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let isHovered = false;
let isAnimatingWire = false;
let wireProgress = 0; 
let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (event) => {
    // Update raw cursor coordinates
    cursorX = event.clientX;
    cursorY = event.clientY;

    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    mouseX = (x - rect.width / 2);
    mouseY = (y - rect.height / 2);

    mouse.x = (x / rect.width) * 2 - 1;
    mouse.y = -(y / rect.height) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(desktopScene.children, true);
    
    lightableScreens.forEach(scr => {
        scr.material = (scr.geometry.type === 'PlaneGeometry' && scr.rotation.x === -Math.PI/2) ? matPhoneOff : matScreenOff;
    });

    isHovered = false;
    cursorDot.classList.remove('hovered');
    cursorGlow.classList.remove('hovered');

    if (intersects.length > 0) {
        let intersectedMesh = intersects[0].object;
        
        if (intersectedMesh === spark || intersectedMesh.geometry.type === 'CylinderGeometry' && intersectedMesh.material === matWire) {
            return;
        }

        cursorDot.classList.add('hovered');
        cursorGlow.classList.add('hovered');
        isHovered = true;
        
        let objGroup = intersectedMesh;
        while (objGroup.parent && objGroup.parent !== desktopScene) {
            objGroup = objGroup.parent;
        }

        lightableScreens.forEach(scr => {
            let isDescendant = false;
            let currentParent = scr;
            while(currentParent) {
                if(currentParent === objGroup) {
                     isDescendant = true;
                     break;
                }
                currentParent = currentParent.parent;
            }
            if(isDescendant) {
                scr.material = matScreenOn;
            }
        });
    }

    // Check interaction with standard HTML links/buttons and the new feature/service/testimonial/project/social cards
    if (event.target.tagName.toLowerCase() === 'a' || event.target.closest('.btn') || event.target.closest('.feature-card') || event.target.closest('.service-card') || event.target.closest('.testimonial-card') || event.target.closest('.project-card') || event.target.closest('.social-link') || event.target.closest('.legal-links a') || event.target.closest('.link-group a') || event.target.closest('.back-to-top')) {
         cursorDot.classList.add('hovered');
         cursorGlow.classList.add('hovered');
    }
});

document.addEventListener('mousedown', () => cursorGlow.classList.add('clicked'));
document.addEventListener('mouseup', () => cursorGlow.classList.remove('clicked'));

document.addEventListener('click', () => {
    if (isHovered && !isAnimatingWire) {
        isAnimatingWire = true;
        wireProgress = 0;
        spark.visible = true;
        spark.position.copy(wireNodes[0]);
    }
});

window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});

// --- Animation Loop ---
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    desktopScene.position.y = -1 + Math.sin(time) * 0.1;

    // Rotate particles slowly
    particlesMesh.rotation.y = time * 0.03;
    particlesMesh.rotation.x = time * 0.01;

    if (isAnimatingWire) {
        wireProgress += 0.05;
        
        let segmentIndex = Math.floor(wireProgress);
        let segmentFactor = wireProgress - segmentIndex;
        
        if (segmentIndex < wireNodes.length - 1) {
            const startP = wireNodes[segmentIndex];
            const endP = wireNodes[segmentIndex+1];
            
            spark.position.x = THREE.MathUtils.lerp(startP.x, endP.x, segmentFactor);
            spark.position.z = THREE.MathUtils.lerp(startP.z, endP.z, segmentFactor);
            spark.position.y = 0.1; 
            
            if (segmentFactor < 0.1 && segmentIndex > 0) {
               if(segmentIndex===1) printerGroup.position.y = Math.sin(segmentFactor*Math.PI*10)*0.2;
               if(segmentIndex===2) monitorGroup.position.y = Math.sin(segmentFactor*Math.PI*10)*0.2;
            }
            
        } else {
            spark.visible = false;
            isAnimatingWire = false;
            retroGroup.position.y = 0.3;
            setTimeout(() => { retroGroup.position.y = 0; }, 150);
        }
    }

    if(!isAnimatingWire) {
        printerGroup.position.y = THREE.MathUtils.lerp(printerGroup.position.y, 0, 0.1);
        monitorGroup.position.y = THREE.MathUtils.lerp(monitorGroup.position.y, 0, 0.1);
        retroGroup.position.y = THREE.MathUtils.lerp(retroGroup.position.y, 0, 0.1);
    }

    const targetCamX = mouseX * 0.005;
    const targetCamY = mouseY * 0.005;
    
    camera.position.x += (targetCamX - camera.position.x) * 0.05;
    camera.position.y += (-targetCamY - camera.position.y + 10) * 0.05;
    camera.lookAt(desktopScene.position);

    // Custom Cursor
    cursorDot.style.left = `${cursorX}px`;
    cursorDot.style.top = `${cursorY}px`;
    glowX += (cursorX - glowX) * 0.2;
    glowY += (cursorY - glowY) * 0.2;
    cursorGlow.style.left = `${glowX}px`;
    cursorGlow.style.top = `${glowY}px`;

    renderer.render(scene, camera);
}

animate();
