import * as XLSX from 'xlsx';

/**
 * Trims worksheet dimensions to actual non-empty cells.
 * Fixes crashes/freezes on Excel files with ghost/formatted blank rows (e.g. 1M+ rows).
 */
export function clampWorksheetRange(ws) {
  if (!ws || !ws['!ref']) return;
  const range = XLSX.utils.decode_range(ws['!ref']);
  let maxRow = 0;
  let maxCol = 0;

  for (const key in ws) {
    if (key.charCodeAt(0) === 33) continue; // Skip keys starting with '!'
    const cell = ws[key];
    if (!cell || cell.t === 'z' || cell.v === undefined || cell.v === null || cell.v === '') continue;
    const decoded = XLSX.utils.decode_cell(key);
    if (decoded.r > maxRow) maxRow = decoded.r;
    if (decoded.c > maxCol) maxCol = decoded.c;
  }

  range.e.r = Math.min(range.e.r, maxRow);
  if (maxCol > 0) {
    range.e.c = Math.min(range.e.c, maxCol);
  }
  ws['!ref'] = XLSX.utils.encode_range(range);
}

