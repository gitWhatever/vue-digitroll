<template>
  <div class="d-roll-wrapper">
    <ul
      ref="list"
      class="d-roll-list"
    >
      <li
        v-for="(item, i) of digitOffsetArr"
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
    rollDigits: {
      type: [String, Number],
      default: 1000,
    },

    dur: {
      type: Number,
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
    const { rollDigits, flipStra, defaultFlipStra } = this;
    const divList = arrayFromCache(10).map((n, i) => `<div>${i}</div>`);
    let executeStra = null;

    if (typeof flipStra === 'boolean') {
      executeStra = () => flipStra;
    } else {
      executeStra = flipStra || defaultFlipStra;
    }

    return {
      digits: `${rollDigits}`,
      beforeDigits: '0',
      cellHeight: 0,
      maxDur: 0,
      innerUnitHtml: divList.concat(divList).join(''), // 2倍模板
      digitStatArr: [],
      digitOffsetArr: [],
      executeStra,
    };
  },

  watch: {
    rollDigits(value, oldVal) {
      const oldLen = `${oldVal}`.length;
      const newLen = `${value}`.length;
      this.digits = `${value}`;

      if (oldLen !== newLen) {
        this.resetStat(newLen);
      }

      this.traverseChar();
    },
  },

  methods: {
    resetStat(len) {
      const newArr = arrayFromCache(len);
      this.digitOffsetArr = newArr.map(() => 0);
      this.digitStatArr = newArr.map(() => ({ figure: 0 }));
      this.beforeDigits = newArr.map(() => 0).join('');
    },

    getliStyle(item) {
      const supportTransform = supportCssCache('transform');
      const offset = item ? `${item}px` : '0px';
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
          vm.$emit('roll-finish');
        }
      };
    },

    traverseChar(opts = null) {
      const vm = this;
      const { digitStatArr, digits, beforeDigits, executeStra } = vm;
      const completeRoll = vm.getComplete(digitStatArr.length);

      vm.$emit('roll-start');

      digitStatArr.forEach((n, i) => {
        let dis = 0;
        const before = beforeDigits.charAt(i);
        const next = digits.charAt(i);
        const opt = opts instanceof Array ? opts[i] : {};
        const optFlipStra = typeof opt.flipStra === 'boolean' ? () => opt.flipStra : opt.flipStra;
        const needFlip = optFlipStra ? optFlipStra(before, next) : executeStra(before, next);

        if (needFlip) {
          dis = (~~next + 10) - before;
          vm.digitStatArr[i].flip = true;
        } else {
          dis = next - before;
        }
        vm.beginRoll(dis, i, completeRoll, opt);
      });
    },

    defaultFlipStra(before, next) {
      if (next < before) {
        return true;
      }
      return false;
    },

    beginRoll(dis, i, cb, opt) {
      const vm = this;
      const { cellHeight, digitStatArr, maxDur, dur: defaultDur } = vm;
      const start = 0;
      const end = cellHeight * dis;
      const dur = opt.dur || defaultDur;
      const judgeFinish = Math.max(dur, maxDur);
      const curStat = digitStatArr[i];
      const beforeOffset = curStat.figure || 0;
      const prePageOffset = cellHeight * 10;

      let now = 0;
      let easeFn = callExp(Tween, opt.easeFn || vm.easeFn);
      easeFn = easeFn || Tween.Cubic.easeInOut;

      function step() {
        const offset = Math.min(easeFn(now, start, end, dur), end);
        curStat.figure = beforeOffset - offset;

        if (now === judgeFinish && curStat.flip) {
          const overOffset = curStat.figure;
          curStat.figure = overOffset + prePageOffset;
          curStat.flip = !!0;
        }

        /** optimize combo one frame reflow by vue */
        if (i === digitStatArr.length - 1) {
          vm.digitOffsetArr = digitStatArr.map(item => item.figure);
        }

        if (now === judgeFinish) {
          cb && cb(i);
          return;
        }

        now += FRAME_TIME;

        if (now < judgeFinish) {
          requestAnimationFrame(step);
        } else {
          now = judgeFinish;
          requestAnimationFrame(step);
        }
      }

      step();
    },

    /** for user */
    setDigit(digit, opt) {
      const vm = this;
      let opts = null;
      /** formate opts */
      if (typeof digit === 'string') {
        vm.digits = `${digit}`;
        if (opt) {
          opts = arrayFromCache(vm.digits.length).map(() => opt);
        }
      } else if (digit instanceof Array) {
        vm.digits = digit.map(({ value, dur }) => {
          if (dur > vm.maxDur) {
            vm.maxDur = dur;
          }
          return value;
        }).join('');
        opts = digit;
      }
      if (vm.digits.length !== vm.beforeDigits.length) {
        vm.resetStat(vm.digits.length);
      }

      vm.traverseChar(opts);
    },
  },

  created() {
    this.resetStat(this.digits.length);
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
