import { useState } from 'react';
import { GlassCard, Button, Input } from '../components/ui/Shared';
import { Settings as SettingsIcon, Save, CheckCircle, ChevronRight } from 'lucide-react';

const settingGroups = [
  {
    label: 'UI & Display',
    settings: [
      { key: 'theme', label: 'Theme Mode', type: 'select', options: ['Dark (Default)', 'System'], value: 'Dark (Default)' },
      { key: 'density', label: 'Table Row Density', type: 'select', options: ['Comfortable', 'Compact', 'Spacious'], value: 'Comfortable' },
      { key: 'animations', label: 'Enable Animations', type: 'toggle', value: true },
    ]
  },
  {
    label: 'OCR Engine',
    settings: [
      { key: 'ocr_auto', label: 'Auto-run OCR on Upload', type: 'toggle', value: true },
      { key: 'ocr_confidence', label: 'Minimum Confidence Threshold (%)', type: 'input', value: '75' },
      { key: 'ocr_retries', label: 'Max Auto-Retries on Failure', type: 'select', options: ['0', '1', '2', '3'], value: '1' },
    ]
  },
  {
    label: 'Document Defaults',
    settings: [
      { key: 'default_status', label: 'Default New Document Status', type: 'select', options: ['Draft', 'Pending Review'], value: 'Draft' },
      { key: 'obsolete_visible', label: 'Show Obsolete Documents by Default', type: 'toggle', value: false },
      { key: 'revision_format', label: 'Revision Numbering Format', type: 'select', options: ['A.1, A.2, B.0...', '1.0, 1.1, 2.0...'], value: 'A.1, A.2, B.0...' },
    ]
  },
  {
    label: 'System & Operational',
    settings: [
      { key: 'session_timeout', label: 'Session Timeout (minutes)', type: 'input', value: '30' },
      { key: 'audit_retention', label: 'Audit Log Retention (days)', type: 'input', value: '365' },
      { key: 'max_upload', label: 'Max Upload Size (MB)', type: 'input', value: '50' },
    ]
  },
];

export default function Settings() {
  const [activeGroup, setActiveGroup] = useState(settingGroups[0].label);
  const [saved, setSaved] = useState(false);
  const [toggleValues, setToggleValues] = useState<Record<string, boolean>>({
    animations: true, ocr_auto: true, obsolete_visible: false
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const currentGroup = settingGroups.find(g => g.label === activeGroup);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-slate-400 text-sm">System configuration and user preferences.</p>
        </div>
        <Button onClick={handleSave} className={saved ? 'from-teal-700 to-emerald-700' : ''}>
          {saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Changes</>}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <GlassCard className="p-4 self-start">
          <nav className="space-y-1">
            {settingGroups.map(group => (
              <button
                key={group.label}
                onClick={() => setActiveGroup(group.label)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors text-left ${
                  activeGroup === group.label
                    ? 'bg-teal-500/15 text-teal-300 border border-teal-500/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <span className="font-medium">{group.label}</span>
                <ChevronRight className={`w-4 h-4 transition-transform ${activeGroup === group.label ? 'text-teal-400 rotate-90' : ''}`} />
              </button>
            ))}
          </nav>
        </GlassCard>

        <div className="lg:col-span-3">
          <GlassCard className="p-6">
            <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-teal-400" />{activeGroup}
            </h2>
            <div className="space-y-5">
              {currentGroup?.settings.map(setting => (
                <div key={setting.key} className="flex items-center justify-between py-3 border-b border-slate-800/50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-200">{setting.label}</p>
                  </div>
                  <div>
                    {setting.type === 'toggle' && (
                      <button
                        onClick={() => setToggleValues(prev => ({ ...prev, [setting.key]: !prev[setting.key] }))}
                        className={`relative w-11 h-6 rounded-full transition-colors border ${
                          toggleValues[setting.key] ? 'bg-teal-500 border-teal-400' : 'bg-slate-700 border-slate-600'
                        }`}
                      >
                        <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${toggleValues[setting.key] ? 'translate-x-5' : ''}`} />
                      </button>
                    )}
                    {setting.type === 'select' && (
                      <select
                        className="bg-slate-950/50 border border-teal-500/20 text-slate-200 text-sm rounded-xl px-3 py-1.5 focus:outline-none"
                        defaultValue={setting.value}
                      >
                        {(setting as any).options.map((opt: string) => <option key={opt}>{opt}</option>)}
                      </select>
                    )}
                    {setting.type === 'input' && (
                      <Input className="w-28 text-right" defaultValue={setting.value} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
