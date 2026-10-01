const fs = require('fs');

let content = fs.readFileSync('src/pages/StudentDashboard.jsx', 'utf8');

// The main grid should be max-w-[1280px] mx-auto.
// Top row: Hero (lg:col-span-8) and Rank (lg:col-span-4).
// Categories below.
// Activities: xl:grid xl:grid-cols-2.

// 1. Redesign Layout
let newMain = `      <main className="max-w-[1280px] mx-auto p-4 md:px-8">
        
        {/* TOP ROW: HERO + LEADERBOARD */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:items-stretch mb-10">
          
          {/* HERO */}
          <div className={\`lg:col-span-8 \${activeTab === 'tasks' ? 'block' : 'hidden lg:block'}\`}>
            <div className="hero-card p-8 sm:p-10 relative overflow-hidden h-full flex flex-col justify-center">
              <div className="relative z-10 flex flex-col justify-between h-full">
                <div>
                  <h2 className="text-xs sm:text-sm font-black tracking-widest uppercase text-[var(--primary)] mb-3">✨ Today's Journey</h2>
                  <div className="flex items-baseline mt-1">
                    <span className="text-6xl sm:text-7xl font-black text-[var(--text-main)] tracking-tight">{totalPoints}</span>
                    <span className="text-base sm:text-lg font-bold ml-2 text-[var(--text-muted)]">points today</span>
                  </div>
                </div>
                <div className="mt-8">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-sm font-bold text-[var(--text-muted)]">Keep going</p>
                    <p className="text-sm font-bold text-[var(--text-main)]">{completedCount} / {totalActivities} completed</p>
                  </div>
                  <div className="w-full bg-[var(--color-cream)] h-3 rounded-full overflow-hidden border border-[var(--border-soft)]">
                    <div 
                      className="bg-[var(--primary)] h-full transition-all duration-700 ease-out rounded-full"
                      style={{ width: \`\${totalActivities === 0 ? 0 : (completedCount / totalActivities) * 100}%\` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* LEADERBOARD WIDGET */}
          <div className={\`lg:col-span-4 \${activeTab === 'leaderboard' ? 'block' : 'hidden lg:block'}\`}>
            <div className="card-soft p-8 h-full flex flex-col">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 rounded-[12px] bg-[var(--color-soft-yellow)] flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-[var(--color-gold)]" />
                </div>
                <h2 className="text-base font-bold tracking-wider uppercase text-[var(--text-main)]">Class Rank</h2>
              </div>
              
              {leaderboard.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-[var(--color-cream)] rounded-full flex items-center justify-center mb-4">
                    <Trophy className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-sm font-semibold text-[var(--text-muted)]">No rankings yet</p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-center">
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
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: CATEGORIES AND ACTIVITIES */}
        <div className={\`\${activeTab === 'tasks' ? 'block' : 'hidden lg:block'}\`}>
          {/* CATEGORIES */}
          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide mb-6">
            <button className="flex-shrink-0 bg-[var(--color-soft-green)] text-[var(--primary)] px-6 py-3 rounded-[16px] font-bold flex items-center shadow-sm">
              <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center mr-3 shadow-sm text-sm">🕌</div>
              Salah
            </button>
            <button className="flex-shrink-0 bg-white text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-gray-50 px-6 py-3 rounded-[16px] font-bold flex items-center border border-[var(--border-soft)] transition-colors">
              <div className="w-6 h-6 bg-[var(--color-cream)] rounded-lg flex items-center justify-center mr-3 text-sm">📖</div>
              Quran
            </button>
            <button className="flex-shrink-0 bg-white text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-gray-50 px-6 py-3 rounded-[16px] font-bold flex items-center border border-[var(--border-soft)] transition-colors">
              <div className="w-6 h-6 bg-[var(--color-cream)] rounded-lg flex items-center justify-center mr-3 text-sm">🧠</div>
              Hifz
            </button>
            <button className="flex-shrink-0 bg-white text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-gray-50 px-6 py-3 rounded-[16px] font-bold flex items-center border border-[var(--border-soft)] transition-colors">
              <div className="w-6 h-6 bg-[var(--color-cream)] rounded-lg flex items-center justify-center mr-3 text-sm">📚</div>
              Study
            </button>
          </div>

          {/* ACTIVITIES */}
          <div className="space-y-4">
            {activities.length === 0 ? (
              <div className="card-soft p-12 text-center max-w-lg mx-auto">
                <div className="w-20 h-20 bg-[var(--color-cream)] rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">🌟</div>
                <h3 className="text-xl font-bold text-[var(--text-main)] mb-2">No activities for today</h3>
                <p className="text-[var(--text-muted)] font-medium">Your teacher hasn't added today's activities yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {activities.map(activity => (
                  <ActivityCard 
                    key={activity.id}
                    activity={activity}
                    currentScore={draftScores[activity.id]}
                    currentRaw={draftRawInputs[activity.id]}
                    handleScoreChange={handleScoreChange}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>`;

const mainStart = content.indexOf('<main');
const mainEnd = content.indexOf('</main>') + 7;
content = content.substring(0, mainStart) + newMain + content.substring(mainEnd);

// ActivityCard redesign
const actStart = content.indexOf('function ActivityCard');
const actEnd = content.indexOf('export default function StudentDashboard');

const newActivityCard = `function ActivityCard({ activity, currentScore, currentRaw, handleScoreChange }) {
  const [expanded, setExpanded] = useState(false);
  const isArrayOptions = Array.isArray(activity.options);
  const isCompound = activity.options && activity.options.type === 'compound';
  const hasOptions = isArrayOptions || isCompound;

  const [compoundSelections, setCompoundSelections] = useState([]);
  const [compoundCount, setCompoundCount] = useState(0);

  useEffect(() => {
    if (isCompound && currentRaw) {
      try {
        const parsed = JSON.parse(currentRaw);
        setCompoundSelections(parsed.choices || []);
        setCompoundCount(parsed.count || 0);
      } catch (e) {
        setCompoundSelections([]);
        setCompoundCount(0);
      }
    }
  }, [currentRaw, isCompound]);

  const toggleCompoundSelection = (label) => {
    setCompoundSelections(prev => prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]);
  };

  const handleCompoundCountChange = (val) => {
    setCompoundCount(val);
  };

  const saveCompound = (selections, count) => {
    let rawStr = JSON.stringify({ choices: selections, count: count });
    let totalScore = 0;
    selections.forEach(sel => {
      const opt = activity.options.choices.find(o => o.label === sel);
      if (opt) totalScore += Number(opt.score);
    });
    totalScore += count * Number(activity.options.countScore || 1);
    
    if (selections.length === 0 && count === 0) {
      handleScoreChange(activity.id, null, 0);
    } else {
      handleScoreChange(activity.id, rawStr, totalScore);
    }
  };

  if (!expanded) {
    if (currentRaw) {
      // Completed state
      return (
        <div 
          onClick={() => setExpanded(true)}
          className="bg-[var(--color-soft-green)] p-6 rounded-[20px] cursor-pointer hover:bg-[#DDF2E6] transition-colors flex justify-between items-center"
        >
          <div className="flex items-center space-x-4">
            <CheckCircle2 className="w-7 h-7 text-[var(--primary)] shrink-0" />
            <div>
              <p className="font-bold text-[var(--text-main)] text-[18px]">{activity.name}</p>
            </div>
          </div>
          {currentScore !== undefined && currentScore !== null && (
            <span className="text-sm font-bold text-[var(--primary)]">
              +{currentScore} pts
            </span>
          )}
        </div>
      );
    } else {
      // Uncompleted state
      return (
        <div 
          onClick={() => setExpanded(true)}
          className="card-soft p-6 cursor-pointer hover:border-[var(--primary)] hover:shadow-lg transition-all flex justify-between items-center group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-7 h-7 rounded-full border-[2px] border-[var(--border-soft)] group-hover:border-[var(--primary)] transition-colors shrink-0" />
            <div>
              <p className="font-bold text-[var(--text-main)] text-[18px]">{activity.name}</p>
              <p className="text-[13px] text-[var(--text-muted)] font-medium leading-tight mt-1">{activity.description || 'Complete this mission'}</p>
            </div>
          </div>
        </div>
      );
    }
  }

  // Expanded State
  return (
    <div className="card-soft p-6 relative cursor-pointer" onClick={(e) => { if (e.target === e.currentTarget) setExpanded(false); }}>
      <div 
        className="flex justify-between items-center mb-6"
        onClick={() => setExpanded(false)}
      >
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-[12px] bg-[var(--color-cream)] flex items-center justify-center text-xl">🎯</div>
          <h3 className="text-[18px] font-bold text-[var(--text-main)]">{activity.name}</h3>
        </div>
      </div>
      
      {hasOptions && isArrayOptions && (
        <div className="flex flex-col gap-3">
          {activity.options.map((opt, idx) => {
            const isSelected = currentRaw === opt.label;
            return (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  handleScoreChange(activity.id, opt.label, opt.score);
                  if (!isSelected) {
                    setTimeout(() => setExpanded(false), 200);
                  }
                }}
                className={\`w-full py-4 px-5 text-left text-[15px] font-bold rounded-[14px] transition-all flex justify-between items-center \${
                  isSelected 
                  ? 'bg-[var(--color-soft-green)] text-[var(--text-main)] border-[2px] border-[var(--primary)]' 
                  : 'bg-[#FAFBFA] text-[var(--text-main)] border-[1px] border-[#DCE6E0] hover:border-[var(--primary)]'
                }\`}
              >
                <span>{opt.label}</span>
                {isSelected && (
                  <span className="text-[var(--primary)] text-sm font-bold">+{opt.score} pts</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {hasOptions && isCompound && (
        <div className="space-y-4" onClick={e => e.stopPropagation()}>
          <div className="flex flex-col gap-3">
            {activity.options.choices.map((opt, idx) => {
              const isSelected = compoundSelections.includes(opt.label);
              return (
                <button
                  key={idx}
                  onClick={() => toggleCompoundSelection(opt.label)}
                  className={\`w-full py-4 px-5 text-left text-[15px] font-bold rounded-[14px] transition-all flex justify-between items-center \${
                    isSelected 
                    ? 'bg-[var(--color-soft-green)] text-[var(--text-main)] border-[2px] border-[var(--primary)]' 
                    : 'bg-[#FAFBFA] text-[var(--text-main)] border-[1px] border-[#DCE6E0] hover:border-[var(--primary)]'
                  }\`}
                >
                  <span>{opt.label}</span>
                  {isSelected && (
                    <span className="text-[var(--primary)] text-sm font-bold">+{opt.score} pts</span>
                  )}
                </button>
              );
            })}
          </div>
          
          <div className="flex items-center justify-between bg-[#FAFBFA] p-4 rounded-[14px] border border-[#DCE6E0]">
            <label className="text-[15px] font-bold text-[var(--text-main)]">
              {activity.options.countLabel || 'Pages read'}
            </label>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => handleCompoundCountChange(Math.max(0, compoundCount - 1))}
                className="w-10 h-10 rounded-[10px] bg-white border border-[#DCE6E0] hover:border-[var(--primary)] flex items-center justify-center text-[var(--text-main)] font-bold transition-colors"
              >
                -
              </button>
              <input 
                type="number"
                min="0"
                value={compoundCount}
                onChange={(e) => {
                  let val = parseInt(e.target.value);
                  if (isNaN(val)) val = 0;
                  handleCompoundCountChange(val);
                }}
                className="w-12 text-center font-bold text-lg text-[var(--text-main)] outline-none bg-transparent"
              />
              <button 
                onClick={() => handleCompoundCountChange(compoundCount + 1)}
                className="w-10 h-10 rounded-[10px] bg-white border border-[#DCE6E0] hover:border-[var(--primary)] flex items-center justify-center text-[var(--text-main)] font-bold transition-colors"
              >
                +
              </button>
            </div>
          </div>

          <button 
            onClick={() => {
              saveCompound(compoundSelections, compoundCount);
              setTimeout(() => setExpanded(false), 200);
            }}
            className="w-full py-4 mt-2 bg-[var(--primary)] text-white text-[15px] font-bold rounded-[14px] hover:bg-[#066036] transition-colors flex items-center justify-center"
          >
            Save Progress
          </button>
        </div>
      )}
    </div>
  );
}

`;

content = content.substring(0, actStart) + newActivityCard + content.substring(actEnd);
fs.writeFileSync('src/pages/StudentDashboard.jsx', content);
console.log('Done redesigning StudentDashboard');

