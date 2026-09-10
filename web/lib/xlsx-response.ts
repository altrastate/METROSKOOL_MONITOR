import "server-only";

export function xlsxResponse(bytes: Uint8Array, filename: string): Response {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return new Response(copy.buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
