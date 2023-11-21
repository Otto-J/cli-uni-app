/** @type {import('tailwindcss').Config} */

import cssMacro from "weapp-tailwindcss/css-macro";

module.exports = {
  content: ["./public/index.html", "./src/**/*.{html,js,ts,jsx,tsx,vue}"],
  corePlugins: {
    // 不需要 preflight，因为这主要是给 h5 的，如果你要同时开发小程序和 h5 端，你应该使用环境变量来控制它
    preflight: false,
  },
  plugins: [
    cssMacro({
      variantsMap: {
        wx: "MP-WEIXIN",
        "-wx": {
          value: "MP-WEIXIN",
          negative: true,
        },
        // mv: {
        //   value: 'H5 || MP-WEIXIN'
        // },
        // '-mv': {
        //   value: 'H5 || MP-WEIXIN',
        //   negative: true
        // }
      },
    }),
  ],
  presets: [
    require("tailwindcss-rem2px-preset").createPreset({
      // 32 意味着 1rem = 32rpx
      fontSize: 32,
      // 转化的单位,可以变成 px / rpx
      unit: "rpx",
    }),
  ],
};
