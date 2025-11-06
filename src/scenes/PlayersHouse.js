import { Scene } from 'phaser';
import Player from '../game_objects/player.js';

export class PlayersHouse extends Scene {
    constructor() {
        super('PlayersHouse');
    }

    preload() {
      this.load.image("cabin_walls", "./assets/tilesets/city_walls/player_cabin.png");
      this.load.image("cabin_floors", "./assets/tilesets/floor_textures/player_cabin_floor.png");
      this.load.tilemapTiledJSON('map', './assets/scene_maps/player_cabin.tmj');
    }

    create() {
      const map = this.make.tilemap({ key: 'map' });
      const wall_tiles= map.addTilesetImage('player_cabin_walls', 'cabin_walls');
      const floor_tiles = map.addTilesetImage('player_cabin', 'cabin_floors');
      const layer0 = map.createLayer(0, floor_tiles, 0, 0);
      const layer1 = map.createLayer(1, wall_tiles, 0, 0);
      
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

    check_exit_bounds(y) {
      return y>820;
    }
    
    update(time) {
      this.player.update(this, this.grid_map, this.paths);
      if(this.check_exit_bounds(this.player.y)) {
        this.scene.start('Town');
      }
    }
}
