import { put, del, list } from '@vercel/blob';

export async function uploadToBlob(
  file: File,
  folder: string
): Promise<{ url: string; pathname: string } | null> {
  try {
    const filename = `${folder}/${Date.now()}-${file.name}`;
    
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: true,
    });

    return {
      url: blob.url,
      pathname: blob.pathname,
    };
  } catch (error) {
    console.error('Blob upload error:', error);
    return null;
  }
}

export async function deleteFromBlob(pathname: string): Promise<boolean> {
  try {
    await del(pathname);
    return true;
  } catch (error) {
    console.error('Blob deletion error:', error);
    return false;
  }
}

export async function listBlobFiles(prefix?: string) {
  try {
    const { blobs } = await list({ prefix });
    return blobs;
  } catch (error) {
    console.error('Blob list error:', error);
    return [];
  }
}

// Helper to convert base64 to File object
export function base64ToFile(base64: string, filename: string): File {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], filename, { type: mime });
}

// Upload blessing card image
export async function uploadBlessingCard(
  base64Image: string,
  userId: string,
  deity: string
): Promise<string | null> {
  try {
    const file = base64ToFile(base64Image, `blessing-${userId}-${deity}.png`);
    const result = await uploadToBlob(file, 'blessing-cards');
    return result?.url || null;
  } catch (error) {
    console.error('Blessing card upload error:', error);
    return null;
  }
}

// Upload content media
export async function uploadContentMedia(
  file: File,
  type: 'image' | 'video'
): Promise<string | null> {
  try {
    const folder = type === 'image' ? 'content/images' : 'content/videos';
    const result = await uploadToBlob(file, folder);
    return result?.url || null;
  } catch (error) {
    console.error('Content media upload error:', error);
    return null;
  }
}

// Check if Blob is configured
export function isBlobConfigured(): boolean {
  return !!(process.env.BLOB_READ_WRITE_TOKEN && process.env.BLOB_READ_WRITE_TOKEN !== 'placeholder');
}
