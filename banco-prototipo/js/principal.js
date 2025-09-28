let currentUser = {
    username: '',
    name: '',
    balance: 1000.00,
    transactions: []
};

document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadUserData();
    updateUI();
});

function checkAuth() {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
        currentUser = JSON.parse(userData);
    } else if (window.location.pathname.includes('dashboard') || 
               window.location.pathname.includes('pix') || 
               window.location.pathname.includes('extrato')) {
        window.location.href = 'login.html';
    }
}

function saveUserData() {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

function loadUserData() {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
        currentUser = JSON.parse(userData);
    }
}

function updateUI() {
    const userNameElements = document.querySelectorAll('#userName, #welcomeName');
    userNameElements.forEach(element => {
        if (element) {
            element.textContent = currentUser.name || currentUser.username;
        }
    });

    const balanceElements = document.querySelectorAll('#balanceAmount');
    balanceElements.forEach(element => {
        if (element) {
            element.textContent = formatCurrency(currentUser.balance);
        }
    });

    updateRecentTransactions();
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

function formatDate(date) {
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(date));
}

function login(username, password) {
    if (username === 'admin' && password === '123456') {
        currentUser = {
            username: username,
            name: 'Administrador',
            balance: 1000.00,
            transactions: [
                {
                    id: 1,
                    type: 'deposit',
                    description: 'Depósito inicial',
                    amount: 1000.00,
                    date: new Date().toISOString(),
                    balance: 1000.00
                }
            ]
        };
        
        saveUserData();
        return true;
    }
    return false;
}

function logout() {
    localStorage.removeItem('currentUser');
    currentUser = {
        username: '',
        name: '',
        balance: 0,
        transactions: []
    };
    window.location.href = 'login.html';
}

function addTransaction(type, description, amount, pixKey = null) {
    const transaction = {
        id: Date.now(),
        type: type,
        description: description,
        amount: amount,
        date: new Date().toISOString(),
        balance: currentUser.balance,
        pixKey: pixKey
    };
    
    currentUser.transactions.unshift(transaction);
    saveUserData();
    updateUI();
}

function updateRecentTransactions() {
    const container = document.getElementById('recentTransactions');
    if (!container) return;

    const recentTransactions = currentUser.transactions.slice(0, 5);
    
    if (recentTransactions.length === 0) {
        container.innerHTML = `
            <div class="no-transactions">
                <i class="fas fa-inbox"></i>
                <p>Nenhuma transação recente</p>
            </div>
        `;
        return;
    }

    container.innerHTML = recentTransactions.map(transaction => `
        <div class="transaction-item">
            <div class="transaction-info">
                <div class="transaction-icon ${transaction.type}">
                    <i class="fas fa-${getTransactionIcon(transaction.type)}"></i>
                </div>
                <div class="transaction-details">
                    <h4>${transaction.description}</h4>
                    <p>${formatDate(transaction.date)}</p>
                </div>
            </div>
            <div class="transaction-amount ${transaction.amount > 0 ? 'positive-amount' : 'negative-amount'}">
                ${transaction.amount > 0 ? '+' : ''}R$ ${formatCurrency(Math.abs(transaction.amount))}
            </div>
        </div>
    `).join('');
}

function getTransactionIcon(type) {
    const icons = {
        'pix': 'mobile-alt',
        'deposit': 'arrow-down',
        'withdrawal': 'arrow-up',
        'transfer': 'exchange-alt'
    };
    return icons[type] || 'circle';
}

function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.querySelector('.toggle-password i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        toggleBtn.className = 'fas fa-eye';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const errorMessage = document.getElementById('error-message');
            
            if (login(username, password)) {
                window.location.href = 'dashboard.html';
            } else {
                errorMessage.textContent = 'Usuário ou senha inválidos';
                errorMessage.style.display = 'block';
            }
        });
    }
});

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }
}

function showSuccess(elementId, message) {
    const successElement = document.getElementById(elementId);
    if (successElement) {
        successElement.textContent = message;
        successElement.style.display = 'block';
        
        setTimeout(() => {
            successElement.style.display = 'none';
        }, 3000);
    }
}

function hideMessages() {
    const errorMessages = document.querySelectorAll('.error-message');
    const successMessages = document.querySelectorAll('.success-message');
    
    errorMessages.forEach(msg => msg.style.display = 'none');
    successMessages.forEach(msg => msg.style.display = 'none');
}

function validatePixKey(key) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    const phoneRegexSimple = /^\d{10,11}$/;
    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
    const randomKeyRegex = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
    
    return emailRegex.test(key) || 
           phoneRegex.test(key) || 
           phoneRegexSimple.test(key) ||
           cpfRegex.test(key) || 
           randomKeyRegex.test(key) ||
           /^\d{11}$/.test(key);
}

function generateRandomPixKey() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function simulateProcessing(duration = 2000) {
    return new Promise(resolve => {
        setTimeout(resolve, duration);
    });
}

window.login = login;
window.logout = logout;
window.togglePassword = togglePassword;
window.showError = showError;
window.showSuccess = showSuccess;
window.hideMessages = hideMessages;
window.validatePixKey = validatePixKey;
window.generateRandomPixKey = generateRandomPixKey;
window.simulateProcessing = simulateProcessing;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;