import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, isFirebaseConfigured } from './config';

export async function uploadDisasterImage(file: File, pathPrefix = 'disasters'): Promise<string> {
  // If live Firebase Storage is available
  if (isFirebaseConfigured && storage) {
    try {
      const storageRef = ref(storage, `${pathPrefix}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      return await getDownloadURL(snapshot.ref);
    } catch (err) {
      console.warn('[Firebase Storage] Upload failed, falling back to Data URL preview:', err);
    }
  }

  // Resilient offline Data URL conversion
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
