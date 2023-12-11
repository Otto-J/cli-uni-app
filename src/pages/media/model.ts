export const useChooseVideo = () => {
  const tempVideoSrc = ref("");
  const chooseVideo = () => {
    uni.chooseVideo({
      sourceType: ["album", "camera"],
      maxDuration: 60,
      camera: "back",
      success: (res) => {
        tempVideoSrc.value = res.tempFilePath;
      },
    });
  };
  return {
    tempVideoSrc,
    chooseVideo,
  };
};
