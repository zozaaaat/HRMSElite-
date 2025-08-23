import sanitizeHtml from 'sanitize-html';

const options: sanitizeHtml.IOptions = {
  allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'ul', 'ol', 'li', 'br', 'span'],
  allowedAttributes: {
    a: ['href', 'name', 'target']
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel']
};

export function sanitizeHtmlString(input: string): string {
  return sanitizeHtml(input, options);
}

export function deepSanitize(input: unknown): unknown {
  if (typeof input === 'string') {
    return sanitizeHtmlString(input);
  }
  if (Array.isArray(input)) {
    return input.map((item) => deepSanitize(item));
  }
  if (input && typeof input === 'object') {
    return Object.fromEntries(
      Object.entries(input as Record<string, unknown>).map(([key, value]) => [key, deepSanitize(value)])
    );
  }
  return input;
}
