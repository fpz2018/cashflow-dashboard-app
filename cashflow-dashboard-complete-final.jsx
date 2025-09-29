// Continue from part 3 - Main Application

// Debtors Management Tab (Enhanced)
const DebtorManagementTab = ({ title, debtors, onAdd, onUpdate, onDelete }) => {
    const [newItem, setNewItem] = useState({ name: '', paymentTerm: 30 });
    const [editingId, setEditingId] = useState(null);
    const isEditing = editingId !== null;

    const handleEditClick = useCallback((debtor) => {
        if (debtor.isSystem) return;
        setEditingId(debtor.id);
        setNewItem({ name: debtor.name, paymentTerm: debtor.paymentTerm });
    }, []);

    const handleCancelEdit = useCallback(() => {
        setEditingId(null);
        setNewItem({ name: '', paymentTerm: 30 });
    }, []);

    const handleSave = useCallback(() => {
        const debtorData = { ...newItem, paymentTerm: parseInt(newItem.paymentTerm, 10) };
        if (debtorData.name && !isNaN(debtorData.paymentTerm)) {
            isEditing ? onUpdate({ id: editingId, ...debtorData }) : onAdd(debtorData);
            handleCancelEdit();
        }
    }, [newItem, isEditing, editingId, onUpdate, onAdd, handleCancelEdit]);

    return (
        <div>
            <div className="mb-4">
                <h2 className="text-2xl font-semibold">{title}</h2>
                <p className="text-gray-600 text-sm">Beheer {title.toLowerCase()} en hun betalingstermijnen</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded mb-6">
                <h3 className="font-medium mb-2">{isEditing ? `${title.slice(0,-1)} wijzigen` : `Nieuwe ${title.slice(0,-1).toLowerCase()} toevoegen`}</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input 
                        type="text" 
                        placeholder={`Naam ${title.slice(0,-1).toLowerCase()}`} 
                        value={newItem.name} 
                        onChange={e => setNewItem({ ...newItem, name: e.target.value })} 
                        className="p-2 border rounded" 
                    />
                    <input 
                        type="number" 
                        placeholder="Betalingstermijn (dagen)" 
                        value={newItem.paymentTerm} 
                        onChange={e => setNewItem({ ...newItem, paymentTerm: e.target.value })} 
                        className="p-2 border rounded" 
                        min="1"
                        max="365"
                    />
                    <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        {isEditing ? 'Opslaan' : 'Toevoegen'}
                    </button>
                    {isEditing && (
                        <button onClick={handleCancelEdit} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
                            Annuleren
                        </button>
                    )}
                </div>
            </div>
            
            <DataTable
                headers={['Naam', 'Betalingstermijn', 'Acties']}
                rows={debtors.map(d => ({
                    id: d.id,
                    cols: [
                        d.name, 
                        `${d.paymentTerm} dagen`, 
                        <div className="flex gap-2">
                            {!d.isSystem && (
                                <>
                                    <button onClick={() => handleEditClick(d)} className="text-blue-600 hover:text-blue-800">
                                        <Edit size={16} />
                                    </button>
                                    <button onClick={() => onDelete(d.id)} className="text-red-600 hover:text-red-800">
                                        <Trash2 size={16} />
                                    </button>
                                </>
                            )}
                            {d.isSystem && (
                                <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">Systeem</span>
                            )}
                        </div>
                    ]
                }))}
            />
        </div>
    );
};

// Main Application Component
const CashflowDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [notification, setNotification] = useState(null);
    
    // Initial data with enhanced structure
    const initialData = {
        startBalance: 25000,
        insurers: [
            { id: generateUniqueId(), name: 'Zilveren Kruis', paymentTerm: 30, isSystem: false },
            { id: generateUniqueId(), name: 'VGZ', paymentTerm: 28, isSystem: false },
            { id: generateUniqueId(), name: 'CZ', paymentTerm: 30, isSystem: false },
            { id: generateUniqueId(), name: 'Menzis', paymentTerm: 28, isSystem: false }
        ],
        declarations: [],
        otherDebtors: [
            { id: generateUniqueId(), name: 'Onderhuur Kantoorruimte', paymentTerm: 7, isSystem: false },
            { id: generateUniqueId(), name: 'Privé Behandelingen', paymentTerm: 14, isSystem: false }
        ],
        otherInvoices: [],
        fixedCreditors: [
            { id: generateUniqueId(), name: 'Huur kantoor', amount: 1200, dayOfMonth: 1, isSystem: false },
            { id: generateUniqueId(), name: 'Salaris', amount: 5500, dayOfMonth: 28, isSystem: false },
            { id: generateUniqueId(), name: 'Verzekeringen', amount: 450, dayOfMonth: 15, isSystem: false }
        ],
        variableExpenses: [],
        bankTransactions: [],
        corrections: []
    };
    
    // State management with enhanced localStorage integration
    const [startBalance, setStartBalance] = useState(() => 
        loadFromLocalStorage('cashflow_startBalance', initialData.startBalance));
    const [insurers, setInsurers] = useState(() => 
        loadFromLocalStorage('cashflow_insurers', initialData.insurers));
    const [declarations, setDeclarations] = useState(() => 
        loadFromLocalStorage('cashflow_declarations', initialData.declarations));
    const [otherDebtors, setOtherDebtors] = useState(() => 
        loadFromLocalStorage('cashflow_otherDebtors', initialData.otherDebtors));
    const [otherInvoices, setOtherInvoices] = useState(() => 
        loadFromLocalStorage('cashflow_otherInvoices', initialData.otherInvoices));
    const [fixedCreditors, setFixedCreditors] = useState(() => 
        loadFromLocalStorage('cashflow_fixedCreditors', initialData.fixedCreditors));
    const [variableExpenses, setVariableExpenses] = useState(() => 
        loadFromLocalStorage('cashflow_variableExpenses', initialData.variableExpenses));
    const [bankTransactions, setBankTransactions] = useState(() => 
        loadFromLocalStorage('cashflow_bankTransactions', []));
    const [corrections, setCorrections] = useState(() => 
        loadFromLocalStorage('cashflow_corrections', initialData.corrections));
    
    // Auto-save to localStorage
    useAutoSave('cashflow_startBalance', startBalance);
    useAutoSave('cashflow_insurers', insurers);
    useAutoSave('cashflow_declarations', declarations);
    useAutoSave('cashflow_otherDebtors', otherDebtors);
    useAutoSave('cashflow_otherInvoices', otherInvoices);
    useAutoSave('cashflow_fixedCreditors', fixedCreditors);
    useAutoSave('cashflow_variableExpenses', variableExpenses);
    useAutoSave('cashflow_bankTransactions', bankTransactions);
    useAutoSave('cashflow_corrections', corrections);

    // Notification helper
    const showNotification = useCallback((message, type = 'info') => {
        setNotification({ message, type });
    }, []);

    // Declaration handlers
    const handleAddDeclaration = useCallback((declaration) => {
        setDeclarations(prev => [...prev, { ...declaration, id: generateUniqueId() }]);
        showNotification('Declaratie toegevoegd', 'success');
    }, [showNotification]);

    const handleUpdateDeclaration = useCallback((updatedDeclaration) => {
        setDeclarations(prev => prev.map(decl => decl.id === updatedDeclaration.id ? updatedDeclaration : decl));
        showNotification('Declaratie bijgewerkt', 'success');
    }, [showNotification]);

    const handleDeleteDeclaration = useCallback((id) => {
        if (window.confirm('Weet je zeker dat je deze declaratie wilt verwijderen?')) {
            setDeclarations(prev => prev.filter(decl => decl.id !== id));
            showNotification('Declaratie verwijderd', 'success');
        }
    }, [showNotification]);

    // Other Invoice handlers
    const handleAddOtherInvoice = useCallback((invoice) => {
        setOtherInvoices(prev => [...prev, { ...invoice, id: generateUniqueId() }]);
        showNotification('Factuur toegevoegd', 'success');
    }, [showNotification]);

    const handleUpdateOtherInvoice = useCallback((updatedInvoice) => {
        setOtherInvoices(prev => prev.map(inv => inv.id === updatedInvoice.id ? updatedInvoice : inv));
        showNotification('Factuur bijgewerkt', 'success');
    }, [showNotification]);

    const handleDeleteOtherInvoice = useCallback((id) => {
        if (window.confirm('Weet je zeker dat je deze factuur wilt verwijderen?')) {
            setOtherInvoices(prev => prev.filter(inv => inv.id !== id));
            showNotification('Factuur verwijderd', 'success');
        }
    }, [showNotification]);

    // Fixed Expense handlers
    const handleAddFixedExpense = useCallback((expense) => {
        setFixedCreditors(prev => [...prev, { ...expense, id: generateUniqueId() }]);
        showNotification('Vaste uitgave toegevoegd', 'success');
    }, [showNotification]);

    const handleUpdateFixedExpense = useCallback((updatedExpense) => {
        setFixedCreditors(prev => prev.map(exp => exp.id === updatedExpense.id ? updatedExpense : exp));
        showNotification('Vaste uitgave bijgewerkt', 'success');
    }, [showNotification]);

    const handleDeleteFixedExpense = useCallback((id) => {
        if (window.confirm('Weet je zeker dat je deze vaste uitgave wilt verwijderen?')) {
            setFixedCreditors(prev => prev.filter(exp => exp.id !== id));
            showNotification('Vaste uitgave verwijderd', 'success');
        }
    }, [showNotification]);

    // Variable Expense handlers
    const handleAddVariableExpense = useCallback((expense) => {
        setVariableExpenses(prev => [...prev, { ...expense, id: generateUniqueId() }]);
        showNotification('Variabele uitgave toegevoegd', 'success');
    }, [showNotification]);

    const handleUpdateVariableExpense = useCallback((updatedExpense) => {
        setVariableExpenses(prev => prev.map(exp => exp.id === updatedExpense.id ? updatedExpense : exp));
        showNotification('Variabele uitgave bijgewerkt', 'success');
    }, [showNotification]);

    const handleDeleteVariableExpense = useCallback((id) => {
        if (window.confirm('Weet je zeker dat je deze uitgave wilt verwijderen?')) {
            setVariableExpenses(prev => prev.filter(exp => exp.id !== id));
            showNotification('Variabele uitgave verwijderd', 'success');
        }
    }, [showNotification]);

    // Bank Transaction handlers
    const handleAddBankTransaction = useCallback((transaction) => {
        setBankTransactions(prev => [...prev, { ...transaction, id: generateUniqueId() }]);
        showNotification('Banktransactie toegevoegd', 'success');
    }, [showNotification]);

    const handleUpdateBankTransaction = useCallback((updatedTransaction) => {
        setBankTransactions(prev => prev.map(trans => trans.id === updatedTransaction.id ? updatedTransaction : trans));
        showNotification('Banktransactie bijgewerkt', 'success');
    }, [showNotification]);

    const handleDeleteBankTransaction = useCallback((id) => {
        if (window.confirm('Weet je zeker dat je deze transactie wilt verwijderen?')) {
            setBankTransactions(prev => prev.filter(trans => trans.id !== id));
            showNotification('Banktransactie verwijderd', 'success');
        }
    }, [showNotification]);

    const handleMatchTransaction = useCallback((transactionId, matchType, matchId) => {
        setBankTransactions(prev => prev.map(trans => {
            if (trans.id === transactionId) {
                return {
                    ...trans,
                    status: 'matched',
                    matchedType: matchType,
                    matchedWith: matchId
                };
            }
            return trans;
        }));
        
        // Update the matched item status if applicable
        if (matchType === 'declaration') {
            setDeclarations(prev => prev.map(decl => 
                decl.id === matchId ? { ...decl, status: 'paid' } : decl
            ));
        } else if (matchType === 'invoice') {
            setOtherInvoices(prev => prev.map(inv => 
                inv.id === matchId ? { ...inv, status: 'paid' } : inv
            ));
        }
        
        showNotification('Transactie gekoppeld', 'success');
    }, [showNotification]);

    // Correction handlers
    const handleAddCorrection = useCallback((correction) => {
        setCorrections(prev => [...prev, { ...correction, id: generateUniqueId() }]);
        showNotification('Correctie toegevoegd', 'success');
    }, [showNotification]);

    const handleUpdateCorrection = useCallback((updatedCorrection) => {
        setCorrections(prev => prev.map(corr => corr.id === updatedCorrection.id ? updatedCorrection : corr));
        showNotification('Correctie bijgewerkt', 'success');
    }, [showNotification]);

    const handleDeleteCorrection = useCallback((id) => {
        if (window.confirm('Weet je zeker dat je deze correctie wilt verwijderen?')) {
            setCorrections(prev => prev.filter(corr => corr.id !== id));
            showNotification('Correctie verwijderd', 'success');
        }
    }, [showNotification]);

    const handleProcessCorrection = useCallback((correction, originalItem) => {
        if (correction.type === 'correction' && originalItem) {
            // Update original item
            const newAmount = originalItem.amount + correction.amount;
            
            if (originalItem.insurerName) {
                // It's a declaration
                setDeclarations(prev => prev.map(decl => 
                    decl.id === originalItem.id ? { ...decl, amount: newAmount } : decl
                ));
            } else if (originalItem.debtorName) {
                // It's an other invoice
                setOtherInvoices(prev => prev.map(inv => 
                    inv.id === originalItem.id ? { ...inv, amount: newAmount } : inv
                ));
            }
            
            // Mark correction as processed
            setCorrections(prev => prev.map(corr => 
                corr.id === correction.id ? { ...corr, processed: true, status: 'processed' } : corr
            ));
            
            showNotification('Correctie verwerkt - oorspronkelijke factuur aangepast', 'success');
        } else {
            // Create new credit note as declaration or other invoice
            const creditData = {
                date: correction.date,
                amount: Math.abs(correction.amount),
                status: 'pending',
                description: correction.description || 'Creditnota',
                reference: correction.reference
            };
            
            // Assume credit note goes to first insurer for simplicity
            if (insurers.length > 0) {
                const creditDeclaration = {
                    ...creditData,
                    insurerName: insurers[0].name,
                    invoiceNumber: correction.reference || `CREDIT-${Date.now()}`,
                    patientName: '',
                    originalAmount: Math.abs(correction.amount)
                };
                handleAddDeclaration(creditDeclaration);
            }
            
            // Mark correction as processed
            setCorrections(prev => prev.map(corr => 
                corr.id === correction.id ? { ...corr, processed: true, status: 'processed' } : corr
            ));
            
            showNotification('Creditnota aangemaakt', 'success');
        }
    }, [insurers, handleAddDeclaration, showNotification]);

    // Debtor handlers
    const handleAddDebtor = useCallback((type) => (debtor) => {
        const setter = type === 'insurers' ? setInsurers : setOtherDebtors;
        setter(prev => [...prev, { ...debtor, id: generateUniqueId(), isSystem: false }]);
        showNotification(`${type === 'insurers' ? 'Verzekeraar' : 'Debiteur'} toegevoegd`, 'success');
    }, [showNotification]);

    const handleUpdateDebtor = useCallback((type) => (updatedDebtor) => {
        const setter = type === 'insurers' ? setInsurers : setOtherDebtors;
        setter(prev => prev.map(item => item.id === updatedDebtor.id ? updatedDebtor : item));
        showNotification(`${type === 'insurers' ? 'Verzekeraar' : 'Debiteur'} bijgewerkt`, 'success');
    }, [showNotification]);

    const handleDeleteDebtor = useCallback((type) => (id) => {
        if (window.confirm('Weet je zeker dat je deze wilt verwijderen?')) {
            const setter = type === 'insurers' ? setInsurers : setOtherDebtors;
            setter(prev => prev.filter(item => item.id !== id));
            showNotification(`${type === 'insurers' ? 'Verzekeraar' : 'Debiteur'} verwijderd`, 'success');
        }
    }, [showNotification]);

    // Configuration handlers
    const handleUpdateStartBalance = useCallback((newBalance) => {
        setStartBalance(newBalance);
        showNotification('Beginstand bijgewerkt', 'success');
    }, [showNotification]);

    const handleExportData = useCallback(() => {
        const allData = {
            startBalance,
            insurers,
            declarations,
            otherDebtors,
            otherInvoices,
            fixedCreditors,
            variableExpenses,
            bankTransactions,
            corrections
        };
        return allData;
    }, [startBalance, insurers, declarations, otherDebtors, otherInvoices, fixedCreditors, variableExpenses, bankTransactions, corrections]);

    const handleImportData = useCallback((data) => {
        try {
            if (data.startBalance !== undefined) setStartBalance(data.startBalance);
            if (data.insurers) setInsurers(data.insurers);
            if (data.declarations) setDeclarations(data.declarations);
            if (data.otherDebtors) setOtherDebtors(data.otherDebtors);
            if (data.otherInvoices) setOtherInvoices(data.otherInvoices);
            if (data.fixedCreditors) setFixedCreditors(data.fixedCreditors);
            if (data.variableExpenses) setVariableExpenses(data.variableExpenses);
            if (data.bankTransactions) setBankTransactions(data.bankTransactions);
            if (data.corrections) setCorrections(data.corrections);
            
            showNotification('Data succesvol geïmporteerd', 'success');
        } catch (error) {
            showNotification('Fout bij importeren: ' + error.message, 'error');
        }
    }, [showNotification]);
    
    // Calculate enhanced cashflow data with daily breakdown
    const { cashflowData, dailyCashflowData } = useMemo(() => {
        const yearlyData = [];
        const dailyData = [];
        const startDate = new Date('2025-01-01');
        const endDate = new Date('2025-12-31');
        const today = new Date();
        const next30Days = new Date(today);
        next30Days.setDate(today.getDate() + 30);
        
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            const currentDayOfMonth = d.getDate();
            let income = 0;
            let expenses = 0;

            // Calculate expected income from declarations
            declarations.forEach(decl => {
                if (decl.status !== 'paid') {
                    const insurer = insurers.find(i => i.name === decl.insurerName);
                    const paymentDate = getExpectedPaymentDateByTerm(decl.date, insurer?.paymentTerm || 30);
                    if (paymentDate === dateStr) income += decl.amount;
                }
            });

            // Calculate expected income from other invoices
            otherInvoices.forEach(inv => {
                if (inv.status !== 'paid') {
                    const debtor = otherDebtors.find(d => d.name === inv.debtorName);
                    const paymentDate = getExpectedPaymentDateByTerm(inv.date, debtor?.paymentTerm || 30);
                    if (paymentDate === dateStr) income += inv.amount;
                }
            });

            // Calculate fixed expenses
            fixedCreditors.forEach(cred => {
                if (cred.dayOfMonth === currentDayOfMonth) expenses += cred.amount;
            });
            
            // Calculate variable expenses
            variableExpenses.forEach(exp => {
                if (exp.date === dateStr) expenses += exp.amount;
            });
            
            const dayData = { 
                date: dateStr, 
                dateNL: formatDateNL(dateStr).substring(0, 6), 
                income, 
                expenses, 
                net: income - expenses 
            };
            
            yearlyData.push(dayData);
            
            // Add to daily data if within next 30 days
            if (d >= today && d <= next30Days) {
                dailyData.push(dayData);
            }
        }
        
        // Calculate running balance for yearly data
        let balance = startBalance;
        const yearlyWithBalance = yearlyData.map(day => ({ 
            ...day, 
            balance: balance += day.net 
        }));
        
        // Calculate running balance for daily data
        balance = startBalance;
        // Add days from start of year to today to get correct starting balance
        for (const day of yearlyWithBalance) {
            if (new Date(day.date) < today) {
                balance = day.balance;
            } else {
                break;
            }
        }
        
        const dailyWithBalance = dailyData.map(day => ({ 
            ...day, 
            balance: balance += day.net 
        }));
        
        return { 
            cashflowData: yearlyWithBalance, 
            dailyCashflowData: dailyWithBalance 
        };
    }, [declarations, fixedCreditors, otherInvoices, variableExpenses, insurers, otherDebtors, startBalance]);
    
    // Calculate statistics
    const stats = useMemo(() => {
        const totalIncome = dailyCashflowData.reduce((sum, day) => sum + day.income, 0);
        const totalExpenses = dailyCashflowData.reduce((sum, day) => sum + day.expenses, 0);
        const endBalance = dailyCashflowData.length > 0 ? 
            dailyCashflowData[dailyCashflowData.length - 1].balance : 
            startBalance;
        
        return { 
            totalIncome, 
            totalExpenses, 
            netCashflow: totalIncome - totalExpenses, 
            endBalance 
        };
    }, [dailyCashflowData, startBalance]);

    // Tab configuration with enhanced navigation
    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: <PieChart size={16} />, description: 'Overzicht en grafieken' },
        { id: 'declarations', label: 'Declaraties', icon: <FileText size={16} />, description: 'Declaraties naar verzekeraars' },
        { id: 'other-invoices', label: 'Andere Facturen', icon: <FileText size={16} />, description: 'Facturen aan andere debiteuren' },
        { id: 'fixed-expenses', label: 'Vaste Uitgaven', icon: <Calendar size={16} />, description: 'Maandelijks terugkerende kosten' },
        { id: 'variable-expenses', label: 'Variabele Uitgaven', icon: <Euro size={16} />, description: 'Eenmalige uitgaven' },
        { id: 'corrections', label: 'Correcties', icon: <RefreshCw size={16} />, description: 'Correcties en creditnota\'s' },
        { id: 'bank-reconciliation', label: 'Bank Reconciliatie', icon: <CreditCard size={16} />, description: 'Koppel banktransacties' },
        { id: 'insurers', label: 'Verzekeraars', icon: <Banknote size={16} />, description: 'Beheer verzekeraars' },
        { id: 'other-debtors', label: 'Andere Debiteuren', icon: <Banknote size={16} />, description: 'Beheer andere debiteuren' },
        { id: 'configuration', label: 'Configuratie', icon: <Settings size={16} />, description: 'Instellingen en data beheer' },
    ];

    const allData = {
        startBalance,
        insurers,
        declarations,
        otherDebtors,
        otherInvoices,
        fixedCreditors,
        variableExpenses,
        bankTransactions,
        corrections
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Enhanced Navigation */}
            <nav className="bg-white shadow-lg border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <Target className="text-blue-600" />
                                    Cashflow Dashboard
                                </h1>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <div className="text-sm text-gray-500">
                                Huidig saldo: <span className="font-semibold text-gray-900">{formatCurrencyNL(startBalance)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Tab Navigation */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-1 overflow-x-auto py-2">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`${
                                    activeTab === tab.id
                                        ? 'bg-blue-50 text-blue-700 border-blue-300'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 border-transparent'
                                } whitespace-nowrap py-2 px-4 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors`}
                                title={tab.description}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    {activeTab === 'dashboard' && (
                        <DashboardTab 
                            stats={stats} 
                            cashflowData={cashflowData} 
                            dailyCashflowData={dailyCashflowData} 
                        />
                    )}
                    
                    {activeTab === 'declarations' && (
                        <DeclarationsTab
                            declarations={declarations}
                            insurers={insurers}
                            onAdd={handleAddDeclaration}
                            onUpdate={handleUpdateDeclaration}
                            onDelete={handleDeleteDeclaration}
                        />
                    )}
                    
                    {activeTab === 'other-invoices' && (
                        <OtherInvoicesTab
                            otherInvoices={otherInvoices}
                            otherDebtors={otherDebtors}
                            onAdd={handleAddOtherInvoice}
                            onUpdate={handleUpdateOtherInvoice}
                            onDelete={handleDeleteOtherInvoice}
                        />
                    )}
                    
                    {activeTab === 'fixed-expenses' && (
                        <FixedExpensesTab
                            fixedCreditors={fixedCreditors}
                            onAdd={handleAddFixedExpense}
                            onUpdate={handleUpdateFixedExpense}
                            onDelete={handleDeleteFixedExpense}
                        />
                    )}
                    
                    {activeTab === 'variable-expenses' && (
                        <VariableExpensesTab
                            expenses={variableExpenses}
                            onAdd={handleAddVariableExpense}
                            onUpdate={handleUpdateVariableExpense}
                            onDelete={handleDeleteVariableExpense}
                        />
                    )}
                    
                    {activeTab === 'corrections' && (
                        <CorrectionsTab
                            corrections={corrections}
                            declarations={declarations}
                            otherInvoices={otherInvoices}
                            onAdd={handleAddCorrection}
                            onUpdate={handleUpdateCorrection}
                            onDelete={handleDeleteCorrection}
                            onProcessCorrection={handleProcessCorrection}
                        />
                    )}
                    
                    {activeTab === 'bank-reconciliation' && (
                        <BankReconciliationTab
                            bankTransactions={bankTransactions}
                            declarations={declarations}
                            otherInvoices={otherInvoices}
                            fixedCreditors={fixedCreditors}
                            variableExpenses={variableExpenses}
                            onAdd={handleAddBankTransaction}
                            onUpdate={handleUpdateBankTransaction}
                            onDelete={handleDeleteBankTransaction}
                            onAddVariableExpense={handleAddVariableExpense}
                            onMatchTransaction={handleMatchTransaction}
                        />
                    )}
                    
                    {activeTab === 'insurers' && (
                        <DebtorManagementTab
                            title="Verzekeraars"
                            debtors={insurers}
                            onAdd={handleAddDebtor('insurers')}
                            onUpdate={handleUpdateDebtor('insurers')}
                            onDelete={handleDeleteDebtor('insurers')}
                        />
                    )}
                    
                    {activeTab === 'other-debtors' && (
                        <DebtorManagementTab
                            title="Andere Debiteuren"
                            debtors={otherDebtors}
                            onAdd={handleAddDebtor('other-debtors')}
                            onUpdate={handleUpdateDebtor('other-debtors')}
                            onDelete={handleDeleteDebtor('other-debtors')}
                        />
                    )}
                    
                    {activeTab === 'configuration' && (
                        <ConfigurationTab
                            startBalance={startBalance}
                            onUpdateStartBalance={handleUpdateStartBalance}
                            onExportData={handleExportData}
                            onImportData={handleImportData}
                            allData={allData}
                        />
                    )}
                </div>
            </main>

            {/* Notifications */}
            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 mt-12">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <p className="text-sm text-gray-500">
                                © 2025 Cashflow Dashboard - Intelligente Financiële Analyse voor de Praktijk
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span>Data opgeslagen lokaal</span>
                            <span>•</span>
                            <span>Auto-save actief</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default CashflowDashboard;