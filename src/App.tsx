import { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, Link, useNavigate } from 'react-router-dom';
import api from './api/client';
import { useAuth } from './context/AuthContext';
import type { User } from './types/auth';
import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  AreaChart,
  Area,
} from 'recharts';

function App() {
  const { user, token, logout } = useAuth();

  if (!token) {
    return <LoginPage />;
  }

  return (
    <Routes>
      <Route element={<ProtectedLayout user={user} onLogout={logout} />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/faculty" element={<FacultyPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/marks" element={<MarksPage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/quizzes" element={<QuizzesPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/recommendations" element={<RecommendationsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

function ProtectedLayout({ user, onLogout }: { user: User | null; onLogout: () => Promise<void> | void }) {
  const navigate = useNavigate();
  const items = useMemo(() => [
    { label: 'Dashboard', path: '/' },
    { label: 'Students', path: '/students' },
    { label: 'Faculty', path: '/faculty' },
    { label: 'Courses', path: '/courses' },
    { label: 'Marks', path: '/marks' },
    { label: 'Attendance', path: '/attendance' },
    { label: 'Quizzes', path: '/quizzes' },
    { label: 'Analytics', path: '/analytics' },
    { label: 'Recommendations', path: '/recommendations' },
    { label: 'Reports', path: '/reports' },
    { label: 'Profile', path: '/profile' },
  ], []);

  const handleLogout = async () => {
    await onLogout();
    navigate('/');
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">E</span>
          <div>
            <strong>EduPulse</strong>
            <small>{user?.role ?? 'USER'}</small>
          </div>
        </div>
        <nav>
          {items.map((item) => (
            <Link key={item.path} className="nav-item" to={item.path}>
              {item.label}
            </Link>
          ))}
        </nav>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </aside>
      <main className="content-area">
        <OutletRender />
      </main>
    </div>
  );
}

function OutletRender() {
  return <div className="page-container"><Routes>
    <Route path="/" element={<DashboardPage />} />
    <Route path="/students" element={<StudentsPage />} />
    <Route path="/faculty" element={<FacultyPage />} />
    <Route path="/courses" element={<CoursesPage />} />
    <Route path="/marks" element={<MarksPage />} />
    <Route path="/attendance" element={<AttendancePage />} />
    <Route path="/quizzes" element={<QuizzesPage />} />
    <Route path="/analytics" element={<AnalyticsPage />} />
    <Route path="/recommendations" element={<RecommendationsPage />} />
    <Route path="/reports" element={<ReportsPage />} />
    <Route path="/profile" element={<ProfilePage />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes></div>;
}

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login', { username, password });
      const result = response.data?.data;
      if (!result?.token || !result?.user) {
        throw new Error('Login failed');
      }
      login(result.token, result.user);
      navigate('/');
    } catch (err) {
      setError('Unable to sign in. Check credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell">
      <div className="login-card">
        <h1>EduPulse</h1>
        <p>Student Performance Analysis and Learning Insights</p>
        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            <span>Username</span>
            <input value={username} onChange={(e) => setUsername(e.target.value)} />
          </label>
          <label>
            <span>Password</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          {error && <div className="error-box">{error}</div>}
          <button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button>
        </form>
      </div>
    </div>
  );
}

function DashboardPage() {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/overview')
      .then((response) => setData(response.data.data ?? {}))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Students', value: data.totalStudents ?? 0 },
    { label: 'Average Marks', value: `${Number(data.averageMarks ?? 0).toFixed(2)}%` },
    { label: 'Pass Rate', value: `${Number(data.passRate ?? 0).toFixed(2)}%` },
    { label: 'Records', value: data.marksCount ?? 0 },
  ];

  return (
    <div>
      <PageHeader title="Admin dashboard" subtitle="Performance overview and cohort health" />
      {loading ? <div className="empty-box">Loading dashboard...</div> : (
        <>
          <div className="stats-grid">
            {cards.map((card) => (
              <div key={card.label} className="stat-card">
                <span>{card.label}</span>
                <strong>{card.value}</strong>
              </div>
            ))}
          </div>
          <div className="chart-panel">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={[{ name: 'Overview', value: Number(data.averageMarks ?? 0) }] }>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#4f46e5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}

function StudentsPage() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    api.get('/students').then((response) => setItems(response.data.data?.content ?? []));
  }, []);

  return (
    <div>
      <PageHeader title="Students" subtitle="Records, academic status, and profiles" />
      <div className="table-card">
        <table>
          <thead>
            <tr><th>Name</th><th>Student ID</th><th>Semester</th><th>Status</th></tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}><td>{item.name}</td><td>{item.studentId}</td><td>{item.semester}</td><td>{item.status}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FacultyPage() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    api.get('/faculty').then((response) => setItems(response.data.data?.content ?? []));
  }, []);

  return (
    <div>
      <PageHeader title="Faculty" subtitle="Department and teaching assignments" />
      <div className="table-card">
        <table>
          <thead><tr><th>Name</th><th>Employee ID</th><th>Department</th><th>Designation</th></tr></thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}><td>{item.name}</td><td>{item.employeeId}</td><td>{item.department}</td><td>{item.designation}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CoursesPage() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    api.get('/courses').then((response) => setItems(response.data.data?.content ?? []));
  }, []);

  return (
    <div>
      <PageHeader title="Courses & Subjects" subtitle="Academic plans and subject catalog" />
      <div className="table-card">
        <table>
          <thead><tr><th>Code</th><th>Title</th><th>Credits</th><th>Department</th></tr></thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}><td>{item.code}</td><td>{item.title}</td><td>{item.credits}</td><td>{item.department}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MarksPage() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    api.get('/marks').then((response) => setItems(response.data.data?.content ?? []));
  }, []);

  return (
    <div>
      <PageHeader title="Marks" subtitle="Exam scores, grade calculation, and outcomes" />
      <div className="table-card">
        <table>
          <thead><tr><th>Student</th><th>Subject</th><th>Marks</th><th>Grade</th></tr></thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}><td>{item.student}</td><td>{item.subject}</td><td>{item.marksObtained}</td><td>{item.grade}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AttendancePage() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    api.get('/attendance').then((response) => setItems(response.data.data?.content ?? []));
  }, []);

  return (
    <div>
      <PageHeader title="Attendance" subtitle="Present, absent, and excused absences" />
      <div className="table-card">
        <table>
          <thead><tr><th>Session</th><th>Student</th><th>Status</th></tr></thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}><td>{item.sessionId}</td><td>{item.student}</td><td>{item.status}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function QuizzesPage() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    api.get('/quizzes').then((response) => setItems(response.data.data ?? []));
  }, []);

  return (
    <div>
      <PageHeader title="Quizzes" subtitle="Assessments and attempt history" />
      <div className="table-card">
        <table>
          <thead><tr><th>Title</th><th>Subject</th><th>Time Limit</th></tr></thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}><td>{item.title}</td><td>{item.subject}</td><td>{item.timeLimitMinutes ?? 'N/A'} mins</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AnalyticsPage() {
  const [data, setData] = useState<any[]>([]);
  useEffect(() => {
    api.get('/analytics/overview').then((response) => {
      const result = response.data.data ?? {};
      setData([
        { name: 'Students', value: result.totalStudents ?? 0 },
        { name: 'Avg Marks', value: Number(result.averageMarks ?? 0) },
        { name: 'Pass Rate', value: Number(result.passRate ?? 0) }
      ]);
    });
  }, []);

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Performance trends and academic health indicators" />
      <div className="chart-panel">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#0ea5e9" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function RecommendationsPage() {
  const [items, setItems] = useState<any[]>([]);
  const { user } = useAuth();
  useEffect(() => {
    if (!user) return;
    api.get('/recommendations', { params: { studentId: user.id } }).then((response) => setItems(response.data.data ?? []));
  }, [user]);

  return (
    <div>
      <PageHeader title="Recommendations" subtitle="Learning suggestions and performance guidance" />
      <div className="list-stack">
        {items.map((item) => (
          <div key={item.id} className="info-card">
            <h3>{item.title}</h3>
            <small>{item.category}</small>
            <p>{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportsPage() {
  const { user } = useAuth();
  const [report, setReport] = useState<any>({});

  useEffect(() => {
    if (!user) return;
    api.get(`/reports/student/${user.id}`).then((response) => setReport(response.data.data ?? {}));
  }, [user]);

  return (
    <div>
      <PageHeader title="Reports & Exports" subtitle="Student performance summaries and classroom reporting" />
      <div className="info-card">
        <h3>{report.name ?? 'Student report'}</h3>
        <p>{report.student ? `Student ID: ${report.student}` : 'Report available'}</p>
        <p>{report.marks ? `Marks entries: ${report.marks.length}` : 'No marks yet'}</p>
      </div>
    </div>
  );
}

function ProfilePage() {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      setMessage('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
    } catch {
      setMessage('Password update failed.');
    }
  };

  return (
    <div>
      <PageHeader title="Profile & settings" subtitle="Account information and credentials" />
      <div className="info-card">
        <h3>{user?.fullName}</h3>
        <p>{user?.email}</p>
        <p>{user?.role}</p>
      </div>
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          <span>Current password</span>
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
        </label>
        <label>
          <span>New password</span>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        </label>
        <button type="submit">Change password</button>
        {message && <div className="success-box">{message}</div>}
      </form>
    </div>
  );
}

function NotFoundPage() {
  return <div className="empty-box">The requested page was not found.</div>;
}

function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="page-header">
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}

export default App;
