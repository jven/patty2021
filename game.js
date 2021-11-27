const PIC_URL_PREFIX_LENGTH = "pics/".length;
const PIC_SIZING_TIME_MS = 100;
const BETWEEN_ROUND_TIME_MS = 1000;
const NUM_ROUNDS = 10;
const COUNTDOWN_TIME_MS = 30000;

const main = () => {
  preloadImages();
  const game = new Game(
      document.getElementById('stage'),
      document.getElementById('timer'),
      document.getElementById('score'),
      PIC_URLS,
      NUM_ROUNDS,
      COUNTDOWN_TIME_MS);
  game.start();
};

const preloadImages = () => {
  const preloadEl = document.getElementById('preload');
  for (let i = 0; i < PIC_URLS.length; i++) {
    const imageEl = document.createElement('img');
    imageEl.src = PIC_URLS[i];
    preloadEl.appendChild(imageEl);
  }
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

class Game {
  constructor(stageEl, timerEl, scoreEl, picUrls, numRounds, countdownMs) {
    this.stageEl_ = stageEl;
    this.timerEl_ = timerEl;
    this.scoreEl_ = scoreEl;
    this.picUrls_ = picUrls;
    this.currentRoundIndex_ = 0;
    this.currentRound_ = null;
    this.numRounds_ = numRounds;
    this.isGameOver_ = false;
    this.gameStartTimeMs_ = 0;
    this.countdownMs_ = countdownMs;
  }

  start() {
    this.gameStartTimeMs_ = Date.now();
    this.maybeUpdateTimerOnAnimationFrame_();
    this.startNextRound_();
  }

  maybeUpdateTimerOnAnimationFrame_() {
    if (this.isGameOver_) {
      return;
    }

    this.updateTimerNow_();
    requestAnimationFrame(() => this.maybeUpdateTimerOnAnimationFrame_());
  }

  updateTimerNow_() {
    const timeLeftMs = Math.max(0, this.countdownMs_ - (Date.now() - this.gameStartTimeMs_));
    this.timerEl_.innerHTML = (timeLeftMs / 1000).toFixed(2);
    this.scoreEl_.innerHTML = `${this.currentRoundIndex_} / ${this.numRounds_}`;

    if (timeLeftMs <= 0) {
      this.lose_();
    }
  }

  lose_() {
    this.isGameOver_ = true;
    this.timerEl_.classList.add('lose');
    this.scoreEl_.classList.add('lose');
  }

  startNextRound_() {
    if (this.isGameOver_) {
      return;
    }
    if (this.currentRound_) {
      this.currentRound_.dispose();
    }
    this.currentRound_ = this.generateRandomRound_(this.currentRoundIndex_);
    this.currentRound_.renderIntoStage(this.stageEl_);
  }

  onRoundEnd_(didPattyWin) {
    if (!didPattyWin) {
      this.lose_();
      return;
    }

    this.currentRoundIndex_++;
    if (this.currentRoundIndex_ >= this.numRounds_) {
      this.isGameOver_ = true;
      return;
    }

    setTimeout(() => {
      this.stageEl_.innerHTML = '';
      this.startNextRound_();
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

      roundPics.push(new Pic(picUrl, /* prettyDate= */ picDate[1]));
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
      let currentTop = 0;
      for (let i = 0; i < this.pics_.length; i++) {
        this.pics_[i].showAtPosition(0, currentTop);
        currentTop += this.pics_[i].getSize()[1];
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
  constructor(imageUrl, prettyDate) {
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