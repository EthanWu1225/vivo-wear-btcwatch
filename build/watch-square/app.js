let $style$1411120752 = {
  "@info": {
    "styleObjectId": 1411120752
  }
};
const $app_style$1411120752 = $style$1411120752;
const $app_script$1411120752 = {
  onCreate() {
    console.log("[btc-watch] app onCreate");
  },
  onShow() {
    console.log("[btc-watch] app onShow");
  },
  onHide() {
    console.log("[btc-watch] app onHide");
  },
  onDestroy() {
    console.log("[btc-watch] app onDestroy");
  }
};
$app_define$("@app-component/app", [], function($app_require$, $app_exports$, $app_module$) {
  $app_module$.exports = $app_script$1411120752.default || $app_script$1411120752;
  $app_module$.exports.style = $app_style$1411120752;
});
$app_bootstrap$("@app-application/app");
//# debugId=6f662792-b6ef-49a6-8ae0-82061d9faa2f
//# sourceMappingURL=app.js.map
