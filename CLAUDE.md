# WEMS v2 - Claude Development Guide

## Git Commit Convention

All commits MUST include both co-authors:
- `martty-code <nesalia.inc@gmail.com>`
- `Claude Sonnet <noreply@anthropic.com>`

### Commit Message Format

```bash
git commit -m "$(cat <<'EOF'
Your commit message here

Co-Authored-By: martty-code <nesalia.inc@gmail.com>
Co-Authored-By: Claude Sonnet <noreply@anthropic.com>
EOF
)"
```

### Example

```bash
git commit -m "$(cat <<'EOF'
feat: add employee search functionality

Implement search bar with real-time filtering for employee list

Co-Authored-By: martty-code <nesalia.inc@gmail.com>
Co-Authored-By: Claude Sonnet <noreply@anthropic.com>
EOF
)"
```

## Development Guidelines

### Branching
- Create feature branches from `main`
- Use descriptive branch names: `feature/feature-name`
- Push regularly to remote for backup and review

### Code Style
- Follow existing patterns in the codebase
- Use TypeScript strict mode
- Prefer composition over inheritance
- Keep components small and focused

### Testing
- Test all mutations (create, update, delete)
- Verify optimistic updates work correctly
- Check error handling and rollback behavior
- Ensure loading states display properly

### TanStack Query Integration
- Use centralized query keys from `@/lib/query-keys`
- Implement optimistic updates for all mutations
- Invalidate related queries on mutations
- Handle errors with rollback to previous state
