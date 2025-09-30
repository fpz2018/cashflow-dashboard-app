import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, ComposedChart } from 'recharts';

// Firebase Configuratie
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy, where } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBrD8YOC6Fcl4CQL5dx7Huexg72fepQKT4",
  authDomain: "cashflow-dashboard-e7af6.firebaseapp.com",
  projectId: "cashflow-dashboard-e7af6",
  storageBucket: "cashflow-dashboard-e7af6.firebasestorage.app",
  messagingSenderId: "524281462973",
  appId: "1:524281462973:web:c10b50be1d5b73b4c577d4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const CashflowPrognoseDashboard = () => {
  // State voor alle data
  const [huidigBanksaldo, setHuidigBanksaldo] = useState(0);
  const [timelineWeergave, setTimelineWeergave] = useState('dag'); // dag, week, maand, jaar
  const [selectedPeriode, setSelectedPeriode] = useState(30); // dagen vooruit kijken
  
  // Data states
  const [declaraties, setDeclaraties] = useState([]);
  const [facturen, setFacturen] = useState([]);
  const [correcties, setCorrecties] = useState([]);
  const [credits, setCredits] = useState([]);
  const [banktransacties, setBanktransacties] = useState([]);
  const [verzekeraars, setVerzekeraars] = useState([]);
  const [debiteuren, setDebiteuren] = useState([]);
  const [vasteKosten, setVasteKosten] = useState([]);
  
  // Upload states
  const [activeUploadTab, setActiveUploadTab] = useState('declaraties');
  const [uploadedData, setUploadedData] = useState('');
  const [processingStatus, setProcessingStatus] = useState('');

  // Standaard verzekeraars met betaaltermijnen
  const standaardVerzekeraars = [
    { naam: 'CZ Zorgverzekeringen', betaaltermijn: 30 },
    { naam: 'VGZ', betaaltermijn: 28 },
    { naam: 'Achmea', betaaltermijn: 30 },
    { naam: 'Menzis', betaaltermijn: 35 },
    { naam: 'DSW', betaaltermijn: 30 },
    { naam: 'De Friesland', betaaltermijn: 28 },
    { naam: 'ASR', betaaltermijn: 30 },
    { naam: 'ONVZ', betaaltermijn: 30 },
    { naam: 'OHRA', betaaltermijn: 28 },
    { naam: 'Zilveren Kruis', betaaltermijn: 30 }
  ];

  // Firebase functies
  const saveToFirebase = async (collection, data) => {
    try {
      await addDoc(collection(db, collection), {
        ...data,
        createdAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('Firebase error:', error);
      return false;
    }
  };

  const loadFromFirebase = async (collectionName) => {
    try {
      const q = query(collection(db, collectionName), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Load error:', error);
      return [];
    }
  };

  // Data parsers voor verschillende upload types
  const parseDeclaratiesData = (data) => {
    const lines = data.trim().split('\n');
    if (lines.length === 0) return [];
    
    const parsed = [];
    lines.forEach((line, index) => {
      if (index === 0) return; // Skip header als eerste regel lijkt op header
      
      const columns = line.split(/[;\t,]/); // Support voor ;, tab, komma
      if (columns.length >= 4) {
        const datum = parseDatum(columns[0]?.trim());
        const verzekeraar = columns[1]?.trim();
        const bedrag = parseBedrag(columns[2]?.trim());
        const factuurnummer = columns[3]?.trim();
        const patientNaam = columns[4]?.trim() || '';
        
        if (datum && verzekeraar && bedrag && factuurnummer) {
          // Bepaal verwachte betaaldatum op basis van verzekeraar
          const verzekeraarmatch = standaardVerzekeraars.find(v => 
            verzekeraar.toLowerCase().includes(v.naam.toLowerCase()) ||
            v.naam.toLowerCase().includes(verzekeraar.toLowerCase())
          );
          const betaaltermijn = verzekeraarmatch ? verzekeraarmatch.betaaltermijn : 30;
          const verwachteBetaaldatum = new Date(datum);
          verwachteBetaaldatum.setDate(verwachteBetaaldatum.getDate() + betaaltermijn);
          
          parsed.push({
            id: `decl_${Date.now()}_${index}`,
            datum: datum,
            verzekeraar,
            bedrag,
            factuurnummer,
            patientNaam,
            status: 'openstaand',
            verwachteBetaaldatum: verwachteBetaaldatum.toISOString().split('T')[0],
            type: 'declaratie'
          });
        }
      }
    });
    
    return parsed;
  };

  const parseFacturenData = (data) => {
    const lines = data.trim().split('\n');
    const parsed = [];
    
    lines.forEach((line, index) => {
      if (index === 0) return;
      
      const columns = line.split(/[;\t,]/);
      if (columns.length >= 4) {
        const datum = parseDatum(columns[0]?.trim());
        const debiteur = columns[1]?.trim();
        const bedrag = parseBedrag(columns[2]?.trim());
        const factuurnummer = columns[3]?.trim();
        const omschrijving = columns[4]?.trim() || '';
        const betaaltermijn = parseInt(columns[5]?.trim()) || 30;
        
        if (datum && debiteur && bedrag && factuurnummer) {
          const verwachteBetaaldatum = new Date(datum);
          verwachteBetaaldatum.setDate(verwachteBetaaldatum.getDate() + betaaltermijn);
          
          parsed.push({
            id: `fact_${Date.now()}_${index}`,
            datum,
            debiteur,
            bedrag,
            factuurnummer,
            omschrijving,
            betaaltermijn,
            status: 'openstaand',
            verwachteBetaaldatum: verwachteBetaaldatum.toISOString().split('T')[0],
            type: 'factuur'
          });
        }
      }
    });
    
    return parsed;
  };

  const parseCorrectiesData = (data) => {
    const lines = data.trim().split('\n');
    const parsed = [];
    
    lines.forEach((line, index) => {
      if (index === 0) return;
      
      const columns = line.split(/[;\t,]/);
      if (columns.length >= 4) {
        const datum = parseDatum(columns[0]?.trim());
        const referentie = columns[1]?.trim(); // Oorspronkelijk factuurnummer
        const bedrag = parseBedrag(columns[2]?.trim()); // Correctiebedrag (kan negatief zijn)
        const reden = columns[3]?.trim();
        const type = columns[4]?.trim() || 'correctie';
        
        if (datum && referentie && bedrag) {
          parsed.push({
            id: `corr_${Date.now()}_${index}`,
            datum,
            referentie,
            bedrag,
            reden,
            type: type.toLowerCase().includes('credit') ? 'credit' : 'correctie',
            status: 'te_verwerken'
          });
        }
      }
    });
    
    return parsed;
  };

  const parseBanktransactiesData = (data) => {
    const lines = data.trim().split('\n');
    const parsed = [];
    
    lines.forEach((line, index) => {
      if (index === 0) return;
      
      const columns = line.split(/[;\t,]/);
      if (columns.length >= 4) {
        const datum = parseDatum(columns[0]?.trim());
        const bedrag = parseBedrag(columns[1]?.trim());
        const tegenpartij = columns[2]?.trim();
        const omschrijving = columns[3]?.trim();
        const referentie = columns[4]?.trim() || '';
        
        if (datum && bedrag && tegenpartij) {
          parsed.push({
            id: `bank_${Date.now()}_${index}`,
            datum,
            bedrag,
            tegenpartij,
            omschrijving,
            referentie,
            gematched: false,
            type: 'banktransactie'
          });
        }
      }
    });
    
    return parsed;
  };

  const parseVerzekeraarsData = (data) => {
    const lines = data.trim().split('\n');
    const parsed = [];
    
    lines.forEach((line, index) => {
      if (index === 0) return;
      
      const columns = line.split(/[;\t,]/);
      if (columns.length >= 2) {
        const naam = columns[0]?.trim();
        const betaaltermijn = parseInt(columns[1]?.trim()) || 30;
        
        if (naam && betaaltermijn > 0) {
          parsed.push({
            id: `verz_${Date.now()}_${index}`,
            naam,
            betaaltermijn,
            type: 'verzekeraar'
          });
        }
      }
    });
    
    return parsed;
  };

  const parseDebiteurenData = (data) => {
    const lines = data.trim().split('\n');
    const parsed = [];
    
    lines.forEach((line, index) => {
      if (index === 0) return;
      
      const columns = line.split(/[;\t,]/);
      if (columns.length >= 2) {
        const naam = columns[0]?.trim();
        const betaaltermijn = parseInt(columns[1]?.trim()) || 30;
        const contactinfo = columns[2]?.trim() || '';
        
        if (naam && betaaltermijn > 0) {
          parsed.push({
            id: `deb_${Date.now()}_${index}`,
            naam,
            betaaltermijn,
            contactinfo,
            type: 'debiteur'
          });
        }
      }
    });
    
    return parsed;
  };

  const parseVasteKostenData = (data) => {
    const lines = data.trim().split('\n');
    const parsed = [];
    
    lines.forEach((line, index) => {
      if (index === 0) return;
      
      const columns = line.split(/[;\t,]/);
      if (columns.length >= 3) {
        const omschrijving = columns[0]?.trim();
        const bedrag = parseBedrag(columns[1]?.trim());
        const betaaldag = parseInt(columns[2]?.trim());
        const categorie = columns[3]?.trim() || 'Overig';
        
        if (omschrijving && bedrag && betaaldag > 0 && betaaldag <= 31) {
          parsed.push({
            id: `vaste_${Date.now()}_${index}`,
            omschrijving,
            bedrag: Math.abs(bedrag) * -1, // Vaste kosten zijn altijd negatief
            betaaldag,
            categorie,
            type: 'vaste_kosten'
          });
        }
      }
    });
    
    return parsed;
  };

  // Helper functions
  const parseDatum = (dateStr) => {
    if (!dateStr) return null;
    
    // Probeer verschillende datum formaten
    const formats = [
      /^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/, // DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
      /^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/, // YYYY/MM/DD, YYYY-MM-DD
      /^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2})$/   // DD/MM/YY, DD-MM-YY
    ];
    
    for (let format of formats) {
      const match = dateStr.match(format);
      if (match) {
        let dag, maand, jaar;
        if (format === formats[0]) { // DD/MM/YYYY
          [, dag, maand, jaar] = match;
        } else if (format === formats[1]) { // YYYY/MM/DD
          [, jaar, maand, dag] = match;
        } else { // DD/MM/YY
          [, dag, maand, jaar] = match;
          jaar = parseInt(jaar) < 50 ? `20${jaar}` : `19${jaar}`;
        }
        
        const date = new Date(parseInt(jaar), parseInt(maand) - 1, parseInt(dag));
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
      }
    }
    
    return null;
  };

  const parseBedrag = (bedragStr) => {
    if (!bedragStr) return 0;
    
    // Remove currency symbols and clean the string
    const cleaned = bedragStr.replace(/[€$£¥\s]/g, '');
    
    // Handle European format (1.234,56) vs US format (1,234.56)
    const europeFormat = /^-?\d{1,3}(\.\d{3})*,\d{2}$/.test(cleaned);
    
    if (europeFormat) {
      // European format: replace dots with nothing, comma with dot
      const normalized = cleaned.replace(/\./g, '').replace(',', '.');
      return parseFloat(normalized) || 0;
    } else {
      // US format or simple number
      const normalized = cleaned.replace(/,/g, '');
      return parseFloat(normalized) || 0;
    }
  };

  // Cashflow prognose berekening
  const berekenCashflowPrognose = useMemo(() => {
    const startDatum = new Date();
    const eindDatum = new Date();
    eindDatum.setDate(startDatum.getDate() + selectedPeriode);
    
    const prognoseData = [];
    let lopendSaldo = huidigBanksaldo;
    
    // Genereer data voor elke dag
    for (let d = new Date(startDatum); d <= eindDatum; d.setDate(d.getDate() + 1)) {
      const dagStr = d.toISOString().split('T')[0];
      let dagInkomsten = 0;
      let dagUitgaven = 0;
      
      // Check declaraties die deze dag betaald worden
      declaraties.forEach(decl => {
        if (decl.verwachteBetaaldatum === dagStr && decl.status === 'openstaand') {
          dagInkomsten += decl.bedrag;
        }
      });
      
      // Check facturen die deze dag betaald worden
      facturen.forEach(fact => {
        if (fact.verwachteBetaaldatum === dagStr && fact.status === 'openstaand') {
          dagInkomsten += fact.bedrag;
        }
      });
      
      // Check vaste kosten die deze dag betaald moeten worden
      const dagVanMaand = d.getDate();
      vasteKosten.forEach(vk => {
        if (vk.betaaldag === dagVanMaand) {
          dagUitgaven += Math.abs(vk.bedrag); // Vaste kosten zijn negatief opgeslagen
        }
      });
      
      const nettoMutatie = dagInkomsten - dagUitgaven;
      lopendSaldo += nettoMutatie;
      
      prognoseData.push({
        datum: dagStr,
        dagInkomsten,
        dagUitgaven,
        nettoMutatie,
        eindSaldo: lopendSaldo,
        formatted: {
          datum: d.toLocaleDateString('nl-NL'),
          inkomsten: `€ ${dagInkomsten.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`,
          uitgaven: `€ ${dagUitgaven.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`,
          saldo: `€ ${lopendSaldo.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`
        }
      });
    }
    
    return prognoseData;
  }, [declaraties, facturen, vasteKosten, huidigBanksaldo, selectedPeriode]);

  // Data upload handler
  const handleDataUpload = async () => {
    if (!uploadedData.trim()) {
      setProcessingStatus('⚠️ Geen data ingevoerd om te verwerken');
      return;
    }
    
    setProcessingStatus('🔄 Data aan het verwerken...');
    
    try {
      let parsedData = [];
      let targetCollection = '';
      let setter = null;
      
      switch (activeUploadTab) {
        case 'declaraties':
          parsedData = parseDeclaratiesData(uploadedData);
          targetCollection = 'declaraties';
          setter = setDeclaraties;
          break;
        case 'facturen':
          parsedData = parseFacturenData(uploadedData);
          targetCollection = 'facturen';
          setter = setFacturen;
          break;
        case 'correcties':
          parsedData = parseCorrectiesData(uploadedData);
          targetCollection = 'correcties';
          setter = setCorrecties;
          break;
        case 'banktransacties':
          parsedData = parseBanktransactiesData(uploadedData);
          targetCollection = 'banktransacties';
          setter = setBanktransacties;
          break;
        case 'verzekeraars':
          parsedData = parseVerzekeraarsData(uploadedData);
          targetCollection = 'verzekeraars';
          setter = setVerzekeraars;
          break;
        case 'debiteuren':
          parsedData = parseDebiteurenData(uploadedData);
          targetCollection = 'debiteuren';  
          setter = setDebiteuren;
          break;
        case 'vaste_kosten':
          parsedData = parseVasteKostenData(uploadedData);
          targetCollection = 'vaste_kosten';
          setter = setVasteKosten;
          break;
        default:
          throw new Error('Onbekend upload type');
      }
      
      if (parsedData.length === 0) {
        setProcessingStatus('⚠️ Geen geldige data gevonden in de upload');
        return;
      }
      
      // Save to Firebase
      let savedCount = 0;
      for (const item of parsedData) {
        const success = await saveToFirebase(targetCollection, item);
        if (success) savedCount++;
      }
      
      // Update local state
      if (setter) {
        setter(prev => [...prev, ...parsedData]);
      }
      
      setProcessingStatus(`✅ ${savedCount}/${parsedData.length} items succesvol verwerkt en opgeslagen`);
      setUploadedData('');
      
    } catch (error) {
      console.error('Upload error:', error);
      setProcessingStatus(`❌ Fout bij verwerken: ${error.message}`);
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadAllData = async () => {
      try {
        const [
          declaratiesData,
          facturenData,
          correctiesData,
          banktransactiesData,
          verzekeraarsData,
          debiteurenData,
          vasteKostenData
        ] = await Promise.all([
          loadFromFirebase('declaraties'),
          loadFromFirebase('facturen'),
          loadFromFirebase('correcties'),
          loadFromFirebase('banktransacties'),
          loadFromFirebase('verzekeraars'),
          loadFromFirebase('debiteuren'),
          loadFromFirebase('vaste_kosten')
        ]);
        
        setDeclaraties(declaratiesData);
        setFacturen(facturenData);
        setCorrecties(correctiesData);
        setBanktransacties(banktransactiesData);
        setVerzekeraars(verzekeraarsData);
        setDebiteuren(debiteurenData);
        setVasteKosten(vasteKostenData);
        
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadAllData();
  }, []);

  // Upload tab configuraties
  const uploadTabs = {
    declaraties: {
      label: 'EPD Declaraties',
      placeholder: `Plak hier je declaratie data uit het EPD in dit formaat:
Datum;Verzekeraar;Bedrag;Factuurnummer;Patient
01-01-2024;CZ Zorgverzekeringen;89.50;2024001;Jan Jansen
02-01-2024;VGZ;125.00;2024002;Marie Pieters`,
      help: 'Upload declaraties naar zorgverzekeraars uit je EPD export'
    },
    facturen: {
      label: 'Particuliere Facturen',  
      placeholder: `Plak hier je factuur data in dit formaat:
Datum;Debiteur;Bedrag;Factuurnummer;Omschrijving;Betaaltermijn
01-01-2024;Klaas Vaak;150.00;F2024001;Behandeling;30
02-01-2024;Pietje Puk;200.00;F2024002;Consult;14`,
      help: 'Upload facturen naar particuliere cliënten'
    },
    correcties: {
      label: 'Correcties & Credits',
      placeholder: `Plak hier correctie/credit data in dit formaat:
Datum;Referentie;Bedrag;Reden;Type  
01-01-2024;2024001;-25.00;Onjuiste declaratie;correctie
02-01-2024;F2024001;-50.00;Creditnota;credit`,
      help: 'Upload correctiefacturen, creditnota\'s en creditdeclaraties'
    },
    banktransacties: {
      label: 'Banktransacties',
      placeholder: `Plak hier je banktransacties in dit formaat:
Datum;Bedrag;Tegenpartij;Omschrijving;Referentie
01-01-2024;89.50;CZ Zorgverzekeringen;Betaling declaratie;2024001
02-01-2024;-850.00;Verhuurder;Huur praktijk;HUUR-01`,
      help: 'Upload bankafschriften voor reconciliatie'
    },
    verzekeraars: {
      label: 'Verzekeraars & Betaaltermijnen',
      placeholder: `Plak hier verzekeraar data in dit formaat:
Naam;Betaaltermijn
CZ Zorgverzekeringen;30
VGZ;28
Achmea;30`,
      help: 'Upload of wijzig betaaltermijnen per verzekeraar'
    },
    debiteuren: {
      label: 'Overige Debiteuren',
      placeholder: `Plak hier debiteur data in dit formaat:
Naam;Betaaltermijn;Contactinfo
Fysiotherapie Centrum;14;info@fysio.nl
Tandarts Praktijk;30;administratie@tandarts.nl`,
      help: 'Upload debiteuren met hun betaaltermijnen'
    },
    vaste_kosten: {
      label: 'Vaste Kosten',
      placeholder: `Plak hier vaste kosten data in dit formaat:
Omschrijving;Bedrag;Betaaldag;Categorie
Huur praktijkruimte;850.00;1;Huisvesting
Verzekering;125.00;15;Verzekeringen
Software licentie;49.95;28;IT`,
      help: 'Upload maandelijks terugkerende kosten met betaaldagen'
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Cashflow Prognose Dashboard</h1>
              <p className="text-gray-600 mt-1">Banksaldo projectie en financiële planning voor je praktijk</p>
            </div>
            
            {/* Huidig banksaldo instellen */}
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Huidig Banksaldo:
              </label>
              <input
                type="number"
                step="0.01"
                value={huidigBanksaldo}
                onChange={(e) => setHuidigBanksaldo(parseFloat(e.target.value) || 0)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right font-medium"
                placeholder="0.00"
              />
              <span className="text-sm text-gray-500">EUR</span>
            </div>
          </div>
        </div>

        {/* Timeline Controls */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex gap-2">
              {[
                { key: 'dag', label: 'Per Dag' },
                { key: 'week', label: 'Per Week' },
                { key: 'maand', label: 'Per Maand' },
                { key: 'jaar', label: 'Per Jaar' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setTimelineWeergave(key)}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    timelineWeergave === key
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">
                Periode:
              </label>
              <select
                value={selectedPeriode}
                onChange={(e) => setSelectedPeriode(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={7}>7 dagen</option>
                <option value={14}>14 dagen</option>
                <option value={30}>30 dagen</option>
                <option value={60}>60 dagen</option>
                <option value={90}>90 dagen</option>
                <option value={180}>180 dagen</option>
                <option value={365}>1 jaar</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cashflow Grafiek */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Banksaldo Projectie - Komende {selectedPeriode} Dagen
          </h2>
          
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={berekenCashflowPrognose}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="formatted.datum"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tickFormatter={(value) => `€ ${value.toLocaleString('nl-NL')}`}
                />
                <Tooltip 
                  labelFormatter={(label, payload) => `Datum: ${label}`}
                  formatter={(value, name) => {
                    const formattedValue = `€ ${value.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`;
                    return [formattedValue, name];
                  }}
                />
                <Legend />
                
                <Bar 
                  dataKey="dagInkomsten" 
                  fill="#10B981" 
                  name="Inkomsten"
                  opacity={0.8}
                />
                <Bar 
                  dataKey="dagUitgaven" 
                  fill="#EF4444" 
                  name="Uitgaven"
                  opacity={0.8}
                />
                <Line 
                  type="monotone" 
                  dataKey="eindSaldo" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  name="Banksaldo"
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          
          {/* Saldo waarschuwingen */}
          {berekenCashflowPrognose.some(item => item.eindSaldo < 0) && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <h3 className="text-red-800 font-medium">⚠️ Negatief Saldo Verwacht</h3>
              <p className="text-red-700 text-sm mt-1">
                Je banksaldo wordt negatief op bepaalde dagen. Overweeg om:
                <br />• Betalingstermijnen te verkorten
                <br />• Extra liquiditeit te regelen  
                <br />• Uitgaven uit te stellen
              </p>
            </div>
          )}
        </div>

        {/* Data Upload Sectie */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Upload & Management</h2>
          
          {/* Upload Tabs */}
          <div className="border-b border-gray-200 mb-4">
            <nav className="-mb-px flex space-x-8">
              {Object.entries(uploadTabs).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setActiveUploadTab(key)}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                    activeUploadTab === key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {config.label}
                </button>
              ))}
            </nav>
          </div>
          
          {/* Upload Interface */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {uploadTabs[activeUploadTab].help}
              </label>
              <textarea
                value={uploadedData}
                onChange={(e) => setUploadedData(e.target.value)}
                placeholder={uploadTabs[activeUploadTab].placeholder}
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={handleDataUpload}
                disabled={!uploadedData.trim()}
                className={`px-6 py-2 rounded-md font-medium ${
                  uploadedData.trim()
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Data Verwerken
              </button>
              
              {processingStatus && (
                <div className="text-sm font-medium">
                  {processingStatus}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Data Overzichten */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Openstaande Declaraties */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Openstaande Declaraties ({declaraties.filter(d => d.status === 'openstaand').length})
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {declaraties.filter(d => d.status === 'openstaand').slice(0, 10).map(decl => (
                <div key={decl.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                  <div>
                    <div className="font-medium">{decl.verzekeraar}</div>
                    <div className="text-sm text-gray-600">{decl.factuurnummer} - {decl.patientNaam}</div>
                    <div className="text-xs text-blue-600">Verwacht: {new Date(decl.verwachteBetaaldatum).toLocaleDateString('nl-NL')}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">
                      € {decl.bedrag.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vaste Kosten Deze Maand */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Vaste Kosten Deze Maand ({vasteKosten.length})
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {vasteKosten.map(vk => (
                <div key={vk.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                  <div>
                    <div className="font-medium">{vk.omschrijving}</div>
                    <div className="text-sm text-gray-600">{vk.categorie}</div>
                    <div className="text-xs text-red-600">Betaaldag: {vk.betaaldag}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-red-600">
                      € {Math.abs(vk.bedrag).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Cashflow Prognose Dashboard - Versie 1.0 | Gemaakt voor Nederlandse (para)medische praktijken</p>
          <p className="mt-1">🔥 Firebase verbinding actief | Data wordt automatisch opgeslagen</p>
        </div>
      </div>
    </div>
  );
};

export default CashflowPrognoseDashboard;