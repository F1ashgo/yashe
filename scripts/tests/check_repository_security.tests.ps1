$ErrorActionPreference = 'Stop'

$scanner = Join-Path (Split-Path $PSScriptRoot -Parent) 'check_repository_security.ps1'
if (-not (Test-Path -LiteralPath $scanner -PathType Leaf)) {
    throw "scanner does not exist: $scanner"
}

$repo = Join-Path ([System.IO.Path]::GetTempPath()) ("yashe-security-test-" + [guid]::NewGuid().ToString('N'))

try {
    New-Item -ItemType Directory -Path $repo | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $repo 'sql') | Out-Null

    git -C $repo init --quiet
    if ($LASTEXITCODE -ne 0) { throw "failed to initialize fixture repository" }

    $privateKeyMarker = 'BEGIN OPEN' + 'SSH PRIVATE KEY'
    Set-Content -LiteralPath (Join-Path $repo 'README.md') -Value $privateKeyMarker -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $repo 'sql/yashe_db_20990101_000000.sql') -Value 'fixture dump' -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $repo 'sql/init.sql') -Value 'fixture schema' -Encoding UTF8

    git -C $repo add -- README.md sql/init.sql sql/yashe_db_20990101_000000.sql
    if ($LASTEXITCODE -ne 0) { throw "failed to track fixture files" }

    $result = & $scanner -RepositoryRoot $repo 2>&1
    if ($LASTEXITCODE -ne 1) { throw "scanner should reject fixture repository" }

    $output = $result -join "`n"
    if ($output -notmatch 'private key') {
        throw "scanner should report the redacted private-key rule name"
    }
    if ($output -notmatch 'sql/yashe_db_20990101_000000\.sql') {
        throw "scanner should reject a production dump path"
    }
    if ($output -match 'sql/init\.sql') {
        throw "scanner should accept sql/init.sql"
    }
    if ($output -match [regex]::Escape($privateKeyMarker)) {
        throw "scanner must not print the matched secret value"
    }

}
finally {
    if (Test-Path -LiteralPath $repo) {
        Remove-Item -LiteralPath $repo -Recurse -Force
    }
}

$defaultRootRepo = Join-Path ([System.IO.Path]::GetTempPath()) ("yashe-security-default-root-test-" + [guid]::NewGuid().ToString('N'))

try {
    $fixtureScripts = Join-Path $defaultRootRepo 'scripts'
    New-Item -ItemType Directory -Path $fixtureScripts | Out-Null
    Copy-Item -LiteralPath $scanner -Destination (Join-Path $fixtureScripts 'check_repository_security.ps1')
    Set-Content -LiteralPath (Join-Path $defaultRootRepo 'README.md') -Value 'clean fixture' -Encoding UTF8

    git -C $defaultRootRepo init --quiet
    if ($LASTEXITCODE -ne 0) { throw "failed to initialize default-root fixture repository" }
    git -C $defaultRootRepo add -- README.md scripts/check_repository_security.ps1
    if ($LASTEXITCODE -ne 0) { throw "failed to track default-root fixture files" }

    Push-Location $defaultRootRepo
    try {
        powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/check_repository_security.ps1 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) {
            throw "scanner should default to the repository containing its scripts directory"
        }
    }
    finally {
        Pop-Location
    }

    Write-Output 'PASS: repository security scanner rejects sensitive tracked content with redacted findings'
}
finally {
    if (Test-Path -LiteralPath $defaultRootRepo) {
        Remove-Item -LiteralPath $defaultRootRepo -Recurse -Force
    }
}
