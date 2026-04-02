import { X, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { RightPanelContent } from '../../contexts/RightPanelContext';

interface RightPanelProps {
  content: RightPanelContent | null;
  onClose: () => void;
}

export function RightPanel({ content, onClose }: RightPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(
    new Set(content?.defaultExpandedSections ?? [0])
  );

  useEffect(() => {
    if (!content) return;
    setExpandedSections(new Set(content.defaultExpandedSections ?? [0]));
  }, [content?.panelKey]);

  if (!content) return null;

  const toggleSection = (index: number) => {
    const next = new Set(expandedSections);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    setExpandedSections(next);
  };

  return (
    <aside className="w-96 border-l border-slate-700/50 bg-slate-900/40 backdrop-blur-xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-700/30 shrink-0 bg-slate-950/20">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            {content.icon && <div className="text-teal-400 mt-0.5 shrink-0">{content.icon}</div>}
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-white truncate">{content.title}</h2>
              {content.subtitle && (
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">{content.subtitle}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {content.headerActions}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-700/50 transition-colors flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="divide-y divide-slate-700/30">
          {content.sections.map((section, i) => (
            <div key={i} className="border-slate-700/30">
              <button
                onClick={() => toggleSection(i)}
                className="w-full flex items-center justify-between px-6 py-3 hover:bg-slate-800/30 transition-colors"
              >
                <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  {section.heading}
                </h3>
                <ChevronDown
                  className={`w-4 h-4 text-slate-600 transition-transform ${
                    expandedSections.has(i) ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {expandedSections.has(i) && (
                <div className="px-6 py-3 bg-slate-950/40 border-t border-slate-700/20 text-sm text-slate-300">
                  {section.content}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {content.footer && (
        <div className="shrink-0 border-t border-slate-700/30 bg-slate-950/30 px-6 py-4">
          {content.footer}
        </div>
      )}
    </aside>
  );
}
