[CmdletBinding()]
param(
    [Parameter()]
    [string]$RepositoryRoot
)

if ([string]::IsNullOrWhiteSpace($RepositoryRoot)) {
    $scriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
    $RepositoryRoot = Split-Path -Parent $scriptDirectory
}

$resolvedRoot = Resolve-Path -LiteralPath $RepositoryRoot -ErrorAction Stop
$rootPath = $resolvedRoot.ProviderPath

$trackedOutput = & git -C $rootPath ls-files -z 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Error "Unable to inventory tracked repository files."
    exit 1
}

$trackedFiles = (($trackedOutput -join '') -split [char]0) | Where-Object { $_ }

$forbiddenPaths = @(
    '^sql/yashe_db_.*\.sql$',
    '(^|/).*backup.*\.(sql|dump)(\.gz)?$'
)

$privateKeyPattern = 'BEGIN ' + '(OPENSSH|RSA|EC|DSA) PRIVATE KEY'
$contentRules = @(
    @{ Name = 'private key'; Pattern = $privateKeyPattern },
    @{ Name = 'inline database password'; Pattern = '(?im)^\s*(DB_PASSWORD|MYSQL_PASSWORD|DB_PASS)\s*=\s*(?!<|\$\{)[^\s]+' },
    @{ Name = 'inline JWT secret'; Pattern = '(?im)^\s*(JWT_SECRET|YASHE_JWT_SECRET)\s*[:=]\s*(?!<|\$\{)[^\s]+' },
    @{ Name = 'command-line MySQL password'; Pattern = '(?i)\bmysql(?:dump)?\b[^\r\n]*\s-p[^\s$<"]+' }
)

$hasFindings = $false

foreach ($relativePath in $trackedFiles) {
    $normalizedPath = $relativePath.Replace('\', '/')

    foreach ($pathPattern in $forbiddenPaths) {
        if ($normalizedPath -match $pathPattern) {
            Write-Output "production dump path: $normalizedPath"
            $hasFindings = $true
            break
        }
    }

    $fullPath = Join-Path $rootPath ($relativePath.Replace('/', [IO.Path]::DirectorySeparatorChar))
    if (-not (Test-Path -LiteralPath $fullPath -PathType Leaf)) {
        continue
    }

    $content = [IO.File]::ReadAllText($fullPath)
    foreach ($rule in $contentRules) {
        if ($content -match $rule.Pattern) {
            Write-Output "$($rule.Name): $normalizedPath"
            $hasFindings = $true
        }
    }
}

if ($hasFindings) {
    exit 1
}

exit 0
