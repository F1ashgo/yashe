# Repository Secret Hygiene Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove sensitive material from the current repository snapshot, make operations consume protected configuration, and block new secrets or production dumps from entering Git.

**Architecture:** A repository security check scans tracked content and prohibited paths. Documentation and maintenance scripts use placeholders or protected environment files; an independent CI workflow runs the same snapshot checks plus Gitleaks without modifying the deployment workflow.

**Tech Stack:** Git, PowerShell 7, Bash, Gitleaks, GitHub Actions.

## Global Constraints

- Do not rewrite Git history in this plan.
- Do not modify `.github/workflows/deploy.yml`.
- Never copy leaked values into tests, configuration, reports, commit messages, or scan rules.
- Keep `sql/init.sql`; remove production dumps and personal data.
- Commits must follow Conventional Commits and remain on `feat/security-responsive-admin`.
- Operational credential rotation is mandatory but remains a manual deployment action.

---

### Task 1: Repository security scanner

**Files:**
- Create: `scripts/check_repository_security.ps1`
- Create: `scripts/tests/check_repository_security.tests.ps1`

**Interfaces:**
- Produces: `scripts/check_repository_security.ps1` with exit `0` for a clean snapshot and exit `1` with redacted findings.
- Rejects tracked private-key markers, password-bearing assignments, MySQL command-line passwords, and production dump paths.

- [ ] **Step 1: Write the failing standalone smoke test**

The test creates a temporary Git repository, invokes the scanner through `-RepositoryRoot`, and verifies that a Markdown private key marker and `sql/yashe_db_20990101_000000.sql` are rejected while `sql/init.sql` is accepted. Construct the fixture marker from two string fragments so the test file itself never contains a complete private-key marker.

```powershell
$result = & $scanner -RepositoryRoot $repo 2>&1
if ($LASTEXITCODE -ne 1) { throw "scanner should reject fixture repository" }
if (($result -join "`n") -notmatch 'private key') {
    throw "scanner should report the redacted private-key rule name"
}
```

- [ ] **Step 2: Run the test and confirm RED**

```powershell
pwsh -NoProfile -File scripts/tests/check_repository_security.tests.ps1
```

Expected: FAIL because the scanner does not exist.

- [ ] **Step 3: Implement the scanner**

Use `git -C $RepositoryRoot ls-files -z` as the only file inventory. Build the private-key detection expression from string fragments so the scanner source does not trigger itself. Reject:

```powershell
$forbiddenPaths = @(
  '^sql/yashe_db_.*\.sql$',
  '(^|/).*backup.*\.(sql|dump)(\.gz)?$'
)
$privateKeyPattern = 'BEGIN ' + '(OPENSSH|RSA|EC|DSA) PRIVATE KEY'
$contentRules = @(
  @{ Name = 'private key'; Pattern = $privateKeyPattern },
  @{ Name = 'inline database password'; Pattern = '(?i)(DB_PASSWORD|MYSQL_PASSWORD)\s*=\s*(?!<|\$\{)[^\s]+' },
  @{ Name = 'inline JWT secret'; Pattern = '(?i)(JWT_SECRET|YASHE_JWT_SECRET)\s*[:=]\s*(?!<|\$\{)[^\s]+' },
  @{ Name = 'command-line MySQL password'; Pattern = '(?i)\bmysql(?:dump)?\b[^\r\n]*\s-p[^\s$<"]+' }
)
```

Print only rule name and file path, never the matched value.

- [ ] **Step 4: Run tests and current-snapshot scan**

```powershell
pwsh -NoProfile -File scripts/tests/check_repository_security.tests.ps1
pwsh -NoProfile -File scripts/check_repository_security.ps1
```

Expected: test PASS; current snapshot FAIL before Tasks 2–3 remove findings.

- [ ] **Step 5: Commit**

```powershell
git add scripts/check_repository_security.ps1 scripts/tests/check_repository_security.tests.ps1
git commit -m "test: add repository security scanner"
```

---

### Task 2: Remove tracked dump and prevent recurrence

**Files:**
- Delete: `sql/yashe_db_20260717_104024.sql`
- Modify: `.gitignore`
- Modify: `README.md`

- [ ] **Step 1: Record the failing path check**

```powershell
git ls-files | Select-String 'sql/yashe_db_.*\.sql$'
```

Expected: the production dump is listed.

- [ ] **Step 2: Remove the tracked dump and add ignore rules**

Add:

```gitignore
sql/yashe_db_*.sql
sql/*_backup_*.sql*
sql/*_auto_*.sql*
*.sql.gz
*.dump
*.bak
*.ppk
!sql/init.sql
```

Remove the README tree entry that advertises a local data package. Add a rule forbidding real dumps and personal data.

- [ ] **Step 3: Verify the ignore contract**

```powershell
git check-ignore -v --no-index sql/yashe_db_20990101_000000.sql
git check-ignore -v --no-index sql/init.sql
git ls-files | Select-String 'yashe_db_.*\.sql$'
```

Expected: fake dump is ignored; `init.sql` is not ignored; no production dump is tracked.

- [ ] **Step 4: Commit**

```powershell
git add .gitignore README.md
git rm sql/yashe_db_20260717_104024.sql
git commit -m "chore: remove production database dump"
```

---

### Task 3: Redact operational documentation

**Files:**
- Modify: `DOC/github_secrets_guide.md`
- Modify: `DOC/deployment_preparation_guide.md`
- Modify: `DOC/server_operations_runbook.md`
- Modify: `DOC/db_maintenance_guide.md`
- Modify outside repository: `../admys_scan_report.md`

- [ ] **Step 1: Run the scanner and preserve only redacted file paths**

```powershell
pwsh -NoProfile -File scripts/check_repository_security.ps1
```

Expected: FAIL on documentation paths without printing secret values.

- [ ] **Step 2: Replace secrets with operational instructions**

Use these literal placeholders only:

```text
<SERVER_IP>
<NON_ROOT_DEPLOY_USER>
<YASHE_DB_USERNAME>
<YASHE_DB_PASSWORD>
<YASHE_REDIS_PASSWORD>
<YASHE_JWT_SECRET>
<PASTE_INTO_GITHUB_SECRET_ONLY>
```

Replace command-line passwords with interactive `-p`, `redis-cli --askpass`, or a `0600` defaults file. Replace absolute `file:///D:/...` README links with relative repository links. Redact the full JWT in `../admys_scan_report.md` to `<REDACTED_MEMBER_JWT>`.

- [ ] **Step 3: Verify documentation is clean**

```powershell
pwsh -NoProfile -File scripts/check_repository_security.ps1
git diff --check
```

Expected: scanner may still report the maintenance script only; documentation findings are gone.

- [ ] **Step 4: Commit tracked documentation**

```powershell
git add DOC README.md
git commit -m "docs: remove operational secrets"
```

The external scan report is not staged because it is outside the repository.

---

### Task 4: Externalize maintenance-script credentials

**Files:**
- Modify: `scripts/yashe_daily_scheduler.sh`
- Create: `scripts/maintenance.env.example`
- Create: `scripts/tests/yashe_daily_scheduler_test.sh`

**Interfaces:**
- Consumes: `${YASHE_MAINTENANCE_ENV:-/etc/yashe/maintenance.env}`.
- Requires: `MYSQL_DEFAULTS_FILE`, `DB_NAME`, `BACKUP_DIR`, `LOG_DIR`.
- Produces no command containing `-p<password>`.

- [ ] **Step 1: Write shell tests**

Cover missing config, unreadable config, missing required variables, and a dry-run command capture proving `mysqldump --defaults-extra-file=...` is used.

```bash
if YASHE_MAINTENANCE_ENV="$tmp/missing.env" bash scripts/yashe_daily_scheduler.sh --dry-run; then
  echo "expected failure"; exit 1
fi
```

- [ ] **Step 2: Confirm RED**

```powershell
& 'C:\Program Files\Git\bin\bash.exe' scripts/tests/yashe_daily_scheduler_test.sh
```

Expected: FAIL because the script ignores `YASHE_MAINTENANCE_ENV`.

- [ ] **Step 3: Implement fail-closed configuration**

At script start:

```bash
CONFIG_FILE="${YASHE_MAINTENANCE_ENV:-/etc/yashe/maintenance.env}"
[[ -r "$CONFIG_FILE" ]] || { echo "maintenance config unreadable" >&2; exit 1; }
# shellcheck disable=SC1090
source "$CONFIG_FILE"
: "${MYSQL_DEFAULTS_FILE:?MYSQL_DEFAULTS_FILE is required}"
: "${DB_NAME:?DB_NAME is required}"
: "${BACKUP_DIR:?BACKUP_DIR is required}"
: "${LOG_DIR:?LOG_DIR is required}"
```

The example file contains placeholders only. Use `mysqldump --defaults-extra-file="$MYSQL_DEFAULTS_FILE"` and remove database password variables.

- [ ] **Step 4: Verify**

```powershell
& 'C:\Program Files\Git\bin\bash.exe' -n scripts/yashe_daily_scheduler.sh
& 'C:\Program Files\Git\bin\bash.exe' scripts/tests/yashe_daily_scheduler_test.sh
pwsh -NoProfile -File scripts/check_repository_security.ps1
```

Expected: syntax and tests PASS; repository scanner PASS.

- [ ] **Step 5: Commit**

```powershell
git add scripts
git commit -m "fix: externalize maintenance credentials"
```

---

### Task 5: Add independent secret-scanning CI

**Files:**
- Create: `.gitleaks.toml`
- Create: `.github/workflows/security.yml`
- Modify: `README.md`

- [ ] **Step 1: Add a workflow structure test**

Extend `scripts/tests/check_repository_security.tests.ps1` to assert:

```powershell
if ($workflow -notmatch 'pull_request') { throw 'missing pull_request trigger' }
if ($workflow -match 'pull_request_target') { throw 'unsafe pull_request_target trigger' }
if ($workflow -notmatch 'scripts/check_repository_security.ps1') { throw 'missing repository scanner' }
if ($workflow -notmatch 'gitleaks') { throw 'missing Gitleaks scan' }
```

- [ ] **Step 2: Confirm RED**

Run the PowerShell test; expect missing workflow/config failure.

- [ ] **Step 3: Add Gitleaks and workflow**

The workflow:

- uses `permissions: contents: read`;
- triggers on `pull_request`, pushes to `master`, and `workflow_dispatch`;
- checks out with enough history for the event range;
- runs `pwsh ./scripts/check_repository_security.ps1`;
- runs Gitleaks with `--redact`;
- never references repository deployment secrets;
- does not modify `deploy.yml`.

The Gitleaks config adds custom rules for database/JWT assignments and dumps without embedding leaked values.

- [ ] **Step 4: Verify**

```powershell
pwsh -NoProfile -File scripts/tests/check_repository_security.tests.ps1
pwsh -NoProfile -File scripts/check_repository_security.ps1
git diff --exit-code 9058ef6 -- .github/workflows/deploy.yml
```

If `gitleaks` and `actionlint` are installed:

```powershell
gitleaks dir . --config .gitleaks.toml --redact --no-banner
actionlint .github/workflows/security.yml
```

- [ ] **Step 5: Commit**

```powershell
git add .gitleaks.toml .github/workflows/security.yml scripts/tests/check_repository_security.tests.ps1 README.md
git commit -m "ci: block new repository secrets"
```

---

### Task 6: Record mandatory credential rotation

**Files:**
- Modify: `README.md`
- Modify: `DOC/server_operations_runbook.md`

- [ ] **Step 1: Add a deployment gate checklist**

Record unchecked operational items:

```text
[ ] revoke old SSH public key
[ ] create non-root deploy key and update GitHub Secret
[ ] rotate MySQL and Redis credentials
[ ] rotate JWT secret and restart API
[ ] verify old tokens fail
[ ] close public test ports and restrict origin access
```

- [ ] **Step 2: Run final snapshot checks**

```powershell
pwsh -NoProfile -File scripts/check_repository_security.ps1
git ls-files | Select-String 'yashe_db_.*\.sql$|\.pem$|\.key$|\.ppk$'
git diff --check
```

Expected: no findings.

- [ ] **Step 3: Commit**

```powershell
git add README.md DOC/server_operations_runbook.md
git commit -m "docs: add credential rotation gate"
```

