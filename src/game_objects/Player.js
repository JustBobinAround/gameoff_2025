import { Entity } from '../../src/game_objects/Entity.js';
// import { PlayerOverlay } from './src/ui_overlay.js';

class Player extends Entity {
    constructor(scene, x, y, sprite) {
        const player_sprite= scene.add.sprite(0, -32);
        player_sprite.setScale(1);
        player_sprite.play('idle-right');
        
        super(scene, x, y, player_sprite);
        // const overlay = this.add(new PlayerOverlay(scene));
        // overlay.x+=100;
        scene.lights.enable();
        // scene.lights.setAmbientColor(0x808080);
        scene.lights.setAmbientColor(0x2e2e2e);
        this.light = scene.lights.addLight(x, y, 5000).setIntensity(2.5).setColor(0xffa81c);
        
        this.setDepth(1000);
        
    }

    update(scene, grid_map, paths) {
        var moved = false;
        if (scene.cursors.left.isDown || scene.wasd.left.isDown) {
            //x--
            moved = true;
            this.move_left();
        }
        if (scene.cursors.right.isDown || scene.wasd.right.isDown) {
            //x++
            moved = true;
            this.move_right();
        }
        if (scene.cursors.up.isDown || scene.wasd.up.isDown) {
            //y--
            moved = true;
            this.move_up();
        }
        if (scene.cursors.down.isDown || scene.wasd.down.isDown) {
            //y++
            moved = true;
            this.move_down();
        }
        if(!moved) {
            this.idle();
        }
        if(grid_map && paths) {
            super.update(scene, grid_map, paths);
        }
        this.light.setPosition(this.x, this.y);
    }

}

export default Player;