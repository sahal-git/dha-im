const fs = require('fs');

let content = fs.readFileSync('src/pages/StudentDashboard.jsx', 'utf8');

const regex = /<p className="text-\[var\(--text-main\)\] text-2xl font-extrabold mt-2">Good morning, \{studentData\.full_name\.split\(' '\)\[0\]\} 👋<\/p>\s*<p className="text-\[var\(--text-muted\)\] text-base mt-1 font-medium">Ready for today's journey\?<\/p>/;
const newHeader = `<p className="text-[var(--text-main)] text-3xl font-extrabold mt-2 tracking-tight">Good morning, {studentData.full_name.split(' ')[0]} 👋</p>
            <p className="text-[var(--text-muted)] text-lg mt-1 font-semibold">Ready for today's journey?</p>`;

content = content.replace(regex, newHeader);
fs.writeFileSync('src/pages/StudentDashboard.jsx', content);

