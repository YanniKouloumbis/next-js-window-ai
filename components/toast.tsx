import Link from "next/link";

export default function InstallationToast() {
  return (
    <div className="bg-blue-500 text-white p-4 rounded-lg shadow-md flex items-center space-x-2">
      <div>Please visit</div>
      <Link
        href="https://windowai.io"
        target="_blank"
        rel="noopener noreferrer"
        className="underline font-semibold"
      >
        windowai.io
      </Link>
      <div>to install window.ai</div>
    </div>
  );
}
