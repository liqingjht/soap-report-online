// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import iView from 'iview';
import 'iview/dist/styles/iview.css';
import Util from './libs/util';
import $ from 'jquery'

Vue.config.productionTip = false
Vue.use(iView);

Vue.prototype.$util = Util;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: { App },
  template: '<App/>'
})
