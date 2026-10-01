import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { BookOpen, LogOut, Users, Activity, CheckSquare, Plus, Trash2, ChevronLeft, ChevronRight, Trophy, X, CheckCircle2, Edit2, FileText, Save } from 'lucide-react';

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
          className="bg-[var(--soft-blue)] p-5 rounded-[20px] border border-[#CDEBFF] cursor-pointer hover:bg-[#D5EFFF] transition-colors flex justify-between items-center shadow-sm"
        >
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
              <span className="text-[var(--primary)] font-bold">✓</span>
            </div>
            <div>
              <p className="font-bold text-[var(--text-main)] text-lg">{activity.name}</p>
              <p className="text-sm text-[var(--primary)] font-medium leading-tight">{displayRaw}</p>
            </div>
          </div>
          {currentScore !== undefined && currentScore !== null && (
            <span className="text-sm font-black text-[var(--primary)] bg-white px-3 py-1 rounded-full shadow-sm">
              +{currentScore} pts
            </span>
          )}
        </div>
      );
    } else {
      // Collapsed uncompleted state
      return (
        <div 
          onClick={() => setExpanded(true)}
          className="card-soft p-5 cursor-pointer hover:bg-gray-50 transition-colors flex justify-between items-center group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 rounded-full border-2 border-[var(--border-soft)] group-hover:border-[var(--primary)] transition-colors shrink-0 flex items-center justify-center bg-[#F9F9F9]" />
            <div>
              <p className="font-bold text-[var(--text-main)] text-lg">{activity.name}</p>
              <p className="text-sm text-[var(--text-muted)] font-medium leading-tight flex items-center mt-0.5">
                Not completed <span className="text-gray-300 ml-2">→</span>
              </p>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="card-soft p-6 relative overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-black text-[var(--text-main)] flex items-center">
          <span className="bg-[#FFF1D6] p-2 rounded-xl mr-3 text-lg leading-none">🎯</span>
          {activity.name}
        </h3>
        <button onClick={() => setExpanded(false)} className="text-sm text-[var(--text-muted)] hover:text-[var(--text-main)] font-bold transition-colors bg-gray-50 px-3 py-1.5 rounded-full">
          Collapse
        </button>
      </div>
      
      {hasOptions && isArrayOptions && (
        <div className="flex flex-col gap-3">
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
                className={`w-full py-4 px-5 text-left text-base font-bold rounded-2xl border-2 transition-all duration-200 flex justify-between items-center ${
                  isSelected 
                  ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-md transform scale-[1.01]' 
                  : 'bg-white text-[var(--text-muted)] border-[var(--border-soft)] hover:bg-[#F9F9F9] hover:border-[#DED4C0]'
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && (
                  <span className="bg-white/20 text-white px-2 py-1 rounded-full text-xs font-black shadow-sm">+ {opt.score} pts</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {hasOptions && isCompound && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3">
            {activity.options.choices.map((opt, idx) => {
              const isSelected = compoundSelections.includes(opt.label);
              return (
                <button
                  key={idx}
                  onClick={() => toggleCompoundSelection(opt.label)}
                  className={`w-full py-4 px-5 text-left text-base font-bold rounded-2xl border-2 transition-all duration-200 flex justify-between items-center ${
                    isSelected 
                    ? 'bg-[var(--sky)] text-[var(--text-main)] border-[var(--sky)] shadow-md transform scale-[1.01]' 
                    : 'bg-white text-[var(--text-muted)] border-[var(--border-soft)] hover:bg-[#F9F9F9] hover:border-[#DED4C0]'
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && (
                    <span className="bg-white/40 text-[var(--text-main)] px-2 py-1 rounded-full text-xs font-black shadow-sm">+ {opt.score} pts</span>
                  )}
                </button>
              );
            })}
          </div>
          
          <div className="flex items-center space-x-4 bg-[var(--bg-cream-secondary)] p-4 rounded-2xl border border-[var(--border-soft)]">
            <label className="text-base font-bold text-[var(--text-main)] flex-1">
              {activity.options.countLabel || 'Additional Count'}
            </label>
            <div className="flex items-center space-x-3 bg-white p-1 rounded-full shadow-sm border border-[var(--border-soft)]">
              <button 
                onClick={() => handleCompoundCountChange(Math.max(0, compoundCount - 1))}
                className="w-8 h-8 rounded-full bg-white hover:bg-gray-50 flex items-center justify-center text-[var(--text-main)] font-black text-lg transition-colors"
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
                className="w-12 text-center font-black text-xl text-[var(--text-main)] outline-none bg-transparent"
              />
              <button 
                onClick={() => handleCompoundCountChange(compoundCount + 1)}
                className="w-8 h-8 rounded-full bg-white hover:bg-gray-50 flex items-center justify-center text-[var(--text-main)] font-black text-lg transition-colors"
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
            className="w-full py-4 mt-2 bg-[var(--primary)] text-white text-lg rounded-2xl font-black shadow-md hover:scale-[1.02] transition-transform flex items-center justify-center"
          >
            Complete Mission
          </button>
        </div>
      )}
    </div>
  );
}


export default function TeacherDashboard({ session }) {
  const [profile, setProfile] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'tracking';
  
  const setActiveTab = (tab) => {
    setSearchParams({ tab });
  }; 
  
  // Data states
  const [students, setStudents] = useState([]);
  const [activities, setActivities] = useState([]);
  const [rawInputs, setRawInputs] = useState({}); 
  const [scores, setScores] = useState({}); 
  const [leaderboard, setLeaderboard] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [assessmentScores, setAssessmentScores] = useState({});
  const [isSavingAssessments, setIsSavingAssessments] = useState(false);
  const [isCreatingAssessment, setIsCreatingAssessment] = useState(false);
  const [newAssessment, setNewAssessment] = useState({ title: '', type: 'exam', max_score: 100, date: new Date().toISOString().split('T')[0] });
  const [assessmentSubTab, setAssessmentSubTab] = useState('exams_work'); // 'exams_work' or 'assignments'
  
  // Form states
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentUsername, setNewStudentUsername] = useState('');
  const [newStudentPassword, setNewStudentPassword] = useState('');
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [usernameSuffix, setUsernameSuffix] = useState('');
  const [isCreatingStudent, setIsCreatingStudent] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isCreateActivityModalOpen, setIsCreateActivityModalOpen] = useState(false);

  const [editingStudent, setEditingStudent] = useState(null);
  const [editStudentName, setEditStudentName] = useState('');
  const [editStudentUsername, setEditStudentUsername] = useState('');
  const [editStudentPassword, setEditStudentPassword] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const [newActivityName, setNewActivityName] = useState('');
  const [newActivityType, setNewActivityType] = useState('single'); // 'single', 'compound'
  const [newCountLabel, setNewCountLabel] = useState('');
  const [newCountScore, setNewCountScore] = useState(1);
  const [activityOptions, setActivityOptions] = useState([]); 

  const [editingActivity, setEditingActivity] = useState(null);
  const [editActivityName, setEditActivityName] = useState('');
  const [editActivityType, setEditActivityType] = useState('single');
  const [editCountLabel, setEditCountLabel] = useState('');
  const [editCountScore, setEditCountScore] = useState(1);
  const [editActivityOptions, setEditActivityOptions] = useState([]);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [trackingView, setTrackingView] = useState('list'); // 'list' or 'student'
  
  // Save states
  const [isSavingScores, setIsSavingScores] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle', 'saving', 'saved'

  useEffect(() => {
    fetchProfile();
    fetchStudents();
    fetchActivities();
  }, [session.user.id]);

  const [todayTrackedCount, setTodayTrackedCount] = useState(0);

  useEffect(() => {
    if (activeTab === 'leaderboard') {
      fetchLeaderboard();
    }
    if (activeTab === 'assessments') {
      fetchAssessments();
    }
  }, [activeTab]);

  useEffect(() => {
    if (selectedDate) {
      fetchTodayProgress();
    }
    if (selectedStudentId && selectedDate) {
      fetchScores();
    }
  }, [selectedStudentId, selectedDate]);

  const fetchTodayProgress = async () => {
    const { data } = await supabase.from('daily_scores').select('student_id').eq('date', selectedDate);
    if (data) {
      const uniqueStudents = new Set(data.map(d => d.student_id));
      setTodayTrackedCount(uniqueStudents.size);
    }
  };

  const fetchProfile = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
    if (data) setProfile(data);
  };

  
  const fetchAssessments = async () => {
    const { data } = await supabase.from('assessments').select('*').eq('teacher_id', session.user.id).order('date', { ascending: false });
    if (data) setAssessments(data);
  };

  useEffect(() => {
    if (activeTab === 'assessments') {
      fetchAssessments();
    }
  }, [activeTab]);

  const loadAssessmentScores = async (assessment) => {
    setSelectedAssessment(assessment);
    const { data } = await supabase.from('assessment_scores').select('*').eq('assessment_id', assessment.id);
    const scoresMap = {};
    if (data) {
      data.forEach(s => { scoresMap[s.student_id] = s.score; });
    }
    setAssessmentScores(scoresMap);
    setIsCreatingAssessment(false);
  };

  const handleCreateAssessment = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.from('assessments').insert([{
      teacher_id: session.user.id,
      ...newAssessment
    }]).select().single();
    
    if (error) {
      alert('Error creating assessment: ' + error.message);
    } else {
      setAssessments([data, ...assessments]);
      setIsCreatingAssessment(false);
      loadAssessmentScores(data);
    }
  };

  const handleSaveAssessmentScores = async () => {
    if (!selectedAssessment) return;
    
    const upserts = students.map(student => {
      const score = assessmentScores[student.id];
      return {
        assessment_id: selectedAssessment.id,
        student_id: student.id,
        score: score === '' || score === undefined ? null : Number(score)
      };
    });

    const { error } = await supabase.from('assessment_scores').upsert(upserts, { onConflict: 'assessment_id,student_id' });
    if (error) {
      alert('Error saving scores: ' + error.message);
    } else {
      alert('Scores saved successfully!');
    }
  };

  const fetchStudents = async () => {
    const { data } = await supabase.from('students').select('*').order('full_name');
    if (data) {
      setStudents(data);
      if (data.length > 0 && !selectedStudentId) {
        setSelectedStudentId(data[0].id);
      }
    }
  };

  const fetchLeaderboard = async () => {
    // In a real app we'd use an RPC, but doing it in memory for now
    const { data: allScores } = await supabase.from('daily_scores').select('student_id, score');
    const { data: allStudents } = await supabase.from('students').select('id, full_name, roll_no');
    
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

  

  const fetchActivities = async () => {
    const { data } = await supabase.from('activities').select('*').order('name');
    if (data) setActivities(data);
  };

  const fetchScores = async () => {
    const { data } = await supabase
      .from('daily_scores')
      .select('*')
      .eq('student_id', selectedStudentId)
      .eq('date', selectedDate);
    
    if (data) {
      const scoreMap = {};
      const rawMap = {};
      data.forEach(score => {
        const key = score.activity_id;
        scoreMap[key] = score.score;
        rawMap[key] = score.raw_value || '';
      });
      setScores(scoreMap);
      setRawInputs(rawMap);
    } else {
      setScores({});
      setRawInputs({});
    }
  };

  const handleOpenAddStudentModal = () => {
    setNewStudentName('');
    setNewStudentUsername('');
    setNewStudentPassword('');
    setUsernameTouched(false);
    // Generate a random 3-digit suffix for uniqueness across the app
    setUsernameSuffix(Math.floor(100 + Math.random() * 900).toString());
    setIsAddStudentModalOpen(true);
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    setNewStudentName(val);
    
    if (!usernameTouched) {
      const base = val.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (base) {
        setNewStudentUsername(`${base}${usernameSuffix}`);
      } else {
        setNewStudentUsername('');
      }
    }
  };

  const handleUsernameChange = (e) => {
    setUsernameTouched(true);
    setNewStudentUsername(e.target.value.toLowerCase().replace(/\s+/g, ''));
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!newStudentName || !newStudentUsername || !newStudentPassword) return;
    
    setIsCreatingStudent(true);
    try {
      const { count } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', session.user.id);
        
      const nextRollNo = (count || 0) + 1;
      const email = `${newStudentUsername}@dha-im.app`;

      const { data, error } = await supabase.functions.invoke('create-student', {
        body: {
          email,
          password: newStudentPassword,
          full_name: newStudentName,
          teacher_id: session.user.id,
          roll_no: nextRollNo
        }
      });

      if (error) throw error;

      setIsAddStudentModalOpen(false);
      fetchStudents();
      alert('Student created successfully!');
    } catch (error) {
      if (error.message.includes('already registered')) {
        alert('That username is already taken. Please choose a different one.');
      } else {
        alert('Error creating student: ' + error.message);
      }
    } finally {
      setIsCreatingStudent(false);
    }
  };

  const handleEditClick = (student) => {
    setEditingStudent(student);
    setEditStudentName(student.full_name);
    setEditStudentPassword('');
    setEditStudentUsername('Loading...');
    
    supabase.from('profiles').select('email').eq('id', student.user_id).single().then(({ data }) => {
      if (data && data.email) {
        setEditStudentUsername(data.email.replace('@dha-im.app', ''));
      } else {
        setEditStudentUsername('');
      }
    });
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    setIsSavingEdit(true);
    try {
      const formattedEmail = editStudentUsername.includes('@') ? editStudentUsername : `${editStudentUsername}@dha-im.app`;
      const body = {
        action: 'update',
        userId: editingStudent.user_id,
        role: 'student'
      };
      if (editStudentName !== editingStudent.full_name) body.full_name = editStudentName;
      if (editStudentUsername && editStudentUsername !== 'Loading...') body.email = formattedEmail;
      if (editStudentPassword) body.password = editStudentPassword;

      const { data, error } = await supabase.functions.invoke('manage-user', { body });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      setEditingStudent(null);
      fetchStudents();
    } catch(err) {
      alert(err.message);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteStudent = async (student) => {
    if (!window.confirm('Are you sure you want to delete this student and all their scores?')) return;
    try {
      const { data, error } = await supabase.functions.invoke('manage-user', { 
        body: { action: 'delete', userId: student.user_id, role: 'student' } 
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      fetchStudents();
    } catch(err) {
      alert(err.message);
    }
  };

  const handleDeleteActivity = async (id) => {
    if (!window.confirm('Are you sure you want to delete this activity and all related scores?')) return;
    await supabase.from('activities').delete().eq('id', id);
    fetchActivities();
  };

  const addOptionField = (e) => {
    e?.preventDefault();
    setActivityOptions(prev => [...prev, { label: '', score: 0 }]);
  };

  const updateOption = (index, field, value) => {
    setActivityOptions(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeOption = (index) => {
    setActivityOptions(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    if (!newActivityName) return;
    const validOptions = activityOptions.filter(opt => opt.label.trim() !== '');
    
    let optionsToSave = validOptions;
    if (newActivityType === 'compound') {
      optionsToSave = {
        type: 'compound',
        choices: validOptions,
        countLabel: newCountLabel || 'Count',
        countScore: Number(newCountScore) || 1
      };
    }

    await supabase.from('activities').insert([{ 
      teacher_id: session.user.id, 
      name: newActivityName, 
      options: optionsToSave 
    }]);
    
    setNewActivityName('');
    setNewActivityType('single');
    setNewCountLabel('');
    setNewCountScore(1);
    setActivityOptions([]);
    fetchActivities();
    setIsCreateActivityModalOpen(false);
  };

  const handleEditActivityClick = (activity) => {
    setEditingActivity(activity);
    setEditActivityName(activity.name);
    
    if (activity.options && !Array.isArray(activity.options) && activity.options.type === 'compound') {
      setEditActivityType('compound');
      setEditCountLabel(activity.options.countLabel || '');
      setEditCountScore(activity.options.countScore || 1);
      setEditActivityOptions(activity.options.choices || []);
    } else {
      setEditActivityType('single');
      setEditCountLabel('');
      setEditCountScore(1);
      setEditActivityOptions(activity.options || []);
    }
  };

  const handleUpdateActivity = async (e) => {
    e.preventDefault();
    if (!editActivityName) return;
    const validOptions = editActivityOptions.filter(opt => opt.label.trim() !== '');
    
    let optionsToSave = validOptions;
    if (editActivityType === 'compound') {
      optionsToSave = {
        type: 'compound',
        choices: validOptions,
        countLabel: editCountLabel || 'Count',
        countScore: Number(editCountScore) || 1
      };
    }

    await supabase.from('activities')
      .update({ name: editActivityName, options: optionsToSave })
      .eq('id', editingActivity.id);
    setEditingActivity(null);
    fetchActivities();
  };

  const addEditOptionField = (e) => {
    e?.preventDefault();
    setEditActivityOptions(prev => [...prev, { label: '', score: 0 }]);
  };

  const updateEditOption = (index, field, value) => {
    setEditActivityOptions(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeEditOption = (index) => {
    setEditActivityOptions(prev => prev.filter((_, i) => i !== index));
  };

  const handleScoreChange = (activityId, rawValue, numericScore, forceOverwrite = false) => {
    setRawInputs(prev => {
      const isCurrentlySelected = prev[activityId] === rawValue;
      if (isCurrentlySelected && !forceOverwrite) {
        // Deselect
        const newInputs = { ...prev };
        delete newInputs[activityId];
        return newInputs;
      }
      if (numericScore === 0 && forceOverwrite && !rawValue) {
        // Allow removing the compound activity completely if they uncheck/zero everything
        const newInputs = { ...prev };
        delete newInputs[activityId];
        return newInputs;
      }
      return { ...prev, [activityId]: rawValue };
    });
    
    setScores(prev => {
      const isCurrentlySelected = rawInputs[activityId] === rawValue;
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
    const upsertData = activities.map(activity => {
      const score = scores[activity.id];
      const rawValue = rawInputs[activity.id];
      if (score === null || score === undefined) return null;
      return {
        activity_id: activity.id,
        student_id: selectedStudentId,
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
        fetchTodayProgress();
        setTimeout(() => setSaveStatus('idle'), 2500); // Reset after 2.5s
      } else {
        setSaveStatus('idle');
        alert('Error saving scores: ' + error.message);
      }
    } else {
      alert('No scores to save.');
    }
  };

  const goToPreviousStudent = () => {
    const currentIndex = students.findIndex(s => s.id === selectedStudentId);
    if (currentIndex > 0) setSelectedStudentId(students[currentIndex - 1].id);
  };

  const goToNextStudent = () => {
    const currentIndex = students.findIndex(s => s.id === selectedStudentId);
    if (currentIndex < students.length - 1) setSelectedStudentId(students[currentIndex + 1].id);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-cream)] pb-20 lg:pb-0 lg:flex font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 h-screen sticky top-0 bg-white border-r border-[var(--border-soft)] p-6 z-20">
        <div className="flex items-center space-x-2 text-[var(--primary)] mb-10 mt-2">
          <BookOpen className="w-8 h-8" />
          <h1 className="text-2xl font-bold text-[var(--text-main)]">Dha'im</h1>
        </div>
        
        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setActiveTab('tracking')}
            className={`w-full flex items-center px-4 py-3 rounded-2xl font-medium transition-colors ${activeTab === 'tracking' ? 'bg-[var(--soft-green)] text-[var(--primary)]' : 'text-gray-600 hover:bg-[var(--bg-cream)] hover:text-[var(--text-main)]'}`}
          >
            <CheckSquare className="w-5 h-5 mr-3" /> Track Activities
          </button>
          <button 
            onClick={() => setActiveTab('students')}
            className={`w-full flex items-center px-4 py-3 rounded-2xl font-medium transition-colors ${activeTab === 'students' ? 'bg-[var(--soft-green)] text-[var(--primary)]' : 'text-gray-600 hover:bg-[var(--bg-cream)] hover:text-[var(--text-main)]'}`}
          >
            <Users className="w-5 h-5 mr-3" /> Manage Students
          </button>
        <button 
          onClick={() => setActiveTab('assessments')}
          className={`flex flex-col items-center p-2 rounded-xl min-w-[60px] ${activeTab === 'assessments' ? 'text-[var(--primary)]' : 'text-gray-400'}`}
        >
          <FileText className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-semibold">Exams</span>
        </button>
          <button 
            onClick={() => setActiveTab('activities')}
            className={`w-full flex items-center px-4 py-3 rounded-2xl font-medium transition-colors ${activeTab === 'activities' ? 'bg-[var(--soft-green)] text-[var(--primary)]' : 'text-gray-600 hover:bg-[var(--bg-cream)] hover:text-[var(--text-main)]'}`}
          >
            <Activity className="w-5 h-5 mr-3" /> Setup Activities
          </button>
          <button 
            onClick={() => setActiveTab('assessments')}
            className={`w-full flex items-center px-4 py-3 rounded-2xl font-medium transition-colors ${activeTab === 'assessments' ? 'bg-[var(--soft-green)] text-[var(--primary)]' : 'text-gray-600 hover:bg-[var(--bg-cream)] hover:text-[var(--text-main)]'}`}
          >
            <FileText className="w-5 h-5 mr-3" /> Exams & Work
          </button>
          <button 
            onClick={() => setActiveTab('assessments')}
            className={`w-full flex items-center px-4 py-3 rounded-2xl font-medium transition-colors ${activeTab === 'assessments' ? 'bg-[var(--soft-green)] text-[var(--primary)]' : 'text-gray-600 hover:bg-[var(--bg-cream)] hover:text-[var(--text-main)]'}`}
          >
            <FileText className="w-5 h-5 mr-3" /> Exams & Work
          </button>
          <button 
            onClick={() => setActiveTab('leaderboard')}
            className={`w-full flex items-center px-4 py-3 rounded-2xl font-medium transition-colors ${activeTab === 'leaderboard' ? 'bg-yellow-50 text-yellow-700' : 'text-gray-600 hover:bg-[var(--bg-cream)] hover:text-[var(--text-main)]'}`}
          >
            <Trophy className="w-5 h-5 mr-3" /> Leaderboard
          </button>
        </nav>

        <div className="pt-6 border-t border-[var(--border-soft)] mt-auto">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-[var(--text-main)] bg-gray-100 px-3 py-1.5 rounded-xl">
              {profile ? `@${profile.email.replace('@dha-im.app', '')}` : '...'}
            </span>
            <button onClick={() => supabase.auth.signOut()} className="text-gray-400 hover:text-[var(--text-main)] p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile-friendly Navigation Header */}
      <nav className="lg:hidden bg-white shadow-sm border-b px-5 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center space-x-2 text-[var(--primary)]">
          <BookOpen className="w-6 h-6" />
          <h1 className="text-lg font-bold text-[var(--text-main)]">Dha'im Teacher</h1>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-xs font-bold bg-[var(--soft-blue)] text-green-800 px-2.5 py-1 rounded-md">
            {profile ? `@${profile.email.replace('@dha-im.app', '')}` : '...'}
          </span>
          <button onClick={() => supabase.auth.signOut()} className="text-gray-400 hover:text-[var(--text-main)] p-1">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-4 lg:p-8 xl:p-12">
        {/* Tab Content: Daily Tracking */}
        {activeTab === 'tracking' && (
          <div className="animate-fade-in">
            {activities.length === 0 || students.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl shadow-sm border">
                <CheckSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">Please add a student and an activity first.</p>
                <button onClick={() => setActiveTab('students')} className="text-[var(--primary)] font-medium hover:underline">Go to settings</button>
              </div>
            ) : trackingView === 'list' ? (
              <div className="space-y-4 pb-6">
                <div className="card-soft bg-[#F6F8F6] p-8 border-none overflow-hidden relative mb-8">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full blur-3xl opacity-50 -mr-10 -mt-10 pointer-events-none"></div>
                  
                  <div className="relative z-10 flex flex-col sm:flex-row justify-between sm:items-end mb-6">
                    <div>
                      <h2 className="text-xs font-bold tracking-widest uppercase text-[var(--primary)] mb-2">Today's Tracking</h2>
                      <div className="flex items-baseline mt-1">
                        <span className="text-5xl font-black text-[var(--text-main)] tracking-tight">{todayTrackedCount}</span>
                        <span className="text-sm font-semibold ml-2 text-[var(--text-muted)]">of {students.length} students</span>
                      </div>
                    </div>
                    <div className="text-left sm:text-right mt-4 sm:mt-0">
                      <span className="text-sm font-semibold text-[var(--text-muted)]">{Math.round((todayTrackedCount / Math.max(1, students.length)) * 100) || 0}% Complete</span>
                    </div>
                  </div>
                  <div className="relative z-10 w-full bg-[#EAECEB] h-2 rounded-full overflow-hidden mt-2">
                    <div 
                      className="bg-[var(--primary)] h-full transition-all duration-700 ease-out rounded-full"
                      style={{ width: `${(todayTrackedCount / Math.max(1, students.length)) * 100}%` }}
                    />
                  </div>
                </div>

                <h2 className="text-xl font-bold text-[var(--text-main)] mb-6 lg:mb-8 px-1">Select Student to Grade</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
                  {students.map(student => (
                    <button 
                      key={student.id} 
                      onClick={() => { setSelectedStudentId(student.id); setTrackingView('student'); }}
                      className="w-full bg-white p-5 lg:p-6 rounded-2xl shadow-sm border text-left flex justify-between items-center hover:shadow-md hover:border-green-200 transition-all active:bg-[var(--bg-cream)]"
                    >
                      <span className="font-semibold text-[var(--text-main)] text-lg lg:text-xl">
                        <span className="text-gray-400 mr-3 text-sm font-normal">#{student.roll_no || '-'}</span>
                        {student.full_name}
                      </span>
                      <ChevronRight className="text-gray-300 w-6 h-6" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <button 
                  onClick={() => setTrackingView('list')} 
                  className="text-[var(--primary)] flex items-center text-sm font-bold bg-[var(--soft-blue)] px-3 py-2 rounded-xl w-fit active:bg-[var(--soft-blue)]"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back to Class List
                </button>
                
                {/* Date & Student Controls */}
                <div className="card-soft p-5 shadow-sm border space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Date</label>
                    <input 
                      type="date" 
                      className="w-full bg-[var(--bg-cream)] px-3 py-2 border rounded-xl text-[var(--text-main)] font-medium focus:ring-2 focus:ring-green-500 outline-none"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Student</label>
                    <div className="flex items-center justify-between space-x-2">
                      <button 
                        onClick={goToPreviousStudent} 
                        disabled={students.findIndex(s => s.id === selectedStudentId) === 0}
                        className="p-2 border rounded-xl bg-[var(--bg-cream)] text-gray-600 disabled:opacity-30 active:bg-gray-200"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <select 
                        className="flex-1 px-3 py-2 border rounded-xl font-bold text-[var(--text-main)] bg-white focus:ring-2 focus:ring-green-500 outline-none appearance-none text-center"
                        value={selectedStudentId}
                        onChange={(e) => setSelectedStudentId(e.target.value)}
                      >
                        {students.map(student => (
                          <option key={student.id} value={student.id}>
                            #{student.roll_no || '-'} {student.full_name}
                          </option>
                        ))}
                      </select>
                      <button 
                        onClick={goToNextStudent}
                        disabled={students.findIndex(s => s.id === selectedStudentId) === students.length - 1}
                        className="p-2 border rounded-xl bg-[var(--bg-cream)] text-gray-600 disabled:opacity-30 active:bg-gray-200"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Activities List */}
                <div className="space-y-4 xl:grid xl:grid-cols-2 xl:gap-4 xl:space-y-0">
                  {activities.map(activity => (
                    <ActivityCard 
                      key={activity.id}
                      activity={activity}
                      currentScore={scores[activity.id]}
                      currentRaw={rawInputs[activity.id]}
                      handleScoreChange={handleScoreChange}
                    />
                  ))}
                </div>

                {/* Save Button */}
                <div className="pt-4 pb-6">
                  <button 
                    onClick={handleSaveScores}
                    disabled={isSavingScores}
                    className={`w-full py-4 text-white text-lg rounded-2xl font-bold transition-all flex items-center justify-center space-x-2 border-2 border-black ${
                      saveStatus === 'saved' 
                      ? 'bg-green-700 border-b-2 translate-y-1' 
                      : saveStatus === 'saving'
                      ? 'bg-[#00a845] opacity-80 border-b-[6px]'
                      : 'bg-[#00a845] hover:bg-[#00b050] border-b-[6px] active:border-b-2 active:translate-y-1'
                    }`}
                  >
                    {saveStatus === 'saved' ? (
                      <>
                        <CheckCircle2 className="w-6 h-6" />
                        <span>Scores Saved!</span>
                      </>
                    ) : saveStatus === 'saving' ? (
                      <span>Saving...</span>
                    ) : (
                      <span>Save Scores</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Manage Students */}
        {activeTab === 'students' && (
          <div className="space-y-6 animate-fade-in pb-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold text-[var(--text-main)]">Manage Students</h2>
              <button 
                onClick={handleOpenAddStudentModal}
                className="flex items-center space-x-1 bg-[var(--primary)] text-white px-4 py-2 rounded-xl font-bold hover:bg-green-700 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Student</span>
              </button>
            </div>

            {/* Modal Overlay */}
            {isAddStudentModalOpen && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
                  <div className="flex justify-between items-center p-5 border-b border-[var(--border-soft)]">
                    <h2 className="text-xl font-bold text-[var(--text-main)]">Add New Student</h2>
                    <button 
                      onClick={() => setIsAddStudentModalOpen(false)}
                      className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="p-5">
                    <form onSubmit={handleAddStudent} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          className="w-full px-4 py-3 border border-[var(--border-soft)] bg-[var(--bg-cream)] rounded-2xl focus:ring-2 focus:ring-green-500 outline-none font-medium"
                          value={newStudentName}
                          onChange={handleNameChange}
                          placeholder="e.g. Ahmed Ali"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Username</label>
                          <input
                            type="text"
                            required
                            className="w-full px-4 py-3 border border-[var(--border-soft)] bg-[var(--bg-cream)] rounded-2xl focus:ring-2 focus:ring-green-500 outline-none font-medium"
                            value={newStudentUsername}
                            onChange={handleUsernameChange}
                            placeholder="ahmed123"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Password</label>
                          <input
                            type="password"
                            required
                            className="w-full px-4 py-3 border border-[var(--border-soft)] bg-[var(--bg-cream)] rounded-2xl focus:ring-2 focus:ring-green-500 outline-none font-medium"
                            value={newStudentPassword}
                            onChange={(e) => setNewStudentPassword(e.target.value)}
                            placeholder="••••••••"
                          />
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <button 
                          type="submit" 
                          disabled={isCreatingStudent}
                          className="w-full py-3.5 bg-gray-900 text-white rounded-2xl hover:bg-black font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                        >
                          {isCreatingStudent ? 'Adding Student...' : 'Create Student Account'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-[var(--border-soft)] overflow-hidden">
              <h2 className="text-lg font-semibold p-5 border-b border-[var(--border-soft)] text-[var(--text-main)]">Class Roster ({students.length})</h2>
              {students.length === 0 ? (
                <div className="text-center py-16 px-4 bg-gray-50/50">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-[var(--text-main)] mb-1">No students yet</h3>
                  <p className="text-[var(--text-muted)] mb-4">Add your first student to start tracking progress.</p>
                  <button 
                    onClick={handleOpenAddStudentModal}
                    className="bg-[var(--soft-green)] text-[var(--primary)] px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-[#dff0e6] transition-colors inline-flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Student
                  </button>
                </div>
              ) : (
                <ul className="divide-y divide-[#E7ECE9]">
                  {students.map(student => (
                    <li key={student.id} className="p-5 font-medium text-[var(--text-main)] flex items-center justify-between group hover:bg-gray-50 transition-colors">
                      <div className="flex items-center">
                        <span className="w-8 text-sm text-gray-400 font-bold">#{student.roll_no || '-'}</span>
                        <span>{student.full_name}</span>
                      </div>
                      <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => handleEditClick(student)}
                          className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-colors"
                          title="Edit Student"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteStudent(student)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                          title="Delete Student"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Edit Student Modal */}
            {editingStudent && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
                  <div className="flex justify-between items-center p-5 border-b border-[var(--border-soft)] bg-[var(--bg-cream)]/50">
                    <div>
                      <h3 className="font-extrabold text-xl text-[var(--text-main)]">Edit Student</h3>
                    </div>
                    <button 
                      onClick={() => setEditingStudent(null)}
                      className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="p-5">
                    <form onSubmit={handleUpdateStudent} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          className="w-full px-4 py-3 border border-[var(--border-soft)] bg-[var(--bg-cream)] rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                          value={editStudentName}
                          onChange={(e) => setEditStudentName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Username</label>
                        <input
                          type="text"
                          required
                          className="w-full px-4 py-3 border border-[var(--border-soft)] bg-[var(--bg-cream)] rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                          value={editStudentUsername}
                          onChange={(e) => setEditStudentUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">New Password (leave blank to keep current)</label>
                        <input
                          type="password"
                          className="w-full px-4 py-3 border border-[var(--border-soft)] bg-[var(--bg-cream)] rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                          value={editStudentPassword}
                          onChange={(e) => setEditStudentPassword(e.target.value)}
                          placeholder="Enter new password"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isSavingEdit}
                        className="w-full py-3.5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                      >
                        {isSavingEdit ? 'Saving...' : 'Save Changes'}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Manage Activities */}
        {activeTab === 'activities' && (
          <div className="space-y-6 animate-fade-in pb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[var(--text-main)]">Manage Activities</h2>
              <button 
                onClick={() => setIsCreateActivityModalOpen(true)}
                className="bg-[var(--primary)] text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-[#066036] transition-colors"
              >
                + Add Activity
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-[var(--border-soft)] overflow-hidden">
              <h2 className="text-lg font-semibold p-5 border-b border-[var(--border-soft)] text-[var(--text-main)]">Tracked Activities</h2>
              {activities.length === 0 ? (
                <div className="text-center py-16 px-4 bg-gray-50/50">
                  <div className="w-12 h-12 flex items-center justify-center text-gray-300 mx-auto mb-4 text-3xl">▤</div>
                  <h3 className="text-lg font-bold text-[var(--text-main)] mb-1">No activities yet</h3>
                  <p className="text-[var(--text-muted)] mb-4">Add your first activity to start grading students.</p>
                  <button 
                    onClick={() => setIsCreateActivityModalOpen(true)}
                    className="bg-[var(--soft-green)] text-[var(--primary)] px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-[#dff0e6] transition-colors inline-flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Activity
                  </button>
                </div>
              ) : (
                <ul className="divide-y divide-[#E7ECE9]">
                  {activities.map(activity => (
                    <li key={activity.id} className="p-5 relative group hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-[var(--text-main)]">{activity.name}</div>
                          {Array.isArray(activity.options) ? (
                            activity.options.length > 0 ? (
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {activity.options.map((opt, i) => (
                                  <span key={i} className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-md border border-[var(--border-soft)]">
                                    {opt.label} <span className="text-gray-400">({opt.score})</span>
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <div className="mt-1 text-xs text-red-500 font-bold">Needs Options</div>
                            )
                          ) : (
                            activity.options && activity.options.type === 'compound' ? (
                              <div className="mt-2 space-y-2">
                                <div className="flex flex-wrap gap-1.5">
                                  {activity.options.choices && activity.options.choices.map((opt, i) => (
                                    <span key={i} className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-md border border-[var(--border-soft)]">
                                      {opt.label} <span className="text-gray-400">({opt.score})</span>
                                    </span>
                                  ))}
                                </div>
                                <div className="text-xs font-medium bg-[var(--soft-green)] text-[var(--primary)] px-2 py-1 rounded-md border border-green-200 inline-block">
                                  + {activity.options.countLabel} <span className="text-[var(--primary)] opacity-75">({activity.options.countScore} pts per unit)</span>
                                </div>
                              </div>
                            ) : (
                              <div className="mt-1 text-xs text-red-500 font-bold">Needs Options</div>
                            )
                          )}
                        </div>
                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-all absolute top-2 right-0">
                          <button 
                            onClick={() => handleEditActivityClick(activity)}
                            className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                            title="Edit Activity"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteActivity(activity.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            title="Delete Activity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Edit Activity Modal */}
            {editingActivity && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in max-h-[90vh] flex flex-col">
                  <div className="flex justify-between items-center p-5 border-b border-[var(--border-soft)] bg-[var(--bg-cream)]/50 shrink-0">
                    <h3 className="font-extrabold text-xl text-[var(--text-main)]">Edit Activity</h3>
                    <button 
                      onClick={() => setEditingActivity(null)}
                      className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="p-5 overflow-y-auto">
                    <form onSubmit={handleUpdateActivity} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Activity Name</label>
                        <input
                          type="text"
                          required
                          className="w-full px-4 py-3 border border-[var(--border-soft)] bg-[var(--bg-cream)] rounded-2xl focus:ring-2 focus:ring-[#087A45] outline-none font-medium text-[var(--text-main)]"
                          value={editActivityName}
                          onChange={(e) => setEditActivityName(e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Activity Type</label>
                        <select
                          className="w-full px-4 py-3 border border-[var(--border-soft)] bg-[var(--bg-cream)] rounded-2xl focus:ring-2 focus:ring-[#087A45] outline-none font-medium text-[var(--text-main)]"
                          value={editActivityType}
                          onChange={(e) => setEditActivityType(e.target.value)}
                        >
                          <option value="single">Single Choice (Pick one)</option>
                          <option value="compound">Compound (Pick options + Add count)</option>
                        </select>
                      </div>

                      {editActivityType === 'compound' && (
                        <div className="flex space-x-4">
                          <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Count Label</label>
                            <input
                              type="text"
                              required
                              className="w-full px-4 py-3 border border-[var(--border-soft)] bg-[var(--bg-cream)] rounded-2xl focus:ring-2 focus:ring-[#087A45] outline-none font-medium text-[var(--text-main)] text-sm"
                              value={editCountLabel}
                              onChange={(e) => setEditCountLabel(e.target.value)}
                              placeholder="e.g. Pages"
                            />
                          </div>
                          <div className="w-28">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Pts per unit</label>
                            <input
                              type="number"
                              required
                              className="w-full px-4 py-3 border border-[var(--border-soft)] bg-[var(--bg-cream)] rounded-2xl focus:ring-2 focus:ring-[#087A45] outline-none font-medium text-[var(--text-main)] text-sm text-center"
                              value={editCountScore}
                              onChange={(e) => setEditCountScore(e.target.value)}
                            />
                          </div>
                        </div>
                      )}
                      
                      <div className="pt-4 border-t border-[var(--border-soft)]">
                        <div className="flex flex-col mb-3 space-y-2">
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Answer Options</label>
                          <button type="button" onClick={addEditOptionField} className="w-full flex justify-center items-center bg-[var(--soft-blue)] border border-green-200 text-[var(--primary)] px-4 py-3 rounded-xl font-bold hover:bg-[var(--soft-blue)] transition-colors">
                            <Plus className="w-5 h-5 mr-2" /> Add a new answer option
                          </button>
                        </div>
                        
                        {editActivityOptions.length === 0 ? (
                          <p className="text-xs text-red-500 font-bold mb-2">You must add at least one answer option.</p>
                        ) : (
                          <div className="space-y-2 mt-2">
                            {editActivityOptions.map((opt, index) => (
                              <div key={index} className="flex space-x-2">
                                <input
                                  type="text"
                                  placeholder="Answer (e.g. Jama'ath)"
                                  className="flex-1 px-3 py-2 text-sm border border-[var(--border-soft)] bg-[var(--bg-cream)] rounded-xl focus:ring-1 focus:ring-[#087A45] outline-none font-medium"
                                  value={opt.label}
                                  onChange={(e) => updateEditOption(index, 'label', e.target.value)}
                                  required
                                />
                                <input
                                  type="number"
                                  placeholder="Pts"
                                  className="w-20 px-3 py-2 text-sm border border-[var(--border-soft)] bg-[var(--bg-cream)] rounded-xl focus:ring-1 focus:ring-[#087A45] outline-none font-medium text-center"
                                  value={opt.score}
                                  onChange={(e) => updateEditOption(index, 'score', e.target.value)}
                                  required
                                />
                                <button type="button" onClick={() => removeEditOption(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-4 shrink-0">
                        <button
                          type="submit"
                          disabled={editActivityOptions.length === 0}
                          className="w-full py-3.5 bg-[var(--primary)] text-white rounded-2xl hover:bg-[#066036] font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-colors"
                        >
                          Save Activity Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {/* Tab Content: Assessments */}
        {activeTab === 'assessments' && (
          <div className="animate-fade-in space-y-6 pb-6">
            <div className="flex justify-between items-start bg-white p-5 lg:p-8 rounded-2xl shadow-sm border border-[var(--border-soft)] mb-6">
              <div>
                <h2 className="text-xl font-bold text-[var(--text-main)]">Assessments</h2>
                <p className="text-[var(--text-muted)] text-sm mt-1">Manage exams, assignments, and enter scores.</p>
                <div className="flex space-x-6 mt-6">
                  <button 
                    onClick={() => setAssessmentSubTab('exams_work')}
                    className={`font-semibold pb-2 border-b-2 transition-colors ${assessmentSubTab === 'exams_work' ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                  >
                    Exams & Work
                  </button>
                  <button 
                    onClick={() => setAssessmentSubTab('assignments')}
                    className={`font-semibold pb-2 border-b-2 transition-colors ${assessmentSubTab === 'assignments' ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                  >
                    Assignments
                  </button>
                </div>
              </div>
              <button 
                onClick={() => { setIsCreatingAssessment(true); setSelectedAssessment(null); }}
                className="bg-[var(--primary)] text-white px-5 py-2.5 rounded-xl font-bold flex items-center shadow-sm hover:opacity-90"
              >
                <Plus className="w-5 h-5 mr-2" /> New
              </button>
            </div>

            {isCreatingAssessment ? (
              <div className="bg-white p-6 lg:p-8 rounded-2xl shadow-sm border border-[var(--border-soft)]">
                <h3 className="text-lg font-bold text-[var(--text-main)] mb-6">Create New Assessment</h3>
                <form onSubmit={handleCreateAssessment} className="space-y-4 max-w-xl">
                  <div>
                    <label className="block text-sm font-bold text-[var(--text-main)] mb-1">Title</label>
                    <input type="text" required value={newAssessment.title} onChange={e => setNewAssessment({...newAssessment, title: e.target.value})} className="w-full border border-[var(--border-soft)] rounded-xl px-4 py-3 bg-[#FAFBFA] focus:border-[var(--primary)] outline-none font-medium" placeholder="e.g. Midterm Exam" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-[var(--text-main)] mb-1">Type</label>
                      <select value={newAssessment.type} onChange={e => setNewAssessment({...newAssessment, type: e.target.value})} className="w-full border border-[var(--border-soft)] rounded-xl px-4 py-3 bg-[#FAFBFA] focus:border-[var(--primary)] outline-none font-medium">
                        <option value="exam">Exam</option>
                        <option value="assignment">Assignment</option>
                        <option value="work">Classwork</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[var(--text-main)] mb-1">Max Score</label>
                      <input type="number" required min="1" value={newAssessment.max_score} onChange={e => setNewAssessment({...newAssessment, max_score: parseInt(e.target.value)})} className="w-full border border-[var(--border-soft)] rounded-xl px-4 py-3 bg-[#FAFBFA] focus:border-[var(--primary)] outline-none font-medium" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[var(--text-main)] mb-1">Date</label>
                    <input type="date" required value={newAssessment.date} onChange={e => setNewAssessment({...newAssessment, date: e.target.value})} className="w-full border border-[var(--border-soft)] rounded-xl px-4 py-3 bg-[#FAFBFA] focus:border-[var(--primary)] outline-none font-medium" />
                  </div>
                  <div className="pt-4 flex space-x-3">
                    <button type="button" onClick={() => setIsCreatingAssessment(false)} className="px-6 py-3 rounded-xl font-bold text-[var(--text-muted)] hover:bg-gray-100 transition-colors">Cancel</button>
                    <button type="submit" className="px-6 py-3 rounded-xl font-bold text-white bg-[var(--primary)] hover:opacity-90 transition-colors">Create Assessment</button>
                  </div>
                </form>
              </div>
            ) : selectedAssessment ? (
              <div className="bg-white rounded-2xl shadow-sm border border-[var(--border-soft)] overflow-hidden">
                <div className="p-6 lg:p-8 border-b border-[var(--border-soft)] flex justify-between items-center bg-[#FAFBFA]">
                  <div>
                    <button onClick={() => setSelectedAssessment(null)} className="text-[var(--primary)] text-sm font-bold mb-2 hover:underline">← Back to all assessments</button>
                    <h3 className="text-2xl font-bold text-[var(--text-main)]">{selectedAssessment.title}</h3>
                    <p className="text-[var(--text-muted)] font-medium mt-1 uppercase text-xs tracking-wider">{selectedAssessment.type} • Max Score: {selectedAssessment.max_score} • {selectedAssessment.date}</p>
                  </div>
                  <button onClick={handleSaveAssessmentScores} className="bg-[var(--primary)] text-white px-6 py-3 rounded-xl font-bold flex items-center shadow-sm hover:opacity-90 transition-colors">
                    <Save className="w-5 h-5 mr-2" /> Save Scores
                  </button>
                </div>
                <div className="p-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 divide-y md:divide-y-0">
                    {students.map(student => (
                      <div key={student.id} className="p-5 border-b md:border-r border-[var(--border-soft)] flex justify-between items-center hover:bg-gray-50 transition-colors">
                        <div>
                          <p className="font-bold text-[var(--text-main)]">{student.full_name}</p>
                          <p className="text-xs font-medium text-[var(--text-muted)]">Roll No. {student.roll_no}</p>
                        </div>
                        <div className="flex items-center">
                          <input 
                            type="number" 
                            min="0" 
                            max={selectedAssessment.max_score}
                            value={assessmentScores[student.id] ?? ''} 
                            onChange={(e) => setAssessmentScores({...assessmentScores, [student.id]: e.target.value})}
                            className="w-20 text-center font-bold text-lg border-2 border-[var(--border-soft)] focus:border-[var(--primary)] rounded-lg py-2 outline-none transition-colors"
                            placeholder="-"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assessments.filter(a => assessmentSubTab === 'exams_work' ? (a.type === 'exam' || a.type === 'work') : a.type === 'assignment').length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"><FileText className="w-8 h-8 text-gray-400" /></div>
                    <p className="text-[var(--text-main)] font-bold text-lg">No assessments yet</p>
                    <p className="text-[var(--text-muted)] mb-6">Create an exam or assignment to start grading.</p>
                  </div>
                ) : (
                  assessments.filter(a => assessmentSubTab === 'exams_work' ? (a.type === 'exam' || a.type === 'work') : a.type === 'assignment').map(assessment => (
                    <div key={assessment.id} onClick={() => loadAssessmentScores(assessment)} className="bg-white p-6 rounded-2xl shadow-sm border border-[var(--border-soft)] hover:border-[var(--primary)] hover:shadow-md cursor-pointer transition-all group">
                      <div className="w-12 h-12 rounded-xl bg-[var(--color-cream)] text-[var(--primary)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <FileText className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-[var(--text-main)] mb-1">{assessment.title}</h3>
                      <div className="flex justify-between items-center mt-4 text-sm font-medium">
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg uppercase text-[10px] tracking-wider">{assessment.type}</span>
                        <span className="text-[var(--text-muted)]">{assessment.date}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Leaderboard */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-6 animate-fade-in pb-6">
            <div className="bg-white p-5 lg:p-8 rounded-2xl shadow-sm border border-[var(--border-soft)]">
              <div className="flex items-center justify-center space-x-2 mb-8 text-[var(--text-main)]">
                <Trophy className="w-6 h-6 text-[#C99A3D]" />
                <h2 className="text-xl font-bold tracking-wide uppercase text-gray-400">Class Leaderboard</h2>
              </div>
              
              {leaderboard.length === 0 ? (
                 <div className="text-center py-8">
                   <p className="text-[var(--text-muted)] font-medium">No students on the leaderboard yet.</p>
                 </div>
              ) : (
                <>
                  {/* Podium Section */}
                  <div className="flex justify-center items-end space-x-6 mb-12 mt-8">
                    {/* Rank 2 */}
                    {leaderboard[1] && (
                      <div className="flex flex-col items-center w-24">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold mb-3">2</div>
                        <p className={`font-semibold text-sm truncate w-full text-center ${'text-[var(--text-main)]'}`}>
                          {leaderboard[1].full_name.split(' ')[0]}
                        </p>
                        <p className="text-xs font-medium text-[var(--text-muted)] mt-1">{leaderboard[1].total_score} pts</p>
                      </div>
                    )}
                    
                    {/* Rank 1 */}
                    {leaderboard[0] && (
                      <div className="flex flex-col items-center w-28 mb-4">
                        <div className="w-14 h-14 rounded-full bg-[var(--color-gold)]/20 flex items-center justify-center text-[var(--color-gold)] font-black text-xl mb-3 shadow-sm">1</div>
                        <p className={`font-bold text-base truncate w-full text-center ${'text-[var(--text-main)]'}`}>
                          {leaderboard[0].full_name.split(' ')[0]}
                        </p>
                        <p className="text-sm font-semibold text-[var(--color-gold)] mt-1">{leaderboard[0].total_score} pts</p>
                      </div>
                    )}
                    
                    {/* Rank 3 */}
                    {leaderboard[2] && (
                      <div className="flex flex-col items-center w-24">
                        <div className="w-10 h-10 rounded-full bg-[#F2B477]/10 flex items-center justify-center text-[#F2B477] font-bold mb-3">3</div>
                        <p className={`font-semibold text-sm truncate w-full text-center ${'text-[var(--text-main)]'}`}>
                          {leaderboard[2].full_name.split(' ')[0]}
                        </p>
                        <p className="text-xs font-medium text-[var(--text-muted)] mt-1">{leaderboard[2].total_score} pts</p>
                      </div>
                    )}
                  </div>

                  {/* Rest of Leaderboard */}
                  {leaderboard.length > 0 && (
                    <div className="pt-4 max-w-2xl mx-auto">
                      <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4 px-2">Rankings</h3>
                      <ul className="divide-y divide-[#E7ECE9] bg-[var(--bg-cream)] rounded-2xl border border-[var(--border-soft)]">
                        {leaderboard.map((student, idx) => {
                          const index = idx;
                          return (
                            <li key={student.id} className="py-4 px-6 flex items-center justify-between hover:bg-white transition-colors group">
                              <div className="flex items-center space-x-4">
                                <div className="w-8 text-center font-bold text-[var(--text-muted)] text-sm group-hover:text-[var(--text-main)] transition-colors">
                                  {index + 1}
                                </div>
                                <div>
                                  <p className="font-medium text-base text-[var(--text-main)]">
                                    {student.full_name}
                                  </p>
                                  <p className="text-xs text-[var(--text-muted)]">
                                    Roll No. {student.roll_no || '-'}
                                  </p>
                                </div>
                              </div>
                              <div className="text-base font-semibold text-[var(--text-main)]">
                                {student.total_score} <span className="text-xs font-normal text-[var(--text-muted)]">pts</span>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      

      </main>

      {/* Mobile Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--border-soft)] flex justify-around p-2 lg:hidden z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-safe">
        <button 
          onClick={() => setActiveTab('tracking')}
          className={`flex flex-col items-center p-2 rounded-xl min-w-[60px] ${activeTab === 'tracking' ? 'text-[var(--primary)]' : 'text-gray-400'}`}
        >
          <CheckSquare className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-semibold">Track</span>
        </button>
        <button 
          onClick={() => setActiveTab('students')}
          className={`flex flex-col items-center p-2 rounded-xl min-w-[60px] ${activeTab === 'students' ? 'text-[var(--primary)]' : 'text-gray-400'}`}
        >
          <Users className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-semibold">Students</span>
        </button>
        <button 
          onClick={() => setActiveTab('activities')}
          className={`flex flex-col items-center p-2 rounded-xl min-w-[60px] ${activeTab === 'activities' ? 'text-[var(--primary)]' : 'text-gray-400'}`}
        >
          <Activity className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-semibold">Activities</span>
        </button>
        <button 
          onClick={() => setActiveTab('assessments')}
          className={`flex flex-col items-center p-2 rounded-xl min-w-[60px] ${activeTab === 'assessments' ? 'text-[var(--primary)]' : 'text-gray-400'}`}
        >
          <FileText className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-semibold">Exams & Work</span>
        </button>
        <button 
          onClick={() => setActiveTab('leaderboard')}
          className={`flex flex-col items-center p-2 rounded-xl min-w-[60px] ${activeTab === 'leaderboard' ? 'text-yellow-500' : 'text-gray-400'}`}
        >
          <Trophy className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-semibold">Rank</span>
        </button>
      </div>

      {/* Create Activity Modal */}
      {isCreateActivityModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-5 border-b border-[var(--border-soft)] bg-[var(--bg-cream)]/50 shrink-0">
              <h3 className="font-extrabold text-xl text-[var(--text-main)]">Add New Activity</h3>
              <button 
                onClick={() => setIsCreateActivityModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto">
              <form onSubmit={handleAddActivity} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Activity Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-[var(--border-soft)] bg-[var(--bg-cream)] rounded-2xl focus:ring-2 focus:ring-[#087A45] outline-none font-medium text-[var(--text-main)]"
                    value={newActivityName}
                    onChange={(e) => setNewActivityName(e.target.value)}
                    placeholder="e.g. Zhuhr"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Activity Type</label>
                  <select
                    className="w-full px-4 py-3 border border-[var(--border-soft)] bg-[var(--bg-cream)] rounded-2xl focus:ring-2 focus:ring-[#087A45] outline-none font-medium text-[var(--text-main)]"
                    value={newActivityType}
                    onChange={(e) => setNewActivityType(e.target.value)}
                  >
                    <option value="single">Single Choice (Pick one)</option>
                    <option value="compound">Compound (Pick options + Add count)</option>
                  </select>
                </div>

                {newActivityType === 'compound' && (
                  <div className="flex space-x-4">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Count Label</label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 border border-[var(--border-soft)] bg-[var(--bg-cream)] rounded-2xl focus:ring-2 focus:ring-[#087A45] outline-none text-sm font-medium text-[var(--text-main)]"
                        value={newCountLabel}
                        onChange={(e) => setNewCountLabel(e.target.value)}
                        placeholder="e.g. Pages"
                      />
                    </div>
                    <div className="w-28">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Pts per unit</label>
                      <input
                        type="number"
                        required
                        className="w-full px-4 py-3 border border-[var(--border-soft)] bg-[var(--bg-cream)] rounded-2xl focus:ring-2 focus:ring-[#087A45] outline-none text-sm text-center font-medium text-[var(--text-main)]"
                        value={newCountScore}
                        onChange={(e) => setNewCountScore(e.target.value)}
                      />
                    </div>
                  </div>
                )}
                
                <div className="pt-4 border-t border-[var(--border-soft)]">
                  <div className="flex flex-col mb-3 space-y-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Answer Options</label>
                    <button type="button" onClick={addOptionField} className="w-full flex justify-center items-center bg-[var(--soft-blue)] border border-green-200 text-[var(--primary)] px-4 py-3 rounded-xl font-bold hover:bg-[#dff0e6] transition-colors">
                      <Plus className="w-5 h-5 mr-2" /> Add a new answer option
                    </button>
                  </div>
                  
                  {activityOptions.length === 0 ? (
                    <p className="text-xs text-red-500 font-bold mb-2">You must add at least one answer option.</p>
                  ) : (
                    <div className="space-y-2 mt-2">
                      {activityOptions.map((opt, index) => (
                        <div key={index} className="flex space-x-2">
                          <input
                            type="text"
                            placeholder="Answer (e.g. Jama'ath)"
                            className="flex-1 px-3 py-2 text-sm border border-[var(--border-soft)] bg-[var(--bg-cream)] rounded-xl focus:ring-1 focus:ring-[#087A45] outline-none font-medium text-[var(--text-main)]"
                            value={opt.label}
                            onChange={(e) => updateOption(index, 'label', e.target.value)}
                            required
                          />
                          <input
                            type="number"
                            placeholder="Pts"
                            className="w-20 px-3 py-2 text-sm border border-[var(--border-soft)] bg-[var(--bg-cream)] rounded-xl focus:ring-1 focus:ring-[#087A45] outline-none font-medium text-[var(--text-main)]"
                            value={opt.score}
                            onChange={(e) => updateOption(index, 'score', e.target.value)}
                            required
                          />
                          <button type="button" onClick={() => removeOption(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={activityOptions.length === 0}
                    className="w-full py-3.5 mt-2 bg-[var(--primary)] text-white rounded-xl hover:bg-[#066036] font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
                  >
                    Add Activity
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

