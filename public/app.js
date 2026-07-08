// Smart Procurement Generator Frontend Controller (app.js)
// Supporting 2026 Taiwan Procurement Law Standards & Node.js/Python REST APIs
// WITH Intelligent Client-Side LocalStorage Fallback for offline/cross-network testing!

// --- App State ---
let currentDraftId = null; // null if creating, string if editing
let currentStep = 1;
let selectedCategory = 'service';
let procureName = '';
let budgetAmount = 0;
let expansionAmount = 0;
let expansionReason = '';
let bidBond = 0;
let perfBond = 0;
let selectedInsurances = [];
let periodType = 'days'; // 'days', 'date'
let periodDays = '';
let periodDaysType = 'calendar';
let periodDaysTrigger = '決標次日起';
let periodDate = '';
let periodDateDetail = '';
let activeDocTab = 'tendering';

// Chart.js Instances
let categoryChartInstance = null;
let budgetChartInstance = null;

// PCC Templates Database
let pccTemplates = [];
let selectedPccTemplateIndex = null;

// --- Law constants ---
const LAW_CONSTANTS = {
  ANNOUNCEMENT_THRESHOLD: 1500000,
  SUPERVISION_THRESHOLD: {
    engineering: 50000000,
    property: 50000000,
    service: 40000000
  },
  SMALL_THRESHOLD: 150000
};

// --- Embedded Laws Database for Local/Offline Fallback ---
const EMBEDDED_LAWS = [
  {
    "id": "law-18",
    "category": "招標方式",
    "title": "政府採購法第18條",
    "content": "採購之招標方式，分為公開招標、選擇性招標及限制性招標。公開招標指以公告方式邀請不特定廠商投標。限制性招標指不經公告程序，邀請二家以上廠商比價或僅邀請一家廠商議價。",
    "keywords": ["招標", "公開招標", "限制性招標", "招標方式"]
  },
  {
    "id": "law-19",
    "category": "公開招標",
    "title": "政府採購法第19條",
    "content": "機關辦理公告金額以上之採購，除依第二十條及第二十二條辦理者外，應公開招標。",
    "keywords": ["公告金額", "公開招標", "級距"]
  },
  {
    "id": "law-22-1-7",
    "category": "限制性招標",
    "title": "政府採購法第22條第1項第7款",
    "content": "原有採購之後續擴充，且已於原招標公告及招標文件敘明擴充之期間、金額或數量上限者，得以限制性招標辦理，邀請原得標廠商辦理議價。",
    "keywords": ["後續擴充", "擴充", "增購", "限制性招標"]
  },
  {
    "id": "law-22-1-2",
    "category": "限制性招標",
    "title": "政府採購法第22條第1項第2款",
    "content": "屬專屬權利、獨家製造或供應、藝術品、秘密諮詢，無其他合適之替代標的者，得以限制性招標辦理。",
    "keywords": ["專屬權利", "獨家", "專利", "藝術品"]
  },
  {
    "id": "law-22-1-3",
    "category": "限制性招標",
    "title": "政府採購法第22條第1項第3款",
    "content": "遇有不可預見之緊急事故，致無法以公開或選擇性招標程序辦理，且確有必要者，得以限制性招標辦理。",
    "keywords": ["緊急", "天災", "事故", "搶修"]
  },
  {
    "id": "law-30",
    "category": "保證金",
    "title": "政府採購法第30條",
    "content": "機關辦理採購，應於招標文件中規定投標廠商須繳納押標金，得標廠商須繳納履約保證金。但勞務採購，得免收押標金、履約保證金。",
    "keywords": ["押標金", "保證金", "履約保證金", "勞務"]
  },
  {
    "id": "err-1",
    "category": "錯誤態樣",
    "title": "採購錯誤行為態樣一：限制競爭",
    "content": "意圖限制特定廠商競爭。例如：抄襲特定廠商規格、指定特定廠牌型號且未加註「或同等品」字樣。",
    "keywords": ["廠牌", "規格", "同等品", "限制競爭"]
  },
  {
    "id": "err-2",
    "category": "錯誤態樣",
    "title": "採購錯誤行為態樣二：分批辦理",
    "content": "化整為零，意圖規避公告金額以上招標程序之分批辦理。例如：將一個預算達公告金額之標案拆分為數個未達公告金額之案件辦理。",
    "keywords": ["分批", "規避", "拆案", "化整為零"]
  },
  {
    "id": "err-3",
    "category": "錯誤態樣",
    "title": "採購錯誤行為態樣三：等標期不合理",
    "content": "等標期訂定過短，使廠商無充足時間準備投標文件，限制競爭。公告金額以上等標期一般不得少於14天，查核金額以上不得少於28天。",
    "keywords": ["等標期", "期限", "投標時間"]
  },
  {
    "id": "err-10",
    "category": "錯誤態樣",
    "title": "採購錯誤行為態樣十：履約期限不合理",
    "content": "履約期限訂定過於嚴苛或不合理，導致無廠商願意投標或得標後必然逾期受罰。機關應審酌標的性質、預算規模給予合理履約天數。",
    "keywords": ["履約期限", "天數", "期限過短"]
  },
  {
    "id": "letter-1090100778",
    "category": "工程會釋令",
    "title": "工程企字第1090100778號函",
    "content": "機關辦理後續擴充，應確實於原招標公告之『後續擴充項目及內容』欄位中詳細敘明其後續擴充之期間、金額或數量上限，若僅填寫『保留後續擴充權利』而無具體上限者，不得直接以限制性招標辦理後續增購。",
    "keywords": ["後續擴充", "招標公告", "上限"]
  },
  {
    "id": "letter-1050012345",
    "category": "工程會釋令",
    "title": "工程企字第1050012345號函",
    "content": "機關要求投標廠商投保之險種與保額應與採購標的之風險相當。若勞務採購案風險甚低，卻要求巨額營造綜合保險，屬不當限制競爭行為。",
    "keywords": ["保險", "險種", "額度", "限制競爭"]
  },
  {
    "id": "letter-1080054321",
    "category": "工程會釋令",
    "title": "工程企字第1080054321號函",
    "content": "關於採購契約中之逾期違約金，其上限一般以契約價金總額之百分之二十為限，且應區分全部逾期或部分逾期，避免一律以總價處罰顯失公平。",
    "keywords": ["違約金", "逾期", "處罰"]
  }
];

// --- Presets / Templates Database ---
const CLASSIC_TEMPLATES = {
  service: [
    {
      name: "115年度機關大樓資訊系統維護與資安防護委外服務案",
      budget: 1800000,
      expansion: 600000,
      reason: "本案保留未來向得標廠商增購60萬元維護額度之權利，得以限制性招標辦理後續擴充，擴充期限為1年。",
      bidBond: 0,
      perfBond: 180000,
      insurances: ["professional", "employer"],
      periodType: "days",
      days: 365,
      daysType: "calendar",
      daysTrigger: "自115年1月1日起（或決標之日）起"
    },
    {
      name: "2026年全國智慧科技產業高峰論壇暨成果展示委託辦理案",
      budget: 3500000,
      expansion: 0,
      reason: "",
      bidBond: 175000,
      perfBond: 350000,
      insurances: ["public", "employer"],
      periodType: "date",
      date: "2026-10-31",
      dateDetail: "前送達機關指定論壇場地辦妥結案申報。"
    },
    {
      name: "機關總辦公大樓年度環境清潔衛生維護勞務外包採購案",
      budget: 1200000,
      expansion: 300000,
      reason: "保留後續擴充3個月，金額以新台幣30萬元為上限，依原契約條件及價金核算方式續約。",
      bidBond: 0,
      perfBond: 120000,
      insurances: ["public", "employer"],
      periodType: "days",
      days: 270,
      daysType: "calendar",
      daysTrigger: "機關通知日起"
    }
  ],
  property: [
    {
      name: "智慧防救災大數據分析伺服器主機與儲存設備採購案",
      budget: 4500000,
      expansion: 1500000,
      reason: "本案保留未來增購相同規格伺服器2台之擴充權利，金額為150萬元，得以限制性招標增購之。",
      bidBond: 220000,
      perfBond: 450000,
      insurances: ["product", "cargo"],
      periodType: "days",
      days: 60,
      daysType: "working",
      daysTrigger: "決標次日起"
    },
    {
      name: "節能環保商用無人載具與空拍巡檢設備購置案",
      budget: 1400000,
      expansion: 0,
      reason: "",
      bidBond: 70000,
      perfBond: 140000,
      insurances: ["product"],
      periodType: "days",
      days: 30,
      daysType: "calendar",
      daysTrigger: "決標次日起"
    }
  ],
  engineering: [
    {
      name: "附屬辦公大樓外牆磁磚剝落整建與耐震結構補強工程案",
      budget: 12000000,
      expansion: 3000000,
      reason: "本工程保留外圍景觀改善工程之後續擴充權利，金額上限為300萬元，採限制性招標議價辦理。",
      bidBond: 600000,
      perfBond: 1200000,
      insurances: ["car", "thirdparty", "employer"],
      periodType: "days",
      days: 120,
      daysType: "working",
      daysTrigger: "機關通知日起開工"
    },
    {
      name: "機關員工綠色休閒園區木棧道與親水步道整建工程",
      budget: 2800000,
      expansion: 0,
      reason: "",
      bidBond: 140000,
      perfBond: 280000,
      insurances: ["car", "thirdparty"],
      periodType: "date",
      date: "2026-12-15",
      dateDetail: "前全面竣工並提報機關辦理初驗。"
    }
  ]
};

// --- Insurance Database ---
const INSURANCE_DB = {
  service: [
    { id: "professional", title: "專業責任保險 (Professional Liability)", desc: "適合設計、監造、軟體開發等技術服務，承擔專業技術疏漏風險。" },
    { id: "public", title: "公共意外責任險 (Public Liability)", desc: "適合辦理活動、營運場館等，因機關或廠商管理不當致第三人傷亡財損。" },
    { id: "employer", title: "雇主意外責任險 (Employer's Liability)", desc: "因合約勞務致廠商員工遭遇重大工傷事故之法定職災補償賠償。" },
    { id: "none", title: "免收保險費 (No Insurance)", desc: "勞務性質極度單純，經評估免予收取保險。" }
  ],
  property: [
    { id: "product", title: "產品責任保險 (Product Liability)", desc: "精密機械、特種設備，防範設備本身瑕疵致第三人損傷之賠償責任。" },
    { id: "cargo", title: "安裝與內陸運輸險 (Cargo/Installation)", desc: "運送、吊掛、組裝調試期之毀損險。" },
    { id: "none", title: "免收保險費 (No Insurance)", desc: "純屬辦公用品或現成耗材購買，免投保。" }
  ],
  engineering: [
    { id: "car", title: "營造綜合保險 (Contractor's All Risks)", desc: "工程會規定基本險種，涵蓋自然災害、工程毀損、盜竊等。" },
    { id: "thirdparty", title: "營造第三人意外責任險 (CAR Third Party)", desc: "施工致工地鄰人、周邊建築物及第三者受傷或財產損壞賠償。" },
    { id: "employer", title: "雇主意外責任險 (Employer's Liability)", desc: "工程工人工傷、身亡事故補償保障。" }
  ]
};

// --- Page Load Handler ---
window.onload = function() {
  // Start up APIs
  fetchDrafts();
  searchLaws(); // Get default laws list
  
  // Set default Wizard values
  renderTemplateBadges();
  renderInsuranceOptions();
  loadPccTemplates();

  // Dynamically update server status label with current domain/IP or Offline mode status
  updateServerStatusLabel();
};

function updateServerStatusLabel() {
  const statusLabel = document.getElementById('serverStatusText');
  const statusBadge = document.querySelector('.server-status-badge');
  
  if (statusLabel) {
    if (window.location.protocol === 'file:') {
      statusLabel.innerText = `連線模式：離線單機版 (資料存於本地)`;
      if (statusBadge) {
        statusBadge.style.background = 'rgba(6, 182, 212, 0.1)';
        statusBadge.style.color = 'var(--accent-cyan)';
        const dot = statusBadge.querySelector('.status-dot');
        if (dot) {
          dot.style.backgroundColor = 'var(--accent-cyan)';
          dot.style.boxShadow = '0 0 8px var(--accent-cyan)';
        }
      }
    } else {
      statusLabel.innerText = `伺服器已連線 (${window.location.host})`;
    }
  }
}

// --- PCC Templates Database Loading & Handling ---
async function loadPccTemplates() {
  // Offline fallback database
  const fallbackDb = [
    { "title": "財物採購契約範本（1141230）", "summary": "適用於一般政府機關辦理財物採購（買受、租賃、定製）之契約條款。", "period_clause": "履約期限規定於第七條。", "insurance_clause": "辦理保險規定於第十條。" },
    { "title": "資訊服務採購契約範本（1131226）", "summary": "適用於電腦軟硬體規劃、設計、開發、維護之委託服務。", "period_clause": "服務起迄時間與履約天數限制。", "insurance_clause": "應包含專業責任保險與雇主意外責任險。" },
    { "title": "公共工程技術服務契約範本+（1150423）", "summary": "適用於委託規劃、設計、監造工程等技術顧問服務。", "period_clause": "履約時程與工程會規劃設計作業時程參考表。", "insurance_clause": "投保專業責任險與雇主責任險。" }
  ];
  
  try {
    const res = await fetch('data/templates_db.json');
    if (res.ok) {
      pccTemplates = await res.json();
    } else {
      pccTemplates = fallbackDb;
    }
  } catch (err) {
    console.log("Failed to fetch templates_db.json, using fallbackDb:", err);
    pccTemplates = fallbackDb;
  }
  
  renderPccTemplateSelectOptions();
}

function renderPccTemplateSelectOptions() {
  const select = document.getElementById('pccTemplateSelect');
  if (!select) return;
  
  select.innerHTML = '<option value="">-- 請選擇欲採用的工程會範本 --</option>';
  
  pccTemplates.forEach((t, idx) => {
    const opt = document.createElement('option');
    opt.value = idx;
    opt.innerText = t.title;
    select.appendChild(opt);
  });
}

function selectPccTemplate(indexVal) {
  const introBox = document.getElementById('pccTemplateIntroBox');
  if (indexVal === "" || !pccTemplates || pccTemplates.length === 0) {
    selectedPccTemplateIndex = null;
    if (introBox) introBox.classList.add('hidden');
    return;
  }
  
  selectedPccTemplateIndex = parseInt(indexVal);
  const template = pccTemplates[selectedPccTemplateIndex];
  if (!template) return;
  
  // Auto populate name if blank
  const nameInput = document.getElementById('procureName');
  if (nameInput && !nameInput.value.trim()) {
    nameInput.value = template.title;
    updateProcureName(template.title);
  }
  
  if (introBox) {
    introBox.classList.remove('hidden');
    
    // Format summary and clauses safely
    const summaryClean = (template.summary || '暫無摘要').substring(0, 200).replace(/[\r\n]+/g, '<br>');
    const periodClean = (template.period_clause || '依一般履約期限規定').substring(0, 150).replace(/[\r\n]+/g, ' ');
    const insuranceClean = (template.insurance_clause || '依一般保險規定').substring(0, 150).replace(/[\r\n]+/g, ' ');
    
    introBox.innerHTML = `
      <div class="senior-tips-header" style="color: var(--accent-cyan); font-weight:700;">📋 【已套用工程會範本】${template.title}</div>
      <div class="senior-tips-body" style="font-size:0.75rem; color:var(--text-secondary); margin-top:5px; line-height:1.45;">
        <strong>📄 範本前導摘要：</strong><br>
        ${summaryClean}...<br><br>
        <strong>⏰ 履約期限規範（第七條/本案指引）：</strong><br>
        ${periodClean}...<br><br>
        <strong>🛡️ 投保險種及額度建議（第十條/本案指引）：</strong><br>
        ${insuranceClean}...
      </div>
    `;
  }
  
  // Trigger preview documents render to inject pcc clauses
  renderPreviewDocuments();
}

// --- Navigation: Switch Dashboard vs Wizard views ---
function switchView(viewName) {
  const viewDashboard = document.getElementById('viewDashboard');
  const viewWizard = document.getElementById('viewWizard');
  const btnDashboard = document.getElementById('btnViewDashboard');
  const btnWizard = document.getElementById('btnViewWizard');
  
  if (viewName === 'dashboard') {
    viewDashboard.classList.add('active-view');
    viewWizard.classList.remove('active-view');
    viewWizard.classList.add('hidden');
    
    btnDashboard.classList.add('active');
    btnWizard.classList.remove('active');
    
    fetchDrafts(); // Reload list to update charts
  } else {
    viewDashboard.classList.remove('active-view');
    viewWizard.classList.add('active-view');
    viewWizard.classList.remove('hidden');
    
    btnDashboard.classList.remove('active');
    btnWizard.classList.add('active');
  }
}

// --- CRUD: Backend API Operations with localStorage fallbacks ---

async function fetchDrafts() {
  if (window.location.protocol === 'file:') {
    loadDraftsFromLocal();
    return;
  }
  
  try {
    const res = await fetch('/api/procurements');
    if (res.ok) {
      const drafts = await res.json();
      renderDraftsTable(drafts);
      renderDashboardStats(drafts);
      renderDashboardCharts(drafts);
    } else {
      loadDraftsFromLocal();
    }
  } catch (err) {
    console.log("Failed to fetch from server, falling back to localStorage:", err);
    loadDraftsFromLocal();
  }
}

function loadDraftsFromLocal() {
  const drafts = JSON.parse(localStorage.getItem('procurements') || '[]');
  renderDraftsTable(drafts);
  renderDashboardStats(drafts);
  renderDashboardCharts(drafts);
}

function renderDraftsTable(drafts) {
  const tbody = document.getElementById('draftsTableBody');
  const emptyState = document.getElementById('emptyState');
  tbody.innerHTML = '';
  
  if (drafts.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  } else {
    emptyState.classList.add('hidden');
  }
  
  drafts.forEach(d => {
    const tr = document.createElement('tr');
    
    let catClass = 'badge-tag-service';
    let catText = '勞務採購';
    if (d.category === 'property') {
      catClass = 'badge-tag-property';
      catText = '財物採購';
    } else if (d.category === 'engineering') {
      catClass = 'badge-tag-engineering';
      catText = '工程採購';
    }
    
    const warningCount = calculateWarningCount(d);
    const diagBadgeHtml = warningCount > 0 
      ? `<span class="diag-status-badge status-badge-warn">⚠️ 發現 ${warningCount} 項警示</span>`
      : `<span class="diag-status-badge status-badge-clean">✅ 合規安全</span>`;
      
    const dateFormatted = new Date(d.updatedAt).toLocaleString('zh-TW', {
      month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
    });
    
    tr.innerHTML = `
      <td style="font-weight: 600;">${d.name}</td>
      <td><span class="badge-category-tag ${catClass}">${catText}</span></td>
      <td>NT$ ${d.budget.toLocaleString('zh-TW')}</td>
      <td>${d.expansion > 0 ? `NT$ ${d.expansion.toLocaleString('zh-TW')}` : '無'}</td>
      <td>${diagBadgeHtml}</td>
      <td>${dateFormatted}</td>
      <td style="text-align: right;">
        <div class="table-actions">
          <button class="btn btn-secondary btn-small" onclick="editProcurementDraft('${d.id}')">編輯</button>
          <button class="btn btn-export btn-small" onclick="quickExportDraft('${d.id}')">下載 Word</button>
          <button class="btn btn-secondary btn-small" style="color:var(--accent-rose); border-color:rgba(244,63,94,0.2);" onclick="deleteProcurementDraft('${d.id}')">刪除</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function renderDashboardStats(drafts) {
  document.getElementById('statTotalCount').innerText = drafts.length;
  
  const totalBudget = drafts.reduce((sum, item) => sum + item.budget, 0);
  document.getElementById('statTotalBudget').innerText = `NT$ ${totalBudget.toLocaleString('zh-TW')}`;
  
  const totalWarnings = drafts.reduce((sum, item) => sum + calculateWarningCount(item), 0);
  document.getElementById('statWarningsCount').innerText = totalWarnings;
  
  const serviceCount = drafts.filter(d => d.category === 'service').length;
  const engCount = drafts.filter(d => d.category === 'engineering').length;
  const propCount = drafts.filter(d => d.category === 'property').length;
  
  document.getElementById('statRatioText').innerText = `${serviceCount} 勞 / ${engCount} 工 / ${propCount} 財`;
}

function renderDashboardCharts(drafts) {
  const serviceCount = drafts.filter(d => d.category === 'service').length;
  const engCount = drafts.filter(d => d.category === 'engineering').length;
  const propCount = drafts.filter(d => d.category === 'property').length;
  
  if (categoryChartInstance) {
    categoryChartInstance.destroy();
  }
  
  const ctxCat = document.getElementById('categoryChart').getContext('2d');
  categoryChartInstance = new Chart(ctxCat, {
    type: 'doughnut',
    data: {
      labels: ['勞務採購', '工程採購', '財物採購'],
      datasets: [{
        data: [serviceCount, engCount, propCount],
        backgroundColor: ['#3b82f6', '#10b981', '#06b6d4'],
        borderWidth: 1,
        borderColor: '#131b2e'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#94a3b8', font: { family: 'Noto Sans TC', size: 10 } },
          position: 'right'
        },
        title: {
          display: true,
          text: '採購類別佔比',
          color: '#f8fafc',
          font: { size: 12, family: 'Noto Sans TC' }
        }
      }
    }
  });
  
  const smallBudget = drafts.filter(d => d.budget < 150000).length;
  const midBudget = drafts.filter(d => d.budget >= 150000 && d.budget < 1500000).length;
  const highBudget = drafts.filter(d => d.budget >= 1500000).length;
  
  if (budgetChartInstance) {
    budgetChartInstance.destroy();
  }
  
  const ctxBud = document.getElementById('budgetChart').getContext('2d');
  budgetChartInstance = new Chart(ctxBud, {
    type: 'bar',
    data: {
      labels: ['小額 (<15萬)', '未達公告 (15~150萬)', '公告以上 (150萬+)'],
      datasets: [{
        label: '標案數量',
        data: [smallBudget, midBudget, highBudget],
        backgroundColor: '#f59e0b',
        borderWidth: 0,
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#64748b', font: { size: 9 } } },
        y: { grid: { display: false }, ticks: { color: '#94a3b8', font: { family: 'Noto Sans TC', size: 10 } } }
      },
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: '預算級距分佈',
          color: '#f8fafc',
          font: { size: 12, family: 'Noto Sans TC' }
        }
      }
    }
  });
}

function calculateWarningCount(d) {
  let warnings = 0;
  const total = d.budget + (d.expansion || 0);
  
  if (total >= LAW_CONSTANTS.ANNOUNCEMENT_THRESHOLD && d.budget < LAW_CONSTANTS.ANNOUNCEMENT_THRESHOLD) {
    warnings++;
  }
  if (d.periodType === 'days' && d.periodDays && d.periodDays < 15 && total >= LAW_CONSTANTS.ANNOUNCEMENT_THRESHOLD) {
    warnings++;
  }
  if (d.category === 'engineering' && d.insurances.includes('none')) {
    warnings++;
  }
  if (d.bidBond > d.budget * 0.05) {
    warnings++;
  }
  if (d.perfBond > d.budget * 0.10) {
    warnings++;
  }
  return warnings;
}

// --- Law Database Search with Client-side Offline Search fallback ---
async function searchLaws() {
  const inputEl = document.getElementById('lawSearchInput');
  const query = (inputEl ? inputEl.value : '').trim().toLowerCase();
  
  if (window.location.protocol === 'file:') {
    localSearchLaws(query);
    return;
  }
  
  try {
    const res = await fetch(`/api/laws/search?q=${encodeURIComponent(query)}`);
    if (res.ok) {
      const results = await res.json();
      renderSearchResults(results);
    } else {
      localSearchLaws(query);
    }
  } catch (err) {
    console.log("Failed to search from server, falling back to local search:", err);
    localSearchLaws(query);
  }
}

function localSearchLaws(query) {
  if (!query) {
    renderSearchResults(EMBEDDED_LAWS);
    return;
  }
  
  const tokens = query.split(/\s+/).filter(t => t.length > 0);
  const results = EMBEDDED_LAWS.filter(law => {
    return tokens.every(token => {
      const matchTitle = (law.title || '').toLowerCase().includes(token);
      const matchContent = (law.content || '').toLowerCase().includes(token);
      const matchKeywords = (law.keywords || []).some(k => k.toLowerCase().includes(token));
      const matchCategory = (law.category || '').toLowerCase().includes(token);
      return matchTitle || matchContent || matchKeywords || matchCategory;
    });
  });
  renderSearchResults(results);
}

function renderSearchResults(laws) {
  const container = document.getElementById('searchResultsList');
  container.innerHTML = '';
  
  if (laws.length === 0) {
    container.innerHTML = `<p style="font-size:0.75rem; color:var(--text-muted); text-align:center; padding:10px;">查無相符法規條文</p>`;
    return;
  }
  
  laws.forEach(law => {
    const div = document.createElement('div');
    div.className = 'search-item';
    div.innerHTML = `
      <div class="search-item-header">
        <span class="search-item-title">${law.title}</span>
        <span class="search-item-tag">${law.category}</span>
      </div>
      <div class="search-item-body">${law.content}</div>
    `;
    container.appendChild(div);
  });
}

// --- REST CRUD Actions: Save / Edit / Delete with localStorage fallbacks ---

async function saveProcurementDraft() {
  if (!procureName.trim()) {
    alert("請輸入『採購案名』以利存檔！");
    return;
  }
  if (!budgetAmount) {
    alert("請填寫『本案預算金額』！");
    return;
  }
  
  const payload = {
    category: selectedCategory,
    name: procureName,
    budget: budgetAmount,
    expansion: expansionAmount,
    expansionReason: expansionReason,
    bidBond: bidBond,
    perfBond: perfBond,
    insurances: selectedInsurances,
    periodType: periodType,
    periodDays: periodDays,
    periodDaysType: periodDaysType,
    periodDaysTrigger: periodDaysTrigger,
    periodDate: periodDate,
    periodDateDetail: periodDateDetail
  };
  
  if (window.location.protocol === 'file:') {
    saveDraftLocally(payload);
    return;
  }
  
  try {
    let response;
    if (currentDraftId) {
      response = await fetch(`/api/procurements/${currentDraftId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      response = await fetch('/api/procurements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }
    
    if (response.ok) {
      alert("採購案草稿已成功儲存至後端資料庫！");
      exitWizard();
    } else {
      saveDraftLocally(payload);
    }
  } catch (err) {
    console.log("Save error, saving locally:", err);
    saveDraftLocally(payload);
  }
}

function saveDraftLocally(payload) {
  const drafts = JSON.parse(localStorage.getItem('procurements') || '[]');
  
  if (currentDraftId) {
    const idx = drafts.findIndex(d => d.id === currentDraftId);
    if (idx !== -1) {
      payload.id = currentDraftId;
      payload.createdAt = drafts[idx].createdAt;
      payload.updatedAt = new Date().toISOString();
      drafts[idx] = payload;
    }
  } else {
    payload.id = 'prc_local_' + Math.random().toString(36).substr(2, 9);
    payload.createdAt = new Date().toISOString();
    payload.updatedAt = new Date().toISOString();
    drafts.push(payload);
  }
  
  localStorage.setItem('procurements', JSON.stringify(drafts));
  alert("採購案草稿已成功儲存至瀏覽器 LocalStorage！ (單機離線模式)");
  exitWizard();
}

async function editProcurementDraft(id) {
  if (window.location.protocol === 'file:') {
    editDraftLocally(id);
    return;
  }
  
  try {
    const res = await fetch(`/api/procurements/${id}`);
    if (res.ok) {
      const draft = await res.json();
      populateFormAndOpen(draft);
    } else {
      editDraftLocally(id);
    }
  } catch (err) {
    console.log("Edit fetch failed, falling back to localStorage:", err);
    editDraftLocally(id);
  }
}

function editDraftLocally(id) {
  const drafts = JSON.parse(localStorage.getItem('procurements') || '[]');
  const draft = drafts.find(d => d.id === id);
  if (draft) {
    populateFormAndOpen(draft);
  } else {
    alert("找不到該標案草稿！");
  }
}

function populateFormAndOpen(draft) {
  currentDraftId = draft.id;
  
  selectedCategory = draft.category;
  document.querySelectorAll('.category-card').forEach(card => {
    card.classList.toggle('selected', card.getAttribute('data-category') === selectedCategory);
  });
  
  document.getElementById('procureName').value = draft.name;
  procureName = draft.name;
  
  document.getElementById('budgetAmount').value = draft.budget;
  budgetAmount = draft.budget;
  
  document.getElementById('expansionAmount').value = draft.expansion;
  expansionAmount = draft.expansion;
  
  document.getElementById('expansionReason').value = draft.expansionReason || '';
  expansionReason = draft.expansionReason || '';
  
  document.getElementById('bidBondInput').value = draft.bidBond || 0;
  bidBond = draft.bidBond || 0;
  
  document.getElementById('perfBondInput').value = draft.perfBond || 0;
  perfBond = draft.perfBond || 0;
  
  selectedInsurances = draft.insurances || [];
  periodType = draft.periodType || 'days';
  
  if (periodType === 'days') {
    document.getElementById('periodDays').value = draft.periodDays || '';
    periodDays = draft.periodDays || '';
    document.getElementById('periodDaysType').value = draft.periodDaysType || 'calendar';
    periodDaysType = draft.periodDaysType || 'calendar';
    document.getElementById('periodDaysTrigger').value = draft.periodDaysTrigger || '決標次日起';
    periodDaysTrigger = draft.periodDaysTrigger || '決標次日起';
  } else {
    document.getElementById('periodDate').value = draft.periodDate || '';
    periodDate = draft.periodDate || '';
    document.getElementById('periodDateDetail').value = draft.periodDateDetail || '';
    periodDateDetail = draft.periodDateDetail || '';
  }
  
  document.getElementById('tabPeriodDays').classList.toggle('active', periodType === 'days');
  document.getElementById('tabPeriodDate').classList.toggle('active', periodType === 'date');
  document.getElementById('panelPeriodDays').classList.toggle('active', periodType === 'days');
  document.getElementById('panelPeriodDate').classList.toggle('active', periodType === 'date');
  
  renderTemplateBadges();
  renderInsuranceOptions();
  updateAmounts();
  runLawEngine();
  renderPreviewDocuments();
  
  switchView('wizard');
  navigateToStep(1);
}

async function deleteProcurementDraft(id) {
  if (!confirm("確定要永久刪除此標案設定草稿嗎？")) return;
  
  if (window.location.protocol === 'file:') {
    deleteDraftLocally(id);
    return;
  }
  
  try {
    const res = await fetch(`/api/procurements/${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchDrafts();
    } else {
      deleteDraftLocally(id);
    }
  } catch (err) {
    console.log("Delete failed, falling back to localStorage:", err);
    deleteDraftLocally(id);
  }
}

function deleteDraftLocally(id) {
  let drafts = JSON.parse(localStorage.getItem('procurements') || '[]');
  drafts = drafts.filter(d => d.id !== id);
  localStorage.setItem('procurements', JSON.stringify(drafts));
  fetchDrafts();
}

function startNewProcurement() {
  currentDraftId = null;
  
  document.getElementById('procureName').value = '';
  procureName = '';
  document.getElementById('budgetAmount').value = '';
  budgetAmount = 0;
  document.getElementById('expansionAmount').value = '';
  expansionAmount = 0;
  document.getElementById('expansionReason').value = '';
  expansionReason = '';
  document.getElementById('bidBondInput').value = '';
  bidBond = 0;
  document.getElementById('perfBondInput').value = '';
  perfBond = 0;
  
  selectedInsurances = [];
  periodType = 'days';
  document.getElementById('periodDays').value = '';
  periodDays = '';
  document.getElementById('periodDate').value = '';
  periodDate = '';
  document.getElementById('periodDateDetail').value = '';
  periodDateDetail = '';
  
  selectedCategory = 'service';
  document.querySelectorAll('.category-card').forEach(card => {
    card.classList.toggle('selected', card.getAttribute('data-category') === 'service');
  });
  
  currentStep = 1;
  document.querySelectorAll('.wizard-step').forEach(step => step.classList.remove('active'));
  document.getElementById('step1').classList.add('active');
  
  document.querySelectorAll('.step-indicator').forEach(ind => {
    ind.classList.remove('active', 'completed');
  });
  document.querySelector('.step-indicator[data-step="1"]').classList.add('active');
  
  renderTemplateBadges();
  renderInsuranceOptions();
  updateAmounts();
  runLawEngine();
  renderPreviewDocuments();
  
  switchView('wizard');
}

function exitWizard() {
  switchView('dashboard');
}

// --- Step Form Logic & Bond Calculation Helpers ---

function navigateToStep(step) {
  if (step < 1 || step > 4) return;
  
  if (step > currentStep) {
    if (currentStep === 1 && !procureName.trim()) {
      alert("請填寫案名！");
      return;
    }
    if (currentStep === 2 && !budgetAmount) {
      alert("請填寫預算金額！");
      return;
    }
  }
  
  document.querySelector(`.wizard-step[id="step${currentStep}"]`).classList.remove('active');
  document.querySelector(`.step-indicator[data-step="${currentStep}"]`).classList.remove('active');
  if (step > currentStep) {
    document.querySelector(`.step-indicator[data-step="${currentStep}"]`).classList.add('completed');
  } else {
    document.querySelector(`.step-indicator[data-step="${step}"]`).classList.remove('completed');
  }
  
  currentStep = step;
  document.querySelector(`.wizard-step[id="step${currentStep}"]`).classList.add('active');
  document.querySelector(`.step-indicator[data-step="${currentStep}"]`).classList.add('active');
  
  updateProgress();
  highlightVariableUpdates();
}

function nextStep() {
  if (currentStep < 4) {
    navigateToStep(currentStep + 1);
  } else {
    alert("已完成問卷填寫！您可以儲存至資料庫或一鍵匯出 Word 招標公文。");
  }
}

function prevStep() {
  if (currentStep > 1) {
    navigateToStep(currentStep - 1);
  }
}

function updateProgress() {
  const fill = document.getElementById('progressLine');
  const percent = ((currentStep - 1) / 3) * 90;
  fill.style.width = percent + '%';
  
  document.getElementById('btnPrev').disabled = currentStep === 1;
  document.getElementById('btnNext').innerText = currentStep === 4 ? '完成問卷' : '下一步';
}

function selectCategory(category) {
  selectedCategory = category;
  document.querySelectorAll('.category-card').forEach(card => {
    card.classList.toggle('selected', card.getAttribute('data-category') === category);
  });
  
  document.getElementById('procureName').value = '';
  procureName = '';
  
  renderTemplateBadges();
  renderInsuranceOptions();
  updateAmounts();
  runLawEngine();
  renderPreviewDocuments();
}

function renderTemplateBadges() {
  const container = document.getElementById('templateBadges');
  container.innerHTML = '';
  
  const list = CLASSIC_TEMPLATES[selectedCategory];
  list.forEach(item => {
    const badge = document.createElement('div');
    badge.className = 'template-badge';
    badge.innerText = item.name.length > 20 ? item.name.substring(0, 18) + '...' : item.name;
    badge.onclick = () => applyPresetTemplate(item);
    container.appendChild(badge);
  });
}

function applyPresetTemplate(t) {
  document.getElementById('procureName').value = t.name;
  procureName = t.name;
  
  document.getElementById('budgetAmount').value = t.budget;
  budgetAmount = t.budget;
  
  document.getElementById('expansionAmount').value = t.expansion;
  expansionAmount = t.expansion;
  
  document.getElementById('expansionReason').value = t.reason || '';
  expansionReason = t.reason || '';
  
  document.getElementById('bidBondInput').value = t.bidBond || 0;
  bidBond = t.bidBond || 0;
  
  document.getElementById('perfBondInput').value = t.perfBond || 0;
  perfBond = t.perfBond || 0;
  
  selectedInsurances = [...t.insurances];
  periodType = t.periodType;
  
  if (periodType === 'days') {
    document.getElementById('periodDays').value = t.days;
    periodDays = t.days;
    document.getElementById('periodDaysType').value = t.daysType;
    periodDaysType = t.daysType;
    document.getElementById('periodDaysTrigger').value = t.daysTrigger;
    periodDaysTrigger = t.daysTrigger;
  } else {
    document.getElementById('periodDate').value = t.date;
    periodDate = t.date;
    document.getElementById('periodDateDetail').value = t.dateDetail;
    periodDateDetail = t.dateDetail;
  }
  
  document.getElementById('tabPeriodDays').classList.toggle('active', periodType === 'days');
  document.getElementById('tabPeriodDate').classList.toggle('active', periodType === 'date');
  document.getElementById('panelPeriodDays').classList.toggle('active', periodType === 'days');
  document.getElementById('panelPeriodDate').classList.toggle('active', periodType === 'date');
  
  renderInsuranceOptions();
  updateAmounts();
  runLawEngine();
  renderPreviewDocuments();
  highlightVariableUpdates();
}

function updateProcureName(val) {
  procureName = val;
  renderPreviewDocuments();
}

function updateAmounts() {
  const budgetVal = document.getElementById('budgetAmount').value;
  const expansionVal = document.getElementById('expansionAmount').value;
  
  budgetAmount = budgetVal ? parseInt(budgetVal) : 0;
  expansionAmount = expansionVal ? parseInt(expansionVal) : 0;
  
  const total = budgetAmount + expansionAmount;
  document.getElementById('totalAmountText').innerHTML = `
    ${total.toLocaleString('zh-TW')} <span class="sum-currency">元</span>
  `;
  
  const area = document.getElementById('expansionReason');
  if (expansionAmount > 0) {
    area.disabled = false;
    if (!area.value.trim()) {
      area.value = `本案保留未來後續擴充之權利，金額以上限新臺幣 ${expansionAmount.toLocaleString('zh-TW')} 元為限。`;
      expansionReason = area.value;
    }
  } else {
    area.disabled = true;
    area.value = '';
    expansionReason = '';
  }
  
  const suggestBid = Math.floor(budgetAmount * 0.05);
  const suggestPerf = Math.floor(budgetAmount * 0.10);
  
  document.getElementById('suggestedBidBond').innerText = `NT$ ${suggestBid.toLocaleString('zh-TW')}`;
  document.getElementById('suggestedPerfBond').innerText = `NT$ ${suggestPerf.toLocaleString('zh-TW')}`;
  
  const bidInput = document.getElementById('bidBondInput');
  const perfInput = document.getElementById('perfBondInput');
  
  if (!bidInput.value) {
    bidInput.value = selectedCategory === 'service' ? 0 : suggestBid;
    bidBond = parseInt(bidInput.value);
  }
  if (!perfInput.value) {
    perfInput.value = suggestPerf;
    perfBond = suggestPerf;
  }
  
  runLawEngine();
  renderPreviewDocuments();
}

function updateExpansionReason(val) {
  expansionReason = val;
  renderPreviewDocuments();
}

function updateBonds() {
  const bidVal = document.getElementById('bidBondInput').value;
  const perfVal = document.getElementById('perfBondInput').value;
  
  bidBond = bidVal ? parseInt(bidVal) : 0;
  perfBond = perfVal ? parseInt(perfVal) : 0;
  
  runLawEngine();
  renderPreviewDocuments();
}

function renderInsuranceOptions() {
  const container = document.getElementById('insuranceOptions');
  container.innerHTML = '';
  
  const list = INSURANCE_DB[selectedCategory];
  const tipsEl = document.getElementById('insuranceTips');
  
  if (selectedCategory === 'service') {
    tipsEl.innerHTML = `<strong>勞務採購避坑重點：</strong> 建議加選『雇主意外責任險』；若是系統或技術維護，應加選『專業責任險』以對抗技術瑕疵責任。`;
  } else if (selectedCategory === 'property') {
    tipsEl.innerHTML = `<strong>財物採購避坑重點：</strong> 高單價設備安裝調試應選『安裝與內陸運輸險』；公共安全相關設備選『產品責任險』。`;
  } else if (selectedCategory === 'engineering') {
    tipsEl.innerHTML = `<strong>工程採購避坑重點：</strong> 依照工程會規定，『營造綜合保險』及『第三人意外責任險』為<strong>工程標案強制必繳險種</strong>，請勿勾選免收！`;
  }
  
  list.forEach(item => {
    const isSelected = selectedInsurances.includes(item.id);
    const card = document.createElement('div');
    card.className = `insurance-card ${isSelected ? 'selected' : ''}`;
    card.onclick = () => toggleInsurance(item.id);
    card.innerHTML = `
      <div class="checkbox-custom"></div>
      <div class="insurance-info">
        <h4>${item.title}</h4>
        <p>${item.desc}</p>
      </div>
    `;
    container.appendChild(card);
  });
}

function toggleInsurance(id) {
  if (id === 'none') {
    selectedInsurances = ['none'];
  } else {
    selectedInsurances = selectedInsurances.filter(item => item !== 'none');
    if (selectedInsurances.includes(id)) {
      selectedInsurances = selectedInsurances.filter(item => item !== id);
    } else {
      selectedInsurances.push(id);
    }
  }
  renderInsuranceOptions();
  renderPreviewDocuments();
}

function switchPeriodType(type) {
  periodType = type;
  document.getElementById('tabPeriodDays').classList.toggle('active', type === 'days');
  document.getElementById('tabPeriodDate').classList.toggle('active', type === 'date');
  document.getElementById('panelPeriodDays').classList.toggle('active', type === 'days');
  document.getElementById('panelPeriodDate').classList.toggle('active', type === 'date');
  
  runLawEngine();
  renderPreviewDocuments();
}

function updatePeriodDays() {
  const daysVal = document.getElementById('periodDays').value;
  periodDays = daysVal ? parseInt(daysVal) : '';
  periodDaysType = document.getElementById('periodDaysType').value;
  periodDaysTrigger = document.getElementById('periodDaysTrigger').value;
  
  runLawEngine();
  renderPreviewDocuments();
}

function updatePeriodDate() {
  periodDate = document.getElementById('periodDate').value;
  periodDateDetail = document.getElementById('periodDateDetail').value;
  
  renderPreviewDocuments();
}

// --- Law Diagnostic Engine ---
function runLawEngine() {
  const total = budgetAmount + expansionAmount;
  const tagEl = document.getElementById('procureTierTag');
  const listEl = document.getElementById('diagnosticList');
  listEl.innerHTML = '';
  
  let tier = '金額未定';
  if (total > 0) {
    if (total < LAW_CONSTANTS.SMALL_THRESHOLD) {
      tier = '小額採購 (未達15萬)';
    } else if (total < LAW_CONSTANTS.ANNOUNCEMENT_THRESHOLD) {
      tier = '未達公告金額 (15萬~150萬)';
    } else {
      const superLimit = LAW_CONSTANTS.SUPERVISION_THRESHOLD[selectedCategory];
      if (total < superLimit) {
        tier = '公告金額以上 (150萬~查核金額)';
      } else {
        tier = '查核金額以上';
      }
    }
  }
  tagEl.innerText = tier;
  
  function addDiag(type, title, desc, ref = '') {
    const item = document.createElement('div');
    item.className = `diag-item ${type}`;
    let icon = type === 'success' ? '✅' : (type === 'warning' ? '⚠️' : '💡');
    item.innerHTML = `
      <span class="diag-icon">${icon}</span>
      <div class="diag-text">
        <strong>${title}</strong>
        ${desc}
        ${ref ? `<span class="diag-ref">${ref}</span>` : ''}
      </div>
    `;
    listEl.appendChild(item);
  }
  
  if (total > 0) {
    addDiag('success', '範本匹配成功', `系統已鎖定最新工程會標準公文母軌條文。`);
  }
  
  if (total >= LAW_CONSTANTS.ANNOUNCEMENT_THRESHOLD && budgetAmount < LAW_CONSTANTS.ANNOUNCEMENT_THRESHOLD) {
    addDiag('warning', '分批辦理規避警告', 
      `「預算＋後拓」總額已達公告金額新臺幣 150 萬元，但預算僅編列新臺幣 ${budgetAmount.toLocaleString('zh-TW')} 元。不得意圖規避公開招標之適用範圍而分批辦理。`,
      '採購錯誤行為態樣二');
  }
  
  if (periodType === 'days' && periodDays && periodDays < 15 && total >= LAW_CONSTANTS.ANNOUNCEMENT_THRESHOLD) {
    addDiag('warning', '履約期限合理性警示',
      `公告金額以上之採購案，履約期限僅設定 ${periodDays} 日，恐屬過短，涉及不當限制競爭或違反合規審查。`,
      '採購錯誤行為態樣十');
  }
  
  if (selectedCategory === 'engineering' && selectedInsurances.includes('none')) {
    addDiag('warning', '工程保險配置警示',
      '工程採購案不宜免收保險。應投保營造綜合險與第三人意外責任險，防範工地重大工傷責任。',
      '工程會範本條款規定');
  }
  
  const maxBidBond = Math.floor(budgetAmount * 0.05);
  if (bidBond > maxBidBond && budgetAmount > 0) {
    addDiag('warning', '押標金額度過高警告',
      `本案押標金為 ${bidBond.toLocaleString('zh-TW')} 元，已超過法定預算額度 5% 上限 (${maxBidBond.toLocaleString('zh-TW')} 元)，可能構成不當限制競爭阻礙投標。`,
      '政府採購保證金收取標準');
  }
  
  const maxPerfBond = Math.floor(budgetAmount * 0.10);
  if (perfBond > maxPerfBond && budgetAmount > 0) {
    addDiag('warning', '履約保證金額度過高警告',
      `本案履約保證金為 ${perfBond.toLocaleString('zh-TW')} 元，超過法定預算 10% 上限 (${maxPerfBond.toLocaleString('zh-TW')} 元)。`,
      '政府採購保證金收取標準');
  }
  
  let matchedCirculars = 0;
  if (expansionAmount > 0) {
    addDiag('info', '後續擴充法定聲明義務', '原招標公告與招標文件均須明列後續擴充之金額上限、履約期限。', '工程企字第1090100778號函');
    matchedCirculars++;
  }
  
  if (procureName.includes('活動') || procureName.includes('論壇')) {
    addDiag('info', '活動採購特別指引', '應落實緊急醫療、保險規劃等活動安全管理措施。', '活動採購安全規範指引');
    matchedCirculars++;
  }
  
  if (listEl.innerHTML === '') {
    listEl.innerHTML = `<div class="diag-item info"><div class="diag-text">請輸入標案基本資料以啟用合規判定。</div></div>`;
  }
}

// --- Live Document & Upgraded HTML Previews ---
function switchPreviewDoc(docTab) {
  activeDocTab = docTab;
  document.getElementById('tabTendering').classList.toggle('active', docTab === 'tendering');
  document.getElementById('tabContract').classList.toggle('active', docTab === 'contract');
  document.getElementById('tabSow').classList.toggle('active', docTab === 'sow');
  
  renderPreviewDocuments();
  highlightVariableUpdates();
}

function getPeriodString() {
  if (periodType === 'days') {
    if (!periodDays) return `<span class="h-variable">[尚未設定工期]</span>`;
    const typeStr = periodDaysType === 'working' ? '工作天' : '日曆天';
    return `<span class="h-variable">${periodDaysTrigger} ${periodDays} ${typeStr}</span>`;
  } else {
    if (!periodDate) return `<span class="h-variable">[尚未設定特定截止日]</span>`;
    return `<span class="h-variable">於 ${periodDate} 前履行完畢，並辦妥驗收交貨(${periodDateDetail || '無'})</span>`;
  }
}

function getInsuranceString() {
  if (selectedInsurances.length === 0) return `<span class="h-variable">[未勾選保險]</span>`;
  if (selectedInsurances.includes('none')) return `<span class="h-variable">免收保險費</span>`;
  
  const list = INSURANCE_DB[selectedCategory]
    .filter(i => selectedInsurances.includes(i.id))
    .map(i => i.title.split(' (')[0]);
  return `<span class="h-variable">${list.join('、')}</span>`;
}

function renderPreviewDocuments() {
  const container = document.getElementById('documentBody');
  const nameDisplay = procureName ? procureName : "[案名尚未填寫]";
  const budgetFormatted = budgetAmount > 0 ? `${budgetAmount.toLocaleString('zh-TW')} 元` : "[預算尚未填寫]";
  const expansionFormatted = expansionAmount > 0 ? `${expansionAmount.toLocaleString('zh-TW')} 元` : "無";
  const totalFormatted = (budgetAmount + expansionAmount) > 0 ? `${(budgetAmount + expansionAmount).toLocaleString('zh-TW')} 元` : "[金額未定]";
  
  const periodText = getPeriodString();
  const insuranceText = getInsuranceString();
  const bidBondText = bidBond > 0 ? `${bidBond.toLocaleString('zh-TW')} 元` : '免收';
  const perfBondText = perfBond > 0 ? `${perfBond.toLocaleString('zh-TW')} 元` : '免收';
  
  let html = '';
  
  if (activeDocTab === 'tendering') {
    html = `
      <div class="doc-section active" style="font-family: 'Noto Sans TC', sans-serif; font-size: 0.8rem; line-height: 1.55;">
        <h1 class="doc-h1">【招標文件】政府採購投標須知範本</h1>
        <p class="doc-p" style="font-size: 0.72rem; color: var(--text-muted); border-bottom: 1px solid var(--glass-border); padding-bottom: 8px; margin-bottom: 12px;">
          （本文件依據行政院公共工程委員會最新修訂標準投標須知格式呈現，完整包含 85 點招標規定）
        </p>
        
        <p class="doc-p"><strong>1. 本採購適用政府採購法(以下簡稱採購法)及其主管機關所訂定之規定。</strong></p>
        <p class="doc-p"><strong>2. 本標案名稱：</strong><span class="h-variable" style="font-weight:600;">${nameDisplay}</span></p>
        <p class="doc-p"><strong>3. 採購標的為：</strong><br>
          <span style="margin-left: 20px;">${selectedCategory === 'engineering' ? '☑' : '☐'} (1) 工程。</span><br>
          <span style="margin-left: 20px;">${selectedCategory === 'property' ? '☑' : '☐'} (2) 財物。</span><br>
          <span style="margin-left: 20px;">${selectedCategory === 'service' ? '☑' : '☐'} (3) 勞務。</span>
        </p>
        <p class="doc-p"><strong>4. 本採購屬：</strong><span class="h-national" style="font-weight:600;">${document.getElementById('procureTierTag').innerText}</span></p>
        <p class="doc-p"><strong>5. 本採購預算金額：</strong>新臺幣 <span class="h-variable">${budgetFormatted}</span></p>
        <p class="doc-p"><strong>6. 本採購預計金額：</strong>新臺幣 <span class="h-variable">${budgetFormatted}</span></p>
        <p class="doc-p"><strong>7. 上級機關名稱：</strong>中華民國政府授權上級機關</p>
        <p class="doc-p"><strong>8. 補助機關名稱及地址：</strong>無（非屬採購法第4條接受補助辦理採購者）。</p>
        <p class="doc-p"><strong>9. 由法人或團體代辦採購者：</strong>無（非屬採購法第5條由法人或團體代辦採購者）。</p>
        <p class="doc-p"><strong>10. 代辦採購者洽辦機關名稱及地址：</strong>無（非屬採購法第40條代辦採購者）。</p>
        <p class="doc-p"><strong>11. 受理廠商異議之機關名稱、地址及電話：</strong>同招標機關。</p>
        <p class="doc-p"><strong>12. 受理廠商申訴或履約爭議調解之機關：</strong>採購法主管機關設立之採購申訴審議委員會或行政院公共工程委員會。</p>
        <p class="doc-p"><strong>13. 本採購為：</strong>☑ (1) 未分批辦理。</p>
        <p class="doc-p"><strong>14. 招標方式為：</strong><br>
          <span style="margin-left: 20px;">${budgetAmount >= LAW_CONSTANTS.ANNOUNCEMENT_THRESHOLD ? '☑' : '☐'} (1) 公開招標。</span><br>
          <span style="margin-left: 20px;">${budgetAmount < LAW_CONSTANTS.ANNOUNCEMENT_THRESHOLD ? '☑' : '☐'} (2) 依採購法第49條規定公開取得書面報價或企劃書。本案業經核准本次公告未能取得3家以上廠商之書面報價時，改採限制性招標方式辦理。</span>
        </p>
        <p class="doc-p"><strong>15. 共同投標：</strong>☑ (2) 不允許廠商共同投標。</p>
        <p class="doc-p"><strong>16. 統包：</strong>☑ (2) 非以統包辦理招標。</p>
        <p class="doc-p"><strong>17. 合併招標：</strong>☑ 非合併招標。</p>
        <p class="doc-p"><strong>18. 外國廠商參與：</strong>☑ (2) 不適用我國締結之條約或協定，外國廠商不可參與投標。我國廠商所供應標的之原產地須屬我國者。</p>
        <p class="doc-p"><strong>19. 大陸地區廠商參與：</strong>☑ 不允許大陸地區廠商參與。</p>
        <p class="doc-p"><strong>20. 大陸地區產品限制：</strong>☑ 廠商履約過程中具有聯網或無線傳輸能力之通訊組件，不得為大陸廠牌且原產地不得為大陸地區。</p>
        <p class="doc-p"><strong>21. 允許提出替代方案：</strong>☑ (2) 不允許提出替代方案。</p>
        <p class="doc-p"><strong>22. 投標文件有效期：</strong>自投標時起至開標後 30 日止。如機關無法於前開有效期內決標，得洽請廠商延長。</p>
        <p class="doc-p"><strong>23. 廠商應遞送投標文件份數：</strong>☑ (1) 1式1份。</p>
        <p class="doc-p"><strong>24. 投標文件使用文字：</strong>☑ (1) 中文(正體字)。</p>
        <p class="doc-p"><strong>25. 請求釋疑之期限：</strong>自公告日或邀標日起等標期之四分之一，其尾數不足1日者，以1日計。</p>
        <p class="doc-p"><strong>26. 答復廠商請求釋疑之期限：</strong>依採購法施行細則第43條第3項規定。</p>
        <p class="doc-p"><strong>27. 開標時間：</strong>民國 115 年 10 月 30 日（以招標公告為準）。</p>
        <p class="doc-p"><strong>28. 開標地點：</strong>招標機關指定之開標室。</p>
        <p class="doc-p"><strong>29. 開標採：</strong>☑ (1) 不分段開標。所有投標文件置於一標封內，不必按文件屬性分別裝封。</p>
        <p class="doc-p"><strong>30. 押標金金額：</strong>☑ ${bidBond > 0 ? `應繳納押標金新臺幣 <span class="h-variable">${bidBondText}</span>` : '免收押標金'}。</p>
        <p class="doc-p"><strong>31. 優良廠商押標金減收金額：</strong>減收原應繳額度之 50%（依押標金保證金暨其他擔保作業辦法第33條之5規定）。</p>
        <p class="doc-p"><strong>32. 全球化廠商押標金減收金額：</strong>無。</p>
        <p class="doc-p"><strong>33. 押標金有效期：</strong>與投標文件有效期相同。</p>
        <p class="doc-p"><strong>34. 押標金繳納期限：</strong>截止投標期限前繳納。</p>
        <p class="doc-p"><strong>35. 以現金繳納押標金之規定：</strong>政府電子採購網線上繳納或匯款至機關指定之金融機構帳號。</p>
        <p class="doc-p"><strong>36. 無收押標金之理由：</strong>${selectedCategory === 'service' ? '☑ (1) 勞務採購。' : '☑ (2) 未達公告金額之工程、財物採購。'}</p>
        <p class="doc-p"><strong>37. 履約保證金金額：</strong>☑ ${perfBond > 0 ? `應繳納履約保證金新臺幣 <span class="h-variable">${perfBondText}</span>` : '免收履約保證金'}。</p>
        <p class="doc-p"><strong>38. 優良廠商履約保證金減收金額：</strong>減收原應繳額度之 50%。</p>
        <p class="doc-p"><strong>39. 履約保證金有效期：</strong>自決標次日起至驗收合格且無待解決事項後發還。</p>
        <p class="doc-p"><strong>40. 履約保證金繳納期限：</strong>得標廠商應於決標次日起 14 日內繳納。</p>
        <p class="doc-p"><strong>41. 無收履約保證金之理由：</strong>無。</p>
        <p class="doc-p"><strong>42. 保固保證金金額：</strong>契約金額之 3%（無保固責任者免填）。</p>
        <p class="doc-p"><strong>43. 保固保證金有效期：</strong>自驗收合格次日起算至保固期滿且無待解決事項後發還。</p>
        <p class="doc-p"><strong>44. 保固保證金繳納期限：</strong>於驗收合格後，機關付款前繳納。</p>
        <p class="doc-p"><strong>45. 植栽工程養護期保證金：</strong>無。</p>
        <p class="doc-p"><strong>46. 各種保證金之繳納處所：</strong>同招標機關指定收款帳戶。</p>
        <p class="doc-p"><strong>47. 押標金及保證金繳納格式：</strong>應依押標金保證金暨其他擔保作業辦法規定之格式辦理。</p>
        <p class="doc-p"><strong>48. 押標金不予發還之情形：</strong>依採購法第31條第2項規定辦理。</p>
        <p class="doc-p"><strong>49. 預算保留決標聲明：</strong>無。</p>
        <p class="doc-p"><strong>50. 底價訂定：</strong>☑ (1) 訂底價。</p>
        <p class="doc-p"><strong>51. 決標原則：</strong><br>
          <span style="margin-left: 20px;">${selectedPccTemplateIndex !== null && pccTemplates[selectedPccTemplateIndex] && pccTemplates[selectedPccTemplateIndex].title.includes('最有利標') ? '☑' : '☐'} (1) 最有利標/參考最有利標精神。</span><br>
          <span style="margin-left: 20px;">${selectedPccTemplateIndex !== null && pccTemplates[selectedPccTemplateIndex] && !pccTemplates[selectedPccTemplateIndex].title.includes('最有利標') ? '☑' : '☐'} (2) 最低標決標。</span>
        </p>
        <p class="doc-p"><strong>52. 複數決標：</strong>☑ (1) 非複數決標。</p>
        <p class="doc-p"><strong>53. 決標方式為：</strong>☑ (2-1) 總價決標。</p>
        <p class="doc-p"><strong>54. 協商措施：</strong>☑ 不採行協商措施。</p>
        <p class="doc-p"><strong>55. 後續擴充擬增購之項目：</strong>${expansionAmount > 0 ? `<span class="h-variable">${expansionReason}</span>` : '無'}</p>
        <p class="doc-p"><strong>56. 採購法例外情形：</strong>☑ 無例外情形。</p>
        <p class="doc-p"><strong>57. 投標廠商之基本資格證明文件：</strong>登記合格之公司、行號或法人組織，並附具納稅及設立證明。</p>
        <p class="doc-p"><strong>58. 敏感性或國安資安限制：</strong>廠商不得為大陸地區廠商、第三地區含陸資成分廠商及在臺陸資廠商。</p>
        <p class="doc-p"><strong>59. 共同投標合作社參與：</strong>允許合作社參與投標。</p>
        <p class="doc-p"><strong>60. 特定資格條件及證明文件：</strong>無特定資格限制。</p>
        <p class="doc-p"><strong>61. 資格文件查驗：</strong>機關必要時得通知廠商限期提出正本供查驗。</p>
        <p class="doc-p"><strong>62. 不同投標廠商代表限制：</strong>不同投標廠商參與投標，不得由同一廠商之人員代表出席開標評審會議。</p>
        <p class="doc-p"><strong>63. 標價超預算判定不合格：</strong>投標標價高於公告之預算金額者，為投標文件內容不符合招標文件規定，視為無效標。</p>
        <p class="doc-p"><strong>64. 重大異常關聯判定：</strong>不同廠商投標文件內容有重大異常關聯者，依採購法第50條辦理。</p>
        <p class="doc-p"><strong>65. 刻意造成不合格標判定：</strong>開標後疑似刻意造成不合格標致影響採購公正者，依採購法第48條及第50條辦理。</p>
        <p class="doc-p"><strong>66. 營造業登記地區限制：</strong>符合毗鄰縣市土木包工業規定。</p>
        <p class="doc-p"><strong>67. 外國廠商譯本：</strong>外國廠商之投標資格文件應附經公證或認證之正體中文譯本。</p>
        <p class="doc-p"><strong>68. 標的規格功能說明：</strong>由招標機關另備如招標文件需求規格說明書（附件）。</p>
        <p class="doc-p"><strong>69. 允許提出同等品時機：</strong>☑ (2) 得標廠商得於使用同等品前，向機關提出同等品資料以供審查。</p>
        <p class="doc-p"><strong>70. 投標廠商之標價條件：</strong>☑ (1) 送達招標機關指定地點。</p>
        <p class="doc-p"><strong>71. 投標廠商標價幣別：</strong>☑ (1) 新臺幣。</p>
        <p class="doc-p"><strong>72. 採購標的之維護修理：</strong>☑ (2) 由機關自行負責或另行招標。</p>
        <p class="doc-p"><strong>73. 廠商不得參加投標或分包之限制：</strong>依採購法第38條、第39條規定辦理。</p>
        <p class="doc-p"><strong>74. 全份招標文件包括：</strong>投標投標及契約文件、投標須知、投標標價清單、投標廠商聲明書、契約條款、切結書。</p>
        <p class="doc-p"><strong>75. 投標文件密封外袋書寫規定：</strong>密封後投標，外袋須書明廠商名稱、地址、標案案號及案名。</p>
        <p class="doc-p"><strong>76. 未得標廠商著作財產權：</strong>著作財產權屬原投標廠商，機關如欲使用該等文件，應經該廠商同意。</p>
        <p class="doc-p"><strong>77. 投標截止時間：</strong>配合招標公告截止收件時間。</p>
        <p class="doc-p"><strong>78. 電子領標領標憑證檢附規定：</strong>應檢附該標案之領標電子憑據書面明細以供審查。</p>
        <p class="doc-p"><strong>79. 流廢標後領標憑據使用限制：</strong>得檢附流（廢）標前已領標之領標電子憑據書面明細投標。</p>
        <p class="doc-p"><strong>80. 本採購決標後簽約方式：</strong>☑ 以書面文件簽約。</p>
        <p class="doc-p"><strong>81. 本須知未載明之事項：</strong>依政府採購相關法令規定辦理。</p>
        <p class="doc-p"><strong>82. 原住民族、身心障礙、資源回收法等規定：</strong>依相關特別法令辦理。</p>
        <p class="doc-p"><strong>83. 受理廠商檢舉之採購稽核小組連絡方式：</strong>同招標機關及各級採購稽核小組。</p>
        <p class="doc-p"><strong>84. 法務部廉政署檢舉管道：</strong>廉政專線 0800-286-586、國史館郵局第153號信箱。</p>
        <p class="doc-p"><strong>85. 其他須知事項：</strong>無。</p>
      </div>
    `;
  } else if (activeDocTab === 'contract') {
    if (selectedPccTemplateIndex !== null && pccTemplates[selectedPccTemplateIndex]) {
      const t = pccTemplates[selectedPccTemplateIndex];
      const summaryClean = (t.summary || '本契約以採用主管機關訂定之範本為原則，以降低個案採購契約不完整之情形。').substring(0, 500).replace(/[\r\n]+/g, '<br>').replace(/\n/g, '<br>');
      const periodClean = (t.period_clause || '履約期限係指乙方完成履約標的之所需時間。').substring(0, 600).replace(/[\r\n]+/g, '<br>').replace(/\n/g, '<br>');
      const insuranceClean = (t.insurance_clause || '乙方應於履約期間辦理營造綜合保險、雇主意外責任險或專業責任險。').substring(0, 500).replace(/[\r\n]+/g, '<br>').replace(/\n/g, '<br>');
      const bondClean = (t.bond_clause || '得標廠商應於決標次日起14日內繳納履約保證金。').substring(0, 500).replace(/[\r\n]+/g, '<br>').replace(/\n/g, '<br>');
      
      html = `
        <div class="doc-section active" style="font-family: 'Noto Sans TC', sans-serif;">
          <h1 class="doc-h1">【契約條款】${t.title}草案</h1>
          <p class="doc-p" style="font-size: 0.75rem; color: var(--text-muted); border-bottom: 1px solid var(--glass-border); padding-bottom: 8px; margin-bottom: 12px;">
            （本契約條款依據已選用之工程會官方範本動態生成）
          </p>
          
          <p class="doc-p"><strong>立契約人：</strong> 委託機關（以下簡稱甲方）與得標廠商（以下簡稱乙方），雙方同意依政府採購法及招標文件規定，共同遵守本契約所有條款。</p>
          
          <p class="doc-p"><strong>第一條：契約文件與效力</strong><br>
            契約包括招標文件、投標文件、決標文件及其變更或補充。以下為本契約範本之適用說明與前言：
            <div style="font-size: 0.78rem; color: var(--text-secondary); background: rgba(6, 182, 212, 0.03); padding: 8px 12px; border-left: 3px solid var(--accent-cyan); margin: 8px 0; line-height: 1.45; border-radius: var(--radius-sm);">
              ${summaryClean}...
            </div>
          </p>
          
          <p class="doc-p"><strong>第二條：契約價金之給付</strong><br>
            本案契約上限總金額為新臺幣 <span class="h-variable">${budgetFormatted}</span>，實際給付價金依開標決標紀錄之金額核算之。
            ${expansionAmount > 0 ? `本契約保留後續擴充項目金額新臺幣 <span class="h-variable">${expansionFormatted}</span>，得依採購法規定辦理增購。` : ''}
          </p>
          
          <p class="doc-p"><strong>第三條：履約期限（第七條原文）</strong><br>
            本案履約工期設定為：${periodText}。
            <div style="font-size: 0.78rem; color: var(--text-secondary); background: rgba(6, 182, 212, 0.03); padding: 8px 12px; border-left: 3px solid var(--accent-cyan); margin: 8px 0; line-height: 1.45; border-radius: var(--radius-sm);">
              ${periodClean}...
            </div>
          </p>
          
          <p class="doc-p"><strong>第四條：廠商保證金責任</strong><br>
            得標廠商應繳納履約保證金新臺幣：<span class="h-variable">${perfBondText}</span>。
            <div style="font-size: 0.78rem; color: var(--text-secondary); background: rgba(6, 182, 212, 0.03); padding: 8px 12px; border-left: 3px solid var(--accent-cyan); margin: 8px 0; line-height: 1.45; border-radius: var(--radius-sm);">
              ${bondClean}...
            </div>
          </p>
          
          <p class="doc-p"><strong>第五條：廠商保險責任（第十條原文）</strong><br>
            廠商應自履約日起辦理投保，保險項目包含：${insuranceText}。
            <div style="font-size: 0.78rem; color: var(--text-secondary); background: rgba(6, 182, 212, 0.03); padding: 8px 12px; border-left: 3px solid var(--accent-cyan); margin: 8px 0; line-height: 1.45; border-radius: var(--radius-sm);">
              ${insuranceClean}...
            </div>
          </p>
          
          <p class="doc-p"><strong>第六條：契約價金明細表：</strong></p>
          <table class="doc-table">
            <thead>
              <tr><th>品項/服務名稱</th><th>單位</th><th>數量</th><th>預算單價</th><th>備註</th></tr>
            </thead>
            <tbody>
              <tr><td>${nameDisplay}主體項目</td><td>式</td><td>1</td><td>${budgetFormatted}</td><td>核實支付</td></tr>
              ${expansionAmount > 0 ? `<tr><td>後續擴充增購項目</td><td>式</td><td>1</td><td>${expansionFormatted}</td><td>依擴充條款辦理</td></tr>` : ''}
            </tbody>
          </table>
          
          <div style="margin-top: 30px; border-top: 1px dashed var(--glass-border); padding-top: 15px;">
            <p class="doc-p"><strong>【立契約書人簽章區】</strong></p>
            <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-secondary);">
              <div>
                <p><strong>甲方 (招標機關)</strong></p>
                <p>名稱：中華民國政府指派機關</p>
                <p>代表人：機關首長官印</p>
                <p>地址：機關登載地址</p>
              </div>
              <div>
                <p><strong>乙方 (得標廠商)</strong></p>
                <p>名稱：得標企業法人股份有限公司</p>
                <p>代表人：董事長專用印信</p>
                <p>統一編號：[得標後填入]</p>
              </div>
            </div>
          </div>
        </div>
      `;
    } else {
      html = `
        <div class="doc-section active">
          <h1 class="doc-h1">契約書草案 (標準條款合流版)</h1>
          <p class="doc-p">第一條：契約履行標的<br>廠商應依本案之規格與需求說明書辦理「<span class="h-variable">${nameDisplay}</span>」。</p>
          <p class="doc-p">第二條：履約期限<br><span class="h-agency">本案工期計算與起點約定如下：</span> ${periodText}。</p>
          <p class="doc-p">第三條：廠商保險責任<br><span class="h-national">廠商應自履約日起辦理投保，保險單須報機關備查。投保項目包含：</span> ${insuranceText}。</p>
          
          <p class="doc-p">第四條：契約價金明細表：</p>
          <table class="doc-table">
            <thead>
              <tr><th>品項/服務名稱</th><th>單位</th><th>數量</th><th>預算單價</th><th>備註</th></tr>
            </thead>
            <tbody>
              <tr><td>${nameDisplay}主體項目</td><td>式</td><td>1</td><td>${budgetFormatted}</td><td>核實支付</td></tr>
              ${expansionAmount > 0 ? `<tr><td>後續擴充增購保留項</td><td>式</td><td>1</td><td>${expansionFormatted}</td><td>依擴充條款辦理</td></tr>` : ''}
            </tbody>
          </table>
          
          <div style="margin-top: 30px; border-top: 1px dashed var(--glass-border); padding-top: 15px;">
            <p class="doc-p"><strong>【立契約書人簽章區】</strong></p>
            <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-secondary);">
              <div>
                <p><strong>甲方 (招標機關)</strong></p>
                <p>名稱：中華民國政府指派機關</p>
                <p>代表人：機關首長官印</p>
                <p>地址：機關登載地址</p>
              </div>
              <div>
                <p><strong>乙方 (得標廠商)</strong></p>
                <p>名稱：得標企業法人股份有限公司</p>
                <p>代表人：董事長專用印信</p>
                <p>統一編號：[得標後填入]</p>
              </div>
            </div>
          </div>
        </div>
      `;
    }
  } else if (activeDocTab === 'sow') {
    html = `
      <div class="doc-section active">
        <h1 class="doc-h1">需求說明書 (機關子軌技術規格限制防錯)</h1>
        <p class="doc-p">一、本專案委託辦理之名稱：<span class="h-variable">${nameDisplay}</span>。</p>
        <p class="doc-p">二、履行標的範疇：<br>廠商應遵循政府採購法第 26 條規定，所提供之硬體、材料或服務規格，均為一般通用規格，<span class="h-agency">且廠商所檢附或交貨之設備，如有指定特定廠牌型號時，應加註「或同等品」且不得限制特定產地。</span></p>
        <p class="doc-p">三、交付成果與驗收機制：<br><span class="h-agency">廠商完成履約工作後應提報書面結案審查報告，機關將於收到報告 15 日內辦理審查驗收，若因不符需求規格而退件，廠商應於機關通知之期限內改善完畢。</span></p>
        
        ${selectedPccTemplateIndex !== null && pccTemplates[selectedPccTemplateIndex] && pccTemplates[selectedPccTemplateIndex].summary ? `
        <div style="margin-top: 15px; border-left: 3px solid var(--accent-emerald); padding-left: 10px; background: rgba(16, 185, 129, 0.02); padding: 8px 12px; border-radius: var(--radius-sm);">
          <p class="doc-p" style="color: var(--accent-emerald); font-weight:bold; font-size:0.8rem; margin-bottom:5px;">📋 【工程會 ${pccTemplates[selectedPccTemplateIndex].title} 前言與規格綱要】</p>
          <p class="doc-p" style="font-size: 0.72rem; color: var(--text-secondary); line-height: 1.45; margin-bottom:0;">
            ${pccTemplates[selectedPccTemplateIndex].summary.substring(0, 600).replace(/\r\n/g, '<br>').replace(/\n/g, '<br>')}...
          </p>
        </div>
        ` : ''}
      </div>
    `;
  }
  
  container.innerHTML = html;
  
  document.getElementById('badgeTendering').innerText = procureName ? '5' : '4';
  document.getElementById('badgeContract').innerText = selectedInsurances.length > 0 ? '6' : '5';
  document.getElementById('badgeSow').innerText = '3';
}

function highlightVariableUpdates() {
  const vars = document.querySelectorAll('.h-variable');
  vars.forEach(v => {
    v.style.animation = 'none';
    v.offsetHeight;
    v.style.animation = null;
  });
}

// --- Word Document Exporter ---
function exportDocuments() {
  if (!procureName.trim()) {
    alert("請先完成第一步，輸入標案名稱！");
    return;
  }
  
  const buildHtmlDoc = (title, bodyHtml) => {
    return `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>${title}</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          body { font-family: "Noto Sans TC", "Microsoft JhengHei", Arial, sans-serif; line-height: 1.6; padding: 40px; }
          h1 { font-size: 20pt; font-weight: bold; text-align: center; margin-bottom: 25px; color: #1e3a8a; }
          h2 { font-size: 14pt; font-weight: bold; border-bottom: 1.5pt solid #3b82f6; padding-bottom: 5px; margin-top: 20px; color: #2563eb; }
          p { font-size: 11.5pt; text-align: justify; margin-bottom: 12px; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th, td { border: 0.75pt solid #cbd5e1; padding: 10px; font-size: 10.5pt; }
          th { background-color: #f1f5f9; font-weight: bold; text-align: center; }
          .highlight-var { font-weight: bold; background-color: #ecfdf5; color: #065f46; padding: 1px 4px; }
          .highlight-nat { background-color: #eff6ff; border-left: 3pt solid #3b82f6; padding-left: 8px; }
          .highlight-age { background-color: #fffbeb; border-left: 3pt solid #f59e0b; padding-left: 8px; }
        </style>
      </head>
      <body>
        ${bodyHtml}
      </body>
      </html>
    `;
  };

  const bidBondText = bidBond > 0 ? `${bidBond.toLocaleString('zh-TW')}元` : '免收';
  const perfBondText = perfBond > 0 ? `${perfBond.toLocaleString('zh-TW')}元` : '免收';
  const budgetFormatted = budgetAmount > 0 ? `${budgetAmount.toLocaleString('zh-TW')}元` : '[預算尚未填寫]';
  const expansionFormatted = expansionAmount > 0 ? `${expansionAmount.toLocaleString('zh-TW')}元` : '無';

  const tenderingBody = `
    <h1>【招標文件】政府採購投標須知範本</h1>
    <p style="font-size: 9.5pt; text-align: center; color: #475569;">（依據公共工程委員會最新修訂標準投標須知格式呈現）</p>
    
    <p><strong>一、本採購適用政府採購法(以下簡稱採購法)及其主管機關所訂定之規定。</strong></p>
    
    <p><strong>二、本標案名稱：</strong><span class="highlight-var">${procureName}</span></p>
    
    <p><strong>三、採購標的為：</strong><br>
      <span style="margin-left: 20px;">${selectedCategory === 'engineering' ? '☑' : '☐'} (1) 工程。</span><br>
      <span style="margin-left: 20px;">${selectedCategory === 'property' ? '☑' : '☐'} (2) 財物。</span><br>
      <span style="margin-left: 20px;">${selectedCategory === 'service' ? '☑' : '☐'} (3) 勞務。</span>
    </p>
    
    <p><strong>四、本採購屬：</strong><span class="highlight-var">${document.getElementById('procureTierTag').innerText}</span></p>
    
    <p><strong>五、本採購預算金額：</strong>新臺幣 <span class="highlight-var">${budgetFormatted}</span></p>
    
    ${expansionAmount > 0 ? `
    <p><strong>六、後續擴充約定：</strong>本採購保留未來向得標廠商增購之權利，後續擴充金額上限為新臺幣 <span class="highlight-var">${expansionFormatted}</span>。</p>
    ` : ''}
    
    <p><strong>七、招標方式為：</strong><br>
      <span style="margin-left: 20px;">${budgetAmount >= LAW_CONSTANTS.ANNOUNCEMENT_THRESHOLD ? '☑' : '☐'} (1) 公開招標。</span><br>
      <span style="margin-left: 20px;">${budgetAmount < LAW_CONSTANTS.ANNOUNCEMENT_THRESHOLD ? '☑' : '☐'} (2) 依採購法第49條規定公開取得書面報價或企劃書。本案業經核准本次公告未能取得3家以上廠商之書面報價時，改採限制性招標方式辦理。</span>
    </p>
    
    <p><strong>八、共同投標：</strong><br>
      <span style="margin-left: 20px;">☑ 不允許廠商共同投標。</span>
    </p>
    
    <p><strong>九、投標文件使用文字：</strong><br>
      <span style="margin-left: 20px;">☑ 中文(正體字)。</span>
    </p>
    
    <p><strong>十、押標金金額：</strong><br>
      <span style="margin-left: 20px;">☑ ${bidBond > 0 ? `應繳納押標金新臺幣 <span class="highlight-var">${bidBondText}</span>` : '免收押標金'}。</span>
    </p>
    
    <p><strong>十一、履約保證金金額：</strong><br>
      <span style="margin-left: 20px;">☑ ${perfBond > 0 ? `應繳納履約保證金新臺幣 <span class="highlight-var">${perfBondText}</span>` : '免收履約保證金'}。</span>
    </p>
    
    <p><strong>十二、投標文件有效期：</strong>自投標時起至開標後 30 日止。</p>
    <p><strong>十三、受理廠商異議之機關：</strong>同招標機關。</p>
  `;

  let contractBody = '';
  if (selectedPccTemplateIndex !== null && pccTemplates[selectedPccTemplateIndex]) {
    const t = pccTemplates[selectedPccTemplateIndex];
    const summaryClean = (t.summary || '本契約以採用主管機關訂定之範本為原則，以降低個案採購契約不完整之情形。').replace(/[\r\n]+/g, '<br>').replace(/\n/g, '<br>');
    const periodClean = (t.period_clause || '履約期限係指乙方完成履約標的之所需時間。').replace(/[\r\n]+/g, '<br>').replace(/\n/g, '<br>');
    const insuranceClean = (t.insurance_clause || '乙方應於履約期間辦理營造綜合保險、雇主意外責任險或專業責任險。').replace(/[\r\n]+/g, '<br>').replace(/\n/g, '<br>');
    const bondClean = (t.bond_clause || '得標廠商應於決標次日起14日內繳納履約保證金。').replace(/[\r\n]+/g, '<br>').replace(/\n/g, '<br>');
    
    contractBody = `
      <h1>【契約條款】${t.title}草案</h1>
      <p style="font-size: 9.5pt; text-align: center; color: #475569;">（本契約條款依據已選用之工程會官方範本動態生成）</p>
      
      <p><strong>立契約人：</strong> 委託機關（以下簡稱甲方）與得標廠商（以下簡稱乙方），雙方同意依政府採購法及招標文件規定，共同遵守本契約所有條款。</p>
      
      <h2>第一條：契約文件與效力</h2>
      <p>契約包括招標文件、投標文件、決標文件及其變更或補充。以下為本契約範本之適用說明與前言：</p>
      <p style="font-size: 10pt; color: #475569; background-color: #f8fafc; padding: 10px; border-left: 3px solid #0284c7;">
        ${summaryClean}
      </p>
      
      <h2>第二條：契約價金之給付</h2>
      <p>本案契約上限總金額為新臺幣 <span class="highlight-var">${budgetFormatted}</span>，實際給付價金依開標決標紀錄之金額核算之。
      ${expansionAmount > 0 ? `本採購案保留後續擴充項目金額新臺幣 <span class="highlight-var">${expansionFormatted}</span>，得依採購法規定辦理增購。` : ''}</p>
      
      <h2>第三條：契約履約期限</h2>
      <p>本案履約工期設定為：<span class="highlight-var">${periodText}</span>。</p>
      <p style="font-size: 10pt; color: #475569; background-color: #f8fafc; padding: 10px; border-left: 3px solid #0284c7;">
        <strong>【工程會契約範本第七條原文參考】</strong><br>
        ${periodClean}
      </p>
      
      <h2>第四條：廠商保證金責任</h2>
      <p>得標廠商應繳納履約保證金新臺幣：<span class="highlight-var">${perfBondText}</span>。</p>
      <p style="font-size: 10pt; color: #475569; background-color: #f8fafc; padding: 10px; border-left: 3px solid #0284c7;">
        <strong>【工程會契約範本保證金條款原文參考】</strong><br>
        ${bondClean}
      </p>
      
      <h2>第五條：廠商保險責任</h2>
      <p>廠商應自履約日起辦理投保，保險項目包含：<span class="highlight-var">${insuranceDetails || '免收保險'}</span>。</p>
      <p style="font-size: 10pt; color: #475569; background-color: #f8fafc; padding: 10px; border-left: 3px solid #0284c7;">
        <strong>【工程會契約範本第十條原文參考】</strong><br>
        ${insuranceClean}
      </p>
      
      <h2>第六條：契約價金明細表</h2>
      <table>
        <thead>
          <tr><th>品項/項目名稱</th><th>單位</th><th>數量</th><th>預算單價 (元)</th><th>備註</th></tr>
        </thead>
        <tbody>
          <tr><td>${procureName} 主體履約標的</td><td>式</td><td>1</td><td>${budgetAmount.toLocaleString('zh-TW')}</td><td>核實支付</td></tr>
          ${expansionAmount > 0 ? `<tr><td>後續擴充項目保留款</td><td>式</td><td>1</td><td>${expansionAmount.toLocaleString('zh-TW')}</td><td>依後拓約定辦理</td></tr>` : ''}
        </tbody>
      </table>
      
      <h2>第七條：合約立書簽署人</h2>
      <p>本契約正本二份，甲乙雙方各執一份；副本四份，由雙方分送相關單位存查。</p>
      <div style="margin-top: 30px;">
        <table style="border:none;">
          <tr style="border:none;">
            <td style="border:none; width: 50%;">
              <strong>甲方 (招標機關)</strong><br>
              名稱：中華民國政府授權採購機關<br>
              代表人：首長印信專區<br>
              地址：台北市中正區行政大樓
            </td>
            <td style="border:none; width: 50%;">
              <strong>乙方 (得標廠商)</strong><br>
              名稱：得標廠商企業股份有限公司<br>
              代表人：負責人與公司大小章專區<br>
              地址：[得標後確實填寫]
            </td>
          </tr>
        </table>
      </div>
    `;
  } else {
    contractBody = `
      <h1>${procureName} - 契約條款書</h1>
      <p>機關（以下簡稱甲方）與得標廠商（以下簡稱乙方），雙方同意就「${procureName}」之履約管理約定如下條款：</p>
      
      <h2>第一條：履約內容與標的</h2>
      <p>乙方應依本案招標規格書，確實辦理並履行本採購合約。</p>
      
      <h2>第二條：契約價金給付上限</h2>
      <p class="highlight-nat">本案契約上限總金額為新臺幣 <span class="highlight-var">${budgetAmount.toLocaleString('zh-TW')}元整</span>，實際給付價金依開標決標紀錄之金額核算之。</p>
      
      <h2>第三條：契約履約期限</h2>
      <p class="highlight-age">履約工期：乙方應於 <span class="highlight-var">${periodText}</span> 內完成履約義務。</p>
      
      <h2>第四條：保險項目約定</h2>
      <p class="highlight-nat">乙方應於開工日起辦理投保，保險單及繳費收據影本應於14日內送交甲方備查。投保險種為：<span class="highlight-var">${insuranceDetails || '免收保險'}</span>。</p>
      
      <h2>第五條：契約價金明細表</h2>
      <table>
        <thead>
          <tr><th>品項/項目名稱</th><th>單位</th><th>數量</th><th>預算單價 (元)</th><th>備註</th></tr>
        </thead>
        <tbody>
          <tr><td>${procureName} 主體履約標的</td><td>式</td><td>1</td><td>${budgetAmount.toLocaleString('zh-TW')}</td><td>核實支付</td></tr>
          ${expansionAmount > 0 ? `<tr><td>後續擴充項目保留款</td><td>式</td><td>1</td><td>${expansionAmount.toLocaleString('zh-TW')}</td><td>依後拓約定辦理</td></tr>` : ''}
        </tbody>
      </table>
      
      <h2>第六條：合約立書簽署人</h2>
      <p>本契約正本二份，甲乙雙方各執一份；副本四份，由雙方分送相關單位存查。</p>
      <div style="margin-top: 30px;">
        <table style="border:none;">
          <tr style="border:none;">
            <td style="border:none; width: 50%;">
              <strong>甲方 (招標機關)</strong><br>
              名稱：中華民國政府授權採購機關<br>
              代表人：首長印信專區<br>
              地址：台北市中正區行政大樓
            </td>
            <td style="border:none; width: 50%;">
              <strong>乙方 (得標廠商)</strong><br>
              名稱：得標廠商企業股份有限公司<br>
              代表人：負責人與公司大小章專區<br>
              地址：[得標後確實填寫]
            </td>
          </tr>
        </table>
      </div>
    `;
  }

  downloadDocFile(`${procureName}_投標須知.doc`, buildHtmlDoc("投標須知", tenderingBody));
  setTimeout(() => {
    downloadDocFile(`${procureName}_契約書草案.doc`, buildHtmlDoc("契約書草案", contractBody));
  }, 300);
}

async function quickExportDraft(id) {
  if (window.location.protocol === 'file:') {
    const drafts = JSON.parse(localStorage.getItem('procurements') || '[]');
    const draft = drafts.find(d => d.id === id);
    if (draft) {
      exportDraftData(draft);
    }
    return;
  }
  
  try {
    const res = await fetch(`/api/procurements/${id}`);
    if (res.ok) {
      const draft = await res.json();
      exportDraftData(draft);
    }
  } catch (err) {
    console.log("Quick export failed, trying local storage:", err);
    const drafts = JSON.parse(localStorage.getItem('procurements') || '[]');
    const draft = drafts.find(d => d.id === id);
    if (draft) {
      exportDraftData(draft);
    }
  }
}

function exportDraftData(draft) {
  selectedCategory = draft.category;
  procureName = draft.name;
  budgetAmount = draft.budget;
  expansionAmount = draft.expansion;
  expansionReason = draft.expansionReason || '';
  bidBond = draft.bidBond || 0;
  perfBond = draft.perfBond || 0;
  selectedInsurances = draft.insurances || [];
  periodType = draft.periodType;
  periodDays = draft.periodDays;
  periodDaysType = draft.periodDaysType;
  periodDaysTrigger = draft.periodDaysTrigger;
  periodDate = draft.periodDate;
  periodDateDetail = draft.periodDateDetail;
  
  exportDocuments();
}

function downloadDocFile(filename, content) {
  const blob = new Blob(['\ufeff' + content], {
    type: 'application/msword;charset=utf-8'
  });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
