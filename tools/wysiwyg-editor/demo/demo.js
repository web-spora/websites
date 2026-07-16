import { WYSIWYGEditor } from '../src/editor.js';

const editor = new WYSIWYGEditor('#editor', {
  placeholder: 'Напишите что-нибудь...',
  minHeight: '300px',
});

editor.on('contentChanged', ({ html }) => {
  const output = document.getElementById('html-output');
  const showHtml = document.getElementById('show-html');
  if (showHtml.checked) {
    output.textContent = html;
  }
});

document.getElementById('get-content').addEventListener('click', () => {
  const html = editor.getContent();
  const output = document.getElementById('html-output');
  output.textContent = html;
  output.classList.add('visible');
});

document.getElementById('toggle-readonly').addEventListener('click', () => {
  editor.toggleReadOnly();
  const btn = document.getElementById('toggle-readonly');
  btn.textContent = editor.isReadOnly() ? '✏️ Редактировать' : '🔒 Режим чтения';
});

document.getElementById('clear').addEventListener('click', () => {
  editor.clear();
});

document.getElementById('show-html').addEventListener('change', (e) => {
  const output = document.getElementById('html-output');
  if (e.target.checked) {
    output.textContent = editor.getContent();
    output.classList.add('visible');
  } else {
    output.classList.remove('visible');
  }
});

console.log('WYSIWYG Editor initialized:', editor);