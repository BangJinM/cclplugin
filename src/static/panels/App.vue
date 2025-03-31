<script setup lang="ts">
import { messageMgr } from "../../editor/MessageMgr";
import { MsgType } from "../../editor/MsgType";
import BlackBoard from "./components/BlackBoard.vue";
import CreateNodePanel from "./components/CreateNodePanel.vue";
import Inspector from "./components/Inspector.vue";
import VueFlowController from "./components/VueFlowController.vue";

function onClickFile() {
  let menu = [
    {
      label: "新建",
      click: () => {
        messageMgr.send(MsgType.CreateNewGraphAsset);
      },
    },
    {
      label: "打开",
      click: () => {
        messageMgr.send(MsgType.OpenGraphSource);
      },
    },
    {
      label: "保存",
      click: () => {
        messageMgr.send(MsgType.SaveGraphAsset);
      },
    },
    {
      label: "另存为",
      click: () => {
        messageMgr.send(MsgType.SaveGraphAssetAs);
      },
    },
  ];
  Editor.Menu.popup({ menu });
}

function onBlackBoard() {
  messageMgr.send(MsgType.BlackboardPanel, true);
}
</script>

<style>
.app-wrapper {
  display: flex;
  background-color: #2b2b2b;
  width: 100%;
  height: 100%;
  font-size: 12px;
  color: #cccccc;
  font-family: BlinkMacSystemFont, "PingFang SC", system-ui, -apple-system, Helvetica Neue,
    Helvetica, sans-serif;
}

.app-left {
  position: relative;
  width: calc(100% - 260px);
  height: 100%;
  display: flex;
}

.app-right {
  width: 260px;
  height: 100%;
  border-left: 2px solid #050505;
  flex-shrink: 0;
}

.app-header {
  display: flex;
  align-items: center;
  background-color: #141414;
  width: 100%;
  height: 25px;
}

.app-property {
  height: 50px;
  width: 50px;
  overflow: auto;
  pointer-events: auto;
  position: absolute;
  background-color: #302f2f;
  box-sizing: content-box;
  display: flex;
  flex-direction: column;
  user-select: none;
  border-radius: 2px;
}
</style>

<template>
  <header class="app-header">
    <ui-button @click="onClickFile">文件</ui-button>
  </header>
  <section class="app-wrapper">
    <div class="app-left">
      <VueFlowController></VueFlowController>
    </div>
    <div class="app-right">
      <Inspector></Inspector>
    </div>
    <ui-button class="app-property" @click="onBlackBoard">属性</ui-button>
  </section>
  <CreateNodePanel></CreateNodePanel>
  <BlackBoard></BlackBoard>
</template>
