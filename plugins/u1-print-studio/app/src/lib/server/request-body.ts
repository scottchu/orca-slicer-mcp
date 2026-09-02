export const MAX_REQUEST_BYTES = 128 * 1024;

export const readRequestBytes = async (request: Request, limit = MAX_REQUEST_BYTES, tooLarge = 'request_too_large'): Promise<Uint8Array> => {
  if (!request.body) throw new Error('invalid_request');
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > limit) throw new Error(tooLarge);
      chunks.push(value);
    }
    const bytes = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    return bytes;
  } finally {
    // Canceling here would destroy IncomingMessage before a 413 can flush.
    // The raw transport releases an incomplete request after response finish.
    reader.releaseLock();
  }
};

export const readRequestJson = async (request: Request): Promise<unknown> => JSON.parse(new TextDecoder().decode(await readRequestBytes(request)));
