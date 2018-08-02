<template>
  <div class="roll-wrapper">
    <ul
      ref="list"
      class="roll-list"
      :style="{ height: `${cellHeight}px` }"
    >
      <li
        v-for="(item, i) of digitStatArr"
        v-html="innerUnitHtml"
        :key="i"
        :style="getliStyle(item)"
      ></li>
    </ul>
  </div>
</template>

<script>
import { Tween, arrayFrom, getHeight, supportCssCache, callExp } from '../util';

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
    altern: {
      type: [Boolean],
    },
    easeFn: {
      type: [String],
      default: 'Cubic.easeInOut',
    },
  },

  data() {
    const divList = arrayFrom(10).map((n, i) => `<div>${i}</div>`);
    const digitStatArr = arrayFrom(String(this.digits).length).map(() => ({ figure: 0 }));
    return {
      beforeDigits: '0',
      cellHeight: 0,
      innerUnitHtml: divList.concat(divList).join(''), // 2倍模板
      digitStatArr,
    };
  },

  watch: {
    digits(value, oldVal) {
      if (`${oldVal}`.length !== `${value}`.length) {
        /* eslint-disable no-console */
        console.warn('检测到传入数字变化，改动不生效!');
        /* eslint-enable no-console */
        return;
      }
      this.traverseChar();
    },
  },

  methods: {
    getliStyle(item) {
      const supportTransform = supportCssCache('transform');
      const offset = item.figure ? `${item.figure}px` : '0px';
      if (!supportTransform) {
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
      return function complete() {
        if (++count >= total) {
          vm.beforeDigits = `${vm.digits}`;
        }
      };
    },

    traverseChar() {
      const vm = this;
      const { digitStatArr, beforeDigits, altern } = vm;
      const digits = `${vm.digits}`;
      const complete = vm.getComplete(digitStatArr.length);

      digitStatArr.forEach((n, i) => {
        let dis = 0;
        const before = beforeDigits.charAt(i);
        const next = digits.charAt(i);
        if (next <= before) {
          if (altern || next < before) {
            dis = (~~next + 10) - before;
            // 确认滚动到下一页
            vm.digitStatArr[i].flip = true;
          }
        } else if (next > before) {
          dis = next - before;
        }
        vm.beginRoll(dis, i, complete);
      });
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
  },

  created() {
    this.beforeDigits = this.digitStatArr.map(() => 0).join('');
  },

  mounted() {
    const $list = this.$refs.list;
    this.cellHeight = getHeight($list.querySelector('li>div'));
    this.traverseChar();
  },
};
</script>

<style>
  .roll-wrapper{
    margin: 20px auto;
    width: 100%;
  }
  .roll-list{
    overflow: hidden;
    text-align: center;
    position: relative;
    display: flex;
  }
  .roll-list li{
    list-style: none;
    float: left;
    position: relative;
    flex-grow: 1;
  }
  .roll-list>li>div{
    line-height: 1.8;
  }
</style>
