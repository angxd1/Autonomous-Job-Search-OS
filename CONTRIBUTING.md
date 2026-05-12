# Contributing to ApplyPulse

Thanks for wanting to contribute. ApplyPulse is a free, open-source tool for students and new grads — every contribution moves the project forward.

## Code of conduct

By participating, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## Getting started

1. Fork the repo and clone your fork locally.
2. Install dependencies: `pnpm install`.
3. Copy `.env.example` to `.env.local` and fill in keys for the services you need (see the [self-host guide](docs/self-host.md) for help getting them).
4. Run `pnpm db:generate && pnpm db:push` to set up the database schema.
5. Run `pnpm dev` to start the web app.

## Project structure

This is a pnpm + Turborepo monorepo. See the [README](README.md#repository-layout) for the layout.

## Workflow

1. **Pick an issue.** Browse [`good first issue`](https://github.com/applypulse/applypulse/labels/good%20first%20issue) and `help wanted` labels.
2. **Comment** on the issue to claim it.
3. **Branch** from `main`: `git checkout -b feat/your-feature`.
4. **Code.** Keep PRs focused — smaller is better.
5. **Test locally.** Run `pnpm lint && pnpm typecheck && pnpm build` before opening a PR.
6. **Open a PR** against `main`. Fill in the PR template. Reference the issue you're closing.

## Coding standards

- TypeScript strict mode is on. No `any` unless absolutely justified.
- Prettier + ESLint run in CI. Format your code with `pnpm format` before committing.
- React Server Components where possible. Use client components only when interactivity is required.
- Validate all external input (forms, webhooks, API routes) with Zod schemas from `packages/shared`.
- No new dependencies without a clear justification in the PR description.

## Commit messages

We loosely follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add Kanban drag-and-drop for status changes
fix: correct timezone handling on calendar view
docs: update self-host guide for Resend setup
chore: bump dependencies
refactor: extract status-pill logic into shared util
```

## Reporting bugs

Open an issue using the **Bug report** template. Include reproduction steps, expected vs actual behavior, and environment info.

## Suggesting features

Open an issue using the **Feature request** template. Describe the user problem first, the proposed solution second.

## Questions

Use [GitHub Discussions](https://github.com/applypulse/applypulse/discussions) for questions, ideas, and design conversations.
