
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface RequirementSession {
  id: string;
  project_id?: string;
  domain: string;
  session_data: any;
  status: string;
  created_at: string;
  updated_at: string;
}

interface RequirementHistoryProps {
  tenantId?: string;
  onRestore?: (session: RequirementSession) => void;
}

export function RequirementHistory({ tenantId, onRestore }: RequirementHistoryProps) {
  const [sessions, setSessions] = useState<RequirementSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<RequirementSession | null>(null);

  useEffect(() => {
    async function fetchSessions() {
      setLoading(true);
      setError(null);
      
      try {
        let query = supabase.from('requirement_sessions').select('*').order('created_at', { ascending: false });
        
        if (tenantId) {
          query = query.eq('project_id', tenantId);
        }
        
        const { data, error: queryError } = await query;
        
        if (queryError) {
          setError(queryError.message);
        } else if (data) {
          const transformedSessions: RequirementSession[] = data.map((item) => ({
            id: item.id,
            project_id: item.project_id,
            domain: item.domain || 'Unknown',
            session_data: item.session_data || {},
            status: item.status,
            created_at: item.created_at,
            updated_at: item.updated_at
          }));
          setSessions(transformedSessions);
        }
      } catch (err) {
        setError('Failed to fetch sessions');
      } finally {
        setLoading(false);
      }
    }
    
    fetchSessions();
  }, [tenantId]);

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await supabase.from('requirement_sessions').delete().eq('id', sessionId);
      setSessions(sessions.filter((s) => s.id !== sessionId));
      setDeleteDialogOpen(false);
      setSessionToDelete(null);
    } catch (err) {
      setError('Failed to delete session');
    }
  };

  const handleDeleteAll = async () => {
    try {
      if (tenantId) {
        await supabase.from('requirement_sessions').delete().eq('project_id', tenantId);
        setSessions([]);
      }
      setDeleteAllDialogOpen(false);
    } catch (err) {
      setError('Failed to delete all sessions');
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>My Requirements History</CardTitle>
        <div className="flex justify-end">
          {sessions.length > 0 && (
            <button
              className="text-xs text-red-600 border border-red-200 rounded px-2 py-1 bg-red-50 hover:bg-red-100 ml-2"
              onClick={() => setDeleteAllDialogOpen(true)}
            >
              Delete All
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading && <div>Loading...</div>}
        {error && <div className="text-red-500">Error: {error}</div>}
        {(!loading && sessions.length === 0) && <div>No previous requirements found.</div>}
        <ul className="divide-y divide-gray-200">
          {sessions.map(session => (
            <li key={session.id} className={`py-2 flex flex-col md:flex-row md:items-center md:justify-between ${session.status === 'generated' ? 'bg-green-50' : ''}`}>
              <div className="flex items-center gap-2">
                <span className="font-semibold">
                  {session.domain}
                </span>
                <span className="ml-2 text-gray-500 text-sm">{new Date(session.created_at).toLocaleString()}</span>
                {session.status === 'generated' && (
                  <span className="ml-2 text-green-600" title="Completed">
                    ✓
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block px-2 py-1 rounded bg-gray-100 text-xs text-gray-700 mr-2">{session.status}</span>
                {onRestore && (
                  <button
                    className="text-blue-600 hover:underline text-xs border border-blue-200 rounded px-2 py-1 bg-blue-50"
                    onClick={() => onRestore(session)}
                  >
                    Restore
                  </button>
                )}
                <button
                  className="text-xs text-red-600 border border-red-200 rounded px-2 py-1 bg-red-50 hover:bg-red-100"
                  onClick={() => { setSessionToDelete(session); setDeleteDialogOpen(true); }}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
        
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Session</DialogTitle>
              <DialogDescription>
                Confirm deletion of this requirement session. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            {sessionToDelete && (
              <>
                <p>Are you sure you want to delete this session? This action cannot be undone.</p>
                <div className="flex justify-end gap-4 mt-4">
                  <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setDeleteDialogOpen(false)}>Cancel</button>
                  <button className="px-6 py-2 bg-red-600 text-white rounded font-bold" onClick={() => handleDeleteSession(sessionToDelete.id)}>
                    Delete
                  </button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
        
        <Dialog open={deleteAllDialogOpen} onOpenChange={setDeleteAllDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete All Sessions</DialogTitle>
              <DialogDescription>
                Confirm deletion of all requirement sessions for this tenant. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <p>Are you sure you want to delete <b>all</b> your requirement sessions? This action cannot be undone.</p>
            <div className="flex justify-end gap-4 mt-4">
              <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setDeleteAllDialogOpen(false)}>Cancel</button>
              <button className="px-6 py-2 bg-red-600 text-white rounded font-bold" onClick={handleDeleteAll}>
                Delete All
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
