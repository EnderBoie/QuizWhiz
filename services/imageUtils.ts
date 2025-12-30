export const compressImage = async (base64Str: string, maxWidth = 800, quality = 0.6): Promise<string> => {
  if (!base64Str || !base64Str.startsWith('data:image')) return base64Str;
  
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
          ctx.fillStyle = '#FFFFFF'; // Prevent transparent backgrounds turning black in JPEG
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
      } else {
          resolve(base64Str);
      }
    };
    img.onerror = (e) => {
        console.error("Image compression error", e);
        resolve(base64Str);
    };
  });
};