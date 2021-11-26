const main = () => {
  resetGame(PICS);
};

const resetGame = (pics) => {
  getStage().innerHtml = '';

  const randomPicUrl = pics[Math.floor(Math.random() * pics.length)];

  const round = new Round([
    new Pic(
        randomPicUrl,
        /* size= */ [500, 300],
        /* position= */ [100, 100],
        /* direction= */ 'NW',
        /* speed= */ 0)
  ], /* winningIndex= */ 0);
  round.renderIntoStage(getStage());

  requestAnimationFrame(() => onAnimationFrame(round));
};

const onAnimationFrame = (round) => {
  round.update();

  requestAnimationFrame(() => onAnimationFrame(round));
};

const getStage = () => {
  return document.getElementById('stage');
};

class Round {
  constructor(pics, winningIndex) {
    this.pics_ = pics.concat();
    this.winningIndex_ = winningIndex;
  }

  renderIntoStage(stageEl) {
    for (let i = 0; i < this.pics_.length; i++) {
      const pic = this.pics_[i];
      pic.renderIntoStage(stageEl);
      pic.setOnClickHandler(() => {
        const didPattyWin = i == this.winningIndex_;
        this.onRoundEnd_(didPattyWin);
      });
    }
  }

  onRoundEnd_(didPattyWin) {
    for (const pic of this.pics_) {
      pic.markEndOfRound();
    }
  }

  update() {
    for (const pic of this.pics_) {
      pic.update();
    }
  }

  dispose() {
    for (const pic of this.pics_) {
      pic.dispose();
    }
    this.pics_ = [];
  }
}

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

  setOnClickHandler(handlerFn) {
    this.imageEl_.onclick = handlerFn;
  }

  markEndOfRound() {
    this.speed_ = 0;
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
    this.imageEl_.remove();
  }

  maybeBounce_(elapsedTimeMs) {
    const TEST_DISTANCE = 10;
    switch (this.direction_) {
      case 'NW':
        if (!this.isAddInBounds_(-TEST_DISTANCE, 0) && this.isAddInBounds_(0, -TEST_DISTANCE)) {
          this.direction_ = 'NE';
        } else if (!this.isAddInBounds_(0, -TEST_DISTANCE) && this.isAddInBounds_(-TEST_DISTANCE, 0)) {
          this.direction_ = 'SW';
        } else if (!this.isAddInBounds_(-TEST_DISTANCE, -TEST_DISTANCE)) {
          this.direction_ = 'SE';
        }
        break;
      case 'NE':
        if (!this.isAddInBounds_(TEST_DISTANCE, 0) && this.isAddInBounds_(0, -TEST_DISTANCE)) {
          this.direction_ = 'NW';
        } else if (!this.isAddInBounds_(0, -TEST_DISTANCE) && this.isAddInBounds_(TEST_DISTANCE, 0)) {
          this.direction_ = 'SE';
        } else if (!this.isAddInBounds_(TEST_DISTANCE, -TEST_DISTANCE)) {
          this.direction_ = 'SW';
        }
        break;
      case 'SE':
        if (!this.isAddInBounds_(TEST_DISTANCE, 0) && this.isAddInBounds_(0, TEST_DISTANCE)) {
          this.direction_ = 'SW';
        } else if (!this.isAddInBounds_(0, TEST_DISTANCE) && this.isAddInBounds_(TEST_DISTANCE, 0)) {
          this.direction_ = 'NE';
        } else if (!this.isAddInBounds_(TEST_DISTANCE, TEST_DISTANCE)) {
          this.direction_ = 'NW';
        }
        break;
      case 'SW':
        if (!this.isAddInBounds_(-TEST_DISTANCE, 0) && this.isAddInBounds_(0, TEST_DISTANCE)) {
          this.direction_ = 'SE';
        } else if (!this.isAddInBounds_(0, TEST_DISTANCE) && this.isAddInBounds_(-TEST_DISTANCE, 0)) {
          this.direction_ = 'NW';
        } else if (!this.isAddInBounds_(-TEST_DISTANCE, TEST_DISTANCE)) {
          this.direction_ = 'NE';
        }
        break;
    }
  }

  isAddInBounds_(dLeft, dTop) {
    const addPos = [this.position_[0] + dLeft, this.position_[1] + dTop];
    return this.isPositionInBounds_(addPos);
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

    return [this.position_[0] + dLeft * elapsedTimeMs * this.speed_, this.position_[1] + dTop * elapsedTimeMs * this.speed_];
  }

  isPositionInBounds_(position) {
    return position[0] >= 0 && (position[0] + this.size_[0]) < window.innerWidth
        && position[1] >= 0 && (position[1] + this.size_[1]) < window.innerHeight;
  }
}

window.onload = main;