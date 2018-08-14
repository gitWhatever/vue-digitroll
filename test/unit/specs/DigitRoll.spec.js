import { mount } from '@vue/test-utils';
import DigitRoll from '@/component/DigitRoll';

const CELL_HEIGHT = 20;
const utils = {
  getOffsetByDigit(digit) {
    return digit.split('').map((v) => {
      const offset = v * CELL_HEIGHT;
      if (!offset) {
        return 0;
      }
      return -offset;
    });
  },
  getWrapper(supportCssTransForm, props) {
    return mount(DigitRoll, {
      attachToDocument: true,
      propsData: props,
      attrs: {
        unitTest: {
          cellHeight: CELL_HEIGHT,
          supportCssTransForm,
        },
      },
    });
  },
};

describe('DigitRoll.vue', () => {
  describe('on the condition of support transform', () => {
    const wrapper = utils.getWrapper(true);

    test('should be correct vue component', () => {
      expect(wrapper.isVueInstance()).toBeTruthy();
      expect(wrapper.name()).toBe('DigitRoll');
    });

    test('choose transform Mode', () => {
      const bar = wrapper.find('.d-roll-list .d-roll-item .d-roll-bar');
      expect(bar.attributes().style).toMatch('transform');
    });

    test('init instance without props should be work', () => {
      expect(wrapper.vm.digits).toBe('1000');
      expect(wrapper.vm.beforeDigits).toBe('0000');
      expect(wrapper.vm.cellHeight).toBe(CELL_HEIGHT);
      expect(wrapper.vm.digitOffsetArr).toEqual(utils.getOffsetByDigit('1000'));
    });
  });

  describe('on the condition of not support transform', () => {
    const wrapper = utils.getWrapper(false);

    test('choose marginTop Mode', () => {
      const bar = wrapper.find('.d-roll-list .d-roll-item .d-roll-bar');
      expect(bar.attributes().style).toMatch('margin-top');
    });

    test('init instance without props should be work', (done) => {
      wrapper.vm.$on('roll-finish', () => {
        expect(wrapper.vm.digitOffsetArr).toEqual(utils.getOffsetByDigit('1000'));
        done();
      });
    });

    test('invalid easnFn should be work', (done) => {
      const wrapper2 = utils.getWrapper(false, {
        easeFn: 'zzzzz',
        rollDigits: 4321,
      });
      wrapper2.vm.$on('roll-finish', () => {
        expect(wrapper2.vm.digitOffsetArr).toEqual(utils.getOffsetByDigit('4321'));
        done();
      });
    });

    test('setDigit should be work', (done) => {
      const wrapper2 = utils.getWrapper(false, { rollDigits: 3000 });
      wrapper2.vm.$on('roll-finish', () => {
        wrapper2.vm.setDigit(2500);

        wrapper2.vm.$on('roll-finish', () => {
          expect(wrapper2.vm.digitOffsetArr).toEqual(utils.getOffsetByDigit('2500'));
          done();
        });
      });
    });

    test('setDigit with array should be work', (done) => {
      const wrapper2 = utils.getWrapper(false);
      wrapper2.vm.$on('roll-finish', () => {
        wrapper2.vm.setDigit([{
          value: 2,
          dur: 1800,
        }, {
          value: 5,
          dur: 1200,
        }, {
          value: 9,
          dur: 600,
        }]);

        wrapper2.vm.$on('roll-finish', () => {
          expect(wrapper2.vm.digitOffsetArr).toEqual(utils.getOffsetByDigit('259'));
          done();
        });
      });
    });
  });
});

