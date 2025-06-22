'use client';

import { useState } from 'react';
import { SidebarLogo } from './SidebarLogo';
import { SidebarActions } from './SidebarActions';
import { SidebarSearch } from './SidebarSearch';
import { SidebarFolders } from './SidebarFolders';
import { SidebarUser } from './SidebarUser';

interface FolderType {
  id: string;
  name: string;
  contractCount?: number;
  children?: FolderType[];
}

export function Sidebar({ 
  folders, 
  selectedFolder, 
  userEmail,
  onCreateFolder,
  onUploadContract,
  onSelectFolder,
  onLogout 
}: {
  folders: FolderType[];
  selectedFolder: FolderType | null;
  userEmail: string;
  onCreateFolder: () => void;
  onUploadContract: () => void;
  onSelectFolder: (folder: FolderType | null) => void;
  onLogout: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  
  return (
    <aside className="sidebar">
      <SidebarLogo />
      <SidebarActions 
        onCreateFolder={onCreateFolder}
        onUploadContract={onUploadContract}
      />
      <SidebarSearch 
        value={searchQuery}
        onChange={setSearchQuery}
      />
      <SidebarFolders 
        folders={folders}
        selectedFolder={selectedFolder}
        onSelectFolder={onSelectFolder}
      />
      <SidebarUser 
        userEmail={userEmail}
        onLogout={onLogout}
      />
    </aside>
  );
}