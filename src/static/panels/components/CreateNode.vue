<script setup lang="ts">
import { nextTick, onMounted, ref } from "vue";
import { messageMgr } from "../../../editor/MessageMgr";
import { MsgType } from "../../../editor/MsgType";

let searchInputRef = ref();
let searchValue = ref("");
let menuRef = ref();
let createNode = ref();
let visibleFlag = ref(false);

function onClose() {
  messageMgr.send(MsgType.CreateNode, false);
}
function onSearchInputChange(value: string) {}

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

onMounted(async () => {
  messageMgr.register(MsgType.CreateNode, (flag) => {
    visibleFlag.value = flag;

    if (!flag) return;
    const vm = this;

    var t = {
      detail: {
        value: "test",
        checked: false,
      },
      children: [
        {
          detail: {
            value: "test-2",
            checked: false,
          },
          children: [
            {
              detail: {
                value: "test-3",
                checked: false,
              },
              showArrow: false,
              children: [],
            },
          ],
        },
      ],
    };

    var test = [];

    for (let i = 0; i < 1000; i++) {
      test.push(JSON.parse(JSON.stringify(t)));
    }

    nextTick(() => {
      menuRef.value.setTemplate("left", "<ui-checkbox></ui-checkbox>");
      menuRef.value.setTemplateInit("left", ($left) => {
        $left.$checkbox = $left.querySelector("ui-checkbox");
        $left.$checkbox.addEventListener("confirm", (event) => {
          $left.data.detail.checkbox = !$left.data.detail.checkbox;
          menuRef.value.render(true);
        });
      });
      menuRef.value.setRender("left", ($left, data) => {
        $left.$checkbox.value = data.detail.checkbox;
      });

      menuRef.value.setTemplate(
        "text",
        `<span class="name"></span><span class="link"></span>`
      );
      menuRef.value.setTemplateInit("text", ($text) => {
        $text.$name = $text.querySelector(".name");
        $text.$link = $text.querySelector(".link");
      });
      menuRef.value.setRender("text", ($text, data) => {
        $text.$name.innerHTML = data.detail.value;
        $text.$link.innerHTML = `link(${data.index})`;
      });

      menuRef.value.setTemplate("right", '<ui-icon value="reset"></ui-icon>');
      menuRef.value.setTemplateInit("right", ($right) => {
        $right.$refresh = $right.querySelector("ui-icon");
        $right.$refresh.addEventListener("click", (event) => {
          console.log($right.data);
        });
      });

      menuRef.value.tree = test;

      menuRef.value.addEventListener("keydown", (event) => {
        const $dom = menuRef.value;
        if (event.code === "ArrowUp") {
          const item = $dom.selectItems[$dom.selectItems.length - 1];
          const index = Math.max(item.index - 1, 0);
          if (event.shiftKey) {
            $dom.select($dom.list[index]);
          } else {
            $dom.clear();
            $dom.select($dom.list[index]);
          }
          $dom.render();
        } else if (event.code === "ArrowDown") {
          const item = $dom.selectItems[$dom.selectItems.length - 1];
          const index = Math.min(item.index + 1, $dom.list.length - 1);
          if (event.shiftKey) {
            $dom.select($dom.list[index]);
          } else {
            $dom.clear();
            $dom.select($dom.list[index]);
          }
          $dom.render();
        }
      });

      menuRef.value.setTemplateInit("item", ($div) => {
        const $dom = menuRef.value;
        $div.addEventListener("click", (event) => {
          if (event.ctrlKey || event.metaKey) {
            $dom.select($div.data);
          } else {
            $dom.clear();
            $dom.select($div.data);
          }
          $dom.render();
        });
      });
      menuRef.value.setRender("item", ($div, data) => {
        if (data.detail.disabled) {
          $div.setAttribute("disabled", "");
        } else {
          $div.removeAttribute("disabled");
        }
      });

      menuRef.value.setItemRender;

      menuRef.value.css = `
.item[disabled] {
  opacity: 0.4;
}

.text > .linsk {
  margin-left: 10px;
  cursor: pointer;
  color: yellow;
}

.right > ui-icon {
  cursor: pointer;
  color: green;
}
  `;
    });
  });
});

onpageshow;
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
  height: 100%;
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
    <section>
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
