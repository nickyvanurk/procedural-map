import * as THREE from 'three';
import { GUI } from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils';
import { makeNoise2D } from 'fast-simplex-noise';
import { Color, Mesh } from 'three';

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
        this.renderer.setSize(this.width, this.height);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.physicallyCorrectLights = true;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.background = new THREE.Color(0xffeecc);

        BasicScene.addWindowResizing(this.camera, this.renderer);

        const light = new THREE.PointLight(new Color(0xFFCB8E).convertSRGBToLinear().convertSRGBToLinear(), 80, 200, 1);
        light.position.set(10, 20, 10);
        light.castShadow = true;
        light.shadow.mapSize.width = 512;
        light.shadow.mapSize.height = 512;
        light.shadow.camera.near = 0.5;
        light.shadow.camera.far = 500;
        this.add(light);

        this.orbitals = new OrbitControls(this.camera, this.renderer.domElement);
        this.orbitals.dampingFactor = 0.05;
        this.orbitals.enableDamping = true;

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

    async generateTerrain(width: number, depth: number) {
        const geometry = {
            stone: new THREE.BoxGeometry(0, 0, 0) as THREE.BufferGeometry,
            dirt: new THREE.BoxGeometry(0, 0, 0) as THREE.BufferGeometry,
            dirt2: new THREE.BoxGeometry(0, 0, 0) as THREE.BufferGeometry,
            sand: new THREE.BoxGeometry(0, 0, 0) as THREE.BufferGeometry,
            grass: new THREE.BoxGeometry(0, 0, 0) as THREE.BufferGeometry,
        };

        const maxHeight = 10;
        const stoneHeight = maxHeight * 0.8;
        const dirtHeight = maxHeight * 0.7;
        const grassHeight = maxHeight * 0.5;
        const sandHeight = maxHeight * 0.3;
        const dirt2Height = maxHeight * 0;

        function createHex(height: number, position: THREE.Vector2) {
            let geo = new THREE.CylinderGeometry(1, 1, height, 6, 1, false);
            geo.translate(position.x, height * 0.5, position.y);

            if (height > stoneHeight) {
                geometry.stone = mergeBufferGeometries([geometry.stone, geo]);
            } else if (height > dirtHeight) {
                geometry.dirt = mergeBufferGeometries([geometry.dirt, geo]);
            } else if (height > grassHeight) {
                geometry.grass = mergeBufferGeometries([geometry.grass, geo]);
            } else if (height > sandHeight) {
                geometry.sand = mergeBufferGeometries([geometry.sand, geo]);
            } else if (height > dirt2Height) {
                geometry.dirt2 = mergeBufferGeometries([geometry.dirt2, geo]);
            }
        }

        const textures = {
            dirt: await new THREE.TextureLoader().setPath('assets/').loadAsync('dirt.png'),
            dirt2: await new THREE.TextureLoader().setPath('assets/').loadAsync('dirt2.jpg'),
            grass: await new THREE.TextureLoader().setPath('assets/').loadAsync('grass.jpg'),
            sand: await new THREE.TextureLoader().setPath('assets/').loadAsync('sand.jpg'),
            water: await new THREE.TextureLoader().setPath('assets/').loadAsync('water.jpg'),
            stone: await new THREE.TextureLoader().setPath('assets/').loadAsync('stone.png'),
        };


        const terrainRadius = 16;
        let noise = makeNoise2D();
        for (let i = -width/2; i < width/2; i++) {
            for (let j = -depth/2; j < depth/2; j++) {
                const position = new THREE.Vector2((i + (j % 2) * 0.5) * 1.77, j * 1.535);
                if (position.length() > terrainRadius) continue;
                createHex(Math.pow((noise(i * 0.1, j * 0.1) + 1) * 0.5, 1.5) * maxHeight, position);
            }
        }

        function createMesh(geometry: THREE.BufferGeometry, texture: THREE.Texture) {
            const mesh = new Mesh(geometry, new THREE.MeshPhysicalMaterial({
                flatShading: true,
                map: texture,
                envMapIntensity: 0.135,
            }));

            mesh.castShadow = true;
            mesh.receiveShadow = true;

            return mesh;
        }

        this.add(createMesh(geometry.stone, textures.stone));
        this.add(createMesh(geometry.dirt, textures.dirt));
        this.add(createMesh(geometry.grass, textures.grass));
        this.add(createMesh(geometry.sand, textures.sand));
        this.add(createMesh(geometry.dirt2, textures.dirt2));
    }

    static addWindowResizing(camera: THREE.PerspectiveCamera, renderer: THREE.Renderer) {
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }, false);
    }
}