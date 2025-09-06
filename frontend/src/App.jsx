// frontend/src/App.jsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import pahlawanLogo from './assets/logo.png';


// --- Theme Toggle Component (No changes) ---
const ThemeToggle = ({ theme, setTheme }) => {
    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
    return (
        <button onClick={toggleTheme} className="absolute top-4 right-4 p-2 rounded-full bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm text-gray-800 dark:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors duration-300" aria-label="Toggle theme">
            {theme === 'light' ? ( <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg> ) : ( <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg> )}
        </button>
    );
};


// --- UPDATED: Exercise Modal to Display YouTube Video ---
const ExerciseModal = ({ exerciseName, onClose }) => {
    const [details, setDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (!exerciseName) return;

        setIsClosing(false);
        setIsLoading(true);
        setError(null);

        const fetchExerciseDetails = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/exercise-details/?name=${encodeURIComponent(exerciseName)}`);
                const data = await response.json(); // Always parse JSON to get error message
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch exercise details.');
                }
                setDetails(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchExerciseDetails();
    }, [exerciseName]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4"
            onClick={handleBackdropClick}
        >
            <div
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg relative p-6 text-gray-800 dark:text-gray-200 ${
                    isClosing ? 'modal-exit-active' : 'modal-enter-active'
                }`}
            >
                <button
                    onClick={handleClose}
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
                    aria-label="Close"
                >
                    &times;
                </button>
                <h2 className="text-2xl font-bold mb-4">{exerciseName}</h2>

                {isLoading && <div className="w-full aspect-video flex justify-center items-center"><Spinner /></div>}
                {error && <div className="w-full aspect-video flex justify-center items-center text-red-500">{error}</div>}

                {details && (
                    <div>
                        {/* --- THIS IS THE KEY CHANGE --- */}
                        {details.videoUrl ? (
                            <div className="mb-4 aspect-video">
                                <iframe
                                    className="w-full h-full rounded-lg"
                                    src={details.videoUrl}
                                    title={`YouTube video player for ${exerciseName}`}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        ) : (
                            // Fallback if no video is found but the request didn't fail
                            <div className="w-full aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                                <p className="text-gray-500">Video not available.</p>
                            </div>
                        )}
                        <div>
                            <h3 className="font-semibold text-lg mb-2">Instructions:</h3>
                            <ul className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400">
                                {details.instructions && details.instructions.map((step, index) => <li key={index}>{step}</li>)}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};



const ThinkingProcess = ({ text, onAnimationComplete }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(true);
    const [isOpen, setIsOpen] = useState(true);
    // NEW: Create a ref for the scrollable div
    const scrollContainerRef = useRef(null);

    useEffect(() => {
        if (!text) return;

        setIsOpen(true);
        setIsTyping(true);
        setDisplayedText('');

        const worker = new Worker('/typingWorker.js');

        worker.onmessage = (e) => {
            if (e.data.type === 'tick') {
                setDisplayedText(prev => prev + e.data.char);

                // NEW: Auto-scroll logic
                // If the scroll container exists, scroll it to the bottom
                if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
                }
            } else if (e.data.type === 'done') {
                setIsTyping(false);

                setTimeout(() => setIsOpen(false), 700);
                setTimeout(() => onAnimationComplete(), 1200);

                worker.terminate();
            }
        };

        worker.postMessage({ command: 'start', text: text, speed: 2.5 });

        return () => worker.terminate();
    }, [text, onAnimationComplete]);

    if (!text) return null;

    return (
        <div className="w-full mb-6 bg-gray-100/80 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg backdrop-blur-sm">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 text-left font-semibold text-gray-700 dark:text-gray-300"
            >
                {/* UPDATED: Title with conditional spinner */}
                <span className="flex items-center gap-2">
                    🤖 AI Reasoning
                    {isTyping && <div className="mini-spinner"></div>}
                </span>

                <svg className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            <div className={`collapsible-content ${!isOpen ? 'closed' : ''}`}>
                {/* UPDATED: Added the ref to this div */}
                <div ref={scrollContainerRef} className="p-4 border-t border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto">
                    <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap font-mono text-sm">
                        {displayedText}
                        {isTyping && <span className="typing-cursor"></span>}
                    </p>
                </div>
            </div>
        </div>
    );
};


// --- Workout Plan Display Components ---
const ExerciseItem = ({ exercise, onExerciseClick }) => (
    <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"><td className="py-3 px-4"><button onClick={() => onExerciseClick(exercise)} className="text-blue-600 dark:text-blue-400 font-semibold hover:underline focus:outline-none">{exercise.name}</button></td><td className="py-3 px-4 text-center">{exercise.sets}</td><td className="py-3 px-4 text-center">{exercise.reps}</td><td className="py-3 px-4 text-center">{exercise.rest}</td></tr>
);
const DayWorkout = ({ dayData, onExerciseClick }) => (
    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg shadow-inner mb-4 workout-day-card backdrop-blur-sm"><h4 className="font-bold text-lg mb-2">{dayData.day} - <span className="text-purple-600 dark:text-purple-400">{dayData.focus}</span></h4><div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="bg-gray-200 dark:bg-gray-700"><th className="py-2 px-4 font-semibold text-gray-600 dark:text-gray-300">Exercise</th><th className="py-2 px-4 font-semibold text-gray-600 dark:text-gray-300 text-center">Sets</th><th className="py-2 px-4 font-semibold text-gray-600 dark:text-gray-300 text-center">Reps</th><th className="py-2 px-4 font-semibold text-gray-600 dark:text-gray-300 text-center">Rest</th></tr></thead><tbody>{dayData.exercises.map((exercise, index) => <ExerciseItem key={index} exercise={exercise} onExerciseClick={onExerciseClick} />)}</tbody></table></div></div>
);

const WorkoutPlanDisplay = ({ plan, onExerciseClick }) => {
    const [activeWeek, setActiveWeek] = useState(1);
    const [animationClass, setAnimationClass] = useState('slide-in-right');
    const workoutContainerRef = useRef(null);
    const handleWeekChange = (newWeek) => {
        if (newWeek > activeWeek) { setAnimationClass('slide-in-right'); }
        else if (newWeek < activeWeek) { setAnimationClass('slide-in-left'); }
        setActiveWeek(newWeek);
    };
    const currentWeekData = plan?.weeks?.find(w => w.weekNumber === activeWeek);
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => { entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }); }, { threshold: 0.1 });
        const cards = workoutContainerRef.current?.querySelectorAll('.workout-day-card');
        if (cards) { cards.forEach((card) => observer.observe(card)); }
        return () => observer.disconnect();
    }, [currentWeekData]);
    if (!plan || !plan.weeks) return <p>No workout plan available.</p>;
    return (
        <div className="w-full">
            <h2 className="text-3xl font-bold text-center mb-2">{plan.planName}</h2>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">{plan.planOverview}</p>
            <div className="bg-yellow-100/80 dark:bg-yellow-900/50 border-l-4 border-yellow-500 dark:border-yellow-400 text-yellow-800 dark:text-yellow-200 p-4 mb-6 rounded-md backdrop-blur-sm" role="alert"><p className="font-bold">Progression Tips</p><ul className="list-disc list-inside mt-2">{plan.progressionTips.map((tip, index) => <li key={index}>{tip}</li>)}</ul></div>
            <div className="flex justify-center items-center mb-4 space-x-2"><span className="font-semibold">Week:</span>{plan.weeks.map(week => (<button key={week.weekNumber} onClick={() => handleWeekChange(week.weekNumber)} className={`px-4 py-2 rounded-lg font-bold transition ${activeWeek === week.weekNumber ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>{week.weekNumber}</button>))}</div>
            <div key={activeWeek} ref={workoutContainerRef} className={animationClass}>{currentWeekData && currentWeekData.days.map((day, index) => (<DayWorkout key={index} dayData={day} onExerciseClick={onExerciseClick} />))}</div>
        </div>
    );
};


// --- Main App Component ---
function App() {
    const [theme, setTheme] = useState(() => { const savedTheme = localStorage.getItem('theme'); if (savedTheme) return savedTheme; if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'; return 'light'; });
    const [formData, setFormData] = useState({
        goal: 'Muscle Gain',
        fitnessLevel: 'Beginner',
        equipment: 'Full Gym',
        frequency: '3 days per week',
        weight: '',
        height: '',
        age: '',
        gender: 'Male',
    });    const [workoutPlan, setWorkoutPlan] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [thinkingText, setThinkingText] = useState('');
    // NEW: State to control when the final plan is visible
    const [isPlanVisible, setIsPlanVisible] = useState(false);

    const handleAnimationComplete = useCallback(() => {
        setIsPlanVisible(true);
    }, []);


    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') { root.classList.add('dark'); } else { root.classList.remove('dark'); }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const handleInputChange = (e) => { const { name, value } = e.target; setFormData((prevData) => ({ ...prevData, [name]: value, })); };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setWorkoutPlan(null);
        setThinkingText('');
        setIsPlanVisible(false); // Reset plan visibility
        try {
            const response = await fetch('http://127.0.0.1:8000/api/generate-workout/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData), });
            const data = await response.json();
            if (!response.ok) { throw new Error(data.error || 'Something went wrong.'); }
            setWorkoutPlan(data.plan);
            setThinkingText(data.thinking || '');
        } catch (err) { setError(err.message || 'Failed to connect to the server.'); }
        finally { setIsLoading(false); }
    };
    const handleExerciseClick = (exercise) => { setSelectedExercise(exercise); };
    const handleCloseModal = () => { setSelectedExercise(null); };

    return (
        <div className="min-h-screen bg-transparent text-gray-800 dark:text-gray-200 flex flex-col items-center p-4 sm:p-8 font-sans">
            <ThemeToggle theme={theme} setTheme={setTheme} />
            <div className="w-full max-w-4xl">
                <header className="text-center mb-8">
                    <img
                        src={pahlawanLogo}
                        alt="Pahlavan Plan Logo"
                        className="h-40 w-40 md:h-56 md:w-56 mx-auto object-contain"
                    />
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900
    dark:text-gray-100 [text-shadow:0_2px_4px_rgba(0,0,0,0.4)]">Pahlawan Plan - AI Workout Planner</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-300
    [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">Your personalized fitness journey starts here.</p>
                </header>

                <main>
                    <form onSubmit={handleSubmit} className="bg-white/50 dark:bg-gray-800/50 p-6 rounded-xl shadow-lg mb-8 backdrop-blur-md">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {/* --- Main Options --- */}
                            <div>
                                <label htmlFor="goal" className="block mb-2 text-sm font-medium">Primary Goal</label>
                                <select name="goal" id="goal" value={formData.goal} onChange={handleInputChange} className="w-full p-3 bg-gray-50 dark:bg-gray-700 border rounded-lg">
                                    <option>Muscle Gain</option><option>Weight Loss</option><option>General Fitness</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="fitnessLevel" className="block mb-2 text-sm font-medium">Fitness Level</label>
                                <select name="fitnessLevel" id="fitnessLevel" value={formData.fitnessLevel} onChange={handleInputChange} className="w-full p-3 bg-gray-50 dark:bg-gray-700 border rounded-lg">
                                    <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="equipment" className="block mb-2 text-sm font-medium">Available Equipment</label>
                                <select name="equipment" id="equipment" value={formData.equipment} onChange={handleInputChange} className="w-full p-3 bg-gray-50 dark:bg-gray-700 border rounded-lg">
                                    <option>Full Gym</option><option>Dumbbells Only</option><option>Bodyweight Only</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="frequency" className="block mb-2 text-sm font-medium">Workout Frequency</label>
                                <select name="frequency" id="frequency" value={formData.frequency} onChange={handleInputChange} className="w-full p-3 bg-gray-50 dark:bg-gray-700 border rounded-lg">
                                    <option>2 days per week</option><option>3 days per week</option><option>4 days per week</option><option>5 days per week</option>
                                </select>
                            </div>
                        </div>

                        <div className="mb-6">
                            <button
                                type="button"
                                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                                className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                <span>Advanced Options</span>
                                <svg className={`w-4 h-4 transition-transform duration-300 ${isAdvancedOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </button>
                        </div>

                        {/* --- NEW: Collapsible Advanced Fields Section --- */}
                        <div className={`collapsible-content ${!isAdvancedOpen ? 'closed' : ''}`}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div>
                                    <label htmlFor="weight" className="block mb-2 text-sm font-medium">Weight (kg)</label>
                                    <input type="number" name="weight" id="weight" value={formData.weight} onChange={handleInputChange} placeholder="e.g., 75" className="w-full p-3 bg-gray-50 dark:bg-gray-700 border rounded-lg" />
                                </div>
                                <div>
                                    <label htmlFor="height" className="block mb-2 text-sm font-medium">Height (cm)</label>
                                    <input type="number" name="height" id="height" value={formData.height} onChange={handleInputChange} placeholder="e.g., 180" className="w-full p-3 bg-gray-50 dark:bg-gray-700 border rounded-lg" />
                                </div>
                                <div>
                                    <label htmlFor="age" className="block mb-2 text-sm font-medium">Age</label>
                                    <input type="number" name="age" id="age" value={formData.age} onChange={handleInputChange} placeholder="e.g., 30" className="w-full p-3 bg-gray-50 dark:bg-gray-700 border rounded-lg" />
                                </div>
                                <div>
                                    <label htmlFor="gender" className="block mb-2 text-sm font-medium">Gender</label>
                                    <select name="gender" id="gender" value={formData.gender} onChange={handleInputChange} className="w-full p-3 bg-gray-50 dark:bg-gray-700 border rounded-lg">
                                        <option>Male</option>
                                        <option>Female</option>
                                        <option>Prefer not to say</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg">
                            {isLoading ? 'Generating Your Plan...' : 'Generate Workout Plan'}
                        </button>
                    </form>
                    <div className="bg-white/50 dark:bg-gray-800/50 p-6 rounded-xl shadow-lg min-h-[200px] flex flex-col justify-center items-center backdrop-blur-md">
                        {isLoading && <Spinner />}
                        {error && <p className="text-center text-red-500 font-medium">Error: {error}</p>}
                        {!isLoading && !error && thinkingText && (<ThinkingProcess text={thinkingText} onAnimationComplete={handleAnimationComplete} />)}
                        {isPlanVisible && workoutPlan && (<div className="w-full fade-in-up"><WorkoutPlanDisplay plan={workoutPlan} onExerciseClick={handleExerciseClick} /></div>)}
                        {!isLoading && !error && !workoutPlan && !thinkingText && (<div className="text-center text-gray-500 dark:text-gray-400"><p className="font-semibold text-lg">Ready to transform your fitness?</p><p>Fill out the form above and let's get started!</p></div>)}
                    </div>
                </main>
            </div>
            {selectedExercise && (<ExerciseModal exerciseName={selectedExercise.name} onClose={handleCloseModal} />)}



            <a
                href="https://www.linkedin.com/in/mohammad-yaser-zarifi/"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-4 right-4 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            >
                Designed by Yaser Zarifi
            </a>
        </div>

    );
}

// Added a spinner for better loading UX
const Spinner = () => (
    <div className="flex flex-col items-center justify-center gap-4" aria-label="Loading">
        <div className="spinner"></div>
        <p className="text-gray-500 dark:text-gray-400">Generating your personalized plan...</p>
    </div>
);

export default App;

