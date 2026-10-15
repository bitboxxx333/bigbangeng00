import React from 'react';

export const ScoreImprovementSection: React.FC = () => {
  const achievements = [
    {
      id: 1,
      student: '김ㅇㅇ (동인천고 2학년)',
      result: '내신 3등급 > 1등급',
      badge: '내신 1등급 달성',
      bars: [35, 60, 95],
      detail: '동인천고 부교재 변형 지문 집중 훈련'
    },
    {
      id: 2,
      student: '최ㅇㅇ (만수중 2학년)',
      result: '수능 모의고사 90점 달성',
      badge: '중등 선행 완성',
      bars: [45, 70, 92],
      detail: '문법 기초 확립 & 서술형 감점 제로화'
    },
    {
      id: 3,
      student: '이ㅇㅇ (숭덕여고 2학년)',
      result: '내신 4등급 > 1등급',
      badge: '성적 수직 상승',
      bars: [30, 65, 96],
      detail: '숭덕여고 서술형 조건 영작 12패턴 마스터'
    }
  ];

  return (
    <div id="achievements" className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg sm:text-xl font-black text-[#122B49] tracking-tight">
          학생 성적 향상 증명
        </h3>
        <span className="text-xs font-bold text-slate-500">
          실제 만수동 재원생 성적 결과
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {achievements.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-slate-300 p-3 sm:p-4 flex flex-col justify-between hover:border-[#122B49] hover:shadow-xs transition-all"
          >
            {/* Chart Graphic: 3 Rising Bars + Upward Diagonal Arrow matching reference image */}
            <div className="relative h-24 sm:h-28 bg-slate-50 rounded-lg p-2 flex items-end justify-center gap-3 overflow-hidden border border-slate-200">
              {/* Grid Background Lines in Chart */}
              <div className="absolute inset-0 flex flex-col justify-between p-2 pointer-events-none opacity-30">
                <div className="border-b border-dashed border-slate-300 w-full" />
                <div className="border-b border-dashed border-slate-300 w-full" />
                <div className="border-b border-dashed border-slate-300 w-full" />
              </div>

              {/* Bar 1 */}
              <div className="w-5 bg-slate-200 rounded-t-sm" style={{ height: `${item.bars[0]}%` }} />
              {/* Bar 2 */}
              <div className="w-5 bg-blue-300 rounded-t-sm" style={{ height: `${item.bars[1]}%` }} />
              {/* Bar 3 (Highlight) */}
              <div className="w-5 bg-[#C59750] rounded-t-sm shadow-xs" style={{ height: `${item.bars[2]}%` }} />

              {/* Rising Diagonal Trend Arrow SVG */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <line
                  x1="22%"
                  y1="75%"
                  x2="78%"
                  y2="20%"
                  stroke="#122B49"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {/* Arrowhead */}
                <polygon
                  points="78,16 86,22 76,27"
                  fill="#122B49"
                />
              </svg>
            </div>

            {/* Student Info & Grade Transformation */}
            <div className="mt-3 text-center space-y-1">
              <div className="text-xs font-bold text-slate-800 truncate">
                {item.student}
              </div>
              <div className="text-sm font-extrabold text-[#122B49] bg-amber-50/80 border border-amber-200/80 py-1 px-2 rounded-md">
                {item.result}
              </div>
              <div className="text-[10px] text-slate-500 pt-0.5 truncate">
                {item.detail}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
