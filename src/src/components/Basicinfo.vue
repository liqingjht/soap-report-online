<template>
    <Card style="width:350px; height: 620px;" v-if="curStep===0">
			<auto-complete
				v-model.trim="module"
				:data="projects"
				placeholder="Module Name"
				size="large"
				style="width:300px">
			</auto-complete>
			<i-input
				v-model.trim="version"
				style="width:300px"
				placeholder="Version"
				size="large">
				<span slot="prepend">V</span>
			</i-input>
			<auto-complete
				v-model.trim="spec"
				:data="specs"
				placeholder="SPEC Version"
				style="width:300px"
				size="large">
			</auto-complete>
			<Upload
				type="drag"
				action=""
				accept=".img"
				:before-upload="getNameAndVersion"
				style="width: 300px;">
				<div style="padding: 20px 0">
					<Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
					<p>Click or drag file here to get the Module Name and Version</p>
				</div>
			</Upload>
			<div>
				<i-button
					type="ghost"
					shape="circle"
					icon="chevron-right" 
					size="large"
					@click="basicNext">
				</i-button>
			</div>
		</Card>
</template>

<script>
import Clipboard from "clipboard";

export default {
  props: ["curStep"],
  data() {
    return {
      module: "",
      projects: [],
      version: "",
      spec: "",
      specs: []
    };
  },
  methods: {
    getNameAndVersion(imgFile) {
      let filename = imgFile.name;
      if (/^\w+-v(\d+\.){3}\d+.*\.img$/i.test(filename) === false) {
        this.$Notice.error({
          title: "FW Format Error",
          desc:
            "Filename format error. It should be /^\\w+-v(\\d+\\.){3}\\d+.*\\.img$/i"
        });
        this.module = this.version = "";
        return false;
      }
      let index = filename.indexOf("-");
      if (index === -1) {
        this.$Notice.error({
          title: "Read File Error",
          desc: "Can't get the module name and version"
        });
        this.module = this.version = "";
        return false;
      }
      this.module = filename.slice(0, index);
      this.version = filename.slice(index + 2, -4);
      return false;
    },
    basicNext() {
      if (this.module === "" || this.version === "" || this.spec === "") {
        this.$Notice.error({
          title: "All items are required"
        });
        return false;
      }
      let postDate = {
        moduleName: this.module,
        version: this.version,
        spec: this.spec
      };
      this.$util.postApiAsync("/api/basicInfo", postDate, (err, payload) => {
        if (err) {
          this.$Notice.error({
            title: payload.msg
          });
          this.$emit("statusErr");
          return false;
        }
        this.$emit("updateDate", { token: payload.token });
        this.$emit("stepNext");
      });
    }
  },
  mounted() {
    this.$util.getApiAsync("/api/getModules", (err, payload) => {
      if (!err) {
        this.projects = payload.data;
      }
    });
    this.$util.getApiAsync("/api/getSpecs", (err, payload) => {
      if (!err) {
        app.specs = payload.data;
      }
    });

    let url = top.window.location.href;
    let index = url.indexOf("token=");
    if (index !== -1) {
      url = url.slice(index + 6);
      if (url.indexOf("&") === -1) this.$emit("updateDate", { token: url });
      else this.$emit("updateDate", { token: url.slice(0, url.indexOf("&")) });
      this.$emit("stepNext", 2);
    }

    if (Clipboard.isSupported()) {
      var clipboard = new Clipboard(".text-point", {
        text: function(trigger) {
          return url;
        }
      });
      clipboard.on("success", () => {
        this.$Notice.success({
          title: "Clipboard Message",
          desc: "Copy the URL to clipboard successfully."
        });
      });
      clipboard.on("error", () => {
        this.$Notice.error({
          title: "Clipboard Message",
          desc: "Copy the URL to clipboard failed."
        });
      });
    }
  }
};
</script>
