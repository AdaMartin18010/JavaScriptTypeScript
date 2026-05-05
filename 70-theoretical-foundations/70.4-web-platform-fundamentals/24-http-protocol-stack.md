---
title: 'HTTP 协议栈'
description: 'HTTP Protocol Stack: HTTP/1.1, HTTP/2, HTTP/3/QUIC, TLS, DNS, TCP'
english-abstract: "A comprehensive deep-dive into the modern HTTP protocol stack, covering HTTP/1.1 through HTTP/3, TLS/SSL internals, DNS resolution mechanisms, TCP congestion control, navigation timing, and resource prioritization. Includes categorical semantics, symmetric difference analysis, engineering decision matrices, and working TypeScript implementations of HPACK, QUIC framing, TLS state machines, and stream schedulers."
last-updated: 2026-05-05
status: complete
priority: P0
---

# HTTP Protocol Stack: A Deep Architectural Analysis

## 1. Introduction: The Stratified Transport Architecture

The modern web platform rests upon a deeply stratified protocol stack that has evolved from the simplicity of HTTP/1.0 into the multiplexed, encrypted, and congestion-aware architecture of HTTP/3 over QUIC. Understanding this stack requires moving beyond surface-level API interactions—`fetch()`, `XMLHttpRequest`, or `navigator.sendBeacon()`—and descending into the framing layers, transport semantics, and cryptographic handshakes that govern every byte exchanged between user agents and origin servers.

This document provides a systematic, bottom-up and top-down analysis of the HTTP protocol family, treating each version not merely as an incremental improvement but as a distinct solution to specific constraints imposed by the underlying transport. We examine HTTP/1.1's textual paradigm and its inherent Head-of-Line (HOL) blocking limitations, HTTP/2's binary framing layer and its vulnerability to TCP-level HOL blocking, and HTTP/3's radical departure from TCP altogether in favor of QUIC's user-space, UDP-based transport with native stream multiplexing and connection migration.

Beyond the core protocols, we dissect the security layer (TLS 1.2 and 1.3), the name resolution infrastructure (DNS with DoH/DoT and Happy Eyeballs), the transport control mechanisms (TCP slow start, congestion avoidance, Fast Open), and the browser's performance observability surface (Navigation Timing API). We further introduce formal tools—categorical semantics and symmetric difference analysis—to reason about protocol behaviors as mathematical structures rather than mere engineering artifacts.

Each section is accompanied by working TypeScript implementations that demonstrate real concepts: HPACK header compression decoders, QUIC frame parsers, TLS handshake state machines, DNS resolvers with dual-stack fallback, and navigation timing analyzers. These are not illustrative pseudocode; they are executable models that capture the essential logic of the protocols they describe.

The document is organized to support both linear reading and reference lookup. Sections 2 through 10 cover the operational protocol stack from transport to application. Sections 11 through 14 introduce formal analysis, comparative evaluation, and engineering guidance. Readers seeking immediate practical application may focus on Sections 7 through 10 and the TypeScript reference implementations. Readers interested in protocol design theory should examine Sections 11 and 12, where we treat HTTP as a state transition system and apply symmetric difference analysis to reason about protocol equivalence.

### 1.1 Protocol Layering and the OSI Model

The HTTP protocol stack does not map cleanly onto the seven-layer OSI model, yet that model remains a useful pedagogical scaffold. At Layer 7 (Application), HTTP defines request methods, status codes, and header semantics. Layer 6 (Presentation) is effectively collapsed into TLS, which handles encryption, compression (historically), and data format negotiation via ALPN. Layer 5 (Session) is where QUIC operates, managing connection state, session resumption, and connection migration. Layer 4 (Transport) is bifurcated: TCP serves HTTP/1.1 and HTTP/2, while QUIC subsumes both Layer 4 and parts of Layer 3 functionality for HTTP/3. Layer 3 (Network) is IP, with its routing, fragmentation, and ECN signaling. Layer 2 (Data Link) and Layer 1 (Physical) are outside the scope of this document but exert tangible influence through MTU constraints, Wi-Fi frame aggregation, and cellular scheduling.

This layering is not strictly hierarchical. QUIC violates the layering principle by encrypting its own headers (the Connection ID is the only unencrypted field in Initial packets), effectively blending transport and presentation. HTTP/2's binary framing layer sits ambiguously between application and presentation, defining neither data semantics nor encryption but rather message packaging. These boundary violations are not failures of engineering but adaptations to empirical constraints: the traditional layering model ossified under the pressure of middlebox interference and security requirements, necessitating a more integrated approach.

Understanding where each protocol "belongs" in the stack is essential for debugging. A timeout at the application layer (`fetch` promise rejection) might stem from a DNS failure (Layer 3/7 boundary), a TCP retransmission timeout (Layer 4), a TLS certificate validation error (Layer 6), or an HTTP/2 GOAWAY frame (Layer 7). Effective diagnosis requires tracing symptoms across layer boundaries, a practice we formalize in the Navigation Timing analysis of Section 8.

---

## 2. HTTP/1.1: Textual Semantics and Architectural Constraints

### 2.1 Persistent Connections and Keep-Alive

HTTP/1.0 required a new TCP connection for every request-response pair, imposing significant overhead from repeated TCP three-way handshakes and TLS negotiations. HTTP/1.1 formalized persistent connections via the default `Connection: keep-alive` semantics (later made implicit unless `Connection: close` is present). A single TCP connection can now carry multiple requests sequentially, amortizing the connection establishment cost across a session.

The Keep-Alive mechanism operates through connection reuse governed by the `Keep-Alive` header, which may specify `timeout` (seconds the server will keep the connection open) and `max` (maximum number of requests allowed). However, this is merely advisory; either peer may close the connection at any time, and clients must handle mid-request connection termination gracefully. Proxy servers further complicate Keep-Alive semantics: a proxy may maintain its own timeout with the client that differs from its timeout with the origin server, creating a "proxy mismatch" where the proxy closes the upstream connection while the client believes it remains valid.

Persistent connections introduce complexity around message framing. Because the connection does not close after each response, the receiver must know precisely where one message ends and the next begins. HTTP/1.1 solves this through two mechanisms: explicit `Content-Length` headers, and chunked transfer encoding. The choice between these mechanisms is negotiated implicitly by the presence or absence of headers; there is no single handshake that declares the framing mode for the entire connection. This implicit negotiation is a source of ambiguity that HTTP/2's explicit frame types eliminated entirely.

### 2.2 Chunked Transfer Encoding

Chunked transfer encoding (`Transfer-Encoding: chunked`) allows the server to stream dynamically generated content without knowing the total size in advance. The message body is divided into chunks, each prefixed by its size in hexadecimal, followed by `\r\n`, then the chunk data, and terminated by an empty chunk (`0\r\n\r\n`).

This mechanism is essential for server-sent events, streaming JSON, and progressive HTML rendering. It also enables trailers—headers sent after the message body via the `Trailer` header—though browser support for trailers remains limited in practice.

### 2.3 Pipelining and Its Failure

HTTP/1.1 introduced pipelining (RFC 2616 §8.1.2.2), allowing a client to send multiple requests without waiting for each response. In theory, this reduces round-trip latency on high-bandwidth, high-latency links. In practice, pipelining failed catastrophically.

The failure modes were manifold:

- **Head-of-Line Blocking**: Because responses must arrive in the same order as requests, a slow or large response blocks all subsequent responses on that connection.
- **Implementation Complexity**: Intermediate proxies (especially transparent proxies and antivirus software) frequently reordered, buffered, or mangled pipelined requests.
- **Error Recovery**: If a pipelined response indicates connection closure, the client cannot determine which requests were processed by the server, necessitating complex retry logic that often violated idempotency assumptions.

By 2010, all major browsers had disabled or removed HTTP/1.1 pipelining. It remains a historical cautionary tale: transport-layer ordering constraints cannot be solved at the application layer without changing the transport semantics.

### 2.4 Connection Parallelism and Domain Sharding

In the absence of effective pipelining, browsers adopted connection-level parallelism. The HTTP/1.1 specification recommended a limit of two concurrent connections per host (RFC 2616), but modern browsers raised this to 6–8 connections per domain. Web developers responded with domain sharding—splitting assets across multiple subdomains (`cdn1.example.com`, `cdn2.example.com`) to bypass per-host limits, often achieving 20+ concurrent connections.

Domain sharding introduced its own pathologies: increased DNS resolution load, more TLS handshakes, higher probability of TCP slow-start penalties, and reduced effectiveness of congestion control due to competing flows. These trade-offs directly motivated HTTP/2's multiplexed streams.

### 2.5 HOL Blocking at the Application Layer

In HTTP/1.1, HOL blocking is absolute at the application layer within a single connection. Even with six parallel connections, if a large JavaScript bundle monopolizes one connection, resources queued behind it wait. There is no mechanism to interleave bytes from different responses. This constraint fundamentally limited page load performance on congested or high-RTT networks.

### 2.6 Message Syntax and Framing Detail

HTTP/1.1 messages are sequences of octets governed by a strict ABNF grammar (RFC 9112 §2). A request begins with a request-line (`METHOD SP request-target SP HTTP-version CRLF`), followed by header fields, an empty line, and an optional body. Responses begin with a status-line (`HTTP-version SP status-code SP reason-phrase CRLF`). The textual nature of this format means that parsers must handle variable-length lines, tolerate obsolete line folding, and reject malformed messages that could be exploited for request smuggling.

Request smuggling arises when the front-end proxy and back-end server disagree on message boundaries. If a proxy interprets `Content-Length` while the origin interprets `Transfer-Encoding: chunked`, an attacker can prepend a smuggled request inside the body of a legitimate one. Defenses include rejecting messages with both headers present, normalizing header parsing, and using HTTP/2's explicit framing where possible.

### 2.7 Connection Close Semantics and Race Conditions

Because HTTP/1.1 connections are persistent, both client and server must coordinate closure to avoid truncation attacks. The `Connection: close` header signals intent, but the TCP FIN may arrive before the final response bytes. A client that receives a close notification mid-response cannot determine whether the message was complete. This ambiguity is why `Content-Length` and chunked encoding are essential: they provide unambiguous message termination independent of the transport lifecycle.

Idle connection timeouts introduce another race. If a client sends a request just as the server closes an idle connection, the client receives a TCP RST and must retry. Most HTTP clients implement retry logic with exponential backoff, but non-idempotent retries require careful handling to avoid duplicate mutations.

### 2.8 Trailers, Upgrade Mechanisms, and Protocol Switching

Trailers in HTTP/1.1 allow a server to send metadata after the message body, using the `Trailer` header to announce which headers will follow. This is useful for sending checksums (`Content-MD5`, now largely superseded by content-encoding integrity), digital signatures, or end-to-end latency measurements that cannot be computed until the entire body is generated. However, trailers are incompatible with HTTP/1.1 message framing when `Content-Length` is used (because the receiver expects a fixed-size body), so they require chunked transfer encoding. Browser support for processing trailers has historically been minimal, and they are more commonly used in API-to-API communication than in browser-server contexts.

The `Upgrade` header enables protocol switching within HTTP/1.1, most notably for WebSocket establishment. A client sends `Upgrade: websocket` with `Connection: Upgrade`; if the server agrees, it responds with `101 Switching Protocols` and the connection transitions from HTTP to the WebSocket framing protocol. This mechanism demonstrates the flexibility of HTTP/1.1's textual handshake but also its limitations: the upgrade is all-or-nothing for the connection, and it cannot be reverted. HTTP/2 and HTTP/3 do not use `Upgrade`; they negotiate via ALPN during the TLS handshake, a more robust approach because it occurs before application data is exchanged.

---

## 3. HTTP/2: Binary Framing and Multiplexed Streams

### 3.1 The Binary Framing Layer

HTTP/2 (RFC 9113) departs radically from HTTP/1.1's textual format. All communication is partitioned into length-prefixed frames carried over a single TCP connection. The frame structure is:

- **Length** (24 bits): Payload size (max 16,383 bytes by default, extensible to 2^24-1)
- **Type** (8 bits): Frame type (HEADERS, DATA, SETTINGS, PRIORITY, RST_STREAM, PING, GOAWAY, WINDOW_UPDATE, CONTINUATION, etc.)
- **Flags** (8 bits): Type-specific boolean flags (END_STREAM, END_HEADERS, PADDED, PRIORITY, etc.)
- **Reserved** (1 bit): Must be zero
- **Stream Identifier** (31 bits): Unique ID for the stream within the connection
- **Payload**: Variable-length frame body

This binary framing enables precise multiplexing: frames from multiple streams are interleaved at the byte level. A server can send header frames for stream 1, followed by data frames for stream 3, then window updates for stream 5, all on the same TCP connection without either stream blocking the other at the HTTP layer.

### 3.2 Stream State Machine

Each HTTP/2 stream progresses through a well-defined state machine: idle → open → half-closed (local/remote) → closed. The `HEADERS` frame opens a stream; the `END_STREAM` flag initiates half-closure; `RST_STREAM` aborts a stream prematurely. This fine-grained lifecycle management allows either peer to cancel individual requests without tearing down the entire connection.

Stream identifiers are allocated monotonically. Client-initiated streams use odd numbers; server-initiated (for server push) use even numbers. Stream 0x0 is reserved for connection-level control frames (SETTINGS, PING, GOAWAY).

### 3.3 HPACK: Header Compression

HTTP/1.1's textual headers are notoriously verbose and repetitive. HTTP/2 employs HPACK (RFC 7541), a compression format that combines static table indexing, dynamic table indexing, and Huffman encoding.

The **static table** contains 61 predefined header fields (e.g., `:method: GET`, `:status: 200`, `content-type: application/json`). The **dynamic table** is a connection-specific, FIFO-ordered cache of recently transmitted headers, initialized empty and adjusted via `SETTINGS_HEADER_TABLE_SIZE`. Header names or values can be encoded as integer indices into either table, as string literals with or without Huffman coding, or as dynamic table insertions.

HPACK is resilient to compression oracle attacks (unlike DEFLATE in SPDY) because the dynamic table is strictly length-limited and never compressed across disjoint header sets. However, implementations must still guard against CRIME-like attacks by avoiding variable-length encoding of sensitive data in contexts where the attacker can observe packet sizes.

### 3.4 Flow Control and Stream Priority

HTTP/2 implements per-stream and connection-level flow control via `WINDOW_UPDATE` frames. Each stream maintains a receive window (default 65,535 bytes); the connection maintains a separate window. Endpoints advertise available buffer space, and senders must respect zero-window values. This prevents slow consumers from being overwhelmed without head-of-line blocking across streams.

Stream priority allows clients to express relative importance via `PRIORITY` frames (or the priority field in HEADERS). Priority is expressed as a dependency tree: a stream may depend on another stream, with a weight (1–256) indicating share of resources. Browsers historically used this to prioritize above-the-fold CSS over async scripts. However, the original priority mechanism proved complex and was frequently misimplemented; HTTP/3 and the Priority Hints specification have since introduced simpler, signal-based approaches.

HTTP/2 flow control operates on a credit-based system. The receiver advertises available buffer space via `WINDOW_UPDATE` frames; the sender must not transmit more data than the window allows. This window applies separately to each stream and to the connection as a whole. The design intentionally decouples flow control from congestion control: flow control prevents a fast sender from overwhelming a slow receiver, while congestion control prevents a sender from overwhelming the network. On high-bandwidth-delay-product (BDP) networks, the default window sizes (65,535 bytes) are insufficient to saturate the link; modern implementations increase `SETTINGS_INITIAL_WINDOW_SIZE` to 1 MB or more to maximize throughput.

### 3.5 Server Push and Its Deprecation

Server push allowed a server to preemptively send resources (`PUSH_PROMISE` frame) that the client had not yet requested, based on the server's prediction of need (e.g., pushing CSS after receiving a request for HTML). In principle, this eliminated round trips. In practice, push suffered from low cache-hit ratios, wasted bandwidth when the client already had the resource cached, and complexity in cache digest negotiation.

Chrome removed server push in 2022; HTTP/3 does not include it. The web community has largely pivoted to early hints (`103 Early Hints`) and resource preloading (`<link rel="preload">`) as more predictable alternatives.

### 3.6 The TCP HOL Blocking Problem

Despite HTTP/2's application-layer multiplexing, it remains vulnerable to Head-of-Line blocking at the TCP layer. Because all streams share a single TCP connection, a lost packet in one stream stalls delivery of all streams until TCP retransmits and in-order delivery is restored. On lossy networks (especially mobile and cross-continental links), this effect can negate HTTP/2's latency benefits. This vulnerability was the primary motivation for HTTP/3.

### 3.7 SETTINGS, GOAWAY, and Connection Management

HTTP/2 connections begin with a mandatory SETTINGS exchange. Each peer advertises constraints: `SETTINGS_MAX_CONCURRENT_STREAMS` limits active streams; `SETTINGS_INITIAL_WINDOW_SIZE` controls flow control credit; `SETTINGS_MAX_HEADER_LIST_SIZE` prevents memory exhaustion from oversized headers. These settings form a contract: an endpoint that violates them receives a `CONNECTION_ERROR`.

The GOAWAY frame provides graceful shutdown. A server nearing maintenance may send `GOAWAY` with the last processed stream ID, signaling that new streams should not be initiated while allowing in-flight streams to complete. This is superior to HTTP/1.1's abrupt TCP close, which orphans pending requests.

CONTINUATION frames (type 0x9) allow header blocks to exceed the maximum frame size (16,384 bytes by default). A HEADERS frame with `END_HEADERS` unset must be followed by one or more CONTINUATION frames, with the final frame setting `END_HEADERS`. This chaining ensures that HPACK-encoded header sets are delivered atomically without interleaving unrelated frames.

### 3.8 Error Handling and Stream Resets

HTTP/2 categorizes errors as connection errors (fatal, requiring GOAWAY) and stream errors (local, remediable with RST_STREAM). A stream error might arise from invalid header compression, violation of the request pseudo-header schema (`:method`, `:scheme`, `:authority`, `:path` must be present and precede regular headers), or refusal by the server to serve a specific resource. RST_STREAM carries an error code (CANCEL, REFUSED_STREAM, INTERNAL_ERROR, FLOW_CONTROL_ERROR) that informs the peer why the stream was terminated.

Connection errors include PROTOCOL_ERROR (violation of the framing layer), COMPRESSION_ERROR (HPACK decoding failure), and INADEQUATE_SECURITY (TLS parameters insufficient for HTTP/2, such as cipher suites lacking forward secrecy). Upon receiving a connection error, the endpoint must close the TCP connection immediately.

### 3.9 HPACK Dynamic Table Management

The HPACK dynamic table is both a compression mechanism and a potential attack surface. Each connection maintains a dynamic table as an array of header fields, evicted in FIFO order when the table size exceeds the limit advertised via `SETTINGS_HEADER_TABLE_SIZE`. The encoder decides which headers to insert into the dynamic table, trading off compression ratio against memory usage and eviction cost.

An encoder that inserts every header field achieves maximum compression for repeated fields but may evict entries before they can be reused. A conservative encoder that never uses the dynamic table degrades to static table indexing and literal encoding, wasting bandwidth. Production implementations use heuristics: frequently occurring headers (`user-agent`, `accept-language`) are inserted; highly variable headers (`cookie`, `x-request-id`) are sent as literals without indexing.

HPACK's security against CRIME-style attacks stems from its prohibition of cross-message context sharing and its fixed table size. Unlike SPDY's DEFLATE-based compression, where an attacker could probe the dictionary by observing compressed sizes, HPACK's dynamic table is connection-scoped and length-bounded. Nevertheless, implementations must avoid indexing sensitive values (e.g., authorization tokens) to prevent information leakage through table size side channels.

```typescript
/**
 * §3.7 TypeScript Example: HPACK Static Table Decoder
 *
 * A minimal, spec-compliant decoder for HPACK's static table (RFC 7541, Appendix A).
 * Demonstrates indexed header representation and literal-with-indexing logic.
 */

interface HPACKHeader {
  name: string;
  value: string;
  index: number;
}

class HPACKStaticTable {
  private static readonly TABLE: HPACKHeader[] = [
    { name: ':authority', value: '', index: 1 },
    { name: ':method', value: 'GET', index: 2 },
    { name: ':method', value: 'POST', index: 3 },
    { name: ':path', value: '/', index: 4 },
    { name: ':path', value: '/index.html', index: 5 },
    { name: ':scheme', value: 'http', index: 6 },
    { name: ':scheme', value: 'https', index: 7 },
    { name: ':status', value: '200', index: 8 },
    { name: ':status', value: '204', index: 9 },
    { name: ':status', value: '206', index: 10 },
    { name: ':status', value: '304', index: 11 },
    { name: ':status', value: '400', index: 12 },
    { name: ':status', value: '404', index: 13 },
    { name: ':status', value: '500', index: 14 },
    { name: 'accept-charset', value: '', index: 15 },
    { name: 'accept-encoding', value: 'gzip, deflate', index: 16 },
    { name: 'accept-language', value: '', index: 17 },
    { name: 'accept-ranges', value: '', index: 18 },
    { name: 'accept', value: '', index: 19 },
    { name: 'access-control-allow-origin', value: '', index: 20 },
    { name: 'age', value: '', index: 21 },
    { name: 'allow', value: '', index: 22 },
    { name: 'authorization', value: '', index: 23 },
    { name: 'cache-control', value: '', index: 24 },
    { name: 'content-disposition', value: '', index: 25 },
    { name: 'content-encoding', value: '', index: 26 },
    { name: 'content-language', value: '', index: 27 },
    { name: 'content-length', value: '', index: 28 },
    { name: 'content-location', value: '', index: 29 },
    { name: 'content-range', value: '', index: 30 },
    { name: 'content-type', value: '', index: 31 },
    { name: 'cookie', value: '', index: 32 },
    { name: 'date', value: '', index: 33 },
    { name: 'etag', value: '', index: 34 },
    { name: 'expect', value: '', index: 35 },
    { name: 'expires', value: '', index: 36 },
    { name: 'from', value: '', index: 37 },
    { name: 'host', value: '', index: 38 },
    { name: 'if-match', value: '', index: 39 },
    { name: 'if-modified-since', value: '', index: 40 },
    { name: 'if-none-match', value: '', index: 41 },
    { name: 'if-range', value: '', index: 42 },
    { name: 'if-unmodified-since', value: '', index: 43 },
    { name: 'last-modified', value: '', index: 44 },
    { name: 'link', value: '', index: 45 },
    { name: 'location', value: '', index: 46 },
    { name: 'max-forwards', value: '', index: 47 },
    { name: 'proxy-authenticate', value: '', index: 48 },
    { name: 'proxy-authorization', value: '', index: 49 },
    { name: 'range', value: '', index: 50 },
    { name: 'referer', value: '', index: 51 },
    { name: 'refresh', value: '', index: 52 },
    { name: 'retry-after', value: '', index: 53 },
    { name: 'server', value: '', index: 54 },
    { name: 'set-cookie', value: '', index: 55 },
    { name: 'strict-transport-security', value: '', index: 56 },
    { name: 'transfer-encoding', value: '', index: 57 },
    { name: 'user-agent', value: '', index: 58 },
    { name: 'vary', value: '', index: 59 },
    { name: 'via', value: '', index: 60 },
    { name: 'www-authenticate', value: '', index: 61 },
  ];

  static lookup(index: number): HPACKHeader | undefined {
    return HPACKStaticTable.TABLE.find(h => h.index === index);
  }

  static find(name: string, value?: string): HPACKHeader | undefined {
    return HPACKStaticTable.TABLE.find(
      h => h.name === name && (value === undefined || h.value === value)
    );
  }
}

class HPACKDecoder {
  private dynamicTable: HPACKHeader[] = [];
  private maxDynamicTableSize = 4096;

  decodeInteger(buf: Uint8Array, prefixBits: number, offset: number): { value: number; nextOffset: number } {
    const prefixMask = (1 << prefixBits) - 1;
    let value = buf[offset] & prefixMask;
    let i = offset;
    if (value === prefixMask) {
      let M = 0;
      do {
        i++;
        value += (buf[i] & 0x7f) * (2 ** M);
        M += 7;
      } while (buf[i] & 0x80);
      i++;
    } else {
      i++;
    }
    return { value, nextOffset: i };
  }

  decodeIndexedHeader(buf: Uint8Array, offset: number): { header: HPACKHeader; nextOffset: number } {
    const { value: index, nextOffset } = this.decodeInteger(buf, 7, offset);
    const header = index <= 61
      ? HPACKStaticTable.lookup(index)!
      : this.dynamicTable[index - 62];
    if (!header) throw new Error(`Invalid index: ${index}`);
    return { header, nextOffset };
  }

  setDynamicTableSize(maxSize: number): void {
    this.maxDynamicTableSize = maxSize;
    this.evictDynamicTable();
  }

  private evictDynamicTable(): void {
    let size = this.dynamicTable.reduce((sum, h) => sum + 32 + h.name.length + h.value.length, 0);
    while (size > this.maxDynamicTableSize && this.dynamicTable.length > 0) {
      const removed = this.dynamicTable.pop()!;
      size -= 32 + removed.name.length + removed.value.length;
    }
  }
}

/**
 * §3.8 TypeScript Example: HTTP/2 Stream Scheduler
 *
 * Simulates an HTTP/2-compliant stream scheduler with weighted round-robin
 * scheduling across stream dependencies. Demonstrates flow control windowing.
 */

type StreamState = 'idle' | 'open' | 'half-closed-local' | 'half-closed-remote' | 'closed';

interface HTTP2Stream {
  id: number;
  weight: number;
  dependency: number | null;
  state: StreamState;
  sendWindow: number;
  recvWindow: number;
  queue: Uint8Array[];
}

class HTTP2StreamScheduler {
  private streams = new Map<number, HTTP2Stream>();
  private connectionSendWindow = 65535;
  private connectionRecvWindow = 65535;

  createStream(id: number, weight = 16, dependency: number | null = 0): HTTP2Stream {
    const stream: HTTP2Stream = {
      id,
      weight: Math.max(1, Math.min(256, weight)),
      dependency,
      state: 'idle',
      sendWindow: 65535,
      recvWindow: 65535,
      queue: [],
    };
    this.streams.set(id, stream);
    return stream;
  }

  updateWindow(id: number | 'connection', delta: number): void {
    if (id === 'connection') {
      this.connectionSendWindow += delta;
    } else {
      const stream = this.streams.get(id);
      if (stream) stream.sendWindow += delta;
    }
  }

  schedule(): Array<{ streamId: number; data: Uint8Array; length: number }> {
    const scheduled: Array<{ streamId: number; data: Uint8Array; length: number }> = [];
    const available = this.connectionSendWindow;
    let remaining = available;

    const activeStreams = Array.from(this.streams.values())
      .filter(s => s.state === 'open' && s.queue.length > 0 && s.sendWindow > 0);

    if (activeStreams.length === 0) return scheduled;

    const totalWeight = activeStreams.reduce((sum, s) => sum + s.weight, 0);

    for (const stream of activeStreams) {
      if (remaining <= 0) break;
      const share = Math.floor((stream.weight / totalWeight) * available);
      const allowed = Math.min(share, stream.sendWindow, remaining, stream.queue[0].length);
      if (allowed > 0) {
        const chunk = stream.queue[0].subarray(0, allowed);
        stream.queue[0] = stream.queue[0].subarray(allowed);
        if (stream.queue[0].length === 0) stream.queue.shift();
        stream.sendWindow -= allowed;
        remaining -= allowed;
        scheduled.push({ streamId: stream.id, data: chunk, length: allowed });
      }
    }

    this.connectionSendWindow = remaining;
    return scheduled;
  }

  sendData(streamId: number, data: Uint8Array): void {
    const stream = this.streams.get(streamId);
    if (!stream || stream.state !== 'open') {
      throw new Error(`Cannot send on stream ${streamId} in state ${stream?.state}`);
    }
    stream.queue.push(data);
  }

  closeStream(streamId: number): void {
    const stream = this.streams.get(streamId);
    if (stream) stream.state = 'closed';
  }
}
```

---

## 4. HTTP/3 and QUIC: User-Space Transport

### 4.1 QUIC as a Transport Protocol

HTTP/3 (RFC 9114) is the first HTTP version not built atop TCP. Instead, it uses QUIC (RFC 9000), a transport protocol implemented in user space over UDP. QUIC integrates features traditionally split across layers: it provides stream multiplexing (like HTTP/2), congestion control (like TCP), and encryption (like TLS), all within a single protocol.

The fundamental insight behind QUIC is that transport semantics need not be tied to the kernel. By implementing congestion control, loss recovery, and flow control in user space, QUIC can iterate rapidly, experiment with new algorithms (e.g., BBRv2), and provide consistent behavior across operating systems.

### 4.2 Connection Migration

TCP connections are identified by the 4-tuple (source IP, source port, destination IP, destination port). If a client's IP address changes—due to switching from Wi-Fi to cellular, or moving between access points—the TCP connection breaks and must be reestablished. QUIC solves this by decoupling the connection from the network path.

Every QUIC connection is identified by a 64-bit Connection ID chosen by the server (or a set of IDs negotiated during the handshake). Packets carry this Connection ID, allowing the server to associate packets from a new IP/port pair with an existing connection. This enables seamless connection migration without renegotiation, a critical feature for mobile devices and resilient long-lived connections.

### 4.3 Independent Streams and Elimination of HOL Blocking

QUIC supports multiple bidirectional streams within a single connection, but unlike HTTP/2 over TCP, each QUIC stream is delivered independently. If a packet is lost on stream 1, only stream 1 stalls; streams 3, 5, and 7 continue receiving data. This eliminates TCP-level Head-of-Line blocking entirely.

This independence comes at a cost: each stream requires its own framing, ordering, and retransmission tracking. QUIC achieves this by assigning each stream a monotonically increasing offset, similar to TCP sequence numbers but scoped per-stream. The application layer (HTTP/3) maps request-response pairs to individual QUIC streams, preserving the HTTP/2 semantic of stream-specific cancellation via `STOP_SENDING` and `RESET_STREAM` frames.

### 4.4 0-RTT and 1-RTT Handshakes

QUIC integrates TLS 1.3 (see §5) to provide encryption and authentication. A standard QUIC handshake completes in one round trip (1-RTT): the client sends an Initial packet with a ClientHello, the server responds with a Handshake packet containing ServerHello and encrypted extensions, and the client acknowledges.

If the client has previously communicated with the server and cached session parameters (including the server's certificate and a session ticket), it can use 0-RTT. The client includes application data in its first flight, encrypted with a pre-shared key (PSK) derived from the cached session. This reduces latency to zero round trips for the first bytes of data, though 0-RTT is vulnerable to replay attacks and therefore should not be used for non-idempotent requests unless the application explicitly accepts the risk.

### 4.5 UDP-Based Congestion Control

Because QUIC runs over UDP, it must implement its own congestion control. QUIC generally uses congestion controllers similar to TCP: CUBIC (the Linux default) or BBR (Bottleneck Bandwidth and RTT). However, because QUIC operates in user space, it has more precise timing information (using `clock_gettime` or QPC on Windows) and can react to loss signals more quickly than TCP's kernel-bounded timers.

QUIC also introduces more granular acknowledgment frames. Unlike TCP's cumulative ACK, QUIC ACK frames explicitly list received packet numbers and their receive timestamps, enabling better loss detection (especially for spurious retransmission avoidance) and accurate RTT measurement.

### 4.6 Alt-Svc and SVCB Records

Because HTTP/3 uses UDP/443 rather than TCP/443, clients cannot simply attempt an HTTP/3 connection without knowing server support. Servers advertise HTTP/3 availability via the `Alt-Svc` response header (`Alt-Svc: h3=":443"; ma=86400`) or via DNS SVCB/HTTPS records (Service Binding).

SVCB records (RFC 9460) allow a DNS response to indicate not only the target IP address but also supported protocols, port numbers, and even Encrypted Client Hello (ECH) configurations. This enables clients to connect via HTTP/3 on the first attempt, eliminating the latency penalty of upgrading from HTTP/2.

### 4.7 Packet Number Spaces and Loss Recovery

QUIC partitions a connection into three packet number spaces: Initial, Handshake, and Application Data. Each space has independent packet numbering and acknowledgment, allowing the handshake to proceed even if application packets are lost. This separation is critical because handshake packets (containing TLS messages) must be processed by the cryptographic layer before application data can be decrypted.

Loss recovery in QUIC is more sophisticated than TCP's cumulative ACK. QUIC ACK frames enumerate individual received packet numbers, enabling precise loss detection. When a packet is deemed lost (via time threshold or packet threshold), QUIC retransmits the data in a new packet with a new packet number. This "retransmission as a new packet" design avoids ambiguity in RTT measurement: the ACK for the retransmission cannot be mistaken for the ACK of the original, a problem that plagues TCP's Karn's algorithm.

QUIC also supports Explicit Congestion Notification (ECN) and acknowledges ECN signals in ACK frames, allowing congestion controllers to react to network congestion before packet loss occurs. This integration of transport and security semantics within a single protocol represents a paradigmatic shift from the traditional Internet layering model.

### 4.8 QPACK: Header Compression for Out-of-Order Delivery

HTTP/3 cannot reuse HPACK directly because QUIC streams may deliver frames out of order. In HPACK, dynamic table insertions and lookups must occur in a precise sequence; if a decoder receives a reference to a dynamic table entry before the insertion instruction (because the insertion was sent on a different, slower stream), the decoder deadlocks.

QPACK (RFC 9204) solves this by decoupling the encoder and decoder dynamic tables via unidirectional control streams. The encoder sends table updates on a dedicated encoder stream; request and response streams contain only references (indices) into the table. The decoder reads updates from the encoder stream asynchronously, ensuring that by the time a reference is processed, the corresponding entry has been inserted. QPACK uses two additional mechanisms: the `Required Insert Count` (RIC) in each header block tells the decoder how many encoder-stream insertions must be processed before decoding, and the `Blocked Streams` setting limits how many streams may be blocked waiting for table updates.

This design trades a small amount of latency (encoder stream processing) for the elimination of HPACK's sequential dependency, a necessary adaptation for QUIC's independent streams.

```typescript
/**
 * §4.7 TypeScript Example: QUIC Frame Simulator
 *
 * A simplified parser/serializer for QUIC long and short header packets
 * and core frame types (STREAM, ACK, RESET_STREAM). Demonstrates
 * connection ID routing and stream offset tracking.
 */

enum QUICFrameType {
  PADDING = 0x00,
  PING = 0x01,
  ACK = 0x02,
  RESET_STREAM = 0x04,
  STOP_SENDING = 0x05,
  CRYPTO = 0x06,
  NEW_TOKEN = 0x07,
  STREAM_BASE = 0x08, // 0x08-0x0f variants
}

interface QUICStreamFrame {
  type: 'STREAM';
  streamId: number;
  offset: bigint;
  data: Uint8Array;
  fin: boolean;
}

interface QUICAckFrame {
  type: 'ACK';
  largestAcked: number;
  ackDelay: number;
  ranges: Array<[number, number]>;
}

class QUICFrameParser {
  private offset = 0;

  constructor(private buf: Uint8Array) {}

  private readVarInt(): bigint {
    const first = this.buf[this.offset];
    const prefix = first >> 6;
    let length = 1 << prefix;
    let value = BigInt(first & ~(0xc0));
    for (let i = 1; i < length; i++) {
      value = (value << 8n) | BigInt(this.buf[this.offset + i]);
    }
    this.offset += length;
    return value;
  }

  private readBytes(len: number): Uint8Array {
    const slice = this.buf.subarray(this.offset, this.offset + len);
    this.offset += len;
    return slice;
  }

  parse(): (QUICStreamFrame | QUICAckFrame)[] {
    const frames: (QUICStreamFrame | QUICAckFrame)[] = [];
    while (this.offset < this.buf.length) {
      const frameType = this.buf[this.offset++];
      if (frameType >= 0x08 && frameType <= 0x0f) {
        const streamId = Number(this.readVarInt());
        const hasOffset = (frameType & 0x04) !== 0;
        const hasLen = (frameType & 0x02) !== 0;
        const fin = (frameType & 0x01) !== 0;
        const offset = hasOffset ? this.readVarInt() : 0n;
        const length = hasLen ? Number(this.readVarInt()) : this.buf.length - this.offset;
        const data = this.readBytes(length);
        frames.push({ type: 'STREAM', streamId, offset, data, fin });
      } else if (frameType === QUICFrameType.ACK) {
        const largestAcked = Number(this.readVarInt());
        const ackDelay = Number(this.readVarInt());
        const rangeCount = Number(this.readVarInt());
        const ranges: Array<[number, number]> = [];
        let current = largestAcked;
        for (let i = 0; i <= rangeCount; i++) {
          const gap = i === 0 ? 0 : Number(this.readVarInt());
          const len = Number(this.readVarInt());
          const end = current - gap;
          const start = end - len;
          ranges.push([start, end]);
          current = start - 1;
        }
        frames.push({ type: 'ACK', largestAcked, ackDelay, ranges });
      } else if (frameType === QUICFrameType.RESET_STREAM) {
        const streamId = Number(this.readVarInt());
        const errorCode = Number(this.readVarInt());
        const finalSize = Number(this.readVarInt());
        // Simplified: not pushed to frames array for brevity
      }
    }
    return frames;
  }
}

class QUICConnection {
  private streams = new Map<number, { data: Uint8Array[]; finalOffset?: bigint }>();
  private receivedPackets = new Set<number>();

  constructor(readonly connectionId: Uint8Array) {}

  routePacket(packetNumber: number, frames: (QUICStreamFrame | QUICAckFrame)[]): void {
    if (this.receivedPackets.has(packetNumber)) return; // dedup
    this.receivedPackets.add(packetNumber);

    for (const frame of frames) {
      if (frame.type === 'STREAM') {
        if (!this.streams.has(frame.streamId)) {
          this.streams.set(frame.streamId, { data: [] });
        }
        const stream = this.streams.get(frame.streamId)!;
        stream.data.push(frame.data);
        if (frame.fin) stream.finalOffset = frame.offset + BigInt(frame.data.length);
      } else if (frame.type === 'ACK') {
        // Trigger loss detection / congestion control logic here
      }
    }
  }

  getStreamData(streamId: number): Uint8Array | undefined {
    const stream = this.streams.get(streamId);
    if (!stream) return undefined;
    const totalLen = stream.data.reduce((sum, d) => sum + d.length, 0);
    const merged = new Uint8Array(totalLen);
    let offset = 0;
    for (const chunk of stream.data) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }
    return merged;
  }
}
```

---

## 5. TLS/SSL: Cryptographic Handshake and Security Primitives

### 5.1 The TLS 1.2 and 1.3 Handshakes

TLS (Transport Layer Security) provides confidentiality, integrity, and authentication for HTTP traffic. TLS 1.2 (RFC 5246) requires two round trips for a full handshake: the client sends `ClientHello` with supported cipher suites and random nonce; the server responds with `ServerHello`, certificate, `ServerKeyExchange`, and `ServerHelloDone`; the client sends `ClientKeyExchange`, `ChangeCipherSpec`, and encrypted `Finished`; the server replies with its own `ChangeCipherSpec` and `Finished`.

TLS 1.3 (RFC 8446) reduces this to one round trip in the common case. The client sends `ClientHello` with key shares, supported groups, and signatures; the server responds with `ServerHello`, encrypted extensions, certificate, certificate verify, and `Finished`. The client then sends its `Finished` to complete the handshake. All handshake messages after `ServerHello` are encrypted, reducing metadata leakage.

### 5.2 Session Resumption and 0-RTT

To avoid repeated full handshakes, TLS supports session resumption. In TLS 1.2, this was accomplished via session IDs or session tickets, allowing an abbreviated handshake (1-RTT). TLS 1.3 replaces both mechanisms with Pre-Shared Keys (PSK). After a successful handshake, the server issues a PSK identity (often via a NewSessionTicket message). On reconnection, the client includes the PSK in its `ClientHello` and may send 0-RTT application data encrypted under an early data key derived from the PSK.

0-RTT introduces replay risks. Because the first flight of data is sent before the server has contributed fresh entropy, an attacker could replay the client's 0-RTT data. TLS 1.3 itself does not prevent replay; applications must ensure that 0-RTT requests are idempotent (e.g., safe HTTP methods) or implement application-layer anti-replay tokens.

### 5.3 Certificate Chains and Validation

During the handshake, the server presents an X.509 certificate chain. The leaf certificate contains the server's public key and subject names. Intermediate certificates link the leaf to a root Certificate Authority (CA) trusted by the client. The client must validate:

- Signature validity at each link in the chain
- Certificate expiry and activation dates
- Certificate revocation status (via CRL or OCSP)
- Domain name matching (Subject Alternative Names against the requested host)
- Basic Constraints and Key Usage extensions

### 5.4 Server Name Indication (SNI)

In a TLS handshake, the client indicates the target hostname via the Server Name Indication extension in `ClientHello`. This allows a single IP address to serve certificates for multiple domains (virtual hosting over HTTPS). Without SNI, the server must present a default certificate, making shared hosting over TLS impossible.

SNI is transmitted in cleartext in TLS 1.2 and 1.3, enabling network observers to determine the destination domain. Encrypted Client Hello (ECH, formerly ESNI) encrypts this field using a public key published in DNS, but deployment remains limited as of 2026.

### 5.5 ALPN: Application-Layer Protocol Negotiation

ALPN (RFC 7301) allows the client and server to negotiate the application protocol during the TLS handshake. The client sends a list of supported protocols (`h2`, `http/1.1`, `h3`); the server selects one and responds. This prevents protocol ambiguity and enables servers to reject unsupported protocols before application data is exchanged. HTTP/2 requires ALPN; HTTP/3 uses ALPN over QUIC with the identifier `h3`.

If ALPN negotiation fails—that is, the server does not support any protocol advertised by the client—the TLS handshake is aborted with a `no_application_protocol` alert. This strict failure mode prevents downgrade attacks where an attacker forces a connection to use an older, weaker protocol. However, it also means that misconfigured servers (e.g., a server supporting only `http/1.1` when the client advertises only `h2`) will fail to establish any connection rather than falling back gracefully. Operational teams must ensure that ALPN configurations are updated in tandem with protocol rollouts.

### 5.6 OCSP Stapling and Certificate Transparency

Online Certificate Status Protocol (OCSP) allows clients to query a CA's responder to check if a certificate has been revoked. OCSP stapling eliminates this client-side query by having the server periodically fetch a signed, timestamped OCSP response from the CA and "staple" it to the TLS handshake. This improves privacy (the CA does not learn which clients are visiting which sites) and performance (no extra round trip).

Certificate Transparency (CT) requires CAs to log all issued certificates in public, append-only logs. Certificates now include Signed Certificate Timestamps (SCTs) from multiple logs. Clients reject certificates lacking sufficient SCTs, making it impossible for a rogue CA to issue a certificate for a domain without public visibility.

### 5.7 Cipher Suites and Key Derivation

TLS 1.3 drastically reduced the set of supported cipher suites, eliminating legacy algorithms vulnerable to attacks (MD5, SHA-1, RSA key exchange, CBC mode). The remaining authenticated encryption with associated data (AEAD) suites are:

- TLS_AES_256_GCM_SHA384
- TLS_CHACHA20_POLY1305_SHA256
- TLS_AES_128_GCM_SHA256

Each suite specifies the symmetric cipher, the AEAD mode, and the hash function used for the Key Derivation Function (KDF). TLS 1.3 uses HKDF (RFC 5869) to derive traffic keys from the shared secret established during the handshake. The handshake transcript (all messages exchanged) is hashed and used as input to HKDF, ensuring that the derived keys are bound to the specific handshake context and preventing downgrade attacks.

In TLS 1.3, the server certificate is encrypted (under the handshake traffic keys), whereas in TLS 1.2 it is sent in plaintext. This encryption prevents passive observers from learning the server's identity from the certificate, improving privacy in contexts where SNI is also protected (via ECH).

### 5.8 Certificate Chain Validation Logic

When a client receives a certificate chain, it performs a depth-first validation from the leaf to a trusted root. Each certificate's signature is verified using the public key of the issuing certificate. The client must also verify that the certificate has not expired, that it has not been revoked (via CRL or OCSP), and that the Subject Alternative Name (SAN) list includes the hostname being accessed.

Name matching follows RFC 6125: if a DNS-ID SAN is present, it must match the hostname exactly or via wildcard (e.g., `*.example.com` matches `sub.example.com` but not `example.com` or `sub.sub.example.com`). IP addresses must appear in an iPAddress SAN, not a dNSName. If no SANs are present (legacy behavior), the Common Name (CN) field is checked, though this is deprecated by RFC 6125.

Certificate Transparency validation requires the client to verify that the certificate contains a sufficient number of valid SCTs from recognized logs. Chrome requires at least one embedded SCT from a Google-operated log and one from a non-Google log for certificates with a validity period exceeding 180 days. This policy ensures that no single log operator can unilaterally hide a misissued certificate.

```typescript
/**
 * §5.7 TypeScript Example: TLS Handshake State Machine
 *
 * Models the TLS 1.3 handshake as a finite state machine with transitions
 * driven by message types. Demonstrates PSK resumption paths.
 */

type TLSMessageType =
  | 'ClientHello' | 'ServerHello' | 'EncryptedExtensions'
  | 'Certificate' | 'CertificateVerify' | 'Finished'
  | 'NewSessionTicket' | 'EndOfEarlyData';

type TLSState =
  | 'START' | 'WAIT_SH' | 'WAIT_EE' | 'WAIT_CERT_CR'
  | 'WAIT_CV' | 'WAIT_FINISHED' | 'CONNECTED' | 'WAIT_EOED';

interface TLSContext {
  state: TLSState;
  pskOffered: boolean;
  earlyDataAccepted: boolean;
  sessionTicket?: Uint8Array;
  serverHelloReceived: boolean;
  handshakeMessages: Uint8Array[];
}

class TLS13HandshakeMachine {
  private ctx: TLSContext;

  constructor(offeringPSK = false) {
    this.ctx = {
      state: 'START',
      pskOffered: offeringPSK,
      earlyDataAccepted: false,
      serverHelloReceived: false,
      handshakeMessages: [],
    };
  }

  transition(msg: TLSMessageType, payload?: { earlyDataAccepted?: boolean }): TLSState {
    const { state } = this.ctx;
    switch (state) {
      case 'START':
        if (msg === 'ClientHello') {
          this.ctx.state = this.ctx.pskOffered ? 'WAIT_EOED' : 'WAIT_SH';
        }
        break;
      case 'WAIT_EOED':
        if (msg === 'EndOfEarlyData') {
          this.ctx.state = 'WAIT_SH';
        }
        break;
      case 'WAIT_SH':
        if (msg === 'ServerHello') {
          this.ctx.serverHelloReceived = true;
          this.ctx.earlyDataAccepted = payload?.earlyDataAccepted ?? false;
          this.ctx.state = 'WAIT_EE';
        }
        break;
      case 'WAIT_EE':
        if (msg === 'EncryptedExtensions') {
          this.ctx.state = 'WAIT_CERT_CR';
        }
        break;
      case 'WAIT_CERT_CR':
        if (msg === 'Certificate') {
          this.ctx.state = 'WAIT_CV';
        }
        break;
      case 'WAIT_CV':
        if (msg === 'CertificateVerify') {
          this.ctx.state = 'WAIT_FINISHED';
        }
        break;
      case 'WAIT_FINISHED':
        if (msg === 'Finished') {
          this.ctx.state = 'CONNECTED';
        }
        break;
      case 'CONNECTED':
        if (msg === 'NewSessionTicket') {
          this.ctx.sessionTicket = new Uint8Array([1, 2, 3, 4]); // placeholder
        }
        break;
    }
    return this.ctx.state;
  }

  canSendEarlyData(): boolean {
    return this.ctx.state === 'WAIT_EOED' && this.ctx.pskOffered;
  }

  isConnected(): boolean {
    return this.ctx.state === 'CONNECTED';
  }

  getContext(): Readonly<TLSContext> {
    return Object.freeze({ ...this.ctx });
  }
}
```

---

## 6. DNS Resolution Stack

### 6.1 A, AAAA, and CNAME Records

The resolution of a hostname to an IP address begins with DNS. An `A` record maps a hostname to an IPv4 address; an `AAAA` record maps to an IPv6 address. A `CNAME` (Canonical Name) record creates an alias, redirecting resolution to another domain. DNS resolution is hierarchical: the stub resolver queries a recursive resolver, which traverses the root, TLD, and authoritative name servers.

CNAME chains introduce latency because each CNAME requires an additional lookup. Furthermore, CNAMEs at the zone apex (the root of a domain, e.g., `example.com`) conflict with other required records like `NS` and `MX`, necessitating `ALIAS` or `ANAME` records offered by some DNS providers, or the newer SVCB/HTTPS records.

### 6.2 DNS over HTTPS (DoH) and DNS over TLS (DoT)

Traditional DNS queries are sent in cleartext over UDP (or TCP for large responses), allowing network intermediaries to observe and modify queries. DoH (RFC 8484) encapsulates DNS queries within HTTPS requests to a DoH resolver (e.g., `https://cloudflare-dns.com/dns-query`), providing encryption via TLS and blending DNS traffic with other HTTPS traffic. DoT (RFC 7858) establishes a dedicated TLS connection on port 853 for DNS queries.

DoH offers better resistance to censorship and traffic analysis because it is indistinguishable from normal HTTPS traffic. DoT is simpler to deploy in enterprise environments where dedicated ports and policies are preferred. Both introduce modest latency overhead from the TLS handshake, though connection reuse and 0-RTT mitigate this.

### 6.3 EDNS Client Subnet (ECS)

EDNS Client Subnet (RFC 7871) allows recursive resolvers to forward a prefix of the client's IP address to authoritative name servers. Content Delivery Networks (CDNs) use this information to return geo-proximate edge server addresses. Without ECS, the CDN sees only the resolver's IP address, which may be far from the actual client (e.g., a centralized corporate resolver). ECS improves latency but reduces privacy by exposing coarse location data.

### 6.4 Happy Eyeballs: IPv4/IPv6 Fallback

Happy Eyeballs (RFC 8305) is the algorithm used by browsers and operating systems to minimize connection latency when both IPv4 and IPv6 are available. The naive approach—always preferring IPv6—can fail if the IPv6 path is broken or slower. Happy Eyeballs works as follows:

1. Query DNS for both `A` and `AAAA` records asynchronously.
2. Begin connection attempts to the first received address family after a short delay (typically 50–300 ms).
3. If the first attempt has not succeeded by the time the second address family resolves, start a parallel connection attempt.
4. Use whichever connection completes first; cancel the other.

This race-condition approach ensures that IPv6-capable hosts still get IPv6 when it works, but fall back to IPv4 seamlessly when IPv6 is impaired. Modern implementations extend this to QUIC vs. TCP races for HTTP/3 discovery.

### 6.5 DNS Caching, TTL Behavior, and Negative Caching

DNS resolvers cache responses based on the Time-To-Live (TTL) value in each record. A short TTL (e.g., 60 seconds) allows rapid failover during infrastructure changes but increases resolver load and DNS lookup latency. A long TTL (e.g., 86400 seconds) improves performance but delays propagation of changes. Operators must balance these factors, often using short TTLs for disaster recovery and long TTLs for stable CDN endpoints.

Negative caching stores the absence of a record. If a query for `nonexistent.example.com` returns `NXDOMAIN`, the resolver caches this failure for the duration specified in the SOA record's minimum TTL. This prevents repeated queries for obviously invalid names from flooding authoritative servers. However, overly aggressive negative caching can delay the availability of newly created records if a query was made during the provisioning window.

### 6.6 DNSSEC: Authentication of DNS Data

DNSSEC (Domain Name System Security Extensions) provides origin authentication and integrity protection for DNS data using a chain of digital signatures. Each DNS zone signs its records with a private key; the corresponding public key is published as a DNSKEY record and signed by the parent zone. This creates a trust anchor from the root zone (whose public key is distributed with operating systems) down to the leaf domain.

DNSSEC adds four record types: RRSIG (signature), DNSKEY (public key), DS (Delegation Signer, published in the parent zone), and NSEC/NSEC3 (authenticated denial of existence, proving that a name does not exist). Validating resolvers verify signatures at each step of the delegation chain. If any signature is invalid or missing, the resolver returns `SERVFAIL`, indicating that the response cannot be trusted.

Despite its security benefits, DNSSEC deployment has been slow due to operational complexity: key rollover procedures, zone signing overhead, and the increased response sizes that can cause UDP fragmentation. DNS over HTTPS and DNS over TLS encrypt the channel between client and resolver but do not replace DNSSEC; they complement it by preventing on-path eavesdropping and modification of DNS messages.

```typescript
/**
 * §6.5 TypeScript Example: DNS Resolver with Happy Eyeballs
 *
 * Simulates the Happy Eyeballs algorithm for dual-stack connection racing.
 * Demonstrates priority queuing, race cancellation, and fallback logic.
 */

interface DNSRecord {
  type: 'A' | 'AAAA' | 'CNAME';
  value: string;
  ttl: number;
}

interface ResolvedEndpoint {
  address: string;
  family: 'ipv4' | 'ipv6';
  port: number;
}

class HappyEyeballsResolver {
  private ipv4DelayMs = 50;

  async resolve(hostname: string): Promise<ResolvedEndpoint[]> {
    // Simulated DNS lookup
    const records = await this.queryDNS(hostname);
    const endpoints: ResolvedEndpoint[] = [];

    for (const record of records) {
      if (record.type === 'A') {
        endpoints.push({ address: record.value, family: 'ipv4', port: 443 });
      } else if (record.type === 'AAAA') {
        endpoints.push({ address: record.value, family: 'ipv6', port: 443 });
      }
    }

    // RFC 8305: sort IPv6 before IPv4 within each family by destination scope
    return endpoints.sort((a, b) => {
      if (a.family === b.family) return 0;
      return a.family === 'ipv6' ? -1 : 1;
    });
  }

  private async queryDNS(hostname: string): Promise<DNSRecord[]> {
    // Stub: in reality, this would use the OS resolver or DoH/DoT
    if (hostname === 'dualstack.example.com') {
      return [
        { type: 'AAAA', value: '2606:2800:220:1:248:1893:25c8:1946', ttl: 300 },
        { type: 'A', value: '93.184.216.34', ttl: 300 },
      ];
    }
    return [{ type: 'A', value: '93.184.216.34', ttl: 300 }];
  }

  async connect(hostname: string): Promise<{ endpoint: ResolvedEndpoint; latencyMs: number }> {
    const endpoints = await this.resolve(hostname);
    if (endpoints.length === 0) throw new Error('No addresses found');

    const ipv6Endpoints = endpoints.filter(e => e.family === 'ipv6');
    const ipv4Endpoints = endpoints.filter(e => e.family === 'ipv4');

    return new Promise((resolve, reject) => {
      let resolved = false;
      const errors: Error[] = [];

      const attempt = async (endpoint: ResolvedEndpoint, startTime: number) => {
        try {
          const latency = await this.simulateConnection(endpoint);
          if (!resolved) {
            resolved = true;
            resolve({ endpoint, latencyMs: Date.now() - startTime });
          }
        } catch (err) {
          errors.push(err as Error);
          if (!resolved && errors.length === endpoints.length) {
            reject(new AggregateError(errors, 'All connection attempts failed'));
          }
        }
      };

      const now = Date.now();
      for (const ep of ipv6Endpoints) attempt(ep, now);

      if (ipv4Endpoints.length > 0) {
        setTimeout(() => {
          for (const ep of ipv4Endpoints) attempt(ep, now);
        }, this.ipv4DelayMs);
      }
    });
  }

  private simulateConnection(endpoint: ResolvedEndpoint): Promise<void> {
    // Simulated connection latency: IPv6 slightly faster in this model
    const baseLatency = endpoint.family === 'ipv6' ? 20 : 35;
    const jitter = Math.random() * 10;
    return new Promise((res, rej) => {
      setTimeout(() => {
        if (Math.random() > 0.95) rej(new Error('Connection timeout'));
        else res();
      }, baseLatency + jitter);
    });
  }
}
```

---

## 7. TCP Connection Establishment and Congestion Control

### 7.1 The Three-Way Handshake

TCP connections begin with the SYN/SYN-ACK/ACK three-way handshake. The client sends a SYN (synchronize) packet with an initial sequence number (ISN). The server responds with SYN-ACK, acknowledging the client's ISN and providing its own. The client completes the handshake with an ACK. Only then can application data flow.

This handshake adds one round trip of latency (1.5 RTT if counting the client's first data packet). For HTTPS, this is followed by the TLS handshake, resulting in 2–3 RTTs before the first HTTP byte is transmitted. This latency tax motivated TCP Fast Open and 0-RTT protocols.

### 7.2 Slow Start and Congestion Avoidance

TCP uses a congestion window (cwnd) to limit in-flight data. In slow start, cwnd begins small (typically 10 MSS since RFC 6928) and doubles every ACK round trip until a loss is detected or the slow start threshold (ssthresh) is reached. This exponential growth quickly probes available bandwidth.

Once ssthresh is reached, TCP enters congestion avoidance. In this phase, cwnd grows linearly (by roughly 1 MSS per RTT). When packet loss occurs (detected via triple duplicate ACKs or retransmission timeout), TCP reduces cwnd: multiplicative decrease on loss (halving for Reno, more aggressive for CUBIC), then resumes linear growth.

### 7.3 Nagle's Algorithm

Nagle's algorithm coalesces small outgoing segments to reduce per-packet overhead. If there is unacknowledged data in flight, the sender buffers small writes until an ACK arrives or a full MSS is accumulated. While beneficial for telnet and interactive protocols, Nagle's algorithm can increase latency for small request-response protocols like HTTP. Modern HTTP clients and servers typically disable Nagle's algorithm (`TCP_NODELAY`) to ensure headers and small payloads are sent immediately.

### 7.4 TCP Fast Open (TFO)

TCP Fast Open (RFC 7413) allows data to be sent in the initial SYN packet using a TFO cookie obtained from a prior connection. The server validates the cookie and may deliver the data to the application before the three-way handshake completes. TFO reduces connection setup to effectively 0-RTT for TCP. However, TFO requires OS-level support, is often blocked by middleboxes that drop unknown TCP options, and is incompatible with some NAT implementations. It has seen limited deployment compared to QUIC's integrated 0-RTT.

### 7.5 Selective Acknowledgment, ECN, and RTT Estimation

TCP Selective Acknowledgment (SACK, RFC 2018) allows receivers to inform senders about exactly which segments have been received, even when others are missing. Without SACK, TCP can only acknowledge the highest contiguous byte received (cumulative ACK). SACK significantly improves recovery from multiple lost segments in a single window, preventing unnecessary retransmissions and improving throughput on lossy paths.

Explicit Congestion Notification (ECN, RFC 3168) uses two bits in the IP header to signal congestion without dropping packets. When a router experiences queue buildup, it marks the ECN bits instead of discarding the packet. The receiver echoes this mark back to the sender via the TCP header, and the sender reduces its congestion window proactively. ECN requires support from both endpoints and intermediate routers; when universally deployed, it eliminates loss-based congestion control's reliance on packet drops as signals.

Accurate RTT estimation is fundamental to TCP performance. The RTO (Retransmission Timeout) is computed using a smoothed RTT (SRTT) and RTT variance (RTTVAR). Karn's algorithm excludes retransmitted segments from RTT sampling because the ACK could refer to either the original or the retransmission. Modern TCP implementations use timestamps (RFC 7323) to uniquely identify segments, allowing RTT measurement even during retransmission.

### 7.6 CUBIC, BBR, and Congestion Control Evolution

TCP CUBIC (the default in Linux since 2006) uses a cubic function to grow the congestion window after a loss event. Unlike TCP Reno, which uses linear growth in congestion avoidance, CUBIC allows rapid window expansion when far from the last known saturation point and slows growth as it approaches that point. This makes CUBIC highly scalable for high-bandwidth, high-RTT networks (long fat pipes) but more aggressive than Reno in shared environments.

BBR (Bottleneck Bandwidth and RTT), developed by Google, takes a fundamentally different approach. Instead of using packet loss as a congestion signal, BBR continuously estimates the bottleneck bandwidth and the minimum RTT. It paces packets at the estimated bandwidth rate and limits in-flight data to twice the bandwidth-delay product. BBR achieves higher throughput on lossy networks (where CUBIC would back off unnecessarily) and lower latency on shallow-buffered paths. However, BBRv1 was criticized for unfairness when competing with CUBIC flows; BBRv2 incorporates loss-based signals and ECN to improve coexistence.

QUIC implementations can experiment with congestion controllers in user space, deploying BBRv2 or custom algorithms without kernel modifications. This flexibility is a key advantage over TCP, where congestion control is ossified in the operating system. However, user-space implementation also introduces challenges: QUIC stacks must implement their own timers, packet pacing, and ACK generation, all of which require high-resolution clocks and efficient event loops. In JavaScript runtime environments (Node.js, Deno), these constraints limit how deeply the runtime can optimize QUIC without native bindings to C or Rust libraries.

---

## 8. Navigation Timing and Performance Metrics

### 8.1 The Navigation Timing Lifecycle

The Navigation Timing API (Level 2, W3C spec) exposes granular timestamps for each phase of page loading. For traditional multi-page applications, these timestamps cover the full lifecycle from navigation initiation to the `load` event. For single-page applications (SPAs) using JavaScript-driven routing, the standard Navigation Timing entries do not capture route transitions because no formal document navigation occurs. Instead, developers must use the PerformanceObserver API to measure custom navigation metrics (e.g., `routeTransitionStart` to `routeTransitionEnd`) and correlate them with Resource Timing entries for the new route's data fetches.

The critical phases are:

- **navigationStart**: The time immediately after the user initiates navigation (click, redirect, etc.).
- **redirectStart / redirectEnd**: Time spent in HTTP redirects.
- **fetchStart**: When the browser begins checking the cache or resolving DNS.
- **domainLookupStart / domainLookupEnd**: DNS resolution duration.
- **connectStart / connectEnd**: TCP connection establishment.
- **secureConnectionStart**: Start of TLS handshake (omitted for non-HTTPS).
- **requestStart**: When the HTTP request is sent.
- **responseStart**: Time to First Byte (TTFB)—when the first byte of the response arrives.
- **responseEnd**: When the last byte of the response is received.
- **domLoading**: When `document.readyState` becomes `loading`.
- **domInteractive**: When the main document parser finishes and DOM is ready for interaction.
- **domContentLoadedEventStart / End**: When `DOMContentLoaded` fires (blocking scripts have executed).
- **domComplete**: When `document.readyState` becomes `complete`.
- **loadEventStart / End**: When `window.onload` fires.

### 8.2 Time to First Byte (TTFB)

TTFB is a critical metric representing the total network latency before the server begins responding. It encompasses DNS lookup, TCP handshake, TLS negotiation, server processing time, and network RTT. A high TTFB often indicates server-side processing bottlenecks or suboptimal CDN edge placement.

For HTTP/2 and HTTP/3, TTFB must be interpreted carefully. Because multiplexing allows request and response headers to be interleaved with other streams, the measured TTFB for a specific request may be inflated by contention on the shared connection. Resource Timing API entries for individual requests help disambiguate this.

### 8.3 Content Download and Parse Metrics

After TTFB, the browser spends time downloading the response body (`responseEnd - responseStart`). For HTML documents, the parser begins incrementally processing received bytes. When the parser encounters external resources (scripts, stylesheets, images), it initiates subresource fetches. Blocking scripts halt parsing until they are downloaded and executed; async and defer scripts modify this behavior.

`DOMContentLoaded` signals that the initial HTML document has been loaded and parsed, and all deferred scripts have executed. `window.load` signals that all subresources (images, iframes, stylesheets) have loaded. Modern performance optimization focuses on minimizing Time to Interactive (TTI) and Largest Contentful Paint (LCP) rather than raw `load` event timing.

### 8.4 Core Web Vitals and Protocol Interaction

Google's Core Web Vitals (CWV) are three metrics that quantify user experience: Largest Contentful Paint (LCP) measures perceived load speed; First Input Delay (FID) measures interactivity; Cumulative Layout Shift (CLS) measures visual stability. The protocol stack directly influences LCP and FID.

LCP is constrained by the protocol's ability to deliver the largest visible element (typically a hero image or video poster) quickly. HTTP/2 and HTTP/3 improve LCP by allowing the browser to request critical CSS and the LCP image concurrently without head-of-line blocking. HTTP/3's 0-RTT can further reduce LCP for repeat visitors by eliminating handshake latency.

FID depends on the main thread being free to process user input. Long tasks caused by large script downloads and execution block input handling. HTTP/2 and HTTP/3 server push (now deprecated) were originally thought to help by pushing critical scripts early, but the modern alternative—resource hints (`preload`, `prefetch`, `modulepreload`)—achieves similar benefits without the cache coherency problems of push.

### 8.5 Resource Timing API and Protocol Attribution

While Navigation Timing measures the top-level document load, the Resource Timing API (W3C spec) exposes timing data for every subresource: images, scripts, stylesheets, XHR/fetch requests, and even WebSocket handshakes. Each entry provides the same granular phases (redirect, DNS, TCP, TLS, TTFB, download) scoped to the individual resource.

Resource Timing is invaluable for protocol analysis. By comparing `nextHopProtocol` entries across resources, developers can verify that HTTP/3 is being used for critical assets and diagnose fallback to HTTP/2 or HTTP/1.1. The `deliveryType` field (e.g., `cache`, `navigational-prefetch`, `none`) reveals whether a resource was served from the browser cache, a service worker, or the network.

Cross-Origin Resource Timing requires the `Timing-Allow-Origin` response header. Without it, the browser zeroes out phase timestamps to prevent cross-origin timing attacks (e.g., inferring cache state via load time differences). CDNs and third-party providers must explicitly opt into cross-origin timing exposure.

```typescript
/**
 * §8.4 TypeScript Example: Navigation Timing Analyzer
 *
 * Parses PerformanceNavigationTiming entries to compute derived metrics
 * like TTFB, download time, and connection setup latency.
 */

interface NavigationMetrics {
  dnsLookupMs: number;
  tcpHandshakeMs: number;
  tlsHandshakeMs: number;
  ttfbMs: number;
  downloadMs: number;
  domParseMs: number;
  totalNavigationMs: number;
  redirectCount: number;
}

class NavigationTimingAnalyzer {
  analyze(entry: PerformanceNavigationTiming): NavigationMetrics {
    const dnsLookupMs = entry.domainLookupEnd - entry.domainLookupStart;
    const tcpHandshakeMs = entry.connectEnd - entry.connectStart;
    const tlsHandshakeMs = entry.secureConnectionStart > 0
      ? entry.connectEnd - entry.secureConnectionStart
      : 0;
    const ttfbMs = entry.responseStart - entry.requestStart;
    const downloadMs = entry.responseEnd - entry.responseStart;
    const domParseMs = entry.domComplete - entry.responseEnd;
    const totalNavigationMs = entry.loadEventEnd - entry.startTime;

    return {
      dnsLookupMs,
      tcpHandshakeMs,
      tlsHandshakeMs,
      ttfbMs,
      downloadMs,
      domParseMs,
      totalNavigationMs,
      redirectCount: entry.redirectCount,
    };
  }

  generateReport(metrics: NavigationMetrics): string {
    const lines = [
      '=== Navigation Timing Report ===',
      `Redirects:        ${metrics.redirectCount}`,
      `DNS Lookup:       ${metrics.dnsLookupMs.toFixed(2)} ms`,
      `TCP Handshake:    ${metrics.tcpHandshakeMs.toFixed(2)} ms`,
      `TLS Handshake:    ${metrics.tlsHandshakeMs.toFixed(2)} ms`,
      `TTFB:             ${metrics.ttfbMs.toFixed(2)} ms`,
      `Download:         ${metrics.downloadMs.toFixed(2)} ms`,
      `DOM Parse:        ${metrics.domParseMs.toFixed(2)} ms`,
      `Total Navigation: ${metrics.totalNavigationMs.toFixed(2)} ms`,
      '================================',
    ];
    return lines.join('\n');
  }

  identifyBottleneck(metrics: NavigationMetrics): string {
    if (metrics.redirectCount > 2) return 'Excessive redirects detected';
    if (metrics.dnsLookupMs > 200) return 'DNS resolution bottleneck';
    if (metrics.tlsHandshakeMs > 300) return 'TLS handshake inefficiency (consider session resumption)';
    if (metrics.ttfbMs > 600) return 'High TTFB: investigate server-side latency or CDN placement';
    if (metrics.downloadMs > 2000) return 'Slow content download: optimize payload size or enable compression';
    if (metrics.domParseMs > 1000) return 'Heavy DOM: reduce HTML complexity or defer non-critical scripts';
    return 'No dominant bottleneck identified';
  }
}

// Example usage:
// const analyzer = new NavigationTimingAnalyzer();
// const [entry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
// const metrics = analyzer.analyze(entry);
// console.log(analyzer.generateReport(metrics));
```

---

## 9. Redirect Chains, HSTS, and Cookie Semantics

### 9.1 Redirect Semantics: 301, 302, 307, and 308

HTTP redirects transfer a client from one URI to another via `Location` headers and specific status codes:

- **301 Moved Permanently**: The resource has a new permanent URI. Historically, browsers changed POST requests to GET on 301 redirects (a violation of the spec that became de facto standard). This ambiguity was resolved by 307/308.
- **302 Found**: Temporary redirect. Like 301, historical browser behavior converted POST to GET. This is now considered a specification error, but remains widely used.
- **307 Temporary Redirect**: Explicitly preserves the request method and body. If the original request was POST, the redirected request must also be POST.
- **308 Permanent Redirect**: The permanent counterpart to 307, preserving method and body. It is the correct replacement for 301 when method preservation is required.

Redirect chains multiply latency. Each hop incurs DNS, TCP, TLS, and TTFB overhead. Search engines penalize excessive redirects, and browsers cap redirect loops (typically at 20 hops). HSTS can convert internal HTTP→HTTPS redirects into local upgrades, eliminating a network round trip.

### 9.2 HSTS: HTTP Strict Transport Security

HSTS (`Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`) instructs browsers to always use HTTPS for a domain and its subdomains. Once a browser has received this header, any attempt to access the site via HTTP is internally rewritten to HTTPS before the network request is made.

The `preload` flag indicates the domain owner's consent to be included in browser preload lists (distributed with Chrome, Firefox, Safari, Edge). Preloaded domains are immune to SSL stripping attacks on first visit because the browser already knows to use HTTPS.

HSTS has limitations: the initial HTTP request (before the header is cached) is still vulnerable. The `max-age` must be renewed periodically. And if a site's HTTPS configuration breaks, HSTS prevents fallback to HTTP, potentially causing complete accessibility loss until the certificate is fixed or `max-age` expires.

### 9.6 The Cookie Jar Model and Scoping Rules

Browsers maintain a cookie jar—a database of cookies scoped by origin, path, and attributes. The same-origin policy for cookies is more permissive than for DOM access: a cookie set with `Domain=.example.com` is sent to `sub.example.com`, `deep.sub.example.com`, and `example.com` itself. This "domain tail match" behavior enables single sign-on across subdomains but also expands the attack surface for cookie theft via XSS on any subdomain.

Path scoping provides weaker isolation. A cookie with `Path=/app` is sent to `/app` and `/app/anything`, but not to `/other`. However, path scoping is advisory: a malicious script on `/other` cannot read the cookie (because the browser won't send it), but the cookie is still stored in the jar and could be exfiltrated via other means. Moreover, many servers ignore path scoping when setting cookies, defaulting to `/`.

The cookie jar is partitioned by browser profile and private browsing mode. In Incognito/Private mode, cookies are stored in a transient jar destroyed when the session ends. First-Party Sets and Storage Access API proposals attempt to relax SameSite restrictions for related domains (e.g., `brand.com` and `brand-support.com`) while maintaining anti-tracking boundaries, reflecting the ongoing tension between utility and privacy in web state management.

### 9.3 HTTP Cookies in Depth

Cookies are the web's primitive state mechanism, governed by RFC 6265bis. The server sets cookies via the `Set-Cookie` response header; the client stores them in a cookie jar and returns them via the `Cookie` header on subsequent requests to matching domains and paths.

A `Set-Cookie` header contains:

- **Name=Value**: The cookie data.
- **Domain**: Scope broadening (defaults to the host; can be set to a parent domain).
- **Path**: URL path prefix required for inclusion.
- **Max-Age / Expires**: Lifetime limit.
- **Secure**: Transmitted only over HTTPS.
- **HttpOnly**: Inaccessible to JavaScript (`document.cookie`).
- **SameSite**: Cross-site request behavior.
- **Partitioned**: Isolates the cookie by top-level site (CHIPS).

### 9.4 SameSite Attribute Evolution

The `SameSite` attribute was introduced to mitigate Cross-Site Request Forgery (CSRF):

- **SameSite=None**: Cookie sent with all requests, including cross-site. Requires `Secure` attribute.
- **SameSite=Lax** (modern default): Cookie sent on top-level navigations (GET requests resulting from following a link) and same-site requests. Not sent on cross-site POST requests or embedded requests (images, iframes).
- **SameSite=Strict**: Cookie never sent on cross-site requests, even for top-level navigations. Provides maximum CSRF protection but breaks deep-linking flows where the user arrives from an external site.

Modern browsers treat cookies without an explicit `SameSite` attribute as `Lax` by default. This change broke legacy applications that relied on implicit cross-site cookie transmission.

### 9.5 Partitioned Cookies (CHIPS)

Partitioned cookies (Cookies Having Independent Partitioned State, CHIPS) restrict a cookie to the combination of the origin that set it and the top-level site. A cookie set by `tracker.example.com` embedded on `site-a.com` cannot be read when `tracker.example.com` is embedded on `site-b.com`. This prevents cross-site tracking while allowing legitimate third-party use cases (embedded maps, payment widgets) to maintain session state within a single top-level context.

```typescript
/**
 * §9.6 TypeScript Example: Cookie Parser with SameSite Validation
 *
 * Parses Set-Cookie headers and validates SameSite/Secure/Partitioned
 * constraints per modern browser policies (RFC 6265bis).
 */

interface ParsedCookie {
  name: string;
  value: string;
  domain?: string;
  path: string;
  expires?: Date;
  maxAge?: number;
  secure: boolean;
  httpOnly: boolean;
  sameSite: 'None' | 'Lax' | 'Strict';
  partitioned: boolean;
}

class CookieParser {
  parse(setCookieHeader: string): ParsedCookie {
    const parts = setCookieHeader.split(';').map(p => p.trim());
    const [nameValue, ...attrs] = parts;
    const [name, value] = nameValue.split('=');

    const cookie: ParsedCookie = {
      name: name.trim(),
      value: value !== undefined ? decodeURIComponent(value.trim()) : '',
      path: '/',
      secure: false,
      httpOnly: false,
      sameSite: 'Lax',
      partitioned: false,
    };

    for (const attr of attrs) {
      const [key, val] = attr.split('=').map(s => s.trim());
      const lowerKey = key.toLowerCase();
      if (lowerKey === 'domain') cookie.domain = val;
      else if (lowerKey === 'path') cookie.path = val;
      else if (lowerKey === 'expires') cookie.expires = new Date(val);
      else if (lowerKey === 'max-age') cookie.maxAge = parseInt(val, 10);
      else if (lowerKey === 'secure') cookie.secure = true;
      else if (lowerKey === 'httponly') cookie.httpOnly = true;
      else if (lowerKey === 'samesite') {
        const sv = (val || '').toLowerCase();
        if (sv === 'none') cookie.sameSite = 'None';
        else if (sv === 'strict') cookie.sameSite = 'Strict';
        else cookie.sameSite = 'Lax';
      } else if (lowerKey === 'partitioned') cookie.partitioned = true;
    }

    return cookie;
  }

  validate(cookie: ParsedCookie): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (cookie.sameSite === 'None' && !cookie.secure) {
      errors.push('SameSite=None requires the Secure attribute');
    }

    if (cookie.partitioned && !cookie.secure) {
      errors.push('Partitioned cookies require the Secure attribute');
    }

    if (cookie.name.startsWith('__Host-')) {
      if (cookie.path !== '/') errors.push('__Host- cookies must have Path=/');
      if (!cookie.secure) errors.push('__Host- cookies must be Secure');
      if (cookie.domain) errors.push('__Host- cookies must not have a Domain attribute');
    }

    if (cookie.name.startsWith('__Secure-') && !cookie.secure) {
      errors.push('__Secure- cookies must be Secure');
    }

    return { valid: errors.length === 0, errors };
  }

  shouldSend(
    cookie: ParsedCookie,
    requestUrl: URL,
    isTopLevelNavigation: boolean,
    requestMethod: string
  ): boolean {
    // Domain matching
    if (cookie.domain) {
      if (!requestUrl.hostname.endsWith(cookie.domain)) return false;
    } else {
      if (requestUrl.hostname !== cookie.domain) return false; // exact match
    }

    // Path matching
    if (!requestUrl.pathname.startsWith(cookie.path)) return false;

    // Secure
    if (cookie.secure && requestUrl.protocol !== 'https:') return false;

    // SameSite enforcement
    if (cookie.sameSite === 'Strict') {
      // In reality, compare request origin to cookie origin; simplified here
      if (!isTopLevelNavigation) return false;
    } else if (cookie.sameSite === 'Lax') {
      if (!isTopLevelNavigation && requestMethod.toLowerCase() !== 'get') return false;
    }

    return true;
  }
}
```

---

## 10. Resource Prioritization Strategies

### 10.1 Browser Heuristics for Resource Types

Browsers employ sophisticated heuristics to prioritize subresource fetches based on resource type, document position, and user interaction signals:

- **HTML/CSS**: Highest priority; blocking render.
- **Synchronous JavaScript in `<head>`**: High priority; blocks parsing.
- **Images above the fold**: Medium-high priority; contributes to LCP.
- **Async/deferred scripts**: Low priority; does not block parsing.
- **Below-the-fold images**: Lowest priority; fetched during idle time.
- **Prefetch/prerender hints**: Background priority; speculative.

These heuristics are not standardized across engines. Chromium uses a numeric priority system (0–highest to 5–lowest) mapped to HTTP/2 weight and dependency trees. WebKit and Gecko use similar internal schemes.

### 10.2 HTTP/2 Stream Dependencies

HTTP/2's original priority mechanism allowed clients to construct a dependency tree where streams could be exclusive or non-exclusive dependents of parent streams. A parent stream's allocated bandwidth is divided among children proportionally to their weights. Exclusive dependencies allow high-priority resources to monopolize a parent's share.

In practice, dependency trees proved difficult for both clients and servers to implement correctly. Many CDNs ignored priority signals entirely, leading to content delivery that did not respect browser intent. This led to the deprecation of the priority tree in favor of the simpler `Priority` header and `urgency`/`incremental` signals defined in RFC 9218 (Extensible Priority Scheme for HTTP).

### 10.3 Priority Hints (`importance` Attribute)

The `importance` attribute (`high`, `low`, `auto`) on `<img>`, `<link>`, `<script>`, and `<iframe>` elements allows developers to override browser heuristics. For example, a hero image may be marked `importance="high"` while off-screen thumbnails are `importance="low"`. This signal is conveyed to the server via the `Priority` request header in HTTP/2 and HTTP/3, or via stream urgency in QUIC.

Priority Hints interact with `fetchpriority` in the Fetch API, allowing JavaScript-initiated requests to express urgency. This is particularly valuable for single-page applications where route transitions require critical data fetches.

### 10.4 Interaction with Preload, Prefetch, and Speculative Loading

Resource hints complement stream priority by changing *when* a resource is fetched, not just how urgently. `<link rel="preload">` initiates a high-priority fetch early in the document lifecycle, before the parser discovers the resource. `<link rel="prefetch">` initiates a low-priority fetch for a subsequent navigation. `<link rel="preconnect">` resolves DNS and establishes TCP/TLS early, amortizing connection setup across multiple resources.

Speculative APIs like Speculation Rules (for prerendering) and the deprecated `<link rel="prerender">` extend this paradigm to entire documents. These mechanisms operate orthogonally to the protocol version but are most effective over HTTP/2 and HTTP/3 because the pre-established connection can carry the speculative requests without additional handshakes.

### 10.5 Chromium's Priority Implementation Internals

Chromium implements resource priority using a numeric urgency level (0–highest to 5–lowest) combined with an `incremental` boolean. Priority 0 is reserved for blocking render resources (main HTML, synchronous CSS). Priority 1 covers visible images and blocking scripts. Priority 5 is used for prefetch and speculative loads.

These internal priorities are mapped to HTTP/2 weights and dependencies in the legacy priority scheme, or to RFC 9218 `u=` (urgency) and `i=` (incremental) parameters in modern HTTP/2 and HTTP/3. The mapping is lossy because HTTP/2 weights are continuous (1–256) while Chromium's levels are discrete. Nevertheless, the relative ordering is preserved: a priority-1 resource will receive bandwidth before a priority-3 resource on a constrained link.

Chromium also implements intra-priority FIFO ordering. Within the same urgency level, resources are scheduled in the order they were requested. This prevents starvation of later-discovered resources but can delay important late-discovered resources (e.g., a hero image injected by JavaScript). The `fetchpriority` API allows developers to override both urgency and intra-level ordering for specific resources.

---

## 11. Categorical Semantics: HTTP as State Transition System

### 11.1 Formalizing HTTP Requests and Responses

We can model HTTP as a category **Http** where:

- **Objects** are server states (resource representations, session states, server configurations).
- **Morphisms** are request methods (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`) tagged with headers and bodies.
- **Composition** is the sequential application of requests, subject to idempotency and safety constraints.

In this framework, a `GET` request is a morphism from state S to state S (it is safe: the server state is unchanged). A `POST` request is a morphism from S to S′, creating a new resource or side effect. The HTTP status code returned is the codomain's witness: `200 OK` confirms the morphism's applicability, `404 Not Found` indicates the domain (URI) does not map to an object in the current category, and `409 Conflict` signals that composition would violate state invariants.

### 11.2 Idempotency as a Categorical Property

An idempotent morphism f satisfies f ∘ f = f. In HTTP, `PUT` and `DELETE` are idempotent: applying `DELETE /resource` twice has the same effect as applying it once (the resource remains deleted). `POST` is generally not idempotent unless the server implements unique constraint keys or deduplication tokens.

This formalism helps API designers reason about retry semantics. If a network interruption occurs after a `PUT` request is sent but before the response is received, the client may safely retry because `PUT` is idempotent. Retrying a `POST` request risks duplicate side effects unless the request carries an `Idempotency-Key` header, effectively making the morphism idempotent via an external token.

### 11.3 Cacheability and Commutativity

Safe methods (`GET`, `HEAD`, `OPTIONS`) commute with cache middleware. A cached response to `GET /x` can serve as the result of a subsequent `GET /x` without re-executing the server morphism. In category-theoretic terms, the cache introduces a natural transformation between the identity functor (direct server execution) and the cached functor (store-and-return), valid only for safe, cacheable morphisms.

Conditional requests (`If-Match`, `If-None-Match`) are pullback diagrams: the client provides a precondition (an object in a subcategory of valid states), and the server either applies the morphism (if the precondition holds) or aborts with `412 Precondition Failed`.

### 11.4 Process Calculus and Concurrent Request Interleaving

Beyond category theory, we can model HTTP/2 and HTTP/3 using process calculi such as the Calculus of Communicating Systems (CCS) or the π-calculus. Each stream is a concurrent process; the connection is the parallel composition of stream processes. HTTP/2's HEADERS frame is a channel establishment action; DATA frames are value transmissions; RST_STREAM is process termination.

In this model, HTTP/1.1 is sequential composition: `Request1 . Response1 . Request2 . Response2`. HTTP/2 is parallel composition with shared resources: `(Stream1 | Stream2 | Stream3) \ Connection`, where the restriction operator `\` enforces that all streams share the underlying TCP channel, giving rise to the possibility of deadlock when the shared channel is blocked by loss. HTTP/3 relaxes this restriction: each stream has its own virtual channel, making the composition `(Stream1 | Stream2 | Stream3)` without restriction, eliminating deadlock from transport-level blocking.

### 11.5 Monadic Interpretation of Request Composition

We can further refine the categorical model by interpreting HTTP request sequencing through monads. Consider the `Promise` or `Task` monad used in JavaScript asynchronous programming: a request is a monadic value `M<Response>` that encapsulates latency, failure, and side effects. The `bind` (or `then`) operation sequences requests, and the `return` (or `resolve`) operation lifts a pure value into the monadic context.

In this framework, `fetch('/api/user').then(u => fetch('/api/orders/' + u.id))` is a Kleisli composition of morphisms in the HTTP category. The monad laws (left identity, right identity, associativity) correspond to intuitive properties of request chaining: a resolved value behaves like a synchronous result, and nested chains can be flattened without changing semantics. Error handling (`catch`) introduces the `Either` monad, where the left branch represents HTTP error status codes (4xx, 5xx) and network failures, and the right branch represents successful responses.

This monadic view is not merely academic: it directly informs the design of modern HTTP client libraries (RxJS, Effect-TS, fp-ts) that treat network effects as first-class values composable within a type-safe framework.

---

## 12. Symmetric Difference Analysis: HTTP/1 vs HTTP/2 vs HTTP/3

### 12.1 Dimension Matrix

| Dimension | HTTP/1.1 | HTTP/2 | HTTP/3 |
|-----------|----------|--------|--------|
| **Transport** | TCP | TCP | UDP (QUIC) |
| **Framing** | Textual (CRLF-delimited) | Binary (length-prefixed frames) | Binary (QUIC frames + HTTP/3 frames) |
| **Multiplexing** | None (pipelining failed) | Application-layer streams | Native QUIC streams |
| **HOL Blocking** | Application-layer | TCP-layer | None (per-stream delivery) |
| **Header Compression** | None (gzip for body only) | HPACK | QPACK (HPACK adapted for out-of-order delivery) |
| **Connection Reuse** | Keep-Alive (per-domain) | Single connection | Single connection with migration |
| **Encryption** | Optional (HTTPS over TLS) | Required (TLS 1.2+) | Integrated (TLS 1.3) |
| **Server Push** | N/A | Deprecated | Absent |
| **Stream Priority** | N/A | Dependency trees (deprecated) | Urgency/incremental (RFC 9218) |
| **Handshake RTTs** | 2-3 (TCP + TLS) | 2-3 (TCP + TLS) | 0-1 (QUIC + TLS 1.3) |
| **NAT/Firewall Traversal** | Excellent | Excellent | Moderate (UDP throttling) |

### 12.2 Symmetric Difference Interpretation

The symmetric difference between HTTP/1.1 and HTTP/2 is the set {binary framing, multiplexing, HPACK, stream priorities, flow control}. These features address HTTP/1.1's connection parallelism overhead but preserve TCP as the transport, inheriting its HOL blocking and connection mobility constraints.

The symmetric difference between HTTP/2 and HTTP/3 is {QUIC transport, UDP, connection migration, integrated encryption, 0-RTT default, QPACK, independent streams}. HTTP/3 removes TCP entirely, trading kernel-b congestion control for user-space flexibility, but introduces new operational challenges: UDP rate limiting by middleboxes, firewall configuration complexity, and larger packet headers due to QUIC's connection ID and encryption.

### 12.3 Protocol Equivalence Classes

From the client's perspective, HTTP/1.1 and HTTP/2 are equivalent for idempotent, safe requests when latency and bandwidth are unconstrained. The equivalence breaks under packet loss, where HTTP/2's multiplexing degrades due to TCP HOL blocking. HTTP/3 is equivalent to HTTP/2 only in the limit of zero packet loss and ideal congestion control; under realistic lossy conditions, HTTP/3's stream independence provides strictly superior latency bounds for concurrent requests.

```typescript
/**
 * §12.4 TypeScript Example: Protocol Feature Matrix Generator
 *
 * Generates a symmetric difference report between HTTP versions
 * as a structured object suitable for documentation or CI gates.
 */

interface ProtocolProfile {
  version: string;
  transport: string;
  framing: string;
  multiplexing: boolean;
  holBlocking: 'application' | 'transport' | 'none';
  headerCompression: string | null;
  encryption: string;
  defaultHandshakeRTTs: number;
  supportsServerPush: boolean;
  connectionMigration: boolean;
}

class ProtocolComparator {
  private static readonly HTTP1_1: ProtocolProfile = {
    version: 'HTTP/1.1',
    transport: 'TCP',
    framing: 'textual',
    multiplexing: false,
    holBlocking: 'application',
    headerCompression: null,
    encryption: 'optional (TLS 1.0-1.3)',
    defaultHandshakeRTTs: 3,
    supportsServerPush: false,
    connectionMigration: false,
  };

  private static readonly HTTP2: ProtocolProfile = {
    version: 'HTTP/2',
    transport: 'TCP',
    framing: 'binary',
    multiplexing: true,
    holBlocking: 'transport',
    headerCompression: 'HPACK',
    encryption: 'required (TLS 1.2+)',
    defaultHandshakeRTTs: 3,
    supportsServerPush: false, // deprecated
    connectionMigration: false,
  };

  private static readonly HTTP3: ProtocolProfile = {
    version: 'HTTP/3',
    transport: 'UDP (QUIC)',
    framing: 'binary',
    multiplexing: true,
    holBlocking: 'none',
    headerCompression: 'QPACK',
    encryption: 'integrated (TLS 1.3)',
    defaultHandshakeRTTs: 1,
    supportsServerPush: false,
    connectionMigration: true,
  };

  static compare(): Record<string, { h1: unknown; h2: unknown; h3: unknown; diff: string }> {
    const h1 = ProtocolComparator.HTTP1_1;
    const h2 = ProtocolComparator.HTTP2;
    const h3 = ProtocolComparator.HTTP3;

    const keys = Object.keys(h1).filter(k => k !== 'version') as Array<keyof ProtocolProfile>;
    const result: Record<string, { h1: unknown; h2: unknown; h3: unknown; diff: string }> = {};

    for (const key of keys) {
      const v1 = h1[key];
      const v2 = h2[key];
      const v3 = h3[key];
      let diff = 'none';
      if (v1 !== v2 || v2 !== v3 || v1 !== v3) {
        diff = v1 === v2 ? 'http3-divergent'
          : v2 === v3 ? 'http1-divergent'
          : v1 === v3 ? 'http2-divergent'
          : 'all-divergent';
      }
      result[key] = { h1: v1, h2: v2, h3: v3, diff };
    }

    return result;
  }

  static generateMarkdown(): string {
    const comparison = ProtocolComparator.compare();
    const rows = Object.entries(comparison).map(([dim, vals]) => {
      const values = [vals.h1, vals.h2, vals.h3].map(v => String(v)).join(' | ');
      return `| ${dim} | ${values} | ${vals.diff} |`;
    });
    return ['| Dimension | HTTP/1.1 | HTTP/2 | HTTP/3 | Symmetric Diff |', '|---|---|---|---|---|', ...rows].join('\n');
  }
}
```

---

## 13. Engineering Decision Matrix

### 13.1 When to Use Which Protocol

| Scenario | Recommended Protocol | Rationale |
|----------|---------------------|-----------|
| Legacy enterprise proxy environment | HTTP/1.1 | Maximum compatibility; many corporate proxies do not support HTTP/2 or block UDP. |
| General web traffic (2026 baseline) | HTTP/2 | Universal browser support; efficient multiplexing; no UDP firewall issues. |
| Mobile apps on lossy networks | HTTP/3 | Connection migration and stream independence minimize HOL blocking on cellular handoffs. |
| Real-time streaming (video, WebTransport) | HTTP/3 / QUIC | Native datagram support (RFC 9221) and unreliable streams via WebTransport. |
| Low-latency API clients | HTTP/2 or HTTP/3 | Multiplexing prevents request queueing; HTTP/3 reduces handshake latency. |
| IoT / constrained devices | HTTP/1.1 or HTTP/2 | Smaller code footprint; HTTP/3's QUIC stack may exceed device memory budgets. |
| High-frequency trading / fin-tech APIs | HTTP/2 or raw TCP | Microsecond sensitivity precludes QUIC/TLS overhead; dedicated circuits preferred. |
| Video streaming (DASH/HLS) | HTTP/2 or HTTP/3 | Segment downloading benefits from multiplexing; HTTP/3 improves mobile handoffs. |
| Government / regulated networks | HTTP/1.1 or HTTP/2 | Deep packet inspection and audit requirements may prohibit UDP/encrypted QUIC. |

### 13.2 Operational Trade-offs

**HTTP/2 Deployment**: Requires TLS 1.2+ and ALPN. Servers must implement HPACK and stream state machines. Load balancers must be L7-aware to route streams correctly; TCP-layer load balancing is insufficient because a single TCP connection carries multiple logical requests.

**HTTP/3 Deployment**: Requires UDP/443 to be open and not rate-limited. QUIC's user-space implementation increases CPU usage compared to kernel TCP (though this gap is narrowing with hardware offload and optimized implementations like Quinn, MsQuic, and Cloudflare's quiche). Connection IDs must be handled in load balancers to support migration and anycast routing.

**TLS Configuration**: TLS 1.3 should be preferred for reduced handshake latency. Session tickets must be rotated securely to prevent decryption of past traffic if keys are compromised (forward secrecy). OCSP stapling should be enabled to improve handshake performance and privacy.

### 13.3 Performance Budgeting

A realistic performance budget for a mobile page load on a 4G connection might allocate:

- DNS resolution: 50–150 ms
- TCP handshake + TLS 1.3: 200–400 ms (1-RTT with session resumption)
- TTFB: 100–300 ms
- Content download: variable (budget 1–2 MB critical path)
- DOM processing: 100–300 ms

HTTP/3 can reduce the handshake allocation to near-zero for returning visitors (0-RTT) and improve TTFB under loss by eliminating transport HOL blocking. However, the DNS and server processing components remain invariant across protocols.

### 13.4 Load Balancer and CDN Considerations

HTTP/2 and HTTP/3 fundamentally change load balancing architecture. In HTTP/1.1, a load balancer can distribute each request independently because each request starts a new TCP connection. In HTTP/2, multiple requests share a single TCP connection, so the load balancer must route at the L7 (application) layer to maintain stream affinity. If an HTTP/2 connection is moved to a different back-end server mid-session, all active streams are disrupted.

HTTP/3 introduces additional complexity via connection migration. Because a client may change IP addresses while maintaining the same Connection ID, layer-4 load balancers that route based on the 4-tuple will send migrated packets to the wrong server. HTTP/3-aware load balancers must inspect the Connection ID and route based on it, not the IP address. CDNs like Cloudflare and Fastly have implemented this using anycast routing tables keyed by Connection ID prefixes.

TLS session resumption and 0-RTT also affect load balancing. A 0-RTT request arrives encrypted with a key derived from a previous session ticket. If the back-end server that issued the ticket is different from the one receiving the 0-RTT data, the new server must either have access to the ticket encryption key (requiring shared key storage) or reject the 0-RTT data, falling back to a full handshake. Distributed key management for session tickets is a non-trivial operational requirement at scale.

### 13.5 Monitoring, Observability, and Protocol Telemetry

Production HTTP stacks require comprehensive observability. At the transport layer, operators monitor TCP retransmission rates, QUIC loss recovery events, and congestion window trajectories. At the application layer, they track HTTP status code distributions, request rates by method, and cache hit ratios.

Modern observability platforms ingest both client-side (Real User Monitoring, RUM) and server-side (synthetic probes, server logs) data. RUM data from the Navigation Timing and Resource Timing APIs reveal how protocol choices affect actual users across diverse networks. Server logs augmented with protocol version identifiers (`%{ALPN_PROTOCOL}e` in Apache, `$ssl_protocol` in Nginx) allow operators to correlate HTTP version with error rates and latency percentiles.

QUIC-specific telemetry includes handshake success rates, 0-RTT acceptance ratios, and connection migration events. A low 0-RTT acceptance rate may indicate clock skew between client and server (session tickets contain timestamps), while frequent connection migrations suggest mobile user bases switching between network interfaces. These metrics guide capacity planning and protocol rollout decisions.

---

## 14. Counter-examples and Limitations

### 14.1 When HTTP/3 Is Not Faster

Despite its theoretical advantages, HTTP/3 does not universally improve performance:

- **Low-latency, low-loss networks**: On a datacenter LAN or well-provisioned fiber connection with <1% packet loss, TCP CUBIC and HTTP/2 already saturate the link. HTTP/3's per-packet encryption overhead and larger headers (due to connection IDs) may slightly reduce throughput.
- **UDP-throttled networks**: Some enterprise firewalls and mobile carriers rate-limit or block UDP traffic. Fallback to HTTP/2 introduces an additional negotiation penalty.
- **Single-request workloads**: For a client making only one request (e.g., a health check probe), multiplexing benefits are zero, and QUIC's connection establishment complexity adds overhead.

### 14.2 TLS Overhead and Certificate Costs

TLS adds computational overhead (handshake cryptography, symmetric encryption per record) and latency. On high-throughput servers, TLS record processing can consume 5–10% of CPU cycles. Certificate management introduces operational burden: renewal automation, revocation monitoring, and CT log checking.

### 14.3 The Limits of Compression

HPACK and QPACK reduce header bandwidth but increase memory pressure. A server handling millions of connections must bound dynamic table sizes carefully. Furthermore, compression is ineffective for highly variable or unique headers (e.g., `x-request-id`, `authorization` bearer tokens). These headers are transmitted as string literals, consuming full size.

### 14.4 Navigation Timing Ambiguity

The Navigation Timing API measures wall-clock time, not protocol-specific latency. A high `connectEnd - connectStart` value might indicate TCP slow start, TLS negotiation, or OS scheduling delays—it cannot distinguish them without additional instrumentation. Similarly, TTFB includes server queuing time, which may be caused by application logic rather than network conditions.

### 14.5 Protocol Ossification and Middlebox Interference

Protocol ossification is the phenomenon where network intermediaries (middleboxes) become so dependent on specific protocol behaviors that future evolution is impeded. TCP has ossified severely: firewalls and NATs drop packets with unknown TCP options, rewrite sequence numbers, and enforce strict window behaviors. This ossification made it impossible to evolve TCP in the kernel, motivating QUIC's move to user-space UDP.

HTTP/2 has also begun to ossify. Some corporate proxies downgrade HTTP/2 to HTTP/1.1, strip unknown headers, or enforce payload size limits derived from HTTP/1.1 assumptions. HTTP/3 faces its own ossification risks: UDP rate limiting by carriers (justified as DDoS mitigation but often blanket-throttled), firewall rules that block UDP/443, and deep packet inspection systems that cannot inspect QUIC's encrypted payloads and therefore block them entirely.

The tension between security (encryption prevents inspection) and network manageability (operators want visibility) will continue to shape protocol evolution. Encrypted Client Hello (ECH), Oblivious HTTP (OHTTP), and MASQUE (Multiplexed Application Substrate over QUIC Encryption) represent further steps toward endpoint-controlled privacy, each introducing new challenges for enterprise security and regulatory compliance.

### 14.6 Future Directions: WebTransport, MASQUE, and Beyond

WebTransport is a client-server API built atop HTTP/3 datagrams and unreliable streams (RFC 9221). It exposes a message-oriented interface similar to WebSockets but with the performance characteristics of QUIC: multiplexing, connection migration, and user-space congestion control. WebTransport is designed for real-time gaming, live streaming, and IoT applications where TCP's in-order delivery is too restrictive.

MASQUE (Multiplexed Application Substrate over QUIC Encryption) extends HTTP/3 to serve as a tunneling substrate for IP and UDP proxying. It enables VPN-like functionality within the standard HTTP/3 stack, allowing clients to proxy arbitrary traffic through an HTTP/3 connection without custom VPN protocols. This convergence of web and network tunneling protocols suggests a future where the distinctions between "web traffic" and "network traffic" dissolve into a unified encrypted transport layer.

These technologies do not obsolete HTTP/2 or HTTP/1.1; they extend the protocol family into new domains. Just as HTTP/1.1 persists for simple APIs and legacy infrastructure, HTTP/2 will remain the default for general web traffic for years to come, while HTTP/3 and its derivatives serve latency-sensitive and mobility-critical applications.

The evolution from HTTP/1.1 to HTTP/3 reflects a broader trend in systems engineering: moving functionality out of the kernel and into user space, integrating encryption as a baseline rather than an option, and designing protocols that degrade gracefully under adverse network conditions. These principles—user-space agility, encryption-by-default, and resilience—will likely govern the next generation of transport protocols beyond QUIC, whether for interplanetary internet (Delay-Tolerant Networking) or ultra-low-latency edge computing (5G MEC).

---

## 15. References

1. Fielding, R., et al. *RFC 9112: HTTP/1.1*. IETF, 2022.
2. Thomson, M., & Benfield, C. *RFC 9113: HTTP/2*. IETF, 2022.
3. Bishop, M. *RFC 9114: HTTP/3*. IETF, 2022.
4. Iyengar, J., & Thomson, M. *RFC 9000: QUIC: A UDP-Based Multiplexed and Secure Transport*. IETF, 2021.
5. Peon, R., & Ruettger, H. *RFC 7541: HPACK: Header Compression for HTTP/2*. IETF, 2015.
6. Krishnan, S., et al. *RFC 9204: QPACK: Field Compression for HTTP/3*. IETF, 2022.
7. Rescorla, E. *RFC 8446: The Transport Layer Security (TLS) Protocol Version 1.3*. IETF, 2018.
8. Hoffman, P., & McManus, P. *RFC 8484: DNS over HTTPS (DoH)*. IETF, 2018.
9. Hu, Z., et al. *RFC 7858: Specification for DNS over Transport Layer Security (DoT)*. IETF, 2016.
10. Schinazi, D., & Pauly, T. *RFC 8305: Happy Eyeballs Version 2*. IETF, 2018.
11. Schinazi, D. *RFC 7413: TCP Fast Open*. IETF, 2014.
12. Bunce, L. *RFC 9218: Extensible Prioritization Scheme for HTTP*. IETF, 2022.
13. W3C. *Navigation Timing Level 2*. <https://www.w3.org/TR/navigation-timing-2/>
14. HTTP Archive. *Web Almanac: HTTP/2 and HTTP/3 Adoption*. 2025.
15. Langley, A., et al. *The QUIC Transport Protocol: Design and Internet-Scale Deployment*. ACM SIGCOMM, 2017.

---

*Document compiled as part of the 70-theoretical-foundations knowledge base. For corrections or additions, refer to the contribution guidelines in the repository root.*
