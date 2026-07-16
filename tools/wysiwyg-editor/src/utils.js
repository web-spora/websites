/**
 * Utility functions for WYSIWYG Editor
 */

export const $ = (selector, context = document) => context.querySelector(selector);
export const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

export function createElement(tag, attributes = {}, children = []) {
  const el = document.createElement(tag);
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'class') el.className = value;
    else if (key === 'style' && typeof value === 'object') Object.assign(el.style, value);
    else if (key.startsWith('on') && typeof value === 'function') el.addEventListener(key.slice(2).toLowerCase(), value);
    else el.setAttribute(key, value);
  });
  children.forEach(child => {
    if (typeof child === 'string') el.appendChild(document.createTextNode(child));
    else if (child instanceof Node) el.appendChild(child);
  });
  return el;
}

export function getSelectionRange() {
  const sel = window.getSelection();
  if (!sel.rangeCount) return null;
  return sel.getRangeAt(0).cloneRange();
}

export function saveSelection() {
  const sel = window.getSelection();
  if (!sel.rangeCount) return null;
  const range = sel.getRangeAt(0).cloneRange();
  return { startContainer: range.startContainer, startOffset: range.startOffset, endContainer: range.endContainer, endOffset: range.endOffset };
}

export function restoreSelection(saved) {
  if (!saved) return;
  const sel = window.getSelection();
  const range = document.createRange();
  try {
    range.setStart(saved.startContainer, saved.startOffset);
    range.setEnd(saved.endContainer, saved.endOffset);
    sel.removeAllRanges();
    sel.addRange(range);
  } catch (e) {
    console.warn('Could not restore selection', e);
  }
}

export function getSelectionRect() {
  const sel = window.getSelection();
  if (!sel.rangeCount) return null;
  const range = sel.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) {
    const span = document.createElement('span');
    range.insertNode(span);
    const r = span.getBoundingClientRect();
    span.remove();
    return r;
  }
  return rect;
}

export function isSelectionCollapsed() {
  const sel = window.getSelection();
  return !sel.rangeCount || sel.isCollapsed;
}

export function getSelectedText() {
  const sel = window.getSelection();
  return sel.toString();
}

export function wrapSelection(tag, attributes = {}) {
  const sel = window.getSelection();
  if (!sel.rangeCount || sel.isCollapsed) return;
  const range = sel.getRangeAt(0);
  const wrapper = document.createElement(tag);
  Object.entries(attributes).forEach(([k, v]) => wrapper.setAttribute(k, v));
  try {
    range.surroundContents(wrapper);
  } catch (e) {
    const frag = range.extractContents();
    wrapper.appendChild(frag);
    range.insertNode(wrapper);
  }
  sel.removeAllRanges();
  sel.addRange(range);
}

export function unwrapSelection(tag) {
  const sel = window.getSelection();
  if (!sel.rangeCount) return;
  const range = sel.getRangeAt(0);
  const ancestor = findAncestor(range.commonAncestorContainer, tag);
  if (ancestor) {
    const frag = document.createDocumentFragment();
    while (ancestor.firstChild) frag.appendChild(ancestor.firstChild);
    ancestor.parentNode.replaceChild(frag, ancestor);
  }
}

export function findAncestor(node, tagName) {
  while (node && node !== document.body) {
    if (node.nodeType === Node.ELEMENT_NODE && node.tagName.toLowerCase() === tagName.toLowerCase()) {
      return node;
    }
    node = node.parentNode;
  }
  return null;
}

export function getClosestBlock(node) {
  const blocks = ['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'blockquote', 'pre', 'td', 'th'];
  while (node && node !== document.body) {
    if (node.nodeType === Node.ELEMENT_NODE && blocks.includes(node.tagName.toLowerCase())) {
      return node;
    }
    node = node.parentNode;
  }
  return null;
}

export function debounce(fn, delay = 300) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export function throttle(fn, limit = 100) {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

export function generateId(prefix = 'wysiwyg') {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function parseHtml(html) {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content;
}

export function serializeNode(node) {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent;
  if (node.nodeType !== Node.ELEMENT_NODE) return '';
  const clone = node.cloneNode(true);
  return clone.outerHTML;
}

export function isEmptyNode(node) {
  if (node.nodeType === Node.TEXT_NODE) return !node.textContent.trim();
  if (node.nodeType !== Node.ELEMENT_NODE) return true;
  const voidElements = ['br', 'hr', 'img', 'input', 'meta', 'link'];
  if (voidElements.includes(node.tagName.toLowerCase())) return false;
  return !node.textContent.trim() && !node.querySelector('img, video, iframe, table');
}

export function normalizeWhitespace(text) {
  return text.replace(/\s+/g, ' ').trim();
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function getCaretPosition(element) {
  const sel = window.getSelection();
  if (!sel.rangeCount || sel.anchorNode !== element && !element.contains(sel.anchorNode)) return null;
  return sel.anchorOffset;
}

export function setCaretPosition(element, offset) {
  const range = document.createRange();
  const sel = window.getSelection();
  const textNode = findTextNode(element);
  if (textNode) {
    range.setStart(textNode, Math.min(offset, textNode.textContent.length));
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

function findTextNode(element) {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
  let node;
  while ((node = walker.nextNode())) {
    if (node.textContent.trim()) return node;
  }
  return null;
}