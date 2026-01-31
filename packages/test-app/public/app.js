document.addEventListener('DOMContentLoaded', () => {
    // Form Handlers
    const submitBtn = document.querySelector('[data-testid="btn-submit"]');
    const resetBtn = document.querySelector('[data-testid="btn-reset"]');

    if (submitBtn) submitBtn.addEventListener('click', handleSubmit);
    if (resetBtn) resetBtn.addEventListener('click', handleReset);

    // Modal Handlers
    const openModalBtn = document.querySelector('[data-testid="btn-open-modal"]');
    const closeModalBtn = document.querySelector('[data-testid="modal-close"]');
    const confirmModalBtn = document.querySelector('[data-testid="modal-confirm"]');

    if (openModalBtn) openModalBtn.addEventListener('click', () => toggleModal(true));
    if (closeModalBtn) closeModalBtn.addEventListener('click', () => toggleModal(false));
    if (confirmModalBtn) confirmModalBtn.addEventListener('click', () => toggleModal(false));

    // Delayed Action Handler
    const delayedBtn = document.querySelector('[data-testid="btn-delayed"]');
    if (delayedBtn) delayedBtn.addEventListener('click', handleDelayedAction);

    // File Upload Handlers
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');

    if (dropZone) {
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('dragover');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            if (e.dataTransfer.files.length) {
                uploadFile(e.dataTransfer.files[0]);
            }
        });

        // Click to browse
        const browseBtn = dropZone.querySelector('button');
        if (browseBtn && fileInput) {
            browseBtn.addEventListener('click', () => fileInput.click());
        }
    }

    if (fileInput) {
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length) {
                uploadFile(fileInput.files[0]);
            }
        });
    }
});

function handleSubmit() {
    const usernameInput = document.getElementById('username');
    const roleInput = document.getElementById('role');
    const resultBox = document.getElementById('form-result');

    if (usernameInput && roleInput && resultBox) {
        const username = usernameInput.value;
        const role = roleInput.value;
        resultBox.textContent = `Submitted: ${username} (${role})`;
        resultBox.classList.remove('hidden');
    }
}

function handleReset() {
    const form = document.getElementById('sample-form');
    const resultBox = document.getElementById('form-result');

    if (form) form.reset();
    if (resultBox) resultBox.classList.add('hidden');
}

function toggleModal(show) {
    const modal = document.getElementById('modal-overlay');
    if (modal) {
        if (show) {
            modal.classList.remove('hidden');
        } else {
            modal.classList.add('hidden');
        }
    }
}

function handleDelayedAction() {
    const btn = document.querySelector('[data-testid="btn-delayed"]');
    const result = document.getElementById('delayed-result');

    if (!btn || !result) return;

    const text = btn.querySelector('.btn-text');

    btn.disabled = true;
    if (text) {
        text.textContent = 'Processing...';
        text.style.opacity = '0.7';
    }

    setTimeout(() => {
        btn.disabled = false;
        if (text) {
            text.textContent = 'Click me (3s delay)';
            text.style.opacity = '1';
        }
        result.textContent = 'Action completed successfully!';
    }, 3000);
}

function uploadFile(file) {
    const statusDiv = document.getElementById('upload-status');
    if (!statusDiv) return;

    statusDiv.textContent = `Uploading ${file.name}...`;
    statusDiv.className = 'status-message';

    const formData = new FormData();
    formData.append('file', file);

    fetch('/api/upload', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            statusDiv.textContent = `✅ Success: ${data.filename}`;
            statusDiv.classList.add('success');
        })
        .catch(error => {
            statusDiv.textContent = '❌ Upload failed';
            statusDiv.classList.add('error');
        });
}
