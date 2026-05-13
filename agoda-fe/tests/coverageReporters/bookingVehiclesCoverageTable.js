const path = require("path");

// ============================================================
// TÊN FILE: bookingVehiclesCoverageTable.js
// MÔ TẢ: Custom Jest coverage reporter cho folder BookingVehicles.
//        In tổng quan Total/Statements/Miss và bảng chi tiết theo file.
// ============================================================

class BookingVehiclesCoverageTableReporter {
  onRunComplete(_, results) {
    const coverageMap = results.coverageMap;

    if (!coverageMap) {
      console.log("Không có coverageMap. Hãy chạy Jest với flag --coverage.");
      return;
    }

    const componentDir = path.normalize(
      path.join(process.cwd(), "src-under-test", "components", "BookingVehicles")
    );

    const rows = [];
    let totalStatements = 0;
    let totalMiss = 0;

    coverageMap.files()
      .filter((filePath) => path.normalize(filePath).startsWith(componentDir))
      .sort((a, b) => path.basename(a).localeCompare(path.basename(b)))
      .forEach((filePath) => {
        const summary = coverageMap.fileCoverageFor(filePath).toSummary();
        const statements = summary.statements.total;
        const covered = summary.statements.covered;
        const miss = statements - covered;
        const coverage = statements === 0 ? 100 : (covered / statements) * 100;

        rows.push({
          File: path.basename(filePath),
          Statements: statements,
          Miss: miss,
          Coverage: `${coverage.toFixed(2)}%`,
        });

        totalStatements += statements;
        totalMiss += miss;
      });

    if (rows.length === 0) {
      console.log("Không tìm thấy coverage cho src-under-test/components/BookingVehicles.");
      return;
    }

    const totalCoverage = totalStatements === 0 ? 100 : ((totalStatements - totalMiss) / totalStatements) * 100;

    rows.push({
      File: "Total",
      Statements: totalStatements,
      Miss: totalMiss,
      Coverage: `${totalCoverage.toFixed(2)}%`,
    });

    console.log(`\nTotal: ${totalCoverage.toFixed(2)}%`);
    console.log(`Statements: ${totalStatements}`);
    console.log(`Miss: ${totalMiss}`);
    console.log("\nBookingVehicles Coverage Summary");
    console.table(rows);
  }
}

module.exports = BookingVehiclesCoverageTableReporter;
