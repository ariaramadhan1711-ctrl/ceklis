
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import BoardView from './components/BoardView';
import { storageService } from './services/storageService';
import { Board } from './types';

const Dashboard: React.FC = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setBoards(storageService.getAllBoards());
  }, []);

  const createBoard = () => {
    const newBoard = storageService.createBoard("New Project Board");
    setBoards(prev => [newBoard, ...prev]);
    navigate(`/board/${newBoard.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-indigo-600 mb-2">CheckGrid</h1>
        <p className="text-gray-600">Dynamic, mobile-first public checklists and spreadsheets.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button 
          onClick={createBoard}
          className="flex flex-col items-center justify-center p-8 bg-white border-2 border-dashed border-indigo-300 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
        >
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-3 group-hover:scale-110 transition-transform">
            <i className="fa-solid fa-plus text-xl"></i>
          </div>
          <span className="font-semibold text-indigo-700">Create New Board</span>
        </button>

        {boards.map(board => (
          <div 
            key={board.id} 
            className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between"
            onClick={() => navigate(`/board/${board.id}`)}
          >
            <div>
              <h3 className="font-bold text-lg mb-1">{board.title}</h3>
              <p className="text-sm text-gray-500">{board.rows.length} rows • {board.fields.length} columns</p>
            </div>
            <div className="mt-4 flex items-center text-indigo-600 text-sm font-medium">
              Open Board <i className="fa-solid fa-arrow-right ml-2"></i>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const BoardWrapper: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const [board, setBoard] = useState<Board | null>(null);

  useEffect(() => {
    if (boardId) {
      const data = storageService.getBoard(boardId);
      if (data) {
        setBoard(data);
      } else {
        navigate('/');
      }
    }
  }, [boardId, navigate]);

  const onUpdate = useCallback((updatedBoard: Board) => {
    storageService.saveBoard(updatedBoard);
    setBoard({ ...updatedBoard });
  }, []);

  if (!board) return <div className="p-10 text-center">Loading board...</div>;

  return <BoardView board={board} onUpdate={onUpdate} />;
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/board/:boardId" element={<BoardWrapper />} />
        </Routes>
      </div>
    </HashRouter>
  );
};

export default App;
