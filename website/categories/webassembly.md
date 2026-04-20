---
title: WebAssembly
description: JavaScript/TypeScript WebAssembly 完整指南 - WASM 运行时与工具链
---

# WebAssembly

WebAssembly (WASM) 是一种为Web设计的二进制指令格式，允许在浏览器中以接近原生的速度运行代码。现在已扩展到服务器端、边缘计算和嵌入式系统。

## 🧪 关联代码实验室

> **1** 个关联模块 · 平均成熟度：**🌿**

| 模块 | 成熟度 | 实现文件 | 测试文件 |
|------|--------|----------|----------|
| [36-web-assembly](../../jsts-code-lab/36-web-assembly/) | 🌿 | 2 | 1 |


---

## WASM运行时

### wasmtime

- **Stars**: 18,000+
- **语言**: Rust
- **TS支持**: ❌ (运行时)
- **GitHub**: <https://github.com/bytecodealliance/wasmtime>

Bytecode Alliance开发的快速、安全、独立的WebAssembly运行时，支持WASI标准。

```bash
# 安装
curl https://wasmtime.dev/install.sh -sSf | bash

# 运行WASM模块
wasmtime run module.wasm
```

---

### wasmer

- **Stars**: 12,000+
- **语言**: Rust
- **TS支持**: ❌ (运行时)
- **GitHub**: <https://github.com/wasmerio/wasmer>

通用WASM运行时，支持多种编译器后端（LLVM、Cranelift、Singlepass），可在桌面、云端、边缘和IoT设备上运行。

```bash
# 安装
curl https://get.wasmer.io -sSfL | sh

# 运行WASM模块
wasmer run module.wasm
```

---

### wasm3

- **Stars**: 7,000+
- **语言**: C
- **TS支持**: ❌ (运行时)
- **GitHub**: <https://github.com/wasm3/wasm3>

高性能WebAssembly解释器，专注于轻量级和跨平台兼容性。适合嵌入式系统和资源受限环境，仅需约64KB代码空间和10KB RAM。

```bash
# 构建
make

# 运行
./wasm3 module.wasm
```

---

## JS/TS WASM工具

### AssemblyScript

- **Stars**: 17,800+
- **语言**: TypeScript
- **TS支持**: ✅ 原生支持
- **GitHub**: <https://github.com/AssemblyScript/assemblyscript>

将TypeScript变体编译为WebAssembly，使用Binaryen生成高效的WASM模块。

```typescript
// assembly/index.ts
export function add(a: i32, b: i32): i32 {
  return a + b;
}

export function fib(n: i32): i32 {
  if (n < 2) return n;
  return fib(n - 1) + fib(n - 2);
}
```

```bash
# 安装
npm install assemblyscript

# 编译
npx asc assembly/index.ts -o output.wasm --optimize
```

---

### wasm-bindgen

- **Stars**: 8,000+
- **语言**: Rust
- **TS支持**: ✅ 自动生成TS定义
- **GitHub**: <https://github.com/rustwasm/wasm-bindgen>

促进WebAssembly模块与JavaScript之间的高级交互，支持字符串、对象、类等复杂类型传递。

```rust
// src/lib.rs
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet(name: &str) {
    alert(&format!("Hello, {}!", name));
}

#[wasm_bindgen]
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}
```

```bash
# 安装
cargo install wasm-bindgen-cli

# 构建
cargo build --target wasm32-unknown-unknown
wasm-bindgen target/wasm32-unknown-unknown/debug/mylib.wasm --out-dir pkg
```

---

### Emscripten

- **Stars**: N/A (SDK工具)
- **语言**: C/C++
- **TS支持**: ⚠️ 需手动编写声明
- **官网**: <https://emscripten.org>

将C/C++代码编译为WebAssembly和JavaScript的完整工具链。

```c
// hello.c
#include <stdio.h>
#include <emscripten/emscripten.h>

int main() {
    printf("Hello, WebAssembly!\n");
    return 0;
}

// 导出函数供JS调用
#ifdef __cplusplus
extern "C" {
#endif

EMSCRIPTEN_KEEPALIVE
int add(int a, int b) {
    return a + b;
}

#ifdef __cplusplus
}
#endif
```

```bash
# 编译
emcc hello.c -o hello.js -s EXPORTED_FUNCTIONS="['_add']" -s EXTRA_EXPORTED_RUNTIME_METHODS="['cwrap']"
```

---

## WASM应用框架

### Yew

- **Stars**: 31,000+
- **语言**: Rust
- **TS支持**: ❌ (Rust框架)
- **GitHub**: <https://github.com/yewstack/yew>

受React和Elm启发的现代Rust前端框架，使用WebAssembly构建多线程前端应用。

```rust
use yew::prelude::*;

#[function_component(App)]
fn app() -> Html {
    let counter = use_state(|| 0);
    let onclick = {
        let counter = counter.clone();
        move |_| counter.set(*counter + 1)
    };

    html! {
        <div>
            <button {onclick}>{ "+1" }</button>
            <p>{ *counter }</p>
        </div>
    }
}

fn main() {
    yew::Renderer::<App>::new().render();
}
```

```bash
# 安装工具
cargo install trunk wasm-bindgen-cli

# 创建项目
cargo generate --git https://github.com/yewstack/yew-trunk-minimal-template

# 开发
trunk serve
```

---

### Leptos

- **Stars**: 18,500+
- **语言**: Rust
- **TS支持**: ❌ (Rust框架)
- **GitHub**: <https://github.com/leptos-rs/leptos>

细粒度响应式全栈Rust Web框架，支持SSR和客户端渲染，灵感来自SolidJS。

```rust
use leptos::*;

#[component]
fn Counter() -> impl IntoView {
    let (count, set_count) = create_signal(0);

    view! {
        <button
            on:click=move |_| set_count.update(|n| *n + 1)
        >
            "Click me: "
            {count}
        </button>
    }
}

#[component]
fn App() -> impl IntoView {
    view! {
        <h1>"Leptos App"</h1>
        <Counter />
    }
}

fn main() {
    mount_to_body(App);
}
```

```bash
# 安装 CLI
cargo install cargo-leptos

# 创建项目
cargo leptos new my-leptos-app

# 开发
cargo leptos dev
```

---

### Seed

- **Stars**: 3,800+
- **语言**: Rust
- **TS支持**: ❌ (Rust框架)
- **GitHub**: <https://github.com/seed-rs/seed>

遵循Elm架构的Rust前端框架，完全用Rust编写，包括模板系统。

```rust
use seed::{prelude::*, *};

fn init(_: Url, _: &mut impl Orders<Msg>) -> Model {
    Model { count: 0 }
}

struct Model {
    count: i32,
}

enum Msg {
    Increment,
    Decrement,
}

fn update(msg: Msg, model: &mut Model, _: &mut impl Orders<Msg>) {
    match msg {
        Msg::Increment => model.count += 1,
        Msg::Decrement => model.count -= 1,
    }
}

fn view(model: &Model) -> Node<Msg> {
    div![
        button![ev(Ev::Click, |_| Msg::Decrement), "-"],
        div![model.count.to_string()],
        button![ev(Ev::Click, |_| Msg::Increment), "+"],
    ]
}

fn main() {
    App::start("app", init, update, view);
}
```

> ⚠️ **注意**: Seed目前维护不活跃，新项目建议考虑Yew或Leptos。

---

## 图像处理

### sharp

- **Stars**: 32,000+
- **语言**: Node.js (libvips绑定)
- **TS支持**: ✅ 原生支持
- **GitHub**: <https://github.com/lovell/sharp>

高性能Node.js图像处理库，使用libvips，比ImageMagick快4-5倍。

```typescript
import sharp from 'sharp';

// 调整大小
await sharp('input.jpg')
  .resize(300, 200, { fit: 'cover' })
  .toFile('output.webp');

// 批量处理
const images = ['a.jpg', 'b.jpg', 'c.jpg'];
await Promise.all(
  images.map(img =>
    sharp(img)
      .resize(800)
      .jpeg({ quality: 80 })
      .toFile(`processed/${img}`)
  )
);
```

```bash
npm install sharp
```

---

### Photon

- **Stars**: 4,000+
- **语言**: Rust
- **TS支持**: ✅ 通过NPM包
- **GitHub**: <https://github.com/silvia-odwyer/photon>

高性能Rust图像处理库，编译为WebAssembly，支持96+种图像效果。

```typescript
// 浏览器使用
import * as photon from '@silvia-odwyer/photon';

// 加载图像
const canvas = document.getElementById('canvas');
photon.open_image(canvas, function(image) {
    // 应用滤镜
    photon.grayscale(image);
    photon.sunset(image);

    // 保存结果
    photon.putImageData(canvas, image);
});

// Node.js使用
import * as photon from '@silvia-odwyer/photon-node';

const image = photon.open_image_from_file('input.jpg');
photon.sepia(image);
photon.save_image(image, 'output.jpg');
```

```bash
# 浏览器
npm install @silvia-odwyer/photon

# Node.js
npm install @silvia-odwyer/photon-node
```

---

### image-rs

- **Stars**: 5,700+
- **语言**: Rust
- **TS支持**: ❌ (需WASM绑定)
- **GitHub**: <https://github.com/image-rs/image>

纯Rust图像处理库，支持PNG、JPEG、GIF、WebP等多种格式。

```rust
use image::{ImageReader, ImageFormat};
use std::io::Cursor;

// 打开并调整图像
let img = ImageReader::open("input.png")?.decode()?;
let resized = img.resize(300, 200, image::imageops::FilterType::Lanczos3);
resized.save("output.jpg")?;

// 从内存加载
let bytes = include_bytes!("image.png");
let img = ImageReader::new(Cursor::new(bytes))
    .with_guessed_format()?
    .decode()?;
```

```toml
[dependencies]
image = "0.25"
```

---

## 视频编解码

### ffmpeg.wasm

- **Stars**: 17,000+
- **语言**: C/C++ (WebAssembly移植)
- **TS支持**: ✅ 原生支持
- **GitHub**: <https://github.com/ffmpegwasm/ffmpeg.wasm>

纯WebAssembly/JavaScript版FFmpeg，可在浏览器中进行音视频录制、转换和流处理。

```typescript
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

const ffmpeg = new FFmpeg();

async function transcode() {
    // 加载
    await ffmpeg.load();

    // 写入文件
    await ffmpeg.writeFile('input.mp4', await fetchFile('video.mp4'));

    // 执行命令
    await ffmpeg.exec(['-i', 'input.mp4', '-vcodec', 'copy', 'output.mp4']);

    // 读取结果
    const data = await ffmpeg.readFile('output.mp4');
    const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));

    // 显示结果
    const video = document.getElementById('result');
    video.src = url;
}

transcode();
```

```bash
npm install @ffmpeg/ffmpeg @ffmpeg/util
```

---

## 数据库

### sql.js

- **Stars**: 12,000+
- **语言**: C (SQLite)
- **TS支持**: ✅ 社区类型定义
- **GitHub**: <https://github.com/sql-js/sql.js>

SQLite编译为WebAssembly，可在浏览器中创建关系数据库并执行查询。

```typescript
import initSqlJs from 'sql.js';

async function initDatabase() {
    const SQL = await initSqlJs({
        locateFile: file => `/dist/${file}`
    });

    // 创建内存数据库
    const db = new SQL.Database();

    // 创建表
    db.run("CREATE TABLE users (id, name, email);");

    // 插入数据
    db.run("INSERT INTO users VALUES (?, ?, ?)", [1, 'John', 'john@example.com']);

    // 查询
    const result = db.exec("SELECT * FROM users");
    console.log(result);

    // 导出为文件
    const data = db.export();
    const blob = new Blob([data], { type: 'application/x-sqlite3' });

    return db;
}
```

```bash
npm install sql.js
```

---

### duckdb-wasm

- **Stars**: 1,600+
- **语言**: C++
- **TS支持**: ✅ 原生支持
- **GitHub**: <https://github.com/duckdb/duckdb-wasm>

DuckDB的WebAssembly版本，支持在浏览器中运行OLAP分析查询。

```typescript
import * as duckdb from '@duckdb/duckdb-wasm';

async function init() {
    // 初始化
    const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
    const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);

    const worker_url = URL.createObjectURL(
        new Blob([`importScripts("${bundle.mainWorker!}");`], { type: 'text/javascript' })
    );

    const worker = new Worker(worker_url);
    const logger = new duckdb.ConsoleLogger();
    const db = new duckdb.AsyncDuckDB(logger, worker);
    await db.instantiate(bundle.mainModule, bundle.pthreadWorker);

    // 连接并查询
    const conn = await db.connect();
    await conn.query(`CREATE TABLE users (id INTEGER, name VARCHAR)`);
    await conn.query(`INSERT INTO users VALUES (1, 'Alice'), (2, 'Bob')`);

    const result = await conn.query(`SELECT * FROM users`);
    console.log(result.toArray());

    await conn.close();
}
```

```bash
npm install @duckdb/duckdb-wasm
```

---

## 加密

### argon2-browser

- **Stars**: 800+
- **语言**: C (WebAssembly)
- **TS支持**: ✅ 社区类型定义
- **GitHub**: <https://github.com/antelle/argon2-browser>

Argon2密码哈希算法的WebAssembly实现，适用于浏览器环境。

```typescript
import argon2 from 'argon2-browser';

// 哈希密码
async function hashPassword(password: string) {
    const result = await argon2.hash({
        pass: password,
        salt: crypto.getRandomValues(new Uint8Array(16)),
        time: 3,
        mem: 4096,
        parallelism: 1,
        hashLen: 32,
        type: argon2.ArgonType.Argon2id
    });

    return result.encoded; // 返回编码后的哈希字符串
}

// 验证密码
async function verifyPassword(encoded: string, password: string) {
    try {
        await argon2.verify({
            pass: password,
            encoded: encoded,
            type: argon2.ArgonType.Argon2id
        });
        return true;
    } catch (e) {
        return false;
    }
}
```

```bash
npm install argon2-browser
```

---

### libsodium.js

- **Stars**: 1,200+
- **语言**: C (libsodium)
- **TS支持**: ✅ 社区类型定义
- **GitHub**: <https://github.com/jedisct1/libsodium.js>

libsodium的JavaScript封装，提供现代、易用的加密API。

```typescript
import * as sodium from 'libsodium-wrappers';

async function encrypt() {
    await sodium.ready;

    // 生成密钥对
    const keyPair = sodium.crypto_box_keypair();

    // 加密消息
    const message = 'Hello, Secret World!';
    const nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);
    const ciphertext = sodium.crypto_box_easy(
        message,
        nonce,
        keyPair.publicKey,
        keyPair.privateKey
    );

    // 解密
    const decrypted = sodium.crypto_box_open_easy(
        ciphertext,
        nonce,
        keyPair.publicKey,
        keyPair.privateKey
    );

    console.log(sodium.to_string(decrypted));
}

// 密码哈希
async function hashPassword(password: string) {
    await sodium.ready;
    const hash = sodium.crypto_pwhash_str(
        password,
        sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
        sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE
    );
    return hash;
}
```

```bash
npm install libsodium-wrappers
npm install --save-dev @types/libsodium-wrappers
```

---

## 游戏引擎

### Bevy

- **Stars**: 37,000+
- **语言**: Rust
- **TS支持**: ❌ (Rust引擎)
- **GitHub**: <https://github.com/bevyengine/bevy>

数据驱动的Rust游戏引擎，采用ECS（实体-组件-系统）架构，GitHub上最受欢迎的Rust游戏引擎。

```rust
use bevy::prelude::*;

fn main() {
    App::new()
        .add_plugins(DefaultPlugins)
        .add_systems(Startup, setup)
        .add_systems(Update, (move_player, handle_input))
        .run();
}

#[derive(Component)]
struct Player {
    speed: f32,
}

fn setup(mut commands: Commands) {
    // 添加相机
    commands.spawn(Camera2dBundle::default());

    // 添加玩家
    commands.spawn((
        SpriteBundle {
            sprite: Sprite {
                color: Color::BLUE,
                custom_size: Some(Vec2::new(50.0, 50.0)),
                ..default()
            },
            ..default()
        },
        Player { speed: 200.0 },
    ));
}

fn move_player(
    time: Res<Time>,
    keyboard: Res<Input<KeyCode>>,
    mut query: Query<(&Player, &mut Transform)>,
) {
    for (player, mut transform) in query.iter_mut() {
        let mut direction = Vec3::ZERO;

        if keyboard.pressed(KeyCode::W) {
            direction.y += 1.0;
        }
        if keyboard.pressed(KeyCode::S) {
            direction.y -= 1.0;
        }
        if keyboard.pressed(KeyCode::A) {
            direction.x -= 1.0;
        }
        if keyboard.pressed(KeyCode::D) {
            direction.x += 1.0;
        }

        if direction.length() > 0.0 {
            transform.translation += direction.normalize() * player.speed * time.delta_seconds();
        }
    }
}
```

```bash
# 创建项目
cargo new my_game --bin
cd my_game

# 添加依赖
cargo add bevy

# 运行
cargo run

# 编译到WASM
cargo build --target wasm32-unknown-unknown --release
wasm-bindgen --out-dir ./web/ --target web ./target/wasm32-unknown-unknown/release/my_game.wasm
```

---

### Macroquad

- **Stars**: 7,000+
- **语言**: Rust
- **TS支持**: ❌ (Rust框架)
- **GitHub**: <https://github.com/not-fl3/macroquad>

受raylib启发的简单轻量级Rust游戏框架，支持桌面、移动端和WebAssembly。

```rust
use macroquad::prelude::*;

#[macroquad::main("My Game")]
async fn main() {
    let mut player_x = screen_width() / 2.0;
    let mut player_y = screen_height() / 2.0;
    let speed = 200.0;

    loop {
        clear_background(BLACK);

        // 处理输入
        if is_key_down(KeyCode::W) {
            player_y -= speed * get_frame_time();
        }
        if is_key_down(KeyCode::S) {
            player_y += speed * get_frame_time();
        }
        if is_key_down(KeyCode::A) {
            player_x -= speed * get_frame_time();
        }
        if is_key_down(KeyCode::D) {
            player_x += speed * get_frame_time();
        }

        // 绘制
        draw_circle(player_x, player_y, 20.0, BLUE);
        draw_text("Use WASD to move", 10.0, 30.0, 25.0, WHITE);

        next_frame().await;
    }
}
```

```bash
# 创建项目
cargo new my_game
cd my_game
cargo add macroquad

# 运行桌面版本
cargo run

# 编译到WASM
rustup target add wasm32-unknown-unknown
cargo build --target wasm32-unknown-unknown --release
```

---

## 选型建议

| 场景 | 推荐方案 | 理由 |
|------|----------|------|
| 前端Rust开发 | Yew / Leptos | 现代化框架，社区活跃，类型安全 |
| 高性能计算 | Rust + wasm-bindgen | 接近原生性能，与JS互操作方便 |
| TypeScript到WASM | AssemblyScript | 语法熟悉，编译快速 |
| C/C++移植 | Emscripten | 成熟完整，兼容性好 |
| 图像处理 (Node.js) | sharp | 性能极佳，API简洁 |
| 图像处理 (浏览器) | Photon | 纯WASM，跨平台 |
| 客户端数据库 | sql.js | 轻量，纯前端运行 |
| 分析型数据库 | duckdb-wasm | 强大的OLAP能力 |
| 密码哈希 (浏览器) | argon2-browser | 安全，标准化算法 |
| 加密操作 | libsodium.js | 现代加密API，经过审计 |
| 游戏开发 | Bevy | 功能完整，ECS架构 |
| 快速原型游戏 | Macroquad | 简单轻量，跨平台 |

---

## 参考资料

- [WebAssembly官方文档](https://webassembly.org/)
- [Rust and WebAssembly Book](https://rustwasm.github.io/book/)
- [WASI标准](https://wasi.dev/)
- [Awesome WebAssembly](https://github.com/mbasso/awesome-wasm)
