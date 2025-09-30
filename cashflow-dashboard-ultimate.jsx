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

// Continue with part 2...// Continue from part 1...

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

// Continue with part 3...// Continue from part 2...

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

// Continue with main application in part 4...// Continue from part 3 - Main Application

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