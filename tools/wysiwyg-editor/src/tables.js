import { createElement, getSelectionRange, saveSelection, restoreSelection } from './utils.js';

export function insertTable(rows = 3, cols = 3) {
  const sel = window.getSelection();
  if (!sel.rangeCount) return;
  const range = sel.getRangeAt(0);

  const table = document.createElement('table');

  for (let r = 0; r < rows; r++) {
    const tr = document.createElement('tr');
    for (let c = 0; c < cols; c++) {
      const tag = r === 0 ? 'th' : 'td';
      const cell = document.createElement(tag);
      cell.innerHTML = '&nbsp;';
      tr.appendChild(cell);
    }
    table.appendChild(tr);
  }

  range.deleteContents();
  range.insertNode(table);
  range.setStartAfter(table);
  range.collapse(true);
}

function getSelectedCells() {
  const sel = window.getSelection();
  if (!sel.rangeCount) return [];
  const range = sel.getRangeAt(0);
  const table = getContainingTable(range.commonAncestorContainer);
  if (!table) return [];

  const cells = [];
  if (range.startContainer.nodeType === Node.TEXT_NODE) {
    const cell = range.startContainer.parentNode.closest?.('td, th');
    if (cell) cells.push(cell);
  }
  return cells;
}

function getContainingTable(node) {
  while (node && node !== document.body) {
    if (node.nodeType === Node.ELEMENT_NODE && node.tagName.toLowerCase() === 'table') {
      return node;
    }
    node = node.parentNode;
  }
  return null;
}

function getCurrentCell() {
  const sel = window.getSelection();
  if (!sel.rangeCount) return null;
  let node = sel.anchorNode;
  if (node.nodeType === Node.TEXT_NODE) node = node.parentNode;
  return node.closest?.('td, th') || null;
}

function getCurrentTable() {
  const cell = getCurrentCell();
  if (!cell) return null;
  return cell.closest('table');
}

export function addRow(after = true) {
  const cell = getCurrentCell();
  if (!cell) return;
  const table = cell.closest('table');
  const currentRow = cell.closest('tr');
  const cols = table.querySelectorAll('tr').length > 0 ?
    table.querySelector('tr').children.length : cell.parentNode.children.length;

  const newRow = document.createElement('tr');
  for (let i = 0; i < cols; i++) {
    const newCell = document.createElement('td');
    newCell.innerHTML = '&nbsp;';
    newRow.appendChild(newCell);
  }

  if (after) {
    currentRow.parentNode.insertBefore(newRow, currentRow.nextSibling);
  } else {
    currentRow.parentNode.insertBefore(newRow, currentRow);
  }
}

export function addColumn(after = true) {
  const cell = getCurrentCell();
  if (!cell) return;
  const table = cell.closest('table');
  const cellIndex = Array.from(cell.parentNode.children).indexOf(cell);

  table.querySelectorAll('tr').forEach(tr => {
    const existingCells = tr.querySelectorAll('td, th');
    let targetIndex = cellIndex;

    if (targetIndex > existingCells.length - 1) targetIndex = existingCells.length - 1;

    const tag = tr.closest('thead') ? 'th' : (existingCells[targetIndex]?.tagName.toLowerCase() || 'td');
    const newCell = document.createElement(tag);
    newCell.innerHTML = '&nbsp;';

    if (after) {
      existingCells[targetIndex].parentNode.insertBefore(newCell, existingCells[targetIndex].nextSibling || null);
    } else {
      existingCells[targetIndex].parentNode.insertBefore(newCell, existingCells[targetIndex]);
    }
  });
}

export function removeRow() {
  const cell = getCurrentCell();
  if (!cell) return;
  const row = cell.closest('tr');
  const table = cell.closest('table');

  if (table.querySelectorAll('tr').length <= 1) {
    removeTable();
    return;
  }

  row.remove();
}

export function removeColumn() {
  const cell = getCurrentCell();
  if (!cell) return;
  const table = cell.closest('table');
  const cellIndex = Array.from(cell.parentNode.children).indexOf(cell);

  const maxCols = Math.max(...Array.from(table.querySelectorAll('tr'), tr => tr.querySelectorAll('td, th').length));
  if (maxCols <= 1) {
    removeTable();
    return;
  }

  table.querySelectorAll('tr').forEach(tr => {
    const cells = tr.querySelectorAll('td, th');
    if (cells[cellIndex]) cells[cellIndex].remove();
  });
}

export function removeTable() {
  const table = getCurrentTable();
  if (!table) return;
  const p = document.createElement('p');
  p.innerHTML = '&nbsp;';
  table.parentNode.replaceChild(p, table);
}

export function mergeCells() {
  const sel = window.getSelection();
  if (!sel.rangeCount) return;
  const range = sel.getRangeAt(0);
  const table = getContainingTable(range.commonAncestorContainer);
  if (!table) return;

  const cells = [];
  const walker = document.createTreeWalker(
    range.commonAncestorContainer,
    NodeFilter.SHOW_ELEMENT,
    {
      acceptNode: (node) => {
        if (node.tagName === 'TD' || node.tagName === 'TH') {
          if (table.contains(node)) return NodeFilter.FILTER_ACCEPT;
        }
        return NodeFilter.FILTER_SKIP;
      }
    }
  );

  let found;
  while ((found = walker.nextNode())) {
    if (!cells.includes(found)) cells.push(found);
  }

  if (cells.length < 2) return;

  let minRow = Infinity, maxRow = -Infinity;
  let minCol = Infinity, maxCol = -Infinity;

  cells.forEach(cell => {
    const tr = cell.closest('tr');
    const tbody = tr.closest('table');
    const rowIndex = Array.from(tbody.querySelectorAll('tr')).indexOf(tr);
    const colIndex = Array.from(tr.children).indexOf(cell);
    minRow = Math.min(minRow, rowIndex);
    maxRow = Math.max(maxRow, rowIndex);
    minCol = Math.min(minCol, colIndex);
    maxCol = Math.max(maxCol, colIndex);
  });

  const firstCell = table.querySelectorAll('tr')[minRow].children[minCol];
  let mergedContent = '';

  cells.forEach(cell => {
    if (cell !== firstCell) {
      mergedContent += cell.innerHTML;
    }
  });

  firstCell.innerHTML += mergedContent;
  firstCell.setAttribute('colspan', maxCol - minCol + 1);
  firstCell.setAttribute('rowspan', maxRow - minRow + 1);

  cells.forEach(cell => {
    if (cell !== firstCell) cell.remove();
  });
}

export function splitCell() {
  const cell = getCurrentCell();
  if (!cell) return;
  const colspan = parseInt(cell.getAttribute('colspan') || '1');
  const rowspan = parseInt(cell.getAttribute('rowspan') || '1');

  if (colspan === 1 && rowspan === 1) return;

  cell.removeAttribute('colspan');
  cell.removeAttribute('rowspan');

  if (colspan > 1) {
    const tr = cell.closest('tr');
    const cellIndex = Array.from(tr.children).indexOf(cell);
    for (let i = 1; i < colspan; i++) {
      const newCell = document.createElement(cell.tagName);
      newCell.innerHTML = '&nbsp;';
      tr.insertBefore(newCell, tr.children[cellIndex + i] || null);
    }
  }
}

export function getTableToolbarHTML() {
  return [
    { label: 'Добавить строку сверху', action: 'table-row-before', icon: '⬆' },
    { label: 'Добавить строку снизу', action: 'table-row-after', icon: '⬇' },
    { label: 'Добавить колонку слева', action: 'table-col-before', icon: '⬅' },
    { label: 'Добавить колонку справа', action: 'table-col-after', icon: '➡' },
    { label: 'Удалить строку', action: 'table-row-remove', icon: '✕' },
    { label: 'Удалить колонку', action: 'table-col-remove', icon: '✕' },
    { label: 'Объединить ячейки', action: 'table-merge', icon: '⊞' },
    { label: 'Разделить ячейку', action: 'table-split', icon: '⊟' },
    { label: 'Удалить таблицу', action: 'table-remove', icon: '🗑' },
  ];
}

export function handleTableAction(action) {
  switch (action) {
    case 'table-row-before': addRow(false); break;
    case 'table-row-after': addRow(true); break;
    case 'table-col-before': addColumn(false); break;
    case 'table-col-after': addColumn(true); break;
    case 'table-row-remove': removeRow(); break;
    case 'table-col-remove': removeColumn(); break;
    case 'table-merge': mergeCells(); break;
    case 'table-split': splitCell(); break;
    case 'table-remove': removeTable(); break;
  }
}

export function isInsideTable() {
  return !!getCurrentCell();
}