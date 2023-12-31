import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Water } from 'three/addons/objects/Water.js';
import { Sky } from 'three/addons/objects/Sky.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

var arrowTracker;

let camera, scene, renderer;
let controls, water, sun;

const loader = new GLTFLoader();

function random(min, max){
    return Math.random() * (max-min) + min;
}

loader.load('./boat/scene.gltf', function(gltf){
    scene.add(gltf.scene);
    gltf.scene.scale.set(3,3,3);
    gltf.scene.position.set(5,13,50);
    gltf.scene.rotation.y = 1.5;
})

// loader.load('./kayak/scene.gltf', function(gltf){
//     scene.add(gltf.scene);
//     gltf.scene.scale.set(20,20,20);
//     gltf.scene.position.set(-5,-2,50);
//     gltf.scene.rotation.y = 1.5;
// })

loader.load('./tube/scene.gltf', function(gltf){
    scene.add(gltf.scene);
    gltf.scene.scale.set(5,5,5);
    gltf.scene.position.set(-25,-2,50);
    gltf.scene.rotation.y = 3;
})

loader.load('./canoe/scene.gltf', function(gltf){
    scene.add(gltf.scene);
    gltf.scene.scale.set(3,3,3);
    gltf.scene.position.set(-50,-2,50);
    gltf.scene.rotation.y = 1.5;
})

loader.load('./islands/scene.gltf', function(gltf){
    scene.add(gltf.scene);
    gltf.scene.scale.set(2,2,2);
    gltf.scene.position.set(-150,-100,50);
    gltf.scene.rotation.y = 1.5;
})

class Kayak{
    constructor(){
        loader.load('./kayak/scene.gltf', (gltf) => {
            scene.add(gltf.scene);
            gltf.scene.scale.set(20,20,20);
            gltf.scene.position.set(-5,-2,50);
            gltf.scene.rotation.y = 1.5;

            this.kayak = gltf.scene
            this.speed = {
                vel: 0,
                rot: 0
            }
        })
    }

    stop(){
        this.speed.vel = 0
        this.speed.rot = 0
    }

    update(){
        if(this.kayak){
            this.kayak.rotation.y += this.speed.rot
            this.kayak.translateX(this.speed.vel)
        }
    }
}

const kayak = new Kayak();

class Arrow {
    constructor(){
        loader.load('./arrow/scene.gltf', (gltf) => {
            scene.add(gltf.scene);
            gltf.scene.scale.set(15,15,15);
            gltf.scene.position.set(-50,40,50);
            gltf.scene.rotation.y = 4;
            gltf.scene.rotation.x = -0.1;

            this.arrow = gltf.scene
            this.counter = 0
        })
    }

    update(){
        if(this.arrow){
            this.arrow.rotation.y += 0.01
            
            // direction vector for movement
            var direction = new THREE.Vector3( 1, 1, 1 );

            // scalar to simulate speed
            var speed = 0.2;

            var vector = direction.multiplyScalar( speed, speed, speed );
            if(this.counter <= 75){
                this.arrow.position.y += vector.y; // go up
                this.counter++;
            }
            else if(75 < this.counter <= 150){
                this.arrow.position.y -= vector.y; // go down
                this.counter++;
                if(this.counter === 150){
                    this.counter = 0;
                }
            }
        }
    }

    arrowToTube(){
        if(this.arrow){
            this.arrow.position.set(-25,40,50);
        }
    }

    arrowToCanoe(){
        if(this.arrow){
            this.arrow.position.set(-50,40,50);
        }
    }

    arrowToKayak(){
        if(this.arrow){
            this.arrow.position.set(-5,40,50);
        }
    }
}

const arrow = new Arrow()

class Coin{
    constructor(_scene){
        scene.add(_scene);
        _scene.scale.set(6,6,6);
        _scene.position.set(random(-100, 100),1,random(-100, 100));
        //gltf.scene.rotation.y = 1.5;

        this.coin = _scene;
    }
}

async function loadModel(path){
    return new Promise((resolve, reject) => {
        loader.load(path, (gltf) => {
            resolve(gltf.scene)
        })
    })
}

let boatModel = null
async function createCoin(){
    if(!boatModel){
        boatModel = await loadModel('./coin/scene.gltf')
    }
    return new Coin(boatModel.clone())
}

//let coin = new Coin();
// setTimeout(() =>{
//     createCoin().then(coin =>{
//         console.log(coin)
//     })
// }, 1000)
let coins = []
const COIN_COUNT = 10;

init();
animate();

async function init() {

    // Renderer

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.useLegacyLights = false;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.5;
    document.body.appendChild( renderer.domElement );

    // Scene and Camera

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 1, 20000 );
    camera.position.set( 30, 30, 100 );

    // Sun

    sun = new THREE.Vector3();

    // Water
    const waterGeometry = new THREE.PlaneGeometry( 10000, 10000 );
    water = new Water(
        waterGeometry,
        {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: new THREE.TextureLoader().load( '/waternormals.jpg', function ( texture ) {

                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

            } ),
            sunDirection: new THREE.Vector3(),
            sunColor: 0xffffff,
            waterColor: 0x001e0f,
            distortionScale: 3.7,
            fog: scene.fog !== undefined
        }
    );
    water.rotation.x = - Math.PI / 2;
    scene.add( water );

    // Skybox
    const sky = new Sky();
    sky.scale.setScalar( 10000 );
    scene.add( sky );
    const skyUniforms = sky.material.uniforms;
    skyUniforms[ 'turbidity' ].value = 10;
    skyUniforms[ 'rayleigh' ].value = 2;
    skyUniforms[ 'mieCoefficient' ].value = 0.005;
    skyUniforms[ 'mieDirectionalG' ].value = 0.8;

    const parameters = {
        elevation: 2,
        azimuth: 180
    };

    const pmremGenerator = new THREE.PMREMGenerator( renderer );
    let renderTarget;

    function updateSun() {

        const phi = THREE.MathUtils.degToRad( 90 - parameters.elevation );
        const theta = THREE.MathUtils.degToRad( parameters.azimuth );
        sun.setFromSphericalCoords( 1, phi, theta );
        sky.material.uniforms[ 'sunPosition' ].value.copy( sun );
        water.material.uniforms[ 'sunDirection' ].value.copy( sun ).normalize();

        if ( renderTarget !== undefined ) renderTarget.dispose();
        renderTarget = pmremGenerator.fromScene( sky );
        scene.environment = renderTarget.texture;
    }

    updateSun();

    controls = new OrbitControls( camera, renderer.domElement );
    controls.maxPolarAngle = Math.PI * 0.495;
    controls.target.set( 0, 10, 0 );
    controls.minDistance = 40.0;
    controls.maxDistance = 200.0;
    controls.update();

    const waterUniforms = water.material.uniforms;

    // create coins
    for(let i = 0; i < COIN_COUNT; i++){
        const coin = await createCoin()
        coins.push(coin)
    }

    window.addEventListener( 'resize', onWindowResize );

    window.addEventListener( 'keydown', function(e){
        if(e.key == "ArrowUp"){
            kayak.speed.vel = 1
        }
        if(e.key == "ArrowDown"){
            kayak.speed.vel = -1
        }
        if(e.key == "ArrowRight"){
            kayak.speed.rot = -0.1
        }
        if(e.key == "ArrowLeft"){
            kayak.speed.rot = 0.1
        }
    })
    window.addEventListener('keyup', function(e){
        kayak.stop()
    })
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function isColliding(obj1, obj2){
    return (
        Math.abs(obj1.position.x - obj2.position.x) < 15 &&
        Math.abs(obj2.position.z - obj2.position.z) < 15
    )
}

function checkCollisions(){
    if(kayak.kayak){
        coins.forEach(coin => {
            if(coin.coin){
                if(isColliding(kayak.kayak, coin.coin)){
                    scene.remove(coin.coin)
                }
            }
        })
    }
}

function animate() {
    requestAnimationFrame( animate );
    render();
    arrow.update();
    kayak.update();
    checkCollisions()
        
}

function render() {
    water.material.uniforms[ 'time' ].value += 1.0 / 60.0;
    renderer.render( scene, camera );
}

function arrowToTube() {
    arrow.arrowToTube();
    arrowTracker = "tube";
    console.log("arrowTracker value: " + arrowTracker);
}
document.getElementById("tube").addEventListener("click", arrowToTube);

function arrowToCanoe() {
    arrow.arrowToCanoe();
    arrowTracker = "canoe";
    console.log("arrowTracker value: " + arrowTracker);
}
document.getElementById("canoe").addEventListener("click", arrowToCanoe);

function arrowToKayak() {
    arrow.arrowToKayak();
    arrowTracker = "kayak";
    console.log("arrowTracker value: " + arrowTracker);
}
document.getElementById("kayak").addEventListener("click", arrowToKayak);

// window.onload = function(){

//     // get info from database and populate
//     console.log(test_helper());
//     var tube_total = 10;
//     var kayak_total = 10, canoe_total = 10;

//     document.getElementById('tube-total').innerHTML = tube_total;
//     document.getElementById('kayak-total').innerHTML = kayak_total;
//     document.getElementById('canoe-total').innerHTML = canoe_total;
// }
async function fetchConfirmButton(){
    console.log("background.js-arrowTracker " + arrowTracker);
    try {
        //const url = "https://paprockr-project.uc.r.appspot.com/store"
        const url = "https://paprockr-project.uc.r.appspot.com/confirmbuttonsecond"
        const requestBody = {
            arrowTracker: arrowTracker
        };
        //console.log("requestBody before JSON.stringify: " + requestBody);
        var response = await fetch(`${url}`, {
            method: "POST",
            body: JSON.stringify(requestBody),
            headers: {
            'Access-Control-Allow-Origin':'*',
            'Content-Type': 'application/json'
            }
        });

        var changed_response = await response.text();
        console.log("confirm_button_server_response: " + changed_response);
        if (changed_response == "fail!"){
            alert("You already rented a boat! Cancel your current rental first.");
            return;
        }

        var id = arrowTracker + '-total'
        console.log("id: " + id);
        document.getElementById(id).innerHTML -= 1;

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}
document.getElementById("bottom-button-checkout").addEventListener("click", fetchConfirmButton);

async function fetchCancel(){
    
    try {
        //const url = "https://paprockr-project.uc.r.appspot.com/store"
        const url = "https://paprockr-project.uc.r.appspot.com/cancelbutton"
    
        console.log("Client Side - Cancel Button Triggered!");
        var response = await fetch(`${url}`, {
            method: "GET",
            headers: {
            'Access-Control-Allow-Origin':'*',
            'Content-Type': 'application/json'
            }
        });

        var cancel_response = await response.text();
        console.log("cancel_response: " + cancel_response);
        if (cancel_response == "fail!"){
            alert("You haven't confirmed your boat rental!");
            return;
        }

        var id = cancel_response + '-total'
        console.log("cancel id: " + id);
        document.getElementById(id).innerHTML ++;

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}
document.getElementById("bottom-button-cancel").addEventListener("click", fetchCancel);

export default arrowTracker;