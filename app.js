// Smart Procurement Generator Core Engine (app.js)
// Conforming to 2026 Government Procurement Law Standards (Taiwan)

// --- State Variables ---
let currentStep = 1;
let selectedCategory = 'service'; // 'service', 'property', 'engineering'
let procureName = '';
let budgetAmount = 0;
let expansionAmount = 0;
let expansionReason = '';
let selectedInsurances = [];
let periodType = 'days'; // 'days', 'date'
let periodDays = '';
let periodDaysType = 'working'; // 'working', 'calendar'
let periodDaysTrigger = '決標次日起';
let periodDate = '';
let periodDateDetail = '';
let activeDocTab = 'tendering'; // 'tendering', 'contract', 'sow'

// --- 2026 Procurement Law Constants ---
const LAW_CONSTANTS = {
  ANNOUNCEMENT_THRESHOLD: 1500000, // 公告金額 150萬 (Taiwan 2026 standard)
  SUPERVISION_THRESHOLD: {
    engineering: 50000000, // 5000萬
    property: 50000000,    // 5000萬
    service: 40000000      // 4000萬
  },
  SMALL_THRESHOLD: 150000 // 小額採購 15萬
};

// --- Presets / Templates Database ---
const CLASSIC_TEMPLATES = {
  service: [
    {
      name: "115年度機關大樓資訊系統維護與資安防護委外服務案",
      budget: 1800000,
      expansion: 600000,
      reason: "本案保留未來向得標廠商增購60萬元維護額度之權利，得以限制性招標辦理後續擴充，擴充期限為1年。",
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
      insurances: ["car", "thirdparty"],
      periodType: "date",
      date: "2026-12-15",
      dateDetail: "前全面竣工並提報機關辦理初驗。"
    }
  ]
};

// --- Insurance Info Database ---
const INSURANCE_DB = {
  service: [
    { id: "professional", title: "專業責任保險 (Professional Liability)", desc: "適合軟體維護、設計規劃、法律/財務/系統整合等專業服務，防範技術疏失責任。" },
    { id: "public", title: "公共意外責任險 (Public Liability)", desc: "適合辦理大型活動、實體場域維運等，因管理疏失導致第三人身體傷亡或財損。" },
    { id: "employer", title: "雇主意外責任險 (Employer's Liability)", desc: "保障廠商員工於執行合約勞務期間發生事故時，依法應由雇主承擔之賠償。" },
    { id: "none", title: "免收保險費 (No Insurance Required)", desc: "勞務性質單純或金額較小，經評估免徵保險，降低招標門檻。" }
  ],
  property: [
    { id: "product", title: "產品責任保險 (Product Liability)", desc: "適合精密儀器、車輛、電器等，防範因設備瑕疵致使用人受傷之法律賠償。" },
    { id: "cargo", title: "安裝與內陸運輸險 (Cargo/Installation Insurance)", desc: "防範高單價設備於運送、安裝調試期間之毀損、滅失風險。" },
    { id: "none", title: "免收保險費 (No Insurance Required)", desc: "純屬一般文具或常見耗材買受，免收保險費。" }
  ],
  engineering: [
    { id: "car", title: "營造綜合保險 (Contractor's All Risks)", desc: "工程招標必備，涵蓋工程本身毀損及營造期間可能之天災、意外事故損失。" },
    { id: "thirdparty", title: "營造第三人意外責任險 (CAR Third Party)", desc: "承擔施工作業期間，因疏失造成工地周邊鄰人身體、財產受損之賠償責任。" },
    { id: "employer", title: "雇主意外責任險 (Employer's Liability)", desc: "防範工地工人遭遇重大工傷事故時之雇主職災補償與賠償責任。" }
  ]
};

// --- Initial Setup ---
window.onload = function() {
  renderTemplateBadges();
  renderInsuranceOptions();
  updateProgress();
  runLawEngine();
  renderPreviewDocuments();
};

// --- Step Navigation & Progress Indicator ---
function navigateToStep(step) {
  if (step < 1 || step > 4) return;
  
  // Quick validation before moving forward
  if (step > currentStep) {
    if (currentStep === 1 && !procureName.trim()) {
      alert("請先輸入『採購案名』以繼續下一步！");
      return;
    }
    if (currentStep === 2 && !budgetAmount) {
      alert("請輸入『本案預算金額』！");
      return;
    }
    if (currentStep === 2 && expansionAmount > 0 && !expansionReason.trim()) {
      alert("本案有規劃後續擴充金額，請填寫『後續擴充期間與內容簡述』！");
      return;
    }
    if (currentStep === 4) {
      if (periodType === 'days' && !periodDays) {
        alert("請輸入『履約期限天數』！");
        return;
      }
      if (periodType === 'date' && !periodDate) {
        alert("請選擇『特定截止履約日期』！");
        return;
      }
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
  
  // Scroll preview document to show changes instantly
  highlightVariableUpdates();
}

function nextStep() {
  if (currentStep < 4) {
    navigateToStep(currentStep + 1);
  } else {
    // Last step, show summary or prompt export
    alert("恭喜您完成引導問卷設定！請確認右側招標文件連動無誤，並點擊下方「一鍵打包招標公文」進行下載。");
  }
}

function prevStep() {
  if (currentStep > 1) {
    navigateToStep(currentStep - 1);
  }
}

function updateProgress() {
  const progressLine = document.getElementById('progressLine');
  const percent = ((currentStep - 1) / 3) * 90; // Adjust line length
  progressLine.style.width = `${percent}%`;

  // Update button states
  const btnPrev = document.getElementById('btnPrev');
  const btnNext = document.getElementById('btnNext');
  
  btnPrev.disabled = currentStep === 1;
  
  if (currentStep === 4) {
    btnNext.innerHTML = `完成設定 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  } else {
    btnNext.innerHTML = `下一步 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>`;
  }
}

// --- Step 1: Category & Name ---
function selectCategory(category) {
  selectedCategory = category;
  document.querySelectorAll('.category-card').forEach(card => {
    card.classList.remove('selected');
  });
  document.querySelector(`.category-card[data-category="${category}"]`).classList.add('selected');
  
  // Clear name and templates to match new category
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
    badge.innerText = item.name.length > 22 ? item.name.substring(0, 20) + "..." : item.name;
    badge.title = item.name;
    badge.onclick = () => applyPresetTemplate(item);
    container.appendChild(badge);
  });
}

function applyPresetTemplate(template) {
  // Apply case name
  document.getElementById('procureName').value = template.name;
  procureName = template.name;
  
  // Apply amounts
  document.getElementById('budgetAmount').value = template.budget;
  document.getElementById('expansionAmount').value = template.expansion;
  budgetAmount = template.budget;
  expansionAmount = template.expansion;
  
  const expansionReasonEl = document.getElementById('expansionReason');
  if (expansionAmount > 0) {
    expansionReasonEl.disabled = false;
    expansionReasonEl.value = template.reason;
    expansionReason = template.reason;
  } else {
    expansionReasonEl.disabled = true;
    expansionReasonEl.value = '';
    expansionReason = '';
  }

  // Apply insurance
  selectedInsurances = [...template.insurances];
  renderInsuranceOptions(); // re-render to mark checkboxes

  // Apply fulfillment period
  periodType = template.periodType;
  if (periodType === 'days') {
    document.getElementById('tabPeriodDays').classList.add('active');
    document.getElementById('tabPeriodDate').classList.remove('active');
    document.getElementById('panelPeriodDays').classList.add('active');
    document.getElementById('panelPeriodDate').classList.remove('active');
    
    document.getElementById('periodDays').value = template.days;
    document.getElementById('periodDaysType').value = template.daysType;
    document.getElementById('periodDaysTrigger').value = template.daysTrigger;
    
    periodDays = template.days;
    periodDaysType = template.daysType;
    periodDaysTrigger = template.daysTrigger;
  } else {
    document.getElementById('tabPeriodDays').classList.remove('active');
    document.getElementById('tabPeriodDate').classList.add('active');
    document.getElementById('panelPeriodDays').classList.remove('active');
    document.getElementById('panelPeriodDate').classList.add('active');
    
    document.getElementById('periodDate').value = template.date;
    document.getElementById('periodDateDetail').value = template.dateDetail;
    
    periodDate = template.date;
    periodDateDetail = template.dateDetail;
  }

  // Update calculations and diagnostic results
  updateAmounts();
  runLawEngine();
  renderPreviewDocuments();
  
  // Highlight changes
  highlightVariableUpdates();
}

function updateProcureName(val) {
  procureName = val;
  renderPreviewDocuments();
}

// --- Step 2: Amounts ---
function updateAmounts() {
  const budgetInput = document.getElementById('budgetAmount').value;
  const expansionInput = document.getElementById('expansionAmount').value;
  
  budgetAmount = budgetInput ? parseInt(budgetInput) : 0;
  expansionAmount = expansionInput ? parseInt(expansionInput) : 0;
  
  const totalAmount = budgetAmount + expansionAmount;
  
  // Format total amount with commas
  document.getElementById('totalAmountText').innerHTML = `
    ${totalAmount.toLocaleString('zh-TW')} <span class="sum-currency">元</span>
  `;
  
  // Handle Expansion Text Area Enable/Disable
  const expansionReasonEl = document.getElementById('expansionReason');
  if (expansionAmount > 0) {
    expansionReasonEl.disabled = false;
    if (!expansionReasonEl.value.trim()) {
      expansionReasonEl.value = `本案保留未來向得標廠商增購擴充額度之權利，後續擴充金額以新臺幣 ${expansionAmount.toLocaleString('zh-TW')} 元為上限。`;
      expansionReason = expansionReasonEl.value;
    }
  } else {
    expansionReasonEl.disabled = true;
    expansionReasonEl.value = '';
    expansionReason = '';
  }
  
  runLawEngine();
  renderPreviewDocuments();
}

function updateExpansionReason(val) {
  expansionReason = val;
  renderPreviewDocuments();
}

// --- Step 3: Insurance ---
function renderInsuranceOptions() {
  const container = document.getElementById('insuranceOptions');
  container.innerHTML = '';
  
  const list = INSURANCE_DB[selectedCategory];
  const tipsEl = document.getElementById('insuranceTips');
  
  // Set default senior tips depending on Category
  if (selectedCategory === 'service') {
    tipsEl.innerHTML = `<strong>勞務採購避坑重點：</strong> 承辦人最常忽略廠商員工職災風險。建議一定要加選『雇主意外責任險』。若是技術或設計諮詢案，建議要求『專業責任險』以對抗圖面或系統瑕疵責任。若純為清潔等勞動，若預算吃緊，可加開免保險條款，但需留心意外自負額。`;
  } else if (selectedCategory === 'property') {
    tipsEl.innerHTML = `<strong>財物採購避坑重點：</strong> 貴重儀器買受務必勾選『安裝與內陸運輸險』，以免廠商在運送或現場組裝時撞壞，責任歸屬不清。若為供一般民眾或機關員工使用之硬體，『產品責任險』是重要安全屏障。`;
  } else if (selectedCategory === 'engineering') {
    tipsEl.innerHTML = `<strong>工程採購避坑重點：</strong> 工程採購具高度實體危險性，『營造綜合保險』及『第三人意外責任險』為<strong>工程會強制必備險種</strong>！請勿勾選免收。第三人意外責任險之單一事故傷亡理賠額度，查核金額以上工程建議不得低於新臺幣 500 萬元。`;
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
    // Remove 'none' if selecting any actual insurance
    selectedInsurances = selectedInsurances.filter(item => item !== 'none');
    if (selectedInsurances.includes(id)) {
      selectedInsurances = selectedInsurances.filter(item => item !== id);
    } else {
      selectedInsurances.push(id);
    }
  }
  
  renderInsuranceOptions();
  renderPreviewDocuments();
  highlightVariableUpdates();
}

// --- Step 4: Fulfillment Period ---
function switchPeriodType(type) {
  periodType = type;
  document.getElementById('tabPeriodDays').classList.toggle('active', type === 'days');
  document.getElementById('tabPeriodDate').classList.toggle('active', type === 'date');
  document.getElementById('panelPeriodDays').classList.toggle('active', type === 'days');
  document.getElementById('panelPeriodDate').classList.toggle('active', type === 'date');
  
  runLawEngine();
  renderPreviewDocuments();
  highlightVariableUpdates();
}

function updatePeriodDays() {
  const daysInput = document.getElementById('periodDays').value;
  periodDays = daysInput ? parseInt(daysInput) : '';
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

// --- Central Logic Engine (Core Law Engine) ---
function runLawEngine() {
  const totalAmount = budgetAmount + expansionAmount;
  const tagEl = document.getElementById('procureTierTag');
  const listEl = document.getElementById('diagnosticList');
  
  listEl.innerHTML = '';
  
  // 1. Determine level hierarchy
  let tier = '未定';
  let tierClass = 'default-tier';
  
  if (totalAmount === 0) {
    tier = '金額未定';
  } else if (totalAmount < LAW_CONSTANTS.SMALL_THRESHOLD) {
    tier = '小額採購 (未達15萬)';
  } else if (totalAmount < LAW_CONSTANTS.ANNOUNCEMENT_THRESHOLD) {
    tier = '未達公告金額 (15萬~150萬)';
  } else {
    // Public procurement supervision thresholds are type-specific
    const superLimit = LAW_CONSTANTS.SUPERVISION_THRESHOLD[selectedCategory];
    if (totalAmount < superLimit) {
      tier = '公告金額以上 (150萬以上)';
    } else {
      tier = '查核金額以上 (5000萬/4000萬以上)';
    }
  }
  
  tagEl.innerText = tier;
  tagEl.className = 'procure-tier-tag active-tier';

  // Helper to add diagnostic alerts
  function addDiag(type, title, desc, ref = '') {
    const item = document.createElement('div');
    item.className = `diag-item ${type}`;
    
    let icon = '💡';
    if (type === 'success') icon = '✅';
    if (type === 'warning') icon = '⚠️';
    if (type === 'info') icon = '🔔';
    
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

  // --- Rule Guard 1: Auto template assignment notification ---
  if (totalAmount > 0) {
    let templateName = '';
    if (totalAmount < LAW_CONSTANTS.ANNOUNCEMENT_THRESHOLD) {
      templateName = "工程會招標投標契約三合一範本 (未達公告金額)";
    } else {
      const typeChinese = selectedCategory === 'service' ? '勞務' : (selectedCategory === 'property' ? '財物' : '工程');
      templateName = `行政院公共工程委員會 - ${typeChinese}採購契約最新標準範本 (公告金額以上適用)`;
    }
    addDiag('success', '法規範本匹配成功', `已鎖定並載入最新：${templateName}`, '工程會標準母軌核定');
  }

  // --- Rule Guard 2: Splitting procurement evasion (錯誤態樣二) ---
  if (totalAmount >= LAW_CONSTANTS.ANNOUNCEMENT_THRESHOLD && budgetAmount < LAW_CONSTANTS.ANNOUNCEMENT_THRESHOLD) {
    addDiag('warning', '分批辦理與規避法規警示', 
      `本案「預算＋後續擴充」之總採購金額達新臺幣 150 萬元，已達「公告金額」級距，但本案預算僅編列新臺幣 ${budgetAmount.toLocaleString('zh-TW')} 元。依法不得意圖規避公告金額以上程序而分批辦理招標。`, 
      '政府採購錯誤行為態樣二：意圖規避本法適用範圍之分批辦理');
  }

  // --- Rule Guard 3: Insufficient Fulfillment Period (錯誤態樣十) ---
  if (periodType === 'days' && periodDays !== '') {
    // If it's a large amount but duration is extremely short (e.g. > 150万 but < 15 days)
    if (totalAmount >= LAW_CONSTANTS.ANNOUNCEMENT_THRESHOLD && periodDays < 15) {
      addDiag('warning', '履約期限合理性診斷異常', 
        `本標案總採購金額達新臺幣 ${totalAmount.toLocaleString('zh-TW')} 元，屬公告金額以上，但履約期限僅設定 ${periodDays} 天。履約期過短可能限制競爭或致使廠商延履約受罰。`, 
        '政府採購錯誤行為態樣十：履約期間不合理，涉限制競爭');
    } else {
      addDiag('success', '履約期限合理性判定', `履約天數 ${periodDays} 天與總採購金額比例符合招標時程常理。`);
    }
  }

  // --- Rule Guard 4: Insurance compliance matching Category ---
  if (selectedCategory === 'engineering' && selectedInsurances.includes('none')) {
    addDiag('warning', '營造工程保險警示', 
      '依政府採購法工程契約範本規定，工程採購原則上應投保營造綜合保險，不應免徵保險，否則機關需自行承擔工地重大災損風險。', 
      '工程會工程契約範本第十二條');
  }

  // --- Rule Guard 5: Semantic Matches / Explanatory Circulars (解釋函) ---
  let hasCircular = false;
  if (expansionAmount > 0) {
    addDiag('info', '後續擴充規定匹配', 
      '招標文件應明列後續擴充之期間、金額或數量上限，若未於原招標公告載明，後續擴充將無法採用限制性招標程序。', 
      '行政院公共工程委員會工程企字第1090100778號函');
    hasCircular = true;
  }
  
  if (procureName.includes('活動') || procureName.includes('論壇')) {
    addDiag('info', '大型活動安全防護要點', 
      '辦理大型活動採購案，需督促得標廠商落實緊急醫療、人身財產保險及場域公共意外保險，其投保額度建議比照地方自治條例之高標準。', 
      '工程會活動採購安全規範指引');
    hasCircular = true;
  }

  if (procureName.includes('系統') || procureName.includes('維護') || procureName.includes('資訊')) {
    addDiag('info', '資訊採購資安強化規定', 
      '本案涉及系統或資安維護，招標契約中應明定廠商資安防護責任、防範機密外洩條款與委外廠商資安健檢要求。', 
      '行政院資通安全管理法暨工程會資訊服務契約範本特別條款');
    hasCircular = true;
  }

  if (!hasCircular && totalAmount > 0) {
    addDiag('info', '政府採購誠信與保密規定', 
      '招標文件編訂時，承辦人及評選委員應遵守政府採購法利益衝突迴避原則，並簽署保密切結書。', 
      '政府採購法第十五條');
  }

  if (listEl.innerHTML === '') {
    listEl.innerHTML = `
      <div class="diag-item info">
        <span class="diag-icon">💡</span>
        <div class="diag-text">
          <strong>系統就緒</strong>
          請於左側輸入採購案名、金額與履約天數，右側將即時為您進行合規性診斷。
        </div>
      </div>
    `;
  }
}

// --- Live Document Formatting & Synchronizer ---
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
    if (!periodDays) return `<span class="h-variable">[尚未設定履約天數]</span>`;
    const typeStr = periodDaysType === 'working' ? '工作天' : '日曆天';
    return `<span class="h-variable">${periodDaysTrigger} ${periodDays} ${typeStr}</span>`;
  } else {
    if (!periodDate) return `<span class="h-variable">[尚未設定截止日期]</span>`;
    return `<span class="h-variable">於 ${periodDate} 前完成履約，${periodDateDetail || '送達機關指定地點。'}</span>`;
  }
}

function getInsuranceString() {
  if (selectedInsurances.length === 0) {
    return `<span class="h-variable">[尚未設定險種]</span>`;
  }
  if (selectedInsurances.includes('none')) {
    return `<span class="h-variable">免收保險</span>`;
  }
  
  const selectedDetails = INSURANCE_DB[selectedCategory]
    .filter(item => selectedInsurances.includes(item.id))
    .map(item => item.title.split(' (')[0]);
    
  return `<span class="h-variable">${selectedDetails.join('、')}</span>`;
}

function renderPreviewDocuments() {
  const container = document.getElementById('documentBody');
  const nameDisplay = procureName ? procureName : "[請於左側輸入採購案名]";
  const budgetFormatted = budgetAmount > 0 ? `${budgetAmount.toLocaleString('zh-TW')} 元` : "[請填寫預算]";
  const expansionFormatted = expansionAmount > 0 ? `${expansionAmount.toLocaleString('zh-TW')} 元` : "無";
  const totalFormatted = (budgetAmount + expansionAmount) > 0 ? `${(budgetAmount + expansionAmount).toLocaleString('zh-TW')} 元` : "[請填寫金額]";
  
  const periodText = getPeriodString();
  const insuranceText = getInsuranceString();
  
  let contentHtml = '';
  
  if (activeDocTab === 'tendering') {
    contentHtml = `
      <div class="doc-section active">
        <h1 class="doc-h1">投標須知 (第 ${selectedCategory === 'engineering' ? 'A' : 'B'} 軌範本 - 中華民國政府採購法標準)</h1>
        
        <p class="doc-p">
          一、本案採購案名：<span class="h-variable" id="varDocName">${nameDisplay}</span>
        </p>
        
        <p class="doc-p">
          二、本案採購類別：<span class="h-variable">${selectedCategory === 'engineering' ? '工程類' : (selectedCategory === 'property' ? '財物類' : '勞務類')}</span>
        </p>
        
        <p class="doc-p">
          三、本案資金來源及金額級距：
          本案預算金額為新臺幣 <span class="h-variable">${budgetFormatted}</span>。
          ${expansionAmount > 0 ? `本案規劃後續擴充金額為新臺幣 <span class="h-variable">${expansionFormatted}</span>。` : ''}
          <span class="h-national">本案總採購金額 (含後續擴充) 評定為新臺幣</span> <span class="h-variable">${totalFormatted}</span>，
          經系統判定級距為 <span class="h-national" style="font-weight:bold;">${document.getElementById('procureTierTag').innerText}</span>。
        </p>
        
        ${expansionAmount > 0 ? `
        <p class="doc-p">
          四、後續擴充條款限制（依政府採購法第二十二條第一項第七款）：
          <span class="h-agency">${expansionReason}</span>
        </p>
        ` : ''}
        
        <p class="doc-p">
          五、投標廠商資格與應附具之證明文件：
          投標廠商須為依法設立登記之公司、行號或法人機構，並提供廠商登記證明、最近一期納稅證明。
          <span class="h-agency">本案經評估，基於履約維護品質，投標廠商應檢附曾辦理類似採購案之契約或相關實績證明文件。</span>
        </p>
        
        <p class="doc-p">
          六、本採購案不允許投標廠商提出替代方案。
        </p>
      </div>
    `;
  } else if (activeDocTab === 'contract') {
    contentHtml = `
      <div class="doc-section active">
        <h1 class="doc-h1">契約書草案條款 (全國母軌 + 機關子軌重疊合成)</h1>
        
        <p class="doc-p">
          第一條：契約文件及效力
          本契約書包括招標文件、投標文件、契約條款、需求說明書及其變更或補充。
          <span class="h-national">契約所含各種文件之解釋順序為：(1)契約本文(2)開標/決標紀錄(3)需求說明書(4)投標須知。</span>
        </p>
        
        <p class="doc-p">
          第二條：契約履約標的
          廠商應依本案需求說明書，辦理：<span class="h-variable">${nameDisplay}</span>。
        </p>
        
        <p class="doc-p">
          第三條：契約價金之給付與調整
          <span class="h-national">本契約採總價決標，以新臺幣</span> <span class="h-variable">${budgetFormatted}</span> 為本案預算上限，實際契約價金以決標金額為準。
        </p>
        
        <p class="doc-p">
          第四條：履約期限
          廠商應於下列期限內完成履約：
          <span class="h-agency">本案履約期限依下列規定辦理：</span>
          ${periodText}。
        </p>
        
        <p class="doc-p">
          第五條：廠商保險責任與事故賠償
          <span class="h-national">廠商應自履約日起，投保下列保險項目，保險期間應涵蓋履約期限：</span>
          ${insuranceText}。
          <span class="h-agency">保險單及繳費收據影本應於開工/開工日起14日內送交機關備查。因可歸責於廠商之事由致機關受損者，廠商應負全部損害賠償責任。</span>
        </p>
        
        <p class="doc-p">
          第六條：違約罰則與延遲履約
          <span class="h-national">逾期違約金，以逾期日數按每日契約價金總額千分之一計算，並自應付契約價金中扣除。</span>
        </p>
      </div>
    `;
  } else if (activeDocTab === 'sow') {
    contentHtml = `
      <div class="doc-section active">
        <h1 class="doc-h1">需求說明書 (機關子軌客製條款)</h1>
        
        <p class="doc-p">
          一、專案背景與目的
          為辦理本機關之 <span class="h-variable">${nameDisplay}</span>，本案規劃以透明、客觀、具備效率之方式委託符合資格之優質廠商，協助機關達成業務推動目標。
        </p>
        
        <p class="doc-p">
          二、採購標的與履行範圍
          廠商應指派合格且具備相關經驗之技術人員，依機關指派地點與時程，提供本案所需之各項服務或硬體安裝。
        </p>
        
        <p class="doc-p">
          三、驗收及交付項目
          <span class="h-agency">廠商完成履約後，應提報結案報告書三份。機關應於收到結案報告後，於 15 日內指派人員辦理初驗或書面審查，確認內容與本說明書完全相符。</span>
        </p>
        
        <p class="doc-p">
          四、保密義務特別條款
          <span class="h-agency">廠商因執行本案契約而知悉或持有機關之業務資料、公務機密或個人資料，應善盡保密職責，如有外洩，應自負民刑事法律責任。</span>
        </p>
      </div>
    `;
  }
  
  container.innerHTML = contentHtml;
  
  // Calculate badge counts (number of variables matched in each document tab)
  updateBadgeCounts();
}

function updateBadgeCounts() {
  // Mock counts to display variables inside tab labels
  document.getElementById('badgeTendering').innerText = procureName ? '4' : '3';
  document.getElementById('badgeContract').innerText = selectedInsurances.length > 0 ? '5' : '4';
  document.getElementById('badgeSow').innerText = procureName ? '2' : '1';
}

function highlightVariableUpdates() {
  const variables = document.querySelectorAll('.h-variable');
  variables.forEach(v => {
    // Re-trigger glow animation
    v.style.animation = 'none';
    v.offsetHeight; // trigger reflow
    v.style.animation = null;
  });
}

// --- Simulators for Drafting and Exporting ---
function simulateSave() {
  alert(`標案「${procureName || '未命名'}」之引導設定已成功儲存為草稿！已儲存於瀏覽器 LocalStorage。`);
}

function exportDocuments() {
  if (!procureName.trim()) {
    alert("標案案名不能為空！請回到第一步完成案名輸入。");
    return;
  }
  
  // Create beautiful Word-compatible HTML Document wrapper
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
          body { font-family: "Noto Sans TC", "Microsoft JhengHei", Arial; line-height: 1.6; padding: 30px; }
          h1 { font-size: 18pt; font-weight: bold; text-align: center; margin-bottom: 20px; color: #1e3a8a; }
          p { font-size: 12pt; text-align: justify; margin-bottom: 10px; }
          .highlight-nat { border-bottom: 1px solid #3b82f6; background-color: #eff6ff; }
          .highlight-age { border-bottom: 1px solid #f59e0b; background-color: #fffbeb; }
          .highlight-var { font-weight: bold; background-color: #ecfdf5; color: #065f46; }
        </style>
      </head>
      <body>
        ${bodyHtml}
      </body>
      </html>
    `;
  };

  // 1. Tendering Doc
  const tenderingBody = `
    <h1>中華民國政府採購招標投標須知</h1>
    <p><strong>一、採購案名：</strong><span class="highlight-var">${procureName}</span></p>
    <p><strong>二、採購類別：</strong>${selectedCategory === 'engineering' ? '工程類' : (selectedCategory === 'property' ? '財物類' : '勞務類')}</p>
    <p><strong>三、採購金額：</strong>本案預算為新臺幣 <span class="highlight-var">${budgetAmount.toLocaleString('zh-TW')}元</span>。
    ${expansionAmount > 0 ? `規劃後續擴充金額上限為新臺幣 <span class="highlight-var">${expansionAmount.toLocaleString('zh-TW')}元</span>。` : ''}
    總採購金額達新臺幣 <span class="highlight-var">${(budgetAmount + expansionAmount).toLocaleString('zh-TW')}元</span>。</p>
    ${expansionAmount > 0 ? `<p><strong>四、後續擴充條款：</strong>${expansionReason}</p>` : ''}
    <p><strong>五、招標範本核定：</strong>依政府採購法規定，採用中華民國行政院公共工程委員會標準投標須知母軌。</p>
  `;

  // 2. Contract Doc
  const periodText = periodType === 'days' 
    ? `${periodDaysTrigger} ${periodDays} 天 (${periodDaysType === 'working' ? '工作天' : '日曆天'})`
    : `於 ${periodDate} 前完成履約 (${periodDateDetail || '無額外說明'})`;
    
  const insuranceDetails = selectedInsurances.includes('none')
    ? '免收保險'
    : INSURANCE_DB[selectedCategory]
        .filter(item => selectedInsurances.includes(item.id))
        .map(item => item.title.split(' (')[0])
        .join('、');

  const contractBody = `
    <h1>${procureName} - 契約書草案</h1>
    <p><strong>第一條：履約標的</strong><br>廠商應依本案招標文件及需求說明書辦理「${procureName}」。</p>
    <p><strong>第二條：契約價金上限</strong><br>本案總預算金額新臺幣 <span class="highlight-var">${budgetAmount.toLocaleString('zh-TW')}元</span>，決標後按實際決標價金核給。</p>
    <p><strong>第三條：履約期限</strong><br>廠商應於 <span class="highlight-var">${periodText}</span> 內履約完畢。</p>
    <p><strong>第四條：保險條款</strong><br>廠商應於履約日起投保：<span class="highlight-var">${insuranceDetails || '免收保險'}</span>。</p>
  `;

  // Download logic (separate downloads for prototype, since it's a zero-dependency client side client)
  downloadDocFile(`${procureName}_投標須知.doc`, buildHtmlDoc("投標須知", tenderingBody));
  
  // Minor delay to prevent browser block multiple downloads
  setTimeout(() => {
    downloadDocFile(`${procureName}_契約書草案.doc`, buildHtmlDoc("契約書草案", contractBody));
  }, 300);
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
