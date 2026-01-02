
import React, { useState, useMemo } from 'react';
import { Screen, Player, MarkType, GridState, ClueItem, DeductionResult } from './types';
import { SUSPECTS, WEAPONS, LOCATIONS, PLAYER_COLORS } from './constants';
import { ClueCell } from './components/ClueCell';
import { MarkIcon } from './components/MarkIcon';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.HOME);
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerCount, setPlayerCount] = useState<number>(3);
  const [grid, setGrid] = useState<GridState>({});
  const [showDeduction, setShowDeduction] = useState(false);

  const startNewGame = () => {
    setCurrentScreen(Screen.SETUP);
  };

  const handleSetupSubmit = () => {
    const newPlayers: Player[] = Array.from({ length: playerCount }).map((_, i) => ({
      id: `p${i}`,
      name: i === 0 ? 'Você' : `Jog. ${i + 1}`,
      color: PLAYER_COLORS[i % PLAYER_COLORS.length],
      isUser: i === 0
    }));
    setPlayers(newPlayers);
    
    const initialGrid: GridState = {};
    [...SUSPECTS, ...WEAPONS, ...LOCATIONS].forEach(item => {
      initialGrid[item.id] = {};
      newPlayers.forEach(player => {
        initialGrid[item.id][player.id] = MarkType.EMPTY;
      });
    });
    
    setGrid(initialGrid);
    setCurrentScreen(Screen.GAME);
  };

  const cycleMark = (itemId: string, playerId: string) => {
    setGrid(prev => {
      const currentMark = prev[itemId][playerId];
      const sequence = [MarkType.EMPTY, MarkType.NO, MarkType.YES, MarkType.MAYBE, MarkType.STRONG, MarkType.REVEALED];
      const nextIndex = (sequence.indexOf(currentMark) + 1) % sequence.length;
      const nextMark = sequence[nextIndex];
      
      const newGrid = {
        ...prev,
        [itemId]: {
          ...prev[itemId],
          [playerId]: nextMark
        }
      };

      if (nextMark === MarkType.YES || nextMark === MarkType.REVEALED) {
        players.forEach(p => {
          if (p.id !== playerId) {
            newGrid[itemId][p.id] = MarkType.NO;
          }
        });
      }

      return newGrid;
    });
  };

  const deduction = useMemo((): DeductionResult => {
    const getCandidates = (items: ClueItem[]) => {
      return items.filter(item => {
        const row = grid[item.id] || {};
        return !Object.values(row).some(m => m === MarkType.YES || m === MarkType.REVEALED);
      }).map(i => i.name);
    };

    return {
      suspects: getCandidates(SUSPECTS),
      weapons: getCandidates(WEAPONS),
      locations: getCandidates(LOCATIONS)
    };
  }, [grid]);

  const isSolutionItem = (itemId: string, categoryItems: ClueItem[]) => {
    const row = grid[itemId] || {};
    if (Object.values(row).some(m => m === MarkType.YES || m === MarkType.REVEALED)) return false;

    const categoryCandidates = categoryItems.filter(item => {
      const r = grid[item.id] || {};
      return !Object.values(r).some(m => m === MarkType.YES || m === MarkType.REVEALED);
    });

    return categoryCandidates.length === 1 && categoryCandidates[0].id === itemId;
  };

  const renderSection = (title: string, items: ClueItem[]) => (
    <div className="mb-6">
      <div className="bg-slate-800/95 border-y border-slate-700 flex sticky top-10 z-10 backdrop-blur-md">
        <div className="w-32 min-w-[8rem] px-3 py-2 text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center border-r border-slate-700/50">
          {title}
        </div>
        <div className="flex-1 flex overflow-hidden">
           {players.map(p => (
             <div key={p.id} className="w-12 min-w-[3rem] border-l border-slate-700/50 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }}></div>
             </div>
           ))}
        </div>
      </div>

      {items.map(item => {
        const isSolution = isSolutionItem(item.id, items);
        return (
          <div 
            key={item.id} 
            className={`flex border-b border-slate-800/80 transition-all ${isSolution ? 'bg-green-500/10' : 'hover:bg-slate-800/30'}`}
          >
            <div className={`w-32 min-w-[8rem] px-3 py-3 text-[11px] flex items-center truncate border-r border-slate-700/50 shadow-sm ${isSolution ? 'text-green-400 font-black italic' : 'text-slate-300 font-medium'}`}>
              {item.name}
              {isSolution && <i className="fa-solid fa-envelope ml-auto text-[9px] text-green-500/50"></i>}
            </div>
            <div className="flex-1 flex overflow-x-auto scrollbar-hide">
              {players.map(player => (
                <div key={`${item.id}-${player.id}`} className="w-12 min-w-[3rem] shrink-0">
                  <ClueCell 
                    type={grid[item.id]?.[player.id] || MarkType.EMPTY}
                    onClick={() => cycleMark(item.id, player.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  if (currentScreen === Screen.HOME) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-950">
        <div className="text-center space-y-6 mb-16 animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-gradient-to-br from-red-600 to-red-800 rounded-3xl mx-auto flex items-center justify-center shadow-[0_0_40px_rgba(220,38,38,0.2)] border border-white/10">
            <i className="fa-solid fa-clipboard-list text-5xl text-white"></i>
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic leading-none">Detetive</h1>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Planilha de Dedução</p>
          </div>
        </div>
        
        <div className="w-full max-w-xs space-y-4">
          <button 
            onClick={startNewGame}
            className="w-full bg-white text-black font-black py-4 px-8 rounded-2xl flex items-center justify-center gap-3 hover:bg-red-600 hover:text-white transition-all active:scale-95 shadow-xl"
          >
            <i className="fa-solid fa-plus text-sm"></i>
            <span className="tracking-widest text-sm uppercase">Novo Jogo</span>
          </button>
        </div>
      </div>
    );
  }

  if (currentScreen === Screen.SETUP) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 flex flex-col">
        <header className="mb-10 flex items-center gap-4">
          <button onClick={() => setCurrentScreen(Screen.HOME)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-900 text-slate-500 hover:text-white transition-colors">
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <h2 className="text-xl font-black text-white uppercase tracking-tight">Configurar Partida</h2>
        </header>

        <div className="max-w-md mx-auto w-full space-y-12 flex-1">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Quantidade de Jogadores</label>
              <span className="text-red-500 font-black text-xl">{playerCount}</span>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[3, 4, 5, 6].map(num => (
                <button
                  key={num}
                  onClick={() => setPlayerCount(num)}
                  className={`py-5 rounded-2xl font-black border-2 transition-all ${
                    playerCount === num 
                    ? 'bg-red-600 border-red-500 text-white shadow-lg scale-105' 
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 bg-slate-900/50 rounded-3xl border border-slate-800/50">
            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
              <i className="fa-solid fa-circle-info mr-2 text-red-500"></i>
              Defina a ordem conforme os jogadores estão sentados na mesa, começando por você. Isso ajuda na lógica de exclusão automática.
            </p>
          </div>
        </div>

        <button 
          onClick={handleSetupSubmit}
          className="w-full bg-red-600 text-white font-black py-5 rounded-2xl tracking-[0.2em] text-sm uppercase shadow-2xl active:scale-95 transition-all mt-auto"
        >
          Iniciar Investigação
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-950 flex flex-col select-none overflow-hidden">
      <header className="bg-slate-900 border-b border-slate-700 h-14 shrink-0 z-40 px-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentScreen(Screen.HOME)} className="text-slate-500 hover:text-white transition-colors">
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <div className="flex flex-col">
            <h2 className="font-black text-[10px] tracking-widest text-white uppercase leading-none">Detetive Digital</h2>
            <span className="text-[8px] font-bold text-red-500 uppercase mt-1 tracking-tighter italic">Investigação Ativa</span>
          </div>
        </div>
        <button 
          onClick={() => setShowDeduction(!showDeduction)}
          className={`px-4 py-2 rounded-xl font-black text-[9px] tracking-widest uppercase transition-all shadow-md flex items-center gap-2
            ${showDeduction ? 'bg-red-600 text-white ring-2 ring-red-400/20' : 'bg-slate-800 text-slate-400'}
          `}
        >
          <i className="fa-solid fa-magnifying-glass-chart"></i>
          Dedução
        </button>
      </header>

      <div className="flex-1 overflow-auto bg-slate-950 relative">
        <div className="sticky top-0 z-30 bg-slate-900 border-b-2 border-slate-700 flex h-10 shrink-0 shadow-md">
          <div className="w-32 min-w-[8rem] bg-slate-900 border-r-2 border-slate-700 px-3 flex items-center">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Itens / Jogadores</span>
          </div>
          <div className="flex-1 flex overflow-x-auto scrollbar-hide">
            {players.map(p => (
              <div key={p.id} className="w-12 min-w-[3rem] shrink-0 flex flex-col items-center justify-center border-l border-slate-800/50">
                <div className="w-2.5 h-2.5 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: p.color }}></div>
                <span className="text-[7px] font-black text-white uppercase mt-0.5 truncate w-full text-center px-0.5">
                  {p.isUser ? 'EU' : p.name.split(' ')[1]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="pb-40">
          {renderSection('Quem? (Suspeitos)', SUSPECTS)}
          {renderSection('O Quê? (Armas)', WEAPONS)}
          {renderSection('Onde? (Locais)', LOCATIONS)}
        </div>
      </div>

      {showDeduction && (
        <div className="fixed inset-x-0 bottom-32 z-50 px-4 animate-in slide-in-from-bottom-6 duration-300">
          <div className="bg-slate-900/95 backdrop-blur-xl border-2 border-red-600/50 rounded-3xl p-5 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-[10px] font-black text-red-500 tracking-widest uppercase italic">Possíveis no Envelope</h4>
              <i className="fa-solid fa-user-secret text-slate-700"></i>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Culpado', data: deduction.suspects, icon: 'fa-user' },
                { label: 'Local', data: deduction.locations, icon: 'fa-map-pin' },
                { label: 'Arma', data: deduction.weapons, icon: 'fa-dagger' }
              ].map((item, idx) => (
                <div key={idx} className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 flex flex-col items-center text-center shadow-inner">
                  <span className="text-[7px] font-black text-slate-500 uppercase mb-1.5 tracking-tighter">{item.label}</span>
                  <span className={`text-[9px] font-black leading-tight h-8 flex items-center justify-center ${item.data.length === 1 ? 'text-green-400' : 'text-slate-300'}`}>
                    {item.data.length === 1 ? item.data[0] : `${item.data.length} Opções`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-slate-900 border-t border-slate-700 px-4 py-4 pb-10 z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <div className="flex justify-between items-center gap-1 overflow-x-auto scrollbar-hide">
          {[MarkType.EMPTY, MarkType.NO, MarkType.YES, MarkType.MAYBE, MarkType.STRONG, MarkType.REVEALED].map(type => (
            <div key={type} className="flex flex-col items-center gap-1.5 min-w-[50px]">
              <div className="w-12 h-12 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center shadow-inner active:scale-90 transition-transform">
                <MarkIcon type={type} className="text-xl" />
              </div>
              <span className="text-[7px] text-slate-500 font-black uppercase tracking-tighter">
                {type === MarkType.EMPTY ? 'Limpar' : type === MarkType.REVEALED ? 'Visto' : 
                 type === MarkType.NO ? 'Não é' : 
                 type === MarkType.YES ? 'Confirm.' : 
                 type === MarkType.MAYBE ? 'Talvez' : 'Forte'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
