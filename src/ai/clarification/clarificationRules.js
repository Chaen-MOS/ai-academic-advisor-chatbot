import {
  INTENTS,
} from "../intent/intentTypes.js";

const CLARIFICATION_RULES = {
  [INTENTS.CGPA]: [
    {
      field: "cgpa",
      question:
        "What is your current CGPA?",
    },
    {
      field: "credits_earned",
      question:
        "How many credit hours have you completed?",
    },
    {
      field: "total_credits_required",
      question:
        "How many total credit hours are required for your programme?",
    },
  ],

  [INTENTS.GRADUATION]: [
    {
      field: "credits_earned",
      question:
        "How many credit hours have you completed so far?",
    },
    {
      field: "total_credits_required",
      question:
        "How many total credit hours are required for your programme?",
    },
  ],
};

export {
  CLARIFICATION_RULES,
};