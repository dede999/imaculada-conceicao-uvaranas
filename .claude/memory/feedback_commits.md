---
name: Atomic commits and commit log as documentation
description: User wants atomic commits made strategically during and after commands; commit log should serve as passive documentation
type: feedback
---

Always make atomic commits: each commit represents one complete, self-contained logical change. Commit strategically during and after task completion — do not batch everything into one commit at the end.

**Why:** The user treats the git log as passive documentation — a reader should be able to understand what changed and why by reading commit history alone.

**How to apply:** During longer tasks, commit after each logical chunk is complete (e.g., config change → separate from component migration). Group by concern, not by file. Write commit messages that explain the *why*, not just the *what*.
