
import React from 'react';
import { MarkType } from '../types';
import { MarkIcon } from './MarkIcon';

interface ClueCellProps {
  type: MarkType;
  onClick: () => void;
  isConfirmedByLogic?: boolean;
}

export const ClueCell: React.FC<ClueCellProps> = ({ type, onClick, isConfirmedByLogic }) => {
  return (
    <div 
      onClick={onClick}
      className={`h-full w-full aspect-square border-l border-slate-800/50 flex items-center justify-center cursor-pointer active:bg-slate-700 transition-colors
        ${isConfirmedByLogic ? 'bg-green-900/20' : ''}
        ${type !== MarkType.EMPTY ? 'bg-slate-800/30' : ''}
      `}
    >
      <MarkIcon type={type} className="text-base" />
    </div>
  );
};
