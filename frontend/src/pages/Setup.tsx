import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, ArrowLeft, ArrowRight, Briefcase, Check, FileText, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { Navbar } from '../components/layout/Navbar';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Loader } from '../components/ui/Loader';
import { PersonaCard } from '../components/interview/PersonaCard';
import { useSessionStore } from '../store/sessionStore';
import { useAuth } from '../hooks/useAuth';
import { analyseResume, createInterview, uploadResume } from '../lib/api';
import { PERSONAS } from '../lib/utils';

const stepVariants = {
  enter: { opacity: 0, y: 18 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -18 },
};

const steps = [
  ['Resume', 'Pressure map'],
  ['Target', 'Role details'],
  ['Persona', 'Room style'],
];

export default function Setup() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const store = useSessionStore();
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Only PDF files accepted');
      return;
    }

    setUploading(true);
    setFileName(file.name);
    try {
      const result = await uploadResume(file);
      store.setResumeUrl(result.resume_url);
      toast.success('Resume uploaded');

      store.setAnalysing(true);
      const analysis = await analyseResume(result.resume_url, user?.id || '');
      store.setResumeAnalysis(analysis);
      store.setAnalysing(false);
      toast.success('Resume analysed');
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
      store.setAnalysing(false);
    } finally {
      setUploading(false);
    }
  }, [store, user?.id]);

  const handleStartInterview = async () => {
    if (!store.selectedPersona || !store.targetRole) return;
    setCreating(true);
    try {
      const session = await createInterview({
        user_id: user?.id || '',
        persona_id: store.selectedPersona,
        target_role: store.targetRole,
        company_type: store.companyType || 'Tech Company',
        resume_parsed: store.resumeAnalysis || undefined,
        resume_url: store.resumeUrl || undefined,
      });
      navigate(`/interview/${session.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create session');
    } finally {
      setCreating(false);
    }
  };

  return (
    <PageWrapper className="premium-shell grain min-h-screen">
      <Navbar />
      <main className="relative z-10 pb-24 md:ml-64 md:pb-10">
        <div className="mx-auto max-w-7xl px-5 py-7 sm:px-8 lg:px-10">
          <motion.header
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-7 rounded-3xl border border-[var(--border-default)] bg-[rgba(246,239,227,0.055)] p-6 shadow-[var(--shadow-lift)] md:p-8"
          >
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-[rgba(246,239,227,0.05)] px-4 py-2 text-label text-[var(--brand-gold-soft)]">
                  <Briefcase size={14} />
                  New interview
                </div>
                <h1 className="text-title text-[var(--text-primary)]">Build the room.</h1>
                <p className="mt-4 max-w-2xl text-body text-[var(--text-secondary)]">
                  Upload your resume, define the target, and choose the interviewer pressure style.
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                {steps.map(([title, subtitle], index) => {
                  const number = index + 1;
                  const active = store.step === number;
                  const complete = store.step > number;
                  return (
                    <button
                      key={title}
                      type="button"
                      onClick={() => store.setStep(number)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        active
                          ? 'border-[var(--border-strong)] bg-[var(--bg-cream)] text-[var(--text-dark)]'
                          : 'border-[var(--border-subtle)] bg-black/10 text-[var(--text-muted)] hover:border-[var(--border-default)]'
                      }`}
                    >
                      <span className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(201,164,106,0.16)] text-sm font-bold">
                        {complete ? <Check size={15} /> : number}
                      </span>
                      <span className="block text-sm font-semibold">{title}</span>
                      <span className="mt-1 block text-xs opacity-70">{subtitle}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.header>

          <AnimatePresence mode="wait">
            {store.step === 1 && (
              <motion.section
                key="step1"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]"
              >
                <div className="rounded-3xl border border-[var(--border-subtle)] bg-[rgba(246,239,227,0.045)] p-6 shadow-[var(--shadow-card)]">
                  <p className="text-label text-[var(--brand-gold-soft)]">Step 01</p>
                  <h2 className="mt-3 text-3xl font-semibold text-[var(--text-primary)]">Upload your resume.</h2>
                  <p className="mt-4 text-body text-[var(--text-secondary)]">
                    The analyser turns your resume into a pressure map: strengths, weak claims, and likely follow-up probes.
                  </p>
                </div>

                <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-card)]">
                  <div
                    onDragOver={(event) => {
                      event.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(event) => {
                      event.preventDefault();
                      setDragOver(false);
                      const file = event.dataTransfer.files[0];
                      if (file) handleFileUpload(file);
                    }}
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = '.pdf';
                      input.onchange = (event) => {
                        const file = (event.target as HTMLInputElement).files?.[0];
                        if (file) handleFileUpload(file);
                      };
                      input.click();
                    }}
                    className={`cursor-pointer rounded-3xl border border-dashed p-12 text-center transition ${
                      dragOver
                        ? 'border-[var(--border-strong)] bg-[rgba(201,164,106,0.12)]'
                        : 'border-[var(--border-default)] bg-[rgba(246,239,227,0.035)] hover:border-[var(--border-strong)]'
                    }`}
                  >
                    {uploading || store.isAnalysing ? (
                      <Loader text={store.isAnalysing ? 'Analysing resume...' : 'Uploading...'} />
                    ) : store.resumeAnalysis ? (
                      <div className="flex flex-col items-center gap-3">
                        <FileText size={32} className="text-[var(--brand-emerald)]" />
                        <p className="font-semibold text-[var(--text-primary)]">{fileName || 'Resume uploaded'}</p>
                        <p className="text-small text-[var(--text-muted)]">Pressure map ready</p>
                      </div>
                    ) : (
                      <>
                        <Upload size={34} className="mx-auto mb-4 text-[var(--brand-gold-soft)]" />
                        <p className="font-semibold text-[var(--text-primary)]">Drop your resume PDF here</p>
                        <p className="mt-2 text-small text-[var(--text-muted)]">or click to browse</p>
                      </>
                    )}
                  </div>

                  {store.resumeAnalysis && (
                    <div className="mt-6 grid gap-4">
                      <div className="rounded-2xl border border-[var(--border-subtle)] bg-black/10 p-5">
                        <h3 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Skills detected</h3>
                        <div className="flex flex-wrap gap-2">
                          {store.resumeAnalysis.core_skills.slice(0, 10).map((skill) => (
                            <span key={skill} className="rounded-full border border-[var(--border-subtle)] px-3 py-1 text-xs text-[var(--brand-gold-soft)]">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      {store.resumeAnalysis.probe_points.length > 0 && (
                        <div className="rounded-2xl border border-brand-amber/25 bg-brand-amber/5 p-5">
                          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-brand-amber">
                            <AlertTriangle size={15} /> Interviewer will probe
                          </h3>
                          <div className="space-y-2">
                            {store.resumeAnalysis.probe_points.map((point, index) => (
                              <p key={index} className="text-small text-[var(--text-secondary)]">
                                {point.area}: {point.reason}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-7 flex justify-end">
                    <Button onClick={() => store.setStep(2)} disabled={!store.resumeAnalysis && !store.resumeUrl}>
                      Continue <ArrowRight size={16} />
                    </Button>
                  </div>
                </div>
              </motion.section>
            )}

            {store.step === 2 && (
              <motion.section
                key="step2"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="rounded-3xl border border-[var(--border-subtle)] bg-[rgba(246,239,227,0.045)] p-6 shadow-[var(--shadow-card)] md:p-8"
              >
                <p className="text-label text-[var(--brand-gold-soft)]">Step 02</p>
                <h2 className="mt-3 text-3xl font-semibold text-[var(--text-primary)]">Define the target.</h2>
                <div className="mt-8 grid max-w-3xl gap-5">
                  <Input
                    label="Role"
                    placeholder="Software Engineer, Product Manager..."
                    value={store.targetRole}
                    onChange={(event) => store.setTargetRole(event.target.value)}
                    icon={<Briefcase size={16} />}
                  />
                  <Input
                    label="Company or interview type"
                    placeholder="Google, early-stage startup, MNC..."
                    value={store.companyType}
                    onChange={(event) => store.setCompanyType(event.target.value)}
                  />
                  <div>
                    <label className="mb-2 block text-label text-[var(--text-secondary)]">Experience level</label>
                    <select
                      value={store.experienceLevel}
                      onChange={(event) => store.setExperienceLevel(event.target.value)}
                      className="w-full rounded-xl border border-[var(--border-subtle)] bg-[rgba(246,239,227,0.045)] px-4 py-3.5 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--border-strong)] focus:shadow-[0_0_0_4px_rgba(201,164,106,0.16)]"
                    >
                      <option value="Fresher">Fresher</option>
                      <option value="1-3 years">1-3 years</option>
                      <option value="3-6 years">3-6 years</option>
                      <option value="Senior">Senior (6+ years)</option>
                    </select>
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <Button variant="ghost" onClick={() => store.setStep(1)}><ArrowLeft size={16} /> Back</Button>
                  <Button onClick={() => store.setStep(3)} disabled={!store.targetRole}>Continue <ArrowRight size={16} /></Button>
                </div>
              </motion.section>
            )}

            {store.step === 3 && (
              <motion.section
                key="step3"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="rounded-3xl border border-[var(--border-subtle)] bg-[rgba(246,239,227,0.045)] p-6 shadow-[var(--shadow-card)] md:p-8"
              >
                <p className="text-label text-[var(--brand-gold-soft)]">Step 03</p>
                <h2 className="mt-3 text-3xl font-semibold text-[var(--text-primary)]">Choose the interviewer.</h2>
                <p className="mt-4 max-w-2xl text-body text-[var(--text-secondary)]">
                  Pick the room style that best matches your target interview pressure.
                </p>

                <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {PERSONAS.map((persona, index) => (
                    <PersonaCard
                      key={persona.id}
                      persona={persona}
                      isSelected={store.selectedPersona === persona.id}
                      onClick={() => store.setSelectedPersona(persona.id)}
                      index={index}
                    />
                  ))}
                </div>

                <div className="mt-8 flex justify-between">
                  <Button variant="ghost" onClick={() => store.setStep(2)}><ArrowLeft size={16} /> Back</Button>
                  <Button
                    size="lg"
                    onClick={handleStartInterview}
                    disabled={!store.selectedPersona || creating}
                    isLoading={creating}
                  >
                    Start Interview <ArrowRight size={18} />
                  </Button>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </main>
    </PageWrapper>
  );
}
