<template>
    <Row v-if="curStep===2" style="margin-top: 50px;">
			<i-col span="12" offset="2">
				<i-table
					:columns="tableHead"
					:data="soapTable"
					:loading="tableLoading"
					height="620px"
					style="min-width: 620px;"
					id="soap-table"
					no-data-text="All SOAP Action Success">
				</i-table>
			</i-col>
			<i-col span="6" offset="2">
				<Card style="width:450px; height: 560px;" id="table-card2">
					<div id="download-div">
						<div class="download-log" @click="downloadLog" :data-path="log2Path"><Icon type="document" :data-path="log2Path"></Icon><br/><span>2.0 Log</span></div>
						<div class="download-log" @click="downloadLog" :data-path="log3Path"><Icon type="document" :data-path="log3Path"></Icon><br/><span>3.0 Log</span></div>
					</div>
					<hr/>
					<div>
						<p>Click following URL to copy it to GUI members for checking:</p>
						<p>
							<a id="token-url" v-bind:class="{'text-point': clipboardSup}">{{tokenUrl}}</a>
						</p>
					</div>
					<hr/>
					<div>
						<i-select v-model="refer" style="width:200px" placeholder="Please Select">
							<i-option v-for="item in referModules" :value="item" :key="item">{{ item }}</i-option>
						</i-select>
						<div style="margin-top:25px;" v-if="refer === ''? false: true">
							Refer to <u>{{refer}}</u> to <i-button type="primary" icon="ios-color-wand-outline" @click="fillTable">Fill Table</i-button>
						</div>
					</div>
					<hr/>
					<div>
						<i-button type="primary" icon="android-done" @click="saveFailTable">Save & Next</i-button>
					</div>
				</Card>
			</i-col>
			<i-col span="2"></i-col>
		</Row>
</template>

<script>
import Clipboard from "clipboard";

export default {
  props: ["curStep"],
  data() {
    return {
      tableHead: [
        { title: "#", key: "belongTo", width: "70" },
        { title: "SOAP Action", key: "action" },
        {
          title: "Action Result",
          key: "status",
          render: function(h, params) {
            return h(
              "i-select",
              {
                props: {
                  placeholder: "Please Select",
                  value: params.row.status
                },
                style: {
                  width: "120px"
                },
                on: {
                  "on-change": function(val) {
                    this.soapTable[params.index].status = val;
                  }
                }
              },
              [
                h(
                  "i-option",
                  {
                    props: {
                      value: "FAIL"
                    }
                  },
                  "FAIL"
                ),
                h(
                  "i-option",
                  {
                    props: {
                      value: "N/A"
                    }
                  },
                  "Not Support"
                )
              ]
            );
          }
        },
        {
          title: "Comment",
          key: "comment",
          render: function(h, params) {
            return h("i-input", {
              props: {
                value: params.row.comment
              },
              on: {
                "on-blur": function(event) {
                  this.soapTable[params.index].comment = event.target.value;
                }
              }
            });
          }
        }
      ],
      soapTable: [],
      tableLoading: false,
      refer: "",
      referModules: [],
      clipboardSup: Clipboard.isSupported(),
      log2Path: "",
      log3Path: ""
    };
  }
};
</script>
