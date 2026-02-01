'use client';
import { useState } from 'react';
import { uploadImages } from '@/lib/supabaseClient';

type Props = {
  value: string[];
  onChange: (urls: string[]) => void;
};

export default function ImageUpload({ value, onChange }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setFiles(selected);
  };

  const handleUpload = async () => {
    setUploading(true);
    const urls = await uploadImages(files);
    onChange(urls);
    setUploading(false);
  };

  return (
    <div>
      <input type="file" multiple accept="image/*" onChange={handleFileChange} />
      <button type="button" onClick={handleUpload} className="bg-gray-700 text-white px-3 py-1 rounded ml-2" disabled={uploading || files.length === 0}>{uploading ? 'Uploading...' : 'Upload'}</button>
      <div className="flex gap-2 mt-2 flex-wrap">
        {value.map((url, i) => (
          <img key={i} src={url} alt="car" className="w-20 h-20 object-cover rounded" />
        ))}
      </div>
    </div>
  );
}
