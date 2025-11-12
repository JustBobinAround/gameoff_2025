import { Scene } from 'phaser';
import Player from '../game_objects/Player.js';

export class HallOfElders extends Scene {
    constructor() {
        super('HallOfElders');
    }

    preload() {
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
        { x: 546.9341417177793, y: 1600.3181872652863 },
        { x: 1373.2328455744355, y: 1598.1122204361543 },
        { x: 1372.2322653616748, y: 1339.8489125214612 },
        { x: 547.8997870879061, y: 1340.8363975153786 },
        { x: 98.27434976631844, y: 1339.8489125213703 },
        { x: 546.5901092749596, y: 956.1538444952085 },
        { x: 1372.5064281191458, y: 956.1369117940451 },
        { x: 1820.8964242953884, y: 1340.302439853153 },
        { x: 1821.8839039422592, y: 1597.586729124529 },
        { x: 99.5097909118166, y: 1595.6202254871553 },
      ];
      for(var idx in light_cords) {
        this.place_light(light_cords[idx].x, light_cords[idx].y);
      }
    }
    
    create() {
      const map = this.make.tilemap({ key: 'hall_of_elders' });
      const floor_tiles = map.addTilesetImage('hall_of_elders_floor', 'hall_of_elders_floor');
      const wall_tiles = map.addTilesetImage('stone_and_iron_v2', 'dungeon_walls');
      const torch_tiles = map.addTilesetImage('torches', 'torches');
      const prop_tiles = map.addTilesetImage('church_props', 'church_props');
      
      const layer0 = map.createLayer(0, floor_tiles, 0, 0);
      const layer1 = map.createLayer(1, wall_tiles, 0, 0);
      const layer2 = map.createLayer(2, torch_tiles, 0, 0);
      const layer3 = map.createLayer(3, wall_tiles, 0, 64); //makes depth with optical illusion
      const layer4 = map.createLayer(4, prop_tiles, 0, 0);
      const layer5 = map.createLayer(5, wall_tiles, 0, 64);
      
      layer1.setCollisionByExclusion([12, 6]);
      this.matter.world.convertTilemapLayer(layer1);
      layer4.setCollisionByExclusion([12, 6]);
      this.matter.world.convertTilemapLayer(layer4);
      layer5.setCollisionByExclusion([12, 6]);
      this.matter.world.convertTilemapLayer(layer5);
      
      layer0.setPipeline('Light2D');
      layer1.setPipeline('Light2D');
      layer2.setPipeline('Light2D');
      layer3.setPipeline('Light2D');
      layer4.setPipeline('Light2D');
      layer5.setPipeline('Light2D');
      
      this.add_lights();
      this.player = new Player(this, 896, 1536);

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

    should_return_to_town(y) {
      return y>1792;
    }
    
    update(time) {
      this.player.update(this, this.grid_map, this.paths);
      if(this.should_return_to_town(this.player.y)) {
        this.scene.start('Town', {from: 'HallOfElders'});
      }
    }
}
