import * as THREE from 'three';
import { GUI } from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';

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

    async initialize(debug: boolean = true) {
        this.camera = new THREE.PerspectiveCamera(35, this.width / this.height, 0.1, 1000);
        this.camera.position.set(12, 12, 12);

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

        this.background = new THREE.Color(0xffeecc);

        console.info('Loading HDR...');
        new RGBELoader().setPath('assets/').load('envmap.hdr', (texture) => {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            this.environment = texture;
            this.renderer.render(this, this.camera);

            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshStandardMaterial({color: 0xff9900});
            let cube = new THREE.Mesh(geometry, material);
            cube.position.y = 0.5;
            this.add(cube);
        });

        if (debug) {
            this.debugger = new GUI();

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