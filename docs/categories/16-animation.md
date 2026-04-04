# 动画库 (Animation Libraries)

> JavaScript 动画生态丰富多样，从 React 专属动画到通用动画引擎，从滚动动画到 3D 渲染，每个领域都有成熟的解决方案。本文档梳理主流动画库及其适用场景。

---

## 📊 分类概览

| 类别 | 代表库 | 适用场景 |
|------|--------|----------|
| React 动画 | Framer Motion, React Spring, React Transition Group | React 组件动画、手势交互 |
| 通用动画引擎 | GSAP, Anime.js, Popmotion, Lottie | 复杂时间线动画、跨平台动画 |
| 滚动动画 | AOS, ScrollReveal, Locomotive Scroll | 滚动触发效果、视差滚动 |
| 3D 动画 | Three.js, React Three Fiber | WebGL 3D 场景、交互式 3D |
| Canvas 动画 | PixiJS, Fabric.js, Konva | 2D 游戏、图形编辑器、数据可视化 |

---

## 1. React 动画

> 专为 React 生态设计的动画解决方案，与组件生命周期深度集成

### Framer Motion (现 Motion) ⭐30k+

**现代 React 动画库** - 声明式 API，业界标准

| 属性 | 详情 |
|------|------|
| **Stars** | 30,200+ |
| **TypeScript** | ✅ 原生支持 |
| **维护状态** | 活跃 (Framer 团队官方) |
| **GitHub** | [motiondivision/motion](https://github.com/motiondivision/motion) |
| **官网** | [motion.dev](https://motion.dev/) |
| **NPM 下载** | 290万+/周 |

**核心特性**
- **声明式 API**：`motion.div`、`animate`、`transition` 简洁直观
- **布局动画**：自动布局变化动画（FLIP 技术）
- **手势支持**：drag、hover、tap、pan、focus 完整手势集
- **滚动动画**：viewport 触发、scroll-linked 效果
- **SVG 动画**：Path morphing、line drawing
- **AnimatePresence**：组件卸载动画支持

```tsx
import { motion, AnimatePresence } from 'motion/react';

// 基础动画
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, ease: 'easeOut' }}
>
  Hello Motion
</motion.div>

// 手势 + 布局动画
<motion.div
  drag
  dragConstraints={{ left: 0, right: 300 }}
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  layout
/>

// 列表动画
<AnimatePresence>
  {items.map(item => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      layout
    />
  ))}
</AnimatePresence>
```

**最佳适用场景**
- React 组件进入/退出动画
- 拖拽排序、可交互卡片
- 页面过渡效果
- 复杂手势交互
- 共享元素过渡

**学习曲线**: 🟡⚪⚪⚪⚪ (简单)

---

### React Spring ⭐28k

**弹簧物理动画库** - 基于弹簧物理的自然运动

| 属性 | 详情 |
|------|------|
| **Stars** | 28,000+ |
| **TypeScript** | ✅ 原生支持 |
| **维护状态** | 活跃 |
| **GitHub** | [pmndrs/react-spring](https://github.com/pmndrs/react-spring) |
| **官网** | [react-spring.io](https://react-spring.io/) |
| **NPM 下载** | 80万+/周 |

**核心特性**
- **弹簧物理**：基于真实弹簧物理模型的动画
- **多平台**：React、React Native、Three.js 通用
- **插值系统**：任意值之间的平滑插值
- **链式动画**：useChain 串联多个动画

```tsx
import { useSpring, animated } from '@react-spring/web';

// 基础弹簧动画
const styles = useSpring({
  from: { opacity: 0, transform: 'scale(0.5)' },
  to: { opacity: 1, transform: 'scale(1)' },
  config: { tension: 300, friction: 10 }
});

<animated.div style={styles}>Spring Animation</animated.div>

// 手势跟随
const [{ x, y }, api] = useSpring(() => ({ x: 0, y: 0 }));

const bind = useDrag(({ down, movement: [mx, my] }) => {
  api.start({ x: down ? mx : 0, y: down ? my : 0 });
});

<animated.div {...bind()} style={{ x, y }} />
```

**最佳适用场景**
- 需要自然物理感的交互
- 拖拽弹性效果
- 图表数据过渡
- 复杂链式动画

**学习曲线**: 🟡🟡⚪⚪⚪ (中等)

---

### React Transition Group ⭐10k

**过渡组件库** - 轻量级状态管理

| 属性 | 详情 |
|------|------|
| **Stars** | 10,000+ |
| **TypeScript** | ✅ @types/react-transition-group |
| **维护状态** | 稳定维护 |
| **GitHub** | [reactjs/react-transition-group](https://github.com/reactjs/react-transition-group) |
| **官网** | [reactcommunity.org/react-transition-group](https://reactcommunity.org/react-transition-group/) |

**核心特性**
- **状态管理**：entering、entered、exiting、exited 四状态
- **CSS 集成**：配合 CSS 实现动画
- **轻量级**：无动画逻辑，仅状态切换

```tsx
import { CSSTransition, TransitionGroup } from 'react-transition-group';

<CSSTransition
  in={show}
  timeout={300}
  classNames="fade"
  unmountOnExit
>
  <div>Content</div>
</CSSTransition>

// 列表动画
<TransitionGroup>
  {items.map(item => (
    <CSSTransition key={item.id} timeout={300} classNames="slide">
      <Item {...item} />
    </CSSTransition>
  ))}
</TransitionGroup>
```

**最佳适用场景**
- 简单的 CSS 过渡效果
- 对包大小敏感的项目
- 需要细粒度控制的传统项目

**学习曲线**: 🟢⚪⚪⚪⚪ (简单)

---

### React Motion

**声明式动画** - 早期 React 动画先驱

| 属性 | 详情 |
|------|------|
| **Stars** | 21,000+ (历史累计) |
| **TypeScript** | ⚠️ 社区类型定义 |
| **维护状态** | 维护模式，建议使用 Framer Motion |
| **GitHub** | [chenglou/react-motion](https://github.com/chenglou/react-motion) |

**说明**：React Motion 是 React 动画库的先驱，但目前处于维护模式。新项目建议使用 Framer Motion 或 React Spring。

---

## 2. 通用动画引擎

> 不依赖特定框架，可应用于任何 JavaScript 项目的动画库

### GSAP (GreenSock) ⭐39k

**专业级动画平台** - 业界最强大动画工具

| 属性 | 详情 |
|------|------|
| **Stars** | 39,000+ |
| **TypeScript** | ✅ @types/gsap / 官方类型 |
| **维护状态** | 活跃 (GreenSock 官方) |
| **GitHub** | [greensock/GSAP](https://github.com/greensock/GSAP) |
| **官网** | [gsap.com](https://gsap.com/) |
| **许可证** | 标准版免费，高级功能付费 |

**核心模块体系**

```
gsap
├── gsap.core         # 核心动画引擎
├── ScrollTrigger     # 滚动触发动画 ⭐必备
├── Flip              # 布局变化动画
├── Observer          # 手势/滚动/触摸观察
├── Draggable         # 拖拽功能
├── MotionPath        # 路径跟随动画
├── TextPlugin        # 文字动画
└── Physics2D/3D      # 物理效果
```

```javascript
// 基础动画
gsap.to('.box', { 
  x: 100, 
  rotation: 360, 
  duration: 1,
  ease: 'power2.out'
});

// 时间线
const tl = gsap.timeline({ repeat: -1, yoyo: true });
tl.to('.box1', { x: 100, duration: 0.5 })
  .to('.box2', { y: 50, duration: 0.3 }, '-=0.2')
  .to('.box3', { scale: 1.5, duration: 0.4 });

// ScrollTrigger 滚动动画
gsap.to('.hero', {
  scrollTrigger: {
    trigger: '.section',
    start: 'top center',
    end: 'bottom center',
    scrub: true,
    pin: true
  },
  opacity: 0,
  y: -100
});
```

**最佳适用场景**
- 复杂时间线动画
- 滚动驱动动画
- 高帧率游戏动画
- 专业级 SVG 动画
- 跨浏览器一致性要求高的项目

**学习曲线**: 🟡🟡🟡⚪⚪ (中高)

---

### Anime.js ⭐51k

**轻量级动画引擎** - 简洁强大的通用动画库

| 属性 | 详情 |
|------|------|
| **Stars** | 51,000+ |
| **TypeScript** | ✅ @types/animejs |
| **维护状态** | 活跃 (v3.x) |
| **GitHub** | [juliangarnier/anime](https://github.com/juliangarnier/anime) |
| **官网** | [animejs.com](https://animejs.com/) |
| **包大小** | ~15KB gzipped |

**核心特性**
- **单一 API**：CSS、SVG、DOM 属性、JavaScript 对象统一动画
- **时间轴**：复杂动画序列编排
- **交错动画**：stagger 系统创建涟漪效果
- **回调系统**：播放、暂停、完成事件

```javascript
import anime from 'animejs';

// 基础动画
anime({
  targets: '.box',
  translateX: 250,
  rotate: '1turn',
  duration: 800,
  easing: 'easeInOutQuad'
});

// 交错动画
anime({
  targets: '.item',
  translateY: [0, -20],
  opacity: [0, 1],
  delay: anime.stagger(100),
  easing: 'easeOutQuad'
});

// 时间轴
const tl = anime.timeline({
  easing: 'easeOutExpo',
  duration: 750
});

tl.add({
  targets: '.box1',
  translateX: 250
}).add({
  targets: '.box2',
  translateY: 100
}, '-=500');

// SVG 路径动画
anime({
  targets: 'path',
  strokeDashoffset: [anime.setDashoffset, 0],
  easing: 'easeInOutSine',
  duration: 1500
});
```

**最佳适用场景**
- 快速原型开发
- 中小型动画项目
- SVG 路径动画
- 交错效果动画

**学习曲线**: 🟡⚪⚪⚪⚪ (简单到中等)

---

### Popmotion ⭐20k

**函数式动画库** - 灵活的低级动画工具

| 属性 | 详情 |
|------|------|
| **Stars** | 20,000+ |
| **TypeScript** | ✅ 原生支持 |
| **维护状态** | 活跃 |
| **GitHub** | [Popmotion/popmotion](https://github.com/Popmotion/popmotion) |
| **官网** | [popmotion.io](https://popmotion.io/) |
| **包大小** | ~11.7KB |

**核心特性**
- **函数式 API**：每个函数独立可组合
- **多目标**：React、Three.js、A-Frame、PixiJS 通用
- **动画类型**：tween、spring、decay、keyframes
- **输入跟踪**：鼠标、触摸、滚动监听

```javascript
import { animate, spring } from 'popmotion';

// 基础动画
animate({
  from: 0,
  to: 100,
  onUpdate: (v) => console.log(v)
});

// 弹簧动画
animate({
  from: 0,
  to: 100,
  type: spring,
  stiffness: 100,
  damping: 10
});

// 与 React 集成
const [x, setX] = useState(0);

useEffect(() => {
  const controls = animate({
    from: 0,
    to: 100,
    onUpdate: setX
  });
  return () => controls.stop();
}, []);
```

**最佳适用场景**
- 需要高度自定义的动画
- 多框架环境
- 物理模拟动画

**学习曲线**: 🟡🟡🟡⚪⚪ (中高)

---

### Lottie Web ⭐30k

**After Effects 动画渲染** - 设计师与开发者的桥梁

| 属性 | 详情 |
|------|------|
| **Stars** | 30,000+ |
| **TypeScript** | ✅ @types/lottie-web |
| **维护状态** | 活跃 (Airbnb 维护) |
| **GitHub** | [airbnb/lottie-web](https://github.com/airbnb/lottie-web) |
| **官网** | [airbnb.io/lottie](https://airbnb.io/lottie/) |

**核心特性**
- **跨平台**：Web、iOS、Android、React Native
- **JSON 格式**：AE 导出 JSON，代码直接渲染
- **矢量动画**：无损缩放，体积小
- **三种渲染器**：SVG (默认)、Canvas、HTML

```javascript
import lottie from 'lottie-web';

// 加载动画
const animation = lottie.loadAnimation({
  container: document.getElementById('lottie'),
  renderer: 'svg',  // 'svg' | 'canvas' | 'html'
  loop: true,
  autoplay: true,
  path: '/animations/loading.json'
});

// 控制播放
animation.play();
animation.pause();
animation.goToAndStop(50, true); // 跳转到第50帧
animation.setSpeed(2);
animation.setDirection(-1);
```

**渲染器对比**

| 渲染器 | 优点 | 缺点 | 适用场景 |
|--------|------|------|----------|
| SVG | 矢量清晰、DOM 可交互 | 复杂动画性能差 | UI 动画、图标 |
| Canvas | 性能较好 | 不可 DOM 交互 | 复杂动画 |
| HTML | 兼容性最好 | 效果有限 | 降级方案 |

**最佳适用场景**
- 设计师主导的动画项目
- 复杂的品牌动效
- 加载动画、引导页
- 跨平台一致性动画

**学习曲线**: 🟡⚪⚪⚪⚪ (简单)

---

### Lottie React Native

**React Native 版 Lottie** - 跨平台移动动画

| 属性 | 详情 |
|------|------|
| **TypeScript** | ✅ 原生支持 |
| **维护状态** | 活跃 |
| **GitHub** | [lottie-react-native/lottie-react-native](https://github.com/lottie-react-native/lottie-react-native) |
| **支持平台** | iOS、Android、Windows、Web |

```tsx
import LottieView from 'lottie-react-native';

<LottieView
  source={require('./animation.json')}
  autoPlay
  loop
  style={{ width: 200, height: 200 }}
  onAnimationFinish={() => console.log('Finished')}
/>
```

**最佳适用场景**
- React Native 应用动画
- 跨平台移动开发
- 与设计师协作的 RN 项目

---

## 3. 滚动动画

> 随着用户滚动页面触发的动画效果

### AOS ⭐21k

**Animate On Scroll** - CSS 驱动滚动动画

| 属性 | 详情 |
|------|------|
| **Stars** | 21,000+ |
| **TypeScript** | ⚠️ 社区类型定义 |
| **维护状态** | 稳定 (v2.3.4) |
| **GitHub** | [michalsnik/aos](https://github.com/michalsnik/aos) |
| **官网** | [michalsnik.github.io/aos](https://michalsnik.github.io/aos/) |
| **包大小** | ~13KB |

**核心特性**
- **数据属性驱动**：纯 CSS + data-aos 属性
- **零配置**：引入即用
- **多种动画**：fade、slide、zoom、flip 等

```html
<!-- 引入 -->
<link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
<script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
<script>AOS.init();</script>

<!-- 使用 -->
<div data-aos="fade-up">Fade up animation</div>
<div data-aos="fade-left" data-aos-duration="1500">Left fade</div>
<div data-aos="zoom-in" data-aos-delay="300">Zoom with delay</div>
<div data-aos="flip-up" data-aos-once="false">Flip on scroll</div>
```

**常用属性**

| 属性 | 说明 | 示例 |
|------|------|------|
| data-aos | 动画类型 | fade-up, fade-left, zoom-in |
| data-aos-duration | 持续时间 | 1000 (ms) |
| data-aos-delay | 延迟 | 0-3000 (ms) |
| data-aos-offset | 触发偏移 | 200 (px) |
| data-aos-once | 只触发一次 | true / false |
| data-aos-anchor-placement | 锚点位置 | top-center, bottom-top |

**最佳适用场景**
- 营销页面滚动效果
- 内容展示型网站
- 快速原型开发
- 对 JS 依赖敏感的项目

**学习曲线**: 🟢⚪⚪⚪⚪ (简单)

---

### ScrollReveal ⭐22k

**滚动显示动画** - JavaScript 驱动

| 属性 | 详情 |
|------|------|
| **Stars** | 22,500+ |
| **TypeScript** | ⚠️ 社区类型定义 |
| **维护状态** | 稳定维护 |
| **GitHub** | [jlmakes/scrollreveal](https://github.com/jlmakes/scrollreveal) |
| **官网** | [scrollrevealjs.org](https://scrollrevealjs.org/) |
| **包大小** | ~12KB |

**核心特性**
- **单例模式**：全局一致实例
- **声明式 API**：简单配置
- **广泛浏览器支持**

```javascript
import ScrollReveal from 'scrollreveal';

// 基础使用
ScrollReveal().reveal('.headline');

// 高级配置
ScrollReveal().reveal('.headline', {
  delay: 300,
  distance: '50px',
  duration: 1000,
  easing: 'ease-in-out',
  origin: 'bottom',
  reset: true
});

// 批量配置
ScrollReveal().reveal('.item', {
  interval: 200,  // 每个元素间隔
  distance: '20px',
  origin: 'right'
});
```

**最佳适用场景**
- 传统网站滚动动画
- 需要稳定 API 的项目
- 简单动画需求

**学习曲线**: 🟢⚪⚪⚪⚪ (简单)

---

### Locomotive Scroll ⭐9k

**平滑滚动 + 视差** - 现代化滚动库

| 属性 | 详情 |
|------|------|
| **Stars** | 8,700+ |
| **TypeScript** | ✅ 原生支持 |
| **维护状态** | 活跃 (v5.x) |
| **GitHub** | [locomotivemtl/locomotive-scroll](https://github.com/locomotivemtl/locomotive-scroll) |
| **官网** | [scroll.locomotive.ca](https://scroll.locomotive.ca/) |
| **包大小** | ~9.4KB gzipped |

**核心特性**
- **基于 Lenis**：最新平滑滚动引擎
- **视差效果**：data-scroll-speed 实现
- **Intersection Observer**：高性能检测
- **移动端优化**：智能触摸检测

```javascript
import LocomotiveScroll from 'locomotive-scroll';

const scroll = new LocomotiveScroll({
  el: document.querySelector('[data-scroll-container]'),
  smooth: true,
  lerp: 0.1
});
```

```html
<div data-scroll-container>
  <div data-scroll data-scroll-speed="0.5">
    慢速视差
  </div>
  <div data-scroll data-scroll-speed="2">
    快速视差
  </div>
  <div data-scroll data-scroll-direction="horizontal">
    水平滚动
  </div>
</div>
```

**最佳适用场景**
- 高端品牌展示网站
- 创意作品集
- 需要平滑滚动的应用

**学习曲线**: 🟡🟡⚪⚪⚪ (中等)

---

### React Scroll Parallax ⭐4k

**React 视差滚动** - 声明式视差组件

| 属性 | 详情 |
|------|------|
| **Stars** | 4,000+ |
| **TypeScript** | ✅ 原生支持 |
| **维护状态** | 活跃 |
| **GitHub** | [jscottsmith/react-scroll-parallax](https://github.com/jscottsmith/react-scroll-parallax) |
| **官网** | [react-scroll-parallax.damnthat.tv](https://react-scroll-parallax.damnthat.tv/) |

```tsx
import { Parallax, ParallaxProvider } from 'react-scroll-parallax';

<ParallaxProvider>
  <Parallax speed={-10}>
    <h1>慢速背景</h1>
  </Parallax>
  
  <Parallax translateY={[20, -20]}>
    <div>垂直移动元素</div>
  </Parallax>
  
  <Parallax scale={[0.8, 1.2]}>
    <div>缩放元素</div>
  </Parallax>
  
  <Parallax rotate={[0, 360]}>
    <div>旋转元素</div>
  </Parallax>
</ParallaxProvider>
```

**最佳适用场景**
- React 项目视差效果
- 单页应用滚动动画
- 响应式视差设计

**学习曲线**: 🟡⚪⚪⚪⚪ (简单)

---

## 4. 3D 动画

> WebGL 驱动的三维图形渲染与动画

### Three.js ⭐105k

**WebGL 3D 图形之王** - 最广泛使用的 3D 库

| 属性 | 详情 |
|------|------|
| **Stars** | 105,000+ |
| **TypeScript** | ✅ @types/three 完善 |
| **维护状态** | 非常活跃 |
| **GitHub** | [mrdoob/three.js](https://github.com/mrdoob/three.js) |
| **官网** | [threejs.org](https://threejs.org/) |

**核心模块**

```javascript
three
├── Core (Scene, Camera, Renderer)     # 核心
├── Geometries (Box, Sphere, Plane...) # 几何体
├── Materials (MeshBasic, MeshPhong...) # 材质
├── Lights (Ambient, Directional...)    # 光源
├── Loaders (GLTF, OBJ, FBX...)         # 加载器
├── Controls (OrbitControls...)         # 控制器
└── Post-Processing                     # 后处理
```

```javascript
import * as THREE from 'three';

// 场景设置
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

// 创建物体
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// 光源
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 1, 1);
scene.add(light);

// 动画循环
function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();
```

**最佳适用场景**
- 3D 数据可视化
- 产品展示/配置器
- 游戏开发
- 艺术与创意编程
- 建筑可视化

**学习曲线**: 🔴🔴🔴🔴⚪ (较陡峭)

---

### React Three Fiber ⭐28k

**React 的 Three.js** - 声明式 3D 渲染

| 属性 | 详情 |
|------|------|
| **Stars** | 28,000+ |
| **TypeScript** | ✅ 原生支持 |
| **维护状态** | 活跃 (pmndrs 组织) |
| **GitHub** | [pmndrs/react-three-fiber](https://github.com/pmndrs/react-three-fiber) |
| **官网** | [docs.pmndrs.io/react-three-fiber](https://docs.pmndrs.io/react-three-fiber) |

**核心特性**
- **声明式 API**：JSX 描述 3D 场景
- **无开销**：性能与原生 Three.js 相当
- **React 生态**：Hooks、Context、Reconciliation
- **生态系统**：Drei (辅助组件)、React Spring (动画)

```tsx
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';

function Box() {
  const ref = useRef();
  
  useFrame(() => {
    ref.current.rotation.x += 0.01;
    ref.current.rotation.y += 0.01;
  });
  
  return (
    <mesh ref={ref}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="hotpink" />
    </mesh>
  );
}

function App() {
  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Box />
      <Stars />
      <OrbitControls />
    </Canvas>
  );
}
```

**React Three Drei 常用组件**

```tsx
import { 
  Environment,     // 环境贴图
  ContactShadows,  // 接触阴影
  Float,           // 漂浮动画
  Html,            // 3D 中的 HTML
  useGLTF,         // GLTF 加载
  useTexture       // 纹理加载
} from '@react-three/drei';
```

**最佳适用场景**
- React 项目的 3D 需求
- 交互式 3D 展示
- WebGL 数据可视化
- 3D 产品配置器

**学习曲线**: 🟡🟡🟡⚪⚪ (中高)

---

## 5. Canvas 动画

> 基于 HTML5 Canvas 的高性能 2D 渲染

### PixiJS ⭐44k

**超快 2D 渲染引擎** - WebGL/HTML5 创建引擎

| 属性 | 详情 |
|------|------|
| **Stars** | 44,000+ |
| **TypeScript** | ✅ 原生支持 |
| **维护状态** | 活跃 (v8.x) |
| **GitHub** | [pixijs/pixijs](https://github.com/pixijs/pixijs) |
| **官网** | [pixijs.com](https://pixijs.com/) |

**核心特性**
- **WebGL & WebGPU**：硬件加速渲染
- **极速性能**：百万级精灵渲染
- **完整交互**：鼠标、触摸多点支持
- **滤镜系统**：Photoshop 级混合模式
- **Canvas 降级**：兼容不支持 WebGL 的设备

```javascript
import { Application, Assets, Sprite } from 'pixi.js';

// 创建应用
const app = new Application();
await app.init({ background: '#1099bb', resizeTo: window });
document.body.appendChild(app.canvas);

// 加载资源
const texture = await Assets.load('https://pixijs.com/assets/bunny.png');

// 创建精灵
const bunny = new Sprite(texture);
bunny.anchor.set(0.5);
bunny.x = app.screen.width / 2;
bunny.y = app.screen.height / 2;
app.stage.addChild(bunny);

// 动画
app.ticker.add((time) => {
  bunny.rotation += 0.1 * time.deltaTime;
});
```

**PixiJS v8 新特性**
- WebGPU 渲染器支持
- 全新渲染组概念
- 20+ 种混合模式
- 抗锯齿纹理渲染优化

**最佳适用场景**
- 2D 游戏开发
- 高性能 2D 交互应用
- 富媒体广告
- 粒子效果

**学习曲线**: 🟡🟡⚪⚪⚪ (中等)

---

### Fabric.js ⭐28k

**Canvas 交互库** - 强大的 2D 画布交互

| 属性 | 详情 |
|------|------|
| **Stars** | 28,000+ |
| **TypeScript** | ✅ 原生支持 |
| **维护状态** | 活跃 (v6.x) |
| **GitHub** | [fabricjs/fabric.js](https://github.com/fabricjs/fabric.js) |
| **官网** | [fabricjs.com](https://fabricjs.com/) |

**核心特性**
- **开箱即用交互**：缩放、移动、旋转、倾斜、组合
- **内置功能**：形状、控件、动画、图像滤镜
- **导入导出**：JPG、PNG、JSON、SVG
- **丰富样式**：渐变、图案、画笔

```javascript
import { Canvas, Rect, Circle } from 'fabric';

const canvas = new Canvas('c');

// 创建矩形
const rect = new Rect({
  left: 100,
  top: 100,
  fill: 'red',
  width: 50,
  height: 50,
  angle: 15
});

// 创建圆形
const circle = new Circle({
  left: 200,
  top: 200,
  fill: 'blue',
  radius: 40
});

canvas.add(rect, circle);
canvas.renderAll();

// 导出
const json = canvas.toJSON();
const png = canvas.toDataURL();
```

**最佳适用场景**
- 图片编辑器
- 在线设计工具
- 白板/协作画布
- 流程图编辑器
- 产品配置器

**学习曲线**: 🟡🟡⚪⚪⚪ (中等)

---

### Konva ⭐11k

**2D Canvas 框架** - 交互式 Canvas 应用

| 属性 | 详情 |
|------|------|
| **Stars** | 11,000+ |
| **TypeScript** | ✅ 原生支持 |
| **维护状态** | 活跃 (v10.x) |
| **GitHub** | [konvajs/konva](https://github.com/konvajs/konva) |
| **官网** | [konvajs.org](https://konvajs.org/) |

**核心特性**
- **层级结构**：Stage → Layer → Shape
- **高性能**：缓存、分层优化
- **丰富交互**：拖拽、缩放、旋转
- **框架集成**：官方 React、Vue、Svelte、Angular 支持

```javascript
import Konva from 'konva';

const stage = new Konva.Stage({
  container: 'container',
  width: window.innerWidth,
  height: window.innerHeight
});

const layer = new Konva.Layer();
stage.add(layer);

const rect = new Konva.Rect({
  x: 50,
  y: 50,
  width: 100,
  height: 50,
  fill: '#00D2FF',
  stroke: 'black',
  strokeWidth: 4,
  draggable: true
});

layer.add(rect);
layer.draw();
```

**React Konva 示例**

```tsx
import { Stage, Layer, Rect, Circle } from 'react-konva';

<Stage width={window.innerWidth} height={window.innerHeight}>
  <Layer>
    <Rect
      x={50}
      y={50}
      width={100}
      height={50}
      fill="#00D2FF"
      draggable
      onDragEnd={(e) => console.log(e.target.x(), e.target.y())}
    />
    <Circle x={200} y={100} radius={50} fill="red" draggable />
  </Layer>
</Stage>
```

**最佳适用场景**
- 交互式 2D 应用
- 设计编辑器/白板
- 注释工具
- 交互式地图

**学习曲线**: 🟡⚪⚪⚪⚪ (简单到中等)

---

## Canvas 库对比

| 库 | 渲染方式 | 最佳用途 | 性能 | 交互能力 |
|----|----------|----------|------|----------|
| **PixiJS** | WebGL/Canvas | 2D 游戏、高性能渲染 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Fabric.js** | Canvas 2D | 图片编辑、设计工具 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Konva** | Canvas 2D | 交互式 2D 应用 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## 📈 选型建议

### 按项目类型

| 项目类型 | 推荐库 |
|----------|--------|
| React 组件动画 | **Framer Motion** |
| 复杂时间线动画 | **GSAP** |
| 快速原型/简单动画 | **Anime.js** |
| 滚动触发效果 | **AOS** / **GSAP ScrollTrigger** |
| 平滑滚动 + 视差 | **Locomotive Scroll** |
| 3D 场景 | **Three.js** / **React Three Fiber** |
| 2D 游戏 | **PixiJS** |
| 图片/图形编辑器 | **Fabric.js** / **Konva** |
| 设计师交付动画 | **Lottie** |

### 按技能水平

| 水平 | 推荐起步 |
|------|----------|
| 初学者 | AOS、Anime.js、Framer Motion |
| 中级 | GSAP、React Spring、Konva |
| 高级 | Three.js、Popmotion、PixiJS |

---

## 🔗 参考资源

- [Framer Motion 文档](https://motion.dev/)
- [GSAP 文档](https://gsap.com/docs/)
- [Three.js 文档](https://threejs.org/docs/)
- [React Three Fiber 文档](https://docs.pmndrs.io/react-three-fiber)
- [PixiJS 文档](https://pixijs.com/guides)
- [Lottie 官方](https://airbnb.io/lottie/)

---

> 📅 本文档最后更新：2026年4月
> 
> 💡 提示：Stars 数据会随时间变化，建议查看 GitHub 获取最新数据
