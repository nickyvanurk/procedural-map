import BasicScene from "./basic_scene";

const scene = new BasicScene();
scene.initialize();

function loop() {
    scene.camera.updateProjectionMatrix();
    scene.renderer.render(scene, scene.camera);
    scene.orbitals.update();
    requestAnimationFrame(loop);
}
loop();