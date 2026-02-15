import React from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  isLoading: boolean;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose, title, content, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">{title}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              <p className="animate-pulse">Generating guide with Gemini AI...</p>
            </div>
          ) : (
            <div className="prose prose-invert prose-slate max-w-none">
                {/* Simple markdown-like rendering for standard text blocks */}
                {content.split('\n').map((line, i) => {
                    if (line.startsWith('###')) return <h3 key={i} className="text-lg font-bold text-indigo-300 mt-4 mb-2">{line.replace('###', '')}</h3>;
                    if (line.startsWith('##')) return <h2 key={i} className="text-xl font-bold text-white mt-6 mb-3">{line.replace('##', '')}</h2>;
                    if (line.startsWith('**')) return <p key={i} className="font-bold text-slate-200 my-2">{line.replace(/\*\*/g, '')}</p>;
                    if (line.startsWith('- ')) return <li key={i} className="ml-4 text-slate-300 list-disc">{line.replace('- ', '')}</li>;
                    if (line.match(/^\d\./)) return <li key={i} className="ml-4 text-slate-300 list-decimal mb-2 pl-2">{line.replace(/^\d\./, '').trim()}</li>;
                    return <p key={i} className="text-slate-300 leading-relaxed mb-2">{line}</p>;
                })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 rounded-b-2xl flex justify-end">
            <button 
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
            >
                Close
            </button>
        </div>
      </div>
    </div>
  );
};