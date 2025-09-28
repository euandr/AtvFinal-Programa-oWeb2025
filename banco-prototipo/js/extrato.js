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
    
    console.log('=== LOAD EXTRATO ===');
    console.log('currentUser:', currentUser);
    console.log('currentUser.transactions:', currentUser.transactions);
    
    const transactions = currentUser.transactions || [];
    console.log('Transações carregadas no extrato:', transactions);
    console.log('Quantidade de transações:', transactions.length);
    
    if (transactions.length === 0) {
        container.innerHTML = `
            <div class="no-transactions">
                <i class="fas fa-inbox"></i>
                <p>Nenhuma transação encontrada</p>
                <small>Faça uma transação PIX para ver o histórico aqui</small>
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
    
    // Não define datas padrão para mostrar todas as transações
    // O usuário pode definir filtros se quiser
    if (startDateInput && endDateInput) {
        startDateInput.value = '';
        endDateInput.value = '';
    }
}

function filterTransactions() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const transactionType = document.getElementById('transactionType').value;
    
    console.log('=== FILTROS APLICADOS ===');
    console.log('Data inicial:', startDate || 'Nenhuma');
    console.log('Data final:', endDate || 'Nenhuma');
    console.log('Tipo:', transactionType || 'Todos');
    
    let filteredTransactions = [...currentUser.transactions];
    console.log('Transações antes do filtro:', filteredTransactions.length);
    
    if (startDate) {
        filteredTransactions = filteredTransactions.filter(t => 
            new Date(t.date) >= new Date(startDate)
        );
        console.log('Após filtro de data inicial:', filteredTransactions.length);
    }
    
    if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        filteredTransactions = filteredTransactions.filter(t => 
            new Date(t.date) <= endDateTime
        );
        console.log('Após filtro de data final:', filteredTransactions.length);
    }
    
    if (transactionType) {
        filteredTransactions = filteredTransactions.filter(t => t.type === transactionType);
        console.log('Após filtro de tipo:', filteredTransactions.length);
    }
    
    filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    console.log('Transações finais após filtros:', filteredTransactions.length);
    
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
    // Garante que os dados do usuário estão carregados
    loadUserData();
    
    console.log('=== DEBUG EXPORTAR ===');
    console.log('currentUser:', currentUser);
    console.log('currentUser.transactions:', currentUser.transactions);
    console.log('Quantidade de transações:', currentUser.transactions ? currentUser.transactions.length : 0);
    
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const transactionType = document.getElementById('transactionType').value;
    
    console.log('Filtros aplicados:');
    console.log('- Data inicial:', startDate);
    console.log('- Data final:', endDate);
    console.log('- Tipo:', transactionType);
    
    const exportBtn = document.querySelector('[onclick="exportExtrato()"]');
    const originalText = exportBtn.innerHTML;
    
    exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gerando...';
    exportBtn.disabled = true;
    
    setTimeout(() => {
        const data = generateExtratoData(startDate, endDate, transactionType);
        
        console.log('Dados gerados para exportar:', data);
        console.log('Transações filtradas:', data.transactions);
        
        if (data.transactions.length === 0) {
            alert('Nenhuma transação encontrada para exportar.\n\nVerifique se você fez transações e se os filtros estão corretos.');
            exportBtn.innerHTML = originalText;
            exportBtn.disabled = false;
            return;
        }
        
        downloadExtrato(data);
        
        exportBtn.innerHTML = originalText;
        exportBtn.disabled = false;
        
        showSuccess('extratoSuccess', 'Extrato exportado com sucesso!');
    }, 1000);
}

function generateExtratoData(startDate, endDate, transactionType) {
    // Garante que os dados estão carregados
    if (!currentUser || !currentUser.transactions) {
        console.error('Dados do usuário não encontrados');
        return {
            user: 'Usuário',
            period: 'Período não definido',
            balance: 0,
            transactions: []
        };
    }
    
    let transactions = [...currentUser.transactions];
    console.log('Transações para exportar:', transactions);
    
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
        user: currentUser.name || currentUser.username || 'Usuário',
        period: `${startDate || 'Início'} a ${endDate || 'Hoje'}`,
        balance: currentUser.balance || 0,
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
    // Garante que os dados do usuário estão carregados
    loadUserData();
    
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const transactionType = document.getElementById('transactionType').value;
    
    const data = generateExtratoData(startDate, endDate, transactionType);
    
    if (data.transactions.length === 0) {
        alert('Nenhuma transação encontrada para imprimir.');
        return;
    }
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Extrato Bancário - ${data.user}</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        margin: 20px; 
                        line-height: 1.6;
                    }
                    .header { 
                        text-align: center; 
                        margin-bottom: 30px; 
                        border-bottom: 2px solid #333;
                        padding-bottom: 20px;
                    }
                    .transaction { 
                        margin-bottom: 15px; 
                        padding: 10px; 
                        border-bottom: 1px solid #ccc; 
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .transaction-info {
                        flex: 1;
                    }
                    .transaction-amount {
                        font-weight: bold;
                        font-size: 1.1em;
                    }
                    .positive { color: green; }
                    .negative { color: red; }
                    .no-transactions {
                        text-align: center;
                        color: #666;
                        font-style: italic;
                        margin: 40px 0;
                    }
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
                ${data.transactions.length > 0 ? data.transactions.map(t => `
                    <div class="transaction">
                        <div class="transaction-info">
                            <strong>${formatDate(t.date)}</strong><br>
                            ${t.description}
                            ${t.pixKey ? `<br><small>Chave: ${t.pixKey}</small>` : ''}
                        </div>
                        <div class="transaction-amount ${t.amount > 0 ? 'positive' : 'negative'}">
                            ${t.amount > 0 ? '+' : ''}R$ ${formatCurrency(Math.abs(t.amount))}
                        </div>
                    </div>
                `).join('') : '<div class="no-transactions">Nenhuma transação encontrada no período selecionado.</div>'}
                
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

function debugTransactions() {
    loadUserData();
    console.log('=== DEBUG TRANSAÇÕES ===');
    console.log('currentUser completo:', currentUser);
    console.log('Transações:', currentUser.transactions);
    console.log('Quantidade:', currentUser.transactions ? currentUser.transactions.length : 0);
    
    if (currentUser.transactions && currentUser.transactions.length > 0) {
        console.log('Primeira transação:', currentUser.transactions[0]);
        console.log('Última transação:', currentUser.transactions[currentUser.transactions.length - 1]);
    }
    
    // Mostra no alert também
    const count = currentUser.transactions ? currentUser.transactions.length : 0;
    alert(`Total de transações encontradas: ${count}\n\nVerifique o console (F12) para mais detalhes.`);
}

window.exportExtrato = exportExtrato;
window.printExtrato = printExtrato;
window.clearFilters = clearFilters;
window.debugTransactions = debugTransactions;