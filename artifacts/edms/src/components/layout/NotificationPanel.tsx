import { Bell, CheckSquare, ServerCog, AlertCircle, Briefcase, X, ExternalLink } from 'lucide-react';
import { MOCK_NOTIFICATIONS } from '../../lib/mockExtended';

const typeIcon = (type: string) => {
  if (type === 'approval') return <CheckSquare className="w-4 h-4 text-amber-400" />;
  if (type === 'ocr') return <ServerCog className="w-4 h-4 text-blue-400" />;
  if (type === 'case') return <AlertCircle className="w-4 h-4 text-rose-400" />;
  if (type === 'work') return <Briefcase className="w-4 h-4 text-teal-400" />;
  return <Bell className="w-4 h-4 text-slate-400" />;
};

export function NotificationPanel({ onClose }: { onClose: () => void }) {
  const unread = MOCK_NOTIFICATIONS.filter(n => !n.read).length;
  return (
    <div className="absolute right-0 top-full mt-2 w-96 bg-slate-900/95 backdrop-blur-xl border border-teal-500/20 rounded-2xl shadow-2xl shadow-teal-950/50 z-50 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-teal-400" />
          <span className="text-sm font-semibold text-slate-200">Notifications</span>
          {unread > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unread}</span>
          )}
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {MOCK_NOTIFICATIONS.map(n => (
          <div key={n.id} className={`flex items-start gap-3 px-5 py-4 border-b border-slate-800/50 hover:bg-slate-800/30 cursor-pointer transition-colors ${!n.read ? 'bg-teal-950/20' : ''}`}>
            <div className="mt-0.5 shrink-0">{typeIcon(n.type)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-semibold text-slate-200">{n.title}</span>
                {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{n.message}</p>
              <span className="text-[10px] text-slate-600 mt-1 block">{n.time}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="px-5 py-3 border-t border-slate-700/50">
        <button className="text-xs text-teal-400 hover:text-teal-300 transition-colors flex items-center gap-1">
          <ExternalLink className="w-3 h-3" /> View all notifications
        </button>
      </div>
    </div>
  );
}
