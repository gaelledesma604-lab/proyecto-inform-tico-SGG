/**
 * SGG - Sistema de Gestión de Gastos
 * Módulo exclusivo de Autenticación con Usuario de Prueba Precargado
 */

// --- ELEMENTOS DEL DOM (SELECTORES CENTRALIZADOS) ---
const views = {
    login: document.getElementById('viewLogin'),
    dashboard: document.getElementById('viewDashboard')
};

const forms = {
    login: document.getElementById('formLogin')
};

const inputs = {
    loginUser: document.getElementById('loginUser'),
    loginPass: document.getElementById('loginPass')
};

const feedback = {
    loginError: document.getElementById('errorLogin')
};

const btnLogout = document.getElementById('btnLogout');
const dashUsername = document.getElementById('dashUsername');

// --- MANEJO DE ESTADO LOCAL (LOCALSTORAGE) ---
const getStoredUsers = () => JSON.parse(localStorage.getItem('sgg_users')) || [];
const setStoredUsers = (users) => localStorage.setItem('sgg_users', JSON.stringify(users));
const getActiveSession = () => JSON.parse(localStorage.getItem('sgg_session'));
const setActiveSession = (userSession) => localStorage.setItem('sgg_session', JSON.stringify(userSession));
const removeActiveSession = () => localStorage.removeItem('sgg_session');

// --- PRECARGA DE USUARIOS PARA PRUEBAS ---
function inicializarUsuariosDemo() {
    const usuariosActuales = getStoredUsers();
    
    // Verificamos si el usuario de prueba ya existe para no duplicarlo
    const existeUsuarioDemo = usuariosActuales.some(u => u.username.toLowerCase() === 'usuario188');
    
    if (!existeUsuarioDemo) {
        usuariosActuales.push({
            username: 'usuario188',
            password: 'usuario188'
        });
        setStoredUsers(usuariosActuales);
        console.log("Usuario de prueba 'usuario188' precargado exitosamente.");
    }
}

// --- MOTOR DE NAVEGACIÓN ---
function switchView(targetViewKey) {
    if (feedback.loginError) feedback.loginError.classList.add('hidden');
    if (forms.login) forms.login.reset();

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

function showMsg(element, message) {
    if (element) {
        element.textContent = message;
        element.classList.remove('hidden');
    }
}

// --- INICIALIZACIÓN DE LA APLICACIÓN ---
// 1. Cargamos el usuario de prueba de manera automática
inicializarUsuariosDemo();

// 2. Comprobamos si hay una sesión activa de antes
const currentSession = getActiveSession();
if (currentSession) {
    if (dashUsername) dashUsername.textContent = currentSession.username;
    switchView('dashboard');
}

// --- MANEJADORES DE EVENTOS ---

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
        if (dashUsername) dashUsername.textContent = foundUser.username;
        switchView('dashboard');
    });
}

if (btnLogout) {
    btnLogout.addEventListener('click', () => {
        removeActiveSession();
        switchView('login');
    });
}
