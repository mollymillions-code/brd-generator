export async function processText(buffer: Buffer): Promise<string> {
  return buffer.toString('utf-8')
}
