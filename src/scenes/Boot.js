import Phaser from 'phaser'
// import WebFont from 'webfontloader'
import { windowWidth, windowHeight } from '../config'
import casinoNightZoneMp3 from '../assets/audio/songs/CasinoNightZone.mp3';
import ringLossMp3 from '../assets/audio/sonic_losing_rings.mp3';
import ringWav from '../assets/audio/S3K_33.wav';
import errorWav from '../assets/audio/S3K_B2.wav';
import continueWav from '../assets/audio/S3K_AC.wav';
import spinWav from '../assets/audio/S3K_53.wav';
import bgCasinoPng from '../assets/bg/casino.png';
import framePng from '../assets/frame.png';
import jackPotPng from '../assets/symbols/sonic_sym_a.png';
import sonicFacePng from '../assets/symbols/sonic_sym_b.png';
import tailsFacePng from '../assets/symbols/sonic_sym_c.png';
import knucklesFacePng from '../assets/symbols/sonic_sym_d.png';
import ringPng from '../assets/symbols/sonic_sym_e.png';
import line1Png from '../assets/line_1.png';
import line4Png from '../assets/line_4.png';
import line5Png from '../assets/line_5.png';
import prizeWindowPng from '../assets/prize_window.png';
import buttonSpinPng from '../assets/btn_spin.png';


export default class extends Phaser.Scene {
  constructor () {
    super({ key: 'BootScene' })
  }

  preload () {
    let offset = (windowWidth / 2);
    this.load.on('progress', function (value) {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(offset / 2, windowHeight / 2 - 30, offset * value, 30);
    }, this);
    
    this.load.on('fileprogress', function (file) {
      assetText.setText('Loading asset: ' + file.key);
    });
    
    this.load.on('complete', function () {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      assetText.destroy();
    });

    let loadingText = this.make.text({
        x: windowWidth / 2,
        y: windowHeight / 2 - 60,
        text: 'Loading...',
        style: {
            font: '20px monospace',
            fill: '#ffffff'
        }
      }).setOrigin(0.5, 0.5);
      let assetText = this.make.text({
        x: windowWidth / 2,
        y: windowHeight / 2 + 30,
        text: '',
        style: {
            font: '18px monospace',
            fill: '#ffffff'
        }
      });
      assetText.setOrigin(0.5, 0.5);
    let progressBar = this.add.graphics();
    let progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(offset / 2,  windowHeight / 2 - 40, offset, 50);

    // this.load.setBaseURL('http://localhost:8080');

    this.load.image('bg', framePng);
    this.load.image('prize', prizeWindowPng);
    this.load.image('spin', buttonSpinPng);
    this.load.image('line1', line1Png);
    this.load.image('line4', line4Png);
    this.load.image('line5', line5Png);
    
    this.load.image('a', jackPotPng);
    this.load.image('b', sonicFacePng);
    this.load.image('c', tailsFacePng);
    this.load.image('d', knucklesFacePng);
    this.load.image('e', ringPng);

    
    this.load.audio('ring', ringWav, {
      instances: 1
    });
    this.load.audio('continue', continueWav, {
      instances: 1
    });
    this.load.audio('error', errorWav, {
      instances: 1
    });
    this.load.audio('ring-loss', ringLossMp3, {
      instances: 1
    });
    this.load.audio('spin', spinWav, {
      instances: 1
    });

    this.load.audio('song-casino-night', casinoNightZoneMp3, {
      instances: 1
    });

    
    this.load.image('bg-casino', bgCasinoPng);
  }
  
  update () {
    // if (this.fontsReady) {
      this.scene.start('GameScene')
    // }
  }
}
