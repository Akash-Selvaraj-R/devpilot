import os
from pathlib import Path

import git

from app.core.config import settings


class RepoService:
    def __init__(self) -> None:
        self.projects_dir = settings.PROJECTS_DIR
        os.makedirs(self.projects_dir, exist_ok=True)

    def clone_repo(self, url: str, dest_path: str) -> str:
        target = os.path.join(self.projects_dir, dest_path)
        if os.path.exists(target):
            import shutil
            shutil.rmtree(target)
        try:
            git.Repo.clone_from(url, target, depth=1)
        except git.GitCommandError as e:
            raise RuntimeError(f"Failed to clone repository: {e}") from e
        return target

    def get_repo_path(self, project_id: str) -> str:
        return os.path.join(self.projects_dir, project_id)

    def list_files(self, path: str, max_depth: int = 5) -> list[str]:
        files: list[str] = []
        root = Path(path)
        if not root.exists():
            return files
        for dirpath, dirnames, filenames in os.walk(root):
            depth = len(Path(dirpath).relative_to(root).parts)
            if depth >= max_depth:
                dirnames.clear()
                continue
            dirnames[:] = [d for d in dirnames if d not in {".git", "node_modules", "__pycache__", ".venv", "venv", "dist", "build"}]
            for f in filenames:
                rel = os.path.relpath(os.path.join(dirpath, f), root)
                files.append(rel)
        return sorted(files)

    def read_file(self, path: str) -> str:
        try:
            with open(path, encoding="utf-8", errors="replace") as f:
                return f.read()
        except Exception as e:
            return f"Error reading file: {e}"

    def write_file(self, path: str, content: str) -> None:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
