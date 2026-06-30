import React, { useState } from 'react';
import { FinanceData, Expense, Category, PaymentMethod } from '../types';
import * as Icons from 'lucide-react';
import { Plus, Trash2, Calendar, CreditCard, Wallet, PlusCircle } from 'lucide-react';

interface ExpensesTabProps {
  data: FinanceData;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onDeleteExpense: (expenseId: string) => void;
  onAddCategory: (category: Omit<Category, 'id'>) => void;
  onDeleteCategory: (categoryId: string) => void;
}

const AVAILABLE_ICONS = [
  'Utensils', 'Car', 'Receipt', 'Smile', 'ShoppingBag', 'Home', 
  'HeartPulse', 'Gamepad2', 'BookOpen', 'Coffee', 'Baby', 'Tv',
  'Plane', 'Gift', 'Dumbbell', 'Scissors', 'Shield', 'Sparkles'
];

const AVAILABLE_COLORS = [
  'bg-emerald-500', 'bg-blue-500', 'bg-amber-500', 'bg-purple-500', 
  'bg-pink-500', 'bg-red-500', 'bg-indigo-500', 'bg-orange-500', 'bg-teal-500'
];

export default function ExpensesTab({ data, onAddExpense, onDeleteExpense, onAddCategory, onDeleteCategory }: ExpensesTabProps) {
  const { categories, creditCards, expenses } = data;

  // New Expense Form State
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('nakit');
  const [creditCardId, setCreditCardId] = useState(creditCards[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // New Category Form State
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState(AVAILABLE_ICONS[0]);
  const [newCatColor, setNewCatColor] = useState(AVAILABLE_COLORS[0]);

  // Sub-tab toggles: "Harcama Ekle" vs "Kategorileri Yönet"
  const [subTab, setSubTab] = useState<'add_expense' | 'categories'>('add_expense');

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount.trim()) return;

    const expenseAmount = parseFloat(amount);
    if (isNaN(expenseAmount) || expenseAmount <= 0) return;

    onAddExpense({
      description: description.trim(),
      amount: expenseAmount,
      categoryId,
      paymentMethod,
      creditCardId: paymentMethod === 'kredi_karti' ? creditCardId : undefined,
      date
    });

    // Reset Form
    setDescription('');
    setAmount('');
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    onAddCategory({
      name: newCatName.trim(),
      icon: newCatIcon,
      color: newCatColor
    });

    setNewCatName('');
  };

  // Icon dynamic rendering helper
  const renderCategoryIcon = (iconName: string, colorClass: string) => {
    // @ts-ignore
    const IconComponent = Icons[iconName] || Icons.HelpCircle;
    return (
      <div className={`p-2.5 rounded-xl text-white ${colorClass}`}>
        <IconComponent className="w-4 h-4" />
      </div>
    );
  };
  return (
    <div className="p-6 space-y-6">
      
      {/* View Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Harcamalar ve Kategoriler</h2>
        <p className="text-xs text-slate-500 font-semibold">Harcamalarınızı girin ve bütçe kategorilerinizi özelleştirin</p>
      </div>

      {/* Sub-Tabs Selector */}
      <div className="flex bg-indigo-50/80 p-1 rounded-2xl border border-indigo-100">
        <button
          id="subtab-expense-btn"
          onClick={() => setSubTab('add_expense')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            subTab === 'add_expense' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Harcama Girişi
        </button>
        <button
          id="subtab-category-btn"
          onClick={() => setSubTab('categories')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            subTab === 'categories' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Kategori Yönetimi
        </button>
      </div>

      {subTab === 'add_expense' ? (
        <div className="space-y-6">
          
          {/* New Expense Form */}
          <form id="form-add-expense" onSubmit={handleAddExpenseSubmit} className="bg-white border-2 border-indigo-100 p-5 rounded-3xl space-y-4 shadow-sm">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Yeni Harcama Ekle</h3>
            
            <div className="space-y-3.5">
              
              {/* Tutar */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Tutar (TL)</label>
                <input
                  id="inp-exp-amount"
                  type="number"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                  className="w-full bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 rounded-xl py-3 px-4 text-base font-black text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500/10"
                />
              </div>

              {/* Açıklama */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Açıklama</label>
                <input
                  id="inp-exp-desc"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Örn: Market, Kahve, Otobüs"
                  required
                  className="w-full bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 rounded-xl py-3 px-4 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500/10"
                />
              </div>

              {/* Kategori Seçimi */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Kategori</label>
                {categories.length === 0 ? (
                  <div className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border-2 border-rose-100 font-bold">
                    Önce "Kategori Yönetimi" sekmesinden kategori açmalısınız!
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {categories.map((cat) => {
                      const isSelected = categoryId === cat.id;
                      // @ts-ignore
                      const IconComp = Icons[cat.icon] || Icons.HelpCircle;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          id={`cat-select-${cat.id}`}
                          onClick={() => setCategoryId(cat.id)}
                          className={`p-2.5 rounded-xl border-2 text-left flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-indigo-50 border-indigo-500 text-indigo-600 font-bold' 
                              : 'bg-slate-50 border-slate-100 hover:border-slate-200 text-slate-500'
                          }`}
                        >
                          <IconComp className="w-4 h-4" />
                          <span className="text-[10px] truncate w-full text-center font-bold">{cat.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Ödeme Yöntemi */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Ödeme Yöntemi</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    id="method-cash"
                    onClick={() => setPaymentMethod('nakit')}
                    className={`p-3.5 rounded-xl border-2 flex items-center justify-center gap-2 font-bold text-xs transition-all cursor-pointer ${
                      paymentMethod === 'nakit'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-600'
                        : 'bg-slate-50 border-slate-100 hover:border-slate-200 text-slate-500'
                    }`}
                  >
                    <Wallet className="w-4 h-4" />
                    Nakit / Hesap
                  </button>
                  <button
                    type="button"
                    id="method-cc"
                    onClick={() => {
                      setPaymentMethod('kredi_karti');
                      if (creditCards.length > 0 && !creditCardId) {
                        setCreditCardId(creditCards[0].id);
                      }
                    }}
                    className={`p-3.5 rounded-xl border-2 flex items-center justify-center gap-2 font-bold text-xs transition-all cursor-pointer ${
                      paymentMethod === 'kredi_karti'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-600'
                        : 'bg-slate-50 border-slate-100 hover:border-slate-200 text-slate-500'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    Kredi Kartı
                  </button>
                </div>
              </div>

              {/* Kredi Kartı Seçimi (Sadece Kredi Kartı ise) */}
              {paymentMethod === 'kredi_karti' && (
                <div className="space-y-1 animate-slideDown">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Hangi Kredi Kartı?</label>
                  {creditCards.length === 0 ? (
                    <div className="text-xs text-rose-600 bg-rose-50 p-3 rounded-xl border-2 border-rose-100 font-semibold">
                      Önce Kredi Kartları sekmesinden bir kart eklemelisiniz!
                    </div>
                  ) : (
                    <select
                      id="sel-exp-cc"
                      value={creditCardId}
                      onChange={(e) => setCreditCardId(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 rounded-xl py-3 px-4 text-xs font-bold text-slate-800 focus:outline-none"
                    >
                      {creditCards.map((cc) => (
                        <option key={cc.id} value={cc.id}>
                          {cc.name} (Borç: {cc.debt.toLocaleString('tr-TR')} TL)
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* Tarih */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Tarih</label>
                <div className="relative">
                  <input
                    id="inp-exp-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 rounded-xl py-3 px-4 text-xs font-bold text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

            </div>

            <button
              id="btn-add-expense-submit"
              type="submit"
              disabled={categories.length === 0 || (paymentMethod === 'kredi_karti' && creditCards.length === 0)}
              className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed mt-4 shadow-md shadow-rose-100"
            >
              Harcamayı Kaydet
            </button>
          </form>

          {/* Expenses History List */}
          <div className="space-y-3">
            <h3 className="font-black text-xs text-slate-400 uppercase tracking-wider">Harcama Defteri</h3>
            
            {expenses.length === 0 ? (
              <div className="text-center p-8 bg-white border-2 border-dashed border-slate-200 rounded-2xl text-xs text-slate-400 shadow-sm">
                Henüz kayıtlı harcama yok. Yukarıdaki formdan ekleyebilirsiniz.
              </div>
            ) : (
              <div className="space-y-2.5">
                {[...expenses]
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((exp) => {
                    const category = categories.find(c => c.id === exp.categoryId) || {
                      name: 'Diğer',
                      icon: 'MoreHorizontal',
                      color: 'bg-gray-500'
                    };
                    const isCc = exp.paymentMethod === 'kredi_karti';
                    const ccName = isCc ? (creditCards.find(c => c.id === exp.creditCardId)?.name || 'Silinmiş Kart') : '';

                    return (
                      <div 
                        key={exp.id} 
                        className="flex items-center justify-between p-4 bg-white rounded-2xl border-2 border-slate-100 shadow-sm hover:border-indigo-100 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          {renderCategoryIcon(category.icon, category.color)}
                          <div>
                            <span className="font-bold text-xs text-slate-800 block">{exp.description}</span>
                            <span className="text-[10px] text-slate-400 font-semibold">
                              {category.name} • {isCc ? `${ccName}` : 'Nakit'} • {exp.date}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-black text-xs text-rose-500">
                            -{exp.amount.toLocaleString('tr-TR')} TL
                          </span>
                          <button
                            id={`btn-del-exp-${exp.id}`}
                            onClick={() => onDeleteExpense(exp.id)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 rounded-lg text-rose-500 active:scale-90 transition-all cursor-pointer"
                            title="Harcamayı sil (Bakiyeyi geri yükler)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

        </div>
      ) : (
        <div className="space-y-6">
          
          {/* New Category Creator Form */}
          <form id="form-add-cat" onSubmit={handleAddCategorySubmit} className="bg-white border-2 border-indigo-100 p-5 rounded-3xl space-y-4 shadow-sm">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Kategori Açma Sekmesi</h3>
            
            <div className="space-y-3.5">
              
              {/* Category Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Kategori Adı</label>
                <input
                  id="inp-cat-name"
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Örn: Eğlence, Sağlık, Kitap"
                  required
                  className="w-full bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 rounded-xl py-3 px-4 text-xs font-bold text-slate-800 focus:outline-none"
                />
              </div>

              {/* Icon Selector Grid */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">İkon Seçin</label>
                <div className="grid grid-cols-6 gap-2 bg-slate-50 p-2.5 rounded-xl border-2 border-slate-100 max-h-40 overflow-y-auto scrollbar-none">
                  {AVAILABLE_ICONS.map((iconName) => {
                    // @ts-ignore
                    const IconComp = Icons[iconName] || Icons.HelpCircle;
                    const isSelected = newCatIcon === iconName;
                    return (
                      <button
                        key={iconName}
                        type="button"
                        id={`icon-select-${iconName}`}
                        onClick={() => setNewCatIcon(iconName)}
                        className={`p-2.5 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                          isSelected ? 'bg-indigo-100 text-indigo-600 border border-indigo-500/50' : 'text-slate-400 hover:text-slate-700'
                        }`}
                      >
                        <IconComp className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Selector Grid */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Renk Teması</label>
                <div className="flex flex-wrap gap-2.5 bg-slate-50 p-3 rounded-xl border-2 border-slate-100">
                  {AVAILABLE_COLORS.map((color) => {
                    const isSelected = newCatColor === color;
                    return (
                      <button
                        key={color}
                        type="button"
                        id={`color-select-${color}`}
                        onClick={() => setNewCatColor(color)}
                        className={`w-6 h-6 rounded-full cursor-pointer transition-all ${color} ${
                          isSelected ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-white scale-110' : 'hover:scale-105'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>

            </div>

            <button
              id="btn-add-cat-submit"
              type="submit"
              className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl transition-all cursor-pointer shadow-md shadow-rose-100"
            >
              Yeni Kategoriyi Kaydet
            </button>
          </form>

          {/* Active Categories List */}
          <div className="space-y-3">
            <h3 className="font-black text-xs text-slate-400 uppercase tracking-wider">Aktif Harcama Kategorilerim</h3>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((cat) => (
                <div 
                  key={cat.id} 
                  className="flex items-center justify-between p-3 bg-white rounded-2xl border-2 border-slate-100 shadow-sm"
                >
                  <div className="flex items-center gap-2.5">
                    {renderCategoryIcon(cat.icon, cat.color)}
                    <span className="text-xs font-bold text-slate-800">{cat.name}</span>
                  </div>
                  {categories.length > 1 && (
                    <button
                      id={`btn-del-cat-${cat.id}`}
                      onClick={() => onDeleteCategory(cat.id)}
                      className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                      title="Kategoriyi sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
