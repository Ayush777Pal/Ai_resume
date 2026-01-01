export interface PdfConversionResult {
  imageUrl: string;
  file: File | null;
  error?: string;
}

let pdfjsLib: any = null;

async function loadPdfJs() {
  // 🚨 SSR guard
  if (typeof window === "undefined") {
    throw new Error("PDF conversion can only run in browser");
  }

  if (pdfjsLib) return pdfjsLib;

  const lib = await import("pdfjs-dist");
  const worker = await import("pdfjs-dist/build/pdf.worker?url");

  lib.GlobalWorkerOptions.workerSrc = worker.default;
  pdfjsLib = lib;

  return lib;
}

export async function convertPdfToImage(
  file: File
): Promise<PdfConversionResult> {
  try {
    const lib = await loadPdfJs();

    const buffer = await file.arrayBuffer();
    const pdf = await lib.getDocument({ data: buffer }).promise;
    const page = await pdf.getPage(1);

    const viewport = page.getViewport({ scale: 2 });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      return { imageUrl: "", file: null, error: "Canvas failed" };
    }

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvas,
      canvasContext: context,
      viewport,
    }).promise;

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve({ imageUrl: "", file: null, error: "Blob failed" });
          return;
        }

        const imageFile = new File(
          [blob],
          file.name.replace(/\.pdf$/i, ".png"),
          { type: "image/png" }
        );

        resolve({
          imageUrl: URL.createObjectURL(blob),
          file: imageFile,
        });
      });
    });
  } catch (err) {
    return {
      imageUrl: "",
      file: null,
      error: String(err),
    };
  }
}
