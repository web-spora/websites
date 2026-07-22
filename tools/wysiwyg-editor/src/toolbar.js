import { createElement, getSelectionRect, isSelectionCollapsed, throttle } from './utils.js';
import { execFormat, queryFormat, toggleHeading, toggleBlockquote, toggleCodeBlock, toggleUnorderedList, toggleOrderedList, toggleInlineCode, insertHorizontalRule, EXEC_COMMANDS, queryHeadingState, queryBlockState, queryListState, headingLevels } from './commands.js';
import { showLinkModal, showImageModal, showVideoModal, insertLink, insertImage, insertVideo } from './embeds.js';
import { insertTable, isInsideTable, getTableToolbarHTML, handleTableAction } from './tables.js';

const TOOLBAR_GROUPS = [
  {
    id: 'history',
    items: [
      { action: 'undo', label: 'Отменить', icon: '↩', shortcut: 'Ctrl+Z' },
      { action: 'redo', label: 'Повторить', icon: '↪', shortcut: 'Ctrl+Shift+Z' },
    ],
  },
  {
    id: 'formatting',
    items: [
      { action: 'bold', label: 'Жирный', icon: 'B', shortcut: 'Ctrl+B' },
      { action: 'italic', label: 'Курсив', icon: 'I', shortcut: 'Ctrl+I' },
      { action: 'underline', label: 'Подчеркнутый', icon: 'U', shortcut: 'Ctrl+U' },
      { action: 'strikethrough', label: 'Зачеркнутый', icon: 'S', shortcut: 'Ctrl+Shift+S' },
    ],
  },
  {
    id: 'blocks',
    items: [
      {
        action: 'heading',
        label: 'Заголовки',
        type: 'dropdown',
        icon: 'H',
        items: [
          { action: 'paragraph', label: 'Параграф' },
          { action: 'h1', label: 'Заголовок 1' },
          { action: 'h2', label: 'Заголовок 2' },
          { action: 'h3', label: 'Заголовок 3' },
          { action: 'h4', label: 'Заголовок 4' },
          { action: 'h5', label: 'Заголовок 5' },
          { action: 'h6', label: 'Заголовок 6' },
        ],
      },
      { action: 'blockquote', label: 'Цитата', icon: '"' },
      { action: 'code-block', label: 'Код', icon: '<>' },
    ],
  },
  {
    id: 'lists',
    items: [
      { action: 'ul', label: 'Маркированный список', icon: '•' },
      { action: 'ol', label: 'Нумерованный список', icon: '1.' },
    ],
  },
  {
    id: 'insert',
    items: [
      { action: 'link', label: 'Ссылка', icon: '🔗' },
      { action: 'image', label: 'Изображение', icon: '🖼' },
      { action: 'video', label: 'Видео', icon: '▶' },
      { action: 'table', label: 'Таблица', icon: '⊞' },
      { action: 'hr', label: 'Разделитель', icon: '—' },
    ],
  },
];

export class Toolbar {
  constructor(editor) {
    this._editor = editor;
    this._el = null;
    this._activeItems = new Set();
    this._currentDropdown = null;
    this._isVisible = false;
    this._isInsideTable = false;
  }

  init() {
    this._el = createElement('div', {
      class: 'wysiwyg-toolbar',
      role: 'toolbar',
      'aria-label': 'Форматирование текста',
    });
    this._render();
    this._el.addEventListener('mousedown', (e) => e.preventDefault());
    document.body.appendChild(this._el);
    return this._el;
  }

  _render() {
    this._el.innerHTML = '';
    TOOLBAR_GROUPS.forEach((group, gi) => {
      if (gi > 0) {
        this._el.appendChild(createElement('div', { class: 'wysiwyg-toolbar-divider' }));
      }
      const groupEl = createElement('div', { class: 'wysiwyg-toolbar-group' });
      group.items.forEach(item => {
        if (item.type === 'dropdown') {
          groupEl.appendChild(this._createDropdown(item));
        } else {
          const btn = this._createButton(item);
          btn.dataset.action = item.action;
          groupEl.appendChild(btn);
        }
      });
      this._el.appendChild(groupEl);
    });
  }

  _createButton({ action, label, icon, shortcut }) {
    const btn = createElement('button', {
      class: 'wysiwyg-toolbar-btn',
      'aria-label': label,
      title: shortcut ? `${label} (${shortcut})` : label,
    });
    btn.innerHTML = this._getIconHTML(icon);
    btn.dataset.action = action;
    btn.addEventListener('click', () => this._handleAction(action));
    return btn;
  }

  _createDropdown(item) {
    const wrapper = createElement('div', { class: 'wysiwyg-dropdown-wrapper' });
    const btn = createElement('button', {
      class: 'wysiwyg-toolbar-btn wysiwyg-dropdown-toggle',
      'aria-label': item.label,
      title: item.label,
      'aria-haspopup': 'true',
    });
    btn.innerHTML = `<span class="wysiwyg-dropdown-label">${this._getIconHTML(item.icon)}</span><span class="wysiwyg-dropdown-arrow">▾</span>`;
    btn.dataset.action = 'heading';

    const menu = createElement('div', { class: 'wysiwyg-dropdown-menu', role: 'menu' });
    item.items.forEach(sub => {
      const subBtn = createElement('button', {
        class: 'wysiwyg-dropdown-item',
        'role': 'menuitem',
        'aria-label': sub.label,
      });
      subBtn.textContent = sub.label;
      subBtn.dataset.action = sub.action;
      subBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._handleAction(sub.action);
        this._closeDropdown();
      });
      menu.appendChild(subBtn);
    });

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._toggleDropdown(wrapper, menu);
    });

    wrapper.appendChild(btn);
    wrapper.appendChild(menu);
    return wrapper;
  }

  _getIconHTML(icon) {
    if (icon.length === 1) return icon;
    if (icon === 'B') return `<span style="font-weight:700">B</span>`;
    if (icon === 'I') return `<span style="font-style:italic">I</span>`;
    if (icon === 'U') return `<span style="text-decoration:underline">U</span>`;
    if (icon === 'S') return `<span style="text-decoration:line-through">S</span>`;
    if (icon === '<>') return `<span style="font-family:monospace;font-size:13px">&lt;/&gt;</span>`;
    return icon;
  }

  _toggleDropdown(wrapper, menu) {
    if (this._currentDropdown) this._closeDropdown();
    wrapper.classList.add('wysiwyg-dropdown-open');
    menu.style.display = 'block';

    const rect = wrapper.getBoundingClientRect();
    menu.style.left = '0';
    menu.style.right = 'auto';

    const menuRect = menu.getBoundingClientRect();
    if (menuRect.right > window.innerWidth) {
      menu.style.left = 'auto';
      menu.style.right = '0';
    }

    this._currentDropdown = { wrapper, menu };
    const closeHandler = (e) => {
      if (!wrapper.contains(e.target)) {
        this._closeDropdown();
        document.removeEventListener('mousedown', closeHandler);
      }
    };
    setTimeout(() => document.addEventListener('mousedown', closeHandler), 0);
  }

  _closeDropdown() {
    if (this._currentDropdown) {
      this._currentDropdown.wrapper.classList.remove('wysiwyg-dropdown-open');
      this._currentDropdown.menu.style.display = 'none';
      this._currentDropdown = null;
    }
  }

  _handleAction(action) {
    const editor = this._editor;
    editor.focus();

    switch (action) {
      case 'undo': execFormat(EXEC_COMMANDS.undo); break;
      case 'redo': execFormat(EXEC_COMMANDS.redo); break;
      case 'bold': execFormat(EXEC_COMMANDS.bold); break;
      case 'italic': execFormat(EXEC_COMMANDS.italic); break;
      case 'underline': execFormat(EXEC_COMMANDS.underline); break;
      case 'strikethrough': execFormat(EXEC_COMMANDS.strikethrough); break;
      case 'paragraph':
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6': toggleHeading(action); break;
      case 'blockquote': toggleBlockquote(); break;
      case 'code-block': toggleCodeBlock(); break;
      case 'ul': toggleUnorderedList(); break;
      case 'ol': toggleOrderedList(); break;
      case 'link': showLinkModal(({ url, text, target, rel }) => {
        editor.focus();
        insertLink(url, text, { target, rel });
        editor.emit('contentChanged', { html: editor.api.getContent() });
      }); break;
      case 'image': showImageModal(({ src, alt }) => {
        editor.focus();
        insertImage(src, alt);
        editor.emit('contentChanged', { html: editor.api.getContent() });
      }); break;
      case 'video': showVideoModal((url) => {
        editor.focus();
        insertVideo(url);
        editor.emit('contentChanged', { html: editor.api.getContent() });
      }); break;
      case 'table': this._showTableGrid(); break;
      case 'hr': insertHorizontalRule(); break;
      default:
        if (action.startsWith('table-')) {
          handleTableAction(action);
          editor.emit('contentChanged', { html: editor.api.getContent() });
        }
        break;
    }

    this._updateActiveState();
  }

  _showTableGrid() {
    const maxRows = 5, maxCols = 5;
    const overlay = createElement('div', { class: 'wysiwyg-modal-overlay' });
    const modal = createElement('div', { class: 'wysiwyg-modal wysiwyg-modal-table' });

    const header = createElement('div', { class: 'wysiwyg-modal-header' });
    header.innerHTML = '<h3>Вставить таблицу</h3><button class="wysiwyg-modal-close" aria-label="Закрыть">&times;</button>';
    modal.appendChild(header);

    const body = createElement('div', { class: 'wysiwyg-modal-body' });

    const grid = createElement('div', { class: 'wysiwyg-table-grid' });
    let label = createElement('div', { class: 'wysiwyg-table-grid-label' });
    label.textContent = 'Выберите размер';
    body.appendChild(label);
    body.appendChild(grid);

    const cells = [];
    for (let r = 0; r < maxRows; r++) {
      for (let c = 0; c < maxCols; c++) {
        const cell = createElement('div', { class: 'wysiwyg-table-grid-cell' });
        cell.dataset.row = r;
        cell.dataset.col = c;
        cell.addEventListener('mouseenter', () => {
          cells.forEach(el => el.classList.remove('active'));
          cells.filter(el => parseInt(el.dataset.row) <= r && parseInt(el.dataset.col) <= c)
            .forEach(el => el.classList.add('active'));
          label.textContent = `${r + 1} × ${c + 1}`;
        });
        cell.addEventListener('click', () => {
          this._editor.focus();
          insertTable(r + 1, c + 1);
          this._editor.emit('contentChanged', { html: this._editor.api.getContent() });
          overlay.remove();
        });
        grid.appendChild(cell);
        cells.push(cell);
      }
    }

    const footer = createElement('div', { class: 'wysiwyg-modal-footer' });
    const cancelBtn = createElement('button', { class: 'wysiwyg-btn wysiwyg-btn-cancel' });
    cancelBtn.textContent = 'Отмена';
    cancelBtn.addEventListener('click', () => overlay.remove());
    footer.appendChild(cancelBtn);
    modal.appendChild(footer);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    overlay.querySelector('.wysiwyg-modal-close').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  }

  show() {
    if (this._isVisible) return;
    this._isVisible = true;
    this._updatePosition();
    this._el.classList.add('wysiwyg-toolbar-visible');
    this._updateActiveState();
  }

  hide() {
    if (!this._isVisible) return;
    this._isVisible = false;
    this._el.classList.remove('wysiwyg-toolbar-visible');
    this._closeDropdown();
  }

  updatePosition() {
    if (!this._isVisible) return;
    this._updatePosition();
  }

  _updatePosition() {
    const rect = getSelectionRect();
    if (!rect) return;

    const toolbar = this._el;
    toolbar.style.left = '0';
    toolbar.style.top = '0';

    const toolbarRect = toolbar.getBoundingClientRect();
    const toolbarW = toolbarRect.width;
    const toolbarH = toolbarRect.height;

    let left = rect.left + rect.width / 2 - toolbarW / 2;
    let top = rect.top - toolbarH - 8;

    if (top < 10) {
      top = rect.bottom + 8;
    }

    if (left < 10) left = 10;
    if (left + toolbarW > window.innerWidth - 10) {
      left = window.innerWidth - toolbarW - 10;
    }

    toolbar.style.left = `${left}px`;
    toolbar.style.top = `${top}px`;
  }

  _updateActiveState() {
    if (!this._isVisible) return;

    const btns = this._el.querySelectorAll('.wysiwyg-toolbar-btn:not(.wysiwyg-dropdown-toggle)');
    btns.forEach(btn => {
      const action = btn.dataset.action;
      let active = false;

      if (action === 'bold') active = queryFormat('bold');
      else if (action === 'italic') active = queryFormat('italic');
      else if (action === 'underline') active = queryFormat('underline');
      else if (action === 'strikethrough') active = queryFormat('strikeThrough');
      else if (action === 'ul') active = queryFormat('insertUnorderedList');
      else if (action === 'ol') active = queryFormat('insertOrderedList');
      else if (action === 'blockquote') {
        const state = queryBlockState();
        active = state.blockquote;
      }

      btn.classList.toggle('wysiwyg-btn-active', active);
    });

    const headingDropdown = this._el.querySelector('.wysiwyg-dropdown-toggle[data-action="heading"]');
    if (headingDropdown) {
      const current = queryHeadingState();
      const label = headingDropdown.querySelector('.wysiwyg-dropdown-label');
      const level = headingLevels[current];
      if (label) label.textContent = level ? level.label.slice(0, 3) : 'H';
    }

    const isInTable = isInsideTable();
    if (isInTable !== this._isInsideTable) {
      this._isInsideTable = isInTable;
      if (isInTable) {
        this._showTableTools();
      } else {
        this._hideTableTools();
      }
    }
  }

  _showTableTools() {
    const existing = this._el.querySelector('.wysiwyg-toolbar-group-table');
    if (existing) return;

    const divider = createElement('div', { class: 'wysiwyg-toolbar-divider' });
    divider.dataset.tableTool = 'true';
    const group = createElement('div', { class: 'wysiwyg-toolbar-group wysiwyg-toolbar-group-table' });

    getTableToolbarHTML().forEach(({ label, action, icon }) => {
      const btn = createElement('button', {
        class: 'wysiwyg-toolbar-btn',
        'aria-label': label,
        title: label,
      });
      btn.textContent = icon;
      btn.dataset.action = action;
      btn.addEventListener('click', () => this._handleAction(action));
      group.appendChild(btn);
    });

    this._el.appendChild(divider);
    this._el.appendChild(group);
  }

  _hideTableTools() {
    this._el.querySelectorAll('[data-table-tool="true"]').forEach(el => el.remove());
    this._el.querySelectorAll('.wysiwyg-toolbar-group-table').forEach(el => el.remove());
  }

  _ignoreSelectionChange = false;

  onSelectionChange() {
    if (this._ignoreSelectionChange) return;
    const collapsed = isSelectionCollapsed();

    const editorEl = this._editor._editor;
    const selection = window.getSelection();

    if (collapsed || !editorEl.contains(selection.anchorNode)) {
      this.hide();
      return;
    }

    this.show();
    this._updatePosition();
    this._updateActiveState();
  }

  onScroll() {
    if (this._isVisible) {
      this._updatePosition();
    }
  }
}