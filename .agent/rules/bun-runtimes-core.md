---
trigger: always_on
---

Context: Guidelines for server-side execution, system I/O, and native integration.

2.1 HTTP & Networking
Server: Use Bun.serve for high-performance HTTP. Supports TLS, WebSockets, and Hot Reloading.

Routing: Utilize the native File System Router or static/dynamic routing in Bun.serve.

Client: Standard fetch API implementation, including support for Unix Domain Sockets.

Advanced Networking: Native APIs for TCP, UDP, and DNS resolution.

2.2 System & File I/O
File Operations: Use optimized APIs for reading/writing. Supports streaming via ReadableStream or Node.js Streams.

Shell: Use Bun.$ (Shell API) to run shell commands directly from JavaScript.

Process Management: Bun.spawn for child processes with IPC support. Handle OS signals like CTRL+C.

Environment: Automatic .env loading and Bun.env access.

2.3 Native Integration & Data
Databases: High-performance native drivers for SQLite (bun:sqlite) and a unified SQL API for PostgreSQL/MySQL.

FFI & C: Call native libraries via FFI or compile/run C code directly with the integrated C Compiler.

Binary Data: Robust utilities for converting between ArrayBuffer, Blob, Buffer, and Uint8Array.

Cloud Storage: Native, fast bindings for S3-compatible services.
