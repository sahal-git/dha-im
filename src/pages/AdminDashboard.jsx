import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Users, UserPlus, LogOut, Edit2, Trash2, X } from 'lucide-react';

export default function AdminDashboard({ session }) {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [usernameSuffix, setUsernameSuffix] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isCreateTeacherModalOpen, setIsCreateTeacherModalOpen] = useState(false);

  // Edit State
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const [totalStudents, setTotalStudents] = useState(0);
  const [totalActivities, setTotalActivities] = useState(0);
  
  const [studentsData, setStudentsData] = useState([]);
  const [activitiesData, setActivitiesData] = useState([]);

  useEffect(() => {
    fetchTeachers();
    fetchStats();
    fetchData();
    setUsernameSuffix(Math.floor(100 + Math.random() * 900).toString());
  }, []);

  const fetchData = async () => {
    const { data: sData } = await supabase.from('students').select('*').order('total_score', { ascending: false });
    if (sData) setStudentsData(sData);
    
    const { data: aData } = await supabase.from('activities').select('*').order('created_at', { ascending: true });
    if (aData) setActivitiesData(aData);
  };

  const fetchStats = async () => {
    const { count: studentCount } = await supabase.from('students').select('*', { count: 'exact', head: true });
    if (studentCount !== null) setTotalStudents(studentCount);
    
    const { count: actCount } = await supabase.from('activities').select('*', { count: 'exact', head: true });
    if (actCount !== null) setTotalActivities(actCount);
  };

  const fetchTeachers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'teacher');
      
    if (data) {
      setTeachers(data);
    }
    setLoading(false);
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    setFullName(val);
    
    if (!usernameTouched) {
      const base = val.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (base) {
        setEmail(`${base}${usernameSuffix}`);
      } else {
        setEmail('');
      }
    }
  };

  const handleUsernameChange = (e) => {
    setUsernameTouched(true);
    setEmail(e.target.value.toLowerCase().replace(/\s+/g, ''));
  };

  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    setSuccess(null);

    try {
      const formattedEmail = email.includes('@') ? email : `${email}@dha-im.app`;

      const { data, error } = await supabase.functions.invoke('create-teacher', {
        body: { email: formattedEmail, password, full_name: fullName }
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      setSuccess(`Teacher account for ${email} created successfully!`);
      setEmail('');
      setPassword('');
      setFullName('');
      setUsernameTouched(false);
      setUsernameSuffix(Math.floor(100 + Math.random() * 900).toString());
      fetchTeachers();
      setIsCreateTeacherModalOpen(false);
    } catch (err) {
      if (err.message.includes('already registered')) {
        setError('That username is already taken. Please choose a different one.');
      } else {
        setError(err.message || 'Failed to create teacher account.');
      }
    } finally {
      setCreating(false);
    }
  };

  const handleEditClick = (teacher) => {
    setEditingTeacher(teacher);
    setEditName(teacher.full_name);
    setEditEmail(teacher.email.replace('@dha-im.app', ''));
    setEditPassword('');
  };

  const handleUpdateTeacher = async (e) => {
    e.preventDefault();
    setIsSavingEdit(true);
    try {
      const formattedEmail = editEmail.includes('@') ? editEmail : `${editEmail}@dha-im.app`;
      const body = {
        action: 'update',
        userId: editingTeacher.id,
        role: 'teacher'
      };
      if (editName !== editingTeacher.full_name) body.full_name = editName;
      if (formattedEmail !== editingTeacher.email) body.email = formattedEmail;
      if (editPassword) body.password = editPassword;

      const { data, error } = await supabase.functions.invoke('manage-user', { body });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      setEditingTeacher(null);
      fetchTeachers();
    } catch(err) {
      alert(err.message);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteTeacher = async (id) => {
    if (!window.confirm("Are you sure you want to delete this teacher? This will delete all their students and activities!")) return;
    try {
      const { data, error } = await supabase.functions.invoke('manage-user', { 
        body: { action: 'delete', userId: id, role: 'teacher' } 
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      fetchTeachers();
    } catch(err) {
      alert(err.message);
    }
  };

  // State for Navigation
  const [activeTab, setActiveTab] = useState('teacher');

  return (
    <div className="min-h-screen bg-[var(--bg-cream)] lg:flex font-sans text-[var(--text-main)]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 h-screen sticky top-0 bg-white border-r border-[var(--border-soft)] p-6 z-20">
        <div className="flex items-center space-x-2 text-[var(--primary)] mb-10 mt-2">
          <Users className="w-8 h-8" />
          <h1 className="text-2xl font-bold text-[var(--text-main)]">Dha'im Admin</h1>
        </div>
        
        <nav className="flex-1 space-y-2">
          {['overview', 'teacher', 'students', 'activities', 'leaderboard'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full flex items-center px-4 py-3 rounded-xl font-semibold transition-colors capitalize ${
                activeTab === tab ? 'bg-[var(--soft-green)] text-[var(--primary)]' : 'text-gray-500 hover:bg-gray-50 hover:text-[var(--text-main)]'
              }`}
            >
              {tab === 'overview' && <div className="w-5 h-5 mr-3 flex items-center justify-center">❖</div>}
              {tab === 'teacher' && <UserPlus className="w-5 h-5 mr-3" />}
              {tab === 'students' && <Users className="w-5 h-5 mr-3" />}
              {tab === 'activities' && <div className="w-5 h-5 mr-3 flex items-center justify-center">▤</div>}
              {tab === 'leaderboard' && <div className="w-5 h-5 mr-3 flex items-center justify-center">🏆</div>}
              {tab}
            </button>
          ))}
        </nav>

        <div className="pt-6 border-t border-[var(--border-soft)] mt-auto">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-[var(--text-main)] bg-gray-100 px-3 py-1.5 rounded-lg">
              Admin
            </span>
            <button onClick={() => supabase.auth.signOut()} className="text-gray-400 hover:text-[var(--text-main)] p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile-friendly Navigation Header */}
      <nav className="lg:hidden bg-white shadow-sm border-b border-[var(--border-soft)] px-5 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center space-x-2 text-[var(--primary)]">
          <Users className="w-6 h-6" />
          <h1 className="text-lg font-bold text-[var(--text-main)]">Dha'im Admin</h1>
        </div>
        <button onClick={() => supabase.auth.signOut()} className="text-gray-400 hover:text-[var(--text-main)] p-1">
          <LogOut className="w-5 h-5" />
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 lg:p-8 xl:p-12">
        {activeTab === 'overview' ? (
          <div className="animate-fade-in space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-[var(--text-main)]">Good morning, Admin</h2>
              <p className="text-[var(--text-muted)] mt-1">Here's what's happening today across Dha'im.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card-soft p-6">
                <p className="text-sm font-semibold text-[var(--text-muted)] tracking-wider mb-3">Teachers</p>
                <div className="flex items-end justify-between">
                  <span className="text-5xl font-black tracking-tight text-[var(--text-main)]">{teachers.length}</span>
                  <div className="w-12 h-12 bg-blue-50 text-[var(--color-blue-accent)] rounded-2xl flex items-center justify-center">
                    <UserPlus className="w-6 h-6" />
                  </div>
                </div>
              </div>
              <div className="card-soft p-6">
                <p className="text-sm font-semibold text-[var(--text-muted)] tracking-wider mb-3">Students</p>
                <div className="flex items-end justify-between">
                  <span className="text-5xl font-black tracking-tight text-[var(--text-main)]">{totalStudents}</span>
                  <div className="w-12 h-12 bg-orange-50 text-[var(--color-orange-accent)] rounded-2xl flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                </div>
              </div>
              <div className="card-soft p-6">
                <p className="text-sm font-semibold text-[var(--text-muted)] tracking-wider mb-3">Activities</p>
                <div className="flex items-end justify-between">
                  <span className="text-5xl font-black tracking-tight text-[var(--text-main)]">{totalActivities}</span>
                  <div className="w-12 h-12 bg-purple-50 text-[var(--color-purple-accent)] rounded-2xl flex items-center justify-center">
                    <Activity className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'teacher' ? (
          <div className="animate-fade-in space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[var(--text-main)]">Teachers</h2>
              <button 
                onClick={() => setIsCreateTeacherModalOpen(true)}
                className="bg-[var(--primary)] text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-[#066036] transition-colors flex items-center"
              >
                <UserPlus className="w-4 h-4 mr-2" /> Add Teacher
              </button>
            </div>

            {/* Teachers List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? (
                <p className="text-gray-500 font-medium p-8 text-center col-span-full">Loading...</p>
              ) : teachers.length === 0 ? (
                <div className="text-center py-16 px-4 col-span-full card-soft border-0">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-[var(--text-main)] mb-1">No teachers yet</h3>
                  <p className="text-[var(--text-muted)] mb-4">Add your first teacher to start setting up classes.</p>
                  <button 
                    onClick={() => setIsCreateTeacherModalOpen(true)}
                    className="bg-[var(--soft-green)] text-[var(--primary)] px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-[#dff0e6] transition-colors"
                  >
                    + Add Teacher
                  </button>
                </div>
              ) : (
                teachers.map((teacher) => (
                  <div key={teacher.id} className="card-soft border-0 border-[var(--border-soft)] overflow-hidden p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-[var(--text-main)]">{teacher.full_name}</h3>
                          <p className="text-[var(--text-muted)] font-medium text-sm mt-0.5">@{teacher.email.replace('@dha-im.app', '')}</p>
                        </div>
                        <div className="flex items-center space-x-1.5 bg-[var(--soft-blue)] px-2.5 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]"></span>
                          <span className="text-xs font-bold text-[var(--primary)]">Active</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-6 mb-4 border-t border-[var(--border-soft)] pt-4 mt-2">
                        <div>
                          <p className="text-xl font-bold text-[var(--text-main)]">
                             {studentsData.filter(s => s.teacher_id === teacher.id).length}
                          </p>
                          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mt-0.5">Students</p>
                        </div>
                        <div>
                          <p className="text-xl font-bold text-[var(--text-main)]">
                             {activitiesData.filter(a => a.teacher_id === teacher.id).length}
                          </p>
                          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mt-0.5">Activities</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 mt-auto">
                      <button 
                        onClick={() => handleEditClick(teacher)}
                        className="flex-1 bg-[var(--bg-cream)] text-[var(--text-main)] py-2 rounded-lg font-bold text-sm hover:bg-[#E7ECE9] border border-[var(--border-soft)] transition-colors flex items-center justify-center"
                      >
                        <Edit2 className="w-3.5 h-3.5 mr-1.5" /> Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteTeacher(teacher.id)}
                        className="flex-1 text-red-600 py-2 rounded-lg font-bold text-sm hover:bg-red-50 transition-colors flex items-center justify-center border border-transparent hover:border-red-100"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : activeTab === 'students' ? (
          <div className="animate-fade-in space-y-6">
            <h2 className="text-2xl font-bold text-[var(--text-main)] mb-6">All Students</h2>
            <div className="card-soft border-0 border-[var(--border-soft)] overflow-hidden">
              <ul className="divide-y divide-[#E7ECE9]">
                {studentsData.map((student, idx) => (
                  <li key={student.id} className="p-5 flex justify-between items-center hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-bold text-[var(--text-muted)] w-6">#{idx + 1}</span>
                      <div>
                        <p className="font-semibold text-lg text-[var(--text-main)]">{student.full_name}</p>
                        <p className="text-sm font-medium text-[var(--text-muted)]">Roll No. {student.roll_no || '-'} • Teacher: {teachers.find(t => t.id === student.teacher_id)?.full_name || 'Unknown'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-[var(--text-main)]">{student.total_score}</p>
                      <p className="text-xs text-[var(--text-muted)] uppercase">Pts</p>
                    </div>
                  </li>
                ))}
                {studentsData.length === 0 && (
                  <div className="p-8 text-center text-[var(--text-muted)]">No students found.</div>
                )}
              </ul>
            </div>
          </div>
        ) : activeTab === 'activities' ? (
          <div className="animate-fade-in space-y-6">
            <h2 className="text-2xl font-bold text-[var(--text-main)] mb-6">All Activities</h2>
            <div className="card-soft border-0 border-[var(--border-soft)] overflow-hidden">
              <ul className="divide-y divide-[#E7ECE9]">
                {activitiesData.map((act) => (
                  <li key={act.id} className="p-5 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-lg text-[var(--text-main)]">{act.name}</p>
                        <p className="text-sm font-medium text-[var(--text-muted)] mt-1 capitalize">
                          {act.options?.type === 'compound' ? 'Compound Activity' : 'Single Select'} • Teacher: {teachers.find(t => t.id === act.teacher_id)?.full_name || 'Unknown'}
                        </p>
                      </div>
                      <span className="bg-[var(--soft-green)] text-[var(--primary)] px-3 py-1 rounded-full text-xs font-bold">Active</span>
                    </div>
                  </li>
                ))}
                {activitiesData.length === 0 && (
                  <div className="p-8 text-center text-[var(--text-muted)]">No activities found.</div>
                )}
              </ul>
            </div>
          </div>
        ) : null}
      </main>

      {/* Mobile Bottom Navigation Bar (Admin) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--border-soft)] flex justify-around p-2 lg:hidden z-20 pb-safe">
        {['overview', 'teacher', 'students', 'activities'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex flex-col items-center p-2 rounded-lg min-w-[60px] ${activeTab === tab ? 'text-[var(--primary)]' : 'text-gray-400'}`}
          >
            {tab === 'overview' && <div className="w-6 h-6 mb-1 flex items-center justify-center">❖</div>}
            {tab === 'teacher' && <UserPlus className="w-6 h-6 mb-1" />}
            {tab === 'students' && <Users className="w-6 h-6 mb-1" />}
            {tab === 'activities' && <div className="w-6 h-6 mb-1 flex items-center justify-center">▤</div>}
            <span className="text-[10px] font-semibold capitalize">{tab}</span>
          </button>
        ))}
      </div>

      {/* Create Teacher Modal */}
      {isCreateTeacherModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="flex justify-between items-center p-5 border-b border-[var(--border-soft)] bg-[var(--bg-cream)]/50">
              <h3 className="font-extrabold text-xl text-[var(--text-main)]">Add New Teacher</h3>
              <button onClick={() => setIsCreateTeacherModalOpen(false)} className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm font-medium">{error}</div>}
              {success && <div className="mb-4 p-3 bg-[var(--soft-green)] text-[var(--primary)] rounded-xl text-sm font-medium">{success}</div>}
              
              <form onSubmit={handleCreateTeacher} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-[var(--border-soft)] bg-[var(--bg-cream)] rounded-xl focus:ring-2 focus:ring-[#087A45] outline-none font-medium text-[var(--text-main)]"
                    value={fullName}
                    onChange={handleNameChange}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Username</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-[var(--border-soft)] bg-[var(--bg-cream)] rounded-xl focus:ring-2 focus:ring-[#087A45] outline-none font-medium text-[var(--text-main)]"
                    value={email}
                    onChange={handleUsernameChange}
                    placeholder="e.g. jsmith"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Password</label>
                  <input
                    type="password"
                    required
                    className="w-full px-4 py-3 border border-[var(--border-soft)] bg-[var(--bg-cream)] rounded-xl focus:ring-2 focus:ring-[#087A45] outline-none font-medium text-[var(--text-main)]"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={creating}
                    className="w-full py-3.5 bg-[var(--primary)] text-white rounded-xl hover:bg-[#066036] font-bold text-lg disabled:opacity-50 transition-colors shadow-sm"
                  >
                    {creating ? 'Creating...' : 'Add Teacher'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Teacher Modal */}
      {editingTeacher && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="flex justify-between items-center p-5 border-b border-[var(--border-soft)] bg-gray-50/50">
              <h3 className="font-extrabold text-xl text-[var(--text-main)]">Edit Teacher</h3>
              <button onClick={() => setEditingTeacher(null)} className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              <form onSubmit={handleUpdateTeacher} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-[var(--border-soft)] bg-[var(--bg-cream)] rounded-xl focus:ring-2 focus:ring-[#087A45] outline-none font-medium text-[var(--text-main)]"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Username</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-[var(--border-soft)] bg-[var(--bg-cream)] rounded-xl focus:ring-2 focus:ring-[#087A45] outline-none font-medium text-[var(--text-main)]"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">New Password (leave blank to keep current)</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-[var(--border-soft)] bg-[var(--bg-cream)] rounded-xl focus:ring-2 focus:ring-[#087A45] outline-none font-medium text-[var(--text-main)]"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSavingEdit}
                    className="w-full py-3.5 bg-[var(--primary)] text-white rounded-xl hover:bg-[#066036] disabled:opacity-50 font-bold text-lg transition-colors shadow-sm"
                  >
                    {isSavingEdit ? 'Saving...' : 'Save Changes'}
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
