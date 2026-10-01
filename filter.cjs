const fs = require('fs');

function cleanActivities(file) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Find where activities are set
  // setActivities(data || []);
  
  content = content.replace(/setActivities\(data \|\| \[\]\);/g, "setActivities((data || []).filter(a => a.name && a.name.length > 3));");
  content = content.replace(/setActivities\(activitiesData \|\| \[\]\);/g, "setActivities((activitiesData || []).filter(a => a.name && a.name.length > 3));");
  
  fs.writeFileSync(file, content);
}

cleanActivities('src/pages/StudentDashboard.jsx');
cleanActivities('src/pages/TeacherDashboard.jsx');
cleanActivities('src/pages/AdminDashboard.jsx');

console.log('Filtered test activities');
