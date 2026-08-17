import "server-only";

import type { ReactElement } from "react";
import { pdf } from "@react-pdf/renderer";
import { enregistrerPolicesPdfServeur } from "@/lib/pdf/assets-pdf-serveur";

async function bufferDepuisStream(
  stream: AsyncIterable<Uint8Array | Buffer | string>
): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

/**
 * Rend un document @react-pdf côté Node (toBuffer, repli toBlob).
 * Partagé par labo, infirmiers, église, etc.
 */
export async function bufferDepuisDocumentPdf(
  element: ReactElement
): Promise<Buffer> {
  enregistrerPolicesPdfServeur();
  const instance = pdf(element as Parameters<typeof pdf>[0]);

  const avecBuffer = instance as {
    toBuffer?: () => Promise<Buffer | AsyncIterable<Uint8Array | Buffer | string>>;
    toBlob: () => Promise<Blob>;
  };

  if (typeof avecBuffer.toBuffer === "function") {
    try {
      const result = await avecBuffer.toBuffer();
      if (Buffer.isBuffer(result)) return result;
      if (result && typeof (result as AsyncIterable<unknown>)[Symbol.asyncIterator] === "function") {
        return bufferDepuisStream(
          result as AsyncIterable<Uint8Array | Buffer | string>
        );
      }
    } catch {
      /* repli toBlob */
    }
  }

  const blob = await instance.toBlob();
  return Buffer.from(await blob.arrayBuffer());
}
