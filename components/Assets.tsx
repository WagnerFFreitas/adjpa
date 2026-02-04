
import React, { useState, useMemo } from 'react';
import { 
  Box, Plus, Search, Filter, TrendingDown, 
  MapPin, Calendar, DollarSign, Edit2, Trash2,
  Tag, HardDrive, Building2, Music, Truck, Info
} from 'lucide-react';
import { Asset } from '../types';

interface AssetsProps {
  assets: Asset[];
  setAssets: (assets: Asset[]) => void;
  currentUnitId: string;
}

export const Assets: React.FC<AssetsProps> = ({ assets, setAssets, currentUnitId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');

  const filteredAssets = assets.filter(a => 
    a.unitId === currentUnitId &&
    (a.description.toLowerCase().includes(searchTerm.toLowerCase()) || a.assetNumber.includes(searchTerm)) &&
    (filterCategory === 'ALL' || a.category === filterCategory)
  );

  const totalValue = filteredAssets.reduce((acc, curr) => acc + curr.currentValue, 0);

  const categories = [
    { id: 'IMÓVEL', label: 'Imóveis', icon: <Building2 size={16}/> },
    { id: 'VEÍCULO', label: 'Veículos', icon: <Truck size={16}/> },
    { id: 'SOM_LUZ', label: 'Som e Luz', icon: <Music size={16}/> },
    { id: 'INSTRUMENTO', label: 'Instrumentos', icon: <Music size={16}/> },
    { id: 'MÓVEL', label: 'Móveis', icon: <Box size={16}/> },
    { id: 'INFORMÁTICA', label: 'Informática', icon: <HardDrive size={16}/> },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 leading-tight">Gestão de Patrimônio</h1>
          <p className="text-slate-500 font-medium text-sm">Controle de ativos, tombamento e depreciação.</p>
        </div>
        <button className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2 uppercase text-xs">
          <Plus size={18} /> Novo Item de Patrimônio
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl"><Box/></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total de Itens</p>
            <p className="text-2xl font-black text-slate-900">{filteredAssets.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><DollarSign/></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor de Inventário</p>
            <p className="text-2xl font-black text-slate-900">R$ {totalValue.toLocaleString('pt-BR')}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl"><TrendingDown/></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Depreciação Média</p>
            <p className="text-2xl font-black text-slate-900">4.2% a.a</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por descrição ou nº de patrimônio..." 
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-black text-[10px] uppercase outline-none focus:ring-2 focus:ring-indigo-500"
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
        >
          <option value="ALL">Todas Categorias</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssets.map(asset => (
          <div key={asset.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-slate-50 rounded-xl text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all">
                  <Box size={24} />
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                    asset.condition === 'NOVO' ? 'bg-emerald-50 text-emerald-600' :
                    asset.condition === 'BOM' ? 'bg-blue-50 text-blue-600' :
                    'bg-amber-50 text-amber-600'
                  }`}>
                    {asset.condition}
                  </span>
                  <p className="text-[10px] font-black text-slate-400 uppercase mt-2 tracking-widest">#{asset.assetNumber}</p>
                </div>
              </div>

              <div>
                <h3 className="font-black text-slate-900 uppercase tracking-tight group-hover:text-indigo-700 transition-colors leading-tight">{asset.description}</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{asset.category}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase">Vlr Aquisição</p>
                  <p className="text-sm font-black text-slate-700">R$ {asset.acquisitionValue.toLocaleString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase">Vlr Atual</p>
                  <p className="text-sm font-black text-emerald-600">R$ {asset.currentValue.toLocaleString('pt-BR')}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <MapPin size={14} className="text-indigo-400" />
                  {asset.location}
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <Calendar size={14} className="text-indigo-400" />
                  Adquirido em {new Date(asset.acquisitionDate).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>
            
            <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-2">
              <button className="p-2 text-slate-400 hover:text-indigo-600 transition-all"><Edit2 size={16}/></button>
              <button className="p-2 text-slate-400 hover:text-rose-600 transition-all"><Trash2 size={16}/></button>
            </div>
          </div>
        ))}
      </div>
      
      {filteredAssets.length === 0 && (
        <div className="bg-white p-20 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
           <div className="p-6 bg-slate-50 rounded-full mb-4"><Box size={48} className="text-slate-300"/></div>
           <h3 className="text-lg font-black text-slate-900 uppercase">Sem Itens de Patrimônio</h3>
           <p className="text-slate-500 max-w-xs mt-2">Nenhum bem foi registrado para esta unidade ainda. Comece adicionando um novo item.</p>
        </div>
      )}
    </div>
  );
};
