"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const basic_scene_1 = __importDefault(require("./basic_scene"));
const scene = new basic_scene_1.default();
scene.initialize();
function loop() {
    scene.camera.updateProjectionMatrix();
    scene.renderer.render(scene, scene.camera);
    scene.orbitals.update();
    requestAnimationFrame(loop);
}
loop();
//# sourceMappingURL=index.js.map