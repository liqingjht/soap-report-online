<template>
  <div id="app">
    <stepsTab :curStep='curStep' :stepStatus='stepStatus'/>
    <basicTab :curStep='curStep' @stepNext='stepNext' @statusErr='statusErr' @updateDate='updateDate'/>
    <uploadTab :curStep='curStep' @stepNext='stepNext' @statusErr='statusErr' :token='token'/>
    <tableTab :curStep='curStep' @stepNext='stepNext' @statusErr='statusErr' :token='token'/>
    <downTab :curStep='curStep' @stepNext='stepNext' @statusErr='statusErr' :token='token'/>
  </div>
</template>

<script>
import stepsTab from "./components/Steps";
import basicTab from "./components/Basicinfo.vue";
import uploadTab from "./components/Upload.vue";
import tableTab from "./components/Upload.vue";
import downTab from "./components/Download.vue";

export default {
  name: "App",
  data() {
    return {
      curStep: 0,
      stepStatus: "wait",
      token: ""
    };
  },
  components: { stepsTab, basicTab, uploadTab, tableTab, downTab },
  methods: {
    stepNext(tabID) {
      if (tabID !== undefined) this.curStep = tabID;
      else this.curStep += 1;
      this.stepStatus = "wait";
    },
    statusErr() {
      this.stepStatus = "error";
    },
    updateDate(payload) {
      let keys = Object.keys(payload);
      for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        eval(`this.${key} = payload[key]`);
      }
    }
  }
};
</script>

<style>
@import "./css/index.css";
</style>
