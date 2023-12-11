<template>
  <div></div>
</template>
<script lang="ts">
let timer: ReturnType<typeof setTimeout> | null = null;
export default {
  data() {
    return {};
  },
  methods: {
    onSetTimeout() {
      timer = setInterval(() => {
        console.log("setInterval");
      }, 1000);
    },
    clearTimer() {
      // clearTime
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    },
  },
  beforeUnmount() {
    // clearTime
    this.clearTimer();
  },
};
</script>

<style></style>
