<template>
  <view class="flex flex-col">
    <view class="container mx-auto">
      <uni-badge text="1"></uni-badge>
      <uni-badge text="3" type="primary" :inverted="true"></uni-badge>
      <view class="index text-center bg-blue-300" @click="showSys">blue text1</view>
    </view>
  </view>
</template>
<script lang="ts" setup>
const showSys = async () => {
  const res = await uni.getSystemInfo();
  console.log(res);
};
onLoad(() => {
  console.log("23onLoad");
});
</script>

<style></style>
