# mock-cors-proxy 🚀

`mock-cors-proxy` is a handy Node.js CORS proxy server with built-in request mocking and caching capabilities. Designed to help frontend developers tackle CORS issues during development, this trusty tool generates mock data for your UI components and stores them in a local directory for quick access.

## Features 🌟

- CORS proxy server to bypass CORS restrictions in development.
- Request mocking and caching for efficient UI development.
- Stores mocks in a local directory for easy management.
- Supports three modes: `capture-only`, `proxy-only`, and `mix`.
- Customizable target URL and listening port.
- Colorful and interactive command-line output.

## How It Works 🧠

`mock-cors-proxy` intercepts HTTP requests and forwards them to the specified target URL. When caching is enabled, it stores the responses as JSON files in a local directory, allowing you to quickly access and modify the mock data as needed. You can switch between different modes to control caching and proxying behavior according to your development requirements.

## Installation 🔧

Get started by installing `mock-cors-proxy` globally using npm:

```bash
npm install -g mock-cors-proxy
```

## Usage 🎮

Start the `mock-cors-proxy` server with this command:

```bash
mock-cors-proxy --targetUrl <target_url> --port <port> --mode <mode> --mockDir <directory>
```

Replace `<target_url>`, `<port>`, `<mode>`, and `<mockDir>` with your desired values. 

**Defaults:**

* port: `6001`
* mockDir: `./cache`
* mode: `mix`

Modes:

- `capture-only`: The server only caches requests to the file system but does not read from them.
- `proxy-only`: The server only hits the target URL and does not use caching.
- `mix`: The server uses both caching and proxying.

For example:

```bash
mock-cors-proxy --targetUrl https://api.example.com --port 3000 --mode mix --mockDir <mockDir>
```

This command starts the `mock-cors-proxy` server, proxying requests to `https://api.example.com` and listening on port `3000`, with both caching and proxying enabled.

## Contributing 🤝

Contributions are welcome! Feel free to submit issues or pull requests to help improve `mock-cors-proxy`.

## License 📄

MIT License
