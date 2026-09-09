import test from "node:test";
import assert from "node:assert/strict";

import {
  calculateHighestPossibleCgpa,
  calculateRequiredAverageGpa,
} from "../src/ai/calculators/cgpaCalculator.js";


function printResult({
  testId,
  input,
  expected,
  actual,
  passed,
}) {
  console.log(
    "\n========================================",
  );
  console.log(`Test ID  : ${testId}`);
  console.log(`Input    : ${input}`);
  console.log(`Expected : ${expected}`);
  console.log(`Actual   : ${actual}`);
  console.log(
    `Result   : ${passed ? "PASS" : "FAIL"}`,
  );
  console.log(
    "========================================",
  );
}


test(
  "calculates highest possible CGPA",
  () => {
    const result =
      calculateHighestPossibleCgpa({
        currentCgpa: 2.73,
        creditsEarned: 83,
        totalCreditsRequired: 123,
      });

    const passed =
      result.remainingCredits === 40 &&
      Math.abs(
        result.highestPossibleCgpa -
          3.143,
      ) < 0.001;

    printResult({
      testId: "UT-CGPA-01",
      input:
        "Current CGPA = 2.73, Credits Earned = 83, Total Credits = 123",
      expected:
        "Remaining Credits = 40, Highest Possible CGPA ≈ 3.143",
      actual:
        `Remaining Credits = ${result.remainingCredits}, Highest Possible CGPA = ${result.highestPossibleCgpa}`,
      passed,
    });

    assert.equal(
      result.remainingCredits,
      40,
    );

    assert.ok(
      Math.abs(
        result.highestPossibleCgpa -
          3.143,
      ) < 0.001,
    );
  },
);


test(
  "calculates required GPA for target CGPA",
  () => {
    const result =
      calculateRequiredAverageGpa({
        currentCgpa: 2.73,
        creditsEarned: 83,
        totalCreditsRequired: 123,
        targetCgpa: 3.0,
      });

    const passed =
      result.remainingCredits === 40 &&
      Math.abs(
        result.requiredAverageGpa -
          3.56025,
      ) < 0.001;

    printResult({
      testId: "UT-CGPA-02",
      input:
        "Current CGPA = 2.73, Credits Earned = 83, Total Credits = 123, Target CGPA = 3.00",
      expected:
        "Remaining Credits = 40, Required Average GPA ≈ 3.56025",
      actual:
        `Remaining Credits = ${result.remainingCredits}, Required Average GPA = ${result.requiredAverageGpa}`,
      passed,
    });

    assert.equal(
      result.remainingCredits,
      40,
    );

    assert.ok(
      Math.abs(
        result.requiredAverageGpa -
          3.56025,
      ) < 0.001,
    );
  },
);


test(
  "returns already achieved when target is lower than current CGPA",
  () => {
    const result =
      calculateRequiredAverageGpa({
        currentCgpa: 3.2,
        creditsEarned: 80,
        totalCreditsRequired: 120,
        targetCgpa: 3.0,
      });

    const passed =
      result.alreadyAchieved === true &&
      result.requiredAverageGpa === 0;

    printResult({
      testId: "UT-CGPA-03",
      input:
        "Current CGPA = 3.20, Credits Earned = 80, Total Credits = 120, Target CGPA = 3.00",
      expected:
        "Already Achieved = true, Required Average GPA = 0",
      actual:
        `Already Achieved = ${result.alreadyAchieved}, Required Average GPA = ${result.requiredAverageGpa}`,
      passed,
    });

    assert.equal(
      result.alreadyAchieved,
      true,
    );

    assert.equal(
      result.requiredAverageGpa,
      0,
    );
  },
);


test(
  "marks target as not achievable when required GPA exceeds 4.0",
  () => {
    const result =
      calculateRequiredAverageGpa({
        currentCgpa: 2.0,
        creditsEarned: 100,
        totalCreditsRequired: 120,
        targetCgpa: 3.5,
      });

    const passed =
      result.achievable === false;

    printResult({
      testId: "UT-CGPA-04",
      input:
        "Current CGPA = 2.00, Credits Earned = 100, Total Credits = 120, Target CGPA = 3.50",
      expected:
        "Achievable = false",
      actual:
        `Achievable = ${result.achievable}, Required Average GPA = ${result.requiredAverageGpa}`,
      passed,
    });

    assert.equal(
      result.achievable,
      false,
    );
  },
);


test(
  "rejects CGPA above 4.0",
  () => {
    let actualError = "";

    assert.throws(
      () =>
        calculateHighestPossibleCgpa({
          currentCgpa: 4.5,
          creditsEarned: 80,
          totalCreditsRequired: 120,
        }),
      error => {
        actualError =
          error instanceof Error
            ? error.message
            : String(error);

        return true;
      },
    );

    printResult({
      testId: "UT-CGPA-05",
      input:
        "Current CGPA = 4.50, Credits Earned = 80, Total Credits = 120",
      expected:
        "Validation error is thrown because CGPA exceeds 4.0",
      actual:
        `Error thrown: ${actualError}`,
      passed: true,
    });
  },
);



test(
  "rejects credits earned greater than total credits",
  () => {
    let actualError = "";

    assert.throws(
      () =>
        calculateHighestPossibleCgpa({
          currentCgpa: 3.0,
          creditsEarned: 130,
          totalCreditsRequired: 120,
        }),
      error => {
        actualError =
          error instanceof Error
            ? error.message
            : String(error);

        return true;
      },
    );

    printResult({
      testId: "UT-CGPA-06",
      input:
        "Current CGPA = 3.00, Credits Earned = 130, Total Credits = 120",
      expected:
        "Validation error is thrown because earned credits exceed total required credits",
      actual:
        `Error thrown: ${actualError}`,
      passed: true,
    });
  },
);


