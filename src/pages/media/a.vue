<template>
  <!-- 列表1 -->
  <view class="list">
    <view class="item" v-for="(item, index) in containerShow" @click="touch(item)">
      显-{{ item.id }}
    </view>
  </view>

  <!-- 列表2 -->
  <view class="list">
    <view class="item" v-for="(item, index) in containerHide" @click="touch(item)">
      隐-{{ item.id }}
    </view>
  </view>

  <!-- 底部控制器 -->
  <view class="content">
    <button @click="reSet" v-show="isShow">还原（正常的）</button>

    <!-- 依赖 computed 计算状态-->
    <uni-transition mode-class="fade" :show="isShow">
      <view class="btn-container">
        <view class="btn-item">
          <button @click="reSet">还原（transition 异常computed）</button>
        </view>
      </view>
    </uni-transition>
    <!-- 依赖 ref 控制状态-->
    <uni-transition mode-class="slide-bottom" :show="showRef">
      <view class="btn-container">
        <view class="btn-item">
          <button @click="reSet">还原（transition 异常showRef）</button>
        </view>
      </view>
    </uni-transition>
  </view>
</template>

<script setup>
import { ref, reactive, computed, watch, toRaw } from "vue";

/** 原始数据列 */
const list = reactive(
  Array(5)
    .fill({})
    .map((item, index) => ({
      id: index * 2,
      flage: true,
    }))
);

/** 操作记录栈 */
const stack = reactive([]);

/** 状态标记：当操作记录栈不为空时true */
const isShow = computed(() => {
  let state = stack.length > 0;
  console.log("计算状态", state);
  return state;
});

/** 点击切换状态  并存入记录 */
const touch = ({ id }) => {
  let index = list.findIndex((v) => v.id == id);

  // 获取源数据 存入记录栈
  let history = JSON.parse(JSON.stringify(toRaw(list[index])));
  stack.push(history);

  // 切换状态
  list[index].flage = !list[index].flage;
};

/** 计算显示的列表 */
const containerShow = computed(() => {
  return list.filter((v) => v.flage);
});
/** 计算隐藏的列表 */
const containerHide = computed(() => {
  return list.filter((v) => !v.flage);
});

/** 还原初始状态 */
const reSet = () => {
  list.forEach((v) => {
    v.flage = true;
  });
  stack.splice(0, stack.length);
};

const showRef = ref(false);
/** 监控操作栈 */
watch(stack, (newVal) => {
  let state = newVal.length > 0;
  console.log("当前操作记录栈", toRaw(newVal), `长度是否>0:${state}`);
  showRef.value = state;
});
</script>

<style lang="scss" scoped>
.list {
  width: 80%;
  margin: 30rpx auto;
  padding: 20rpx;
  border: 2rpx solid #dadada;
  border-radius: 20rpx;
  background-color: #efefef;
  display: flex;
  justify-content: space-around;
  .item {
    padding: 30rpx;
    background: #fff;
  }
}
.content {
  position: fixed;
  bottom: 0;
  width: 100vw;
  z-index: 10;
  .btn-container {
    width: 100%;
    padding-top: 10px;
    padding-bottom: 10px;
    background-color: #d6d6d6b0;
    display: flex;
    align-self: center;
    justify-content: space-around;
  }
}
</style>
