// GENERIC CONSTANTS
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

// CAMERA CONSTANTS
const LEFT = WIDTH / -2;
const RIGHT = WIDTH / 2;
const TOP = HEIGHT / 2;
const BOTTOM = HEIGHT / -2;
const NEAR = 1;
const FAR = 1000;
const START_X = 100;
const START_Y = 200;
const START_Z = 400;

// SCENE CONSTANTS
const BG_COLOR = 0xf0f0f0;

// DIRECTIONAL LIGHT CONSTANTS
const LIGHT_X = 1;
const LIGHT_Y = 0.75;
const LIGHT_Z = 0.5;


var camera, scene, renderer;
var plane, cube;
var mouse, raycaster, isShiftDown = false;

var rollOverMesh, rollOverMaterial;
var cubeGeo, cubeMaterial;

var objects = [];

init();
render();

function init(){
    camera = new THREE.OrthographicCamera(LEFT, RIGHT, TOP, BOTTOM, NEAR, FAR);
    camera.position.set(START_X, START_Y, START_Z);
    camera.lookAt(0, 0, 0);
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color(BG_COLOR);
    
    // roll-over helpers
    const rollOverGeo = new THREE.BoxBufferGeometry(50, 50, 50);
    rollOverMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        opacity: 0.5,
        transparent: true,
    });
    rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);
    scene.add(rollOverMesh);
    
    // cubes
    cubeGeo = new THREE.BoxBufferGeometry(50, 50, 50);
    cubeMaterial = new THREE.MeshLambertMaterial({
        color: 0xff0000,
    });
    
    // grid
    const gridHelper = new THREE.GridHelper(1000, 20);
    scene.add(gridHelper);
    
    // raycasting
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    
    const geometry = new THREE.PlaneBufferGeometry(1000, 1000);
    geometry.rotateX(-Math.PI / 2);
    
    plane = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
        visible: false,
    }));
    scene.add(plane);
    
    objects.push(plane);
    
    // lights
    const ambientLight = new THREE.AmbientLight(0x606060);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(LIGHT_X, LIGHT_Y, LIGHT_Z).normalize();
    scene.add(directionalLight);
    
    renderer = new THREE.SVGRenderer();
    renderer.setSize(WIDTH, HEIGHT);
    document.body.appendChild(renderer.domElement);
    
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('mousedown', onDocumentMouseDown, false);
    document.addEventListener('keydown', onDocumentKeyDown, false);
    document.addEventListener('keyup', onDocumentKeyUp, false);
    
    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize(){
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
    
    renderer.setSize(WIDTH, HEIGHT);
}

function onDocumentMouseMove(event){
    event.preventDefault();
    
    mouse.set((event.clientX / WIDTH) * 2 - 1, -(event.clientY / HEIGHT) * 2 + 1);
    raycaster.setFromCamera(mouse, camera);
    
    const intersects = raycaster.intersectObjects(objects);
    
    if(intersects.length > 0){
        const intersect = intersects[0];
        
        rollOverMesh.position.copy(intersect.point).add(intersect.face.normal);
        rollOverMesh.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
    }
    
    render();
}

function onDocumentMouseDown(event){
    event.preventDefault();
    
    mouse.set((event.clientX / WIDTH) * 2 - 1, -(event.clientY / HEIGHT) * 2 + 1);
    raycaster.setFromCamera(mouse, camera);
    
    const intersects = raycaster.intersectObjects(objects);
    
    if(intersects.length > 0){
        const intersect = intersects[0];
        
        // delete cube
        if(isShiftDown){
            const intersected = intersect.object;
            if(intersected !== plane){
                scene.remove(intersected);
                objects.splice(objects.indexOf(intersected), 1);
            }

        // create cube
        }else{
            const voxel = new THREE.Mesh(cubeGeo, cubeMaterial);
            voxel.position.copy(intersect.point).add(intersect.face.normal);
            voxel.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
            scene.add(voxel);
            
            objects.push(voxel);
        }
        
        render();
    }
}

function onDocumentKeyDown(event){
    switch(event.keyCode){
        case 16: isShiftKeyDown = true;
        break;
    }
}

function onDocumentKeyUp(event){
    switch(event.keyCode){
        case 16: isShiftDown = false;
        break;
    }
}

function render(){
    renderer.render(scene, camera);
}