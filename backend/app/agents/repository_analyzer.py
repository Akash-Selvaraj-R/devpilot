import os
from pathlib import Path

LANGUAGE_MAP: dict[str, str] = {
    ".py": "Python", ".js": "JavaScript", ".ts": "TypeScript", ".tsx": "TypeScript",
    ".jsx": "JavaScript", ".java": "Java", ".go": "Go", ".rs": "Rust", ".rb": "Ruby",
    ".php": "PHP", ".c": "C", ".cpp": "C++", ".cs": "C#", ".swift": "Swift",
    ".kt": "Kotlin", ".scala": "Scala", ".r": "R", ".m": "Objective-C",
    ".html": "HTML", ".css": "CSS", ".scss": "SCSS", ".less": "LESS",
    ".json": "JSON", ".yaml": "YAML", ".yml": "YAML", ".toml": "TOML",
    ".xml": "XML", ".sql": "SQL", ".sh": "Shell", ".bash": "Shell",
    ".md": "Markdown", ".txt": "Text", ".dockerfile": "Dockerfile",
}

FRAMEWORK_MARKERS: dict[str, list[str]] = {
    "React": ["react", "react-dom"],
    "Vue": ["vue", "nuxt"],
    "Angular": ["@angular/core"],
    "Next.js": ["next"],
    "Express": ["express"],
    "FastAPI": ["fastapi"],
    "Django": ["django"],
    "Flask": ["flask"],
    "Rails": ["rails"],
    "Spring": ["spring-boot", "springframework"],
    "Svelte": ["svelte"],
    "Remix": ["remix"],
    "NestJS": ["@nestjs/core"],
    "Laravel": ["laravel/framework"],
    "Fastify": ["fastify"],
    "Vite": ["vite"],
    "Webpack": ["webpack"],
    "TailwindCSS": ["tailwindcss"],
}


class RepositoryAnalyzer:
    def analyze(self, repo_path: str) -> dict:
        root = Path(repo_path)
        if not root.exists():
            return {"error": f"Path {repo_path} does not exist"}

        languages: dict[str, int] = {}
        frameworks: list[str] = []
        file_count = 0
        test_files: list[str] = []
        entry_points: list[str] = []
        structure: dict = {}
        dependencies: dict[str, list[str]] = {}

        for dirpath, dirnames, filenames in os.walk(root):
            rel_dir = os.path.relpath(dirpath, root)
            if rel_dir == ".":
                rel_dir = ""
            if any(skip in rel_dir for skip in [".git", "node_modules", "__pycache__", ".venv", "venv", "dist", "build", ".next"]):
                continue

            for filename in filenames:
                filepath = os.path.join(dirpath, filename)
                rel_path = os.path.relpath(filepath, root)
                file_count += 1

                ext = Path(filename).suffix.lower()
                lang = LANGUAGE_MAP.get(ext)
                if lang:
                    languages[lang] = languages.get(lang, 0) + 1

                if any(t in filename.lower() for t in ["test_", "_test.", ".test.", ".spec.", "test/"]):
                    test_files.append(rel_path)

                if filename in ["main.py", "app.py", "index.js", "index.ts", "index.tsx", "App.tsx", "App.jsx", "server.py", "server.js", "server.ts", "manage.py", "cmd/", "main.go", "main.rs", "Cargo.toml", "Program.cs"]:
                    entry_points.append(rel_path)

        deps = self._read_dependencies(root)
        if deps:
            dependencies = deps
            for marker_name, marker_deps in FRAMEWORK_MARKERS.items():
                if any(d in deps.get("npm", []) or d in deps.get("pip", []) for d in marker_deps):
                    frameworks.append(marker_name)

        structure = self._build_tree(root, 0, 3)

        return {
            "name": root.name,
            "languages": languages,
            "frameworks": frameworks,
            "files_count": file_count,
            "dependencies": dependencies,
            "entry_points": entry_points,
            "test_files": test_files,
            "structure": structure,
            "summary": self._build_summary(root.name, languages, frameworks, file_count, deps, entry_points),
        }

    def _read_dependencies(self, root: Path) -> dict[str, list[str]]:
        deps: dict[str, list[str]] = {}

        pkg_json = root / "package.json"
        if pkg_json.exists():
            try:
                import json
                data = json.loads(pkg_json.read_text(encoding="utf-8"))
                npm_deps = list(data.get("dependencies", {}).keys()) + list(data.get("devDependencies", {}).keys())
                deps["npm"] = npm_deps
            except Exception:
                pass

        req_txt = root / "requirements.txt"
        if req_txt.exists():
            try:
                lines = req_txt.read_text(encoding="utf-8").splitlines()
                deps["pip"] = [l.split("==")[0].split(">=")[0].split("<=")[0].strip().lower() for l in lines if l.strip() and not l.startswith("#")]
            except Exception:
                pass

        pyproject = root / "pyproject.toml"
        if pyproject.exists():
            try:
                text = pyproject.read_text(encoding="utf-8")
                pip_deps = []
                in_deps = False
                for line in text.splitlines():
                    if "dependencies" in line and "[" in line:
                        in_deps = True
                        continue
                    if in_deps and line.strip().startswith("]"):
                        in_deps = False
                        continue
                    if in_deps and line.strip():
                        pkg = line.strip().strip('"').strip("'").split("=")[0].split(">")[0].split("<")[0].strip()
                        if pkg:
                            pip_deps.append(pkg.lower())
                if pip_deps:
                    deps["pip"] = pip_deps
            except Exception:
                pass

        go_mod = root / "go.mod"
        if go_mod.exists():
            try:
                lines = go_mod.read_text(encoding="utf-8").splitlines()
                go_deps = [l.split()[-1] for l in lines if l.startswith("\t")]
                deps["go"] = go_deps
            except Exception:
                pass

        cargo_toml = root / "Cargo.toml"
        if cargo_toml.exists():
            try:
                text = cargo_toml.read_text(encoding="utf-8")
                rust_deps = []
                in_deps = False
                for line in text.splitlines():
                    if "[dependencies]" in line:
                        in_deps = True
                        continue
                    if in_deps and line.strip().startswith("["):
                        in_deps = False
                        continue
                    if in_deps and line.strip():
                        pkg = line.split("=")[0].strip()
                        if pkg:
                            rust_deps.append(pkg)
                deps["cargo"] = rust_deps
            except Exception:
                pass

        return deps

    def _build_tree(self, root: Path, current_depth: int, max_depth: int) -> dict:
        tree: dict = {}
        if current_depth >= max_depth:
            return tree
        try:
            entries = sorted(root.iterdir(), key=lambda e: (not e.is_dir(), e.name.lower()))
            for entry in entries:
                if entry.name.startswith(".") or entry.name in ["node_modules", "__pycache__", ".venv", "venv", "dist", "build", ".next"]:
                    continue
                if entry.is_dir():
                    tree[f"{entry.name}/"] = self._build_tree(entry, current_depth + 1, max_depth)
                else:
                    tree[entry.name] = None
        except PermissionError:
            pass
        return tree

    def _build_summary(self, name: str, languages: dict, frameworks: list, file_count: int, deps: dict, entry_points: list) -> str:
        parts = [f"Project '{name}'"]
        if languages:
            top_langs = sorted(languages.items(), key=lambda x: -x[1])[:5]
            parts.append(f"primary languages: {', '.join(f'{l} ({c})' for l, c in top_langs)}")
        if frameworks:
            parts.append(f"frameworks: {', '.join(frameworks)}")
        parts.append(f"{file_count} files")
        total_deps = sum(len(v) for v in deps.values())
        if total_deps:
            parts.append(f"{total_deps} dependencies")
        if entry_points:
            parts.append(f"entry points: {', '.join(entry_points[:3])}")
        return ". ".join(parts) + "."
