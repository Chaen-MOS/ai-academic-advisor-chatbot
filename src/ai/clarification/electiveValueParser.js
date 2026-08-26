function parseElectiveValue(
  field,
  text,
) {
  if (
    typeof text !== "string" ||
    !text.trim()
  ) {
    return {
      valid: false,
      value: null,
    };
  }

  const value =
    text.trim();

  if (
    field === "elective_type"
  ) {
    const lower =
      value.toLowerCase();

    if (
      lower.includes("major")
    ) {
      return {
        valid: true,
        value: "MAJOR",
      };
    }

    if (
      lower.includes("general")
    ) {
      return {
        valid: true,
        value: "GENERAL",
      };
    }

    return {
      valid: false,
      value: null,
    };
  }

  if (
    field === "career_interest"
  ) {
    return {
      valid: true,
      value,
    };
  }

  if (
    field ===
    "assessment_preference"
  ) {
    const lower =
      value.toLowerCase();

    if (
      lower.includes(
        "coursework",
      ) ||
      lower.includes(
        "project",
      )
    ) {
      return {
        valid: true,
        value:
          "COURSEWORK_PREFERRED",
      };
    }

    if (
      lower.includes("exam")
    ) {
      return {
        valid: true,
        value:
          "EXAM_PREFERRED",
      };
    }

    if (
      lower.includes(
        "balanced",
      ) ||
      lower.includes(
        "either",
      ) ||
      lower.includes(
        "both",
      )
    ) {
      return {
        valid: true,
        value: "BALANCED",
      };
    }

    return {
      valid: true,
      value,
    };
  }

  return {
    valid: false,
    value: null,
  };
}

export {
  parseElectiveValue,
};