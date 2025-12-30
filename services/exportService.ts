import JSZip from 'jszip';
import { Quiz } from '../types';

/**
 * Sanitizes a string to be safe for filenames
 */
const sanitizeFilename = (name: string): string => {
  return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
};

/**
 * Trigger a browser download for a specific Blob
 */
const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export a single quiz to a .qzx file (JSON format)
 */
export const exportQuizToQZX = (quiz: Quiz) => {
  const data = JSON.stringify(quiz, null, 2);
  // Using application/octet-stream forces the browser to treat it as a generic binary/file 
  // and respect the provided extension, rather than appending .json
  const blob = new Blob([data], { type: 'application/octet-stream' });
  const filename = `${sanitizeFilename(quiz.title)}.qzx`;
  downloadBlob(blob, filename);
};

/**
 * Export all provided quizzes into a single ZIP file
 */
export const exportAllQuizzesToZip = async (quizzes: Quiz[]) => {
  const zip = new JSZip();
  
  // Create a folder inside the zip
  const folder = zip.folder("quizwhiz_backup");
  
  if (folder) {
      quizzes.forEach(quiz => {
        const filename = `${sanitizeFilename(quiz.title)}.qzx`;
        const content = JSON.stringify(quiz, null, 2);
        folder.file(filename, content);
      });
  }

  // Generate the zip file
  const content = await zip.generateAsync({ type: "blob" });
  
  const dateStr = new Date().toISOString().split('T')[0];
  downloadBlob(content, `quizwhiz_export_${dateStr}.zip`);
};