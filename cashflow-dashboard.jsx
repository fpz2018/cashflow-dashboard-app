import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, ComposedChart } from 'recharts';

// --- Utility: Unique ID Generator ---
const generateUniqueId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// --- SVG Icons ---
const Icon = ({ children, size = 20, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {children}
  </svg>
);

const Plus = (props) => <Icon {...props}><path d="M12 5v14"/><path d="M5 12h14"/></Icon>;
const Trash2 = (props) => <Icon {...props}><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M10 11v6"/><path d="M14 11v6"/></Icon>;
const Download = (props) => <Icon {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></Icon>;
const Upload = (props) => <Icon {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></Icon>;
const Edit = (props) => <Icon {...props}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></Icon>;
const TrendingUp = (props) => <Icon {...props}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></Icon>;
const Euro = (props) => <Icon {...props}><path d="M4 10h12"/><path d="M4 14h12"/><path d="M17 18c-4.42 0-8-3.58-8-8s3.58-8 8-8"/></Icon>;
const Calendar = (props) => <Icon {...props}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></Icon>;
const RefreshCw = (props) => <Icon {...props}><path d="M3 2v6h6"/><path d="M21 12A9 9 0 0 0 6 5.3L3 8"/><path d="M21 22v-6h-6"/><path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"/></Icon>;
const AlertCircle = (props) => <Icon {...props}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></Icon>;
const Copy = (props) => <Icon {...props}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></Icon>;

// --- Utility Functions ---
const formatDateNL = (dateString) => {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Ongeldige datum';
        return date.toLocaleDateString('nl-NL', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) {
        return '-';
    }
};

const formatCurrencyNL = (amount) => {
    if (typeof amount !== 'number') {
        amount = parseFloat(amount);
    }
    if (isNaN(amount)) {
        return '€ 0,00';
    }
    return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(amount);
};

const getExpectedPaymentDateByTerm = (invoiceDate, term) => {
    if (!invoiceDate || typeof term !== 'number') return null;
    const date = new Date(invoiceDate);
    date.setDate(date.getDate() + term);
    return date.toISOString().split('T')[0];
};

// --- IMPROVED Date Normalization with better error handling ---
const normalizeDate = (dateStr) => {
    if (!dateStr) throw new Error('Datum is leeg');
    
    const cleaned = dateStr.toString().trim();
    
    // Enhanced date patterns for better recognition
    const patterns = [
        // ISO format: 2024-12-31, 2024-1-1
        { regex: /^(\d{4})-(\d{1,2})-(\d{1,2})$/, order: ['year', 'month', 'day'] },
        // European format: 31-12-2024, 31/12/2024, 31-12-24, 31/12/24
        { regex: /^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/, order: ['day', 'month', 'year'] },
        { regex: /^(\d{1,2})[-\/](\d{1,2})[-\/](\d{2})$/, order: ['day', 'month', 'year'], yearPrefix: '20' },
        // US format: 12/31/2024, 12-31-2024
        { regex: /^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/, order: ['month', 'day', 'year'], isUS: true },
        // With time: 2024-12-31 10:30:00, 31-12-2024 10:30
        { regex: /^(\d{4})-(\d{1,2})-(\d{1,2})\s+\d{1,2}:\d{2}(:\d{2})?$/, order: ['year', 'month', 'day'] },
        { regex: /^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})\s+\d{1,2}:\d{2}(:\d{2})?$/, order: ['day', 'month', 'year'] },
        // Excel serial date (days since 1900-01-01)
        { regex: /^(\d{5,6})$/, isSerial: true },
    ];
    
    for (const pattern of patterns) {
        const match = cleaned.match(pattern.regex);
        if (match) {
            if (pattern.isSerial) {
                // Handle Excel serial dates
                const serialDate = parseInt(match[1]);
                const excelEpoch = new Date(1900, 0, 1);
                const actualDate = new Date(excelEpoch.getTime() + (serialDate - 2) * 24 * 60 * 60 * 1000);
                return actualDate.toISOString().split('T')[0];
            }
            
            const values = {};
            pattern.order.forEach((key, index) => {
                values[key] = match[index + 1];
            });
            
            if (pattern.yearPrefix && values.year.length === 2) {
                values.year = pattern.yearPrefix + values.year;
            }
            
            const year = parseInt(values.year);
            const month = parseInt(values.month);
            const day = parseInt(values.day);
            
            // Validate date values
            if (year < 1900 || year > 2100) throw new Error(`Ongeldig jaar: ${year}`);
            if (month < 1 || month > 12) throw new Error(`Ongeldige maand: ${month}`);
            if (day < 1 || day > 31) throw new Error(`Ongeldige dag: ${day}`);
            
            const date = new Date(year, month - 1, day);
            if (date.getFullYear() === year && 
                date.getMonth() === month - 1 && 
                date.getDate() === day) {
                return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            }
        }
    }
    
    throw new Error(`Ongeldig datumformaat: ${dateStr}. Ondersteunde formaten: DD-MM-YYYY, DD/MM/YYYY, YYYY-MM-DD`);
};

// --- IMPROVED Amount Normalization with better parsing ---
const normalizeAmount = (amountStr) => {
    if (!amountStr && amountStr !== 0) return 0;
    
    let str = String(amountStr).trim();
    
    // Remove common currency symbols and whitespace
    str = str.replace(/[€$£¥]/g, '').replace(/\s+/g, '');
    
    // Handle negative amounts with parentheses: (123.45) -> -123.45
    const isNegativeParentheses = str.match(/^\((.+)\)$/);
    if (isNegativeParentheses) {
        str = '-' + isNegativeParentheses[1];
    }
    
    // Handle percentage values: 15% -> 0.15
    if (str.endsWith('%')) {
        const percentValue = parseFloat(str.slice(0, -1));
        if (!isNaN(percentValue)) return percentValue / 100;
    }
    
    // Special handling for different decimal separators
    const lastComma = str.lastIndexOf(',');
    const lastDot = str.lastIndexOf('.');
    
    // Determine if comma is decimal separator (European format)
    // or thousands separator (US format)
    if (lastComma > lastDot) {
        // European format: 1.234.567,89 or 1.234,89
        str = str.replace(/\./g, '').replace(',', '.');
    } else if (lastDot > lastComma) {
        // US format: 1,234,567.89 or 1,234.89
        // Check if comma appears to be thousands separator
        const commaCount = (str.match(/,/g) || []).length;
        const dotCount = (str.match(/\./g) || []).length;
        
        if (commaCount > 0 && dotCount === 1) {
            // Likely US format with thousands separators
            str = str.replace(/,/g, '');
        } else if (commaCount === 1 && dotCount === 0) {
            // Single comma, could be European decimal
            const commaIndex = str.indexOf(',');
            const afterComma = str.substring(commaIndex + 1);
            if (afterComma.length <= 2 && /^\d+$/.test(afterComma)) {
                // Likely decimal separator
                str = str.replace(',', '.');
            }
        }
    }
    
    const amount = parseFloat(str);
    
    if (isNaN(amount)) {
        throw new Error(`Ongeldig bedrag: "${amountStr}". Gebruik formaten zoals: 123,45 of 123.45 of €123,45`);
    }
    
    return Math.round(amount * 100) / 100;
};

// --- ENHANCED Data Processing for better copy-paste support ---
const detectDelimiter = (line) => {
    const delimiters = ['\t', ';', ',', '|'];
    const counts = delimiters.map(delim => (line.split(delim).length - 1));
    const maxIndex = counts.indexOf(Math.max(...counts));
    return delimiters[maxIndex];
};

const cleanHeaderName = (header) => {
    return header.trim()
        .toLowerCase()
        .replace(/['"]/g, '')
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
};

const findHeaderIndex = (headers, possibleNames) => {
    return headers.findIndex(header => {
        const cleanHeader = cleanHeaderName(header);
        return possibleNames.some(name => {
            const cleanName = name.toLowerCase();
            return cleanHeader.includes(cleanName) || cleanName.includes(cleanHeader);
        });
    });
};

// --- IMPROVED processPastedData function ---
const processPastedData = (pasteData, requiredHeadersMap, rowProcessor) => {
    if (!pasteData || !pasteData.trim()) {
        throw new Error('Geen data om te verwerken');
    }

    const lines = pasteData.trim().split('\n').filter(line => line.trim());
    if (lines.length < 1) {
        throw new Error('Geen geldige data gevonden');
    }

    // If only one line, assume it's data without headers
    let headers = [];
    let dataStartIndex = 0;
    
    if (lines.length === 1) {
        // Single line of data - create default headers
        const delimiter = detectDelimiter(lines[0]);
        const columns = lines[0].split(delimiter);
        headers = Object.keys(requiredHeadersMap).slice(0, columns.length);
        dataStartIndex = 0;
    } else {
        // Multiple lines - first line is headers
        const delimiter = detectDelimiter(lines[0]);
        headers = lines[0].split(delimiter).map(h => h.trim().replace(/['"]/g, ''));
        dataStartIndex = 1;
    }

    const headerMap = {};
    for (const key in requiredHeadersMap) {
        const config = requiredHeadersMap[key];
        const searchTerms = config.keys;
        const isOptional = config.optional === true;

        const index = findHeaderIndex(headers, searchTerms);
        
        if (index === -1 && !isOptional) {
            throw new Error(`Vereiste kolom '${key}' niet gevonden. Zoekt naar: ${searchTerms.join(', ')}. Gevonden kolommen: ${headers.join(', ')}`);
        }
        headerMap[key] = index;
    }

    const newData = [];
    const skippedRows = [];
    
    for (let i = dataStartIndex; i < lines.length; i++) {
        const delimiter = detectDelimiter(lines[i]);
        const row = lines[i].split(delimiter).map(cell => cell.trim().replace(/^["']|["']$/g, ''));
        
        // Skip empty rows
        if (row.every(cell => !cell)) continue;
        
        try {
            const processedRow = rowProcessor(row, headerMap);
            if (processedRow) {
                newData.push({
                    id: generateUniqueId(),
                    ...processedRow
                });
            }
        } catch (error) {
            skippedRows.push({ 
                row: i + 1, 
                reason: error.message, 
                originalData: row.slice(0, 5).join(' | ') + (row.length > 5 ? '...' : ''),
                fullRow: row
            });
        }
    }
    
    return { newData, skippedRows };
};

// --- IMPROVED Credit Invoices (Variable Expenses) processor ---
const processCreditInvoicesData = (pasteData) => {
    const requiredHeaders = {
        date: { 
            keys: ['datum', 'date', 'boekingsdatum', 'factuurdatum', 'invoice_date'], 
            optional: false 
        },
        description: { 
            keys: ['omschrijving', 'beschrijving', 'description', 'naam', 'name', 'leverancier', 'supplier'], 
            optional: false 
        },
        amount: { 
            keys: ['bedrag', 'amount', 'totaal', 'total', 'prijs', 'price', 'kosten', 'cost'], 
            optional: false 
        },
        category: { 
            keys: ['categorie', 'category', 'type', 'soort'], 
            optional: true 
        },
        reference: { 
            keys: ['referentie', 'reference', 'factuurnummer', 'invoice_number', 'nummer'], 
            optional: true 
        }
    };

    const rowProcessor = (row, headerMap) => {
        const dateIndex = headerMap.date;
        const descriptionIndex = headerMap.description;
        const amountIndex = headerMap.amount;
        const categoryIndex = headerMap.category;
        const referenceIndex = headerMap.reference;

        if (dateIndex === -1 || !row[dateIndex]) {
            throw new Error('Datum ontbreekt');
        }
        if (descriptionIndex === -1 || !row[descriptionIndex]) {
            throw new Error('Beschrijving ontbreekt');
        }
        if (amountIndex === -1 || !row[amountIndex]) {
            throw new Error('Bedrag ontbreekt');
        }

        const date = normalizeDate(row[dateIndex]);
        const description = row[descriptionIndex].trim();
        const amount = Math.abs(normalizeAmount(row[amountIndex])); // Always positive for expenses
        const category = categoryIndex !== -1 && row[categoryIndex] ? row[categoryIndex].trim() : 'Algemeen';
        const reference = referenceIndex !== -1 && row[referenceIndex] ? row[referenceIndex].trim() : '';

        // Validate date is reasonable (not too far in past/future)
        const parsedDate = new Date(date);
        const currentYear = new Date().getFullYear();
        const dateYear = parsedDate.getFullYear();
        
        if (dateYear < currentYear - 5 || dateYear > currentYear + 5) {
            throw new Error(`Datum lijkt onrealistisch: ${formatDateNL(date)}`);
        }

        return {
            date,
            description,
            amount,
            category,
            reference,
            status: 'pending'
        };
    };

    return processPastedData(pasteData, requiredHeaders, rowProcessor);
};

// --- ENHANCED Bank CSV processor ---
const processBankCsvData = (csvText) => {
    const requiredHeaders = {
        date: { 
            keys: ['datum', 'boekingsdatum', 'date', 'transaction_date'], 
            optional: false 
        },
        debtor: { 
            keys: ['debiteur', 'naam', 'tegenpartij', 'name', 'counterparty', 'description'], 
            optional: true 
        },
        description: { 
            keys: ['omschrijving', 'mededeling', 'description', 'memo', 'details'], 
            optional: true 
        },
        amount: { 
            keys: ['bedrag', 'amount'], 
            optional: true 
        },
        credit: { 
            keys: ['bij', 'credit', 'inkomend'], 
            optional: true 
        },
        debit: { 
            keys: ['af', 'debit', 'uitgaand'], 
            optional: true 
        },
        balance: { 
            keys: ['saldo', 'balance'], 
            optional: true 
        }
    };

    const rowProcessor = (row, headerMap) => {
        const dateIndex = headerMap.date;
        const debtorIndex = headerMap.debtor;
        const descriptionIndex = headerMap.description;
        const amountIndex = headerMap.amount;
        const creditIndex = headerMap.credit;
        const debitIndex = headerMap.debit;

        if (dateIndex === -1 || !row[dateIndex]) {
            throw new Error('Datum ontbreekt');
        }

        let amount;
        if (amountIndex !== -1 && row[amountIndex]) {
            amount = normalizeAmount(row[amountIndex]);
        } else if (creditIndex !== -1 && debitIndex !== -1) {
            const credit = row[creditIndex] ? normalizeAmount(row[creditIndex]) : 0;
            const debit = row[debitIndex] ? normalizeAmount(row[debitIndex]) : 0;
            amount = credit - debit;
        } else {
            throw new Error("Geen bedrag gevonden");
        }

        const date = normalizeDate(row[dateIndex]);
        const debtorName = (debtorIndex !== -1 && row[debtorIndex]) 
            ? row[debtorIndex].trim() 
            : ((descriptionIndex !== -1 && row[descriptionIndex]) ? row[descriptionIndex].trim() : 'Onbekend');
        const description = (descriptionIndex !== -1 && row[descriptionIndex]) 
            ? row[descriptionIndex].trim() 
            : debtorName;

        return {
            date,
            debtorName,
            description,
            amount,
            status: 'unmatched'
        };
    };

    return processPastedData(csvText, requiredHeaders, rowProcessor);
};

// --- LocalStorage helpers ---
const useAutoSave = (key, data) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            try {
                localStorage.setItem(key, JSON.stringify(data));
            } catch (e) {
                console.error('Auto-save failed:', e);
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [key, data]);
};

const loadFromLocalStorage = (key, defaultValue) => {
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultValue;
    } catch (e) {
        console.error('Failed to load from localStorage:', e);
        return defaultValue;
    }
};

// --- Sub Components ---
const Notification = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => onClose(), 6000);
        return () => clearTimeout(timer);
    }, [onClose]);
    
    const colors = { 
        success: 'bg-green-100 border-green-500 text-green-800', 
        error: 'bg-red-100 border-red-500 text-red-800', 
        info: 'bg-blue-100 border-blue-500 text-blue-800' 
    };
    
    return (
        <div className={`fixed top-5 right-5 max-w-sm w-full p-4 border-l-4 rounded-lg shadow-lg z-50 ${colors[type] || colors.info}`} role="alert">
            <div className="flex justify-between items-start">
                <div className="flex-grow">
                    <p className="font-bold capitalize">{type}</p>
                    <p className="text-sm whitespace-pre-wrap">{message}</p>
                </div>
                <button onClick={onClose} className="ml-4 -mt-2 -mr-2 p-1 text-2xl font-bold leading-none hover:text-black">&times;</button>
            </div>
        </div>
    );
};

const ImportFeedback = ({ feedback, onClear }) => {
    if (!feedback || feedback.skippedRows.length === 0) return null;

    return (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex justify-between items-center">
                <h4 className="font-semibold text-yellow-800">Import Waarschuwingen</h4>
                <button onClick={onClear} className="text-yellow-500 hover:text-yellow-700 font-bold">&times;</button>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
                {feedback.skippedRows.length} van {(feedback.newData?.length || 0) + feedback.skippedRows.length} rijen konden niet worden verwerkt:
            </p>
            <div className="mt-2 max-h-40 overflow-y-auto">
                {feedback.skippedRows.slice(0, 10).map((skipped, index) => (
                    <div key={index} className="mb-2 p-2 bg-yellow-100 rounded text-xs">
                        <div className="font-semibold text-yellow-800">Rij {skipped.row}:</div>
                        <div className="text-yellow-700">{skipped.reason}</div>
                        {skipped.originalData && (
                            <div className="mt-1 font-mono text-yellow-600 break-all">
                                {skipped.originalData}
                            </div>
                        )}
                    </div>
                ))}
                {feedback.skippedRows.length > 10 && (
                    <div className="text-sm text-yellow-700">
                        ... en nog {feedback.skippedRows.length - 10} andere rijen
                    </div>
                )}
            </div>
        </div>
    );
};

const LastImportInfo = ({ date }) => {
    if (!date) return null;
    return (
        <div className="text-sm text-gray-500 mb-4">
            Laatst geïmporteerde datum: {formatDateNL(date)}
        </div>
    );
};

const StatCard = ({ icon, title, value, color }) => (
    <div className={`bg-${color}-50 p-4 rounded-lg shadow`}>
        <div className="flex items-center gap-3 mb-2">
            {icon}
            <span className="text-sm text-gray-600 font-medium">{title}</span>
        </div>
        <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
    </div>
);

const ChartCard = ({ title, children }) => (
    <div className="bg-white p-4 rounded-lg shadow mt-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">{title}</h3>
        {children}
    </div>
);

const DataTable = ({ headers, rows }) => (
    <table className="w-full">
        <thead className="bg-gray-50">
            <tr>
                {headers.map((h, i) => (
                    <th key={i} className="sticky top-0 px-4 py-3 text-left text-sm font-semibold text-gray-600 bg-gray-100 z-10">
                        {h}
                    </th>
                ))}
            </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
            {rows.length === 0 ? (
                <tr>
                    <td colSpan={headers.length} className="px-4 py-8 text-center text-gray-500">
                        Geen data beschikbaar
                    </td>
                </tr>
            ) : (
                rows.map(row => (
                    <tr key={row.id} className="hover:bg-gray-50">
                        {row.cols.map((col, i) => (
                            <td key={i} className="px-4 py-3 text-gray-700">{col}</td>
                        ))}
                    </tr>
                ))
            )}
        </tbody>
    </table>
);

// ENHANCED Copy-Paste Form Component for Credit Invoices
const CreditInvoiceImportForm = ({ onImport, onClose }) => {
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
            const feedback = processCreditInvoicesData(pasteData);
            setImportFeedback(feedback);
            
            if (feedback.newData.length > 0) {
                onImport(feedback);
                if (feedback.skippedRows.length === 0) {
                    // Perfect import, close after 2 seconds
                    setTimeout(() => {
                        onClose();
                    }, 2000);
                }
            }
        } catch (error) {
            setImportFeedback({
                newData: [],
                skippedRows: [{ row: 1, reason: error.message, originalData: pasteData.split('\n')[0] }]
            });
        }
        setIsProcessing(false);
    };

    const handlePaste = (e) => {
        // Allow natural paste behavior
        setTimeout(() => {
            const value = e.target.value;
            setPasteData(value);
            setImportFeedback(null);
        }, 10);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Creditfacturen Importeren</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
                </div>
                
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">Hoe te gebruiken:</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Kopieer data uit Excel/CSV met minimaal: <strong>datum, beschrijving, bedrag</strong></li>
                        <li>• Ondersteunde datumformaten: DD-MM-YYYY, DD/MM/YYYY, YYYY-MM-DD</li>
                        <li>• Ondersteunde bedragformaten: €123,45 of 123.45 of 1.234,56</li>
                        <li>• Optioneel: categorie, referentie/factuurnummer</li>
                        <li>• Eerste rij kan headers bevatten of direct data zijn</li>
                    </ul>
                </div>

                <textarea
                    className="w-full h-48 p-3 border rounded-lg font-mono text-sm"
                    placeholder="Plak hier je creditfacturen data...

Bijvoorbeeld:
Datum	Beschrijving	Bedrag	Categorie
01-01-2024	Kantoorartikelen	€125,50	Kantoor
15-01-2024	Software licentie	450.00	IT
25-01-2024	Brandstof	89,75	Vervoer

Of gewoon de data zonder headers:
01-01-2024	Kantoorartikelen	€125,50
15-01-2024	Software licentie	450.00"
                    value={pasteData}
                    onChange={(e) => setPasteData(e.target.value)}
                    onPaste={handlePaste}
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

// Dashboard Tab
const DashboardTab = ({ stats, cashflowData }) => (
    <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard icon={<Euro className="text-blue-600" />} title="Verwachte Inkomsten (30d)" value={formatCurrencyNL(stats.totalIncome)} color="blue" />
            <StatCard icon={<TrendingUp className="text-red-600" />} title="Verwachte Uitgaven (30d)" value={formatCurrencyNL(stats.totalExpenses)} color="red" />
            <StatCard icon={<Calendar className="text-green-600" />} title="Netto Cashflow (30d)" value={formatCurrencyNL(stats.netCashflow)} color="green" />
            <StatCard icon={<Euro className="text-purple-600" />} title="Verwacht Saldo (30d)" value={formatCurrencyNL(stats.endBalance)} color="purple" />
        </div>
        <ChartCard title="Banksaldo Projectie 2025">
             <ResponsiveContainer width="100%" height={300}>
                <LineChart data={cashflowData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dateNL" tick={{fontSize: 12}} interval={Math.floor(cashflowData.length / 12)} />
                    <YAxis tickFormatter={(value) => formatCurrencyNL(value)}/>
                    <Tooltip formatter={(value) => formatCurrencyNL(value)} />
                    <Legend />
                    <Line type="monotone" dataKey="balance" stroke="#8b5cf6" strokeWidth={2} name="Banksaldo" dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </ChartCard>
    </div>
);

// Variable Expenses (Credit Invoices) Tab with Enhanced Import
const VariableExpensesTab = ({ expenses, onAdd, onUpdate, onDelete }) => {
    const [newExpense, setNewExpense] = useState({ date: '', description: '', amount: '', category: 'Algemeen' });
    const [editingId, setEditingId] = useState(null);
    const [showImportForm, setShowImportForm] = useState(false);
    const [importFeedback, setImportFeedback] = useState(null);
    
    const isEditing = editingId !== null;

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

    const handleBulkImport = useCallback((feedback) => {
        if (feedback.newData && feedback.newData.length > 0) {
            feedback.newData.forEach(expense => {
                onAdd(expense);
            });
            setImportFeedback(feedback);
        }
        return feedback;
    }, [onAdd]);

    const categories = [...new Set(['Algemeen', 'Kantoor', 'IT', 'Vervoer', 'Marketing', 'Onderhoud', ...expenses.map(e => e.category)])];

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Variabele Uitgaven (Creditfacturen)</h2>
                <button
                    onClick={() => setShowImportForm(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
                >
                    <Upload size={16} />
                    Importeren
                </button>
            </div>

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

            <div className="overflow-auto max-h-[600px] bg-white rounded-lg shadow">
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
            </div>

            {showImportForm && (
                <CreditInvoiceImportForm
                    onImport={handleBulkImport}
                    onClose={() => setShowImportForm(false)}
                />
            )}
        </div>
    );
};

// Debtors Management Tab
const DebtorManagementTab = ({ title, debtors, onAdd, onUpdate, onDelete, onBulkImport }) => {
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
            <h2 className="text-2xl font-semibold mb-4">{title} Beheren</h2>
            <div className="bg-gray-50 p-4 rounded mb-6">
                <h3 className="font-medium mb-2">{isEditing ? `${title.slice(0,-1)} wijzigen` : `Nieuwe ${title.slice(0,-1)} toevoegen`}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input 
                        type="text" 
                        placeholder={`Naam ${title.slice(0,-1)}`} 
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
                    />
                    <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        {isEditing ? 'Opslaan' : 'Toevoegen'}
                    </button>
                </div>
            </div>
            <div className="overflow-auto max-h-[600px] bg-white rounded-lg shadow">
                <DataTable
                    headers={['Naam', 'Betalingstermijn (dagen)', 'Acties']}
                    rows={debtors.map(d => ({
                        id: d.id,
                        cols: [
                            d.name, 
                            d.paymentTerm, 
                            <div className="flex gap-4">
                                <button onClick={() => handleEditClick(d)} className="text-blue-600 hover:text-blue-800">
                                    <Edit size={18} />
                                </button>
                                <button onClick={() => onDelete(d.id)} className="text-red-600 hover:text-red-800">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ]
                    }))}
                />
            </div>
        </div>
    );
};

// Main Application
const CashflowDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [notification, setNotification] = useState(null);
    
    // Initial data
    const initialData = {
        startBalance: 25000,
        insurers: [
            { id: generateUniqueId(), name: 'Zilveren Kruis', paymentTerm: 30 },
            { id: generateUniqueId(), name: 'VGZ', paymentTerm: 28 }
        ],
        declarations: [],
        otherDebtors: [
            { id: generateUniqueId(), name: 'Onderhuur Kantoorruimte', paymentTerm: 7 }
        ],
        otherInvoices: [],
        fixedCreditors: [
            { id: generateUniqueId(), name: 'Huur kantoor', amount: 1200, dayOfMonth: 1 },
            { id: generateUniqueId(), name: 'Salaris', amount: 5500, dayOfMonth: 28 }
        ],
        variableExpenses: [],
        corrections: []
    };
    
    // State management with localStorage integration
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

    // Handler functions
    const handleAddVariableExpense = useCallback((expense) => {
        setVariableExpenses(prev => [...prev, { ...expense, id: generateUniqueId() }]);
        showNotification('Uitgave toegevoegd', 'success');
    }, [showNotification]);

    const handleUpdateVariableExpense = useCallback((updatedExpense) => {
        setVariableExpenses(prev => prev.map(exp => exp.id === updatedExpense.id ? updatedExpense : exp));
        showNotification('Uitgave bijgewerkt', 'success');
    }, [showNotification]);

    const handleDeleteVariableExpense = useCallback((id) => {
        if (window.confirm('Weet je zeker dat je deze uitgave wilt verwijderen?')) {
            setVariableExpenses(prev => prev.filter(exp => exp.id !== id));
            showNotification('Uitgave verwijderd', 'success');
        }
    }, [showNotification]);

    const handleAddDebtor = useCallback((type) => (debtor) => {
        const setter = type === 'insurers' ? setInsurers : setOtherDebtors;
        setter(prev => [...prev, { ...debtor, id: generateUniqueId() }]);
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
    
    // Calculate cashflow data
    const cashflowData = useMemo(() => {
        const data = [];
        const startDate = new Date('2025-01-01');
        const endDate = new Date('2025-12-31');
        
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            const currentDayOfMonth = d.getDate();
            let income = 0;
            let expenses = 0;

            // Calculate expected income from declarations
            declarations.forEach(dec => {
                if (dec.status !== 'paid') {
                    const insurer = insurers.find(i => i.id === dec.debtorId);
                    const paymentDate = getExpectedPaymentDateByTerm(dec.date, insurer?.paymentTerm);
                    if (paymentDate === dateStr) income += dec.amount;
                }
            });

            // Calculate expected income from other invoices
            otherInvoices.forEach(inv => {
                if (inv.status !== 'paid') {
                    const debtor = otherDebtors.find(d => d.id === inv.debtorId);
                    const paymentDate = getExpectedPaymentDateByTerm(inv.date, debtor?.paymentTerm);
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
            
            data.push({ 
                date: dateStr, 
                dateNL: formatDateNL(dateStr).substring(0, 6), 
                income, 
                expenses, 
                net: income - expenses 
            });
        }
        
        // Calculate running balance
        let balance = startBalance;
        return data.map(day => ({ ...day, balance: balance += day.net }));
    }, [declarations, fixedCreditors, otherInvoices, variableExpenses, insurers, otherDebtors, startBalance]);
    
    // Calculate statistics
    const stats = useMemo(() => {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const startIndex = cashflowData.findIndex(d => d.date >= todayStr);
        
        if (startIndex === -1) {
            return { 
                totalIncome: 0, 
                totalExpenses: 0, 
                netCashflow: 0, 
                endBalance: cashflowData.length > 0 ? cashflowData[cashflowData.length - 1].balance : startBalance 
            };
        }

        const next30Days = cashflowData.slice(startIndex, startIndex + 30);
        const totalIncome = next30Days.reduce((sum, day) => sum + day.income, 0);
        const totalExpenses = next30Days.reduce((sum, day) => sum + day.expenses, 0);
        const endBalance = next30Days.length > 0 ? 
            next30Days[next30Days.length - 1].balance : 
            (cashflowData[startIndex - 1]?.balance || startBalance);
        
        return { 
            totalIncome, 
            totalExpenses, 
            netCashflow: totalIncome - totalExpenses, 
            endBalance 
        };
    }, [cashflowData, startBalance]);

    // Tab configuration
    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: <TrendingUp size={16} /> },
        { id: 'expenses', label: 'Creditfacturen', icon: <Euro size={16} /> },
        { id: 'insurers', label: 'Verzekeraars', icon: <Calendar size={16} /> },
        { id: 'other-debtors', label: 'Andere Debiteuren', icon: <Calendar size={16} /> },
    ];

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Navigation */}
            <nav className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <h1 className="text-xl font-bold text-gray-900">Cashflow Dashboard</h1>
                            </div>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`${
                                            activeTab === tab.id
                                                ? 'border-blue-500 text-gray-900'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                                    >
                                        {tab.icon}
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    {activeTab === 'dashboard' && (
                        <DashboardTab stats={stats} cashflowData={cashflowData} />
                    )}
                    
                    {activeTab === 'expenses' && (
                        <VariableExpensesTab
                            expenses={variableExpenses}
                            onAdd={handleAddVariableExpense}
                            onUpdate={handleUpdateVariableExpense}
                            onDelete={handleDeleteVariableExpense}
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
        </div>
    );
};

export default CashflowDashboard;