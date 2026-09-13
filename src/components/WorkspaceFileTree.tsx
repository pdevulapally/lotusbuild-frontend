import { ChevronRight, File, Folder } from 'lucide-react'

type FileEntry = { id: string; file: string }
type TreeNode =
  | { kind: 'folder'; name: string; path: string; children: TreeNode[] }
  | { kind: 'file'; name: string; path: string; sessionId: string }

function buildTree(files: FileEntry[]): TreeNode[] {
  const root: TreeNode[] = []
  for (const file of files) {
    const parts = file.file.split('/')
    let children = root
    parts.forEach((name, index) => {
      const path = parts.slice(0, index + 1).join('/')
      if (index === parts.length - 1) {
        children.push({ kind: 'file', name, path, sessionId: file.id })
      } else {
        let folder = children.find((node) => node.kind === 'folder' && node.name === name)
        if (!folder) {
          folder = { kind: 'folder', name, path, children: [] }
          children.push(folder)
        }
        if (folder.kind === 'folder') children = folder.children
      }
    })
  }
  return root
}

function TreeItems({ nodes, selectedId, onSelect }: { nodes: TreeNode[]; selectedId: string; onSelect: (id: string) => void }) {
  return (
    <ul>
      {nodes.map((node) => (
        <li key={node.path}>
          {node.kind === 'folder' ? (
            <details className="wp-tree-folder" open>
              <summary><ChevronRight className="wp-tree-chevron" size={12} aria-hidden="true" /><Folder size={14} strokeWidth={1.5} aria-hidden="true" /><span>{node.name}</span></summary>
              <TreeItems nodes={node.children} selectedId={selectedId} onSelect={onSelect} />
            </details>
          ) : (
            <button type="button" aria-label={`Open ${node.path}`} aria-pressed={selectedId === node.sessionId} title={node.path} onClick={() => onSelect(node.sessionId)}>
              <File size={13} strokeWidth={1.5} aria-hidden="true" /><span>{node.name}</span>
            </button>
          )}
        </li>
      ))}
    </ul>
  )
}

export default function WorkspaceFileTree({ files, selectedId, onSelect }: { files: FileEntry[]; selectedId: string; onSelect: (id: string) => void }) {
  return <TreeItems nodes={buildTree(files)} selectedId={selectedId} onSelect={onSelect} />
}
