<template>
    <Card style="width:600px; height: 550px;" v-if="curStep===1" id="upload-card">
			<Row>
				<i-col span="9" offset="2">
					<Upload
						type="drag"
						:action="result2Action"
						:on-error="handUploadErr"
						:on-success="handUploadSuccess"
						:max-size="500">
						<div style="padding: 20px 0">
							<Icon type="ios-cloud-upload" size="32" :class="uploaded.result2? 'uploaded': 'upload'"></Icon>
							<p>upload 2.0 result</p>
						</div>
					</Upload>
				</i-col>
				<i-col span="9" offset="2">
					<Upload
						type="drag"
						:action="result3Action"
						:on-error="handUploadErr"
						:on-success="handUploadSuccess"
						:max-size="500">
						<div style="padding: 20px 0">
							<Icon type="ios-cloud-upload" size="32" :class="uploaded.result3? 'uploaded': 'upload'"></Icon>
							<p>upload 3.0 result</p>
						</div>
					</Upload>
				</i-col>
			</Row>
			<Row>
				<i-col span="9" offset="2">
					<Upload
						type="drag"
						:action="log2Action"
						:on-error="handUploadErr"
						:on-success="handUploadSuccess"
						:max-size="500">
						<div style="padding: 20px 0">
							<Icon type="ios-cloud-upload" size="32" :class="uploaded.log2? 'uploaded': 'upload'"></Icon>
							<p>upload 2.0 logs</p>
						</div>
					</Upload>
				</i-col>
				<i-col span="9" offset="2">
					<Upload
						type="drag"
						:action="log3Action"
						:on-error="handUploadErr"
						:on-success="handUploadSuccess"
						:max-size="500">
						<div style="padding: 20px 0">
							<Icon type="ios-cloud-upload" size="32" :class="uploaded.log3? 'uploaded': 'upload'"></Icon>
							<p>upload 3.0 logs</p>
						</div>
					</Upload>
				</i-col>
			</Row>
			<div>
				<i-button
					type="ghost"
					shape="circle"
					icon="chevron-right" 
					size="large"
					@click="uploadNext">
				</i-button>
			</div>
		</Card>
</template>

<script>
export default {
  props: ["curStep", 'token'],
  data() {
    return {
        uploaded: {
			result2: false,
			result3: false,
			log2: false,
			log3: false
		},
    };
  },
  computed: {
    result2Action() {
      return "/uploads?file=result2&token=" + this.token;
    },
    result3Action() {
      return "/uploads?file=result3&token=" + this.token;
    },
    log2Action() {
      return "/uploads?file=log2&token=" + this.token;
    },
    log3Action() {
      return "/uploads?file=log3&token=" + this.token;
    }
  },
  methods: {
    uploadNext() {
      if (Object.values(this.uploaded).indexOf(false) !== -1) {
        this.$Notice.error({
          title: "Please upload all files"
        });
        return;
      }
      toCheckingPanel();
    },
    handUploadErr() {
      this.$Notice.error({
        title: "Upload file failed. Please try again."
      });
    },
    handUploadSuccess(rsp, file) {
      if (rsp.status !== undefined && rsp.status === 0) {
        this.$Notice.success({
          title: "Upload " + file.name + " success."
        });
        this.uploaded[rsp.payload.uploaded] = true;
      } else if (rsp.message !== undefined && rsp.message !== "") {
        this.$Notice.error({
          title: rsp.message
        });
      }
    }
  }
};
</script>
