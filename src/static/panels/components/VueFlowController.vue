<script setup lang="ts">
import { Background } from "@vue-flow/background";
import { VueFlow } from "@vue-flow/core";
import { ref } from "vue";
import { messageMgr } from "../../../editor/MessageMgr";
import { MsgType } from "../../../editor/MsgType";
import { IBTNodesData } from "../../../runtime";

const nodes = ref([]);
const edges = ref([]);

messageMgr.register(MsgType.InitBTPanel, (node: IBTNodesData, id?: string) => {
  nodes.value = [];
  for (const element of node.nodes) {
    nodes.value.push({
      ...element,
      draggable: false, // 禁用节点拖动
      connectable: false, // 禁用连接锚点
    });
  }

  edges.value = [];
  for (const element of node.edges) {
    edges.value.push({ ...element, type: "smoothstep" });
  }

  let selectedNode = nodes.value.find((value) => value.id === id);
  if (selectedNode) handleNodeClick({ event: null, node: selectedNode });
});

function handleNodeClick({ event, node }) {
  nodes.value = nodes.value.map((n) => {
    return {
      ...n,
      selected: n.id === node.id,
      style: {
        border: n.id === node.id ? "4px solid #FF5722" : "1px solid #9E9E9E",
      },
    };
  });
  console.log(nodes.value);
  messageMgr.send(MsgType.SelectNode, node.id);
}

function handleNodeRightClick() {
  let menu = [
    {
      label: "增加节点",
      visible: true,
      accelerator: "Space",
      click: () => {
        messageMgr.send(MsgType.CreateNode, true);
      },
    },
    {
      label: "删除节点",
      visible: true,
      accelerator: "Space",
      click: () => {
        console.log("dsadfa");
      },
    },
  ];
  Editor.Menu.popup({ menu });
}
function handlePanelRightClick() {}
</script>

<style>
.vue-flow {
  height: 100%;
  width: 100%;
  border: "1px solid #9E9E9E";
}
</style>

<template>
  <div class="vue-flow">
    <VueFlow
      :nodes="nodes"
      :edges="edges"
      :min-zoom="0.2"
      :max-zoom="4"
      @node-click="handleNodeClick"
      @node-context-menu="handleNodeRightClick"
      @pane-context-menu="handlePanelRightClick"
    >
      <Background> </Background>
    </VueFlow>
  </div>
</template>
