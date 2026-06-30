import React, { useState } from 'react';
import { FinanceData, CreditCard } from '../types';
import { CreditCard as CardIcon, Plus, Trash2, Calendar, AlertCircle, Sparkles } from 'lucide-react';

interface CardsTabProps {
  data: FinanceData;
  onAddCard: (card: Omit<CreditCard, 'id'>) => void;
  onDeleteCard: (cardId: string) => void;
  onUpdateCardDebt: (cardId: string, newDebt: number) => void;
  onMakePayment: (type: 'credit_card' | 'loan' | 'overdraft', id: string, amount: number) => void;
}

export default function CardsTab({ data, onAddCard, onDeleteCard, onUpdateCardDebt, onMakePayment }: CardsTabProps) {
  const { creditCards } = data;

  // New Card Form State
  const [name, setName] = useState('');
  const [limit, setLimit] = useState('');
  const [debt, setDebt] = useState('');
  const [statementDate, setStatementDate] = useState('15');
  const [dueDate, setDueDate] = useState('25');

  // Toggle for Card adding form
  const [showAddForm, setShowAddForm] = useState(false);

  // Manual Debt Edit State
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editingDebt, setEditingDebt] = useState('');

  // Payment Form State
  const [payingCardId, setPayingCardId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  const handleAddCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !limit.trim() || !debt.trim()) return;

    const parsedLimit = parseFloat(limit);
    const parsedDebt = parseFloat(debt);
    const parsedStatementDate = parseInt(statementDate);
    const parsedDueDate = parseInt(dueDate);

    if (
      isNaN(parsedLimit) || parsedLimit <= 0 ||
      isNaN(parsedDebt) || parsedDebt < 0 ||
      isNaN(parsedStatementDate) || parsedStatementDate < 1 || parsedStatementDate > 31 ||
      isNaN(parsedDueDate) || parsedDueDate < 1 || parsedDueDate > 31
    ) {
      alert('Lütfen geçerli değerler girin (Günler 1-31 arasında olmalıdır).');
      return;
    }

    onAddCard({
      name: name.trim(),
      limit: parsedLimit,
      debt: parsedDebt,
      statementDate: parsedStatementDate,
      dueDate: parsedDueDate
    });

    // Reset fields
    setName('');
    setLimit('');
    setDebt('');
    setStatementDate('15');
    setDueDate('25');
    setShowAddForm(false);
  };

  const handleStartEditDebt = (card: CreditCard) => {
    setEditingCardId(card.id);
    setEditingDebt(card.debt.toString());
    setPayingCardId(null);
  };

  const handleSaveDebtEdit = (cardId: string) => {
    const parsed = parseFloat(editingDebt);
    if (isNaN(parsed) || parsed < 0) return;
    onUpdateCardDebt(cardId, parsed);
    setEditingCardId(null);
  };

  const handleConfirmPayment = (cardId: string) => {
    const parsed = parseFloat(paymentAmount);
    if (isNaN(parsed) || parsed <= 0) {
      alert('Lütfen geçerli bir ödeme miktarı girin.');
      return;
    }
    const card = creditCards.find(c => c.id === cardId);
    if (!card) return;
    
    if (parsed > data.totalCashBudget) {
      if (!confirm(`Ödeme miktarı (${parsed.toLocaleString('tr-TR')} TL) nakit bütçenizi (${data.totalCashBudget.toLocaleString('tr-TR')} TL) aşmaktadır. Yine de devam etmek istiyor musunuz?`)) {
        return;
      }
    }

    onMakePayment('credit_card', cardId, parsed);
    setPayingCardId(null);
    setPaymentAmount('');
  };

  return (
    <div className="p-6 space-y-6">
      
      {/* View Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Kredi Kartlarım</h2>
          <p className="text-xs text-slate-500 font-semibold">Kart borç, limit ve ödeme planı yönetimi</p>
        </div>
        <button
          id="btn-toggle-add-card"
          onClick={() => setShowAddForm(!showAddForm)}
          className="p-2.5 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-bold rounded-2xl flex items-center gap-1 cursor-pointer transition-all shadow-md shadow-rose-100"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Add New Card Form */}
      {showAddForm && (
        <form id="form-add-card" onSubmit={handleAddCardSubmit} className="bg-white border-2 border-indigo-100 p-5 rounded-3xl space-y-4 animate-slideDown shadow-sm">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Kredi Kartı Ekle</h3>
          
          <div className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Kart İsmi</label>
              <input
                id="inp-card-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Örn: Yapı Kredi World, Garanti Bonus"
                required
                className="w-full bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 rounded-xl py-2.5 px-4 text-xs font-bold text-slate-800 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Limit (TL)</label>
                <input
                  id="inp-card-limit"
                  type="number"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  placeholder="50000"
                  required
                  className="w-full bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 rounded-xl py-2.5 px-4 text-xs font-bold text-slate-800 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Güncel Borç (TL)</label>
                <input
                  id="inp-card-debt"
                  type="number"
                  value={debt}
                  onChange={(e) => setDebt(e.target.value)}
                  placeholder="15000"
                  required
                  className="w-full bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 rounded-xl py-2.5 px-4 text-xs font-bold text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Hesap Kesim Günü</label>
                <input
                  id="inp-card-statement"
                  type="number"
                  min="1"
                  max="31"
                  value={statementDate}
                  onChange={(e) => setStatementDate(e.target.value)}
                  placeholder="15"
                  required
                  className="w-full bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 rounded-xl py-2.5 px-4 text-xs font-bold text-slate-800 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Son Ödeme Günü</label>
                <input
                  id="inp-card-due"
                  type="number"
                  min="1"
                  max="31"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  placeholder="25"
                  required
                  className="w-full bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 rounded-xl py-2.5 px-4 text-xs font-bold text-slate-800 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              id="btn-add-card-submit"
              type="submit"
              className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer text-center"
            >
              Kartı Kaydet
            </button>
            <button
              id="btn-add-card-cancel"
              type="button"
              onClick={() => setShowAddForm(false)}
              className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold text-xs rounded-xl transition-all cursor-pointer"
            >
              İptal
            </button>
          </div>
        </form>
      )}

      {/* Credit Cards List */}
      <div className="space-y-4">
        {creditCards.length === 0 ? (
          <div className="text-center p-12 bg-white border-2 border-dashed border-slate-200 rounded-3xl text-xs text-slate-400 shadow-sm">
            Henüz eklenmiş kredi kartınız yok. Sağ üstteki artı (+) butonundan ekleyin.
          </div>
        ) : (
          creditCards.map((cc) => {
            const utilization = cc.limit > 0 ? Math.min(100, Math.round((cc.debt / cc.limit) * 100)) : 0;
            const remainingLimit = Math.max(0, cc.limit - cc.debt);
            const isCritical = utilization > 75;

            return (
              <div 
                key={cc.id} 
                className="bg-white rounded-3xl border-2 border-slate-100 p-5 space-y-4 relative overflow-hidden shadow-sm hover:border-indigo-100 transition-all text-slate-800"
              >
                {/* Background decorative card icon */}
                <div className="absolute right-[-15px] top-[-10px] opacity-5 pointer-events-none select-none">
                  <CardIcon className="w-28 h-28 text-slate-400" />
                </div>

                {/* Card Title & Info */}
                <div className="flex justify-between items-start relative z-10">
                  <div className="flex gap-3 items-center">
                    <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
                      <CardIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-800">{cc.name}</h4>
                      <span className="text-[10px] text-slate-400 font-semibold">Limit: {cc.limit.toLocaleString('tr-TR')} TL</span>
                    </div>
                  </div>

                  <button
                    id={`btn-del-card-${cc.id}`}
                    onClick={() => onDeleteCard(cc.id)}
                    className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                    title="Kartı sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Balance display / Editable */}
                <div className="flex justify-between items-end bg-slate-50 p-4 rounded-2xl border-2 border-slate-100/50">
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase font-bold">GÜNCEL BORÇ BAKİYESİ</span>
                    {editingCardId === cc.id ? (
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          id={`inp-edit-debt-${cc.id}`}
                          type="number"
                          value={editingDebt}
                          onChange={(e) => setEditingDebt(e.target.value)}
                          className="w-24 bg-white border-2 border-slate-200 text-xs font-bold text-slate-800 py-1 px-2 rounded-lg focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          id={`btn-save-debt-${cc.id}`}
                          onClick={() => handleSaveDebtEdit(cc.id)}
                          className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer"
                        >
                          Kaydet
                        </button>
                      </div>
                    ) : payingCardId === cc.id ? (
                      <div className="flex items-center gap-1.5 mt-1.5 animate-slideDown">
                        <input
                          id={`inp-pay-amount-${cc.id}`}
                          type="number"
                          placeholder="Miktar"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          className="w-20 bg-white border-2 border-rose-200 text-xs font-bold text-slate-800 py-1 px-1.5 rounded-lg focus:outline-none focus:border-rose-500"
                        />
                        <button
                          id={`btn-confirm-pay-${cc.id}`}
                          onClick={() => handleConfirmPayment(cc.id)}
                          className="bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-bold py-1 px-2.5 rounded-lg cursor-pointer transition-all active:scale-95"
                        >
                          Öde
                        </button>
                        <button
                          onClick={() => setPayingCardId(null)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-500 text-[10px] font-bold py-1 px-2 rounded-lg cursor-pointer"
                        >
                          İptal
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1.5 mt-1">
                        <span className="text-xl font-black text-rose-500">
                          {cc.debt.toLocaleString('tr-TR')} TL
                        </span>
                        <div className="flex gap-2">
                          <button
                            id={`btn-edit-debt-${cc.id}`}
                            onClick={() => handleStartEditDebt(cc)}
                            className="text-[9px] text-indigo-600 font-bold hover:text-indigo-700 hover:underline cursor-pointer"
                          >
                            Borcu Düzelt
                          </button>
                          {cc.debt > 0 && (
                            <button
                              id={`btn-pay-debt-trigger-${cc.id}`}
                              onClick={() => {
                                setPayingCardId(cc.id);
                                setEditingCardId(null);
                                setPaymentAmount('');
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
                    <span className="text-[9px] text-slate-400 block uppercase font-bold">KALAN KART LİMİTİ</span>
                    <span className="text-xs font-black text-slate-800 block mt-1">
                      {remainingLimit.toLocaleString('tr-TR')} TL
                    </span>
                  </div>
                </div>

                {/* Progress bar of limit utilization */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-400 font-bold">Kullanım Oranı</span>
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

                {/* Due dates */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t-2 border-slate-50 text-[10px] text-slate-500">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Hesap Kesim Günü: <strong className="text-slate-800 font-black">{cc.statementDate}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Son Ödeme Günü: <strong className="text-slate-800 font-black">{cc.dueDate}</strong></span>
                  </div>
                </div>

                {isCritical && (
                  <div className="flex items-center gap-1.5 text-[10px] text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-100 font-semibold">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                    <span>Limit kullanımınız yüksek. Borç azaltmak bütçe sağlığınız için sürdürülebilirdir.</span>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
