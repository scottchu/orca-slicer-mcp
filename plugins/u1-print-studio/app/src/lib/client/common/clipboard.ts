/** Browser capability edge; callers still validate and own action generations. */
export const writeClipboard = (text: string): Promise<void> => navigator.clipboard?.writeText(text) ?? Promise.reject(new Error('Clipboard unavailable'));
