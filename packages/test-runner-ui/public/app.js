const state = {
    journeys: [],
    isRunning: false
};

const dom = {
    journeyList: document.getElementById('journeyList'),
    toolSelect: document.getElementById('toolSelect'),
    modeSelect: document.getElementById('modeSelect'),
    runBtn: document.getElementById('runBtn'),
    stopBtn: document.getElementById('stopBtn'),
    copyBtn: document.getElementById('copyBtn'),
    clearBtn: document.getElementById('clearBtn'),
    reportBtn: document.getElementById('reportBtn'),
    reportContainer: document.getElementById('reportContainer'),
    logs: document.getElementById('logs'),
    tabs: document.querySelectorAll('.tab'),
    tabContents: document.querySelectorAll('.tab-content'),
    config: {
        appUrl: document.getElementById('config-app-url'),
        extensionPath: document.getElementById('config-extension-path'),
        userDataDir: document.getElementById('config-user-data-dir')
    }
};

// Tab Switching logic
dom.tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const target = tab.getAttribute('data-tab');
        dom.tabs.forEach(t => t.classList.toggle('active', t === tab));
        dom.tabContents.forEach(c => {
            c.classList.toggle('active', c.id === `${target}-tab`);
        });
    });
});

// Load config from localStorage
Object.keys(dom.config).forEach(key => {
    const saved = localStorage.getItem(`config_${key}`);
    if (saved) dom.config[key].value = saved;
    dom.config[key].addEventListener('input', () => {
        localStorage.setItem(`config_${key}`, dom.config[key].value);
    });
});

dom.copyBtn.addEventListener('click', () => {
    const text = dom.logs.innerText;
    navigator.clipboard.writeText(text).then(() => {
        const originalText = dom.copyBtn.textContent;
        dom.copyBtn.textContent = 'Copied!';
        setTimeout(() => dom.copyBtn.textContent = originalText, 2000);
    });
});

dom.clearBtn.addEventListener('click', () => {
    dom.logs.innerHTML = '';
});

dom.reportBtn.addEventListener('click', () => {
    window.open('/playwright-report/index.html', '_blank');
});

dom.toolSelect.addEventListener('change', () => {
    updateReportVisibility();
});

function updateReportVisibility() {
    dom.reportContainer.style.display = dom.toolSelect.value === 'playwright' ? 'block' : 'none';
}

// Initialize visibility
updateReportVisibility();

// Connect WebSocket
const ws = new WebSocket(`ws://${location.host}`);

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === 'log') {
        appendLog(data.message);
    } else if (data.type === 'error') {
        appendLog(data.message, 'log-error');
    } else if (data.type === 'test-start') {
        appendLog(`\n🚀 Starting ${data.journey} with ${data.tool}...`, 'log-info');
    } else if (data.type === 'test-end') {
        const color = data.status === 'passed' ? 'log-success' : 'log-error';
        appendLog(`\n🏁 Finished ${data.journey}: ${data.status.toUpperCase()} (${data.duration}s)`, color);
        // If single run finished, re-enable
        // Note: Real implementation might track multiple tests
    }
};

function appendLog(text, className = '') {
    const div = document.createElement('div');
    div.className = `log-entry ${className}`;
    div.textContent = text;
    dom.logs.appendChild(div);
    dom.logs.scrollTop = dom.logs.scrollHeight;
}

async function fetchJourneys() {
    const res = await fetch('/api/journeys');
    state.journeys = await res.json();
    renderJourneys();
}

function renderJourneys() {
    dom.journeyList.innerHTML = state.journeys.map(j => `
        <div class="journey-item">
            <input type="checkbox" value="${j.id}" id="j-${j.id}" checked>
            <label for="j-${j.id}">${j.name}</label>
        </div>
    `).join('');
}

dom.runBtn.addEventListener('click', async () => {
    const selected = Array.from(document.querySelectorAll('.journey-item input:checked'))
        .map(input => input.value);

    if (selected.length === 0) return alert('Select at least one journey');

    setRunning(true);
    dom.logs.innerHTML = '';

    await fetch('/api/tests/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            journeys: selected,
            tool: dom.toolSelect.value,
            mode: dom.modeSelect.value,
            config: {
                APP_URL: dom.config.appUrl.value,
                EXTENSION_PATH: dom.config.extensionPath.value,
                CHROME_USER_DATA_DIR: dom.config.userDataDir.value
            }
        })
    });
});

dom.stopBtn.addEventListener('click', async () => {
    await fetch('/api/tests/stop', { method: 'POST' });
    setRunning(false);
    appendLog('\n🛑 Tests stopped by user', 'log-error');
});

function setRunning(running) {
    state.isRunning = running;
    dom.runBtn.style.display = running ? 'none' : 'block';
    dom.stopBtn.style.display = running ? 'block' : 'none';
    dom.journeyList.style.pointerEvents = running ? 'none' : 'auto';
}

fetchJourneys();
