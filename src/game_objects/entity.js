import { GameObjects, Physics } from 'phaser';
import { to_str_cord, from_str_cord, cord} from '../generators/dungeon_generation.js';
// import { EntityLevelStats } from './src/item_generation.js';

export class Entity extends GameObjects.Container {
    constructor(scene, x, y, sprite) {
        super(scene, x, y, sprite);
        this.sprite = sprite;
        this.setSize(50, 50);
        // const rect = scene.add.rectangle(0, 0, 64, 64, 0x00ff00);
        // this.add(rect);
        // this.rect = rect;
        scene.add.existing(this);
        
        scene.matter.add.gameObject(this, {
            shape: { type: 'rectangle' },
        });
        this.setDepth(1000);
        // this.add.existing(test);
        // this.test = test;
        
        this.setFixedRotation();
        this.setFrictionAir(0.3);
        this.setMass(30);
        this.speed = 0.2;
        this.goto_cord = false;
        this.current_dash_amount = 0;
        this.dash_deceleration = 0.1;
        // this.level_stats = new EntityLevelStats(10,10,10,10);
        this.was_moving_left = false;
        this.was_moving_right = false;
        this.was_moving_up = false;
        this.was_moving_down = false;
    }

    request_dash(start_speed=2) {
      this.current_dash_amount = start_speed;
    }

    idle() {
      if(this.was_moving_left) {
        this.sprite.play('idle-left', true);
      } else if(this.was_moving_right){
        this.sprite.play('idle-right', true);
      } else if(this.was_moving_up) {
        this.sprite.play('idle-right', true);
      } else if(this.was_moving_down) {
        this.sprite.play('idle-right', true);
      }

      this.was_moving_left = false;
      this.was_moving_right = false;
    }

    move_left(scalar=1) {
        this.was_moving_left = true;
        // this.skin.play('run-left', true);
        this.thrustBack(this.speed*(scalar+this.current_dash_amount));
        this.sprite.play('run-left', true);
    }
    
    move_right(scalar=1) {
        this.was_moving_right = true;
        // this.skin.play('run-right', true);
        this.thrust(this.speed*(scalar+this.current_dash_amount));
        this.sprite.play('run-right', true);
    }
    
    move_up(scalar=1) {
        this.was_moving_up = true;
        this.thrustLeft(this.speed*(scalar+this.current_dash_amount));
        this.sprite.play('run-right', true);
    }
    
    move_down(scalar=1) {
        this.was_moving_down = true;
        this.thrustRight(this.speed*(scalar+this.current_dash_amount));
        this.sprite.play('run-right', true);
    }

    set_goto_cord(cord) {
      this.goto_cord = cord;
    }

    clear_coto_cord() {
      this.goto_cord = false;
    }

    goto_tile(tile_x, tile_y) {
      this.end_str_cord = to_str_cord(tile_x, tile_y);
    }

    update(scene, grid_map, paths) {
      const precision = 10*(this.current_dash_amount+1);

      if(this.goto_cord) {
        var dx = this.x - this.goto_cord.x;
        var dy = this.y - this.goto_cord.y;
        var disp_x = Math.abs(dx);
        var disp_y = Math.abs(dy);

        if((disp_x < precision) && (disp_y < precision)) {
          this.goto_cord = false;
        } else {
          var disp_x_cap = disp_x > precision ? precision : disp_x;
          var disp_y_cap = disp_y > precision ? precision : disp_y;
          var x_scalar = disp_x_cap/precision;
          var y_scalar = disp_y_cap/precision;
          if(dx > 0) {
            this.move_left(x_scalar);
          } else{
            this.move_right(x_scalar);
          }
            
          if(dy < 0) {
            this.move_down(y_scalar);
          } else {
            this.move_up(y_scalar);
          }
        }
      } else if(this.end_str_cord){
        const current_tile_x = grid_map.worldToTileX(this.x);
        const current_tile_y = grid_map.worldToTileY(this.y);
        var current_str_cord = to_str_cord(current_tile_x, current_tile_y);
        if(current_str_cord==this.end_str_cord) {
          this.end_str_cord = false;
          return;
        }
        if(!paths[this.end_str_cord]) {
          return;
        }
        if(!paths[this.end_str_cord][current_str_cord]) {
          return;
        }
        var action = paths[this.end_str_cord][current_str_cord];
        
        var next_tile_x = current_tile_x;
        var next_tile_y = current_tile_y;
        if(action=='U') {
          next_tile_y -= 1;
        } else if(action=='R') {
          next_tile_x += 1;
        } else if(action=='D') {
          next_tile_y += 1;
        } else {
          next_tile_x -= 1;
        }
        var next_cord_x = grid_map.tileToWorldX(next_tile_x);
        var next_cord_y = grid_map.tileToWorldY(next_tile_y);
        this.set_goto_cord(cord((next_tile_x*64)-32,(next_tile_y*128)+64));
      }
      if(this.current_dash_amount>0) {
        this.current_dash_amount -= this.dash_deceleration;
      }
    }
}
