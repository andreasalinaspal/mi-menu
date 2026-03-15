"use client";
import { useState, useEffect, useRef } from "react";

const DAYS_ES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const MONTHS_ES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

const DAY_COLORS = [
  { bg: "#F5E6E0", border: "#C4756A", accent: "#9B4D42" },
  { bg: "#E8EFE3", border: "#8BA87E", accent: "#5C7A4F" },
  { bg: "#E6E3F0", border: "#9B8EC4", accent: "#6B5E9B" },
  { bg: "#FFF3E0", border: "#D4A056", accent: "#A67B3D" },
  { bg: "#E0ECF0", border: "#6A9BB5", accent: "#3D7A9B" },
  { bg: "#F0E6EE", border: "#B56A9B", accent: "#8A3D73" },
  { bg: "#F0EDE0", border: "#A89B6A", accent: "#7A6E3D" },
];

const MEAL_TYPES = [
  { key: "desayuno", label: "DESAYUNO", icon: "☀️" },
  { key: "almuerzo", label: "ALMUERZO", icon: "🍽️" },
  { key: "cena", label: "CENA", icon: "🌙" },
];

function formatDate(date) {
  return `${date.getDate()} de ${MONTHS_ES[date.getMonth()]}`;
}

function getWeekDates(baseDate) {
  const d = new Date(baseDate);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const dd = new Date(monday);
    dd.setDate(monday.getDate() + i);
    dates.push(dd);
  }
  return dates;
}

const fonts = {
  heading: "'Fraunces', serif",
  body: "'DM Sans', sans-serif",
};
const C = {
  bg: "#FAF7F4", surface: "white", primary: "#9B4D42",
  primaryLight: "#F5E6E0", text: "#2D2420", textMuted: "#8A7E78",
  textFaint: "#B0A69E", border: "#E8DDD6", borderLight: "#E0D6CE",
};

function MealImage({ query, size = 120 }) {
  const [err, setErr] = useState(false);
  if (!query || err) return (
    <div style={{
      width: size, height: size, borderRadius: 16,
      background: "linear-gradient(135deg, #F5E6DC 0%, #E8D5C8 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.35, flexShrink: 0
    }}>🍽️</div>
  );
  const encoded = encodeURIComponent(query + " food dish plate");
  return (
    <div style={{
      width: size, height: size, borderRadius: 16, overflow: "hidden",
      background: "#F5E6DC", flexShrink: 0
    }}>
      <img
        src={`https://source.unsplash.com/featured/${size * 2}x${size * 2}/?${encoded}`}
        alt={query}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
        onError={() => setErr(true)}
      />
    </div>
  );
}

function Backdrop({ children, onClose }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(45,36,32,0.5)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
      animation: "fadeIn 0.2s ease"
    }} onClick={onClose}>{children}</div>
  );
}

function ModalSheet({ children }) {
  return (
    <div style={{
      background: C.bg, borderRadius: "24px 24px 0 0",
      width: "100%", maxWidth: 480, maxHeight: "92vh",
      overflow: "auto", animation: "slideUp 0.3s ease"
    }} onClick={e => e.stopPropagation()}>
      <div style={{ width: 40, height: 4, background: "#DDD", borderRadius: 4, margin: "14px auto 0" }} />
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════
   ADD MEAL — Step 1: name → Step 2: servings
   ══════════════════════════════════════════════ */
function AddMealModal({ isOpen, onClose, onSave, mealType }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [servings, setServings] = useState(2);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) { setStep(1); setName(""); setServings(2); setTimeout(() => inputRef.current?.focus(), 150); }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Backdrop onClose={onClose}>
      <ModalSheet>
        <div style={{ padding: "20px 24px 36px" }}>
          <h3 style={{ fontFamily: fonts.heading, fontSize: 22, fontWeight: 700, color: C.text, margin: "0 0 4px" }}>
            Agregar plato
          </h3>
          <p style={{ fontFamily: fonts.body, fontSize: 13, color: C.textMuted, margin: "0 0 24px" }}>
            {mealType?.icon} {mealType?.label}
          </p>

          {/* Progress bar */}
          <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
            {[1, 2].map(s => (
              <div key={s} style={{
                flex: 1, height: 4, borderRadius: 4,
                background: s <= step ? C.primary : C.border,
                transition: "background 0.3s"
              }} />
            ))}
          </div>

          {/* STEP 1 — Name */}
          {step === 1 && (
            <div style={{ animation: "fadeIn 0.2s ease" }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: C.textMuted, fontFamily: fonts.body, display: "block", marginBottom: 8 }}>
                ¿Qué vas a comer?
              </label>
              <input
                ref={inputRef}
                type="text" value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ej: Tarta de brócoli"
                style={{
                  width: "100%", padding: "14px 16px", fontSize: 16,
                  border: `2px solid ${C.border}`, borderRadius: 14,
                  fontFamily: fonts.body, outline: "none",
                  background: "white", boxSizing: "border-box",
                  transition: "border-color 0.2s"
                }}
                onFocus={e => e.target.style.borderColor = C.primary}
                onBlur={e => e.target.style.borderColor = C.border}
                onKeyDown={e => { if (e.key === "Enter" && name.trim()) setStep(2); }}
              />
              {name.trim() && (
                <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
                  <MealImage query={name} size={140} />
                </div>
              )}
              <button
                onClick={() => { if (name.trim()) setStep(2); }}
                disabled={!name.trim()}
                style={{
                  width: "100%", padding: "14px", marginTop: 20,
                  background: name.trim() ? C.primary : "#DDD",
                  color: "white", border: "none", borderRadius: 14,
                  fontSize: 15, fontWeight: 600,
                  cursor: name.trim() ? "pointer" : "default",
                  fontFamily: fonts.body, transition: "background 0.2s"
                }}
              >Siguiente →</button>
            </div>
          )}

          {/* STEP 2 — Servings */}
          {step === 2 && (
            <div style={{ animation: "fadeIn 0.2s ease" }}>
              <div style={{
                display: "flex", gap: 12, alignItems: "center",
                padding: 14, background: "white", borderRadius: 14,
                marginBottom: 24, border: `1px solid ${C.border}`
              }}>
                <MealImage query={name} size={52} />
                <div>
                  <div style={{ fontSize: 11, color: C.textFaint, fontFamily: fonts.body, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>
                    {mealType?.label}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: C.text, fontFamily: fonts.heading }}>{name}</div>
                </div>
              </div>

              <label style={{ fontSize: 13, fontWeight: 600, color: C.textMuted, fontFamily: fonts.body, display: "block", marginBottom: 12 }}>
                ¿Para cuántas personas?
              </label>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <button key={n} onClick={() => setServings(n)} style={{
                    width: 52, height: 52, borderRadius: 14,
                    border: servings === n ? `2px solid ${C.primary}` : `2px solid ${C.border}`,
                    background: servings === n ? C.primaryLight : "white",
                    color: servings === n ? C.primary : C.text,
                    fontSize: 18, fontWeight: 700, cursor: "pointer",
                    fontFamily: fonts.body, transition: "all 0.2s",
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>{n}</button>
                ))}
              </div>
              <p style={{ fontSize: 12, color: C.textFaint, fontFamily: fonts.body, margin: "0 0 24px" }}>
                👥 {servings} persona{servings !== 1 ? "s" : ""}
              </p>

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setStep(1)} style={{
                  flex: 1, padding: "14px", background: "white",
                  color: C.textMuted, border: `2px solid ${C.border}`,
                  borderRadius: 14, fontSize: 15, fontWeight: 600,
                  cursor: "pointer", fontFamily: fonts.body
                }}>← Atrás</button>
                <button onClick={() => onSave({ name: name.trim(), servings })} style={{
                  flex: 2, padding: "14px", background: C.primary, color: "white",
                  border: "none", borderRadius: 14, fontSize: 15, fontWeight: 600,
                  cursor: "pointer", fontFamily: fonts.body
                }}>✓ Agregar plato</button>
              </div>
            </div>
          )}
        </div>
      </ModalSheet>
    </Backdrop>
  );
}

/* ══════════════════════════════════════════════
   MEAL DETAIL — Tabs: Información | Compras
   ══════════════════════════════════════════════ */
function MealDetailModal({ isOpen, onClose, meal, onUpdateMeal }) {
  const [tab, setTab] = useState("info");
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(false);
  const [editText, setEditText] = useState("");
  const [groceryItems, setGroceryItems] = useState([]);
  const [newGrocery, setNewGrocery] = useState("");

  const prevOpen = useRef(false);
  const mealIdRef = useRef(null);
  useEffect(() => {
    // Only reset state when the modal FIRST opens (not on meal reference changes while open)
    const mealId = meal ? `${meal.name}-${meal.servings}` : null;
    if (isOpen && !prevOpen.current) {
      setTab("info");
      setRecipe(meal?.recipe || null);
      setEditingRecipe(false);
      setGroceryItems(meal?.grocery || []);
      if (meal?.recipe) setEditText(meal.recipe.ingredients.join("\n"));
      mealIdRef.current = mealId;
    }
    if (!isOpen && prevOpen.current) {
      setRecipe(null); setGroceryItems([]); setEditingRecipe(false);
      mealIdRef.current = null;
    }
    prevOpen.current = isOpen;
  }, [isOpen]);

  async function generateRecipe() {
    if (recipe || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: meal.name, servings: meal.servings || 2 })
      });
      const parsed = await res.json();
      if (parsed.error) throw new Error(parsed.error);
      setRecipe(parsed);
      setEditText(parsed.ingredients.join("\n"));
      const autoGrocery = parsed.ingredients.map((ing, i) => ({
        id: Date.now() + i, text: ing, checked: false
      }));
      setGroceryItems(autoGrocery);
      onUpdateMeal?.({ ...meal, recipe: parsed, grocery: autoGrocery });
    } catch {
      const fallback = {
        title: meal.name, time: "—",
        ingredients: ["No se pudo generar la receta"],
        steps: ["Intenta de nuevo más tarde"]
      };
      setRecipe(fallback);
      setEditText(fallback.ingredients.join("\n"));
    }
    setLoading(false);
  }

  function saveRecipeEdit() {
    const newIng = editText.split("\n").filter(l => l.trim());
    const updated = { ...recipe, ingredients: newIng };
    setRecipe(updated);
    setEditingRecipe(false);
    onUpdateMeal?.({ ...meal, recipe: updated });
  }

  function toggleGrocery(id) {
    const updated = groceryItems.map(it => it.id === id ? { ...it, checked: !it.checked } : it);
    setGroceryItems(updated);
    onUpdateMeal?.({ ...meal, grocery: updated });
  }

  function addGrocery() {
    if (!newGrocery.trim()) return;
    const updated = [...groceryItems, { id: Date.now(), text: newGrocery.trim(), checked: false }];
    setGroceryItems(updated);
    setNewGrocery("");
    onUpdateMeal?.({ ...meal, grocery: updated });
  }

  function removeGrocery(id) {
    const updated = groceryItems.filter(it => it.id !== id);
    setGroceryItems(updated);
    onUpdateMeal?.({ ...meal, grocery: updated });
  }

  if (!isOpen || !meal) return null;

  const unchecked = groceryItems.filter(i => !i.checked);
  const checked = groceryItems.filter(i => i.checked);

  return (
    <Backdrop onClose={onClose}>
      <ModalSheet>
        {/* Hero */}
        <div style={{ padding: "16px 24px 0", display: "flex", gap: 16, alignItems: "flex-start" }}>
          <MealImage query={meal.name} size={90} />
          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: fonts.heading, fontSize: 22, fontWeight: 700, color: C.text, margin: "0 0 6px" }}>
              {meal.name}
            </h2>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span style={{
                background: "#E6E3F0", color: "#6B5E9B", padding: "4px 10px",
                borderRadius: 8, fontSize: 12, fontFamily: fonts.body, fontWeight: 600
              }}>👥 {meal.servings} persona{meal.servings !== 1 ? "s" : ""}</span>
              {recipe?.time && recipe.time !== "—" && (
                <span style={{
                  background: "#E8EFE3", color: "#5C7A4F", padding: "4px 10px",
                  borderRadius: 8, fontSize: 12, fontFamily: fonts.body, fontWeight: 600
                }}>⏱ {recipe.time}</span>
              )}
              {recipe?.calories_per_person && (
                <span style={{
                  background: "#FFF3E0", color: "#E65100", padding: "4px 10px",
                  borderRadius: 8, fontSize: 12, fontFamily: fonts.body, fontWeight: 600
                }}>🔥 {recipe.calories_per_person} kcal/persona</span>
              )}
            </div>
          </div>
        </div>

        {/* Inner tabs */}
        <div style={{
          display: "flex", background: "#EDE5DD", borderRadius: 12,
          padding: 3, margin: "16px 24px 0"
        }}>
          {[
            { key: "info", label: "Información" },
            { key: "compras", label: `Compras${unchecked.length > 0 ? ` (${unchecked.length})` : ""}` },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              flex: 1, padding: "9px 8px", border: "none", borderRadius: 10,
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              fontFamily: fonts.body, transition: "all 0.2s",
              background: tab === t.key ? C.primary : "transparent",
              color: tab === t.key ? "white" : C.textMuted
            }}>{t.label}</button>
          ))}
        </div>

        {/* ─── INFO TAB ─── */}
        {tab === "info" && (
          <div style={{ padding: "20px 24px 32px", animation: "fadeIn 0.2s ease" }}>
            {!recipe && !loading && (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🧑‍🍳</div>
                <p style={{ fontFamily: fonts.body, fontSize: 14, color: C.textMuted, margin: "0 0 6px", lineHeight: 1.5 }}>
                  Genera la receta e ingredientes de este plato con inteligencia artificial
                </p>
                <p style={{ fontFamily: fonts.body, fontSize: 12, color: C.textFaint, margin: "0 0 20px" }}>
                  Ajustado para {meal.servings} persona{meal.servings !== 1 ? "s" : ""}
                </p>
                <button onClick={generateRecipe} style={{
                  padding: "14px 32px", background: C.primary, color: "white",
                  border: "none", borderRadius: 14, fontSize: 15, fontWeight: 600,
                  cursor: "pointer", fontFamily: fonts.body,
                  boxShadow: "0 4px 16px rgba(155,77,66,0.3)",
                  transition: "transform 0.2s"
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                >✨ Generar receta con IA</button>

                {/* Reference buttons in empty state too */}
                <div style={{ marginTop: 24 }}>
                  <p style={{ fontFamily: fonts.body, fontSize: 11, color: C.textFaint, margin: "0 0 10px", letterSpacing: 0.5, textTransform: "uppercase", fontWeight: 700 }}>🔗 Referencias</p>
                  <div style={{ display: "flex", gap: 10 }}>
                    <a
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(meal.name + " receta")}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{
                        flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        padding: "11px 10px", borderRadius: 12, background: "#FFF0F0",
                        border: "2px solid #FFCDD2", color: "#D32F2F", fontSize: 13,
                        fontWeight: 600, fontFamily: fonts.body, textDecoration: "none",
                        transition: "transform 0.15s"
                      }}
                    >▶ YouTube</a>
                    <a
                      href={`https://www.tiktok.com/search?q=${encodeURIComponent(meal.name + " receta")}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{
                        flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        padding: "11px 10px", borderRadius: 12, background: "#F0F0F0",
                        border: "2px solid #E0E0E0", color: "#111", fontSize: 13,
                        fontWeight: 600, fontFamily: fonts.body, textDecoration: "none",
                        transition: "transform 0.15s"
                      }}
                    >♪ TikTok</a>
                  </div>
                </div>
              </div>
            )}

            {loading && (
              <div style={{ textAlign: "center", padding: "40px 0", color: C.textMuted, fontFamily: fonts.body }}>
                <div style={{ fontSize: 40, marginBottom: 12, animation: "pulse 1.5s infinite" }}>🧑‍🍳</div>
                <p style={{ margin: 0 }}>Generando receta para {meal.servings} persona{meal.servings !== 1 ? "s" : ""}...</p>
              </div>
            )}

            {recipe && !loading && (
              <>
                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <h3 style={{ fontFamily: fonts.heading, fontSize: 17, fontWeight: 700, color: C.text, margin: 0 }}>
                      🥕 Ingredientes
                    </h3>
                    <button
                      onClick={() => { if (editingRecipe) saveRecipeEdit(); else { setEditText(recipe.ingredients.join("\n")); setEditingRecipe(true); } }}
                      style={{
                        background: editingRecipe ? C.primary : C.primaryLight,
                        color: editingRecipe ? "white" : C.primary,
                        border: "none", borderRadius: 10, padding: "6px 14px",
                        fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: fonts.body
                      }}
                    >{editingRecipe ? "✓ Guardar" : "✎ Editar"}</button>
                  </div>
                  {editingRecipe ? (
                    <textarea
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      style={{
                        width: "100%", minHeight: 140, padding: 12, fontSize: 14,
                        border: `2px solid ${C.primary}`, borderRadius: 12,
                        fontFamily: fonts.body, background: "white",
                        outline: "none", resize: "vertical", boxSizing: "border-box", lineHeight: 1.8
                      }}
                    />
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      {recipe.ingredients.map((ing, i) => (
                        <div key={i} style={{
                          display: "flex", gap: 10, alignItems: "center",
                          padding: "8px 12px", background: "white", borderRadius: 10,
                          fontSize: 14, fontFamily: fonts.body, color: C.text
                        }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#C4756A", flexShrink: 0 }} />
                          {ing}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h3 style={{ fontFamily: fonts.heading, fontSize: 17, fontWeight: 700, color: C.text, margin: "0 0 12px" }}>
                    👩‍🍳 Preparación
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {recipe.steps.map((s, i) => (
                      <div key={i} style={{
                        display: "flex", gap: 12, alignItems: "flex-start",
                        padding: "10px 12px", background: "white", borderRadius: 12
                      }}>
                        <span style={{
                          width: 26, height: 26, borderRadius: "50%",
                          background: C.primaryLight, color: C.primary,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 12, fontWeight: 700, flexShrink: 0, fontFamily: fonts.body
                        }}>{i + 1}</span>
                        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, fontFamily: fonts.body, color: C.text }}>{s}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reference buttons */}
                <div style={{ marginTop: 28 }}>
                  <h3 style={{
                    fontFamily: fonts.heading, fontSize: 17, fontWeight: 700,
                    color: C.text, margin: "0 0 12px"
                  }}>🔗 Referencias</h3>
                  <div style={{ display: "flex", gap: 10 }}>
                    <a
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(meal.name + " receta")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        flex: 1, display: "flex", alignItems: "center",
                        justifyContent: "center", gap: 8,
                        padding: "13px 12px", borderRadius: 14,
                        background: "#FFF0F0", border: "2px solid #FFCDD2",
                        color: "#D32F2F", fontSize: 14, fontWeight: 600,
                        fontFamily: fonts.body, textDecoration: "none",
                        transition: "transform 0.15s, box-shadow 0.15s",
                        cursor: "pointer"
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.03)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(211,47,47,0.15)"; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none"; }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#D32F2F">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      YouTube
                    </a>
                    <a
                      href={`https://www.tiktok.com/search?q=${encodeURIComponent(meal.name + " receta")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        flex: 1, display: "flex", alignItems: "center",
                        justifyContent: "center", gap: 8,
                        padding: "13px 12px", borderRadius: 14,
                        background: "#F0F0F0", border: "2px solid #E0E0E0",
                        color: "#111", fontSize: 14, fontWeight: 600,
                        fontFamily: fonts.body, textDecoration: "none",
                        transition: "transform 0.15s, box-shadow 0.15s",
                        cursor: "pointer"
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.03)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)"; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none"; }}
                    >
                      <svg width="18" height="20" viewBox="0 0 48 55" fill="none">
                        <path d="M33.3 0h8.4c-.2 4.8 1.5 8.3 4.3 11.1 2.8 2.8 6.4 4 10 4.3v8.3c-5.3-.3-9.7-2.2-13.3-5.3v23.2c0 2.9-.7 5.6-2.1 8.1a17.4 17.4 0 0 1-15.4 9.3c-3.5 0-6.7-1-9.5-2.8A17.4 17.4 0 0 1 8.1 34c1.5-2.5 3.6-4.5 6.2-5.8 2.5-1.3 5.3-2 8.2-1.9v8.5c-1.6-.2-3.2.1-4.6.8a8.4 8.4 0 0 0-3.2 3c-.8 1.3-1.1 2.8-1 4.3.3 3.6 3 6.6 6.6 7.1 4.8.6 8.8-3 8.8-7.7V0h4.2z" fill="#111"/>
                      </svg>
                      TikTok
                    </a>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ─── COMPRAS TAB ─── */}
        {tab === "compras" && (
          <div style={{ padding: "20px 24px 32px", animation: "fadeIn 0.2s ease" }}>
            {groceryItems.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
                <p style={{ fontFamily: fonts.body, fontSize: 14, color: C.textMuted, margin: "0 0 6px" }}>
                  Aún no hay lista de compras
                </p>
                <p style={{ fontFamily: fonts.body, fontSize: 12, color: C.textFaint, margin: "0 0 16px", lineHeight: 1.5 }}>
                  Genera la receta en "Información" para crear la lista automáticamente, o agrega items manualmente.
                </p>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <h3 style={{ fontFamily: fonts.heading, fontSize: 17, fontWeight: 700, color: C.text, margin: 0 }}>
                    🛒 Lo que necesitas
                  </h3>
                  <span style={{
                    background: C.primaryLight, color: C.primary,
                    padding: "4px 10px", borderRadius: 8, fontSize: 11,
                    fontWeight: 700, fontFamily: fonts.body
                  }}>{unchecked.length}/{groceryItems.length}</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {unchecked.map(item => (
                    <div key={item.id} style={{
                      display: "flex", gap: 10, alignItems: "center",
                      padding: "11px 14px", background: "white", borderRadius: 12,
                      boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
                    }}>
                      <div onClick={() => toggleGrocery(item.id)} style={{
                        width: 22, height: 22, borderRadius: 7,
                        border: "2px solid #D4C8C0", cursor: "pointer", flexShrink: 0
                      }} />
                      <span style={{ flex: 1, fontSize: 14, fontFamily: fonts.body, color: C.text }}>{item.text}</span>
                      <button onClick={() => removeGrocery(item.id)} style={{
                        background: "none", border: "none", color: "#CCC", fontSize: 18, cursor: "pointer", padding: "0 4px", lineHeight: 1
                      }}>×</button>
                    </div>
                  ))}
                </div>

                {checked.length > 0 && (
                  <>
                    <div style={{
                      fontSize: 11, fontWeight: 700, letterSpacing: 1.2,
                      color: C.textFaint, textTransform: "uppercase",
                      padding: "14px 0 6px", fontFamily: fonts.body
                    }}>Comprados ✓</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      {checked.map(item => (
                        <div key={item.id} style={{
                          display: "flex", gap: 10, alignItems: "center",
                          padding: "9px 14px", background: "white", borderRadius: 12, opacity: 0.5
                        }}>
                          <div onClick={() => toggleGrocery(item.id)} style={{
                            width: 22, height: 22, borderRadius: 7,
                            background: C.primary, border: `2px solid ${C.primary}`,
                            cursor: "pointer", display: "flex", alignItems: "center",
                            justifyContent: "center", flexShrink: 0, color: "white", fontSize: 11
                          }}>✓</div>
                          <span style={{
                            flex: 1, fontSize: 14, fontFamily: fonts.body,
                            color: C.textMuted, textDecoration: "line-through"
                          }}>{item.text}</span>
                          <button onClick={() => removeGrocery(item.id)} style={{
                            background: "none", border: "none", color: "#CCC", fontSize: 18, cursor: "pointer", padding: "0 4px", lineHeight: 1
                          }}>×</button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}

            {/* Add grocery input */}
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <input
                type="text" value={newGrocery}
                onChange={e => setNewGrocery(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") addGrocery(); }}
                placeholder="Agregar item..."
                style={{
                  flex: 1, padding: "12px 14px", fontSize: 14,
                  border: `2px solid ${C.border}`, borderRadius: 12,
                  fontFamily: fonts.body, outline: "none", background: "white",
                  transition: "border-color 0.2s"
                }}
                onFocus={e => e.target.style.borderColor = C.primary}
                onBlur={e => e.target.style.borderColor = C.border}
              />
              <button onClick={addGrocery} style={{
                width: 44, height: 44, borderRadius: 12,
                background: C.primary, color: "white", border: "none",
                fontSize: 22, cursor: "pointer", display: "flex",
                alignItems: "center", justifyContent: "center", flexShrink: 0
              }}>+</button>
            </div>
          </div>
        )}
      </ModalSheet>
    </Backdrop>
  );
}

/* ── Meal card ── */
function MealCard({ meal, color, onTap }) {
  return (
    <div onClick={onTap} style={{
      background: "white", borderRadius: 16, padding: 14,
      borderLeft: `4px solid ${color.border}`,
      cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s",
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      display: "flex", gap: 12, alignItems: "center"
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.02)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"; }}
    >
      <MealImage query={meal.name} size={60} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: 1.5,
          color: color.accent, textTransform: "uppercase", marginBottom: 3, fontFamily: fonts.body
        }}>{meal.typeLabel}</div>
        <div style={{
          fontSize: 15, fontWeight: 600, color: C.text, fontFamily: fonts.heading,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
        }}>{meal.name}</div>
        <div style={{ fontSize: 11, color: C.textFaint, fontFamily: fonts.body, marginTop: 2 }}>
          👥 {meal.servings} pers.{meal.grocery?.filter(g => !g.checked).length > 0 && (
            <span style={{ marginLeft: 8, color: C.primary }}>🛒 {meal.grocery.filter(g => !g.checked).length}</span>
          )}
        </div>
      </div>
      <div style={{ color: color.border, fontSize: 20, flexShrink: 0, fontWeight: 300 }}>›</div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN APP
   ══════════════════════════════════════════════ */
export default function MiMenu() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [meals, setMeals] = useState({});
  const [mealsLoaded, setMealsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("hoy");

  // Load meals from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("mi-menu-meals");
      if (saved) setMeals(JSON.parse(saved));
    } catch {}
    setMealsLoaded(true);
  }, []);

  // Save meals to localStorage on change
  useEffect(() => {
    if (mealsLoaded) {
      try { localStorage.setItem("mi-menu-meals", JSON.stringify(meals)); } catch {}
    }
  }, [meals, mealsLoaded]);
  const [addModal, setAddModal] = useState({ open: false, mealType: null });
  const [detailModal, setDetailModal] = useState({ open: false, meal: null, dateKey: null, mealKey: null });

  const weekDates = getWeekDates(selectedDate);
  const dateKey = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  const todayKey = dateKey(selectedDate);
  const todayMeals = meals[todayKey] || {};
  const dayOfWeek = selectedDate.getDay();
  const dayColor = DAY_COLORS[dayOfWeek];

  function saveMeal({ name, servings }) {
    const key = todayKey;
    const mealKey = addModal.mealType.key;
    setMeals(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [mealKey]: { name, servings, typeLabel: addModal.mealType.label, recipe: null, grocery: [] }
      }
    }));
    setAddModal({ open: false, mealType: null });
  }

  function updateMeal(dk, mk, updatedMeal) {
    setMeals(prev => ({ ...prev, [dk]: { ...prev[dk], [mk]: updatedMeal } }));
  }

  return (
    <div style={{
      maxWidth: 480, margin: "0 auto", minHeight: "100vh",
      background: C.bg, fontFamily: fonts.body, position: "relative"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:wght@400;600;700;900&display=swap');
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Header */}
      <div style={{
        background: "linear-gradient(180deg, #F0E6DC 0%, #FAF7F4 100%)",
        padding: "20px 20px 0", position: "sticky", top: 0, zIndex: 10
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h1 style={{ fontFamily: fonts.heading, fontSize: 28, fontWeight: 900, color: C.text, margin: 0 }}>Mi Menú</h1>
          <div style={{
            width: 38, height: 38, borderRadius: "50%", background: C.primary, color: "white",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 700, fontFamily: fonts.heading
          }}>?</div>
        </div>

        {/* Week nav */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: 8, padding: "0 2px"
        }}>
          <button onClick={() => {
            const prev = new Date(selectedDate);
            prev.setDate(prev.getDate() - 7);
            setSelectedDate(prev);
          }} style={{
            background: "none", border: "none", fontSize: 18, color: C.primary,
            cursor: "pointer", padding: "4px 8px", fontWeight: 700, fontFamily: fonts.body
          }}>‹</button>
          <span style={{
            fontSize: 13, fontWeight: 600, color: C.textMuted, fontFamily: fonts.body
          }}>
            {weekDates[0].getDate()} {MONTHS_ES[weekDates[0].getMonth()].slice(0, 3)} — {weekDates[6].getDate()} {MONTHS_ES[weekDates[6].getMonth()].slice(0, 3)}
          </span>
          <button onClick={() => {
            const next = new Date(selectedDate);
            next.setDate(next.getDate() + 7);
            setSelectedDate(next);
          }} style={{
            background: "none", border: "none", fontSize: 18, color: C.primary,
            cursor: "pointer", padding: "4px 8px", fontWeight: 700, fontFamily: fonts.body
          }}>›</button>
        </div>

        {/* Week strip */}
        <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
          {weekDates.map((d, i) => {
            const isSelected = dateKey(d) === dateKey(selectedDate);
            const isToday = dateKey(d) === dateKey(today);
            return (
              <div key={i} onClick={() => setSelectedDate(d)} style={{
                flex: 1, textAlign: "center", padding: "8px 4px", borderRadius: 14,
                cursor: "pointer", background: isSelected ? C.primary : "transparent", transition: "all 0.2s"
              }}>
                <div style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: 1,
                  color: isSelected ? "rgba(255,255,255,0.7)" : C.textFaint,
                  textTransform: "uppercase", marginBottom: 4
                }}>{"LMXJVSD"[i]}</div>
                <div style={{
                  fontSize: 17, fontWeight: 700, fontFamily: fonts.body,
                  color: isSelected ? "white" : isToday ? C.primary : C.text
                }}>{d.getDate()}</div>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", background: "#EDE5DD", borderRadius: 14, padding: 3, marginBottom: 16 }}>
          {[{ key: "hoy", label: "Hoy" }, { key: "semana", label: "Semana" }].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              flex: 1, padding: "10px 8px", border: "none", borderRadius: 12,
              fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: fonts.body,
              background: activeTab === tab.key ? C.primary : "transparent",
              color: activeTab === tab.key ? "white" : C.textMuted, transition: "all 0.2s"
            }}>{tab.label}</button>
          ))}
        </div>
      </div>

      {/* HOY */}
      {activeTab === "hoy" && (
        <div style={{ padding: "0 20px 100px", animation: "fadeIn 0.3s ease" }}>
          <div style={{
            background: dayColor.bg, borderRadius: 20, padding: 20,
            marginBottom: 16, borderLeft: `5px solid ${dayColor.border}`
          }}>
            <h2 style={{ fontFamily: fonts.heading, fontSize: 26, fontWeight: 700, color: C.text, margin: "0 0 4px" }}>
              {DAYS_ES[dayOfWeek]}
            </h2>
            <p style={{ fontFamily: fonts.body, fontSize: 14, color: dayColor.accent, margin: 0, fontWeight: 500 }}>
              {formatDate(selectedDate)}
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {MEAL_TYPES.map(mt => {
              const meal = todayMeals[mt.key];
              return (
                <div key={mt.key}>
                  {meal ? (
                    <MealCard
                      meal={{ ...meal, typeLabel: mt.label }}
                      color={dayColor}
                      onTap={() => setDetailModal({ open: true, meal, dateKey: todayKey, mealKey: mt.key })}
                    />
                  ) : (
                    <div
                      onClick={() => setAddModal({ open: true, mealType: mt })}
                      style={{
                        background: "white", borderRadius: 16, padding: "16px 14px",
                        border: "2px dashed #E0D6CE", cursor: "pointer",
                        display: "flex", gap: 12, alignItems: "center", transition: "border-color 0.2s"
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = dayColor.border}
                      onMouseLeave={e => e.currentTarget.style.borderColor = "#E0D6CE"}
                    >
                      <div style={{
                        width: 48, height: 48, borderRadius: 14, background: "#F5F0EB",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20
                      }}>{mt.icon}</div>
                      <div>
                        <div style={{
                          fontSize: 10, fontWeight: 700, letterSpacing: 1.5,
                          color: C.textFaint, textTransform: "uppercase", marginBottom: 2
                        }}>{mt.label}</div>
                        <div style={{ fontSize: 14, color: "#C4B8AE", fontFamily: fonts.body }}>¿Qué vas a comer?</div>
                      </div>
                      <div style={{
                        marginLeft: "auto", width: 32, height: 32, borderRadius: 10,
                        background: dayColor.bg, color: dayColor.accent,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 18, fontWeight: 700
                      }}>+</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SEMANA */}
      {activeTab === "semana" && (
        <div style={{ padding: "0 20px 100px", animation: "fadeIn 0.3s ease" }}>
          <p style={{ fontFamily: fonts.body, fontSize: 13, color: C.textFaint, margin: "0 0 16px", fontWeight: 600 }}>
            {weekDates[0].getDate()} {MONTHS_ES[weekDates[0].getMonth()].slice(0, 3)} — {weekDates[6].getDate()} {MONTHS_ES[weekDates[6].getMonth()].slice(0, 3)}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {weekDates.map((d, i) => {
              const dk = dateKey(d);
              const dm = meals[dk] || {};
              const dc = DAY_COLORS[d.getDay()];
              return (
                <div key={i} style={{
                  background: "white", borderRadius: 16, padding: 14,
                  borderLeft: `4px solid ${dc.border}`,
                  boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
                  gridColumn: i === 6 ? "1 / -1" : "auto",
                  cursor: "pointer", transition: "transform 0.15s"
                }}
                  onClick={() => { setSelectedDate(d); setActiveTab("hoy"); }}
                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                >
                  <div style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 15, color: C.text, marginBottom: 6 }}>
                    {DAYS_ES[d.getDay()]}
                  </div>
                  {MEAL_TYPES.map(mt => (
                    <div key={mt.key} style={{
                      fontSize: 12, color: dm[mt.key] ? C.text : "#CCC",
                      fontFamily: fonts.body, marginBottom: 2, lineHeight: 1.4
                    }}>
                      <strong style={{ color: dc.accent }}>
                        {mt.label.charAt(0) + mt.label.slice(1).toLowerCase()}:
                      </strong>{" "}
                      {dm[mt.key]?.name || "—"}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FAB */}
      {activeTab === "hoy" && (
        <button
          onClick={() => {
            const first = MEAL_TYPES.find(mt => !todayMeals[mt.key]);
            if (first) setAddModal({ open: true, mealType: first });
          }}
          style={{
            position: "fixed", bottom: 24, right: 24,
            width: 56, height: 56, borderRadius: "50%",
            background: C.primary, color: "white", border: "none",
            fontSize: 28, cursor: "pointer",
            boxShadow: "0 4px 20px rgba(155,77,66,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "transform 0.2s", zIndex: 50
          }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        >+</button>
      )}

      {/* Modals */}
      <AddMealModal
        isOpen={addModal.open}
        onClose={() => setAddModal({ open: false, mealType: null })}
        onSave={saveMeal}
        mealType={addModal.mealType}
      />
      <MealDetailModal
        isOpen={detailModal.open}
        onClose={() => setDetailModal({ open: false, meal: null, dateKey: null, mealKey: null })}
        meal={detailModal.meal}
        onUpdateMeal={(updated) => {
          if (detailModal.dateKey && detailModal.mealKey) {
            updateMeal(detailModal.dateKey, detailModal.mealKey, updated);
            setDetailModal(prev => ({ ...prev, meal: updated }));
          }
        }}
      />
    </div>
  );
}
