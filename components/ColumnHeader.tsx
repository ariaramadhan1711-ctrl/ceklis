
import React, { useState, useRef, useEffect } from 'react';
import { Field, FieldType } from '../types';

interface ColumnHeaderProps {
  field: Field;
  onRename: (newTitle: string) => void;
  onDelete: () => void;
}

const ColumnHeader: React.FC<ColumnHeaderProps> = ({ field, onRename, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(field.title);
  const [showMenu, setShowMenu] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = () => {
    switch (field.type) {
      case FieldType.CHECKBOX: return 'fa-check-square';
      case FieldType.TEXT: return 'fa-font';
      case FieldType.LINK: return 'fa-link';
      case FieldType.DATE: return 'fa-calendar';
      case FieldType.MULTI_SELECT: return 'fa-tags';
      default: return 'fa-circle';
    }
  };

  const handleSave = () => {
    if (tempTitle.trim() && tempTitle !== field.title) {
      onRename(tempTitle.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setTempTitle(field.title);
      setIsEditing(false);
    }
  };

  return (
    <div className="w-48 px-4 py-3 border-r border-gray-200 flex items-center gap-2 group relative bg-gray-50/50">
      <i className={`fa-solid ${getIcon()} text-gray-400 text-[10px]`}></i>
      
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          className="w-full bg-white border border-indigo-400 rounded px-1 py-0.5 text-[11px] font-bold outline-none ring-2 ring-indigo-200"
          value={tempTitle}
          onChange={(e) => setTempTitle(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <span 
          onClick={() => setIsEditing(true)}
          className="font-bold text-gray-700 uppercase tracking-wider text-[11px] truncate cursor-text hover:text-indigo-600 transition-colors"
          title="Click to rename"
        >
          {field.title}
        </span>
      )}

      <div className="ml-auto relative" ref={menuRef}>
        <button 
          onClick={() => setShowMenu(!showMenu)}
          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-indigo-600 transition-all rounded-md"
        >
          <i className="fa-solid fa-ellipsis-vertical text-[10px]"></i>
        </button>
        
        {showMenu && (
          <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 shadow-xl rounded-lg z-[60] overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
            <button 
              onClick={() => { setIsEditing(true); setShowMenu(false); }}
              className="w-full text-left px-3 py-2 text-[11px] font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <i className="fa-solid fa-pen"></i> Rename
            </button>
            <button 
              onClick={() => { onDelete(); setShowMenu(false); }}
              className="w-full text-left px-3 py-2 text-[11px] font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <i className="fa-solid fa-trash"></i> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColumnHeader;
