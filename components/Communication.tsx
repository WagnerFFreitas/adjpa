
import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Sparkles, User, Search, History, Clock, PencilLine, Eraser } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { Member, Payroll } from '../types';

interface CommunicationProps {
  members?: Member[];
  employees?: Payroll[];
}

export const Communication: React.FC<CommunicationProps> = ({ members = [], employees = [] }) => {
  const [activeMode, setActiveMode] = useState<'IA' | 'MANUAL'>('IA');
  const [topic, setTopic] = useState('');
  const [finalMessage, setFinalMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const generateMessage = async () => {
    if (!topic) return;
    setLoading(true);
    const result = await geminiService.generatePastoralResponse(topic);
    setFinalMessage(result || '');
    setLoading(false);
  };

  const handleSendEmail = () => {
    if (!finalMessage) return;

    // Coleta todos os emails válidos e únicos
    const memberEmails = members.map(m => m.email).filter(e => e && e.includes('@'));
    const allRecipients = Array.from(new Set([...memberEmails]));

    if (allRecipients.length === 0) {
      alert("Nenhum destinatário com e-mail válido foi encontrado no sistema.");
      return;
    }

    const subject = encodeURIComponent("Mensagem Pastoral - ADJPA");
    const body = encodeURIComponent(finalMessage);
    const bcc = allRecipients.join(',');
    
    window.location.href = `mailto:?bcc=${bcc}&subject=${subject}&body=${body}`;
  };

  const handleSendWhatsApp = () => {
    if (!finalMessage) return;

    const totalContacts = members.length + employees.length;
    if (totalContacts === 0) {
      alert("Nenhum contato encontrado para envio via WhatsApp.");
      return;
    }

    const text = encodeURIComponent(finalMessage);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const clearMessage = () => {
    if (confirm("Deseja limpar todo o conteúdo da mensagem atual?")) {
      setFinalMessage('');
      setTopic('');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Comunicação Inteligente</h1>
          <p className="text-slate-500">Envio em massa de mensagens pastorais, avisos e devocionais.</p>
        </div>
        <div className="bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 flex items-center gap-3">
          <div className="flex -space-x-2">
             <div className="w-6 h-6 rounded-full bg-indigo-200 border-2 border-white flex items-center justify-center text-[8px] font-black">M</div>
             <div className="w-6 h-6 rounded-full bg-emerald-200 border-2 border-white flex items-center justify-center text-[8px] font-black">F</div>
          </div>
          <div>
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Base Ativa</p>
            <p className="text-sm font-bold text-indigo-900">{members.length + employees.length} Integrados</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-2 rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            {/* Seletor de Modo */}
            <div className="flex p-2 gap-2 bg-slate-50 rounded-[2.2rem] mb-6">
               <button 
                onClick={() => setActiveMode('IA')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.8rem] text-xs font-black uppercase tracking-widest transition-all ${activeMode === 'IA' ? 'bg-white text-indigo-600 shadow-sm border border-indigo-100' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 <Sparkles size={14} /> Escritor IA
               </button>
               <button 
                onClick={() => setActiveMode('MANUAL')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.8rem] text-xs font-black uppercase tracking-widest transition-all ${activeMode === 'MANUAL' ? 'bg-white text-indigo-600 shadow-sm border border-indigo-100' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 <PencilLine size={14} /> Texto Livre
               </button>
            </div>

            <div className="p-6 space-y-4">
              {activeMode === 'IA' ? (
                <div className="animate-in slide-in-from-left-4 duration-300">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Tema ou Assunto para IA</label>
                  <textarea 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl h-32 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-sm"
                    placeholder="Ex: Palavra de ânimo para quem está passando por dificuldades financeiras..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                  <button 
                    onClick={generateMessage}
                    disabled={loading || !topic}
                    className="w-full bg-slate-900 text-white py-4 mt-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl disabled:opacity-50"
                  >
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Sparkles size={18}/>}
                    Gerar Mensagem via IA
                  </button>
                </div>
              ) : (
                <div className="animate-in slide-in-from-right-4 duration-300">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Escrita Manual Direta</label>
                    <button onClick={clearMessage} className="text-[9px] font-black text-rose-500 uppercase hover:underline flex items-center gap-1">
                      <Eraser size={12}/> Limpar Editor
                    </button>
                  </div>
                  <textarea 
                    className="w-full p-6 bg-slate-50 border border-slate-200 rounded-3xl h-[280px] focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-sm leading-relaxed"
                    placeholder="Escreva sua mensagem personalizada aqui..."
                    value={finalMessage}
                    onChange={(e) => setFinalMessage(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2 text-sm">
              <History size={16} className="text-slate-400"/>
              Histórico de Envios
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Aviso de Manutenção', type: 'Email', status: 'Enviado', date: 'Hoje' },
                { label: 'Devocional Matinal', type: 'WhatsApp', status: 'Agendado', date: 'Ontem' }
              ].map((h, i) => (
                <div key={i} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition-all cursor-pointer border border-transparent hover:border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><MessageSquare size={14}/></div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">{h.label}</p>
                      <p className="text-[9px] text-slate-400 font-medium">{h.date}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-full">{h.type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-indigo-900 text-white p-8 rounded-[3.5rem] shadow-2xl relative overflow-hidden flex flex-col min-h-[500px]">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <MessageSquare size={200} />
          </div>
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
               <h3 className="font-black text-xl flex items-center gap-2 uppercase tracking-tighter">
                <PencilLine size={20} className="text-indigo-300" />
                Editor de Mensagem
               </h3>
               {finalMessage && (
                  <div className="bg-white/10 px-3 py-1 rounded-lg backdrop-blur-sm border border-white/10">
                    <p className="text-[9px] font-bold text-indigo-200 uppercase">{finalMessage.length} caracteres</p>
                  </div>
               )}
            </div>

            <div className="flex-1 relative">
              <textarea 
                className="w-full h-full bg-white/5 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/10 text-indigo-100 leading-relaxed italic text-sm outline-none focus:bg-white/10 transition-all scrollbar-hide resize-none"
                placeholder="Aguardando geração da IA ou digitação manual..."
                value={finalMessage}
                onChange={(e) => setFinalMessage(e.target.value)}
              />
              {!finalMessage && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-indigo-300/50 space-y-4">
                   <div className="p-6 bg-white/5 rounded-full"><Sparkles size={48} className="opacity-20"/></div>
                   <p className="text-sm font-medium">Sua mensagem será exibida aqui para revisão.</p>
                </div>
              )}
            </div>

            {finalMessage && (
              <div className="mt-8 grid grid-cols-2 gap-4 animate-in slide-in-from-bottom-4">
                <button 
                  onClick={handleSendEmail}
                  className="bg-white text-indigo-900 py-4 rounded-2xl font-bold hover:bg-indigo-50 transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95"
                  title={`Enviar para ${members.length} membros via BCC`}
                >
                  <Send size={18}/>
                  <span className="uppercase text-xs tracking-widest font-black">Enviar via Email</span>
                </button>
                <button 
                  onClick={handleSendWhatsApp}
                  className="bg-emerald-500 text-white py-4 rounded-2xl font-bold hover:bg-emerald-400 transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95"
                  title="Compartilhar com contatos da Igreja no WhatsApp"
                >
                  <MessageSquare size={18}/>
                  <span className="uppercase text-xs tracking-widest font-black">Via WhatsApp</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
