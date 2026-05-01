---
title: 音频/视频处理
description: 浏览器端和服务器端音视频处理库完全指南，包括播放、流媒体、实时通信和媒体处理工具
---

# 音频/视频处理

浏览器端和服务器端的音视频处理库，包括播放、流媒体、实时通信和媒体处理工具。

## 🧪 关联代码实验室

> 暂无直接关联的代码实验室模块。相关实时通信内容见 `30-real-time-communication`。

---

## 音频播放

### howler.js

| 属性 | 详情 |
|------|------|
| **Stars** | 22.8k+ ⭐ |
| **NPM** | `howler` |
| **TS支持** | ✅ `@types/howler` |
| **GitHub** | [goldfire/howler.js](https://github.com/goldfire/howler.js) |
| **官网** | [howlerjs.com](https://howlerjs.com) |

现代 Web 音频库，默认使用 Web Audio API，自动降级到 HTML5 Audio。

**代码示例：**

```javascript
import { Howl, Howler } from 'howler';

// 基本播放
const sound = new Howl({
  src: ['audio.mp3', 'audio.webm'],
  volume: 0.5,
  loop: true,
  onend: () => console.log('播放完成！')
});

sound.play();

// 空间音频
const spatialSound = new Howl({
  src: ['sound.mp3'],
  stereo: -1,  // 左声道
});

// 控制播放
const id = sound.play();
sound.pause(id);
sound.stop(id);
sound.fade(1, 0, 1000, id);  // 1秒内淡出
```

**适用场景：** 游戏音效、音乐播放器、音频通知、空间音频应用

---

### tone.js

| 属性 | 详情 |
|------|------|
| **Stars** | 14.7k+ ⭐ |
| **NPM** | `tone` |
| **TS支持** | ✅ 原生TypeScript |
| **GitHub** | [Tonejs/Tone.js](https://github.com/Tonejs/Tone.js) |
| **官网** | [tonejs.github.io](https://tonejs.github.io) |

Web Audio 框架，用于在浏览器中创建交互式音乐。

**代码示例：**

```javascript
import * as Tone from 'tone';

// 创建合成器
const synth = new Tone.Synth().toDestination();

// 播放音符
synth.triggerAttackRelease("C4", "8n");
synth.triggerAttackRelease("E4", "8n", "+0.1");
synth.triggerAttackRelease("G4", "8n", "+0.2");

// FM合成器
const fmSynth = new Tone.FMSynth().toDestination();
fmSynth.triggerAttackRelease("C2", "4n");

// 采样器
const sampler = new Tone.Sampler({
  urls: {
    C4: "C4.mp3",
    "D#4": "Ds4.mp3",
  },
  baseUrl: "https://tonejs.github.io/audio/salamander/",
}).toDestination();

Tone.loaded().then(() => {
  sampler.triggerAttackRelease(["Eb4", "G4", "Bb4"], 4);
});

// 效果器
const distortion = new Tone.Distortion(0.4).toDestination();
const reverb = new Tone.Reverb(2).toDestination();

// 音序器
const seq = new Tone.Sequence((time, note) => {
  synth.triggerAttackRelease(note, 0.1, time);
}, ["C4", "E4", "G4", "B4"], "4n").start(0);

Tone.Transport.start();
```

**适用场景：** 音乐制作、音频合成器、节拍器、音序器、音频可视化

---

### wavesurfer.js

| 属性 | 详情 |
|------|------|
| **Stars** | 8k+ ⭐ |
| **NPM** | `wavesurfer.js` |
| **TS支持** | ✅ 原生TypeScript |
| **GitHub** | [katspaugh/wavesurfer.js](https://github.com/katspaugh/wavesurfer.js) |
| **官网** | [wavesurfer-js.org](https://wavesurfer-js.org) |

可自定义的音频波形可视化库，基于 Web Audio API 和 HTML5 Canvas。

**代码示例：**

```javascript
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.js';
import TimelinePlugin from 'wavesurfer.js/dist/plugins/timeline.js';

// 创建波形
const wavesurfer = WaveSurfer.create({
  container: '#waveform',
  waveColor: '#4F4A85',
  progressColor: '#383351',
  url: '/audio.mp3',
  height: 100,
  barWidth: 3,
  barGap: 1,
  responsive: true,
});

// 播放控制
wavesurfer.on('ready', () => {
  wavesurfer.play();
});

// 区域插件
const wsRegions = wavesurfer.registerPlugin(RegionsPlugin.create());

wavesurfer.on('ready', () => {
  // 添加标记区域
  wsRegions.addRegion({
    start: 10,
    end: 20,
    content: '重点段落',
    color: 'rgba(255, 0, 0, 0.3)',
  });
});

// 事件监听
wavesurfer.on('click', () => {
  wavesurfer.playPause();
});

// 销毁
wavesurfer.destroy();
```

**适用场景：** 音频编辑器、播客播放器、语音识别可视化、音乐制作工具

---

### plyr

| 属性 | 详情 |
|------|------|
| **Stars** | 29.6k+ ⭐ |
| **NPM** | `plyr` |
| **TS支持** | ✅ `@types/plyr` |
| **GitHub** | [sampotts/plyr](https://github.com/sampotts/plyr) |
| **官网** | [plyr.io](https://plyr.io) |

简单、轻量、可访问的 HTML5、YouTube 和 Vimeo 媒体播放器。

**代码示例：**

```javascript
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';

// 视频播放器
const player = new Plyr('#player', {
  controls: [
    'play-large', 'play', 'progress', 'current-time',
    'mute', 'volume', 'captions', 'settings', 'pip',
    'airplay', 'fullscreen'
  ],
  settings: ['captions', 'quality', 'speed', 'loop'],
  speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
});

// 音频播放器
const audioPlayer = new Plyr('#audio-player', {
  controls: ['play', 'progress', 'current-time', 'mute', 'volume'],
});

// API调用
player.play();
player.pause();
player.stop();
player.fullscreen.enter();
player.speed = 1.5;

// 事件
player.on('ready', event => {
  console.log('播放器就绪');
});

player.on('ended', event => {
  console.log('播放结束');
});
```

**适用场景：** 视频网站、播客平台、在线教育、媒体展示

---

## 视频播放

### video.js

| 属性 | 详情 |
|------|------|
| **Stars** | 38.5k+ ⭐ |
| **NPM** | `video.js` |
| **TS支持** | ✅ `@types/video.js` |
| **GitHub** | [videojs/video.js](https://github.com/videojs/video.js) |
| **官网** | [videojs.com](https://videojs.com) |

功能齐全的 HTML5 视频播放器，支持 HLS 和 DASH 流媒体。

**代码示例：**

```javascript
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

// 初始化播放器
const player = videojs('my-video', {
  controls: true,
  autoplay: false,
  preload: 'auto',
  fluid: true,
  responsive: true,
  playbackRates: [0.5, 1, 1.5, 2],
  controlBar: {
    skipButtons: {
      forward: 10,
      backward: 10
    }
  }
});

// 播放HLS
player.src({
  src: 'https://example.com/stream.m3u8',
  type: 'application/x-mpegURL'
});

// 播放DASH
player.src({
  src: 'https://example.com/stream.mpd',
  type: 'application/dash+xml'
});

// 事件监听
player.ready(function() {
  console.log('播放器就绪');
});

player.on('play', () => console.log('开始播放'));
player.on('pause', () => console.log('暂停'));

// React集成
import { useEffect, useRef } from 'react';

function VideoPlayer({ src }) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      playerRef.current = videojs(videoRef.current, {
        controls: true,
        sources: [{ src, type: 'video/mp4' }]
      });
    }
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
      }
    };
  }, [src]);

  return <video ref={videoRef} className="video-js vjs-default-skin" />;
}
```

**适用场景：** 流媒体平台、视频网站、直播、企业培训

---

### hls.js

| 属性 | 详情 |
|------|------|
| **Stars** | 15k+ ⭐ |
| **NPM** | `hls.js` |
| **TS支持** | ✅ 原生TypeScript |
| **GitHub** | [video-dev/hls.js](https://github.com/video-dev/hls.js) |
| **官网** | [hlsjs.video-dev.org](https://hlsjs.video-dev.org) |

基于 MediaSource 扩展的 HLS 流媒体播放器，支持直播和点播。

**代码示例：**

```javascript
import Hls from 'hls.js';

const video = document.getElementById('video');
const videoSrc = 'https://example.com/stream.m3u8';

if (Hls.isSupported()) {
  const hls = new Hls({
    debug: false,
    enableWorker: true,
    lowLatencyMode: true,
    backBufferLength: 90,
  });

  hls.loadSource(videoSrc);
  hls.attachMedia(video);

  hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
    console.log(' manifest 加载完成，找到 ' + data.levels.length + ' 个质量级别');
    video.play();
  });

  hls.on(Hls.Events.ERROR, (event, data) => {
    if (data.fatal) {
      switch(data.type) {
        case Hls.ErrorTypes.NETWORK_ERROR:
          console.log('网络错误，尝试恢复...');
          hls.startLoad();
          break;
        case Hls.ErrorTypes.MEDIA_ERROR:
          console.log('媒体错误，尝试恢复...');
          hls.recoverMediaError();
          break;
        default:
          hls.destroy();
          break;
      }
    }
  });

  // 质量切换
  hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
    console.log('切换到质量级别: ' + data.level);
  });

  // 获取可用质量
  const levels = hls.levels;
  hls.currentLevel = 2;  // 切换到特定质量，-1 表示自动
} else if (video.canPlayType('application/vnd.apple.mpegurl')) {
  // Safari原生支持
  video.src = videoSrc;
}
```

**适用场景：** 直播流播放、视频会议、监控系统、在线教育直播

---

### dash.js

| 属性 | 详情 |
|------|------|
| **Stars** | 5.5k+ ⭐ |
| **NPM** | `dashjs` |
| **TS支持** | ✅ 原生TypeScript |
| **GitHub** | [Dash-Industry-Forum/dash.js](https://github.com/Dash-Industry-Forum/dash.js) |
| **官网** | [dashjs.org](https://dashjs.org) |

DASH 工业论坛官方参考播放器，用于播放 MPEG-DASH 内容。

**代码示例：**

```javascript
import { MediaPlayer } from 'dashjs';

// 创建播放器
const player = MediaPlayer().create();

// 初始化
player.initialize(
  document.querySelector('#videoPlayer'),
  'https://example.com/stream.mpd',
  true  // 自动播放
);

// 配置ABR (自适应比特率)
player.updateSettings({
  streaming: {
    abr: {
      autoSwitchBitrate: { video: true },
      limitBitrateByPortal: true,
      initialBitrate: { video: 1000 },
    },
    buffer: {
      fastSwitchEnabled: true,
      bufferTimeDefault: 12,
      bufferTimeAtTopQuality: 30,
    },
    lowLatencyEnabled: true,
  }
});

// 事件监听
player.on(dashjs.MediaPlayer.events.STREAM_INITIALIZED, (e) => {
  console.log('流初始化完成');
});

player.on(dashjs.MediaPlayer.events.QUALITY_CHANGE_RENDERED, (e) => {
  console.log('质量切换: ' + e.newQuality);
});

// 获取/设置质量
const quality = player.getQualityFor('video');
player.setQualityFor('video', 2);  // 切换到特定质量

// 销毁
player.reset();
```

**适用场景：** 4K/8K流媒体、DRM内容播放、低延迟直播、广播电视

---

### fluid-player

| 属性 | 详情 |
|------|------|
| **Stars** | 2.5k+ ⭐ |
| **NPM** | `fluid-player` |
| **TS支持** | ❌ |
| **GitHub** | [fluid-player/fluid-player](https://github.com/fluid-player/fluid-player) |
| **官网** | [docs.fluidplayer.com](https://docs.fluidplayer.com) |

免费的 VAST 兼容 HTML5 视频播放器，支持广告插播。

**代码示例：**

```html
<link rel="stylesheet" href="https://cdn.fluidplayer.com/v3/current/fluidplayer.min.css" />
<script src="https://cdn.fluidplayer.com/v3/current/fluidplayer.min.js"></script>

<video id="video-id">
  <source src="video.mp4" type="video/mp4" />
</video>

<script>
fluidPlayer('video-id', {
  layoutControls: {
    primaryColor: "#28B8ED",
    playButtonShowing: true,
    playPauseAnimation: true,
    fillToContainer: false,
    autoPlay: false,
    preload: false,
    mute: false,
    doubleclickFullscreen: true,
    subtitlesEnabled: false,
    keyboardControl: true,
    layout: 'default',
    allowDownload: false,
    playbackRateEnabled: true,
    allowTheatre: true,
    title: false,
    logo: {
      imageUrl: null,
      position: 'top left',
      clickUrl: null,
      opacity: 1,
    },
    timelinePreview: {
      file: 'thumbnails.vtt',
      type: 'VTT'
    }
  },
  vastOptions: {
    adList: [
      {
        roll: 'preRoll',
        vastTag: 'https://vasttag.com/vast.xml',
        adText: '广告'
      },
      {
        roll: 'midRoll',
        vastTag: 'https://vasttag.com/vast.xml',
        timer: 30
      }
    ]
  }
});
</script>
```

**适用场景：** 视频网站广告、VAST/VPAID广告、内容变现

---

## 媒体处理

### ffmpeg.wasm

| 属性 | 详情 |
|------|------|
| **Stars** | 17.3k+ ⭐ |
| **NPM** | `@ffmpeg/ffmpeg`, `@ffmpeg/util` |
| **TS支持** | ✅ 原生TypeScript |
| **GitHub** | [ffmpegwasm/ffmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm) |
| **官网** | [ffmpegwasm.netlify.app](https://ffmpegwasm.netlify.app) |

FFmpeg 的 WebAssembly 移植版本，在浏览器中进行视频/音频处理。

**代码示例：**

```javascript
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

const ffmpeg = new FFmpeg();

// 加载ffmpeg
await ffmpeg.load();

// 写入文件到内存
const inputFile = await fetchFile('video.mp4');
await ffmpeg.writeFile('input.mp4', inputFile);

// 转码视频
await ffmpeg.exec([
  '-i', 'input.mp4',
  '-c:v', 'libx264',
  '-preset', 'ultrafast',
  '-crf', '23',
  '-c:a', 'aac',
  'output.mp4'
]);

// 提取音频
await ffmpeg.exec([
  '-i', 'input.mp4',
  '-vn',
  '-acodec', 'libmp3lame',
  'output.mp3'
]);

// 截取视频片段
await ffmpeg.exec([
  '-i', 'input.mp4',
  '-ss', '00:01:00',
  '-t', '30',
  '-c', 'copy',
  'clip.mp4'
]);

// 生成缩略图
await ffmpeg.exec([
  '-i', 'input.mp4',
  '-ss', '00:00:05',
  '-vframes', '1',
  '-q:v', '2',
  'thumbnail.jpg'
]);

// 读取输出文件
const output = await ffmpeg.readFile('output.mp4');

// 清理
await ffmpeg.deleteFile('input.mp4');
await ffmpeg.deleteFile('output.mp4');
```

**适用场景：** 视频编辑、格式转换、截图生成、水印添加、视频压缩

---

### mediaelement

| 属性 | 详情 |
|------|------|
| **Stars** | 8k+ ⭐ |
| **NPM** | `mediaelement` |
| **TS支持** | ✅ `@types/mediaelement` |
| **GitHub** | [mediaelement/mediaelement](https://github.com/mediaelement/mediaelement) |
| **官网** | [mediaelementjs.com](https://mediaelementjs.com) |

HTML5 `<audio>` 或 `<video>` 播放器，支持 MP4、WebM、MP3 以及 HLS、DASH、YouTube、Facebook、SoundCloud。

**代码示例：**

```javascript
import 'mediaelement/build/mediaelementplayer.min.css';
import 'mediaelement/build/mediaelement-and-player.min.js';

// 初始化播放器
const player = new MediaElementPlayer('player1', {
  pluginPath: '/path/to/shims/',
  features: ['playpause', 'current', 'progress', 'duration', 'tracks', 'volume', 'fullscreen'],
  renderers: ['html5', 'flash_video', 'flash_audio', 'silverlight_video', 'silverlight_audio'],

  success: function(media, node, instance) {
    console.log('播放器初始化成功');

    // 事件监听
    media.addEventListener('play', () => console.log('播放'));
    media.addEventListener('pause', () => console.log('暂停'));
    media.addEventListener('ended', () => console.log('结束'));
  },
  error: function(media, node) {
    console.error('播放器初始化失败');
  }
});

// 设置源
player.setSrc('video.mp4');
player.load();
player.play();

// 多源设置
player.setSrc([
  { src: 'video.mp4', type: 'video/mp4' },
  { src: 'video.webm', type: 'video/webm' }
]);

// HLS流
player.setSrc('stream.m3u8');

// YouTube
player.setSrc('https://www.youtube.com/watch?v=VIDEO_ID');
```

**适用场景：** 传统浏览器兼容、多平台嵌入、遗留系统维护

---

### video-react

| 属性 | 详情 |
|------|------|
| **Stars** | 2.7k+ ⭐ |
| **NPM** | `video-react` |
| **TS支持** | ✅ |
| **GitHub** | [video-react/video-react](https://github.com/video-react/video-react) |
| **官网** | [video-react.js.org](https://video-react.js.org) |

为 HTML5 世界构建的 React 视频播放器组件。

**代码示例：**

```jsx
import React from 'react';
import { Player, ControlBar, ReplayControl,
         ForwardControl, CurrentTimeDisplay,
         TimeDivider, PlaybackRateMenuButton, VolumeMenuButton } from 'video-react';
import 'video-react/dist/video-react.css';

function VideoPlayer() {
  return (
    <Player
      playsInline
      poster="/assets/poster.png"
      src="https://media.w3.org/2010/05/sintel/trailer_hd.mp4"
    >
      <ControlBar autoHide={false} className="my-class">
        <ReplayControl seconds={10} order={1.1} />
        <ForwardControl seconds={30} order={1.2} />
        <CurrentTimeDisplay order={4.1} />
        <TimeDivider order={4.2} />
        <PlaybackRateMenuButton rates={[5, 2, 1, 0.5, 0.1]} order={7.1} />
        <VolumeMenuButton enabled order={7.2} />
      </ControlBar>
    </Player>
  );
}

// 使用Ref控制
import { useRef, useEffect } from 'react';

function ControlledPlayer() {
  const playerRef = useRef(null);

  useEffect(() => {
    // 订阅状态变化
    playerRef.current.subscribeToStateChange(handleStateChange);
  }, []);

  const handleStateChange = (state) => {
    console.log('当前时间:', state.currentTime);
    console.log('持续时间:', state.duration);
    console.log('是否暂停:', state.paused);
  };

  const play = () => {
    playerRef.current.play();
  };

  const pause = () => {
    playerRef.current.pause();
  };

  const seek = (seconds) => {
    playerRef.current.seek(seconds);
  };

  return (
    <div>
      <Player ref={playerRef} src="video.mp4" />
      <button onClick={play}>播放</button>
      <button onClick={pause}>暂停</button>
      <button onClick={() => seek(30)}>跳到30秒</button>
    </div>
  );
}
```

**适用场景：** React应用、需要自定义控制的视频播放

---

## WebRTC

### simple-peer

| 属性 | 详情 |
|------|------|
| **Stars** | 7.5k+ ⭐ |
| **NPM** | `simple-peer` |
| **TS支持** | ✅ `@types/simple-peer` |
| **GitHub** | [feross/simple-peer](https://github.com/feross/simple-peer) |

简化的 WebRTC 点对点通信库，支持视频、语音和数据通道。

**代码示例：**

```javascript
import SimplePeer from 'simple-peer';

// 发起方
const peer1 = new SimplePeer({ initiator: true, trickle: false });

peer1.on('signal', data => {
  // 通过信令服务器发送给peer2
  console.log('发送信号数据:', data);
});

peer1.on('connect', () => {
  console.log('连接已建立');
  peer1.send('Hello from peer1!');
});

peer1.on('data', data => {
  console.log('收到数据:', data.toString());
});

// 接收方
const peer2 = new SimplePeer();

peer2.on('signal', data => {
  // 通过信令服务器发送给peer1
  console.log('发送信号数据:', data);
});

// 收到信号数据后
peer2.signal(signalDataFromPeer1);
peer1.signal(signalDataFromPeer2);

// 视频通话
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  const peer = new SimplePeer({
    initiator: true,
    stream: stream,
    config: {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        {
          urls: 'turn:turn.example.com:3478',
          username: 'user',
          credential: 'pass'
        }
      ]
    }
  });

  peer.on('stream', remoteStream => {
    // 显示远程视频
    const video = document.querySelector('video');
    video.srcObject = remoteStream;
    video.play();
  });
});

// 数据通道
const peer = new SimplePeer({
  objectMode: true  // 发送对象而不是Buffer
});

peer.send({ type: 'message', content: 'Hello!' });
```

**适用场景：** 点对点视频通话、文件传输、实时数据传输、P2P应用

---

### mediasoup

| 属性 | 详情 |
|------|------|
| **Stars** | 7k+ ⭐ |
| **NPM** | `mediasoup` (服务端), `mediasoup-client` (客户端) |
| **TS支持** | ✅ 原生TypeScript |
| **GitHub** | [versatica/mediasoup](https://github.com/versatica/mediasoup) |
| **官网** | [mediasoup.org](https://mediasoup.org) |

高性能 SFU (选择性转发单元) WebRTC 服务器，用于构建多方视频会议应用。

**代码示例（服务端）：**

```javascript
const mediasoup = require('mediasoup');

// 创建工作进程
const worker = await mediasoup.createWorker({
  logLevel: 'warn',
  rtcMinPort: 10000,
  rtcMaxPort: 10100,
});

worker.on('died', () => {
  console.error('mediasoup worker died');
  process.exit(1);
});

// 创建Router
const mediaCodecs = [
  {
    kind: 'audio',
    mimeType: 'audio/opus',
    clockRate: 48000,
    channels: 2
  },
  {
    kind: 'video',
    mimeType: 'video/VP8',
    clockRate: 90000
  }
];

const router = await worker.createRouter({ mediaCodecs });

// 创建WebRTC传输
const transport = await router.createWebRtcTransport({
  listenIps: [{ ip: '0.0.0.0', announcedIp: 'your.public.ip' }],
  enableUdp: true,
  enableTcp: true,
  preferUdp: true,
});

// 获取DTLS参数
const dtlsParameters = transport.dtlsParameters;
const iceCandidates = transport.iceCandidates;
const iceParameters = transport.iceParameters;

// 创建生产者（发送媒体）
const producer = await transport.produce({
  kind: 'video',
  rtpParameters: {
    codecs: [{
      mimeType: 'video/VP8',
      payloadType: 96,
      clockRate: 90000
    }],
    encodings: [{ ssrc: 11111111 }]
  }
});

// 创建消费者（接收媒体）
const consumer = await transport.consume({
  producerId: producer.id,
  rtpCapabilities: router.rtpCapabilities,
});
```

**代码示例（客户端）：**

```javascript
import { Device } from 'mediasoup-client';

const device = new Device();

// 加载Router RTP能力
await device.load({ routerRtpCapabilities: rtpCapabilitiesFromServer });

// 创建发送传输
const sendTransport = device.createSendTransport(transportOptions);

sendTransport.on('connect', ({ dtlsParameters }, callback, errback) => {
  // 发送connect请求到服务器
  socket.emit('connect-transport', { dtlsParameters }, callback);
});

sendTransport.on('produce', ({ kind, rtpParameters }, callback, errback) => {
  // 发送produce请求到服务器
  socket.emit('produce', { kind, rtpParameters }, ({ id }) => {
    callback({ id });
  });
});

// 获取本地媒体并产生
const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
const track = stream.getVideoTracks()[0];
const producer = await sendTransport.produce({ track });
```

**适用场景：** 多方视频会议、直播、远程教育、协作工具

---

### janus-gateway

| 属性 | 详情 |
|------|------|
| **Stars** | 7.3k+ ⭐ |
| **NPM** | `janus-gateway` |
| **TS支持** | ✅ `@types/janus-gateway` |
| **GitHub** | [meetecho/janus-gateway](https://github.com/meetecho/janus-gateway) |
| **官网** | [janus.conf.meetecho.com](https://janus.conf.meetecho.com) |

开源通用 WebRTC 服务器，基于插件架构设计。

**代码示例：**

```javascript
import Janus from 'janus-gateway';

Janus.init({
  debug: true,
  dependencies: Janus.useDefaultDependencies(),
  callback: () => {
    // Janus初始化完成
  }
});

// 创建会话
const janus = new Janus({
  server: 'wss://your-janus-server/janus',
  success: () => {
    // 附加插件
    janus.attach({
      plugin: 'janus.plugin.videoroom',
      success: (pluginHandle) => {
        const videoRoom = pluginHandle;

        // 加入房间
        const join = {
          request: 'join',
          room: 1234,
          ptype: 'publisher',
          display: 'User Name'
        };
        videoRoom.send({ message: join });
      },
      onmessage: (msg, jsep) => {
        const event = msg.videoroom;
        if (event === 'joined') {
          // 成功加入房间，开始发布
          publishOwnFeed(true);
        }
      },
      onlocalstream: (stream) => {
        // 显示本地视频
        const video = document.getElementById('localvideo');
        Janus.attachMediaStream(video, stream);
      },
      onremotestream: (stream) => {
        // 显示远程视频
        const video = document.getElementById('remotevideo');
        Janus.attachMediaStream(video, stream);
      },
      error: (error) => {
        console.error('插件错误:', error);
      }
    });
  },
  error: (error) => {
    console.error('连接错误:', error);
  }
});

// 发布媒体
function publishOwnFeed(useAudio) {
  videoRoom.createOffer({
    media: {
      audioRecv: false,
      videoRecv: false,
      audioSend: useAudio,
      videoSend: true
    },
    success: (jsep) => {
      const publish = {
        request: 'configure',
        audio: useAudio,
        video: true
      };
      videoRoom.send({ message: publish, jsep: jsep });
    },
    error: (error) => console.error('WebRTC错误:', error)
  });
}
```

**适用场景：** 视频会议、SIP网关、录制服务器、流媒体处理

---

## 实时通信

### jitsi-meet

| 属性 | 详情 |
|------|------|
| **Stars** | 24k+ ⭐ |
| **NPM** | - |
| **TS支持** | ✅ |
| **GitHub** | [jitsi/jitsi-meet](https://github.com/jitsi/jitsi-meet) |
| **官网** | [meet.jit.si](https://meet.jit.si) |

安全、简单、可扩展的视频会议平台，可作为独立应用或嵌入Web应用。

**代码示例（嵌入使用）：**

```html
<script src='https://meet.jit.si/external_api.js'></script>
<div id="meet"></div>

<script>
const domain = 'meet.jit.si';
const options = {
  roomName: 'MyMeetingRoom',
  width: 700,
  height: 500,
  parentNode: document.querySelector('#meet'),
  userInfo: {
    email: 'user@example.com',
    displayName: 'User Name'
  },
  configOverwrite: {
    startWithAudioMuted: true,
    startWithVideoMuted: false,
    prejoinPageEnabled: false
  },
  interfaceConfigOverwrite: {
    SHOW_JITSI_WATERMARK: false,
    SHOW_WATERMARK_FOR_GUESTS: false,
    DEFAULT_BACKGROUND: '#3b3b3b'
  }
};

const api = new JitsiMeetExternalAPI(domain, options);

// 事件监听
api.addEventListeners({
  readyToClose: () => console.log('会议结束'),
  participantJoined: (participant) => {
    console.log('参与者加入:', participant.displayName);
  },
  participantLeft: (participant) => {
    console.log('参与者离开:', participant.displayName);
  },
  videoConferenceJoined: (event) => {
    console.log('加入会议:', event.roomName);
  }
});

// API调用
api.executeCommand('displayName', 'New Name');
api.executeCommand('toggleAudio');
api.executeCommand('toggleVideo');
api.executeCommand('toggleShareScreen');
api.executeCommand('sendChatMessage', 'Hello everyone!');

// 获取参与者列表
const participants = api.getParticipantsInfo();

// 离开会议
api.dispose();
</script>
```

**适用场景：** 视频会议、远程协作、在线教学、网络研讨会

---

### livekit

| 属性 | 详情 |
|------|------|
| **Stars** | 12k+ ⭐ |
| **NPM** | `livekit-client`, `livekit-server-sdk` |
| **TS支持** | ✅ 原生TypeScript |
| **GitHub** | [livekit/livekit](https://github.com/livekit/livekit) |
| **官网** | [livekit.io](https://livekit.io) |

端到端的开源实时音视频基础设施，为AI语音应用提供动力（如ChatGPT Voice Mode）。

**代码示例（客户端）：**

```typescript
import { Room, RoomEvent, VideoPresets } from 'livekit-client';

// 连接房间
const room = new Room({
  adaptiveStream: true,  // 自适应比特率
  dynacast: true,        // 动态发布
  videoCaptureDefaults: {
    resolution: VideoPresets.h720.resolution,
  },
});

room.on(RoomEvent.Connected, () => {
  console.log('已连接到房间');
});

room.on(RoomEvent.ParticipantConnected, (participant) => {
  console.log('参与者连接:', participant.identity);
});

room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
  // 渲染视频/音频轨道
  const element = track.attach();
  if (track.kind === 'video') {
    document.getElementById('remote-video')?.appendChild(element);
  }
});

room.on(RoomEvent.TrackUnsubscribed, (track) => {
  track.detach();
});

// 获取token（通常从服务器获取）
const token = 'your-access-token';

await room.connect('wss://your-livekit-server.com', token);

// 发布本地媒体
await room.localParticipant.enableCameraAndMicrophone();

// 屏幕共享
const screenShareTrack = await room.localParticipant.setScreenShareEnabled(true);

// 数据通道
const encoder = new TextEncoder();
const decoder = new TextDecoder();

const dataChannel = await room.localParticipant.publishData(
  encoder.encode(JSON.stringify({ type: 'chat', message: 'Hello!' })),
  { reliable: true }
);

room.on(RoomEvent.DataReceived, (payload, participant) => {
  const data = JSON.parse(decoder.decode(payload));
  console.log('收到数据:', data);
});

// 断开连接
await room.disconnect();
```

**代码示例（服务端Node.js）：**

```javascript
import { AccessToken } from 'livekit-server-sdk';

// 创建访问令牌
const apiKey = 'your-api-key';
const apiSecret = 'your-api-secret';

const at = new AccessToken(apiKey, apiSecret, {
  identity: 'user-identity',
  name: 'User Name',
});

at.addGrant({
  roomJoin: true,
  room: 'room-name',
  canPublish: true,
  canSubscribe: true,
  canPublishData: true,
});

const token = at.toJwt();
```

**适用场景：** 实时音视频、AI语音应用、直播、游戏语音、远程协作

---

## 流媒体服务器

### node-media-server

| 属性 | 详情 |
|------|------|
| **Stars** | 6k+ ⭐ |
| **NPM** | `node-media-server` |
| **TS支持** | ✅ `@types/node-media-server` |
| **GitHub** | [illuspas/Node-Media-Server](https://github.com/illuspas/Node-Media-Server) |

Node.js 实现的 RTMP/HTTP-FLV/WS-FLV/HLS/DASH/MP4 流媒体服务器。

**代码示例：**

```javascript
const NodeMediaServer = require('node-media-server');

const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60,
    ssl: {
      port: 1936,
      key: './privatekey.pem',
      cert: './certificate.pem',
    }
  },
  http: {
    port: 8000,
    allow_origin: '*',
    mediaroot: './media',
  },
  https: {
    port: 8443,
    key: './privatekey.pem',
    cert: './certificate.pem',
  },
  trans: {
    ffmpeg: '/usr/bin/ffmpeg',
    tasks: [
      {
        app: 'live',
        hls: true,
        hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]',
        dash: true,
        dashFlags: '[f=dash:window_size=3:extra_window_size=5]'
      }
    ]
  },
  relay: {
    ffmpeg: '/usr/bin/ffmpeg',
    tasks: [
      {
        app: 'live',
        mode: 'push',
        edge: 'rtmp://192.168.0.10/live',
      },
      {
        app: 'live',
        mode: 'pull',
        edge: 'rtmp://192.168.0.20/live',
      }
    ]
  },
  fission: {
    ffmpeg: '/usr/bin/ffmpeg',
    tasks: [
      {
        rule: 'live/*',
        model: [
          { ab: '128k', vb: '1500k', vs: '1280x720' },
          { ab: '96k', vb: '1000k', vs: '854x480' },
          { ab: '64k', vb: '600k', vs: '640x360' }
        ]
      }
    ]
  },
  auth: {
    api: true,
    api_user: 'admin',
    api_pass: 'nms2018',
    play: false,
    publish: false,
    secret: 'nodemedia2017privatekey',
  }
};

const nms = new NodeMediaServer(config);

// 事件监听
nms.on('preConnect', (id, args) => {
  console.log('[NodeEvent on preConnect]', `id=${id} args=${JSON.stringify(args)}`);
});

nms.on('postConnect', (id, args) => {
  console.log('[NodeEvent on postConnect]', `id=${id} args=${JSON.stringify(args)}`);
});

nms.on('doneConnect', (id, args) => {
  console.log('[NodeEvent on doneConnect]', `id=${id} args=${JSON.stringify(args)}`);
});

nms.on('prePublish', (id, streamPath, args) => {
  console.log('[NodeEvent on prePublish]', `id=${id} streamPath=${streamPath} args=${JSON.stringify(args)}`);
  // 可以在这里进行鉴权
});

nms.on('postPublish', (id, streamPath, args) => {
  console.log('[NodeEvent on postPublish]', `id=${id} streamPath=${streamPath} args=${JSON.stringify(args)}`);
});

nms.on('donePublish', (id, streamPath, args) => {
  console.log('[NodeEvent on donePublish]', `id=${id} streamPath=${streamPath} args=${JSON.stringify(args)}`);
});

nms.on('prePlay', (id, streamPath, args) => {
  console.log('[NodeEvent on prePlay]', `id=${id} streamPath=${streamPath} args=${JSON.stringify(args)}`);
});

nms.run();
```

**适用场景：** 直播推流、流媒体转码、RTMP服务器、视频监控

---

## 选型建议

| 场景 | 推荐方案 | 理由 |
|------|----------|------|
| 音频播放 | howler.js | 功能全面，API简洁，自动降级处理 |
| 音乐合成 | tone.js | 专业音频框架，合成器效果器丰富 |
| 音频可视化 | wavesurfer.js | 波形显示专业，插件生态完善 |
| 通用播放器 | plyr / video.js | 设计美观，功能丰富，社区活跃 |
| HLS流媒体 | hls.js | HLS播放的事实标准 |
| DASH流媒体 | dash.js | DASH官方参考实现 |
| 视频处理 | ffmpeg.wasm | 浏览器内处理，无需服务器 |
| P2P通信 | simple-peer | API极简，适合点对点应用 |
| 多方会议 | mediasoup | 高性能SFU，适合大规模会议 |
| 完整会议系统 | jitsi-meet | 开箱即用，可自托管 |
| AI语音应用 | livekit | OpenAI推荐，超低延迟 |
| 直播服务器 | node-media-server | Node.js原生，易于扩展 |

---

## 参考资源

- [Web Audio API MDN文档](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [WebRTC入门指南](https://webrtc.org/getting-started/overview)
- [HLS协议规范](https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-11)
- [DASH-IF指南](https://dashif.org/guidelines/)
