import './ProductSurfaces.css'

const SURFACES = [
  {
    name: 'Sessions',
    body: 'A session is the thread. Prompt, plan, files, and preview stay in one place so you can leave and come back.',
  },
  {
    name: 'Agent runs',
    body: 'A run is one pass of the agent. The plan and the file changes belong to that run.',
  },
  {
    name: 'Organizations',
    body: 'Sessions live under an organization. That is how access and ownership are scoped.',
  },
]

function ProductSurfaces() {
  return (
    <section className="surfaces" id="workspace">
      <div className="surfaces-inner">
        <header className="surfaces-header">
          <span className="surfaces-kicker">Workspace</span>
          <h2 className="surfaces-title">Sessions, runs, and orgs.</h2>
        </header>

        <dl className="surfaces-list">
          {SURFACES.map((surface) => (
            <div key={surface.name} className="surfaces-row">
              <dt>{surface.name}</dt>
              <dd>{surface.body}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

export default ProductSurfaces
