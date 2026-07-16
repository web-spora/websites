import { createElement } from './utils.js';

export class ReadOnlyMode {
  constructor(editor) {
    this._editor = editor;
    this._enabled = false;
    this._overlay = null;
  }

  enable() {
    if (this._enabled) return;
    this._enabled = true;

    const editorEl = this._editor._container.querySelector('.wysiwyg-editor');
    if (!editorEl) return;

    editorEl.contentEditable = 'false';

    this._overlay = createElement('div', { class: 'wysiwyg-readonly-overlay' });
    const editBtn = createElement('button', {
      class: 'wysiwyg-readonly-btn',
      'aria-label': 'Редактировать',
      title: 'Редактировать',
    });
    editBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
        <path d="m15 5 4 4"/>
      </svg>
      Редактировать
    `;

    editBtn.addEventListener('click', () => this.disable());
    this._overlay.appendChild(editBtn);

    const wrapper = this._editor._container;
    wrapper.classList.add('wysiwyg-readonly');
    wrapper.appendChild(this._overlay);
  }

  disable() {
    if (!this._enabled) return;
    this._enabled = false;

    const editorEl = this._editor._container.querySelector('.wysiwyg-editor');
    if (editorEl) {
      editorEl.contentEditable = 'true';
    }

    if (this._overlay) {
      this._overlay.remove();
      this._overlay = null;
    }

    const wrapper = this._editor._container;
    wrapper.classList.remove('wysiwyg-readonly');

    this._editor.emit('readOnlyChanged', { enabled: false });
    this._editor._editor.focus();
  }

  toggle() {
    if (this._enabled) {
      this.disable();
    } else {
      this.enable();
    }
  }

  isEnabled() {
    return this._enabled;
  }
}