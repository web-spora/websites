import { createElement, debounce, saveSelection, restoreSelection } from './utils.js';
import { Toolbar } from './toolbar.js';
import { sanitizeOnPaste } from './sanitizer.js';
import { EditorAPI } from './api.js';
import { ReadOnlyMode } from './readOnly.js';
import { EXEC_COMMANDS, execFormat } from './commands.js';

export class WYSIWYGEditor extends EventTarget {
  constructor(selectorOrEl, options = {}) {
    super();

    const root = typeof selectorOrEl === 'string'
      ? document.querySelector(selectorOrEl)
      : selectorOrEl;

    if (!root) throw new Error('Editor container not found');

    this._options = {
      placeholder: options.placeholder || 'Начните вводить текст...',
      minHeight: options.minHeight || '200px',
      maxHeight: options.maxHeight || null,
      readOnly: options.readOnly || false,
      ...options,
    };

    this._root = root;
    this._initDOM();
    this._initToolbar();
    this._initAPI();
    this._initReadOnly();
    this._bindEvents();
    this._initKeyboardShortcuts();

    if (this._options.readOnly) {
      this._readOnly.enable();
    }

    this.emit('ready', { editor: this });
  }

  _initDOM() {
    this._container = createElement('div', { class: 'wysiwyg-wrapper' });

    this._editor = createElement('div', {
      class: 'wysiwyg-editor',
      contenteditable: 'true',
      role: 'textbox',
      'aria-multiline': 'true',
      'aria-label': 'Редактор текста',
    });

    this._editor.innerHTML = this._options.initialContent || '<p><br></p>';

    this._placeholder = createElement('div', { class: 'wysiwyg-placeholder' });
    this._placeholder.textContent = this._options.placeholder;

    this._container.appendChild(this._placeholder);
    this._container.appendChild(this._editor);
    this._root.appendChild(this._container);

    if (this._options.minHeight) {
      this._editor.style.minHeight = this._options.minHeight;
    }
    if (this._options.maxHeight) {
      this._editor.style.maxHeight = this._options.maxHeight;
      this._editor.style.overflowY = 'auto';
    }
  }

  _initToolbar() {
    this._toolbar = new Toolbar(this);
    this._toolbar.init();
  }

  _initAPI() {
    this.api = new EditorAPI(this);
  }

  _initReadOnly() {
    this._readOnly = new ReadOnlyMode(this);
  }

  _bindEvents() {
    const editor = this._editor;

    editor.addEventListener('input', debounce(() => {
      this._updatePlaceholder();
      this.emit('contentChanged', { html: this.api.getContent() });
    }, 200));

    editor.addEventListener('keyup', () => {
      this._toolbar.onSelectionChange();
    });

    editor.addEventListener('mouseup', () => {
      this._toolbar.onSelectionChange();
    });

    editor.addEventListener('blur', () => {
      setTimeout(() => {
        const sel = window.getSelection();
        if (!sel.rangeCount || !editor.contains(sel.anchorNode)) {
          this._toolbar.hide();
        }
      }, 200);
    });

    editor.addEventListener('focus', () => {
      this._updatePlaceholder();
    });

    editor.addEventListener('paste', (e) => {
      this._handlePaste(e);
    });

    editor.addEventListener('drop', (e) => {
      this._handleDrop(e);
    });

    document.addEventListener('scroll', () => {
      this._toolbar.onScroll();
    }, { passive: true });

    document.addEventListener('selectionchange', () => {
      if (document.activeElement === editor) {
        this._toolbar.onSelectionChange();
      }
    });
  }

  _initKeyboardShortcuts() {
    this._editor.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        execFormat(EXEC_COMMANDS.indent);
      }

      this._toolbar._closeDropdown();
    });
  }

  _handlePaste(e) {
    e.preventDefault();

    const clipboardData = e.clipboardData || window.clipboardData;
    if (!clipboardData) return;

    let html = '';

    const items = Array.from(clipboardData.items);
    const imageItem = items.find(item => item.type.startsWith('image/'));

    if (imageItem) {
      const file = imageItem.getAsFile();
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const saved = saveSelection();
          restoreSelection(saved);
          const img = document.createElement('img');
          img.src = ev.target.result;
          img.alt = 'Вставленное изображение';
          img.loading = 'lazy';
          const sel = window.getSelection();
          if (sel.rangeCount) {
            const range = sel.getRangeAt(0);
            range.deleteContents();
            range.insertNode(img);
            range.setStartAfter(img);
            range.collapse(true);
            this.emit('contentChanged', { html: this.api.getContent() });
          }
        };
        reader.readAsDataURL(file);
      }
      return;
    }

    try {
      html = clipboardData.getData('text/html');
    } catch (err) {
      // fallback
    }

    if (!html) {
      html = clipboardData.getData('text/plain');
      if (html) {
        html = html.replace(/\n/g, '<br>');
        html = `<p>${html}</p>`;
      }
    }

    if (html) {
      const saved = saveSelection();
      const cleaned = sanitizeOnPaste(html);
      restoreSelection(saved);

      const sel = window.getSelection();
      if (sel.rangeCount) {
        const range = sel.getRangeAt(0);
        const template = document.createElement('template');
        template.innerHTML = cleaned.trim();
        const fragment = document.createDocumentFragment();
        let child;
        while ((child = template.content.firstChild)) {
          fragment.appendChild(child);
        }
        range.deleteContents();
        range.insertNode(fragment);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
        this.emit('contentChanged', { html: this.api.getContent() });
      }
    }
  }

  _handleDrop(e) {
    e.preventDefault();
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            const img = document.createElement('img');
            img.src = ev.target.result;
            img.alt = file.name;
            img.loading = 'lazy';
            const range = document.caretRangeFromPoint(e.clientX, e.clientY);
            if (range) {
              range.insertNode(img);
              range.setStartAfter(img);
              range.collapse(true);
              this.emit('contentChanged', { html: this.api.getContent() });
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }
  }

  _updatePlaceholder() {
    const isEmpty = this._editor.textContent.trim() === '' &&
      !this._editor.querySelector('img, video, iframe, table');
    this._placeholder.style.display = isEmpty ? 'block' : 'none';
  }

  focus() {
    this._editor.focus();
  }

  getContent() {
    return this.api.getContent();
  }

  setContent(html) {
    this.api.setContent(html);
    this._updatePlaceholder();
  }

  clear() {
    this.api.clear();
    this._updatePlaceholder();
  }

  toggleReadOnly() {
    this._readOnly.toggle();
  }

  isReadOnly() {
    return this._readOnly.isEnabled();
  }

  destroy() {
    this._toolbar.hide();
    this._toolbar._el.remove();
    this._container.remove();
  }

  on(event, handler) {
    this.addEventListener(event, handler);
  }

  emit(event, data) {
    this.dispatchEvent(new CustomEvent(event, { detail: data }));
  }
}