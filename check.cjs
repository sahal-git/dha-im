const fs = require('fs');
const tc = fs.readFileSync('src/pages/TeacherDashboard.jsx', 'utf8');
const lines = tc.split('\n');
const startIdx = lines.findIndex(l => l.includes("activeTab === 'leaderboard'"));
console.log(lines.slice(startIdx, startIdx + 80).join('\n'));
