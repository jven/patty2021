const main = () => {
  resetGame();
};

const resetGame = () => {
  getStage().innerHtml = '';

  const testPic = new Pic(
      'pics/a.jpg',
      /* size= */ [500, 300],
      /* position= */ [100, 300],
      /* direction= */ 'SE',
      /* speed= */ 10);
  testPic.renderIntoStage(getStage());

  requestAnimationFrame(() => onAnimationFrame(testPic));
};

const onAnimationFrame = (pic) => {
  pic.update();

  requestAnimationFrame(() => onAnimationFrame(pic));
};

const getStage = () => {
  return document.getElementById('stage');
};

class Pic {
  constructor(imageUrl, size, position, direction, speed) {
    this.size_ = size.concat();
    this.position_ = position.concat();
    this.direction_ = direction;
    this.speed_ = speed;
    this.lastUpdateTime_ = 0;

    this.imageEl_ = document.createElement('img');
    this.imageEl_.src = imageUrl;
    this.imageEl_.style.width = this.size_[0] + 'px';
    this.imageEl_.style.height = this.size_[1] + 'px';
    this.imageEl_.classList.add('pic');
  }

  renderIntoStage(stageEl) {
    this.lastUpdateTime_ = Date.now();
    stageEl.appendChild(this.imageEl_);
  }

  update() {
    const nowTime = Date.now();
    const elapsedTimeMs = nowTime - this.lastUpdateTime_;
    this.lastUpdateTime_ = nowTime;

    this.maybeBounce_(elapsedTimeMs);
    this.position_ = this.calculateNextPosition_(this.direction_, elapsedTimeMs);
    this.imageEl_.style.left = this.position_[0] + 'px';
    this.imageEl_.style.top = this.position_[1] + 'px';
  }

  dispose() {
    this.imageEl_.removeChild();
  }

  maybeBounce_(elapsedTimeMs) {
    for (let i = 0; i < 4; i++) {
      const nextPosition = this.calculateNextPosition_(this.direction_, elapsedTimeMs);
      if (this.isPositionInBounds_(nextPosition)) {
        return;
      }
      console.log('bounce');
      switch (this.direction_) {
        case 'NW':
          this.direction_ = 'NE';
          break;
        case 'NE':
          this.direction_ = 'SE';
          break;
        case 'SE':
          this.direction_ = 'SW';
          break;
        case 'SW':
          this.direction_ = 'NW';
          break;
      }
    }
  }

  calculateNextPosition_(direction, elapsedTimeMs) {
    let dLeft = 0;
    let dTop = 0;
    switch (direction) {
      case 'NW':
        dLeft = -1;
        dTop = -1;
        break;
      case 'NE':
        dLeft = 1;
        dTop = -1;
        break;
      case 'SE':
        dLeft = 1;
        dTop = 1;
        break;
      case 'SW':
        dLeft = -1;
        dTop = 1;
        break;
    }

    return [this.position_[0] + dLeft * this.speed_, this.position_[1] + dTop * this.speed_];
  }

  isPositionInBounds_(position) {
    return position[0] >= 0 && (position[0] + this.size_[0]) < window.innerWidth
        && position[1] >= 0 && (position[1] + this.size_[1]) < window.innerHeight;
  }
}

window.onload = main;