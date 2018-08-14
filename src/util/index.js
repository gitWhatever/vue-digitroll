export function cached(fn) {
  const cache = Object.create(null);
  return function cachedFn(str) {
    const fnKey = `${fn.name}_${str}`.trim();
    const hit = cache[fnKey];
    return hit || (cache[fnKey] = fn(str));
  };
}

const arrayFrom = (len) => {
  const loopArr = new Array(len).join(',').split(',');
  return loopArr;
};
export const arrayFromCache = cached(arrayFrom);

export const getHeight = (el) => {
  let height = 0;
  if (el.getBoundingClientRect) {
    height = el.getBoundingClientRect().height;
  }
  if (!height) {
    height = Math.max(el.offsetHeight, el.clientHeight);
  }

  return height;
};

/* eslint-disable */
const supportCss3 = (style) => {
  let prefix = ['webkit', 'Moz', 'ms', 'o'],
    i,
    humpString = [],
    htmlStyle = document.documentElement.style,
    _toHumb = function (string) {
      return string.replace(/-(\w)/g, ($0, $1) => $1.toUpperCase());
    };

  for (i in prefix) { humpString.push(_toHumb(`${prefix[i]}-${style}`)); }

  humpString.push(_toHumb(style));

  for (i in humpString) { if (humpString[i] in htmlStyle) return (prefix[i] || true); }

  return false;
};
export const supportCssCache = cached(supportCss3);
/* eslint-enable */

export const callExp = (main, exp) => {
  const layerList = exp.split('.').filter(Boolean);
  let value = null;
  try {
    if (layerList.length) {
      value = layerList.reduce((prev, next) => prev[next], main);
    }
  } catch (ex) {
    value = null;
  }
  return value;
};

export const easeToCubicMap = {
  'Cubic.easeInOut': 'cubic-bezier(0.65, 0.05, 0.36, 1)',
  'Cubic.easeIn': 'cubic-bezier(0.55, 0.06, 0.68, 0.19)',
  'Cubic.easeOut': 'cubic-bezier(0.22, 0.61, 0.36, 1)',
  'Quad.easeIn': 'cubic-bezier(0.55, 0.09, 0.68, 0.53)',
  'Quad.easeOut': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  'Quad.easeInOut': 'cubic-bezier(0.46, 0.03, 0.52, 0.96)',
  Linear: 'linear',
};

export { Tween } from './Tween';
