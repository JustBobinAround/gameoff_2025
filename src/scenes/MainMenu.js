import { Scene } from 'phaser';
import { SmokeColorPipeline } from '../shaders/Smoke.js';

export class MainMenu extends Scene {
    constructor() {
        super('MainMenu');
    }

    preload() {
        this.load.image("demon", "./assets/character_closeups/demon_rough_draft.png");
        this.load.image("main_menu_background", "./assets/tilesets/menus/main_menu_background.png");
    }

    draw_start_button(offset_x, offset_y) {
        // Create the "Start Game" text and make it interactive
        const start_game_button = this.add.text(offset_x, offset_y, 'Start Game', {
            fontFamily: 'serif',
            fontSize: 32,
            color: '#ffffff',
            stroke: '#ffffff',
            strokeThickness: 0,
            align: 'center'
        }).setOrigin(0.5)
          .setInteractive({ useHandCursor: true }); // show pointer cursor on hover

        // Change color on hover
        start_game_button.on('pointerover', () => {
            start_game_button.setColor('#ffff00'); // yellow
        });

        start_game_button.on('pointerout', () => {
            start_game_button.setColor('#ffffff'); // white
        });

        start_game_button.on('pointerdown', () => {
            this.scene.start('StartingDialog');
        });
    }

    draw_smoke() {
        const img = this.add.image(0, 0, 'main_menu_background')
        this.smoke_pipeline = this.renderer.pipelines.add('SmokeColor', new SmokeColorPipeline(this.game));
        this.smoke_pipeline.set3f('targetColor', 0.0, 0.0, 0.0);
        this.smoke_pipeline.set1f('tolerance', 0.8);
        this.smoke_pipeline.set1f('smokeIntensity', 0.05);

        img.setPipeline('SmokeColor');
    }

    create() {
        this.draw_smoke();
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
    
    update(time) {
        this.smoke_pipeline.set1f('time', time * 0.001);
    }
}
