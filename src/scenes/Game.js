import Phaser from 'phaser'

import { gameWidth, gameHeight } from '../config'
import { checkStates, saveState, dateAsString, drawFrame, addButton } from '../utils/tools'
import Wrapper from '../lib/api.engine'
// import ScrollingBackground from '../utils/ScrollingBackground'
// import Player from '../sprites/Player'
// import Enemy from '../sprites/Enemy'
let wrapper = new Wrapper();

export default class extends Phaser.Scene {
  constructor () {
    super({ key: 'GameScene' })


    // configure state
    this.states = checkStates();
    this.points = this.states.points || 0;
    if(!this.states.startDate){
      let newDate = new Date();
      saveState({startDate: newDate});
      this.startDate = newDate;
    } else {
      this.startDate = this.states.startDate;
    }

    this.baseText = 'SCORE: $';
    this.xOutsideOffset = -500;
    this.yOutsideOffset = -30;
    this.frameContentMargin = 25;
    this.frameBorderOffset = 35;
    this.reelsResultOffset = 17;
    this.lines = [];
    this.currentCountStartsAt = -8;
    this.reelsControl = [
      { isSpinning: false, currentCount: this.currentCountStartsAt },
      { isSpinning: false, currentCount: this.currentCountStartsAt },
      { isSpinning: false, currentCount: this.currentCountStartsAt }
    ];
    this.startSpin = false;
    this.cameraInfo = {
      x: 30, y: 30, w: 430, h: 430
    }
  }

  create () {
    this.song = this.sound.add('song-casino-night', {volume: 0.5});
    this.song.play();

    
    this.background = this.add.tileSprite(0, 0, 500, 376, "bg-casino").setOrigin(0).setScale(1.5);
    setInterval(() => {
      this.background.tilePositionX += 500;
    }, 60);

    this.centerX = gameWidth / 2;

    this.graphics = this.add.graphics();
    drawFrame(this.graphics, this.cameraInfo.x, this.cameraInfo.y, this.cameraInfo.w, this.cameraInfo.h);

    addButton(this, this.graphics, 16, 504, 280, 35);
    // this.add.image(100, gameHeight - 40, 'prize');
    // let bg = this.add.image(0, 0, 'bg').setAlpha(0.8);
    // bg.setPosition(gameWidth / 2, bg.height / 2);
    this.bgHeight = gameWidth; // bg.height;

    this.frameContentSize = this.bgHeight - this.frameContentMargin * 2;
    this.frameContentSizeFix = this.frameContentSize / 3 / 2;

    let reelInfoList = wrapper.getReels();
    this.reels = [[], [], []];
    for (let i in reelInfoList) {
      let i = parseInt(i);
      reelInfoList[i].forEach(((reelInfo, l) => {
        this.reels[i].push(this.add.image(this.xOutsideOffset + 140 * (i + 1) - this.frameBorderOffset, -(2410) + 140 * (l + 1) - this.frameBorderOffset, reelInfo).setScale(3));
        
      }).bind(this));
    };

    this.cursors = this.input.keyboard.createCursorKeys();

    this.cameras.add(this.cameraInfo.x, this.cameraInfo.y, this.cameraInfo.w, this.cameraInfo.h).setScroll(-470, 0);
    //debug
    // this.cameras.add(0, 0, 100, 30 * 20).setScroll(-300, -1200).setZoom(0.2);

    this.prizeText = this.add.text(100, gameHeight - 40, this.baseText + this.points, {
      fill: '#1b3768',
      fontFamily: 'Arial',
      fontSize: '20px',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);
    addButton(this, this.graphics, 305, 504, 169, 35, {
      text: 'SPIN',
      callback: () => {
        this.lines.forEach(line => {
          line.destroy();
        });
        this.lines = [];
        this.soundSpin.play();
        this.lastResults = wrapper.spin();
        this.currentPrizeText
          .setText("")
        this.spin(this.reels);
      },
      execCondition: () => !this.startSpin
    });
    // this.setButtonStyle(this.add.image(gameWidth - 100, gameHeight - 40, 'spin'))
    //   .on('pointerup', () => {
    //     this.lines.forEach(line => {
    //       line.destroy();
    //     });
    //     this.lines = [];
    //     if (this.startSpin) return;
    //     this.soundSpin.play();
    //     this.lastResults = wrapper.spin();
    //     this.currentPrizeText
    //       .setText("")
    //     this.spin(this.reels);
    //   });

    this.currentPrizeText = this.add.text(gameWidth / 2, gameHeight - 40, "", {
      fontFamily: 'Arial',
      fill: '#FF911D',
      fontSize: '32px',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);

    // paytable
    const style = {
      fill: '#FFFFFF',
      fontFamily: 'Arial',
      fontSize: '22px',
      fontStyle: 'bold'
    };
    const paytableY = 140;
    this.paytableText = this.add.text(gameWidth + 10 , paytableY, "PAY TABLE", style)
    wrapper.PAYTABLE.forEach((o, i) => {
      let yPos = 75 * (i - 1) + 120 + paytableY;
      let img = this.add.image(gameWidth + 10 , yPos, o.symbol).setOrigin(0).setScale(2);
      this.add.text(img.x + 75, img.y + 20, o.prize, style)
    })

    // user info
    const startDate = dateAsString(this.startDate)
    this.startDateText = this.add.text(gameWidth + 10 , 10, "Start date: " + startDate, Object.assign({}, style, { fontSize: '18px' }))

    
    this.soundRing = this.sound.add('ring', {volume: 0.5});
    this.soundError = this.sound.add('error', {volume: 0.5});
    this.soundSpin = this.sound.add('spin', {volume: 0.1});
  }
  
  update() {
    if(this.startSpin){
      function startReel(reel) {
        reel.y -= 5;
        if(reel.y < -2305){
          reel.y = 490;
        }
      }
      function stopReel(reel) {
        reel.y -= 5;
        if(reel.y >= 495){
          reel.y = -2305;
        }
      }
      function moveReel(reel) {
        reel.y += 20;
        if(reel.y >= 495){
          reel.y = -2305;
        }
      }
      for(let i = 0; i < 3; i++){
        if (this.reelsControl[i].isSpinning) {
          if(this.reelsControl[i].currentCount < 0){
            this.reels[i].forEach(startReel);
          } else if(this.reelsControl[i].currentCount > (7 * 12) - 5) {
            this.reels[i].forEach(stopReel);
          } else {
            this.reels[i].forEach(moveReel);
          }
          
          this.reelsControl[i].currentCount++;
        }
        if (this.reelsControl[i].currentCount == 7 * 12){
          this.reelsControl[i].isSpinning = false;
        }
      }

      if(!this.reelsControl[0].isSpinning
        &&!this.reelsControl[1].isSpinning
        &&!this.reelsControl[2].isSpinning) {
        this.reelsControl[0].currentCount = this.currentCountStartsAt;
        this.reelsControl[1].currentCount = this.currentCountStartsAt;
        this.reelsControl[2].currentCount = this.currentCountStartsAt;
        this.lastResults.prizes.forEach((prize => {
          // console.log(prize.lineId);
          switch(prize.lineId){
            case 0:
              this.lines.push(this.add.image(this.centerX + this.xOutsideOffset, this.yOutsideOffset + this.frameContentMargin + this.frameContentSize / 3 * 2- this.frameContentSizeFix, 'line1'));
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
        this.points += this.lastResults.winnings;
        saveState({ points: this.points });
        this.currentPrizeText
          .setText("$ " + this.lastResults.winnings)
          .setFill( this.lastResults.winnings ? '#FF911D' : '#5C5C5C');
        this.soundSpin.stop();
        if(this.lastResults.winnings)
          this.soundRing.play();
        else
          this.soundError.play();

        this.prizeText
          .setText(this.baseText + this.points);
        this.startSpin = false;
      }
    }
  }
  
  spin() {
    // this.prizeText.setText(this.baseText + '0');
    this.startSpin = true;
    this.reelsControl[0].isSpinning = true;
    setTimeout(() => {
      this.reelsControl[1].isSpinning = true;
      setTimeout(() => {
        this.reelsControl[2].isSpinning = true;
      }, 2e2);
    }, 2e2);

    this.reelsResultOffset += 9;
    if (this.reelsResultOffset >= 20) this.reelsResultOffset -= 20;
    for(let i = 0; i < 3; i++){
      let rro = this.reelsResultOffset;
      for(let l = 0; l < 3; l++){
        if (rro >= 20) rro -= 20;
        // let reel = 
        this.reels[i][rro++]
          .setTexture(this.lastResults.reelsLayout[i][l]);
          // reel.tint = 0x888888;
              
          // setTimeout((function (r){
          //   return function (){
          //     r.tint = 0xffffff;
          //   }
          // })(reel), 3e3);
      }
    }
  }


  getIndex(reel){
    return Math.floor((reel.y + 2305) / 140);
  }
}
