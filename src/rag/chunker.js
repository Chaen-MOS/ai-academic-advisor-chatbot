function chunkText(text, chunkSize = 800, overlap = 100) {
  const chunks = [];

  let start = 0;

  while (start < text.length) {
    const end = start + chunkSize;
    const chunk = text.slice(start, end);

    chunks.push(chunk);

    start = end - overlap;
  }

  return chunks;
}

export { chunkText };