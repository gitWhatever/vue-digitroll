# vue-digitroll
`
vue实现的数字滚动组件
`

## characteristics
  * 良好兼容性：自动检测环境，优先使用transform+transition完成滚动效果，如果不支持css属性使用margin+tween缓动函数实现流畅的滚动效果。
  * 配置灵活：支持参数自定义配置滚动效果，滚动时间以及如何滚动的策略（后续会单独讲到）
  * 支持良好：用户可覆写整体样式，实现自己的界面样式，digitroll会在组件挂在之后读取对应高度，进行滚动。

## Installation
```
$ npm i -S @huoyu/vue-digitroll   //之前的包无法正常import，目前问题已解决，更新到1.0.3可以正常使用~
```

## basic usage
```
<template>
  <div style="width:320px;">
    <DigitRoll :rollDigits="digits" />
  </div>
</template>

<script>
  import DigitRoll from '@huoyu/vue-digitroll';
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

## advance usage(进阶玩发)
#### 正常上下滚动

![a2](/gif/a2.gif)

关键代码
```
<template>
  <div style="width:320px;margin:0 auto" id="app">
    <DigitRoll
      :rollDigits='digits'
      :flipStra = "true"
      @roll-finish="restart"
    />
  </div>
</template>

/**  vue methods */
function restart() {
  const random = `${Math.random()}`.substr(2).substr(0, 4);
  setTimeout(() => {
    this.digits = random;
  }, 400);
}
```

#### 一直是翻屏滚动

![a1](/gif/a1.gif)

关键代码
```
<template>
  <div style="width:320px;margin:0 auto" id="app">
    <DigitRoll
      :rollDigits='digits'
      :flipStra = "false"
      @roll-finish="restart"
    />
  </div>
</template>

/**  vue methods */
function restart() {
  const random = `${Math.random()}`.substr(2).substr(0, 4);
  setTimeout(() => {
    this.digits = random;
  }, 400);
}
```

#### 当下一个数字小于等于当前数字时翻屏滚动

![a4](/gif/a4.gif)

关键代码
```
<template>
  <div style="width:320px;margin:0 auto" id="app">
    <DigitRoll
      ref='digitroll'
      :rollDigits='digits'
      :flipStra = "flipStra3"
      easeFn=""
      @roll-finish="record"
    />
  </div>
</template>

/**  vue methods */
flipStra3(before, next) {
  if (next <= before) {
    return true;
  }
  return false;
},
```

#### 数字无变化时也滚动

![a5](/gif/a5.gif)

关键代码
```
<template>
  <div style="width:320px;margin:0 auto" id="app">
    <DigitRoll
      ref='digitroll'
      :rollDigits='digits'
      :flipStra = "true"
    />
    <input type="text" v-model='input'>
    <button @click='changeDigit'>click me</button>
  </div>
</template>

/**  vue methods */
function changeDigit() {
  this.$refs.digitroll.setDigit(this.input);
}
```

#### 每个数字渐进滚动

![a3](/gif/a3.gif)

关键代码
```
<template>
  <div style="width:320px;margin:0 auto" id="app">
    <DigitRoll
      ref='digitroll'
      :rollDigits='digits'
      :flipStra = "true"
    />
    <input type="text" v-model='input'>
    <button @click='changeDigit'>click me</button>
  </div>
</template>

/**  vue methods */
function changeDigit() {
  this.$refs.digitroll.setDigit([{
    value: 2,
    dur: 600,
  }, {
    value: 4,
    dur: 900,
  }, {
    value: 6,
    dur: 1200,
  }, {
    value: 8,
    dur: 1500,
  }]);
}
```


## API

### Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| --- | --- | --- | --- | --- |
| rollDigits  | 滚动到的数字 | [String, Number]  | - | 1000 |
| dur | 滚动持续时间，单位ms | Number | - | 1000 |
| easeFn | 滚动的缓动函数 | String | 'Linear', 'Quad.easeIn', 'Quad.easeOut', 'Quad.easeInOut','Cubic.easeIn', 'Cubic.easeOut', 'Cubic.easeInOut' | Cubic.easeInOut 或者 transition-timing-function|
| flipStra | 滚动时的翻屏策略 | [Function, Boolean] | - | 内部默认策略 | 

#### 参数高级说明：
  **easeFn**: 
  由于滚动效果有两种实现方式（transition和js计算实现），增对两种模式需要的参数其实是不一致的。transition指定[transition-timing-function](http://www.w3school.com.cn/cssref/pr_transition-timing-function.asp)描述动画过渡效果，js方式需要通过tween函数实现。这里做了兼容，transition模式除了传通常的transition-timing-function，如果easeFn设定为表格上的可选值如"Quad.easeInOut"会转成对应的cubic-bezier。如果是不支持transition的模式下，还是支持表格中的缓动函数（这里缓动函数只提供几种基本的动画形式，[缓动函数的基础概念可点击这里查看](https://developers.google.com/web/fundamentals/design-and-ux/animations/the-basics-of-easing?hl=zh-cn)），其它值不会生效默认按照"Cubic.easeInOut"进行处理。

  **flipStra**: 
  当数字滚动到一个较大的数字时，这时需要滚动到一个小数字时，通常有两种做法，1.从大数字往回向上滚动  2.始终保持一个方向（这里是向下）滚动。对于第二种做法通常更加麻烦，需要复制一份滚动模板，然后从一个数字滚动到第二份模板，这样保持滚动方向始终一致。对于滚动到克隆模板的动作我称之为翻屏（姑且这么称呼了，想不到更好的说法了）。这里DigitRoll提供的flipStra参数，就是用来控制所谓的翻屏的策略。flipStra可以传入一个函数，接受两个参数: 1.before(之前的数值) 2.next(需要跳转的数值)。用户就可以通过函数自定义策略，函数返回"true",那么就会翻屏滚动。返回"false",那么数字只会在当前模板进行上下滚动。这里提供便捷设置，flipStra可以为布尔值。



### Events

| 事件名 | 说明 | 函数 |
| --- | --- | --- |
| roll-start | 数字动画滚动开始时触发 | Function(): void |
| roll-finish | 数字动画滚动结束时触发 | Function(): void |

### Methods

| 方法名 | 说明 | 参数 |
| --- | --- | --- |
| setDigit | 立即设置数字滚动 | digit: String[,opt: Object] 或者 opts: Array<opt: Object > |

setDigit提供更加灵活的操作数字滚动的方式。可以为下一次滚动做一次单独的设置，甚至可以单独配置每一个数字的滚动行为，而不会覆盖整体的props。方法提供两种参数形式：

```js
// 第一种 digit必传  opt可缺省
this.$refs.digitroll.setDigit('2459', {
  dur: '2000', 
  easeFn: 'ease',
  flipStra: true,
});
```
 -----

```js
// 第二种
this.$refs.digitroll.setDigit([{
  value: 2,
  dur: 600,
  easeFn: 'ease',
}, {
  value: 4,
  dur: 900,
  flipStra: true,
}, {
  value: 6,
  dur: 1200,
  flipStra: false,
}, {
  value: 8,
  dur: 1500,
}]);
```
