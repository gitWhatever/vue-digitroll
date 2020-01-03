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
          :style="getliStyle(item, i)"
        ></div>
      </li>
    </ul>
  </div>
</template>

<script>
import { Tween, easeToCubicMap, arrayFromCache, getHeight, supportCssCache, callExp } from '../util';

let rollLock = false;
let supportCss = supportCssCache;
const FRAME_TIME = 1000 / 60;
const defaultFlipStra = (before, next) => {
  if (next < before) {
    return true;
  }
  return false;
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
      default: 'Cubic.easeInOut',
    },
  },

  data() {
    const { rollDigits, flipStra } = this;
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
      if (rollLock) {
        return;
      }
      const oldLen = `${oldVal}`.length;
      const newLen = `${value}`.length;
      this.digits = `${value}`;

      if (oldLen !== newLen) {
        this.resetStat(newLen);
      }

      setTimeout(() => {
        this.traverseChar();
      }, 50);
    },
  },

  methods: {
    resetStat(len) {
      const newArr = arrayFromCache(len);
      this.digitOffsetArr = newArr.map(() => 0);
      this.digitStatArr = newArr.map(() => ({ figure: 0 }));
      this.beforeDigits = newArr.map(() => 0).join('');
    },

    getliStyle(item, i) {
      const transformPrefix = supportCss('transform');
      if (transformPrefix) {
        this.getliStyle = function getTransformStyle(tItem, ti) {
          const offset = tItem ? `${tItem}px` : '0px';
          const value = `translateY(${offset}) translateZ(0)`;
          const curStat = this.digitStatArr[ti];
          const easeFn = curStat.easeFn || this.easeFn;
          const transitionFunc = easeToCubicMap[easeFn] || easeFn;
          const msDur = curStat.dur || this.dur;
          const sDurStr = `${msDur / 1000}s`;
          const transProperty = typeof transformPrefix !== 'boolean' ? `-${transformPrefix}-transform` : 'transform';
          const transStyles = !curStat.noTransition ? {
            transition: `${transProperty} ${sDurStr} ${transitionFunc}`,
          } : {};

          /** Vue会自动侦测并添加相应的前缀,无需自己添加属性前缀  */
          return {
            ...transStyles,
            transform: value,
          };
        };
      } else {
        this.getliStyle = function getMarginStyle(mItem) {
          const offset = mItem ? `${mItem}px` : '0px';

          return {
            marginTop: offset,
          };
        };
      }

      this.getliStyle(item, i);
    },

    getComplete(total) {
      let count = 0;
      const vm = this;
      return function completeRoll() {
        if (++count >= total) {
          vm.beforeDigits = `${vm.digits}`;
          setTimeout(() => {
            rollLock = false;
            vm.$emit('roll-finish');
          }, 4);
        }
      };
    },

    traverseChar(opts = null) {
      const vm = this;
      const { digitStatArr, digits, beforeDigits, executeStra } = vm;
      const completeRoll = vm.getComplete(digitStatArr.length);
      rollLock = true;
      vm.$emit('roll-start');

      digitStatArr.forEach((stat, i) => {
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

        if (supportCss('transform')) {
          stat.noTransition = !!0;
          vm.beginCssRoll(dis, i, completeRoll, opt);
        } else {
          vm.beginRoll(dis, i, completeRoll, opt);
        }
      });
    },

    beginCssRoll(dis, i, cb, opt) {
      const vm = this;
      const transitionPrefix = supportCss('transition');
      const transitionEnd = (function whichTransitionEvent(prefix) {
        const pre = prefix.toLowerCase();
        //ie11兼容性，ie11不支持mstransitionend
        if (!!window.ActiveXObject || 'ActiveXObject' in window) {
            return 'transitionend';
        }
        if (typeof prefix === 'boolean' || pre === 'moz') {
          return 'transitionend';
        }
        return `${pre}TransitionEnd`;
      }(transitionPrefix));

      this.beginCssRoll = (aDis, ai, aCb, aOpt) => {
        const { cellHeight, digitStatArr, digitOffsetArr, dur: defaultDur } = vm;
        const curStat = digitStatArr[ai];
        const rollOffset = cellHeight * aDis;
        const beforeOffset = curStat.figure || 0;
        const prePageOffset = cellHeight * 10; // 单倍模板距离
        const $list = vm.$refs.list;
        const $curBar = $list.querySelector(`li:nth-child(${ai + 1}) .d-roll-bar`);

        if (rollOffset === 0) {
          aCb && aCb(i);
          return;
        }

        curStat.figure = beforeOffset - rollOffset;
        curStat.dur = aOpt.dur || defaultDur;

        vm.$set(digitOffsetArr, ai, beforeOffset - rollOffset);

        $curBar.addEventListener(transitionEnd, function transitionDone() {
          if (curStat.flip) {
            const overOffset = curStat.figure;
            curStat.figure = overOffset + prePageOffset;
            curStat.noTransition = !!1;
            curStat.flip = !!0;
          }

          vm.$set(digitOffsetArr, ai, curStat.figure);
          $curBar.removeEventListener(transitionEnd, transitionDone);
          aCb && aCb(i);
        });
      };

      this.beginCssRoll(dis, i, cb, opt);
    },

    beginRoll(dis, i, cb, opt) {
      const vm = this;
      const { cellHeight, digitStatArr, maxDur, dur: defaultDur } = vm;
      const start = 0;
      const rollOffset = cellHeight * dis;
      const dur = opt.dur || defaultDur;
      const judgeFinish = Math.max(dur, maxDur);
      const curStat = digitStatArr[i];
      const beforeOffset = curStat.figure || 0;
      const prePageOffset = cellHeight * 10;

      let now = 0;
      let easeFn = callExp(Tween, opt.easeFn || vm.easeFn);
      easeFn = easeFn || Tween.Cubic.easeInOut;

      function step() {
        const offset = Math.min(easeFn(now, start, rollOffset, dur), rollOffset);
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
      if (rollLock) {
        return;
      }
      /** formate opts */
      if (typeof digit === 'string' || typeof digit === 'number') {
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

      setTimeout(() => {
        vm.traverseChar(opts);
      }, 50);
    },
  },

  created() {
    this.resetStat(this.digits.length);
    /** 警告：单元测试设置，请勿自己设置，影响属性判断 */
    if (this.$attrs && this.$attrs.unitTest) {
      supportCss = (pro) => {
        if (this.$attrs.unitTest.supportCssTransForm) {
          return supportCssCache(pro);
        }
        return false;
      };
    }
  },

  mounted() {
    const $list = this.$refs.list;

    this.cellHeight = getHeight($list.querySelector('.d-roll-bar>div'));

    /** 警告：单元测试设置，请勿自己设置，影响正常计算 */
    if (!this.cellHeight && this.$attrs && this.$attrs.unitTest) {
      this.cellHeight = this.$attrs.unitTest.cellHeight;
    }

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
  .d-roll-item>.d-roll-bar{
    backface-visibility: hidden;
    perspective: 1000;
  }
  .d-roll-item>.d-roll-bar>div{
    line-height: 1.8;
    box-sizing: border-box !important;
  }
</style>
