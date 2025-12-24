import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 md:p-24 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 gradient-animated opacity-50 -z-10" />

      {/* Floating gradient orbs */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-primary-500/30 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

      <div className="text-center max-w-5xl relative z-10">
        {/* Main heading with gradient */}
        <h1 className="text-6xl md:text-8xl font-black mb-8 animate-fade-in-up">
          <span className="gradient-text">
            Master QA Automation
          </span>
        </h1>

        <p className="text-xl md:text-3xl text-gray-700 dark:text-gray-300 mb-12 font-medium animate-fade-in-up max-w-3xl mx-auto" style={{ animationDelay: '0.1s' }}>
          Learn QA Automation with interactive courses, coding exercises, and real-world projects
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <Link href="/courses">
            <Button size="lg" variant="gradient" className="text-lg px-10 py-6 h-auto shadow-2xl">
              Explore Courses
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
          </Link>
          <Link href="/register">
            <Button size="lg" variant="glass" className="text-lg px-10 py-6 h-auto">
              Get Started Free
            </Button>
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="card-glass group">
            <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">📚</div>
            <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
              47 Lessons
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              Comprehensive curriculum covering everything from basics to advanced automation
            </p>
          </div>

          <div className="card-glass group">
            <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">💻</div>
            <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-secondary-600 to-secondary-700 bg-clip-text text-transparent">
              Hands-on Practice
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              Interactive coding exercises and quizzes to reinforce your learning
            </p>
          </div>

          <div className="card-glass group">
            <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">🎯</div>
            <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-accent-600 to-accent-700 bg-clip-text text-transparent">
              Career Ready
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              Interview preparation and real-world projects to boost your career
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
