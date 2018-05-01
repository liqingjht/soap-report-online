<template>
  <div id="app">
    <stepsTab />
    <basicTab v-if="curStep===0" />
    <uploadTab v-else-if="curStep===1" />
    <tableTab v-else-if="curStep===2" ref='tableTab' />
    <downTab v-else-if="curStep===3" />
  </div>
</template>

<script>
import stepsTab from "./components/Steps";
import basicTab from "./components/Basicinfo.vue";
import uploadTab from "./components/Upload.vue";
import tableTab from "./components/Filltable.vue";
import downTab from "./components/Download.vue";
import { mapState } from 'vuex'

export default {
  name: "App",
  data() {
    return {};
  },
  computed: {
    ...mapState(['curStep', 'stepStatus', 'token'])
  },
  watch: {
    curStep: function(newStep) {
        if(newStep === 2) {
            setTimeout(() => {
                this.$refs.tableTab.getData();
                this.$refs.tableTab.initClipboard();
            }, 300);
        }
    }
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
