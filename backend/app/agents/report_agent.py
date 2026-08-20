import json

from app.core.ai_provider import AIProvider


class ReportAgent:
    SYSTEM_PROMPT = """You are a technical report writer for software engineering tasks.
Given the task details, code changes, and test results, generate a comprehensive engineering report.
Return ONLY valid JSON with this structure:
{
    "summary": "2-3 sentence executive summary",
    "files_changed": ["list of files that were modified/created"],
    "features_implemented": ["list of features or changes implemented"],
    "tests_passed": 0,
    "tests_failed": 0,
    "issues": ["any known issues or limitations"],
    "security_considerations": ["security notes about the changes"],
    "next_steps": ["recommended follow-up actions"],
    "score": {
        "completeness": 0-10,
        "code_quality": 0-10,
        "test_coverage": 0-10,
        "documentation": 0-10,
        "overall": 0-10
    }
}
Be factual and base the report on the actual changes and test results provided."""

    async def generate(self, task: dict, changes: list[dict], test_results: dict, ai_provider: AIProvider) -> dict:
        context = (
            f"Task Description: {task.get('description', 'unknown')}\n\n"
            f"Code Changes Made:\n{self._format_changes(changes)}\n\n"
            f"Test Results:\n{self._format_test_results(test_results)}\n\n"
            "Generate the engineering report."
        )

        result = await ai_provider.chat_json(
            messages=[{"role": "user", "content": context}],
            system_prompt=self.SYSTEM_PROMPT,
        )
        return self._validate_report(result, changes, test_results)

    def _format_changes(self, changes: list[dict]) -> str:
        if not changes:
            return "No changes recorded"
        parts = []
        for change in changes:
            parts.append(
                f"File: {change.get('file', 'unknown')} | "
                f"Operation: {change.get('operation', 'unknown')}"
            )
            if change.get("diff"):
                diff = change["diff"]
                if len(diff) > 1500:
                    diff = diff[:1500] + "\n... (truncated)"
                parts.append(f"Diff:\n{diff}")
        return "\n\n".join(parts)

    def _format_test_results(self, test_results: dict) -> str:
        parts = [
            f"Command: {test_results.get('command', 'none')}",
            f"Exit Code: {test_results.get('exit_code', -1)}",
            f"Duration: {test_results.get('duration', 0)}s",
        ]
        stdout = test_results.get("stdout", "")
        if stdout:
            lines = stdout.strip().split("\n")
            passed = sum(1 for l in lines if "PASSED" in l.upper() or "ok" in l.lower())
            failed = sum(1 for l in lines if "FAILED" in l.upper() or "error" in l.lower())
            parts.append(f"Tests passed: {passed}")
            parts.append(f"Tests failed: {failed}")
            if len(stdout) > 2000:
                stdout = stdout[-2000:]
            parts.append(f"Output:\n{stdout}")
        stderr = test_results.get("stderr", "")
        if stderr:
            if len(stderr) > 1000:
                stderr = stderr[-1000:]
            parts.append(f"Errors:\n{stderr}")
        return "\n".join(parts)

    def _validate_report(self, report: dict, changes: list[dict], test_results: dict) -> dict:
        if "summary" not in report:
            report["summary"] = "Report generated based on implementation changes"
        if "files_changed" not in report:
            report["files_changed"] = [c.get("file", "") for c in changes]
        if "features_implemented" not in report:
            report["features_implemented"] = []
        if "tests_passed" not in report:
            report["tests_passed"] = 0
        if "tests_failed" not in report:
            report["tests_failed"] = 0
        if "issues" not in report or not isinstance(report["issues"], list):
            report["issues"] = []
        if "security_considerations" not in report or not isinstance(report["security_considerations"], list):
            report["security_considerations"] = []
        if "next_steps" not in report or not isinstance(report["next_steps"], list):
            report["next_steps"] = []
        if "score" not in report or not isinstance(report["score"], dict):
            report["score"] = {
                "completeness": 5,
                "code_quality": 5,
                "test_coverage": 5,
                "documentation": 5,
                "overall": 5,
            }
        for key in ["completeness", "code_quality", "test_coverage", "documentation", "overall"]:
            if key not in report["score"]:
                report["score"][key] = 5
            try:
                report["score"][key] = max(0, min(10, int(report["score"][key])))
            except (ValueError, TypeError):
                report["score"][key] = 5
        return report
