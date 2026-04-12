---
description: Create a commit message by analyzing git diffs
allowed-tools: Bash(git status:*), Bash(git diff --staged), Bash(git commit:*)
---

## Context:

- Current git status: !`git status`
- Current git diff: !`git diff --staged`

Analyze the staged Git changes above and generate appropriate commit messages. Use the present tense and explain why the changes were made, not just what was changed. If multiple files were modified or created, split them into logical, separate commits. In your response, include all suggested commits along with the files that should be included in each one.

## Commit types with emojis:

Only use the following emojis:

- ✨ `feat:` - New feature
- 🐛 `fix:` - Bug fix
- 🔨 `refactor:` - Refactoring code
- 📝 `docs:` - Documentation
- 🎨 `style:` - Styling/formatting
- ✅ `test:` - Tests
- ⚡ `perf:` - Performance

## Format:

Use the following format for making the commit message:

```
<emoji> <type>: <concise_description>
<optional_body_explaining_why>
```

## Output:

1. Show summary of changes currently staged
2. Propose commit message with appropriate emoji
3. Ask for confirmation before committing

DO NOT auto-commit - wait for user approval, and only commit if the user says so.
