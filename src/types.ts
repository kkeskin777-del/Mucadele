export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon name, e.g. "ShoppingBag", "Utensils", "Car"
  color: string; // Tailwind color class, e.g. "bg-blue-500", "bg-emerald-500"
}

export interface CreditCard {
  id: string;
  name: string;
  limit: number;
  debt: number; // Borç
  statementDate: number; // Hesap kesim günü (1-31)
  dueDate: number; // Son ödeme günü (1-31)
}

export interface Loan {
  id: string;
  name: string;
  installment: number; // Aylık taksit miktarı
  dueDate: number; // Ödeme günü (1-31)
  totalAmount?: number; // Toplam kredi tutarı (opsiyonel)
  remainingInstallments?: number; // Kalan taksit sayısı (opsiyonel)
}

export interface OverdraftAccount {
  id: string;
  bankName: string;
  limit: number; // Eksi bakiye limiti
  debt: number; // Kullanılan eksi bakiye miktarı
  interestRate: number; // Aylık faiz oranı (%)
}

export type PaymentMethod = 'nakit' | 'kredi_karti';

export interface Expense {
  id: string;
  description: string;
  amount: number;
  categoryId: string;
  paymentMethod: PaymentMethod;
  creditCardId?: string; // If paymentMethod === 'kredi_karti'
  date: string; // ISO String or YYYY-MM-DD
}

export interface SavingsGoal {
  monthlyTarget: number;
  monthlyCurrent: number;
  yearlyTarget: number;
  yearlyCurrent: number;
}

export interface FinanceData {
  totalCashBudget: number; // Toplam nakit bütçem
  categories: Category[];
  creditCards: CreditCard[];
  loans: Loan[];
  overdraftAccounts: OverdraftAccount[];
  expenses: Expense[];
  savingsGoal: SavingsGoal;
}

// Varsayılan / Başlangıç Verileri (Default Mock Data to start with)
export const INITIAL_FINANCE_DATA: FinanceData = {
  totalCashBudget: 25000,
  categories: [
    { id: 'cat-1', name: 'Gıda / Market', icon: 'Utensils', color: 'bg-emerald-500' },
    { id: 'cat-2', name: 'Ulaşım', icon: 'Car', color: 'bg-blue-500' },
    { id: 'cat-3', name: 'Fatura / Aidat', icon: 'Receipt', color: 'bg-amber-500' },
    { id: 'cat-4', name: 'Eğlence / Sosyal', icon: 'Smile', color: 'bg-purple-500' },
    { id: 'cat-5', name: 'Alışveriş', icon: 'ShoppingBag', color: 'bg-pink-500' },
    { id: 'cat-6', name: 'Diğer', icon: 'MoreHorizontal', color: 'bg-gray-500' }
  ],
  creditCards: [
    { id: 'cc-1', name: 'Bonus Card', limit: 80000, debt: 15400, statementDate: 15, dueDate: 25 },
    { id: 'cc-2', name: 'Axess Card', limit: 120000, debt: 24350, statementDate: 5, dueDate: 15 }
  ],
  loans: [
    { id: 'loan-1', name: 'İhtiyaç Kredisi', installment: 4500, dueDate: 10, totalAmount: 50000, remainingInstallments: 12 },
    { id: 'loan-2', name: 'Taşıt Kredisi', installment: 8200, dueDate: 20, totalAmount: 200000, remainingInstallments: 24 }
  ],
  overdraftAccounts: [
    { id: 'od-1', bankName: 'Garanti KMH', limit: 15000, debt: 4500, interestRate: 5.0 },
    { id: 'od-2', bankName: 'Akbank Artı Para', limit: 20000, debt: 0, interestRate: 5.0 }
  ],
  expenses: [
    { id: 'exp-1', description: 'Haftalık Market Alışverişi', amount: 1850, categoryId: 'cat-1', paymentMethod: 'kredi_karti', creditCardId: 'cc-1', date: '2026-06-28' },
    { id: 'exp-2', description: 'Benzin Alımı', amount: 1200, categoryId: 'cat-2', paymentMethod: 'kredi_karti', creditCardId: 'cc-2', date: '2026-06-29' },
    { id: 'exp-3', description: 'Kafe ve Kahve', amount: 150, categoryId: 'cat-4', paymentMethod: 'nakit', date: '2026-06-30' }
  ],
  savingsGoal: {
    monthlyTarget: 15000,
    monthlyCurrent: 8500,
    yearlyTarget: 600000,
    yearlyCurrent: 145000
  }
};
