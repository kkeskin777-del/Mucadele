import React, { useState } from 'react';
import { FinanceData } from '../types';
import { Sparkles, Calendar, Percent, AlertTriangle, ArrowRight, Lightbulb, CheckCircle2, RotateCcw, Key, Settings } from 'lucide-react';

interface RecommendedPayment {
  type: string; // 'kredi_karti' | 'eksi_bakiye' | 'kredi'
  name: string;
  amount: number;
  reason: string;
}

interface AnalysisResult {
  generalStatus: string;
  warnings: string[];
  recommendedPayments: RecommendedPayment[];
  sustainabilityAnalysis: string;
  savingTips: string[];
}

interface AIAssistantTabProps {
  data: FinanceData;
  analysisResult: AnalysisResult | null;
  onSetAnalysisResult: (result: AnalysisResult) => void;
}

export default function AIAssistantTab({ data, analysisResult, onSetAnalysisResult }: AIAssistantTabProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [apiKeyInput, setApiKeyInput] = useState(() => localStorage.getItem('user_gemini_api_key') || '');
  const [localApiKey, setLocalApiKey] = useState(() => localStorage.getItem('user_gemini_api_key') || '');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [keyStatus, setKeyStatus] = useState('');

  const handleSaveKey = () => {
    const trimmed = apiKeyInput.trim();
    if (trimmed) {
      localStorage.setItem('user_gemini_api_key', trimmed);
      setLocalApiKey(trimmed);
      setKeyStatus('API Anahtarınız telefonunuza/cihazınıza başarıyla kaydedildi!');
      setTimeout(() => setKeyStatus(''), 4000);
      setShowApiKeyInput(false);
    } else {
      localStorage.removeItem('user_gemini_api_key');
      setLocalApiKey('');
      setKeyStatus('API Anahtarı temizlendi.');
      setTimeout(() => setKeyStatus(''), 4000);
    }
  };

  const handleClearKey = () => {
    localStorage.removeItem('user_gemini_api_key');
    setApiKeyInput('');
    setLocalApiKey('');
    setKeyStatus('API Anahtarı silindi. Sunucu moduna geri dönüldü.');
    setTimeout(() => setKeyStatus(''), 4000);
  };

  const handleRunAnalysis = async () => {
    setLoading(true);
    setError('');
    try {
      const prompt = `Sen harika bir kişisel finans uzmanı ve asistanısın. Kullanıcının mali durumunu optimize etmek ve ona en sürdürülebilir, maliyeti en az ödeme planını çıkarmakla görevlisiniz.

Aşağıda kullanıcının güncel finansal verileri yer almaktadır:
- Toplam Nakit Bütçe: ${data.totalCashBudget} TL
- Kredi Kartları (Limit, Güncel Borç, Hesap Kesim Günü, Son Ödeme Günü):
${JSON.stringify(data.creditCards, null, 2)}
- Krediler (Aylık Taksit, Ödeme Günü):
${JSON.stringify(data.loans, null, 2)}
- Eksi Bakiyeler / KMH Hesapları (Limit, Güncel Borç, Aylık Faiz Oranı %):
${JSON.stringify(data.overdraftAccounts, null, 2)}
- Son Harcamalar:
${JSON.stringify(data.expenses, null, 2)}
- Birikim Hedefleri:
${JSON.stringify(data.savingsGoal, null, 2)}

Bu verileri analiz ederek kullanıcının borç faiz yükünü en aza indirecek, nakit akışını ve bütçesini koruyacak, bu ayki ve bu yılki birikim hedeflerine ulaşmasını kolaylaştıracak sürdürülebilir bir ödeme stratejisi oluştur.
Özellikle yüksek faizli eksi bakiyeleri kapatmaya öncelik verilmeli mi, kredi kartı asgari ödemeleri mi yapılmalı yoksa borcun tamamı mı kapatılmalı, nakit bütçesinin ne kadarı ödemelere ayrılmalı gibi soruları cevapla.
Bu hafta hangi karta veya eksi hesaba tam olarak kaç TL ödemesi gerektiğini belirle.

Lütfen yanıtı Türkçe dilinde, samimi, destekleyici, yol gösterici ve profesyonel bir üslupla ver. Yanıtı belirlenen JSON şemasına birebir uygun olarak döndür.`;

      let result;
      const localKey = localStorage.getItem('user_gemini_api_key');
      if (localKey) {
        // Direct browser-side Gemini API call using gemini-2.5-flash
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${localKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt }
                ]
              }
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: 'OBJECT',
                properties: {
                  generalStatus: { type: 'STRING', description: 'Genel finansal durum özeti ve kullanıcıya sıcak bir hitap.' },
                  warnings: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Bütçe aşımı, yüksek faiz, yaklaşan son ödeme günleri vb. uyarılar.' },
                  recommendedPayments: {
                    type: 'ARRAY',
                    items: {
                      type: 'OBJECT',
                      properties: {
                        type: { type: 'STRING', description: "Ödeme türü: 'kredi_karti', 'eksi_bakiye', 'kredi'" },
                        name: { type: 'STRING', description: 'Hesabın veya kartın adı' },
                        amount: { type: 'NUMBER', description: 'Bu hafta yapılması önerilen ödeme miktarı (TL)' },
                        reason: { type: 'STRING', description: 'Neden bu miktarın ödenmesi gerektiğinin kısa açıklaması' }
                      },
                      required: ['type', 'name', 'amount', 'reason']
                    },
                    description: 'Bu hafta yapılması gereken sürdürülebilir ödemelerin listesi.'
                  },
                  sustainabilityAnalysis: { type: 'STRING', description: 'En sürdürülebilir ödeme ve bütçe stratejisini detaylıca anlatan asistan metni. (Türkçe, samimi, paragraflar halinde, zengin ve yapıcı).' },
                  savingTips: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Birikim hedeflerine ulaşmak için 2-3 adet özelleştirilmiş öneri.' }
                },
                required: ['generalStatus', 'warnings', 'recommendedPayments', 'sustainabilityAnalysis', 'savingTips']
              }
            }
          })
        });

        const dataRes = await response.json();
        if (!response.ok) {
          throw new Error(dataRes.error?.message || 'Yapay zeka analizini doğrudan cihazınızdan çalıştırırken hata oluştu. API anahtarınızın doğruluğunu kontrol edin.');
        }

        const text = dataRes.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
          throw new Error('Yapay zekadan boş yanıt alındı.');
        }
        result = JSON.parse(text);
      } else {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Yapay zeka analizi alınırken bir hata oluştu.');
        }
      }

      onSetAnalysisResult(result);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Bilinmeyen bir sunucu hatası oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Yapay Zeka Asistanı</h2>
        <p className="text-xs text-slate-500 font-semibold">Tüm kartlarınızı, kredilerinizi ve eksi hesaplarınızı analiz ederek en az maliyetli ödeme planını oluşturur</p>
      </div>

      {/* Mobile / GitHub Pages Compatibility Panel */}
      <div className="bg-slate-50 border-2 border-slate-100 p-5 rounded-3xl space-y-3.5 relative overflow-hidden">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Cihaz / Mobil Kullanım Ayarları</h3>
          </div>
          <button
            onClick={() => setShowApiKeyInput(!showApiKeyInput)}
            className="text-[10px] text-indigo-600 hover:underline font-bold cursor-pointer"
          >
            {showApiKeyInput ? 'Kapat' : 'Anahtarı Yönet'}
          </button>
        </div>

        {keyStatus && (
          <div className="text-xs bg-emerald-50 border border-emerald-100 text-emerald-700 px-3 py-2 rounded-xl font-semibold">
            {keyStatus}
          </div>
        )}

        {showApiKeyInput ? (
          <div className="space-y-3 animate-slideDown">
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              Bu uygulamayı <strong>GitHub Pages</strong> üzerinden telefonunuzda sunucusuz (statik) olarak kullanırken yapay zekanın çalışması için kendi Gemini API Anahtarınızı girmelisiniz. Bu anahtar <strong>sadece kendi telefonunuzda/tarayıcınızda</strong> saklanır, asla dışarıya gönderilmez.
            </p>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Gemini API Anahtarı (API_KEY)</label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  className="flex-1 bg-white border-2 border-slate-100 focus:border-indigo-500 rounded-xl py-2 px-3.5 text-xs font-bold text-slate-800 focus:outline-none"
                />
                <button
                  onClick={handleSaveKey}
                  className="py-2 px-4 bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs rounded-xl cursor-pointer shadow-md shadow-rose-100 transition-all shrink-0"
                >
                  Kaydet
                </button>
              </div>
            </div>
            {localApiKey && (
              <button
                onClick={handleClearKey}
                className="text-[10px] text-rose-500 hover:underline font-bold cursor-pointer block"
              >
                Cihazdan API Anahtarını Sil / Temizle
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-slate-500">
              <Key className="w-3.5 h-3.5 text-slate-400" />
              <span>Çalışma Modu:</span>
            </div>
            {localApiKey ? (
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-xl text-[10px] font-bold animate-pulse">
                ● Cihaz API Anahtarı Aktif (Mobil/Statik)
              </span>
            ) : (
              <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-xl text-[10px] font-bold">
                ● Sunucu Modu Aktif (AI Studio)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Button to run analysis */}
      <div className="text-center">
        <button
          id="btn-run-ai-analysis"
          onClick={handleRunAnalysis}
          disabled={loading}
          className="w-full py-4 px-6 bg-gradient-to-r from-indigo-500 via-indigo-600 to-rose-500 text-white font-black text-sm uppercase tracking-wider rounded-3xl active:scale-98 disabled:opacity-50 transition-all flex items-center justify-center gap-2.5 shadow-xl shadow-indigo-100 hover:brightness-110 cursor-pointer"
        >
          <Sparkles className={`w-5 h-5 text-white ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Mali Tablo Analiz Ediliyor...' : 'Yapay Zekaya Analiz Ettir'}
        </button>
      </div>

      {/* Loading State Animation */}
      {loading && (
        <div className="p-8 text-center space-y-4 bg-white border-2 border-slate-100 rounded-3xl animate-pulse shadow-sm">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin mx-auto" />
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-800">Asistan Verileri Değerlendiriyor</h4>
            <p className="text-[10px] text-slate-500 leading-relaxed max-w-xs mx-auto font-medium">
              Kredi kartı son ödeme günleri, KMH eksi bakiye faiz oranları (%5.0) ve bütçe dengeniz karşılaştırılarak en sürdürülebilir ödeme planı kurgulanıyor...
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-5 bg-rose-50 border border-rose-100 rounded-3xl space-y-3">
          <div className="flex gap-2 items-start text-rose-600">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-xs">Analiz Başarısız</h4>
              <p className="text-[11px] leading-relaxed mt-1 text-rose-500 font-semibold">{error}</p>
            </div>
          </div>
          <div className="text-xs text-slate-800 leading-relaxed bg-white p-3 rounded-xl border border-rose-100/50">
            <strong>Geliştirici Notu:</strong> AI Studio Secrets panelinden <code className="font-mono text-[10px] text-indigo-600 font-bold">GEMINI_API_KEY</code> değerini girmeniz gerekmektedir. Eğer key girmediyseniz sunucu yapay zeka isteğine yanıt veremeyecektir.
          </div>
        </div>
      )}

      {/* Analysis Results Display */}
      {analysisResult && !loading && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* General Status Card */}
          <div className="bg-white border-2 border-indigo-100 p-5 rounded-3xl space-y-2 relative overflow-hidden shadow-sm">
            <div className="absolute right-[-10px] top-[-10px] opacity-[0.03]">
              <Sparkles className="w-24 h-24 text-indigo-500" />
            </div>
            <h3 className="font-black text-xs text-indigo-600 uppercase tracking-wide">Genel Durum Değerlendirmesi</h3>
            <p className="text-xs text-slate-800 leading-relaxed font-semibold">
              {analysisResult.generalStatus}
            </p>
          </div>

          {/* Warnings Panel */}
          {analysisResult.warnings && analysisResult.warnings.length > 0 && (
            <div className="bg-rose-50 border border-rose-100 p-5 rounded-3xl space-y-3 shadow-sm">
              <div className="flex gap-2 items-center text-rose-600">
                <AlertTriangle className="w-4.5 h-4.5" />
                <h4 className="font-bold text-xs">Kritik Bütçe Uyarıları</h4>
              </div>
              <ul className="space-y-2 text-xs text-slate-700 font-semibold">
                {analysisResult.warnings.map((warning, index) => (
                  <li key={index} className="flex gap-2 items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                    <span className="leading-relaxed">{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* This Week's Priority Payment Matrix */}
          <div className="space-y-3.5">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-800">Bu Haftaki Ödeme Matrixi</h3>
              <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold px-2.5 py-1 rounded-xl uppercase">Öncelikli Sıralama</span>
            </div>

            <div className="space-y-2.5">
              {analysisResult.recommendedPayments.map((payment, index) => {
                const isCc = payment.type === 'kredi_karti';
                const isOverdraft = payment.type === 'eksi_bakiye';

                return (
                  <div 
                    key={index} 
                    className="bg-white border-2 border-slate-100 p-4 rounded-3xl flex flex-col gap-2.5 shadow-sm hover:border-indigo-100 transition-all text-slate-800"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex gap-2.5 items-center">
                        <div className={`p-2 rounded-xl text-xs font-bold ${
                          isOverdraft ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                          isCc ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                          'bg-amber-50 text-amber-600 border border-amber-100'
                        }`}>
                          {isOverdraft ? 'KMH' : isCc ? 'Kart' : 'Kredi'}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-800">{payment.name}</h4>
                          <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wide">ÖNERİLEN ÖDEME</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-black text-sm text-rose-500 block">
                          {payment.amount.toLocaleString('tr-TR')} TL
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-2xl border-2 border-slate-100/50 font-semibold">
                      <strong>Neden:</strong> {payment.reason}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Deep Sustainability Analysis Text */}
          <div className="bg-white border-2 border-slate-100 p-5 rounded-3xl space-y-3 shadow-sm">
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Sürdürülebilirlik Yol Haritası</h3>
            <div className="text-xs text-slate-700 leading-relaxed space-y-3 font-semibold whitespace-pre-line">
              {analysisResult.sustainabilityAnalysis}
            </div>
          </div>

          {/* Savings Tips Card */}
          <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-3xl space-y-3.5 shadow-sm">
            <div className="flex gap-2 items-center text-emerald-600">
              <Lightbulb className="w-4.5 h-4.5" />
              <h4 className="font-bold text-xs">Birikim ve Tasarruf Tavsiyeleri</h4>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-700 font-semibold">
              {analysisResult.savingTips.map((tip, index) => (
                <li key={index} className="flex gap-2 items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                  <span className="leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      )}

    </div>
  );
}
