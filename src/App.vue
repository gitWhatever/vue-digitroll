<template>
  <div style="width:320px;">
    <DigitRoll :digits="digits" :altern="false" easeFn="Cubic.easeInOut"/>
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
      digits: '11111',
    };
  },
  methods: {
    changeDigit() {
      this.digits = this.input.substr(0, 5);
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
