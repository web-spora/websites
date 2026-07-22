import { wrapSelection, unwrapSelection, findAncestor } from './utils.js';

export const EXEC_COMMANDS = {
  bold: 'bold',
  italic: 'italic',
  underline: 'underline',
  strikethrough: 'strikeThrough',
  superscript: 'superscript',
  subscript: 'subscript',
  removeFormat: 'removeFormat',
  indent: 'indent',
  outdent: 'outdent',
  undo: 'undo',
  redo: 'redo',
};

export const headingLevels = {
  paragraph: { tag: 'p', label: 'Параграф' },
  h1: { tag: 'h1', label: 'Заголовок 1' },
  h2: { tag: 'h2', label: 'Заголовок 2' },
  h3: { tag: 'h3', label: 'Заголовок 3' },
  h4: { tag: 'h4', label: 'Заголовок 4' },
  h5: { tag: 'h5', label: 'Заголовок 5' },
  h6: { tag: 'h6', label: 'Заголовок 6' },
};

export function execFormat(command, value = null) {
  document.execCommand(command, false, value);
}

export function queryFormat(command) {
  return document.queryCommandState(command);
}

export function toggleHeading(headingType) {
  const { tag } = headingLevels[headingType] || headingLevels.paragraph;
  const sel = window.getSelection();
  if (!sel.rangeCount) return;

  const range = sel.getRangeAt(0);
  let block = range.commonAncestorContainer;
  if (block.nodeType === Node.TEXT_NODE) block = block.parentNode;

  const currentBlock = findAncestor(block, 'p') || findAncestor(block, 'h1') ||
    findAncestor(block, 'h2') || findAncestor(block, 'h3') || findAncestor(block, 'h4') ||
    findAncestor(block, 'h5') || findAncestor(block, 'h6');

  if (currentBlock && ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(currentBlock.tagName.toLowerCase())) {
    if (currentBlock.tagName.toLowerCase() === tag) {
      const p = document.createElement('p');
      const parent = currentBlock.parentNode;
      while (currentBlock.firstChild) p.appendChild(currentBlock.firstChild);
      parent.replaceChild(p, currentBlock);
    } else {
      const newBlock = document.createElement(tag);
      newBlock.innerHTML = currentBlock.innerHTML;
      currentBlock.parentNode.replaceChild(newBlock, currentBlock);
    }
  } else if (currentBlock && currentBlock.tagName.toLowerCase() === 'p') {
    if (tag === 'p') return;
    const newBlock = document.createElement(tag);
    newBlock.innerHTML = currentBlock.innerHTML;
    currentBlock.parentNode.replaceChild(newBlock, currentBlock);
  } else {
    const selection = sel.getRangeAt(0);
    const newBlock = document.createElement(tag);
    const fragment = selection.extractContents();
    newBlock.appendChild(fragment);
    selection.insertNode(newBlock);
    selection.setStartAfter(newBlock);
    selection.collapse(true);
  }
}

export function toggleBlockquote() {
  const sel = window.getSelection();
  if (!sel.rangeCount) return;
  const block = sel.anchorNode;
  let current = block.nodeType === Node.TEXT_NODE ? block.parentNode : block;

  const bq = findAncestor(current, 'blockquote');
  if (bq) {
    const p = document.createElement('p');
    while (bq.firstChild) p.appendChild(bq.firstChild);
    bq.parentNode.replaceChild(p, bq);
    return;
  }

  execFormat('formatBlock', 'blockquote');
}

export function toggleCodeBlock() {
  const sel = window.getSelection();
  if (!sel.rangeCount) return;
  const block = sel.anchorNode;
  let current = block.nodeType === Node.TEXT_NODE ? block.parentNode : block;

  const code = findAncestor(current, 'pre');
  if (code) {
    const p = document.createElement('p');
    while (code.firstChild) p.appendChild(code.firstChild);
    code.parentNode.replaceChild(p, code);
    return;
  }

  const range = sel.getRangeAt(0);
  const pre = document.createElement('pre');
  const codeEl = document.createElement('code');
  const fragment = range.extractContents();
  codeEl.appendChild(fragment);
  pre.appendChild(codeEl);
  range.insertNode(pre);
  range.setStartAfter(pre);
  range.collapse(true);
}

export function toggleUnorderedList() {
  execFormat('insertUnorderedList');
}

export function toggleOrderedList() {
  execFormat('insertOrderedList');
}

export function insertHorizontalRule() {
  execFormat('insertHorizontalRule');
}

export function toggleInlineCode() {
  const sel = window.getSelection();
  if (!sel.rangeCount || sel.isCollapsed) return;
  const range = sel.getRangeAt(0);
  const code = findAncestor(range.commonAncestorContainer, 'code');
  if (code && code.parentNode.tagName.toLowerCase() !== 'pre') {
    const parent = code.parentNode;
    const text = document.createTextNode(code.textContent);
    parent.replaceChild(text, code);
  } else {
    wrapSelection('code');
  }
}

export function queryHeadingState() {
  const sel = window.getSelection();
  if (!sel.rangeCount) return 'paragraph';
  let node = sel.anchorNode;
  if (node.nodeType === Node.TEXT_NODE) node = node.parentNode;
  const block = findAncestor(node, 'p') || findAncestor(node, 'h1') ||
    findAncestor(node, 'h2') || findAncestor(node, 'h3') ||
    findAncestor(node, 'h4') || findAncestor(node, 'h5') || findAncestor(node, 'h6');
  if (block && ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(block.tagName.toLowerCase())) {
    return block.tagName.toLowerCase();
  }
  return 'paragraph';
}

export function queryListState() {
  return {
    ul: queryFormat('insertUnorderedList'),
    ol: queryFormat('insertOrderedList'),
  };
}

export function queryBlockState() {
  return {
    blockquote: !!findAncestor(window.getSelection().anchorNode, 'blockquote'),
    code: !!findAncestor(window.getSelection().anchorNode, 'pre'),
    inlineCode: !!findAncestor(window.getSelection().anchorNode, 'code'),
  };
}