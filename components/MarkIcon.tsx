
import React from 'react';
import { MarkType } from '../types';

interface MarkIconProps {
  type: MarkType;
  className?: string;
}

export const MarkIcon: React.FC<MarkIconProps> = ({ type, className = "" }) => {
  switch (type) {
    case MarkType.NO:
      return <i className={`fa-solid fa-xmark text-red-500 ${className}`}></i>;
    case MarkType.YES:
      return <i className={`fa-solid fa-check text-green-500 ${className}`}></i>;
    case MarkType.MAYBE:
      return <i className={`fa-solid fa-question text-yellow-500 ${className}`}></i>;
    case MarkType.STRONG:
      return <i className={`fa-solid fa-exclamation text-orange-500 ${className}`}></i>;
    case MarkType.REVEALED:
      return <i className={`fa-solid fa-eye text-blue-400 ${className}`}></i>;
    default:
      return null;
  }
};
