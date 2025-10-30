'use client';

import { useState } from 'react';
import { WalkPlannerForm, type WalkPlanData } from '@/components/walk-planner-form';
import { RouteDisplay } from '@/components/route-display';

const version = require('../../package.json').version;

export default function Home() {
  const [walkPlan, setWalkPlan] = useState<WalkPlanData | null>(null);

  const handlePlanWalk = (data: WalkPlanData) => {
    setWalkPlan(data);
  };

  const handleReset = () => {
    setWalkPlan(null);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-16 text-slate-100">
      {!walkPlan ? (
        <>
          <div className="flex max-w-2xl flex-col items-center gap-4 text-center">
            <h1 className="text-5xl font-semibold leading-tight sm:text-6xl">
              London Walk Companion
            </h1>
            <span className="text-sm text-slate-400">
              v{version}
            </span>
          </div>

          <WalkPlannerForm onPlanWalk={handlePlanWalk} />
        </>
      ) : (
        <RouteDisplay planData={walkPlan} onReset={handleReset} />
      )}
    </main>
  );
}
