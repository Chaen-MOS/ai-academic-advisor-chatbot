import {
  parseTimetableText,
} from "../src/timetable/timetableParser.js";

const timetableText = `
No	Unit	Description	Type	Class Group	Attendance
Total Hours	Day	Time	Hour
1	UECS2153	ARTIFICIAL INTELLIGENCE	L	1	View	Mon	4:00 PM - 6:00 PM	2.0
Thu	4:00 PM - 5:00 PM	1.0
2	UECS2153	ARTIFICIAL INTELLIGENCE	P	1	View	Thu	9:00 AM - 12:00 PM	3.0
3	UEMH4283	AUTOMATION IN THE 4TH INDUSTRIAL REVOLUTION	L	1	View	Fri	2:30 PM - 5:30 PM	3.0
4	UECS2523	APPLIED MACHINE LEARNING	P	1	View	Sat	8:00 AM - 11:00 AM	3.0
5	UECS3153	STATISTICAL LEARNING	L	1	View	Sat	1:00 PM - 3:00 PM	2.0
6	UECS3153	STATISTICAL LEARNING	P	1	View	Sat	3:00 PM - 4:00 PM	1.0
7	UECS3599	PROJECT	P	2	View	Sun	8:00 AM - 2:00 PM	6.0
`;

const entries =
  parseTimetableText(
    timetableText,
  );

console.log(
  JSON.stringify(
    entries,
    null,
    2,
  ),
);