const ALLOWED_TAGS = new Set([
  'p', 'br', 'strong', 'em', 'u', 's', 'sub', 'sup',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'blockquote', 'pre', 'code',
  'a', 'img', 'video', 'iframe',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
  'caption', 'colgroup', 'col',
  'hr', 'div', 'span', 'small', 'mark', 'del', 'ins',
]);

const ALLOWED_ATTRS = new Set([
  'href', 'target', 'rel', 'title',
  'src', 'alt', 'width', 'height', 'loading',
  'colspan', 'rowspan', 'scope',
  'frameborder', 'allowfullscreen', 'allow',
  'style', 'class', 'id',
  'data-*',
]);

const ALLOWED_STYLE_PROPERTIES = new Set([
  'color', 'background-color', 'font-size', 'font-weight',
  'text-align', 'text-decoration', 'font-family',
  'width', 'height', 'margin', 'padding',
  'border', 'border-collapse',
]);

const WORD_CLASS_PATTERNS = [/^Mso/, /^mso-/, /^MsoList/, /^MsoNormal/, /^MsoToc/, /^MsoHeader/, /^MsoFooter/];
const WORD_TAGS = ['o:p', 'xml', 'w:', 'st1:'];

function isAllowedTag(tag) {
  return ALLOWED_TAGS.has(tag);
}

function isAllowedAttr(attr) {
  if (ALLOWED_ATTRS.has(attr)) return true;
  if (attr.startsWith('data-')) return true;
  return false;
}

function isAllowedStyle(prop) {
  const name = prop.trim().toLowerCase();
  return ALLOWED_STYLE_PROPERTIES.has(name);
}

function cleanStyleString(styleStr) {
  if (!styleStr) return '';
  return styleStr.split(';')
    .map(s => s.trim())
    .filter(s => {
      if (!s) return false;
      const [prop] = s.split(':').map(p => p.trim().toLowerCase());
      return isAllowedStyle(prop);
    })
    .join('; ');
}

function isWordClass(className) {
  if (!className) return false;
  return WORD_CLASS_PATTERNS.some(p => p.test(className));
}

function sanitizeNode(node, depth = 0) {
  if (depth > 20) return document.createTextNode(node.textContent || '');

  if (node.nodeType === Node.TEXT_NODE) {
    return document.createTextNode(node.textContent);
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return document.createTextNode(node.textContent || '');
  }

  const tag = node.tagName.toLowerCase();

  if (!isAllowedTag(tag) || WORD_TAGS.includes(tag) || tag.includes(':')) {
    const text = node.textContent;
    if (text.trim()) {
      return document.createTextNode(text);
    }
    return document.createTextNode('');
  }

  const newEl = document.createElement(tag);
  const keep = ['u', 'em', 'i', 'b'];
  if (tag === 'b') newEl.tagName = 'strong';
  if (tag === 'i') newEl.tagName = 'em';

  Array.from(node.attributes).forEach(attr => {
    const name = attr.name;
    const value = attr.value;

    if (!isAllowedAttr(name)) return;

    if (name === 'class') {
      const classes = value.split(/\s+/).filter(c => !isWordClass(c));
      if (classes.length) newEl.setAttribute('class', classes.join(' '));
      return;
    }

    if (name === 'style') {
      const cleaned = cleanStyleString(value);
      if (cleaned) newEl.setAttribute('style', cleaned);
      return;
    }

    if (name === 'href' || name === 'src') {
      try {
        new URL(value, window.location.origin);
        newEl.setAttribute(name, value);
      } catch (e) {
        newEl.setAttribute(name, value);
      }
      return;
    }

    newEl.setAttribute(name, value);
  });

  Array.from(node.childNodes).forEach(child => {
    const sanitized = sanitizeNode(child, depth + 1);
    if (sanitized && sanitized.textContent !== '' && sanitized.nodeType !== Node.COMMENT_NODE) {
      newEl.appendChild(sanitized);
    }
  });

  return newEl;
}

export function sanitize(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const cleaned = Array.from(doc.body.childNodes)
    .map(child => sanitizeNode(child))
    .filter(node => node && node.textContent.trim() !== '');

  const fragment = document.createDocumentFragment();
  cleaned.forEach(node => fragment.appendChild(node));

  const temp = document.createElement('div');
  temp.appendChild(fragment.cloneNode(true));

  let result = temp.innerHTML
    .replace(/\u00a0/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .replace(/>\s+</g, '><')
    .replace(/(<(p|div|h[1-6]|li|blockquote|pre)[^>]*>)\s+/, '$1')
    .replace(/\s+(<\/(p|div|h[1-6]|li|blockquote|pre)>)/, '$1')
    .trim();

  return result;
}

export function sanitizeOnPaste(html) {
  const cleaned = sanitize(html);

  const container = document.createElement('div');
  container.innerHTML = cleaned;

  container.querySelectorAll('a').forEach(a => {
    if (!a.getAttribute('target')) a.setAttribute('target', '_blank');
    if (!a.getAttribute('rel')) a.setAttribute('rel', 'noopener noreferrer');
  });

  container.querySelectorAll('img').forEach(img => {
    if (!img.getAttribute('loading')) img.setAttribute('loading', 'lazy');
    if (!img.getAttribute('alt')) img.setAttribute('alt', '');
  });

  return container.innerHTML;
}