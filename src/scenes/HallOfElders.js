import { Scene } from 'phaser';
import Player from '../game_objects/player.js';

export class HallOfElders extends Scene {
    constructor() {
        super('HallOfElders');
    }

    preload() {
      this.load.image("hall_of_elders_floor", "./assets/tilesets/floor_textures/hall_of_elders_floor.png");
      this.load.tilemapTiledJSON('hall_of_elders', './assets/scene_maps/hall_of_elders.tmj');
    }

    create() {
      const map = this.make.tilemap({ key: 'hall_of_elders' });
      const floor_tiles = map.addTilesetImage('hall_of_elders_floor', 'hall_of_elders_floor');
      const layer0 = map.createLayer(0, floor_tiles, 0, 0);
      
      this.player = new Player(this, 0, 0);

      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = {
        up: this.input.keyboard.addKey(87),
        down: this.input.keyboard.addKey(83),
        left: this.input.keyboard.addKey(65),
        right: this.input.keyboard.addKey(68),
      };
      this.cameras.main.startFollow(this.player);
    }

    // check_exit_bounds(y) {
    //   return y>820;
    // }
    
    update(time) {
      this.player.update(this, this.grid_map, this.paths);
      // if(this.check_exit_bounds(this.player.y)) {
      //   this.scene.start('Town');
      // }
    }
}
