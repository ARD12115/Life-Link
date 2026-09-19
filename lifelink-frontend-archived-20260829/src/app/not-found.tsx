export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary">
      <div className="text-center p-8">
        <h1 className="text-6xl font-bold text-primary-600 dark:text-primary-400 mb-4">404</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">Page not found</p>
        <a href="/" className="btn-primary">Go Home</a>
      </div>
    </div>
  );
}