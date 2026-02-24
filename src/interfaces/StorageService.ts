export interface UploadResult {
  url: string;
  path: string;
  size: number;
  mimeType: string;
}

export interface StorageService {
  /** Upload a file and return its public URL */
  upload(bucket: string, path: string, file: File | Blob): Promise<UploadResult>;

  /** Get a signed (temporary) URL for a private file */
  getSignedUrl(bucket: string, path: string, expiresInSeconds?: number): Promise<string>;

  /** Get the public URL for a file */
  getPublicUrl(bucket: string, path: string): string;

  /** Delete a file */
  delete(bucket: string, path: string): Promise<void>;

  /** List files in a directory */
  list(bucket: string, prefix?: string): Promise<string[]>;
}
