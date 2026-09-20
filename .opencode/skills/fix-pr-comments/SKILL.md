---
name: fix-pr-comments
description: Fix PR comments from Linear ticket. Takes a Linear ticket ID, fetches attached PR, validates comments, fixes valid ones, and shows commit message format.
---

# Fix PR Comments Skill

This skill automates fixing PR comments from Linear tickets.

## Usage

When the user provides a Linear ticket ID, this skill will:
1. Use Linear MCP to fetch ticket details and attached PR
2. Use `gh` to switch to the PR branch
3. Use `gh` to fetch PR comments and validate them
4. For invalid comments: leave a reply explaining why
5. For valid comments: perform the fix and leave a reply
6. Display the commit message in the required format (without committing)

## Required Tools

- Linear MCP server (must be configured in opencode)
- GitHub CLI (`gh`) authenticated

## Workflow

### 1. Fetch Linear Ticket Details
Use Linear MCP to get ticket details and find the attached PR URL.

### 2. Switch to PR Branch
Use the full PR URL from the ticket so checkout resolves against the right repository:
```bash
gh pr checkout "<PR_URL>"
```
If only a bare PR number is available, pass `--repo <OWNER/REPO>` explicitly.

### 3. Fetch and Validate PR Comments
The API returns 30 items per page by default — always paginate:
```bash
gh api "repos/{owner}/{repo}/pulls/<PR_NUMBER>/comments" --paginate --slurp
gh api "repos/{owner}/{repo}/pulls/<PR_NUMBER>/reviews" --paginate --slurp
```
`--slurp` wraps the pages in an outer JSON array — flatten it before processing. Keep `/reviews` records separate from review comments, and when replying only target top-level comments (skip entries where `in_reply_to_id` is non-null, since GitHub does not support replies to replies).

Validate each comment by judging the requested change, not the sentence form:
- Is it actionable? (a specific code change can be derived from it, even if phrased as a question)
- Is it still relevant? (code hasn't changed since comment)
- Is there substance? (supported by reasoning or evidence, not a bare style preference)

### 4. Handle Invalid Comments
For invalid comments, reply with explanation:
```bash
gh api "repos/{owner}/{repo}/pulls/<PR_NUMBER>/comments/<COMMENT_ID>/replies" -f body="This comment is invalid because: <reason>"
```

### 5. Fix Valid Comments
For each valid comment:
- Make the necessary code changes
- Test the changes
- Reply to comment confirming fix (do not cite a commit SHA — nothing is committed yet):
```bash
gh api "repos/{owner}/{repo}/pulls/<PR_NUMBER>/comments/<COMMENT_ID>/replies" -f body="Fixed locally (not committed yet)"
```

### 6. Display Commit Message
Show the commit message in this format (DO NOT COMMIT):
```text
[Ticket ID] fixes: title
- fix 1
- fix 2
- fix n
```

## Example

User: "fix PR comments for LINEAR-123"

The skill will:
1. Query Linear MCP for ticket LINEAR-123
2. Find attached PR (e.g., https://github.com/OWNER/REPO/pull/456)
3. Checkout PR branch
4. Analyze all review comments
5. Process each comment
6. Show final commit message
