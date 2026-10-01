const fs = require('fs');
let content = fs.readFileSync('src/pages/StudentDashboard.jsx', 'utf8');

// Add filter state
content = content.replace(
  /const \[selectedDate, setSelectedDate\] = useState.*?;/,
  `const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);\n  const [filter, setFilter] = useState('not_completed');`
);

// Filter the activities
content = content.replace(
  /const hasUnsavedChanges = (.*?);/,
  `const hasUnsavedChanges = $1;\n\n  const filteredActivities = activities.filter(activity => {\n    const isCompleted = !!draftRawInputs[activity.id];\n    if (filter === 'not_completed') return !isCompleted;\n    if (filter === 'completed') return isCompleted;\n    return true;\n  });`
);

// Replace mapping of activities to filteredActivities
content = content.replace(/activities\.map\(activity/g, 'filteredActivities.map(activity');
content = content.replace(/\{activities\.length === 0 \? \(/, '{filteredActivities.length === 0 ? (');
content = content.replace(/Your teacher hasn't added today's activities yet\./, 'No activities match the current filter.');

// Replace Categories
const categoriesRegex = /\{\/\* CATEGORIES \*\/\}.*?\{\/\* ACTIVITIES \*\/\}/s;
const newCategories = `{/* CATEGORIES */}
          <div className="flex space-x-6 overflow-x-auto pb-0 mb-6 border-b border-[var(--border-soft)] scrollbar-hide">
            <button 
              onClick={() => setFilter('not_completed')}
              className={\`flex-shrink-0 pb-3 font-semibold text-sm transition-colors border-b-2 \${filter === 'not_completed' ? 'text-[var(--primary)] border-[var(--primary)]' : 'text-[var(--text-muted)] border-transparent hover:text-[var(--text-main)]'}\`}
            >
              Not completed
            </button>
            <button 
              onClick={() => setFilter('completed')}
              className={\`flex-shrink-0 pb-3 font-semibold text-sm transition-colors border-b-2 \${filter === 'completed' ? 'text-[var(--primary)] border-[var(--primary)]' : 'text-[var(--text-muted)] border-transparent hover:text-[var(--text-main)]'}\`}
            >
              Completed
            </button>
            <button 
              onClick={() => setFilter('all')}
              className={\`flex-shrink-0 pb-3 font-semibold text-sm transition-colors border-b-2 \${filter === 'all' ? 'text-[var(--primary)] border-[var(--primary)]' : 'text-[var(--text-muted)] border-transparent hover:text-[var(--text-main)]'}\`}
            >
              All
            </button>
          </div>

          {/* ACTIVITIES */}`;

content = content.replace(categoriesRegex, newCategories);

fs.writeFileSync('src/pages/StudentDashboard.jsx', content);
console.log('Done');
