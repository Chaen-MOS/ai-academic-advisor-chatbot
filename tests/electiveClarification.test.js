import test from "node:test";
import assert from "node:assert/strict";

import {
  getMissingClarification,
} from "../src/ai/clarification/clarificationEngine.js";

import {
  parseElectiveValue,
} from "../src/ai/clarification/electiveValueParser.js";

import {
  INTENTS,
} from "../src/ai/intent/intentTypes.js";


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
   ELECTIVE CLARIFICATION TESTS
   ===================================================== */

test(
  "asks for elective type when all elective preferences are missing",
  () => {
    const profile = {
      elective_type: null,
      career_interest: null,
      assessment_preference: null,
    };

    const result =
      getMissingClarification(
        INTENTS.ELECTIVE_SELECTION,
        profile,
      );

    const passed =
      result?.field ===
        "elective_type" &&
      typeof result?.question ===
        "string" &&
      result.question.length > 0;

    printResult({
      testId: "UT-EL-01",
      input: profile,
      expected: {
        field: "elective_type",
        question:
          "A non-empty clarification question",
      },
      actual: result,
      passed,
    });

    assert.equal(
      result.field,
      "elective_type",
    );

    assert.equal(
      typeof result.question,
      "string",
    );

    assert.ok(
      result.question.length > 0,
    );
  },
);


test(
  "asks for career interest when elective type is available",
  () => {
    const profile = {
      elective_type: "MAJOR",
      career_interest: null,
      assessment_preference: null,
    };

    const result =
      getMissingClarification(
        INTENTS.ELECTIVE_SELECTION,
        profile,
      );

    const passed =
      result?.field ===
        "career_interest" &&
      typeof result?.question ===
        "string" &&
      result.question.length > 0;

    printResult({
      testId: "UT-EL-02",
      input: profile,
      expected: {
        field: "career_interest",
        question:
          "A non-empty clarification question",
      },
      actual: result,
      passed,
    });

    assert.equal(
      result.field,
      "career_interest",
    );

    assert.ok(
      result.question.length > 0,
    );
  },
);


test(
  "asks for assessment preference when other elective information is available",
  () => {
    const profile = {
      elective_type: "MAJOR",
      career_interest:
        "AI Engineering",
      assessment_preference: null,
    };

    const result =
      getMissingClarification(
        INTENTS.ELECTIVE_SELECTION,
        profile,
      );

    const passed =
      result?.field ===
        "assessment_preference" &&
      typeof result?.question ===
        "string" &&
      result.question.length > 0;

    printResult({
      testId: "UT-EL-03",
      input: profile,
      expected: {
        field:
          "assessment_preference",
        question:
          "A non-empty clarification question",
      },
      actual: result,
      passed,
    });

    assert.equal(
      result.field,
      "assessment_preference",
    );

    assert.ok(
      result.question.length > 0,
    );
  },
);


test(
  "returns null when all elective preferences are available",
  () => {
    const profile = {
      elective_type: "MAJOR",
      career_interest:
        "AI Engineering",
      assessment_preference:
        "COURSEWORK_PREFERRED",
    };

    const result =
      getMissingClarification(
        INTENTS.ELECTIVE_SELECTION,
        profile,
      );

    const passed =
      result === null;

    printResult({
      testId: "UT-EL-04",
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


test(
  "treats an empty elective type as missing",
  () => {
    const profile = {
      elective_type: "",
      career_interest:
        "AI Engineering",
      assessment_preference:
        "BALANCED",
    };

    const result =
      getMissingClarification(
        INTENTS.ELECTIVE_SELECTION,
        profile,
      );

    const passed =
      result?.field ===
      "elective_type";

    printResult({
      testId: "UT-EL-05",
      input: profile,
      expected: {
        field: "elective_type",
      },
      actual: result,
      passed,
    });

    assert.equal(
      result.field,
      "elective_type",
    );
  },
);


test(
  "returns null when no clarification rules exist for the intent",
  () => {
    const profile = {};

    const result =
      getMissingClarification(
        "UNKNOWN_INTENT",
        profile,
      );

    const passed =
      result === null;

    printResult({
      testId: "UT-EL-06",
      input: {
        intent:
          "UNKNOWN_INTENT",
        profile,
      },
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
   ELECTIVE VALUE PARSER TESTS
   ===================================================== */

test(
  "parses major elective preference",
  () => {
    const result =
      parseElectiveValue(
        "elective_type",
        "Major Elective",
      );

    const expected = {
      valid: true,
      value: "MAJOR",
    };

    const passed =
      result.valid ===
        expected.valid &&
      result.value ===
        expected.value;

    printResult({
      testId: "UT-EL-07",
      input: {
        field: "elective_type",
        value: "Major Elective",
      },
      expected,
      actual: result,
      passed,
    });

    assert.deepEqual(
      result,
      expected,
    );
  },
);


test(
  "parses general elective preference",
  () => {
    const result =
      parseElectiveValue(
        "elective_type",
        "General Elective",
      );

    const expected = {
      valid: true,
      value: "GENERAL",
    };

    const passed =
      result.valid ===
        expected.valid &&
      result.value ===
        expected.value;

    printResult({
      testId: "UT-EL-08",
      input: {
        field: "elective_type",
        value:
          "General Elective",
      },
      expected,
      actual: result,
      passed,
    });

    assert.deepEqual(
      result,
      expected,
    );
  },
);


test(
  "rejects invalid elective type",
  () => {
    const result =
      parseElectiveValue(
        "elective_type",
        "I don't know",
      );

    const expected = {
      valid: false,
      value: null,
    };

    const passed =
      result.valid === false &&
      result.value === null;

    printResult({
      testId: "UT-EL-09",
      input: {
        field: "elective_type",
        value: "I don't know",
      },
      expected,
      actual: result,
      passed,
    });

    assert.deepEqual(
      result,
      expected,
    );
  },
);


test(
  "accepts career interest",
  () => {
    const result =
      parseElectiveValue(
        "career_interest",
        "AI Engineering",
      );

    const expected = {
      valid: true,
      value: "AI Engineering",
    };

    const passed =
      result.valid === true &&
      result.value ===
        "AI Engineering";

    printResult({
      testId: "UT-EL-10",
      input: {
        field:
          "career_interest",
        value:
          "AI Engineering",
      },
      expected,
      actual: result,
      passed,
    });

    assert.deepEqual(
      result,
      expected,
    );
  },
);


test(
  "parses coursework assessment preference",
  () => {
    const result =
      parseElectiveValue(
        "assessment_preference",
        "I prefer coursework",
      );

    const expected = {
      valid: true,
      value:
        "COURSEWORK_PREFERRED",
    };

    const passed =
      result.valid === true &&
      result.value ===
        "COURSEWORK_PREFERRED";

    printResult({
      testId: "UT-EL-11",
      input: {
        field:
          "assessment_preference",
        value:
          "I prefer coursework",
      },
      expected,
      actual: result,
      passed,
    });

    assert.deepEqual(
      result,
      expected,
    );
  },
);


test(
  "parses project-based assessment as coursework preferred",
  () => {
    const result =
      parseElectiveValue(
        "assessment_preference",
        "I prefer projects",
      );

    const expected = {
      valid: true,
      value:
        "COURSEWORK_PREFERRED",
    };

    const passed =
      result.valid === true &&
      result.value ===
        "COURSEWORK_PREFERRED";

    printResult({
      testId: "UT-EL-12",
      input: {
        field:
          "assessment_preference",
        value:
          "I prefer projects",
      },
      expected,
      actual: result,
      passed,
    });

    assert.deepEqual(
      result,
      expected,
    );
  },
);


test(
  "parses examination preference",
  () => {
    const result =
      parseElectiveValue(
        "assessment_preference",
        "I prefer exams",
      );

    const expected = {
      valid: true,
      value:
        "EXAM_PREFERRED",
    };

    const passed =
      result.valid === true &&
      result.value ===
        "EXAM_PREFERRED";

    printResult({
      testId: "UT-EL-13",
      input: {
        field:
          "assessment_preference",
        value:
          "I prefer exams",
      },
      expected,
      actual: result,
      passed,
    });

    assert.deepEqual(
      result,
      expected,
    );
  },
);


test(
  "parses balanced assessment preference",
  () => {
    const result =
      parseElectiveValue(
        "assessment_preference",
        "I prefer a balanced assessment",
      );

    const expected = {
      valid: true,
      value: "BALANCED",
    };

    const passed =
      result.valid === true &&
      result.value ===
        "BALANCED";

    printResult({
      testId: "UT-EL-14",
      input: {
        field:
          "assessment_preference",
        value:
          "I prefer a balanced assessment",
      },
      expected,
      actual: result,
      passed,
    });

    assert.deepEqual(
      result,
      expected,
    );
  },
);


test(
  "parses both assessment types as balanced",
  () => {
    const result =
      parseElectiveValue(
        "assessment_preference",
        "Both are fine",
      );

    const expected = {
      valid: true,
      value: "BALANCED",
    };

    const passed =
      result.valid === true &&
      result.value ===
        "BALANCED";

    printResult({
      testId: "UT-EL-15",
      input: {
        field:
          "assessment_preference",
        value:
          "Both are fine",
      },
      expected,
      actual: result,
      passed,
    });

    assert.deepEqual(
      result,
      expected,
    );
  },
);


test(
  "rejects non-string clarification input",
  () => {
    const result =
      parseElectiveValue(
        "elective_type",
        null,
      );

    const expected = {
      valid: false,
      value: null,
    };

    const passed =
      result.valid === false &&
      result.value === null;

    printResult({
      testId: "UT-EL-16",
      input: {
        field: "elective_type",
        value: null,
      },
      expected,
      actual: result,
      passed,
    });

    assert.deepEqual(
      result,
      expected,
    );
  },
);


test(
  "rejects unsupported elective field",
  () => {
    const result =
      parseElectiveValue(
        "unknown_field",
        "anything",
      );

    const expected = {
      valid: false,
      value: null,
    };

    const passed =
      result.valid === false &&
      result.value === null;

    printResult({
      testId: "UT-EL-17",
      input: {
        field:
          "unknown_field",
        value: "anything",
      },
      expected,
      actual: result,
      passed,
    });

    assert.deepEqual(
      result,
      expected,
    );
  },
);


test(
  "preserves custom assessment preference",
  () => {
    const result =
      parseElectiveValue(
        "assessment_preference",
        "I prefer assignments",
      );

    const expected = {
      valid: true,
      value:
        "I prefer assignments",
    };

    const passed =
      result.valid === true &&
      result.value ===
        "I prefer assignments";

    printResult({
      testId: "UT-EL-18",
      input: {
        field:
          "assessment_preference",
        value:
          "I prefer assignments",
      },
      expected,
      actual: result,
      passed,
    });

    assert.deepEqual(
      result,
      expected,
    );
  },
);