import * as THREE from 'three';
import { GUI } from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils';
import { makeNoise2D } from 'fast-simplex-noise';

/**
 * A class to set up some basic scene elements to minimize code in the
 * main execution file.
 */
export default class BasicScene extends THREE.Scene {
    debugger: GUI;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    orbitals: OrbitControls;
    width = window.innerWidth;
    height = window.innerHeight;
    debug = false;

    initialize(debug: boolean = false) {
        this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 1000);
        this.camera.position.set(17, 31, 33);

        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('app') as HTMLCanvasElement,
            antialias: true,
        });
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.physicallyCorrectLights = true;
        this.renderer.setSize(this.width, this.height);

        BasicScene.addWindowResizing(this.camera, this.renderer);

        this.orbitals = new OrbitControls(this.camera, this.renderer.domElement);
        this.orbitals.dampingFactor = 0.05;
        this.orbitals.enableDamping = true;

        this.background = new THREE.Color(0xffeecc);

        console.info('Loading HDR...');
        new RGBELoader().setPath('assets/').load('envmap.hdr', (texture) => {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            this.environment = texture;
            this.renderer.render(this, this.camera);

            this.generateTerrain(22, 22);
        });

        if (debug) {
            this.debugger = new GUI();

            const cameraGroup = this.debugger.addFolder('Camera');
            cameraGroup.add(this.camera, 'fov', 20, 80);
            cameraGroup.add(this.camera, 'zoom', 0, 1);
            cameraGroup.open();
        }
    }

    generateTerrain(width: number, depth: number) {
        let geometry: THREE.BufferGeometry = new THREE.BoxGeometry(0, 0, 0);

        function createHex(height: number, position: THREE.Vector2) {
            let geo = new THREE.CylinderGeometry(1, 1, height, 6, 1, false);
            geo.translate(position.x, height * 0.5, position.y);
            geometry = mergeBufferGeometries([geometry, geo]);
        }

        const maxHeight = 10;
        const terrainRadius = 16;
        let noise = makeNoise2D();
        for (let i = -width/2; i < width/2; i++) {
            for (let j = -depth/2; j < depth/2; j++) {
                const position = new THREE.Vector2((i + (j % 2) * 0.5) * 1.77, j * 1.535);
                if (position.length() > terrainRadius) continue;
                createHex(Math.pow((noise(i * 0.1, j * 0.1) + 1) * 0.5, 1.5) * maxHeight, position);
            }
        }

        let terrain = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({flatShading: true}));
        this.add(terrain);
    }

    static addWindowResizing(camera: THREE.PerspectiveCamera, renderer: THREE.Renderer) {
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }, false);
    }
}