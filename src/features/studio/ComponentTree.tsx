import type { AppNode, AppSpec } from '../../core'

type ComponentTreeProps = {
  spec: AppSpec
  selectedId: string
  onSelect: (id: string) => void
}

function TreeNode({
  node,
  spec,
  selectedId,
  onSelect,
  depth,
}: {
  node: AppNode
  spec: AppSpec
  selectedId: string
  onSelect: (id: string) => void
  depth: number
}) {
  return (
    <li>
      <button
        type="button"
        className={`tree-node${selectedId === node.id ? ' tree-node--selected' : ''}`}
        style={{ paddingLeft: `${12 + depth * 14}px` }}
        onClick={() => onSelect(node.id)}
        aria-pressed={selectedId === node.id}
        aria-label={`${node.type} ${node.id}`}
      >
        <span className="tree-node__type">{node.type}</span>
        <span className="tree-node__id">{node.id}</span>
      </button>
      {node.children?.length ? (
        <ul>
          {node.children.map((childId) => (
            <TreeNode
              key={childId}
              node={spec.nodes[childId]}
              spec={spec}
              selectedId={selectedId}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </ul>
      ) : null}
    </li>
  )
}

export function ComponentTree({
  spec,
  selectedId,
  onSelect,
}: ComponentTreeProps) {
  return (
    <ul className="component-tree" aria-label="AppSpec component tree">
      <TreeNode
        node={spec.nodes[spec.rootId]}
        spec={spec}
        selectedId={selectedId}
        onSelect={onSelect}
        depth={0}
      />
    </ul>
  )
}
