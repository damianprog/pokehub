# Complete Action

One commit per feature, landing on main with no merge commit. Do the current-feature.md reset
BEFORE committing, so the feature code and the reset go into the same commit.

1. Reset current-feature.md:
   - Change H1 back to `# Current Feature`
   - Clear Goals and Notes sections (keep placeholder comments)
   - Add feature summary to the END of History
2. Stage all changes (feature code + the current-feature.md reset) and commit ONCE with a
   descriptive message
3. Switch to main and fast-forward merge the feature branch: `git merge --ff-only`. Main must not
   have diverged (it never should, in this workflow) — a fast-forward just moves the main pointer
   onto the single feature commit, so no merge commit is created.
4. Delete the local feature branch
5. Push main to origin ONCE (single push with all changes)
6. If feature branch was previously pushed, delete it from origin