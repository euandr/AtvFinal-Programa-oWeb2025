document.addEventListener('DOMContentLoaded', function() {
    initializeExtrato();
    
    setTimeout(() => {
        loadExtrato();
    }, 100);
});

function initializeExtrato() {
    loadExtrato();
    setupFilters();
    setDefaultDates();
}

function loadExtrato() {
    const container = document.getElementById('extratoList');
    if (!container) return;
    
    loadUserData();
    
    const transactions = currentUser.transactions;
    console.log('Transações carregadas no extrato:', transactions);
    
    if (transactions.length === 0) {
        container.innerHTML = `
            <div class="no-transactions">
                <i class="fas fa-inbox"></i>
                <p>Nenhuma transação encontrada</p>
            </div>
        `;
        updateSummary(transactions);
        return;
    }
    
    const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    container.innerHTML = sortedTransactions.map(transaction => `
        <div class="transaction-item">
            <div class="transaction-info">
                <div class="transaction-icon ${transaction.type}">
                    <i class="fas fa-${getTransactionIcon(transaction.type)}"></i>
                </div>
                <div class="transaction-details">
                    <h4>${transaction.description}</h4>
                    <p>${formatDate(transaction.date)}</p>
                    ${transaction.pixKey ? `<small>Chave: ${transaction.pixKey}</small>` : ''}
                </div>
            </div>
            <div class="transaction-amount ${transaction.amount > 0 ? 'positive-amount' : 'negative-amount'}">
                ${transaction.amount > 0 ? '+' : ''}R$ ${formatCurrency(Math.abs(transaction.amount))}
            </div>
        </div>
    `).join('');
    
    updateSummary(transactions);
}

function updateSummary(transactions) {
    const totalIncome = transactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = Math.abs(transactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + t.amount, 0));
    
    const currentBalance = currentUser.balance;
    
    const incomeElement = document.getElementById('totalIncome');
    const expenseElement = document.getElementById('totalExpense');
    const balanceElement = document.getElementById('currentBalance');
    
    if (incomeElement) incomeElement.textContent = `R$ ${formatCurrency(totalIncome)}`;
    if (expenseElement) expenseElement.textContent = `R$ ${formatCurrency(totalExpense)}`;
    if (balanceElement) balanceElement.textContent = `R$ ${formatCurrency(currentBalance)}`;
}

function setupFilters() {
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const typeSelect = document.getElementById('transactionType');
    
    if (startDateInput) {
        startDateInput.addEventListener('change', filterTransactions);
    }
    
    if (endDateInput) {
        endDateInput.addEventListener('change', filterTransactions);
    }
    
    if (typeSelect) {
        typeSelect.addEventListener('change', filterTransactions);
    }
}

function setDefaultDates() {
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    
    if (startDateInput && endDateInput) {
        const today = new Date();
        const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
        
        startDateInput.value = thirtyDaysAgo.toISOString().split('T')[0];
        endDateInput.value = today.toISOString().split('T')[0];
    }
}

function filterTransactions() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const transactionType = document.getElementById('transactionType').value;
    
    let filteredTransactions = [...currentUser.transactions];
    
    if (startDate) {
        filteredTransactions = filteredTransactions.filter(t => 
            new Date(t.date) >= new Date(startDate)
        );
    }
    
    if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        filteredTransactions = filteredTransactions.filter(t => 
            new Date(t.date) <= endDateTime
        );
    }
    
    if (transactionType) {
        filteredTransactions = filteredTransactions.filter(t => t.type === transactionType);
    }
    
    filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    displayFilteredTransactions(filteredTransactions);
    updateSummary(filteredTransactions);
}

function displayFilteredTransactions(transactions) {
    const container = document.getElementById('extratoList');
    if (!container) return;
    
    if (transactions.length === 0) {
        container.innerHTML = `
            <div class="no-transactions">
                <i class="fas fa-search"></i>
                <p>Nenhuma transação encontrada com os filtros aplicados</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = transactions.map(transaction => `
        <div class="transaction-item">
            <div class="transaction-info">
                <div class="transaction-icon ${transaction.type}">
                    <i class="fas fa-${getTransactionIcon(transaction.type)}"></i>
                </div>
                <div class="transaction-details">
                    <h4>${transaction.description}</h4>
                    <p>${formatDate(transaction.date)}</p>
                    ${transaction.pixKey ? `<small>Chave: ${transaction.pixKey}</small>` : ''}
                </div>
            </div>
            <div class="transaction-amount ${transaction.amount > 0 ? 'positive-amount' : 'negative-amount'}">
                ${transaction.amount > 0 ? '+' : ''}R$ ${formatCurrency(Math.abs(transaction.amount))}
            </div>
        </div>
    `).join('');
}

function exportExtrato() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const transactionType = document.getElementById('transactionType').value;
    
    const exportBtn = document.querySelector('.action-btn');
    const originalText = exportBtn.innerHTML;
    
    exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gerando PDF...';
    exportBtn.disabled = true;
    
    setTimeout(() => {
        const data = generateExtratoData(startDate, endDate, transactionType);
        downloadExtrato(data);
        
        exportBtn.innerHTML = originalText;
        exportBtn.disabled = false;
        
        showSuccess('extratoSuccess', 'Extrato exportado com sucesso!');
    }, 2000);
}

function generateExtratoData(startDate, endDate, transactionType) {
    let transactions = [...currentUser.transactions];
    
    if (startDate) {
        transactions = transactions.filter(t => new Date(t.date) >= new Date(startDate));
    }
    if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        transactions = transactions.filter(t => new Date(t.date) <= endDateTime);
    }
    if (transactionType) {
        transactions = transactions.filter(t => t.type === transactionType);
    }
    
    return {
        user: currentUser.name || currentUser.username,
        period: `${startDate || 'Início'} a ${endDate || 'Hoje'}`,
        balance: currentUser.balance,
        transactions: transactions.sort((a, b) => new Date(b.date) - new Date(a.date))
    };
}

function downloadExtrato(data) {
    const content = `
EXTRATO BANCÁRIO
================

Cliente: ${data.user}
Período: ${data.period}
Saldo Atual: R$ ${formatCurrency(data.balance)}

TRANSAÇÕES:
${data.transactions.map(t => `
${formatDate(t.date)} - ${t.description}
${t.amount > 0 ? '+' : ''}R$ ${formatCurrency(Math.abs(t.amount))}
`).join('')}

---
Gerado em: ${new Date().toLocaleString('pt-BR')}
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extrato_${data.user}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

function printExtrato() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const transactionType = document.getElementById('transactionType').value;
    
    const data = generateExtratoData(startDate, endDate, transactionType);
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Extrato Bancário - ${data.user}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .transaction { margin-bottom: 10px; padding: 10px; border-bottom: 1px solid #ccc; }
                    .positive { color: green; }
                    .negative { color: red; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>EXTRATO BANCÁRIO</h1>
                    <p><strong>Cliente:</strong> ${data.user}</p>
                    <p><strong>Período:</strong> ${data.period}</p>
                    <p><strong>Saldo Atual:</strong> R$ ${formatCurrency(data.balance)}</p>
                </div>
                
                <h2>TRANSAÇÕES:</h2>
                ${data.transactions.map(t => `
                    <div class="transaction">
                        <strong>${formatDate(t.date)}</strong> - ${t.description}<br>
                        <span class="${t.amount > 0 ? 'positive' : 'negative'}">
                            ${t.amount > 0 ? '+' : ''}R$ ${formatCurrency(Math.abs(t.amount))}
                        </span>
                    </div>
                `).join('')}
                
                <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #666;">
                    Gerado em: ${new Date().toLocaleString('pt-BR')}
                </div>
            </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
}

function clearFilters() {
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    document.getElementById('transactionType').value = '';
    loadExtrato();
}

window.exportExtrato = exportExtrato;
window.printExtrato = printExtrato;
window.clearFilters = clearFilters;