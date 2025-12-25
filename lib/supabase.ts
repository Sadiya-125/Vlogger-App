import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_API_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Upload image to Supabase Storage
 * @param file - File to upload
 * @param bucket - Bucket name (default: vlogger-images)
 * @param folder - Optional folder path
 * @returns Public URL of uploaded image
 */
export async function uploadImage(
  file: File,
  bucket: string = "vlogger-images",
  folder?: string
): Promise<string> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Math.random()
    .toString(36)
    .substring(2)}-${Date.now()}.${fileExt}`;
  const filePath = folder ? `${folder}/${fileName}` : fileName;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(data.path);

  return publicUrl;
}

/**
 * Upload multiple images
 */
export async function uploadImages(
  files: File[],
  bucket: string = "vlogger-images",
  folder?: string
): Promise<string[]> {
  const uploadPromises = files.map((file) => uploadImage(file, bucket, folder));
  return Promise.all(uploadPromises);
}

/**
 * Delete image from Supabase Storage
 */
export async function deleteImage(
  url: string,
  bucket: string = "vlogger-images"
): Promise<void> {
  // Extract path from URL
  const path = url.split(`${bucket}/`)[1];

  if (!path) {
    throw new Error("Invalid image URL");
  }

  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    throw new Error(`Failed to delete image: ${error.message}`);
  }
}

/**
 * Delete multiple images
 */
export async function deleteImages(
  urls: string[],
  bucket: string = "vlogger-images"
): Promise<void> {
  const deletePromises = urls.map((url) => deleteImage(url, bucket));
  await Promise.all(deletePromises);
}
