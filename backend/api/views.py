import json
import time
from django.conf import settings
from groq import Groq
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import re
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

client = Groq(api_key=settings.GROQ_API_KEY)

MOCK_EXERCISE_DB = {
    "Goblet Squat": {
        "instructions": [
            "Hold a dumbbell vertically against your chest with both hands.",
            "Stand with your feet slightly wider than shoulder-width apart.",
            "Keeping your chest up and back straight, lower into a squat until your thighs are parallel to the floor.",
            "Push through your heels to return to the starting position."
        ],
        "gifUrl": "https://placehold.co/400x300/e2e8f0/4a5568?text=Goblet+Squat+GIF"
    },
    "Push-up": {
        "instructions": [
            "Start in a high plank position with your hands shoulder-width apart.",
            "Lower your body until your chest nearly touches the floor.",
            "Keep your body in a straight line from head to heels.",
            "Push back up to the starting position."
        ],
        "gifUrl": "https://placehold.co/400x300/e2e8f0/4a5568?text=Push-up+GIF"
    },
    "Dumbbell Row": {
        "instructions": [
            "Place one knee and hand on a bench, holding a dumbbell in the other hand.",
            "Keep your back flat and parallel to the ground.",
            "Pull the dumbbell up towards your chest, squeezing your back muscles.",
            "Lower the dumbbell with control to the starting position."
        ],
        "gifUrl": "https://placehold.co/400x300/e2e8f0/4a5568?text=Dumbbell+Row+GIF"
    },
}


class WorkoutGeneratorView(APIView):
    def post(self, request, *args, **kwargs):
        user_data = request.data

        goal = user_data.get('goal', 'general fitness')
        fitness_level = user_data.get('fitnessLevel', 'beginner')
        equipment = user_data.get('equipment', 'full gym')
        frequency = user_data.get('frequency', '3 days per week')
        weight = user_data.get('weight')
        height = user_data.get('height')
        age = user_data.get('age')
        gender = user_data.get('gender')

        # --- NEW: Heavily revised and stricter system prompt ---
        system_prompt = """
            You are an expert fitness coach. Your task is to create a detailed, personalized 4-week workout plan.

            First, think step-by-step inside a `<think>` block about the user's profile and how you will structure the plan.
            After the closing `</think>` tag, you MUST provide the final output as a single, valid JSON object and nothing else.
            Do not wrap the JSON in markdown backticks or any other text.

            The JSON object at the top level MUST have these keys: `planName`, `planOverview`, `progressionTips`, and `weeks`.

            Crucially, inside the `weeks` array, every single exercise under the `exercises` key MUST be a JSON object with the following structure:
            `{"name": "Exercise Name", "sets": 3, "reps": "8-12", "rest": "60s"}`.
            Do NOT return exercises as simple strings. They MUST be objects.

            Here is a perfect example of the required JSON output structure:
            {
                "planName": "Beginner Full-Body Foundation",
                "planOverview": "This 4-week plan focuses on building a solid strength base using compound movements.",
                "progressionTips": [
                    "Aim to increase the weight slightly each week while maintaining good form."
                ],
                "weeks": [{
                    "weekNumber": 1,
                    "days": [{
                        "day": "Monday",
                        "focus": "Full Body A",
                        "exercises": [
                            {"name": "Goblet Squat", "sets": 3, "reps": "8-12", "rest": "60s"},
                            {"name": "Push-ups", "sets": 3, "reps": "To Failure", "rest": "60s"}
                        ]
                    }]
                }]
            }
            """

        user_profile = [
            f"- Primary Goal: {goal}", f"- Fitness Level: {fitness_level}", f"- Available Equipment: {equipment}",
            f"- Workout Frequency: {frequency}"
        ]
        if weight: user_profile.append(f"- Weight: {weight} kg")
        if height: user_profile.append(f"- Height: {height} cm")
        if age: user_profile.append(f"- Age: {age}")
        if gender: user_profile.append(f"- Gender: {gender}")
        user_prompt = "Create a 4-week workout plan for a user with the following profile:\n" + "\n".join(user_profile)

        attempts = 3
        for i in range(attempts):
            try:
                print(f"--- Attempt {i + 1} ---")
                response = client.chat.completions.create(
                    model="qwen/qwen3-32b",
                    messages=[{"role": "system",
                               "content": system_prompt},
                              {"role":
                                   "user",
                                    "content": user_prompt}],
                )
                raw_response = response.choices[0].message.content
                think_pattern = re.compile(r'<think>(.*?)</think>', re.DOTALL)
                think_match = think_pattern.search(raw_response)
                thinking_text = ""
                json_string = raw_response
                if think_match:
                    thinking_text = think_match.group(1).strip()
                    json_string = think_pattern.sub('', raw_response).strip()

                # NEW: Clean up potential markdown fences from the JSON string
                json_string = re.sub(r'```json\s*|\s*```', '', json_string, flags=re.DOTALL).strip()

                workout_data = json.loads(json_string)

                # Combine the thinking text with the workout data
                final_response = {
                    "thinking": thinking_text,
                    "plan": workout_data  # Nest the workout data under a 'plan' key for the frontend
                }

                # UPDATED: Validation to check for the new top-level keys
                if 'planName' in workout_data and 'weeks' in workout_data:
                    return Response(final_response, status=status.HTTP_200_OK)
                else:
                    raise ValueError("Generated JSON is missing the required 'planName' or 'weeks' key.")

            except json.JSONDecodeError as e:
                print(f"Attempt {i + 1} failed due to JSON parsing error: {e}")
                print(f"Model's raw response was: {raw_response}")
                time.sleep(1)
            except Exception as e:
                print(f"Attempt {i + 1} failed: {e}")
                time.sleep(1)

        error_message = {"error": "Failed to generate workout plan after several attempts."}
        return Response(error_message, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class ExerciseDetailView(APIView):
#     def get(self, request, *args, **kwargs):
#         exercise_name = request.query_params.get('name')
#         if not exercise_name:
#             return Response({"error": "Exercise name not provided."}, status=status.HTTP_400_BAD_REQUEST)
#         exercise_details = MOCK_EXERCISE_DB.get(exercise_name, {
#             "instructions": ["No instructions available for this exercise."],
#             "gifUrl": "https://placehold.co/400x300/e2e8f0/4a5568?text=Not+Found"
#         })
#         return Response(exercise_details, status=status.HTTP_200_OK)
#


class ExerciseDetailView(APIView):
    def get(self, request, *args, **kwargs):
        exercise_name = request.query_params.get('name')
        if not exercise_name:
            return Response({"error": "Exercise name not provided."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            youtube = build('youtube', 'v3', developerKey=settings.YOUTUBE_API_KEY)
            search_query = f"{exercise_name} exercise tutorial form"
            search_response = youtube.search().list(
                q=search_query,
                part='snippet',
                maxResults=1,
                type='video'
            ).execute()

            video_id = None
            if search_response.get("items"):
                video_id = search_response["items"][0]["id"]["videoId"]

            video_embed_url = f"https://www.youtube.com/embed/{video_id}" if video_id else None

            # --- DEBUG PRINT ---
            print(video_embed_url)

            formatted_response = {
                "name": exercise_name.title(),
                "instructions": [
                    "Please watch the video for proper form and instructions.",
                    "Consult a professional if you are unsure."
                ],
                "videoUrl": video_embed_url
            }

            if not video_embed_url:
                return Response({"error": f"No video tutorial found for '{exercise_name}'."},
                                status=status.HTTP_404_NOT_FOUND)

            return Response(formatted_response, status=status.HTTP_200_OK)

        except HttpError as e:
            error_details = json.loads(e.content.decode())
            error_reason = error_details.get("error", {}).get("errors", [{}])[0].get("reason")
            print(f"YouTube API HttpError: {error_reason}")

            if error_reason == "keyInvalid":
                message = "The provided YouTube API key is invalid."
            elif "quotaExceeded" in error_reason:
                message = "The YouTube API quota has been exceeded."
            else:
                message = "An error occurred with the YouTube API."
            return Response({"error": message}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        except Exception as e:
            print(f"An unexpected error occurred: {e}")
            return Response({"error": "An unexpected server error occurred."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

