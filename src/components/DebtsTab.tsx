import React, { useState } from 'react';
import { FinanceData, Loan, OverdraftAccount } from '../types';
import { TrendingDown, Percent, Plus, Trash2, Calendar, Landmark, AlertCircle, Sparkles } from 'lucide-react';

interface DebtsTabProps {
  data: FinanceData;
  onAddLoan: (loan: Omit<Loan, 'id'>) => void;
  onDeleteLoan: (loanId: string) => void;
  onAddOverdraft: (overdraft: Omit<OverdraftAccount, 'id'>) => void;
  onDeleteOverdraft: (overdraftId: string) => void;
  onUpdateOverdraftDebt: (overdraftId: string, newDebt: number) => void;
  onMakePayment: (type: 'credit_card' | 'loan' | 'overdraft', id: string, amount: number) => void;
}

export default function DebtsTab({
  data,
  onAddLoan,
  onDeleteLoan,
  onAddOverdraft,
  onDeleteOverdraft,
  onUpdateOverdraftDebt,
  onMakePayment
}: DebtsTabProps) {
  const { loans, overdraftAccounts } = data;

  // Tab View: Krediler vs Eksi Bakiyeler
  const [subSection, setSubSection] = useState<'loans' | 'overdrafts'>('loans');

  // Form toggles
  const [showLoanForm, setShowLoanForm] = useState(false);
  const [showOverdraftForm, setShowOverdraftForm] = useState(false);

  // New Loan Form State
  const [loanName, setLoanName] = useState('');
  const [loanInstallment, setLoanInstallment] = useState('');
  const [loanDueDate, setLoanDueDate] = useState('5');
  const [loanTotal, setLoanTotal] = useState('');
  const [loanRemainingInst, setLoanRemainingInst] = useState('');

  // New Overdraft Form State
  const [odBankName, setOdBankName] = useState('');
  const [odLimit, setOdLimit] = useState('');
  const [odDebt, setOdDebt] = useState('');
  const [odInterest, setOdInterest] = useState('5.0');

  // Manual Overdraft debt edit
  const [editingOdId, setEditingOdId] = useState<string | null>(null);
  const [editingOdDebt, setEditingOdDebt] = useState('');

  // Payment Form States
  const [payingLoanId, setPayingLoanId] = useState<string | null>(null);
  const [loanPayAmount, setLoanPayAmount] = useState('');

  const [payingOdId, setPayingOdId] = useState<string | null>(null);
  const [odPayAmount, setOdPayAmount] = useState('');

  const handleAddLoanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loanName.trim() || !loanInstallment.trim()) return;

    const parsedInst = parseFloat(loanInstallment);
    const parsedDue = parseInt(loanDueDate);
    const parsedTotal = loanTotal.trim() ? parseFloat(loanTotal) : undefined;
    const parsedRem = loanRemainingInst.trim() ? parseInt(loanRemainingInst) : undefined;

    if (isNaN(parsedInst) || parsedInst <= 0 || isNaN(parsedDue) || parsedDue < 1 || parsedDue > 31) {
      alert('Lütfen geçerli ödeme değerleri girin (Günü 1-31 arasında olmalıdır).');
      return;
    }

    onAddLoan({
      name: loanName.trim(),
      installment: parsedInst,
      dueDate: parsedDue,
      totalAmount: parsedTotal,
      remainingInstallments: parsedRem
    });

    // Reset Form
    setLoanName('');
    setLoanInstallment('');
    setLoanDueDate('5');
    setLoanTotal('');
    setLoanRemainingInst('');
    setShowLoanForm(false);
  };

  const handleAddOverdraftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!odBankName.trim() || !odLimit.trim() || !odDebt.trim()) return;

    const parsedLimit = parseFloat(odLimit);
    const parsedDebt = parseFloat(odDebt);
    const parsedInterest = parseFloat(odInterest);

    if (isNaN(parsedLimit) || parsedLimit <= 0 || isNaN(parsedDebt) || parsedDebt < 0 || isNaN(parsedInterest) || parsedInterest < 0) {
      alert('Lütfen geçerli limit, borç ve faiz değerleri girin.');
      return;
    }

    onAddOverdraft({
      bankName: odBankName.trim(),
      limit: parsedLimit,
      debt: parsedDebt,
      interestRate: parsedInterest
    });

    setOdBankName('');
    setOdLimit('');
    setOdDebt('');
    setOdInterest('5.0');
    setShowOverdraftForm(false);
  };

  const handleStartEditOdDebt = (od: OverdraftAccount) => {
    setEditingOdId(od.id);
    setEditingOdDebt(od.debt.toString());
    setPayingOdId(null);
  };

  const handleSaveOdDebtEdit = (odId: string) => {
    const parsed = parseFloat(editingOdDebt);
    if (isNaN(parsed) || parsed < 0) return;
    onUpdateOverdraftDebt(odId, parsed);
    setEditingOdId(null);
  };

  const handleConfirmLoanPayment = (loanId: string, defaultAmount: number) => {
    const parsed = parseFloat(loanPayAmount || defaultAmount.toString());
    if (isNaN(parsed) || parsed <= 0) {
      alert('Lütfen geçerli bir ödeme miktarı girin.');
      return;
    }

    if (parsed > data.totalCashBudget) {
      if (!confirm(`Ödeme miktarı (${parsed.toLocaleString('tr-TR')} TL) nakit bütçenizi (${data.totalCashBudget.toLocaleString('tr-TR')} TL) aşmaktadır. Yine de devam etmek istiyor musunuz?`)) {
        return;
      }
    }

    onMakePayment('loan', loanId, parsed);
    setPayingLoanId(null);
    setLoanPayAmount('');
  };

  const handleConfirmOdPayment = (odId: string) => {
    const parsed = parseFloat(odPayAmount);
    if (isNaN(parsed) || parsed <= 0) {
      alert('Lütfen geçerli bir ödeme miktarı girin.');
      return;
    }

    if (parsed > data.totalCashBudget) {
      if (!confirm(`Ödeme miktarı (${parsed.toLocaleString('tr-TR')} TL) nakit bütçenizi (${data.totalCashBudget.toLocaleString('tr-TR')} TL) aşmaktadır. Yine de devam etmek istiyor musunuz?`)) {
        return;
      }
    }

    onMakePayment('overdraft', odId, parsed);
    setPayingOdId(null);
    setOdPayAmount('');
  };

  return (
    <div className="p-6 space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Krediler ve Eksi Bakiyeler</h2>
        <p className="text-xs text-slate-500 font-semibold">Aktif kredilerinizi, KMH hesaplarınızı ve aylık faiz yükünüzü takip edin</p>
      </div>

      {/* Sub sections toggles */}
      <div className="flex bg-indigo-50/80 p-1 rounded-2xl border border-indigo-100">
        <button
          id="toggle-loans-btn"
          onClick={() => setSubSection('loans')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            subSection === 'loans' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Krediler
        </button>
        <button
          id="toggle-overdrafts-btn"
          onClick={() => setSubSection('overdrafts')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            subSection === 'overdrafts' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Eksi Bakiyeler (KMH)
        </button>
      </div>

      {subSection === 'loans' ? (
        <div className="space-y-4">
          
          {/* Header with Add Button */}
          <div className="flex justify-between items-center">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Mevcut Kredilerim ({loans.length})</span>
            <button
              id="btn-toggle-add-loan"
              onClick={() => setShowLoanForm(!showLoanForm)}
              className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-all border border-indigo-100"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase font-extrabold">Kredi Ekle</span>
            </button>
          </div>

          {/* Add Loan Form */}
          {showLoanForm && (
            <form id="form-add-loan" onSubmit={handleAddLoanSubmit} className="bg-white border-2 border-indigo-100 p-5 rounded-3xl space-y-4 animate-slideDown shadow-sm">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Mevcut Kredi Girin</h4>
              
              <div className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Kredi Adı / Banka</label>
                  <input
                    id="inp-loan-name"
                    type="text"
                    value={loanName}
                    onChange={(e) => setLoanName(e.target.value)}
                    placeholder="Örn: Garanti İhtiyaç Kredisi"
                    required
                    className="w-full bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 rounded-xl py-2.5 px-4 text-xs font-bold text-slate-800 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Aylık Taksit (TL)</label>
                    <input
                      id="inp-loan-inst"
                      type="number"
                      value={loanInstallment}
                      onChange={(e) => setLoanInstallment(e.target.value)}
                      placeholder="4500"
                      required
                      className="w-full bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 rounded-xl py-2.5 px-4 text-xs font-bold text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Taksit Ödeme Günü</label>
                    <input
                      id="inp-loan-due"
                      type="number"
                      min="1"
                      max="31"
                      value={loanDueDate}
                      onChange={(e) => setLoanDueDate(e.target.value)}
                      placeholder="10"
                      required
                      className="w-full bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 rounded-xl py-2.5 px-4 text-xs font-bold text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Toplam Kredi Tutarı</label>
                    <input
                      id="inp-loan-total"
                      type="number"
                      value={loanTotal}
                      onChange={(e) => setLoanTotal(e.target.value)}
                      placeholder="İsteğe bağlı"
                      className="w-full bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 rounded-xl py-2.5 px-4 text-xs font-bold text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Kalan Taksit Sayısı</label>
                    <input
                      id="inp-loan-rem"
                      type="number"
                      value={loanRemainingInst}
                      onChange={(e) => setLoanRemainingInst(e.target.value)}
                      placeholder="İsteğe bağlı"
                      className="w-full bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 rounded-xl py-2.5 px-4 text-xs font-bold text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  id="btn-add-loan-submit"
                  type="submit"
                  className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl cursor-pointer shadow-md shadow-rose-100"
                >
                  Krediyi Kaydet
                </button>
                <button
                  id="btn-add-loan-cancel"
                  type="button"
                  onClick={() => setShowLoanForm(false)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold text-xs rounded-xl cursor-pointer"
                >
                  İptal
                </button>
              </div>
            </form>
          )}

          {/* Loans list */}
          {loans.length === 0 ? (
            <div className="text-center p-12 bg-white border-2 border-dashed border-slate-200 rounded-3xl text-xs text-slate-400 shadow-sm">
              Kayıtlı aktif krediniz bulunmuyor. Kredi Ekle butonu ile girebilirsiniz.
            </div>
          ) : (
            <div className="space-y-3">
              {loans.map((loan) => (
                <div key={loan.id} className="bg-white border-2 border-slate-100 rounded-3xl p-5 space-y-3.5 relative overflow-hidden shadow-sm hover:border-indigo-100 transition-all text-slate-800">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3 items-center">
                      <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
                        <TrendingDown className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-800">{loan.name}</h4>
                        <span className="text-[10px] text-slate-400 font-semibold">Taksit Ödeme Günü: {loan.dueDate}</span>
                      </div>
                    </div>

                    <button
                      id={`btn-del-loan-${loan.id}`}
                      onClick={() => onDeleteLoan(loan.id)}
                      className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border-2 border-slate-100/50">
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase font-bold">AYLIK TAKSİT TUTARI</span>
                      <span className="text-xl font-black text-rose-500 mt-1 block">
                        {loan.installment.toLocaleString('tr-TR')} TL
                      </span>
                    </div>
                    {(loan.totalAmount || loan.remainingInstallments) && (
                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 block uppercase font-bold">KALAN DURUM</span>
                        <span className="text-xs font-bold text-slate-800 mt-1 block">
                          {loan.remainingInstallments ? `${loan.remainingInstallments} Taksit` : 'Aktif Kredi'}
                          {loan.totalAmount && ` / ${loan.totalAmount.toLocaleString('tr-TR')} TL`}
                        </span>
                      </div>
                    )}
                  </div>

                  {payingLoanId === loan.id ? (
                    <div className="flex items-center justify-between bg-rose-50/50 p-3 rounded-2xl border-2 border-rose-100/60 mt-2 animate-slideDown">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-bold text-rose-800 uppercase">Ödeme:</span>
                        <input
                          id={`inp-pay-loan-${loan.id}`}
                          type="number"
                          placeholder={loan.installment.toString()}
                          value={loanPayAmount}
                          onChange={(e) => setLoanPayAmount(e.target.value)}
                          className="w-24 bg-white border-2 border-rose-200 text-xs font-bold text-slate-800 py-1 px-1.5 rounded-lg focus:outline-none focus:border-rose-500"
                        />
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleConfirmLoanPayment(loan.id, loan.installment)}
                          className="bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-bold py-1 px-2.5 rounded-lg cursor-pointer"
                        >
                          Öde
                        </button>
                        <button
                          onClick={() => setPayingLoanId(null)}
                          className="bg-slate-100 text-slate-500 text-[10px] font-bold py-1 px-2 rounded-lg cursor-pointer"
                        >
                          İptal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => {
                          setPayingLoanId(loan.id);
                          setPayingOdId(null);
                          setLoanPayAmount(loan.installment.toString());
                        }}
                        className="px-3 py-1 bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-black rounded-lg cursor-pointer transition-all active:scale-95 flex items-center gap-1 shadow-sm"
                      >
                        <Sparkles className="w-2.5 h-2.5" /> Taksit Öde
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>
      ) : (
        <div className="space-y-4">
          
          {/* Header with Add Button */}
          <div className="flex justify-between items-center">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Mevcut Banka Eksi Bakiyelerim ({overdraftAccounts.length})</span>
            <button
              id="btn-toggle-add-od"
              onClick={() => setShowOverdraftForm(!showOverdraftForm)}
              className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-all border border-indigo-100"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase font-extrabold">KMH Hesabı Ekle</span>
            </button>
          </div>

          {/* Add Overdraft Form */}
          {showOverdraftForm && (
            <form id="form-add-overdraft" onSubmit={handleAddOverdraftSubmit} className="bg-white border-2 border-indigo-100 p-5 rounded-3xl space-y-4 animate-slideDown shadow-sm">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Eksi Bakiye (KMH) Hesabı Ekle</h4>
              
              <div className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Banka / Hesap Adı</label>
                  <input
                    id="inp-od-bank"
                    type="text"
                    value={odBankName}
                    onChange={(e) => setOdBankName(e.target.value)}
                    placeholder="Örn: Akbank Artı Para, Garanti Avans Hesap"
                    required
                    className="w-full bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 rounded-xl py-2.5 px-4 text-xs font-bold text-slate-800 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Limit (TL)</label>
                    <input
                      id="inp-od-limit"
                      type="number"
                      value={odLimit}
                      onChange={(e) => setOdLimit(e.target.value)}
                      placeholder="15000"
                      required
                      className="w-full bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 rounded-xl py-2.5 px-2 text-xs font-bold text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Güncel Borç (TL)</label>
                    <input
                      id="inp-od-debt"
                      type="number"
                      value={odDebt}
                      onChange={(e) => setOdDebt(e.target.value)}
                      placeholder="4000"
                      required
                      className="w-full bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 rounded-xl py-2.5 px-2 text-xs font-bold text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Aylık Faiz Oranı (%)</label>
                    <input
                      id="inp-od-interest"
                      type="number"
                      step="0.01"
                      value={odInterest}
                      onChange={(e) => setOdInterest(e.target.value)}
                      placeholder="5.0"
                      required
                      className="w-full bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 rounded-xl py-2.5 px-2 text-xs font-bold text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  id="btn-add-od-submit"
                  type="submit"
                  className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs rounded-xl cursor-pointer shadow-md shadow-rose-100"
                >
                  Hesabı Kaydet
                </button>
                <button
                  id="btn-add-od-cancel"
                  type="button"
                  onClick={() => setShowOverdraftForm(false)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold text-xs rounded-xl cursor-pointer"
                >
                  İptal
                </button>
              </div>
            </form>
          )}

          {/* Overdraft List */}
          {overdraftAccounts.length === 0 ? (
            <div className="text-center p-12 bg-white border-2 border-dashed border-slate-200 rounded-3xl text-xs text-slate-400 shadow-sm">
              Kayıtlı eksi bakiye hesabı bulunmuyor. KMH Hesabı Ekle butonu ile girebilirsiniz.
            </div>
          ) : (
            <div className="space-y-3">
              {overdraftAccounts.map((od) => {
                const remainingLimit = Math.max(0, od.limit - od.debt);
                const utilization = od.limit > 0 ? Math.round((od.debt / od.limit) * 100) : 0;
                const isCritical = utilization > 50;

                return (
                  <div key={od.id} className="bg-white border-2 border-slate-100 rounded-3xl p-5 space-y-4 relative overflow-hidden shadow-sm hover:border-indigo-100 transition-all text-slate-800">
                    
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3 items-center">
                        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
                          <Landmark className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-800">{od.bankName}</h4>
                          <span className="text-[10px] text-slate-400 font-semibold">Limit: {od.limit.toLocaleString('tr-TR')} TL</span>
                        </div>
                      </div>

                      <button
                        id={`btn-del-od-${od.id}`}
                        onClick={() => onDeleteOverdraft(od.id)}
                        className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Debt display / editable */}
                    <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border-2 border-slate-100/50">
                      <div>
                        <span className="text-[9px] text-slate-400 block uppercase font-bold">KULLANILAN EKSİ BAKİYE (BORÇ)</span>
                        {editingOdId === od.id ? (
                          <div className="flex items-center gap-2 mt-1">
                            <input
                              id={`inp-edit-od-debt-${od.id}`}
                              type="number"
                              value={editingOdDebt}
                              onChange={(e) => setEditingOdDebt(e.target.value)}
                              className="w-24 bg-white border-2 border-slate-200 text-xs font-bold text-slate-800 py-1 px-2 rounded-lg focus:outline-none focus:border-indigo-500"
                            />
                            <button
                              id={`btn-save-od-debt-${od.id}`}
                              onClick={() => handleSaveOdDebtEdit(od.id)}
                              className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer"
                            >
                              Kaydet
                            </button>
                          </div>
                        ) : payingOdId === od.id ? (
                          <div className="flex items-center gap-1.5 mt-1.5 animate-slideDown">
                            <input
                              id={`inp-pay-od-${od.id}`}
                              type="number"
                              placeholder="Miktar"
                              value={odPayAmount}
                              onChange={(e) => setOdPayAmount(e.target.value)}
                              className="w-20 bg-white border-2 border-rose-200 text-xs font-bold text-slate-800 py-1 px-1.5 rounded-lg focus:outline-none focus:border-rose-500"
                            />
                            <button
                              id={`btn-confirm-od-pay-${od.id}`}
                              onClick={() => handleConfirmOdPayment(od.id)}
                              className="bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-bold py-1 px-2.5 rounded-lg cursor-pointer transition-all active:scale-95"
                            >
                              Öde
                            </button>
                            <button
                              onClick={() => setPayingOdId(null)}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-500 text-[10px] font-bold py-1 px-2 rounded-lg cursor-pointer"
                            >
                              İptal
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1.5 mt-1">
                            <span className="text-xl font-black text-rose-500">
                              {od.debt.toLocaleString('tr-TR')} TL
                            </span>
                            <div className="flex gap-2">
                              <button
                                id={`btn-edit-od-debt-${od.id}`}
                                onClick={() => handleStartEditOdDebt(od)}
                                className="text-[9px] text-indigo-600 font-bold hover:text-indigo-700 hover:underline cursor-pointer"
                              >
                                Düzelt
                              </button>
                              {od.debt > 0 && (
                                <button
                                  id={`btn-pay-od-trigger-${od.id}`}
                                  onClick={() => {
                                    setPayingOdId(od.id);
                                    setPayingLoanId(null);
                                    setEditingOdId(null);
                                    setOdPayAmount('');
                                  }}
                                  className="px-2 py-0.5 bg-rose-500 hover:bg-rose-600 text-white text-[9px] font-bold rounded-lg cursor-pointer transition-all active:scale-95 flex items-center gap-0.5"
                                >
                                  <Sparkles className="w-2.5 h-2.5" /> Ödeme Yap
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 block uppercase font-bold">AYLIK FAİZ ORANI</span>
                        <span className="text-xs font-black text-rose-500 mt-1 block">
                          %{od.interestRate}
                        </span>
                      </div>
                    </div>

                    {/* Progress bar of KMH utilization */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-400 font-bold">Bakiye Kullanım Oranı</span>
                        <span className={`font-bold ${isCritical ? 'text-rose-500' : 'text-slate-600'}`}>
                          %{utilization}
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            isCritical ? 'bg-rose-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${utilization}%` }}
                        />
                      </div>
                    </div>

                    {isCritical && (
                      <div className="flex items-center gap-1.5 text-[10px] text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-100 font-semibold">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                        <span>Aylık %{od.interestRate} faiz oranı ile KMH borcunuz birikmektedir. Burayı kapatmak yüksek önceliklidir.</span>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
