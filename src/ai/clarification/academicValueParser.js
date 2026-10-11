function extractNumber(
  text,
) {
  if (
    typeof text !== "string"
  ) {
    return null;
  }

  const match =
    text.match(
      /-?\d+(?:\.\d+)?/,
    );

  if (!match) {
    return null;
  }

  const value =
    Number(match[0]);

  return Number.isFinite(value)
    ? value
    : null;
}

function parseAcademicValue(
  field,
  text,
) {
  const value =
    extractNumber(text);

  if (value === null) {
    return {
      valid: false,
      value: null,
    };
  }

  if (field === "cgpa") {
    return {
      valid:
        value >= 0 &&
        value <= 4,

      value,
    };
  }

  if (
    field === "credits_earned" ||
    field ===
      "total_credits_required"
  ) {
    return {
      valid:
        Number.isInteger(value) &&
        value >= 0,

      value,
    };
  }

  return {
    valid: false,
    value: null,
  };
}

export {
  parseAcademicValue,
};