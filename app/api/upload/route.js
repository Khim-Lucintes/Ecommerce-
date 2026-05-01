import { v2 as cloudinary } from 'cloudinary';
import { cookies } from 'next/headers';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';

// Cloudinary config — values read from .env.local
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
    try {
        // Authenticate seller
        const cookieStore = await cookies();
        const payload = verifyToken(cookieStore.get(COOKIE_NAME)?.value);
        if (!payload || payload.role !== 'seller') {
            return Response.json({ error: 'Seller access required' }, { status: 403 });
        }

        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return Response.json({ error: 'No file provided' }, { status: 400 });
        }

        // Convert file to Buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary if configured
        if (process.env.CLOUDINARY_CLOUD_NAME) {
            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: 'ecommerce_products' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                uploadStream.end(buffer);
            });
            return Response.json({ url: result.secure_url }, { status: 201 });
        } else {
            // Fallback: save locally
            const fs = await import('fs/promises');
            const path = await import('path');
            
            const uploadDir = path.join(process.cwd(), 'public', 'uploads');
            try {
                await fs.mkdir(uploadDir, { recursive: true });
            } catch (e) {}

            const ext = file.name.split('.').pop();
            const fileName = `product_${Date.now()}_${Math.round(Math.random() * 1000)}.${ext}`;
            const filePath = path.join(uploadDir, fileName);
            
            await fs.writeFile(filePath, buffer);
            
            return Response.json({ url: `/uploads/${fileName}` }, { status: 201 });
        }
    } catch (error) {
        console.error('[Upload API Error]', error);
        return Response.json({ error: 'Image upload failed' }, { status: 500 });
    }
}
