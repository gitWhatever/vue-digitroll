import DigitRoll from './component/DigitRoll';

window.requestAnimationFrame = window.requestAnimationFrame || function raf(fn) {
  setTimeout(fn, 1000 / 60);
};

export default DigitRoll;
