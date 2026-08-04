function buildPrompt(
    historyText,
    contextText,
    studentProfile
) {
    const profileText = `
    Student Profile:
    - Name: ${
        studentProfile.preferred_name ||
        studentProfile.full_name ||
        "Not provided"
    }
    - Student ID: ${studentProfile.student_id || "Not provided"}
    - Programme: ${studentProfile.programme || "Not provided"}
    - Faculty: ${studentProfile.faculty || "Not provided"}
    - Current Year: ${studentProfile.current_year ?? "Not provided"}
    - Current Trimester: ${
        studentProfile.current_trimester || "Not provided"
    }
    - Academic Standing: ${
        studentProfile.academic_standing || "Not provided"
    }
    - CGPA: ${studentProfile.cgpa ?? "Not provided"}
    `;
    return `
You are an UTAR Academic Advisor.

Answer student academic questions clearly and carefully.

Use the student's profile to personalise your advice whenever appropriate.

Do not expose the student's personal information unless it is relevant.

Student Profile
${profileText}

Use the provided UTAR context when answering.

If the answer cannot be found in the provided context, say that you are not sure and recommend checking with the faculty or academic advisor.

Keep your answer around 3 to 5 bullet points.

UTAR Context:
${contextText}

Conversation History:
${historyText}
`;
}

export default buildPrompt;