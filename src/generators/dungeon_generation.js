import init, { find_paths } from '../../../libs/wasm/path_finder.js';

function build_new_array(w,h,mapping_closure) {
    var new_array = [];
    for(var j = 0; j < h; j++) {
        new_array.push([]);
        for(var i = 0; i < w; i++) {
            mapping_closure(i,j,array);
        }
    }
}

function map_2D_as_mut(mutable_array, mapping_closure) {
    for(var j = 0; j < mutable_array.length; j++) {
        for(var i = 0; i < mutable_array[j].length; i++) {
            mapping_closure(i, j, mutable_array);
        }
    }
}

export async function calculate_paths(world) {
    await init();

    try {
        const world_json = JSON.stringify(world);
        const ans = JSON.parse(find_paths(world_json));
        return ans;
    } catch (e) {
        console.error("failed to use wasm path finder", e);
        return [];
    }
}

export function to_str_cord(x,y) {
    return x.toString() + ':' + y.toString();
}

export function from_str_cord(str_cord) {
    var cords = str_cord.split(':');
    return cord(parseInt(cords[0]), parseInt(cords[1]));
}

export function pre_gen_world(w, h) {
    var world = [];
    var unused = { };
    for(var j = 0; j < h; j++) {
        world.push([]);
        for(var i = 0; i < w; i++) {
            if(is_bound(j, h) || is_bound(i, w)) {
                world[j].push(1);
            } else {
                unused[to_str_cord(j,i)] = true;
                world[j].push(0);
            }
        }
    }

    return {
        world: world,
        unused: unused
    };    
}

export function gen_world(root_cords, unused, world) {
    var unused_str_cords = Object.keys(unused);

    if(unused_str_cords.length > 0) {
        var unused_cord = unused_str_cords[rand_int(unused_str_cords.length)];
        root_cords[unused_cord] = true;
        delete unused[unused_cord];
        unused_cord = from_str_cord(unused_cord);
        world[unused_cord.y][unused_cord.x] = 0;
        var wall_mask = rand_wall();
        apply_wall_mask(unused, world, wall_mask, unused_cord.x, unused_cord.y);
        gen_world(root_cords, unused, world);
    }
}

export function calc_display_tiles(world) {
    var mask_map = gen_mask_map();    
    var edge_cases = gen_mask_map_edge_case();
    var display = [];
    display.push([]);
    for(var i = 0; i < world[0].length; i++) {
        display[0].push(6);
    }
    for(var j = 1; j < world.length - 1; j++) {
        var row_len = world[j].length - 1;
        display.push([]);
        for(var i = 1; i < row_len; i++) {
            // var tile_code = world[j][i] == 1 ? 6 : 12;
            var tile_code = find_mask(mask_map, edge_cases, world, i, j);
            display[j].push(tile_code);
        }
    }
    display.push([]);
    for(var i = 0; i < world[0].length; i++) {
        display[world.length-1].push(6);
    }
    for(var i = 0; i < world.length; i++) {
        display[i][world.length-1] = 6;
        display[i][world.length-2] = 6;
    }

    return display;
}

export function get_player_spawn(world) {
    var rows = world.length;
    var cols = world[0].length;
    const potentional_spawns = [];
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) 
        {
            var val = world[i][j];
            if (val === 0)
            {
                potentional_spawns.push({x: j, y: i});
            }
        }
    }
    return potentional_spawns[rand_int(potentional_spawns.length)];
}

export function upscale_world(world) {
  var rows = world.length;
  var cols = world[0].length;
  var result = [];

  for (let i = 0; i < rows; i++) {
    var new_row_1 = [];
    var new_row_2 = [];
    for (let j = 0; j < cols; j++) {
      var val = world[i][j];
      // Each cell becomes a 2x2 block
      new_row_1.push(val, val);
      new_row_2.push(val, val);
    }
    result.push(new_row_1, new_row_2);
  }

  return result;
}

export function clean_world(root_cords, world) {
    for(var j = 1; j < world.length - 1; j++) {
        for(var i = 1; i < world[j].length-1; i++) {
            if(is_closed_off(world, i, j)) {
                remove_unused(root_cords, i, j);
                world[j][i] = 1;
            }
        }
    }

    connect_rooms(world);
}

export function make_path_grid(x, y, world, paths) {
    var grid = [];
    for(var j = 0; j < world.length; j++) {
        grid.push([]);
        for(var i = 0; i < world[j].length; i++) {
            grid[j].push(5);
        }
    }

    var start_cord = to_str_cord(x, y);

    if(paths[start_cord]) {
        var test_paths = paths[start_cord];

        for(var end_str_cord in test_paths) {
            var end_cord = from_str_cord(end_str_cord);
            if(test_paths[end_str_cord]=='U') {
                grid[end_cord.y][end_cord.x] = 0;
            } else if(test_paths[end_str_cord]=='R') {
                grid[end_cord.y][end_cord.x] = 1;
            } else if(test_paths[end_str_cord]=='D') {
                grid[end_cord.y][end_cord.x] = 2;
            } else {
                grid[end_cord.y][end_cord.x] = 3;
            }
        }
        grid[y][x] = 4;
    }

    return { grid, start_cord };
}

export function cord(x, y) {
    return {
        x: x,
        y: y,
        to_str_cord: function() {
            return this.x.toString() + ':' + this.y.toString();
        },
        delta: function(dx, dy) {
            return cord(this.x + dx, this.y + dy);
        }
    };
}

export function rand_int(length) {
  return Math.floor(Math.random() * length);
}

function is_bound(n, len) {
    return (n == 0) || (n == (len - 1));
}

function rand_wall() {
    var wall_type = rand_int(4);
    var wall_cardinal = rand_int(4);

    return [
        [
            [
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0]
            ],
            [
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0]
            ],
            [
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0]
            ],
            [
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0]
            ],
        ],
        [
            [
                [0, 1, 0],
                [0, 0, 0],
                [0, 0, 0]
            ],
            [
                [0, 0, 0],
                [0, 0, 1],
                [0, 0, 0]
            ],
            [
                [0, 0, 0],
                [1, 0, 0],
                [0, 0, 0]
            ],
            [
                [0, 1, 0],
                [0, 0, 0],
                [0, 0, 0]
            ],
        ],
        [
            [
                [0, 1, 0],
                [0, 0, 1],
                [0, 0, 0]
            ],
            [
                [0, 0, 0],
                [0, 0, 1],
                [0, 1, 0]
            ],
            [
                [0, 0, 0],
                [1, 0, 0],
                [0, 1, 0]
            ],
            [
                [0, 1, 0],
                [1, 0, 0],
                [0, 0, 0]
            ],
        ],
        [
            [
                [0, 1, 0],
                [1, 0, 1],
                [0, 0, 0]
            ],
            [
                [0, 1, 0],
                [0, 0, 1],
                [0, 1, 0]
            ],
            [
                [0, 0, 0],
                [1, 0, 1],
                [0, 1, 0]
            ],
            [
                [0, 1, 0],
                [1, 0, 0],
                [0, 1, 0]
            ],
        ]
    ][wall_type][wall_cardinal];
}

function remove_unused(unused, x, y) {
    var str_cord = to_str_cord(x, y);
    var was_unused = false;

    if(unused[str_cord]) {
        delete unused[str_cord];
        was_unused = true;
    }

    return was_unused;
}

function apply_wall_mask(unused, world, wall_mask, x, y) {
    world[y][x] |= wall_mask[1][1];
    remove_unused(unused, x, y);

    world[y - 1][x] |= wall_mask[0][1];
    remove_unused(unused, x, y - 1);
    world[y][x + 1] |= wall_mask[1][2];
    remove_unused(unused, x + 1, y);
    world[y + 1][x] |= wall_mask[2][1];
    remove_unused(unused, x, y + 1);
    world[y][x - 1] |= wall_mask[1][0];
    remove_unused(unused, x - 1, y);
}


function has_wall_mask(mask, world, x, y) {
    var has_mask = true;
    for(var dy = -1; dy < 2 && has_mask; dy++) {
        for(var dx = -1; dx < 2 && has_mask; dx++) {
            has_mask = world[y+dy][x+dx] == mask[dy+1][dx+1];            
        }
    }

    return has_mask;
} 

function gen_mask_map() {
    return [
        [
            [0, 0, 0],
            [1, 1, 0],
            [1, 1, 0],
        ],
        [
            [0, 1, 1],
            [0, 1, 1],
            [0, 1, 1],
        ],
        [
            [1, 1, 0],
            [1, 1, 1],
            [1, 1, 1],
        ],
        [
            [0, 0, 0],
            [1, 1, 1],
            [1, 1, 1],
        ],
        [
            [1, 1, 0],
            [1, 1, 1],
            [0, 1, 1],
        ],
        [
            [0, 1, 1],
            [1, 1, 1],
            [1, 1, 1],
        ],
        [
            [1, 1, 1],
            [1, 1, 1],
            [1, 1, 1],
        ],
        [
            [1, 1, 1],
            [1, 1, 1],
            [1, 1, 0],
        ],
        [
            [0, 1, 1],
            [0, 1, 1],
            [0, 0, 0],
        ],
        [
            [1, 1, 1],
            [1, 1, 1],
            [0, 0, 0],
        ],
        [
            [1, 1, 1],
            [1, 1, 1],
            [0, 1, 1],
        ],
        [
            [1, 1, 0],
            [1, 1, 0],
            [1, 1, 0],
        ],
        [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0],
        ],
        [
            [0, 0, 0],
            [0, 1, 1],
            [0, 1, 1],
        ],
        [
            [0, 1, 1],
            [1, 1, 1],
            [1, 1, 0],
        ],
        [
            [1, 1, 0],
            [1, 1, 0],
            [0, 0, 0],
        ]
    ];
}

function edge_case_map(idx) {
	return [
		11,
		9,
		1,
		3,
		11,
		9,
		1,
		3,
    15,
    8,
    13,
    0
	][idx];
}

function gen_mask_map_edge_case() {
    return [
        [
            [1, 1, 1],
            [1, 1, 0],
            [1, 1, 0],
        ],
        [
            [1, 1, 1],
            [1, 1, 1],
            [0, 0, 1],
        ],
        [
            [0, 1, 1],
            [0, 1, 1],
            [1, 1, 1],
        ],
        [
            [1, 0, 0],
            [1, 1, 1],
            [1, 1, 1],
        ],
        
        [
            [1, 1, 0],
            [1, 1, 0],
            [1, 1, 1],
        ],
        [
            [1, 1, 1],
            [1, 1, 1],
            [1, 0, 0],
        ],
        [
            [1, 1, 1],
            [0, 1, 1],
            [0, 1, 1],
        ],
        [
            [0, 0, 1],
            [1, 1, 1],
            [1, 1, 1],
        ],
        
        [
            [1, 1, 0],
            [1, 1, 0],
            [0, 0, 1],
        ],
        [
            [0, 1, 1],
            [0, 1, 1],
            [1, 0, 0],
        ],
        [
            [1, 0, 0],
            [0, 1, 1],
            [0, 1, 1],
        ],
        [
            [0, 0, 1],
            [1, 1, 0],
            [1, 1, 0],
        ],
    ];
}

function check_wall_masks(masks, world, x, y) {
    var found_idx = false;
    for(var idx in masks) {
        if(has_wall_mask(masks[idx], world, x, y)) {
            found_idx = idx;
            break;            
        }
    }

    return found_idx;
}

function find_mask(mask_map, edge_cases, world, x, y) {
    var found_idx = check_wall_masks(mask_map, world, x, y);

    if(!found_idx) {
        found_idx = check_wall_masks(edge_cases, world, x, y);
        
        if(found_idx) {
            found_idx = edge_case_map(found_idx);
        } else {
            found_idx = 12; //empty
        }
    }

    return found_idx;
}



function is_closed_off(world, x, y) {
    return (world[y][x-1].toString() == 1)
        && (world[y+1][x].toString() == 1)
        && (world[y][x+1].toString() == 1)
        && (world[y-1][x].toString() == 1);
}


function bfs_room(rooms, visited, dirs, rows, cols, grid, r, c, id) {
    var queue = [[r, c]];
    var cells = [];
    visited[r][c] = true;

    while (queue.length) {
        var [x, y] = queue.shift();
        cells.push([x, y]);
        for (var [dx, dy] of dirs) {
            var nx = x + dx, ny = y + dy;
            if (
                nx >= 0 && nx < rows && ny >= 0 && ny < cols &&
                !visited[nx][ny] && grid[nx][ny] === 0
            ) {
                visited[nx][ny] = true;
                queue.push([nx, ny]);
            }
        }
    }
    rooms.push(cells);
}

function manhattan(a, b) {
    return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}

function connect_rooms(grid) {
    var rows = grid.length;
    var cols = grid[0].length;

    var dirs = [[1,0], [-1,0], [0,1], [0,-1]];

    var visited = Array.from({length: rows}, () => Array(cols).fill(false));
    var rooms = [];

    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            if (!visited[i][j] && grid[i][j] === 0) {
                bfs_room(rooms, visited, dirs, rows, cols, grid, i, j);
            }
        }
    }

    if (rooms.length <= 1) return grid;


    var connected = [rooms[0]];
    var remaining = rooms.slice(1);

    while (remaining.length) {
        var best_dist = Infinity;
        var best_wall = null;
        var best_room_idx = -1;

        for (var i = 0; i < connected.length; i++) {
            for (var j = 0; j < remaining.length; j++) {
                for (var a of connected[i]) {
                    for (var b of remaining[j]) {
                        var dist = manhattan(a, b);
                        if (dist < best_dist) {
                            best_dist = dist;
                            best_wall = [a, b];
                            best_room_idx = j;
                        }
                    }
                }
            }
        }

        var [a, b] = best_wall;
        var [x, y] = a;

        while (x !== b[0] || y !== b[1]) {
            grid[x][y] = 0;
            
            if (x < b[0]) x++;
            else if (x > b[0]) x--;
            else if (y < b[1]) y++;
            else if (y > b[1]) y--;
            
            grid[x][y] = 0;
        }

        connected.push(remaining[best_room_idx]);
        remaining.splice(best_room_idx, 1);
    }
}


function print_array(a) {
    var to_print = '';
    for(var j = 0; j < a.length; j++) {
        for(var i = 0; i < a[j].length; i++) {
            var num = (a[j][i]).toString().padStart(2,' ');
            if(num=='12') {
                num = '  ';
            }
            to_print+=num+',';
        }
        to_print+='\n';
    }
    console.log(to_print);
}

function is_border_tile(tile_code) {
    return tile_code != '12' && tile_code != '6' && tile_code;
}

function find_border_tiles(display_tiles) {
    var border_tiles = {};

    for(var j = 0; j < display_tiles.length; j++) {
        for(var i = 0; i < display_tiles[j].length; i++) {
            var tile_code = display_tiles[j][i];
            if(is_border_tile(tile_code)) {
                border_tiles[to_str_cord(i,j)] = tile_code;
            }
        }
    }

    return border_tiles;
}

function next_wall_delta(from_cardinal, tile_code) {
    var vectored_tile_code = from_cardinal.toString() + tile_code.toString();

    return {
        'W0':  { dx:  0, dy:  1 },
        'S0':  { dx: -1, dy:  0 },
        'N1':  { dx:  0, dy:  1 },
        'S1':  { dx:  0, dy: -1 },
        'N2':  { dx:  1, dy:  0 },
        'E2':  { dx:  0, dy: -1 },
        'W3':  { dx:  1, dy:  0 },
        'E3':  { dx: -1, dy:  0 },
        'N4':  { dx: -1, dy:  0 },
        'E4':  { dx:  0, dy:  1 },
        'S4':  { dx:  1, dy:  0 },
        'W4':  { dx:  0, dy: -1 },
        'W5':  { dx:  0, dy: -1 },
        'N5':  { dx: -1, dy:  0 },
        'E7':  { dx:  0, dy:  1 },
        'S7':  { dx:  1, dy:  0 },
        'N8':  { dx:  1, dy:  0 },
        'E8':  { dx:  0, dy: -1 },
        'E9':  { dx: -1, dy:  0 },
        'W9':  { dx:  1, dy:  0 },
        'W10': { dx:  0, dy:  1 },
        'S10': { dx: -1, dy:  0 },
        'N11': { dx:  0, dy:  1 },
        'S11': { dx:  0, dy: -1 },
        'S13': { dx:  1, dy:  0 },
        'E13': { dx:  0, dy:  1 },
        'N14': { dx:  1, dy:  0 },
        'E14': { dx:  0, dy: -1 },
        'S14': { dx: -1, dy:  0 },
        'W14': { dx:  0, dy:  1 },
        'N15': { dx: -1, dy:  0 },
        'W15': { dx:  0, dy: -1 }
    }[vectored_tile_code];
}

function calc_cardinal(from_cord, to_cord) {
    var cardinal;
    
    if(from_cord.y == to_cord.y) {
        if(from_cord.x > to_cord.x) {
            cardinal = 'E';            
        } else {
            cardinal = 'W';
        }
    } else {
        if(from_cord.y > to_cord.y) {
            cardinal = 'S';
        } else {
            cardinal = 'N';
        }
    }

    return cardinal;
}

function default_delta(tile_code) {
    return [
        { dx:  0, dy:  1 },
        { dx:  0, dy:  1 },
        { dx:  1, dy:  0 },
        { dx:  1, dy:  0 },
        { dx:  1, dy:  0 },
        { dx:  0, dy:  1 },
        { dx:  0, dy:  0 },
        { dx:  1, dy:  0 },
        { dx:  1, dy:  0 },
        { dx:  1, dy:  0 },
        { dx:  0, dy:  1 },
        { dx:  0, dy:  1 },
        { dx:  0, dy:  0 },
        { dx:  1, dy:  0 },
        { dx:  1, dy:  0 },
        { dx:  0, dy:  1 },
    ][tile_code];
}

function apply_delta(delta_cord, str_cord) {
    var from_cord = from_str_cord(str_cord);
    var to_cord = from_cord.delta(delta_cord.dx, delta_cord.dy);

    var cardinal = calc_cardinal(from_cord, to_cord);
    return {
        from_cord,
        to_cord,
        cardinal
    };
}

function walk_wall_border(display_tiles, border_tiles, group_set, group_order, to_cord, from_cardinal) {
    var current_str_cord = to_cord.to_str_cord();
    if(group_set[current_str_cord]) {
        return;
    }
    
    if(border_tiles[current_str_cord] || border_tiles[current_str_cord]=='0') {
        group_set[current_str_cord] = border_tiles[current_str_cord];
        group_order.push(current_str_cord);
    } else {
        return;
    }
    var delta = next_wall_delta(from_cardinal, border_tiles[current_str_cord]);
    
    var {
        from_cord: from_cord,
        to_cord: to_cord,
        cardinal: cardinal
    } = apply_delta(delta, current_str_cord);
    
    walk_wall_border(display_tiles,border_tiles, group_set, group_order, to_cord, cardinal);
}

function remove_group(border_tiles, group_set) {
    for(var str_cord in group_set) {
        delete border_tiles[str_cord];
    }
}

function find_wall_groups(display_tiles, border_tiles, wall_groups=[]) {
    var group_set = {};
    var group_order = [];
    var str_cords = Object.keys(border_tiles);
    if(str_cords.length == 0) {
        return wall_groups;
    }
    var first_str_cord = str_cords[0];
    group_order.push(first_str_cord);
    group_set[first_str_cord] = border_tiles[first_str_cord];
    var delta = default_delta(border_tiles[str_cords[0]]);

    var {
        from_cord: from_cord,
        to_cord: to_cord,
        cardinal: from_cardinal
    } = apply_delta(delta, first_str_cord);

    walk_wall_border(display_tiles,border_tiles, group_set, group_order, to_cord, from_cardinal);
    remove_group(border_tiles, group_set);
    wall_groups.push(group_order);
    return find_wall_groups(display_tiles, border_tiles, wall_groups);
}

export function calc_torch_placements(display_tiles) {
    var border_tiles = find_border_tiles(display_tiles);
    var wall_groups = find_wall_groups(display_tiles, border_tiles, []);

    var torch_cords = {};

    var spacing = 20;

    for(var group_idx in wall_groups) {
        var group = wall_groups[group_idx];
        if(group.length<5) {
            continue;
        }
        var count = 0;
        for(var cord_idx in group) {
            if(count%spacing==0) {
                torch_cords[group[cord_idx]] = true;
            }

            count += 1;
        }
    }

    var torch_tilemap = [];

    for(var j = 0; j < display_tiles.length; j++) {
        torch_tilemap.push([]);
        for(var i = 0; i < display_tiles[j].length; i++) {
            if(torch_cords[to_str_cord(i,j)] && display_tiles[j][i]) {
                torch_tilemap[j].push(display_tiles[j][i]);
            } else {
                torch_tilemap[j].push(12);
            }
        }
    }

    return torch_tilemap;
}
