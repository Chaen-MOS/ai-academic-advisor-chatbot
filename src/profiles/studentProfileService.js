const fakeDatabase = {
  "2201234": {
    studentId: "2201234",
    name: "Mirah",
    programme: "Bachelor of Software Engineering",
    faculty: "LKC FES",
    year: 3,
    trimesterType: "Long",
    academicStatus: "Probation",
    cgpa: 2.78,
  },
};

function getStudentProfile(studentId) {
  return fakeDatabase[studentId];
}

export { getStudentProfile };