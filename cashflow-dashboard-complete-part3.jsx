// Continue from part 2...

// Corrections & Credits Management Tab
const CorrectionsTab = ({ corrections, declarations, otherInvoices, onAdd, onUpdate, onDelete, onBulkImport, onProcessCorrection }) => {
    const [newCorrection, setNewCorrection] = useState({ 
        date: '', 
        type: 'credit', 
        amount: '', 
        originalInvoice: '', 
        description: '',
        reference: '' 
    });
    const [editingId, setEditingId] = useState(null);
    const [showImportForm, setShowImportForm] = useState(false);
    const [importFeedback, setImportFeedback] = useState(null);
    
    const isEditing = editingId !== null;
    const latestDate = getLatestDate(corrections);

    const handleEditClick = useCallback((correction) => {
        setEditingId(correction.id);
        setNewCorrection({
            date: correction.date,
            type: correction.type,
            amount: Math.abs(correction.amount).toString(),
            originalInvoice: correction.originalInvoice,
            description: correction.description,
            reference: correction.reference
        });
    }, []);

    const handleCancelEdit = useCallback(() => {
        setEditingId(null);
        setNewCorrection({ date: '', type: 'credit', amount: '', originalInvoice: '', description: '', reference: '' });
    }, []);

    const handleSave = useCallback(() => {
        try {
            const correctionData = {
                date: normalizeDate(newCorrection.date),
                type: newCorrection.type,
                amount: -Math.abs(normalizeAmount(newCorrection.amount)),
                originalInvoice: newCorrection.originalInvoice.trim(),
                description: newCorrection.description.trim(),
                reference: newCorrection.reference.trim(),
                status: 'pending',
                processed: false
            };
            
            if (correctionData.amount >= 0) {
                throw new Error('Bedrag moet groter dan 0 zijn');
            }
            
            if (isEditing) {
                onUpdate({ id: editingId, ...correctionData });
            } else {
                onAdd(correctionData);
            }
            handleCancelEdit();
        } catch (error) {
            alert('Fout: ' + error.message);
        }
    }, [newCorrection, isEditing, editingId, onUpdate, onAdd, handleCancelEdit]);

    const handleBulkImport = useCallback((pasteData) => {
        const feedback = processCorrectionsData(pasteData);
        if (feedback.newData && feedback.newData.length > 0) {
            feedback.newData.forEach(correction => {
                onAdd(correction);
            });
            setImportFeedback(feedback);
        }
        return feedback;
    }, [onAdd]);

    const handleProcessCorrection = useCallback((correction) => {
        if (correction.type === 'correction' && correction.originalInvoice) {
            // Find and update original invoice
            const originalDeclaration = declarations.find(d => 
                d.invoiceNumber === correction.originalInvoice
            );
            const originalInvoice = otherInvoices.find(i => 
                i.invoiceNumber === correction.originalInvoice
            );

            if (originalDeclaration || originalInvoice) {
                onProcessCorrection(correction, originalDeclaration || originalInvoice);
            } else {
                alert('Oorspronkelijke factuur niet gevonden');
            }
        } else {
            // Create new credit note
            onProcessCorrection(correction, null);
        }
    }, [declarations, otherInvoices, onProcessCorrection]);

    const getStatusBadge = (status, processed) => {
        if (processed) {
            return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Verwerkt</span>;
        }
        
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800',
            processed: 'bg-green-100 text-green-800',
            failed: 'bg-red-100 text-red-800'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
                {status === 'pending' ? 'Wacht' : status === 'processed' ? 'Verwerkt' : 'Mislukt'}
            </span>
        );
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-2xl font-semibold">Correcties & Creditnota's</h2>
                    <p className="text-gray-600 text-sm">Beheer correcties op bestaande facturen en nieuwe creditnota's</p>
                </div>
                <button
                    onClick={() => setShowImportForm(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
                >
                    <Upload size={16} />
                    EPD Import
                </button>
            </div>

            <LastImportInfo date={latestDate} label="Laatste correctie" />

            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">ℹ️ Hoe werkt het?</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                    <li><strong>Correctie:</strong> Als er een "Origineel Factuurnummer" is, wordt de oorspronkelijke factuur aangepast</li>
                    <li><strong>Creditnota:</strong> Zonder origineel factuurnummer wordt een nieuwe creditfactuur aangemaakt</li>
                    <li><strong>Status:</strong> Klik op "Verwerken" om de correctie/credit door te voeren</li>
                </ul>
            </div>

            <div className="bg-gray-50 p-4 rounded mb-6">
                <h3 className="font-medium mb-2">{isEditing ? 'Correctie wijzigen' : 'Nieuwe correctie/credit toevoegen'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                    <input 
                        type="date" 
                        value={newCorrection.date} 
                        onChange={e => setNewCorrection({ ...newCorrection, date: e.target.value })} 
                        className="p-2 border rounded" 
                    />
                    <select
                        value={newCorrection.type}
                        onChange={e => setNewCorrection({ ...newCorrection, type: e.target.value })}
                        className="p-2 border rounded"
                    >
                        <option value="correction">Correctie</option>
                        <option value="credit">Creditnota</option>
                    </select>
                    <input 
                        type="text" 
                        placeholder="Bedrag (€)" 
                        value={newCorrection.amount} 
                        onChange={e => setNewCorrection({ ...newCorrection, amount: e.target.value })} 
                        className="p-2 border rounded" 
                    />
                    <input 
                        type="text" 
                        placeholder="Origineel Factuurnr" 
                        value={newCorrection.originalInvoice} 
                        onChange={e => setNewCorrection({ ...newCorrection, originalInvoice: e.target.value })} 
                        className="p-2 border rounded" 
                        title="Alleen invullen bij correctie van bestaande factuur"
                    />
                    <input 
                        type="text" 
                        placeholder="Beschrijving" 
                        value={newCorrection.description} 
                        onChange={e => setNewCorrection({ ...newCorrection, description: e.target.value })} 
                        className="p-2 border rounded" 
                    />
                    <input 
                        type="text" 
                        placeholder="Referentie" 
                        value={newCorrection.reference} 
                        onChange={e => setNewCorrection({ ...newCorrection, reference: e.target.value })} 
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
                headers={['Datum', 'Type', 'Bedrag', 'Origineel', 'Beschrijving', 'Status', 'Acties']}
                rows={corrections
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map(corr => ({
                        id: corr.id,
                        cols: [
                            formatDateNL(corr.date),
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                corr.type === 'correction' ? 'bg-orange-100 text-orange-800' : 'bg-purple-100 text-purple-800'
                            }`}>
                                {corr.type === 'correction' ? 'Correctie' : 'Creditnota'}
                            </span>,
                            <span className="text-red-600 font-semibold">{formatCurrencyNL(corr.amount)}</span>,
                            corr.originalInvoice || '-',
                            corr.description || '-',
                            getStatusBadge(corr.status, corr.processed),
                            <div className="flex gap-2">
                                {!corr.processed && (
                                    <button 
                                        onClick={() => handleProcessCorrection(corr)} 
                                        className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                                        title="Verwerk deze correctie/credit"
                                    >
                                        Verwerken
                                    </button>
                                )}
                                <button onClick={() => handleEditClick(corr)} className="text-blue-600 hover:text-blue-800">
                                    <Edit size={16} />
                                </button>
                                <button onClick={() => onDelete(corr.id)} className="text-red-600 hover:text-red-800">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ]
                    }))}
            />

            {showImportForm && (
                <ImportForm
                    title="EPD Correcties/Credits Importeren"
                    onImport={handleBulkImport}
                    onClose={() => setShowImportForm(false)}
                    placeholder="Kopieer EPD export data met kolommen: Datum, Bedrag, Origineel (optioneel), Beschrijving (optioneel)"
                    example="Datum	Type	Bedrag	Factuur_Origineel	Beschrijving
01-01-2025	Correctie	€25.50	2024-123	Aanpassing declaratie
15-01-2025	Credit	€100.00		Geannuleerde behandeling"
                />
            )}
        </div>
    );
};

// AI Suggestion Component
const AISuggestion = ({ transaction, onAccept, onReject, isLoading }) => {
    const [suggestion, setSuggestion] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isLoading) {
            setLoading(true);
            setSuggestion(null);
            
            mockAIAssistant(transaction.description, transaction.amount)
                .then(result => {
                    setSuggestion(result);
                    setLoading(false);
                })
                .catch(() => {
                    setLoading(false);
                });
        }
    }, [isLoading, transaction]);

    if (!isLoading && !suggestion) return null;

    return (
        <div className="mt-2 p-3 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
                <Brain className="text-purple-600" size={16} />
                <span className="text-sm font-semibold text-purple-800">AI Assistent Suggestie</span>
            </div>
            
            {loading ? (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <RefreshCw className="animate-spin" size={14} />
                    <span>Analyseren van transactie...</span>
                </div>
            ) : suggestion && (
                <div className="space-y-2">
                    <div className="text-sm">
                        <span className="font-medium text-gray-700">Categorie:</span> 
                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">{suggestion.category}</span>
                    </div>
                    <div className="text-sm">
                        <span className="font-medium text-gray-700">Beschrijving:</span> 
                        <span className="ml-2">{suggestion.suggestedDescription}</span>
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                        Betrouwbaarheid: {Math.round(suggestion.confidence * 100)}%
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => onAccept(suggestion)} 
                            className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 flex items-center gap-1"
                        >
                            <CheckCircle size={12} />
                            Accepteren
                        </button>
                        <button 
                            onClick={onReject} 
                            className="px-3 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600 flex items-center gap-1"
                        >
                            <XCircle size={12} />
                            Afwijzen
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Intelligent Bank Reconciliation Tab
const BankReconciliationTab = ({ 
    bankTransactions, 
    declarations, 
    otherInvoices, 
    fixedCreditors, 
    variableExpenses,
    onAdd, 
    onUpdate, 
    onDelete, 
    onBulkImport,
    onAddVariableExpense,
    onMatchTransaction
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [hideMatched, setHideMatched] = useState(false);
    const [showImportForm, setShowImportForm] = useState(false);
    const [importFeedback, setImportFeedback] = useState(null);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [showAISuggestion, setShowAISuggestion] = useState({});
    const [matchSuggestions, setMatchSuggestions] = useState({});
    
    const latestDate = getLatestDate(bankTransactions);

    // Filter transactions based on search and hide matched
    const filteredTransactions = useMemo(() => {
        return bankTransactions.filter(transaction => {
            const matchesSearch = !searchTerm || 
                transaction.debtorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
            
            const shouldShow = !hideMatched || transaction.status === 'unmatched';
            
            return matchesSearch && shouldShow;
        }).sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [bankTransactions, searchTerm, hideMatched]);

    // Find potential matches for a transaction
    const findPotentialMatches = useCallback((transaction) => {
        const matches = [];
        const amount = Math.abs(transaction.amount);
        const date = new Date(transaction.date);
        
        // Check declarations
        declarations.forEach(decl => {
            if (decl.status === 'pending' && Math.abs(decl.amount - amount) < 0.01) {
                const insurer = insurers.find(ins => ins.name === decl.insurerName);
                const expectedDate = new Date(getExpectedPaymentDateByTerm(decl.date, insurer?.paymentTerm || 30));
                const daysDiff = Math.abs((date - expectedDate) / (1000 * 60 * 60 * 24));
                
                matches.push({
                    type: 'declaration',
                    item: decl,
                    confidence: daysDiff < 7 ? 0.9 : 0.7,
                    reason: `Declaratie ${decl.insurerName} - ${formatCurrencyNL(decl.amount)}`
                });
            }
        });
        
        // Check other invoices
        otherInvoices.forEach(inv => {
            if (inv.status === 'pending' && Math.abs(inv.amount - amount) < 0.01) {
                matches.push({
                    type: 'invoice',
                    item: inv,
                    confidence: 0.8,
                    reason: `Factuur ${inv.debtorName} - ${formatCurrencyNL(inv.amount)}`
                });
            }
        });
        
        // Check fixed expenses (for outgoing payments)
        if (transaction.amount < 0) {
            fixedCreditors.forEach(cred => {
                if (Math.abs(Math.abs(transaction.amount) - cred.amount) < 0.01) {
                    const transactionDay = date.getDate();
                    const confidence = transactionDay === cred.dayOfMonth ? 0.9 : 0.6;
                    
                    matches.push({
                        type: 'fixed_expense',
                        item: cred,
                        confidence,
                        reason: `Vaste uitgave ${cred.name} - ${formatCurrencyNL(cred.amount)}`
                    });
                }
            });
        }
        
        return matches.sort((a, b) => b.confidence - a.confidence);
    }, [declarations, otherInvoices, fixedCreditors]);

    const handleBulkImport = useCallback((pasteData) => {
        const feedback = processBankCsvData(pasteData);
        if (feedback.newData && feedback.newData.length > 0) {
            feedback.newData.forEach(transaction => {
                onAdd(transaction);
            });
            setImportFeedback(feedback);
        }
        return feedback;
    }, [onAdd]);

    const handleMatch = useCallback((transaction, match) => {
        onMatchTransaction(transaction.id, match.type, match.item.id);
        
        // If it's a fixed expense match, suggest bulk matching
        if (match.type === 'fixed_expense') {
            const similarTransactions = bankTransactions.filter(t => 
                t.id !== transaction.id && 
                t.status === 'unmatched' &&
                Math.abs(Math.abs(t.amount) - match.item.amount) < 0.01 &&
                t.description.toLowerCase().includes(transaction.description.toLowerCase().substring(0, 10))
            );
            
            if (similarTransactions.length > 0) {
                const confirmBulk = window.confirm(
                    `Er zijn ${similarTransactions.length} vergelijkbare transacties gevonden. ` +
                    `Wil je deze allemaal koppelen aan "${match.item.name}"?`
                );
                
                if (confirmBulk) {
                    similarTransactions.forEach(t => {
                        onMatchTransaction(t.id, match.type, match.item.id);
                    });
                }
            }
        }
    }, [bankTransactions, onMatchTransaction]);

    const handleAIAccept = useCallback((transaction, suggestion) => {
        const expenseData = {
            date: transaction.date,
            description: suggestion.suggestedDescription,
            amount: Math.abs(transaction.amount),
            category: suggestion.category
        };
        
        onAddVariableExpense(expenseData);
        onMatchTransaction(transaction.id, 'variable_expense', 'new');
        setShowAISuggestion(prev => ({ ...prev, [transaction.id]: false }));
    }, [onAddVariableExpense, onMatchTransaction]);

    const getStatusBadge = (status) => {
        const styles = {
            matched: 'bg-green-100 text-green-800',
            unmatched: 'bg-yellow-100 text-yellow-800',
            ignored: 'bg-gray-100 text-gray-800'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.unmatched}`}>
                {status === 'matched' ? 'Gekoppeld' : status === 'unmatched' ? 'Niet gekoppeld' : 'Genegeerd'}
            </span>
        );
    };

    // Generate match suggestions for all unmatched transactions
    useEffect(() => {
        const suggestions = {};
        filteredTransactions
            .filter(t => t.status === 'unmatched')
            .forEach(transaction => {
                suggestions[transaction.id] = findPotentialMatches(transaction);
            });
        setMatchSuggestions(suggestions);
    }, [filteredTransactions, findPotentialMatches]);

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-2xl font-semibold">Bank Reconciliatie</h2>
                    <p className="text-gray-600 text-sm">Koppel banktransacties aan facturen en uitgaven</p>
                </div>
                <button
                    onClick={() => setShowImportForm(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
                >
                    <Upload size={16} />
                    Bank CSV Import
                </button>
            </div>

            <LastImportInfo date={latestDate} label="Laatste transactie" />

            {/* Filter Controls */}
            <div className="bg-gray-50 p-4 rounded mb-6">
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2">
                        <Search size={16} className="text-gray-500" />
                        <input
                            type="text"
                            placeholder="Zoek op naam of omschrijving..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="px-3 py-2 border rounded-lg"
                        />
                    </div>
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={hideMatched}
                            onChange={(e) => setHideMatched(e.target.checked)}
                            className="rounded"
                        />
                        <span className="text-sm">Verberg gekoppelde transacties</span>
                    </label>
                    <div className="text-sm text-gray-500">
                        Toont {filteredTransactions.length} van {bankTransactions.length} transacties
                    </div>
                </div>
            </div>

            <ImportFeedback feedback={importFeedback} onClear={() => setImportFeedback(null)} />

            {/* Transactions Table */}
            <div className="space-y-4">
                {filteredTransactions.map(transaction => {
                    const suggestions = matchSuggestions[transaction.id] || [];
                    const showingAI = showAISuggestion[transaction.id];
                    
                    return (
                        <div key={transaction.id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                                {/* Transaction Info */}
                                <div className="lg:col-span-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-sm font-medium text-gray-500">
                                            {formatDateNL(transaction.date)}
                                        </span>
                                        {getStatusBadge(transaction.status)}
                                    </div>
                                    <div className="font-semibold text-gray-900 mb-1">
                                        {transaction.debtorName}
                                    </div>
                                    <div className="text-sm text-gray-600 mb-2">
                                        {transaction.description}
                                    </div>
                                    <div className={`text-lg font-bold ${
                                        transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                        {formatCurrencyNL(transaction.amount)}
                                    </div>
                                </div>
                                
                                {/* Match Suggestions */}
                                <div className="lg:col-span-4">
                                    {transaction.status === 'unmatched' && suggestions.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                                Mogelijke koppelingen:
                                            </h4>
                                            <div className="space-y-1">
                                                {suggestions.slice(0, 3).map((match, index) => (
                                                    <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded text-sm">
                                                        <div>
                                                            <div className="font-medium text-blue-800">
                                                                {match.reason}
                                                            </div>
                                                            <div className="text-xs text-blue-600">
                                                                Zekerheid: {Math.round(match.confidence * 100)}%
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleMatch(transaction, match)}
                                                            className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                                                        >
                                                            Koppelen
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {transaction.status === 'matched' && transaction.matchedWith && (
                                        <div className="p-2 bg-green-50 rounded">
                                            <div className="text-sm font-medium text-green-800">
                                                Gekoppeld aan:
                                            </div>
                                            <div className="text-sm text-green-700">
                                                {transaction.matchedType} - {transaction.matchedWith}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Actions */}
                                <div className="lg:col-span-2">
                                    {transaction.status === 'unmatched' && (
                                        <div className="flex flex-col gap-2">
                                            {transaction.amount < 0 && (
                                                <button
                                                    onClick={() => setShowAISuggestion(prev => ({ 
                                                        ...prev, 
                                                        [transaction.id]: !prev[transaction.id] 
                                                    }))}
                                                    className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 flex items-center gap-1"
                                                >
                                                    <Brain size={14} />
                                                    AI Hulp
                                                </button>
                                            )}
                                            <button
                                                onClick={() => onUpdate({ 
                                                    ...transaction, 
                                                    status: 'ignored' 
                                                })}
                                                className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                                            >
                                                Negeren
                                            </button>
                                            <button
                                                onClick={() => onDelete(transaction.id)}
                                                className="text-red-600 hover:text-red-800 text-sm"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* AI Suggestion */}
                            {transaction.amount < 0 && (
                                <AISuggestion
                                    transaction={transaction}
                                    onAccept={(suggestion) => handleAIAccept(transaction, suggestion)}
                                    onReject={() => setShowAISuggestion(prev => ({ ...prev, [transaction.id]: false }))}
                                    isLoading={showingAI}
                                />
                            )}
                        </div>
                    );
                })}
                
                {filteredTransactions.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                        <p>Geen transacties gevonden</p>
                        {searchTerm && <p className="text-sm">Probeer een andere zoekterm</p>}
                    </div>
                )}
            </div>

            {showImportForm && (
                <ImportForm
                    title="Bank CSV Importeren"
                    onImport={handleBulkImport}
                    onClose={() => setShowImportForm(false)}
                    placeholder="Kopieer CSV data van je bank met kolommen: Datum, Naam/Tegenpartij, Omschrijving, Bedrag (of Bij/Af kolommen)"
                    example="Datum,Naam,Omschrijving,Bedrag
01-01-2025,Zilveren Kruis,Declaratiebetaling,€850.00
02-01-2025,Shell,Brandstof,-€67.50
03-01-2025,Kantoor Huur,Maandelijkse huur,-€1200.00"
                />
            )}
        </div>
    );
};

// Configuration Tab
const ConfigurationTab = ({ 
    startBalance, 
    onUpdateStartBalance, 
    onExportData, 
    onImportData,
    allData 
}) => {
    const [newStartBalance, setNewStartBalance] = useState(startBalance.toString());
    const [importing, setImporting] = useState(false);

    const handleUpdateBalance = () => {
        try {
            const balance = normalizeAmount(newStartBalance);
            onUpdateStartBalance(balance);
        } catch (error) {
            alert('Ongeldig bedrag: ' + error.message);
        }
    };

    const handleExport = () => {
        const dataToExport = {
            ...allData,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { 
            type: 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cashflow-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImportFile = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (window.confirm('Weet je zeker dat je alle huidige data wilt vervangen met de geïmporteerde data?')) {
                        onImportData(data);
                    }
                } catch (error) {
                    alert('Ongeldig bestand: ' + error.message);
                }
            };
            reader.readAsText(file);
        }
    };

    const clearAllData = () => {
        if (window.confirm('Weet je zeker dat je ALLE data wilt wissen? Deze actie kan niet ongedaan worden gemaakt.')) {
            if (window.confirm('Laatste waarschuwing: Dit zal alle data permanent verwijderen. Doorgaan?')) {
                localStorage.clear();
                window.location.reload();
            }
        }
    };

    const dataStats = {
        declarations: allData.declarations?.length || 0,
        otherInvoices: allData.otherInvoices?.length || 0,
        variableExpenses: allData.variableExpenses?.length || 0,
        fixedCreditors: allData.fixedCreditors?.length || 0,
        bankTransactions: allData.bankTransactions?.length || 0,
        corrections: allData.corrections?.length || 0,
        insurers: allData.insurers?.length || 0,
        otherDebtors: allData.otherDebtors?.length || 0
    };

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-2">Configuratie & Data Beheer</h2>
                <p className="text-gray-600 text-sm">Beheer instellingen, export en import data</p>
            </div>

            {/* Settings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Settings className="text-blue-600" />
                        Instellingen
                    </h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Beginstand Bankrekening
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newStartBalance}
                                    onChange={(e) => setNewStartBalance(e.target.value)}
                                    className="flex-1 px-3 py-2 border rounded-lg"
                                    placeholder="€ 0,00"
                                />
                                <button
                                    onClick={handleUpdateBalance}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Opslaan
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Huidige beginstand: {formatCurrencyNL(startBalance)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <PieChart className="text-green-600" />
                        Data Overzicht
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between">
                            <span>Declaraties:</span>
                            <span className="font-semibold">{dataStats.declarations}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Andere facturen:</span>
                            <span className="font-semibold">{dataStats.otherInvoices}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Variabele uitgaven:</span>
                            <span className="font-semibold">{dataStats.variableExpenses}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Vaste uitgaven:</span>
                            <span className="font-semibold">{dataStats.fixedCreditors}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Bank transacties:</span>
                            <span className="font-semibold">{dataStats.bankTransactions}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Correcties:</span>
                            <span className="font-semibold">{dataStats.corrections}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Verzekeraars:</span>
                            <span className="font-semibold">{dataStats.insurers}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Andere debiteuren:</span>
                            <span className="font-semibold">{dataStats.otherDebtors}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Management */}
            <div className="mt-6 bg-white p-6 rounded-lg shadow border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Copy className="text-purple-600" />
                    Data Backup & Herstel
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-semibold text-green-800 mb-2">Export Data</h4>
                        <p className="text-sm text-green-700 mb-3">
                            Download een complete backup van al je data
                        </p>
                        <button
                            onClick={handleExport}
                            className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center gap-2"
                        >
                            <Download size={16} />
                            Download Backup
                        </button>
                    </div>
                    
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold text-blue-800 mb-2">Import Data</h4>
                        <p className="text-sm text-blue-700 mb-3">
                            Herstel data uit een backup bestand
                        </p>
                        <div>
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleImportFile}
                                className="hidden"
                                id="import-file"
                            />
                            <label
                                htmlFor="import-file"
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Upload size={16} />
                                Selecteer Backup
                            </label>
                        </div>
                    </div>
                    
                    <div className="p-4 bg-red-50 rounded-lg">
                        <h4 className="font-semibold text-red-800 mb-2">Reset Data</h4>
                        <p className="text-sm text-red-700 mb-3">
                            Wis alle data en begin opnieuw
                        </p>
                        <button
                            onClick={clearAllData}
                            className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center justify-center gap-2"
                        >
                            <Trash2 size={16} />
                            Alles Wissen
                        </button>
                    </div>
                </div>
            </div>

            {/* Local Storage Info */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="text-yellow-600" size={16} />
                    <h4 className="font-semibold text-yellow-800">Lokale Opslag Informatie</h4>
                </div>
                <p className="text-sm text-yellow-700">
                    Al je data wordt veilig opgeslagen in je browser. Maak regelmatig een backup 
                    om gegevensverlies te voorkomen. De data wordt automatisch opgeslagen bij elke wijziging.
                </p>
            </div>
        </div>
    );
};

// Continue with main application in part 4...