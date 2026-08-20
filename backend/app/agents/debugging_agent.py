from app.core.ai_provider import AIProvider


class DebuggingAgent:
    SYSTEM_PROMPT = """You are an expert debugging engineer. Analyze test failures and source code to diagnose issues.
Return ONLY valid JSON with this structure:
{
    "root_cause": "detailed explanation of what went wrong",
    "suggested_fix": "specific code changes or actions to fix the issue",
    "affected_files": ["list of files that need changes"],
    "confidence": 0.0-1.0
}
Be specific and provide actionable fixes."""

    async def diagnose(self, task: dict, implementation: list[dict], test_output: dict, source_code: dict, ai_provider: AIProvider) -> dict:
        context = (
            f"Task: {task.get('description', 'unknown')}\n\n"
            f"Implementation Changes:\n{self._format_changes(implementation)}\n\n"
            f"Test Results:\n{self._format_test_output(test_output)}\n\n"
            f"Relevant Source Code:\n{self._format_source(source_code)}\n\n"
            "Diagnose the root cause and suggest a fix."
        )

        result = await ai_provider.chat_json(
            messages=[{"role": "user", "content": context}],
            system_prompt=self.SYSTEM_PROMPT,
        )
        return self._validate_diagnosis(result)

    def _format_changes(self, changes: list[dict]) -> str:
        if not changes:
            return "No changes recorded"
        parts = []
        for change in changes:
            parts.append(f"File: {change.get('file', 'unknown')} ({change.get('operation', 'unknown')})")
            if change.get("content"):
                content = change["content"]
                if len(content) > 2000:
                    content = content[:2000] + "\n... (truncated)"
                parts.append(content)
        return "\n\n".join(parts)

    def _format_test_output(self, test_output: dict) -> str:
        parts = [f"Command: {test_output.get('command', 'unknown')}"]
        parts.append(f"Exit Code: {test_output.get('exit_code', -1)}")
        parts.append(f"Duration: {test_output.get('duration', 0)}s")
        stdout = test_output.get("stdout", "")
        if stdout:
            if len(stdout) > 3000:
                stdout = stdout[-3000:]
            parts.append(f"STDOUT:\n{stdout}")
        stderr = test_output.get("stderr", "")
        if stderr:
            if len(stderr) > 3000:
                stderr = stderr[-3000:]
            parts.append(f"STDERR:\n{stderr}")
        return "\n".join(parts)

    def _format_source(self, source_code: dict) -> str:
        if not source_code:
            return "No source code available"
        parts = []
        for filepath, content in source_code.items():
            parts.append(f"--- {filepath} ---")
            if isinstance(content, str):
                if len(content) > 3000:
                    content = content[:3000] + "\n... (truncated)"
                parts.append(content)
        return "\n\n".join(parts)

    def _validate_diagnosis(self, result: dict) -> dict:
        if "root_cause" not in result:
            result["root_cause"] = "Unable to determine root cause"
        if "suggested_fix" not in result:
            result["suggested_fix"] = "Review the implementation and test output manually"
        if "affected_files" not in result or not isinstance(result["affected_files"], list):
            result["affected_files"] = []
        if "confidence" not in result:
            result["confidence"] = 0.5
        try:
            result["confidence"] = max(0.0, min(1.0, float(result["confidence"])))
        except (ValueError, TypeError):
            result["confidence"] = 0.5
        return result
