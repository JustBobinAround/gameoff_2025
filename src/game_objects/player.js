import { Entity } from '../../src/game_objects/entity.js';
// import { PlayerOverlay } from './src/ui_overlay.js';

class Player extends Entity {
    constructor(scene, x, y) {
        super(scene, x, y);
        // const overlay = this.add(new PlayerOverlay(scene));
        // overlay.x+=100;
        scene.lights.enable();
        // scene.lights.setAmbientColor(0x808080);
        scene.lights.setAmbientColor(0x2e2e2e);
        this.light = scene.lights.addLight(x, y, 5000).setIntensity(2.5).setColor(0xffa81c);
        this.setDepth(1000);
    }


    update(scene, grid_map, paths) {
        if (scene.cursors.left.isDown || scene.wasd.left.isDown) {
            //x--
            this.move_left();
        }
        if (scene.cursors.right.isDown || scene.wasd.right.isDown) {
            //x++
            this.move_right();
        }
        if (scene.cursors.up.isDown || scene.wasd.up.isDown) {
            //y--
            this.move_up();
        }
        if (scene.cursors.down.isDown || scene.wasd.down.isDown) {
            //y++
            this.move_down();
        }
        super.update(scene, grid_map, paths);
        this.light.setPosition(this.x, this.y);
    }

}

export default Player;