const PIC_URL_PREFIX_LENGTH = "pics/".length;

const main = () => {
  resetGame(PIC_URLS);
};

const resetGame = (picUrls) => {
  getStage().innerHtml = '';

  const round = generateRandomRound(picUrls, /* numPics= */ 3);
  round.renderIntoStage(getStage());

  requestAnimationFrame(() => onAnimationFrame(round));
};

const generateRandomRound = (picUrls, numPics) => {
  const roundPicUrls = [];
  const roundPicDates = new Set();
  const roundPics = [];
  let oldestDate = 999999;
  let oldestDateIndex = -1;
  for (let i = 0; i < numPics; i++) {
    const picUrl = chooseRandomPicUrl(picUrls);
    const picDate = getDateFromPicUrl(picUrl);
    if (roundPicDates.has(picDate[0])) {
      // We chose two pics with the same date, try again.
      console.log('Collision while generating round, trying again...');
      return generateRandomRound(picUrls, numPics);
    }

    roundPicUrls.push(picUrl);
    roundPicDates.add(picDate[0]);
    if (picDate[0] < oldestDate) {
      oldestDate = picDate[0];
      oldestDateIndex = i;
    }

    // TODO(jven): Pass in pretty date to Pic.
    roundPics.push(new Pic(picUrl, /* position= */ [(i + 1) * 100, (i + 1) * 100]));
  }

  return new Round(roundPics, /* winningIndex= */ oldestDateIndex);
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
      ? ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][month]
      : "???";
};

// TODO(jven): Delete requestAnimationFrame stuff.
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
        console.log(`didPattyWin? ${didPattyWin}`);
        this.onRoundEnd_(didPattyWin);
      });
    }
  }

  onRoundEnd_(didPattyWin) {
    for (const pic of this.pics_) {
      // TODO(jven): Decorate pic with win/loss.
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