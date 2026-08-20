from app.core.ai_provider import AIProvider


class ImplementationAgent:
    SYSTEM_PROMPT = """You are an expert software developer. Given an implementation plan and repository context,
generate the actual code changes. Return ONLY valid JSON with this structure:
[
    {
        "file": "relative/path/to/file",
        "operation": "create" or "modify",
        "content": "complete file content for create, or the modified section for modify",
        "diff": "unified diff showing changes"
    }
]
Rules:
- For 'create': include the COMPLETE file content
- For 'modify': include the EXACT changes with surrounding context
- Always include realistic diffs
- Follow the project's existing code style and conventions
- Ensure all imports are correct
- Handle edge cases and errors"""

    async def implement(self, plan: dict, repo_summary: dict, ai_provider: AIProvider) -> list[dict]:
        context = (
            f"Implementation Plan:\n{self._format_plan(plan)}\n\n"
            f"Repository Context:\n{self._format_repo(repo_summary)}\n\n"
            "Generate the code changes as JSON."
        )

        result = await ai_provider.chat_json(
            messages=[{"role": "user", "content": context}],
            system_prompt=self.SYSTEM_PROMPT,
        )
        return self._validate_changes(result)

    def _format_plan(self, plan: dict) -> str:
        parts = [f"Goal: {plan.get('goal', '')}"]
        for step in plan.get("steps", []):
            parts.append(f"Step {step.get('id', '?')}: {step.get('description', '')}")
            if step.get("files_involved"):
                parts.append(f"  Files: {', '.join(step['files_involved'])}")
        parts.append(f"Files to modify: {', '.join(plan.get('files_to_modify', []))}")
        parts.append(f"Files to create: {', '.join(plan.get('files_to_create', []))}")
        if plan.get("dependencies"):
            parts.append(f"Dependencies needed: {', '.join(plan['dependencies'])}")
        return "\n".join(parts)

    def _format_repo(self, summary: dict) -> str:
        parts = []
        parts.append(f"Project: {summary.get('name', 'unknown')}")
        parts.append(f"Languages: {', '.join(summary.get('languages', {}).keys())}")
        parts.append(f"Frameworks: {', '.join(summary.get('frameworks', []))}")
        structure = summary.get("structure", {})
        if structure:
            parts.append(f"File structure:\n{self._compact_structure(structure)}")
        deps = summary.get("dependencies", {})
        if deps:
            for ecosystem, pkgs in deps.items():
                parts.append(f"{ecosystem} dependencies: {', '.join(pkgs[:20])}")
        return "\n".join(parts)

    def _compact_structure(self, structure: dict, depth: int = 0, max_depth: int = 2) -> str:
        if depth >= max_depth:
            return "  " * depth + "..."
        lines = []
        for key, value in structure.items():
            if value is None:
                lines.append("  " * depth + key)
            else:
                lines.append("  " * depth + key + "/")
                lines.append(self._compact_structure(value, depth + 1, max_depth))
        return "\n".join(lines)

    def _validate_changes(self, result) -> list[dict]:
        if not isinstance(result, list):
            if isinstance(result, dict) and "changes" in result:
                result = result["changes"]
            else:
                result = [result] if isinstance(result, dict) else []

        validated = []
        for change in result:
            if not isinstance(change, dict):
                continue
            validated.append({
                "file": change.get("file", change.get("file_path", "")),
                "operation": change.get("operation", "modify"),
                "content": change.get("content", ""),
                "diff": change.get("diff", ""),
            })
        return validated
