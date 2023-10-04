import Phaser from 'phaser'

import { windowWidth, windowHeight, gameWidth, gameHeight, viewMode } from '../config'
import { checkStates, saveState, dateAsString, drawFrame, addButton, getStyles, padZero } from '../utils/tools'
import Wrapper from '../lib/api.engine'
import Reels from '../components/Reels/Reels';
import { LANDSCAPE } from '../consts';
// import ScrollingBackground from '../utils/ScrollingBackground'
// import Player from '../sprites/Player'
// import Enemy from '../sprites/Enemy'
let wrapper = new Wrapper();

const DEBUG = true;
const STYLES = getStyles();

export default class extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' })

    this.mute = false;
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
    const wh = viewMode === LANDSCAPE ? 430 : windowWidth - 38;
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

  initSounds() {
    //#region sounds
    if (!DEBUG) {
      this.song = this.sound.add('song-casino-night', {volume: 0.5});
      this.song.play();
    }
    this.soundRing = this.sound.add('ring', { volume: 0.5 });
    this.soundError = this.sound.add('error', { volume: 0.5 });
    this.soundSpin = this.sound.add('spin', { volume: 0.1 });
    //#endregion
  }

  initBackground() {
    //#region background
    if (!DEBUG) {
      this.background = this.add.tileSprite(0, 0, this.sys.game.config.width, this.sys.game.config.height, "bg-casino")
        .setOrigin(0)
        .setScale(this.sys.game.config.height / 376) // image size
      ;
      setInterval(() => {
        this.background.tilePositionX += 500;
      }, 60);
    }
    //#endregion
  }

  initFrame() {
    const { x, y, w, h } = this.cameraInfo;
    drawFrame(this.graphics, x, y, w, h);
  }
  
  initReels() {
    const spacing = viewMode === LANDSCAPE ? 150 : windowWidth / 3.4;
    
    return new Reels({
      scene: this,
      x: this.xOutsideOffset,
      y: this.yOutsideOffset - spacing * 10,
      spacing,
      data: wrapper.getReels()
    });
  }

  initCursors() {
    return this.input.keyboard.createCursorKeys();
  }

  initCameras(spacing) {
    const { x, y, w, h } = this.cameraInfo;

    this.cameras
      .add(x, y, w, h)
      .setScroll(this.xOutsideOffset - 76, this.yOutsideOffset - (spacing / 2));
  }

  initDebug() {
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

  initEvents() {
    this.input.on('pointerdown', () => this.doSpin());
  }

  addTexts() {
    this.spinInfo = this.add.text(
      10, 10,
      DEBUG ? `${viewMode}: ${windowWidth}` : "TAP EVERYWHERE TO SPIN",
      STYLES["title"]
    );
    
    this.prizeText = this.add.text(28, gameHeight - 47, this.baseText + padZero(this.points, 10), STYLES["prize"]);

    this.currentPrizeText = this.add.text(272, gameHeight - 52, "", STYLES["currentPrize"]);
  }

  addPaytable() {
    const paytableY = viewMode === LANDSCAPE ? 20 : windowWidth + 44;
    const paytableX = viewMode === LANDSCAPE ? windowWidth - 10 : 10;
    const style = STYLES["paytable"];

    this.paytableText = this.add.text(paytableX, paytableY, "PAY TABLE", STYLES["title"]);
    
    wrapper.PAYTABLE.forEach(({ symbol, prize }, i) => {
      if (viewMode === LANDSCAPE) {
        const yPos = 75 * (i - 1) + 120 + paytableY;

        const { x, y } = this.add.image(windowWidth - 80, yPos, symbol).setOrigin(0).setScale(2);

        this.add.text(x - 20, y + 20, prize, style);
      } else {
        const xPos = (windowWidth / 5) * (i - 1) + 82;
        
        const { x, y } = this.add.image(xPos, paytableY + 30, symbol).setOrigin(0).setScale(2);
        
        this.add.text(x + 32, y + 84, prize, style).setOrigin(0.5);
        // this.graphics.fillStyle(0xFF3333, 0.6);
        // this.graphics.fillRect(x + 32, y + 84, 40, 40);
      }
    });
  }

  addUserInfo() {
    this.startDateText = this.add.text(
      windowWidth - 186,
      windowHeight - (viewMode === LANDSCAPE ? 50 : 106),
      "Start date: " + dateAsString(this.startDate),
      STYLES["userInfo"]
    );
  }

  create() {
    this.initSounds();
    this.initBackground();

    this.centerX = gameWidth / 2;

    this.graphics = this.add.graphics();
    
    this.initFrame();

    this.bgHeight = gameWidth; // bg.height;

    this.frameContentSize = this.bgHeight - this.frameContentMargin * 2;
    this.frameContentSizeFix = this.frameContentSize / 3 / 2;

    this.reels = this.initReels();

    this.cursors = this.initCursors();

    this.initCameras(this.reels.spacing);

    //#region hud
    if (DEBUG) {
      this.initDebug();
    }
    //debug
    // this.cameras.add(0, 0, 100, 30 * 20).setScroll(-300, -1200).setZoom(0.2);

    addButton(this, this.graphics, 16, gameHeight - 50, viewMode === LANDSCAPE ? 360 : windowWidth - 30, 35);

    this.addTexts();

    this.addPaytable();

    this.addUserInfo();
    //#endregion

    this.initEvents();
  }
  
  update() {
    if (this.spinning) {
      this.reels.update();

      if (this.reels.allStopped) {
        const yOffset = 290;

        this.reels.restartAll();
        this.lastResults.prizes.forEach((prize => {
          // console.log(prize.lineId);
          switch (prize.lineId) {
            case 0:
              // this.lines.push(this.add.image(this.centerX + this.xOutsideOffset, this.yOutsideOffset + this.frameContentMargin + this.frameContentSize / 3 * 2 - this.frameContentSizeFix, 'line1'));
              this.lines.push(this.add.image(this.xOutsideOffset + 160, this.yOutsideOffset + (yOffset/2), 'line1'));
              break;
            case 1:
              // this.lines.push(this.add.image(this.centerX + this.xOutsideOffset, this.yOutsideOffset + this.frameContentMargin + this.frameContentSize / 3 - this.frameContentSizeFix, 'line1'));
              this.lines.push(this.add.image(this.xOutsideOffset + 160, this.yOutsideOffset, 'line1'));
              break;
            case 2:
              // this.lines.push(this.add.image(this.centerX + this.xOutsideOffset, this.yOutsideOffset + this.frameContentMargin + this.frameContentSize - this.frameContentSizeFix, 'line1'));
              this.lines.push(this.add.image(this.xOutsideOffset + 160, this.yOutsideOffset + yOffset, 'line1'));
              break;
            case 3:
              this.lines.push(this.add.image(this.xOutsideOffset + 140, this.yOutsideOffset + 144, 'line4'));
              break;
            case 4:
              this.lines.push(this.add.image(this.xOutsideOffset + 140, this.yOutsideOffset + 144, 'line5'));
              break;
          }
        }).bind(this));

        //#region update points
        this.points += this.lastResults.winnings;
        saveState({ points: this.points });
        this.currentPrizeText
          .setText(" + " + this.lastResults.winnings)
          .setFill(this.lastResults.winnings ? '#FF911D' : '#5C5C5C');
        this.soundSpin.stop();
        if (this.lastResults.winnings)
          if (!this.mute) this.soundRing.play();
          else
            if (!this.mute) this.soundError.play();

        if (DEBUG) {
          console.log(this.lastResults);
        }
        // for (let reel of this.reels) {
        //   console.log(reel.map(o => o.texture.key));
        // }

        this.prizeText
          .setText(this.baseText + padZero(this.points, 10));
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
    this.spinning = true;
    this.reels.spin(this.lastResults.reelsLayout);
  }
}
