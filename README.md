# vue-digitroll
`
vue实现的数字滚动组件
`


## basic usage
```
<template>
  <div style="width:320px;">
    <DigitRoll :rollDigits="digits" />
  </div>
</template>

<script>
  import DigitRoll from 'vue-digitroll';
  export default {
    components: { DigitRoll },
    data () {
      return {
        digits: 123456,
      }
    }
  }
</script>
```

## API

### Props
这里缓动函数只提供几种基本的动画形式，[缓动函数的基础概念可点击这里查看](https://developers.google.com/web/fundamentals/design-and-ux/animations/the-basics-of-easing?hl=zh-cn)
| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| --- | --- | --- | --- | --- |
| rollDigits  | 滚动到的数字 | [String, Number]  | - | 1000 |
| dur | 滚动持续时间，单位ms | Number | - | 1000 |
| easeFn | 滚动的缓动函数 | String | 'Linear', 'Quad.easeIn', 'Quad.easeOut', 'Quad.easeInOut','Cubic.easeIn', 'Cubic.easeOut', 'Cubic.easeInOut' | Cubic.easeInOut |
| flipStra | 滚动时的翻屏策略 | [Function, Boolean] | - | 内部默认策略 | 


### Events

| 事件名 | 说明 | 函数 |
| --- | --- | --- |
| roll-start | 数字动画滚动开始时触发 | Function(): void |
| roll-finish | 数字动画滚动结束时触发 | Function(): void |

### Methods

| 方法名 | 说明 | 参数 |
| --- | --- | --- |
| setDigit | 立即设置数字滚动 | 1.digit: String[,opt: Object] 2.opts: Array<opt: Object > |
