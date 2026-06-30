import React from 'react';
import { FinanceData } from '../types';
import * as Icons from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardTabProps {
  data: FinanceData;
  onNavigateToTab: (tabId: string) => void;
  quickAiTips: string[];
}

export default function DashboardTab({ data, onNavigateToTab, quickAiTips }: DashboardTabProps) {
  const { totalCashBudget, creditCards, loans, overdraftAccounts, expenses, savingsGoal } = data;
  const incomes = data.incomes || [];

  // Calculate totals
  const totalCcDebt = creditCards.reduce((acc, cc) => acc + cc.debt, 0);
  const totalCcLimit = creditCards.reduce((acc, cc) => acc + cc.limit, 0);
  const totalLoanInstallments = loans.reduce((acc, loan) => acc + loan.installment, 0);
  const totalOverdraftDebt = overdraftAccounts.reduce((acc, od) => acc + od.debt, 0);
  const totalOverdraftLimit = overdraftAccounts.reduce((acc, od) => acc + od.limit, 0);

  const totalIncome = incomes.reduce((acc, inc) => acc + inc.amount, 0);
  const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);

  // Recent expenses (last 4)
  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  // Icon dynamic rendering helper
  const renderCategoryIcon = (iconName: string, colorClass: string) => {
    // @ts-ignore
    const IconComponent = Icons[iconName] || Icons.HelpCircle;
    return (
      <div className={`p-2 rounded-xl text-white ${colorClass}`}>
        <IconComponent className="w-4 h-4" />
      </div>
    );
  };

  // Savings progress calculation
  const monthlySavingsPct = savingsGoal.monthlyTarget > 0 
    ? Math.min(100, Math.round((savingsGoal.monthlyCurrent / savingsGoal.monthlyTarget) * 100))
    : 0;

  const yearlySavingsPct = savingsGoal.yearlyTarget > 0 
    ? Math.min(100, Math.round((savingsGoal.yearlyCurrent / savingsGoal.yearlyTarget) * 100))
    : 0;

  return (
    <div className="p-6 space-y-6">
      
      {/* Welcome Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">CepteFinans</h1>
          <p className="text-xs text-slate-500 font-semibold">Yapay Zeka Destekli Finansal Yol Arkadaşın</p>
        </div>
        <button 
          onClick={() => onNavigateToTab('settings')}
          className="p-2.5 bg-indigo-50 rounded-2xl border-2 border-indigo-100 shadow-sm cursor-pointer hover:bg-indigo-100 transition-colors"
        >
          <Icons.User className="w-5 h-5 text-indigo-600" />
        </button>
      </div>

      {/* Main Card: Net Cash Budget */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-white p-6 rounded-[32px] border-2 border-indigo-100 shadow-md shadow-indigo-50/50 text-slate-800"
      >
        <div className="absolute right-[-10px] bottom-[-20px] opacity-5">
          <Icons.Wallet className="w-48 h-48 text-indigo-600" />
        </div>
        <span className="text-[11px] font-black tracking-wider uppercase text-slate-400 block">KULLANILABİLİR NET NAKİTİM</span>
        <h2 className="text-4xl font-black mt-1 text-indigo-600 tracking-tight">
          {totalCashBudget.toLocaleString('tr-TR')} <span className="text-xl font-bold opacity-60">TL</span>
        </h2>

        {/* Income / Expense Flow Summary */}
        <div className="flex gap-4 mt-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-100/50">
          <div className="flex items-center gap-1">
            <Icons.ArrowUpRight className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">GELİR: <strong className="text-emerald-500 font-black">{totalIncome.toLocaleString('tr-TR')} TL</strong></span>
          </div>
          <div className="flex items-center gap-1">
            <Icons.ArrowDownRight className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">GİDER: <strong className="text-rose-500 font-black">{totalExpenses.toLocaleString('tr-TR')} TL</strong></span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-5 pt-4 border-t-2 border-slate-50">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kart Borcu Toplamı</span>
            <span className="text-base font-black tracking-tight text-rose-500">
              {totalCcDebt.toLocaleString('tr-TR')} TL
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kullanılan Eksi Bakiye</span>
            <span className="text-base font-black tracking-tight text-purple-600">
              {totalOverdraftDebt.toLocaleString('tr-TR')} TL
            </span>
          </div>
        </div>
      </motion.div>

      {/* Quick Summary Bento Grid */}
      <div className="grid grid-cols-3 gap-3">
        <button 
          id="nav-cards-btn"
          onClick={() => onNavigateToTab('cards')}
          className="p-4 bg-white rounded-3xl border-2 border-slate-100 hover:border-indigo-100 active:scale-95 transition-all text-left flex flex-col justify-between h-28 cursor-pointer shadow-sm"
        >
          <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-xl w-fit">
            <Icons.CreditCard className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wide">Kartlarım</span>
            <span className="text-xs font-black text-slate-800">{creditCards.length} Kart</span>
          </div>
        </button>

        <button 
          id="nav-loans-btn"
          onClick={() => onNavigateToTab('debts')}
          className="p-4 bg-white rounded-3xl border-2 border-slate-100 hover:border-indigo-100 active:scale-95 transition-all text-left flex flex-col justify-between h-28 cursor-pointer shadow-sm"
        >
          <div className="p-1.5 bg-amber-50 text-amber-600 rounded-xl w-fit">
            <Icons.TrendingDown className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wide">Aylık Kredi</span>
            <span className="text-xs font-black text-slate-800">{totalLoanInstallments.toLocaleString('tr-TR')} TL</span>
          </div>
        </button>

        <button 
          id="nav-overdrafts-btn"
          onClick={() => onNavigateToTab('debts')}
          className="p-4 bg-white rounded-3xl border-2 border-slate-100 hover:border-indigo-100 active:scale-95 transition-all text-left flex flex-col justify-between h-28 cursor-pointer shadow-sm"
        >
          <div className="p-1.5 bg-purple-50 text-purple-600 rounded-xl w-fit">
            <Icons.Percent className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wide">KMH Borç</span>
            <span className="text-xs font-black text-slate-800">{totalOverdraftDebt.toLocaleString('tr-TR')} TL</span>
          </div>
        </button>
      </div>

      {/* AI Tips Quick Card */}
      <div className="bg-indigo-50/80 rounded-[32px] border-2 border-indigo-100 p-6 space-y-4 relative overflow-hidden shadow-sm">
        <div className="absolute right-[-10px] top-[-10px] opacity-10">
          <Icons.Sparkles className="w-24 h-24 text-indigo-400" />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 text-white p-1 rounded-lg text-[10px] font-black px-2">
              AI ASİSTAN
            </div>
            <h3 className="font-bold text-xs text-indigo-950 tracking-tight uppercase">Akıllı Öneri</h3>
          </div>
          <button 
            id="nav-ai-btn"
            onClick={() => onNavigateToTab('ai')}
            className="text-[10px] text-indigo-600 hover:text-indigo-700 font-bold cursor-pointer hover:underline"
          >
            Detaylı Analiz Et →
          </button>
        </div>

        <ul className="space-y-2.5 text-xs text-indigo-900/80 font-semibold">
          {quickAiTips.map((tip, idx) => (
            <li key={idx} className="flex gap-2 items-start">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
              <span className="leading-relaxed">{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Savings Progress Indicators */}
      <div className="bg-emerald-500 p-6 rounded-[32px] text-white shadow-lg shadow-emerald-100/80 space-y-5 relative overflow-hidden">
        <div className="absolute right-[-10px] top-[-20px] opacity-10">
          <Icons.PiggyBank className="w-36 h-36" />
        </div>

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <Icons.PiggyBank className="w-5 h-5 text-white" />
            <h3 className="font-bold text-sm text-white">Birikim Hedeflerim</h3>
          </div>
          <button 
            id="nav-savings-btn"
            onClick={() => onNavigateToTab('savings')}
            className="text-[11px] bg-white/20 text-white px-2.5 py-1 rounded-lg font-bold hover:bg-white/30 cursor-pointer"
          >
            Düzenle
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 relative z-10">
          {/* Monthly */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-white/95">
              <span>Bu Ay (%{monthlySavingsPct})</span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${monthlySavingsPct}%` }}
              />
            </div>
            <span className="text-[10px] text-emerald-100 font-semibold block">
              {savingsGoal.monthlyCurrent.toLocaleString('tr-TR')} / {savingsGoal.monthlyTarget.toLocaleString('tr-TR')} TL
            </span>
          </div>

          {/* Yearly */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-white/95">
              <span>Bu Yıl (%{yearlySavingsPct})</span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${yearlySavingsPct}%` }}
              />
            </div>
            <span className="text-[10px] text-emerald-100 font-semibold block">
              {savingsGoal.yearlyCurrent.toLocaleString('tr-TR')} / {savingsGoal.yearlyTarget.toLocaleString('tr-TR')} TL
            </span>
          </div>
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-xs text-slate-400 uppercase tracking-wider">Son Harcamalarım</h3>
          <button 
            id="nav-expenses-btn"
            onClick={() => onNavigateToTab('expenses')}
            className="text-[11px] text-indigo-600 hover:text-indigo-700 font-bold cursor-pointer hover:underline"
          >
            Hepsini Gör
          </button>
        </div>

        {recentExpenses.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 bg-white border-2 border-dashed border-slate-200 rounded-2xl shadow-sm">
            Henüz harcama girilmedi. Harcama Sekmesi'nden ekleyebilirsiniz.
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentExpenses.map((exp) => {
              const category = data.categories.find(cat => cat.id === exp.categoryId) || {
                name: 'Bilinmeyen',
                icon: 'HelpCircle',
                color: 'bg-slate-500'
              };
              const isCc = exp.paymentMethod === 'kredi_karti';
              const ccName = isCc ? (creditCards.find(cc => cc.id === exp.creditCardId)?.name || 'Kredi Kartı') : '';

              return (
                <div 
                  key={exp.id}
                  className="flex items-center justify-between p-4 bg-white rounded-2xl border-2 border-slate-100 shadow-sm hover:border-indigo-100 transition-all"
                >
                  <div className="flex items-center gap-3">
                    {renderCategoryIcon(category.icon, category.color)}
                    <div>
                      <span className="font-bold text-xs text-slate-800 block">{exp.description}</span>
                      <span className="text-[10px] text-slate-500 font-semibold">
                        {category.name} • {isCc ? `${ccName}` : 'Nakit'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-xs text-slate-800 block">-{exp.amount.toLocaleString('tr-TR')} TL</span>
                    <span className="text-[9px] text-slate-400 font-bold">{exp.date}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
