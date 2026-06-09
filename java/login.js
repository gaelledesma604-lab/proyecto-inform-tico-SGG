/**
 * SGG - Sistema de Gestión de Gastos
 * Código saneado y auditado contra fugas de estado y bloqueos del DOM.
 */

// Eliminamos la envoltura redundante de DOMContentLoaded dado que usamos 'defer' en HTML
// Esto garantiza el acceso directo y seguro a los nodos del árbol.

// --- ELEMENTOS DEL DOM (SELECTORES CENTRALIZADOS) ---
const views = {
    login: document.getElementById('viewLogin'),
    register: document.getElementById('viewRegister'),
    recover: document.getElementById('viewRecover'),
    dashboard: document.getElementById('viewDashboard')
};

const forms = {
    login: document.getElementById('formLogin'),
    register: document.getElementById('formRegister'),
    recover: document.getElementById('formRecover')
};

const inputs = {
    loginUser: document.getElementById('loginUser'),
    loginPass: document.getElementById('loginPass'),
    regUser: document.getElementById('regUser'),
    regPass: document.getElementById('regPass'),
    regPassConfirm: document.getElementById('regPassConfirm'),
    recUser: document.getElementById('recUser'),
    recKey: document.getElementById('recKey'),
    recNewPass: document.getElementById('recNewPass')
};

const feedback = {
    loginError: document.getElementById('errorLogin'),
    registerError: document.getElementById('errorRegister'),
    recoverError: document.getElementById('errorRecover'),
    recoverSuccess: document.getElementById('successRecover'),
    recoveryBox: document.getElementById('recoveryKeyBox'),
    generatedKey: document.getElementById('generatedKey')
};

const btnGoToRegister = document.getElementById('btnGoToRegister');
const btnGoToRecover = document.getElementById('btnGoToRecover');
const btnBackToLoginFromReg = document.getElementById('btnBackToLoginFromReg');
const btnBackToLoginFromRec = document.getElementById('btnBackToLoginFromRec');
const btnRegisterSubmit = document.getElementById('btnRegisterSubmit');
const btnLogout = document.getElementById('btnLogout');
const dashUsername = document.getElementById('dashUsername');

const themeToggle = document.getElementById('themeToggle');
const themeLabel = document.getElementById('themeLabel');

// --- MANEJO DE ESTADO LOCAL (LOCALSTORAGE) ---
const getStoredUsers = () => JSON.parse(localStorage.getItem('sgg_users')) || [];
const setStoredUsers = (users) => localStorage.setItem('sgg_users', JSON.stringify(users));
const getActiveSession = () => JSON.parse(localStorage.getItem('sgg_session'));
const setActiveSession = (userSession) => localStorage.setItem('sgg_session', JSON.stringify(userSession));
const removeActiveSession = () => localStorage.removeItem('sgg_session');

// --- MOTOR DE NAVEGACIÓN ---
function switchView(targetViewKey) {
    Object.values(feedback).forEach(el => {
        if(el) el.classList.add('hidden');
    });
    Object.values(forms).forEach(f => {
        if(f) f.reset();
    });
    if(btnRegisterSubmit) btnRegisterSubmit.classList.remove('hidden');

    Object.keys(views).forEach(key => {
        if (views[key]) {
            if (key === targetViewKey) {
                views[key].classList.remove('hidden');
            } else {
                views[key].classList.add('hidden');
            }
        }
    });
}

function showMsg(element, message, isError = true) {
    if(element) {
        element.textContent = message;
        element.classList.remove('hidden');
    }
}

function generateUniqueKey() {
    const token = () => Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${token()}-${token()}`;
}

// --- INITIALIZATION ---
const currentSession = getActiveSession();
if (currentSession) {
    dashUsername.textContent = currentSession.username;
    switchView('dashboard');
}

// --- MANEJADORES DE EVENTOS ASIGNADOS CORRECTAMENTE ---

if (forms.login) {
    forms.login.addEventListener('submit', (e) => {
        e.preventDefault();
        feedback.loginError.classList.add('hidden');

        const userVal = inputs.loginUser.value.trim();
        const passVal = inputs.loginPass.value;

        if (!userVal || !passVal) {
            showMsg(feedback.loginError, 'Todos los campos son obligatorios para el acceso.');
            return;
        }

        const users = getStoredUsers();
        const foundUser = users.find(u => u.username.toLowerCase() === userVal.toLowerCase() && u.password === passVal);

        if (!foundUser) {
            showMsg(feedback.loginError, 'Credenciales de acceso incorrectas o inexistentes.');
            return;
        }

        setActiveSession({ username: foundUser.username });
        dashUsername.textContent = foundUser.username;
        switchView('dashboard');
    });
}

if (forms.register) {
    forms.register.addEventListener('submit', (e) => {
        e.preventDefault();
        feedback.registerError.classList.add('hidden');

        const userVal = inputs.regUser.value.trim();
        const passVal = inputs.regPass.value;
        const confirmVal = inputs.regPassConfirm.value;

        if (!userVal || !passVal || !confirmVal) {
            showMsg(feedback.registerError, 'Por favor complete todos los datos del formulario.');
            return;
        }

        if (passVal.length < 4) {
            showMsg(feedback.registerError, 'La contraseña debe contener al menos 4 caracteres.');
            return;
        }

        if (passVal !== confirmVal) {
            showMsg(feedback.registerError, 'Las contraseñas ingresadas no coinciden.');
            return;
        }

        const users = getStoredUsers();
        const userExists = users.some(u => u.username.toLowerCase() === userVal.toLowerCase());

        if (userExists) {
            showMsg(feedback.registerError, 'El nombre de usuario ya está registrado en el sistema.');
            return;
        }

        const recoveryKey = generateUniqueKey();

        users.push({
            username: userVal,
            password: passVal,
            recoveryKey: recoveryKey
        });
        setStoredUsers(users);

        feedback.generatedKey.textContent = recoveryKey;
        feedback.recoveryBox.classList.remove('hidden');
        btnRegisterSubmit.classList.add('hidden');
    });
}

if (forms.recover) {
    forms.recover.addEventListener('submit', (e) => {
        e.preventDefault();
        feedback.recoverError.classList.add('hidden');
        feedback.recoverSuccess.classList.add('hidden');

        const userVal = inputs.recUser.value.trim();
        const keyVal = inputs.recKey.value.trim().toUpperCase();
        const newPassVal = inputs.recNewPass.value;

        if (!userVal || !keyVal || !newPassVal) {
            showMsg(feedback.recoverError, 'Rellene todos los campos del formulario de mitigación.');
            return;
        }

        if (newPassVal.length < 4) {
            showMsg(feedback.recoverError, 'La nueva contraseña debe tener mínimo 4 caracteres.');
            return;
        }

        const users = getStoredUsers();
        const userIndex = users.findIndex(u => u.username.toLowerCase() === userVal.toLowerCase());

        if (userIndex === -1) {
            showMsg(feedback.recoverError, 'El usuario provisto no existe en el sistema.');
            return;
        }

        if (users[userIndex].recoveryKey !== keyVal) {
            showMsg(feedback.recoverError, 'La clave de recuperación ingresada es inválida.');
            return;
        }

        users[userIndex].password = newPassVal;
        setStoredUsers(users);

        showMsg(feedback.recoverSuccess, 'Contraseña restablecida de manera exitosa. Redirigiendo...', false);
        
        setTimeout(() => {
            switchView('login');
        }, 2000);
    });
}

if (btnLogout) {
    btnLogout.addEventListener('click', () => {
        removeActiveSession();
        switchView('login');
    });
}

// Enrutamiento de clics de navegación con condicionales de seguridad
if(btnGoToRegister) btnGoToRegister.addEventListener('click', () => switchView('register'));
if(btnGoToRecover) btnGoToRecover.addEventListener('click', () => switchView('recover'));
if(btnBackToLoginFromReg) btnBackToLoginFromReg.addEventListener('click', () => switchView('login'));
if(btnBackToLoginFromRec) btnBackToLoginFromRec.addEventListener('click', () => switchView('login'));

// --- CONTROLADOR DE TEMAS ---
const applyTheme = (theme) => {
    if (theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        if(themeToggle) themeToggle.checked = true;
        if(themeLabel) themeLabel.textContent = 'Modo Elegante';
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        if(themeToggle) themeToggle.checked = false;
        if(themeLabel) themeLabel.textContent = 'Modo Industrial';
    }
    localStorage.setItem('sgg_theme', theme);
};

const savedTheme = localStorage.getItem('sgg_theme') || 'dark';
applyTheme(savedTheme);

if(themeToggle) {
    themeToggle.addEventListener('change', (e) => {
        const nextTheme = e.target.checked ? 'light' : 'dark';
        applyTheme(nextTheme);
    });
}
