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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const THREE = __importStar(require("three"));
const dat_gui_1 = require("dat.gui");
const OrbitControls_1 = require("three/examples/jsm/controls/OrbitControls");
const RGBELoader_1 = require("three/examples/jsm/loaders/RGBELoader");
const BufferGeometryUtils_1 = require("three/examples/jsm/utils/BufferGeometryUtils");
const fast_simplex_noise_1 = require("fast-simplex-noise");
const three_1 = require("three");
/**
 * A class to set up some basic scene elements to minimize code in the
 * main execution file.
 */
class BasicScene extends THREE.Scene {
    constructor() {
        super(...arguments);
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.debug = false;
    }
    initialize(debug = false) {
        this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 1000);
        this.camera.position.set(17, 31, 33);
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('app'),
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
        const light = new THREE.PointLight(new THREE.Color(0xFFCB8E).convertSRGBToLinear().convertSRGBToLinear(), 80, 200, 1);
        light.position.set(10, 20, 10);
        light.castShadow = true;
        light.shadow.mapSize.width = 512;
        light.shadow.mapSize.height = 512;
        light.shadow.camera.near = 0.5;
        light.shadow.camera.far = 500;
        this.add(light);
        this.orbitals = new OrbitControls_1.OrbitControls(this.camera, this.renderer.domElement);
        this.orbitals.dampingFactor = 0.05;
        this.orbitals.enableDamping = true;
        console.info('Loading HDR...');
        new RGBELoader_1.RGBELoader().setPath('assets/').load('envmap.hdr', (texture) => {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            this.environment = texture;
            this.renderer.render(this, this.camera);
            this.generateTerrain(22, 22);
            this.generateClouds();
        });
        if (debug) {
            this.debugger = new dat_gui_1.GUI();
            const cameraGroup = this.debugger.addFolder('Camera');
            cameraGroup.add(this.camera, 'fov', 20, 80);
            cameraGroup.add(this.camera, 'zoom', 0, 1);
            cameraGroup.open();
        }
    }
    generateTerrain(width, depth) {
        return __awaiter(this, void 0, void 0, function* () {
            const geometry = {
                stone: new THREE.BoxGeometry(0, 0, 0),
                dirt: new THREE.BoxGeometry(0, 0, 0),
                dirt2: new THREE.BoxGeometry(0, 0, 0),
                sand: new THREE.BoxGeometry(0, 0, 0),
                grass: new THREE.BoxGeometry(0, 0, 0),
            };
            const maxHeight = 10;
            const stoneHeight = maxHeight * 0.8;
            const dirtHeight = maxHeight * 0.7;
            const grassHeight = maxHeight * 0.5;
            const sandHeight = maxHeight * 0.3;
            const dirt2Height = maxHeight * 0;
            function stone(height, position) {
                const dx = Math.random() * 0.4;
                const dz = Math.random() * 0.4;
                const geometry = new THREE.SphereGeometry(Math.random() * 0.3 + 0.1, 7, 7);
                geometry.translate(position.x + dx, height, position.y + dz);
                return geometry;
            }
            function tree(height, position) {
                const treeHeight = Math.random() + 1.25;
                const geometry1 = new THREE.CylinderGeometry(0, 1.5, treeHeight, 3);
                geometry1.translate(position.x, height + 1, position.y);
                const geometry2 = new THREE.CylinderGeometry(0, 1.15, treeHeight, 3);
                geometry2.translate(position.x, height + treeHeight * 0.6 + 1, position.y);
                const geometry3 = new THREE.CylinderGeometry(0, 0.8, treeHeight, 3);
                geometry3.translate(position.x, height + treeHeight * 1.25 + 1, position.y);
                return (0, BufferGeometryUtils_1.mergeBufferGeometries)([geometry1, geometry2, geometry3]);
            }
            function createHex(height, position) {
                let geo = new THREE.CylinderGeometry(1, 1, height, 6, 1, false);
                geo.translate(position.x, height * 0.5, position.y);
                if (height > stoneHeight) {
                    geometry.stone = (0, BufferGeometryUtils_1.mergeBufferGeometries)([geometry.stone, geo]);
                    if (Math.random() > 0.8) {
                        geometry.stone = (0, BufferGeometryUtils_1.mergeBufferGeometries)([geometry.stone, stone(height, position)]);
                    }
                }
                else if (height > dirtHeight) {
                    geometry.dirt = (0, BufferGeometryUtils_1.mergeBufferGeometries)([geometry.dirt, geo]);
                    if (Math.random() > 0.8) {
                        geometry.grass = (0, BufferGeometryUtils_1.mergeBufferGeometries)([geometry.grass, tree(height, position)]);
                    }
                }
                else if (height > grassHeight) {
                    geometry.grass = (0, BufferGeometryUtils_1.mergeBufferGeometries)([geometry.grass, geo]);
                }
                else if (height > sandHeight) {
                    geometry.sand = (0, BufferGeometryUtils_1.mergeBufferGeometries)([geometry.sand, geo]);
                    if (Math.random() > 0.8) {
                        geometry.stone = (0, BufferGeometryUtils_1.mergeBufferGeometries)([geometry.stone, stone(height, position)]);
                    }
                }
                else if (height > dirt2Height) {
                    geometry.dirt2 = (0, BufferGeometryUtils_1.mergeBufferGeometries)([geometry.dirt2, geo]);
                }
            }
            const textures = {
                dirt: yield new THREE.TextureLoader().setPath('assets/').loadAsync('dirt.png'),
                dirt2: yield new THREE.TextureLoader().setPath('assets/').loadAsync('dirt2.jpg'),
                grass: yield new THREE.TextureLoader().setPath('assets/').loadAsync('grass.jpg'),
                sand: yield new THREE.TextureLoader().setPath('assets/').loadAsync('sand.jpg'),
                water: yield new THREE.TextureLoader().setPath('assets/').loadAsync('water.jpg'),
                stone: yield new THREE.TextureLoader().setPath('assets/').loadAsync('stone.png'),
            };
            const terrainRadius = 16;
            let noise = (0, fast_simplex_noise_1.makeNoise2D)();
            for (let i = -width / 2; i < width / 2; i++) {
                for (let j = -depth / 2; j < depth / 2; j++) {
                    const position = new THREE.Vector2((i + (j % 2) * 0.5) * 1.77, j * 1.535);
                    if (position.length() > terrainRadius)
                        continue;
                    createHex(Math.pow((noise(i * 0.1, j * 0.1) + 1) * 0.5, 1.5) * maxHeight, position);
                }
            }
            function createMesh(geometry, texture) {
                const mesh = new THREE.Mesh(geometry, new THREE.MeshPhysicalMaterial({
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
            const water = new THREE.Mesh(new THREE.CylinderGeometry(17, 17, maxHeight * 0.2, 50), new THREE.MeshPhysicalMaterial({
                color: new THREE.Color(0x55aaff).convertSRGBToLinear().multiplyScalar(3),
                ior: 1.4,
                transmission: 1,
                transparent: true,
                envMapIntensity: 0.2,
                roughness: 1,
                metalness: 0.025,
                roughnessMap: textures.water,
                metalnessMap: textures.water,
                //@ts-ignore
                thickness: 1.5,
            }));
            water.receiveShadow = true;
            water.position.set(0, maxHeight * 0.1, 0);
            this.add(water);
            const container = new THREE.Mesh(new THREE.CylinderGeometry(17.1, 17.1, maxHeight * 0.25, 50, 1, true), new THREE.MeshPhysicalMaterial({
                envMapIntensity: 0.2,
                map: textures.dirt,
                side: THREE.DoubleSide,
            }));
            container.receiveShadow = true;
            container.position.set(0, maxHeight * 0.125, 0);
            this.add(container);
            const floor = new THREE.Mesh(new THREE.CylinderGeometry(18.5, 18.5, maxHeight * 0.25, 50), new THREE.MeshPhysicalMaterial({
                envMapIntensity: 0.1,
                map: textures.dirt2,
                side: THREE.DoubleSide,
            }));
            floor.receiveShadow = true;
            floor.position.set(0, -maxHeight * 0.06, 0);
            this.add(floor);
        });
    }
    generateClouds() {
        let geometry = new THREE.SphereGeometry(0, 0, 0);
        const positions = [new THREE.Vector3(Math.random() * 20 - 10, Math.random() * 2.5 + 13.5, Math.random() * 20 - 10)];
        while (positions.length < 3) {
            const position = new THREE.Vector3(Math.random() * 20 - 10, Math.random() * 2.5 + 13.5, Math.random() * 20 - 10);
            let validPosition = true;
            for (const p of positions) {
                if (position.distanceTo(p) < 10) {
                    validPosition = false;
                }
            }
            if (validPosition) {
                positions.push(position);
            }
        }
        for (const p of positions) {
            for (const y of positions) {
                if (p == y)
                    continue;
                console.log(p.distanceTo(y));
            }
        }
        for (let i = 0; i < 3; i++) {
            const cloud1 = new THREE.SphereGeometry(1.2, 7, 7);
            const cloud2 = new THREE.SphereGeometry(1.5, 7, 7);
            const cloud3 = new THREE.SphereGeometry(0.9, 7, 7);
            cloud1.translate(-1.85, Math.random() * 0.3, 0);
            cloud2.translate(0, Math.random() * 0.3, 0);
            cloud3.translate(1.85, Math.random() * 0.3, 0);
            const cloudGeometry = (0, BufferGeometryUtils_1.mergeBufferGeometries)([cloud1, cloud2, cloud3]);
            cloudGeometry.rotateY(Math.random() * Math.PI * 2);
            cloudGeometry.translate(positions[i].x, positions[i].y, positions[i].z);
            geometry = (0, BufferGeometryUtils_1.mergeBufferGeometries)([geometry, cloudGeometry]);
        }
        this.add(new three_1.Mesh(geometry, new THREE.MeshStandardMaterial({
            envMapIntensity: 0.75,
            flatShading: true
        })));
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