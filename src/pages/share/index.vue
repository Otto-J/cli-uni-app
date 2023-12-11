<template>
  <uni-nav-bar title="导航栏组件">
    <view>标题栏</view>
  </uni-nav-bar>
  <uni-icons type="contact" size="30"></uni-icons>
  <!-- <view class="status_bar"></view> -->
  <div>share</div>
  <uni-badge text="1"></uni-badge>
  <button open-type="share">点击分享2</button>
</template>
<script lang="ts">
// import { onReady, onShareAppMessage, onLoad } from "@dcloudio/uni-app";

export default {
  data() {
    return {};
  },
  onLoad() {
    console.log("11share onLoad");
    uni.showShareMenu();
  },

  onReady() {
    console.log("22share onReady");
  },
  onShareTimeline() {
    console.log("share onShareTimeline");
    return {
      title: "自定义转发标题",
    };
  },
  onShareAppMessage() {
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
      path: "/page/share/index?id=123",
      imageUrl: "https://web-assets.dcloud.net.cn/unidoc/zh/uniCloud.png",
      // promise,
    };
  },

  methods: {},
};
</script>

<style>
.status_bar {
  height: var(--status-bar-height);
  margin-bottom: 20rpx;
  outline: 1px solid red;
  width: 100%;
}
</style>
