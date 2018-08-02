<template>
  <div class="roll-wrapper">
    <ul
      ref="list"
      class="roll-list"
      :style="{ height: cellAttrs.height, lineHeight: cellAttrs.height }"
    >
      <li
        v-for="(item, i) of digitTopArr"
        v-html="innerUnitHtml"
        :key="i"
        :style="{
          width: `${dws.figure}${dws.unit}`,
          height: `${dhs.figure * 10}${dhs.unit}`,
          left:`${dws.figure * i}${dws.unit}`,
          top: item ? `${item}${dhs.unit}` : '0px'
        }"
      >
      </li>
    </ul>
  </div>
</template>

<script>
import { Tween, arrayFrom } from '../util';

const CSS_UNIT_REG = /(\d*)(\D*)/;
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
    cellAttrs: {
      type: Object,
      default() {
        return {
          width: '40px',
          height: '50px',
          fontSize: '44px',
        };
      },
    },
  },

  data() {
    return {
      beforeDigits: '0',
      digitTopArr: arrayFrom(String(this.digits).length),
    };
  },

  computed: {
    innerUnitHtml() {
      const loopArr = arrayFrom(10);
      return loopArr.map((n, i) => `<div style="height:${this.cellAttrs.height};line-height:${this.cellAttrs.height};">${i}</div>`).join('');
    },
    dws() {
      const res = this.cellAttrs.width.match(CSS_UNIT_REG);
      return {
        figure: res[1],
        unit: res[2],
      };
    },
    dhs() {
      const res = this.cellAttrs.height.match(CSS_UNIT_REG);
      return {
        figure: res[1],
        unit: res[2],
      };
    },
  },

  watch: {
    digits(value, oldVal) {
      this.traverseChar();
    },
  },

  methods: {
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
      const { digitTopArr, beforeDigits } = vm;
      const digits = `${vm.digits}`;
      const complete = vm.getComplete(digitTopArr.length);

      digitTopArr.forEach((n, i) => {
        const before = beforeDigits.charAt(i);
        const next = digits.charAt(i);
        const dis = next - before;
        vm.beginRoll(dis, i, complete);
      });
    },
    beginRoll(dis, i, cb) {
      const vm = this;
      const { dhs, digitTopArr } = vm;

      let now = 0;
      const start = 0;
      const end = dhs.figure * dis;
      const dur = 1000;
      const beforeOffset = digitTopArr[i] || 0;
      
      function step() {
        const offset = Tween.Cubic.easeInOut(now, start, end, dur);
        vm.$set(digitTopArr, i, beforeOffset - offset);

        if (now === dur) {
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
    this.beforeDigits = this.digitTopArr.map(() => 0).join('');
  },

  mounted() {
    this.traverseChar();
  },
};
</script>

<style>
  .roll-wrapper{
    margin: 50px auto;
    width: 320px;
    font-size:44px;
  }
  .roll-list{
    overflow: hidden;
    text-align: center;
    position: relative;
  }
  .roll-list li{
    list-style: none;
    float: left;
    position: absolute;
  }
</style>
