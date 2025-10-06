// src/server/storage.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_KEY!
  }
});

const BUCKET = process.env.AZORA_EXPORT_BUCKET!;

export async function uploadExport(buffer: Buffer, filename: string) {
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: filename,
    Body: buffer,
    ContentType: 'application/zip'
  }));

  // Signed URL valid for 7 days
  return getSignedUrl(s3, new PutObjectCommand({
    Bucket: BUCKET,
    Key: filename
  }), { expiresIn: 60 * 60 * 24 * 7 });
}
