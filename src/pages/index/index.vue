<template>
  <view class="flex flex-col">
    <view id="id2" class="container mx-auto self">
      <uni-badge text="1"></uni-badge>
      <uni-badge text="3" type="primary" :inverted="true"></uni-badge>
      <view class="index text-center bg-blue-300" @click="showSys">blue text1</view>
      <button @click="goMediaPhoto">go media-photo</button>
      <button @click="goSharePage">go share</button>
      <view> 定义 timer {{ val }}</view>
      <uni-card>
        <text>这是一个基础卡片示例，内容较少，此示例展示了一个没有任何属性不带阴影的卡片。</text>
      </uni-card>
      <uni-table border stripe emptyText="暂无更多数据">
        <!-- 表头行 -->
        <uni-tr>
          <uni-th align="center">日期</uni-th>
          <uni-th align="center">姓名</uni-th>
          <uni-th align="left">地址</uni-th>
        </uni-tr>
        <!-- 表格数据行 -->
        <uni-tr>
          <uni-td>2020-10-20</uni-td>
          <uni-td>Jeson</uni-td>
          <uni-td>北京市海淀区</uni-td>
        </uni-tr>
        <uni-tr>
          <uni-td>2020-10-21</uni-td>
          <uni-td>HanMeiMei</uni-td>
          <uni-td>北京市海淀区</uni-td>
        </uni-tr>
        <uni-tr>
          <uni-td>2020-10-22</uni-td>
          <uni-td>LiLei</uni-td>
          <uni-td>北京市海淀区</uni-td>
        </uni-tr>
        <uni-tr>
          <uni-td>2020-10-23</uni-td>
          <uni-td>Danner</uni-td>
          <uni-td>北京市海淀区</uni-td>
        </uni-tr>
      </uni-table>
    </view>
  </view>
</template>
<script lang="ts" setup>
// import { useEventListener } from "@vueuse/core";

onMounted(() => {
  // useEventListener(document, "keydown", (e) => {
  //   console.log(e);
  // });
});
const showSys = async () => {
  // const res = await uni.getSystemInfo();
  // console.log(res);
  // const query = uni.createSelectorQuery().in(this);
  // console.log(query);
  // query
  //   .select("#id2")
  //   .boundingClientRect((data) => {
  //     console.log("得到布局位置信息" + JSON.stringify(data));
  //     console.log("节点离页面顶部的距离为" + data.top);
  //   })
  //   .exec();
};

const goMediaPhoto = () => {
  debugger;
  uni.navigateTo({
    url: "/pages/media/index",
  });
};

const goSharePage = () => {
  uni.navigateTo({
    url: "/pages/share/index",
  });
};
onLoad(() => {
  console.log("23onLoad");
});

let val = ref(0);

const useTimerFn = () => {
  const timer = ref(0);
  const start = () => {
    timer.value = setInterval(() => {
      console.log("timer");
      val.value++;
    }, 1000);
  };
  const stop = () => {
    clearInterval(timer.value);
  };
  return { start, stop };
};

const { start, stop } = useTimerFn();
onMounted(() => {
  start();
});

onUnmounted(() => {
  console.log("onUnmounted,stop timer");
  stop();
});

onUnload(() => {
  console.log("222onUnload,stop timer");
  stop();
});
onHide(() => {
  console.log("333onHide,stop timer");
  stop();
});
</script>

<style></style>
