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
          content: `Genera una receta para "${name}" para ${servings || 4} persona(s) en español. La receta debe ser con enfoque peruano/latinoamericano: usa ingredientes que se consiguen fácilmente en mercados y supermercados de Perú (Lima). Si el plato es internacional, adaptalo con ingredientes locales disponibles en Perú. Sé conciso y práctico. Responde SOLO en JSON sin backticks ni markdown, con este formato exacto:
{"description":"breve descripción del plato en 1 línea","calories_per_person":450,"ingredients":"200g de harina\\n3 huevos\\n1 taza de leche\\nSal a gusto","steps":"1. Primer paso detallado\\n2. Segundo paso detallado\\n3. Tercer paso"}`
        }]
      })
    });
    const data = await res.json();
    if (data.error) return Response.json({ error: data.error.message }, { status: 500 });
    const text = data.content?.find(b => b.type === "text")?.text || "";
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    return Response.json(parsed);
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
