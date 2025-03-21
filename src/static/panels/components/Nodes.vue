<script setup lang="ts">
import { onMounted, ref } from "vue";
import { messageMgr } from "../../../editor/MessageMgr";
import { MsgType } from "../../../editor/MsgType";

async function callSceneMethod(method: string, args?: any[]): Promise<any> {
  return Editor.Message.request("scene", "execute-scene-script", {
    name: "cclplugin",
    method: method,
    args: args || [],
  });
}

async function createnodeCategory() {
  let btClass = await callSceneMethod("queryBTTreeClassMap");

  let resultMap = new Map();
  btClass.map((value) => {
    if (!resultMap.has(value.type))
      resultMap.set(value.type, { id: value.type, values: [] });
    resultMap.get(value.type).values.push(value.name);
  });

  let results = Array.from(resultMap.values());
  return results;
}
let nodeCategory = ref([]);

onMounted(async () => {
  nodeCategory.value = await createnodeCategory();
});

function onNodeClick(category, item) {
  console.log("onNodeClick");
  console.log(category);
  console.log(item);
  messageMgr.send(MsgType.AddNode, category, item);
}
</script>

<style>
.node-type {
  padding-right: 8px;
}
.category {
  margin-top: 4px;
}
</style>

<template>
  <div v-for="category of nodeCategory" class="node-type">
    <ui-section :header="category.id" :expand="category.expand">
      <ui-button
        class="category"
        v-for="item of category.values"
        :key="item"
        @click="onNodeClick(category.id, item)"
        >{{ item }}</ui-button
      >
    </ui-section>
  </div>
</template>
