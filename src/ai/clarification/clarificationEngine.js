import {
  CLARIFICATION_RULES,
} from "./clarificationRules.js";

function getMissingClarification(
  intent,
  studentProfile,
) {
  const rules =
    CLARIFICATION_RULES[intent];

  if (!rules) {
    return null;
  }

  for (const rule of rules) {
    const value =
      studentProfile?.[rule.field];

    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return {
        field: rule.field,
        question: rule.question,
      };
    }
  }

  return null;
}

export {
  getMissingClarification,
};