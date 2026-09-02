import type { Spec } from '@json-render/core'
import type { AppSpec } from '../../core'

export function toJsonRenderSpec(spec: AppSpec): Spec {
  return {
    root: spec.rootId,
    elements: Object.fromEntries(
      Object.entries(spec.nodes).map(([id, node]) => [
        id,
        {
          type: node.type,
          props: node.props,
          children: node.children ?? [],
        },
      ]),
    ),
  }
}
