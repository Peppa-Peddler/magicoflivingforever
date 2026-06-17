import fs from 'fs';
import path from 'path';
import ImageViewer from './ImageViewer';

interface ImageData {
  id: number;
  src: string;
  duration: number;
}

async function getImages(): Promise<ImageData[]> {
  try {
    const filePath = path.join(process.cwd(), 'public', 'images.json');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const images = JSON.parse(fileContent);
    return images;
  } catch (error) {
    console.error('Error loading images.json:', error);
    return [];
  }
}

export default async function Home() {
  const images = await getImages();

  return (
    <main className="w-full">
      <ImageViewer images={images} />
    </main>
  );
}
