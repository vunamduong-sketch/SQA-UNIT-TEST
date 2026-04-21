$env:NODE_PATH = "D:\SQA\agoda-fe\node_modules"

node ../../SQA/agoda-fe/node_modules/jest/bin/jest.js `
  --config jest.config.js `
  tests/components/Cart `
  --runInBand `
  --coverage `
  --collectCoverageFrom="src-under-test/components/Cart/**/*.jsx"

if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}

Write-Host ""
Write-Host "Statements Summary" -ForegroundColor Cyan
node -e "const data=require('./coverage/coverage-final.json'); const keep=['index.jsx','ActivityAllTab.jsx','ActivityTourTab.jsx','ActivityExperienceTab.jsx','ActivityDriveTab.jsx','ActivityFoodTab.jsx','ActivityLocationTab.jsx','ActivityTravelEssentialTab.jsx']; const rows=[]; let covered=0,total=0; for (const [file,cov] of Object.entries(data)) { const name=file.split(/[\\\\/]/).pop(); if(!keep.includes(name)) continue; const stmtTotal=Object.keys(cov.statementMap).length; const stmtCovered=Object.values(cov.s).filter(v=>v>0).length; const miss=stmtTotal-stmtCovered; const pct=stmtTotal===0 ? '100%' : ((stmtCovered/stmtTotal)*100).toFixed(2)+'%'; rows.push({File:name, Statements:stmtTotal, Miss:miss, Coverage:pct}); covered += stmtCovered; total += stmtTotal; } rows.push({File:'Total', Statements:total, Miss:total-covered, Coverage: total===0 ? '100%' : ((covered/total)*100).toFixed(2)+'%'}); console.table(rows);"
