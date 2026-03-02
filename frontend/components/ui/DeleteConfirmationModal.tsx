import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from './Button';

interface DeleteModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmationModal: React.FC<DeleteModalProps> = ({ title, message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-sm overflow-hidden border border-gray-100 p-8 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-6">
          <AlertTriangle size={32} />
        </div>
        
        <h3 className="text-xl font-black text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 font-medium leading-relaxed mb-8">
          {message}
        </p>

        <div className="flex flex-col w-full gap-3">
          <Button 
            onClick={onConfirm} 
            className="w-full h-14 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-red-100"
          >
            Confirmar Exclusão
          </Button>
          <Button 
            onClick={onCancel} 
            variant="ghost" 
            className="w-full h-14 text-gray-400 font-black uppercase text-[10px] tracking-widest hover:text-gray-900"
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
};