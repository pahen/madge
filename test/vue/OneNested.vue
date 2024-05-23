<script lang="ts" setup>
import { ref } from "vue";
import ThreeNested from "./ThreeNested.vue";
import NotExistingNested from "./NotExistingNested.vue";
import ExportClass from "../typescript/export";

const count = ref(0);
</script>

<template>
	<button @click="count++">{{ count }}</button>
</template>
