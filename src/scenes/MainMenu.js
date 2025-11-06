import { Scene } from 'phaser';
import { SmokeColorPipeline } from '../shaders/Smoke.js';
import { PopupDialog, Dialog } from '../PopupDialog.js'

export class MainMenu extends Scene {
    constructor() {
        super('MainMenu');
    }

    preload() {
        this.load.image("demon", "./assets/character_closeups/demon_rough_draft.png");
        this.load.image("main_menu_background", "./assets/tilesets/menus/main_menu_background.png");
        this.load.image("popup_dialog", "./assets/tilesets/menus/popup_dialog.png");
    }

    font(font_size) {
        return {
            fontFamily: 'serif',
            fontSize: font_size,
            color: '#ffffff',
            stroke: '#ffffff',
            strokeThickness: 0,
            align: 'center'
        };
    }

    fade_to_intro_text() {
        this.tweens.add({
            targets: [
                this.title_text,
                this.title_brand_image,
                this.start_game_button
            ],
            duration: 500,
            alpha: 0
        });
    }

    build_dialog() {
        var on_close = (scene) => {
            scene.scene.start('PlayersHouse');
        };
        
        this.popup_dialog = new PopupDialog(this, [
            new Dialog('PLAYER', 'Huh, where am I? I can\'t see. Its so dark. Hello?'),
            new Dialog('UNKNOWN VOICE', 'Can’t see, can’t hear, but still voicing its opinions. Typical human...'),
            new Dialog('PLAYER', 'I don\'t know who you are or what kind of joke this is, but can you please turn the lights on?'),
            new Dialog('UNKNOWN VOICE', 'Oh... So someone can finally hear me after all these years! And to think it would be a child like you. Figures.'),
            new Dialog('UNKNOWN VOICE', 'There are no lights in a place like this. Although you being able to hear me has my interest.'),
            new Dialog('UNKNOWN VOICE', 'I think I\'m going to stick around for a bit. It seems fate wants us to be close.'),
            new Dialog('PLAYER', 'Ok well... can you just tell me how to leave this place?'),
            new Dialog('UNKNOWN VOICE', '*Sighs* You\'ll wake up soon enough.'),
        ], on_close);
    }

    draw_start_button(offset_x, offset_y) {
        this.build_dialog();

        this.start_game_button = this.add.text(
            offset_x,
            offset_y,
            'Start Game',
            this.font(38)
        ).setOrigin(0.5)
         .setInteractive({ useHandCursor: true });

        this.start_game_button.on('pointerover', () => {
            this.start_game_button.setColor('#ffff00'); // yellow
        });

        this.start_game_button.on('pointerout', () => {
            this.start_game_button.setColor('#ffffff'); // white
        });

        this.start_game_button.on('pointerdown', () => {
            // this.scene.start('StartingDialog');
            this.fade_to_intro_text();
            // this.start_game_button.setText('asdf');
            this.popup_dialog.display(600);
        });
    }

    draw_smoke() {
        const img = this.add.image(0, 0, 'main_menu_background')
        this.smoke_pipeline = this.renderer.pipelines.add('SmokeColor', new SmokeColorPipeline(this.game));
        this.smoke_pipeline.set3f('targetColor', 0.0, 0.0, 0.0);
        this.smoke_pipeline.set1f('tolerance', 0.4);
        this.smoke_pipeline.set1f('smokeIntensity', 0.2);

        img.setPipeline('SmokeColor');
    }

    create() {
        this.draw_smoke();
        this.title_text = this.add.text(512, 128, 'The Scavenger', this.font(32)).setOrigin(0.5);

        this.title_brand_image = this.add.image(512, 256 + 64 + 32, 'demon')
            .setOrigin(0.5)
            .setScale(4);

        this.draw_start_button(512, 512 + 128);
    }
    
    update(time) {
        this.smoke_pipeline.set1f('time', time * 0.001);
        this.popup_dialog.update(this, time);
    }
}
