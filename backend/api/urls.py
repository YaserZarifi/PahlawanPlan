
from django.urls import path
from .views import WorkoutGeneratorView, ExerciseDetailView

urlpatterns = [
    path('generate-workout/', WorkoutGeneratorView.as_view(), name='generate-workout'),
    # NEW: URL for fetching details of a single exercise
    path('exercise-details/', ExerciseDetailView.as_view(), name='exercise-details'),
]