<script setup lang="ts">
import { nextTick, onMounted, ref } from "vue";
import { messageMgr } from "../../../editor/MessageMgr";
import { MsgType } from "../../../editor/MsgType";

let searchInputRef = ref();
let searchValue = ref("");
let menuRef = ref();
let createNode = ref();
let visibleFlag = ref(false);
let fatherNodeId = 0;

function onClose() {
  messageMgr.send(MsgType.CreateNodePanel, false);
}

function onSearchInputChange(value: string) {
  if (searchValue.value === value) return;
  searchValue.value = value;

  setTimeout(async () => {
    menuRef.value.clear();
    let resultMap = await getNodeMenu(value);
    menuRef.value.tree = resultMap;
    menuRef.value.render();
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
  parent: TreeNode;
  detail: TreeDetail;
  children: TreeNode[];
  showArrow: boolean;
  show: boolean;
}

function filterRecursive(menuItems: TreeNode[], keywordLowerCase: string) {
  for (const item of menuItems) {
    item.show = false;

    const text = item.detail.value.toLowerCase();
    if (
      item.children.length === 0 &&
      (keywordLowerCase.length <= 0 ||
        text.startsWith(keywordLowerCase) ||
        text.includes(keywordLowerCase))
    ) {
      item.show = true;
      let target = item.parent;
      while (target) {
        if (target.show) break;
        target.show = true;
        target = target.parent;
      }
    }
    if (item.children && item.children.length > 0) {
      filterRecursive(item.children, keywordLowerCase);
    }
  }
}
function filterItems(menuItems: TreeNode[]) {
  for (let index = menuItems.length - 1; index >= 0; index--) {
    if (!menuItems[index].show) {
      menuItems.splice(index, 1);
    } else {
      filterItems(menuItems[index].children);
    }
  }
}
async function getNodeMenu(keywordLowerCase: string = "") {
  let btClass = await messageMgr.callSceneMethod("queryBTTreeClassMap");

  let resultMap: Map<string, TreeNode> = new Map();
  btClass.map((value) => {
    if (!resultMap.has(value.type)) {
      resultMap.set(value.type, {
        detail: { kType: value.type, value: value.type },
        children: [],
        showArrow: true,
        show: true,
        parent: null,
      });
    }
    resultMap.get(value.type).children.push({
      detail: { kType: value.type, kClass: value.name, value: value.name },
      children: [],
      showArrow: false,
      show: true,
      parent: resultMap.get(value.type),
    });
  });

  filterRecursive(Array.from(resultMap.values()), keywordLowerCase);
  let array = Array.from(resultMap.values());
  filterItems(array);
  return array;
}

async function initTree(keywordLowerCase: string = "") {
  menuRef.value.setTemplate("text", `<span class="name"></span>`);
  menuRef.value.setTemplateInit("text", ($text) => {
    $text.$name = $text.querySelector(".name");
  });
  menuRef.value.setRender("text", ($text, data) => {
    $text.$name.innerHTML = data.detail.value;
  });
  menuRef.value.tree = await getNodeMenu();
  menuRef.value.setItemRender;
  menuRef.value.setTemplateInit(
    "item",
    ($div: HTMLElement & { data: { detail: TreeDetail } }) => {
      $div.addEventListener("click", (event: MouseEvent) => {
        menuRef.value.clear();
        menuRef.value.select($div.data);
        menuRef.value.render();

        if (!$div.data.detail.kClass) return;

        messageMgr.send(
          MsgType.CreateNode,
          fatherNodeId,
          $div.data.detail.kType,
          $div.data.detail.kClass
        );

        messageMgr.send(MsgType.CreateNodePanel, false);
      });
    }
  );
}

onMounted(async () => {
  messageMgr.register(MsgType.CreateNodePanel, (flag, id) => {
    visibleFlag.value = flag;
    fatherNodeId = id;

    if (!flag) return;
    nextTick(async () => {
      initTree();
    });
  });
});
</script>

<style>
.create-node {
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

.search-group {
  display: flex;
  .icon {
    margin-left: 4px;
    margin-right: 4px;
  }
  .input {
    flex: 1;
    margin-right: 4px;
  }
}

.menus {
  height: 100%;
  width: 100%;
}
</style>

<template>
  <div ref="createNode" class="create-node" v-if="visibleFlag">
    <header style="cursor: move" @mousedown="onMouseDown">
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
    <section class="section">
      <div class="search-group">
        <ui-icon class="icon" value="search"></ui-icon>
        <ui-input
          ref="searchInputRef"
          class="input"
          :value="searchValue"
          placeholder="i18n:shader-graph.create_node.search_input.placeholder"
          @change="onSearchInputChange($event.target.value)"
        ></ui-input>
      </div>
      <ui-tree ref="menuRef" class="menus"></ui-tree>
    </section>
  </div>
</template>
