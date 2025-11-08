import { Scene } from 'phaser';
import Player from '../game_objects/player.js';

export class Town extends Scene {
    constructor() {
        super('Town');
    }

    init(params) {
      if(params.from=='HallOfElders') {
        this.player_start_x = 14*64;
        this.player_start_y = 64;
      } else {
        this.player_start_x = 14*64;
        this.player_start_y = 9*128;
      }
    }

    preload() { }

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
        { x: 866.8906478386682, y: 1216.9326230423305},
        { x: 1116.7229984726332, y: 1227.794957976071},
        { x: 1134.7761617274227, y: 311.75234834046745},
        { x: 847.6238775882631, y: 312.7398333344293},
      ];
      for(var idx in light_cords) {
        this.place_light(light_cords[idx].x, light_cords[idx].y);
      }
    }

    create() {
      const map = this.make.tilemap({ key: 'town_map' });
      
      //TODO: why is canal_tiles broke?
      const canal_tiles = map.addTilesetImage('canal', 'canals');
      const town_wall_tiles= map.addTilesetImage('stone_and_iron_v2', 'dungeon_walls');
      const torch_tiles = map.addTilesetImage('torches', 'torches');
      const grass_tiles = map.addTilesetImage('grass', 'grass');
      const dirt_tiles = map.addTilesetImage('dirt', 'dirt');
      
      const layer0 = map.createLayer(0, dirt_tiles, 0, 0);
      const layer1 = map.createLayer(1, grass_tiles, 0, 0);
      const layer2 = map.createLayer(2, town_wall_tiles, 0, 0);
      const layer3 = map.createLayer(3, torch_tiles, 0, 0);
      const layer4 = map.createLayer(4, town_wall_tiles, 0, 64);
      const layer5 = map.createLayer(5, canal_tiles, 0, 0);
      
      // layer2.setCollisionByProperty({collides: true});
      layer2.setCollisionByExclusion([12, 6]);
      this.matter.world.convertTilemapLayer(layer2);
      layer5.setCollisionByExclusion([12, 6]);
      this.matter.world.convertTilemapLayer(layer5);

      layer0.setPipeline('Light2D');
      layer1.setPipeline('Light2D');
      layer2.setPipeline('Light2D');
      layer3.setPipeline('Light2D');
      layer4.setPipeline('Light2D');
      layer5.setPipeline('Light2D');

      this.add_lights();
      
      this.player = new Player(this, this.player_start_x, this.player_start_y);

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

    should_enter_hall_of_elders(y) {
      return y<32;
    }

    should_enter_player_housing(y) {
      return y>((10*128)-64)
    }
    
    update(time) {
      this.player.update(this, this.grid_map, this.paths);
      if(this.should_enter_hall_of_elders(this.player.y)) {
        this.scene.start('HallOfElders');
      } else if(this.should_enter_player_housing(this.player.y)) {
        this.scene.start('PlayersHouse', {from: 'Town'});
      }
    }
}
