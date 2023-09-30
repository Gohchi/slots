
const COUNT_STARTS_AT = -8; // currentCountStartsAt
const STOP_REEL_VALUE = 170; // 79
const STOP_SPIN = STOP_REEL_VALUE + 1;

export default class Reels {
  constructor({ scene, x, y, spacing, data }) {
    let offset = 0;
    
    this.items = data.map(infoList => new Reel({ scene, y, spacing, infoList,
      x: x + (spacing * offset++)
    }));

    this.scene = scene;
  }
  

  update() {
    this.items.forEach(reel => {
      if (reel.isSpinning) {
        if (reel.currentCount < 0) {
          reel.start();
        } else if (reel.currentCount > STOP_REEL_VALUE) {
          reel.stop();
        } else {
          reel.move();
        }
        reel.currentCount++;
      }
      if (reel.currentCount == STOP_SPIN) {
        reel.isSpinning = false;
      }
    });
  }

  
  get allStopped() {
    return this.items.every(reel => !reel.isSpinning);
  }

  restartAll() {
    this.items.forEach(reel => reel.currentCount = COUNT_STARTS_AT);
  }

  spin() {
    const delay = 2e2;
    let offset = 0;
    
    this.items.forEach(reel => setTimeout(
      () => reel.isSpinning = true,
      delay * offset++
    ));
    // this.reelsControl[0].isSpinning = true;
    // setTimeout(() => {
    //   this.reelsControl[1].isSpinning = true;
    //   setTimeout(() => {
    //     this.reelsControl[2].isSpinning = true;
    //   }, 2e2);
    // }, 2e2);
  }
}

class Reel {
  constructor({ scene, x, y, spacing, infoList }) {
    let offset = 0;

    this.items = infoList.map(info => {
      const _y = y + (spacing * offset++);
      
      return new ReelItem(
        scene.add.image(x, _y, info).setScale(3),
        // .setScale( this.cameraInfo.w / spacing )
        // .setScale( reelScale ),
        // .setScale( 1.4 )
        spacing
      );
    }
    );

    this.currentCount = COUNT_STARTS_AT;
    this.isSpinning = false;
  }

  start() {
    this.items.forEach(item => item.start());
  }
  stop() {
    this.items.forEach(item => item.stop());
  }
  move() {
    this.items.forEach(item => item.move());
  }
}

class ReelItem {
  constructor(image, spacing, speed=5) {
    this.IMAGE = image;
    this.TOTAL_LENGTH = (spacing - 3.3) * 20;
    this.SPEED = speed;
    this.START_LIMIT = -this.TOTAL_LENGTH;
    this.END_LIMIT = this.TOTAL_LENGTH;
  }

  get x() {
    return this.IMAGE.x;
  }
  set x(value) {
    this.IMAGE.x = value;
  }
  
  get y() {
    return this.IMAGE.y;
  }
  set y(value) {
    this.IMAGE.y = value;
  }

  start() {
    this.y -= this.SPEED;
    if (this.y < this.START_LIMIT) {
      this.y = this.END_LIMIT;
    }
  }

  stop() {
    this.y -= this.SPEED;
    if (this.y >= this.END_LIMIT + this.SPEED) {
      this.y = this.START_LIMIT;
    }
  }

  move() {
    this.y += 20;
    if (this.y >= this.END_LIMIT + this.SPEED) {
      this.y = this.START_LIMIT;
    }
  }
}