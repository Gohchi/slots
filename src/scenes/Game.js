import Phaser from 'phaser'

import { gameWidth, gameHeight } from '../config'
import Wrapper from '../lib/api.engine'
// import ScrollingBackground from '../utils/ScrollingBackground'
// import Player from '../sprites/Player'
// import Enemy from '../sprites/Enemy'
let wrapper = new Wrapper();

export default class extends Phaser.Scene {
  constructor () {
    super({ key: 'GameScene' })

    this.baseText = 'WIN: $';
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
  }

  create () {
    this.centerX = gameWidth / 2;

    let bg = this.add.image(0, 0, 'bg');
    bg.setPosition(gameWidth / 2, bg.height / 2);
    this.bgHeight = bg.height;

    this.frameContentSize = bg.height - this.frameContentMargin * 2;
    this.frameContentSizeFix = this.frameContentSize / 3 / 2;

    let reelInfoList = wrapper.getReels();
    this.reels = [[], [], []];
    for (let i in reelInfoList) {
      let i = parseInt(i);
      reelInfoList[i].forEach(((reelInfo, l) => {
        this.reels[i].push(this.add.image(this.xOutsideOffset + 140 * (i + 1) - this.frameBorderOffset, -(2410) + 140 * (l + 1) - this.frameBorderOffset, reelInfo));
        
      }).bind(this));
    };

    this.cursors = this.input.keyboard.createCursorKeys();

    this.cameras.add(30, 30, 430, 430).setScroll(-470, 0);
    //debug
    // this.cameras.add(0, 0, 100, 30 * 20).setScroll(-300, -1200).setZoom(0.2);

    this.add.image(100, gameHeight - 40, 'prize');
    this.prizeText = this.add.text(100, gameHeight - 40, this.baseText + '0', {
      fill: '#1b3768',
      fontFamily: 'Arial',
      fontSize: '20px',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);
    this.setButtonStyle(this.add.image(gameWidth - 100, gameHeight - 40, 'spin'))
      .on('pointerup', () => {
        this.lines.forEach(line => {
          line.destroy();
        });
        this.lines = [];
        if (this.startSpin) return;
        this.lastResults = wrapper.spin();
        this.spin(this.reels);
        // console.log(results);
       });
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
          console.log(prize.lineId);
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
        this.prizeText.setText(this.baseText + this.lastResults.winnings.toString());
        this.startSpin = false;
      }
    }
  }
  
  spin() {
    this.prizeText.setText(this.baseText + '0');
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

  setButtonStyle(button){
    button
      .setInteractive()
      .on('pointerover', function () { button.tint = 0xdddddd; })
      .on('pointerout', function () { button.tint = 0xffffff; })
      .on('pointerdown', () => { 
        if (this.startSpin) return;
        button.tint = 0x888888; })
      .on('pointerup', () => { 
        if (this.startSpin) return;
        button.tint = 0xffffff; });
    return button;
  }

  getIndex(reel){
    return Math.floor((reel.y + 2305) / 140);
  }
}
