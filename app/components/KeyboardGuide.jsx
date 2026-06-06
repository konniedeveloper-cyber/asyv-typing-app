"use client";

import { useState, useMemo } from "react";

// Add blinking animation
const style = `
  @keyframes blink-key {
    0%, 49% {
      box-shadow: 0 0 20px 4px rgba(59, 130, 246, 0.8), inset 0 0 20px rgba(59, 130, 246, 0.4);
    }
    50%, 100% {
      box-shadow: 0 0 10px 2px rgba(59, 130, 246, 0.4), inset 0 0 10px rgba(59, 130, 246, 0.2);
    }
  }
  .animate-blink-key {
    animation: blink-key 1s infinite;
  }
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = style;
  document.head.appendChild(styleSheet);
}

// Define keyboard layout with finger positions
const KEYBOARD_ROWS = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/']
];

// Home row and finger assignments
const FINGER_POSITIONS = {
  // Left hand fingers (index to pinky)
  'a': { hand: 'left', finger: 'pinky', home: true },
  's': { hand: 'left', finger: 'ring', home: true },
  'd': { hand: 'left', finger: 'middle', home: true },
  'f': { hand: 'left', finger: 'index', home: true },
  
  // Right hand fingers (index to pinky)
  'j': { hand: 'right', finger: 'index', home: true },
  'k': { hand: 'right', finger: 'middle', home: true },
  'l': { hand: 'right', finger: 'ring', home: true },
  ';': { hand: 'right', finger: 'pinky', home: true },
  
  // Other keys for left hand
  'q': { hand: 'left', finger: 'pinky' },
  'w': { hand: 'left', finger: 'ring' },
  'e': { hand: 'left', finger: 'middle' },
  'r': { hand: 'left', finger: 'index' },
  't': { hand: 'left', finger: 'index' },
  'z': { hand: 'left', finger: 'pinky' },
  'x': { hand: 'left', finger: 'ring' },
  'c': { hand: 'left', finger: 'middle' },
  'v': { hand: 'left', finger: 'index' },
  'b': { hand: 'left', finger: 'index' },
  
  // Other keys for right hand
  'y': { hand: 'right', finger: 'index' },
  'u': { hand: 'right', finger: 'index' },
  'i': { hand: 'right', finger: 'middle' },
  'o': { hand: 'right', finger: 'ring' },
  'p': { hand: 'right', finger: 'pinky' },
  'n': { hand: 'right', finger: 'index' },
  'm': { hand: 'right', finger: 'index' },
  ',': { hand: 'right', finger: 'ring' },
  '.': { hand: 'right', finger: 'pinky' },
  '/': { hand: 'right', finger: 'pinky' },
  '[': { hand: 'right', finger: 'pinky' },
  ']': { hand: 'right', finger: 'pinky' },
  "'": { hand: 'right', finger: 'pinky' },
  
  // Numbers - left hand mostly
  '1': { hand: 'left', finger: 'pinky' },
  '2': { hand: 'left', finger: 'ring' },
  '3': { hand: 'left', finger: 'middle' },
  '4': { hand: 'left', finger: 'index' },
  '5': { hand: 'left', finger: 'index' },
  '6': { hand: 'right', finger: 'index' },
  '7': { hand: 'right', finger: 'index' },
  '8': { hand: 'right', finger: 'middle' },
  '9': { hand: 'right', finger: 'ring' },
  '0': { hand: 'right', finger: 'pinky' },
  '-': { hand: 'right', finger: 'pinky' },
  '=': { hand: 'right', finger: 'pinky' }
};

const FINGER_COLORS = {
  pinky: 'from-rose-500 to-rose-600',
  ring: 'from-orange-500 to-orange-600',
  middle: 'from-yellow-500 to-yellow-600',
  index: 'from-emerald-500 to-emerald-600',
  thumb: 'from-blue-500 to-blue-600'
};

const HAND_COLORS = {
  left: { bg: 'bg-slate-700/40', border: 'border-slate-600' },
  right: { bg: 'bg-slate-700/40', border: 'border-slate-600' }
};

export const KeyboardGuide = ({ 
  lessonKeys = [], 
  currentInput = "",
  sentence = "",
  theme = "dark",
  instruction = "",
  highlightMode = "lesson", // 'lesson', 'all', or 'home'
  compact = false // true for lesson modal
}) => {
  const lessonKeysSet = useMemo(() => new Set(lessonKeys.map(k => k.toLowerCase())), [lessonKeys]);
  const currentInputSet = useMemo(() => new Set(currentInput.toLowerCase().split('')), [currentInput]);
  const nextKeyToType = useMemo(() => {
    if (currentInput.length < sentence.length) {
      return sentence[currentInput.length].toLowerCase();
    }
    return '';
  }, [currentInput, sentence]);

  // Determine which keys to highlight
  const getKeyHighlight = (key) => {
    const lowerKey = key.toLowerCase();
    
    // Blink animation for next key to type
    if (lowerKey === nextKeyToType && nextKeyToType !== '') {
      return 'animate-blink-key bg-blue-600/70 border-blue-400';
    }
    
    // Always highlight keys being typed
    if (currentInputSet.has(lowerKey)) {
      return 'bg-emerald-500/80 border-emerald-400 scale-105 shadow-lg shadow-emerald-500/50';
    }
    
    // Highlight based on mode
    if (highlightMode === 'lesson' && lessonKeysSet.has(lowerKey)) {
      return 'bg-slate-600/70 border-slate-500 opacity-100';
    }
    
    if (highlightMode === 'home') {
      const pos = FINGER_POSITIONS[lowerKey];
      if (pos?.home) {
        return 'bg-slate-600/70 border-slate-500 opacity-100';
      } else {
        return 'opacity-30';
      }
    }
    
    // Default styling
    return '';
  };

  const getKeyStyle = (key) => {
    const position = FINGER_POSITIONS[key.toLowerCase()];
    if (!position) return {};

    const isLessonKey = lessonKeysSet.has(key.toLowerCase());
    const isHomeKey = position?.home;

    return {
      position,
      isLessonKey,
      isHomeKey
    };
  };

  const renderKey = (key) => {
    const style = getKeyStyle(key);
    const highlight = getKeyHighlight(key);
    const position = FINGER_POSITIONS[key.toLowerCase()];

    return (
      <div
        key={key}
        className={`
          relative ${compact ? 'w-7 h-7 md:w-8 md:h-8' : 'w-10 h-10 md:w-11 md:h-11'}
          rounded-lg font-semibold ${compact ? 'text-xs' : 'text-sm'}
          flex items-center justify-center
          cursor-default select-none
          transition-all duration-100 transform
          border-2 border-slate-500/50
          ${theme === 'dark' ? 'bg-slate-700/60 text-slate-200' : 'bg-gray-200 text-gray-900'}
          ${highlight}
          ${style.isHomeKey ? 'ring-2 ring-offset-1 ring-emerald-400/50' : ''}
        `}
        title={`${key}${position ? ` (${position.hand} ${position.finger})` : ''}`}
      >
        <span className="relative z-10">{key.toUpperCase()}</span>
        
        {/* Finger indicator dot */}
        {position && (
          <div
            className={`
              absolute bottom-0.5 right-0.5 ${compact ? 'w-1 h-1' : 'w-2 h-2'} rounded-full
              bg-gradient-to-br ${FINGER_COLORS[position.finger] || 'from-slate-400 to-slate-500'}
              opacity-60
            `}
            title={position.finger}
          />
        )}
      </div>
    );
  };

  return (
    <div className={`
      w-full ${compact ? 'p-2' : 'p-4'} rounded-lg
      ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-gray-100'}
      border ${theme === 'dark' ? 'border-slate-700/50' : 'border-gray-300'}
      flex-shrink-0
    `}>
      {/* Legend and Instruction */}
      <div className={`${compact ? 'mb-1' : 'mb-4'}`}>
        <div className={`text-xs font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'} ${compact ? 'hidden' : ''}`}>
          {highlightMode === 'lesson' && lessonKeys.length > 0 && (
            <p>Focus on: <span className="text-emerald-400 font-semibold">{lessonKeys.slice(0, 5).join(' ')}</span></p>
          )}
          {highlightMode === 'home' && (
            <p>Home row position (asdf jkl;) - these are your anchor keys</p>
          )}
        </div>
      </div>

      {/* Finger color legend */}
      <div className={`${compact ? 'hidden' : 'mb-4 flex items-center gap-3 text-xs flex-wrap'}${!compact ? '' : ''}`}>
        <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}>Fingers:</span>
        <div className="flex gap-2 flex-wrap">
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${FINGER_COLORS.pinky}`} />
            <span className={theme === 'dark' ? 'text-slate-300/70' : 'text-gray-700'}>Pinky</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${FINGER_COLORS.ring}`} />
            <span className={theme === 'dark' ? 'text-slate-300/70' : 'text-gray-700'}>Ring</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${FINGER_COLORS.middle}`} />
            <span className={theme === 'dark' ? 'text-slate-300/70' : 'text-gray-700'}>Middle</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${FINGER_COLORS.index}`} />
            <span className={theme === 'dark' ? 'text-slate-300/70' : 'text-gray-700'}>Index</span>
          </div>
        </div>
      </div>

      {/* Keyboard Layout */}
      <div className={`${compact ? 'space-y-0.5' : 'space-y-1'} bg-slate-900/50 ${compact ? 'p-2' : 'p-3'} rounded-lg`}>
        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1" style={{
            marginLeft: rowIndex === 2 ? '20px' : rowIndex === 3 ? '40px' : '0px'
          }}>
            {row.map(key => renderKey(key))}
          </div>
        ))}
      </div>

      {/* Instructions */}
      {instruction && (
        <div className={`
          mt-4 p-3 rounded text-sm
          ${theme === 'dark' ? 'bg-slate-700/50 text-slate-200' : 'bg-gray-200 text-gray-800'}
        `}>
          {instruction}
        </div>
      )}

      {/* Quick Tips */}
      <div className={`
        mt-2 text-xs
        ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}
        ${compact ? 'hidden' : ''}
      `}>
        <p>💡 Home row (asdf jkl;) - Keep your fingers here and reach to other keys</p>
      </div>
    </div>
  );
};

export default KeyboardGuide;
