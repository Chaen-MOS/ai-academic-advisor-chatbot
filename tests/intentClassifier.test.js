import test from "node:test";
import assert from "node:assert/strict";

import {
  classifyIntent,
} from "../src/ai/intent/intentClassifier.js";

import {
  INTENTS,
} from "../src/ai/intent/intentTypes.js";


function testIntent({
  name,
  input,
  expected,
}) {
  test(name, () => {
    const actual =
      classifyIntent(input);

    console.log(
      "\n------------------------------",
    );
    console.log(
      `Input    : ${input}`,
    );
    console.log(
      `Expected : ${expected}`,
    );
    console.log(
      `Actual   : ${actual}`,
    );
    console.log(
      `Result   : ${
        actual === expected
          ? "PASS"
          : "FAIL"
      }`,
    );
    console.log(
      "------------------------------",
    );

    assert.equal(
      actual,
      expected,
    );
  });
}


testIntent({
  name:
    "classifies CGPA question correctly",
  input:
    "Can I achieve CGPA 3.0?",
  expected:
    INTENTS.CGPA,
});

testIntent({
  name:
    "classifies elective selection correctly",
  input:
    "Which elective should I choose?",
  expected:
    INTENTS.ELECTIVE_SELECTION,
});

testIntent({
  name:
    "classifies timetable question correctly",
  input:
    "Do I have class tomorrow?",
  expected:
    INTENTS.TIMETABLE,
});

testIntent({
  name:
    "classifies study planning correctly",
  input:
    "Help me plan my study week.",
  expected:
    INTENTS.STUDY_PLANNING,
});

testIntent({
  name:
    "classifies career planning correctly",
  input:
    "Should I become an AI engineer?",
  expected:
    INTENTS.CAREER_PLANNING,
});