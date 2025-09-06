// // frontend/src/WorkoutPlanDisplay.jsx
//
// import React from 'react';
//
// // Added onClick handler and cursor-pointer class
// const Exercise = ({ exercise, onExerciseClick }) => (
//   <li
//     className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
//     onClick={() => onExerciseClick(exercise)}
//   >
//     <span className="font-medium text-gray-800">{exercise.name}</span>
//     <span className="text-gray-500">{exercise.sets} x {exercise.reps}</span>
//   </li>
// );
//
// // Passes the onExerciseClick function down
// const WorkoutDay = ({ day, onExerciseClick }) => (
//   <div className="bg-gray-50 rounded-xl p-4 shadow-sm hover:shadow-lg transition-shadow duration-300 mb-4">
//     <h4 className="font-bold text-gray-700 text-lg mb-2">{day.day} - <span className="text-purple-600">{day.focus}</span></h4>
//     <ul className="space-y-2">
//       {day.exercises.map((exercise, index) => (
//         <Exercise key={index} exercise={exercise} onExerciseClick={onExerciseClick} />
//       ))}
//     </ul>
//   </div>
// );
//
// // Main component now accepts and passes onExerciseClick
// const WorkoutPlanDisplay = ({ plan, onExerciseClick }) => {
//   if (!plan) return null;
//
//   return (
//     <div>
//       <div className="text-center mb-6">
//         <h2 className="text-3xl font-bold text-gray-800">{plan.planName}</h2>
//         <p className="text-gray-500 mt-1">Duration: {plan.weeks.length} weeks</p>
//       </div>
//       {plan.weeks.map((week) => (
//         <div key={week.weekNumber} className="mb-8">
//           <h3 className="text-2xl font-semibold mb-4 border-b-2 border-gray-200 pb-2">Week {week.weekNumber}</h3>
//           {week.days.map((day, index) => (
//             <WorkoutDay key={index} day={day} onExerciseClick={onExerciseClick} />
//           ))}
//         </div>
//       ))}
//     </div>
//   );
// };
//
// export default WorkoutPlanDisplay;




// frontend/src/WorkoutPlanDisplay.jsx

import { useState } from 'react';

// A single exercise item component
const ExerciseItem = ({ exercise, onExerciseClick }) => (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
        <td className="py-3 px-4">
            <button
                onClick={() => onExerciseClick(exercise)}
                className="text-blue-600 font-semibold hover:underline focus:outline-none"
            >
                {exercise.name}
            </button>
        </td>
        <td className="py-3 px-4 text-center">{exercise.sets}</td>
        <td className="py-3 px-4 text-center">{exercise.reps}</td>
        <td className="py-3 px-4 text-center">{exercise.rest}</td>
    </tr>
);

// A component for a single day's workout
const DayWorkout = ({ dayData, onExerciseClick }) => (
    <div className="bg-gray-50 p-4 rounded-lg shadow-inner mb-4">
        <h4 className="font-bold text-lg text-gray-800 mb-2">{dayData.day} - <span className="text-purple-600">{dayData.focus}</span></h4>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                <tr className="bg-gray-200">
                    <th className="py-2 px-4 font-semibold text-gray-600">Exercise</th>
                    <th className="py-2 px-4 font-semibold text-gray-600 text-center">Sets</th>
                    <th className="py-2 px-4 font-semibold text-gray-600 text-center">Reps</th>
                    <th className="py-2 px-4 font-semibold text-gray-600 text-center">Rest</th>
                </tr>
                </thead>
                <tbody>
                {dayData.exercises.map((exercise, index) => (
                    <ExerciseItem key={index} exercise={exercise} onExerciseClick={onExerciseClick} />
                ))}
                </tbody>
            </table>
        </div>
    </div>
);

// Main display component
const WorkoutPlanDisplay = ({ plan, onExerciseClick }) => {
    const [activeWeek, setActiveWeek] = useState(1);

    if (!plan || !plan.weeks) {
        return <p>No workout plan available.</p>;
    }

    const { planName, planOverview, progressionTips } = plan;
    const currentWeekData = plan.weeks.find(w => w.weekNumber === activeWeek);

    return (
        <div className="w-full">
            <h2 className="text-3xl font-bold text-center mb-2">{planName}</h2>
            <p className="text-gray-600 text-center mb-6">{planOverview}</p>

            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded-md" role="alert">
                <p className="font-bold">Progression Tips</p>
                <ul className="list-disc list-inside mt-2">
                    {progressionTips.map((tip, index) => <li key={index}>{tip}</li>)}
                </ul>
            </div>

            <div className="flex justify-center items-center mb-4 space-x-2">
                <span className="font-semibold">Week:</span>
                {plan.weeks.map(week => (
                    <button
                        key={week.weekNumber}
                        onClick={() => setActiveWeek(week.weekNumber)}
                        className={`px-4 py-2 rounded-lg font-bold transition ${activeWeek === week.weekNumber ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                        {week.weekNumber}
                    </button>
                ))}
            </div>

            <div>
                {currentWeekData && currentWeekData.days.map((day, index) => (
                    <DayWorkout key={index} dayData={day} onExerciseClick={onExerciseClick} />
                ))}
            </div>
        </div>
    );
};

export default WorkoutPlanDisplay;
