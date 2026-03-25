import { getSupabase } from './supabase';

export const StorageService = {
  /**
   * Generates a signed URL for secure ad media uploads
   */
  async getUploadUrl(bucket: string, path: string) {
    const { data, error } = await getSupabase().storage
      .from(bucket)
      .createSignedUploadUrl(path);

    if (error) throw error;
    return data;
  },

  /**
   * Generates a temporary public URL for ad playback
   */
  async getPlaybackUrl(bucket: string, path: string, expiresIn = 3600) {
    const { data, error } = await getSupabase().storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) throw error;
    return data.signedUrl;
  }
};
