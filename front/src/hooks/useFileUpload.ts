import { useState, useEffect } from 'react';
import axios from 'axios';

export function useFileUpload(onSuccess: () => void) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(undefined);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const uploadFile = async () => {
    if (!selectedFile) return false;
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post('http://localhost:8000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.status === 201) {
        onSuccess();
        setSelectedFile(null);
        return true;
      }
    } catch (error) {
      console.error("Erro no upload", error);
    }
    return false;
  };

  return { selectedFile, setSelectedFile, previewUrl, uploadFile };
}
