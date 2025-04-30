// components/PDFReader.jsx
import { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const PDFReader = ({ bookId }) => {
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.2);
  const canvasRef = useRef();

  useEffect(() => {
    const fetchBook = async () => {
      const res = await fetch(`/api/books/${bookId}`);
      const { pdfUrl } = await res.json();
      
      const loadingTask = pdfjsLib.getDocument(pdfUrl);
      loadingTask.promise.then(pdf => {
        setPdfDoc(pdf);
        renderPage(pdf, currentPage);
      });
    };

    fetchBook();
  }, [bookId]);

  const renderPage = (pdf, pageNum) => {
    pdf.getPage(pageNum).then(page => {
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      page.render({
        canvasContext: canvas.getContext('2d'),
        viewport
      });
    });
  };

  return (
    <div className="pdf-reader">
      <div className="controls">
        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>
          Önceki
        </button>
        <span>Sayfa {currentPage} / {pdfDoc?.numPages || 0}</span>
        <button onClick={() => setCurrentPage(p => Math.min(p + 1, pdfDoc?.numPages || 1))}>
          Sonraki
        </button>
        <button onClick={() => setScale(s => s + 0.1)}>+</button>
        <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))}>-</button>
      </div>
      <canvas ref={canvasRef} />
    </div>
  );
};
