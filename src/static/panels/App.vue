<script setup lang="ts">
import { ref } from "vue";
import BlackBoard from "./components/BlackBoard.vue";
import CreateNode from "./components/CreateNode.vue";
import Operate from "./components/Operate.vue";
import VueFlowController from "./components/VueFlowController.vue";

let currentPanel = ref(0);
let panels = ["Operate", "Inspector", "BlockBoard"];

function handlePanelChange(value) {
  currentPanel.value = value || 0;
}

function handleRightClick(value) {
  console.log("dlajdlajlasd");
}
</script>

<style>
.wrapper {
  display: flex;
  background-color: #2b2b2b;
  width: 100%;
  height: 100%;
  font-size: 12px;
  color: #cccccc;
  font-family: BlinkMacSystemFont, "PingFang SC", system-ui, -apple-system, Helvetica Neue,
    Helvetica, sans-serif;
}

.left {
  position: relative;
  width: calc(100% - 260px);
  height: 100%;
  display: flex;
}

.right {
  width: 260px;
  border-left: 2px solid #050505;
  flex-shrink: 0;
}
.node-panel {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 260px;
}
</style>

<template>
  <div class="wrapper">
    <div class="left">
      <VueFlowController></VueFlowController>
    </div>
    <div class="right">
      <ui-tab :value="currentPanel" @change="handlePanelChange($event.target.value)">
        <ui-button v-for="panel of panels" :key="panel">{{ panel }}</ui-button>
      </ui-tab>
      <div v-if="currentPanel === 0" class="node-panel">
        <ui-section header="Operates">
          <Operate></Operate>
        </ui-section>
      </div>
      <div v-else-if="currentPanel === 1">1</div>
      <div v-else-if="currentPanel === 2">
        <BlackBoard></BlackBoard>
      </div>
    </div>
    <CreateNode></CreateNode>
  </div>
</template>
