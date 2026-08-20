import asyncio
import os
import time
from pathlib import Path


class TestAgent:
    TEST_COMMANDS = {
        "package.json": ["npm", "test"],
        "pytest.ini": ["pytest", "-v"],
        "pyproject.toml": ["pytest", "-v"],
        "setup.cfg": ["pytest", "-v"],
        "Cargo.toml": ["cargo", "test"],
        "go.mod": ["go", "test", "./..."],
        "Gemfile": ["bundle", "exec", "rspec"],
        "pom.xml": ["mvn", "test"],
        "build.gradle": ["gradle", "test"],
        "Makefile": ["make", "test"],
    }

    async def run_tests(self, project_path: str, test_command: str | None = None) -> dict:
        if test_command:
            command = test_command.split()
        else:
            command = self._detect_test_command(project_path)

        if not command:
            return {
                "command": "none",
                "exit_code": -1,
                "stdout": "",
                "stderr": "No test framework detected. Install pytest, jest, or specify a test command.",
                "duration": 0,
            }

        start_time = time.monotonic()
        try:
            process = await asyncio.create_subprocess_exec(
                *command,
                cwd=project_path,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            try:
                stdout_bytes, stderr_bytes = await asyncio.wait_for(process.communicate(), timeout=300)
            except asyncio.TimeoutError:
                process.kill()
                await process.wait()
                duration = int(time.monotonic() - start_time)
                return {
                    "command": " ".join(command),
                    "exit_code": -1,
                    "stdout": "",
                    "stderr": f"Test execution timed out after 300 seconds",
                    "duration": duration,
                }

            duration = int(time.monotonic() - start_time)
            return {
                "command": " ".join(command),
                "exit_code": process.returncode or 0,
                "stdout": stdout_bytes.decode("utf-8", errors="replace"),
                "stderr": stderr_bytes.decode("utf-8", errors="replace"),
                "duration": duration,
            }
        except FileNotFoundError:
            return {
                "command": " ".join(command),
                "exit_code": -1,
                "stdout": "",
                "stderr": f"Command '{command[0]}' not found. Is it installed?",
                "duration": int(time.monotonic() - start_time),
            }
        except Exception as e:
            return {
                "command": " ".join(command) if command else "none",
                "exit_code": -1,
                "stdout": "",
                "stderr": f"Test execution error: {str(e)}",
                "duration": int(time.monotonic() - start_time),
            }

    def _detect_test_command(self, project_path: str) -> list[str] | None:
        for marker, command in self.TEST_COMMANDS.items():
            marker_path = os.path.join(project_path, marker)
            if os.path.exists(marker_path):
                if marker == "package.json":
                    try:
                        import json
                        with open(marker_path, encoding="utf-8") as f:
                            pkg = json.load(f)
                        scripts = pkg.get("scripts", {})
                        if "test" in scripts:
                            return ["npm", "test"]
                    except Exception:
                        pass
                elif marker == "pyproject.toml":
                    try:
                        text = Path(marker_path).read_text(encoding="utf-8")
                        if "[tool.pytest" in text:
                            return ["pytest", "-v"]
                    except Exception:
                        pass
                return command
        return None
