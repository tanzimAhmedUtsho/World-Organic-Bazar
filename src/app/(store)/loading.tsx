export default function StoreLoading() {
  return <main className="store-loading" aria-label="Loading the market"><div className="loading-kicker" /><div className="loading-title" /><div className="loading-title short" /><div className="loading-grid">{Array.from({ length: 4 }, (_, index) => <div className="loading-product" key={index}><div /><span /><span /></div>)}</div></main>;
}
