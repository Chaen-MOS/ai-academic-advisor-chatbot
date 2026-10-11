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

  [INTENTS.ELECTIVE_SELECTION]: [
    {
      field: "elective_type",
      question:
        "Are you currently looking for a Major Elective or a General Elective?",
    },
    {
      field: "career_interest",
      question:
        "What career or technical area are you most interested in, such as AI, backend development, cybersecurity, data analytics, or game development?",
    },
    {
      field: "assessment_preference",
      question:
        "Do you prefer coursework and project-based subjects, final-exam-based subjects, or a balanced assessment structure?",
    },
  ],
};

export {
  CLARIFICATION_RULES,
};