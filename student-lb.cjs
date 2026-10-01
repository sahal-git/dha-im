const fs = require('fs');
let sc = fs.readFileSync('src/pages/StudentDashboard.jsx', 'utf8');

const regex = /<div className="flex-1 flex flex-col justify-center">.*?<\/div>\s*<\/div>\s*\)\}\s*<\/div>\s*<\/div>/s;

const replacement = `<div className="flex-1 flex flex-col">
                  <div className="mb-6">
                    {leaderboard[0] && leaderboard[0].id === studentData.id ? (
                      <div className="text-center">
                        <div className="inline-block px-4 py-1 bg-[var(--color-soft-yellow)] text-[var(--color-gold)] rounded-full text-xs font-black uppercase tracking-widest mb-4">You are #1</div>
                        <div className="text-5xl font-black text-[var(--text-main)] mb-2">1st</div>
                        <p className="text-[var(--text-muted)] font-medium">Keep up the great work!</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="text-6xl font-black text-[var(--text-main)] mb-2">#{leaderboard.findIndex(l => l.id === studentData.id) + 1 || '-'}</div>
                        <p className="text-lg font-bold text-[var(--text-main)] mb-1">{studentData.full_name.split(' ')[0]}</p>
                        <p className="text-[var(--primary)] font-semibold">{totalPoints} pts</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-[var(--border-soft)] flex-1 overflow-y-auto pr-2" style={{ maxHeight: '400px' }}>
                    <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4 px-1">All Students</h3>
                    <ul className="space-y-3">
                      {leaderboard.map((student, idx) => (
                        <li key={student.id} className={\`flex items-center justify-between p-3 rounded-[12px] \${student.id === studentData.id ? 'bg-[var(--color-soft-green)] border border-[var(--primary)]' : 'bg-[#FAFBFA] border border-[#DCE6E0]'}\`}>
                          <div className="flex items-center space-x-3">
                            <div className={\`w-6 text-center font-bold text-sm \${student.id === studentData.id ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'}\`}>
                              {idx + 1}
                            </div>
                            <p className={\`font-bold text-[14px] truncate max-w-[100px] \${student.id === studentData.id ? 'text-[var(--primary)]' : 'text-[var(--text-main)]'}\`}>
                              {student.full_name.split(' ')[0]}
                            </p>
                          </div>
                          <div className={\`text-[14px] font-bold \${student.id === studentData.id ? 'text-[var(--primary)]' : 'text-[var(--text-main)]'}\`}>
                            {student.total_score} <span className="text-[10px] font-medium opacity-80">pts</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>`;

sc = sc.replace(regex, replacement);
fs.writeFileSync('src/pages/StudentDashboard.jsx', sc);
console.log('StudentDashboard leaderboard list updated');
