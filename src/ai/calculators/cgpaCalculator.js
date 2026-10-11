function validateAcademicData({
  currentCgpa,
  creditsEarned,
  totalCreditsRequired,
}) {
  if (
    !Number.isFinite(currentCgpa) ||
    currentCgpa < 0 ||
    currentCgpa > 4
  ) {
    throw new Error(
      "Current CGPA must be between 0.00 and 4.00.",
    );
  }

  if (
    !Number.isInteger(creditsEarned) ||
    creditsEarned < 0
  ) {
    throw new Error(
      "Credits earned must be a non-negative integer.",
    );
  }

  if (
    !Number.isInteger(totalCreditsRequired) ||
    totalCreditsRequired <= 0
  ) {
    throw new Error(
      "Total credits required must be a positive integer.",
    );
  }

  if (
    creditsEarned >
    totalCreditsRequired
  ) {
    throw new Error(
      "Credits earned cannot exceed total credits required.",
    );
  }
}

function calculateHighestPossibleCgpa({
  currentCgpa,
  creditsEarned,
  totalCreditsRequired,
}) {
  validateAcademicData({
    currentCgpa,
    creditsEarned,
    totalCreditsRequired,
  });

  const remainingCredits =
    totalCreditsRequired -
    creditsEarned;

  const currentGradePoints =
    currentCgpa *
    creditsEarned;

  const maximumFutureGradePoints =
    remainingCredits * 4.0;

  const highestPossibleCgpa =
    (
      currentGradePoints +
      maximumFutureGradePoints
    ) /
    totalCreditsRequired;

  return {
    remainingCredits,

    highestPossibleCgpa:
      Number(
        highestPossibleCgpa.toFixed(3),
      ),
  };
}

function calculateRequiredAverageGpa({
  currentCgpa,
  creditsEarned,
  totalCreditsRequired,
  targetCgpa,
}) {
  validateAcademicData({
    currentCgpa,
    creditsEarned,
    totalCreditsRequired,
  });

  if (
    !Number.isFinite(targetCgpa) ||
    targetCgpa < 0 ||
    targetCgpa > 4
  ) {
    throw new Error(
      "Target CGPA must be between 0.00 and 4.00.",
    );
  }

  const remainingCredits =
    totalCreditsRequired -
    creditsEarned;

  if (remainingCredits <= 0) {
    return {
      remainingCredits: 0,

      requiredAverageGpa: null,

      achievable:
        currentCgpa >=
        targetCgpa,
    };
  }

  const currentGradePoints =
    currentCgpa *
    creditsEarned;

  const targetTotalGradePoints =
    targetCgpa *
    totalCreditsRequired;

  const requiredFutureGradePoints =
    targetTotalGradePoints -
    currentGradePoints;

  if (currentCgpa >= targetCgpa) {
    return {
        remainingCredits,

        requiredAverageGpa: 0,

        achievable: true,

        alreadyAchieved: true,
    };
    }

  const requiredAverageGpa =
    requiredFutureGradePoints /
    remainingCredits;

  return {
    remainingCredits,

    requiredAverageGpa:
      Number(
        requiredAverageGpa.toFixed(3),
      ),

    achievable:
      requiredAverageGpa <= 4,

    alreadyAchieved:
      currentCgpa >=
      targetCgpa,
  };
}

export {
  calculateHighestPossibleCgpa,
  calculateRequiredAverageGpa,
};