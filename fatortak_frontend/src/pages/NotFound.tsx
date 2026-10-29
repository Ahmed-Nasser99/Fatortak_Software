import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-6 dark:bg-slate-950">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-600 dark:text-brand-300">
          404
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          The page you are looking for does not exist or has moved.
        </p>
        <a
          href="/"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          Return to dashboard
        </a>
      </div>
    </div>
  );
};

export default NotFound;
