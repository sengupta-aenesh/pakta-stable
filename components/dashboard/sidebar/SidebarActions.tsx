import { FolderPlus, Upload } from 'lucide-react';

export function SidebarActions({ onCreateFolder, onUploadContract }: {
  onCreateFolder: () => void;
  onUploadContract: () => void;
}) {
  return (
    <div className="sidebar-actions">
      <button className="sidebar-button" onClick={onCreateFolder}>
        <FolderPlus size={18} />
        <span>Create New Folder</span>
      </button>
      <button className="sidebar-button primary" onClick={onUploadContract}>
        <Upload size={18} />
        <span>Upload Contract (.docx)</span>
      </button>
    </div>
  );
}