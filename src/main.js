import * as Phaser from "phaser";
// just an example commit

import { Boot } from './scenes/Boot.js';
import { DungeonGameLoop } from './scenes/DungeonGameLoop.js';
import { GameOver } from './scenes/GameOver.js';
import { MainMenu } from './scenes/MainMenu.js';
import { PlayersHouse } from './scenes/PlayersHouse.js';
import { Preloader } from './scenes/Preloader.js';
import { Town } from './scenes/Town.js';
import { HallOfElders } from './scenes/HallOfElders.js';
import { SpriteTester } from './scenes/SpriteTester.js';
import { SmokeColorPipeline } from './shaders/Smoke.js';

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
    maxLights: 8,
    pixelArt: true,
    scene: [
        Boot,
        Preloader,
        MainMenu,
        PlayersHouse,
        Town,
        HallOfElders,
        DungeonGameLoop,
        SpriteTester,
        GameOver,
    ],
    physics: {
        default: 'matter',
        matter: {
            gravity: { y: 0 },
            debug: false
        }
    },
    pipeline: { SmokeColorPipeline }
};

export default new Phaser.Game(config);
