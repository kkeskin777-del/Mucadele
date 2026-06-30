import React, { useState } from 'react';
import { FinanceData, SavingsGoal } from '../types';
import { PiggyBank, Plus, CheckCircle2, TrendingUp, Compass, Target } from 'lucide-react';

interface SavingsTabProps {
  data: FinanceData;
  onUpdateSavings: (goal: SavingsGoal) => void;
  onUpdateTotalCashBudget: (amount: number) => void;
}

export default function SavingsTab({ data, onUpdateSavings, onUpdateTotalCashBudget }: SavingsTabProps) {
  const { savingsGoal, totalCashBudget } = data;

  // Form State for Savings Edit
  const [monthlyTarget, setMonthlyTarget] = useState(savingsGoal.monthlyTarget.toString());
  const [monthlyCurrent, setMonthlyCurrent] = useState(savingsGoal.monthlyCurrent.toString());
  const [yearlyTarget, setYearlyTarget] = useState(savingsGoal.yearlyTarget.toString());
  const [yearlyCurrent, setYearlyCurrent] = useState(savingsGoal.yearlyCurrent.toString());

  // Form State for Budget Edit
  const [cashBudget, setCashBudget] = useState(totalCashBudget.toString());

  // Toggles for Edit Forms
  const [isEditingSavings, setIsEditingSavings] = useState(false);
  const [isEditingBudget, setIsEditingBudget] = useState(false);

  const handleSavingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mt = parseFloat(monthlyTarget);
    const mc = parseFloat(monthlyCurrent);
    const yt = parseFloat(yearlyTarget);
    const yc = parseFloat(yearlyCurrent);

    if (isNaN(mt) || isNaN(mc) || isNaN(yt) || isNaN(yc) || mt < 0 || mc < 0 || yt < 0 || yc < 0) {
      alert('Lütfen tüm birikim değerlerini geçerli sayılar olarak girin.');
      return;
    }

    onUpdateSavings({
      monthlyTarget: mt,
      monthlyCurrent: mc,
      yearlyTarget: yt,
      yearlyCurrent: yc
    });
    setIsEditingSavings(false);
  };

  const handleBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(cashBudget);
    if (isNaN(parsed) || parsed < 0) {
      alert('Lütfen geçerli bir bütçe tutarı girin.');
      return;
    }
    onUpdateTotalCashBudget(parsed);
    setIsEditingBudget(false);
  };

  // Percentage Calculations
  const monthlyPct = savingsGoal.monthlyTarget > 0 
    ? Math.min(100, Math.round((savingsGoal.monthlyCurrent / savingsGoal.monthlyTarget) * 100))
    : 0;

  const yearlyPct = savingsGoal.yearlyTarget > 0 
    ? Math.min(100, Math.round((savingsGoal.yearlyCurrent / savingsGoal.yearlyTarget) * 100))
    : 0;

  return (
    <div className="p-6 space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Birikim Hedeflerim</h2>
        <p className="text-xs text-slate-500 font-semibold">Geleceğiniz için koyduğunuz aylık ve yıllık hedefleri yönetin</p>
      </div>

      {/* Main Budget Manager Card */}
      <div className="bg-white border-2 border-slate-100 rounded-3xl p-5 space-y-3 shadow-sm">
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-slate-400 uppercase tracking-wide font-bold">Toplam Nakit Bütçem</span>
          <button
            id="btn-edit-budget"
            onClick={() => {
              setCashBudget(totalCashBudget.toString());
              setIsEditingBudget(!isEditingBudget);
            }}
            className="text-[10px] text-indigo-600 hover:underline font-bold cursor-pointer"
          >
            {isEditingBudget ? 'Kapat' : 'Bütçeyi Güncelle'}
          </button>
        </div>

        {isEditingBudget ? (
          <form id="form-edit-budget" onSubmit={handleBudgetSubmit} className="space-y-3.5 pt-1 animate-slideDown">
            <div className="flex gap-2">
              <input
                id="inp-edit-budget"
                type="number"
                value={cashBudget}
                onChange={(e) => setCashBudget(e.target.value)}
                className="flex-1 bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 rounded-xl py-2 px-3.5 text-xs font-bold text-slate-800 focus:outline-none"
              />
              <button
                id="btn-save-budget"
                type="submit"
                className="py-2 px-4 bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs rounded-xl cursor-pointer shadow-md shadow-rose-100"
              >
                Kaydet
              </button>
            </div>
          </form>
        ) : (
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-800">{totalCashBudget.toLocaleString('tr-TR')} TL</span>
            <span className="text-[10px] text-slate-500 font-bold">aktif nakit havuzu</span>
          </div>
        )}
      </div>

      {/* Visual Savings Goal Grid Cards */}
      <div className="grid grid-cols-1 gap-4">
        
        {/* Monthly Card */}
        <div className="bg-white border-2 border-slate-100 rounded-3xl p-5 space-y-4 shadow-sm hover:border-indigo-100 transition-all text-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <Target className="w-4.5 h-4.5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-800">Aylık Birikim Hedefi</h4>
              <span className="text-[10px] text-slate-400 font-semibold">Hedef: {savingsGoal.monthlyTarget.toLocaleString('tr-TR')} TL</span>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-100/50 flex justify-between items-center">
            <div>
              <span className="text-[9px] text-slate-400 block font-bold uppercase">Bu Ay Biriktirilen</span>
              <span className="text-base font-black text-slate-800 mt-1 block">
                {savingsGoal.monthlyCurrent.toLocaleString('tr-TR')} TL
              </span>
            </div>
            <div className="bg-indigo-50 border border-indigo-100 rounded-full w-14 h-14 flex flex-col items-center justify-center">
              <span className="text-[11px] font-black text-indigo-600">%{monthlyPct}</span>
              <span className="text-[7px] text-indigo-500 font-bold uppercase">Hedef</span>
            </div>
          </div>

          {/* Linear Progress Bar */}
          <div className="space-y-1.5">
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-rose-400 rounded-full transition-all duration-300"
                style={{ width: `${monthlyPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Yearly Card */}
        <div className="bg-white border-2 border-slate-100 rounded-3xl p-5 space-y-4 shadow-sm hover:border-indigo-100 transition-all text-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <Compass className="w-4.5 h-4.5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-800">Yıllık Birikim Hedefi</h4>
              <span className="text-[10px] text-slate-400 font-semibold">Hedef: {savingsGoal.yearlyTarget.toLocaleString('tr-TR')} TL</span>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-100/50 flex justify-between items-center">
            <div>
              <span className="text-[9px] text-slate-400 block font-bold uppercase">Bu Yıl Biriktirilen</span>
              <span className="text-base font-black text-slate-800 mt-1 block">
                {savingsGoal.yearlyCurrent.toLocaleString('tr-TR')} TL
              </span>
            </div>
            <div className="bg-indigo-50 border border-indigo-100 rounded-full w-14 h-14 flex flex-col items-center justify-center">
              <span className="text-[11px] font-black text-indigo-600">%{yearlyPct}</span>
              <span className="text-[7px] text-indigo-500 font-bold uppercase">Hedef</span>
            </div>
          </div>

          {/* Linear Progress Bar */}
          <div className="space-y-1.5">
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-rose-400 rounded-full transition-all duration-300"
                style={{ width: `${yearlyPct}%` }}
              />
            </div>
          </div>
        </div>

      </div>

      {/* Update Savings Goals Form */}
      <div className="bg-white border-2 border-slate-100 p-5 rounded-3xl shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Hedef Değerlerini Güncelle</span>
          <button
            id="btn-toggle-edit-savings"
            onClick={() => {
              setMonthlyTarget(savingsGoal.monthlyTarget.toString());
              setMonthlyCurrent(savingsGoal.monthlyCurrent.toString());
              setYearlyTarget(savingsGoal.yearlyTarget.toString());
              setYearlyCurrent(savingsGoal.yearlyCurrent.toString());
              setIsEditingSavings(!isEditingSavings);
            }}
            className="text-[10px] text-indigo-600 hover:underline font-bold cursor-pointer"
          >
            {isEditingSavings ? 'Kapat' : 'Tüm Değerleri Düzenle'}
          </button>
        </div>

        {isEditingSavings && (
          <form id="form-edit-savings" onSubmit={handleSavingsSubmit} className="space-y-3.5 animate-slideDown">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Aylık Hedef (TL)</label>
                <input
                  id="inp-monthly-target"
                  type="number"
                  value={monthlyTarget}
                  onChange={(e) => setMonthlyTarget(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 rounded-xl py-2.5 px-4 text-xs font-bold text-slate-800 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Aylık Mevcut (TL)</label>
                <input
                  id="inp-monthly-current"
                  type="number"
                  value={monthlyCurrent}
                  onChange={(e) => setMonthlyCurrent(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 rounded-xl py-2.5 px-4 text-xs font-bold text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Yıllık Hedef (TL)</label>
                <input
                  id="inp-yearly-target"
                  type="number"
                  value={yearlyTarget}
                  onChange={(e) => setYearlyTarget(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 rounded-xl py-2.5 px-4 text-xs font-bold text-slate-800 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Yıllık Mevcut (TL)</label>
                <input
                  id="inp-yearly-current"
                  type="number"
                  value={yearlyCurrent}
                  onChange={(e) => setYearlyCurrent(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 rounded-xl py-2.5 px-4 text-xs font-bold text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <button
              id="btn-save-savings-goals"
              type="submit"
              className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl cursor-pointer shadow-md shadow-rose-100"
            >
              Birikimleri Güncelle
            </button>
          </form>
        )}
      </div>

    </div>
  );
}
