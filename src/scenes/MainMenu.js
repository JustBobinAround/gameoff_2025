import { Scene } from 'phaser';

export class MainMenu extends Scene {
    constructor() {
        super('MainMenu');
    }

    preload() {
        this.load.image("demon", "./assets/character_closeups/demon_rough_draft.png");
    }

    draw_start_button(offset_x, offset_y) {
        // Create the "Start Game" text and make it interactive
        const startText = this.add.text(offset_x, offset_y, 'Start Game', {
            fontFamily: 'serif',
            fontSize: 32,
            color: '#ffffff',
            stroke: '#ffffff',
            strokeThickness: 0,
            align: 'center'
        }).setOrigin(0.5)
          .setInteractive({ useHandCursor: true }); // show pointer cursor on hover

        // Change color on hover
        startText.on('pointerover', () => {
            startText.setColor('#ffff00'); // yellow
        });

        startText.on('pointerout', () => {
            startText.setColor('#ffffff'); // white
        });

        // Start new scene on click
        startText.on('pointerdown', () => {
            this.scene.start('DungeonGameLoop');
        });
    }

    create() {
        this.add.text(512, 128, 'The Last Scavenger', {
            fontFamily: 'serif',
            fontSize: 32,
            color: '#ffffff',
            stroke: '#ffffff',
            strokeThickness: 0,
            align: 'center'
        }).setOrigin(0.5);

        this.add.image(512, 256 + 64 + 32, 'demon')
            .setOrigin(0.5)
            .setScale(4);

        this.draw_start_button(512, 512 + 128);
    }
}
