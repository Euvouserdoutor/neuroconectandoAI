import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Smile, 
  Frown, 
  Meh, 
  Moon, 
  Clock, 
  BookOpen, 
  Calendar, 
  Check, 
  AlertCircle, 
  Sparkles, 
  Heart,
  Database,
  History
} from 'lucide-react';
import { CognitiveState } from '../types';
import { saveWellnessCheckIn, getWellnessCheckIns, WellnessData, isFirebaseAvailable } from '../lib/firebase';

interface DailyWellnessCheckinProps {
  cognitive: CognitiveState;
}

const moodOptions = [
  { rating: 1, emoji: '😠', label: 'Overwhelmed', color: 'text-rose-450 bg-rose-950/40 border-rose-900' },
  { rating: 2, emoji: '😔', label: 'Fatigued', color: 'text-amber-450 bg-amber-950/40 border-amber-900' },
  { rating: 3, emoji: '😐', label: 'Average / OK', color: 'text-slate-400 bg-slate-850 border-slate-800' },
  { rating: 4, emoji: '🙂', label: 'Relaxed / Calm', color: 'text-emerald-450 bg-emerald-950/40 border-emerald-900' },
  { rating: 5, emoji: '🌟', label: 'Fully Charged', color: 'text-teal-400 bg-teal-950/40 border-teal-900' }
];

const sleepQualityOptions = [
  'Restless / Insomnia',
  'Interrupted / Light',
  'Deep & Sound',
  'Excellent Cycle'
];

export default function DailyWellnessCheckin({ cognitive }: DailyWellnessCheckinProps) {
  // Student ID hardcoded to Alex Mercer for sandbox demonstration
  const studentId = 'student_alex';
  const studentName = 'Alex Mercer';

  // Form states
  const [selectedMood, setSelectedMood] = useState<number>(3);
  const [sleepHours, setSleepHours] = useState<number>(7.0);
  const [selectedSleepQuality, setSelectedSleepQuality] = useState<string>('Deep & Sound');
  const [notes, setNotes] = useState<string>('');
  
  // Status states
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // History logs state
  const [history, setHistory] = useState<WellnessData[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);

  // Refresh and load history
  const loadHistoryLogs = async () => {
    setIsLoadingHistory(true);
    try {
      const logs = await getWellnessCheckIns(studentId);
      setHistory(logs);
    } catch (err: any) {
      console.error(err);
      setErrorMessage("Could not load historic logs. Using offline simulation backup.");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistoryLogs();
  }, []);

  // Handle Check-in Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const matchMood = moodOptions.find(m => m.rating === selectedMood);

    const payload: WellnessData = {
      studentId,
      studentName,
      mood: selectedMood,
      moodLabel: matchMood ? matchMood.label : 'OK',
      sleepHours,
      sleepQuality: selectedSleepQuality,
      notes: notes.trim() || undefined,
      attentionSnapshot: cognitive.attention
    };

    try {
      await saveWellnessCheckIn(payload);
      setSuccessMessage("Daily wellness check-in logged successfully!");
      setNotes('');
      // Reload list
      await loadHistoryLogs();
      // Auto-hide success alert
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      let friendlyError = "Failed to synchronize to database.";
      try {
        // Attempt to parse FirestoreErrorInfo
        const parsed = JSON.parse(err.message);
        friendlyError = `Firebase Rule Violation: Operation [${parsed.operationType}] failed at [${parsed.path}]. Check security permissions.`;
      } catch {
        friendlyError = err.message || friendlyError;
      }
      setErrorMessage(friendlyError);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to color codes for rating numbers
  const getMoodColor = (mood: number) => {
    switch (mood) {
      case 5: return 'text-teal-400 bg-teal-950/50 border border-teal-900';
      case 4: return 'text-emerald-400 bg-emerald-950/50 border border-emerald-900';
      case 3: return 'text-sky-400 bg-sky-950/50 border border-sky-900';
      case 2: return 'text-amber-400 bg-amber-950/50 border border-amber-900';
      default: return 'text-rose-450 bg-rose-950/50 border border-rose-900';
    }
  };

  return (
    <>
      
      {/* Dynamic Submit Form Column */}
      <div className="xl:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between" id="wellness_submit_card">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-pink-500/10 rounded-lg text-pink-500">
                <Heart className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-sm">New Daily Wellness Check-in</h3>
                <p className="text-[10.5px] text-slate-400">Self-report your somatic metrics to customize tutorial intensity.</p>
              </div>
            </div>
          </div>

          {/* Messages Alert Block */}
          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-400 rounded-lg text-xs flex items-start space-x-2 animate-fade-in">
              <Check className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-950/50 border border-rose-900 text-rose-400 rounded-lg text-xs flex items-start space-x-2 animate-fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 animate-bounce" />
              <span className="font-mono text-[10px]">{errorMessage}</span>
            </div>
          )}

          {/* Check-In Submission Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* 1. Mood Selection Selector */}
            <div>
              <label className="block text-[10.5px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                1. What is your emotional mood rating today?
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {moodOptions.map((opt) => {
                  const isSelected = selectedMood === opt.rating;
                  return (
                    <button
                      key={opt.rating}
                      type="button"
                      onClick={() => setSelectedMood(opt.rating)}
                      className={`p-1.5 py-3 rounded-xl border transition-all duration-205 cursor-pointer flex flex-col items-center justify-center space-y-1 text-center ${
                        isSelected 
                          ? opt.color + ' ring-2 ring-indigo-500/40 scale-100 shadow-md'
                          : 'bg-slate-950 border-slate-850 hover:border-slate-700 text-slate-400 hover:scale-100'
                      }`}
                    >
                      <span className="text-xl">{opt.emoji}</span>
                      <span className="text-[9px] font-bold leading-tight whitespace-normal break-words w-full px-0.5">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Sleep Metrics Slider & badges Row */}
            <div className="space-y-4 pt-1">
              
              {/* Sleep Hours Slider */}
              <div>
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="text-[10.5px] text-slate-300 font-bold uppercase tracking-wider flex items-center">
                    <Clock className="h-3.5 w-3.5 text-sky-400 mr-1" /> 2. Sleep Duration
                  </span>
                  <span className="font-mono bg-sky-950/80 text-sky-305 text-sky-400 font-bold px-2 py-0.5 rounded border border-sky-900 text-[11px]">
                    {sleepHours.toFixed(1)} Hours
                  </span>
                </div>
                <div className="bg-slate-950 border border-slate-850 rounded-xl p-3 flex flex-col justify-center">
                  <input
                    type="range"
                    min="4.0"
                    max="12.0"
                    step="0.5"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 bg-slate-800 rounded-lg appearance-none h-1.5 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 mt-2 font-mono">
                    <span>4 hrs (Low)</span>
                    <span>8 hrs (Optimal)</span>
                    <span>12 hrs (Oversleep)</span>
                  </div>
                </div>
              </div>

              {/* Sleep Quality Options Selection */}
              <div>
                <label className="block text-[10.5px] font-bold text-slate-350 uppercase tracking-wider mb-2 flex items-center">
                  <Moon className="h-3.5 w-3.5 text-indigo-455 mr-1" /> 3. Sleep Quality
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {sleepQualityOptions.map((qual) => {
                    const isSelected = selectedSleepQuality === qual;
                    return (
                      <button
                        key={qual}
                        type="button"
                        onClick={() => setSelectedSleepQuality(qual)}
                        className={`py-2 px-1.5 text-[9.5px] font-bold rounded-lg border transition-all text-center cursor-pointer leading-tight whitespace-normal break-words flex items-center justify-center min-h-[35px] ${
                          isSelected
                            ? 'bg-indigo-950 text-indigo-400 border-indigo-800 shadow-sm'
                            : 'bg-slate-950 text-slate-400 border-slate-850 hover:bg-slate-850'
                        }`}
                      >
                        {qual}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* 3. Personal Notes Text Box */}
            <div>
              <label className="block text-[10.5px] font-bold text-slate-350 uppercase tracking-wider mb-2 flex items-center">
                <BookOpen className="h-3.5 w-3.5 text-purple-400 mr-1" /> 4. Feeling Diary / Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Log any study anxiety triggers or feeling details..."
                maxLength={400}
                className="w-full h-16 bg-slate-950 text-xs text-slate-200 border border-slate-850 rounded-xl p-3 focus:outline-none focus:border-indigo-500 placeholder-slate-650 transition-colors resize-none leading-relaxed"
              />
            </div>

            {/* Simulated Live System Info Tag */}
            <div className="p-2.5 bg-slate-955 border border-slate-850 rounded-lg flex justify-between items-center text-[10px] text-slate-400">
              <span>Somatic State Snapshot:</span>
              <span className="flex items-center space-x-1.5">
                <span className="h-1.5 w-1.5 bg-sky-500 rounded-full animate-pulse" />
                <span className="text-sky-305 font-bold">EEG Attention: {cognitive.attention}</span>
              </span>
            </div>

          </form>
        </div>

        <div className="pt-4 border-t border-slate-850 mt-4 flex flex-col gap-3">
          <p className="text-[10px] text-slate-400 leading-normal">
            Logs instantly to secure database for real-time parent & teacher insights.
          </p>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-2.5 bg-gradient-to-r from-pink-650 to-indigo-650 hover:from-pink-550 hover:to-indigo-550 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-pink-950/20 flex items-center justify-center space-x-2 shrink-0 cursor-pointer disabled:opacity-40"
          >
            {isSubmitting ? (
              <>
                <div className="h-3 w-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                <span>Submit Wellness Check-in</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Historic Logs Column */}
      <div className="xl:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl flex flex-col" id="wellness_history_card">
        <div className="flex justify-between items-center border-b border-slate-850 pb-3 mb-4">
          <h4 className="text-sm font-bold text-slate-200 flex items-center space-x-1.5">
            <History className="h-4 w-4 text-sky-400" />
            <span>Check-in Logs History</span>
          </h4>
          <span className="text-[9px] bg-slate-850 text-slate-400 px-2 py-0.5 rounded font-mono font-bold">
            {history.length} Saved
          </span>
        </div>

        {/* List scroll container */}
        <div className="flex-1 overflow-y-auto max-h-[365px] space-y-3 pr-1.5 scrollbar-thin scrollbar-thumb-slate-800">
          {isLoadingHistory ? (
            <div className="text-center py-10 text-xs text-slate-400 animate-pulse">
              <p>Analyzing Firestore historical logs...</p>
            </div>
          ) : history.length > 0 ? (
            history.map((log) => {
              const dateString = log.createdAt 
                ? new Date(log.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                : 'Recent';

              return (
                <div 
                  key={log.id} 
                  className="bg-slate-950 rounded-xl p-3 border border-slate-850 transition-all hover:bg-slate-950/85 hover:border-slate-800 relative group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-1.5">
                      <span className={`text-[9.5px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${getMoodColor(log.mood)}`}>
                        {log.moodLabel} (Rating: {log.mood})
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono">{dateString}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] mb-2 text-slate-300">
                    <div className="bg-slate-900/50 p-1.5 rounded border border-slate-850 flex items-center space-x-1">
                      <Clock className="h-3 w-3 text-sky-400" />
                      <span>Duration: <strong>{log.sleepHours} hrs</strong></span>
                    </div>
                    <div className="bg-slate-900/50 p-1.5 rounded border border-slate-850 flex items-center space-x-1">
                      <Moon className="h-3 w-3 text-indigo-400" />
                      <span>Quality: <strong>{log.sleepQuality}</strong></span>
                    </div>
                  </div>

                  {log.notes && (
                    <p className="text-[10px] text-slate-300 bg-slate-900/30 p-2 rounded border border-slate-850 leading-relaxed font-normal whitespace-pre-wrap">
                      "{log.notes}"
                    </p>
                  )}

                  {log.attentionSnapshot && (
                    <div className="mt-2 text-[9px] text-slate-450 flex justify-between items-center font-mono">
                      <span>Wearer Bio Snapshot:</span>
                      <span className="text-yellow-500">EEG Attention: {log.attentionSnapshot}</span>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 bg-slate-950 rounded-lg border border-slate-850 text-slate-400 text-xs">
              <p>No previous logs filed yet.</p>
              <p className="text-[10px] text-slate-500 mt-1">Submit the check-in form to start tracking your daily bio-history!</p>
            </div>
          )}
        </div>

        {/* Minimal sleep trend visualization */}
        {history.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-850 text-[10px]">
            <div className="flex justify-between items-center text-slate-300 mb-1">
              <span>Sleep Goal Progress (8h):</span>
              <span className="font-bold text-sky-400">
                {Math.round((history.reduce((acc, curr) => acc + curr.sleepHours, 0) / history.length) / 8.0 * 100)}% Avg
              </span>
            </div>
            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-850">
              <div 
                className="bg-gradient-to-r from-sky-500 to-indigo-500 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (history.reduce((acc, curr) => acc + curr.sleepHours, 0) / history.length) / 8.0 * 100)}%` }}
              />
            </div>
          </div>
        )}

      </div>

    </>
  );
}
