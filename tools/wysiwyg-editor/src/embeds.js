import { createElement, saveSelection, restoreSelection, escapeHtml } from './utils.js';

let lastSelection = null;

function saveSel() {
  lastSelection = saveSelection();
}

function restoreSel() {
  if (lastSelection) {
    restoreSelection(lastSelection);
    lastSelection = null;
  }
}

export function insertLink(url, text, options = {}) {
  saveSel();
  const sel = window.getSelection();
  restoreSel();

  const range = window.getSelection().getRangeAt(0);
  const a = document.createElement('a');
  a.href = url;
  a.textContent = text || url;
  a.setAttribute('target', options.target || '_blank');
  a.setAttribute('rel', options.rel || 'noopener noreferrer');
  if (options.title) a.setAttribute('title', options.title);

  sel.removeAllRanges();
  sel.addRange(range);
  range.deleteContents();
  range.insertNode(a);
  range.setStartAfter(a);
  range.collapse(true);
}

export function insertImage(src, alt = '') {
  saveSel();
  const sel = window.getSelection();
  restoreSel();

  const range = window.getSelection().getRangeAt(0);
  const img = document.createElement('img');
  img.src = src;
  img.alt = alt || 'Изображение';
  img.loading = 'lazy';

  range.deleteContents();
  range.insertNode(img);
  range.setStartAfter(img);
  range.collapse(true);
}

export function insertVideo(url) {
  saveSel();
  const sel = window.getSelection();
  restoreSel();

  const range = window.getSelection().getRangeAt(0);
  const embedUrl = getEmbedUrl(url);

  if (embedUrl) {
    const iframe = document.createElement('iframe');
    iframe.src = embedUrl;
    iframe.width = '640';
    iframe.height = '360';
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.setAttribute('allow', 'autoplay; encrypted-media');
    range.deleteContents();
    range.insertNode(iframe);
    range.setStartAfter(iframe);
    range.collapse(true);
  } else {
    const a = document.createElement('a');
    a.href = url;
    a.textContent = url;
    a.target = '_blank';
    range.deleteContents();
    range.insertNode(a);
    range.setStartAfter(a);
    range.collapse(true);
  }
}

function getEmbedUrl(url) {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();

    if (host.includes('youtube.com') || host.includes('youtu.be')) {
      let videoId = '';
      if (host.includes('youtu.be')) {
        videoId = u.pathname.slice(1).split('/')[0];
      } else {
        videoId = u.searchParams.get('v') || '';
      }
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }

    if (host.includes('vimeo.com')) {
      const videoId = u.pathname.slice(1).split('/')[0];
      if (videoId) return `https://player.vimeo.com/video/${videoId}`;
    }

    return null;
  } catch {
    return null;
  }
}

export function showLinkModal(onInsert) {
  saveSel();
  const overlay = createElement('div', { class: 'wysiwyg-modal-overlay' });
  const modal = createElement('div', { class: 'wysiwyg-modal wysiwyg-modal-link' });

  modal.innerHTML = `
    <div class="wysiwyg-modal-header">
      <h3>Вставить ссылку</h3>
      <button class="wysiwyg-modal-close" aria-label="Закрыть">&times;</button>
    </div>
    <div class="wysiwyg-modal-body">
      <div class="wysiwyg-field">
        <label for="wysiwyg-link-url">URL</label>
        <input type="url" id="wysiwyg-link-url" class="wysiwyg-input" placeholder="https://..." autofocus>
      </div>
      <div class="wysiwyg-field">
        <label for="wysiwyg-link-text">Текст</label>
        <input type="text" id="wysiwyg-link-text" class="wysiwyg-input" placeholder="Текст ссылки">
      </div>
      <div class="wysiwyg-field">
        <label class="wysiwyg-checkbox">
          <input type="checkbox" id="wysiwyg-link-blank" checked>
          Открывать в новой вкладке
        </label>
      </div>
    </div>
    <div class="wysiwyg-modal-footer">
      <button class="wysiwyg-btn wysiwyg-btn-cancel">Отмена</button>
      <button class="wysiwyg-btn wysiwyg-btn-primary">Вставить</button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  const close = () => { overlay.remove(); };
  modal.querySelector('.wysiwyg-modal-close').addEventListener('click', close);
  modal.querySelector('.wysiwyg-btn-cancel').addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  const selText = window.getSelection().toString();
  if (selText) {
    modal.querySelector('#wysiwyg-link-text').value = selText;
  }

  modal.querySelector('.wysiwyg-btn-primary').addEventListener('click', () => {
    const url = modal.querySelector('#wysiwyg-link-url').value.trim();
    const text = modal.querySelector('#wysiwyg-link-text').value.trim();
    const blank = modal.querySelector('#wysiwyg-link-blank').checked;

    if (!url) {
      modal.querySelector('#wysiwyg-link-url').focus();
      return;
    }

    onInsert({
      url,
      text: text || url,
      target: blank ? '_blank' : '_self',
      rel: blank ? 'noopener noreferrer' : '',
    });
    close();
  });

  modal.querySelector('#wysiwyg-link-url').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') modal.querySelector('.wysiwyg-btn-primary').click();
  });
  modal.querySelector('#wysiwyg-link-text').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') modal.querySelector('.wysiwyg-btn-primary').click();
  });

  setTimeout(() => modal.querySelector('#wysiwyg-link-url').focus(), 50);
}

export function showImageModal(onInsert) {
  saveSel();
  const overlay = createElement('div', { class: 'wysiwyg-modal-overlay' });
  const modal = createElement('div', { class: 'wysiwyg-modal wysiwyg-modal-image' });

  modal.innerHTML = `
    <div class="wysiwyg-modal-header">
      <h3>Вставить изображение</h3>
      <button class="wysiwyg-modal-close" aria-label="Закрыть">&times;</button>
    </div>
    <div class="wysiwyg-modal-body">
      <div class="wysiwyg-field">
        <label>Загрузить файл</label>
        <input type="file" id="wysiwyg-image-file" accept="image/*" class="wysiwyg-file-input">
      </div>
      <div class="wysiwyg-divider-text">или</div>
      <div class="wysiwyg-field">
        <label for="wysiwyg-image-url">URL изображения</label>
        <input type="url" id="wysiwyg-image-url" class="wysiwyg-input" placeholder="https://example.com/image.jpg">
      </div>
      <div class="wysiwyg-field">
        <label for="wysiwyg-image-alt">Alt текст</label>
        <input type="text" id="wysiwyg-image-alt" class="wysiwyg-input" placeholder="Описание изображения">
      </div>
    </div>
    <div class="wysiwyg-modal-footer">
      <button class="wysiwyg-btn wysiwyg-btn-cancel">Отмена</button>
      <button class="wysiwyg-btn wysiwyg-btn-primary">Вставить</button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  const close = () => { overlay.remove(); };
  modal.querySelector('.wysiwyg-modal-close').addEventListener('click', close);
  modal.querySelector('.wysiwyg-btn-cancel').addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  const fileInput = modal.querySelector('#wysiwyg-image-file');
  const urlInput = modal.querySelector('#wysiwyg-image-url');

  fileInput.addEventListener('change', () => {
    if (fileInput.files.length) {
      const file = fileInput.files[0];
      if (file.size > 10 * 1024 * 1024) {
        alert('Файл слишком большой. Максимальный размер: 10MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const alt = modal.querySelector('#wysiwyg-image-alt').value.trim() || file.name;
        onInsert({ src: e.target.result, alt });
        close();
      };
      reader.readAsDataURL(file);
    }
  });

  urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') modal.querySelector('.wysiwyg-btn-primary').click();
  });

  modal.querySelector('.wysiwyg-btn-primary').addEventListener('click', () => {
    const url = urlInput.value.trim();
    const alt = modal.querySelector('#wysiwyg-image-alt').value.trim() || '';

    if (!url && !fileInput.files.length) {
      urlInput.focus();
      return;
    }

    if (url) {
      onInsert({ src: url, alt });
      close();
    }
  });

  setTimeout(() => urlInput.focus(), 50);
}

export function showVideoModal(onInsert) {
  saveSel();
  const overlay = createElement('div', { class: 'wysiwyg-modal-overlay' });
  const modal = createElement('div', { class: 'wysiwyg-modal wysiwyg-modal-video' });

  modal.innerHTML = `
    <div class="wysiwyg-modal-header">
      <h3>Вставить видео</h3>
      <button class="wysiwyg-modal-close" aria-label="Закрыть">&times;</button>
    </div>
    <div class="wysiwyg-modal-body">
      <div class="wysiwyg-field">
        <label for="wysiwyg-video-url">URL видео (YouTube, Vimeo)</label>
        <input type="url" id="wysiwyg-video-url" class="wysiwyg-input" placeholder="https://youtube.com/watch?v=..." autofocus>
      </div>
    </div>
    <div class="wysiwyg-modal-footer">
      <button class="wysiwyg-btn wysiwyg-btn-cancel">Отмена</button>
      <button class="wysiwyg-btn wysiwyg-btn-primary">Вставить</button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  const close = () => { overlay.remove(); };
  modal.querySelector('.wysiwyg-modal-close').addEventListener('click', close);
  modal.querySelector('.wysiwyg-btn-cancel').addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  modal.querySelector('.wysiwyg-btn-primary').addEventListener('click', () => {
    const url = modal.querySelector('#wysiwyg-video-url').value.trim();
    if (!url) return;
    onInsert(url);
    close();
  });

  modal.querySelector('#wysiwyg-video-url').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') modal.querySelector('.wysiwyg-btn-primary').click();
  });

  setTimeout(() => modal.querySelector('#wysiwyg-video-url').focus(), 50);
}