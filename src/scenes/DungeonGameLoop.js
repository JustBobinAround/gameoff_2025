import { Scene, Geom, Tilemaps, Input } from 'phaser';

export class DungeonGameLoop extends Scene
{
    constructor ()
    {
        super('DungeonGameLoop');
    }

    preload() {
        this.load.image("gravel", "./assets/tilesets/floor_textures/gravel.png");
        this.load.image("stone_and_iron", "./assets/tilesets/dungeon_walls/stone_and_iron.png");
        this.load.json("collision_data", "./assets/tilesets/dungeon_walls/collision_data.json")
    }

    create ()
    {
        
    }
}
