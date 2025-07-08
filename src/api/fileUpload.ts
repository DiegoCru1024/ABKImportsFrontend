import { API_URL } from "../../config";

export async function uploadMultipleFiles(files: File[]): Promise<{ urls: string[]; message: string }> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  const access_token = localStorage.getItem("access_token");
  const response = await fetch(
    `${API_URL}/file-upload/upload-multiple`,
    {
      method: "POST",
      headers: {
        Authorization: access_token ? `Bearer ${access_token}` : "",
      },
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(`Error uploading files: ${response.status}`);
  }

  return response.json();
}

export async function deleteFile(fileUrl: string): Promise<{ message: string }> {
  const access_token = localStorage.getItem("access_token");
  const response = await fetch(
    `${API_URL}/file-upload/delete`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: access_token ? `Bearer ${access_token}` : "",
      },
      body: JSON.stringify({ fileUrl }),
    }
  );

  if (!response.ok) {
    throw new Error(`Error deleting file: ${response.status}`);
  }

  return response.json();
} 