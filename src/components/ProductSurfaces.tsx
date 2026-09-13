import './ProductSurfaces.css'

const SURFACES = [
  {
    name: 'Sessions',
    body: 'The job you come back to. Agent, history, and files stay in the session.',
  },
  {
    name: 'Agents',
    body: 'See your agents, their subagents, assigned work, and status in one place.',
  },
  {
    name: 'Organizations',
    body: 'Who can see the work. Sessions and runs are scoped to the org.',
  },
]

function ProductSurfaces() {
  return (
    <section className="surfaces" id="sessions">
      <div className="surfaces-inner">
        <p className="surfaces-kicker">Workspace</p>
        <div className="surfaces-grid">
          {SURFACES.map((surface) => (
            <article key={surface.name}>
              <h3>{surface.name}</h3>
              <p>{surface.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProductSurfaces
