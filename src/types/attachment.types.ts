// ============================================================================
//  CENTINELA — Attachment Types
// ============================================================================

export interface Attachment {
  id: string;
  parentId: string;
  fileName: string;
  fileType: string;
  fileData: Blob | File;
}
