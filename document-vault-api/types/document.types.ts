export interface Document {
  id: string;
  name: string;
  description: string;
  tags: string[];
  originalFileName: string | null;
  mimeType: string | null;
  size: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentInput {
  name: string;
  description: string;
  tags: string[];
}
