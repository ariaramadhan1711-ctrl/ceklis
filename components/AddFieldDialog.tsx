
import React, { useState } from 'react';
import { FieldType } from '../types';

interface AddFieldDialogProps {
  onClose: () => void;
  onAdd: (title: string, type: FieldType, options?: string[]) => void;
}

const AddFieldDialog: React.FC<AddFieldDialogProps> = ({ onClose, onAdd }) => {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<FieldType>(FieldType.CHECKBOX);
  const [multiSelectOptions, setMultiSelectOptions] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    
    const options = type === FieldType.MULTI_SELECT 
        ? multiSelectOptions.split(',').map(s => s.trim()).filter(Boolean)
        : undefined;

    onAdd(title, type, options);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
              <i className="fa-solid fa-columns"></i>
            </div>
            Add New Field
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Column Label</label>
              <input 
                type="text"
                autoFocus
                placeholder="e.g. Completed, Status, Deadline"
                className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-xl outline-none transition-all"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Field Type</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(FieldType).map(fType => (
                  <button 
                    key={fType}
                    type="button"
                    onClick={() => setType(fType)}
                    className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      type === fType 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                        : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'
                    }`}
                  >
                    {fType.replace('_', ' ').toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {type === FieldType.MULTI_SELECT && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Options (Comma separated)</label>
                <input 
                  type="text"
                  placeholder="In Progress, Testing, Done"
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-xl outline-none transition-all"
                  value={multiSelectOptions}
                  onChange={(e) => setMultiSelectOptions(e.target.value)}
                />
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={!title}
                className="flex-[2] py-3 bg-indigo-600 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all active:scale-95"
              >
                Create Column
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddFieldDialog;
