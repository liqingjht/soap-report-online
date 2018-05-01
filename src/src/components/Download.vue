<template>
    <Card style="width:350px; height: 360px;">
			<i-circle :percent="percent" :stroke-color="circleColor">
				<span>
					<font style="font-size:16px; cursor: pointer;" v-if="(!start && !excelErr)" @click="generateExcel">Generate</font>
					<font style="font-size:24px" v-if="(start && percent < 100 && !excelErr)">{{percent}}%</font>
					<Icon type="ios-checkmark-empty" size="60" style="color:#5cb85c" v-if="(start && percent === 100 && !excelErr)"></Icon>
					<Icon type="ios-close-empty" size="60" style="color:#ff5500" v-if="excelErr"></Icon>
				</span>
			</i-circle>
			<i-button type="success" long v-if="(start && percent === 100 && !excelErr)" @click="downloadExcel">Download</i-button>
		</Card>
</template>

<script>
import { mapState } from 'vuex'
import $ from 'jquery'

export default {
  data() {
      return {}
  }
}
</script>
