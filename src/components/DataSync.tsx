import React, { useState } from 'react';
import { FinanceData } from '../types';
import { Download, Upload, CheckCircle2, AlertTriangle, RotateCcw } from 'lucide-react';

interface DataSyncProps {
  data: FinanceData;
  onImport: (newData: FinanceData) => void;
  onReset: () => void;
}

export default function DataSync({ data, onImport, onReset }: DataSyncProps) {
  const [jsonString, setJsonString] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showDangerZone, setShowDangerZone] = useState(false);

  const handleExport = () => {
    const exportedStr = JSON.stringify(data, null, 2);
    setJsonString(exportedStr);
    navigator.clipboard.writeText(exportedStr);
    setCopied(true);
    setSuccess(true);
    setError('');
    setTimeout(() => {
      setCopied(false);
      setSuccess(false);
    }, 3000);
  };

  const handleImport = () => {
    try {
      if (!jsonString.trim()) {
        setError('Lütfen önce aktarmak istediğiniz JSON verisini yapıştırın.');
        return;
      }
      const parsed = JSON.parse(jsonString.trim());
      
      // Basic validation
      if (
        typeof parsed.totalCashBudget !== 'number' ||
        !Array.isArray(parsed.categories) ||
        !Array.isArray(parsed.creditCards) ||
        !Array.isArray(parsed.loans) ||
        !Array.isArray(parsed.overdraftAccounts) ||
        !Array.isArray(parsed.expenses) ||
        typeof parsed.savingsGoal !== 'object'
      ) {
        throw new Error('Geçersiz veri şeması. Lütfen doğru finans JSON formatını kullandığınızdan emin olun.');
      }

      onImport(parsed);
      setSuccess(true);
      setError('');
      setJsonString('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'JSON ayrıştırılamadı. Formatı kontrol edin.');
    }
  };

  return (
    <div className="p-5 bg-white border-2 border-slate-100 rounded-3xl space-y-4 shadow-sm text-slate-800 animate-slideDown">
      <div className="flex items-center gap-2">
        <Download className="w-5 h-5 text-indigo-600 animate-bounce" />
        <h3 className="font-bold text-slate-900 text-sm">Veri Yedekleme ve Eşitleme</h3>
      </div>
      <p className="text-xs text-slate-500 font-semibold leading-relaxed">
        Bu uygulamadaki tüm veriler cihazınızda yerel olarak saklanır. PC ve iPhone arasında eşitleme yapmak için mevcut verilerinizi kopyalayıp diğer cihazda içeri aktarabilirsiniz.
      </p>

      {/* Export / Copy Button */}
      <div className="grid grid-cols-2 gap-3">
        <button
          id="btn-export-data"
          onClick={handleExport}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all text-xs font-bold rounded-xl text-slate-700 cursor-pointer"
        >
          <Download className="w-4 h-4 text-slate-600" />
          {copied ? 'Kopyalandı!' : 'Veriyi Dışa Aktar'}
        </button>

        <button
          id="btn-show-import"
          onClick={() => {
            setJsonString('');
            setError('');
          }}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-indigo-50 hover:bg-indigo-100 active:scale-95 transition-all text-xs font-bold rounded-xl text-indigo-600 cursor-pointer border border-indigo-100"
        >
          <Upload className="w-4 h-4 text-indigo-500" />
          İçeri Aktarmaya Hazırla
        </button>
      </div>

      {/* JSON text area */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-slate-400 block uppercase tracking-wide">JSON Verisi</label>
        <textarea
          id="txt-json-sync"
          value={jsonString}
          onChange={(e) => setJsonString(e.target.value)}
          placeholder='{"totalCashBudget": 25000, ...}'
          className="w-full h-32 bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 rounded-xl p-3 text-xs font-mono text-slate-800 focus:outline-none scrollbar-none"
        />
        {jsonString.trim() && (
          <button
            id="btn-confirm-import"
            onClick={handleImport}
            className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl active:scale-98 transition-all cursor-pointer shadow-md shadow-rose-100"
          >
            Verileri İçeri Aktar ve Üzerine Yaz
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-600 animate-fadeIn font-semibold">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {success && !error && (
        <div className="flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-700 animate-fadeIn font-semibold">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
          <span>Mali veriler başarıyla yedeklendi / eşitlendi!</span>
        </div>
      )}

      {/* Danger zone / Reset app to default */}
      <div className="pt-2 border-t border-slate-100">
        {!showDangerZone ? (
          <button
            id="btn-show-danger"
            onClick={() => setShowDangerZone(true)}
            className="text-[11px] text-slate-400 hover:text-slate-600 font-bold hover:underline block cursor-pointer"
          >
            Varsayılan Örnek Verilere Sıfırla...
          </button>
        ) : (
          <div className="space-y-2 p-3 bg-rose-50 border border-rose-100 rounded-xl animate-fadeIn">
            <span className="text-[11px] text-rose-600 block font-bold">Bütün verileri sıfırlayıp varsayılan örnek verileri yüklemek istediğinize emin misiniz?</span>
            <div className="flex gap-2">
              <button
                id="btn-reset-confirm"
                onClick={() => {
                  onReset();
                  setShowDangerZone(false);
                }}
                className="py-1 px-2.5 bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-black rounded-lg cursor-pointer shadow-sm shadow-rose-100"
              >
                Evet, Sıfırla
              </button>
              <button
                id="btn-reset-cancel"
                onClick={() => setShowDangerZone(false)}
                className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold rounded-lg cursor-pointer"
              >
                İptal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
