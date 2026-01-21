
import React from 'react';
import { SafetyIssue, Severity } from '../types';

interface SafetyIssueListProps {
  issues: SafetyIssue[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
}

const SeverityBadge: React.FC<{ severity: Severity }> = ({ severity }) => {
  const colors = {
    [Severity.HIGH]: 'bg-red-100 text-red-700 border-red-200',
    [Severity.MEDIUM]: 'bg-orange-100 text-orange-700 border-orange-200',
    [Severity.LOW]: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-bold border ${colors[severity]}`}>
      {severity}
    </span>
  );
};

export const SafetyIssueList: React.FC<SafetyIssueListProps> = ({ issues, selectedIndex, onSelect }) => {
  if (issues.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 border border-slate-200 text-center">
        <div className="text-slate-400 mb-2">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-slate-600 font-medium">Không phát hiện vi phạm nào</p>
        <p className="text-sm text-slate-400">Hiện trường có vẻ an toàn.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {issues.map((issue, idx) => (
        <div
          key={idx}
          onClick={() => onSelect(idx)}
          className={`group relative bg-white rounded-xl p-4 border transition-all cursor-pointer hover:shadow-md ${
            selectedIndex === idx ? 'border-blue-500 ring-2 ring-blue-50 ring-offset-0' : 'border-slate-200'
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-slate-800 pr-4">{issue.issue_name}</h3>
            <SeverityBadge severity={issue.severity} />
          </div>
          
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-slate-400 font-medium uppercase text-[10px] tracking-wider block">Hiện trạng</span>
              <p className="text-slate-600">{issue.status}</p>
            </div>
            {selectedIndex === idx && (
              <div className="pt-2 mt-2 border-t border-slate-50 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="mb-2">
                  <span className="text-slate-400 font-medium uppercase text-[10px] tracking-wider block">Rủi ro</span>
                  <p className="text-slate-600 italic">"{issue.risk}"</p>
                </div>
                <div>
                  <span className="text-blue-500 font-medium uppercase text-[10px] tracking-wider block">Biện pháp khắc phục</span>
                  <p className="text-blue-700 font-medium bg-blue-50 p-2 rounded-lg">{issue.remedy}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
