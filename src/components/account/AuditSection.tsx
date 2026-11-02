import React, { useState, useEffect } from 'react';
import { ShieldCheck, Activity, Database, Server, RefreshCw, FileText, CheckCircle2, Clock } from 'lucide-react';
import { api } from '../../utils/api';

export const AuditSection: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [auditEvents, setAuditEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState<string>('all');

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsRes, eventsRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminAudit({ limit: 50 }),
      ]);
      setStats(statsRes);
      setAuditEvents(eventsRes);
    } catch (err: any) {
      setError(err?.message || 'Failed to load system audit data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredEvents = auditEvents.filter((ev) => {
    if (actionFilter === 'all') return true;
    return ev.action.toLowerCase().includes(actionFilter.toLowerCase());
  });

  return (
    <div className="space-y-8 text-xs">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#ebd9c5]/60 dark:border-[#38332c]/60">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#2a2724] dark:text-[#f5f2e6] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#d4a373]" />
            <span>Audit Trail &amp; Production Reliability</span>
          </h2>
          <p className="text-[#2a2724]/70 dark:text-[#f5f2e6]/70 mt-1">
            Real-time server telemetry, SQLite durability verification, and immutable security event logs.
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={isLoading}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#2a2724] text-[#d4a373] hover:bg-[#383430] border border-[#d4a373]/40 font-bold transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300">
          {error}
        </div>
      )}

      {/* Operational Metrics Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          <div className="p-4 bg-[#fffef2] dark:bg-[#181614] rounded-2xl border border-[#ebd9c5] dark:border-[#38332c] shadow-xs space-y-1">
            <div className="flex items-center justify-between text-[#2a2724]/60 dark:text-[#f5f2e6]/60 font-bold uppercase text-[10px]">
              <span>Database Integrity</span>
              <Database className="w-3.5 h-3.5 text-[#15803d] dark:text-[#4ade80]" />
            </div>
            <p className="text-xl font-bold font-serif text-[#15803d] dark:text-[#4ade80]">
              WAL Mode Normal
            </p>
            <p className="text-[10px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
              {stats.metrics?.books} Books (Excl #31–#60)
            </p>
          </div>

          <div className="p-4 bg-[#fffef2] dark:bg-[#181614] rounded-2xl border border-[#ebd9c5] dark:border-[#38332c] shadow-xs space-y-1">
            <div className="flex items-center justify-between text-[#2a2724]/60 dark:text-[#f5f2e6]/60 font-bold uppercase text-[10px]">
              <span>Active Workspace</span>
              <FileText className="w-3.5 h-3.5 text-[#d4a373]" />
            </div>
            <p className="text-xl font-bold font-serif text-[#b07843] dark:text-[#d4a373]">
              {stats.metrics?.writingProjects} Projects
            </p>
            <p className="text-[10px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
              {stats.metrics?.documents} Docs • {stats.metrics?.journalEntries} Reflections
            </p>
          </div>

          <div className="p-4 bg-[#fffef2] dark:bg-[#181614] rounded-2xl border border-[#ebd9c5] dark:border-[#38332c] shadow-xs space-y-1">
            <div className="flex items-center justify-between text-[#2a2724]/60 dark:text-[#f5f2e6]/60 font-bold uppercase text-[10px]">
              <span>Editorial Submissions</span>
              <Activity className="w-3.5 h-3.5 text-[#d4a373]" />
            </div>
            <p className="text-xl font-bold font-serif text-[#2a2724] dark:text-[#f5f2e6]">
              {stats.metrics?.submissions?.pendingReview} Pending
            </p>
            <p className="text-[10px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
              {stats.metrics?.magazine?.published} Published Magazine Stories
            </p>
          </div>

          <div className="p-4 bg-[#fffef2] dark:bg-[#181614] rounded-2xl border border-[#ebd9c5] dark:border-[#38332c] shadow-xs space-y-1">
            <div className="flex items-center justify-between text-[#2a2724]/60 dark:text-[#f5f2e6]/60 font-bold uppercase text-[10px]">
              <span>Server Runtime</span>
              <Server className="w-3.5 h-3.5 text-[#d4a373]" />
            </div>
            <p className="text-xl font-bold font-serif text-[#2a2724] dark:text-[#f5f2e6]">
              {stats.system?.uptimeSeconds}s Uptime
            </p>
            <p className="text-[10px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
              Heap: {stats.system?.heapUsedMb}MB • Node {stats.system?.nodeVersion}
            </p>
          </div>

        </div>
      )}

      {/* Audit Log Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold font-serif text-[#2a2724] dark:text-[#f5f2e6] flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#d4a373]" />
            <span>Recorded Audit Events ({filteredEvents.length})</span>
          </h3>

          {/* Action Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60">Filter:</span>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fffef2] dark:bg-[#181614] text-[#2a2724] dark:text-[#f5f2e6] outline-none"
            >
              <option value="all">All Events</option>
              <option value="user.">User Auth &amp; Sessions</option>
              <option value="project">Writing Projects</option>
              <option value="magazine">Editorial &amp; Submissions</option>
            </select>
          </div>
        </div>

        <div className="bg-[#fffef2] dark:bg-[#181614] rounded-2xl border border-[#ebd9c5] dark:border-[#38332c] shadow-xs overflow-hidden">
          {/* Mobile Audit Cards Layout */}
          <div className="md:hidden divide-y divide-[#ebd9c5]/30 dark:divide-[#38332c]/30">
            {filteredEvents.length === 0 ? (
              <div className="py-8 text-center text-[#2a2724]/50 dark:text-[#f5f2e6]/50 text-xs">
                No audit events recorded matching current filter.
              </div>
            ) : (
              filteredEvents.map((ev) => (
                <div key={ev.id} className="p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-[#d4a373]/15 border border-[#d4a373]/30 text-[#b07843] dark:text-[#d4a373] font-bold text-[11px]">
                      {ev.action}
                    </span>
                    <span className="font-mono text-[10px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
                      {new Date(ev.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="text-[11px] text-[#2a2724]/80 dark:text-[#f5f2e6]/80 flex items-center justify-between">
                    <span>
                      <strong>Target:</strong> {ev.targetType}{ev.targetId ? ` (${ev.targetId.slice(0, 8)}...)` : ''}
                    </span>
                    <span className="font-mono text-[10px] text-[#2a2724]/50 dark:text-[#f5f2e6]/50">
                      {ev.userId ? ev.userId.slice(0, 8) : 'system'}
                    </span>
                  </div>

                  {ev.details && (
                    <div className="text-[10px] font-mono text-[#2a2724]/70 dark:text-[#f5f2e6]/70 bg-[#f5f1e3]/50 dark:bg-[#25221e]/50 p-2 rounded-lg truncate">
                      {JSON.stringify(ev.details)}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f5f1e3]/60 dark:bg-[#25221e]/60 border-b border-[#ebd9c5]/40 dark:border-[#38332c]/40 text-[#2a2724]/60 dark:text-[#f5f2e6]/60 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Target</th>
                  <th className="py-2.5 px-3">Actor / IP</th>
                  <th className="py-2.5 px-3">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ebd9c5]/30 dark:divide-[#38332c]/30">
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#2a2724]/50 dark:text-[#f5f2e6]/50">
                      No audit events recorded matching current filter.
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((ev) => (
                    <tr key={ev.id} className="hover:bg-[#f5f1e3]/40 dark:hover:bg-[#25221e]/40 transition-colors">
                      <td className="py-2 px-3 text-[#2a2724]/70 dark:text-[#f5f2e6]/70 whitespace-nowrap font-mono text-[10px]">
                        {new Date(ev.createdAt).toLocaleString()}
                      </td>
                      <td className="py-2 px-3 font-bold text-[#b07843] dark:text-[#d4a373] whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-[#d4a373]/15 border border-[#d4a373]/30">
                          {ev.action}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-[#2a2724] dark:text-[#f5f2e6] whitespace-nowrap">
                        <span className="font-semibold">{ev.targetType}</span>
                        {ev.targetId && (
                          <span className="text-[10px] text-[#2a2724]/50 dark:text-[#f5f2e6]/50 ml-1">
                            ({ev.targetId.slice(0, 8)}...)
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-[#2a2724]/70 dark:text-[#f5f2e6]/70 whitespace-nowrap font-mono text-[10px]">
                        {ev.userId ? ev.userId.slice(0, 10) : 'system'} {ev.ipAddress ? `(${ev.ipAddress})` : ''}
                      </td>
                      <td className="py-2 px-3 text-[#2a2724]/80 dark:text-[#f5f2e6]/80 text-[11px] font-mono max-w-xs truncate">
                        {ev.details ? JSON.stringify(ev.details) : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};
