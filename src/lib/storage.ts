/**
 * Storage Provider Utility
 * Handles file uploads to either local storage (fallback) 
 * or S3-compatible services (Cloudflare R2, AWS S3, DigitalOcean Spaces).
 */

import fs from "fs";
import path from "path";

export async function uploadFile(file: File, folder: string = "documents"): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // PRODUCTION READY: If S3 environment variables exist, integrate here.
  // For now, we use Local Persistent Storage.
  
  const filename = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
  
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const fullPath = path.join(uploadDir, filename);
  fs.writeFileSync(fullPath, buffer);

  // Return the public URL
  return `/uploads/${folder}/${filename}`;
}

export async function deleteFile(url: string) {
  if (url.startsWith("/uploads/")) {
    const fullPath = path.join(process.cwd(), "public", url);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }
}
