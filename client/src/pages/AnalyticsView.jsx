// --- English Comments Only ---
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// --- FIX: Use absolute path for Vite setup ---
import LoadingSpinner from '/src/components/LoadingSpinner.jsx'; 
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Use hardcoded URL to avoid import.meta warnings
const API_URL = 'http://localhost:8000/api';

// Helper function to get auth headers
const getAuthHeaders = (token, navigate) => {
  if (!token) {
    navigate('/login');
    return {};
  }
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
};

function AnalyticsView({ token, onLogout }) {
  const [stats, setStats] = useState(null);
  const [feed, setFeed] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { workspaceId } = useParams();
  const navigate = useNavigate();

  // Fetch all analytics data on load
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      const config = getAuthHeaders(token, navigate);
      if (!config.headers) return; // Redirected to login

      try {
        // Fetch both endpoints in parallel
        const [statsRes, feedRes] = await Promise.all([
          fetch(`${API_URL}/analytics/stats/${workspaceId}`, config),
          fetch(`${API_URL}/analytics/feed/${workspaceId}`, config)
        ]);

        if (!statsRes.ok || !feedRes.ok) {
          throw new Error('Failed to fetch analytics data');
        }

        const statsData = await statsRes.json();
        const feedData = await feedRes.json();
        
        setStats(statsData);
        setFeed(feedData);

      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token, workspaceId, navigate]);

  // Format data for the bar chart
  const chartData = [
    { name: 'Documents', count: stats?.totalDocuments || 0 },
    { name: 'Edits', count: stats?.totalEdits || 0 },
    { name: 'Uploads', count: stats?.totalUploads || 0 },
    { name: 'Members', count: stats?.totalMembers || 0 },
  ];

  // Helper to format the feed
  const formatActivityText = (activity) => {
    const user = activity.user?.username || 'A user';
    switch (activity.action) {
      case 'CREATED_WORKSPACE':
        return `${user} created the workspace.`;
      case 'CREATED_DOCUMENT':
        return `${user} created document: ${activity.document?.title || ''}`;
      case 'EDITED_DOCUMENT':
        return `${user} edited document: ${activity.document?.title || ''}`;
      case 'UPLOADED_FILE':
        return `${user} uploaded a file to: ${activity.document?.title || ''}`;
      default:
        return `${user} performed action: ${activity.action}`;
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-red-400 text-center p-8">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8">
      {/* Header */}
      <header className="flex justify-between items-center mb-12">
        <div>
          <button
            onClick={() => navigate(`/workspace/${workspaceId}`)}
            className="text-sm text-purple-400 hover:text-purple-300 mb-2"
          >
            &larr; Back to Workspace
          </button>
          <h1 className="text-4xl font-bold text-white">Workspace Analytics</h1>
        </div>
        <button
          onClick={onLogout}
          className="group flex items-center gap-3 bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-2xl font-semibold border border-white/20 hover:bg-white/20 transition-all"
        >
          Logout
        </button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard title="Total Documents" value={stats.totalDocuments} />
        <StatCard title="Total Edits" value={stats.totalEdits} />
        <StatCard title="Total Members" value={stats.totalMembers} />
        <StatCard title="File Uploads" value={stats.totalUploads} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart Section */}
        <div className="lg:col-span-2 glass-dark rounded-3xl p-6 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-6">Activity Overview</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis allowDecimals={false} stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(30, 41, 59, 0.9)', 
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '1rem'
                  }} 
                  cursor={{fill: 'rgba(139, 92, 246, 0.1)'}}
                />
                <Legend />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Feed Section */}
        <div className="lg:col-span-1 glass-dark rounded-3xl p-6 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
          <ul className="space-y-4 max-h-[300px] overflow-y-auto">
            {feed.length === 0 ? (
              <p className="text-gray-400">No activity yet.</p>
            ) : (
              feed.map(activity => (
                <li key={activity._id} className="text-gray-300 text-sm pb-2 border-b border-white/10">
                  <p>{formatActivityText(activity)}</p>
                  <span className="text-xs text-gray-500">
                    {new Date(activity.createdAt).toLocaleString()}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

// Helper component for the Stat Cards
const StatCard = ({ title, value }) => (
  <div className="glass-dark rounded-3xl p-6 border border-white/10">
    <h3 className="text-gray-400 text-sm font-medium mb-2">{title}</h3>
    <p className="text-4xl font-bold text-white">{value}</p>
  </div>
);

export default AnalyticsView;