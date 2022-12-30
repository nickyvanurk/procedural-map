"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const THREE = __importStar(require("three"));
const dat_gui_1 = require("dat.gui");
const OrbitControls_1 = require("three/examples/jsm/controls/OrbitControls");
/**
 * A class to set up some basic scene elements to minimize code in the
 * main execution file.
 */
class BasicScene extends THREE.Scene {
    constructor() {
        super(...arguments);
        this.lights = [];
        this.lightCount = 6;
        this.lightDistance = 3;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
    }
    initialize(debug = true, addGridHelper = true) {
        this.camera = new THREE.PerspectiveCamera(35, this.width / this.height, 0.1, 1000);
        this.camera.position.set(12, 12, 12);
        this.renderer = new THREE.WebGL1Renderer({
            canvas: document.getElementById('app'),
            alpha: true,
        });
        BasicScene.addWindowResizing(this.camera, this.renderer);
        this.orbitals = new OrbitControls_1.OrbitControls(this.camera, this.renderer.domElement);
        if (addGridHelper) {
            this.add(new THREE.GridHelper(10, 10, 'red'));
            this.add(new THREE.AxesHelper(3));
        }
        this.background = new THREE.Color(0xefefef);
        for (let i = 0; i < this.lightCount; i++) {
            const light = new THREE.PointLight(0xfff, 1);
            let lightX = this.lightDistance * Math.sin(Math.PI * 2 / this.lightCount * i);
            let lightZ = this.lightDistance * Math.cos(Math.PI * 2 / this.lightCount * i);
            light.position.set(lightX, this.lightDistance, lightZ);
            light.lookAt(0, 0, 0);
            this.add(light);
            this.lights.push(light);
            if (addGridHelper) {
                this.add(new THREE.PointLightHelper(light, 0.5, 0xff9900));
            }
        }
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshPhongMaterial({ color: 0xff9900 });
        let cube = new THREE.Mesh(geometry, material);
        cube.position.y = 0.5;
        this.add(cube);
        if (debug) {
            this.debugger = new dat_gui_1.GUI();
            const lightGroup = this.debugger.addFolder('Lights');
            for (let i = 0; i < this.lights.length; i++) {
                lightGroup.add(this.lights[i], 'visible', true);
            }
            lightGroup.open();
            const cubeGroup = this.debugger.addFolder('Cube');
            cubeGroup.add(cube.position, 'x', -10, 10);
            cubeGroup.add(cube.position, 'y', 0.5, 10);
            cubeGroup.add(cube.position, 'z', -10, 10);
            cubeGroup.open();
            const cameraGroup = this.debugger.addFolder('Camera');
            cameraGroup.add(this.camera, 'fov', 20, 80);
            cameraGroup.add(this.camera, 'zoom', 0, 1);
            cameraGroup.open();
        }
    }
    static addWindowResizing(camera, renderer) {
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }, false);
    }
}
exports.default = BasicScene;
//# sourceMappingURL=basic_scene.js.map