<script setup lang="ts">
import { onMounted, ref } from "vue";
import { messageMgr } from "../../../editor/MessageMgr";
import { MsgType } from "../../../editor/MsgType";

let searchInputRef = ref();
let searchValue = ref("");
let menuRef = ref();
let createNode = ref();
let visibleFlag = ref(false);

function onClose() {
  messageMgr.send(MsgType.BlackboardPanel, false);
}
function onSearchInputChange(value: string) {
  if (searchValue.value === value) return;
  searchValue.value = value;

  setTimeout(() => {
    // let selectItem;
    // let treeData = convertMenuData(Menu.Instance.getShaderNodeMenu(), false);
    // if (value) {
    //   const result = filterMenuByKeyword(treeData, value);
    //   treeData = result.filterTree;
    //   selectItem = result.firstSelect;
    // }
    // const $dom = menuRef.value;
    // $dom.tree = treeData;
    // if (treeData.length > 0) {
    //   $dom.clear();
    //   $dom.select(selectItem);
    //   menuRef.value.positioning(selectItem);
    //   $dom.render();
    // }
  }, 50);
}

let onDragStartHeaderEvent = null;
function onMouseDown(event: MouseEvent) {
  event.stopPropagation();

  onDragStartHeaderEvent = function (event: MouseEvent) {
    event.stopPropagation();

    const pointX = event.clientX;
    const pointY = event.clientY;

    const start = {
      left: createNode.value.offsetLeft,
      top: createNode.value.offsetTop,
    };

    function drag(event: MouseEvent) {
      const x = start.left + (event.clientX - pointX);
      const y = start.top + (event.clientY - pointY);

      createNode.value.style.left = `${x}px`;
      createNode.value.style.top = `${y}px`;
    }

    function dragEnd() {
      document.removeEventListener("mousemove", drag, true);
      document.removeEventListener("mouseup", dragEnd, true);
    }

    document.addEventListener("mousemove", drag, true);
    document.addEventListener("mouseup", dragEnd, true);
  };

  event.target.addEventListener("mousedown", onDragStartHeaderEvent, false);
}

interface TreeDetail {
  kType?: string;
  kClass?: string;
  value: string;
}

interface TreeNode {
  detail: TreeDetail;
  children: TreeNode[];
  showArrow: boolean;
}

onMounted(async () => {
  messageMgr.register(MsgType.BlackboardPanel, (flag, fatherNodeId) => {
    visibleFlag.value = flag;
  });
});
</script>

<style>
.root {
  height: 250px;
  width: 380px;
  top: 158px;
  left: 55px;
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
.header {
  display: flex;
  align-items: center;
  background-color: #141414;
  width: 100%;
  height: 25px;
}

.title-label {
  margin-left: 8px;
}

.close {
  position: absolute;
  right: 8px;
  cursor: pointer;
}

.section {
  height: 214px;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 4px;
}
</style>

<template>
  <div ref="blackBoard" class="root" v-if="visibleFlag">
    <header class="header" style="cursor: move" @mousedown="onMouseDown">
      <ui-label
        class="title-label"
        value="i18n:shader-graph.create_node.title"
      ></ui-label>
      <ui-button
        class="close"
        transparent
        tooltip="i18n:shader-graph.create_node.close.tooltip"
        @click="onClose"
      >
        <ui-icon value="close"></ui-icon>
      </ui-button>
    </header>
    <section class="section"></section>
  </div>
</template>
