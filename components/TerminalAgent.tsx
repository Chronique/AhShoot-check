
import React, { useState, useEffect, useRef } from 'react';
import { POPULAR_SCHEMAS } from '../src/constants';
import ReactMarkdown from 'react-markdown';
import { ChatMessage } from '../src/types';

export const TerminalAgent: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'system',
      content: 'AH_SHOOT_CLI v1.0.2 [Local Mode]\nConnected to Ethereum Schema Registry.\n\nType "help" to see available commands.',
      timestamp: Date.now()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const processCommand = (cmd: string): string => {
    const lowerCmd = cmd.toLowerCase().trim();
    const parts = lowerCmd.split(' ');
    const command = parts[0];
    const args = parts.slice(1).join(' ');

    switch (command) {
      case 'help':
        return `**AVAILABLE COMMANDS:**
- \`list\`: Show all available verification schemas.
- \`verify <name>\`: Get docs for a provider (e.g. \`verify base\`).
- \`status\`: Check system connectivity.
- \`clear\`: Clear terminal history.`;

      case 'list':
        const schemaList = POPULAR_SCHEMAS.map(s => `- **${s.provider}**: ${s.name}`).join('\n');
        return `**KNOWN SCHEMAS:**\n${schemaList}\n\nType \`verify <provider_name>\` for details.`;

      case 'status':
        return `**SYSTEM STATUS:**\n- API Mode: OFFLINE (Local)\n- Schemas Loaded: ${POPULAR_SCHEMAS.length}\n- Network: Stabilized\n- Latency: 0ms`;

      case 'verify':
        if (!args) return "ERR: Missing argument. Usage: `verify <provider_name>` (e.g., `verify coinbase`)";
        
        // Improved Search Logic
        // 1. Exact Provider Match (e.g. "base" matches "Base" but not "Base Portal")
        let found = POPULAR_SCHEMAS.find(s => s.provider.toLowerCase() === args);
        
        // 2. Exact Name Match
        if (!found) {
             found = POPULAR_SCHEMAS.find(s => s.name.toLowerCase() === args);
        }

        // 3. Partial Provider Match
        if (!found) {
            found = POPULAR_SCHEMAS.find(s => s.provider.toLowerCase().includes(args));
        }

        // 4. Partial Name Match
        if (!found) {
             found = POPULAR_SCHEMAS.find(s => s.name.toLowerCase().includes(args));
        }

        if (found) {
            return `**${found.name}**\n\n${found.description}\n\n**Action Required:**\n[OPEN OFFICIAL DOCUMENTATION](${found.docsUrl})`;
        }
        return `ERR: Schema "${args}" not found in database. Type \`list\` to see available options.`;

      default:
        return `ERR: Command not recognized. Type "help" for a list of commands.`;
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userText = input;
    const userMsg: ChatMessage = { role: 'user', content: userText, timestamp: Date.now() };
    
    // Check for clear command first to handle state update immediately
    if (userText.toLowerCase().trim() === 'clear') {
        setMessages([{
            role: 'system',
            content: 'Console cleared.',
            timestamp: Date.now()
        }]);
        setInput('');
        return;
    }

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate "processing" delay for effect
    setTimeout(() => {
        const responseText = processCommand(userText);
        const agentMsg: ChatMessage = { 
            role: 'agent', 
            content: responseText, 
            timestamp: Date.now() 
        };
        setMessages(prev => [...prev, agentMsg]);
        setIsTyping(false);
    }, 400); 
  };

  return (
    <div className="w-full max-w-4xl mx-auto h-[70vh] flex flex-col font-mono text-sm md:text-base">
      
      {/* Terminal Header */}
      <div className="bg-slate-800 rounded-t-lg border-b border-slate-700 p-3 flex items-center gap-2">
        <div className="flex gap-1.5 mr-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
        </div>
        <span className="material-symbols-rounded text-slate-400 text-base">terminal</span>
        <span className="text-slate-400 text-xs">local@ah-shoot-cli:~</span>
      </div>

      {/* Terminal Body */}
      <div 
        className="flex-1 bg-black/95 border-x border-slate-700 p-4 overflow-y-auto scrollbar-hide"
        ref={scrollRef}
        style={{ fontFamily: '"Fira Code", "Courier New", monospace' }}
      >
        {messages.map((msg, idx) => (
          <div key={idx} className="mb-4 animate-in fade-in duration-300">
            <div className="flex gap-2 items-start">
              {msg.role === 'user' && <span className="text-indigo-400 font-bold shrink-0">➜ ~</span>}
              {msg.role === 'agent' && <span className="text-emerald-500 font-bold shrink-0">SYSTEM &gt;&gt;</span>}
              {msg.role === 'system' && <span className="text-slate-500 font-bold shrink-0">[KERNEL]</span>}
              
              <div className={`leading-relaxed break-words ${
                  msg.role === 'user' ? 'text-indigo-100' : 
                  msg.role === 'agent' ? 'text-emerald-100' : 'text-slate-400'
              }`}>
                {msg.role === 'agent' || msg.role === 'system' ? (
                   <ReactMarkdown 
                    components={{
                        a: ({node, ...props}) => <a {...props} className="text-blue-400 hover:underline cursor-pointer" target="_blank" rel="noopener noreferrer" />,
                        strong: ({node, ...props}) => <strong {...props} className="text-emerald-400 font-bold" />,
                        ul: ({node, ...props}) => <ul {...props} className="list-disc ml-4 my-2" />,
                        code: ({node, ...props}) => <code {...props} className="bg-slate-800 px-1 py-0.5 rounded text-xs" />
                    }}
                   >
                       {msg.content}
                   </ReactMarkdown>
                ) : (
                    msg.content
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
           <div className="flex items-center gap-2 text-emerald-500 animate-pulse">
             <span className="material-symbols-rounded text-base">memory</span>
             <span>EXECUTING...</span>
           </div>
        )}
      </div>

      {/* Terminal Input */}
      <div className="bg-slate-900 border border-slate-700 rounded-b-lg p-3">
        <form onSubmit={handleSend} className="flex items-center gap-2">
            <span className="material-symbols-rounded text-indigo-500 animate-pulse text-xl">chevron_right</span>
            <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type 'help' to start..."
                className="flex-1 bg-transparent border-none outline-none text-slate-200 placeholder-slate-600 font-mono"
                autoFocus
            />
            <button 
                type="submit"
                disabled={!input.trim() || isTyping}
                className="p-2 text-slate-400 hover:text-white disabled:opacity-30 transition-colors flex items-center justify-center"
            >
                <span className="material-symbols-rounded text-lg">send</span>
            </button>
        </form>
      </div>
    </div>
  );
};
