$ErrorActionPreference = "Stop"

Set-Location $PSScriptRoot
$env:NODE_PATH = "D:\SQA\agoda-fe\node_modules"

node ../../SQA/agoda-fe/node_modules/jest/bin/jest.js --config jest.config.js tests/components/Profile --runInBand --coverage --collectCoverageFrom="src-under-test/components/Profile/*.jsx"

$coverageJsonPath = Join-Path $PSScriptRoot "coverage\coverage-final.json"
if (Test-Path $coverageJsonPath) {
    $coverageJson = Get-Content $coverageJsonPath -Raw | ConvertFrom-Json
    $rows = @()

    foreach ($prop in $coverageJson.PSObject.Properties) {
        $filePath = $prop.Name
        $entry = $prop.Value
        $fileName = Split-Path $filePath -Leaf
        $statements = ($entry.s.PSObject.Properties | Measure-Object).Count
        $miss = ($entry.s.PSObject.Properties | Where-Object { $_.Value -eq 0 } | Measure-Object).Count
        $covered = $statements - $miss
        $coverage = if ($statements -eq 0) { 100 } else { [math]::Round(($covered / $statements) * 100, 2) }

        $rows += [PSCustomObject]@{
            File = $fileName
            Statements = $statements
            Miss = $miss
            Coverage = ("{0:N2}%" -f $coverage)
        }
    }

    $totalStatements = ($rows | Measure-Object -Property Statements -Sum).Sum
    $totalMiss = ($rows | Measure-Object -Property Miss -Sum).Sum
    $totalCovered = $totalStatements - $totalMiss
    $totalCoverage = if ($totalStatements -eq 0) { 100 } else { [math]::Round(($totalCovered / $totalStatements) * 100, 2) }

    $rows = $rows | Sort-Object File
    $rows += [PSCustomObject]@{
        File = "Total"
        Statements = $totalStatements
        Miss = $totalMiss
        Coverage = ("{0:N2}%" -f $totalCoverage)
    }

    Write-Host ""
    Write-Host "Statements Summary"
    $rows | Format-Table -AutoSize
}
