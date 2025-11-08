import { Scene } from 'phaser';

export class Preloader extends Scene {
    constructor () {
        super('Preloader');
    }

    init () {
        //  We loaded this image in our Boot Scene, so we can display it here
        // this.add.image(512, 384, 'background');

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512-230, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload () {
        //TILESETS
        this.load.image("church_props", "./assets/tilesets/props/church_props.png");
        this.load.image("dungeon_walls", "./assets/tilesets/dungeon_walls/stone_and_iron_v2.png");
        this.load.image("hall_of_elders_floor", "./assets/tilesets/floor_textures/hall_of_elders_floor.png");
        this.load.image("canals", "./assets/tilesets/city_walls/canal.png");
        this.load.image("grass", "./assets/tilesets/floor_textures/grass.png");
        this.load.image("dirt", "./assets/tilesets/floor_textures/dirt.png");
        this.load.image("torches", "./assets/tilesets/dungeon_walls/torches.png");
        
        //PARTICLES
        this.load.atlas('flares', './assets/particles/flares.png', './assets/particles/flares.json');
        
        //SCENE MAPS
        this.load.tilemapTiledJSON('map', './assets/scene_maps/player_cabin.tmj');
        this.load.tilemapTiledJSON('hall_of_elders', './assets/scene_maps/hall_of_elders.tmj');
        this.load.tilemapTiledJSON('town_map', './assets/scene_maps/town.tmj');

        //SPRITES
        this.load.spritesheet('test_sprite', './assets/sprites/animation_template.png', { frameWidth: 64, frameHeight: 128 });

        
        this.load.setPath('assets');
    }

    create () {
        //ANIMATIONS
        this.anims.create({
            key: 'idle-left',
            frames: this.anims.generateFrameNumbers('test_sprite', { frames: [ 12 ] }),
            frameRate: 16,
            repeat: -1
        });
        
        this.anims.create({
            key: 'idle-right',
            frames: this.anims.generateFrameNumbers('test_sprite', { frames: [ 13 ] }),
            frameRate: 16,
            repeat: -1
        });
        
        this.anims.create({
            key: 'run-left',
            frames: this.anims.generateFrameNumbers('test_sprite', { frames: [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 ] }),
            frameRate: 16,
            repeat: -1
        });
        this.anims.create({
            key: 'run-right',
            frames: this.anims.generateFrameNumbers('test_sprite', { frames: [ 25, 24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14] }),
            frameRate: 16,
            repeat: -1
        });
        this.anims.create({
            key: 'run-forward',
            frames: this.anims.generateFrameNumbers('test_sprite', { frames: [ 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37] }),
            frameRate: 20, // trying to account for length bias from skewed perspective
            repeat: -1
        });
        this.anims.create({
            key: 'idle-forward',
            frames: this.anims.generateFrameNumbers('test_sprite', { frames: [ 38 ] }),
            frameRate: 16, // trying to account for length bias from skewed perspective
            repeat: -1
        });
        
        this.anims.create({
            key: 'run-backward',
            frames: this.anims.generateFrameNumbers('test_sprite', { frames: [ 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50] }),
            frameRate: 20, // trying to account for length bias from skewed perspective
            repeat: -1
        });
        this.anims.create({
            key: 'idle-backward',
            frames: this.anims.generateFrameNumbers('test_sprite', { frames: [ 51 ] }),
            frameRate: 16, // trying to account for length bias from skewed perspective
            repeat: -1
        });
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('PlayersHouse');
    }
}
