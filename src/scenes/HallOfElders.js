import { Scene } from 'phaser';
import Player from '../game_objects/player.js';

export class HallOfElders extends Scene {
    constructor() {
        super('HallOfElders');
    }

    preload() {
      this.load.image("church_props", "./assets/tilesets/props/church_props.png");
      this.load.image("church_walls", "./assets/tilesets/dungeon_walls/stone_and_iron_v2.png");
      this.load.image("hall_of_elders_floor", "./assets/tilesets/floor_textures/hall_of_elders_floor.png");
      this.load.tilemapTiledJSON('hall_of_elders', './assets/scene_maps/hall_of_elders.tmj');
    }

    create() {
      const map = this.make.tilemap({ key: 'hall_of_elders' });
      const floor_tiles = map.addTilesetImage('hall_of_elders_floor', 'hall_of_elders_floor');
      const wall_tiles = map.addTilesetImage('stone_and_iron_v2', 'church_walls');
      const prop_tiles = map.addTilesetImage('church_props', 'church_props');
      
      const layer0 = map.createLayer(0, floor_tiles, 0, 0);
      const layer1 = map.createLayer(1, wall_tiles, 0, 0);
      const layer2 = map.createLayer(2, wall_tiles, 0, 64); //makes depth with optical illusion
      const layer3 = map.createLayer(3, prop_tiles, 0, 0);
      const layer4 = map.createLayer(4, wall_tiles, 0, 64);
      
      layer0.setPipeline('Light2D');
      layer1.setPipeline('Light2D');
      layer2.setPipeline('Light2D');
      layer3.setPipeline('Light2D');
      layer4.setPipeline('Light2D');
      
      this.player = new Player(this, 14*64, 12*128);

      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = {
        up: this.input.keyboard.addKey(87),
        down: this.input.keyboard.addKey(83),
        left: this.input.keyboard.addKey(65),
        right: this.input.keyboard.addKey(68),
      };
      this.cameras.main.startFollow(this.player);
    }

    should_return_to_town(y) {
      return y>14*128;
    }
    
    update(time) {
      this.player.update(this, this.grid_map, this.paths);
      if(this.should_return_to_town(this.player.y)) {
        this.scene.start('Town', {from: 'HallOfElders'});
      }
    }
}
