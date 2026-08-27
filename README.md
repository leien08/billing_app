# 套房電費管理系統 (Rental Electricity Management System)

本專案提供一套包含 **Node.js + Express 後端**、**SQLite 資料庫** 以及 **Tailwind CSS 網頁前台與後台管理** 的完整電費管理系統。

## 📁 專案檔案架構

- `package.json`：Node.js 專案設定檔與套件依賴說明
- `server.js`：Express API 伺服器與 SQLite 資料庫建置邏輯
- `public/index.html`：包含前台顯示與後台輸入的全功能前端介面

## 🚀 快速啟動步驟

1. **安裝 Node.js**
   請確保您的電腦已安裝 [Node.js](https://nodejs.org/) (建議 v16 以上版本)。

2. **安裝依賴套件**
   在專案根目錄下開啟終端機（Terminal / Command Prompt），執行：
   ```bash
   npm install
   ```

3. **啟動 Web 伺服器**
   ```bash
   npm start
   ```

4. **開啟網頁**
   開啟瀏覽器並連線至：
   `http://localhost:3000`

## 💡 功能說明
- **前台檢視**：即時顯示目前台電單價、總電表使用度數、各套房上次與本次度數、計算後的用電量及應繳電費額。
- **後台管理**：可修改當前台電費率（元/度）、總電表抄表度數，以及各套房的分電表抄表度數。點擊「儲存」後自動將數據持久化寫入 SQLite 資料庫 (`electricity.db`)。
