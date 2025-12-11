export default function PdfDocument({ plan }: any) {
  return (
    <div
      id="pdf-content"
      className="p-6 w-[800px] bg-white text-black leading-relaxed"
      style={{ pageBreakInside: "auto" }}
    >
      <h1 className="text-3xl font-bold mb-4">
        AI Fitness Coach – 7 Day Plan
      </h1>

      {/* Workout Section */}
      <h2 className="text-2xl font-semibold mt-4 mb-2">Workout Plan</h2>

      {plan.workout.days.map((day: any, idx: number) => (
        <div
          key={idx}
          className="mb-4"
          style={{ pageBreakAfter: "auto", pageBreakInside: "avoid" }}
        >
          <h3 className="text-xl font-bold">
            Day {day.day}: {day.title}
          </h3>
          <p className="mb-2">{day.description}</p>

          {day.exercises.map((ex: any, i: number) => (
            <div key={i} className="ml-4 mb-1">
              • <b>{ex.name}</b> — {ex.sets} sets × {ex.reps} reps  
              (Rest: {ex.rest})
              {ex.notes && (
                <div className="ml-6 text-sm">Note: {ex.notes}</div>
              )}
            </div>
          ))}
        </div>
      ))}

      {/* Diet Section */}
      <h2 className="text-2xl font-semibold mt-6 mb-2">Diet Plan</h2>

      {plan.diet.days.map((day: any, idx: number) => (
        <div
          key={idx}
          className="mb-4"
          style={{ pageBreakAfter: "auto", pageBreakInside: "avoid" }}
        >
          <h3 className="text-xl font-bold">Day {day.day}</h3>

          {day.meals.map((meal: any, i: number) => (
            <div key={i} className="ml-4 mb-2">
              • <b>{meal.type}</b> — {meal.title}
              <div className="text-sm ml-6">{meal.description}</div>

              <div className="text-sm ml-6">
                🔥 {meal.calories} | 💪 {meal.protein} | 🍞 {meal.carbs} | 🥑{" "}
                {meal.fats}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
