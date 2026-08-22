import "server-only";

import { PDFDocument } from "pdf-lib";

/** Fusionne plusieurs buffers PDF dans l'ordre. */
export async function fusionnerBuffersPdf(
  ...parties: Buffer[]
): Promise<Buffer> {
  if (parties.length === 0) return Buffer.alloc(0);
  if (parties.length === 1) return parties[0]!;

  const fusion = await PDFDocument.create();
  for (const buf of parties) {
    const doc = await PDFDocument.load(buf);
    const pages = await fusion.copyPages(doc, doc.getPageIndices());
    for (const page of pages) fusion.addPage(page);
  }
  return Buffer.from(await fusion.save());
}
