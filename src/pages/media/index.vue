<template>
  <div>媒体-图片</div>
  <view>uni.chooseImage()</view>
  <button @click="chooseImage">选择图片</button>
  <image :src="tempFile"></image>
  <view>媒体-录音管理</view>
  <view>
    <button @tap="startRecord">开始录音</button>
    <template v-if="isStart">
      <button v-if="!isPause" @tap="pauseRecord">暂停录音</button>
      <button v-else @tap="continueRecord">继续录音</button>
    </template>
    <button v-if="!isStart" @tap="endRecord">停止录音</button>
    <button @tap="playVoice">播放录音</button>
    <view>{{ tempRecordFile }}</view>
  </view>
  <view>音频组件控制</view>
  <button>点击播放</button>
  <view>选择视频</view>
  <button @click="chooseVideo">选择视频</button>
  <video :src="tempVideoSrc" controls></video>
</template>
<script lang="ts" setup>
import { onLoad } from "@dcloudio/uni-app";
import { useChooseVideo } from "./model";
const tempFile = ref("");
const chooseImage = async () => {
  const res = await uni.chooseImage({
    count: 1,
    sizeType: ["original", "compressed"],
    sourceType: ["album", "camera"],
  });
  console.log(JSON.stringify(res.tempFilePaths));
  tempFile.value = res.tempFilePaths[0];
};

const useRecord = () => {
  const tempRecordFile = ref("");
  // 全局唯一的录音管理器
  const recorderManager = uni.getRecorderManager();
  // 内部 音频 ctx
  const innerAudioContext = uni.createInnerAudioContext();

  innerAudioContext.autoplay = true;

  const isStart = ref(false);
  const isPause = ref(false);

  const startRecord = () => {
    if (isStart.value) {
      return;
    }
    console.log("开始录音");
    isStart.value = true;

    recorderManager.start({});
  };

  const pauseRecord = () => {
    if (!isStart.value) {
      return;
    }
    console.log("暂停录音");
    isStart.value = false;
    recorderManager.pause();
  };

  const continueRecord = () => {
    if (isStart.value || isPause.value) {
      return;
    }

    console.log("继续录音");
    recorderManager.resume();
  };

  const endRecord = () => {
    console.log("结束录音");
    isStart.value = false;
    recorderManager.stop();
  };
  const playVoice = () => {
    console.log("播放录音");
    if (!tempRecordFile.value) {
      return;
    }
    innerAudioContext.src = tempRecordFile.value;
    innerAudioContext.play();
  };

  return {
    recorderManager,
    innerAudioContext,
    startRecord,
    endRecord,
    playVoice,
    isPause,
    isStart,
    pauseRecord,
    continueRecord,
    tempRecordFile,
  };
};

const {
  recorderManager,
  innerAudioContext,
  startRecord,
  endRecord,
  playVoice,
  pauseRecord,
  continueRecord,
  isPause,
  isStart,
  tempRecordFile,
} = useRecord();

onLoad(() => {
  console.log("onload");
  recorderManager.onStop((res) => {
    console.log("录音结束", res);
    isStart.value = false;
    isPause.value = false;
    tempRecordFile.value = res.tempFilePath;
  });
});

const onAudioPlay = () => {
  const isPlay = ref(false);

  const innerAudioContext = uni.createInnerAudioContext();
  innerAudioContext.autoplay = false;
  innerAudioContext.src =
    "https://bjetxgzv.cdn.bspapp.com/VKCEYUGU-hello-uniapp/2cc220e0-c27a-11ea-9dfb-6da8e309e0d8.mp3";

  const startPlay = () => {
    console.log("开始播放");
    isPlay.value = true;
    innerAudioContext.onPlay(() => {
      console.log("开始播放");
    });
  };

  innerAudioContext.onError((res) => {
    console.log(res.errMsg);
    console.log(res.errCode);
  });
  return {
    isPlay,
    startPlay,
  };
};
const { isPlay } = onAudioPlay();

const { tempVideoSrc, chooseVideo } = useChooseVideo();
</script>

<style></style>
