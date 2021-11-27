const PIC_URL_PREFIX_LENGTH = "pics/".length;
const PIC_SIZING_TIME_MS = 100;
const BETWEEN_ROUND_TIME_MS = 1000;

const main = () => {
  resetGame(PIC_URLS);
};

const resetGame = (picUrls) => {
  const game = new Game(getStage(), picUrls, /* numRounds= */ 10);
  game.startNextRound();
};

const chooseRandomPicUrl = (picUrls) => {
  return picUrls[Math.floor(Math.random() * picUrls.length)];
};

const getDateFromPicUrl = (picUrl) => {
  const year = parseInt(picUrl.slice(PIC_URL_PREFIX_LENGTH, PIC_URL_PREFIX_LENGTH + 4));
  const month = parseInt(picUrl.slice(PIC_URL_PREFIX_LENGTH + 4, PIC_URL_PREFIX_LENGTH + 6));
  const d = [year * 100 + month, `${getMonthName(month)} ${year}`];
  console.log(`picUrl = ${picUrl}, date = ${d}`);
  return d;
};

const getMonthName = (month) => {
  return (month >= 1 && month <= 12)
      ? ["!!!", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][month]
      : "???";
};

const getStage = () => {
  return document.getElementById('stage');
};

class Game {
  constructor(stageEl, picUrls, numRounds) {
    this.stageEl_ = stageEl;
    this.picUrls_ = picUrls;
    this.currentRoundIndex_ = 0;
    this.currentRound_ = null;
    this.numRounds_ = numRounds;
  }

  startNextRound() {
    if (this.currentRound_) {
      this.currentRound_.dispose();
    }
    this.currentRound_ = this.generateRandomRound_(this.currentRoundIndex_);
    this.currentRound_.renderIntoStage(this.stageEl_);
  }

  onRoundEnd_(didPattyWin) {
    if (!didPattyWin) {
      return;
    }

    this.currentRoundIndex_++;
    if (this.currentRoundIndex_ >= this.numRounds_) {
      // TODO(jven): Handle game victory.
      return;
    }

    setTimeout(() => {
      this.stageEl_.innerHTML = '';
      this.startNextRound();
    }, BETWEEN_ROUND_TIME_MS);
  }

  generateRandomRound_(roundIndex) {
    const numPics = roundIndex < 5 ? 2 : 3;
    const roundPicUrls = [];
    const roundPicDates = new Set();
    const roundPics = [];
    let oldestDate = 999999;
    let oldestDateIndex = -1;
    for (let i = 0; i < numPics; i++) {
      const picUrl = chooseRandomPicUrl(this.picUrls_);
      const picDate = getDateFromPicUrl(picUrl);
      if (roundPicDates.has(picDate[0])) {
        // We chose two pics with the same date, try again.
        console.log('Collision while generating round, trying again...');
        return this.generateRandomRound_(this.picUrls_, numPics);
      }

      roundPicUrls.push(picUrl);
      roundPicDates.add(picDate[0]);
      if (picDate[0] < oldestDate) {
        oldestDate = picDate[0];
        oldestDateIndex = i;
      }

      const centerLeft = window.innerWidth / 2;
      const centerTop = (2 * i + 1) * (window.innerHeight / (2 * numPics));
      roundPics.push(new Pic(
          picUrl,
          [centerLeft, centerTop],
          /* prettyDate= */ picDate[1]));
    }

    return new Round(
        roundPics,
        /* winningIndex= */ oldestDateIndex,
        /* roundEndCallbackFn= */ (didPattyWin) => this.onRoundEnd_(didPattyWin));
  };
}

class Round {
  constructor(pics, winningIndex, roundEndCallbackFn) {
    this.pics_ = pics.concat();
    this.winningIndex_ = winningIndex;
    this.roundEndCallbackFn_ = roundEndCallbackFn;
  }

  renderIntoStage(stageEl) {
    for (let i = 0; i < this.pics_.length; i++) {
      const pic = this.pics_[i];
      pic.renderIntoStage(stageEl);
      pic.setOnClickHandler(() => {
        this.onRoundEnd_(/* tappedIndex= */ i);
      });
    }

    setTimeout(() => {
      let totalHeight = 0;
      for (let i = 0; i < this.pics_.length; i++) {
        totalHeight += this.pics_[i].getSize()[1];
      }
      
      const totalMargin = Math.max(0, window.innerHeight - totalHeight);
      const eachMargin = totalMargin / (this.pics_.length + 1);
      let currentTop = eachMargin;
      for (let i = 0; i < this.pics_.length; i++) {
        const left = (window.innerWidth / 2) - (this.pics_[i].getSize()[0] / 2);
        this.pics_[i].showAtPosition(left, currentTop);
        currentTop += this.pics_[i].getSize()[1] + eachMargin;
      }
    }, PIC_SIZING_TIME_MS);
  }

  onRoundEnd_(tappedIndex) {
    for (let i = 0; i < this.pics_.length; i++) {
      const pic = this.pics_[i];
      let picClass;
      if (i == this.winningIndex_) {
        picClass = 'yay';
      } else if (i == tappedIndex) {
        picClass = 'dang';
      } else {
        picClass = 'info';
      }
      pic.showDateAndRemoveClickHandler(picClass);
    }

    this.roundEndCallbackFn_(tappedIndex == this.winningIndex_);
  }

  dispose() {
    for (const pic of this.pics_) {
      pic.dispose();
    }
    this.pics_ = [];
  }
}

class Pic {
  constructor(imageUrl, position, prettyDate) {
    this.position_ = position;

    this.containerEl_ = document.createElement('div');
    this.containerEl_.classList.add('pic');
    this.containerEl_.classList.add('hidden');

    const imageEl = document.createElement('img');
    imageEl.src = imageUrl;
    this.containerEl_.appendChild(imageEl);

    const prettyDateEl = document.createElement('div');
    prettyDateEl.classList.add('prettyDate');
    prettyDateEl.innerHTML = prettyDate;
    this.containerEl_.appendChild(prettyDateEl);
  }

  renderIntoStage(stageEl) {
    stageEl.appendChild(this.containerEl_);
  }

  getSize() {
    return [this.containerEl_.offsetWidth, this.containerEl_.offsetHeight];
  }

  showAtPosition(left, top) {
    this.containerEl_.style.left = `${left}px`;
    this.containerEl_.style.top = `${top}px`;
    this.containerEl_.classList.remove('hidden');
  }

  setOnClickHandler(handlerFn) {
    this.containerEl_.onclick = handlerFn;
  }

  showDateAndRemoveClickHandler(picClass) {
    this.containerEl_.onclick = () => {};
    this.containerEl_.classList.add(picClass);
  }

  dispose() {
    this.containerEl_.remove();
  }
}

window.onload = main;