export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto py-6 px-4 flex items-center justify-center sm:px-6 lg:px-8">
        <p className="text-gray-500 text-sm text-center">
          &copy; {new Date().getFullYear()} InkWell. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
