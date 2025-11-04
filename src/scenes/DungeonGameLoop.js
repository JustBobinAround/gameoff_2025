import { Scene, Geom, Tilemaps, Input } from 'phaser';
import Player from '../game_objects/player.js';


import { 
    pre_gen_world,
    gen_world,
    clean_world,
    upscale_world,
    upscale_world_2,
    calculate_paths,
    make_path_grid,
    from_str_cord,
    to_str_cord,
    calc_display_tiles,
    get_player_spawn,
    calc_torch_placements,
    cord
} from "../generators/dungeon_generation.js";

export class DungeonGameLoop extends Scene {
    constructor () {
        super('DungeonGameLoop');
    }

    preload() {
        this.load.image("gravel_floorset", "./assets/tilesets/floor_textures/gravel.png");
        this.load.image("stone_and_iron_wallset", "./assets/tilesets/dungeon_walls/stone_and_iron_v2.png");
        this.load.image("debug_arrows", "./assets/tilesets/debug/arrows.png");
        this.load.json("collision_data", "./assets/tilesets/dungeon_walls/collision_data_v2.json")
    }

    build_key_handler() {
        this.input.keyboard.on('keydown-E', function (event) {
            this.scene.switch('Inventory');
        }, this);
    }
    
    build_mouse_handler(grid_map, paths) {
        console.log(paths);
        this.grid_map = grid_map;
        this.paths = paths;
        this.input.mousePointer.motionFactor = 0.5;
        this.input.pointer1.motionFactor = 0.5;
        var cam = this.cameras.main;
        var player = this.player;
        
        this.input.on('pointerdown', function (pointer) {
            if (!pointer.rightButtonDown()) return;
            player.request_dash();
        });
        
        this.input.on('pointerdown', function (pointer) {
            if (!pointer.leftButtonDown()) return;


            const { x, y } = pointer.position;


            const tile_x = grid_map.worldToTileX(pointer.worldX);
            const tile_y = grid_map.worldToTileY(pointer.worldY);
            player.goto_tile(tile_x, tile_y);

            var start_cord = to_str_cord(tile_x, tile_y);

            if(paths[start_cord]) {
                var test_paths = paths[start_cord];

                for(var end_str_cord in test_paths) {
                    var end_cord = from_str_cord(end_str_cord);
                    if(test_paths[end_str_cord]=='U') {
                        grid_map.putTileAt(0,end_cord.x, end_cord.y);
                    } else if(test_paths[end_str_cord]=='R') {
                        grid_map.putTileAt(1,end_cord.x, end_cord.y);
                    } else if(test_paths[end_str_cord]=='D') {
                        grid_map.putTileAt(2,end_cord.x, end_cord.y);
                    } else {
                        grid_map.putTileAt(3,end_cord.x, end_cord.y);
                    }
                }
                grid_map.putTileAt(4,tile_x, tile_y);
            }
        });
    }

    build_tilemap(map_data, image_name, offset_x, offset_y, collision_override=false, w_override=64, h_override=64) {
        const map = this.make.tilemap({ data: map_data, tileWidth: w_override, tileHeight: h_override });
        const tileset= map.addTilesetImage(image_name);
        
        if(collision_override) {
            var tilemap_json = this.cache.json.get(collision_override);
            var parsed_tilesets = Tilemaps.Parsers.Tiled.ParseTilesets({
                tilesets:[tilemap_json]
            });
            map.tilesets[0].tileData = parsed_tilesets.tilesets[0].tileData;
        }
        
        const layer = map.createLayer(0, tileset , offset_x, offset_y);

        return {
            map,
            layer,
        };
    }
    
    build_floor(world) {
        var floor = [];
        for(var j = 0; j < world.length; j++) {
            floor.push([]);
            for(var i = 0; i < world[j].length; i++) {
                floor[j].push(6);
            }
        }

        console.log(floor);
        return floor;
    }

    place_lights(torch_tilemap) {
        for(var j = 0; j < torch_tilemap.length; j++) {
            for(var i = 0; i < torch_tilemap[j].length; i++) {
                if(torch_tilemap[j][i]!=12){
                    this.place_light(i,j);                    
                }
            }
        }
    }

    place_light(tile_x, tile_y) {
        var offset_x = 64;
        var offset_y = 64;
        this.lights.addLight((tile_x*64)+offset_x, (tile_y*64)+offset_y, 280).setIntensity(2).setColor(0xffa81c);
        // var light = this.add.pointlight((tile_x*64)+offset_x, (tile_y*64)+offset_y, 0, 20, 2);
        // light.color.setTo(0xffa81c);
    }

    build_world_border(world_tilemap, added_tiles) {
        var border_map = [];
        for(var j = 0; j < world_tilemap.length + added_tiles; j++) {
            border_map.push([]);
            for(var i = 0; i < world_tilemap[0].length + added_tiles; i++) {
                border_map[j].push(6);                
            }
        }

        return border_map;
    }

    handle_paths(world, unused, paths) {
        var { grid, start_cord } = make_path_grid(-1,-1,world, paths);
        start_cord = from_str_cord(start_cord);

        var added_tiles = 10;
        var world_tilemap = calc_display_tiles(world);
        var border_tilemap = this.build_world_border(world_tilemap, added_tiles);
        var floor = this.build_floor(world);
        // var torch_tilemap = calc_torch_placements(world_tilemap);
        //
        var { map: border_map, layer: border_layer} = this.build_tilemap(border_tilemap, 'stone_and_iron_wallset', -64*(added_tiles/2), -64*(added_tiles/2), false, 64, 128);
        var { map: floor_map, layer: floor_layer} = this.build_tilemap(floor, 'gravel_floorset', 0, 0, false, 64,128);
        var { map: grid_map, layer: arrows } = this.build_tilemap(grid, "debug_arrows", -64, 0, false, 64, 128);
        var { map: map, layer: walls} = this.build_tilemap(world_tilemap, "stone_and_iron_wallset", 0, 0, 'collision_data', 64, 128);
        floor_layer.setPipeline('Light2D');
        walls.setPipeline('Light2D');
        border_layer.setPipeline('Light2D');
        // this.lights.addLight(64, 64, 280).setIntensity(2).setColor(0xffa81c);
        // this.lights.addLight(128, 128, 280).setIntensity(2).setColor(0xffa81c);
        // this.place_lights(torch_tilemap);


        // walls.setPipeline('SmokeColor');

        walls.setCollisionByProperty({ collides: true });
        walls.setCollisionByExclusion([12, 6]);
        this.matter.world.convertTilemapLayer(walls);

        this.build_key_handler();
        this.build_mouse_handler(grid_map, paths);
    }

    draw_polygon(polygon) {
        const graphics = this.add.graphics({ x: 100, y: 100 });

        graphics.lineStyle(2, 0x00aa00);

        graphics.beginPath();

        graphics.moveTo(polygon.points[0].x, polygon.points[0].y);

        for (let i = 1; i < polygon.points.length; i++)
        {
            graphics.lineTo(polygon.points[i].x, polygon.points[i].y);
        }

        graphics.closePath();
        graphics.strokePath();
    }

    // build_wall_collisions() {
    //     const polygon = new Geom.Polygon([
    //         0, 143,
    //         0, 92,
    //         110, 40,
    //         244, 4,
    //         330, 0,
    //         458, 12,
    //         574, 18,
    //         600, 79,
    //         594, 153,
    //         332, 152,
    //         107, 157
    //     ]);

    //     this.draw_polygon(polygon);        
    // }

    create() {
        var { world, unused } = pre_gen_world(16,16);
        var root_cords = {};
        gen_world(root_cords, unused, world);
        clean_world(root_cords, world);
        world = upscale_world(world);
        // world = upscale_world_2(world);
        const player_spawn = get_player_spawn(world);

        this.player = new Player(this, player_spawn.x*64, player_spawn.y*64);

        // this.shadowPipline = this.renderer.pipelines.add('SmokeColor', new ShadowPipeline(this.game));
        // this.shadowPipline.set3f('shadowColor', 0.1, 0.05, 0.0);
        // this.shadowPipline.set1f('shadowStrength', 0.4);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = {
          up: this.input.keyboard.addKey(87),
          down: this.input.keyboard.addKey(83),
          left: this.input.keyboard.addKey(65),
          right: this.input.keyboard.addKey(68),
        };
        this.cameras.main.startFollow(this.player);
        
        calculate_paths(world).then((paths) => {
            this.handle_paths(world, unused, paths);
        });
    }

    update(time) {
        const cam = this.cameras.main;
        // this.shadowPipline.set1f('time', time * 0.001);
        // this.shadowPipline.set2f('cameraOffset', cam.scrollX, cam.scrollY);
        this.player.update(this, this.grid_map, this.paths);
    }
}
