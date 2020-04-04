import Phaser from 'phaser'
// import WebFont from 'webfontloader'
import { gameWidth, gameHeight } from '../config'

export default class extends Phaser.Scene {
  constructor () {
    super({ key: 'BootScene' })
  }

  preload () {
    let offset = (gameWidth / 2);
    this.load.on('progress', function (value) {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(offset / 2, gameHeight / 2 - 30, offset * value, 30);
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
        x: gameWidth / 2,
        y: gameHeight / 2 - 60,
        text: 'Loading...',
        style: {
            font: '20px monospace',
            fill: '#ffffff'
        }
      }).setOrigin(0.5, 0.5);
      let assetText = this.make.text({
        x: gameWidth / 2,
        y: gameHeight / 2 + 30,
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
    progressBox.fillRect(offset / 2,  gameHeight / 2 - 40, offset, 50);

    // this.load.setBaseURL('http://localhost:8080');

    this.load.image('bg', 'assets/frame.png');
    this.load.image('prize', 'assets/prize_window.png');
    this.load.image('spin', 'assets/btn_spin.png');
    this.load.image('line1', 'assets/line_1.png');
    this.load.image('line4', 'assets/line_4.png');
    this.load.image('line5', 'assets/line_5.png');
    
    this.load.image('a', 'assets/symbols/sym_a.png');
    this.load.image('b', 'assets/symbols/sym_b.png');
    this.load.image('c', 'assets/symbols/sym_c.png');
    this.load.image('d', 'assets/symbols/sym_d.png');
    this.load.image('e', 'assets/symbols/sym_e.png');
  }
  
  update () {
    // if (this.fontsReady) {
      this.scene.start('GameScene')
    // }
  }
}
