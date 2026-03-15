export async function POST(request) {
  try {
    const { name, servings } = await request.json();

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: `Genera una receta para "${name}" para ${servings || 2} persona(s) en español. Incluye una estimación de calorías por persona. Responde SOLO en JSON sin backticks ni markdown, con este formato exacto:
{"title":"nombre","time":"30 min","calories_per_person":450,"ingredients":["200g de ingrediente 1","1 unidad de ingrediente 2"],"steps":["Paso 1 detallado","Paso 2 detallado"]}`
        }]
      })
    });

    const data = await res.json();
    
    if (data.error) {
      return Response.json({ error: data.error.message }, { status: 500 });
    }

    const text = data.content?.find(b => b.type === "text")?.text || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return Response.json(parsed);
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
