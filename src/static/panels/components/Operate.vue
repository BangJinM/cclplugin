<script setup lang="ts">
import { ref } from "vue";
import { messageMgr } from "../../../editor/MessageMgr";
import { MsgType } from "../../../editor/MsgType";

const operates = ref([
  { name: "新建", operate: MsgType.CreateNewGraphAsset },
  { name: "打开", operate: MsgType.OpenGraphSource },
  { name: "保存", operate: MsgType.SaveGraphAsset },
  { name: "另存为", operate: MsgType.SaveGraphAssetAs },
]);

function onNodeClick(value) {
  messageMgr.send(value.operate);
}
</script>

<style></style>

<template>

    <ui-button v-for="panel of operates" :key="panel" @click="onNodeClick(panel)">{{
      panel.name
    }}</ui-button>
</template>
