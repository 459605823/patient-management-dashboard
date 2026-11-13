param(
    [ValidatePattern('^[a-zA-Z0-9_][a-zA-Z0-9_.-]{0,127}$')]
    [string]$Version = (Get-Date -Format 'yyyyMMdd-HHmmss'),
    [ValidateSet('linux/amd64', 'linux/arm64')]
    [string]$Platform = 'linux/amd64'
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$bundlePath = Join-Path $projectRoot "artifacts/pmd-$Version"
$archivePath = "$bundlePath.tar.gz"

function Invoke-Checked {
    param([string]$Program, [string[]]$Arguments)
    & $Program @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "$Program failed with exit code $LASTEXITCODE"
    }
}

if ((Test-Path -LiteralPath $bundlePath) -or (Test-Path -LiteralPath $archivePath)) {
    throw 'This release already exists. Choose a new -Version.'
}

Push-Location $projectRoot
try {
    Invoke-Checked docker @('info', '--format', '{{.OSType}}/{{.Architecture}}')
    foreach ($image in @(
        @{ Target = 'backend'; Name = 'pmd-backend' },
        @{ Target = 'frontend'; Name = 'pmd-frontend' },
        @{ Target = 'database'; Name = 'pmd-mysql' }
    )) {
        Invoke-Checked docker @('buildx', 'build', '--load', '--platform', $Platform,
            '--target', $image.Target, '--tag', "$($image.Name):$Version", '.')
    }

    New-Item -ItemType Directory -Path $bundlePath -Force | Out-Null
    Copy-Item -LiteralPath deploy/compose.yaml, deploy/.env.example, deploy/deploy.sh, deploy/README.md -Destination $bundlePath
    $deployScriptPath = Join-Path $bundlePath 'deploy.sh'
    $deployScript = [System.IO.File]::ReadAllText($deployScriptPath).Replace("`r`n", "`n")
    [System.IO.File]::WriteAllText($deployScriptPath, $deployScript, [System.Text.UTF8Encoding]::new($false))
    [System.IO.File]::WriteAllText((Join-Path $bundlePath 'images.env'), "IMAGE_TAG=$Version`n", [System.Text.UTF8Encoding]::new($false))
    Invoke-Checked docker @('image', 'save', '--output', (Join-Path $bundlePath 'images.tar'),
        "pmd-backend:$Version", "pmd-frontend:$Version", "pmd-mysql:$Version")
    Invoke-Checked tar @('-czf', $archivePath, '-C', $bundlePath, '.')
    Write-Host "Deployment package: $archivePath"
} finally {
    Pop-Location
}
