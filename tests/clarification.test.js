import test from "node:test";
import assert from "node:assert/strict";

import {
  findMissingCgpaField,
} from "../src/ai/clarification/cgpaClarification.js";

import {
  parseAcademicValue,
} from "../src/ai/clarification/academicValueParser.js";


function formatValue(value) {
  if (value === undefined) {
    return "undefined";
  }

  if (value === null) {
    return "null";
  }

  if (typeof value === "string") {
    return value;
  }

  return JSON.stringify(
    value,
    null,
    2,
  );
}


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
  console.log(
    `Input    : ${formatValue(input)}`,
  );
  console.log(
    `Expected : ${formatValue(expected)}`,
  );
  console.log(
    `Actual   : ${formatValue(actual)}`,
  );
  console.log(
    `Result   : ${
      passed ? "PASS" : "FAIL"
    }`,
  );
  console.log(
    "========================================",
  );
}


/* =====================================================
   CGPA CLARIFICATION TESTS
   ===================================================== */

test(
  "asks for CGPA when CGPA is missing",
  () => {
    const profile = {
      cgpa: null,
      credits_earned: null,
      total_credits_required: null,
    };

    const result =
      findMissingCgpaField(
        profile,
      );

    const passed =
      result?.field === "cgpa";

    printResult({
      testId: "UT-CGPA-CL-01",
      input: profile,
      expected: {
        field: "cgpa",
      },
      actual: result,
      passed,
    });

    assert.equal(
      result.field,
      "cgpa",
    );
  },
);


test(
  "asks for credits earned when CGPA is available",
  () => {
    const profile = {
      cgpa: 2.73,
      credits_earned: null,
      total_credits_required: null,
    };

    const result =
      findMissingCgpaField(
        profile,
      );

    const passed =
      result?.field ===
      "credits_earned";

    printResult({
      testId: "UT-CGPA-CL-02",
      input: profile,
      expected: {
        field: "credits_earned",
      },
      actual: result,
      passed,
    });

    assert.equal(
      result.field,
      "credits_earned",
    );
  },
);


test(
  "asks for total credits when CGPA and earned credits are available",
  () => {
    const profile = {
      cgpa: 2.73,
      credits_earned: 83,
      total_credits_required: null,
    };

    const result =
      findMissingCgpaField(
        profile,
      );

    const passed =
      result?.field ===
      "total_credits_required";

    printResult({
      testId: "UT-CGPA-CL-03",
      input: profile,
      expected: {
        field:
          "total_credits_required",
      },
      actual: result,
      passed,
    });

    assert.equal(
      result.field,
      "total_credits_required",
    );
  },
);


test(
  "returns no missing field when all CGPA data is available",
  () => {
    const profile = {
      cgpa: 2.73,
      credits_earned: 83,
      total_credits_required: 123,
    };

    const result =
      findMissingCgpaField(
        profile,
      );

    const passed =
      result === null;

    printResult({
      testId: "UT-CGPA-CL-04",
      input: profile,
      expected: null,
      actual: result,
      passed,
    });

    assert.equal(
      result,
      null,
    );
  },
);


/* =====================================================
   ACADEMIC VALUE PARSER TESTS
   ===================================================== */

test(
  "accepts valid CGPA input",
  () => {
    const result =
      parseAcademicValue(
        "cgpa",
        "2.73",
      );

    const expected = {
      valid: true,
      value: 2.73,
    };

    const passed =
      result.valid === true &&
      result.value === 2.73;

    printResult({
      testId: "UT-CGPA-CL-05",
      input: {
        field: "cgpa",
        value: "2.73",
      },
      expected,
      actual: result,
      passed,
    });

    assert.equal(
      result.valid,
      true,
    );

    assert.equal(
      result.value,
      2.73,
    );
  },
);


test(
  "rejects CGPA above 4.0",
  () => {
    const result =
      parseAcademicValue(
        "cgpa",
        "4.5",
      );

    const passed =
      result.valid === false;

    printResult({
      testId: "UT-CGPA-CL-06",
      input: {
        field: "cgpa",
        value: "4.5",
      },
      expected: {
        valid: false,
      },
      actual: result,
      passed,
    });

    assert.equal(
      result.valid,
      false,
    );
  },
);


test(
  "accepts valid credits earned",
  () => {
    const result =
      parseAcademicValue(
        "credits_earned",
        "83",
      );

    const expected = {
      valid: true,
      value: 83,
    };

    const passed =
      result.valid === true &&
      result.value === 83;

    printResult({
      testId: "UT-CGPA-CL-07",
      input: {
        field: "credits_earned",
        value: "83",
      },
      expected,
      actual: result,
      passed,
    });

    assert.equal(
      result.valid,
      true,
    );

    assert.equal(
      result.value,
      83,
    );
  },
);


test(
  "rejects non-numeric credits",
  () => {
    const result =
      parseAcademicValue(
        "credits_earned",
        "eighty three",
      );

    const passed =
      result.valid === false;

    printResult({
      testId: "UT-CGPA-CL-08",
      input: {
        field: "credits_earned",
        value: "eighty three",
      },
      expected: {
        valid: false,
      },
      actual: result,
      passed,
    });

    assert.equal(
      result.valid,
      false,
    );
  },
);