<template>
    <Steps :current="curStep" :status="stepStatus">
		<Step title="Basic Information" content="Module Name & Version & SPEC Version"></Step>
		<Step title="Upload Result And Logs" content="Result Of SOAP 2.0 Tool"></Step>
		<Step title="GUI Check" content="GUI Check And Fill The Comments Table"></Step>
		<Step title="Download Report" content="Download Excel Report"></Step>
	</Steps>
</template>

<script>
import { mapState } from 'vuex'

export default {
    data() {
        return {}
    },
    computed: {
        ...mapState(['curStep', 'stepStatus'])
    }
}
</script>
