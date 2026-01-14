
import React, { useState } from 'react';
import { Field, FieldType } from '../types';

interface RowItemProps {
  rowId: string;
  field: Field;
  value: any;
  onUpdate: (value: any) => void;
  view: 'grid' | 'card';
}

const RowItem: React.FC<RowItemProps> = ({ rowId, field, value, onUpdate, view }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value || "");

  const handleBlur = () => {
    setIsEditing(false);
    onUpdate(tempValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleBlur();
  };

  // Rendering logic based on field type
  switch (field.type) {
    case FieldType.CHECKBOX:
      return (
        <div className={`w-full h-full flex items-center ${view === 'grid' ? 'justify-center' : 'justify-start'}`}>
          <button 
            onClick={() => onUpdate(!value)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
              value 
                ? 'bg-green-100 text-green-600 ring-2 ring-green-500 ring-offset-2' 
                : 'bg-gray-100 text-gray-300'
            }`}
          >
            {value ? <i className="fa-solid fa-check text-lg"></i> : <i className="fa-solid fa-minus"></i>}
          </button>
        </div>
      );

    case FieldType.TEXT:
    case FieldType.LINK:
    case FieldType.DATE:
      if (isEditing) {
        return (
          <input 
            type={field.type === FieldType.DATE ? 'date' : 'text'}
            autoFocus
            className="w-full h-full p-3 bg-white border-2 border-indigo-500 outline-none"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
          />
        );
      }
      
      const displayValue = value || (field.type === FieldType.DATE ? "Pick date" : "Empty");
      const isPlaceholder = !value;

      return (
        <div 
          onClick={() => setIsEditing(true)}
          className={`w-full min-h-[44px] flex items-center p-3 cursor-pointer group hover:bg-gray-50 transition-colors ${isPlaceholder ? 'text-gray-400 italic text-sm' : 'text-gray-800'}`}
        >
          {field.type === FieldType.LINK && value ? (
            <div className="flex items-center gap-2 overflow-hidden w-full">
              <span className="truncate flex-1 underline text-indigo-600">{value}</span>
              <a 
                href={value.startsWith('http') ? value : `https://${value}`} 
                target="_blank" 
                rel="noreferrer" 
                className="hidden group-hover:block p-1 bg-indigo-100 text-indigo-700 rounded"
                onClick={(e) => e.stopPropagation()}
              >
                <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
              </a>
            </div>
          ) : (
            <span className="truncate block w-full">{displayValue}</span>
          )}
        </div>
      );

    case FieldType.MULTI_SELECT:
      const selected = Array.isArray(value) ? value : [];
      return (
        <div className="p-2 space-y-1">
          <div className="flex flex-wrap gap-1">
            {selected.map(item => (
              <span key={item} className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] rounded-full font-bold">
                {item}
              </span>
            ))}
            {selected.length === 0 && <span className="text-gray-400 text-xs">None</span>}
          </div>
          <select 
            className="w-full text-xs bg-gray-50 border border-gray-200 rounded p-1 outline-none"
            onChange={(e) => {
                if (e.target.value) {
                    const newSelected = selected.includes(e.target.value) 
                        ? selected.filter(s => s !== e.target.value)
                        : [...selected, e.target.value];
                    onUpdate(newSelected);
                }
            }}
          >
            <option value="">Edit Tags...</option>
            {field.options?.map(opt => (
              <option key={opt} value={opt}>{selected.includes(opt) ? `✓ ${opt}` : opt}</option>
            ))}
          </select>
        </div>
      );

    default:
      return null;
  }
};

export default RowItem;
