import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { LogOut, CheckSquare, Trophy, CheckCircle2, FileText } from 'lucide-react';

function ActivityCard({ activity, currentScore, currentRaw, handleScoreChange }) {
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
                className={`w-full py-4 px-5 text-left text-[15px] font-bold rounded-[14px] transition-all flex justify-between items-center ${
                  isSelected 
                  ? 'bg-[var(--color-soft-green)] text-[var(--text-main)] border-[2px] border-[var(--primary)]' 
                  : 'bg-[#FAFBFA] text-[var(--text-main)] border-[1px] border-[#DCE6E0] hover:border-[var(--primary)]'
                }`}
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
                  className={`w-full py-4 px-5 text-left text-[15px] font-bold rounded-[14px] transition-all flex justify-between items-center ${
                    isSelected 
                    ? 'bg-[var(--color-soft-green)] text-[var(--text-main)] border-[2px] border-[var(--primary)]' 
                    : 'bg-[#FAFBFA] text-[var(--text-main)] border-[1px] border-[#DCE6E0] hover:border-[var(--primary)]'
                  }`}
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

export default function StudentDashboard({ session }) {
  const [profile, setProfile] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [activeTab, setActiveTab] = useState('tasks'); 
  const [activities, setActivities] = useState([]);
  const [scores, setScores] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);
  const [assessmentScores, setAssessmentScores] = useState([]);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filter, setFilter] = useState('not_completed');

  const [draftScores, setDraftScores] = useState({});
  const [draftRawInputs, setDraftRawInputs] = useState({});
  const [savedRawInputs, setSavedRawInputs] = useState({});
  const [isSavingScores, setIsSavingScores] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle');

  useEffect(() => {
    fetchProfileAndStudent();
  }, [session.user.id]);

  useEffect(() => {
    if (studentData && selectedDate) {
      fetchActivitiesAndScores();
    }
  }, [studentData, selectedDate]);

  useEffect(() => {
    if (activeTab === 'leaderboard' && studentData) {
      fetchLeaderboard();
    }
  }, [activeTab, studentData]);

  const fetchProfileAndStudent = async () => {
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
    if (prof) setProfile(prof);

    const { data: stu } = await supabase.from('students').select('*').eq('user_id', session.user.id).single();
    if (stu) setStudentData(stu);
  };

  const fetchActivitiesAndScores = async () => {
    const { data: acts } = await supabase.from('activities').select('*').eq('teacher_id', studentData.teacher_id).order('name');
    if (acts) setActivities(acts);

    const { data: dailyScores } = await supabase
      .from('daily_scores')
      .select('*')
      .eq('student_id', studentData.id)
      .eq('date', selectedDate);
      
    
    const { data: scores } = await supabase
      .from('assessment_scores')
      .select('score, feedback, assessments(title, max_score, type, date)')
      .eq('student_id', studentData.id)
      .order('created_at', { ascending: false });
    if (scores) setAssessmentScores(scores);

    if (dailyScores) {
      const scoreMap = {};
      const rawMap = {};
      dailyScores.forEach(s => {
        scoreMap[s.activity_id] = s.score;
        rawMap[s.activity_id] = s.raw_value;
      });
      setScores(scoreMap);
      setDraftScores(scoreMap);
      setDraftRawInputs(rawMap);
      setSavedRawInputs(rawMap);
    } else {
      setScores({});
      setDraftScores({});
      setDraftRawInputs({});
      setSavedRawInputs({});
    }
  };

  const fetchLeaderboard = async () => {
    const { data: allScores } = await supabase.from('daily_scores').select('student_id, score');
    const { data: allStudents } = await supabase.from('students').select('id, full_name, roll_no').eq('teacher_id', studentData.teacher_id);
    
    if (allScores && allStudents) {
      const totals = {};
      allScores.forEach(s => {
        totals[s.student_id] = (totals[s.student_id] || 0) + s.score;
      });
      
      const ranked = allStudents.map(student => ({
        ...student,
        total_score: totals[student.id] || 0
      })).sort((a, b) => b.total_score - a.total_score);
      
      setLeaderboard(ranked);
    }
  };

  const handleScoreChange = (activityId, rawValue, numericScore, forceOverwrite = false) => {
    setDraftRawInputs(prev => {
      const isCurrentlySelected = prev[activityId] === rawValue;
      if (isCurrentlySelected && !forceOverwrite) {
        // Deselect
        const newDrafts = { ...prev };
        delete newDrafts[activityId];
        return newDrafts;
      }
      if (numericScore === 0 && forceOverwrite && !rawValue) {
        // Allow removing the compound activity completely if they uncheck/zero everything
        const newDrafts = { ...prev };
        delete newDrafts[activityId];
        return newDrafts;
      }
      return { ...prev, [activityId]: rawValue };
    });
    
    setDraftScores(prev => {
      const isCurrentlySelected = draftRawInputs[activityId] === rawValue; 
      if (isCurrentlySelected && !forceOverwrite) {
        // Deselect
        const newScores = { ...prev };
        delete newScores[activityId];
        return newScores;
      }
      if (numericScore === 0 && forceOverwrite && !rawValue) {
        const newScores = { ...prev };
        delete newScores[activityId];
        return newScores;
      }
      return { ...prev, [activityId]: numericScore };
    });
  };

  const handleSaveScores = async () => {
    const upsertData = filteredActivities.map(activity => {
      const score = draftScores[activity.id];
      const rawValue = draftRawInputs[activity.id];
      if (score === null || score === undefined) return null;
      return {
        activity_id: activity.id,
        student_id: studentData.id,
        date: selectedDate,
        score: score,
        raw_value: String(rawValue)
      };
    }).filter(item => item !== null);

    if (upsertData.length > 0) {
      setIsSavingScores(true);
      setSaveStatus('saving');

      const { error } = await supabase.from('daily_scores').upsert(upsertData, {
        onConflict: 'activity_id, student_id, date'
      });

      setIsSavingScores(false);

      if (!error) {
        setSaveStatus('saved');
        fetchActivitiesAndScores(); // Refresh saved state
        setTimeout(() => setSaveStatus('idle'), 2500);
      } else {
        setSaveStatus('idle');
        alert('Error updating score: ' + error.message);
      }
    }
  };

  if (!studentData) {
    return <div className="min-h-screen bg-[var(--bg-cream)] flex items-center justify-center text-[var(--text-main)] font-medium">Loading...</div>;
  }

  const completedCount = Object.keys(draftScores).length;
  const totalPoints = Object.values(draftScores).reduce((sum, val) => sum + (val || 0), 0);
  const totalActivities = activities.length;
  
  const hasUnsavedChanges = Object.keys(draftRawInputs).some(k => draftRawInputs[k] !== savedRawInputs[k]) || Object.keys(savedRawInputs).some(k => savedRawInputs[k] !== draftRawInputs[k]);

  const filteredActivities = activities.filter(activity => {
    const isCompleted = !!draftRawInputs[activity.id];
    if (filter === 'not_completed') return !isCompleted;
    if (filter === 'completed') return isCompleted;
    return true;
  });

  return (
    <div className="min-h-screen pb-24 font-sans text-[var(--text-main)]">
      {/* Playful Header */}
      <nav className="px-6 pt-8 pb-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[var(--text-main)] text-3xl font-extrabold mt-2 tracking-tight">Good morning, {studentData.full_name.split(' ')[0]} 👋</p>
            <p className="text-[var(--text-muted)] text-lg mt-1 font-semibold">Ready for today's journey?</p>
          </div>
          <div className="flex flex-col items-end">
            <button onClick={() => supabase.auth.signOut()} className="bg-white p-2 rounded-full shadow-sm text-red-400 hover:text-red-500 hover:bg-red-50">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

            <main className="max-w-[1280px] mx-auto p-4 md:px-8">
        
        {/* TOP ROW: HERO + LEADERBOARD */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:items-stretch mb-10">
          
          {/* HERO */}
          <div className={`lg:col-span-8 ${activeTab === 'tasks' ? 'block' : 'hidden lg:block'}`}>
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
                      style={{ width: `${totalActivities === 0 ? 0 : (completedCount / totalActivities) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* LEADERBOARD WIDGET */}
          <div className={`lg:col-span-4 ${activeTab === 'leaderboard' ? 'block' : 'hidden lg:block'}`}>
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
        <div className={`${activeTab === 'tasks' ? 'block' : 'hidden lg:block'}`}>
          {/* CATEGORIES */}
          <div className="flex space-x-6 overflow-x-auto pb-0 mb-6 border-b border-[var(--border-soft)] scrollbar-hide">
            <button 
              onClick={() => setFilter('not_completed')}
              className={`flex-shrink-0 pb-3 font-semibold text-sm transition-colors border-b-2 ${filter === 'not_completed' ? 'text-[var(--primary)] border-[var(--primary)]' : 'text-[var(--text-muted)] border-transparent hover:text-[var(--text-main)]'}`}
            >
              Not completed
            </button>
            <button 
              onClick={() => setFilter('completed')}
              className={`flex-shrink-0 pb-3 font-semibold text-sm transition-colors border-b-2 ${filter === 'completed' ? 'text-[var(--primary)] border-[var(--primary)]' : 'text-[var(--text-muted)] border-transparent hover:text-[var(--text-main)]'}`}
            >
              Completed
            </button>
            <button 
              onClick={() => setFilter('all')}
              className={`flex-shrink-0 pb-3 font-semibold text-sm transition-colors border-b-2 ${filter === 'all' ? 'text-[var(--primary)] border-[var(--primary)]' : 'text-[var(--text-muted)] border-transparent hover:text-[var(--text-main)]'}`}
            >
              All
            </button>
          </div>

          {/* ACTIVITIES */}
          <div className="space-y-4">
            {filteredActivities.length === 0 ? (
              <div className="card-soft p-12 text-center max-w-lg mx-auto">
                <div className="w-20 h-20 bg-[var(--color-cream)] rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">🌟</div>
                <h3 className="text-xl font-bold text-[var(--text-main)] mb-2">No activities for today</h3>
                <p className="text-[var(--text-muted)] font-medium">No activities match the current filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {filteredActivities.map(activity => (
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
      {/* ASSESSMENTS / EXAMS SECTION */}
        <div className={`mt-12 ${activeTab === 'assessments' ? 'block' : 'hidden lg:block'}`}>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-[12px] bg-[var(--color-cream)] flex items-center justify-center">
              <FileText className="w-5 h-5 text-[var(--primary)]" />
            </div>
            <h2 className="text-xl font-bold uppercase tracking-wider text-[var(--text-main)]">Exams & Work</h2>
          </div>
          
          {assessmentScores.length === 0 ? (
            <div className="card-soft p-12 text-center max-w-lg mx-auto">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6"><FileText className="w-8 h-8 text-gray-300" /></div>
              <h3 className="text-xl font-bold text-[var(--text-main)] mb-2">No scores yet</h3>
              <p className="text-[var(--text-muted)] font-medium">Your exams and assignment scores will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assessmentScores.map((item, idx) => (
                <div key={idx} className="card-soft p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg uppercase text-[10px] tracking-wider font-bold">{item.assessments.type}</span>
                      <span className="text-[var(--text-muted)] text-xs font-semibold">{item.assessments.date}</span>
                    </div>
                    <h3 className="text-[18px] font-bold text-[var(--text-main)] mb-1">{item.assessments.title}</h3>
                  </div>
                  <div className="mt-6 pt-4 border-t border-[var(--border-soft)] flex justify-between items-baseline">
                    <span className="text-[var(--text-muted)] text-sm font-bold">Score</span>
                    <div className="text-right">
                      {item.score !== null ? (
                        <>
                          <span className="text-2xl font-black text-[var(--primary)]">{item.score}</span>
                          <span className="text-sm font-bold text-[var(--text-muted)]"> / {item.assessments.max_score}</span>
                        </>
                      ) : (
                        <span className="text-sm font-bold text-[var(--text-muted)] italic">Pending</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      {/* Sticky Save Action Area */}
      {hasUnsavedChanges && (
        <div className={`fixed left-0 right-0 bg-white border-t border-[var(--border-soft)] p-4 flex justify-between items-center z-20 animate-fade-in sm:max-w-7xl sm:mx-auto sm:border sm:rounded-t-2xl sm:shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] transition-all duration-300 ${activeTab === 'tasks' ? 'bottom-16 sm:bottom-0' : '-bottom-full sm:bottom-0'}`}>
          <p className="text-sm font-medium text-[var(--text-main)]">You have unsaved activities</p>
          <button 
            onClick={handleSaveScores}
            disabled={isSavingScores}
            className={`px-8 py-3 rounded-[12px] font-semibold text-sm transition-colors ${
              saveStatus === 'saved' 
              ? 'bg-[var(--soft-green)] text-[var(--primary)]' 
              : 'bg-[var(--primary)] text-white hover:opacity-90'
            }`}
          >
            {saveStatus === 'saved' ? '✓ Saved' : saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--border-soft)] flex justify-around p-2 lg:hidden z-30 pb-safe">
        <button 
          onClick={() => setActiveTab('tasks')}
          className={`flex flex-col items-center p-2 rounded-lg min-w-[80px] transition-colors ${activeTab === 'tasks' ? 'text-[var(--primary)]' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <CheckSquare className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-semibold">Today</span>
        </button>
        <button 
          onClick={() => setActiveTab('leaderboard')}
          className={`flex flex-col items-center p-2 rounded-lg min-w-[80px] transition-colors ${activeTab === 'leaderboard' ? 'text-[var(--primary)]' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <Trophy className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-semibold">Rank</span>
        </button>
        <button 
          onClick={() => setActiveTab('assessments')}
          className={`flex flex-col items-center p-2 rounded-lg min-w-[80px] transition-colors ${activeTab === 'assessments' ? 'text-[var(--primary)]' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <FileText className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-semibold">Exams & Work</span>
        </button>
      </div>
    </div>
  );
}
