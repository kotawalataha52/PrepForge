import React, { useState } from 'react';
import { 
  Code2, 
  Play, 
  RotateCcw, 
  Copy, 
  Check, 
  X
} from 'lucide-react';

const LANGUAGE_BOILERPLATES = {
  cpp: {
    name: 'C / C++',
    defaultCode: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    void solve() {
        // Write your solution here
        
    }
};

int main() {
    Solution sol;
    
    return 0;
}`
  },
  python: {
    name: 'Python',
    defaultCode: `class Solution:
    def solve(self):
        # Write your solution here
        pass

if __name__ == "__main__":
    sol = Solution()`
  },
  java: {
    name: 'Java',
    defaultCode: `import java.util.*;

public class Solution {
    public void solve() {
        // Write your solution here
        
    }

    public static void main(String[] args) {
        Solution sol = new Solution();
        
    }
}`
  },
  sql: {
    name: 'SQL',
    defaultCode: `-- Write your SQL query here
SELECT *
FROM table_name;`
  }
};

const CodeEditorPanel = ({ onSubmitCode, onClose, isSubmitting = false }) => {
  const [selectedLang, setSelectedLang] = useState('python');
  const [codeMap, setCodeMap] = useState({
    cpp: LANGUAGE_BOILERPLATES.cpp.defaultCode,
    python: LANGUAGE_BOILERPLATES.python.defaultCode,
    java: LANGUAGE_BOILERPLATES.java.defaultCode,
    sql: LANGUAGE_BOILERPLATES.sql.defaultCode
  });
  const [copied, setCopied] = useState(false);

  const currentCode = codeMap[selectedLang];

  const handleCodeChange = (e) => {
    const val = e.target.value;
    setCodeMap(prev => ({ ...prev, [selectedLang]: val }));
  };

  const handleKeyDown = (e) => {
    // Enable tab indentation inside textarea
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const val = e.target.value;
      const updated = val.substring(0, start) + '    ' + val.substring(end);
      setCodeMap(prev => ({ ...prev, [selectedLang]: updated }));
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 4;
      }, 0);
    }
  };

  const handleReset = () => {
    setCodeMap(prev => ({
      ...prev,
      [selectedLang]: LANGUAGE_BOILERPLATES[selectedLang].defaultCode
    }));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = () => {
    if (!currentCode.trim() || isSubmitting) return;
    onSubmitCode({
      code: currentCode,
      language: LANGUAGE_BOILERPLATES[selectedLang].name
    });
  };

  // Generate line numbers
  const lineCount = Math.max(currentCode.split('\n').length, 16);
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <div className="h-full flex flex-col bg-[#090B12] border-r border-white/10 text-white select-none">
      {/* Top Bar */}
      <div className="h-14 px-4 border-b border-white/10 flex items-center justify-between bg-black/40">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Code2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Code Workspace</span>
          </div>

          {/* Language Selector Pills */}
          <div className="flex items-center bg-black/50 p-1 rounded-lg border border-white/5 gap-1">
            {Object.entries(LANGUAGE_BOILERPLATES).map(([key, lang]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedLang(key)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium transition cursor-pointer ${
                  selectedLang === key 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-lg glass border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 text-xs flex items-center gap-1 transition cursor-pointer"
            title="Copy Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 rounded-lg glass border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 text-xs flex items-center gap-1 transition cursor-pointer"
            title="Reset Template"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition disabled:opacity-50 cursor-pointer"
          >
            <Play className="w-3 h-3 fill-white" />
            <span>{isSubmitting ? 'Evaluating...' : 'Submit Solution'}</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition ml-1"
              title="Close Code Editor"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Editor Body with Line Numbers */}
      <div className="flex-1 flex overflow-hidden relative font-mono text-xs">
        {/* Line Numbers Gutter */}
        <div className="w-11 py-3 bg-[#06070B] border-r border-white/5 text-gray-600 select-none text-right pr-2.5 overflow-hidden leading-relaxed">
          {lineNumbers.map((num) => (
            <div key={num} className="leading-5 h-5">{num}</div>
          ))}
        </div>

        {/* Code Input Area */}
        <div className="flex-1 relative bg-[#090B12] overflow-auto">
          <textarea
            value={currentCode}
            onChange={handleCodeChange}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            className="w-full h-full p-3 bg-transparent text-emerald-300 font-mono text-xs focus:outline-none resize-none leading-5 tracking-wide tab-size-4 whitespace-pre"
            style={{ tabSize: 4 }}
            placeholder={`Write your ${LANGUAGE_BOILERPLATES[selectedLang].name} solution here...`}
          />
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="h-7 px-4 border-t border-white/5 bg-[#06070B] flex items-center justify-between text-[11px] text-gray-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-gray-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Language: <span className="text-white font-semibold">{LANGUAGE_BOILERPLATES[selectedLang].name}</span>
          </span>
          <span>Tab: 4 spaces</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Click <strong>Submit Solution</strong> to send code to interviewer</span>
        </div>
      </div>
    </div>
  );
};

export default CodeEditorPanel;
