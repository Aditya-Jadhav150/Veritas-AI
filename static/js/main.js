// Authentication Logic
function toggleAuth() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    if (loginForm && registerForm) {
        if (loginForm.style.display === 'none') {
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
        } else {
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
        }
    }
}

// Login
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        const errDiv = document.getElementById('login-error');

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (data.success) {
                window.location.href = '/';
            } else {
                errDiv.textContent = data.message;
                errDiv.style.display = 'block';
            }
        } catch (e) {
            errDiv.textContent = 'Server error. Try again.';
            errDiv.style.display = 'block';
        }
    });
}

// Register
const regForm = document.getElementById('register-form');
if (regForm) {
    regForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        const errDiv = document.getElementById('register-error');

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (data.success) {
                window.location.href = '/';
            } else {
                errDiv.textContent = data.message;
                errDiv.style.display = 'block';
            }
        } catch (e) {
            errDiv.textContent = 'Server error. Try again.';
            errDiv.style.display = 'block';
        }
    });
}

// Dashboard File Upload Logic
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const previewArea = document.getElementById('preview-area');
const imagePreview = document.getElementById('image-preview');
const analyzeBtn = document.getElementById('analyze-btn');
const cancelBtn = document.getElementById('cancel-btn');
const loader = document.getElementById('loader');
const resultCard = document.getElementById('result-card');

let selectedFile = null;

if (dropZone) {
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Highlight drop zone
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'), false);
    });

    // Handle dropped files
    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length) handleFiles(files[0]);
    }, false);

    // Handle selected files
    fileInput.addEventListener('change', function() {
        if (this.files.length) handleFiles(this.files[0]);
    });

    function handleFiles(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file.');
            return;
        }
        selectedFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            dropZone.style.display = 'none';
            previewArea.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    cancelBtn.addEventListener('click', resetAnalyzer);

    analyzeBtn.addEventListener('click', async () => {
        if (!selectedFile) return;

        // UI State update
        previewArea.style.display = 'none';
        loader.style.display = 'block';

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const res = await fetch('/api/predict', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            
            loader.style.display = 'none';
            
            if (data.success) {
                showResults(data);
            } else {
                alert('Analysis failed: ' + data.message);
                resetAnalyzer();
            }
        } catch (e) {
            loader.style.display = 'none';
            alert('Network error communicating with Veritas-AI core.');
            resetAnalyzer();
        }
    });

    function showResults(data) {
        resultCard.classList.remove('hidden');
        
        const verdictBadge = document.getElementById('verdict-badge');
        const confidenceScore = document.getElementById('confidence-score');
        const confidenceBar = document.getElementById('confidence-bar');
        
        const isReal = data.prediction === 'REAL';
        const primaryProb = isReal ? data.real_prob : data.fake_prob;

        // Style Badge
        verdictBadge.className = 'verdict-badge ';
        verdictBadge.className += isReal ? 'verdict-real' : 'verdict-fake';
        verdictBadge.innerHTML = isReal 
            ? '<i class="fa-solid fa-check-circle"></i> AUTHENTIC MEDIA' 
            : '<i class="fa-solid fa-triangle-exclamation"></i> DEEPFAKE DETECTED';
        
        // Populate metrics
        confidenceScore.textContent = primaryProb + '%';
        
        // Progress bar styling
        confidenceBar.style.width = '0%';
        confidenceBar.style.background = isReal ? 'var(--success)' : 'var(--danger)';
        
        // Animate bar width
        setTimeout(() => {
            confidenceBar.style.width = primaryProb + '%';
        }, 100);
    }
}

function resetAnalyzer() {
    selectedFile = null;
    if (fileInput) fileInput.value = '';
    
    if (dropZone) dropZone.style.display = 'block';
    if (previewArea) previewArea.style.display = 'none';
    if (loader) loader.style.display = 'none';
    if (resultCard) resultCard.classList.add('hidden');
}
