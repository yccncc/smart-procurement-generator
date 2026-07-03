---
name: antigravity-connection-auto
description: 全自動檢測與連接 NotebookLM、Firebase、GitHub 與 Obsidian。說「一鍵安裝環境」「連接環境」「診斷環境」時載入。
---

# 環境檢測與自動連接手冊

當使用者要求連接服務或一鍵安裝環境時，AI 代理可遵循本手冊步驟全自動進行工具安裝與連結。

## 1. 系統環境診斷 (Environment Diagnosis)
AI 代理應利用終端命令對以下工具進行版本檢測，盤點當前環境狀態：
*   **Git:** `git --version`
*   **GitHub CLI:** `gh --version`
*   **Node.js & npm:** `node --version` 與 `npm.cmd --version`
*   **Python:** `python --version`

## 2. 全自動工具安裝 (Silent Installation via winget)
針對缺少的工具，AI 代理應向使用者說明，並執行以下 PowerShell 命令進行靜默式安裝：

### Git 安裝
```powershell
winget install --id Git.Git -e --silent
```
*安裝完成後，執行檔路徑通常為 `C:\Program Files\Git\cmd\git.exe`。*

### GitHub CLI 安裝
```powershell
winget install --id GitHub.cli -e --silent
```
*安裝完成後，執行檔路徑通常為 `C:\Program Files\GitHub CLI\gh.exe`。*

### Node.js (含 npm) 安裝
```powershell
winget install --id OpenJS.NodeJS -e --silent
```
*安裝完成後，重啟或載入環境變數以使用 `node` 與 `npm.cmd`。*

## 3. 連接設定與驗證流程

### 3.1 GitHub 連接
1.  執行 `gh auth status`。
2.  若未登入，執行 `gh auth login --web --git-protocol https` 開啟瀏覽器 OAuth 登入並印出驗證碼給使用者。
3.  設定 Git 全域資訊：
    ```powershell
    git config --global user.name "Your Name"
    git config --global user.email "your-email@example.com"
    ```

### 3.2 Firebase 連接
1.  全域執行登入：
    ```powershell
    npx.cmd -y firebase-tools@latest login
    ```
2.  檢索專案清單以驗證：
    ```powershell
    npx.cmd -y firebase-tools@latest projects:list
    ```
3.  於 AntiGravity MCP 中註冊服務：
    ```json
    "firebase": {
      "type": "local",
      "command": ["npx.cmd", "-y", "firebase-tools@latest", "mcp"],
      "enabled": true
    }
    ```

### 3.3 NotebookLM 連接
1.  若有 python，利用 pip 安裝 CLI 工具：
    ```powershell
    pip install notebooklm-mcp-cli
    ```
2.  執行 `nlm login` 引導使用者登入。
3.  執行 `nlm doctor` 驗證狀態。
4.  於 AntiGravity MCP 中註冊：
    ```json
    "notebooklm": {
      "type": "local",
      "command": ["nlm", "mcp"],
      "enabled": true
    }
    ```

### 3.4 Obsidian 連接
1.  全域安裝 MCPVault：
    ```powershell
    npm.cmd install -g @bitbonsai/mcpvault
    ```
2.  查找 mcpvault 執行路徑（通常位於 `C:\Users\<UserName>\AppData\Roaming\npm\mcpvault.cmd`）。
3.  引導使用者提供其實體 Vault 路徑，並註冊為 MCP 伺服器：
    ```json
    "obsidian": {
      "type": "local",
      "command": [
        "C:\\Users\\<UserName>\\AppData\\Roaming\\npm\\mcpvault.cmd",
        "<Vault實體路徑>"
      ],
      "enabled": true
    }
    ```
