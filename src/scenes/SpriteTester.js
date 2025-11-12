import { Scene } from 'phaser';

export class SpriteTester extends Scene {
    constructor () {
        super('SpriteTester');
    }

    preload () {
        this.load.spritesheet('test_spritea', './assets/sprites/default_character.png', { frameWidth: 64, frameHeight: 128 });
    }

    create () {
        // this.add.tileSprite(400, 300, 800, 600, 'grid');

        // this.add.image(0, 0, 'test_spritea', '__BASE').setOrigin(0, 0);

        this.anims.create({
            key: 'idle-left2',
            frames: this.anims.generateFrameNumbers('test_spritea', { frames: [ 12 ] }),
            frameRate: 16,
            repeat: -1
        });
        
        this.anims.create({
            key: 'idle-right2',
            frames: this.anims.generateFrameNumbers('test_spritea', { frames: [ 13 ] }),
            frameRate: 16,
            repeat: -1
        });
        
        this.anims.create({
            key: 'run-left2',
            frames: this.anims.generateFrameNumbers('test_spritea', { frames: [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 ] }),
            frameRate: 16,
            repeat: -1
        });
        this.anims.create({
            key: 'run-right2',
            frames: this.anims.generateFrameNumbers('test_spritea', { frames: [ 25, 24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14] }),
            frameRate: 16,
            repeat: -1
        });

        const cody = this.add.sprite(200, 200);
        cody.setScale(1);
        cody.play('run-left2');
    }
}
