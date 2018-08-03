<template>
  <div style="width:320px;">
    <DigitRoll ref='digitroll' :digits="digits" :flipStra="true" easeFn="Cubic.easeInOut"/>
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
      digits: '00001',
    };
  },
  methods: {
    changeDigit() {
      this.digits = this.input;
      // this.$refs.digitroll.setDigit(this.digits);
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
