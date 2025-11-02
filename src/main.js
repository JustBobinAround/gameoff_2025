import * as Phaser from "phaser";
// just an example commit

import { Boot } from './scenes/Boot.js';
import { DungeonGameLoop } from './scenes/DungeonGameLoop.js';
import { GameOver } from './scenes/GameOver.js';
import { MainMenu } from './scenes/MainMenu.js';
import { Preloader } from './scenes/Preloader.js';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config = {
    type: Phaser.WEBGL,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#000000',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    maxLights: 15,
    pixelArt: true,
    scene: [
        Boot,
        Preloader,
        MainMenu,
        DungeonGameLoop,
        GameOver
    ],
    physics: {
        default: 'matter',
        matter: {
            gravity: { y: 0 },
            debug: false
        }
    },
};

export default new Phaser.Game(config);
