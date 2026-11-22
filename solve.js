// Fast drop-in replacement for csv-reader 1.0.0
// Fully spec compliant, zero substring churn where possible, index-based string slicing

const COMMA = 1;
const LINE_BREAK = 2;
const END = 3;

export function readCsv(input) {
  const text = String(input.text);
  const header = input.header === true;
  const errors = [];
  const rows = [];
  let columns = null;
  let width = -1;

  const len = text.length;
  let pos = (len > 0 && text.charCodeAt(0) === 0xFEFF) ? 1 : 0;
  let line = 1;

  let recordLine = 1;
  let recordRow = null;

  function error(code) {
    errors.push({ code, line: recordLine, row: recordRow });
  }

  function readUnquoted(initialValue) {
    const startPos = pos;
    let parts = initialValue !== '' ? [initialValue] : [];
    let sliceStart = pos;

    while (pos < len) {
      const code = text.charCodeAt(pos);
      if (code === 44) { // ','
        parts.push(text.slice(sliceStart, pos));
        pos++;
        return { value: parts.join(''), ended: COMMA, added: pos - startPos - 1 };
      }
      if (code === 10) { // '\n'
        parts.push(text.slice(sliceStart, pos));
        pos++;
        line++;
        return { value: parts.join(''), ended: LINE_BREAK, added: pos - startPos - 1 };
      }
      if (code === 13) { // '\r'
        if (pos + 1 < len && text.charCodeAt(pos + 1) === 10) { // '\r\n'
          parts.push(text.slice(sliceStart, pos));
          pos += 2;
          line++;
          return { value: parts.join(''), ended: LINE_BREAK, added: pos - startPos - 2 };
        }
        // stray_cr
        parts.push(text.slice(sliceStart, pos));
        error('stray_cr');
        pos++;
        sliceStart = pos;
        continue;
      }
      pos++;
    }

    parts.push(text.slice(sliceStart, pos));
    return { value: parts.join(''), ended: END, added: pos - startPos };
  }

  function readQuoted() {
    const open = pos;
    const openLine = line;
    pos++; // skip opening '"'
    let sliceStart = pos;
    let parts = [];
    let closed = false;

    while (pos < len) {
      const code = text.charCodeAt(pos);
      if (code === 34) { // '"'
        if (pos + 1 < len && text.charCodeAt(pos + 1) === 34) { // '""'
          parts.push(text.slice(sliceStart, pos));
          parts.push('"');
          pos += 2;
          sliceStart = pos;
          continue;
        }
        parts.push(text.slice(sliceStart, pos));
        pos++;
        closed = true;
        break;
      }
      if (code === 13) { // '\r'
        parts.push(text.slice(sliceStart, pos));
        parts.push('\n');
        line++;
        if (pos + 1 < len && text.charCodeAt(pos + 1) === 10) {
          pos += 2;
        } else {
          pos++;
        }
        sliceStart = pos;
        continue;
      }
      if (code === 10) { // '\n'
        line++;
        pos++;
        continue;
      }
      pos++;
    }

    if (!closed) {
      pos = open + 1;
      line = openLine;
      error('unterminated_quote');
      return readUnquoted('"');
    }

    const value = parts.join('');
    if (pos >= len) return { value, ended: END };

    const cCode = text.charCodeAt(pos);
    if (cCode === 44) {
      pos++;
      return { value, ended: COMMA };
    }
    if (cCode === 10) {
      pos++;
      line++;
      return { value, ended: LINE_BREAK };
    }
    if (cCode === 13 && pos + 1 < len && text.charCodeAt(pos + 1) === 10) {
      pos += 2;
      line++;
      return { value, ended: LINE_BREAK };
    }

    const junk = readUnquoted(value);
    if (junk.added > 0) error('quote_junk');
    return junk;
  }

  while (true) {
    while (pos < len) {
      const code = text.charCodeAt(pos);
      if (code === 10) {
        pos++;
        line++;
      } else if (code === 13 && pos + 1 < len && text.charCodeAt(pos + 1) === 10) {
        pos += 2;
        line++;
      } else {
        break;
      }
    }
    if (pos >= len) break;

    recordLine = line;
    recordRow = header && columns === null ? null : rows.length;
    const fields = [];
    let field;
    let quoted;

    do {
      quoted = text.charCodeAt(pos) === 34; // '"'
      field = quoted ? readQuoted() : readUnquoted('');
      fields.push(field.value);
    } while (field.ended === COMMA);

    if (fields.length === 1 && fields[0] === '' && !quoted) continue;

    if (width < 0) width = fields.length;
    if (header && columns === null) {
      columns = fields;
      continue;
    }

    if (fields.length < width) {
      errors.push({ code: 'short_row', line: recordLine, row: recordRow, fields: fields.length });
      while (fields.length < width) fields.push('');
    } else if (fields.length > width) {
      errors.push({ code: 'long_row', line: recordLine, row: recordRow, extra: fields.splice(width) });
    }
    rows.push(fields);
  }

  return { columns: header ? (columns ?? []) : null, rows, errors };
}

export function run(input) {
  return readCsv(input);
}
