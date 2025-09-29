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
const Search = (props) => <Icon {...props}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></Icon>;
const Filter = (props) => <Icon {...props}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46"/></Icon>;
const Settings = (props) => <Icon {...props}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V5a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></Icon>;
const FileText = (props) => <Icon {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></Icon>;
const Banknote = (props) => <Icon {...props}><rect x="1" y="5" width="22" height="14" rx="7" ry="7"/><path d="m8 13 2.5 2.5L16 10"/></Icon>;
const CreditCard = (props) => <Icon {...props}><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></Icon>;
const PieChart = (props) => <Icon {...props}><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></Icon>;
const Target = (props) => <Icon {...props}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></Icon>;
const Zap = (props) => <Icon {...props}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10"/></Icon>;
const Brain = (props) => <Icon {...props}><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></Icon>;
const Link2 = (props) => <Icon {...props}><path d="M15 7h3a5 5 0 0 1 5 5 5 5 0 0 1-5 5h-3m-6 0H6a5 5 0 0 1-5-5 5 5 0 0 1 5-5h3"/><line x1="8" y1="12" x2="16" y2="12"/></Icon>;
const CheckCircle = (props) => <Icon {...props}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></Icon>;
const XCircle = (props) => <Icon {...props}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></Icon>;
const Clock = (props) => <Icon {...props}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></Icon>;

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

const getLatestDate = (items, dateField = 'date') => {
    if (!items || items.length === 0) return null;
    return items.reduce((latest, item) => {
        const itemDate = new Date(item[dateField]);
        const latestDate = new Date(latest);
        return itemDate > latestDate ? item[dateField] : latest;
    }, items[0][dateField]);
};

// --- Enhanced Date Normalization ---
const normalizeDate = (dateStr) => {
    if (!dateStr) throw new Error('Datum is leeg');
    
    const cleaned = dateStr.toString().trim();
    
    // Enhanced date patterns for better recognition
    const patterns = [
        { regex: /^(\d{4})-(\d{1,2})-(\d{1,2})$/, order: ['year', 'month', 'day'] },
        { regex: /^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/, order: ['day', 'month', 'year'] },
        { regex: /^(\d{1,2})[-\/](\d{1,2})[-\/](\d{2})$/, order: ['day', 'month', 'year'], yearPrefix: '20' },
        { regex: /^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})\s+\d{1,2}:\d{2}(:\d{2})?$/, order: ['day', 'month', 'year'] },
        { regex: /^(\d{5,6})$/, isSerial: true },
    ];
    
    for (const pattern of patterns) {
        const match = cleaned.match(pattern.regex);
        if (match) {
            if (pattern.isSerial) {
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
    
    throw new Error(`Ongeldig datumformaat: ${dateStr}`);
};

// --- Enhanced Amount Normalization ---
const normalizeAmount = (amountStr) => {
    if (!amountStr && amountStr !== 0) return 0;
    
    let str = String(amountStr).trim();
    str = str.replace(/[€$£¥]/g, '').replace(/\s+/g, '');
    
    const isNegativeParentheses = str.match(/^\((.+)\)$/);
    if (isNegativeParentheses) {
        str = '-' + isNegativeParentheses[1];
    }
    
    if (str.endsWith('%')) {
        const percentValue = parseFloat(str.slice(0, -1));
        if (!isNaN(percentValue)) return percentValue / 100;
    }
    
    const lastComma = str.lastIndexOf(',');
    const lastDot = str.lastIndexOf('.');
    
    if (lastComma > lastDot) {
        str = str.replace(/\./g, '').replace(',', '.');
    } else if (lastDot > lastComma) {
        const commaCount = (str.match(/,/g) || []).length;
        const dotCount = (str.match(/\./g) || []).length;
        
        if (commaCount > 0 && dotCount === 1) {
            str = str.replace(/,/g, '');
        } else if (commaCount === 1 && dotCount === 0) {
            const commaIndex = str.indexOf(',');
            const afterComma = str.substring(commaIndex + 1);
            if (afterComma.length <= 2 && /^\d+$/.test(afterComma)) {
                str = str.replace(',', '.');
            }
        }
    }
    
    const amount = parseFloat(str);
    
    if (isNaN(amount)) {
        throw new Error(`Ongeldig bedrag: "${amountStr}"`);
    }
    
    return Math.round(amount * 100) / 100;
};

// --- Enhanced Data Processing Functions ---
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

const processPastedData = (pasteData, requiredHeadersMap, rowProcessor) => {
    if (!pasteData || !pasteData.trim()) {
        throw new Error('Geen data om te verwerken');
    }

    const lines = pasteData.trim().split('\n').filter(line => line.trim());
    if (lines.length < 1) {
        throw new Error('Geen geldige data gevonden');
    }

    let headers = [];
    let dataStartIndex = 0;
    
    if (lines.length === 1) {
        const delimiter = detectDelimiter(lines[0]);
        const columns = lines[0].split(delimiter);
        headers = Object.keys(requiredHeadersMap).slice(0, columns.length);
        dataStartIndex = 0;
    } else {
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

// --- Declarations Processor ---
const processDeclarationsData = (pasteData) => {
    const requiredHeaders = {
        date: { 
            keys: ['datum', 'date', 'boekingsdatum', 'factuurdatum', 'invoice_date'], 
            optional: false 
        },
        insurer: { 
            keys: ['verzekeraar', 'insurer', 'zorgverzekeraar', 'maatschappij'], 
            optional: false 
        },
        amount: { 
            keys: ['bedrag', 'amount', 'totaal', 'total'], 
            optional: false 
        },
        invoiceNumber: { 
            keys: ['factuurnummer', 'invoice_number', 'nummer', 'factuurnr'], 
            optional: true 
        },
        patientName: { 
            keys: ['patient', 'naam', 'name', 'clientnaam'], 
            optional: true 
        }
    };

    const rowProcessor = (row, headerMap) => {
        const dateIndex = headerMap.date;
        const insurerIndex = headerMap.insurer;
        const amountIndex = headerMap.amount;
        const invoiceNumberIndex = headerMap.invoiceNumber;
        const patientNameIndex = headerMap.patientName;

        if (dateIndex === -1 || !row[dateIndex]) {
            throw new Error('Datum ontbreekt');
        }
        if (insurerIndex === -1 || !row[insurerIndex]) {
            throw new Error('Verzekeraar ontbreekt');
        }
        if (amountIndex === -1 || !row[amountIndex]) {
            throw new Error('Bedrag ontbreekt');
        }

        const date = normalizeDate(row[dateIndex]);
        const insurerName = row[insurerIndex].trim();
        const amount = normalizeAmount(row[amountIndex]);
        const invoiceNumber = invoiceNumberIndex !== -1 && row[invoiceNumberIndex] ? row[invoiceNumberIndex].trim() : '';
        const patientName = patientNameIndex !== -1 && row[patientNameIndex] ? row[patientNameIndex].trim() : '';

        if (amount <= 0) {
            throw new Error('Bedrag moet groter dan 0 zijn');
        }

        return {
            date,
            insurerName,
            amount,
            invoiceNumber,
            patientName,
            status: 'pending',
            originalAmount: amount
        };
    };

    return processPastedData(pasteData, requiredHeaders, rowProcessor);
};

// --- Other Invoices Processor ---
const processOtherInvoicesData = (pasteData) => {
    const requiredHeaders = {
        date: { 
            keys: ['datum', 'date', 'boekingsdatum', 'factuurdatum'], 
            optional: false 
        },
        debtor: { 
            keys: ['debiteur', 'klant', 'customer', 'naam', 'name'], 
            optional: false 
        },
        amount: { 
            keys: ['bedrag', 'amount', 'totaal', 'total'], 
            optional: false 
        },
        description: { 
            keys: ['omschrijving', 'description', 'beschrijving', 'dienst'], 
            optional: true 
        },
        invoiceNumber: { 
            keys: ['factuurnummer', 'invoice_number', 'nummer'], 
            optional: true 
        }
    };

    const rowProcessor = (row, headerMap) => {
        const dateIndex = headerMap.date;
        const debtorIndex = headerMap.debtor;
        const amountIndex = headerMap.amount;
        const descriptionIndex = headerMap.description;
        const invoiceNumberIndex = headerMap.invoiceNumber;

        if (dateIndex === -1 || !row[dateIndex]) {
            throw new Error('Datum ontbreekt');
        }
        if (debtorIndex === -1 || !row[debtorIndex]) {
            throw new Error('Debiteur ontbreekt');
        }
        if (amountIndex === -1 || !row[amountIndex]) {
            throw new Error('Bedrag ontbreekt');
        }

        const date = normalizeDate(row[dateIndex]);
        const debtorName = row[debtorIndex].trim();
        const amount = normalizeAmount(row[amountIndex]);
        const description = descriptionIndex !== -1 && row[descriptionIndex] ? row[descriptionIndex].trim() : '';
        const invoiceNumber = invoiceNumberIndex !== -1 && row[invoiceNumberIndex] ? row[invoiceNumberIndex].trim() : '';

        if (amount <= 0) {
            throw new Error('Bedrag moet groter dan 0 zijn');
        }

        return {
            date,
            debtorName,
            amount,
            description,
            invoiceNumber,
            status: 'pending',
            originalAmount: amount
        };
    };

    return processPastedData(pasteData, requiredHeaders, rowProcessor);
};

// --- Corrections/Credits Processor ---
const processCorrectionsData = (pasteData) => {
    const requiredHeaders = {
        date: { 
            keys: ['datum', 'date', 'boekingsdatum'], 
            optional: false 
        },
        type: { 
            keys: ['type', 'soort', 'correctietype'], 
            optional: true 
        },
        amount: { 
            keys: ['bedrag', 'amount', 'totaal'], 
            optional: false 
        },
        originalInvoice: { 
            keys: ['origineel', 'original', 'factuur_origineel', 'oorspronkelijk'], 
            optional: true 
        },
        description: { 
            keys: ['omschrijving', 'description', 'reden'], 
            optional: true 
        },
        reference: { 
            keys: ['referentie', 'reference', 'nummer'], 
            optional: true 
        }
    };

    const rowProcessor = (row, headerMap) => {
        const dateIndex = headerMap.date;
        const typeIndex = headerMap.type;
        const amountIndex = headerMap.amount;
        const originalInvoiceIndex = headerMap.originalInvoice;
        const descriptionIndex = headerMap.description;
        const referenceIndex = headerMap.reference;

        if (dateIndex === -1 || !row[dateIndex]) {
            throw new Error('Datum ontbreekt');
        }
        if (amountIndex === -1 || !row[amountIndex]) {
            throw new Error('Bedrag ontbreekt');
        }

        const date = normalizeDate(row[dateIndex]);
        const type = typeIndex !== -1 && row[typeIndex] ? row[typeIndex].trim().toLowerCase() : 'credit';
        const amount = Math.abs(normalizeAmount(row[amountIndex])); // Always positive, will be made negative
        const originalInvoice = originalInvoiceIndex !== -1 && row[originalInvoiceIndex] ? row[originalInvoiceIndex].trim() : '';
        const description = descriptionIndex !== -1 && row[descriptionIndex] ? row[descriptionIndex].trim() : '';
        const reference = referenceIndex !== -1 && row[referenceIndex] ? row[referenceIndex].trim() : '';

        const isCorrection = originalInvoice !== '' || type.includes('correctie') || type.includes('correction');

        return {
            date,
            type: isCorrection ? 'correction' : 'credit',
            amount: -amount, // Always negative for corrections/credits
            originalInvoice,
            description,
            reference,
            status: 'pending',
            processed: false
        };
    };

    return processPastedData(pasteData, requiredHeaders, rowProcessor);
};

// --- Bank Transactions Processor ---
const processBankCsvData = (csvText) => {
    const requiredHeaders = {
        date: { 
            keys: ['datum', 'boekingsdatum', 'date', 'transaction_date'], 
            optional: false 
        },
        debtor: { 
            keys: ['debiteur', 'naam', 'tegenpartij', 'name', 'counterparty'], 
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
        const balanceIndex = headerMap.balance;

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
        const balance = balanceIndex !== -1 && row[balanceIndex] ? normalizeAmount(row[balanceIndex]) : null;

        return {
            date,
            debtorName,
            description,
            amount,
            balance,
            status: 'unmatched',
            matchedWith: null,
            matchedType: null
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

// --- Mock AI Assistant ---
const mockAIAssistant = async (transactionDescription, amount) => {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const description = transactionDescription.toLowerCase();
    
    // Simple categorization based on keywords
    if (description.includes('shell') || description.includes('esso') || description.includes('bp') || description.includes('brandstof')) {
        return {
            category: 'Vervoer',
            suggestedDescription: 'Brandstofkosten',
            confidence: 0.9
        };
    } else if (description.includes('office') || description.includes('kantoor') || description.includes('staples')) {
        return {
            category: 'Kantoor',
            suggestedDescription: 'Kantoorbenodigdheden',
            confidence: 0.85
        };
    } else if (description.includes('microsoft') || description.includes('adobe') || description.includes('software')) {
        return {
            category: 'IT',
            suggestedDescription: 'Software licentie',
            confidence: 0.9
        };
    } else if (description.includes('huur') || description.includes('rent')) {
        return {
            category: 'Huisvesting',
            suggestedDescription: 'Huurkosten',
            confidence: 0.95
        };
    } else if (description.includes('marketing') || description.includes('google ads') || description.includes('facebook')) {
        return {
            category: 'Marketing',
            suggestedDescription: 'Marketing uitgaven',
            confidence: 0.8
        };
    } else {
        return {
            category: 'Algemeen',
            suggestedDescription: `Uitgave: ${transactionDescription}`,
            confidence: 0.6
        };
    }
};

// Sub Components
const Notification = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => onClose(), 6000);
        return () => clearTimeout(timer);
    }, [onClose]);
    
    const colors = { 
        success: 'bg-green-100 border-green-500 text-green-800', 
        error: 'bg-red-100 border-red-500 text-red-800', 
        info: 'bg-blue-100 border-blue-500 text-blue-800',
        warning: 'bg-yellow-100 border-yellow-500 text-yellow-800'
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

const LastImportInfo = ({ date, label = "Laatst bijgewerkt" }) => {
    if (!date) return null;
    return (
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 p-2 bg-gray-50 rounded">
            <Clock size={16} />
            <span>{label}: {formatDateNL(date)}</span>
        </div>
    );
};

const StatCard = ({ icon, title, value, color, subtitle }) => (
    <div className={`bg-${color}-50 p-4 rounded-lg shadow border-l-4 border-${color}-500`}>
        <div className="flex items-center gap-3 mb-2">
            {icon}
            <span className="text-sm text-gray-600 font-medium">{title}</span>
        </div>
        <p className={`text-2xl font-bold text-${color}-600 mb-1`}>{value}</p>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
    </div>
);

const ChartCard = ({ title, children, subtitle }) => (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 mt-6">
        <div className="mb-4">
            <h3 className="text-xl font-semibold text-gray-700">{title}</h3>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {children}
    </div>
);

const DataTable = ({ headers, rows, maxHeight = "600px" }) => (
    <div className="overflow-auto rounded-lg shadow border border-gray-200" style={{ maxHeight }}>
        <table className="w-full">
            <thead className="bg-gray-50">
                <tr>
                    {headers.map((h, i) => (
                        <th key={i} className="sticky top-0 px-4 py-3 text-left text-sm font-semibold text-gray-700 bg-gray-100 border-b z-10">
                            {h}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
                {rows.length === 0 ? (
                    <tr>
                        <td colSpan={headers.length} className="px-4 py-8 text-center text-gray-500">
                            <div className="flex flex-col items-center gap-2">
                                <FileText className="text-gray-300" size={32} />
                                <span>Geen data beschikbaar</span>
                            </div>
                        </td>
                    </tr>
                ) : (
                    rows.map(row => (
                        <tr key={row.id} className="hover:bg-gray-50">
                            {row.cols.map((col, i) => (
                                <td key={i} className="px-4 py-3 text-gray-700 text-sm">{col}</td>
                            ))}
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    </div>
);

// Enhanced Dashboard Tab with Daily Cashflow Chart
const DashboardTab = ({ stats, cashflowData, dailyCashflowData }) => (
    <div>
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard 
                icon={<Euro className="text-blue-600" />} 
                title="Verwachte Inkomsten" 
                value={formatCurrencyNL(stats.totalIncome)} 
                color="blue" 
                subtitle="Komende 30 dagen"
            />
            <StatCard 
                icon={<TrendingUp className="text-red-600" />} 
                title="Verwachte Uitgaven" 
                value={formatCurrencyNL(stats.totalExpenses)} 
                color="red" 
                subtitle="Komende 30 dagen"
            />
            <StatCard 
                icon={<Target className="text-green-600" />} 
                title="Netto Cashflow" 
                value={formatCurrencyNL(stats.netCashflow)} 
                color="green" 
                subtitle="Komende 30 dagen"
            />
            <StatCard 
                icon={<Banknote className="text-purple-600" />} 
                title="Verwacht Saldo" 
                value={formatCurrencyNL(stats.endBalance)} 
                color="purple" 
                subtitle="Na 30 dagen"
            />
        </div>

        {/* Yearly Balance Projection */}
        <ChartCard 
            title="Banksaldo Projectie 2025" 
            subtitle="Verwachte ontwikkeling van het banksaldo gedurende het jaar"
        >
             <ResponsiveContainer width="100%" height={300}>
                <LineChart data={cashflowData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                        dataKey="dateNL" 
                        tick={{fontSize: 12}} 
                        interval={Math.floor(cashflowData.length / 12)} 
                        stroke="#666"
                    />
                    <YAxis 
                        tickFormatter={(value) => formatCurrencyNL(value)}
                        stroke="#666"
                        fontSize={12}
                    />
                    <Tooltip 
                        formatter={(value) => [formatCurrencyNL(value), 'Banksaldo']}
                        labelStyle={{ color: '#666' }}
                    />
                    <Legend />
                    <Line 
                        type="monotone" 
                        dataKey="balance" 
                        stroke="#8b5cf6" 
                        strokeWidth={3} 
                        name="Banksaldo" 
                        dot={false}
                        activeDot={{ r: 6, fill: '#8b5cf6' }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </ChartCard>

        {/* Daily Cashflow Chart */}
        <ChartCard 
            title="Dagelijkse Cashflow (Komende 30 dagen)" 
            subtitle="Inkomsten, uitgaven en saldo-ontwikkeling per dag"
        >
             <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={dailyCashflowData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                        dataKey="dateNL" 
                        tick={{fontSize: 11}} 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        stroke="#666"
                    />
                    <YAxis 
                        yAxisId="amount"
                        tickFormatter={(value) => formatCurrencyNL(value)}
                        stroke="#666"
                        fontSize={11}
                    />
                    <YAxis 
                        yAxisId="balance"
                        orientation="right"
                        tickFormatter={(value) => formatCurrencyNL(value)}
                        stroke="#666"
                        fontSize={11}
                    />
                    <Tooltip 
                        formatter={(value, name) => [formatCurrencyNL(value), name]}
                        labelStyle={{ color: '#666' }}
                    />
                    <Legend />
                    <Bar 
                        yAxisId="amount"
                        dataKey="income" 
                        fill="#22c55e" 
                        name="Inkomsten"
                        radius={[2, 2, 0, 0]}
                    />
                    <Bar 
                        yAxisId="amount"
                        dataKey="expenses" 
                        fill="#ef4444" 
                        name="Uitgaven"
                        radius={[2, 2, 0, 0]}
                    />
                    <Line 
                        yAxisId="balance"
                        type="monotone" 
                        dataKey="balance" 
                        stroke="#8b5cf6" 
                        strokeWidth={2} 
                        name="Saldo"
                        dot={{ r: 3, fill: '#8b5cf6' }}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </ChartCard>
    </div>
);

// Continue with part 2...