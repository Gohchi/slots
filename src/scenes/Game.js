import Phaser from 'phaser'

import { windowWidth, windowHeight, gameWidth, gameHeight } from '../config'
import { checkStates, saveState, dateAsString, drawFrame, addButton } from '../utils/tools'
import Wrapper from '../lib/api.engine'
import Reels from '../components/Reels/Reels';
// import ScrollingBackground from '../utils/ScrollingBackground'
// import Player from '../sprites/Player'
// import Enemy from '../sprites/Enemy'
let wrapper = new Wrapper();

const DEBUG = true;


export default class extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' })

    this.mute = true;
    // configure state
    this.states = checkStates();
    this.points = this.states.points || 0;
    if (!this.states.startDate) {
      let newDate = new Date();
      saveState({ startDate: newDate });
      this.startDate = newDate;
    } else {
      this.startDate = this.states.startDate;
    }

    this.baseText = 'SCORE: $';
    const wh = 430;
    this.xOutsideOffset = -400;
    this.yOutsideOffset = 0;
    this.frameContentMargin = 25;
    // this.frameBorderOffset = 35;
    this.frameBorderOffset = wh * .08;
    this.reelsResultOffset = 17;
    this.lines = [];
    this.spinning = false;
    const gameXPosition = windowWidth / 2 - gameWidth / 2;
    this.cameraInfo = {
      x: windowWidth < 700 ? 10 : gameXPosition,
      y: 50,
      w: wh,
      h: wh
    }
  }

  create() {
    //#region sounds
    // this.song = this.sound.add('song-casino-night', {volume: 0.5});
    // this.song.play();
    this.soundRing = this.sound.add('ring', { volume: 0.5 });
    this.soundError = this.sound.add('error', { volume: 0.5 });
    this.soundSpin = this.sound.add('spin', { volume: 0.1 });
    //#endregion

    //#region background
    // this.background = this.add.tileSprite(0, 0, this.sys.game.config.width, this.sys.game.config.height, "bg-casino")
    //   .setOrigin(0)
    //   .setScale(this.sys.game.config.height / 376) // image size
    // ;
    // setInterval(() => {
    //   this.background.tilePositionX += 500;
    // }, 60);
    //#endregion

    this.centerX = gameWidth / 2;

    this.graphics = this.add.graphics();
    drawFrame(this.graphics, this.cameraInfo.x, this.cameraInfo.y, this.cameraInfo.w, this.cameraInfo.h);

    this.bgHeight = gameWidth; // bg.height;

    this.frameContentSize = this.bgHeight - this.frameContentMargin * 2;
    this.frameContentSizeFix = this.frameContentSize / 3 / 2;

    const spacing = 144;
    // const spacing = this.spacing = this.cameraInfo.w / 3;
    // const spacingFix = spacing - 3.3;
    // const reelScale = this.cameraInfo.w / spacing;
    this.reels = new Reels({
      scene: this,
      x: this.xOutsideOffset,
      y: this.yOutsideOffset - spacing * 10,
      spacing,
      data: wrapper.getReels()
    });

    this.cursors = this.input.keyboard.createCursorKeys();

    this.cameras
      .add(this.cameraInfo.x, this.cameraInfo.y, this.cameraInfo.w, this.cameraInfo.h)
      .setScroll(this.xOutsideOffset - 76, this.yOutsideOffset - (spacing / 2));

    if (DEBUG) {
      const { x, y, w, h } = {
        x: 980, y: 30, w: 400, h: 700
      };
      // debug camera
      this.cameras.add(x, y, w, h)
        .setOrigin(0)
        .setScroll(this.xOutsideOffset -76, -1750)
        .setZoom(.2);

      const graphics = this.graphics;
      graphics.lineStyle(2, 0xaf4f00);
      graphics.strokeRect(x, y, w, h);
    }
    //debug
    // this.cameras.add(0, 0, 100, 30 * 20).setScroll(-300, -1200).setZoom(0.2);

    //#region info
    this.spinInfo = this.add.text(10, 10, "TAP EVERYWHERE TO SPIN", {
      fill: '#FFFFFF',
      fontFamily: 'Arial',
      fontSize: '22px',
      fontStyle: 'bold'
    });

    addButton(this, this.graphics, 16, gameHeight - 50, 360, 35);

    this.prizeText = this.add.text(114, gameHeight - 47, this.baseText + this.padZero(this.points, 10), {
      fill: '#1b3768',
      fontFamily: 'Arial',
      fontSize: '24px',
      fontStyle: 'bold',
      align: 'center'
    });

    this.currentPrizeText = this.add.text(28, gameHeight - 52, "", {
      fontFamily: 'Arial',
      fill: '#FF911D',
      fontSize: '32px',
      fontStyle: 'bold'
    });

    // paytable
    const style = {
      fill: '#FFFFFF',
      fontFamily: 'Arial',
      fontSize: '22px',
      fontStyle: 'bold',
      rtl: true
    };
    const paytableY = 20;
    this.paytableText = this.add.text(windowWidth - 10, paytableY, "PAY TABLE", style)
    wrapper.PAYTABLE.forEach((o, i) => {
      let yPos = 75 * (i - 1) + 120 + paytableY;
      let img = this.add.image(windowWidth - 80, yPos, o.symbol).setOrigin(0).setScale(2);
      this.add.text(img.x - 20, img.y + 20, o.prize, style)
    })

    // user info
    const startDate = dateAsString(this.startDate)
    this.startDateText = this.add.text(windowWidth - 10, windowHeight - 30, "Start date: " + startDate, Object.assign({}, style, { fontSize: '18px' }))

    //#endregion

    //#region events
    this.input.on('pointerdown', () => this.doSpin());
    //#endregion
  }
  
  update() {
    if (this.spinning) {
      this.reels.update();

      if (this.reels.allStopped) {
        this.reels.restartAll();
        this.lastResults.prizes.forEach((prize => {
          // console.log(prize.lineId);
          switch (prize.lineId) {
            case 0:
              this.lines.push(this.add.image(this.centerX + this.xOutsideOffset, this.yOutsideOffset + this.frameContentMargin + this.frameContentSize / 3 * 2 - this.frameContentSizeFix, 'line1'));
              break;
            case 1:
              this.lines.push(this.add.image(this.centerX + this.xOutsideOffset, this.yOutsideOffset + this.frameContentMargin + this.frameContentSize / 3 - this.frameContentSizeFix, 'line1'));
              break;
            case 2:
              this.lines.push(this.add.image(this.centerX + this.xOutsideOffset, this.yOutsideOffset + this.frameContentMargin + this.frameContentSize - this.frameContentSizeFix, 'line1'));
              break;
            case 3:
              this.lines.push(this.add.image(this.centerX + this.xOutsideOffset, this.yOutsideOffset + this.bgHeight / 2, 'line4'));
              break;
            case 4:
              this.lines.push(this.add.image(this.centerX + this.xOutsideOffset, this.yOutsideOffset + this.bgHeight / 2, 'line5'));
              break;
          }
        }).bind(this));

        //#region update points
        this.points += this.lastResults.winnings;
        saveState({ points: this.points });
        this.currentPrizeText
          .setText("$ " + this.lastResults.winnings)
          .setFill(this.lastResults.winnings ? '#FF911D' : '#5C5C5C');
        this.soundSpin.stop();
        if (this.lastResults.winnings)
          if (!this.mute) this.soundRing.play();
          else
            if (!this.mute) this.soundError.play();

        console.log(this.lastResults);
        // for (let reel of this.reels) {
        //   console.log(reel.map(o => o.texture.key));
        // }

        this.prizeText
          .setText(this.baseText + this.padZero(this.points, 10));
        //#endregion

        this.spinning = false;
      }
    }
  }

  doSpin() {
    if (this.spinning) return;

    this.lines.forEach(line => {
      line.destroy();
    });
    this.lines = [];
    if (!this.mute) this.soundSpin.play();
    this.lastResults = wrapper.spin();
    this.currentPrizeText.setText("");
    this.spin();
  }

  spin() {
    // this.prizeText.setText(this.baseText + '0');
    this.spinning = true;
    this.reels.spin(this.lastResults.reelsLayout);
    
    //#region update textures
    // this.reelsResultOffset += 9;
    // if (this.reelsResultOffset >= 20) this.reelsResultOffset -= 20;
    // for (let i = 0; i < 3; i++) {
    //   let rro = this.reelsResultOffset;
    //   for (let l = 0; l < 3; l++) {
    //     if (rro >= 20) rro -= 20;
    //     this.reels[i][rro++]
    //       .setTexture(this.lastResults.reelsLayout[i][l]);
    //   }
    // }
    //#endregion
  }


  padZero(n, len = 2) {
    return ('0'.repeat(len) + n).slice(-len);
  }
  getIndex(reel) {
    return Math.floor((reel.y + 2305) / 140);
  }
}
