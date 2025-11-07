import { Scene } from 'phaser';
import Player from '../game_objects/player.js';

export class Town extends Scene {
    constructor() {
        super('Town');
    }

    preload() {
      this.load.image("canals", "./assets/tilesets/city_walls/canal.png");
      this.load.image("cabins", "./assets/tilesets/city_walls/player_cabin_exterior.png");
      this.load.image("town_walls", "./assets/tilesets/dungeon_walls/stone_and_iron_v2.png");
      this.load.image("grass", "./assets/tilesets/floor_textures/grass.png");
      this.load.image("dirt", "./assets/tilesets/floor_textures/dirt.png");
      this.load.image("player_cabin_exterior", "./assets/tilesets/city_walls/player_cabin_exterior.png");
      this.load.tilemapTiledJSON('town_map', './assets/scene_maps/town.tmj');
    }

    create() {
      const map = this.make.tilemap({ key: 'town_map' });
      
      const canal_tiles = map.addTilesetImage('canal', 'canals');
      const town_wall_tiles= map.addTilesetImage('stone_and_iron_v2', 'town_walls');
      const cabin_tiles = map.addTilesetImage('player_cabin_exterior', 'player_cabin_exterior');
      const grass_tiles = map.addTilesetImage('grass', 'grass');
      const dirt_tiles = map.addTilesetImage('dirt', 'dirt');
      
      const layer0 = map.createLayer(0, dirt_tiles, 0, 0);
      const layer1 = map.createLayer(1, grass_tiles, 0, 0);
      const layer2 = map.createLayer(2, town_wall_tiles, 0, 0);
      const layer3 = map.createLayer(3, cabin_tiles, 0, 0);
      const layer4 = map.createLayer(4, canal_tiles, 0, 0);

      layer0.setPipeline('Light2D');
      layer1.setPipeline('Light2D');
      layer2.setPipeline('Light2D');
      layer3.setPipeline('Light2D');
      layer4.setPipeline('Light2D');
      
      this.player = new Player(this, 5*64, 5*128);

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
      return y<64;
    }
    
    update(time) {
      this.player.update(this, this.grid_map, this.paths);
      if(this.check_exit_bounds(this.player.y)) {
        this.scene.start('HallOfElders');
      }
    }
}
