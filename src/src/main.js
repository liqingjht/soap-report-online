// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import iView from 'iview';
import 'iview/dist/styles/iview.css';
import Util from './libs/util';
import $ from 'jquery'
import Vuex from 'vuex'

Vue.config.productionTip = false
Vue.use(iView);
Vue.use(Vuex);

Vue.prototype.$util = Util;

const store = new Vuex.Store({
    state: {
        curStep: window.location.search.indexOf('token') === -1? 0: 2,
        stepStatus: 'process',
        token: ''
    },
    mutations: {
      setToken (state, token) {
        state.token = token;
      },
      setStep(state, num) {
        state.curStep = (num === undefined)? state.curStep + 1: num;
      },
      setStatus(state, status) {
        state.stepStatus = (status === undefined)? 'process': status;
      }
    }
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  components: { App },
  template: '<App/>'
})
