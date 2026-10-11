function chunkText(
  text,
  chunkSize = 800,
  overlap = 100,
) {
  if (
    typeof text !== "string" ||
    !text.trim()
  ) {
    return [];
  }

  const chunks = [];

  let start = 0;
  let chunkIndex = 0;

  while (start < text.length) {
    const end = Math.min(
      start + chunkSize,
      text.length,
    );

    const content =
      text.slice(start, end).trim();

    if (content) {
      chunks.push({
        chunkIndex,
        content,
      });

      chunkIndex += 1;
    }

    if (end >= text.length) {
      break;
    }

    start = Math.max(
      end - overlap,
      start + 1,
    );
  }

  return chunks;
}

export {
  chunkText,
};