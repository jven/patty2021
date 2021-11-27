const PIC_URL_PREFIX_LENGTH = "pics/".length;

const main = () => {
  resetGame(PIC_URLS);
};

const resetGame = (picUrls) => {
  getStage().innerHTML = '';

  const round = generateRandomRound(picUrls, /* numPics= */ 3);
  round.renderIntoStage(getStage());
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

    const centerLeft = window.innerWidth / 2;
    const centerTop = (2 * i + 1) * (window.innerHeight / (2 * numPics));
    roundPics.push(new Pic(
        picUrl,
        [centerLeft, centerTop],
        /* prettyDate= */ picDate[1]));
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
      ? ["!!!", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][month]
      : "???";
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
        this.onRoundEnd_(/* tappedIndex= */ i);
      });
    }
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
    setTimeout(() => {
      this.containerEl_.style.left = `calc(${this.position_[0]}px - ${this.containerEl_.offsetWidth / 2}px)`;
      this.containerEl_.style.top = `calc(${this.position_[1]}px - ${this.containerEl_.offsetHeight / 2}px)`;
      this.containerEl_.classList.remove('hidden');
    }, 100);
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