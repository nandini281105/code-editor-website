console.log("JS Loaded Successfully");

document.addEventListener("DOMContentLoaded", () => {

  const editor = document.getElementById("editor");
  const output = document.getElementById("output");

  const runBtn = document.getElementById("runBtn");
  const saveBtn = document.getElementById("saveBtn");
  const clearBtn = document.getElementById("clearBtn");
  const languageSelect = document.getElementById("languageSelect");

  if (!editor || !runBtn || !saveBtn || !clearBtn) {
    console.error("Missing core elements in HTML");
    return;
  }

  const templates = {
    "C": `#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}`,
    "C++": `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}`,
    "Java": `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`,
    "html": `<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <title>Document</title>\n</head>\n<body>\n    <h1>Hello, World!</h1>\n</body>\n</html>`,
    "css": `body {\n    background-color: #f0f2f5;\n    font-family: Arial, sans-serif;\n}\nh1 {\n    color: #333333;\n    text-align: center;\n}`,
    "javascript": `console.log("Hello, World!");`,
    "python": `print("Hello, World!")`
  };

  function isLikelyCode(code, language) {
    const trimmed = code.trim();
    if (trimmed === "" || trimmed === "Write your code Here.......") {
      return { valid: false, reason: "Code is empty or has the default placeholder." };
    }
    if (trimmed.length < 5) {
      return { valid: false, reason: "Code must be at least 5 characters long." };
    }

    const isTemplate = Object.values(templates).some(t => t.trim() === trimmed);
    if (isTemplate) {
      return { valid: true };
    }

    const langLower = language.toLowerCase();
    if (langLower === "html") {
      const hasTags = /<[a-z/][^>]*>/i.test(trimmed);
      if (!hasTags) {
        return { valid: false, reason: "HTML must contain tag syntax (e.g., <p>, <div>, etc.)." };
      }
    } else if (langLower === "css") {
      const hasBraces = trimmed.includes("{") && trimmed.includes("}");
      const hasColon = trimmed.includes(":");
      if (!hasBraces || !hasColon) {
        return { valid: false, reason: "CSS must contain style rules with curly braces and colons (e.g., body { color: red; })." };
      }
    } else if (["javascript", "java", "c", "c++"].includes(langLower)) {
      const syntaxMarkers = [";", "{", "}", "(", ")", "function", "const", "let", "var", "import", "class", "public", "void", "return", "#include", "std", "int", "printf", "cout", "console.log"];
      const hasMarker = syntaxMarkers.some(marker => trimmed.includes(marker));
      if (!hasMarker) {
        return { valid: false, reason: `This does not look like valid ${language} syntax. Please write actual programming code.` };
      }
    } else if (langLower === "python") {
      const pythonMarkers = ["print(", "def ", "import ", "if ", "for ", "while ", "class ", " = ", ":\n"];
      const hasMarker = pythonMarkers.some(marker => trimmed.includes(marker));
      if (!hasMarker) {
        return { valid: false, reason: "This does not look like valid Python syntax. Please write actual Python code." };
      }
    }
    return { valid: true };
  }

  function loadTemplateForLanguage(lang) {
    const currentCode = editor.value.trim();
    const isDefaultOrEmpty = currentCode === "" || currentCode === "Write your code Here.......";
    const isTemplate = Object.values(templates).some(t => t.trim() === currentCode);
    const templateCode = templates[lang] || "";

    if (isDefaultOrEmpty || isTemplate) {
      editor.value = templateCode;
    } else {
      if (confirm(`Do you want to load the basic structure for ${lang}? This will overwrite your current code.`)) {
        editor.value = templateCode;
      }
    }
  }

  const extensionMap = {
    "C": "main.c",
    "C++": "main.cpp",
    "Java": "Main.java",
    "html": "index.html",
    "css": "style.css",
    "javascript": "script.js",
    "python": "main.py"
  };

  function updateTabFileName(lang) {
    const tabLabel = document.getElementById("tabFileName");
    if (tabLabel) {
      tabLabel.innerText = extensionMap[lang] || `file.${lang}`;
    }
  }

  if (languageSelect) {
    languageSelect.addEventListener("change", () => {
      loadTemplateForLanguage(languageSelect.value);
      updateTabFileName(languageSelect.value);
    });

    const defaultLang = languageSelect.value || "C";
    updateTabFileName(defaultLang);
    if (editor.value === "Write your code Here.......") {
      editor.value = templates[defaultLang] || "";
    }
  }

  let selectedAvatar = "default_avatar.png";

  function updateAvatarElement(element, avatarValue, isDashboard = false) {
    if (!element) return;
    if (!avatarValue || avatarValue === "default_avatar.png") {
      element.innerHTML = `<img src="default_avatar.png" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover;">`;
    } else if (avatarValue.startsWith("data:") || avatarValue.includes("/") || avatarValue.includes(".")) {
      element.innerHTML = `<img src="${avatarValue}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover;">`;
    } else {
      const fontSize = isDashboard ? "44px" : "20px";
      element.innerHTML = `<span style="font-size: ${fontSize}; line-height: 1; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">${avatarValue}</span>`;
    }
  }

  window.toggleProfilePane = (pane) => {
    const dashboard = document.getElementById("profileDashboard");
    const form = document.getElementById("profileEditForm");
    if (!dashboard || !form) return;
    if (pane === "edit") {
      dashboard.style.display = "none";
      form.style.display = "block";
    } else {
      dashboard.style.display = "block";
      form.style.display = "none";
      window.loadDashboard();
    }
  };

  function syncProfileUI(user) {
    if (!user) return;
    
    // Update top bar avatar
    updateAvatarElement(document.getElementById("avatarBtn"), user.avatar, false);
    
    // Update dropdown avatar
    updateAvatarElement(document.getElementById("dropdownAvatarBtn"), user.avatar, false);
    
    // Update header details
    const nameEls = document.querySelectorAll(".user-name");
    const emailEls = document.querySelectorAll(".user-email");
    nameEls.forEach(el => el.innerText = user.username || "N/A");
    emailEls.forEach(el => el.innerText = user.email || "N/A");
    
    // Points
    const pointsEl = document.getElementById("points");
    const menuPointsEl = document.getElementById("menu-points");
    if (pointsEl) pointsEl.innerText = user.points || 0;
    if (menuPointsEl) menuPointsEl.innerText = user.points || 0;
    
    // Edit fields
    const profileName = document.getElementById("profileName");
    const profileEmail = document.getElementById("profileEmail");
    const profilePhone = document.getElementById("profilePhone");
    if (profileName) profileName.value = user.username || "";
    if (profileEmail) profileEmail.value = user.email || "";
    if (profilePhone) profilePhone.value = user.phone || "";
    
    const nicknameInput = document.getElementById("generalNickname");
    const genderSelect = document.getElementById("generalGender");
    const addressInput = document.getElementById("generalAddress");
    const dobInput = document.getElementById("generalDOB");
    if (nicknameInput) nicknameInput.value = user.nickname || "";
    if (genderSelect) genderSelect.value = user.gender || "Female";
    if (addressInput) addressInput.value = user.address || "";
    if (dobInput) dobInput.value = user.dob || "";
    
    // Set active state in avatar presets
    const presets = document.querySelectorAll(".avatar-preset");
    const modalPreviewWrapper = document.querySelector(".active-avatar-preview");
    
    if (modalPreviewWrapper) {
      if (!user.avatar || user.avatar === "default_avatar.png") {
        modalPreviewWrapper.innerHTML = `<img src="default_avatar.png" id="modalAvatarPreview" alt="Avatar Preview" style="width: 100%; height: 100%; object-fit: cover;">`;
      } else if (user.avatar.startsWith("data:") || user.avatar.includes("/") || user.avatar.includes(".")) {
        modalPreviewWrapper.innerHTML = `<img src="${user.avatar}" id="modalAvatarPreview" alt="Avatar Preview" style="width: 100%; height: 100%; object-fit: cover;">`;
      } else {
        modalPreviewWrapper.innerHTML = `<span style="font-size: 40px; line-height: 1; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">${user.avatar}</span>`;
      }
    }
    
    presets.forEach(p => {
      const presetVal = p.getAttribute("data-avatar");
      if (presetVal === user.avatar) {
        p.classList.add("active");
      } else {
        p.classList.remove("active");
      }
    });

    selectedAvatar = user.avatar || "default_avatar.png";
  }

  window.loadDashboard = async () => {
    const userId = localStorage.getItem("userId");
    const dashboard = document.getElementById("profileDashboard");
    if (!dashboard) return;
    if (!userId) {
      dashboard.innerHTML = `<p style="color: var(--text-muted); text-align: center; margin-top: 50px;">Please sign in to view your dashboard.</p>`;
      return;
    }
    try {
      dashboard.innerHTML = `<p style="color: var(--text-muted); text-align: center; margin-top: 50px;">Loading profile details...</p>`;
      
      const [profileRes, codesRes] = await Promise.all([
        fetch(`/api/auth/profile/${userId}`),
        fetch(`http://localhost:3001/api/saved-codes/${userId}`)
      ]);
      
      const profileData = await profileRes.json();
      const codesData = await codesRes.json();
      
      if (!profileRes.ok || !codesRes.ok) {
        dashboard.innerHTML = `<p style="color: var(--accent-red); text-align: center; margin-top: 50px;">Failed to load dashboard data.</p>`;
        return;
      }
      
      const user = profileData.user;
      const codes = codesData.savedCodes || [];
      
      syncProfileUI(user);
      
      const totalSolved = codes.length;
      let easyCount = 0;
      let mediumCount = 0;
      let hardCount = 0;
      const langCounts = {};
      
      codes.forEach(item => {
        const lines = (item.code || "").split("\n").length;
        if (lines < 15) easyCount++;
        else if (lines <= 40) mediumCount++;
        else hardCount++;
        
        const lang = item.language || "unknown";
        langCounts[lang] = (langCounts[lang] || 0) + 1;
      });
      
      const rank = Math.max(1, 100000 - (user.points || 0) * 12);
      const pct = totalSolved > 0 ? Math.min(100, (totalSolved / 100) * 100) : 0;
      const strokeDashoffset = 264 - (264 * pct) / 100;
      
      const dates = [];
      const start = new Date();
      start.setDate(start.getDate() - 83);
      const dayOfWeek = start.getDay();
      start.setDate(start.getDate() - dayOfWeek);
      
      for (let i = 0; i < 84; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        dates.push(d);
      }
      
      const dateCountMap = {};
      codes.forEach(code => {
        if (code.savedAt) {
          const d = new Date(code.savedAt);
          const dateKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
          dateCountMap[dateKey] = (dateCountMap[dateKey] || 0) + 1;
        }
      });
      
      let cellHtml = "";
      dates.forEach(d => {
        const dateKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        const count = dateCountMap[dateKey] || 0;
        const level = count === 0 ? 0 : Math.min(4, count);
        const dateString = d.toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'});
        const tooltip = `${count} code${count !== 1 ? 's' : ''} saved on ${dateString}`;
        cellHtml += `<div class="day-cell level-${level}" data-tooltip="${tooltip}" data-date="${dateKey}"></div>`;
      });
      
      const recentCodes = [...codes].sort((a,b)=> new Date(b.savedAt) - new Date(a.savedAt)).slice(0, 3);
      let recentListHtml = "";
      if (recentCodes.length === 0) {
        recentListHtml = `<p style="color: var(--text-muted); font-size: 12px; text-align: center; padding: 10px 0;">No code activity recorded yet.</p>`;
      } else {
        recentCodes.forEach(code => {
          const lines = (code.code || "").split("\n").length;
          let diffClass = "easy";
          let diffText = "Easy";
          if (lines >= 15 && lines <= 40) {
            diffClass = "medium";
            diffText = "Medium";
          } else if (lines > 40) {
            diffClass = "hard";
            diffText = "Hard";
          }
          const dateStr = new Date(code.savedAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'});
          recentListHtml += `
            <div class="recent-activity-item">
                <div class="recent-activity-meta">
                    <span class="recent-activity-title" style="font-weight: 600; color: var(--text-main); font-size: 13px;">${code.title || "Untitled Snippet"}</span>
                    <div class="recent-activity-info" style="display: flex; gap: 8px; font-size: 11px; margin-top: 4px;">
                        <span class="recent-activity-lang ${diffClass}">${code.language}</span>
                        <span class="recent-activity-date">${dateStr}</span>
                    </div>
                </div>
                <button class="recent-activity-action-btn" onclick="loadCodeFromDashboard('${code._id}')">📂 Load</button>
             </div>
          `;
        });
      }
      
      dashboard.innerHTML = `
        <div class="dashboard-header">
            <div class="dashboard-avatar" id="dashboardAvatar"></div>
            <div class="dashboard-info">
                <h2>${user.username || "User"} <span style="font-size: 12px; font-family: var(--font-mono); color: var(--accent-blue); font-weight: normal; background: rgba(56, 189, 248, 0.08); padding: 2px 8px; border-radius: 20px; border: 1px solid rgba(56, 189, 248, 0.2); margin-left: 6px;">Rank #${rank}</span></h2>
                <div class="dashboard-info-details">
                    <div class="dashboard-info-item">👤 Nickname: <strong>${user.nickname || "N/A"}</strong></div>
                    <div class="dashboard-info-item">📧 Email: <strong>${user.email || "N/A"}</strong></div>
                    <div class="dashboard-info-item">📞 Phone: <strong>${user.phone || "N/A"}</strong></div>
                    <div class="dashboard-info-item">⭐ Points: <strong style="color: var(--accent-yellow);">${user.points || 0}</strong></div>
                </div>
            </div>
            <div class="dashboard-actions">
                <button class="dashboard-btn dashboard-btn-edit" onclick="toggleProfilePane('edit')">✏️ Edit Profile</button>
            </div>
        </div>
        
        <div class="dashboard-grid">
            <div class="dashboard-card">
                <div class="dashboard-card-title">Solved Problems</div>
                <div class="solved-widget-content">
                    <div class="solved-circle-container">
                        <svg class="circle-svg" width="100" height="100">
                            <circle class="circle-bg" cx="50" cy="50" r="42"></circle>
                            <circle class="circle-progress" cx="50" cy="50" r="42" style="stroke-dashoffset: ${strokeDashoffset};"></circle>
                        </svg>
                        <div class="circle-text">
                            <span class="circle-text-num">${totalSolved}</span>
                            <span class="circle-text-label">Solved</span>
                        </div>
                    </div>
                    <div class="solved-bars">
                        <div class="difficulty-bar-group">
                            <div class="difficulty-meta">
                                <span class="difficulty-easy-text">Easy</span>
                                <span>${easyCount}<span style="color: var(--text-muted); font-size: 11px;">/50</span></span>
                            </div>
                            <div class="difficulty-bar-bg">
                                <div class="difficulty-bar-fill fill-easy" style="width: ${Math.min(100, (easyCount/50)*100)}%;"></div>
                             </div>
                        </div>
                        <div class="difficulty-bar-group">
                            <div class="difficulty-meta">
                                <span class="difficulty-medium-text">Medium</span>
                                <span>${mediumCount}<span style="color: var(--text-muted); font-size: 11px;">/30</span></span>
                            </div>
                            <div class="difficulty-bar-bg">
                                <div class="difficulty-bar-fill fill-medium" style="width: ${Math.min(100, (mediumCount/30)*100)}%;"></div>
                            </div>
                        </div>
                        <div class="difficulty-bar-group">
                            <div class="difficulty-meta">
                                <span class="difficulty-hard-text">Hard</span>
                                <span>${hardCount}<span style="color: var(--text-muted); font-size: 11px;">/20</span></span>
                            </div>
                            <div class="difficulty-bar-bg">
                                <div class="difficulty-bar-fill fill-hard" style="width: ${Math.min(100, (hardCount/20)*100)}%;"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="dashboard-card">
                <div class="dashboard-card-title">Language Distribution</div>
                <div class="languages-list">
                    ${Object.entries(langCounts).length === 0 ? 
                      `<p style="color: var(--text-muted); font-size: 12px; text-align: center; margin-top: 20px;">No languages solved yet.</p>` :
                      Object.entries(langCounts).sort((a,b)=>b[1]-a[1]).map(([lang, count]) => `
                        <div class="language-item">
                            <span class="language-name-badge">${lang}</span>
                            <span class="language-count">${count} code${count > 1 ? 's' : ''}</span>
                        </div>
                      `).join('')
                    }
                </div>
            </div>
            
            <div class="dashboard-card heatmap-card" style="grid-column: span 2;">
                <div class="dashboard-card-title">Submission Heatmap (Last 12 Weeks)</div>
                <div class="heatmap-container">
                    <div class="heatmap-weekdays">
                        <span>Sun</span>
                        <span>Tue</span>
                        <span>Thu</span>
                        <span>Sat</span>
                    </div>
                    <div class="heatmap-grid-wrapper">
                        <div class="heatmap-months">
                            <span>${dates[0].toLocaleDateString(undefined, {month:'short'})}</span>
                            <span style="margin-left: auto; margin-right: auto;">${dates[35].toLocaleDateString(undefined, {month:'short'})}</span>
                            <span>${dates[70].toLocaleDateString(undefined, {month:'short'})}</span>
                        </div>
                        <div class="heatmap-grid">
                            ${cellHtml}
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="dashboard-card recent-activity-card" style="grid-column: span 2;">
                <div class="dashboard-card-title">Recent Submissions</div>
                <div class="recent-activity-list">
                    ${recentListHtml}
                </div>
            </div>
        </div>
      `;
      
      updateAvatarElement(document.getElementById("dashboardAvatar"), user.avatar, true);
      
    } catch (err) {
      console.error("Load LeetCode Dashboard Error:", err);
      dashboard.innerHTML = `<p style="color: var(--accent-red); text-align: center; margin-top: 50px;">Network Error: Failed to generate dashboard.</p>`;
    }
  };

  window.loadCodeFromDashboard = async (codeId) => {
    const userId = localStorage.getItem("userId");
    if (!userId || !codeId) return;
    try {
      const res = await fetch(`/api/saved-codes/${userId}`);
      const data = await res.json();
      const codes = data.savedCodes || [];
      const item = codes.find(c => c._id === codeId);
      if (item) {
        editor.value = item.code;
        if (languageSelect) {
          const options = Array.from(languageSelect.options);
          const match = options.find(opt => opt.value.toLowerCase() === item.language.toLowerCase());
          if (match) {
            languageSelect.value = match.value;
            updateTabFileName(match.value);
          }
        }
        runBtn.click();
        if (settingsModal) settingsModal.classList.remove("show");
        alert(`Loaded saved ${item.language} code!`);
      }
    } catch (err) {
      console.error("Load code error:", err);
    }
  };

  function setupAvatarSelectors() {
    const presets = document.querySelectorAll(".avatar-preset");
    const customInput = document.getElementById("customAvatarInput");
    const previewWrapper = document.querySelector(".active-avatar-preview");

    presets.forEach(p => {
      p.addEventListener("click", () => {
        presets.forEach(pr => pr.classList.remove("active"));
        p.classList.add("active");
        selectedAvatar = p.getAttribute("data-avatar");
        
        if (previewWrapper) {
          if (selectedAvatar === "default_avatar.png" || selectedAvatar.includes("/") || selectedAvatar.includes(".")) {
            previewWrapper.innerHTML = `<img src="${selectedAvatar}" id="modalAvatarPreview" alt="Avatar Preview" style="width: 100%; height: 100%; object-fit: cover;">`;
          } else {
            previewWrapper.innerHTML = `<span style="font-size: 40px; line-height: 1; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">${selectedAvatar}</span>`;
          }
        }
      });
    });

    if (customInput) {
      customInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const dataUrl = event.target.result;
            selectedAvatar = dataUrl;
            presets.forEach(pr => pr.classList.remove("active"));
            if (previewWrapper) {
              previewWrapper.innerHTML = `<img src="${dataUrl}" id="modalAvatarPreview" alt="Avatar Preview" style="width: 100%; height: 100%; object-fit: cover;">`;
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }
  }

  runBtn.addEventListener("click", async () => {
    console.log("Run clicked");
    const code = editor.value;
    const language = languageSelect ? languageSelect.value : "html";

    if (language === "html" || language === "css" || language === "javascript") {
      console.log("Running frontend code locally in iframe");
      let htmlContent = "";
      if (language === "html") {
        htmlContent = code;
      } else if (language === "css") {
        htmlContent = `<style>${code}</style><p style="font-family: sans-serif; padding: 10px; color: #f8fafc;">CSS Style Loaded!</p>`;
      } else if (language === "javascript") {
        htmlContent = `<script>${code}</script><p style="font-family: sans-serif; padding: 10px; color: #f8fafc;">JavaScript Executed! (Check browser console for outputs)</p>`;
      }

      if (output) {
        output.srcdoc = htmlContent;
      }
      return;
    }

    let languageId = 50;
    if (language === "C") languageId = 50;
    else if (language === "C++") languageId = 54;
    else if (language === "Java") languageId = 62;
    else if (language === "python") languageId = 71;

    try {
      if (output) {
        output.srcdoc = `<pre style="font-family: monospace; padding: 10px; color: #94a3b8;">Compiling and running...</pre>`;
      }

      const res = await fetch("http://localhost:3001/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language_id: languageId, source_code: code })
      });

      const data = await res.json();
      console.log("Compiler Response Output:", data);

      if (output) {
        if (data.error) {
          output.srcdoc = `<pre style="color: #ef4444; font-family: monospace; padding: 10px; white-space: pre-wrap;">Error: ${data.error}</pre>`;
        } else {
          output.srcdoc = `<pre style="color: #f8fafc; font-family: monospace; padding: 10px; white-space: pre-wrap;">${data.output}</pre>`;
        }
      }

    } catch (err) {
      console.error("Run error:", err);
      if (output) {
        output.srcdoc = `<pre style="color: #ef4444; font-family: monospace; padding: 10px;">Network Error: Failed to execute code</pre>`;
      }
    }
  });

  async function loadSavedCodes() {
    const currentUserId = localStorage.getItem("userId");
    const listContainer = document.getElementById("savedCodesList");
    if (!listContainer) return;

    if (!currentUserId) {
      listContainer.innerHTML = `<p style="color: #64748b; font-size: 13px;">Please sign in to view your saved codes.</p>`;
      return;
    }

    try {
      listContainer.innerHTML = `<p style="color: #94a3b8; font-size: 13px;">Loading saved codes...</p>`;

      const res = await fetch(`/api/saved-codes/${currentUserId}`);
      const data = await res.json();

      if (!res.ok) {
        listContainer.innerHTML = `<p style="color: #ef4444; font-size: 13px;">Error: ${data.error || "Failed to load"}</p>`;
        return;
      }

      const codes = data.savedCodes || [];
      if (codes.length === 0) {
        listContainer.innerHTML = `<p style="color: #64748b; font-size: 13px;">No saved codes found yet. Try saving some!</p>`;
        return;
      }

      listContainer.innerHTML = "";
      codes.forEach((item, index) => {
        const itemDate = new Date(item.savedAt).toLocaleString();
        const itemDiv = document.createElement("div");
        itemDiv.className = "saved-code-item";

        itemDiv.innerHTML = `
          <div class="saved-code-meta">
            <span class="saved-code-title" style="font-weight: bold; color: #f8fafc; font-size: 14px; display: block; margin-bottom: 4px;">${item.title || 'Untitled Snippet'}</span>
            <div style="display: flex; gap: 8px; align-items: center;">
              <span class="saved-code-lang">${item.language}</span>
              <span class="saved-code-date" style="font-size: 11px; color: #64748b;">${itemDate}</span>
            </div>
          </div>
          <div class="saved-code-actions">
            <button class="load-code-btn" data-index="${index}">📂 Load</button>
            <button class="delete-code-btn" data-id="${item._id}">🗑️ Delete</button>
          </div>
        `;

        const loadBtn = itemDiv.querySelector(".load-code-btn");
        loadBtn.addEventListener("click", () => {
          editor.value = item.code;
          if (languageSelect) {
            const options = Array.from(languageSelect.options);
            const match = options.find(opt => opt.value.toLowerCase() === item.language.toLowerCase());
            if (match) {
              languageSelect.value = match.value;
              updateTabFileName(match.value);
            }
          }
          runBtn.click();
          if (settingsModal) settingsModal.classList.remove("show");
          alert(`Loaded saved ${item.language} code!`);
        });

        const deleteBtn = itemDiv.querySelector(".delete-code-btn");
        deleteBtn.addEventListener("click", async (e) => {
          e.stopPropagation();
          if (confirm("Are you sure you want to delete this saved code?")) {
            await deleteSavedCode(item._id);
          }
        });

        listContainer.appendChild(itemDiv);
      });

    } catch (err) {
      console.error("Fetch saved codes error:", err);
      listContainer.innerHTML = `<p style="color: #ef4444; font-size: 13px;">Failed to load saved codes.</p>`;
    }
  }

  async function deleteSavedCode(codeId) {
    const currentUserId = localStorage.getItem("userId");
    if (!currentUserId || !codeId) return;
    try {
      const res = await fetch(`/api/saved-code/${currentUserId}/${codeId}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (res.ok) {
        alert("Saved code deleted successfully.");
        loadSavedCodes();
      } else {
        alert(data.error || "Failed to delete saved code.");
      }
    } catch (err) {
      console.error("Delete saved code error:", err);
      alert("Error deleting saved code.");
    }
  }

  saveBtn.addEventListener("click", async () => {
    console.log("Save clicked");
    const code = editor.value;
    const currentUserId = localStorage.getItem("userId");
    const language = languageSelect ? languageSelect.value : "html";

    if (!currentUserId) {
      alert("Please Sign In first to save your work and earn points!");
      window.location.href = "login.html";
      return;
    }

    const validation = isLikelyCode(code, language);
    if (!validation.valid) {
      alert(`Validation Error: ${validation.reason}`);
      return;
    }

    const title = prompt("Enter a name/title for your saved code:", "My Code Snippet");
    if (title === null) return;
    const finalTitle = title.trim() || "Untitled Snippet";

    try {
      const res = await fetch("http://localhost:3001/api/save-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId, code, language, title: finalTitle })
      });
      const data = await res.json();
      if (res.ok) {
        alert("Code Saved! +10 Points Earned!");
        localStorage.setItem("points", data.points);
        const pointsEl = document.getElementById("points");
        const menuPointsEl = document.getElementById("menu-points");
        if (pointsEl) pointsEl.innerText = data.points;
        if (menuPointsEl) menuPointsEl.innerText = data.points;
        loadSavedCodes();
        window.loadDashboard(); // Refresh LeetCode dashboard metrics
      } else {
        alert(data.error || "Failed to save code.");
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Error saving code. Please try again.");
    }
  });

  clearBtn.addEventListener("click", () => {
    editor.value = "";
    if (output) output.srcdoc = "";
  });

  const avatarBtn = document.getElementById("avatarBtn");
  const profilePanel = document.getElementById("profilePanel");

  if (avatarBtn && profilePanel) {
    avatarBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      profilePanel.classList.toggle("show");
    });

    document.addEventListener("click", (e) => {
      if (!profilePanel.contains(e.target) && !avatarBtn.contains(e.target)) {
        profilePanel.classList.remove("show");
      }
    });
  }

  const settingsModal = document.getElementById("settingsModal");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  const menuProfile = document.getElementById("menuProfile");
  const menuGeneral = document.getElementById("menuGeneral");
  const menuSettings = document.getElementById("menuSettings");

  function openModalWithTab(tabId) {
    if (!settingsModal) return;
    settingsModal.classList.add("show");

    tabButtons.forEach(btn => {
      if (btn.getAttribute("data-tab") === tabId) btn.classList.add("active");
      else btn.classList.remove("active");
    });

    tabContents.forEach(content => {
      if (content.id === tabId) content.classList.add("active");
      else content.classList.remove("active");
    });

    if (profilePanel) profilePanel.classList.remove("show");
    
    if (tabId === "profile-tab") {
      window.toggleProfilePane("dashboard"); // load dashboard
    } else if (tabId === "saved-codes-tab") {
      loadSavedCodes();
    }
  }

  if (menuProfile) {
    menuProfile.addEventListener("click", (e) => {
      e.preventDefault();
      openModalWithTab("profile-tab");
    });
  }
  if (menuGeneral) {
    menuGeneral.addEventListener("click", (e) => {
      e.preventDefault();
      openModalWithTab("general-tab");
    });
  }
  if (menuSettings) {
    menuSettings.addEventListener("click", (e) => {
      e.preventDefault();
      openModalWithTab("settings-tab");
    });
  }
  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", () => {
      settingsModal.classList.remove("show");
    });
  }
  if (settingsModal) {
    settingsModal.addEventListener("click", (e) => {
      if (e.target === settingsModal) settingsModal.classList.remove("show");
    });
  }

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const tabId = btn.getAttribute("data-tab");
      openModalWithTab(tabId);
    });
  });

  window.logout = () => {
    localStorage.clear();
    alert("Signed out successfully!");
    window.location.href = "login.html";
  };

  window.saveProfileData = async () => {
    const profileName = document.getElementById("profileName").value.trim();
    const profileEmail = document.getElementById("profileEmail").value.trim();
    const profilePhone = document.getElementById("profilePhone").value.trim();
    const userId = localStorage.getItem("userId");

    if (!profileName || !profileEmail) {
      alert("Name and Email are required.");
      return;
    }
    if (!userId) {
      alert("Please sign in first.");
      return;
    }

    try {
      const res = await fetch(`/http://localhost:3001/api/auth/profile/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username: profileName, 
          email: profileEmail, 
          phone: profilePhone,
          avatar: selectedAvatar
        })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        localStorage.setItem("username", data.user.username);
        localStorage.setItem("email", data.user.email);
        localStorage.setItem("phone", data.user.phone);
        alert("Profile saved successfully!");
        window.toggleProfilePane("dashboard"); // Go back to dashboard view
      } else {
        alert(data.error || "Failed to save profile.");
      }
    } catch (err) {
      alert("Network error. Please try again.");
    }
  };

  window.saveGeneralData = async () => {
    const nickname = document.getElementById("generalNickname").value.trim();
    const gender = document.getElementById("generalGender").value;
    const address = document.getElementById("generalAddress").value.trim();
    const dob = document.getElementById("generalDOB").value.trim();
    const userId = localStorage.getItem("userId");

    if (!userId) {
      alert("Please sign in first.");
      return;
    }

    try {
      const res = await fetch(`/api/auth/profile/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname, gender, address, dob })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        localStorage.setItem("nickname", nickname);
        localStorage.setItem("gender", gender);
        localStorage.setItem("address", address);
        localStorage.setItem("dob", dob);
        alert("General details saved successfully!");
      } else {
        alert(data.error || "Failed to save details.");
      }
    } catch (err) {
      alert("Network error. Please try again.");
    }
  };

  window.savePasswordSettings = async () => {
    const currentPassword = document.getElementById("settingsCurrentPassword").value;
    const newPassword = document.getElementById("settingsNewPassword").value;
    const confirmPassword = document.getElementById("settingsConfirmPassword").value;
    const userId = localStorage.getItem("userId");

    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    if (!userId) {
      alert("Please sign in first.");
      return;
    }

    try {
      const res = await fetch(`/api/auth/profile/password/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        alert("Password updated successfully!");
        document.getElementById("settingsCurrentPassword").value = "";
        document.getElementById("settingsNewPassword").value = "";
        document.getElementById("settingsConfirmPassword").value = "";
      } else {
        alert(data.error || "Failed to update password.");
      }
    } catch (err) {
      alert("Network error. Please try again.");
    }
  };
  // On Page Load: Retrieve and initialize user session statistics
  const loggedInUserId = localStorage.getItem("userId");
  if (loggedInUserId) {
    window.loadDashboard();
    setupAvatarSelectors();
  }
});
