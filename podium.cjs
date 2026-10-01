const fs = require('fs');
let content = fs.readFileSync('src/pages/StudentDashboard.jsx', 'utf8');

const regex = /\{\/\* Podium Section \*\/\}.*?\{\/\* Rest of Leaderboard \*\/\}/s;
const replacement = `{/* Podium Section */}
                  <div className="flex justify-center items-end space-x-6 mb-12 mt-8">
                    {/* Rank 2 */}
                    {leaderboard[1] && (
                      <div className="flex flex-col items-center w-24">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold mb-3">2</div>
                        <p className={\`font-semibold text-sm truncate w-full text-center \${leaderboard[1].id === studentData.id ? 'text-[var(--primary)]' : 'text-[var(--text-main)]'}\`}>
                          {leaderboard[1].full_name.split(' ')[0]}
                        </p>
                        <p className="text-xs font-medium text-[var(--text-muted)] mt-1">{leaderboard[1].total_score} pts</p>
                      </div>
                    )}
                    
                    {/* Rank 1 */}
                    {leaderboard[0] && (
                      <div className="flex flex-col items-center w-28 mb-4">
                        <div className="w-14 h-14 rounded-full bg-[var(--color-gold)]/20 flex items-center justify-center text-[var(--color-gold)] font-black text-xl mb-3 shadow-sm">1</div>
                        <p className={\`font-bold text-base truncate w-full text-center \${leaderboard[0].id === studentData.id ? 'text-[var(--primary)]' : 'text-[var(--text-main)]'}\`}>
                          {leaderboard[0].full_name.split(' ')[0]}
                        </p>
                        <p className="text-sm font-semibold text-[var(--color-gold)] mt-1">{leaderboard[0].total_score} pts</p>
                      </div>
                    )}
                    
                    {/* Rank 3 */}
                    {leaderboard[2] && (
                      <div className="flex flex-col items-center w-24">
                        <div className="w-10 h-10 rounded-full bg-[#F2B477]/10 flex items-center justify-center text-[#F2B477] font-bold mb-3">3</div>
                        <p className={\`font-semibold text-sm truncate w-full text-center \${leaderboard[2].id === studentData.id ? 'text-[var(--primary)]' : 'text-[var(--text-main)]'}\`}>
                          {leaderboard[2].full_name.split(' ')[0]}
                        </p>
                        <p className="text-xs font-medium text-[var(--text-muted)] mt-1">{leaderboard[2].total_score} pts</p>
                      </div>
                    )}
                  </div>

                  {/* Rest of Leaderboard */}`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/pages/StudentDashboard.jsx', content);

let tContent = fs.readFileSync('src/pages/TeacherDashboard.jsx', 'utf8');
tContent = tContent.replace(regex, replacement);
fs.writeFileSync('src/pages/TeacherDashboard.jsx', tContent);
console.log('Replaced Podium');
