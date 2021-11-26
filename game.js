const main = () => {
  resetGame(PICS);
};

const resetGame = (pics) => {
  getStage().innerHtml = '';

  const randomPicUrl = pics[Math.floor(Math.random() * pics.length)];

  const round = new Round([
    new Pic(randomPicUrl, /* position= */ [100, 100])
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
  constructor(imageUrl, position) {
    this.position_ = position.concat();

    this.imageEl_ = document.createElement('img');
    this.imageEl_.src = imageUrl;
    this.imageEl_.style.left = `${position[0]}px`;
    this.imageEl_.style.top = `${position[1]}px`;
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
  }

  update() {
  }

  dispose() {
    this.imageEl_.remove();
  }
}

window.onload = main;