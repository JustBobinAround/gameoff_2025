import { Scene } from 'phaser';
import Player from '../game_objects/player.js';

export class PlayersHouse extends Scene {
    constructor() {
        super('PlayersHouse');
    }

    init(params) {
      if(params.from=='Town') {
        this.player_start_x = (9*64)+32;
        this.player_start_y = 64;
      } else {
        this.player_start_x = 5*64;
        this.player_start_y = 8*128;
      }
    }

    preload() {
      this.load.image("cabin_walls", "./assets/tilesets/dungeon_walls/stone_and_iron_v2.png");
      this.load.image("cabin_floors", "./assets/tilesets/floor_textures/hall_of_elders_floor.png");
      this.load.tilemapTiledJSON('map', './assets/scene_maps/player_cabin.tmj');
    }

    create() {
      const map = this.make.tilemap({ key: 'map' });
      const wall_tiles= map.addTilesetImage('stone_and_iron_v2', 'cabin_walls');
      const floor_tiles = map.addTilesetImage('hall_of_elders_floor', 'cabin_floors');
      const layer0 = map.createLayer(0, floor_tiles, 0, 0);
      const layer1 = map.createLayer(1, wall_tiles, 0, 0);
      const layer2 = map.createLayer(2, wall_tiles, 0, 64);
      
      layer0.setPipeline('Light2D');
      layer1.setPipeline('Light2D');
      layer2.setPipeline('Light2D');
      
      this.player = new Player(this, this.player_start_x, this.player_start_y);

      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = {
        up: this.input.keyboard.addKey(87),
        down: this.input.keyboard.addKey(83),
        left: this.input.keyboard.addKey(65),
        right: this.input.keyboard.addKey(68),
      };
      this.cameras.main.startFollow(this.player);
    }

    check_exit_bounds(y) {
      return y<32;
    }
    
    update(time) {
      this.player.update(this, this.grid_map, this.paths);
      if(this.check_exit_bounds(this.player.y)) {
        this.scene.start('Town', {from: 'PlayerHouse'});
      }
    }
}
