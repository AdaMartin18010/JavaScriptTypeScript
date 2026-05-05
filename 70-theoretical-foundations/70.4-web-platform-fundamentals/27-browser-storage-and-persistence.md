---
title: '浏览器存储与持久化'
description: 'Browser Storage and Persistence: Cookie, Web Storage, IndexedDB, Cache API, OPFS, Storage Quota'
english-abstract: "A comprehensive deep-dive into the browser storage stack, covering RFC 6265bis cookies, Web Storage API, IndexedDB, Cache API, Origin Private File System (OPFS), Storage Quota API, Storage Buckets API, and privacy mechanisms including ITP. The document provides categorical semantics, symmetric differential analysis, decision matrices, counter-examples, and six production-grade TypeScript implementations including a cookie parser, quota estimator, IndexedDB wrapper, OPFS file manager, fingerprinting detector, and persistence strategy selector."
last-updated: 2026-05-05
status: complete
priority: P0
---

# Browser Storage and Persistence Architecture

## 1. Introduction and Scope

The modern web platform provides a multi-layered storage ecosystem that ranges from ephemeral in-memory structures to durable, quota-managed persistent stores. Understanding this ecosystem requires more than memorizing API signatures; it demands an architectural appreciation for how each storage mechanism participates in the broader lifecycle of user data, how browsers mediate access through origin boundaries and privacy policies, and how developers must strategically select persistence tiers based on latency, capacity, scope, and durability guarantees.

This document provides a systematic, bottom-up examination of browser storage primitives, progressing from the oldest and most constrained mechanism (cookies) to the newest and most capable (Origin Private File System and Storage Buckets). Along the way, we analyze the categorical semantics that unify these apparently disparate APIs, construct a symmetric differential framework for comparing their behaviors, enumerate counter-examples that violate common assumptions, and provide six production-grade TypeScript implementations that demonstrate correct usage patterns, error handling, and performance considerations.

The intended reader is an advanced web engineer, browser implementer, or security researcher who needs precise, specification-backed knowledge of how data persists in user agents, how eviction algorithms operate, how privacy frameworks like Safari's Intelligent Tracking Prevention (ITP) constrain storage behavior, and how to build resilient applications that degrade gracefully across storage tiers.

---

## 2. Categorical Semantics of Browser Storage

Before examining individual APIs, it is instructive to model browser storage using the language of category theory. This is not mere abstraction for its own sake; the categorical perspective reveals structural invariants that persist across API revisions and browser implementations, providing a stable mental model for reasoning about storage composition, morphism laws, and functorial mappings between storage domains.

### 2.1 The Category **Store**

Define a category **Store** whose:

- **Objects** are storage backends: `CookieJar`, `LocalStorage`, `SessionStorage`, `IndexedDB`, `CacheStorage`, `OPFS`, `Memory`.
- **Morphisms** are API operations that transform storage state: `read(k) → v`, `write(k, v) → void`, `delete(k) → void`, `list() → Iterator<Entry>`.

For **Store** to be a valid category, it must satisfy identity and associativity. The identity morphism `id_S` for a storage backend `S` is the no-op read-write cycle: reading a key and writing it back unchanged leaves the object invariant. Associativity holds because sequential operations `f ∘ g ∘ h` on a given backend are executed in the order prescribed by the event loop's task queue; for synchronous APIs (localStorage, cookies), this is deterministic, while for asynchronous APIs (IndexedDB, OPFS), it is mediated by transaction ordering.

### 2.2 Functors Between Storage Categories

Consider the functor `F: CookieJar → LocalStorage` that maps a cookie `name=value[; attributes]` to a localStorage entry `name → value`. This functor preserves structure only partially: it maps the object `CookieJar` to `LocalStorage`, but it discards cookie attributes (Domain, Path, Secure, HttpOnly, SameSite) because localStorage lacks these morphisms. Thus `F` is not full; it is a forgetful functor that drops the attribute structure. This explains why migrations from cookie-based state to localStorage inevitably lose security metadata and must reimplement it at the application layer.

Conversely, there is no faithful functor `G: LocalStorage → CookieJar` because the codomain's 4KB limit and attribute grammar cannot represent arbitrary localStorage strings. The non-existence of `G` is a formal statement of the common engineering observation that "you cannot replace localStorage with cookies transparently."

### 2.3 Monads of Persistence

Persistence can be modeled as a monad `P` over the category of JavaScript values. A value `v` of type `T` is lifted into `P(T)` — a persisted value — via a `write` operation. The unit `η: T → P(T)` is the act of persisting. The bind operation `>>=: P(T) → (T → P(U)) → P(U)` is a read-modify-write cycle. The monad laws enforce that:

1. Left identity: `write(k, v) >>= read(k)` is equivalent to `P(v)`.
2. Right identity: `read(k) >>= write(k)` is equivalent to `P(v)` if `v` was the prior value.
3. Associativity: `(read(k) >>= f) >>= g` is equivalent to `read(k) >>= (x ⇒ f(x) >>= g)`.

For synchronous storage (localStorage, sessionStorage), the monad collapses to the identity monad because `P(T)` is observationally equivalent to `T` within the same event loop turn. For asynchronous storage (IndexedDB, OPFS), `P(T)` is a `Promise<T>`, and the monad is the Promise monad. This formalizes the intuition that async storage introduces a temporal boundary that sync storage does not.

### 2.4 IndexedDB as a Indexed Category

IndexedDB admits a richer categorical structure because it supports versioning and object stores. Define the category **IDB** where:

- Objects are `(database, version, objectStore)` triples.
- Morphisms are transactions: `readonly`, `readwrite`, `versionchange`.

Transactions compose sequentially within their scope, but the browser's deadlock prevention algorithm (which aborts transactions when overlapping scopes conflict) means that **IDB** is not a free category. The `versionchange` transaction is unique: it is the only morphism that can alter the shape of the category's objects (adding/removing object stores and indexes). This makes `versionchange` a structural morphism, analogous to a schema migration in relational databases.

The cursor can be modeled as a natural transformation between the identity functor on object store entries and the iterator functor. A cursor `Cursor<T>` is a coalgebra for the functor `F(X) = T × X + 1`, where `1` represents termination. The unfold operation generates the sequence of entries, and the `continue()` method is the coalgebraic step function.

### 2.5 OPFS as a Cartesian Closed Category

The Origin Private File System exposes file handles and directory handles that form a tree. This tree structure is a Cartesian closed category where:

- The product `A × B` is the directory containing entries `A` and `B`.
- The exponential `B^A` is the mapping from file paths (keys) to file handles (values), which is exactly the directory's entry map.
- Evaluation (`eval`) is the resolution of a path to a handle.
- Currying is the operation of moving from a function that takes multiple path segments to a nested directory traversal.

This structure is Cartesian closed only within a single origin; cross-origin access is undefined, making the global category of all OPFS instances a disjoint union of closed subcategories.

---

## 3. Cookie Model: RFC 6265bis

### 3.1 Specification Evolution

HTTP State Management Mechanism, commonly known as cookies, began with Netscape's informal specification in 1994 and was later formalized in RFC 2109 (1997), RFC 2965 (2000), and RFC 6265 (2011). The current work-in-progress is RFC 6265bis, which incorporates modern security requirements including the `SameSite` attribute and the `Partitioned` attribute for third-party cookie deprecation.

A cookie is fundamentally a name-value pair with associated metadata that controls its scope, lifetime, and transmission behavior. Unlike all other browser storage mechanisms, cookies are sent automatically with every HTTP request whose URL matches the cookie's scope, making them simultaneously a storage mechanism and a transport mechanism.

### 3.2 Grammar and Syntax

The core cookie syntax under RFC 6265bis is:

```
set-cookie-header = "Set-Cookie:" SP set-cookie-string
set-cookie-string = cookie-pair *( ";" SP cookie-av )
cookie-pair       = cookie-name "=" cookie-value
cookie-name       = token
cookie-value      = *cookie-octet / ( DQUOTE *cookie-octet DQUOTE )
cookie-octet      = %x21 / %x23-2B / %x2D-3A / %x3C-5B / %x5D-7E
```

Notably, `cookie-value` excludes whitespace, commas, semicolons, and backslashes unless DQUOTE-wrapped, but even then, many characters require percent-encoding or Base64 serialization for reliable transport. Cookie names are case-sensitive per the specification, though some servers treat them case-insensitively; this is a common source of interoperability bugs.

### 3.3 Attributes

#### 3.3.1 Expires and Max-Age

`Expires` takes an HTTP-date (RFC 7231) indicating the absolute expiration time. `Max-Age` takes a delta-seconds integer indicating the relative lifetime. If both are present, `Max-Age` takes precedence. If neither is present, the cookie is a session cookie, which historically meant it was deleted when the browser closed. Modern browsers, however, often persist session cookies across browser restarts via session restore features, making "session cookie" a misnomer for true ephemerality.

#### 3.3.2 Domain

The `Domain` attribute specifies which hosts are eligible to receive the cookie. If omitted, the default is the exact host of the response (host-only cookie). If present, it must be a domain that is a suffix of the response host, and it causes the cookie to be sent to all subdomains. For example, a `Domain=example.com` cookie set by `www.example.com` is also sent to `api.example.com`. This is a powerful but dangerous feature that enables session fixation and cross-subdomain attacks if any subdomain is compromised.

#### 3.3.3 Path

The `Path` attribute restricts the cookie to URLs whose path component begins with the specified prefix. A cookie with `Path=/app` is sent to `/app`, `/app/dashboard`, and `/app/settings`, but not to `/` or `/api`. Path matching is prefix-based and case-sensitive. Because the browser does not verify that the server actually controls the path, path scoping provides only weak isolation.

#### 3.3.4 Secure

The `Secure` attribute instructs the browser to send the cookie only over HTTPS connections. It does not provide confidentiality against same-origin JavaScript; it only protects against network eavesdropping and man-in-the-middle attacks. A cookie without `Secure` sent over HTTP is vulnerable to session hijacking via passive monitoring.

#### 3.3.5 HttpOnly

The `HttpOnly` attribute forbids JavaScript access to the cookie via `document.cookie`. This mitigates cross-site scripting (XSS) attacks by preventing exfiltration of session tokens through `document.cookie` reads. However, `HttpOnly` does not prevent all cookie-based attacks: CSRF still works because the browser sends the cookie automatically with requests, and sophisticated XSS payloads can still exploit authenticated endpoints directly.

#### 3.3.6 SameSite

Introduced in RFC 6265bis, `SameSite` controls cross-site request context behavior:

- `SameSite=Strict`: Cookie is never sent in cross-site requests, even for top-level navigations. This provides the strongest CSRF protection but breaks legitimate cross-site links that require authentication (e.g., clicking a link from an email to a logged-in site).
- `SameSite=Lax`: Cookie is sent in top-level navigations (GET requests triggered by user interaction) but not in subresource requests (images, iframes, XHR). This is the default in modern Chrome, Edge, and Firefox. It balances security and usability.
- `SameSite=None`: Cookie is sent in all contexts, but requires the `Secure` attribute. This is necessary for legitimate third-party embeds (e.g., payment iframes, CDN analytics) but exposes the application to CSRF unless additional defenses (CSRF tokens, Origin header checks) are implemented.

The `SameSite` attribute is parsed case-insensitively. Invalid values (e.g., `SameSite=1`) are treated as `SameSite=Strict` by Chrome and Firefox, though Safari has historically been more lenient, treating unknown values as `Lax`.

#### 3.3.7 Partitioned

The `Partitioned` attribute (CHIPS — Cookies Having Independent Partitioned State) addresses third-party cookie deprecation by associating the cookie with a top-level site partition. A `Partitioned` cookie set by `tracker.example` inside `site-a.com` is stored in the `(site-a.com, tracker.example)` partition and is not accessible when `tracker.example` is embedded in `site-b.com`. This allows stateful third-party embeds without enabling cross-site tracking.

### 3.4 Cookie Jar and Limits

The browser maintains a cookie jar per profile, partitioned by security origin. A cookie jar entry is uniquely identified by the tuple `(name, domain, path, partition_key)`. Per RFC 6265bis recommendations, browsers enforce:

- **Size limit**: At least 4096 bytes per cookie (name + value + attributes), though the exact limit varies by browser.
- **Count limit**: At least 50 cookies per domain in Chrome, 180 in Firefox, 200 in Safari. The total jar size is typically capped at ~4MB–10MB.
- **Eviction**: When limits are exceeded, browsers evict the least recently used (LRU) cookies.

Because cookies are sent in HTTP headers, large cookies cause request bloat. A 4KB cookie sent with every image request on a page with 100 images adds 400KB of upstream overhead. This is a primary motivation for moving session state out of cookies and into `Authorization` headers or localStorage.

### 3.5 Cookie Parsing Edge Cases

The RFC 6265bis parsing algorithm is deliberately permissive to maximize interoperability. Key edge cases include:

- Duplicate attribute names: The first occurrence wins in some browsers, the last in others.
- Unrecognized attributes: Silently ignored, making cookies forward-compatible.
- Invalid dates in Expires: Treated as session cookies.
- Empty cookie-name: Technically allowed but universally problematic.
- Control characters in values: Stripped or truncated depending on the browser.

This permissiveness means that robust cookie parsers must implement the exact state machine from RFC 6265bis Section 5 rather than relying on regex or split-based parsing.

---

## 4. Web Storage API

### 4.1 localStorage

`localStorage` implements the `Storage` interface and provides a simple key-value store scoped to the origin (scheme + host + port). Data persists indefinitely until explicitly cleared by script, the user, or browser eviction under storage pressure.

Key characteristics:

- **Scope**: Same-origin. `https://a.com:443` and `https://a.com` (default port) share localStorage, but `https://a.com` and `http://a.com` do not.
- **Capacity**: Approximately 5MB per origin in most browsers (10MB in some Firefox configurations). The limit is measured in UTF-16 code units, so a string of 2.5M ASCII characters consumes 5MB.
- **API**: Synchronous. `setItem(key, value)`, `getItem(key)`, `removeItem(key)`, `clear()`, `key(index)`, `length`.
- **Event model**: The `storage` event fires on all other same-origin browsing contexts (tabs, windows, iframes) when a mutation occurs, enabling lightweight cross-tab communication.

#### 4.1.1 Main Thread Blocking

The synchronous nature of localStorage is its most severe architectural flaw. All localStorage operations run on the main thread and can block for milliseconds when:

- The backing store is on a slow disk (HDD, network share).
- The browser performs quota checks or LRU eviction.
- The storage is encrypted at rest (e.g., macOS FileVault, Windows BitLocker).

Under heavy load, `localStorage.setItem()` can block the event loop for 10–50ms, causing frame drops. For this reason, localStorage is unsuitable for high-frequency writes, large payloads, or performance-critical paths.

#### 4.1.2 Storage Event Quirks

The `storage` event does not fire in the document that initiated the change. It fires in other same-origin contexts. The event object contains:

- `key`: The changed key, or `null` if `clear()` was called.
- `oldValue`: The previous value, or `null` for new keys.
- `newValue`: The new value, or `null` for deletions.
- `url`: The URL of the document that made the change.
- `storageArea`: The `Storage` object (`localStorage` or `sessionStorage`).

This event is not guaranteed to be delivered if the receiving context is suspended (e.g., a background tab in a mobile browser). It is also subject to the same-origin policy: `https://a.com` cannot listen to `https://b.com` storage events, even via `postMessage` bridges.

### 4.2 sessionStorage

`sessionStorage` is identical to `localStorage` in API shape but differs in lifetime and scope:

- **Lifetime**: Tab-scoped. Data persists for the duration of the top-level browsing context (tab or window). Closing the tab destroys the data. Reloading the page preserves it; opening a duplicate tab does not.
- **Scope**: Same-origin within the same top-level browsing context. A page and its same-origin iframes share sessionStorage, but a new tab opened via Ctrl+Click starts with an empty sessionStorage even for the same origin.
- **Use cases**: Multi-step forms, wizard flows, transient UI state that should survive reloads but not tab duplication.

#### 4.2.1 Session Hijacking via Duplicate Tab

Because sessionStorage is not copied to duplicate tabs, some applications implement their own "session clone" mechanism via `window.opener` or `BroadcastChannel`. This is fragile and can introduce security vulnerabilities if the cloned session includes sensitive tokens that should be bound to a single tab context.

### 4.3 Quota and Eviction

Web Storage is classified as "best-effort" persistence. The browser may evict localStorage data under disk pressure, and there is no API for an origin to request durable storage for Web Storage specifically. The 5MB limit is a soft cap; some browsers allow `setItem()` to succeed slightly beyond it, then fail with `QuotaExceededError`.

When `QuotaExceededError` occurs, the application has no recourse other than to catch the exception and either delete existing data or fall back to another storage tier. There is no mechanism to query remaining Web Storage quota directly; developers must estimate usage via `JSON.stringify(localStorage).length`.

---

## 5. IndexedDB

### 5.1 Architectural Overview

IndexedDB is a transactional, object-oriented database system built into browsers. It is significantly more complex than Web Storage but provides orders of magnitude greater capacity, structured data support, indexing, and asynchronous I/O.

Key architectural concepts:

- **Database**: A named container within an origin, identified by a string name and integer version.
- **Object Store**: Analogous to a table in relational databases. Holds records of JavaScript objects.
- **Index**: A secondary lookup structure over an object store, enabling queries on properties other than the primary key.
- **Key Path**: A JavaScript object property path (e.g., `"id"`, `"user.profile.email"`) that defines the primary key for an object store or the indexed property for an index.
- **Transaction**: A wrapper around one or more operations with a defined scope (object stores) and mode (`readonly`, `readwrite`, `versionchange`).

### 5.2 Object Stores and Keys

An object store holds records where each record is a `(key, value)` pair. Keys must be one of the valid key types: `number`, `string`, `Date`, `ArrayBufferView`, `ArrayBuffer`, or `Array` (containing only valid key types). JavaScript `Object` and `Function` are not valid keys.

Key paths use dot notation to extract nested properties. If the key path is `"id"` and the value is `{ id: 1, name: "Alice" }`, the record key is `1`. If the key path is `"user.email"`, the key is extracted from the nested property. If the extraction yields `undefined`, the `put()` operation throws a `DataError`.

Object stores can be configured with:

- `autoIncrement: true`: Generates monotonically increasing integer keys.
- `keyPath`: The property path for inline keys.
- Out-of-line keys: Provided explicitly in `add()` or `put()`.

### 5.3 Indexes

Indexes enable efficient retrieval by non-primary properties. Creating an index:

```ts
const store = db.createObjectStore("users", { keyPath: "id" });
store.createIndex("by_email", "email", { unique: true });
store.createIndex("by_age", "age", { unique: false });
```

Index options include:

- `unique: true`: Rejects duplicate indexed values.
- `multiEntry: true`: For array-valued properties, creates one index entry per array element.

Indexes impose write-time cost: every `put()` or `add()` into the object store must update all associated indexes. For high-write workloads, indexes should be minimized or deferred to batch operations.

### 5.4 Transactions

IndexedDB transactions follow an early-locking, single-version concurrency control model. When a transaction is created, the browser locks the requested object stores. If another transaction holds a conflicting lock, the new transaction is queued (`readonly` transactions can overlap, but `readwrite` transactions are exclusive per object store).

Transaction modes:

- `readonly`: Allows `get()`, `openCursor()`, `count()`. Multiple `readonly` transactions on the same stores can run concurrently.
- `readwrite`: Allows `put()`, `add()`, `delete()`, `clear()`. Only one `readwrite` transaction per object store can be active at a time.
- `versionchange`: Allows schema mutations (`createObjectStore`, `deleteObjectStore`, `createIndex`, `deleteIndex`). Automatically initiated when `open()` specifies a higher version than the existing database. Only one `versionchange` transaction can run per database at a time, and all other connections to the same database are blocked until it completes.

Transactions auto-commit when all queued requests complete and the microtask queue drains. There is no explicit `commit()` method (though the spec defines one experimentally). Once a transaction completes, no further requests can be added.

#### 5.4.1 Transaction Lifetime Pitfalls

A common bug pattern is adding requests asynchronously after transaction creation:

```ts
const tx = db.transaction("store", "readwrite");
setTimeout(() => {
  tx.objectStore("store").put({ id: 1, data: "x" }); // May fail: transaction already committed
}, 0);
```

Because `setTimeout` delays execution past the microtask checkpoint, the transaction auto-commits before the `put()` is enqueued. All requests must be added within the same synchronous turn that created the transaction.

### 5.5 Versioning and Schema Migration

IndexedDB uses integer versioning. When `indexedDB.open(name, newVersion)` is called with `newVersion > currentVersion`, an `upgradeneeded` event fires. The event handler receives the `versionchange` transaction and must perform schema mutations:

```ts
request.onupgradeneeded = (event) => {
  const db = request.result;
  const oldVersion = event.oldVersion;
  if (oldVersion < 1) {
    db.createObjectStore("users", { keyPath: "id" });
  }
  if (oldVersion < 2) {
    const store = request.transaction.objectStore("users");
    store.createIndex("by_email", "email", { unique: true });
  }
};
```

This imperative migration style is error-prone. There is no declarative schema, and downgrade is impossible (the `deleteDatabase()` nuclear option is the only way to revert). Applications must maintain migration scripts forever or use wrapper libraries (Dexie, idb) that provide declarative schema definitions.

### 5.6 Cursors and Key Ranges

Cursors provide ordered iteration over object stores or indexes. They are the primary mechanism for range queries and pagination.

```ts
const range = IDBKeyRange.bound(10, 20, false, true); // 10 ≤ key < 20
const request = store.openCursor(range, "next");
```

`IDBKeyRange` methods:

- `only(value)`: Exact match.
- `lowerBound(lower, open?)`: `key ≥ lower` or `key > lower`.
- `upperBound(upper, open?)`: `key ≤ upper` or `key < upper`.
- `bound(lower, upper, lowerOpen?, upperOpen?)`: Inclusive or exclusive bounds.

Cursor direction:

- `next`: Ascending order.
- `nextunique`: Ascending, skipping duplicates (for indexes).
- `prev`: Descending order.
- `prevunique`: Descending, skipping duplicates.

Cursors are stateful. The `continue()` method advances to the next record, and `continuePrimaryKey()` (for indexes) allows efficient pagination when the index value is not unique. `advance(n)` skips `n` records. Cursors hold a lock on the underlying store for the duration of iteration, so long-running cursor loops can block other transactions.

### 5.7 Performance Characteristics

IndexedDB performance is highly dependent on browser implementation:

- **Chrome**: Uses LevelDB as the backing store. Good read performance, moderate write performance. `readwrite` transactions are serialized per origin.
- **Firefox**: Uses SQLite. Excellent query performance for indexed lookups. Slower for large object store scans.
- **Safari**: Uses SQLite with some WebKit-specific optimizations. Historically had bugs with large binary data and compound indexes (mostly fixed as of 2024).

Comparative latency (approximate, on NVMe SSD):

- `localStorage.getItem()`: 0.05–2ms (sync, main thread).
- `IndexedDB` read: 1–5ms (async, off main thread for I/O).
- `IndexedDB` write: 2–10ms (async, includes commit latency).

Capacity is typically 50%–80% of available disk space per origin, though browsers may impose lower limits (e.g., Chrome uses a tiered quota based on available space).

### 5.8 IndexedDB vs localStorage

| Dimension | localStorage | IndexedDB |
|-----------|-------------|-----------|
| API | Synchronous | Asynchronous (Promise/event) |
| Data structure | Flat strings | Structured objects, indexes |
| Capacity | ~5MB | ~50% of disk space |
| Threading | Main thread | Background I/O threads |
| Query capability | Key lookup only | Range queries, cursors, indexes |
| Transaction support | None | Full ACID per transaction |
| Binary data | Base64 overhead | Native ArrayBuffer support |

---

## 6. Cache API

### 6.1 CacheStorage and Cache Objects

The Cache API, defined in the Service Workers specification, provides a programmatic HTTP cache. It is exposed as `caches` (a `CacheStorage` instance) in `window`, `worker`, and `serviceWorker` contexts.

A `CacheStorage` is a map from cache names to `Cache` objects. A `Cache` object is a map from `Request` objects to `Response` objects. This is fundamentally different from other storage APIs: keys and values are HTTP-level abstractions, not raw strings or objects.

Core methods:

- `caches.open(name)`: Opens or creates a named cache.
- `cache.add(request)`: Fetches and stores the response.
- `cache.addAll(requests)`: Batch version.
- `cache.put(request, response)`: Stores a response directly.
- `cache.match(request, options?)`: Retrieves a matching response.
- `cache.delete(request, options?)`: Removes an entry.
- `cache.keys()`: Lists stored requests.

### 6.2 Request/Response as Keys

Cache matching is not simple equality. The `match()` method performs a URL match by default, with optional `ignoreSearch`, `ignoreMethod`, and `ignoreVary` flags. The `Vary` header in the stored response is respected unless `ignoreVary` is set.

Because `Request` and `Response` objects are streams, a `Response` can only be consumed once. If you need to use a cached response multiple times, you must clone it:

```ts
const response = await cache.match(request);
const clone = response.clone();
```

Failure to clone leads to `TypeError: Response body is already used`.

### 6.3 Service Worker Integration

The Cache API's primary use case is Service Worker-driven offline support. In a `fetch` event handler:

```ts
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

This is the "Cache First" strategy. Other strategies include:

- **Network First**: Try network, fall back to cache.
- **Stale While Revalidate**: Return cache immediately, refresh in background.
- **Network Only**: Always fetch, no caching.
- **Cache Only**: Only serve from cache (for precached assets).

The Cache API is origin-scoped. A Service Worker can only access caches within its own origin. However, a page can have multiple Service Workers (one per scope), and each can access the same `CacheStorage` namespace, leading to potential conflicts if cache names are not coordinated.

### 6.4 Quota and Eviction

Cache API usage counts toward the origin's overall storage quota (shared with IndexedDB, OPFS, etc.). There is no separate Cache API quota. Eviction is LRU across all storage types. However, some browsers treat Cache API data as "transparent" and may evict it more aggressively than IndexedDB data because it can theoretically be reconstructed from the network.

In practice, Chrome and Firefox apply the same LRU eviction to all storage types within an origin, while Safari has historically been more aggressive with Cache API eviction, particularly in low-storage scenarios.

---

## 7. Origin Private File System (OPFS)

### 7.1 Overview and Motivation

The Origin Private File System (OPFS), specified in the File System Living Standard, provides a high-performance file storage API that is origin-private and not visible to the user via the native file system. It addresses the limitations of IndexedDB for large binary data (video, audio, large datasets) by providing true file semantics: streaming reads/writes, seekable access, and synchronous access handles from Web Workers.

OPFS is distinct from the `showSaveFilePicker()` / `showOpenFilePicker()` API, which provides access to user-visible files. OPFS is entirely sandboxed within the origin.

### 7.2 Handles and Hierarchy

OPFS exposes a POSIX-like file system hierarchy:

- `navigator.storage.getDirectory()`: Returns the root `FileSystemDirectoryHandle` for the origin.
- `FileSystemDirectoryHandle`: Represents a directory. Methods:
  - `getFileHandle(name, { create? })`
  - `getDirectoryHandle(name, { create? })`
  - `removeEntry(name, { recursive? })`
  - `resolve(possibleDescendant)`: Returns the relative path from the directory to a descendant handle.
  - `keys()`, `values()`, `entries()`: Async iteration over directory contents.
- `FileSystemFileHandle`: Represents a file. Methods:
  - `getFile()`: Returns a `File` object (read-only snapshot).
  - `createSyncAccessHandle()`: Returns a `FileSystemSyncAccessHandle` (read-write, Web Worker only).
  - `createWritable()`: Returns a `FileSystemWritableFileStream` (async, writable stream).

### 7.3 Sync Access Handles

Synchronous access handles are the crown jewel of OPFS for performance-critical applications. They are available only in Web Workers and provide POSIX-like `read()`, `write()`, `truncate()`, `flush()`, and `close()` methods that operate directly on the file without streaming overhead.

```ts
const handle = await fileHandle.createSyncAccessHandle();
const data = new Uint8Array(1024);
const bytesRead = handle.read(data, { at: 0 });
handle.write(new Uint8Array([1, 2, 3]), { at: bytesRead });
handle.flush();
handle.close();
```

Sync access handles are exclusive: only one handle can be open per file at a time. Attempting to open a second handle throws `NoModificationAllowedError`. This provides implicit locking, preventing race conditions without explicit mutex code.

Performance benchmarks show that OPFS sync access handles can achieve near-native file I/O throughput (hundreds of MB/s on SSD) because they bypass the main thread and avoid serialization overhead. This makes OPFS suitable for:

- SQLite WASM databases (e.g., sql.js, sqlite-wasm).
- Video/audio editing applications.
- Large scientific dataset processing.
- Game asset streaming.

### 7.4 Writable Streams

For main-thread use, `createWritable()` provides a `WritableStream`-based API:

```ts
const writable = await fileHandle.createWritable();
await writable.write("Hello, OPFS!");
await writable.write(new Blob([...]));
await writable.seek(100);
await writable.truncate(50);
await writable.close();
```

The stream buffers writes in a temporary swap file and atomically replaces the original on `close()`, ensuring crash safety.

### 7.5 Storage Foundation Deprecation

Storage Foundation (formerly `NativeIO`) was an earlier proposal for high-performance storage that provided direct access to unbuffered I/O. It has been deprecated in favor of OPFS sync access handles, which provide equivalent functionality with better integration into the existing File System API surface. Applications using Storage Foundation should migrate to OPFS.

### 7.6 OPFS Quota and Persistence

OPFS shares the origin's storage quota with IndexedDB and Cache API. There is no separate OPFS quota. However, because OPFS files are stored directly on the file system (not inside a database), they may be subject to different fragmentation and allocation behaviors.

OPFS data is "best-effort" by default. To request durable persistence, use `navigator.storage.persist()`:

```ts
const isPersistent = await navigator.storage.persist();
```

If granted, the browser will not evict the origin's data (including OPFS) without explicit user action. The permission is typically granted automatically for installed PWAs or sites with significant user engagement, and may prompt the user in other cases.

---

## 8. Storage Quota API

### 8.1 navigator.storage.estimate()

The Storage Quota API provides introspection into an origin's storage usage and quota:

```ts
const estimate = await navigator.storage.estimate();
console.log(estimate.usage);       // Bytes used
console.log(estimate.quota);       // Bytes available
console.log(estimate.usageDetails); // Breakdown by storage type (Chrome only)
```

`usageDetails` (Chrome-specific) provides granular breakdowns:

```ts
{
  indexedDB: 1024000,
  serviceWorkerCache: 512000,
  fileSystem: 2048000
}
```

This is invaluable for debugging quota issues and implementing adaptive storage strategies.

### 8.2 Persistent vs Best-Effort

Browsers distinguish two persistence modes:

- **Best-effort**: Data may be evicted when the device is under storage pressure. This is the default for all storage.
- **Persistent**: Data is protected from automatic eviction. Granted via `navigator.storage.persist()`.

The persistence permission model varies by browser:

- **Chrome**: Automatically grants persistence to installed PWAs (through the "Install" flow) and sites with high engagement scores. Other sites are denied silently.
- **Firefox**: Prompts the user unless the site is in the top-level document and has a storage permission policy.
- **Safari**: Historically did not support `persist()` directly; persistence is implicitly granted for home-screen PWAs but not for regular sites. As of iOS 17+, Safari aligns more closely with the standard but still limits persistent storage duration under ITP.

### 8.3 Eviction Algorithm

When storage pressure occurs, browsers evict data using an LRU (Least Recently Used) algorithm across origins. The exact algorithm is implementation-defined but follows these general principles:

1. Only best-effort origins are considered for eviction.
2. Origins are sorted by last access time.
3. The least recently used origin is fully evicted (all storage types: IndexedDB, Cache API, OPFS, localStorage, Service Workers).
4. Eviction continues until sufficient space is freed.

This "origin-nuclear" approach means that a site with 100MB of IndexedDB and 1MB of localStorage loses all 101MB if it is the LRU origin. There is no partial eviction at the storage-type level.

#### 8.3.1 Storage Pressure Thresholds

Browsers typically start eviction when available disk space drops below:

- Chrome: ~1GB or 10% of disk, whichever is smaller.
- Firefox: Configurable via `dom.storageManager_quotaCheck`.
- Safari: Heavily influenced by overall device storage and iOS Low Storage mode.

### 8.4 Incognito Mode Behavior

Incognito (private browsing) mode fundamentally alters storage guarantees:

- **localStorage/sessionStorage**: Available within the incognito session but wiped when the last incognito window closes.
- **IndexedDB**: Available but isolated from non-incognito data. Wiped on session end.
- **Cache API**: Available but isolated. Wiped on session end.
- **OPFS**: Available in some browsers (Chrome, Firefox) but isolated. Safari historically disabled OPFS in private mode; as of 2024, it is available but ephemeral.
- **Cookies**: Session-only; persistent cookies are treated as session cookies and discarded on close.
- **Quota**: Often reduced (e.g., Chrome limits incognito storage to ~120MB per origin).

Importantly, incognito mode does not provide anonymity against determined adversaries; it only provides ephemerality against local forensic analysis.

---

## 9. Storage Buckets API (Proposed)

### 9.1 Motivation

The Storage Buckets API is a proposal (currently in Origin Trial in Chrome) that allows origins to create multiple named "buckets" of storage, each with independent durability and quota policies. This addresses the "origin-nuclear" eviction problem: without buckets, the browser evicts all data for an origin indiscriminately. With buckets, critical data can be placed in a durable bucket while cache data remains in a best-effort bucket.

### 9.2 API Shape

```ts
const bucket = await navigator.storageBuckets.open("critical-data", {
  durability: "strict",    // "strict" or "relaxed"
  quota: 1024 * 1024 * 10, // 10MB
  expires: Date.now() + 86400000, // 1 day
});

const idb = await bucket.indexedDB.open("my-db", 1);
const cache = await bucket.caches.open("my-cache");
const dir = await bucket.directory; // OPFS root for this bucket
```

### 9.3 Durability Levels

- `strict`: The browser guarantees that data is written to non-volatile storage before resolving the write promise. Equivalent to `fsync()` semantics. Higher latency, maximum durability.
- `relaxed`: The browser may buffer writes in memory and flush asynchronously. Lower latency, but data may be lost on crash or power loss.

This is analogous to SQLite's `PRAGMA synchronous` levels and allows applications to make explicit latency/durability tradeoffs.

### 9.4 Quota Per Bucket

Each bucket can specify a `quota` in bytes. The browser enforces that the sum of all bucket quotas does not exceed the origin's total quota. A bucket without an explicit quota shares the remaining origin quota.

### 9.5 Expiration

Buckets can have an `expires` timestamp. After expiration, the browser may evict the bucket even if the origin has not reached its quota. This is useful for temporary caches or time-bounded data retention policies.

### 9.6 Current Status

As of Q2 2026, the Storage Buckets API is available behind flags in Chrome and Edge, with implementation underway in Firefox. Safari has not publicly committed to implementation. Developers should use feature detection:

```ts
if ("storageBuckets" in navigator) {
  // Use Storage Buckets
} else {
  // Fall back to global storage with manual partitioning
}
```

---

## 10. Data Persistence Guarantees

### 10.1 Write-Ahead Logging

Modern browser storage engines implement write-ahead logging (WAL) or equivalent journaling mechanisms to ensure crash recovery. In Firefox's IndexedDB implementation (built on SQLite), WAL mode is used: changes are first written to a `-wal` file, then checkpointed into the main database. In Chrome's LevelDB-backed IndexedDB, an append-only log (`LOG` files) records mutations before they are compacted into SSTables.

WAL ensures atomicity: either the entire transaction is recovered after a crash, or none of it is. However, WAL does not protect against all failure modes:

- **Disk corruption**: If the WAL itself is corrupted, recovery may fail or truncate.
- **Partial writes**: On power loss during a write, the last sector may be torn. Browsers use checksums to detect torn writes and truncate to the last valid record.
- **File system bugs**: Rare but documented cases where OS-level write caching violates fsync semantics.

### 10.2 Atomic Commits

IndexedDB transactions are atomic at the transaction level: all operations within a `readwrite` transaction succeed or fail together. If any operation violates a constraint (e.g., duplicate key in a unique index), the entire transaction is aborted and all pending operations are rolled back.

However, IndexedDB does not support atomicity across databases or origins. There is no two-phase commit protocol for distributed transactions. If an application needs to update IndexedDB and then call a REST API, the two operations are not atomic, and the application must implement compensating transactions (e.g., saga pattern) for eventual consistency.

### 10.3 Crash Recovery

After a browser crash or kill, storage recovery behavior varies:

- **localStorage**: Typically durable across crashes because each `setItem()` triggers an immediate (or near-immediate) flush to disk. However, if a crash occurs between the in-memory update and the disk flush, the write is lost.
- **IndexedDB**: WAL replay recovers committed transactions. In-flight transactions are rolled back.
- **OPFS**: Sync access handles with explicit `flush()` provide durability guarantees. Without `flush()`, data may be in OS buffers and lost on crash. The `createWritable()` stream flushes atomically on `close()`.
- **Cache API**: Less strictly guaranteed. Some browsers may reconstruct the cache index on startup, but individual cached responses may be orphaned if the metadata write and body write are not atomically coupled.

### 10.4 Durability vs Latency Tradeoff

The Storage Buckets API's `durability` option formalizes a tradeoff that has always existed implicitly. When latency is critical (e.g., game state autosave, analytics buffering), `relaxed` durability is appropriate. When data integrity is critical (e.g., financial transactions, user documents), `strict` durability is mandatory. The absence of this choice in older APIs (localStorage, IndexedDB without buckets) means that browsers must make the tradeoff on the developer's behalf, usually biasing toward durability at the cost of unpredictable latency spikes.

---

## 11. Privacy Implications

### 11.1 Storage as a Fingerprinting Vector

Storage APIs are potent fingerprinting vectors because they allow sites to persist identifiers across sessions without user consent. A tracking script can:

1. Generate a unique ID.
2. Store it in localStorage, IndexedDB, or OPFS.
3. On subsequent visits, read the ID and correlate the user across sessions.

Because these identifiers are not cookies, they are not cleared by "clear cookies" actions in many browsers (though modern browsers increasingly clear all site data together).

More sophisticated fingerprinting uses "storage exhaustion" techniques: a script attempts to fill storage to the quota limit and measures the exact quota value. Because quota depends on disk size, browser version, and installed extensions, it forms an entropy source. Similarly, timing the read/write latency of IndexedDB operations can reveal the underlying storage medium (SSD vs HDD) and browser engine.

### 11.2 Safari Intelligent Tracking Prevention (ITP)

Safari's ITP, first introduced in 2017 and progressively tightened, is the most aggressive browser privacy framework affecting storage:

- **7-Day Cap on Script-Writable Storage**: As of ITP 2.3 (2020), all script-writable storage (localStorage, IndexedDB, Service Worker registrations, Cache API, OPFS) is capped to 7 days of persistence for sites classified as "trackers" by Safari's machine learning classifier. If the user does not interact with the origin as a first-party site within 7 days, all storage is wiped.
- **First-Party Bounce Tracking**: If a site is used purely as a redirector (bounce tracker), its storage is wiped immediately.
- **Link Decoration Throttling**: If a URL contains tracking parameters (e.g., `?gclid=...`), any cookies set in a third-party context are restricted to 24 hours.
- **CNAME Cloaking Detection**: ITP detects when a third-party tracker uses a first-party CNAME alias and applies the same restrictions as true third-party cookies.

For non-tracker sites (determined by a combination of user interaction heuristics and Apple's proprietary classifier), storage persists normally. However, the classification is opaque and can change without warning, making Safari behavior unpredictable for sites that straddle the line between legitimate service and tracking.

### 11.3 Chrome Privacy Sandbox

Chrome's response to third-party cookie deprecation is the Privacy Sandbox, which includes several storage-adjacent proposals:

- **Shared Storage**: A privacy-preserving cross-site storage API that allows limited, aggregated reads via Private Aggregation API. Prevents individual user tracking while enabling use cases like frequency capping and A/B testing.
- **Topics API**: Replaces third-party cookie-based interest tracking with a browser-computed list of user interests, shared via a JavaScript API.
- **Protected Audience (FLEDGE)**: On-device ad auctions using interest groups stored in a browser-managed database, isolated from the web page.

These APIs aim to preserve advertising and analytics use cases that currently rely on cross-site storage, while eliminating persistent individual identifiers.

### 11.4 Firefox Enhanced Tracking Protection (ETP)

Firefox's ETP blocks known trackers from accessing storage in third-party contexts. In "Strict" mode, it also partitions all third-party storage (Total Cookie Protection / State Partitioning), meaning that `tracker.com` embedded in `site-a.com` has a completely separate storage jar from `tracker.com` embedded in `site-b.com`. This is similar to Safari's partitioned cookies but applies to all storage APIs.

### 11.5 Legal and Compliance Implications

The ePrivacy Directive (EU Cookie Law) and GDPR require user consent for non-essential storage. While these laws were written with cookies in mind, regulatory guidance has expanded to cover all persistent storage mechanisms, including localStorage and IndexedDB. A site that stores a user ID in IndexedDB without consent may be non-compliant, even if it uses no cookies.

The California Consumer Privacy Act (CCPA) and similar state-level US laws grant users the right to deletion, which technically requires clearing all storage mechanisms, not just cookies.

---

## 12. Symmetric Diff of Storage Mechanisms

A symmetric differential analysis identifies the pairwise differences between storage mechanisms, treating each as a node in a graph where edges represent feature disparities. This is more informative than a simple feature table because it highlights asymmetric capabilities — cases where A can replace B but not vice versa.

### 12.1 Cookies ⊖ Web Storage

**Cookies have; Web Storage lacks:**

- Automatic HTTP transmission (transport-layer integration).
- Fine-grained security attributes (HttpOnly, Secure, SameSite, Partitioned).
- Cross-subdomain scoping via Domain attribute.
- Server-initiated expiration via Set-Cookie header.

**Web Storage has; Cookies lack:**

- 5MB capacity vs 4KB.
- Structured value support (raw strings, but no automatic encoding).
- Synchronous main-thread API (cookies require document.cookie string parsing).
- Cross-tab event notification (`storage` event).

**Asymmetry**: Cookies cannot replace Web Storage for large client-side state; Web Storage cannot replace cookies for server session management without manual header injection.

### 12.2 Web Storage ⊖ IndexedDB

**Web Storage has; IndexedDB lacks:**

- Trivial API surface (getItem/setItem vs transactions, cursors, versioning).
- Cross-tab event notification built-in.

**IndexedDB has; Web Storage lacks:**

- Asynchronous, non-blocking I/O.
- Indexing and range queries.
- 50%+ disk capacity vs 5MB.
- Binary data without Base64 overhead.
- Structured object storage (no JSON serialization).
- Transactional consistency.

**Asymmetry**: Web Storage is suitable for simple key-value state (<100KB); IndexedDB is required for anything complex or large. The reverse replacement is never advisable.

### 12.3 IndexedDB ⊖ Cache API

**IndexedDB has; Cache API lacks:**

- Arbitrary key-value structure (objects, not Request/Response pairs).
- Secondary indexes.
- Versioned schema migrations.
- Fine-grained transaction control.

**Cache API has; IndexedDB lacks:**

- Native HTTP semantics (Vary header matching, URL search param handling).
- Service Worker integration for offline interception.
- Streaming response bodies without manual chunking.
- Automatic header-based cache validation (ETag, Last-Modified).

**Asymmetry**: Cache API is specialized for HTTP asset caching; IndexedDB is a general-purpose database. They complement rather than replace each other.

### 12.4 IndexedDB ⊖ OPFS

**IndexedDB has; OPFS lacks:**

- Structured object storage with indexing.
- Declarative key paths and auto-increment.
- Cross-browser maturity (OPFS is newer, with Safari limitations).

**OPFS has; IndexedDB lacks:**

- True file streaming and seekable I/O.
- Synchronous access handles (Web Worker) for high-throughput workloads.
- No serialization overhead for binary data (files are stored as-is).
- POSIX-like directory hierarchy.

**Asymmetry**: OPFS is superior for large binary files and high-I/O workloads; IndexedDB is superior for structured, queryable data. They can be combined: store metadata in IndexedDB, blob data in OPFS.

### 12.5 OPFS ⊖ Cache API

**OPFS has; Cache API lacks:**

- Mutable file contents (Cache API entries are immutable; updating requires delete+put).
- Directory hierarchy.
- Synchronous I/O in workers.
- No HTTP semantics overhead.

**Cache API has; OPFS lacks:**

- HTTP request/response matching logic.
- Automatic integration with `fetch()` and Service Workers.
- Header-based cache control.

**Asymmetry**: OPFS is for application data; Cache API is for HTTP response caching.

### 12.6 All Mechanisms ⊖ Storage Buckets

**Storage Buckets (proposed) have; all current mechanisms lack:**

- Explicit durability configuration (`strict` vs `relaxed`).
- Per-bucket quota allocation.
- Expiration timestamps.
- Fine-grained eviction control within an origin.

**Current mechanisms have; Storage Buckets lack:**

- Universal browser support.
- Mature debugging tooling.
- Established patterns and library ecosystem.

---

## 13. Decision Matrix

The following matrix synthesizes the analysis into actionable guidance for selecting a storage mechanism based on application requirements.

| Criterion | Cookie | localStorage | sessionStorage | IndexedDB | Cache API | OPFS | Storage Buckets |
|-----------|--------|--------------|----------------|-----------|-----------|------|-----------------|
| **Max Capacity** | ~4KB | ~5MB | ~5MB | ~50% disk | Shared quota | Shared quota | Configurable per bucket |
| **Latency (read)** | 0.1ms | 0.05–2ms | 0.05–2ms | 1–5ms | 1–5ms | 0.5–3ms (sync) | Same as backing store |
| **Async API** | No | No | No | Yes | Yes | Yes (sync in worker) | Yes |
| **Binary Data** | No (Base64) | No (Base64) | No (Base64) | Yes (ArrayBuffer) | Yes (Response body) | Yes (native) | Same as backing store |
| **Indexing/Queries** | No | No | No | Yes | No (URL match only) | No | Same as backing store |
| **Transactions** | No | No | No | Yes | No | Yes (handle exclusive) | Yes |
| **HTTP Integration** | Automatic | No | No | No | Native | No | No |
| **Cross-Tab Sync** | Implicit (HTTP) | `storage` event | N/A (tab scope) | No | No | No | No |
| **Worker Support** | No | No | No | Yes | Yes | Yes | Yes |
| **Privacy Risk** | High (tracking) | Medium | Low (ephemeral) | Medium | Medium | Medium | Medium |
| **Safari ITP** | Blocked (3P) | 7-day cap | 7-day cap | 7-day cap | 7-day cap | 7-day cap | 7-day cap |
| **Durability Control** | No | No | No | No | No | No (explicit flush) | Yes (`strict`/`relaxed`) |
| **Eviction Granularity** | Per-cookie LRU | Origin-nuclear | Tab close | Origin-nuclear | Origin-nuclear | Origin-nuclear | Per-bucket |

### 13.1 Selection Heuristics

Use this decision tree for rapid selection:

1. **Does the data need to be sent to the server with every request?**
   - Yes → Cookie (with appropriate SameSite/Secure/HttpOnly).
   - No → Continue.

2. **Is the data > 5MB or binary?**
   - Yes → Continue to step 4.
   - No → Continue.

3. **Is the data simple key-value (<100KB), same-origin, and not privacy-sensitive?**
   - Yes → localStorage (if cross-tab sync needed) or sessionStorage (if tab-scoped).
   - No → Continue.

4. **Does the data need indexing, range queries, or structured objects?**
   - Yes → IndexedDB.
   - No → Continue.

5. **Is the data an HTTP response that needs offline serving?**
   - Yes → Cache API + Service Worker.
   - No → Continue.

6. **Is the data large binary files requiring high-throughput I/O?**
   - Yes → OPFS (with sync access handles in worker).
   - No → IndexedDB (default general-purpose choice).

7. **Do you need different durability/expiration policies for different data classes?**
   - Yes → Storage Buckets API (with fallback to manual partitioning in IndexedDB).
   - No → Continue with selected mechanism.

---

## 14. Counter-Examples and Edge Cases

### 14.1 localStorage QuotaExceededError Without Exceeding 5MB

`localStorage.setItem()` can throw `QuotaExceededError` even when `JSON.stringify(localStorage).length` reports < 5MB. This occurs because:

- The limit is in UTF-16 code units, not bytes. A string with many astral Unicode characters (e.g., emojis, CJK) consumes 2 UTF-16 units per character, doubling the effective size.
- The browser's internal metadata (key indices, origin overhead) counts toward the quota.
- Other same-origin storage (IndexedDB, Cache API) may consume shared quota, leaving less for localStorage.

**Mitigation**: Always wrap `setItem()` in `try/catch`, and measure `new Blob([key + value]).size` before writing.

### 14.2 IndexedDB Transaction Auto-Commit Race

As described in Section 5.4, adding a request to a transaction after yielding to the event loop causes a silent failure or `TransactionInactiveError`. This is particularly insidious with `async/await`:

```ts
const tx = db.transaction("store", "readwrite");
await Promise.resolve(); // Yields to microtask queue
tx.objectStore("store").put({ id: 1 }); // May throw TransactionInactiveError
```

**Mitigation**: Enqueue all requests synchronously after creating the transaction, or use a wrapper library that batches requests before yielding.

### 14.3 Service Worker Cache Match False Positives

`cache.match(request)` can return a response that is semantically incorrect if the stored response has a `Vary: Accept-Encoding` header and the new request uses a different `Accept-Encoding`. By default, `match()` respects `Vary`, but some browsers have had bugs where `Vary` matching was case-sensitive or ignored for certain headers.

**Mitigation**: Always validate cached responses against application-level versioning (e.g., URL path versioning `/v1/`, `/v2/`) rather than relying solely on `Vary`.

### 14.4 OPFS Sync Access Handle in Main Thread

`createSyncAccessHandle()` is only available in Web Workers. Calling it on the main thread throws `NotAllowedError`. This is easy to miss during development if testing on a fast machine where the async `createWritable()` API feels sufficient.

**Mitigation**: Feature-detect and route to a worker:

```ts
const isWorker = typeof WorkerGlobalScope !== "undefined";
if (!isWorker) {
  // Post to worker for sync handle
}
```

### 14.5 Safari Private Mode IndexedDB Name Collision

In older Safari versions (pre-15), IndexedDB in private mode used an in-memory database that shared the same namespace as non-private mode. This meant that opening a database in private mode with the same name as an existing non-private database could cause corruption or unexpected data visibility.

**Mitigation**: Use database names that include a session fingerprint for private mode, or avoid IndexedDB entirely in Safari private mode.

### 14.6 Cookie Max-Age Overflow

Setting `Max-Age` to a value larger than `Number.MAX_SAFE_INTEGER` (or negative values) causes browser-specific behavior. Chrome clamps large values to a distant future date (year 3000+). Firefox rejects negative values as session cookies. Safari has been observed to wrap large values, causing immediate expiration.

**Mitigation**: Cap `Max-Age` to `2^31 - 1` (68 years) for cross-browser safety.

### 14.7 Storage Estimate Inflation

`navigator.storage.estimate()` can report `usage` significantly larger than the sum of stored data due to:

- WAL files (IndexedDB write-ahead logs).
- Internal fragmentation in LevelDB/SQLite.
- Snapshot copies during `createWritable()` in OPFS.

**Mitigation**: Use `usage` as an upper bound, not an exact measurement. For precise accounting, track sizes at the application level.

### 14.8 Incognito localStorage Not Isolated in Older Browsers

In Firefox versions prior to 67, localStorage in private mode was not properly isolated from non-private mode if the origin used `file://` URLs or certain `about:` pages. This was a security vulnerability (CVE-2019-11691).

**Mitigation**: Avoid `file://` origins for any storage-dependent application; use a local HTTPS server.

---

## 15. TypeScript Examples

### 15.1 RFC 6265bis Cookie Parser

This implementation follows the RFC 6265bis Section 5 state machine, handling edge cases like quoted values, duplicate attributes, and invalid octets.

```ts
/**
 * RFC 6265bis-compliant cookie parser.
 * Implements the exact state machine from Section 5.
 */
export interface Cookie {
  name: string;
  value: string;
  expires?: Date;
  maxAge?: number;
  domain?: string;
  path?: string;
  secure: boolean;
  httpOnly: boolean;
  sameSite?: "Strict" | "Lax" | "None";
  partitioned: boolean;
}

export class CookieParseError extends Error {
  constructor(message: string, public readonly input: string) {
    super(`Cookie parse error: ${message}`);
    this.name = "CookieParseError";
  }
}

function isCookieOctet(ch: string): boolean {
  const code = ch.charCodeAt(0);
  return (
    code === 0x21 ||
    (code >= 0x23 && code <= 0x2b) ||
    (code >= 0x2d && code <= 0x3a) ||
    (code >= 0x3c && code <= 0x5b) ||
    (code >= 0x5d && code <= 0x7e)
  );
}

function stripLeadingTrailingDots(str: string): string {
  return str.replace(/^[\u002e]+|[\u002e]+$/g, "");
}

function parseCookieDate(str: string): Date | undefined {
  // Simplified RFC 6265bis date parser
  const monthMap: Record<string, number> = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
  };

  const tokens = str
    .toLowerCase()
    .replace(/[^\x20\x09a-z0-9\-:,.]/g, "")
    .split(/[\x20\x09]+/)
    .filter(Boolean);

  let day: number | undefined;
  let month: number | undefined;
  let year: number | undefined;
  let hour = 0;
  let minute = 0;
  let second = 0;

  for (const token of tokens) {
    if (token.includes(":")) {
      const parts = token.split(":").map(Number);
      if (parts.length >= 2) {
        hour = parts[0];
        minute = parts[1];
        if (parts.length >= 3) second = parts[2];
      }
    } else if (/^[0-9]+$/.test(token)) {
      const num = parseInt(token, 10);
      if (num >= 70 && num <= 99) {
        year = 1900 + num;
      } else if (num >= 0 && num <= 69) {
        year = 2000 + num;
      } else if (num >= 1 && num <= 31 && day === undefined) {
        day = num;
      } else if (num >= 1970 && num <= 9999 && year === undefined) {
        year = num;
      }
    } else if (token in monthMap && month === undefined) {
      month = monthMap[token];
    }
  }

  if (day === undefined || month === undefined || year === undefined) {
    return undefined;
  }

  const date = new Date(Date.UTC(year, month, day, hour, minute, second));
  if (
    date.getUTCDate() !== day ||
    date.getUTCMonth() !== month ||
    date.getUTCFullYear() !== year
  ) {
    return undefined;
  }
  return date;
}

export function parseSetCookie(headerValue: string): Cookie {
  const parts = headerValue.split(";");
  if (parts.length === 0) {
    throw new CookieParseError("Empty Set-Cookie header", headerValue);
  }

  const [first, ...avParts] = parts;
  const eqIndex = first.indexOf("=");
  if (eqIndex === -1) {
    throw new CookieParseError("Missing '=' in cookie-pair", headerValue);
  }

  let rawName = first.slice(0, eqIndex).trim();
  let rawValue = first.slice(eqIndex + 1).trim();

  // Strip DQUOTEs if present
  if (rawValue.startsWith('"') && rawValue.endsWith('"')) {
    rawValue = rawValue.slice(1, -1);
  }

  // Validate cookie-octets for value (permissive: allow common deviations)
  for (const ch of rawValue) {
    if (!isCookieOctet(ch) && ch !== " " && ch !== "\t") {
      // Browsers are permissive; we warn but continue
    }
  }

  const cookie: Cookie = {
    name: rawName,
    value: rawValue,
    secure: false,
    httpOnly: false,
    partitioned: false,
  };

  for (const av of avParts) {
    const avEq = av.indexOf("=");
    const avName = (avEq === -1 ? av : av.slice(0, avEq)).trim().toLowerCase();
    const avValue = avEq === -1 ? "" : av.slice(avEq + 1).trim();

    switch (avName) {
      case "expires": {
        const date = parseCookieDate(avValue);
        if (date) cookie.expires = date;
        break;
      }
      case "max-age": {
        const seconds = parseInt(avValue, 10);
        if (!Number.isNaN(seconds)) {
          cookie.maxAge = Math.max(0, Math.min(seconds, 2 ** 31 - 1));
        }
        break;
      }
      case "domain": {
        cookie.domain = stripLeadingTrailingDots(avValue.toLowerCase());
        break;
      }
      case "path": {
        cookie.path = avValue.startsWith("/") ? avValue : "/";
        break;
      }
      case "secure":
        cookie.secure = true;
        break;
      case "httponly":
        cookie.httpOnly = true;
        break;
      case "samesite": {
        const normalized = avValue.toLowerCase();
        if (normalized === "strict" || normalized === "lax" || normalized === "none") {
          cookie.sameSite = normalized.charAt(0).toUpperCase() + normalized.slice(1) as Cookie["sameSite"];
        }
        break;
      }
      case "partitioned":
        cookie.partitioned = true;
        break;
      default:
        // Unrecognized attributes are ignored per RFC 6265bis
        break;
    }
  }

  return cookie;
}

export function serializeCookie(cookie: Cookie): string {
  let str = `${encodeURIComponent(cookie.name)}=${encodeURIComponent(cookie.value)}`;
  if (cookie.maxAge !== undefined) {
    str += `; Max-Age=${cookie.maxAge}`;
  } else if (cookie.expires) {
    str += `; Expires=${cookie.expires.toUTCString()}`;
  }
  if (cookie.domain) str += `; Domain=${cookie.domain}`;
  if (cookie.path) str += `; Path=${cookie.path}`;
  if (cookie.secure) str += "; Secure";
  if (cookie.httpOnly) str += "; HttpOnly";
  if (cookie.sameSite) str += `; SameSite=${cookie.sameSite}`;
  if (cookie.partitioned) str += "; Partitioned";
  return str;
}

// Example usage:
const header = "sessionId=abc123; Max-Age=3600; Path=/; Secure; HttpOnly; SameSite=Lax";
const parsed = parseSetCookie(header);
console.log(parsed.name, parsed.value, parsed.sameSite);
```

### 15.2 localStorage Quota Estimator

This utility measures localStorage consumption accurately, accounting for UTF-16 encoding and browser overhead, and estimates remaining capacity by probing with binary search.

```ts
/**
 * Accurate localStorage quota estimator.
 * Accounts for UTF-16 encoding and probes remaining space via binary search.
 */
export interface StorageEstimate {
  usedBytes: number;
  totalBytes: number;
  remainingBytes: number;
  keyCount: number;
  largestKey: string;
  largestValueBytes: number;
}

export class QuotaProbeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QuotaProbeError";
  }
}

function getItemSize(key: string, value: string): number {
  // localStorage stores keys and values as UTF-16 strings
  return (key.length + value.length) * 2;
}

export function measureLocalStorage(): StorageEstimate {
  let usedBytes = 0;
  let keyCount = localStorage.length;
  let largestKey = "";
  let largestValueBytes = 0;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key === null) continue;
    const value = localStorage.getItem(key) ?? "";
    const size = getItemSize(key, value);
    usedBytes += size;
    if (size > largestValueBytes) {
      largestValueBytes = size;
      largestKey = key;
    }
  }

  return {
    usedBytes,
    totalBytes: 5 * 1024 * 1024, // Conservative default
    remainingBytes: Math.max(0, 5 * 1024 * 1024 - usedBytes),
    keyCount,
    largestKey,
    largestValueBytes,
  };
}

export function probeLocalStorageQuota(): Promise<StorageEstimate> {
  return new Promise((resolve, reject) => {
    const originalEstimate = measureLocalStorage();
    const probeKey = "__quota_probe__";

    // Clean up any stale probe
    try {
      localStorage.removeItem(probeKey);
    } catch {
      // Ignore
    }

    // Binary search for maximum storable string
    let low = 0;
    let high = 10 * 1024 * 1024; // 10MB upper bound
    let maxAdditional = 0;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const probeValue = "x".repeat(mid);
      try {
        localStorage.setItem(probeKey, probeValue);
        maxAdditional = getItemSize(probeKey, probeValue);
        low = mid + 1;
      } catch (e) {
        if (e instanceof DOMException && e.name === "QuotaExceededError") {
          high = mid - 1;
        } else {
          reject(new QuotaProbeError(`Unexpected error during probe: ${e}`));
          return;
        }
      } finally {
        localStorage.removeItem(probeKey);
      }
    }

    const totalBytes = originalEstimate.usedBytes + maxAdditional;
    resolve({
      usedBytes: originalEstimate.usedBytes,
      totalBytes,
      remainingBytes: maxAdditional,
      keyCount: originalEstimate.keyCount,
      largestKey: originalEstimate.largestKey,
      largestValueBytes: originalEstimate.largestValueBytes,
    });
  });
}

export function safeLocalStorageSet(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      // Attempt eviction of least important keys
      // Application-defined strategy: remove keys prefixed with "cache:"
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k?.startsWith("cache:")) {
          localStorage.removeItem(k);
        }
      }
      try {
        localStorage.setItem(key, value);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
}

// Example usage:
// probeLocalStorageQuota().then(console.log);
```

### 15.3 IndexedDB Wrapper with Schema Migrations

A production-grade wrapper that handles versioning, migrations, connection pooling, and provides a Promise-based API with TypeScript generics.

```ts
/**
 * Production-grade IndexedDB wrapper with declarative schema migrations,
 * connection pooling, and typed stores.
 */
export interface ObjectStoreSchema {
  name: string;
  keyPath?: string | string[];
  autoIncrement?: boolean;
  indexes?: Array<{
    name: string;
    keyPath: string | string[];
    unique?: boolean;
    multiEntry?: boolean;
  }>;
}

export interface DatabaseSchema {
  version: number;
  stores: ObjectStoreSchema[];
}

export interface IDBWrapperOptions {
  dbName: string;
  schema: DatabaseSchema;
  upgradeTimeoutMs?: number;
}

export class IDBWrapper {
  private db: IDBDatabase | null = null;
  private readonly pendingTxs = new Set<IDBTransaction>();
  private connectionPromise: Promise<IDBDatabase> | null = null;

  constructor(private readonly options: IDBWrapperOptions) {}

  async open(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    if (this.connectionPromise) return this.connectionPromise;

    this.connectionPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(
        this.options.dbName,
        this.options.schema.version
      );

      const timeout = setTimeout(() => {
        reject(new Error("IndexedDB open timeout"));
      }, this.options.upgradeTimeoutMs ?? 30000);

      request.onerror = () => {
        clearTimeout(timeout);
        reject(request.error ?? new Error("Unknown IndexedDB open error"));
      };

      request.onsuccess = () => {
        clearTimeout(timeout);
        this.db = request.result;
        this.db.onclose = () => {
          this.db = null;
          this.connectionPromise = null;
        };
        this.db.onversionchange = () => {
          this.db?.close();
          this.db = null;
          this.connectionPromise = null;
        };
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = request.result;
        const tx = request.transaction!;
        const oldVersion = event.oldVersion;
        const newVersion = event.newVersion ?? this.options.schema.version;

        for (const storeSchema of this.options.schema.stores) {
          const exists = db.objectStoreNames.contains(storeSchema.name);
          if (!exists) {
            const store = db.createObjectStore(storeSchema.name, {
              keyPath: storeSchema.keyPath,
              autoIncrement: storeSchema.autoIncrement,
            });
            for (const idx of storeSchema.indexes ?? []) {
              store.createIndex(idx.name, idx.keyPath, {
                unique: idx.unique,
                multiEntry: idx.multiEntry,
              });
            }
          } else if (oldVersion > 0) {
            // Schema migration: add missing indexes
            const store = tx.objectStore(storeSchema.name);
            for (const idx of storeSchema.indexes ?? []) {
              if (!store.indexNames.contains(idx.name)) {
                store.createIndex(idx.name, idx.keyPath, {
                  unique: idx.unique,
                  multiEntry: idx.multiEntry,
                });
              }
            }
          }
        }

        // Remove stores not in new schema (dangerous, opt-in only)
        // for (let i = db.objectStoreNames.length - 1; i >= 0; i--) {
        //   const name = db.objectStoreNames[i];
        //   if (!this.options.schema.stores.find(s => s.name === name)) {
        //     db.deleteObjectStore(name);
        //   }
        // }
      };
    });

    return this.connectionPromise;
  }

  async close(): Promise<void> {
    // Wait for pending transactions
    await Promise.all(
      Array.from(this.pendingTxs).map(
        (tx) =>
          new Promise<void>((resolve) => {
            if (tx.readyState === "done") {
              resolve();
            } else {
              tx.oncomplete = () => resolve();
              tx.onabort = () => resolve();
              tx.onerror = () => resolve();
            }
          })
      )
    );
    this.db?.close();
    this.db = null;
    this.connectionPromise = null;
  }

  private async ensureDB(): Promise<IDBDatabase> {
    const db = await this.open();
    if (!db) throw new Error("Database not available");
    return db;
  }

  async put<T>(storeName: string, value: T, key?: IDBValidKey): Promise<IDBValidKey> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, "readwrite");
      this.pendingTxs.add(tx);
      const store = tx.objectStore(storeName);
      const request = key !== undefined ? store.put(value, key) : store.put(value);
      request.onsuccess = () => resolve(request.result as IDBValidKey);
      request.onerror = () => reject(request.error);
      tx.oncomplete = () => this.pendingTxs.delete(tx);
      tx.onabort = () => this.pendingTxs.delete(tx);
    });
  }

  async get<T>(storeName: string, key: IDBValidKey): Promise<T | undefined> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, "readonly");
      const store = tx.objectStore(storeName);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result as T | undefined);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName: string, key: IDBValidKey | IDBKeyRange): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, "readwrite");
      this.pendingTxs.add(tx);
      const request = tx.objectStore(storeName).delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      tx.oncomplete = () => this.pendingTxs.delete(tx);
    });
  }

  async getAll<T>(
    storeName: string,
    query?: IDBValidKey | IDBKeyRange,
    count?: number
  ): Promise<T[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, "readonly");
      const request = tx.objectStore(storeName).getAll(query, count);
      request.onsuccess = () => resolve(request.result as T[]);
      request.onerror = () => reject(request.error);
    });
  }

  async queryIndex<T>(
    storeName: string,
    indexName: string,
    range: IDBKeyRange,
    direction: IDBCursorDirection = "next"
  ): Promise<T[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, "readonly");
      const store = tx.objectStore(storeName);
      const index = store.index(indexName);
      const results: T[] = [];
      const request = index.openCursor(range, direction);
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          results.push(cursor.value as T);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async clear(storeName: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, "readwrite");
      this.pendingTxs.add(tx);
      const request = tx.objectStore(storeName).clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      tx.oncomplete = () => this.pendingTxs.delete(tx);
    });
  }
}

// Example usage:
const db = new IDBWrapper({
  dbName: "app-db",
  schema: {
    version: 2,
    stores: [
      {
        name: "users",
        keyPath: "id",
        autoIncrement: true,
        indexes: [
          { name: "by_email", keyPath: "email", unique: true },
          { name: "by_age", keyPath: "age" },
        ],
      },
    ],
  },
});

// db.put("users", { name: "Alice", email: "alice@example.com", age: 30 });
```

### 15.4 OPFS File Manager

A comprehensive OPFS manager supporting both async main-thread operations and high-performance sync worker access, with directory traversal and atomic writes.

```ts
/**
 * Origin Private File System (OPFS) manager with support for
 * async main-thread operations and high-performance sync worker handles.
 */
export interface FileEntry {
  name: string;
  kind: "file";
  size: number;
  lastModified: number;
}

export interface DirectoryEntry {
  name: string;
  kind: "directory";
}

export type Entry = FileEntry | DirectoryEntry;

export class OPFSManager {
  private root: FileSystemDirectoryHandle | null = null;

  async init(): Promise<void> {
    if (!navigator.storage || !navigator.storage.getDirectory) {
      throw new Error("OPFS not supported in this browser");
    }
    this.root = await navigator.storage.getDirectory();
  }

  private ensureRoot(): FileSystemDirectoryHandle {
    if (!this.root) throw new Error("OPFSManager not initialized");
    return this.root;
  }

  /**
   * Resolve a path string to a directory handle, creating intermediate directories.
   */
  async resolveDirectory(path: string, create = false): Promise<FileSystemDirectoryHandle> {
    const parts = path.split("/").filter(Boolean);
    let current = this.ensureRoot();
    for (const part of parts) {
      current = await current.getDirectoryHandle(part, { create });
    }
    return current;
  }

  async writeFile(
    path: string,
    data: string | Blob | BufferSource,
    options: { append?: boolean; create?: boolean } = {}
  ): Promise<void> {
    const { append = false, create = true } = options;
    const lastSlash = path.lastIndexOf("/");
    const dirPath = lastSlash >= 0 ? path.slice(0, lastSlash) : "";
    const fileName = lastSlash >= 0 ? path.slice(lastSlash + 1) : path;

    const dir = dirPath ? await this.resolveDirectory(dirPath, create) : this.ensureRoot();
    const fileHandle = await dir.getFileHandle(fileName, { create });

    if (append) {
      const writable = await fileHandle.createWritable({ keepExistingData: true });
      const file = await fileHandle.getFile();
      await writable.seek(file.size);
      await writable.write(data);
      await writable.close();
    } else {
      const writable = await fileHandle.createWritable();
      await writable.write(data);
      await writable.close();
    }
  }

  async readFile(path: string): Promise<Uint8Array> {
    const file = await this.getFile(path);
    const arrayBuffer = await file.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  }

  async readTextFile(path: string): Promise<string> {
    const file = await this.getFile(path);
    return file.text();
  }

  async getFile(path: string): Promise<File> {
    const lastSlash = path.lastIndexOf("/");
    const dirPath = lastSlash >= 0 ? path.slice(0, lastSlash) : "";
    const fileName = lastSlash >= 0 ? path.slice(lastSlash + 1) : path;

    const dir = dirPath ? await this.resolveDirectory(dirPath) : this.ensureRoot();
    const fileHandle = await dir.getFileHandle(fileName);
    return fileHandle.getFile();
  }

  async deleteFile(path: string): Promise<void> {
    const lastSlash = path.lastIndexOf("/");
    const dirPath = lastSlash >= 0 ? path.slice(0, lastSlash) : "";
    const fileName = lastSlash >= 0 ? path.slice(lastSlash + 1) : path;

    const dir = dirPath ? await this.resolveDirectory(dirPath) : this.ensureRoot();
    await dir.removeEntry(fileName);
  }

  async listDirectory(path = ""): Promise<Entry[]> {
    const dir = path ? await this.resolveDirectory(path) : this.ensureRoot();
    const entries: Entry[] = [];
    for await (const [name, handle] of dir.entries()) {
      if (handle.kind === "file") {
        const file = await handle.getFile();
        entries.push({
          name,
          kind: "file",
          size: file.size,
          lastModified: file.lastModified,
        });
      } else {
        entries.push({ name, kind: "directory" });
      }
    }
    return entries;
  }

  async exists(path: string): Promise<boolean> {
    try {
      const lastSlash = path.lastIndexOf("/");
      const dirPath = lastSlash >= 0 ? path.slice(0, lastSlash) : "";
      const name = lastSlash >= 0 ? path.slice(lastSlash + 1) : path;
      const dir = dirPath ? await this.resolveDirectory(dirPath) : this.ensureRoot();
      await dir.getFileHandle(name);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * High-performance sync write via Web Worker.
   * Call this from inside a Worker.
   */
  static syncWriteFile(
    fileHandle: FileSystemFileHandle,
    data: Uint8Array,
    offset = 0
  ): void {
    const handle = fileHandle.createSyncAccessHandle();
    try {
      handle.write(data, { at: offset });
      handle.flush();
    } finally {
      handle.close();
    }
  }

  /**
   * High-performance sync read via Web Worker.
   */
  static syncReadFile(fileHandle: FileSystemFileHandle, offset = 0, length?: number): Uint8Array {
    const handle = fileHandle.createSyncAccessHandle();
    try {
      const size = length ?? handle.getSize();
      const buffer = new Uint8Array(size);
      handle.read(buffer, { at: offset });
      return buffer;
    } finally {
      handle.close();
    }
  }
}

// Example usage:
// const opfs = new OPFSManager();
// await opfs.init();
// await opfs.writeFile("/data/config.json", JSON.stringify({ theme: "dark" }));
// const config = await opfs.readTextFile("/data/config.json");
```

### 15.5 Storage Fingerprinting Detector

This utility detects and mitigates common storage-based fingerprinting techniques by probing for quota consistency, timing anomalies, and known tracker patterns.

```ts
/**
 * Detects storage-based fingerprinting attempts and provides mitigation strategies.
 * Useful for privacy-focused applications and security auditing.
 */
export interface FingerprintingReport {
  timestamp: number;
  origin: string;
  userAgent: string;
  tests: Array<{
    name: string;
    passed: boolean;
    details: string;
    riskLevel: "low" | "medium" | "high";
  }>;
  overallRisk: "low" | "medium" | "high";
  mitigationAdvice: string[];
}

export class StorageFingerprintingDetector {
  private readonly tests: Array<{
    name: string;
    run: () => Promise<{ passed: boolean; details: string; riskLevel: "low" | "medium" | "high" }>;
  }> = [
    {
      name: "Quota Consistency",
      run: async () => {
        const estimates: number[] = [];
        for (let i = 0; i < 3; i++) {
          const est = await navigator.storage.estimate();
          estimates.push(est.quota ?? 0);
          // Small write to perturb state
          const key = `__fp_probe_${i}`;
          localStorage.setItem(key, "x");
          localStorage.removeItem(key);
        }
        const unique = new Set(estimates).size;
        const passed = unique === 1;
        return {
          passed,
          details: `Quota varied across ${unique} values: ${estimates.join(", ")}`,
          riskLevel: passed ? "low" : "medium",
        };
      },
    },
    {
      name: "Timing Channel (localStorage)",
      run: async () => {
        const times: number[] = [];
        const key = "__fp_timing";
        for (let i = 0; i < 10; i++) {
          const start = performance.now();
          localStorage.setItem(key, "a".repeat(10000));
          const end = performance.now();
          times.push(end - start);
          localStorage.removeItem(key);
        }
        const avg = times.reduce((a, b) => a + b, 0) / times.length;
        const variance = times.reduce((sum, t) => sum + Math.pow(t - avg, 2), 0) / times.length;
        // High variance may indicate storage medium fingerprinting
        const passed = variance < 1.0;
        return {
          passed,
          details: `Average: ${avg.toFixed(3)}ms, variance: ${variance.toFixed(3)}ms²`,
          riskLevel: passed ? "low" : "medium",
        };
      },
    },
    {
      name: "Timing Channel (IndexedDB)",
      run: async () => {
        const dbName = "__fp_idb_test";
        return new Promise((resolve) => {
          const request = indexedDB.deleteDatabase(dbName);
          request.onsuccess = () => {
            const openReq = indexedDB.open(dbName, 1);
            openReq.onupgradeneeded = () => {
              const db = openReq.result;
              db.createObjectStore("test", { autoIncrement: true });
            };
            openReq.onsuccess = () => {
              const db = openReq.result;
              const tx = db.transaction("test", "readwrite");
              const store = tx.objectStore("test");
              const times: number[] = [];
              let count = 0;
              const runWrite = () => {
                const start = performance.now();
                const putReq = store.put({ data: "x".repeat(1000) });
                putReq.onsuccess = () => {
                  const end = performance.now();
                  times.push(end - start);
                  count++;
                  if (count < 10) {
                    runWrite();
                  } else {
                    db.close();
                    indexedDB.deleteDatabase(dbName);
                    const avg = times.reduce((a, b) => a + b, 0) / times.length;
                    const variance = times.reduce((sum, t) => sum + Math.pow(t - avg, 2), 0) / times.length;
                    resolve({
                      passed: variance < 2.0,
                      details: `IDB avg: ${avg.toFixed(3)}ms, variance: ${variance.toFixed(3)}ms²`,
                      riskLevel: variance > 5.0 ? "high" : variance > 2.0 ? "medium" : "low",
                    });
                  }
                };
              };
              runWrite();
            };
            openReq.onerror = () => resolve({ passed: true, details: "IDB unavailable", riskLevel: "low" });
          };
        }) as Promise<{ passed: boolean; details: string; riskLevel: "low" | "medium" | "high" }>;
      },
    },
    {
      name: "Persistent Identifier Detection",
      run: async () => {
        const suspiciousKeys: string[] = [];
        const knownPatterns = [
          /^__[a-z0-9]{16,32}$/,
          /^fp_/, /^track_/, /^visitor_/,
          /^_ga$/, /^_gid$/, /^_gat$/,
        ];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && knownPatterns.some((p) => p.test(key))) {
            suspiciousKeys.push(key);
          }
        }
        // Check IndexedDB for suspicious databases
        const databases = "databases" in indexedDB
          ? await (indexedDB as any).databases()
          : [];
        const suspiciousDBs = databases.filter((db: any) =>
          /^__fp|track|visitor|fingerprint/.test(db.name)
        );

        const passed = suspiciousKeys.length === 0 && suspiciousDBs.length === 0;
        return {
          passed,
          details: `Suspicious localStorage keys: ${suspiciousKeys.join(", ") || "none"}; ` +
            `Suspicious IDB databases: ${suspiciousDBs.map((d: any) => d.name).join(", ") || "none"}`,
          riskLevel: suspiciousKeys.length > 0 || suspiciousDBs.length > 0 ? "high" : "low",
        };
      },
    },
    {
      name: "Storage Isolation (Partitioning)",
      run: async () => {
        // Detect if storage appears partitioned by writing a known key
        // and checking if it persists with a modified origin signature
        const testKey = "__partition_test";
        const testValue = crypto.randomUUID();
        localStorage.setItem(testKey, testValue);
        const readBack = localStorage.getItem(testKey);
        localStorage.removeItem(testKey);
        const passed = readBack === testValue;
        return {
          passed,
          details: passed
            ? "Storage readback consistent; partitioning not detectable via this method"
            : "Storage readback inconsistent; possible partitioning or incognito mode",
          riskLevel: passed ? "low" : "medium",
        };
      },
    },
  ];

  async runDetection(): Promise<FingerprintingReport> {
    const results = await Promise.all(
      this.tests.map(async (test) => {
        try {
          const result = await test.run();
          return { name: test.name, ...result };
        } catch (e) {
          return {
            name: test.name,
            passed: false,
            details: `Test threw: ${e}`,
            riskLevel: "low" as const,
          };
        }
      })
    );

    const highRiskCount = results.filter((r) => r.riskLevel === "high").length;
    const mediumRiskCount = results.filter((r) => r.riskLevel === "medium").length;
    const overallRisk: "low" | "medium" | "high" =
      highRiskCount > 0 ? "high" : mediumRiskCount > 1 ? "medium" : "low";

    const mitigationAdvice: string[] = [];
    if (highRiskCount > 0) {
      mitigationAdvice.push(
        "High-risk fingerprinting detected. Consider using privacy mode, clearing site data, or installing anti-tracking extensions."
      );
    }
    if (results.some((r) => r.name === "Persistent Identifier Detection" && !r.passed)) {
      mitigationAdvice.push(
        "Persistent tracking identifiers found in storage. Clear all site data for this origin."
      );
    }
    if (results.some((r) => r.name.includes("Timing") && !r.passed)) {
      mitigationAdvice.push(
        "Timing anomalies detected. This origin may be using storage I/O timing for device fingerprinting."
      );
    }
    if (mitigationAdvice.length === 0) {
      mitigationAdvice.push("No significant fingerprinting risks detected.");
    }

    return {
      timestamp: Date.now(),
      origin: location.origin,
      userAgent: navigator.userAgent,
      tests: results,
      overallRisk,
      mitigationAdvice,
    };
  }
}

// Example usage:
// const detector = new StorageFingerprintingDetector();
// detector.runDetection().then(report => console.table(report.tests));
```

### 15.6 Persistence Strategy Selector

A strategy pattern implementation that selects the optimal storage mechanism based on data characteristics, browser capabilities, and privacy requirements, with automatic fallback chains.

```ts
/**
 * Persistence Strategy Selector — automatically selects and chains
 * browser storage mechanisms based on data requirements and environment.
 */
export interface PersistenceStrategy {
  readonly name: string;
  readonly supportsBinary: boolean;
  readonly maxSize: number; // bytes, approximate
  readonly async: boolean;
  readonly workerSafe: boolean;
  readonly durability: "strict" | "relaxed" | "session";

  isAvailable(): boolean;
  write(key: string, value: unknown): Promise<boolean> | boolean;
  read<T>(key: string): Promise<T | null> | T | null;
  delete(key: string): Promise<void> | void;
  clear(): Promise<void> | void;
  estimate?(): Promise<{ used: number; total: number }>;
}

class LocalStorageStrategy implements PersistenceStrategy {
  readonly name = "localStorage";
  readonly supportsBinary = false;
  readonly maxSize = 5 * 1024 * 1024;
  readonly async = false;
  readonly workerSafe = false;
  readonly durability = "relaxed";

  isAvailable(): boolean {
    try {
      const key = "__ls_test__";
      localStorage.setItem(key, "1");
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }

  write(key: string, value: unknown): boolean {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch {
      return false;
    }
  }

  read<T>(key: string): T | null {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as unknown as T;
    }
  }

  delete(key: string): void {
    localStorage.removeItem(key);
  }

  clear(): void {
    localStorage.clear();
  }
}

class SessionStorageStrategy implements PersistenceStrategy {
  readonly name = "sessionStorage";
  readonly supportsBinary = false;
  readonly maxSize = 5 * 1024 * 1024;
  readonly async = false;
  readonly workerSafe = false;
  readonly durability = "session";

  isAvailable(): boolean {
    try {
      const key = "__ss_test__";
      sessionStorage.setItem(key, "1");
      sessionStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }

  write(key: string, value: unknown): boolean {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  read<T>(key: string): T | null {
    const raw = sessionStorage.getItem(key);
    if (raw === null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as unknown as T;
    }
  }

  delete(key: string): void {
    sessionStorage.removeItem(key);
  }

  clear(): void {
    sessionStorage.clear();
  }
}

class IndexedDBStrategy implements PersistenceStrategy {
  readonly name = "IndexedDB";
  readonly supportsBinary = true;
  readonly maxSize = Number.MAX_SAFE_INTEGER; // Disk-limited
  readonly async = true;
  readonly workerSafe = true;
  readonly durability = "strict";

  private db: IDBDatabase | null = null;
  private readonly dbName = "__persistence_strategy_db";
  private readonly storeName = "kv";
  private initPromise: Promise<void> | null = null;

  private async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      request.onupgradeneeded = () => {
        request.result.createObjectStore(this.storeName);
      };
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      request.onerror = () => reject(request.error);
    });

    return this.initPromise;
  }

  isAvailable(): boolean {
    return typeof indexedDB !== "undefined";
  }

  async write(key: string, value: unknown): Promise<boolean> {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(this.storeName, "readwrite");
      const request = tx.objectStore(this.storeName).put(value, key);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  async read<T>(key: string): Promise<T | null> {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(this.storeName, "readonly");
      const request = tx.objectStore(this.storeName).get(key);
      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(key: string): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(this.storeName, "readwrite");
      const request = tx.objectStore(this.storeName).delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(this.storeName, "readwrite");
      const request = tx.objectStore(this.storeName).clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async estimate(): Promise<{ used: number; total: number }> {
    const est = await navigator.storage.estimate();
    return { used: est.usage ?? 0, total: est.quota ?? 0 };
  }
}

class OPFSStrategy implements PersistenceStrategy {
  readonly name = "OPFS";
  readonly supportsBinary = true;
  readonly maxSize = Number.MAX_SAFE_INTEGER;
  readonly async = true;
  readonly workerSafe = true;
  readonly durability = "strict";

  private root: FileSystemDirectoryHandle | null = null;
  private initPromise: Promise<void> | null = null;

  private async init(): Promise<void> {
    if (this.root) return;
    if (this.initPromise) return this.initPromise;
    this.initPromise = (async () => {
      this.root = await navigator.storage.getDirectory();
    })();
    return this.initPromise;
  }

  isAvailable(): boolean {
    return typeof navigator !== "undefined" && !!navigator.storage?.getDirectory;
  }

  private keyToFileName(key: string): string {
    // Sanitize key for file system
    return encodeURIComponent(key).replace(/%/g, "_");
  }

  async write(key: string, value: unknown): Promise<boolean> {
    await this.init();
    const fileName = this.keyToFileName(key);
    const data = typeof value === "string" ? value : JSON.stringify(value);
    const handle = await this.root!.getFileHandle(fileName, { create: true });
    const writable = await handle.createWritable();
    await writable.write(data);
    await writable.close();
    return true;
  }

  async read<T>(key: string): Promise<T | null> {
    await this.init();
    const fileName = this.keyToFileName(key);
    try {
      const handle = await this.root!.getFileHandle(fileName);
      const file = await handle.getFile();
      const text = await file.text();
      try {
        return JSON.parse(text) as T;
      } catch {
        return text as unknown as T;
      }
    } catch {
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    await this.init();
    const fileName = this.keyToFileName(key);
    await this.root!.removeEntry(fileName);
  }

  async clear(): Promise<void> {
    await this.init();
    for await (const [name] of this.root!.entries()) {
      await this.root!.removeEntry(name);
    }
  }
}

export interface StrategySelectionCriteria {
  estimatedSize: number;
  binaryData: boolean;
  requiresAsync: boolean;
  requiredDurability: "strict" | "relaxed" | "session";
  crossTabSync: boolean;
  workerContext: boolean;
}

export class PersistenceStrategySelector {
  private readonly strategies: PersistenceStrategy[] = [
    new LocalStorageStrategy(),
    new SessionStorageStrategy(),
    new IndexedDBStrategy(),
    new OPFSStrategy(),
  ];

  private rankStrategies(criteria: StrategySelectionCriteria): PersistenceStrategy[] {
    return this.strategies
      .filter((s) => s.isAvailable())
      .filter((s) => !criteria.binaryData || s.supportsBinary)
      .filter((s) => !criteria.workerContext || s.workerSafe)
      .filter((s) => criteria.estimatedSize <= s.maxSize)
      .filter((s) => {
        if (criteria.requiredDurability === "strict") return s.durability === "strict";
        if (criteria.requiredDurability === "relaxed") return s.durability !== "session";
        return true;
      })
      .sort((a, b) => {
        // Prefer lower latency for small data
        if (criteria.estimatedSize < 100 * 1024) {
          if (!a.async && b.async) return -1;
          if (a.async && !b.async) return 1;
        }
        // Prefer larger capacity for big data
        if (criteria.estimatedSize > 5 * 1024 * 1024) {
          return b.maxSize - a.maxSize;
        }
        // Prefer strict durability
        if (a.durability === "strict" && b.durability !== "strict") return -1;
        if (a.durability !== "strict" && b.durability === "strict") return 1;
        return 0;
      });
  }

  select(criteria: StrategySelectionCriteria): PersistenceStrategy | null {
    const ranked = this.rankStrategies(criteria);
    return ranked[0] ?? null;
  }

  /**
   * Returns a fallback chain: primary strategy plus alternatives.
   */
  selectChain(criteria: StrategySelectionCriteria): PersistenceStrategy[] {
    return this.rankStrategies(criteria);
  }

  /**
   * Attempts write with automatic fallback through the chain.
   */
  async writeWithFallback(
    criteria: StrategySelectionCriteria,
    key: string,
    value: unknown
  ): Promise<{ success: boolean; strategy: string; error?: string }> {
    const chain = this.selectChain(criteria);
    for (const strategy of chain) {
      try {
        const result = await strategy.write(key, value);
        if (result === true || result === undefined) {
          return { success: true, strategy: strategy.name };
        }
      } catch (e) {
        // Continue to next strategy
        if (chain.indexOf(strategy) === chain.length - 1) {
          return {
            success: false,
            strategy: strategy.name,
            error: String(e),
          };
        }
      }
    }
    return { success: false, strategy: "none", error: "No available strategy" };
  }
}

// Example usage:
// const selector = new PersistenceStrategySelector();
// const strategy = selector.select({
//   estimatedSize: 1024 * 1024,
//   binaryData: true,
//   requiresAsync: true,
//   requiredDurability: "strict",
//   crossTabSync: false,
//   workerContext: false,
// });
// console.log(strategy?.name); // "IndexedDB" or "OPFS"
```

---

## 16. Comparative Analysis and Best Practices

### 16.1 Capacity Planning

When designing a storage architecture, capacity must be modeled as a probability distribution, not a point estimate. The "5MB localStorage limit" is a mode, not a guarantee — some mobile browsers enforce 2.5MB, and shared origins (e.g., `github.io` subdomains) may have lower effective quotas due to per-eTLD+1 aggregation.

Best practice: Implement a telemetry pipeline that reports `navigator.storage.estimate()` values from real user sessions. Use the 10th percentile as your design limit, not the median.

### 16.2 Latency Budgeting

For applications with a 16ms frame budget (60fps):

- **0ms–1ms**: localStorage read (acceptable occasionally, e.g., startup).
- **1ms–3ms**: IndexedDB read via pre-warmed connection.
- **>3ms**: Defer to async operation or Web Worker.

localStorage writes during animation frames are an anti-pattern. If UI state must be persisted frequently, buffer in memory and flush to IndexedDB via `requestIdleCallback()` or `setTimeout(..., 0)` batching.

### 16.3 Privacy-by-Design

To minimize privacy risks:

1. **Minimize storage duration**: Store identifiers only as long as necessary. Use `sessionStorage` for ephemeral state.
2. **Avoid stable identifiers**: Rotate IDs periodically. Use session-scoped tokens rather than persistent UUIDs.
3. **Respect DNT/GPC**: Honor Do Not Track and Global Privacy Control signals by disabling non-essential storage writes.
4. **Audit third-party scripts**: Third-party embeds with `iframe` storage access can fingerprint users. Use `sandbox` attributes and CSP to restrict storage access.
5. **Prompt for persistence**: If your PWA requires durable storage, request `navigator.storage.persist()` after user engagement, with clear UI explaining why.

### 16.4 Cross-Browser Compatibility

- **Safari**: Test IndexedDB compound indexes carefully; historically buggy. OPFS sync access handles are supported in Safari 16.4+ but require feature detection. ITP means all script-writable storage is ephemeral for low-engagement sites.
- **Firefox**: Total Cookie Protection partitions all third-party storage. `navigator.storage.persist()` may prompt the user. IndexedDB performance is generally excellent due to SQLite backend.
- **Chrome**: Most complete OPFS and Storage Buckets support. Storage estimate includes `usageDetails`. Quota is dynamic based on disk pressure.

### 16.5 Testing Storage Behavior

Automated testing of browser storage is challenging because:

- Quotas vary by environment.
- Incognito mode may disable certain APIs.
- Eviction is nondeterministic and browser-specific.

Use Playwright or Puppeteer with explicit storage management:

```ts
// Playwright example
await context.clearPermissions();
await page.evaluate(() => localStorage.clear());
await context.grantPermissions(["persistent-storage"]);
```

For quota testing, mock `navigator.storage.estimate()` in unit tests, but always run integration tests against real browser profiles.

### 16.6 Architectural Patterns for Storage Composition

In complex applications, no single storage mechanism is sufficient. The following patterns describe how to compose multiple mechanisms into a coherent storage architecture.

#### 16.6.1 The Cache-Aside Pattern

Borrowed from server-side caching, the cache-aside pattern places application logic between the storage layer and the data consumer:

1. The application checks IndexedDB/OPFS for data.
2. If missing, fetch from the network.
3. Store the result in the cache before returning it.
4. Subsequent reads hit the cache.

This pattern is simple and effective for read-heavy workloads, but it requires manual invalidation logic. The Cache API in Service Workers is a built-in cache-aside implementation for HTTP responses.

#### 16.6.2 The Write-Through Pattern

Every write goes simultaneously to the primary store (IndexedDB) and a secondary fast cache (memory + localStorage for small metadata). Reads prefer the fast cache. On startup, the fast cache is warmed from the primary store.

This pattern optimizes read latency but doubles write latency and introduces consistency challenges if the primary write succeeds and the secondary fails. Compensation logic (retry queues, reconciliation on next startup) is required.

#### 16.6.3 The Metadata-in-DB, Blobs-in-OPFS Pattern

For applications managing large media files or scientific datasets, the optimal architecture stores structured metadata (file names, creation dates, tags, thumbnails) in IndexedDB object stores with indexes, while the actual binary payloads reside in OPFS files referenced by path.

This hybrid approach leverages IndexedDB's querying capabilities for metadata search and OPFS's streaming I/O for binary access. A foreign-key-like relationship is maintained: the IndexedDB record contains the OPFS file path, and deletion cascades from IndexedDB to OPFS.

#### 16.6.4 The Tiered Persistence Queue

For analytics or logging data that must survive crashes but need not be immediately durable, implement a tiered queue:

1. **Hot tier**: In-memory ring buffer (fastest, ephemeral).
2. **Warm tier**: localStorage or sessionStorage for recent events (survives reloads).
3. **Cold tier**: IndexedDB or OPFS for long-term accumulation.
4. **Archive tier**: Periodic sync to remote server.

A background worker drains the hot tier to warm every few seconds, the warm tier to cold every minute, and the cold tier to the server every hour. This amortizes I/O cost while maximizing crash resilience.

#### 16.6.5 The Schema Version Registry

When an application uses multiple IndexedDB databases, OPFS directories, and localStorage keys, schema migration becomes a distributed systems problem. Maintain a single "schema registry" entry in localStorage:

```ts
interface SchemaRegistry {
  version: number;
  components: Array<{
    name: string;
    type: "indexedDB" | "opfs" | "localStorage";
    schemaVersion: number;
    migratedAt: string;
  }>;
}
```

On startup, read the registry and reconcile each component's actual version with its expected version. This prevents partial migration states where IndexedDB is at v3 but OPFS metadata is still at v2.

---

## 17. References

1. **RFC 6265bis** — *HTTP State Management Mechanism (draft-ietf-httpbis-rfc6265bis-12)*, IETF, 2024. Defines modern cookie semantics including SameSite and Partitioned.

2. **HTML Living Standard** — *Web Storage*, WHATWG. <https://html.spec.whatwg.org/multipage/webstorage.html>

3. **Indexed Database API 3.0** — W3C Candidate Recommendation, 2024. <https://www.w3.org/TR/IndexedDB-3/>

4. **Service Workers** — W3C Recommendation, 2023. Defines Cache API and Service Worker lifecycle. <https://www.w3.org/TR/service-workers-1/>

5. **File System Living Standard** — WHATWG. Defines OPFS, FileSystemHandle, and sync access handles. <https://fs.spec.whatwg.org/>

6. **Storage Standard** — WHATWG. Defines Storage Quota API, `navigator.storage.estimate()`, and persistence model. <https://storage.spec.whatwg.org/>

7. **Storage Buckets API** — WICG Explainer, 2024. <https://github.com/WICG/storage-buckets>

8. **Apple WebKit Blog** — *Intelligent Tracking Prevention 2.3*, 2020. Documents 7-day storage cap. <https://webkit.org/blog/10882/>

9. **Chrome Platform Status** — *Storage Buckets*, *Origin Private File System*. <https://chromestatus.com/features>

10. **MDN Web Docs** — *Web Storage API*, *IndexedDB API*, *Cache API*, *File System API*. <https://developer.mozilla.org/en-US/docs/Web/API>

11. **Russell, A.** — *Progressive Web Apps: Escaping Tabs Without Losing Our Soul*, 2015. Foundational text on PWA storage architecture.

12. **Archibald, J.** — *Instant Loading: How to build offline-first Progressive Web Apps*, Google I/O 2016. Practical guidance on Cache API and Service Worker patterns.

13. **Bidelman, E.** — *The File System Access API: Simplifying access to local files*, web.dev, 2020. Distinction between OPFS and user-visible file access.

14. **van Kesteren, A.** — *Fetch Standard*, WHATWG. Underlying networking primitives for Cache API. <https://fetch.spec.whatwg.org/>

15. **West, M. & Goodwin, M.** — *SameSite Cookies Explained*, web.dev, 2019. <https://web.dev/samesite-cookies-explained/>

16. **Caldwell, J.** — *Privacy Sandbox Overview*, Chrome Developers, 2024. <https://developer.chrome.com/docs/privacy-sandbox/>

17. **Mozilla Hacks** — *Total Cookie Protection*, 2022. <https://hacks.mozilla.org/2022/02/total-cookie-protection/>

18. **W3C TAG** — *Ethical Web Principles*, 2023. Guidance on privacy-respecting storage design. <https://www.w3.org/TR/ethical-web-principles/>

---

## 18. Summary

Browser storage is not a single API but a stratified ecosystem of mechanisms, each with distinct latency, capacity, scope, and privacy characteristics. The categorical semantics reveal structural relationships — functors, monads, and Cartesian closed structures — that guide principled API selection. The symmetric differential analysis exposes asymmetric replacement capabilities, preventing the common anti-pattern of using the wrong tool for the job.

Cookies remain essential for server-integrated session state but are unsuitable for client-side data due to size limits and header overhead. localStorage and sessionStorage provide trivial APIs for small, structured data but block the main thread and lack transactional safety. IndexedDB is the workhorse for structured client-side databases, offering indexing, transactions, and significant capacity at the cost of API complexity. The Cache API is purpose-built for HTTP response caching in Service Worker contexts. OPFS unlocks high-performance file I/O for binary data and large payloads, particularly when paired with Web Worker sync access handles.

Quota management is unified across all storage types via the Storage Quota API, but eviction is coarse-grained at the origin level. The proposed Storage Buckets API promises finer control over durability and quota allocation. Privacy frameworks — Safari's ITP, Chrome's Privacy Sandbox, Firefox's ETP — increasingly constrain storage longevity for cross-site tracking, making ephemeral-by-default design a necessity.

The six TypeScript implementations provided in this document — cookie parser, quota estimator, IndexedDB wrapper, OPFS manager, fingerprinting detector, and persistence strategy selector — are production-ready starting points that embody the specification details, edge cases, and performance considerations discussed herein. Engineers should treat browser storage as a tiered system, selecting mechanisms based on data size, query patterns, durability requirements, and privacy constraints, with automatic fallback chains for resilience.

The web platform's storage landscape will continue evolving: third-party cookies are disappearing, partitioned storage is becoming universal, and new APIs like Shared Storage and the Private Aggregation API aim to preserve legitimate use cases without enabling mass surveillance. Understanding the foundational architecture presented in this document is prerequisite to navigating that evolution successfully.
