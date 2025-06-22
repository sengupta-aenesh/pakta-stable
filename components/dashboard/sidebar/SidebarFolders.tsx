'use client';

import { useState } from 'react';
import { Folder, ChevronRight } from 'lucide-react';

interface FolderType {
  id: string;
  name: string;
  contractCount?: number;
  children?: FolderType[];
}

export function SidebarFolders({ folders, selectedFolder, onSelectFolder }: {
  folders: FolderType[];
  selectedFolder: FolderType | null;
  onSelectFolder: (folder: FolderType | null) => void;
}) {
  return (
    <div className="sidebar-folders">
      <div className="folders-container">
        {/* All Contracts item */}
        <div 
          className={`folder-item ${!selectedFolder ? 'active' : ''}`}
          onClick={() => onSelectFolder(null)}
        >
          <div className="folder-name">
            <Folder size={16} />
            <span>All Contracts</span>
          </div>
          <span className="folder-count">(2)</span>
        </div>
        
        {/* Folder items */}
        {folders.map((folder) => (
          <FolderItem 
            key={folder.id} 
            folder={folder} 
            depth={0}
            selectedFolder={selectedFolder}
            onSelectFolder={onSelectFolder}
          />
        ))}
      </div>
    </div>
  );
}

function FolderItem({ folder, depth, selectedFolder, onSelectFolder }: {
  folder: FolderType;
  depth: number;
  selectedFolder: FolderType | null;
  onSelectFolder: (folder: FolderType | null) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  return (
    <>
      <div 
        className={`folder-item ${selectedFolder?.id === folder.id ? 'active' : ''}`}
        style={{ paddingLeft: `${16 + depth * 20}px` }}
        onClick={() => onSelectFolder(folder)}
      >
        <div className="folder-name">
          {folder.children?.length > 0 && (
            <ChevronRight 
              size={14} 
              className={`folder-arrow ${isExpanded ? 'expanded' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            />
          )}
          <Folder size={16} />
          <span>{folder.name}</span>
        </div>
        <span className="folder-count">({folder.contractCount || 0})</span>
      </div>
      
      {isExpanded && folder.children?.map((child) => (
        <FolderItem 
          key={child.id} 
          folder={child} 
          depth={depth + 1}
          selectedFolder={selectedFolder}
          onSelectFolder={onSelectFolder}
        />
      ))}
    </>
  );
}