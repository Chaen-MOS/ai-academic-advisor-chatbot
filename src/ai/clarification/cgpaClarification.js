const CGPA_FIELDS = [
  {
    field: "cgpa",
    question:
      "What is your current CGPA?",
  },
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
];

function findMissingCgpaField(
  studentProfile,
) {
  for (const item of CGPA_FIELDS) {
    const value =
      studentProfile?.[item.field];

    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return item;
    }
  }

  return null;
}

function getCgpaQuestion(
  field,
) {
  return (
    CGPA_FIELDS.find(
      item =>
        item.field === field,
    )?.question ?? null
  );
}

export {
  CGPA_FIELDS,
  findMissingCgpaField,
  getCgpaQuestion,
};