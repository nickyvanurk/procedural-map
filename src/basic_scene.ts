import * as THREE from 'three';
import { GUI } from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

/**
 * A class to set up some basic scene elements to minimize code in the
 * main execution file.
 */
export default class BasicScene extends THREE.Scene {
    debugger: GUI;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.Renderer;
    orbitals: OrbitControls;
    lights: Array<THREE.Light> = [];
    lightCount: number = 6;
    lightDistance: number = 3;
    width = window.innerWidth;
    height = window.innerHeight;
    debug = false;

    initialize(debug: boolean = true) {
        this.camera = new THREE.PerspectiveCamera(35, this.width / this.height, 0.1, 1000);
        this.camera.position.set(12, 12, 12);

        this.renderer = new THREE.WebGL1Renderer({
            canvas: document.getElementById('app') as HTMLCanvasElement,
            alpha: true,
        });
        this.renderer.setSize(this.width, this.height);

        BasicScene.addWindowResizing(this.camera, this.renderer);

        this.orbitals = new OrbitControls(this.camera, this.renderer.domElement);

        this.background = new THREE.Color(0xefefef);

        for (let i = 0; i < this.lightCount; i++) {
            const light = new THREE.PointLight(0xffffff, 1);
            let lightX = this.lightDistance * Math.sin(Math.PI * 2 / this.lightCount * i);
            let lightZ = this.lightDistance * Math.cos(Math.PI * 2 / this.lightCount * i);
            light.position.set(lightX, this.lightDistance, lightZ);
            light.lookAt(0, 0, 0);
            this.add(light);
            this.lights.push(light);
        }

        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshPhongMaterial({color: 0xff9900});
        let cube = new THREE.Mesh(geometry, material);
        cube.position.y = 0.5;
        this.add(cube);

        if (debug) {
            this.debugger = new GUI();

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

    static addWindowResizing(camera: THREE.PerspectiveCamera, renderer: THREE.Renderer) {
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }, false);
    }
}