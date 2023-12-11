<template>
  <div>share</div>
  <button>点击分享</button>
</template>
<script lang="ts" setup>
import { onReady, onShareAppMessage, onLoad } from "@dcloudio/uni-app";

onLoad(() => {
  console.log("11share onLoad");
});

onReady(() => {
  console.log("22share onReady");
});

onShareAppMessage(() => {
  console.log("share onShareAppMessage");
  const promise = new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        title: "自定义转发标题",
      });
    }, 2000);
  });
  return {
    title: "自定义转发标题",
    path: "/page/user?id=123",
    // promise,
  };
});
</script>

<style></style>
