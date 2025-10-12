import React, { ElementType } from 'react';

interface SettingOptionsProps<T extends string> {
  icon: ElementType;
  title: string;
  options: T[];
  selected: T;
  onSelect: (value: T) => void;
}

const SettingOptions = <T extends string>({ icon: Icon, title, options, selected, onSelect }: SettingOptionsProps<T>) => (
  <div>
    <label className="text-gray-300 text-sm mb-2 flex items-center gap-2">
      <Icon className="w-4 h-4" />
      {title}
    </label>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {options.map(option => (
        <button
          key={option}
          onClick={() => onSelect(option)}
          className={`px-2 py-2 text-sm rounded-lg transition-all ${
            selected === option
              ? 'bg-purple-600 text-white font-semibold shadow-lg shadow-purple-600/20'
              : 'bg-gray-800/60 hover:bg-gray-700/80'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  </div>
);

export default SettingOptions;
