"use client";
import { useState, useEffect, useRef } from "react";

const DAYS_ES = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
const MONTHS_ES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
const DAY_COLORS = [
  {bg:"#F5E6E0",border:"#C4756A",accent:"#9B4D42"},
  {bg:"#E8EFE3",border:"#8BA87E",accent:"#5C7A4F"},
  {bg:"#E6E3F0",border:"#9B8EC4",accent:"#6B5E9B"},
  {bg:"#FFF3E0",border:"#D4A056",accent:"#A67B3D"},
  {bg:"#E0ECF0",border:"#6A9BB5",accent:"#3D7A9B"},
  {bg:"#F0E6EE",border:"#B56A9B",accent:"#8A3D73"},
  {bg:"#F0EDE0",border:"#A89B6A",accent:"#7A6E3D"},
];
const MEAL_TYPES = [
  {key:"desayuno",label:"DESAYUNO",icon:"☀️"},
  {key:"almuerzo",label:"ALMUERZO",icon:"🍽️"},
  {key:"cena",label:"CENA",icon:"🌙"},
];
const SERVING_OPTIONS = [1,2,3,4,5,6,8,10];

function formatDate(d){return `${d.getDate()} de ${MONTHS_ES[d.getMonth()]}`}
function getWeekDates(base){
  const d=new Date(base);const day=d.getDay();
  const diff=d.getDate()-day+(day===0?-6:1);
  const mon=new Date(d.setDate(diff));const dates=[];
  for(let i=0;i<7;i++){const dd=new Date(mon);dd.setDate(mon.getDate()+i);dates.push(dd)}
  return dates;
}
function getMondayOfWeek(date){
  const d=new Date(date);const day=d.getDay();
  const diff=d.getDate()-day+(day===0?-6:1);
  return new Date(d.setDate(diff));
}
function dkey(d){return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`}

const F={heading:"'Fraunces', serif",body:"'DM Sans', sans-serif"};
const C={bg:"#FAF7F4",surface:"white",primary:"#9B4D42",primaryLight:"#F5E6E0",
  text:"#2D2420",textMuted:"#8A7E78",textFaint:"#B0A69E",border:"#E8DDD6"};

/* ── Shared ── */
function MealImage({query,size=120}){
  const [err,setErr]=useState(false);
  if(!query||err) return <div style={{width:size,height:size,borderRadius:16,background:"linear-gradient(135deg,#F5E6DC,#E8D5C8)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.35,flexShrink:0}}>🍽️</div>;
  return <div style={{width:size,height:size,borderRadius:16,overflow:"hidden",background:"#F5E6DC",flexShrink:0}}>
    <img src={`https://source.unsplash.com/featured/${size*2}x${size*2}/?${encodeURIComponent(query+" food dish")}`} alt={query} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={()=>setErr(true)}/>
  </div>;
}

function Overlay({children,onClose}){
  return <div style={{position:"fixed",inset:0,zIndex:100,background:"rgba(45,36,32,0.5)",backdropFilter:"blur(8px)",display:"flex",alignItems:"flex-end",justifyContent:"center",animation:"fadeIn 0.2s ease"}} onClick={onClose}>{children}</div>;
}
function Sheet({children,onClose}){
  return <div style={{background:C.bg,borderRadius:"24px 24px 0 0",width:"100%",maxWidth:480,maxHeight:"92vh",overflow:"auto",animation:"slideUp 0.3s ease"}} onClick={e=>e.stopPropagation()}>
    <div onClick={onClose} style={{padding:"14px 0 0",cursor:"pointer",display:"flex",justifyContent:"center"}}>
      <div style={{width:40,height:4,background:"#CCC",borderRadius:4}}/>
    </div>
    {children}
  </div>;
}
function RefButtons({name}){
  const q=encodeURIComponent(name+" receta");
  return <div style={{display:"flex",gap:10}}>
    <a href={`https://www.youtube.com/results?search_query=${q}`} target="_blank" rel="noopener noreferrer" style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"12px",borderRadius:14,background:"#FFF0F0",border:"2px solid #FFCDD2",color:"#D32F2F",fontSize:13,fontWeight:600,fontFamily:F.body,textDecoration:"none"}}>▶ YouTube</a>
    <a href={`https://www.tiktok.com/search?q=${q}`} target="_blank" rel="noopener noreferrer" style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"12px",borderRadius:14,background:"#F0F0F0",border:"2px solid #E0E0E0",color:"#111",fontSize:13,fontWeight:600,fontFamily:F.body,textDecoration:"none"}}>♪ TikTok</a>
  </div>;
}
function TextArea({value,onChange,placeholder,rows=3}){
  return <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} style={{width:"100%",padding:12,fontSize:14,border:`2px solid ${C.border}`,borderRadius:12,fontFamily:F.body,outline:"none",background:C.surface,resize:"vertical",boxSizing:"border-box",lineHeight:1.7,transition:"border-color 0.2s"}} onFocus={e=>e.target.style.borderColor=C.primary} onBlur={e=>e.target.style.borderColor=C.border}/>;
}
function Input({value,onChange,placeholder,inputRef,onKeyDown,type="text"}){
  return <input ref={inputRef} type={type} value={value} onChange={onChange} placeholder={placeholder} onKeyDown={onKeyDown} style={{width:"100%",padding:"13px 16px",fontSize:16,border:`2px solid ${C.border}`,borderRadius:14,fontFamily:F.body,outline:"none",background:C.bg,boxSizing:"border-box",transition:"border-color 0.2s"}} onFocus={e=>e.target.style.borderColor=C.primary} onBlur={e=>e.target.style.borderColor=C.border}/>;
}

/* ═══════════════════════════════════════════
   ADD MEAL MODAL
   ═══════════════════════════════════════════ */
function AddMealModal({isOpen,onClose,onSave,mealType,recipes}){
  const [mode,setMode]=useState("choose");
  const [step,setStep]=useState(1);
  const [name,setName]=useState("");
  const [servings,setServings]=useState(null);
  const [selRecipe,setSelRecipe]=useState(null);
  const ref=useRef(null);
  useEffect(()=>{
    if(isOpen){setMode(recipes.length>0?"choose":"new");setStep(1);setName("");setServings(null);setSelRecipe(null);setTimeout(()=>ref.current?.focus(),150)}
  },[isOpen]);
  if(!isOpen) return null;
  const canNext=mode==="choose"?!!selRecipe:!!name.trim();
  const mealName=mode==="choose"?selRecipe?.name:name.trim();
  return <Overlay onClose={onClose}><Sheet onClose={onClose}>
    <div style={{padding:"16px 24px 36px"}}>
      <div style={{display:"flex",gap:6,marginBottom:14,justifyContent:"center"}}>
        {[1,2].map(s=><div key={s} style={{width:s===step?28:8,height:8,borderRadius:4,background:s<=step?C.primary:"#E0D6CE",transition:"all 0.3s"}}/>)}
      </div>
      {step===1&&<>
        <h3 style={{fontFamily:F.heading,fontSize:21,fontWeight:700,color:C.text,margin:"0 0 4px"}}>¿Qué vas a comer?</h3>
        <p style={{fontFamily:F.body,fontSize:13,color:C.textMuted,margin:"0 0 14px"}}>{mealType?.icon} {mealType?.label}</p>
        <div style={{display:"flex",background:"#EDE5DD",borderRadius:12,padding:3,marginBottom:14}}>
          {[{k:"choose",l:"Mis recetas"},{k:"new",l:"Nuevo plato"}].map(t=>
            <button key={t.k} onClick={()=>{setMode(t.k);setSelRecipe(null);setName("")}} style={{flex:1,padding:"8px",border:"none",borderRadius:10,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:F.body,background:mode===t.k?C.primary:"transparent",color:mode===t.k?"white":C.textMuted,transition:"all 0.2s"}}>{t.l}</button>
          )}
        </div>
        {mode==="choose"&&<>{recipes.length===0?<div style={{textAlign:"center",padding:"16px 0"}}>
          <p style={{fontFamily:F.body,fontSize:14,color:C.textMuted,margin:"0 0 10px"}}>No tenés recetas guardadas</p>
          <button onClick={()=>setMode("new")} style={{padding:"10px 20px",background:C.primaryLight,color:C.primary,border:"none",borderRadius:12,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:F.body}}>+ Crear plato nuevo</button>
        </div>:<div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:240,overflow:"auto"}}>
          {recipes.map(r=><div key={r.id} onClick={()=>setSelRecipe(r)} style={{display:"flex",gap:10,alignItems:"center",padding:"10px 12px",background:selRecipe?.id===r.id?C.primaryLight:C.surface,border:`2px solid ${selRecipe?.id===r.id?C.primary:C.border}`,borderRadius:12,cursor:"pointer",transition:"all 0.15s"}}>
            <MealImage query={r.name} size={40}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:14,fontWeight:600,color:C.text,fontFamily:F.body,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.name}</div>
              {r.calories&&<div style={{fontSize:11,color:"#E65100",fontFamily:F.body}}>🔥 {r.calories} kcal</div>}
            </div>
            {selRecipe?.id===r.id&&<span style={{color:C.primary,fontWeight:700,fontSize:16}}>✓</span>}
          </div>)}
        </div>}</>}
        {mode==="new"&&<>
          <Input inputRef={ref} value={name} onChange={e=>setName(e.target.value)} placeholder="Ej: Tortilla de papas" onKeyDown={e=>{if(e.key==="Enter"&&name.trim())setStep(2)}}/>
          {name.trim()&&<div style={{marginTop:12,display:"flex",justifyContent:"center"}}><MealImage query={name} size={110}/></div>}
        </>}
        {canNext&&<button onClick={()=>setStep(2)} style={{width:"100%",marginTop:14,padding:14,background:C.primary,color:"white",border:"none",borderRadius:14,fontSize:15,fontWeight:600,cursor:"pointer",fontFamily:F.body}}>Siguiente →</button>}
      </>}
      {step===2&&<>
        <h3 style={{fontFamily:F.heading,fontSize:21,fontWeight:700,color:C.text,margin:"0 0 4px"}}>¿Para cuántas personas?</h3>
        <p style={{fontFamily:F.body,fontSize:13,color:C.textMuted,margin:"0 0 18px"}}>🍽️ {mealName}</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
          {SERVING_OPTIONS.map(n=><button key={n} onClick={()=>setServings(n)} style={{padding:"14px 8px",border:`2px solid ${servings===n?C.primary:C.border}`,borderRadius:14,background:servings===n?C.primaryLight:"white",cursor:"pointer",transition:"all 0.2s",display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
            <span style={{fontSize:20,fontWeight:800,color:servings===n?C.primary:C.text,fontFamily:F.body}}>{n}</span>
            <span style={{fontSize:10,color:C.textMuted,fontFamily:F.body}}>pers.</span>
          </button>)}
        </div>
        <div style={{display:"flex",gap:10,marginTop:20}}>
          <button onClick={()=>setStep(1)} style={{flex:1,padding:14,background:C.primaryLight,color:C.primary,border:"none",borderRadius:14,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:F.body}}>← Atrás</button>
          <button onClick={()=>{if(servings)onSave({name:mealName,servings,recipeId:selRecipe?.id||null})}} disabled={!servings} style={{flex:2,padding:14,background:servings?C.primary:"#DDD",color:"white",border:"none",borderRadius:14,fontSize:15,fontWeight:600,cursor:servings?"pointer":"default",fontFamily:F.body}}>Guardar ✓</button>
        </div>
      </>}
    </div>
  </Sheet></Overlay>;
}

/* ═══════════════════════════════════════════
   MEAL DETAIL MODAL
   ═══════════════════════════════════════════ */
function MealDetailModal({isOpen,onClose,meal,mealKey,linkedRecipe,onEditRecipe,onCreateRecipe,onChangeMeal}){
  const [tab,setTab]=useState("info");
  const [groceryItems,setGroceryItems]=useState([]);
  const [newG,setNewG]=useState("");
  const [editIngredients,setEditIngredients]=useState("");
  const [editSteps,setEditSteps]=useState("");
  const [editing,setEditing]=useState(false);
  const [aiLoading,setAiLoading]=useState(false);
  const prevRecipeId=useRef(null);

  useEffect(()=>{
    if(!isOpen){setTab("info");setGroceryItems([]);setNewG("");setEditing(false);setAiLoading(false);prevRecipeId.current=null;return}
    const rid=linkedRecipe?.id||null;
    if(rid!==prevRecipeId.current){
      if(linkedRecipe?.ingredients){
        setGroceryItems(linkedRecipe.ingredients.split("\n").filter(l=>l.trim()).map((t,i)=>({id:Date.now()+i,text:t.trim(),checked:false})));
        setEditIngredients(linkedRecipe.ingredients);
        setEditSteps(linkedRecipe.steps||"");
      } else {setGroceryItems([]);setEditIngredients("");setEditSteps("")}
      prevRecipeId.current=rid;
    }
  },[isOpen,linkedRecipe]);

  if(!isOpen||!meal) return null;

  const toggleG=id=>setGroceryItems(p=>p.map(i=>i.id===id?{...i,checked:!i.checked}:i));
  const removeG=id=>setGroceryItems(p=>p.filter(i=>i.id!==id));
  const addG=()=>{if(!newG.trim())return;setGroceryItems(p=>[...p,{id:Date.now(),text:newG.trim(),checked:false}]);setNewG("")};
  const unchecked=groceryItems.filter(i=>!i.checked);
  const checked=groceryItems.filter(i=>i.checked);
  const ingredientsList=linkedRecipe?.ingredients?linkedRecipe.ingredients.split("\n").filter(l=>l.trim()):[];

  return <Overlay onClose={onClose}><Sheet onClose={onClose}>
    <div style={{padding:"12px 24px 0",display:"flex",gap:14,alignItems:"flex-start"}}>
      <MealImage query={meal.name} size={80}/>
      <div style={{flex:1}}>
        <h2 style={{fontFamily:F.heading,fontSize:20,fontWeight:700,color:C.text,margin:"0 0 6px"}}>{meal.name}</h2>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          <span style={{background:"#E6E3F0",color:"#6B5E9B",padding:"3px 9px",borderRadius:8,fontSize:11,fontFamily:F.body,fontWeight:600}}>👥 {meal.servings} pers.</span>
          {linkedRecipe&&<span style={{background:"#E8EFE3",color:"#5C7A4F",padding:"3px 9px",borderRadius:8,fontSize:11,fontFamily:F.body,fontWeight:600}}>📋 Receta</span>}
          {linkedRecipe?.calories&&<span style={{background:"#FFF3E0",color:"#E65100",padding:"3px 9px",borderRadius:8,fontSize:11,fontFamily:F.body,fontWeight:600}}>🔥 {linkedRecipe.calories} kcal</span>}
        </div>
      </div>
    </div>

    <div style={{display:"flex",background:"#EDE5DD",borderRadius:12,padding:3,margin:"12px 24px 0"}}>
      {[{k:"info",l:"Información"},{k:"compras",l:`Compras${unchecked.length?` (${unchecked.length})`:""}` }].map(t=>
        <button key={t.k} onClick={()=>setTab(t.k)} style={{flex:1,padding:"9px",border:"none",borderRadius:10,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:F.body,background:tab===t.k?C.primary:"transparent",color:tab===t.k?"white":C.textMuted,transition:"all 0.2s"}}>{t.l}</button>
      )}
    </div>

    {tab==="info"&&<div style={{padding:"16px 24px 32px"}}>
      {linkedRecipe?<>
        {!editing?<>
          {linkedRecipe.description&&<div style={{background:C.surface,padding:14,borderRadius:12,marginBottom:16}}>
            <p style={{fontFamily:F.body,fontSize:14,color:C.text,lineHeight:1.6,margin:0}}>{linkedRecipe.description}</p>
          </div>}
          {ingredientsList.length>0&&<>
            <h3 style={{fontFamily:F.heading,fontSize:17,fontWeight:700,color:C.text,margin:"0 0 10px"}}>🥕 Ingredientes</h3>
            <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:20}}>
              {ingredientsList.map((ing,i)=><div key={i} style={{display:"flex",gap:10,alignItems:"center",padding:"8px 12px",background:C.surface,borderRadius:10,fontSize:14,fontFamily:F.body,color:C.text}}>
                <span style={{width:6,height:6,borderRadius:"50%",background:"#C4756A",flexShrink:0}}/>{ing}
              </div>)}
            </div>
          </>}
          {linkedRecipe.steps&&<>
            <h3 style={{fontFamily:F.heading,fontSize:17,fontWeight:700,color:C.text,margin:"0 0 10px"}}>👩‍🍳 Preparación</h3>
            <div style={{background:C.surface,padding:14,borderRadius:12,marginBottom:20}}>
              <p style={{fontFamily:F.body,fontSize:14,color:C.text,lineHeight:1.7,margin:0,whiteSpace:"pre-wrap"}}>{linkedRecipe.steps}</p>
            </div>
          </>}
          <button onClick={()=>{setEditing(true);setEditIngredients(linkedRecipe.ingredients||"");setEditSteps(linkedRecipe.steps||"")}} style={{width:"100%",padding:12,background:C.primaryLight,color:C.primary,border:"none",borderRadius:12,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:F.body,marginBottom:16}}>✎ Editar receta</button>
        </>:<>
          <h3 style={{fontFamily:F.heading,fontSize:16,fontWeight:700,color:C.text,margin:"0 0 8px"}}>🥕 Ingredientes</h3>
          <p style={{fontFamily:F.body,fontSize:11,color:C.textFaint,margin:"0 0 6px"}}>Un ingrediente por línea</p>
          <TextArea value={editIngredients} onChange={e=>setEditIngredients(e.target.value)} placeholder={"200g de harina\n3 huevos"} rows={5}/>
          <h3 style={{fontFamily:F.heading,fontSize:16,fontWeight:700,color:C.text,margin:"16px 0 8px"}}>👩‍🍳 Preparación</h3>
          <TextArea value={editSteps} onChange={e=>setEditSteps(e.target.value)} placeholder="Pasos de preparación..." rows={5}/>
          <div style={{display:"flex",gap:10,marginTop:14}}>
            <button onClick={()=>setEditing(false)} style={{flex:1,padding:12,background:C.primaryLight,color:C.primary,border:"none",borderRadius:12,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:F.body}}>Cancelar</button>
            <button onClick={()=>{onEditRecipe(linkedRecipe.id,{ingredients:editIngredients,steps:editSteps});setEditing(false)}} style={{flex:2,padding:12,background:C.primary,color:"white",border:"none",borderRadius:12,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:F.body}}>✓ Guardar</button>
          </div>
        </>}
      </>:<>
        <div style={{textAlign:"center",padding:"20px 0"}}>
          <div style={{fontSize:36,marginBottom:8}}>📝</div>
          <p style={{fontFamily:F.body,fontSize:14,color:C.textMuted,margin:"0 0 16px",lineHeight:1.5}}>Este plato no tiene receta vinculada</p>
          <button onClick={async()=>{
            if(aiLoading)return;setAiLoading(true);
            try{
              const res=await fetch("/api/recipe",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:meal.name,servings:meal.servings||4})});
              const data=await res.json();
              if(data.error)throw new Error(data.error);
              onCreateRecipe(meal,mealKey,{name:meal.name,description:data.description||"",ingredients:data.ingredients||"",steps:data.steps||"",calories:data.calories_per_person||null});
            }catch(e){alert("No se pudo generar: "+e.message)}
            setAiLoading(false);
          }} disabled={aiLoading} style={{width:"100%",padding:14,background:aiLoading?"#EDE5DD":"linear-gradient(135deg,#9B4D42,#C4756A)",color:aiLoading?C.textMuted:"white",border:"none",borderRadius:14,fontSize:15,fontWeight:600,cursor:aiLoading?"default":"pointer",fontFamily:F.body,marginBottom:10,boxShadow:aiLoading?"none":"0 3px 12px rgba(155,77,66,0.25)"}}>
            {aiLoading?"⏳ Generando receta...":"✨ Generar receta con IA"}
          </button>
          <button onClick={()=>onCreateRecipe(meal,mealKey,{name:meal.name,description:"",ingredients:"",steps:"",calories:null})} style={{width:"100%",padding:12,background:C.primaryLight,color:C.primary,border:"none",borderRadius:12,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:F.body}}>
            ✎ Crear receta manualmente
          </button>
        </div>
      </>}

      <h3 style={{fontFamily:F.heading,fontSize:17,fontWeight:700,color:C.text,margin:"8px 0 10px"}}>🔗 Buscar referencias</h3>
      <RefButtons name={meal.name}/>

      <button onClick={()=>onChangeMeal(mealKey)} style={{width:"100%",marginTop:20,padding:12,background:"#FFF3E0",color:"#A67B3D",border:"2px solid #E8D5B0",borderRadius:12,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:F.body}}>🔄 Cambiar plato</button>
    </div>}

    {tab==="compras"&&<div style={{padding:"16px 24px 32px"}}>
      {groceryItems.length===0?<div style={{textAlign:"center",padding:"16px 0",marginBottom:10}}>
        <div style={{fontSize:36,marginBottom:8}}>🛒</div>
        <p style={{fontFamily:F.body,fontSize:14,color:C.textMuted,margin:0}}>{linkedRecipe?"No hay ingredientes en la receta":"Agregá items manualmente"}</p>
      </div>:<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <h3 style={{fontFamily:F.heading,fontSize:17,fontWeight:700,color:C.text,margin:0}}>Lista de compras</h3>
        <span style={{background:C.primaryLight,color:C.primary,padding:"4px 10px",borderRadius:8,fontSize:12,fontFamily:F.body,fontWeight:600}}>{unchecked.length} pend.</span>
      </div>}
      <div style={{display:"flex",gap:8,marginBottom:12}}>
        <input type="text" value={newG} onChange={e=>setNewG(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")addG()}} placeholder="Agregar item..." style={{flex:1,padding:"11px 14px",fontSize:14,border:`2px solid ${C.border}`,borderRadius:12,fontFamily:F.body,outline:"none",background:"white",boxSizing:"border-box"}} onFocus={e=>e.target.style.borderColor=C.primary} onBlur={e=>e.target.style.borderColor=C.border}/>
        <button onClick={addG} style={{width:42,height:42,borderRadius:12,background:C.primary,color:"white",border:"none",fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>+</button>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:5}}>
        {unchecked.map(it=><div key={it.id} style={{display:"flex",gap:10,alignItems:"center",padding:"11px 14px",background:C.bg,borderRadius:12}}>
          <div onClick={()=>toggleG(it.id)} style={{width:22,height:22,borderRadius:7,border:"2px solid #D4C8C0",cursor:"pointer",flexShrink:0}}/>
          <span style={{flex:1,fontSize:14,fontFamily:F.body,color:C.text}}>{it.text}</span>
          <button onClick={()=>removeG(it.id)} style={{background:"none",border:"none",color:"#CCC",fontSize:18,cursor:"pointer",padding:"0 4px"}}>×</button>
        </div>)}
      </div>
      {checked.length>0&&<>
        <div style={{fontSize:11,fontWeight:700,letterSpacing:1.2,color:C.textFaint,textTransform:"uppercase",padding:"14px 0 6px",fontFamily:F.body}}>✓ Comprados ({checked.length})</div>
        <div style={{display:"flex",flexDirection:"column",gap:4}}>
          {checked.map(it=><div key={it.id} style={{display:"flex",gap:10,alignItems:"center",padding:"9px 14px",background:C.bg,borderRadius:12,opacity:0.5}}>
            <div onClick={()=>toggleG(it.id)} style={{width:22,height:22,borderRadius:7,background:C.primary,border:`2px solid ${C.primary}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:"white",fontSize:11}}>✓</div>
            <span style={{flex:1,fontSize:14,fontFamily:F.body,color:C.textMuted,textDecoration:"line-through"}}>{it.text}</span>
            <button onClick={()=>removeG(it.id)} style={{background:"none",border:"none",color:"#CCC",fontSize:18,cursor:"pointer",padding:"0 4px"}}>×</button>
          </div>)}
        </div>
      </>}
    </div>}
  </Sheet></Overlay>;
}

/* ═══════════════════════════════════════════
   RECIPE MODAL (create/edit)
   ═══════════════════════════════════════════ */
function RecipeModal({isOpen,onClose,onSave,existing}){
  const [name,setName]=useState("");
  const [desc,setDesc]=useState("");
  const [ingredients,setIngredients]=useState("");
  const [steps,setSteps]=useState("");
  const [calories,setCalories]=useState("");
  const [aiLoading,setAiLoading]=useState(false);
  const ref=useRef(null);
  useEffect(()=>{
    if(isOpen){
      setName(existing?.name||"");setDesc(existing?.description||"");
      setIngredients(existing?.ingredients||"");setSteps(existing?.steps||"");
      setCalories(existing?.calories?String(existing.calories):"");
      setAiLoading(false);setTimeout(()=>ref.current?.focus(),150);
    }
  },[isOpen]);
  async function generateWithAI(){
    if(!name.trim()||aiLoading)return;setAiLoading(true);
    try{
      const res=await fetch("/api/recipe",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:name.trim(),servings:4})});
      const data=await res.json();if(data.error)throw new Error(data.error);
      if(data.description)setDesc(data.description);
      if(data.ingredients)setIngredients(data.ingredients);
      if(data.steps)setSteps(data.steps);
      if(data.calories_per_person)setCalories(String(data.calories_per_person));
    }catch(e){alert("No se pudo generar: "+e.message)}
    setAiLoading(false);
  }
  if(!isOpen)return null;
  return <Overlay onClose={onClose}><Sheet onClose={onClose}>
    <div style={{padding:"16px 24px 36px"}}>
      <h3 style={{fontFamily:F.heading,fontSize:22,fontWeight:700,color:C.text,margin:"0 0 16px"}}>{existing?"Editar receta":"Nueva receta"}</h3>
      <label style={{fontFamily:F.body,fontSize:12,fontWeight:700,color:C.textMuted,letterSpacing:0.5,display:"block",marginBottom:6}}>NOMBRE</label>
      <Input inputRef={ref} value={name} onChange={e=>setName(e.target.value)} placeholder="Ej: Tarta de brócoli"/>
      {name.trim()&&<button onClick={generateWithAI} disabled={aiLoading} style={{width:"100%",marginTop:12,padding:12,background:aiLoading?"#EDE5DD":"linear-gradient(135deg,#9B4D42,#C4756A)",color:aiLoading?C.textMuted:"white",border:"none",borderRadius:12,fontSize:13,fontWeight:600,cursor:aiLoading?"default":"pointer",fontFamily:F.body,boxShadow:aiLoading?"none":"0 3px 12px rgba(155,77,66,0.25)"}}>
        {aiLoading?"⏳ Generando...":"✨ Generar con IA"}
      </button>}
      <label style={{fontFamily:F.body,fontSize:12,fontWeight:700,color:C.textMuted,letterSpacing:0.5,display:"block",marginTop:16,marginBottom:6}}>DESCRIPCIÓN</label>
      <TextArea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Breve descripción..." rows={2}/>
      <label style={{fontFamily:F.body,fontSize:12,fontWeight:700,color:C.textMuted,letterSpacing:0.5,display:"block",marginTop:16,marginBottom:6}}>INGREDIENTES</label>
      <p style={{fontFamily:F.body,fontSize:11,color:C.textFaint,margin:"0 0 6px"}}>Un ingrediente por línea</p>
      <TextArea value={ingredients} onChange={e=>setIngredients(e.target.value)} placeholder={"200g de harina\n3 huevos\nSal a gusto"} rows={5}/>
      <label style={{fontFamily:F.body,fontSize:12,fontWeight:700,color:C.textMuted,letterSpacing:0.5,display:"block",marginTop:16,marginBottom:6}}>PREPARACIÓN</label>
      <TextArea value={steps} onChange={e=>setSteps(e.target.value)} placeholder="Pasos de preparación..." rows={5}/>
      <label style={{fontFamily:F.body,fontSize:12,fontWeight:700,color:C.textMuted,letterSpacing:0.5,display:"block",marginTop:16,marginBottom:6}}>🔥 CALORÍAS POR PERSONA</label>
      <Input type="number" value={calories} onChange={e=>setCalories(e.target.value)} placeholder="Ej: 450"/>
      <h4 style={{fontFamily:F.heading,fontSize:15,fontWeight:700,color:C.text,margin:"20px 0 8px"}}>🔗 Referencias</h4>
      {name.trim()?<RefButtons name={name}/>:<p style={{fontFamily:F.body,fontSize:12,color:C.textFaint,margin:0}}>Escribí el nombre para buscar</p>}
      <div style={{display:"flex",gap:10,marginTop:24}}>
        <button onClick={onClose} style={{flex:1,padding:14,background:C.primaryLight,color:C.primary,border:"none",borderRadius:14,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:F.body}}>Cancelar</button>
        <button onClick={()=>{if(name.trim())onSave({name:name.trim(),description:desc,ingredients,steps,calories:calories?Number(calories):null})}} disabled={!name.trim()} style={{flex:2,padding:14,background:name.trim()?C.primary:"#DDD",color:"white",border:"none",borderRadius:14,fontSize:15,fontWeight:600,cursor:name.trim()?"pointer":"default",fontFamily:F.body}}>
          {existing?"Guardar":"Crear"} ✓
        </button>
      </div>
    </div>
  </Sheet></Overlay>;
}

/* ═══════════════════════════════════════════
   RECIPE DETAIL VIEW
   ═══════════════════════════════════════════ */
function RecipeDetail({recipe,onBack,onEdit,onDelete}){
  const ingredientsList=recipe.ingredients?recipe.ingredients.split("\n").filter(l=>l.trim()):[];
  return <div style={{padding:"0 20px 120px",animation:"fadeIn 0.2s ease"}}>
    <button onClick={onBack} style={{background:"none",border:"none",color:C.primary,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:F.body,padding:"0 0 12px",display:"flex",alignItems:"center",gap:4}}>‹ Volver</button>
    <div style={{display:"flex",gap:14,marginBottom:16}}>
      <MealImage query={recipe.name} size={90}/>
      <div>
        <h2 style={{fontFamily:F.heading,fontSize:22,fontWeight:700,color:C.text,margin:"0 0 6px"}}>{recipe.name}</h2>
        {recipe.description&&<p style={{fontFamily:F.body,fontSize:13,color:C.textMuted,margin:"0 0 6px",lineHeight:1.5}}>{recipe.description}</p>}
        {recipe.calories&&<span style={{background:"#FFF3E0",color:"#E65100",padding:"4px 10px",borderRadius:8,fontSize:12,fontFamily:F.body,fontWeight:600,display:"inline-block"}}>🔥 {recipe.calories} kcal/persona</span>}
      </div>
    </div>
    {ingredientsList.length>0&&<>
      <h3 style={{fontFamily:F.heading,fontSize:17,fontWeight:700,color:C.text,margin:"0 0 10px"}}>🥕 Ingredientes</h3>
      <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:20}}>
        {ingredientsList.map((ing,i)=><div key={i} style={{display:"flex",gap:10,alignItems:"center",padding:"8px 12px",background:C.surface,borderRadius:10,fontSize:14,fontFamily:F.body,color:C.text}}>
          <span style={{width:6,height:6,borderRadius:"50%",background:"#C4756A",flexShrink:0}}/>{ing}
        </div>)}
      </div>
    </>}
    {recipe.steps&&<>
      <h3 style={{fontFamily:F.heading,fontSize:17,fontWeight:700,color:C.text,margin:"0 0 10px"}}>👩‍🍳 Preparación</h3>
      <div style={{background:C.surface,padding:14,borderRadius:12,marginBottom:20}}>
        <p style={{fontFamily:F.body,fontSize:14,color:C.text,lineHeight:1.7,margin:0,whiteSpace:"pre-wrap"}}>{recipe.steps}</p>
      </div>
    </>}
    <h3 style={{fontFamily:F.heading,fontSize:17,fontWeight:700,color:C.text,margin:"0 0 10px"}}>🔗 Referencias</h3>
    <RefButtons name={recipe.name}/>
    <div style={{display:"flex",gap:10,marginTop:24}}>
      <button onClick={()=>onEdit(recipe)} style={{flex:1,padding:12,background:C.primaryLight,color:C.primary,border:"none",borderRadius:12,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:F.body}}>✎ Editar</button>
      <button onClick={()=>{if(confirm("¿Eliminar esta receta?"))onDelete(recipe.id)}} style={{flex:1,padding:12,background:"#FFF0F0",color:"#D32F2F",border:"2px solid #FFCDD2",borderRadius:12,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:F.body}}>🗑 Eliminar</button>
    </div>
  </div>;
}

/* ═══════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════ */
export default function MiMenu(){
  const today=new Date();
  const [mainTab,setMainTab]=useState("calendario");
  const [selectedDate,setSelectedDate]=useState(today);
  const [calTab,setCalTab]=useState("hoy");
  const [weekAnim,setWeekAnim]=useState("");
  const [meals,setMeals]=useState({});
  const [recipes,setRecipes]=useState([]);
  const [loaded,setLoaded]=useState(false);
  const [addModal,setAddModal]=useState({open:false,mealType:null,editKey:null});
  const [detailModal,setDetailModal]=useState({open:false,meal:null,mealKey:null});
  const [recipeModal,setRecipeModal]=useState({open:false,existing:null});
  const [viewRecipe,setViewRecipe]=useState(null);

  useEffect(()=>{try{const m=localStorage.getItem("mm-meals");if(m)setMeals(JSON.parse(m));const r=localStorage.getItem("mm-recipes");if(r)setRecipes(JSON.parse(r))}catch{};setLoaded(true)},[]);
  useEffect(()=>{if(loaded){try{localStorage.setItem("mm-meals",JSON.stringify(meals));localStorage.setItem("mm-recipes",JSON.stringify(recipes))}catch{}}},[meals,recipes,loaded]);

  const weekDates=getWeekDates(selectedDate);
  const todayKey=dkey(selectedDate);
  const todayMeals=meals[todayKey]||{};
  const dayOfWeek=selectedDate.getDay();
  const dayColor=DAY_COLORS[dayOfWeek];

  function changeWeek(dir){
    setWeekAnim(dir>0?"slideLeft":"slideRight");
    setTimeout(()=>{
      const d=new Date(selectedDate);d.setDate(d.getDate()+(dir*7));
      setSelectedDate(getMondayOfWeek(d));
      setWeekAnim("");
    },150);
  }

  function saveMeal({name,servings,recipeId}){
    const mealKey=addModal.editKey||addModal.mealType?.key;
    if(!mealKey)return;
    const typeLabel=MEAL_TYPES.find(m=>m.key===mealKey)?.label||"";
    setMeals(p=>({...p,[todayKey]:{...p[todayKey],[mealKey]:{name,servings,recipeId:recipeId||null,typeLabel}}}));
    setAddModal({open:false,mealType:null,editKey:null});
    setDetailModal({open:false,meal:null,mealKey:null});
  }
  function saveRecipe(data){
    if(recipeModal.existing){setRecipes(p=>p.map(r=>r.id===recipeModal.existing.id?{...r,...data}:r))}
    else{setRecipes(p=>[...p,{id:Date.now(),...data}])}
    setRecipeModal({open:false,existing:null});
  }
  function deleteRecipe(id){setRecipes(p=>p.filter(r=>r.id!==id));setViewRecipe(null)}
  function editRecipeField(id,fields){setRecipes(p=>p.map(r=>r.id===id?{...r,...fields}:r))}
  function findRecipe(meal){return meal?.recipeId?recipes.find(r=>r.id===meal.recipeId):null}

  return <div style={{maxWidth:480,margin:"0 auto",minHeight:"100vh",background:C.bg,fontFamily:F.body,paddingBottom:70}}>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Fraunces:wght@400;600;700;900&display=swap');
      @keyframes fadeIn{from{opacity:0}to{opacity:1}}
      @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
      @keyframes slideLeft{from{opacity:1;transform:translateX(0)}to{opacity:0;transform:translateX(-30px)}}
      @keyframes slideRight{from{opacity:1;transform:translateX(0)}to{opacity:0;transform:translateX(30px)}}
      *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
      ::-webkit-scrollbar{display:none}
    `}</style>

    {mainTab==="calendario"&&<>
      <div style={{background:"linear-gradient(180deg,#F0E6DC,#FAF7F4)",padding:"20px 20px 0",position:"sticky",top:0,zIndex:10}}>
        <h1 style={{fontFamily:F.heading,fontSize:28,fontWeight:900,color:C.text,margin:"0 0 14px"}}>Mi Menú</h1>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <button onClick={()=>changeWeek(-1)} style={{background:"none",border:"none",fontSize:22,color:C.primary,cursor:"pointer",padding:"4px 10px",fontWeight:700}}>‹</button>
          <span style={{fontSize:13,fontWeight:600,color:C.textMuted,fontFamily:F.body}}>{weekDates[0].getDate()} {MONTHS_ES[weekDates[0].getMonth()].slice(0,3)} — {weekDates[6].getDate()} {MONTHS_ES[weekDates[6].getMonth()].slice(0,3)}</span>
          <button onClick={()=>changeWeek(1)} style={{background:"none",border:"none",fontSize:22,color:C.primary,cursor:"pointer",padding:"4px 10px",fontWeight:700}}>›</button>
        </div>
        <div style={{display:"flex",gap:4,marginBottom:12,animation:weekAnim?`${weekAnim} 0.15s ease`:undefined}}>
          {weekDates.map((d,i)=>{const isSel=dkey(d)===dkey(selectedDate);const isToday=dkey(d)===dkey(today);
            return <div key={i} onClick={()=>setSelectedDate(d)} style={{flex:1,textAlign:"center",padding:"8px 4px",borderRadius:14,cursor:"pointer",background:isSel?C.primary:"transparent",transition:"all 0.2s"}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:1,color:isSel?"rgba(255,255,255,0.7)":C.textFaint,marginBottom:4}}>{"LMXJVSD"[i]}</div>
              <div style={{fontSize:17,fontWeight:700,color:isSel?"white":isToday?C.primary:C.text,fontFamily:F.body}}>{d.getDate()}</div>
            </div>
          })}
        </div>
        <div style={{display:"flex",background:"#EDE5DD",borderRadius:14,padding:3,marginBottom:16}}>
          {[{k:"hoy",l:"Hoy"},{k:"semana",l:"Semana"}].map(t=>
            <button key={t.k} onClick={()=>setCalTab(t.k)} style={{flex:1,padding:"10px",border:"none",borderRadius:12,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:F.body,background:calTab===t.k?C.primary:"transparent",color:calTab===t.k?"white":C.textMuted,transition:"all 0.2s"}}>{t.l}</button>
          )}
        </div>
      </div>

      {calTab==="hoy"&&<div style={{padding:"0 20px 20px",animation:"fadeIn 0.2s ease"}}>
        <div style={{background:dayColor.bg,borderRadius:20,padding:20,marginBottom:16,borderLeft:`5px solid ${dayColor.border}`}}>
          <h2 style={{fontFamily:F.heading,fontSize:26,fontWeight:700,color:C.text,margin:"0 0 4px"}}>{DAYS_ES[dayOfWeek]}</h2>
          <p style={{fontFamily:F.body,fontSize:14,color:dayColor.accent,margin:0,fontWeight:500}}>{formatDate(selectedDate)}</p>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {MEAL_TYPES.map(mt=>{const meal=todayMeals[mt.key];const lr=findRecipe(meal);
            return <div key={mt.key}>{meal?
              <div onClick={()=>setDetailModal({open:true,meal,mealKey:mt.key})} style={{background:"white",borderRadius:16,padding:14,borderLeft:`4px solid ${dayColor.border}`,cursor:"pointer",boxShadow:"0 2px 8px rgba(0,0,0,0.06)",display:"flex",gap:12,alignItems:"center",transition:"transform 0.15s"}}
                onMouseEnter={e=>e.currentTarget.style.transform="scale(1.02)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
                <MealImage query={meal.name} size={56}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:dayColor.accent,textTransform:"uppercase",marginBottom:3,fontFamily:F.body}}>{mt.label}</div>
                  <div style={{fontSize:15,fontWeight:600,color:C.text,fontFamily:F.heading,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{meal.name}</div>
                  <div style={{fontSize:11,color:C.textMuted,fontFamily:F.body,marginTop:2}}>
                    👥 {meal.servings} pers.{meal.recipeId?" · 📋":""}{lr?.calories?` · 🔥 ${lr.calories}`:""} 
                  </div>
                </div>
                <div style={{color:dayColor.border,fontSize:20,flexShrink:0}}>›</div>
              </div>
            :<div onClick={()=>setAddModal({open:true,mealType:mt,editKey:null})} style={{background:"white",borderRadius:16,padding:"16px 14px",border:"2px dashed #E0D6CE",cursor:"pointer",display:"flex",gap:12,alignItems:"center",transition:"border-color 0.2s"}}
                onMouseEnter={e=>e.currentTarget.style.borderColor=dayColor.border} onMouseLeave={e=>e.currentTarget.style.borderColor="#E0D6CE"}>
                <div style={{width:48,height:48,borderRadius:14,background:"#F5F0EB",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{mt.icon}</div>
                <div><div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:C.textFaint,textTransform:"uppercase",marginBottom:2}}>{mt.label}</div><div style={{fontSize:14,color:"#C4B8AE",fontFamily:F.body}}>¿Qué vas a comer?</div></div>
                <div style={{marginLeft:"auto",width:32,height:32,borderRadius:10,background:dayColor.bg,color:dayColor.accent,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700}}>+</div>
              </div>
            }</div>
          })}
        </div>
      </div>}

      {calTab==="semana"&&<div style={{padding:"0 20px 20px",animation:"fadeIn 0.2s ease"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {weekDates.map((d,i)=>{const k=dkey(d);const dm=meals[k]||{};const dc=DAY_COLORS[d.getDay()];
            return <div key={i} onClick={()=>{setSelectedDate(d);setCalTab("hoy")}} style={{background:"white",borderRadius:16,padding:14,borderLeft:`4px solid ${dc.border}`,boxShadow:"0 1px 6px rgba(0,0,0,0.04)",gridColumn:i===6?"1/-1":"auto",cursor:"pointer"}}>
              <div style={{fontFamily:F.heading,fontWeight:700,fontSize:15,color:C.text,marginBottom:6}}>{DAYS_ES[d.getDay()]}</div>
              {MEAL_TYPES.map(mt=><div key={mt.key} style={{fontSize:12,color:dm[mt.key]?C.text:"#CCC",fontFamily:F.body,marginBottom:2,lineHeight:1.4}}>
                <strong style={{color:dc.accent}}>{mt.label.charAt(0)+mt.label.slice(1).toLowerCase()}:</strong> {dm[mt.key]?.name||"—"}
              </div>)}
            </div>
          })}
        </div>
      </div>}
    </>}

    {mainTab==="recetas"&&<>
      <div style={{background:"linear-gradient(180deg,#F0E6DC,#FAF7F4)",padding:"20px 20px 16px",position:"sticky",top:0,zIndex:10}}>
        <h1 style={{fontFamily:F.heading,fontSize:28,fontWeight:900,color:C.text,margin:0}}>Mis Recetas</h1>
      </div>
      {viewRecipe?<RecipeDetail recipe={viewRecipe} onBack={()=>setViewRecipe(null)} onEdit={r=>{setRecipeModal({open:true,existing:r});setViewRecipe(null)}} onDelete={deleteRecipe}/>
      :<div style={{padding:"0 20px 120px"}}>
        <button onClick={()=>setRecipeModal({open:true,existing:null})} style={{width:"100%",padding:14,background:C.primary,color:"white",border:"none",borderRadius:14,fontSize:15,fontWeight:600,cursor:"pointer",fontFamily:F.body,marginBottom:16,boxShadow:"0 4px 16px rgba(155,77,66,0.25)"}}>+ Nueva receta</button>
        {recipes.length===0?<div style={{textAlign:"center",padding:"40px 0"}}>
          <div style={{fontSize:48,marginBottom:12}}>📖</div>
          <p style={{fontFamily:F.body,fontSize:15,color:C.textMuted,margin:0}}>Tu libro de recetas está vacío</p>
        </div>:<div style={{display:"flex",flexDirection:"column",gap:10}}>
          {recipes.map(r=><div key={r.id} onClick={()=>setViewRecipe(r)} style={{background:"white",borderRadius:16,padding:14,display:"flex",gap:12,alignItems:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.06)",cursor:"pointer",transition:"transform 0.15s"}}
            onMouseEnter={e=>e.currentTarget.style.transform="scale(1.02)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
            <MealImage query={r.name} size={56}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:15,fontWeight:600,color:C.text,fontFamily:F.heading,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.name}</div>
              {r.description&&<div style={{fontSize:12,color:C.textMuted,fontFamily:F.body,marginTop:2}}>{r.description.slice(0,60)}{r.description.length>60?"...":""}</div>}
              <div style={{fontSize:11,color:C.textFaint,fontFamily:F.body,marginTop:3}}>
                {r.ingredients?`${r.ingredients.split("\n").filter(l=>l.trim()).length} ingr.`:"Sin ingredientes"}
                {r.calories?` · 🔥 ${r.calories} kcal`:""}
              </div>
            </div>
            <div style={{color:C.border,fontSize:20}}>›</div>
          </div>)}
        </div>}
      </div>}
    </>}

    {/* Bottom nav */}
    <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:50,background:"white",borderTop:"1px solid #E8DDD6",display:"flex",maxWidth:480,margin:"0 auto"}}>
      {[{k:"calendario",icon:"📅",l:"Calendario"},{k:"recetas",icon:"📖",l:"Recetas"}].map(t=>
        <button key={t.k} onClick={()=>{setMainTab(t.k);if(t.k==="recetas")setViewRecipe(null)}} style={{flex:1,padding:"10px 0 8px",border:"none",background:"transparent",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
          <span style={{fontSize:22}}>{t.icon}</span>
          <span style={{fontSize:11,fontWeight:600,fontFamily:F.body,color:mainTab===t.k?C.primary:C.textFaint}}>{t.l}</span>
          {mainTab===t.k&&<div style={{width:20,height:3,borderRadius:2,background:C.primary,marginTop:1}}/>}
        </button>
      )}
    </div>

    {/* Modals */}
    <AddMealModal isOpen={addModal.open} onClose={()=>setAddModal({open:false,mealType:null,editKey:null})} onSave={saveMeal} mealType={addModal.mealType} recipes={recipes}/>
    <MealDetailModal isOpen={detailModal.open} onClose={()=>setDetailModal({open:false,meal:null,mealKey:null})} meal={detailModal.meal} mealKey={detailModal.mealKey} linkedRecipe={findRecipe(detailModal.meal)} onEditRecipe={editRecipeField}
      onChangeMeal={(mk)=>{
        const mt=MEAL_TYPES.find(m=>m.key===mk);
        setDetailModal({open:false,meal:null,mealKey:null});
        setTimeout(()=>setAddModal({open:true,mealType:mt,editKey:mk}),200);
      }}
      onCreateRecipe={(meal,mk,recipeData)=>{
        const newId=Date.now();
        setRecipes(p=>[...p,{id:newId,...recipeData}]);
        if(mk){
          setMeals(p=>({...p,[todayKey]:{...p[todayKey],[mk]:{...p[todayKey][mk],recipeId:newId}}}));
          setDetailModal({open:true,meal:{...meal,recipeId:newId},mealKey:mk});
        }
      }}
    />
    <RecipeModal isOpen={recipeModal.open} onClose={()=>setRecipeModal({open:false,existing:null})} onSave={saveRecipe} existing={recipeModal.existing}/>
  </div>;
}
