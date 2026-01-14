
import { Board, Row, Field, FieldType } from '../types';

export const csvHelper = {
  exportBoard: (board: Board) => {
    const headers = ['Name', ...board.fields.map(f => f.title)].join(',');
    
    const rows = board.rows.map(row => {
      const rowData = [
        `"${row.displayName}"`,
        ...board.fields.map(field => {
          const val = row.cells[field.id]?.value;
          if (field.type === FieldType.CHECKBOX) return val ? 'TRUE' : 'FALSE';
          if (Array.isArray(val)) return `"${val.join('; ')}"`;
          return `"${val || ''}"`;
        })
      ];
      return rowData.join(',');
    });

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${board.slug}-export.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  importBoard: (csvText: string, currentBoard: Board): Board | null => {
    try {
      const lines = csvText.split(/\r?\n/).filter(line => line.trim());
      if (lines.length === 0) return null;

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const dataRows = lines.slice(1);

      const newRows: Row[] = dataRows.map((line, idx) => {
        const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/"/g, ''));
        const displayName = values[0] || `Imported Row ${idx + 1}`;
        const cells: Record<string, { value: any }> = {};

        currentBoard.fields.forEach((field, fIdx) => {
          const val = values[fIdx + 1];
          if (val === undefined) return;

          let processedVal: any = val;
          if (field.type === FieldType.CHECKBOX) processedVal = val.toUpperCase() === 'TRUE';
          if (field.type === FieldType.MULTI_SELECT) processedVal = val.split(';').map(s => s.trim()).filter(Boolean);

          cells[field.id] = { value: processedVal };
        });

        return {
          id: crypto.randomUUID(),
          displayName,
          cells,
          orderIndex: currentBoard.rows.length + idx,
        };
      });

      return {
        ...currentBoard,
        rows: [...currentBoard.rows, ...newRows],
        updatedAt: Date.now()
      };
    } catch (err) {
      console.error("CSV Import Error:", err);
      alert("Failed to parse CSV. Make sure it's a valid CSV format.");
      return null;
    }
  }
};
