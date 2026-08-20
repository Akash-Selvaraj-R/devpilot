from app.core.ai_provider import AIProvider


class PlanningAgent:
    SYSTEM_PROMPT = """You are a senior software architect. Given a repository summary and a task description,
generate a detailed implementation plan. Return ONLY valid JSON with this structure:
{
    "goal": "string - clear goal description",
    "steps": [
        {"id": 1, "description": "step description", "files_involved": ["file1", "file2"]}
    ],
    "files_to_modify": ["existing files to change"],
    "files_to_create": ["new files to create"],
    "dependencies": ["new packages or libraries needed"],
    "testing_strategy": "how to test the implementation"
}
Be specific about file paths based on the repo structure."""

    async def plan(self, repo_summary: dict, task: str, relevant_files: list[str], ai_provider: AIProvider) -> dict:
        context = (
            f"Repository Summary:\n{self._format_summary(repo_summary)}\n\n"
            f"Task: {task}\n\n"
            f"Relevant Files:\n" + "\n".join(f"- {f}" for f in relevant_files) + "\n\n"
            "Generate a detailed implementation plan as JSON."
        )

        result = await ai_provider.chat_json(
            messages=[{"role": "user", "content": context}],
            system_prompt=self.SYSTEM_PROMPT,
        )
        return self._validate_plan(result)

    def _format_summary(self, summary: dict) -> str:
        parts = []
        parts.append(f"Name: {summary.get('name', 'unknown')}")
        parts.append(f"Languages: {', '.join(summary.get('languages', {}).keys())}")
        parts.append(f"Frameworks: {', '.join(summary.get('frameworks', []))}")
        parts.append(f"Files: {summary.get('files_count', 0)}")
        deps = summary.get("dependencies", {})
        if deps:
            parts.append(f"Dependencies: {', '.join(f'{k}: {len(v)} packages' for k, v in deps.items())}")
        parts.append(f"Entry Points: {', '.join(summary.get('entry_points', []))}")
        structure = summary.get("structure", {})
        if structure:
            parts.append(f"Structure: {self._flatten_structure(structure, max_depth=2)}")
        return "\n".join(parts)

    def _flatten_structure(self, structure: dict, max_depth: int, current_depth: int = 0) -> str:
        if current_depth >= max_depth:
            return "..."
        lines = []
        for key, value in structure.items():
            if value is None:
                lines.append(f"  {'  ' * current_depth}{key}")
            else:
                lines.append(f"  {'  ' * current_depth}{key}/")
                lines.append(self._flatten_structure(value, max_depth, current_depth + 1))
        return "\n".join(lines)

    def _validate_plan(self, plan: dict) -> dict:
        if "goal" not in plan:
            plan["goal"] = "Implement requested changes"
        if "steps" not in plan or not isinstance(plan["steps"], list):
            plan["steps"] = [{"id": 1, "description": "Implement changes", "files_involved": []}]
        if "files_to_modify" not in plan:
            plan["files_to_modify"] = []
        if "files_to_create" not in plan:
            plan["files_to_create"] = []
        if "dependencies" not in plan:
            plan["dependencies"] = []
        if "testing_strategy" not in plan:
            plan["testing_strategy"] = "Run existing tests and add new tests for changes"
        return plan
