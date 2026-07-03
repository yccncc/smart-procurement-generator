# 專案規則 - AGENTS.md

## 專案入口
專案名稱：智慧採購文件自動生成系統 (Smart Procurement Generator)
用途：提供極簡引導式聊天/問答介面，建構具備法規防錯與多文件勾稽功能的核心引擎，生成政府招標投標須知及契約條款。
工作目錄：`C:\Users\YCC\.gemini\antigravity\scratch\smart-procurement-generator`

## 懶人包自動連接命令對應
當使用者在對話中下達以下命令時，AI 代理必須自動載入對應之 Skill 執行連接或環境診斷：

1. **連接 GitHub** / **設定 GitHub**
   *   自動載入 `antigravity-github` 或工作區自訂 Skill 執行 `gh auth status` 以檢查狀態。
   *   若未登入，使用 `gh auth login --web` 指引進行瀏覽器登入。
   *   設定 Git 全域使用者信箱及姓名。

2. **連接 Obsidian** / **設定 Obsidian**
   *   自動載入 `antigravity-obsidian` 以檢查 `mcpvault` 安裝狀態。
   *   引導或自動安裝 `@bitbonsai/mcpvault` 並註冊至 AntiGravity 的 MCP 設定。

3. **連接 NotebookLM** / **設定 NotebookLM**
   *   自動載入 `antigravity-notebooklm` 以檢查 `notebooklm-mcp-cli` 安裝狀態。
   *   使用 `nlm login` 引導瀏覽器 OAuth 授權，並將 `nlm mcp` 註冊為 MCP 伺服器。

4. **連接 Firebase** / **設定 Firebase**
   *   自動載入 `antigravity-firebase` 以檢查 `firebase-tools` 是否安裝。
   *   執行 `firebase login` 授權，並將 `firebase mcp` 註冊為 MCP 伺服器。

## 工作規則與安全性
*   回應一律採用繁體中文。
*   開工與收工依循 `antigravity-workflow`：開工先讀此檔與檢查 git status，收工先檢查有無洩漏金鑰、更新紀錄並安全 commit/push。
*   **絕對禁止**將任何 API Key、帳號 Token、Firebase 憑證、私密筆記本 ID 等敏感資訊寫入程式碼、儲存庫或對外公開筆記。
