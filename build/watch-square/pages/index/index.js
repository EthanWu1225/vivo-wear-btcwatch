let $style$1552441465 = {
  "@info": {
    "styleObjectId": 1552441465
  }
};
const $app_style$1552441465 = $style$1552441465;
const fetch = $app_require$("@app-module/system.fetch");
const vibrator = $app_require$("@app-module/system.vibrator");
const storage = $app_require$("@app-module/system.storage");
const HOST = "data.gateapi.io";
const GATE_PATH = "/api2/1/ticker/btc_usdt";
const HARD_IPS = ["13.114.117.54"];
const KLINE_URL = "https://web.ifzq.gtimg.cn/appstock/app/hkfqkline/get?param=hk03066,day,,,320,qfq";
const KLINE_KEY = "hk03066";
const KLINE_N = 40;
const REQ_TIMEOUT = 4500;
const REQ_TIMEOUT_K = 9e3;
const HIST_TIMEOUT = 6e3;
const ITV_STEPS = [5, 10, 15, 30, 60];
const SAMPLE_PER = 10;
const SLOT_K = 48;
const SMP_KEY = "btcwatch_samples";
const GATE_V2_KLINE = "/api2/1/candlestick/btc_usdt?group_sec=300&range_hour=24";
const SRC_BARS = 120;
const BAR_MS = 18e5;
const LABEL_H = 18;
const CROWN_INVERT = true;
const CFG_KEY = "btcwatch_cfg";
const APP_VER = "v1.1.21";
const UA_H = {
  "User-Agent": "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36"
};
const COLOR_RED = "#FF4D4F";
const COLOR_GREEN = "#00C853";
const COLOR_MA = "#F59E0B";
const BG_ON = "#1F6FEB";
const BG_OFF = "#1F2937";
const RW = 360;
const RH = 190;
const KW = 360;
const KH = 245;
function normMod(m, key) {
  try {
    if (m && typeof m[key] === "function") return m;
    if (m && m.default && typeof m.default[key] === "function") return m.default;
    if (m && m.default) return m.default;
  } catch (e) {
  }
  return m || null;
}
let VIB_MOD = normMod(vibrator, "vibrate");
let STO_MOD = normMod(storage, "set");
function getVib() {
  return VIB_MOD;
}
function getSto() {
  return STO_MOD;
}
function tOf(x) {
  try {
    return typeof x;
  } catch (e) {
    return "?";
  }
}
function msgOf(e) {
  try {
    return "" + e;
  } catch (e2) {
    return "error";
  }
}
function safeNum(v) {
  if (typeof v === "number") return v !== v ? 0 : v;
  if (typeof v === "string") {
    const n = Number(v);
    return n !== n ? 0 : n;
  }
  const n2 = Number(v);
  return n2 !== n2 ? 0 : n2;
}
function pad2(x) {
  return x < 10 ? "0" + x : "" + x;
}
function fixed2(v) {
  let n = Number(v);
  if (n !== n) return "--";
  const neg = n < 0;
  if (neg) n = -n;
  let cents = n * 100 + 0.5 | 0;
  const dec = cents % 100;
  const intPart = (cents - dec) / 100;
  const digits = [];
  let ip = intPart;
  if (ip === 0) digits[0] = "0";
  while (ip > 0) {
    const d = ip % 10 | 0;
    digits[digits.length] = "" + d;
    ip = (ip - d) / 10;
  }
  let intStr = "";
  let cnt = 0;
  for (let k = 0; k < digits.length; k++) {
    intStr = digits[k] + intStr;
    cnt++;
    if (cnt % 3 === 0 && k < digits.length - 1) intStr = "," + intStr;
  }
  const decStr = dec < 10 ? "0" + dec : "" + dec;
  return (neg ? "-" : "") + intStr + "." + decStr;
}
function fmtVol(v) {
  let n = safeNum(v);
  if (n < 0) n = -n;
  if (n >= 1e8) return fixed2(n / 1e8) + "亿";
  if (n >= 1e4) return fixed2(n / 1e4) + "万";
  return "" + (n + 0.5 | 0);
}
function signedPct(p) {
  return (p >= 0 ? "+" : "") + fixed2(p) + "%";
}
function clockText() {
  try {
    const d = /* @__PURE__ */ new Date();
    return pad2(d.getHours()) + ":" + pad2(d.getMinutes()) + ":" + pad2(d.getSeconds());
  } catch (e) {
    return "--";
  }
}
function hhmm(ms) {
  try {
    const d = new Date(ms);
    return pad2(d.getHours()) + ":" + pad2(d.getMinutes());
  } catch (e) {
    return "--";
  }
}
function mmdd(s) {
  const t = "" + s;
  if (t.length >= 10) return t.substring(5, 10);
  return t;
}
function nowMs() {
  try {
    return (/* @__PURE__ */ new Date()).getTime();
  } catch (e) {
    return 0;
  }
}
function toObj(text) {
  if (text === null || text === void 0) return null;
  if (typeof text === "object") return text;
  try {
    return JSON.parse("" + text);
  } catch (e) {
    return null;
  }
}
function upColor(page, isUp) {
  let agStock = false;
  try {
    agStock = page.scheme === 1;
  } catch (e) {
  }
  if (agStock) return isUp ? COLOR_RED : COLOR_GREEN;
  return isUp ? COLOR_GREEN : COLOR_RED;
}
function pickTicker(res) {
  let raw = res;
  if (raw && raw.data !== void 0 && raw.data !== null) raw = raw.data;
  const d = toObj(raw);
  if (!d) return null;
  let o = d;
  if (o.data && typeof o.data === "object" && o.data.length > 0) o = o.data[0];
  let lastRaw = o.last;
  if (lastRaw === void 0 || lastRaw === null) lastRaw = o.close;
  if (lastRaw === void 0 || lastRaw === null) return null;
  const last = safeNum(lastRaw);
  if (last <= 0) return null;
  let pct = o.percentChange;
  if (pct === void 0 || pct === null) pct = o.changePercent;
  if (pct === void 0 || pct === null) pct = 0;
  let hi = o.high24hr;
  if (hi === void 0 || hi === null) hi = o.high;
  let lo = o.low24hr;
  if (lo === void 0 || lo === null) lo = o.low;
  let vol = o.baseVolume;
  if (vol === void 0 || vol === null) vol = o.value;
  return {
    last,
    pct: safeNum(pct),
    high: safeNum(hi),
    low: safeNum(lo),
    vol: safeNum(vol)
  };
}
function pickEmDay(res) {
  let raw = res;
  if (raw && raw.data !== void 0 && raw.data !== null) raw = raw.data;
  const j = toObj(raw);
  if (!j) return null;
  const root = j.data;
  if (!root) return null;
  const arr = root.klines;
  if (!arr || typeof arr.length !== "number" || arr.length < 2) return null;
  const out = [];
  let i = 0;
  for (i = 0; i < arr.length; i++) {
    const row = ("" + arr[i]).split(",");
    if (row.length < 5) continue;
    out[out.length] = row;
  }
  if (out.length < 2) return null;
  return out;
}
function pickKline(res) {
  let raw = res;
  if (raw && raw.data !== void 0 && raw.data !== null) raw = raw.data;
  const j = toObj(raw);
  if (!j) return null;
  const root = j.data;
  if (!root) return null;
  const node = root[KLINE_KEY];
  if (!node) return null;
  const arr = node.day;
  if (!arr || typeof arr.length !== "number" || arr.length < 2) return null;
  return arr;
}
function parseGateLive(res) {
  let raw = res;
  if (raw && raw.data !== void 0 && raw.data !== null) raw = raw.data;
  const arr = toObj(raw);
  if (!arr || typeof arr.length !== "number" || arr.length < 2) return null;
  const o = [];
  const h = [];
  const l = [];
  const c = [];
  const t = [];
  const n = arr.length;
  let i = 0;
  for (i = 0; i < n; i++) {
    const a = arr[i];
    if (!a || typeof a.length !== "number" || a.length < 6) continue;
    const cc = Number(a[2]);
    const hh = Number(a[3]);
    const ll = Number(a[4]);
    const oo = Number(a[5]);
    if (cc !== cc || cc <= 0) continue;
    if (i === n - 1 && "" + a[7] !== "true") continue;
    o[o.length] = oo;
    h[h.length] = hh;
    l[l.length] = ll;
    c[c.length] = cc;
    t[t.length] = Number(a[0]) * 1e3;
  }
  if (c.length < 2) return null;
  return {
    o,
    h,
    l,
    c,
    t,
    st: 6e4
  };
}
function itvIndex(v) {
  for (let i = 0; i < ITV_STEPS.length; i++) {
    if (ITV_STEPS[i] === v) return i;
  }
  return 0;
}
function layoutOk(o, h, l, c) {
  if (o !== o || h !== h || l !== l || c !== c) return false;
  if (h < l || h <= 0 || l <= 0) return false;
  if (h < o || h < c) return false;
  if (l > o || l > c) return false;
  return true;
}
function snipOf(res) {
  try {
    let s = "";
    if (res && res.data !== void 0 && res.data !== null) s = "" + res.data;
    else s = "" + res;
    s = s.split(String.fromCharCode(10)).join(" ");
    s = s.split(String.fromCharCode(13)).join(" ");
    s = s.split(String.fromCharCode(9)).join(" ");
    if (s.length > 34) s = s.substring(0, 34);
    return s;
  } catch (e) {
    return "?";
  }
}
function parseGateV2(res) {
  let raw = res;
  if (raw && raw.data !== void 0 && raw.data !== null) raw = raw.data;
  let j = toObj(raw);
  if (!j) return null;
  if (typeof j.length === "number" && !j.data) j = {
    data: j
  };
  let arr = j.data;
  if (arr && arr.data && typeof arr.data.length === "number") arr = arr.data;
  if (!arr || typeof arr.length !== "number" || arr.length < 2) return null;
  let i = 0;
  let okA = 0;
  let okB = 0;
  for (i = 0; i < arr.length; i++) {
    const a = arr[i];
    if (!a || typeof a.length !== "number" || a.length < 6) continue;
    if (layoutOk(Number(a[2]), Number(a[3]), Number(a[4]), Number(a[5]))) okA++;
    if (layoutOk(Number(a[1]), Number(a[2]), Number(a[3]), Number(a[4]))) okB++;
  }
  const useB = okB > okA;
  const o = [];
  const h = [];
  const l = [];
  const c = [];
  const t = [];
  for (i = 0; i < arr.length; i++) {
    const a = arr[i];
    if (!a || typeof a.length !== "number" || a.length < 6) continue;
    const oo = Number(useB ? a[1] : a[2]);
    const cc = Number(useB ? a[4] : a[5]);
    const hh = Number(useB ? a[2] : a[3]);
    const ll = Number(useB ? a[3] : a[4]);
    if (!layoutOk(oo, hh, ll, cc)) continue;
    o[o.length] = oo;
    h[h.length] = hh;
    l[l.length] = ll;
    c[c.length] = cc;
    t[t.length] = Number(a[0]);
  }
  if (c.length < 2) return null;
  if (t.length > 0 && t[0] > 0 && t[0] < 1e11) {
    for (i = 0; i < t.length; i++) t[i] = t[i] * 1e3;
  }
  let stv = 18e5;
  if (t.length > 1) {
    const dv = t[1] - t[0];
    if (dv > 0) stv = dv;
  }
  return {
    o,
    h,
    l,
    c,
    t,
    st: stv
  };
}
function parseGateV4(res) {
  let raw = res;
  if (raw && raw.data !== void 0 && raw.data !== null) raw = raw.data;
  const j = toObj(raw);
  if (!j) return null;
  let arr = j;
  if (arr && arr.data && typeof arr.data.length === "number") arr = arr.data;
  if (!arr || typeof arr.length !== "number" || arr.length < 2) return null;
  const o = [];
  const h = [];
  const l = [];
  const c = [];
  const t = [];
  let i = 0;
  for (i = 0; i < arr.length; i++) {
    const a = arr[i];
    if (!a || typeof a.length !== "number" || a.length < 6) continue;
    const tt = Number(a[0]);
    const cc = Number(a[2]);
    const hh = Number(a[3]);
    const ll = Number(a[4]);
    const oo = Number(a[5]);
    if (!(tt > 0)) continue;
    if (!layoutOk(oo, hh, ll, cc)) continue;
    o[o.length] = oo;
    h[h.length] = hh;
    l[l.length] = ll;
    c[c.length] = cc;
    t[t.length] = tt > 1e11 ? tt : tt * 1e3;
  }
  if (c.length < 2) return null;
  let stv = 3e5;
  if (t.length > 1) {
    const dv = t[1] - t[0];
    if (dv > 0) stv = dv;
  }
  return {
    o,
    h,
    l,
    c,
    t,
    st: stv
  };
}
function parseBinKline(res) {
  let raw = res;
  if (raw && raw.data !== void 0 && raw.data !== null) raw = raw.data;
  const j = toObj(raw);
  if (!j) return null;
  let arr = j;
  if (arr && arr.data && typeof arr.data.length === "number") arr = arr.data;
  if (!arr || typeof arr.length !== "number" || arr.length < 2) return null;
  const o = [];
  const h = [];
  const l = [];
  const c = [];
  const t = [];
  let i = 0;
  for (i = 0; i < arr.length; i++) {
    const a = arr[i];
    if (!a || typeof a.length !== "number" || a.length < 6) continue;
    const tt = Number(a[0]);
    const oo = Number(a[1]);
    const hh = Number(a[2]);
    const ll = Number(a[3]);
    const cc = Number(a[4]);
    if (!(tt > 0)) continue;
    if (!layoutOk(oo, hh, ll, cc)) continue;
    o[o.length] = oo;
    h[h.length] = hh;
    l[l.length] = ll;
    c[c.length] = cc;
    t[t.length] = tt > 1e11 ? tt : tt * 1e3;
  }
  if (c.length < 2) return null;
  let stv = 6e4;
  if (t.length > 1) {
    const dv = t[1] - t[0];
    if (dv > 0) stv = dv;
  }
  return {
    o,
    h,
    l,
    c,
    t,
    st: stv
  };
}
function parseOkxKline(res) {
  let raw = res;
  if (raw && raw.data !== void 0 && raw.data !== null) raw = raw.data;
  const j = toObj(raw);
  if (!j) return null;
  let arr = j;
  if (arr && arr.data && typeof arr.data.length === "number") arr = arr.data;
  if (!arr || typeof arr.length !== "number" || arr.length < 2) return null;
  const o = [];
  const h = [];
  const l = [];
  const c = [];
  const t = [];
  let i = 0;
  for (i = arr.length - 1; i >= 0; i--) {
    const a = arr[i];
    if (!a || typeof a.length !== "number" || a.length < 6) continue;
    const tt = Number(a[0]);
    const oo = Number(a[1]);
    const hh = Number(a[2]);
    const ll = Number(a[3]);
    const cc = Number(a[4]);
    if (!(tt > 0)) continue;
    if (!layoutOk(oo, hh, ll, cc)) continue;
    o[o.length] = oo;
    h[h.length] = hh;
    l[l.length] = ll;
    c[c.length] = cc;
    t[t.length] = tt > 1e11 ? tt : tt * 1e3;
  }
  if (c.length < 2) return null;
  let stv = 6e4;
  if (t.length > 1) {
    const dv = t[1] - t[0];
    if (dv > 0) stv = dv;
  }
  return {
    o,
    h,
    l,
    c,
    t,
    st: stv
  };
}
function parseCoinexLive(res) {
  let raw = res;
  if (raw && raw.data !== void 0 && raw.data !== null) raw = raw.data;
  const j = toObj(raw);
  if (!j) return null;
  const arr = j.data;
  if (!arr || typeof arr.length !== "number" || arr.length < 2) return null;
  const o = [];
  const h = [];
  const l = [];
  const c = [];
  const t = [];
  let i = 0;
  for (i = 0; i < arr.length; i++) {
    const a = arr[i];
    const cc = Number(a.close);
    if (cc !== cc || cc <= 0) continue;
    o[o.length] = Number(a.open);
    h[h.length] = Number(a.high);
    l[l.length] = Number(a.low);
    c[c.length] = cc;
    t[t.length] = Number(a.created_at);
  }
  if (c.length < 2) return null;
  return {
    o,
    h,
    l,
    c,
    t,
    st: 6e4
  };
}
function addLog(prev, item) {
  let s = prev ? prev + " " + item : item;
  if (s.length > 104) s = s.substring(s.length - 104);
  return s;
}
function buildAttempts() {
  const list = [];
  for (let i = 0; i < HARD_IPS.length; i++) {
    list[list.length] = {
      tag: "IP" + (i + 1),
      url: "http://" + HARD_IPS[i] + GATE_PATH,
      header: {
        Host: HOST
      }
    };
  }
  return list;
}
function joinArr(a, sep) {
  let s = "";
  for (let i = 0; i < a.length; i++) s += (i ? sep : "") + a[i];
  return s;
}
function doVibrate() {
  try {
    const m = getVib();
    if (!m) return false;
    if (typeof m.getSystemDefaultMode === "function") {
      const mode = m.getSystemDefaultMode();
      if (mode === 0) return false;
    }
    if (typeof m.vibrate === "function") {
      m.vibrate({
        mode: "short"
      });
      return true;
    }
  } catch (e) {
    return false;
  }
  return false;
}
const $app_script$1552441465 = {
  data() {
    return {
      view: 0,
      isRealtime: true,
      isKline: false,
      isSetting: false,
      bgTab0: BG_ON,
      bgTab1: BG_OFF,
      bgTab2: BG_OFF,
      price: "--",
      changePct: "--",
      priceColor: "#FFFFFF",
      high: "--",
      low: "--",
      volume: "--",
      updatedAt: "--",
      sourceName: "IP1",
      statusText: "正在获取行情…",
      statusColor: "#6B7280",
      selfTest: "自检中…",
      chartNote: "图:--",
      chartInfo: "等待数据",
      basePrice: 0,
      samples: [],
      journal: [],
      hasData: false,
      busy: false,
      busyAt: 0,
      timerId: 0,
      visible: true,
      lastPct: 0,
      pctBand: 0,
      pctReady: false,
      kO: [],
      kC: [],
      kH: [],
      kL: [],
      kCount: 0,
      kLast: "--",
      kChg: "--",
      kChgVal: 0,
      kLastColor: "#FFFFFF",
      kHi: "--",
      kLo: "--",
      kMa7: "--",
      kRange: "区间 --",
      kDateA: "",
      kDateM: "",
      kDateB: "",
      liveNote: "历史:未拉取",
      histOn: false,
      histAt: 0,
      histT0: 0,
      liveNext: 0,
      liveBusy: false,
      liveLog: "",
      liveRound: 0,
      liveT0: 0,
      liveGap: 5e3,
      liveStartTs: 0,
      curBucket: 0,
      histBarMs: 0,
      lastPNum: 0,
      histSeries: null,
      histTag: "",
      histPending: false,
      histPts: 0,
      probeDone: 0,
      liveTried: 0,
      rawSnip: "",
      kStatus: "日K:点上方按钮加载",
      kStatusColor: "#6B7280",
      kLoaded: false,
      kLoading: false,
      vibrateOn: true,
      scheme: 0,
      intervalSec: 5,
      itvLabel: "5秒",
      showDebug: false,
      appVer: APP_VER,
      crownText: "未响应（试试旋转表冠）",
      crownAcc: 0,
      crownT: 0,
      crownLast: 0,
      drawT: 0,
      lastTick: 0,
      bgVib0: BG_ON,
      bgVib1: BG_OFF,
      bgSch0: BG_ON,
      bgSch1: BG_OFF,
      bgI0: BG_ON,
      bgI1: BG_OFF,
      bgI2: BG_OFF,
      bgI3: BG_OFF,
      bgDbg0: BG_OFF,
      bgDbg1: BG_ON
    };
  },
  onReady() {
    this.selfTest = "JSON:" + tOf(JSON) + " T:" + tOf(setTimeout) + " iV:" + tOf(setInterval) + " el:" + tOf(this.$element) + " vib:" + tOf(getVib()) + " sto:" + tOf(getSto());
    try {
      console.log("[btc] " + this.selfTest);
    } catch (e) {
    }
    this.visible = true;
    this.cfgLoad();
    this.applyView();
    this.applyStyles();
    this.applyColors();
    try {
      const cb = this.$element("crownbox");
      if (cb && typeof cb.requestFocus === "function") {
        cb.requestFocus(true);
        this.crownText = "已获焦，转一下试试";
      } else {
        this.crownText = "焦点接口不可用";
      }
    } catch (e) {
      this.crownText = "异常 " + msgOf(e);
    }
    this.smpLoad();
    try {
      if (this.samples && this.samples.length > 1) {
        this.liveNote = "历史:本地上次曲线 " + this.samples.length + "点，正在更新";
      }
    } catch (e0) {
    }
    this.liveNext = 0;
    try {
      this.loadLive();
    } catch (eL0) {
    }
    this.startTimer();
    this.refresh();
  },
  onShow() {
    this.visible = true;
    try {
      if (this.histOn && this.histAt > 0 && nowMs() - this.histAt > 6e5) {
        this.histOn = false;
        this.liveGap = 5e3;
        this.liveNext = 0;
      }
    } catch (e9) {
    }
    this.startTimer();
    this.refresh();
    if (this.isKline) this.drawKlineLater();
    this.crownFocus();
  },
  onHide() {
    this.visible = false;
    this.stopTimer();
  },
  onDestroy() {
    this.visible = false;
    this.stopTimer();
    try {
      if (this.drawT) {
        clearTimeout(this.drawT);
        this.drawT = 0;
      }
    } catch (e) {
    }
  },
  onKey() {
    this.tabStep(1);
  },
  tabStep(dir) {
    try {
      const nv = (this.view + dir + 3) % 3;
      if (nv === 0) this.tabRealtime();
      else if (nv === 1) this.tabKline();
      else this.tabSetting();
      this.crownFocus();
    } catch (e) {
    }
  },
  crownFocus() {
    try {
      const cb = this.$element("crownbox");
      if (cb && typeof cb.requestFocus === "function") cb.requestFocus(true);
    } catch (e) {
    }
  },
  buzz() {
    try {
      if (!this.vibrateOn) return;
      doVibrate();
    } catch (e) {
    }
  },
  loadLive() {
    if (this.liveBusy) return;
    this.liveBusy = true;
    this.liveRound = (this.liveRound || 0) + 1;
    this.rawSnip = "";
    this.liveLog = "R" + this.liveRound;
    this.liveStartTs = nowMs();
    this.liveTried = (this.liveTried || 0) + 1;
    const list = [];
    this.liveRound;
    list[list.length] = {
      tag: "Gate蜡烛",
      url: "http://" + HARD_IPS[0] + GATE_V2_KLINE,
      header: {
        Host: HOST
      },
      kind: 2
    };
    this.liveTry(0, list);
  },
  maybeLive() {
    try {
      if (this.histOn || this.histPending) return;
      if ((this.liveTried || 0) >= 2) return;
      if (this.liveBusy) {
        if (this.liveStartTs > 0 && nowMs() - this.liveStartTs < 15e3) return;
        this.liveBusy = false;
        this.liveLog = addLog(this.liveLog, "看门狗解锁");
        if (!this.histOn) this.liveNote = "历史:卡死重试 " + this.liveLog;
      }
      const nowT = nowMs();
      if (!this.liveNext || nowT >= this.liveNext) {
        this.liveNext = nowT + this.liveGap;
        const gp = Number(this.liveGap);
        if (!(gp > 0)) this.liveGap = 5e3;
        else this.liveGap = gp < 6e4 ? gp * 2 : 6e4;
        this.loadLive();
      }
    } catch (e) {
    }
  },
  liveTry(idx, list) {
    const self = this;
    if (!list || list.length === 0) {
      this.liveBusy = false;
      if (!this.histOn) this.liveNote = "历史:重试中 " + this.liveLog;
      return;
    }
    const total = list.length;
    let done = 0;
    let got = false;
    const after = function() {
      done++;
      if (done >= total && !got) {
        self.liveBusy = false;
        if (!self.histOn) self.liveNote = "历史:重试中 " + self.liveLog;
        self.rawSnip = ("历" + self.liveLog).slice(0, 60);
      }
    };
    let i = 0;
    for (i = 0; i < total; i++) {
      const a = list[i];
      let settled = false;
      let wd = 0;
      try {
        wd = setTimeout(function() {
          if (settled) return;
          settled = true;
          if (!got) self.liveLog = addLog(self.liveLog, a.tag + ":超时");
          after();
        }, HIST_TIMEOUT);
      } catch (e) {
        wd = 0;
      }
      const opts = {
        url: a.url,
        method: "GET"
      };
      if (a.header) opts.header = a.header;
      opts.success = function(res) {
        if (settled) return;
        settled = true;
        try {
          clearTimeout(wd);
        } catch (e) {
        }
        let k = null;
        try {
          k = a.kind === 6 ? parseBinKline(res) : a.kind === 7 ? parseOkxKline(res) : a.kind === 5 ? parseGateV4(res) : a.kind === 3 ? parseEmKline(res) : a.kind === 4 ? parseTencentMin(res) : a.kind === 2 ? parseGateV2(res) : a.kind === 0 ? parseGateLive(res) : parseCoinexLive(res);
        } catch (e) {
          k = null;
        }
        if (!k) {
          if (!got) {
            const sn = snipOf(res);
            self.liveLog = addLog(self.liveLog, a.tag + (sn === "Array" ? ":空Array" : ":解析") + "/" + txtLen(res));
            self.rawSnip = a.tag + " 包len" + txtLen(res) + " " + sn;
          }
          after();
          return;
        }
        if (!got) {
          got = true;
          self.seedLive(k, a.tag);
        }
        after();
      };
      opts.fail = function(_data, code) {
        if (settled) return;
        settled = true;
        try {
          clearTimeout(wd);
        } catch (e) {
        }
        if (!got) {
          self.liveLog = addLog(self.liveLog, a.tag + ":fail" + msgOf(code));
          self.liveNote = "历史:重试中 " + self.liveLog;
        }
        after();
      };
      try {
        fetch.fetch(opts);
      } catch (e) {
        if (!settled) {
          settled = true;
          after();
        }
      }
    }
  },
  seedLive(k, tag) {
    try {
      if (!k || !k.c || k.c.length < 2) return;
      this.histSeries = k;
      this.histTag = tag;
      this.liveBusy = false;
      this.applyHist();
    } catch (e) {
      this.liveBusy = false;
      this.liveNote = "历史:异常 " + msgOf(e);
    }
  },
  applyHist() {
    try {
      const k = this.histSeries;
      if (!k || !k.c) return;
      const n = k.c.length;
      if (n < 2) return;
      const start = n > SRC_BARS ? n - SRC_BARS : 0;
      const cur = Number(this.lastPNum);
      const ref = Number(k.c[n - 1]);
      if (!(cur > 0) || !(ref > 0)) {
        this.histPending = true;
        this.liveBusy = false;
        this.liveNote = "历史:已取到" + this.histTag + "，等行情锚定";
        return;
      }
      const sc = cur / ref;
      const out = [];
      let i = 0;
      for (i = start; i < n; i++) {
        out[out.length] = Number(k.o[i]) * sc;
        out[out.length] = Number(k.h[i]) * sc;
        out[out.length] = Number(k.l[i]) * sc;
        out[out.length] = Number(k.c[i]) * sc;
      }
      if (out.length < 8) return;
      const curP = out[out.length - 1];
      let stpH0 = BAR_MS;
      try {
        if (k.st && Number(k.st) > 0) stpH0 = Number(k.st);
      } catch (eHP) {
      }
      this.histPts = stpH0 >= 3e5 ? 4 : SAMPLE_PER;
      let qc = 0;
      for (qc = 0; qc < this.histPts; qc++) out[out.length] = curP;
      let stpH = BAR_MS;
      try {
        if (k.st && Number(k.st) > 0) stpH = Number(k.st);
      } catch (eH) {
      }
      this.histBarMs = stpH * (this.histPts / 4);
      this.curBucket = Math.floor(nowMs() / stpH);
      this.samples = out;
      this.histPending = false;
      this.histOn = true;
      this.rawSnip = "";
      this.histAt = nowMs();
      this.liveGap = 5e3;
      let stp = 6e4;
      try {
        if (k.st && Number(k.st) > 0) stp = Number(k.st);
      } catch (e3) {
      }
      this.histT0 = nowMs() - (n - start - 1) * stp;
      this.liveBusy = false;
      let lgT = "" + (this.liveLog || "");
      if (lgT.length > 2 && lgT.indexOf(":") > 0) lgT = " | " + lgT.substring(0, 64);
      else lgT = "";
      this.liveNote = "历史:ok " + this.histTag + " " + (n - start) + "根" + lgT;
      this.chartNote = this.liveNote;
      if (this.isRealtime) {
        try {
          if (typeof this.plotLine === "function") this.plotLine();
        } catch (e) {
        }
      }
    } catch (e2) {
      this.liveBusy = false;
      this.liveNote = "历史:异常 " + msgOf(e2);
    }
  },
  onCrown(ev) {
    try {
      let d = 0;
      const dir = ev && ev.direction !== void 0 ? ev.direction : null;
      if (dir === true) d = -1;
      else if (dir === false) d = 1;
      else {
        const raw = ev && ev.delta !== void 0 ? ev.delta : 0;
        d = Number(raw);
        if (d !== d) d = 0;
      }
      if (CROWN_INVERT) d = -d;
      let now = 0;
      try {
        now = Date.now();
      } catch (e) {
      }
      const NEED = 2;
      const GAP = 600;
      const IDLE = 700;
      let acc = Number(this.crownAcc);
      if (acc !== acc) acc = 0;
      if (now && this.crownT && now - this.crownT < GAP) {
        this.crownAcc = 0;
        this.crownLast = now;
        this.crownText = "冷却中…";
        return true;
      }
      if (now && this.crownLast && now - this.crownLast > IDLE) acc = 0;
      this.crownLast = now;
      if (d === 0) return true;
      acc = acc + d;
      this.crownAcc = acc;
      this.crownText = d > 0 ? "下一个视图 ›" : "‹ 上一个";
      if (acc >= NEED) {
        this.crownAcc = 0;
        this.crownT = now;
        this.tabStep(1);
        this.buzz();
      } else if (acc <= -NEED) {
        this.crownAcc = 0;
        this.crownT = now;
        this.tabStep(-1);
        this.buzz();
      }
      return true;
    } catch (e) {
      try {
        this.crownText = "异常 " + msgOf(e);
      } catch (e2) {
      }
      return true;
    }
  },
  cfgLoad() {
    const s = getSto();
    if (!s || typeof s.getSync !== "function") return;
    try {
      const v = s.getSync({
        key: CFG_KEY
      });
      if (v && typeof v === "object") {
        if (v.vibrate === false) this.vibrateOn = false;
        if (v.vibrate === true) this.vibrateOn = true;
        if (v.scheme === 1) this.scheme = 1;
        if (v.scheme === 0) this.scheme = 0;
        if (v.interval === 30) this.intervalSec = 30;
        if (v.interval === 60) this.intervalSec = 60;
        if (v.interval === 15) this.intervalSec = 15;
        if (v.interval === 5) this.intervalSec = 5;
        if (v.debug === false) this.showDebug = false;
        if (v.debug === true) this.showDebug = true;
      }
    } catch (e) {
    }
  },
  cfgSave() {
    const s = getSto();
    if (!s || typeof s.set !== "function") return;
    try {
      s.set({
        key: CFG_KEY,
        value: {
          vibrate: this.vibrateOn,
          scheme: this.scheme,
          interval: this.intervalSec,
          debug: this.showDebug
        }
      });
    } catch (e) {
    }
  },
  smpLoad() {
    const s = getSto();
    if (!s || typeof s.getSync !== "function") return;
    try {
      const v = s.getSync({
        key: SMP_KEY
      });
      const list = v && v.list ? v.list : null;
      if (!list || !list.length) return;
      const out = [];
      let i = 0;
      for (i = 0; i < list.length; i++) {
        const x = Number(list[i]);
        if (x === x && x > 0) out[out.length] = x;
      }
      if (out.length > 1) this.samples = out;
    } catch (e) {
    }
  },
  setVibOn() {
    this.vibrateOn = true;
    this.cfgSave();
    this.applyStyles();
  },
  setVibOff() {
    this.vibrateOn = false;
    this.cfgSave();
    this.applyStyles();
  },
  setScheme0() {
    this.scheme = 0;
    this.cfgSave();
    this.applyStyles();
    this.applyColors();
  },
  setScheme1() {
    this.scheme = 1;
    this.cfgSave();
    this.applyStyles();
    this.applyColors();
  },
  setItvPrev() {
    const i = itvIndex(this.intervalSec);
    this.setIntervalTo(ITV_STEPS[(i + ITV_STEPS.length - 1) % ITV_STEPS.length]);
  },
  setItvNext() {
    const i = itvIndex(this.intervalSec);
    this.setIntervalTo(ITV_STEPS[(i + 1) % ITV_STEPS.length]);
  },
  setItv5() {
    this.setIntervalTo(5);
  },
  setItv15() {
    this.setIntervalTo(15);
  },
  setItv30() {
    this.setIntervalTo(30);
  },
  setItv60() {
    this.setIntervalTo(60);
  },
  setIntervalTo(v) {
    this.intervalSec = v;
    this.cfgSave();
    this.applyStyles();
    this.stopTimer();
    this.startTimer();
  },
  setDbgOn() {
    this.showDebug = true;
    this.cfgSave();
    this.applyStyles();
  },
  setDbgOff() {
    this.showDebug = false;
    this.cfgSave();
    this.applyStyles();
  },
  restoreDefaults() {
    this.vibrateOn = true;
    this.scheme = 0;
    this.showDebug = false;
    this.cfgSave();
    this.applyStyles();
    this.applyColors();
    this.setIntervalTo(5);
  },
  applyView() {
    const v = this.view;
    this.isRealtime = v === 0;
    this.isKline = v === 1;
    this.isSetting = v === 2;
  },
  applyStyles() {
    const v = this.view;
    this.bgTab0 = v === 0 ? BG_ON : BG_OFF;
    this.bgTab1 = v === 1 ? BG_ON : BG_OFF;
    this.bgTab2 = v === 2 ? BG_ON : BG_OFF;
    this.bgVib0 = this.vibrateOn ? BG_ON : BG_OFF;
    this.bgVib1 = this.vibrateOn ? BG_OFF : BG_ON;
    this.bgSch0 = this.scheme === 0 ? BG_ON : BG_OFF;
    this.bgSch1 = this.scheme === 1 ? BG_ON : BG_OFF;
    this.bgI0 = this.intervalSec === 5 ? BG_ON : BG_OFF;
    this.bgI1 = this.intervalSec === 15 ? BG_ON : BG_OFF;
    this.bgI2 = this.intervalSec === 30 ? BG_ON : BG_OFF;
    this.bgI3 = this.intervalSec === 60 ? BG_ON : BG_OFF;
    this.itvLabel = this.intervalSec + "秒";
    this.bgDbg0 = this.showDebug ? BG_ON : BG_OFF;
    this.bgDbg1 = this.showDebug ? BG_OFF : BG_ON;
  },
  applyColors() {
    this.priceColor = upColor(this, this.lastPct >= 0);
    this.kLastColor = upColor(this, this.kChgVal >= 0);
  },
  tabRealtime() {
    this.view = 0;
    this.applyView();
    this.applyStyles();
    this.refresh();
    this.drawLater(0, 200);
  },
  tabKline() {
    this.view = 1;
    this.applyView();
    this.applyStyles();
    if (this.kLoaded) this.drawLater(1, 200);
    else this.loadKline();
  },
  tabSetting() {
    this.view = 2;
    this.applyView();
    this.applyStyles();
  },
  drawLater(which, ms) {
    const self = this;
    try {
      if (this.drawT) {
        clearTimeout(this.drawT);
        this.drawT = 0;
      }
      this.drawT = setTimeout(function() {
        self.drawT = 0;
        try {
          if (which === 0) {
            if (typeof self.plotLine === "function") self.plotLine();
          } else {
            if (typeof self.plotKline === "function") self.plotKline();
          }
        } catch (e) {
        }
      }, ms || 60);
    } catch (e) {
    }
  },
  drawKlineLater() {
    this.drawLater(1, 200);
  },
  startTimer() {
    if (this.timerId) return;
    const self = this;
    let ms = 15e3;
    try {
      ms = this.intervalSec * 1e3;
    } catch (e) {
    }
    try {
      if (typeof setInterval !== "function") return;
      this.lastTick = nowMs();
      self.firstTickAt = nowMs() + 2500;
      this.timerId = setInterval(function() {
        try {
          self.maybeLive();
        } catch (e1) {
        }
        const nw = nowMs();
        if (self.firstTickAt && nw < self.firstTickAt) return;
        const gap = nw - self.lastTick;
        if (gap >= ms || gap < 0) {
          self.lastTick = nw;
          self.refresh();
        }
      }, 1e3);
    } catch (e) {
      this.timerId = 0;
    }
  },
  stopTimer() {
    if (this.timerId) {
      try {
        clearInterval(this.timerId);
      } catch (e) {
      }
      this.timerId = 0;
    }
  },
  refresh() {
    const now = nowMs();
    if (this.firstTickAt && now && now < this.firstTickAt) return;
    if (this.busy) {
      if (now && now - this.busyAt < 2e4) return;
    }
    this.busy = true;
    this.busyAt = now;
    this.journal = [];
    if (!this.hasData) {
      this.statusText = "正在获取行情…";
      this.statusColor = "#6B7280";
    }
    this.trySource(0);
  },
  trySource(i) {
    const self = this;
    const list = buildAttempts();
    if (i >= list.length) {
      self.busy = false;
      self.statusText = "失败 " + joinArr(self.journal, " ");
      self.statusColor = "#FF4D4F";
      return;
    }
    const a = list[i];
    self.statusText = "尝试 " + (i + 1) + "/" + list.length + " " + a.tag + " …";
    let settled = false;
    let watchdog = 0;
    try {
      watchdog = setTimeout(function() {
        if (settled) return;
        settled = true;
        self.journal[self.journal.length] = a.tag + ":超时";
        self.trySource(i + 1);
      }, REQ_TIMEOUT);
    } catch (e) {
      watchdog = 0;
    }
    const opts = {
      url: a.url,
      method: "GET"
    };
    if (a.header) opts.header = a.header;
    opts.success = function(res) {
      if (settled) return;
      settled = true;
      try {
        clearTimeout(watchdog);
      } catch (e) {
      }
      let t = null;
      try {
        t = pickTicker(res);
      } catch (e) {
        t = null;
      }
      if (!t) {
        self.journal[self.journal.length] = a.tag + ":解析";
        self.rawSnip = a.tag + "回包 " + snipOf(res);
        self.trySource(i + 1);
        return;
      }
      let step = 0;
      try {
        step = 1;
        self.sourceName = a.tag;
        step = 2;
        const up = t.pct >= 0;
        step = 3;
        self.price = "$" + fixed2(t.last);
        step = 4;
        self.changePct = (up ? "+" : "") + fixed2(t.pct) + "%";
        step = 5;
        self.lastPct = t.pct;
        self.lastPNum = Number(t.last);
        if (self.histPending) {
          self.histPending = false;
          self.applyHist();
        }
        self.priceColor = upColor(self, up);
        step = 6;
        const denom = 1 + t.pct / 100;
        if (denom > 0.01) self.basePrice = t.last / denom;
        step = 7;
        self.high = fixed2(t.high);
        step = 8;
        self.low = fixed2(t.low);
        step = 9;
        self.volume = fmtVol(t.vol);
        step = 10;
        self.updatedAt = clockText();
        step = 11;
        self.hasData = true;
        step = 12;
        const old = self.samples ? self.samples : [];
        const noHist = !(self.histBarMs > 0);
        const barMs = noHist ? 15e4 : self.histBarMs;
        const PT = noHist ? 30 : self.histPts > 0 ? self.histPts : SAMPLE_PER;
        const bkt = Math.floor(nowMs() / barMs);
        const out = [];
        let j = 0;
        for (j = 0; j < old.length; j++) out[j] = old[j];
        if (self.curBucket !== bkt) {
          self.curBucket = bkt;
          const keep = SLOT_K * PT;
          while (out.length > keep) out.shift();
          let qn = 0;
          for (qn = 0; qn < PT; qn++) out[out.length] = t.last;
        } else {
          const m = out.length;
          if (m >= PT) {
            let hh = out[m - PT + 1];
            let ll = out[m - PT + 2];
            if (t.last > hh) hh = t.last;
            if (t.last < ll) ll = t.last;
            out[m - PT + 1] = hh;
            out[m - PT + 2] = ll;
            out[m - 1] = t.last;
          } else {
            out[out.length] = t.last;
          }
        }
        self.samples = out;
        if (Math.floor(out.length / PT) > Math.floor(old.length / PT)) {
          try {
            const st = getSto();
            if (st && typeof st.set === "function") {
              st.set({
                key: SMP_KEY,
                value: {
                  list: out
                }
              });
            }
          } catch (e3) {
          }
        }
        self.maybeLive();
        step = 13;
        if (self.isRealtime) {
          try {
            if (typeof self.plotLine === "function") self.plotLine();
          } catch (e2) {
            self.chartNote = "图:@" + msgOf(e2);
          }
        }
        step = 14;
        let tail = "";
        const band = t.pct >= 5 ? 1 : t.pct <= -5 ? -1 : 0;
        if (!self.pctReady) {
          self.pctReady = true;
          self.pctBand = band;
        } else if (band !== self.pctBand) {
          self.pctBand = band;
          if (band !== 0) {
            if (self.vibrateOn && self.visible) {
              if (doVibrate()) tail = " · 已振动提醒";
            } else if (!self.vibrateOn) {
              tail = " · 提醒(未开振动)";
            }
          }
        }
        step = 15;
        self.statusText = "OK · " + self.updatedAt + " · " + self.intervalSec + "秒自动刷新" + tail + " · " + (self.histOn ? "历√" : "历" + String(self.liveLog || "-").slice(0, 16));
        try {
          if (self.liveBusy && self.liveStartTs > 0 && nowMs() - self.liveStartTs > HIST_TIMEOUT + 2e3) {
            self.liveBusy = false;
            self.liveLog = addLog(self.liveLog, "看门狗");
            if (!self.histOn) self.liveNote = "历史:卡死重试 " + self.liveLog;
          }
        } catch (eW) {
        }
        self.statusColor = "#00C853";
      } catch (e) {
        self.statusText = "更新异常@" + step + " " + msgOf(e);
        self.statusColor = "#FF4D4F";
      }
      self.busy = false;
    };
    opts.fail = function(_data, code) {
      if (settled) return;
      settled = true;
      try {
        clearTimeout(watchdog);
      } catch (e) {
      }
      self.journal[self.journal.length] = a.tag + ":" + msgOf(code);
      self.trySource(i + 1);
    };
    try {
      fetch.fetch(opts);
    } catch (e) {
      if (settled) return;
      settled = true;
      try {
        clearTimeout(watchdog);
      } catch (e2) {
      }
      self.journal[self.journal.length] = a.tag + ":发起异常";
      self.trySource(i + 1);
    }
  },
  plotLine() {
    const data = this.samples;
    const base = this.basePrice;
    const n = data ? data.length : 0;
    let el = null;
    try {
      el = this.$element("chartR");
    } catch (e) {
      this.chartNote = "图:无$element";
      return;
    }
    if (!el) {
      this.chartNote = "图:元素为空";
      return;
    }
    let ctx = null;
    try {
      if (typeof el.getContext !== "function") {
        this.chartNote = "图:无getContext";
        return;
      }
      ctx = el.getContext("2d");
    } catch (e) {
      this.chartNote = "图:getContext异常";
      return;
    }
    if (!ctx) {
      this.chartNote = "图:ctx为空";
      return;
    }
    try {
      ctx.clearRect(0, 0, RW, RH);
    } catch (e) {
    }
    let PER = SAMPLE_PER;
    try {
      PER = this.histPts > 0 ? this.histPts : 12;
    } catch (eP0) {
      PER = SAMPLE_PER;
    }
    const bars = Math.floor(n / PER);
    if (bars < 1 || !base || base <= 0) {
      this.chartNote = "图:采样中 " + n + "/" + PER;
      this.chartInfo = base > 0 ? "采样中 " + n + "点" : "等待行情";
      return;
    }
    try {
      const padX = 14;
      const padL = 46;
      const padY = 10;
      const cnt = bars < SLOT_K ? bars : SLOT_K;
      const slots = cnt < SLOT_K ? cnt : SLOT_K;
      const gapN = slots - cnt;
      const kO = [];
      const kC = [];
      const kH = [];
      const kL = [];
      let i = 0;
      let j = 0;
      for (i = 0; i < slots; i++) {
        if (i < gapN) {
          kO[i] = NaN;
          kC[i] = NaN;
          kH[i] = NaN;
          kL[i] = NaN;
          continue;
        }
        const s = (bars - cnt + (i - gapN)) * PER;
        const oo = data[s];
        const cc = data[s + PER - 1];
        let hh = data[s];
        let ll = data[s];
        for (j = 0; j < PER; j++) {
          const v = data[s + j];
          if (v > hh) hh = v;
          if (v < ll) ll = v;
        }
        kO[i] = oo;
        kC[i] = cc;
        kH[i] = hh;
        kL[i] = ll;
      }
      let hiK = kH[gapN];
      let loK = kL[gapN];
      for (i = gapN + 1; i < slots; i++) {
        if (kH[i] > hiK) hiK = kH[i];
        if (kL[i] < loK) loK = kL[i];
      }
      let hi = hiK;
      let lo = loK;
      if (base > hi) hi = base;
      if (base < lo) lo = base;
      let span = hi - lo;
      if (span <= 0) span = hi * 8e-4 || 1;
      const mid = (hi + lo) / 2;
      const yTop = mid + span * 0.58;
      const yBot = mid - span * 0.58;
      const innerH = RH - LABEL_H - padY * 2;
      const yOf = function(v) {
        return padY + (yTop - v) / (yTop - yBot) * innerH;
      };
      const cw = (RW - padL - padX) / slots;
      let bw = cw * 0.62;
      if (bw < 2) bw = 2;
      if (bw > 18) bw = 18;
      const y0 = yOf(base);
      if (y0 >= padY && y0 <= RH - padY) {
        ctx.fillStyle = "#4B5563";
        ctx.fillRect(padL, y0, RW - padL - padX, 1);
      }
      try {
        const axisPrice = function(v) {
          let s = fixed2(v);
          const kk = s.indexOf(".");
          if (kk > 0) s = s.substring(0, kk);
          return s;
        };
        ctx.font = "11px";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        const tickL = [hi, mid, lo, base];
        const tickC = ["#9CA3AF", "#6B7280", "#9CA3AF", "#E5E7EB"];
        let prevY = -99;
        let qi = 0;
        for (qi = 0; qi < 4; qi++) {
          const yy = yOf(tickL[qi]);
          if (yy < padY + 7) continue;
          if (yy > RH - LABEL_H - 4) continue;
          if (yy - prevY < 9) continue;
          ctx.fillStyle = tickC[qi];
          ctx.fillText(axisPrice(tickL[qi]), 4, yy);
          prevY = yy;
        }
      } catch (eT) {
      }
      for (i = gapN; i < slots; i++) {
        const x = padL + i * cw + (cw - bw) / 2;
        const yHh = yOf(kH[i]);
        const yLl = yOf(kL[i]);
        const yOo = yOf(kO[i]);
        const yCc = yOf(kC[i]);
        ctx.fillStyle = upColor(this, kC[i] >= kO[i]);
        let wickH = yLl - yHh;
        if (wickH < 2) wickH = 2;
        ctx.fillRect(x + bw / 2 - 0.5, yHh, 1, wickH);
        let top = yOo;
        let bot = yCc;
        if (top > bot) {
          const tmp = top;
          top = bot;
          bot = tmp;
        }
        let bh = bot - top;
        if (bh < 2) bh = 2;
        ctx.fillRect(x, top, bw, bh);
      }
      if (cnt >= 7) {
        ctx.strokeStyle = COLOR_MA;
        ctx.lineWidth = 2;
        ctx.beginPath();
        let first = true;
        for (i = gapN + 6; i < slots; i++) {
          let sum = 0;
          let k = 0;
          for (k = i - 6; k <= i; k++) sum += kC[k];
          const avg = sum / 7;
          const x = padL + i * cw + cw / 2;
          const y = yOf(avg);
          if (first) {
            ctx.moveTo(x, y);
            first = false;
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }
      const endMs = nowMs();
      let barMs = 15e4;
      try {
        if (this.histBarMs > 0) barMs = this.histBarMs;
        else if (this.histSeries && Number(this.histSeries.st) > 0) barMs = Number(this.histSeries.st);
      } catch (eS1) {
      }
      const spanMs = cnt * barMs;
      const startMs = endMs - spanMs;
      const tA = hhmm(startMs);
      const tM = hhmm((startMs + endMs) / 2);
      const tB = hhmm(endMs);
      ctx.fillStyle = "#1F2937";
      ctx.fillRect(padL + 1, padY, 1, RH - LABEL_H - padY * 2);
      ctx.fillRect((padL + RW - padX) / 2, padY, 1, RH - LABEL_H - padY * 2);
      ctx.fillRect(RW - padX - 2, padY, 1, RH - LABEL_H - padY * 2);
      ctx.fillStyle = "#6B7280";
      ctx.font = "16px";
      ctx.textAlign = "left";
      ctx.fillText(tA, padL, RH - 5);
      ctx.textAlign = "center";
      ctx.fillText(tM, (padL + RW - padX) / 2, RH - 5);
      ctx.textAlign = "right";
      ctx.fillText(tB, RW - padX, RH - 5);
      const lastP = kC[slots - 1];
      this.chartInfo = "24h前 " + signedPct((lastP - base) / base * 100) + " 高 " + signedPct((hiK - base) / base * 100) + " 低 " + signedPct((loK - base) / base * 100);
      this.chartNote = (this.histOn ? "图:ok " : "积累中 ") + cnt + "/48 基准" + fixed2(base);
    } catch (e) {
      this.chartNote = "图:绘制异常 " + msgOf(e);
    }
  },
  loadKline() {
    if (this.kLoading) return;
    this.kLoading = true;
    this.kStatus = "日K:加载中…";
    this.kStatusColor = "#9CA3AF";
    const self = this;
    let settled = false;
    let wd = 0;
    try {
      wd = setTimeout(function() {
        if (settled) return;
        settled = true;
        self.kLoading = false;
        self.kStatus = "日K:超时";
        self.kStatusColor = "#FF4D4F";
      }, REQ_TIMEOUT_K);
    } catch (e) {
      wd = 0;
    }
    const opts = {
      url: KLINE_URL,
      method: "GET",
      header: UA_H
    };
    opts.success = function(res) {
      if (settled) return;
      settled = true;
      try {
        clearTimeout(wd);
      } catch (e) {
      }
      self.kLoading = false;
      let step = 0;
      try {
        step = 1;
        let arr = null;
        try {
          arr = pickKline(res);
        } catch (ePK) {
        }
        if (!arr) {
          try {
            arr = pickEmDay(res);
          } catch (ePD) {
          }
        }
        if (!arr) {
          self.kStatus = "日K:解析失败";
          self.kStatusColor = "#FF4D4F";
          return;
        }
        step = 2;
        const n = arr.length;
        const start = n > KLINE_N ? n - KLINE_N : 0;
        const o = [];
        const c = [];
        const h = [];
        const l = [];
        let i = 0;
        for (i = start; i < n; i++) {
          const row = arr[i];
          o[o.length] = safeNum(row[1]);
          c[c.length] = safeNum(row[2]);
          h[h.length] = safeNum(row[3]);
          l[l.length] = safeNum(row[4]);
        }
        step = 3;
        self.kO = o;
        self.kC = c;
        self.kH = h;
        self.kL = l;
        self.kCount = c.length;
        step = 4;
        self.kRange = "区间 " + ("" + arr[start][0]) + " ~ " + ("" + arr[n - 1][0]);
        self.kDateA = mmdd(arr[start][0]);
        self.kDateM = mmdd(arr[start + Math.floor((n - 1 - start) / 2)][0]);
        self.kDateB = mmdd(arr[n - 1][0]);
        step = 5;
        let hh = h[0];
        let ll = l[0];
        for (i = 1; i < h.length; i++) {
          if (h[i] > hh) hh = h[i];
          if (l[i] < ll) ll = l[i];
        }
        self.kHi = fixed2(hh);
        self.kLo = fixed2(ll);
        step = 6;
        const ma = c.length >= 7 ? 7 : c.length;
        let sum = 0;
        for (i = c.length - ma; i < c.length; i++) sum += c[i];
        const ma7 = ma > 0 ? sum / ma : 0;
        self.kMa7 = fixed2(ma7);
        step = 7;
        const last = c[c.length - 1];
        const prev = c.length > 1 ? c[c.length - 2] : last;
        const chg = prev > 0 ? (last - prev) / prev * 100 : 0;
        self.kChgVal = chg;
        self.kLast = fixed2(last);
        self.kChg = (chg >= 0 ? "+" : "") + fixed2(chg) + "%";
        self.kLastColor = upColor(self, chg >= 0);
        step = 8;
        self.kLoaded = true;
        self.kStatus = "已加载 · 港股收盘价";
        self.kStatusColor = "#6B7280";
        step = 9;
        if (self.isKline) {
          try {
            if (typeof self.plotKline === "function") self.plotKline();
          } catch (e2) {
            self.kStatus = "日K:绘制@" + msgOf(e2);
          }
        }
      } catch (e) {
        self.kStatus = "日K:异常@" + step + " " + msgOf(e);
        self.kStatusColor = "#FF4D4F";
      }
    };
    opts.fail = function(_data, code) {
      if (settled) return;
      settled = true;
      try {
        clearTimeout(wd);
      } catch (e) {
      }
      self.kLoading = false;
      self.kStatus = "日K:失败 code=" + msgOf(code);
      self.kStatusColor = "#FF4D4F";
    };
    try {
      fetch.fetch(opts);
    } catch (e) {
      if (settled) return;
      settled = true;
      try {
        clearTimeout(wd);
      } catch (e2) {
      }
      self.kLoading = false;
      self.kStatus = "日K:发起异常 " + msgOf(e);
      self.kStatusColor = "#FF4D4F";
    }
  },
  plotKline() {
    const o = this.kO;
    const c = this.kC;
    const h = this.kH;
    const l = this.kL;
    const n = c ? c.length : 0;
    if (n < 2) {
      this.kStatus = "日K:数据不足";
      return;
    }
    let el = null;
    try {
      el = this.$element("chartK");
    } catch (e) {
      this.kStatus = "日K:无$element";
      return;
    }
    if (!el) {
      this.kStatus = "日K:元素为空";
      return;
    }
    let ctx = null;
    try {
      if (typeof el.getContext !== "function") {
        this.kStatus = "日K:无getContext";
        return;
      }
      ctx = el.getContext("2d");
    } catch (e) {
      this.kStatus = "日K:getContext异常";
      return;
    }
    if (!ctx) {
      this.kStatus = "日K:ctx为空";
      return;
    }
    try {
      const padX = 6;
      const padL = 46;
      const padY = 10;
      ctx.clearRect(0, 0, KW, KH);
      let hi = h[0];
      let lo = l[0];
      let i;
      for (i = 1; i < n; i++) {
        if (h[i] > hi) hi = h[i];
        if (l[i] < lo) lo = l[i];
      }
      let span = hi - lo;
      if (span <= 0) span = hi * 1e-3 || 1;
      const innerH = KH - LABEL_H - padY * 2;
      const cw = (KW - padL - padX) / n;
      let bw = cw * 0.66;
      if (bw < 2) bw = 2;
      const yOf = function(v) {
        return padY + (hi - v) / span * innerH;
      };
      try {
        const axisPrice = function(v) {
          let s = fixed2(v);
          const kk = s.indexOf(".");
          if (kk > 0) s = s.substring(0, kk);
          return s;
        };
        ctx.font = "11px";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        const midD = (hi + lo) / 2;
        const tickL = [hi, midD, lo, c[n - 1]];
        const tickC = ["#9CA3AF", "#6B7280", "#9CA3AF", "#E5E7EB"];
        let prevY = -99;
        let qi = 0;
        for (qi = 0; qi < 4; qi++) {
          const yy = yOf(tickL[qi]);
          if (yy < padY + 7) continue;
          if (yy > KH - LABEL_H - 4) continue;
          if (yy - prevY < 9) continue;
          ctx.fillStyle = tickC[qi];
          ctx.fillText(axisPrice(tickL[qi]), 4, yy);
          prevY = yy;
        }
      } catch (eT) {
      }
      for (i = 0; i < n; i++) {
        const x = padL + cw * i + (cw - bw) / 2;
        const yH = yOf(h[i]);
        const yL = yOf(l[i]);
        const yO = yOf(o[i]);
        const yC = yOf(c[i]);
        const isUp = c[i] >= o[i];
        ctx.fillStyle = upColor(this, isUp);
        let wickH = yL - yH;
        if (wickH < 2) wickH = 2;
        ctx.fillRect(x + bw / 2 - 0.5, yH, 1, wickH);
        let top = yO;
        let bot = yC;
        if (top > bot) {
          const tmp = top;
          top = bot;
          bot = tmp;
        }
        let bh = bot - top;
        if (bh < 2) bh = 2;
        ctx.fillRect(x, top, bw, bh);
      }
      if (n >= 7) {
        ctx.strokeStyle = COLOR_MA;
        ctx.lineWidth = 2;
        ctx.beginPath();
        let first = true;
        for (i = 6; i < n; i++) {
          let sum = 0;
          let k = 0;
          for (k = i - 6; k <= i; k++) sum += c[k];
          const avg = sum / 7;
          const x = padL + cw * i + cw / 2;
          const y = yOf(avg);
          if (first) {
            ctx.moveTo(x, y);
            first = false;
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }
      ctx.fillStyle = "#1F2937";
      ctx.fillRect(padL + 1, padY, 1, KH - LABEL_H - padY * 2);
      ctx.fillRect((padL + KW - padX) / 2, padY, 1, KH - LABEL_H - padY * 2);
      ctx.fillRect(KW - padX - 2, padY, 1, KH - LABEL_H - padY * 2);
      const dA = this.kDateA ? this.kDateA : "";
      const dM = this.kDateM ? this.kDateM : "";
      const dB = this.kDateB ? this.kDateB : "";
      ctx.fillStyle = "#6B7280";
      ctx.font = "16px";
      ctx.textAlign = "left";
      ctx.fillText(dA, padL, KH - 5);
      ctx.textAlign = "center";
      ctx.fillText(dM, (padL + KW - padX) / 2, KH - 5);
      ctx.textAlign = "right";
      ctx.fillText(dB, KW - padX, KH - 5);
      this.kStatus = "日K:ok " + n + "根";
      this.kStatusColor = "#6B7280";
    } catch (e) {
      this.kStatus = "日K:绘制异常 " + msgOf(e);
      this.kStatusColor = "#FF4D4F";
    }
  }
};
$app_define$("@app-component/index", [], function($app_require$2, $app_exports$, $app_module$) {
  $app_module$.exports = $app_script$1552441465.default || $app_script$1552441465;
  $app_module$.exports.style = $app_style$1552441465;
});
$app_bootstrap$("@app-component/index");
//# debugId=66568b0e-23d9-49db-88d3-96906b02c685
//# sourceMappingURL=index.js.map
