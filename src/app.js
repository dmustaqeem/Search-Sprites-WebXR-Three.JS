import * as THREE from 'three';
import { ARButton } from './libs/ARButton.js';
import variables from './style.css';


import text from './config.json';

import tuktukS from './Images/tuktuk_sprite.png';
import btsS from './Images/BTS_Prite.png';
import busS from './Images/bus_sprite.png';
import chinaS from './Images/china_sprite.png';
import chinaXHS from './Images/chingxha.png';
import nangkagS from './Images/nangkag_sprite.png';
import radioS from './Images/radio_sprite.png';
import yakkS from './Images/yak_keaw_sprite.png';
import yakwS from './Images/Yak_white_sprite.png';
import yimS from './Images/yim_sprite.png';
import blinkS from './Images/blink_sprite.png';
import bombS from './Images/bomb_sprite.png';
import bgm from './Images/bgm.mp3';
import bombM from './Images/Bomb.mp3';
import winM from './Images/Win.mp3';
import congrats from './Images/party-popper.png';

let camera, scene, renderer;
let controller, clock;

let tuktuk, tuktukA;
let bts, btsA;
let bus, busA;
let china, chinaA;
let chinaXH, chinaXHA;
let nangkag, nangkagA;
let radio, radioA;
let yakk, yakkA;
let yakw, yakwA;
let yim, yimA;
let blink, blinkA;
let bomb, bombA;
const geometry = new THREE.PlaneGeometry(0.1, 0.1);
var raycaster, rayCast = 0;
var mouse;
var score = 0;
var session, sessionFlag = 0;
var endMsg = -1;
var ar;

var objClicked = [];


init();
animate();

function init() {

    const container = document.createElement('div');
    document.body.appendChild(container);

    scene = new THREE.Scene();

    clock = new THREE.Clock();

    mouse = new THREE.Vector2();

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    light.position.set(0.5, 1, 0.25);
    scene.add(light);

    tuktuk = new THREE.TextureLoader().load(tuktukS);
    tuktukA = new TextureAnimator(tuktuk, text.tuktuk.texture.horizontal, text.tuktuk.texture.vertical, text.tuktuk.texture.total, text.tuktuk.texture.duration);

    bts = new THREE.TextureLoader().load(btsS);
    btsA = new TextureAnimator(bts, 15,1,15,50);

    bus = new THREE.TextureLoader().load(busS);
    busA = new TextureAnimator(bus, text.bus.texture.horizontal, text.bus.texture.vertical, text.bus.texture.total, text.bus.texture.duration);

    china = new THREE.TextureLoader().load(chinaS);
    chinaA = new TextureAnimator(china, text.china.texture.horizontal, text.china.texture.vertical, text.china.texture.total, text.china.texture.duration);

    chinaXH = new THREE.TextureLoader().load(chinaXHS);
    chinaXHA = new TextureAnimator(chinaXH, text.chinaXH.texture.horizontal, text.chinaXH.texture.vertical, text.chinaXH.texture.total, text.chinaXH.texture.duration);

    nangkag = new THREE.TextureLoader().load(nangkagS);
    nangkagA = new TextureAnimator(nangkag, text.nangkag.texture.horizontal, text.nangkag.texture.vertical, text.nangkag.texture.total, text.nangkag.texture.duration);

    radio = new THREE.TextureLoader().load(radioS);
    radioA = new TextureAnimator(radio, text.radio.texture.horizontal, text.radio.texture.vertical, text.radio.texture.total, text.radio.texture.duration);

    yakk = new THREE.TextureLoader().load(yakkS);
    yakkA = new TextureAnimator(yakk, text.yakk.texture.horizontal, text.yakk.texture.vertical, text.yakk.texture.total, text.yakk.texture.duration);

    yakw = new THREE.TextureLoader().load(yakwS);
    yakwA = new TextureAnimator(yakw, text.yakw.texture.horizontal, text.yakw.texture.vertical, text.yakw.texture.total, text.yakw.texture.duration);

    yim = new THREE.TextureLoader().load(yimS);
    yimA = new TextureAnimator(yim, text.yim.texture.horizontal, text.yim.texture.vertical, text.yim.texture.total, text.yim.texture.duration);

    blink = new THREE.TextureLoader().load(blinkS);
    blinkA = new TextureAnimator(blink, 15, 1, 15, 50); // texture, #horiz, #vert, #total, duration.


    bomb = new THREE.TextureLoader().load(bombS);
    bombA = new TextureAnimator(bomb, 15, 1, 14, 50); // texture, #horiz, #vert, #total, duration.

    for (var key of Object.keys(text)) {
        for (let i = 0; i < text[key].number; i++) {
            var obj = { id: text[key].name, name: text[key].name + i, staus: '0', value: '0', scale:text[key].size  };
            objClicked.push(obj);
        }
    }
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    container.appendChild(renderer.domElement);

    //

    const theme = `
        <div id = 'introCard' class="card card-1">
            <h2 class="card__title">Search the Sprites</h2>
        </div>
			`;

	let htmlContent = ''
	htmlContent += theme;
    var d = document.getElementById('Card');
    d.insertAdjacentHTML('beforeend', htmlContent);
    ar = new ARButton( renderer, { sessionInit: { optionalFeatures: [ 'dom-overlay' ], domOverlay: { root: document.body } } } ); 
    //document.body.appendChild(ar);

    function onSelect(event) {

        rayCast = 1;

    }

    

    controller = renderer.xr.getController(0);
    controller.updateMatrixWorld(true);
    camera.updateMatrixWorld(true);
    controller.addEventListener('select', onSelect);
    scene.add(controller);


    raycaster = new THREE.Raycaster();
    const listener = new THREE.AudioListener();
    camera.add(listener);

    // // create a global audio source
    const sound = new THREE.Audio(listener);

    // load a sound and set it as the Audio object's buffer
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load(bgm, function (buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(true);
        sound.setVolume(0.3);
        sound.play();
    });


    addSprites();

    

    //

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('touchend', onClick, false);


}

function sessionS(){
    if(sessionFlag == 0){
    session = renderer.xr.getSession();
    if(session != null && session.visibilityState == 'visible'){
        console.log(renderer.xr);
        document.getElementById('introCard').remove();

        const theme = `
        <div id = 'scoreCard' class="card-mini card-1">
            <h2 id = 'scoreCardHeader' class="card__title">Score: 0</h2>
        </div>
			`;

        let htmlContent = ''
        htmlContent += theme;
        
        var d = document.getElementById('Card');
        d.insertAdjacentHTML('beforeend', htmlContent);
        endMsg = 0;
        sessionFlag = 1;
        
    }
    }
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function objectIndex(name) {
    for (let i in objClicked) {
        if (objClicked[i].name == name) {
            return i;
        }
    }
}

function onClick(event) {
    mouse.x = (event.changedTouches[0].clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.changedTouches[0].clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(scene.children);
    if (rayCast == 1) {

        if (intersects.length > 0) {
            score++;
            document.getElementById('scoreCardHeader').innerHTML = 'Score: ' + score;
            var ind = objectIndex(intersects[0].object.name);
            if (objClicked[ind].id == 'yim') {
                objClicked[ind].status = 1;
                objClicked[ind].value = 0;
                scene.getObjectByName(intersects[0].object.name).material.map = bomb;
                const listener = new THREE.AudioListener();
                camera.add(listener);
                const sound = new THREE.Audio(listener);
                const audioLoader = new THREE.AudioLoader();
                audioLoader.load(bombM, function (buffer) {
                    sound.setBuffer(buffer);
                    sound.setVolume(0.5);
                    sound.play();
                });
            }
            else {
                objClicked[ind].status = 1;
                objClicked[ind].value = 0;
                scene.getObjectByName(intersects[0].object.name).material.map = blink;
                const listener = new THREE.AudioListener();
                camera.add(listener);
                const sound = new THREE.Audio(listener);
                const audioLoader = new THREE.AudioLoader();
                audioLoader.load(winM, function (buffer) {
                    sound.setBuffer(buffer);
                    sound.setVolume(0.5);
                    sound.play();
                });
            }
        }
        rayCast = 0;
    }
}

async function addSprites() {

    for (let i in objClicked) {
        if (objClicked[i].id == 'tuktuk') {
            var material = new THREE.MeshBasicMaterial({ map: tuktuk, transparent: true, side: THREE.DoubleSide });
        }
        if (objClicked[i].id == 'bts') {
            var material = new THREE.MeshBasicMaterial({ map: bts, transparent: true, side: THREE.DoubleSide });
        }
        if (objClicked[i].id == 'bus') {
            var material = new THREE.MeshBasicMaterial({ map: bus, transparent: true, side: THREE.DoubleSide });
        }
        if (objClicked[i].id == 'china') {
            var material = new THREE.MeshBasicMaterial({ map: china, transparent: true, side: THREE.DoubleSide });
        }
        if (objClicked[i].id == 'chinaXH') {
            var material = new THREE.MeshBasicMaterial({ map: chinaXH, transparent: true, side: THREE.DoubleSide });
        }
        if (objClicked[i].id == 'nangkag') {
            var material = new THREE.MeshBasicMaterial({ map: nangkag, transparent: true, side: THREE.DoubleSide });
        }
        if (objClicked[i].id == 'radio') {
            var material = new THREE.MeshBasicMaterial({ map: radio, transparent: true, side: THREE.DoubleSide });
        }
        if (objClicked[i].id == 'yakk') {
            var material = new THREE.MeshBasicMaterial({ map: yakk, transparent: true, side: THREE.DoubleSide });
        }
        if (objClicked[i].id == 'yakw') {
            var material = new THREE.MeshBasicMaterial({ map: yakw, transparent: true, side: THREE.DoubleSide });
        }
        if (objClicked[i].id == 'yim') {
            var material = new THREE.MeshBasicMaterial({ map: yim, transparent: true, side: THREE.DoubleSide });
        }
        var cube = new THREE.Mesh(geometry, material);
        cube.position.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 5 - 1).applyMatrix4(controller.matrixWorld);
        cube.quaternion.set(Math.random(), Math.random(), Math.random());
        cube.quaternion.setFromRotationMatrix(camera.matrixWorld);
        cube.name = objClicked[i].name;
        cube.scale.set(objClicked[i].size, objClicked[i].size, objClicked[i].size);
        objClicked[i].status = 0;
        objClicked[i].value = 0;
        scene.add(cube);
    }
}

async function updateSprites() {
    const dt = clock.getDelta();
    tuktukA.update(dt * 1000);
    btsA.update(dt * 1000);
    busA.update(dt * 1000);
    chinaA.update(dt * 1000);
    chinaXHA.update(dt * 1000);
    nangkagA.update(dt * 1000);
    yakkA.update(dt * 1000);
    yakwA.update(dt * 1000);
    yimA.update(dt * 1000);
    blinkA.update(dt * 1000);
    bombA.update(dt * 1000);

    for (let i in objClicked) {
        if (objClicked[i].status == 1) {
            objClicked[i].value++;
            if (objClicked[i].value > 70) {
                objClicked[i].status = 0;
                objClicked[i].value = 0;
                if (objClicked[i].id == 'tuktuk') {
                    scene.getObjectByName(objClicked[i].name).material.map = tuktuk;
                }
                if (objClicked[i].id == 'bts') {
                    scene.getObjectByName(objClicked[i].name).material.map = bts;
                }
                if (objClicked[i].id == 'bus') {
                    scene.getObjectByName(objClicked[i].name).material.map = bus;
                }
                if (objClicked[i].id == 'china') {
                    scene.getObjectByName(objClicked[i].name).material.map = china;
                }
                if (objClicked[i].id == 'chinaXH') {
                    scene.getObjectByName(objClicked[i].name).material.map = chinaXH;
                }
                if (objClicked[i].id == 'nangkag') {
                    scene.getObjectByName(objClicked[i].name).material.map = nangkag;
                }
                if (objClicked[i].id == 'radio') {
                    scene.getObjectByName(objClicked[i].name).material.map = radio;
                }
                if (objClicked[i].id == 'yakk') {
                    scene.getObjectByName(objClicked[i].name).material.map = yakk;
                }
                if (objClicked[i].id == 'yakw') {
                    scene.getObjectByName(objClicked[i].name).material.map = yakw;
                }
                if (objClicked[i].id == 'yim') {
                    scene.getObjectByName(objClicked[i].name).material.map = yim;
                }

                scene.getObjectByName(objClicked[i].name).position.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 5 - 1).applyMatrix4(camera.matrixWorld);
            }
        }


    }

}


//

function endMessage(){
    if(endMsg == 0 && renderer.xr.isPresenting == false){
        var d = document.getElementById('Card');
        
        const theme = `
        <div id = 'scoreCard2' class="card-end card-1">
        </div>
			`;

        let htmlContent = ''
        htmlContent += theme;
        d.insertAdjacentHTML('beforeend', htmlContent);

        var cardD = document.getElementById('scoreCard2');
        var img = document.createElement('img');
        img.src = congrats;
        img.height = 320;
        img.weight = 240;
        cardD.appendChild(img);
        
        var hTag = document.createElement('h2');
        hTag.setAttribute("id","scoreCardHeader");
        hTag.classList.add("card-end-title");
        hTag.textContent += "Congratulations";
        cardD.appendChild(hTag);

        var hTag2 = document.createElement('h2');
        hTag2.setAttribute("id","scoreCardBoard");
        hTag2.classList.add("card-end-title2");
        hTag2.textContent += "Your Score is:  " + score;
        hTag.appendChild(hTag2);

        endMsg = 1;
        
        document.getElementById('scoreCard').remove();
    }
}


//

function animate() {

    renderer.setAnimationLoop(render);

}

function render() {
    endMessage();
    sessionS();
    updateSprites();
    
    renderer.render(scene, camera);
}



function TextureAnimator(texture, tilesHoriz, tilesVert, numTiles, tileDispDuration) {

    this.tilesHorizontal = tilesHoriz;
    this.tilesVertical = tilesVert;
    this.numberOfTiles = numTiles;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1 / this.tilesHorizontal, 1 / this.tilesVertical);
    this.tileDisplayDuration = tileDispDuration;
    this.currentDisplayTime = 0;
    this.currentTile = 0;

    this.update = function (milliSec) {
        this.currentDisplayTime += milliSec;
        while (this.currentDisplayTime > this.tileDisplayDuration) {
            this.currentDisplayTime -= this.tileDisplayDuration;
            this.currentTile++;
            if (this.currentTile == this.numberOfTiles)
                this.currentTile = 0;
            var currentColumn = this.currentTile % this.tilesHorizontal;
            texture.offset.x = currentColumn / this.tilesHorizontal;
            var currentRow = Math.floor(this.currentTile / this.tilesHorizontal);
            texture.offset.y = currentRow / this.tilesVertical;
        }
    };
}


