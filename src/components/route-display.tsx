import type { WalkPlanData } from './walk-planner-form';

interface RouteDisplayProps {
  planData: WalkPlanData;
  onReset: () => void;
}

export function RouteDisplay({ planData, onReset }: RouteDisplayProps) {
  return (
    <div className="w-full max-w-2xl space-y-6">
      <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6 backdrop-blur-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-100">
            Your Walk Plan
          </h2>
          <button
            onClick={onReset}
            className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-600"
          >
            Plan Another
          </button>
        </div>

        <div className="space-y-4">
          {/* Route Summary */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-500/20 text-green-400">
                A
              </div>
              <div>
                <p className="text-sm font-medium text-slate-300">
                  Starting Point
                </p>
                <p className="text-base text-slate-100">
                  {planData.useCurrentLocation ? (
                    <span>
                      Current Location{' '}
                      <span className="text-sm text-slate-400">
                        ({planData.startLocation})
                      </span>
                    </span>
                  ) : (
                    planData.startLocation
                  )}
                </p>
              </div>
            </div>

            <div className="ml-4 border-l-2 border-dashed border-slate-600 py-2 pl-4">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span>Target duration: {planData.duration} minutes</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
                B
              </div>
              <div>
                <p className="text-sm font-medium text-slate-300">
                  Destination
                </p>
                <p className="text-base text-slate-100">
                  {planData.destination}
                </p>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="mt-6 rounded-lg bg-slate-900/50 p-4">
            <h3 className="mb-2 text-sm font-semibold text-slate-200">
              Next Steps
            </h3>
            <p className="text-sm leading-relaxed text-slate-400">
              Route calculation is coming soon! The next development phase will
              integrate with the TfL API to fetch real-time walking and Tube
              routes. For now, this demonstrates the form capture and data flow.
            </p>
          </div>

          {/* Placeholder for Route Details */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-200">
              Route Preview (Mock)
            </h3>
            <div className="space-y-2 rounded-lg border border-slate-700 bg-slate-900/30 p-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🚶</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-200">
                    Walk to nearest station
                  </p>
                  <p className="text-xs text-slate-400">~8 minutes</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🚇</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-200">
                    Take the Tube
                  </p>
                  <p className="text-xs text-slate-400">~15 minutes</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🚶</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-200">
                    Walk to destination
                  </p>
                  <p className="text-xs text-slate-400">~7 minutes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-slate-800/30 p-4 text-center">
        <p className="text-sm text-slate-400">
          🚀 This is a functional MVP. API integration and real routing logic
          coming in the next phase.
        </p>
      </div>
    </div>
  );
}
