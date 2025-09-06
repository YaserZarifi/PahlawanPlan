// // frontend/src/ExerciseModal.jsx
//
// import React, { useState, useEffect } from 'react';
//
// const ExerciseModal = ({ exercise, onClose }) => {
//   // State to control the visibility for the animation
//   const [isVisible, setIsVisible] = useState(false);
//
//   // When the component mounts, trigger the "in" animation
//   useEffect(() => {
//     const timer = setTimeout(() => setIsVisible(true), 50);
//     return () => clearTimeout(timer);
//   }, []);
//
//   // Function to handle closing the modal
//   const handleClose = () => {
//     // Trigger the "out" animation
//     setIsVisible(false);
//     // Wait for the animation to finish before calling the parent's onClose
//     setTimeout(onClose, 300); // This duration should match your transition duration
//   };
//
//   if (!exercise) return null;
//
//   return (
//     // The overlay with a fade transition
//     <div
//       className={`fixed inset-0 bg-black z-50 flex justify-center items-center transition-opacity duration-300 ease-in-out ${isVisible ? 'bg-opacity-60' : 'bg-opacity-0'}`}
//       onClick={handleClose}
//     >
//       {/* The modal card with a fade and scale transition */}
//       <div
//         className={`bg-white rounded-xl p-6 w-11/12 max-w-lg shadow-lg transition-all duration-300 ease-in-out ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
//         onClick={(e) => e.stopPropagation()}
//       >
//         <h4 className="text-2xl font-bold text-gray-800 mb-2">{exercise.name}</h4>
//
//         <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
//           <span className="text-gray-400">Exercise Image/Video</span>
//         </div>
//
//         <p className="text-gray-700 mb-2 text-lg">
//           <span className="font-semibold">Sets:</span> {exercise.sets} | <span className="font-semibold">Reps:</span> {exercise.reps}
//         </p>
//         <p className="text-gray-700 mb-4 text-lg">
//           <span className="font-semibold">Rest:</span> {exercise.rest}
//         </p>
//         <p className="text-gray-600 mb-4">
//           <span className="font-semibold">Tips:</span> The AI will provide helpful tips here in the future.
//         </p>
//         <button
//           className="mt-4 w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
//           onClick={handleClose}
//         >
//           Close
//         </button>
//       </div>
//     </div>
//   );
// };
//
// export default ExerciseModal;






// frontend/src/ExerciseModal.jsx

import { useState, useEffect } from 'react';

const ExerciseModal = ({ exerciseName, onClose }) => {
    const [details, setDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!exerciseName) return;

        const fetchExerciseDetails = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/exercise-details/?name=${encodeURIComponent(exerciseName)}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch exercise details.');
                }
                const data = await response.json();
                setDetails(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchExerciseDetails();
    }, [exerciseName]);

    // Handle clicks outside the modal content to close it
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg relative p-6">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl"
                    aria-label="Close"
                >
                    &times;
                </button>

                <h2 className="text-2xl font-bold mb-4 text-gray-800">{exerciseName}</h2>

                {isLoading && <p>Loading details...</p>}
                {error && <p className="text-red-500">{error}</p>}

                {details && (
                    <div>
                        <div className="mb-4">
                            <img
                                src={details.gifUrl}
                                alt={`${exerciseName} demonstration`}
                                className="w-full rounded-lg bg-gray-200"
                            />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg mb-2 text-gray-700">Instructions:</h3>
                            <ul className="list-decimal list-inside space-y-2 text-gray-600">
                                {details.instructions.map((step, index) => (
                                    <li key={index}>{step}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExerciseModal;
