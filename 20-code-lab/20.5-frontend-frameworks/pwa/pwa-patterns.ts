/**
 * @file PWA 模式
 * @category PWA → Service Worker
 * @difficulty medium
 * @tags pwa, service-worker, cache, offline, push-notification
 * 
 * @description
 * 渐进式 Web 应用实现：
 * - Service Worker 注册与管理
 * - 缓存策略
 * - 离线支持
 * - 推送通知
 * - 后台同步
 */

declare global {
  interface NetworkInformation {
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
  }
  interface Navigator {
    connection?: NetworkInformation;
    mozConnection?: NetworkInformation;
    webkitConnection?: NetworkInformation;
  }
  interface ServiceWorkerRegistration {
    sync?: {
      register(tag: string): Promise<void>;
    };
  }
}

// ============================================================================
// 1. Service Worker 管理
// ============================================================================

export interface ServiceWorkerConfig {
  scope?: string;
  updateViaCache?: 'imports' | 'all' | 'none';
}

export type ServiceWorkerState = 
  | 'installing' 
  | 'installed' 
  | 'activating' 
  | 'activated' 
  | 'redundant';

export class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private listeners = new Map<string, Set<(data: unknown) => void>>();

  // 注册 Service Worker
  async register(scriptURL: string, options: ServiceWorkerConfig = {}): Promise<ServiceWorkerRegistration> {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      throw new Error('Service Worker not supported');
    }

    try {
      this.registration = await navigator.serviceWorker.register(scriptURL, {
        scope: options.scope || '/',
        updateViaCache: options.updateViaCache || 'imports'
      });

      if (typeof window !== 'undefined') {
      this.setupListeners();
    }
      
      console.log('[SW] Registered:', this.registration.scope);
      
      return this.registration;
    } catch (error) {
      console.error('[SW] Registration failed:', error);
      throw error;
    }
  }

  // 注销 Service Worker
  async unregister(): Promise<boolean> {
    if (!this.registration) return false;
    
    const result = await this.registration.unregister();
    if (result) {
      this.registration = null;
      console.log('[SW] Unregistered');
    }
    return result;
  }

  // 检查更新
  async update(): Promise<void> {
    if (!this.registration) {
      throw new Error('Service Worker not registered');
    }
    
    await this.registration.update();
    console.log('[SW] Update check triggered');
  }

  // 等待 Service Worker 激活
  async waitForActivation(): Promise<ServiceWorker> {
    if (!this.registration) {
      throw new Error('Service Worker not registered');
    }

    const sw = this.registration.installing || this.registration.waiting || this.registration.active;
    
    if (!sw || sw.state === 'activated') {
      return this.registration.active!;
    }

    return new Promise((resolve) => {
      const checkState = () => {
        if (sw.state === 'activated') {
          resolve(this.registration!.active!);
        } else {
          sw.addEventListener('statechange', checkState, { once: true });
        }
      };
      checkState();
    });
  }

  // 跳过等待 (用于新 Service Worker 立即激活)
  skipWaiting(): void {
    if (!this.registration?.waiting) return;
    
    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    console.log('[SW] Skip waiting message sent');
  }

  // 发送消息到 Service Worker
  postMessage(message: unknown): void {
    if (!this.registration?.active) {
      throw new Error('No active Service Worker');
    }
    
    this.registration.active.postMessage(message);
  }

  // 获取当前状态
  getState(): { 
    installing: boolean; 
    waiting: boolean; 
    active: boolean;
    state?: ServiceWorkerState;
  } {
    if (!this.registration) {
      return { installing: false, waiting: false, active: false };
    }

    const sw = this.registration.installing || 
               this.registration.waiting || 
               this.registration.active;

    return {
      installing: !!this.registration.installing,
      waiting: !!this.registration.waiting,
      active: !!this.registration.active,
      state: sw?.state as ServiceWorkerState
    };
  }

  // 监听状态变化
  on(event: 'updatefound' | 'statechange' | 'activated', callback: (data: unknown) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  private setupListeners(): void {
    if (!this.registration) return;

    this.registration.addEventListener('updatefound', () => {
      console.log('[SW] Update found');
      this.emit('updatefound', this.registration);
      
      const newWorker = this.registration!.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          console.log('[SW] State changed:', newWorker.state);
          this.emit('statechange', { state: newWorker.state, worker: newWorker });
          
          if (newWorker.state === 'activated') {
            this.emit('activated', { worker: newWorker });
          }
        });
      }
    });
  }

  private emit(event: string, data: unknown): void {
    const callbacks = this.listeners.get(event);
    callbacks?.forEach(cb => { cb(data); });
  }
}

// ============================================================================
// 2. 缓存策略
// ============================================================================

export type CacheStrategy = 
  | 'cache-first'      // 先读缓存，没有则网络请求并缓存
  | 'network-first'    // 先网络请求，失败则读缓存
  | 'cache-only'       // 只读缓存
  | 'network-only'     // 只网络请求
  | 'stale-while-revalidate'; // 先读缓存，同时更新缓存

export interface CacheConfig {
  cacheName: string;
  maxAge?: number;           // 最大缓存时间 (毫秒)
  maxEntries?: number;       // 最大条目数
  precacheUrls?: string[];   // 预缓存 URL
}

export class CacheManager {
  private config: CacheConfig;

  constructor(config: CacheConfig) {
    this.config = {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      maxEntries: 100,
      ...config
    };
  }

  // 预缓存资源
  async precache(urls?: string[]): Promise<void> {
    const urlsToCache = urls || this.config.precacheUrls || [];
    if (urlsToCache.length === 0) return;

    const cache = await caches.open(this.config.cacheName);
    const results = await Promise.allSettled(
      urlsToCache.map(async (url) => {
        const response = await fetch(url, { cache: 'no-cache' });
        if (response.ok) {
          await cache.put(url, response);
          console.log(`[Cache] Precached: ${url}`);
        }
        return url;
      })
    );

    const succeeded = results.filter(r => r.status === 'fulfilled').length;
    console.log(`[Cache] Precached ${succeeded}/${urlsToCache.length} resources`);
  }

  // 执行缓存策略
  async fetch(request: Request | string, strategy: CacheStrategy): Promise<Response> {
    const req = typeof request === 'string' ? new Request(request) : request;
    
    switch (strategy) {
      case 'cache-first':
        return this.cacheFirst(req);
      case 'network-first':
        return this.networkFirst(req);
      case 'cache-only':
        return this.cacheOnly(req);
      case 'network-only':
        return this.networkOnly(req);
      case 'stale-while-revalidate':
        return this.staleWhileRevalidate(req);
      default:
        return this.cacheFirst(req);
    }
  }

  // Cache First 策略
  private async cacheFirst(request: Request): Promise<Response> {
    const cache = await caches.open(this.config.cacheName);
    const cached = await cache.match(request);
    
    if (cached && !this.isExpired(cached)) {
      console.log(`[Cache] Hit: ${request.url}`);
      return cached;
    }

    try {
      const response = await fetch(request);
      if (response.ok) {
        await cache.put(request, response.clone());
        await this.enforceSizeLimit();
      }
      return response;
    } catch {
      if (cached) {
        console.log(`[Cache] Serving stale: ${request.url}`);
        return cached;
      }
      throw new Error('Network error and no cache available');
    }
  }

  // Network First 策略
  private async networkFirst(request: Request): Promise<Response> {
    const cache = await caches.open(this.config.cacheName);
    
    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        await cache.put(request, networkResponse.clone());
        await this.enforceSizeLimit();
      }
      return networkResponse;
    } catch (error) {
      const cached = await cache.match(request);
      if (cached) {
        console.log(`[Cache] Fallback: ${request.url}`);
        return cached;
      }
      throw error;
    }
  }

  // Cache Only 策略
  private async cacheOnly(request: Request): Promise<Response> {
    const cache = await caches.open(this.config.cacheName);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    throw new Error('Not found in cache');
  }

  // Network Only 策略
  private async networkOnly(request: Request): Promise<Response> {
    return fetch(request);
  }

  // Stale While Revalidate 策略
  private async staleWhileRevalidate(request: Request): Promise<Response> {
    const cache = await caches.open(this.config.cacheName);
    const cached = await cache.match(request);
    
    // 同时发起网络请求更新缓存
    const fetchPromise = fetch(request).then(async (response) => {
      if (response.ok) {
        await cache.put(request, response.clone());
        await this.enforceSizeLimit();
      }
      return response;
    }).catch(() => cached);

    // 立即返回缓存（如果有），否则等待网络
    return cached || ((await fetchPromise)!);
  }

  // 清除缓存
  async clear(): Promise<void> {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter(name => name.startsWith(this.config.cacheName))
        .map(name => caches.delete(name))
    );
    console.log('[Cache] Cleared');
  }

  // 获取缓存统计
  async getStats(): Promise<{ entries: number; size: number }> {
    const cache = await caches.open(this.config.cacheName);
    const keys = await cache.keys();
    
    let size = 0;
    for (const request of keys) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        size += blob.size;
      }
    }
    
    return { entries: keys.length, size };
  }

  private isExpired(response: Response): boolean {
    const dateHeader = response.headers.get('date');
    if (!dateHeader) return false;
    
    const age = Date.now() - new Date(dateHeader).getTime();
    return age > (this.config.maxAge || Infinity);
  }

  private async enforceSizeLimit(): Promise<void> {
    if (!this.config.maxEntries) return;
    
    const cache = await caches.open(this.config.cacheName);
    const keys = await cache.keys();
    
    if (keys.length > this.config.maxEntries) {
      const toDelete = keys.slice(0, keys.length - this.config.maxEntries);
      await Promise.all(toDelete.map(key => cache.delete(key)));
      console.log(`[Cache] Removed ${toDelete.length} old entries`);
    }
  }
}

// ============================================================================
// 3. 离线支持
// ============================================================================

export interface OfflineConfig {
  offlinePage?: string;
  cacheName: string;
}

export class OfflineManager {
  private config: OfflineConfig;
  private isOnline: boolean = typeof navigator !== 'undefined' ? (navigator.onLine ?? true) : true;

  constructor(config: OfflineConfig) {
    this.config = {
      offlinePage: '/offline.html',
      ...config
    };
    this.setupListeners();
  }

  private setupListeners(): void {
    if (typeof window === 'undefined') return;
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.emit('online');
      console.log('[Offline] Connection restored');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.emit('offline');
      console.log('[Offline] Connection lost');
    });
  }

  // 检查在线状态
  isConnected(): boolean {
    return this.isOnline;
  }

  // 等待恢复在线
  async waitForOnline(): Promise<void> {
    if (this.isOnline) return;
    
    return new Promise((resolve) => {
      const handler = () => {
        window.removeEventListener('online', handler);
        resolve();
      };
      window.addEventListener('online', handler);
    });
  }

  // 获取离线页面内容
  async getOfflinePage(): Promise<Response> {
    const cache = await caches.open(this.config.cacheName);
    const cached = await cache.match(this.config.offlinePage!);
    
    if (cached) {
      return cached;
    }
    
    // 返回默认离线页面
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head><title>Offline</title></head>
        <body>
          <h1>You are offline</h1>
          <p>Please check your internet connection.</p>
        </body>
      </html>
      `,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }

  // 检查网络连接质量
  async checkConnectionQuality(): Promise<{
    type: 'slow-2g' | '2g' | '3g' | '4g' | 'unknown';
    downlink: number;
    rtt: number;
    saveData: boolean;
  }> {
    const connection = navigator.connection ||
                      navigator.mozConnection ||
                      navigator.webkitConnection;

    if (connection) {
      return {
        type: (connection.effectiveType || 'unknown') as 'slow-2g' | '2g' | '3g' | '4g' | 'unknown',
        downlink: connection.downlink || 0,
        rtt: connection.rtt || 0,
        saveData: connection.saveData || false
      };
    }

    // 测试实际下载速度
    const startTime = performance.now();
    try {
      await fetch('/ping.txt', { cache: 'no-store' });
      const rtt = performance.now() - startTime;
      
      return {
        type: rtt < 100 ? '4g' : rtt < 300 ? '3g' : '2g',
        downlink: 0,
        rtt,
        saveData: false
      };
    } catch {
      return { type: 'unknown', downlink: 0, rtt: 0, saveData: false };
    }
  }

  private emit(event: string): void {
    window.dispatchEvent(new CustomEvent(`offline:${event}`));
  }
}

// ============================================================================
// 4. 推送通知
// ============================================================================

export interface PushNotificationOptions {
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: { action: string; title: string; icon?: string }[];
  data?: Record<string, unknown>;
  timestamp?: number;
}

export class PushNotificationManager {
  private swRegistration: ServiceWorkerRegistration | null = null;
  private permission: NotificationPermission = 'default';

  constructor(swRegistration?: ServiceWorkerRegistration) {
    this.swRegistration = swRegistration || null;
    this.permission = typeof Notification !== 'undefined' ? Notification.permission : 'default';
  }

  // 请求通知权限
  async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      throw new Error('Notifications not supported');
    }

    this.permission = await Notification.requestPermission();
    console.log('[Push] Permission:', this.permission);
    return this.permission;
  }

  // 订阅推送服务
  async subscribe(applicationServerKey: string): Promise<PushSubscription> {
    if (!this.swRegistration) {
      throw new Error('Service Worker not registered');
    }

    const subscription = await this.swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: this.urlBase64ToUint8Array(applicationServerKey) as BufferSource
    });

    console.log('[Push] Subscribed:', subscription.endpoint);
    return subscription;
  }

  // 取消订阅
  async unsubscribe(): Promise<boolean> {
    if (!this.swRegistration) return false;

    const subscription = await this.swRegistration.pushManager.getSubscription();
    if (subscription) {
      const result = await subscription.unsubscribe();
      console.log('[Push] Unsubscribed:', result);
      return result;
    }
    return false;
  }

  // 发送本地通知
  async showNotification(
    title: string,
    options: PushNotificationOptions
  ): Promise<Notification | void> {
    if (this.permission !== 'granted') {
      console.warn('[Push] Permission not granted');
      return;
    }

    const notificationOptions: NotificationOptions = {
      body: options.body,
      icon: options.icon,
      badge: options.badge,
      // @ts-expect-error NotificationOptions does not have image in some DOM typings
      image: options.image,
      tag: options.tag,
      requireInteraction: options.requireInteraction,
      actions: options.actions,
      data: options.data,
      timestamp: options.timestamp || Date.now()
    };

    if (this.swRegistration) {
      // 使用 Service Worker 显示通知
      await this.swRegistration.showNotification(title, notificationOptions);
    } else {
      // 直接使用 Notification API
      return new Notification(title, notificationOptions);
    }
  }

  // 获取当前订阅
  async getSubscription(): Promise<PushSubscription | null> {
    if (!this.swRegistration) return null;
    return this.swRegistration.pushManager.getSubscription();
  }

  // 检查是否已订阅
  async isSubscribed(): Promise<boolean> {
    const subscription = await this.getSubscription();
    return subscription !== null;
  }

  // 转换 VAPID 公钥
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }
}

// ============================================================================
// 5. 后台同步
// ============================================================================

export interface SyncTask {
  id: string;
  type: string;
  data: unknown;
  timestamp: number;
  retries: number;
  maxRetries: number;
}

export class BackgroundSyncManager {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'pwa-sync-db';
  private readonly STORE_NAME = 'sync-tasks';

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, 1);

      request.onerror = () => { reject(request.error); };
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }

  // 注册后台同步
  async register(tag: string): Promise<void> {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator) || typeof window === 'undefined' || !('SyncManager' in window)) {
      console.warn('[Sync] Background sync not supported');
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    
    try {
      if (!registration.sync) {
        throw new Error('Background sync not supported');
      }
      await registration.sync.register(tag);
      console.log('[Sync] Registered:', tag);
    } catch (error) {
      console.error('[Sync] Registration failed:', error);
    }
  }

  // 添加同步任务
  async addTask(type: string, data: unknown): Promise<string> {
    await this.init();

    const task: SyncTask = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: Date.now(),
      retries: 0,
      maxRetries: 3
    };

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.add(task);

      request.onsuccess = () => {
        console.log('[Sync] Task added:', task.id);
        resolve(task.id);
      };
      request.onerror = () => { reject(request.error); };
    });
  }

  // 获取待同步任务
  async getPendingTasks(): Promise<SyncTask[]> {
    await this.init();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => { resolve(request.result); };
      request.onerror = () => { reject(request.error); };
    });
  }

  // 移除已完成的任务
  async removeTask(taskId: string): Promise<void> {
    await this.init();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.delete(taskId);

      request.onsuccess = () => { resolve(); };
      request.onerror = () => { reject(request.error); };
    });
  }
}

// ============================================================================
// 6. 使用示例
// ============================================================================

export async function demo(): Promise<void> {
  console.log('=== PWA 模式 ===\n');

  console.log('1. Service Worker 管理');
  const swManager = new ServiceWorkerManager();
  
  console.log('   Service Worker features:');
  console.log('   - Registration with scope control');
  console.log('   - Update detection and management');
  console.log('   - Skip waiting for immediate activation');
  console.log('   - Message passing between main thread and SW');

  // 检查支持
  if ('serviceWorker' in navigator) {
    console.log('   ✓ Service Worker supported');
  } else {
    console.log('   ✗ Service Worker not supported');
  }

  console.log('\n2. 缓存策略');
  const cacheManager = new CacheManager({
    cacheName: 'demo-cache-v1',
    maxEntries: 50,
    precacheUrls: ['/index.html', '/app.js', '/styles.css']
  });

  console.log('   Available strategies:');
  console.log('   - cache-first: Fast, good for static assets');
  console.log('   - network-first: Fresh data, good for API calls');
  console.log('   - stale-while-revalidate: Fast + fresh');
  console.log('   - cache-only: Guaranteed offline');
  console.log('   - network-only: Always fresh');

  console.log('\n3. 离线支持');
  console.log('   Offline features:');
  console.log('   - Online/offline detection');
  console.log('   - Offline page serving');
  console.log('   - Connection quality monitoring');
  console.log('   - Wait for online restoration');
  
  // Skip Node.js environment check
  if (typeof window !== 'undefined') {
    const offlineManager = new OfflineManager({
      cacheName: 'offline-cache',
      offlinePage: '/offline.html'
    });
    console.log('   Online status:', offlineManager.isConnected() ? 'Online' : 'Offline');
  } else {
    console.log('   (Skipped in Node.js environment)');
  }

  console.log('\n4. 推送通知');
  
  console.log('   Push notification features:');
  console.log('   - Request user permission');
  console.log('   - Subscribe to push service');
  console.log('   - Display notifications with actions');
  console.log('   - Handle notification clicks');
  
  if (typeof Notification !== 'undefined') {
    const pushManager = new PushNotificationManager();
    console.log('   Notification permission:', Notification.permission);
    console.log('   Example notification:');
    console.log('     Title: "New Message"');
    console.log('     Body: "You have a new notification"');
    console.log('     Actions: [View, Dismiss]');
  } else {
    console.log('   (Skipped in Node.js environment)');
  }

  console.log('\n5. 后台同步');
  console.log('   Background sync features:');
  console.log('   - Queue tasks for later execution');
  console.log('   - Automatic retry when online');
  console.log('   - IndexedDB persistence');
  
  if (typeof indexedDB !== 'undefined') {
    const syncManager = new BackgroundSyncManager();
    await syncManager.init();
    
    // 模拟添加任务
    const taskId = await syncManager.addTask('sync-form', {
      url: '/api/submit',
      data: { name: 'John', message: 'Hello' }
    });
    console.log('   Added sync task:', taskId);
    
    const pendingTasks = await syncManager.getPendingTasks();
    console.log('   Pending tasks:', pendingTasks.length);
  } else {
    console.log('   (Skipped in Node.js environment)');
  }

  console.log('\nPWA 要点:');
  console.log('- Service Worker: 离线功能的核心，拦截网络请求');
  console.log('- 缓存策略: 根据资源类型选择合适的缓存策略');
  console.log('- Manifest: 提供应用元数据，支持安装到主屏幕');
  console.log('- 推送通知: 即使应用关闭也能接收通知');
  console.log('- 后台同步: 网络恢复后自动发送失败请求');
  console.log('- 离线优先: 确保核心功能在离线时可用');
}

// ============================================================================
// 导出
// ============================================================================

;
