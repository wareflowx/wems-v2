# WEMS v2 - Claude Development Guide

## Language

You MUST always respond in English, regardless of the language used by the user.

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

### Component Analysis
- When you see a component you don't know, always read its source code first to understand its default styling and behavior
- Check if the component already has built-in styling (e.g., Card component has bg-card by default) before adding redundant classes
- Remove any redundant or duplicate styling to keep code clean

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
- Use `setQueriesData()` with `lists()` for filtered views (not `list('{}')`)
- Always use proper types (avoid `any[]`)
- Add toast notifications for error handling

## CI/CD & Code Review

### Marty PR Review Workflow

The project uses **Marty AI** for automated PR reviews via GitHub Actions.

**Workflow Location:** `.github/workflows/marty-pr-review.yml`

**Trigger Events:**
- PR opened
- PR synchronized (new commits pushed)
- PR marked as ready for review
- PR reopened

**What Marty Reviews:**
1. **Code Quality**
   - Best practices and design patterns
   - Error handling and edge cases
   - No code duplication (DRY principle)
   - Clear and maintainable code structure

2. **Security**
   - No hardcoded secrets or credentials
   - Proper input validation and sanitization
   - SQL injection and XSS vulnerabilities
   - Authentication and authorization checks
   - Sensitive data handling

3. **Performance**
   - Performance bottlenecks
   - Efficient database queries
   - Proper caching strategies
   - Resource cleanup and memory leaks

4. **Testing**
   - Adequate test coverage
   - Edge cases covered
   - Test quality and assertions

5. **Documentation**
   - README updated if needed
   - Inline comments for complex logic
   - API documentation updated
   - Breaking changes documented

**External Dependencies:**
- **Z.ai API** - AI model provider (glm-4.7, glm-4.5-air)
- **GitHub App Secrets** - `MARTY_APP_ID`, `MARTY_APP_PRIVATE_KEY`

**Note:** This workflow is intentionally included in the repository for automated code review on all PRs.

**Configuration:**
```yaml
env:
  ANTHROPIC_BASE_URL: https://api.z.ai/api/anthropic
  ANTHROPIC_DEFAULT_SONNET_MODEL: glm-4.7
  ANTHROPIC_DEFAULT_HAIKU_MODEL: glm-4.5-air
```
