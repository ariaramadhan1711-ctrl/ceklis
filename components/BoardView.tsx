
import React, { useState, useMemo } from 'react';
import { Board, Field, Row, FieldType, CellValue } from '../types';
import RowItem from './RowItem';
import ColumnHeader from './ColumnHeader';
import AddFieldDialog from './AddFieldDialog';
import { csvHelper } from '../utils/csvHelper';

interface BoardViewProps {
  board: Board;
  onUpdate: (board: Board) => void;
}

const BoardView: React.FC<BoardViewProps> = ({ board, onUpdate }) => {
  const [isAddFieldOpen, setIsAddFieldOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRows = useMemo(() => {
    if (!searchTerm) return board.rows;
    return board.rows.filter(row => 
      row.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      Object.values(row.cells).some((cell: CellValue) => 
        String(cell.value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [board.rows, searchTerm]);

  const addRow = () => {
    const newRow: Row = {
      id: crypto.randomUUID(),
      displayName: `New Person ${board.rows.length + 1}`,
      cells: {},
      orderIndex: board.rows.length,
    };
    onUpdate({ ...board, rows: [...board.rows, newRow] });
  };

  const deleteRow = (rowId: string) => {
    if (!confirm("Are you sure you want to delete this person?")) return;
    const newRows = board.rows.filter(r => r.id !== rowId);
    onUpdate({ ...board, rows: newRows });
  };

  const addField = (title: string, type: FieldType, options?: string[]) => {
    const newField: Field = {
      id: crypto.randomUUID(),
      title,
      type,
      options,
      orderIndex: board.fields.length,
    };
    onUpdate({ ...board, fields: [...board.fields, newField] });
    setIsAddFieldOpen(false);
  };

  const renameField = (fieldId: string, newTitle: string) => {
    const newFields = board.fields.map(f => f.id === fieldId ? { ...f, title: newTitle } : f);
    onUpdate({ ...board, fields: newFields });
  };

  const deleteField = (fieldId: string) => {
    if (!confirm("Delete this column and all its data? This cannot be undone.")) return;
    const newFields = board.fields.filter(f => f.id !== fieldId);
    const newRows = board.rows.map(row => {
      const { [fieldId]: _, ...remainingCells } = row.cells;
      return { ...row, cells: remainingCells };
    });
    onUpdate({ ...board, fields: newFields, rows: newRows });
  };

  const updateCellValue = (rowId: string, fieldId: string, value: any) => {
    const newRows = board.rows.map(row => {
      if (row.id === rowId) {
        return {
          ...row,
          cells: {
            ...row.cells,
            [fieldId]: { value }
          }
        };
      }
      return row;
    });
    onUpdate({ ...board, rows: newRows });
  };

  const exportCSV = () => {
    csvHelper.exportBoard(board);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const imported = csvHelper.importBoard(text, board);
        if (imported) onUpdate(imported);
      };
      reader.readAsText(file);
    }
  };

  const updateBoardTitle = (title: string) => {
    onUpdate({ ...board, title });
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-gray-50 overflow-hidden">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.location.hash = '/'}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <div>
            <input 
              type="text"
              value={board.title}
              onChange={(e) => updateBoardTitle(e.target.value)}
              className="text-lg font-bold bg-transparent border-none focus:ring-0 p-0 w-full max-w-[150px] sm:max-w-xs focus:bg-gray-50 rounded"
            />
            <p className="text-xs text-gray-400">Public Board • {board.rows.length} rows</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={exportCSV}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
            <i className="fa-solid fa-download"></i> Export
          </button>
          <label className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors cursor-pointer">
            <i className="fa-solid fa-upload"></i> Import
            <input type="file" className="hidden" accept=".csv" onChange={handleFileUpload} />
          </label>
          <button 
            onClick={() => setIsAddFieldOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <i className="fa-solid fa-plus"></i> Column
          </button>
        </div>
      </header>

      {/* Search and Banner */}
      <div className="p-4 bg-white border-b border-gray-100 flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input 
            type="text" 
            placeholder="Search people or cells..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-100 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="bg-yellow-50 text-yellow-800 text-[10px] sm:text-xs px-3 py-1 rounded-full border border-yellow-200">
           Public board: Anyone with the link can view and edit.
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto relative no-scrollbar">
        {/* Wide Screen Grid View */}
        <div className="hidden lg:block min-w-max bg-white">
          <div className="flex sticky top-0 z-40 bg-gray-100 border-b border-gray-200">
            <div className="w-12 border-r border-gray-200 flex items-center justify-center font-bold text-gray-400">#</div>
            <div className="w-64 px-4 py-3 border-r border-gray-200 font-bold text-gray-700 uppercase tracking-wider text-xs">Name</div>
            {board.fields.map(field => (
              <ColumnHeader 
                key={field.id} 
                field={field} 
                onRename={(newTitle) => renameField(field.id, newTitle)}
                onDelete={() => deleteField(field.id)}
              />
            ))}
            <div className="flex-1 bg-gray-50 border-b border-gray-200"></div>
          </div>

          <div className="flex flex-col">
            {filteredRows.map((row, idx) => (
              <div key={row.id} className="flex border-b border-gray-100 hover:bg-indigo-50/30 transition-colors group">
                <div className="w-12 border-r border-gray-100 flex items-center justify-center text-gray-400 text-xs relative">
                  <span className="group-hover:hidden">{idx + 1}</span>
                  <button 
                    onClick={() => deleteRow(row.id)}
                    className="hidden group-hover:flex items-center justify-center text-red-400 hover:text-red-600 w-full h-full"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </div>
                <div className="w-64 px-4 py-3 border-r border-gray-100 flex items-center">
                   <input 
                    type="text"
                    value={row.displayName}
                    onChange={(e) => {
                        const newRows = board.rows.map(r => r.id === row.id ? {...r, displayName: e.target.value} : r);
                        onUpdate({...board, rows: newRows});
                    }}
                    className="bg-transparent border-none focus:ring-2 focus:ring-indigo-200 w-full font-medium rounded"
                   />
                </div>
                {board.fields.map(field => (
                  <div key={field.id} className="w-48 border-r border-gray-100 flex items-center p-0 overflow-hidden">
                    <RowItem 
                      rowId={row.id} 
                      field={field} 
                      value={row.cells[field.id]?.value} 
                      onUpdate={(val) => updateCellValue(row.id, field.id, val)}
                      view="grid"
                    />
                  </div>
                ))}
                <div className="flex-1"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile/Tablet Card View */}
        <div className="lg:hidden p-4 space-y-4 pb-24">
          {filteredRows.map((row, idx) => (
            <div key={row.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-xs text-gray-400 font-bold">#{idx+1}</span>
                  <input 
                    type="text"
                    value={row.displayName}
                    onChange={(e) => {
                        const newRows = board.rows.map(r => r.id === row.id ? {...r, displayName: e.target.value} : r);
                        onUpdate({...board, rows: newRows});
                    }}
                    className="bg-transparent border-none focus:ring-0 font-bold text-gray-800 w-full"
                   />
                </div>
                <button 
                  onClick={() => deleteRow(row.id)}
                  className="text-gray-300 hover:text-red-500 p-2 transition-colors"
                >
                   <i className="fa-solid fa-trash-can"></i>
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {board.fields.map(field => (
                  <div key={field.id} className="flex flex-col p-4 relative">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{field.title}</label>
                      <button 
                        onClick={() => {
                          const newTitle = prompt("Rename column:", field.title);
                          if (newTitle) renameField(field.id, newTitle);
                        }}
                        className="text-[10px] text-indigo-400 font-bold"
                      >
                        Edit
                      </button>
                    </div>
                    <RowItem 
                      rowId={row.id} 
                      field={field} 
                      value={row.cells[field.id]?.value} 
                      onUpdate={(val) => updateCellValue(row.id, field.id, val)}
                      view="card"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
          {filteredRows.length === 0 && (
            <div className="py-20 text-center text-gray-400">
              <i className="fa-solid fa-ghost text-4xl mb-3 opacity-20"></i>
              <p>No matches found</p>
            </div>
          )}
        </div>
      </main>

      {/* Floating Action Button (FAB) */}
      <button 
        onClick={addRow}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all active:scale-95 z-50"
      >
        <i className="fa-solid fa-user-plus text-xl"></i>
      </button>

      {/* Footer (Mobile sticky) */}
      <footer className="lg:hidden bg-white border-t border-gray-200 p-3 flex justify-around">
          <button onClick={exportCSV} className="flex flex-col items-center text-gray-500">
            <i className="fa-solid fa-file-csv text-lg"></i>
            <span className="text-[10px] mt-1">Export</span>
          </button>
          <label className="flex flex-col items-center text-gray-500 cursor-pointer">
            <i className="fa-solid fa-file-import text-lg"></i>
            <span className="text-[10px] mt-1">Import</span>
            <input type="file" className="hidden" accept=".csv" onChange={handleFileUpload} />
          </label>
          <button onClick={() => setIsAddFieldOpen(true)} className="flex flex-col items-center text-indigo-600">
            <i className="fa-solid fa-columns text-lg"></i>
            <span className="text-[10px] mt-1">Fields</span>
          </button>
      </footer>

      {isAddFieldOpen && (
        <AddFieldDialog onClose={() => setIsAddFieldOpen(false)} onAdd={addField} />
      )}
    </div>
  );
};

export default BoardView;
