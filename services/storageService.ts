
import { Board, FieldType, Field } from '../types';

const BOARDS_KEY = 'checkgrid_boards_list';

export const storageService = {
  getAllBoards: (): Board[] => {
    const data = localStorage.getItem(BOARDS_KEY);
    return data ? JSON.parse(data) : [];
  },

  getBoard: (id: string): Board | null => {
    const boards = storageService.getAllBoards();
    return boards.find(b => b.id === id) || null;
  },

  saveBoard: (board: Board) => {
    const boards = storageService.getAllBoards();
    const index = boards.findIndex(b => b.id === board.id);
    if (index > -1) {
      boards[index] = { ...board, updatedAt: Date.now() };
    } else {
      boards.push({ ...board, updatedAt: Date.now() });
    }
    localStorage.setItem(BOARDS_KEY, JSON.stringify(boards));
  },

  createBoard: (title: string): Board => {
    const defaultFields: Field[] = [
      { id: crypto.randomUUID(), title: 'Done', type: FieldType.CHECKBOX, orderIndex: 0 },
      { id: crypto.randomUUID(), title: 'Notes', type: FieldType.TEXT, orderIndex: 1 }
    ];

    const newBoard: Board = {
      id: crypto.randomUUID(),
      title,
      slug: title.toLowerCase().replace(/\s+/g, '-'),
      isPublic: true,
      fields: defaultFields,
      rows: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    storageService.saveBoard(newBoard);
    return newBoard;
  }
};
