import { sanitize } from './sanitizer.js';

export class EditorAPI {
  constructor(editor) {
    this._editor = editor;
    this._container = editor._container;
  }

  getContent(options = {}) {
    const { format = 'html', sanitize: shouldSanitize = true } = options;
    const editorEl = this._container.querySelector('.wysiwyg-editor');
    if (!editorEl) return '';

    let html = editorEl.innerHTML;

    if (shouldSanitize) {
      html = sanitize(html);
    }

    if (format === 'text') {
      const div = document.createElement('div');
      div.innerHTML = html;
      return div.textContent;
    }

    return html;
  }

  setContent(html) {
    const editorEl = this._container.querySelector('.wysiwyg-editor');
    if (!editorEl) return;

    const sanitized = sanitize(html);
    editorEl.innerHTML = sanitized;
    this._editor.emit('contentChanged', { html: sanitized });
  }

  clear() {
    this.setContent('<p><br></p>');
  }

  getText() {
    return this.getContent({ format: 'text', sanitize: false });
  }

  isEmpty() {
    const editorEl = this._container.querySelector('.wysiwyg-editor');
    if (!editorEl) return true;
    const text = editorEl.textContent.trim();
    return text === '' && !editorEl.querySelector('img, video, iframe, table');
  }

  getWordCount() {
    const text = this.getContent({ format: 'text', sanitize: false });
    return text ? text.split(/\s+/).filter(Boolean).length : 0;
  }

  getCharCount() {
    return this.getContent({ format: 'text', sanitize: false }).length;
  }

  toJSON(options = {}) {
    return {
      html: this.getContent({ ...options, format: 'html' }),
      text: this.getContent({ ...options, format: 'text' }),
      wordCount: this.getWordCount(),
      charCount: this.getCharCount(),
      isEmpty: this.isEmpty(),
    };
  }
}