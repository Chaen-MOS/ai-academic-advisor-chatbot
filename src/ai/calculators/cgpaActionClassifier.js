const CGPA_ACTIONS = {
  HIGHEST_POSSIBLE: "HIGHEST_POSSIBLE",
  TARGET: "TARGET",
  GENERAL: "GENERAL",
};

function classifyCgpaAction(question) {
  if (
    typeof question !== "string" ||
    !question.trim()
  ) {
    return CGPA_ACTIONS.GENERAL;
  }

  const text =
    question.toLowerCase();

  if (
    text.includes("highest possible") ||
    text.includes("highest cgpa") ||
    text.includes("maximum cgpa") ||
    text.includes("highest possible cgpa")
  ) {
    return CGPA_ACTIONS.HIGHEST_POSSIBLE;
  }

  if (
    text.includes("target cgpa") ||
    text.includes("reach") ||
    text.includes("achieve") ||
    text.includes("need to get") ||
    text.includes("required gpa")
  ) {
    return CGPA_ACTIONS.TARGET;
  }

  return CGPA_ACTIONS.GENERAL;
}

export {
  CGPA_ACTIONS,
  classifyCgpaAction,
};