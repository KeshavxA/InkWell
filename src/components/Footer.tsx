export default function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 mt-auto transition-colors">
      <div className="max-w-7xl mx-auto py-8 px-4 flex flex-col items-center justify-center sm:px-6 lg:px-8">
        <p className="text-slate-500 dark:text-slate-400 text-sm text-center font-medium">
          &copy; {new Date().getFullYear()} InkWell. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
