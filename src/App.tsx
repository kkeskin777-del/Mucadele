import React, { useState, useEffect } from 'react';
import { FinanceData, Expense, Category, CreditCard, Loan, OverdraftAccount, SavingsGoal, INITIAL_FINANCE_DATA } from './types';
import IOSFrame from './components/IOSFrame';
import DashboardTab from './components/DashboardTab';
import ExpensesTab from './components/ExpensesTab';
import CardsTab from './components/CardsTab';
import DebtsTab from './components/DebtsTab';
import SavingsTab from './components/SavingsTab';
import AIAssistantTab from './components/AIAssistantTab';
import DataSync from './components/DataSync';
import { Home, ShoppingCart, CreditCard as CardIcon, DollarSign, PiggyBank, Sparkles, Settings } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'ceptefinans_data';
const AI_CACHE_KEY = 'ceptefinans_ai_cache';

const DEFAULT_QUICK_TIPS = [
  "Eksi bakiye borçlarınızın aylık faiz yükü yüksektir (%5.0). Nakit bütçeniz elverdikçe öncelikle bunları kapatmaya çalışın.",
  "Bonus Card son ödeme tarihiniz yaklaşıyor. Gecikme faizine girmemek için takibi bırakmayın.",
  "Bu ayki birikim hedefinize ulaşmak için bütçe disiplininizi koruyun. Günlük küçük harcamaları azaltmak büyük katkı sağlar!"
];

export default function App() {
  // Load data from localStorage or default
  const [data, setData] = useState<FinanceData>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved finance data, loading defaults', e);
      }
    }
    return INITIAL_FINANCE_DATA;
  });

  // Active Bottom Tab
  const [activeTab, setActiveTab] = useState('dashboard');

  // AI Analysis Cache State
  const [analysisResult, setAnalysisResult] = useState<any>(() => {
    const saved = localStorage.getItem(AI_CACHE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved AI analysis', e);
      }
    }
    return null;
  });

  // Quick Dashboard tips compiled from actual results if available
  const [quickAiTips, setQuickAiTips] = useState<string[]>(DEFAULT_QUICK_TIPS);

  // Sync state to localStorage on changes
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  // Sync AI results cache on changes
  useEffect(() => {
    if (analysisResult) {
      localStorage.setItem(AI_CACHE_KEY, JSON.stringify(analysisResult));
      // Derive quick tips from actual AI response warnings
      if (analysisResult.warnings && analysisResult.warnings.length > 0) {
        setQuickAiTips(analysisResult.warnings.slice(0, 3));
      } else if (analysisResult.savingTips && analysisResult.savingTips.length > 0) {
        setQuickAiTips(analysisResult.savingTips.slice(0, 3));
      }
    } else {
      setQuickAiTips(DEFAULT_QUICK_TIPS);
    }
  }, [analysisResult]);

  // 1. HARCAMA EKLEME (Add Expense)
  const handleAddExpense = (newExp: Omit<Expense, 'id'>) => {
    const expenseId = `exp-${Date.now()}`;
    const expense: Expense = { ...newExp, id: expenseId };

    setData((prev) => {
      let updatedCashBudget = prev.totalCashBudget;
      const updatedCards = prev.creditCards.map((cc) => {
        if (expense.paymentMethod === 'kredi_karti' && cc.id === expense.creditCardId) {
          return { ...cc, debt: cc.debt + expense.amount };
        }
        return cc;
      });

      if (expense.paymentMethod === 'nakit') {
        updatedCashBudget = Math.max(0, prev.totalCashBudget - expense.amount);
      }

      return {
        ...prev,
        totalCashBudget: updatedCashBudget,
        creditCards: updatedCards,
        expenses: [expense, ...prev.expenses]
      };
    });
  };

  // 2. HARCAMA SİLME (Delete Expense - Revert balances)
  const handleDeleteExpense = (expenseId: string) => {
    const expense = data.expenses.find((e) => e.id === expenseId);
    if (!expense) return;

    setData((prev) => {
      let updatedCashBudget = prev.totalCashBudget;
      const updatedCards = prev.creditCards.map((cc) => {
        if (expense.paymentMethod === 'kredi_karti' && cc.id === expense.creditCardId) {
          return { ...cc, debt: Math.max(0, cc.debt - expense.amount) };
        }
        return cc;
      });

      if (expense.paymentMethod === 'nakit') {
        updatedCashBudget = prev.totalCashBudget + expense.amount;
      }

      return {
        ...prev,
        totalCashBudget: updatedCashBudget,
        creditCards: updatedCards,
        expenses: prev.expenses.filter((e) => e.id !== expenseId)
      };
    });
  };

  // 3. KATEGORİ YÖNETİMİ (Categories)
  const handleAddCategory = (newCat: Omit<Category, 'id'>) => {
    const categoryId = `cat-${Date.now()}`;
    const category: Category = { ...newCat, id: categoryId };
    setData((prev) => ({
      ...prev,
      categories: [...prev.categories, category]
    }));
  };

  const handleDeleteCategory = (catId: string) => {
    setData((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c.id !== catId)
    }));
  };

  // 4. KREDİ KARTLARI YÖNETİMİ (Cards)
  const handleAddCard = (newCard: Omit<CreditCard, 'id'>) => {
    const cardId = `cc-${Date.now()}`;
    const card: CreditCard = { ...newCard, id: cardId };
    setData((prev) => ({
      ...prev,
      creditCards: [...prev.creditCards, card]
    }));
  };

  const handleDeleteCard = (cardId: string) => {
    setData((prev) => ({
      ...prev,
      creditCards: prev.creditCards.filter((c) => c.id !== cardId)
    }));
  };

  const handleUpdateCardDebt = (cardId: string, newDebt: number) => {
    setData((prev) => ({
      ...prev,
      creditCards: prev.creditCards.map((cc) => (cc.id === cardId ? { ...cc, debt: newDebt } : cc))
    }));
  };

  // 5. KREDİLER YÖNETİMİ (Loans)
  const handleAddLoan = (newLoan: Omit<Loan, 'id'>) => {
    const loanId = `loan-${Date.now()}`;
    const loan: Loan = { ...newLoan, id: loanId };
    setData((prev) => ({
      ...prev,
      loans: [...prev.loans, loan]
    }));
  };

  const handleDeleteLoan = (loanId: string) => {
    setData((prev) => ({
      ...prev,
      loans: prev.loans.filter((l) => l.id !== loanId)
    }));
  };

  // 6. EKSİ BAKİYELER YÖNETİMİ (Overdraft KMH)
  const handleAddOverdraft = (newOd: Omit<OverdraftAccount, 'id'>) => {
    const odId = `od-${Date.now()}`;
    const od: OverdraftAccount = { ...newOd, id: odId };
    setData((prev) => ({
      ...prev,
      overdraftAccounts: [...prev.overdraftAccounts, od]
    }));
  };

  const handleDeleteOverdraft = (odId: string) => {
    setData((prev) => ({
      ...prev,
      overdraftAccounts: prev.overdraftAccounts.filter((od) => od.id !== odId)
    }));
  };

  const handleUpdateOverdraftDebt = (odId: string, newDebt: number) => {
    setData((prev) => ({
      ...prev,
      overdraftAccounts: prev.overdraftAccounts.map((od) => (od.id === odId ? { ...od, debt: newDebt } : od))
    }));
  };

  // 7. BİRİKİM HEDEFLERİ YÖNETİMİ (Savings)
  const handleUpdateSavings = (goal: SavingsGoal) => {
    setData((prev) => ({
      ...prev,
      savingsGoal: goal
    }));
  };

  const handleUpdateTotalCashBudget = (amount: number) => {
    setData((prev) => ({
      ...prev,
      totalCashBudget: amount
    }));
  };

  // Data import/sync & resets
  const handleImportData = (newData: FinanceData) => {
    setData(newData);
    setAnalysisResult(null); // Clear cache on override
  };

  const handleResetData = () => {
    setData(INITIAL_FINANCE_DATA);
    setAnalysisResult(null);
    localStorage.removeItem(AI_CACHE_KEY);
  };

  // List of active tabs configurations
  const tabs = [
    { id: 'dashboard', label: 'Ana Ekran', icon: <Home className="w-5 h-5" /> },
    { id: 'expenses', label: 'Harcama', icon: <ShoppingCart className="w-5 h-5" /> },
    { id: 'cards', label: 'Kartlarım', icon: <CardIcon className="w-5 h-5" /> },
    { id: 'debts', label: 'Borçlar', icon: <DollarSign className="w-5 h-5" /> },
    { id: 'savings', label: 'Birikim', icon: <PiggyBank className="w-5 h-5" /> },
    { id: 'ai', label: 'AI Analiz', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'settings', label: 'Ayarlar', icon: <Settings className="w-5 h-5" /> }
  ];

  return (
    <IOSFrame activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs}>
      {activeTab === 'dashboard' && (
        <DashboardTab 
          data={data} 
          onNavigateToTab={setActiveTab} 
          quickAiTips={quickAiTips} 
        />
      )}
      
      {activeTab === 'expenses' && (
        <ExpensesTab
          data={data}
          onAddExpense={handleAddExpense}
          onDeleteExpense={handleDeleteExpense}
          onAddCategory={handleAddCategory}
          onDeleteCategory={handleDeleteCategory}
        />
      )}

      {activeTab === 'cards' && (
        <CardsTab
          data={data}
          onAddCard={handleAddCard}
          onDeleteCard={handleDeleteCard}
          onUpdateCardDebt={handleUpdateCardDebt}
        />
      )}

      {activeTab === 'debts' && (
        <DebtsTab
          data={data}
          onAddLoan={handleAddLoan}
          onDeleteLoan={handleDeleteLoan}
          onAddOverdraft={handleAddOverdraft}
          onDeleteOverdraft={handleDeleteOverdraft}
          onUpdateOverdraftDebt={handleUpdateOverdraftDebt}
        />
      )}

      {activeTab === 'savings' && (
        <SavingsTab
          data={data}
          onUpdateSavings={handleUpdateSavings}
          onUpdateTotalCashBudget={handleUpdateTotalCashBudget}
        />
      )}

      {activeTab === 'ai' && (
        <AIAssistantTab
          data={data}
          analysisResult={analysisResult}
          onSetAnalysisResult={setAnalysisResult}
        />
      )}

      {activeTab === 'settings' && (
        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-100 tracking-tight">Cihaz Ayarları</h2>
            <p className="text-xs text-slate-400">Verilerinizi kontrol edin ve yedekleyin</p>
          </div>
          
          <DataSync 
            data={data} 
            onImport={handleImportData} 
            onReset={handleResetData} 
          />
        </div>
      )}
    </IOSFrame>
  );
}
