<template>
  <div style="width:320px;">
    <DigitRoll
      ref='digitroll'
      :rollDigits="digits"
      :flipStra="true"
      easeFn="Cubic.easeInOut"
      @roll-start="record"
      @roll-finish="record"
    />
    <input type="text" v-model='input'>
    <button @click='changeDigit'>click me</button>
  </div>
</template>

<script>
import DigitRoll from './component/DigitRoll';

export default {
  name: 'App',
  data() {
    return {
      input: '',
      digits: 111,
    };
  },
  methods: {
    changeDigit() {
      // this.digits = this.input;

      // this.$refs.digitroll.setDigit(this.input, {
      //   flipStra: this.flipStra,
      //   easeFn: 'Cubic.easeInOut',
      //   dur: 400,
      // });

      this.$refs.digitroll.setDigit([{
        value: 2,
        dur: 1800,
      }, {
        value: 5,
        dur: 1200,
      }, {
        value: 9,
        dur: 600,
      }]);
    },
    flipStra(before, next) {
      return true;
    },
    flipStra2(before, next) {
      return false;
    },
    flipStra3(before, next) {
      if (next <= before) {
        return true;
      }
      return false;
    },
    record() {
      console.log('lala')
    }
  },
  components: {
    DigitRoll,
  },
};
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
