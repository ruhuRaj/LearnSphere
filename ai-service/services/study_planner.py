"""Study planner service — generates personalized study plans."""


def generate_study_plan(target_exam: str, subjects: list, hours_per_day: int = 6, weeks: int = 12):
    """Generate a personalized weekly study plan."""
    plan = []
    for week in range(1, min(weeks + 1, 25)):
        primary_subject = subjects[(week - 1) % len(subjects)]
        secondary_subject = subjects[week % len(subjects)] if len(subjects) > 1 else primary_subject

        daily_tasks = [
            f"📖 Study {primary_subject} theory — Chapter {week} ({int(hours_per_day * 0.3)}h)",
            f"✏️ Practice {primary_subject} problems ({int(hours_per_day * 0.25)}h)",
            f"📝 Solve {secondary_subject} previous year questions ({int(hours_per_day * 0.2)}h)",
            f"🧪 Take a mini mock test ({int(hours_per_day * 0.15)}h)",
            f"📚 Revision + Doubt clearing ({int(hours_per_day * 0.1)}h)",
        ]

        milestones = {
            1: "Complete fundamentals and basic concepts",
            2: "Finish standard problems and derivations",
            3: "Master numerical problem solving",
            4: "Complete first full syllabus cycle",
            8: "Finish revision of all chapters",
            12: "Complete mock test series",
        }

        plan.append({
            "week": week,
            "focus": primary_subject,
            "daily_hours": hours_per_day,
            "tasks": daily_tasks,
            "milestone": milestones.get(week, f"Complete Chapter {week} — {primary_subject}"),
        })

    return {
        "targetExam": target_exam,
        "totalWeeks": weeks,
        "hoursPerDay": hours_per_day,
        "plan": plan,
    }
