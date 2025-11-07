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
      this.load.image("torches", "./assets/tilesets/dungeon_walls/torches.png");
      this.load.atlas('flares', './assets/particles/flares.png', './assets/particles/flares.json');
      this.load.tilemapTiledJSON('map', './assets/scene_maps/player_cabin.tmj');
    }

    place_flame(x,y) {
        this.add.particles(x, y, 'flares',
        {
            frame: 'white',
            color: [ 0xfacc22, 0xf89800, 0xf83600, 0x9f0404 ],
            colorEase: 'quad.out',
            lifespan: 1200,
            angle: { min: -100, max: -80 },
            scale: { start: 0.1, end: 0, ease: 'sine.out' },
            speed: 25,
            advance: 200,
            blendMode: 'ADD'
        });
    }

    place_light(x, y) {
        console.log({x: x, y: y});
        this.lights.addLight(x, y, 480).setIntensity(1).setColor(0xffa81c);
        this.place_flame(x,y);
    }

    add_lights() {
      var light_cords = [
        { x: 474.5487615727334, y: 957.9701680604012 },
        { x: 476.97597556402565, y: 1469.803055286996 },
        { x: 33.858676353823626, y: 576.4683673376217 },
        { x: 33.858676353829765, y: 319.72226890371473 },
        { x: 286.65346592808356, y: 186.41179471689134 },
        { x: 1056.7618996569913, y: 186.38639566519566 },
        { x: 1243.6915510097938, y: 572.7875227590414 },
        { x: 802.5361105277515, y: 955.0034799031854 },
        { x: 802.540477383064, y: 1469.8115216375602 },
        { x: 1244.4005010442781, y: 1980.4301602042847 },
        { x: 35.12031876166509, y: 1983.4095478873262 },
        { x: 1244.6353621038359, y: 317.72613303941455 },
        { x: 286.9276286855937, y: 1848.060606083344 },
        { x: 992.0972674957449, y: 1849.0777233043111 },
        { x: 802.4968088297958, y: 2492.750440164904 },
        { x: 476.8153511339858, y: 2508.5502000685938 },
      ];
      for(var idx in light_cords) {
        this.place_light(light_cords[idx].x, light_cords[idx].y);
      }
    }

    create() {
      const map = this.make.tilemap({ key: 'map' });
      const wall_tiles= map.addTilesetImage('stone_and_iron_v2', 'cabin_walls');
      const floor_tiles = map.addTilesetImage('hall_of_elders_floor', 'cabin_floors');
      const torch_tiles = map.addTilesetImage('torches', 'torches');
      
      const layer0 = map.createLayer(0, floor_tiles, 0, 0);
      const layer1 = map.createLayer(1, wall_tiles, 0, 0);
      const layer2 = map.createLayer(2, torch_tiles, 0, 0);
      const layer3 = map.createLayer(3, wall_tiles, 0, 64);
      
      layer0.setPipeline('Light2D');
      layer1.setPipeline('Light2D');
      layer2.setPipeline('Light2D');
      layer3.setPipeline('Light2D');
      
      this.player = new Player(this, this.player_start_x, this.player_start_y);
      this.add_lights();

      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = {
        up: this.input.keyboard.addKey(87),
        down: this.input.keyboard.addKey(83),
        left: this.input.keyboard.addKey(65),
        right: this.input.keyboard.addKey(68),
      };
      this.input.on('pointerdown', pointer => {
          this.place_light(pointer.worldX, pointer.worldY);
      });
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
