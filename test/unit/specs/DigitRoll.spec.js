import { mount } from '@vue/test-utils';
import DigitRoll from '@/component/DigitRoll';

describe('DigitRoll.vue', () => {
  it('should be a vue instance', () => {
    const wrapper = mount(DigitRoll);
    expect(wrapper.isVueInstance()).toBeTruthy();
  });
});
