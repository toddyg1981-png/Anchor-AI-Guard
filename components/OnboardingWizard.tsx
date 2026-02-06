import React, { useState } from 'react';

interface OnboardingWizardProps {
  userName?: string;
  onComplete: (data?: OnboardingData) => void;
  onSkip?: () => void;
}

interface OnboardingData {
  projectName: string;
  repoUrl: string;
  teamSize: string;
  primaryLanguage: string;
  scanFrequency: string;
  integrateGithub: boolean;
  enableSlack: boolean;
}

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  userName = 'there',
  onComplete,
  onSkip,
}) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({
    projectName: '',
    repoUrl: '',
    teamSize: '',
    primaryLanguage: '',
    scanFrequency: 'on_push',
    integrateGithub: false,
    enableSlack: false,
  });

  const totalSteps = 4;

  const teamSizes = [
    { value: '1', label: 'Just me', icon: '👤' },
    { value: '2-5', label: '2-5 developers', icon: '👥' },
    { value: '6-20', label: '6-20 developers', icon: '👨‍👩‍👧‍👦' },
    { value: '21-50', label: '21-50 developers', icon: '🏢' },
    { value: '50+', label: '50+ developers', icon: '🏙️' },
  ];

  const languages = [
    { value: 'javascript', label: 'JavaScript / TypeScript', icon: '🟨' },
    { value: 'python', label: 'Python', icon: '🐍' },
    { value: 'java', label: 'Java', icon: '☕' },
    { value: 'go', label: 'Go', icon: '🐹' },
    { value: 'rust', label: 'Rust', icon: '🦀' },
    { value: 'csharp', label: 'C# / .NET', icon: '🟣' },
    { value: 'ruby', label: 'Ruby', icon: '💎' },
    { value: 'php', label: 'PHP', icon: '🐘' },
    { value: 'other', label: 'Other', icon: '📝' },
  ];

  const scanOptions = [
    { value: 'on_push', label: 'On every push', description: 'Recommended for active development' },
    { value: 'on_pr', label: 'On pull requests only', description: 'Scan when PRs are opened' },
    { value: 'daily', label: 'Daily scheduled scan', description: 'Run once per day' },
    { value: 'weekly', label: 'Weekly scheduled scan', description: 'Run once per week' },
    { value: 'manual', label: 'Manual only', description: 'Scan when you trigger it' },
  ];

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete(formData);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.teamSize !== '';
      case 2:
        return formData.projectName !== '' && formData.primaryLanguage !== '';
      case 3:
        return formData.scanFrequency !== '';
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Step {step} of {totalSteps}</span>
            <button
              onClick={() => onSkip ? onSkip() : onComplete()}
              className="text-sm text-gray-500 hover:text-gray-300"
            >
              Skip setup
            </button>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-[#35c6ff] via-[#7a3cff] to-[#ff4fa3] transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
          {/* Step 1: Team Size */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                  Welcome, {userName}! 👋
                </h1>
                <p className="text-gray-400">
                  Let&apos;s set up your security dashboard. First, tell us about your team.
                </p>
              </div>

              <div className="space-y-3">
                {teamSizes.map((size) => (
                  <button
                    key={size.value}
                    onClick={() => setFormData({ ...formData, teamSize: size.value })}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                      formData.teamSize === size.value
                        ? 'border-[#ff4fa3] bg-[#ff4fa3]/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <span className="text-2xl">{size.icon}</span>
                    <span className="text-white font-medium">{size.label}</span>
                    {formData.teamSize === size.value && (
                      <svg className="w-5 h-5 text-[#ff4fa3] ml-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Project Setup */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                  Create your first project
                </h1>
                <p className="text-gray-400">
                  We&apos;ll scan this project to find security vulnerabilities
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  placeholder="My Awesome Project"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Repository URL (optional)
                </label>
                <input
                  type="text"
                  value={formData.repoUrl}
                  onChange={(e) => setFormData({ ...formData, repoUrl: e.target.value })}
                  placeholder="https://github.com/your-org/your-repo"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Primary Language
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {languages.map((lang) => (
                    <button
                      key={lang.value}
                      onClick={() => setFormData({ ...formData, primaryLanguage: lang.value })}
                      className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${
                        formData.primaryLanguage === lang.value
                          ? 'border-[#ff4fa3] bg-[#ff4fa3]/10'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <span>{lang.icon}</span>
                      <span className="text-sm text-white">{lang.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Scan Settings */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                  How often should we scan?
                </h1>
                <p className="text-gray-400">
                  Choose when Anchor runs security scans on your code
                </p>
              </div>

              <div className="space-y-3">
                {scanOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFormData({ ...formData, scanFrequency: option.value })}
                    className={`w-full flex items-start gap-4 p-4 rounded-xl border transition-all text-left ${
                      formData.scanFrequency === option.value
                        ? 'border-[#ff4fa3] bg-[#ff4fa3]/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                      formData.scanFrequency === option.value ? 'border-[#ff4fa3]' : 'border-gray-600'
                    }`}>
                      {formData.scanFrequency === option.value && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#ff4fa3]" />
                      )}
                    </div>
                    <div>
                      <span className="text-white font-medium block">{option.label}</span>
                      <span className="text-gray-500 text-sm">{option.description}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Integrations */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                  Connect your tools
                </h1>
                <p className="text-gray-400">
                  Integrate Anchor with your existing workflow
                </p>
              </div>

              <div className="space-y-4">
                {/* GitHub Integration */}
                <div
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    formData.integrateGithub
                      ? 'border-[#ff4fa3] bg-[#ff4fa3]/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                  onClick={() => setFormData({ ...formData, integrateGithub: !formData.integrateGithub })}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
                        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-white font-medium block">GitHub</span>
                        <span className="text-gray-500 text-sm">Auto-scan PRs, create issues, post status checks</span>
                      </div>
                    </div>
                    <div className={`w-12 h-7 rounded-full p-1 transition-colors ${
                      formData.integrateGithub ? 'bg-[#ff4fa3]' : 'bg-gray-700'
                    }`}>
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        formData.integrateGithub ? 'translate-x-5' : ''
                      }`} />
                    </div>
                  </div>
                </div>

                {/* Slack Integration */}
                <div
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    formData.enableSlack
                      ? 'border-[#ff4fa3] bg-[#ff4fa3]/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                  onClick={() => setFormData({ ...formData, enableSlack: !formData.enableSlack })}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
                        <span className="text-2xl">💬</span>
                      </div>
                      <div>
                        <span className="text-white font-medium block">Slack</span>
                        <span className="text-gray-500 text-sm">Get notified about critical vulnerabilities</span>
                      </div>
                    </div>
                    <div className={`w-12 h-7 rounded-full p-1 transition-colors ${
                      formData.enableSlack ? 'bg-[#ff4fa3]' : 'bg-gray-700'
                    }`}>
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        formData.enableSlack ? 'translate-x-5' : ''
                      }`} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-xl p-4 mt-6">
                <p className="text-gray-400 text-sm">
                  💡 <strong className="text-white">Tip:</strong> You can always add more integrations later from your settings page.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-700">
            <button
              onClick={handleBack}
              className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                step === 1
                  ? 'text-gray-600 cursor-not-allowed'
                  : 'text-gray-400 hover:text-white'
              }`}
              disabled={step === 1}
            >
              ← Back
            </button>
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                canProceed()
                  ? 'bg-linear-to-r from-[#35c6ff] via-[#7a3cff] to-[#ff4fa3] hover:brightness-110 text-white shadow-lg shadow-pink-500/25'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              {step === totalSteps ? 'Complete Setup' : 'Continue →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
