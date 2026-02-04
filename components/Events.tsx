
import React, { useState } from 'react';
import { Calendar, Plus, MapPin, Users, Clock, Search, MoreVertical } from 'lucide-react';
import { MOCK_EVENTS } from '../constants';

export const Events: React.FC = () => {
  const [events] = useState(MOCK_EVENTS);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Agenda & Eventos</h1>
          <p className="text-slate-500">Gestão de cultos, cursos, reuniões e retiros.</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">
          <Plus size={18} />
          Agendar Evento
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {events.map(event => (
            <div key={event.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
              <div className="flex gap-6">
                <div className="flex flex-col items-center justify-center bg-indigo-50 text-indigo-600 px-4 py-2 rounded-2xl min-w-[80px]">
                  <span className="text-[10px] font-black uppercase tracking-widest">{new Date(event.date).toLocaleDateString('pt-BR', { month: 'short' })}</span>
                  <span className="text-2xl font-black">{new Date(event.date).getDate()}</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase mb-2 inline-block">{event.type}</span>
                      <h3 className="text-lg font-bold text-slate-900">{event.title}</h3>
                    </div>
                    <button className="text-slate-300 hover:text-slate-600"><MoreVertical size={20}/></button>
                  </div>
                  <p className="text-slate-500 text-sm mt-2 line-clamp-2">{event.description}</p>
                  
                  <div className="flex flex-wrap gap-4 mt-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                      <Clock size={14} className="text-indigo-400"/>
                      {event.time}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                      <MapPin size={14} className="text-indigo-400"/>
                      {event.location}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                      <Users size={14} className="text-indigo-400"/>
                      {event.attendeesCount} Inscritos
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="font-black text-slate-900 mb-6 flex items-center gap-2">
              <Calendar size={18} className="text-indigo-600"/>
              Minha Agenda
            </h3>
            <div className="grid grid-cols-7 gap-2 mb-4 text-center">
              {['D','S','T','Q','Q','S','S'].map((d, i) => (
                <span key={i} className="text-[10px] font-black text-slate-400">{d}</span>
              ))}
              {Array.from({length: 31}).map((_, i) => (
                <div key={i} className={`p-2 text-xs font-bold rounded-lg cursor-pointer transition-all ${i+1 === 19 ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-slate-50 text-slate-600'}`}>
                  {i+1}
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-slate-100">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Lembretes</h4>
              <div className="space-y-3">
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                  <p className="text-xs font-bold text-amber-900">Check-in Retiro de Jovens</p>
                  <p className="text-[10px] text-amber-700">Amanhã às 08:00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
