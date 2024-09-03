import { Code2, Github } from "lucide-react";

export function Header() {
  return (
    <header className="p-2">
      <nav className="flex justify-between md:items-center">
        <h1 className="text-lg md:text-2xl md:flex">
          <span className="flex items-center font-bold text-red-500">
            <Code2 />
            <span className="ml-2">Javascript Playground</span>
          </span>
          <span className="flex md:ml-2 text-slate-500">
            <span className="hidden md:inline">—</span> Write & run Javascript
            Code
          </span>
        </h1>
        <a
          href="https://github.com/abednego-s/javascript-playground"
          className="flex items-center justify-center w-12 h-12 border-2 border-black rounded-full"
        >
          <Github size={28} />
        </a>
      </nav>
    </header>
  );
}
