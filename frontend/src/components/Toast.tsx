import { AlertCircle, CheckCircle2, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'error' | 'success';
  onClose: () => void;
}

const Toast = ({ message, type, onClose }: ToastProps) => {
  return (
    <div className={`fixed bottom-5 right-5 z-[200] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right duration-300 ${
      type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
    }`}>
      {type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
      <p className="font-bold text-sm">{message}</p>
      <button onClick={onClose} className="ml-4 p-1 hover:bg-white/20 rounded-lg">
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;