<template>
  <div class="d-roll-wrapper">
    <ul
      ref="list"
      class="d-roll-list"
    >
      <li
        v-for="(item, i) of digitStatArr"
        :key="i"
        class="d-roll-item"
        :style="{ height: `${cellHeight}px` }"
      >
        <div
          class="d-roll-bar"
          v-html="innerUnitHtml"
          :style="getliStyle(item)"
        ></div>
      </li>
    </ul>
  </div>
</template>

<script>
import { Tween, arrayFromCache, getHeight, supportCssCache, callExp } from '../util';

const FRAME_TIME = 1000 / 60;
window.requestAnimationFrame = window.requestAnimationFrame || function raf(fn) {
  setTimeout(fn, FRAME_TIME);
};

export default {
  name: 'DigitRoll',

  props: {
    digits: {
      type: [String, Number],
      default: 1000,
    },
    flipStra: {
      type: [Function, Boolean],
      default: null,
    },
    easeFn: {
      type: [String],
      validator(value) {
        const easeList = [
          'Linear', 'Quad.easeIn', 'Quad.easeOut', 'Quad.easeInOut',
          'Cubic.easeIn', 'Cubic.easeOut', 'Cubic.easeInOut',
        ];
        return easeList.indexOf(value) !== -1;
      },
      default: 'Cubic.easeInOut',
    },
  },

  data() {
    const { digits, flipStra, defaultFlipStra } = this;
    const divList = arrayFromCache(10).map((n, i) => `<div>${i}</div>`);
    const digitStatArr = arrayFromCache(String(digits).length).map(() => ({ figure: 0 }));
    let executeStra = null;
    if (typeof flipStra === 'boolean') {
      executeStra = () => flipStra;
    } else {
      executeStra = flipStra || defaultFlipStra;
    }

    return {
      beforeDigits: '0',
      cellHeight: 0,
      innerUnitHtml: divList.concat(divList).join(''), // 2倍模板
      digitStatArr,
      executeStra,
    };
  },

  watch: {
    digits(value, oldVal) {
      const oldLen = `${oldVal}`.length;
      const newLen = `${value}`.length;
      if (oldLen !== newLen) {
        const newArr = arrayFromCache(newLen);
        this.digitStatArr = newArr.map(() => ({ figure: 0 }));
        this.beforeDigits = newArr.map(() => 0).join('');
      }

      this.traverseChar();
    },
  },

  methods: {
    getliStyle(item) {
      const supportTransform = supportCssCache('transform');
      const offset = item.figure ? `${item.figure}px` : '0px';
      if (supportTransform) {
        const value = `translateY(${offset})`;
        return {
          transform: value,
          webkitTransform: value,
          mozTransform: value,
          oTransform: value,
        };
      }

      return {
        marginTop: offset,
      };
    },
    getComplete(total) {
      let count = 0;
      const vm = this;
      return function completeRoll() {
        if (++count >= total) {
          vm.beforeDigits = `${vm.digits}`;
        }
      };
    },

    traverseChar() {
      const vm = this;
      const { digitStatArr, beforeDigits, executeStra } = vm;
      const digits = `${vm.digits}`;
      const completeRoll = vm.getComplete(digitStatArr.length);

      digitStatArr.forEach((n, i) => {
        let dis = 0;
        const before = beforeDigits.charAt(i);
        const next = digits.charAt(i);
        const needFlip = executeStra(before, next);

        if (needFlip) {
          dis = (~~next + 10) - before;
          vm.digitStatArr[i].flip = true;
        } else {
          dis = next - before;
        }
        vm.beginRoll(dis, i, completeRoll);
      });
    },

    defaultFlipStra(before, next) {
      if (next < before) {
        return true;
      }
      return false;
    },

    beginRoll(dis, i, cb) {
      const vm = this;
      const { cellHeight, digitStatArr } = vm;

      let now = 0;
      const start = 0;
      const end = cellHeight * dis;
      const dur = 1000;
      const curStat = digitStatArr[i];
      const beforeOffset = curStat.figure || 0;
      const prePageOffset = cellHeight * 10;
      const easeFn = callExp(Tween, vm.easeFn);

      function step() {
        const offset = easeFn(now, start, end, dur);
        vm.$set(curStat, 'figure', beforeOffset - offset);

        if (now === dur) {
          if (curStat.flip) {
            const overOffset = curStat.figure;
            vm.$set(curStat, 'figure', overOffset + prePageOffset);
            curStat.flip = !!0;
          }
          cb && cb(i);
          return;
        }

        now += FRAME_TIME;

        if (now < dur) {
          requestAnimationFrame(step);
        } else {
          now = dur;
          requestAnimationFrame(step);
        }
      }

      step();
    },

    /** for user */
    setDigit(val) {
      this.digits = val;
      this.traverseChar();
    },
  },

  created() {
    this.beforeDigits = this.digitStatArr.map(() => 0).join('');
  },

  mounted() {
    const $list = this.$refs.list;
    this.cellHeight = getHeight($list.querySelector('.d-roll-bar>div'));
    this.traverseChar();
  },
};
</script>

<style>
  .d-roll-wrapper{
    margin: 20px auto;
    width: 100%;
  }
  .d-roll-list{
    margin: 0 auto;
    padding: 0;
    text-align: center;
    display: flex;
    overflow: hidden;
  }
  .d-roll-list .d-roll-item{
    list-style: none;
    float: left;
    flex-grow: 1;
    overflow: hidden;
  }
  .d-roll-item>.d-roll-bar>div{
    line-height: 1.8;
  }
</style>
