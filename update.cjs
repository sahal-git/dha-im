const fs = require('fs');
let content = fs.readFileSync('src/pages/StudentDashboard.jsx', 'utf8');

const regex = /function ActivityCard\(.*?\{\n.*?return \(\n.*?\}\n/s;
const startIdx = content.indexOf('function ActivityCard');
const endIdx = content.indexOf('export default function StudentDashboard');

if(startIdx !== -1 && endIdx !== -1) {
  const newCard = `function ActivityCard({ activity, currentScore, currentRaw, handleScoreChange }) {
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
      let displayRaw = currentRaw;
      if (isCompound) {
        try {
          const parsed = JSON.parse(currentRaw);
          const parts = [];
          if (parsed.choices && parsed.choices.length > 0) parts.push(parsed.choices.join(', '));
          if (parsed.count > 0) parts.push(\`\${parsed.count} \${activity.options.countLabel || 'units'}\`);
          displayRaw = parts.join(' + ');
        } catch(e) {}
      }

      return (
        <div 
          onClick={() => setExpanded(true)}
          className="card-soft p-5 cursor-pointer hover:border-[var(--primary)] transition-colors flex justify-between items-center"
        >
          <div className="flex items-center space-x-4">
            <CheckCircle2 className="w-6 h-6 text-[var(--primary)] shrink-0" />
            <div>
              <p className="font-semibold text-[var(--text-main)] text-base">{activity.name}</p>
              <p className="text-sm text-[var(--text-muted)] font-medium leading-tight mt-0.5">{displayRaw}</p>
            </div>
          </div>
          {currentScore !== undefined && currentScore !== null && (
            <span className="text-sm font-semibold text-[var(--primary)] ml-2">
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
          className="card-soft p-5 cursor-pointer hover:border-gray-300 transition-colors flex justify-between items-center group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-6 h-6 rounded-full border border-gray-300 group-hover:border-[var(--primary)] transition-colors shrink-0" />
            <div>
              <p className="font-semibold text-[var(--text-main)] text-base">{activity.name}</p>
            </div>
          </div>
        </div>
      );
    }
  }

  // Expanded State
  return (
    <div className="card-soft p-6 relative">
      <div 
        className="flex justify-between items-center mb-6 cursor-pointer"
        onClick={() => setExpanded(false)}
      >
        <h3 className="text-lg font-semibold text-[var(--text-main)]">
          {activity.name}
        </h3>
        <button onClick={() => setExpanded(false)} className="text-sm text-[var(--text-muted)] hover:text-[var(--text-main)] font-bold transition-colors bg-gray-50 px-3 py-1.5 rounded-full">
          Close
        </button>
      </div>
      
      {hasOptions && isArrayOptions && (
        <div className="flex flex-col gap-2">
          {activity.options.map((opt, idx) => {
            const isSelected = currentRaw === opt.label;
            return (
              <button
                key={idx}
                onClick={() => {
                  handleScoreChange(activity.id, opt.label, opt.score);
                  if (!isSelected) {
                    setTimeout(() => setExpanded(false), 300);
                  }
                }}
                className={\`w-full py-3 px-4 text-left text-sm font-medium rounded-xl border transition-all duration-200 flex justify-between items-center \${
                  isSelected 
                  ? 'bg-[var(--soft-green)] text-[var(--text-main)] border-[var(--primary)]' 
                  : 'bg-white text-[var(--text-main)] border-[var(--border-soft)] hover:bg-gray-50'
                }\`}
              >
                <span>{opt.label}</span>
                {isSelected && (
                  <span className="text-[var(--primary)] text-sm font-semibold">+{opt.score} pts</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {hasOptions && isCompound && (
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            {activity.options.choices.map((opt, idx) => {
              const isSelected = compoundSelections.includes(opt.label);
              return (
                <button
                  key={idx}
                  onClick={() => toggleCompoundSelection(opt.label)}
                  className={\`w-full py-3 px-4 text-left text-sm font-medium rounded-xl border transition-all duration-200 flex justify-between items-center \${
                    isSelected 
                    ? 'bg-[var(--soft-green)] text-[var(--text-main)] border-[var(--primary)]' 
                    : 'bg-white text-[var(--text-main)] border-[var(--border-soft)] hover:bg-gray-50'
                  }\`}
                >
                  <span>{opt.label}</span>
                  {isSelected && (
                    <span className="text-[var(--primary)] text-sm font-semibold">+{opt.score} pts</span>
                  )}
                </button>
              );
            })}
          </div>
          
          <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-xl border border-[var(--border-soft)]">
            <label className="text-sm font-medium text-[var(--text-main)] flex-1">
              {activity.options.countLabel || 'Additional'}
            </label>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => handleCompoundCountChange(Math.max(0, compoundCount - 1))}
                className="w-8 h-8 rounded-full bg-white border border-[var(--border-soft)] hover:bg-gray-50 flex items-center justify-center text-[var(--text-main)] font-medium transition-colors"
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
                className="w-12 text-center font-semibold text-lg text-[var(--text-main)] outline-none bg-transparent"
              />
              <button 
                onClick={() => handleCompoundCountChange(compoundCount + 1)}
                className="w-8 h-8 rounded-full bg-white border border-[var(--border-soft)] hover:bg-gray-50 flex items-center justify-center text-[var(--text-main)] font-medium transition-colors"
              >
                +
              </button>
            </div>
          </div>

          <button 
            onClick={() => {
              saveCompound(compoundSelections, compoundCount);
              setTimeout(() => setExpanded(false), 300);
            }}
            className="w-full py-3 mt-2 bg-[var(--primary)] text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            Save Progress
          </button>
        </div>
      )}
    </div>
  );
}
\n\n`;
  
  content = content.substring(0, startIdx) + newCard + content.substring(endIdx);
  fs.writeFileSync('src/pages/StudentDashboard.jsx', content);
  console.log('Replaced StudentDashboard ActivityCard');
}
