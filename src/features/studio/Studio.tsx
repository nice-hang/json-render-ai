import { useEffect, useState } from 'react'
import { JsonRenderCanvas } from '../../adapters/json-render/renderer'
import { registerWebMcpTools } from '../../adapters/webmcp/tools'
import type { CommandRuntime } from '../../core'
import { ActivityLog } from './ActivityLog'
import { ComponentTree } from './ComponentTree'
import { Inspector } from './Inspector'
import { useRuntime } from './use-runtime'

export function Studio({ runtime }: { runtime: CommandRuntime }) {
  const snapshot = useRuntime(runtime)
  const [selectedId, setSelectedId] = useState(snapshot.spec.rootId)
  const [webMcpState, setWebMcpState] = useState<
    'checking' | 'registered' | 'unavailable' | 'error'
  >(() => (document.modelContext ? 'checking' : 'unavailable'))
  useEffect(() => {
    const registration = registerWebMcpTools(runtime)
    if (!registration.available) {
      return registration.dispose
    }
    registration.registered
      .then(() => setWebMcpState('registered'))
      .catch(() => setWebMcpState('error'))
    return registration.dispose
  }, [runtime])

  const effectiveSelectedId = snapshot.spec.nodes[selectedId]
    ? selectedId
    : snapshot.spec.rootId
  const selectedNode = snapshot.spec.nodes[effectiveSelectedId]
  return (
    <div className="studio-shell">
      <header className="studio-header">
        <div className="brand-lockup">
          <span className="brand-mark">JR</span>
          <div>
            <strong>json-render builder</strong>
            <span>Human + Agent workspace</span>
          </div>
        </div>
        <div className="runtime-status">
          <span>Revision {snapshot.revision}</span>
          <span
            data-testid="webmcp-status"
            className={`protocol-state protocol-state--${webMcpState}`}
          >
            WebMCP {webMcpState}
          </span>
        </div>
      </header>
      <div className="studio-grid">
        <section
          className="studio-panel tree-panel"
          aria-labelledby="tree-title"
        >
          <div className="panel-heading">
            <div>
              <span className="section-kicker">Structure</span>
              <h2 id="tree-title">Components</h2>
            </div>
            <span className="panel-count">
              {Object.keys(snapshot.spec.nodes).length}
            </span>
          </div>
          <ComponentTree
            spec={snapshot.spec}
            selectedId={effectiveSelectedId}
            onSelect={setSelectedId}
          />
        </section>
        <section
          className="studio-panel canvas-panel"
          aria-labelledby="canvas-title"
        >
          <div className="panel-heading panel-heading--canvas">
            <div>
              <span className="section-kicker">Live output</span>
              <h2 id="canvas-title">Canvas</h2>
            </div>
            <span className="live-pill">
              <i /> Synced
            </span>
          </div>
          <div className="canvas-viewport" data-testid="live-canvas">
            <JsonRenderCanvas spec={snapshot.spec} />
          </div>
        </section>
        <section
          className="studio-panel inspector-panel"
          aria-labelledby="inspector-title"
        >
          <div className="panel-heading">
            <div>
              <span className="section-kicker">Selection</span>
              <h2 id="inspector-title">Properties</h2>
            </div>
          </div>
          <Inspector
            key={`${selectedNode.id}:${snapshot.revision}`}
            node={selectedNode}
            runtime={runtime}
            onSelect={setSelectedId}
          />
        </section>
        <section className="studio-panel log-panel" aria-labelledby="log-title">
          <div className="panel-heading panel-heading--log">
            <div>
              <span className="section-kicker">Shared history</span>
              <h2 id="log-title">Activity</h2>
            </div>
            <span className="panel-count">{snapshot.activity.length}</span>
          </div>
          <ActivityLog entries={snapshot.activity} />
        </section>
      </div>
    </div>
  )
}
