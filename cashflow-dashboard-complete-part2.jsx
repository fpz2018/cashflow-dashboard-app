// Continue from part 1...

// Enhanced Import Form Components
const ImportForm = ({ title, onImport, onClose, placeholder, example }) => {
    const [pasteData, setPasteData] = useState('');
    const [importFeedback, setImportFeedback] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleImport = async () => {
        if (!pasteData.trim()) {
            setImportFeedback({
                newData: [],
                skippedRows: [{ row: 1, reason: 'Geen data ingevoerd', originalData: '' }]
            });
            return;
        }

        setIsProcessing(true);
        try {
            const feedback = onImport(pasteData);
            setImportFeedback(feedback);
            
            if (feedback.newData.length > 0 && feedback.skippedRows.length === 0) {
                setTimeout(() => {
                    onClose();
                }, 2000);
            }
        } catch (error) {
            setImportFeedback({
                newData: [],
                skippedRows: [{ row: 1, reason: error.message, originalData: pasteData.split('\n')[0] }]
            });
        }
        setIsProcessing(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
                </div>
                
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">Instructies:</h4>
                    <p className="text-sm text-blue-700 mb-2">{placeholder}</p>
                    {example && (
                        <div>
                            <p className="text-sm font-medium text-blue-800 mb-1">Voorbeeld:</p>
                            <pre className="text-xs bg-blue-100 p-2 rounded font-mono overflow-x-auto">{example}</pre>
                        </div>
                    )}
                </div>

                <textarea
                    className="w-full h-48 p-3 border rounded-lg font-mono text-sm"
                    placeholder="Plak hier je data..."
                    value={pasteData}
                    onChange={(e) => setPasteData(e.target.value)}
                />

                <div className="flex gap-3 mt-4">
                    <button
                        onClick={handleImport}
                        disabled={isProcessing || !pasteData.trim()}
                        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
                    >
                        {isProcessing ? (
                            <>
                                <RefreshCw className="animate-spin" size={16} />
                                Verwerken...
                            </>
                        ) : (
                            <>
                                <Upload size={16} />
                                Importeren ({pasteData.trim().split('\n').filter(line => line.trim()).length} regels)
                            </>
                        )}
                    </button>
                    <button
                        onClick={() => setPasteData('')}
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                        disabled={isProcessing}
                    >
                        Leegmaken
                    </button>
                </div>

                <ImportFeedback feedback={importFeedback} onClear={() => setImportFeedback(null)} />
            </div>
        </div>
    );
};

// Declarations Management Tab
const DeclarationsTab = ({ declarations, insurers, onAdd, onUpdate, onDelete, onBulkImport }) => {
    const [newDeclaration, setNewDeclaration] = useState({ 
        date: '', 
        insurerName: '', 
        amount: '', 
        invoiceNumber: '', 
        patientName: '' 
    });
    const [editingId, setEditingId] = useState(null);
    const [showImportForm, setShowImportForm] = useState(false);
    const [importFeedback, setImportFeedback] = useState(null);
    
    const isEditing = editingId !== null;
    const latestDate = getLatestDate(declarations);

    const handleEditClick = useCallback((declaration) => {
        setEditingId(declaration.id);
        setNewDeclaration({
            date: declaration.date,
            insurerName: declaration.insurerName,
            amount: declaration.amount.toString(),
            invoiceNumber: declaration.invoiceNumber,
            patientName: declaration.patientName
        });
    }, []);

    const handleCancelEdit = useCallback(() => {
        setEditingId(null);
        setNewDeclaration({ date: '', insurerName: '', amount: '', invoiceNumber: '', patientName: '' });
    }, []);

    const handleSave = useCallback(() => {
        try {
            const declarationData = {
                date: normalizeDate(newDeclaration.date),
                insurerName: newDeclaration.insurerName.trim(),
                amount: normalizeAmount(newDeclaration.amount),
                invoiceNumber: newDeclaration.invoiceNumber.trim(),
                patientName: newDeclaration.patientName.trim(),
                status: 'pending'
            };
            
            if (!declarationData.insurerName) {
                throw new Error('Verzekeraar is verplicht');
            }
            if (declarationData.amount <= 0) {
                throw new Error('Bedrag moet groter dan 0 zijn');
            }
            
            if (isEditing) {
                onUpdate({ id: editingId, ...declarationData, originalAmount: declarationData.amount });
            } else {
                onAdd({ ...declarationData, originalAmount: declarationData.amount });
            }
            handleCancelEdit();
        } catch (error) {
            alert('Fout: ' + error.message);
        }
    }, [newDeclaration, isEditing, editingId, onUpdate, onAdd, handleCancelEdit]);

    const handleBulkImport = useCallback((pasteData) => {
        const feedback = processDeclarationsData(pasteData);
        if (feedback.newData && feedback.newData.length > 0) {
            feedback.newData.forEach(declaration => {
                onAdd(declaration);
            });
            setImportFeedback(feedback);
        }
        return feedback;
    }, [onAdd]);

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800',
            paid: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
                {status === 'pending' ? 'Open' : status === 'paid' ? 'Betaald' : 'Geannuleerd'}
            </span>
        );
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-2xl font-semibold">Declaraties Beheer</h2>
                    <p className="text-gray-600 text-sm">Beheer uitgaande declaraties naar verzekeraars</p>
                </div>
                <button
                    onClick={() => setShowImportForm(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
                >
                    <Upload size={16} />
                    Bulk Import
                </button>
            </div>

            <LastImportInfo date={latestDate} label="Laatste declaratie" />

            <div className="bg-gray-50 p-4 rounded mb-6">
                <h3 className="font-medium mb-2">{isEditing ? 'Declaratie wijzigen' : 'Nieuwe declaratie toevoegen'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <input 
                        type="date" 
                        value={newDeclaration.date} 
                        onChange={e => setNewDeclaration({ ...newDeclaration, date: e.target.value })} 
                        className="p-2 border rounded" 
                    />
                    <select
                        value={newDeclaration.insurerName}
                        onChange={e => setNewDeclaration({ ...newDeclaration, insurerName: e.target.value })}
                        className="p-2 border rounded"
                    >
                        <option value="">Kies verzekeraar...</option>
                        {insurers.map(ins => (
                            <option key={ins.id} value={ins.name}>{ins.name}</option>
                        ))}
                    </select>
                    <input 
                        type="text" 
                        placeholder="Bedrag (€)" 
                        value={newDeclaration.amount} 
                        onChange={e => setNewDeclaration({ ...newDeclaration, amount: e.target.value })} 
                        className="p-2 border rounded" 
                    />
                    <input 
                        type="text" 
                        placeholder="Factuurnummer" 
                        value={newDeclaration.invoiceNumber} 
                        onChange={e => setNewDeclaration({ ...newDeclaration, invoiceNumber: e.target.value })} 
                        className="p-2 border rounded" 
                    />
                    <input 
                        type="text" 
                        placeholder="Patiënt naam" 
                        value={newDeclaration.patientName} 
                        onChange={e => setNewDeclaration({ ...newDeclaration, patientName: e.target.value })} 
                        className="p-2 border rounded" 
                    />
                    <div className="flex gap-2">
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
            </div>

            <ImportFeedback feedback={importFeedback} onClear={() => setImportFeedback(null)} />

            <DataTable
                headers={['Datum', 'Verzekeraar', 'Bedrag', 'Factuurnummer', 'Patiënt', 'Status', 'Acties']}
                rows={declarations
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map(decl => ({
                        id: decl.id,
                        cols: [
                            formatDateNL(decl.date),
                            decl.insurerName,
                            formatCurrencyNL(decl.amount),
                            decl.invoiceNumber || '-',
                            decl.patientName || '-',
                            getStatusBadge(decl.status),
                            <div className="flex gap-2">
                                <button onClick={() => handleEditClick(decl)} className="text-blue-600 hover:text-blue-800">
                                    <Edit size={16} />
                                </button>
                                <button onClick={() => onDelete(decl.id)} className="text-red-600 hover:text-red-800">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ]
                    }))}
            />

            {showImportForm && (
                <ImportForm
                    title="Declaraties Importeren"
                    onImport={handleBulkImport}
                    onClose={() => setShowImportForm(false)}
                    placeholder="Kopieer data uit EPD of Excel met kolommen: Datum, Verzekeraar, Bedrag, Factuurnummer (optioneel), Patiënt (optioneel)"
                    example="Datum	Verzekeraar	Bedrag	Factuurnummer	Patient
01-01-2025	Zilveren Kruis	€85.50	2025001	Jan Jansen
15-01-2025	VGZ	125.00	2025002	Maria Pietersen"
                />
            )}
        </div>
    );
};

// Other Invoices Management Tab
const OtherInvoicesTab = ({ otherInvoices, otherDebtors, onAdd, onUpdate, onDelete, onBulkImport }) => {
    const [newInvoice, setNewInvoice] = useState({ 
        date: '', 
        debtorName: '', 
        amount: '', 
        description: '', 
        invoiceNumber: '' 
    });
    const [editingId, setEditingId] = useState(null);
    const [showImportForm, setShowImportForm] = useState(false);
    const [importFeedback, setImportFeedback] = useState(null);
    
    const isEditing = editingId !== null;
    const latestDate = getLatestDate(otherInvoices);

    const handleEditClick = useCallback((invoice) => {
        setEditingId(invoice.id);
        setNewInvoice({
            date: invoice.date,
            debtorName: invoice.debtorName,
            amount: invoice.amount.toString(),
            description: invoice.description,
            invoiceNumber: invoice.invoiceNumber
        });
    }, []);

    const handleCancelEdit = useCallback(() => {
        setEditingId(null);
        setNewInvoice({ date: '', debtorName: '', amount: '', description: '', invoiceNumber: '' });
    }, []);

    const handleSave = useCallback(() => {
        try {
            const invoiceData = {
                date: normalizeDate(newInvoice.date),
                debtorName: newInvoice.debtorName.trim(),
                amount: normalizeAmount(newInvoice.amount),
                description: newInvoice.description.trim(),
                invoiceNumber: newInvoice.invoiceNumber.trim(),
                status: 'pending'
            };
            
            if (!invoiceData.debtorName) {
                throw new Error('Debiteur is verplicht');
            }
            if (invoiceData.amount <= 0) {
                throw new Error('Bedrag moet groter dan 0 zijn');
            }
            
            if (isEditing) {
                onUpdate({ id: editingId, ...invoiceData, originalAmount: invoiceData.amount });
            } else {
                onAdd({ ...invoiceData, originalAmount: invoiceData.amount });
            }
            handleCancelEdit();
        } catch (error) {
            alert('Fout: ' + error.message);
        }
    }, [newInvoice, isEditing, editingId, onUpdate, onAdd, handleCancelEdit]);

    const handleBulkImport = useCallback((pasteData) => {
        const feedback = processOtherInvoicesData(pasteData);
        if (feedback.newData && feedback.newData.length > 0) {
            feedback.newData.forEach(invoice => {
                onAdd(invoice);
            });
            setImportFeedback(feedback);
        }
        return feedback;
    }, [onAdd]);

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800',
            paid: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
                {status === 'pending' ? 'Open' : status === 'paid' ? 'Betaald' : 'Geannuleerd'}
            </span>
        );
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-2xl font-semibold">Andere Facturen</h2>
                    <p className="text-gray-600 text-sm">Beheer facturen aan andere debiteuren (niet-verzekeraars)</p>
                </div>
                <button
                    onClick={() => setShowImportForm(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
                >
                    <Upload size={16} />
                    Bulk Import
                </button>
            </div>

            <LastImportInfo date={latestDate} label="Laatste factuur" />

            <div className="bg-gray-50 p-4 rounded mb-6">
                <h3 className="font-medium mb-2">{isEditing ? 'Factuur wijzigen' : 'Nieuwe factuur toevoegen'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <input 
                        type="date" 
                        value={newInvoice.date} 
                        onChange={e => setNewInvoice({ ...newInvoice, date: e.target.value })} 
                        className="p-2 border rounded" 
                    />
                    <select
                        value={newInvoice.debtorName}
                        onChange={e => setNewInvoice({ ...newInvoice, debtorName: e.target.value })}
                        className="p-2 border rounded"
                    >
                        <option value="">Kies debiteur...</option>
                        {otherDebtors.map(deb => (
                            <option key={deb.id} value={deb.name}>{deb.name}</option>
                        ))}
                    </select>
                    <input 
                        type="text" 
                        placeholder="Bedrag (€)" 
                        value={newInvoice.amount} 
                        onChange={e => setNewInvoice({ ...newInvoice, amount: e.target.value })} 
                        className="p-2 border rounded" 
                    />
                    <input 
                        type="text" 
                        placeholder="Beschrijving" 
                        value={newInvoice.description} 
                        onChange={e => setNewInvoice({ ...newInvoice, description: e.target.value })} 
                        className="p-2 border rounded" 
                    />
                    <input 
                        type="text" 
                        placeholder="Factuurnummer" 
                        value={newInvoice.invoiceNumber} 
                        onChange={e => setNewInvoice({ ...newInvoice, invoiceNumber: e.target.value })} 
                        className="p-2 border rounded" 
                    />
                    <div className="flex gap-2">
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
            </div>

            <ImportFeedback feedback={importFeedback} onClear={() => setImportFeedback(null)} />

            <DataTable
                headers={['Datum', 'Debiteur', 'Bedrag', 'Beschrijving', 'Factuurnummer', 'Status', 'Acties']}
                rows={otherInvoices
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map(inv => ({
                        id: inv.id,
                        cols: [
                            formatDateNL(inv.date),
                            inv.debtorName,
                            formatCurrencyNL(inv.amount),
                            inv.description || '-',
                            inv.invoiceNumber || '-',
                            getStatusBadge(inv.status),
                            <div className="flex gap-2">
                                <button onClick={() => handleEditClick(inv)} className="text-blue-600 hover:text-blue-800">
                                    <Edit size={16} />
                                </button>
                                <button onClick={() => onDelete(inv.id)} className="text-red-600 hover:text-red-800">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ]
                    }))}
            />

            {showImportForm && (
                <ImportForm
                    title="Andere Facturen Importeren"
                    onImport={handleBulkImport}
                    onClose={() => setShowImportForm(false)}
                    placeholder="Kopieer data uit Excel met kolommen: Datum, Debiteur, Bedrag, Beschrijving (optioneel), Factuurnummer (optioneel)"
                    example="Datum	Debiteur	Bedrag	Beschrijving	Factuurnummer
01-01-2025	Onderhuur Kantoor	€750.00	Maandelijkse onderhuur	2025-001
15-01-2025	Privé Behandeling	€120.00	Fysiotherapie	2025-002"
                />
            )}
        </div>
    );
};

// Fixed Expenses Management Tab
const FixedExpensesTab = ({ fixedCreditors, onAdd, onUpdate, onDelete }) => {
    const [newExpense, setNewExpense] = useState({ 
        name: '', 
        amount: '', 
        dayOfMonth: 1 
    });
    const [editingId, setEditingId] = useState(null);
    
    const isEditing = editingId !== null;

    const handleEditClick = useCallback((expense) => {
        setEditingId(expense.id);
        setNewExpense({
            name: expense.name,
            amount: expense.amount.toString(),
            dayOfMonth: expense.dayOfMonth
        });
    }, []);

    const handleCancelEdit = useCallback(() => {
        setEditingId(null);
        setNewExpense({ name: '', amount: '', dayOfMonth: 1 });
    }, []);

    const handleSave = useCallback(() => {
        try {
            const expenseData = {
                name: newExpense.name.trim(),
                amount: normalizeAmount(newExpense.amount),
                dayOfMonth: parseInt(newExpense.dayOfMonth, 10)
            };
            
            if (!expenseData.name) {
                throw new Error('Naam is verplicht');
            }
            if (expenseData.amount <= 0) {
                throw new Error('Bedrag moet groter dan 0 zijn');
            }
            if (expenseData.dayOfMonth < 1 || expenseData.dayOfMonth > 31) {
                throw new Error('Dag van de maand moet tussen 1 en 31 zijn');
            }
            
            if (isEditing) {
                onUpdate({ id: editingId, ...expenseData });
            } else {
                onAdd(expenseData);
            }
            handleCancelEdit();
        } catch (error) {
            alert('Fout: ' + error.message);
        }
    }, [newExpense, isEditing, editingId, onUpdate, onAdd, handleCancelEdit]);

    return (
        <div>
            <div className="mb-4">
                <h2 className="text-2xl font-semibold">Vaste Uitgaven</h2>
                <p className="text-gray-600 text-sm">Beheer maandelijks terugkerende uitgaven met vaste bedragen</p>
            </div>

            <div className="bg-gray-50 p-4 rounded mb-6">
                <h3 className="font-medium mb-2">{isEditing ? 'Vaste uitgave wijzigen' : 'Nieuwe vaste uitgave toevoegen'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input 
                        type="text" 
                        placeholder="Naam uitgave" 
                        value={newExpense.name} 
                        onChange={e => setNewExpense({ ...newExpense, name: e.target.value })} 
                        className="p-2 border rounded" 
                    />
                    <input 
                        type="text" 
                        placeholder="Bedrag (€)" 
                        value={newExpense.amount} 
                        onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })} 
                        className="p-2 border rounded" 
                    />
                    <select
                        value={newExpense.dayOfMonth}
                        onChange={e => setNewExpense({ ...newExpense, dayOfMonth: parseInt(e.target.value) })}
                        className="p-2 border rounded"
                    >
                        {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                            <option key={day} value={day}>{day}e van de maand</option>
                        ))}
                    </select>
                    <div className="flex gap-2">
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
            </div>

            <DataTable
                headers={['Naam', 'Bedrag', 'Dag van de Maand', 'Acties']}
                rows={fixedCreditors.map(exp => ({
                    id: exp.id,
                    cols: [
                        exp.name,
                        formatCurrencyNL(exp.amount),
                        `${exp.dayOfMonth}e van de maand`,
                        <div className="flex gap-2">
                            <button onClick={() => handleEditClick(exp)} className="text-blue-600 hover:text-blue-800">
                                <Edit size={16} />
                            </button>
                            <button onClick={() => onDelete(exp.id)} className="text-red-600 hover:text-red-800">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ]
                }))}
            />
        </div>
    );
};

// Variable Expenses Tab (Enhanced from original)
const VariableExpensesTab = ({ expenses, onAdd, onUpdate, onDelete }) => {
    const [newExpense, setNewExpense] = useState({ date: '', description: '', amount: '', category: 'Algemeen' });
    const [editingId, setEditingId] = useState(null);
    const [showImportForm, setShowImportForm] = useState(false);
    const [importFeedback, setImportFeedback] = useState(null);
    
    const isEditing = editingId !== null;
    const latestDate = getLatestDate(expenses);

    const handleEditClick = useCallback((expense) => {
        setEditingId(expense.id);
        setNewExpense({
            date: expense.date,
            description: expense.description,
            amount: expense.amount.toString(),
            category: expense.category
        });
    }, []);

    const handleCancelEdit = useCallback(() => {
        setEditingId(null);
        setNewExpense({ date: '', description: '', amount: '', category: 'Algemeen' });
    }, []);

    const handleSave = useCallback(() => {
        try {
            const expenseData = {
                date: normalizeDate(newExpense.date),
                description: newExpense.description.trim(),
                amount: normalizeAmount(newExpense.amount),
                category: newExpense.category
            };
            
            if (!expenseData.description) {
                throw new Error('Beschrijving is verplicht');
            }
            if (expenseData.amount <= 0) {
                throw new Error('Bedrag moet groter dan 0 zijn');
            }
            
            if (isEditing) {
                onUpdate({ id: editingId, ...expenseData });
            } else {
                onAdd(expenseData);
            }
            handleCancelEdit();
        } catch (error) {
            alert('Fout: ' + error.message);
        }
    }, [newExpense, isEditing, editingId, onUpdate, onAdd, handleCancelEdit]);

    const handleBulkImport = useCallback((pasteData) => {
        const feedback = processCreditInvoicesData(pasteData);
        if (feedback.newData && feedback.newData.length > 0) {
            feedback.newData.forEach(expense => {
                onAdd(expense);
            });
            setImportFeedback(feedback);
        }
        return feedback;
    }, [onAdd]);

    const categories = [...new Set(['Algemeen', 'Kantoor', 'IT', 'Vervoer', 'Marketing', 'Onderhoud', 'Huisvesting', ...expenses.map(e => e.category)])];

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-2xl font-semibold">Variabele Uitgaven</h2>
                    <p className="text-gray-600 text-sm">Beheer eenmalige en onregelmatige uitgaven</p>
                </div>
                <button
                    onClick={() => setShowImportForm(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
                >
                    <Upload size={16} />
                    Bulk Import
                </button>
            </div>

            <LastImportInfo date={latestDate} label="Laatste uitgave" />

            <div className="bg-gray-50 p-4 rounded mb-6">
                <h3 className="font-medium mb-2">{isEditing ? 'Uitgave wijzigen' : 'Nieuwe uitgave toevoegen'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <input 
                        type="date" 
                        value={newExpense.date} 
                        onChange={e => setNewExpense({ ...newExpense, date: e.target.value })} 
                        className="p-2 border rounded" 
                    />
                    <input 
                        type="text" 
                        placeholder="Beschrijving" 
                        value={newExpense.description} 
                        onChange={e => setNewExpense({ ...newExpense, description: e.target.value })} 
                        className="p-2 border rounded" 
                    />
                    <input 
                        type="text" 
                        placeholder="Bedrag (€)" 
                        value={newExpense.amount} 
                        onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })} 
                        className="p-2 border rounded" 
                    />
                    <select
                        value={newExpense.category}
                        onChange={e => setNewExpense({ ...newExpense, category: e.target.value })}
                        className="p-2 border rounded"
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <div className="flex gap-2">
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
            </div>

            <ImportFeedback feedback={importFeedback} onClear={() => setImportFeedback(null)} />

            <DataTable
                headers={['Datum', 'Beschrijving', 'Bedrag', 'Categorie', 'Acties']}
                rows={expenses
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map(expense => ({
                        id: expense.id,
                        cols: [
                            formatDateNL(expense.date),
                            expense.description,
                            formatCurrencyNL(expense.amount),
                            expense.category,
                            <div className="flex gap-2">
                                <button onClick={() => handleEditClick(expense)} className="text-blue-600 hover:text-blue-800">
                                    <Edit size={16} />
                                </button>
                                <button onClick={() => onDelete(expense.id)} className="text-red-600 hover:text-red-800">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ]
                    }))}
            />

            {showImportForm && (
                <ImportForm
                    title="Variabele Uitgaven Importeren"
                    onImport={handleBulkImport}
                    onClose={() => setShowImportForm(false)}
                    placeholder="Kopieer data uit Excel met kolommen: Datum, Beschrijving, Bedrag, Categorie (optioneel)"
                    example="Datum	Beschrijving	Bedrag	Categorie
01-01-2025	Kantoorartikelen	€125,50	Kantoor
15-01-2025	Software licentie	450.00	IT
25-01-2025	Brandstof	89,75	Vervoer"
                />
            )}
        </div>
    );
};

// Continue with part 3...