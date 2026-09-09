'use client'
import { useState } from 'react'
import { useStore } from '@/lib/store'
import { NUTRITION_TARGETS } from '@/lib/store'
import { formatDate, todayStr } from '@/lib/utils'
import { Plus, Trash2, Droplets, Flame, ChevronDown, ChevronUp, BookOpen, Target, Zap, ChefHat } from 'lucide-react'

// ── Meal plan reference (from ClickUp) ────────────────────────────
const MEALS = [
  { emoji: '🌅', time: '07:00', name: 'Colazione', kcal: 650, p: 35, c: 80, f: 18,
    items: ['4 uova strapazzate', '80g avena con latte scremato', '1 banana', 'Caffè senza zucchero'] },
  { emoji: '🍎', time: '10:30', name: 'Spuntino', kcal: 300, p: 20, c: 25, f: 12,
    items: ['200g yogurt greco 0%', '30g noci', '1 mela'] },
  { emoji: '🍗', time: '13:00', name: 'Pranzo', kcal: 550, p: 45, c: 65, f: 15,
    items: ['150g petto di pollo grigliato', '100g riso integrale', '200g verdure saltate in padella', '10ml olio EVO'] },
  { emoji: '⚡', time: '16:30', name: 'Pre-workout', kcal: 220, p: 5, c: 45, f: 3,
    items: ['1 banana', '30g fiocchi d\'avena', 'Caffè'] },
  { emoji: '💪', time: '19:00', name: 'Post-workout', kcal: 330, p: 40, c: 55, f: 2,
    items: ['40g proteine whey', '50g riso bianco'] },
  { emoji: '🌙', time: '20:30', name: 'Cena', kcal: 550, p: 40, c: 60, f: 18,
    items: ['200g salmone al forno', '300g patate dolci', 'Insalata mista con aceto balsamico'] },
]

// ── Recipes based on Eric Helms – Nutrition Pyramid principles ─────
type RecipeCategory = 'colazione' | 'pre-workout' | 'post-workout' | 'pasto' | 'spuntino'

interface Recipe {
  id: string
  name: string
  emoji: string
  category: RecipeCategory
  kcal: number
  protein: number
  carbs: number
  fat: number
  prepTime: string
  ingredients: { qty: string; item: string }[]
  steps: string[]
  bookNote: string
}

const RECIPES: Recipe[] = [
  // COLAZIONE
  {
    id: 'r1',
    name: 'Power Bowl Uova & Avena',
    emoji: '🍳',
    category: 'colazione',
    kcal: 750,
    protein: 41,
    carbs: 80,
    fat: 28,
    prepTime: '10 min',
    ingredients: [
      { qty: '4', item: 'uova intere' },
      { qty: '80g', item: 'fiocchi d\'avena' },
      { qty: '150ml', item: 'latte scremato' },
      { qty: '1', item: 'banana matura' },
      { qty: '5g', item: 'miele' },
    ],
    steps: [
      'Scalda il latte e unisci l\'avena, cuoci 3-4 min mescolando.',
      'A parte, strapazza le uova in padella antiaderente con pochissimo olio.',
      'Servi in ciotola: avena con miele, uova a lato, banana a fette.',
    ],
    bookNote: 'Helms: distribuisci 4-5 pasti con 25-40g di proteine ciascuno. Questa colazione copre ~41g. I carboidrati complessi dell\'avena forniscono energia stabile.',
  },
  {
    id: 'r2',
    name: 'Pancakes Proteici',
    emoji: '🥞',
    category: 'colazione',
    kcal: 600,
    protein: 55,
    carbs: 43,
    fat: 21,
    prepTime: '15 min',
    ingredients: [
      { qty: '3', item: 'uova intere' },
      { qty: '60g', item: 'avena macinata (farina d\'avena)' },
      { qty: '100g', item: 'yogurt greco 0%' },
      { qty: '25g', item: 'whey protein (vaniglia)' },
      { qty: '1 cucchiaino', item: 'lievito per dolci' },
      { qty: 'q.b.', item: 'frutti di bosco per guarnire' },
    ],
    steps: [
      'Mescola tutti gli ingredienti in un frullatore fino ad ottenere un impasto liscio.',
      'Scalda una padella antiaderente a fuoco medio con spray antiaderente.',
      'Versa 2-3 cucchiai di impasto per pancake, cuoci 2 min per lato.',
      'Servi con frutti di bosco freschi o sciroppo d\'acero in piccole quantità.',
    ],
    bookNote: 'Helms: la sintesi proteica muscolare è massimizzata distribuendo le proteine nei pasti. 55g di proteine a colazione permette una sintesi proteica ottimale per tutta la mattina.',
  },
  // PRE-WORKOUT
  {
    id: 'r3',
    name: 'Rice Cake Pre-Workout',
    emoji: '⚡',
    category: 'pre-workout',
    kcal: 250,
    protein: 6,
    carbs: 42,
    fat: 8,
    prepTime: '2 min',
    ingredients: [
      { qty: '2', item: 'gallette di riso (o mais)' },
      { qty: '15g', item: 'burro di arachidi naturale' },
      { qty: '1', item: 'banana' },
    ],
    steps: [
      'Spalma il burro di arachidi sulle gallette.',
      'Aggiungi le fette di banana sopra.',
      'Consuma 60-90 minuti prima dell\'allenamento.',
    ],
    bookNote: 'Helms (Peri-Workout Nutrition): i carboidrati pre-workout migliorano la performance e riducono il catabolismo. Consuma 0.5g carbs/kg 1-2h prima. Evita i grassi nelle 2h pre-workout.',
  },
  {
    id: 'r4',
    name: 'Avena Pre-Allenamento',
    emoji: '🌾',
    category: 'pre-workout',
    kcal: 380,
    protein: 18,
    carbs: 60,
    fat: 7,
    prepTime: '5 min',
    ingredients: [
      { qty: '80g', item: 'avena' },
      { qty: '200ml', item: 'latte scremato' },
      { qty: '25g', item: 'whey protein' },
      { qty: '1 cucchiaino', item: 'miele' },
      { qty: '1/2', item: 'banana a fette' },
    ],
    steps: [
      'Cuoci l\'avena nel latte per 3-4 minuti.',
      'Una volta raffreddata leggermente (non calda) aggiungi la whey protein e mescola.',
      'Aggiungi miele e banana. Consuma 1-1.5h prima dell\'allenamento.',
    ],
    bookNote: 'Helms: la proteina pre-workout non è critica quanto quella post, ma 20-40g aiutano a ridurre il catabolismo. L\'avena ha indice glicemico moderato, ideale per energia sostenuta.',
  },
  // POST-WORKOUT
  {
    id: 'r5',
    name: 'Shake Post-Workout Classico',
    emoji: '💪',
    category: 'post-workout',
    kcal: 320,
    protein: 38,
    carbs: 42,
    fat: 2,
    prepTime: '2 min',
    ingredients: [
      { qty: '35g', item: 'whey protein (qualsiasi gusto)' },
      { qty: '200ml', item: 'latte scremato' },
      { qty: '1', item: 'banana' },
      { qty: '5g', item: 'creatina monoidrato' },
    ],
    steps: [
      'Metti tutti gli ingredienti nel frullatore.',
      'Frulla per 30 secondi.',
      'Consuma entro 30-60 minuti dal termine dell\'allenamento.',
    ],
    bookNote: 'Helms (A-List Supplements): la creatina monoidrato è il supplemento più supportato dalla ricerca per aumentare la forza e la massa. 3-5g/die sufficienti. La whey è la fonte proteica post-workout ideale per l\'alto contenuto di leucina.',
  },
  {
    id: 'r6',
    name: 'Yogurt Bowl Post-Training',
    emoji: '🫐',
    category: 'post-workout',
    kcal: 335,
    protein: 24,
    carbs: 54,
    fat: 2,
    prepTime: '3 min',
    ingredients: [
      { qty: '200g', item: 'yogurt greco 0%' },
      { qty: '100g', item: 'frutti di bosco misti (freschi o surgelati)' },
      { qty: '30g', item: 'muesli senza zucchero aggiunto' },
      { qty: '15g', item: 'miele' },
    ],
    steps: [
      'Versa lo yogurt in ciotola.',
      'Aggiungi i frutti di bosco (scongelati se surgelati).',
      'Completa con muesli e miele.',
    ],
    bookNote: 'Helms: i carboidrati post-workout ripristinano il glicogeno muscolare. I carboidrati ad indice glicemico moderato/alto (miele + frutta) sono ideali nell\'ora post-workout.',
  },
  // PASTI PRINCIPALI
  {
    id: 'r7',
    name: 'Pollo Grigliato, Riso Integrale & Broccoli',
    emoji: '🍗',
    category: 'pasto',
    kcal: 520,
    protein: 52,
    carbs: 38,
    fat: 17,
    prepTime: '25 min',
    ingredients: [
      { qty: '150g', item: 'petto di pollo' },
      { qty: '120g', item: 'riso integrale (pesato cotto)' },
      { qty: '150g', item: 'broccoli' },
      { qty: '10ml', item: 'olio EVO' },
      { qty: 'q.b.', item: 'succo di limone, aglio, erbe aromatiche' },
    ],
    steps: [
      'Marina il pollo con limone, aglio, erbe e metà dell\'olio per almeno 15 min.',
      'Cuoci il riso integrale (tempo ~20 min) con poco sale.',
      'Griglia il pollo 6-7 min per lato su griglia calda.',
      'Scotta i broccoli in padella con l\'olio rimanente per 5 min.',
      'Servi con tutto insieme, condisci con limone.',
    ],
    bookNote: 'Helms: il pollo è una fonte proteica lean ad alto valore biologico. Il riso integrale fornisce carboidrati complessi con fibra, riducendo il picco glicemico rispetto al riso bianco.',
  },
  {
    id: 'r8',
    name: 'Salmone al Forno con Patate Dolci',
    emoji: '🐟',
    category: 'pasto',
    kcal: 580,
    protein: 41,
    carbs: 48,
    fat: 24,
    prepTime: '30 min',
    ingredients: [
      { qty: '180g', item: 'filetto di salmone' },
      { qty: '200g', item: 'patate dolci' },
      { qty: '80g', item: 'insalata mista' },
      { qty: '10ml', item: 'olio EVO' },
      { qty: 'q.b.', item: 'limone, rosmarino, sale e pepe' },
    ],
    steps: [
      'Preriscalda il forno a 200°C. Taglia le patate dolci a cubetti.',
      'Condisci le patate con olio, rosmarino e sale. Inforna 20 min.',
      'Posiziona il salmone su carta forno, condisci con limone e pepe.',
      'Aggiungi il salmone in forno negli ultimi 12-15 minuti.',
      'Servi con insalata mista condita con aceto balsamico.',
    ],
    bookNote: 'Helms (Micronutrienti): il salmone è ricco di EPA e DHA (omega-3), inseriti nella A-list dei supplementi. Integrarli tramite cibo è preferibile ai supplementi. Le patate dolci sono un\'ottima fonte di carbo complessi e beta-carotene.',
  },
  {
    id: 'r9',
    name: 'Bowl Manzo Magro & Quinoa',
    emoji: '🥩',
    category: 'pasto',
    kcal: 510,
    protein: 45,
    carbs: 27,
    fat: 24,
    prepTime: '20 min',
    ingredients: [
      { qty: '150g', item: 'manzo macinato magro (>90% magro)' },
      { qty: '100g', item: 'quinoa (pesata cotta)' },
      { qty: '150g', item: 'zucchine a cubetti' },
      { qty: '5ml', item: 'olio EVO' },
      { qty: 'q.b.', item: 'aglio, paprika, cumino' },
    ],
    steps: [
      'Cuoci la quinoa in acqua salata per 15 min (ratio 1:2).',
      'In padella con olio rosola l\'aglio, aggiungi il manzo macinato.',
      'Aggiungi le spezie e cuoci 7-8 min a fuoco medio.',
      'A parte, salta le zucchine 5 min.',
      'Servi in bowl: quinoa base, carne sopra, zucchine a lato.',
    ],
    bookNote: 'Helms: la varietà nelle fonti proteiche assicura un profilo aminoacidico completo. La quinoa è l\'unico cereale con tutti gli aminoacidi essenziali, utile come fonte proteica secondaria.',
  },
  {
    id: 'r10',
    name: 'Pasta Integrale con Tonno e Pomodorini',
    emoji: '🍝',
    category: 'pasto',
    kcal: 520,
    protein: 45,
    carbs: 64,
    fat: 8,
    prepTime: '20 min',
    ingredients: [
      { qty: '90g', item: 'pasta integrale (pesata secca)' },
      { qty: '120g', item: 'tonno in acqua (sgocciolato)' },
      { qty: '150g', item: 'pomodorini ciliegino' },
      { qty: '5ml', item: 'olio EVO' },
      { qty: 'q.b.', item: 'aglio, basilico, sale e pepe' },
    ],
    steps: [
      'Cuoci la pasta al dente in acqua salata.',
      'In padella scalda l\'olio con aglio, aggiungi i pomodorini tagliati a metà.',
      'Cuoci 5 min a fuoco medio, aggiungi il tonno sgocciolato.',
      'Scola la pasta al dente, salta in padella con il condimento 1 min.',
      'Servi con basilico fresco.',
    ],
    bookNote: 'Helms: la pasta integrale ha indice glicemico più basso della pasta normale grazie alla fibra. Un apporto adeguato di fibra (25-30g/die) è fondamentale per la salute intestinale e il controllo glicemico.',
  },
  // SPUNTINI
  {
    id: 'r11',
    name: 'Yogurt Greco + Frutta Secca',
    emoji: '🥛',
    category: 'spuntino',
    kcal: 335,
    protein: 24,
    carbs: 26,
    fat: 16,
    prepTime: '1 min',
    ingredients: [
      { qty: '200g', item: 'yogurt greco 0%' },
      { qty: '25g', item: 'noci o mandorle' },
      { qty: '1', item: 'mela o pera' },
    ],
    steps: [
      'Versa lo yogurt in ciotola.',
      'Aggiungi la frutta secca.',
      'Mangia la frutta a parte o tagliata dentro.',
    ],
    bookNote: 'Helms: lo yogurt greco 0% è una delle migliori fonti proteiche per i pasti intermedi. Le noci forniscono grassi insaturi (omega-3 ALA) e sono un ottimo snack saziante.',
  },
  {
    id: 'r12',
    name: 'Ricotta & Gallette di Riso',
    emoji: '🧀',
    category: 'spuntino',
    kcal: 260,
    protein: 13,
    carbs: 29,
    fat: 9,
    prepTime: '2 min',
    ingredients: [
      { qty: '100g', item: 'ricotta magra (vaccina)' },
      { qty: '3', item: 'gallette di riso integrali' },
      { qty: '1 cucchiaino', item: 'miele' },
      { qty: 'q.b.', item: 'cannella (facoltativo)' },
    ],
    steps: [
      'Spalma la ricotta sulle gallette.',
      'Aggiungi un filo di miele e una spolverata di cannella.',
    ],
    bookNote: 'Helms: spuntini tra i pasti principali aiutano a mantenere costante la sintesi proteica muscolare. La ricotta è ricca di caseina, proteina a lento rilascio ideale tra i pasti.',
  },
]

const CATEGORY_LABELS: Record<RecipeCategory, string> = {
  'colazione': 'Colazione',
  'pre-workout': 'Pre-WO',
  'post-workout': 'Post-WO',
  'pasto': 'Pasto',
  'spuntino': 'Spuntino',
}

const CATEGORY_COLORS: Record<RecipeCategory, string> = {
  'colazione': 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  'pre-workout': 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  'post-workout': 'text-green-400 bg-green-500/10 border-green-500/20',
  'pasto': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  'spuntino': 'text-purple-400 bg-purple-500/10 border-purple-500/20',
}

// ── Sub-components ─────────────────────────────────────────────────
function MacroBar({ label, value, target, unit, color }: { label: string; value: number; target: number; unit: string; color: string }) {
  const pct = Math.min(100, Math.round((value / target) * 100))
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className={color}>{label}</span>
        <span className="text-slate-400">{value}{unit} / {target}{unit}</span>
      </div>
      <div className="h-1.5 rounded-full bg-[#1e1e2e]">
        <div className={`h-1.5 rounded-full transition-all ${color.replace('text-', 'bg-')}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function RecipeCard({ recipe }: { recipe: Recipe }) {
  const [open, setOpen] = useState(false)
  const catCls = CATEGORY_COLORS[recipe.category]

  return (
    <div className="rounded-2xl bg-[#111118] border border-[#1e1e2e] overflow-hidden">
      <button className="w-full p-4 text-left" onClick={() => setOpen(v => !v)}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 min-w-0">
            <span className="text-2xl flex-shrink-0">{recipe.emoji}</span>
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm leading-tight">{recipe.name}</p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${catCls}`}>
                  {CATEGORY_LABELS[recipe.category]}
                </span>
                <span className="text-slate-500 text-xs">{recipe.prepTime}</span>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0 flex items-center gap-1.5">
            <span className="text-orange-400 text-sm font-bold">{recipe.kcal}</span>
            <span className="text-orange-400 text-xs">kcal</span>
            {open ? <ChevronUp size={14} className="text-slate-500 ml-1" /> : <ChevronDown size={14} className="text-slate-500 ml-1" />}
          </div>
        </div>
        <div className="flex gap-4 mt-2 text-xs">
          <span className="text-blue-400">P {recipe.protein}g</span>
          <span className="text-yellow-400">C {recipe.carbs}g</span>
          <span className="text-pink-400">G {recipe.fat}g</span>
        </div>
      </button>

      {open && (
        <div className="border-t border-[#1e1e2e] p-4 space-y-4">
          {/* Ingredients */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Ingredienti</p>
            <div className="grid grid-cols-1 gap-1">
              {recipe.ingredients.map((ing, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="text-indigo-400 font-medium w-16 flex-shrink-0 text-xs">{ing.qty}</span>
                  <span className="text-slate-300">{ing.item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Steps */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Preparazione</p>
            <ol className="space-y-2">
              {recipe.steps.map((step, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-300">
                  <span className="text-indigo-400 font-bold flex-shrink-0">{i + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Book note */}
          <div className="flex gap-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 p-3">
            <BookOpen size={13} className="text-indigo-400 flex-shrink-0 mt-0.5" />
            <p className="text-indigo-300 text-xs leading-relaxed">{recipe.bookNote}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────
export default function NutritionPage() {
  const nutritionLog = useStore((s) => s.nutritionLog)
  const addNutritionEntry = useStore((s) => s.addNutritionEntry)
  const deleteNutritionEntry = useStore((s) => s.deleteNutritionEntry)

  const [tab, setTab] = useState<'diario' | 'ricette'>('diario')
  const [showForm, setShowForm] = useState(false)
  const [showPlan, setShowPlan] = useState(false)
  const [recipeCat, setRecipeCat] = useState<RecipeCategory | 'tutti'>('tutti')
  const [form, setForm] = useState({ date: todayStr(), calories: '', protein: '', carbs: '', fat: '', water: '', notes: '' })

  const today = todayStr()
  const todayEntry = nutritionLog.find((n) => n.date === today)

  const handleAdd = () => {
    if (!form.calories) return
    addNutritionEntry({
      date: form.date,
      calories: Number(form.calories),
      protein: Number(form.protein),
      carbs: Number(form.carbs),
      fat: Number(form.fat),
      water: Number(form.water),
      notes: form.notes,
    })
    setForm({ date: todayStr(), calories: '', protein: '', carbs: '', fat: '', water: '', notes: '' })
    setShowForm(false)
  }

  const usePlan = () => {
    setForm(f => ({ ...f, calories: '2400', protein: '180', carbs: '250', fat: '70', water: '2.5' }))
    setShowForm(true)
  }

  const filteredRecipes = recipeCat === 'tutti' ? RECIPES : RECIPES.filter(r => r.category === recipeCat)

  return (
    <div className="px-4 pt-6 pb-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Nutrizione</h1>
          <p className="text-slate-500 text-sm mt-1">Target: {NUTRITION_TARGETS.calories} kcal · {NUTRITION_TARGETS.protein}g P · {NUTRITION_TARGETS.carbs}g C · {NUTRITION_TARGETS.fat}g G</p>
        </div>
        {tab === 'diario' && (
          <button onClick={() => setShowForm(v => !v)} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors">
            <Plus size={16} />Aggiungi
          </button>
        )}
      </div>

      {/* Tab navigation */}
      <div className="flex rounded-xl bg-[#111118] border border-[#1e1e2e] p-1 gap-1">
        {([['diario', 'Diario'], ['ricette', 'Ricette']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
              tab === key
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {key === 'ricette' ? <span className="flex items-center justify-center gap-1.5"><ChefHat size={13} />{label}</span> : label}
          </button>
        ))}
      </div>

      {/* ── DIARIO TAB ─────────────────────────────────────────── */}
      {tab === 'diario' && (
        <>
          {/* Today progress */}
          {todayEntry && (
            <div className="rounded-2xl bg-[#111118] border border-[#1e1e2e] p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Target size={14} className="text-indigo-400" />
                <span className="text-sm font-semibold text-white">Oggi</span>
              </div>
              <MacroBar label="Calorie" value={todayEntry.calories} target={NUTRITION_TARGETS.calories} unit=" kcal" color="text-orange-400" />
              <MacroBar label="Proteine" value={todayEntry.protein} target={NUTRITION_TARGETS.protein} unit="g" color="text-blue-400" />
              <MacroBar label="Carboidrati" value={todayEntry.carbs} target={NUTRITION_TARGETS.carbs} unit="g" color="text-yellow-400" />
              <MacroBar label="Grassi" value={todayEntry.fat} target={NUTRITION_TARGETS.fat} unit="g" color="text-pink-400" />
              {todayEntry.water > 0 && (
                <MacroBar label="Acqua" value={todayEntry.water} target={NUTRITION_TARGETS.water} unit="L" color="text-cyan-400" />
              )}
            </div>
          )}

          {/* Add form */}
          {showForm && (
            <div className="rounded-2xl bg-[#111118] border border-[#1e1e2e] p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-semibold">Registra giorno</h2>
                <button onClick={usePlan} className="flex items-center gap-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 text-xs text-indigo-400 hover:bg-indigo-500/20 transition-colors">
                  <Zap size={12} />Usa piano
                </button>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Data</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full rounded-xl bg-[#0a0a0f] border border-[#2d2d3a] px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { label: 'Calorie', field: 'calories' as const, unit: 'kcal', color: 'text-orange-400' },
                  { label: 'Proteine', field: 'protein' as const, unit: 'g', color: 'text-blue-400' },
                  { label: 'Carboidrati', field: 'carbs' as const, unit: 'g', color: 'text-yellow-400' },
                  { label: 'Grassi', field: 'fat' as const, unit: 'g', color: 'text-pink-400' },
                ] as const).map(({ label, field, unit, color }) => (
                  <div key={field}>
                    <label className={`text-xs font-medium ${color} mb-1 block`}>{label}</label>
                    <div className="flex items-center gap-2">
                      <input type="number" value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} placeholder="0"
                        className="flex-1 rounded-xl bg-[#0a0a0f] border border-[#2d2d3a] px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
                      <span className="text-slate-500 text-sm w-8">{unit}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <label className="text-xs font-medium text-cyan-400 mb-1 block">Acqua</label>
                <div className="flex items-center gap-2">
                  <input type="number" value={form.water} onChange={(e) => setForm({ ...form, water: e.target.value })} placeholder="0"
                    className="flex-1 rounded-xl bg-[#0a0a0f] border border-[#2d2d3a] px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
                  <span className="text-slate-500 text-sm w-8">L</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Note</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Pasto cheat? Digiuno? Integrazione?" rows={2}
                  className="w-full rounded-xl bg-[#0a0a0f] border border-[#2d2d3a] px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 resize-none" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowForm(false)} className="flex-1 rounded-xl border border-[#2d2d3a] py-3 text-slate-400 text-sm">Annulla</button>
                <button onClick={handleAdd} className="flex-1 rounded-xl bg-indigo-600 py-3 text-white font-medium text-sm hover:bg-indigo-500 transition-colors">Salva</button>
              </div>
            </div>
          )}

          {/* Piano Alimentare */}
          <div className="rounded-2xl bg-[#111118] border border-[#1e1e2e] overflow-hidden">
            <button onClick={() => setShowPlan(v => !v)} className="w-full flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-indigo-400" />
                <span className="text-sm font-semibold text-white">Piano Alimentare Tipo</span>
                <span className="text-xs text-slate-500">~2400 kcal</span>
              </div>
              {showPlan ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
            </button>
            {showPlan && (
              <div className="border-t border-[#1e1e2e] divide-y divide-[#1e1e2e]">
                {MEALS.map((meal) => (
                  <div key={meal.name} className="px-4 py-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{meal.emoji}</span>
                        <div>
                          <span className="text-sm font-medium text-white">{meal.name}</span>
                          <span className="text-slate-500 text-xs ml-2">{meal.time}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-orange-400 text-sm font-bold">~{meal.kcal}</span>
                        <span className="text-orange-400 text-xs"> kcal</span>
                      </div>
                    </div>
                    <div className="flex gap-3 text-xs mb-2">
                      <span className="text-blue-400">P {meal.p}g</span>
                      <span className="text-yellow-400">C {meal.c}g</span>
                      <span className="text-pink-400">G {meal.f}g</span>
                    </div>
                    <ul className="space-y-0.5">
                      {meal.items.map((item, i) => (
                        <li key={i} className="text-xs text-slate-400 flex items-center gap-1.5">
                          <span className="h-1 w-1 rounded-full bg-slate-600 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <div className="px-4 py-3 flex items-center gap-2">
                  <Droplets size={14} className="text-cyan-400" />
                  <span className="text-xs text-slate-400">Minimo <span className="text-cyan-400 font-medium">2.5L acqua</span> al giorno · +500ml nei giorni di allenamento</span>
                </div>
              </div>
            )}
          </div>

          {/* Log */}
          {nutritionLog.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-600 gap-3">
              <Flame size={48} strokeWidth={1} />
              <p className="text-sm">Nessun dato nutrizionale</p>
              <p className="text-xs">Aggiungi il tuo primo giorno</p>
            </div>
          ) : (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-400">Storico</h2>
              {nutritionLog.map((entry) => (
                <div key={entry.id} className="rounded-2xl bg-[#111118] border border-[#1e1e2e] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-white font-semibold">{formatDate(entry.date)}</p>
                      {entry.notes && <p className="text-slate-500 text-xs mt-0.5">{entry.notes}</p>}
                    </div>
                    <button onClick={() => deleteNutritionEntry(entry.id)} className="text-slate-600 hover:text-red-400 p-1 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: 'Kcal', value: entry.calories, color: 'text-orange-400' },
                      { label: 'Prot.', value: `${entry.protein}g`, color: 'text-blue-400' },
                      { label: 'Carbo', value: `${entry.carbs}g`, color: 'text-yellow-400' },
                      { label: 'Grassi', value: `${entry.fat}g`, color: 'text-pink-400' },
                    ].map((m) => (
                      <div key={m.label} className="text-center rounded-xl bg-[#0a0a0f] py-2">
                        <p className={`text-base font-bold ${m.color}`}>{m.value}</p>
                        <p className="text-slate-600 text-xs">{m.label}</p>
                      </div>
                    ))}
                  </div>
                  {entry.water > 0 && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-blue-400">
                      <Droplets size={12} />
                      <span>{entry.water}L acqua</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── RICETTE TAB ────────────────────────────────────────── */}
      {tab === 'ricette' && (
        <>
          <div className="flex items-center gap-2">
            <BookOpen size={13} className="text-indigo-400 flex-shrink-0" />
            <p className="text-xs text-slate-500">Basate su <span className="text-indigo-400">Nutrition Pyramid — Eric Helms</span> · Obiettivo: massa muscolare lean</p>
          </div>

          {/* Category filter */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {([['tutti', 'Tutti'], ['colazione', 'Colazione'], ['pre-workout', 'Pre-WO'], ['post-workout', 'Post-WO'], ['pasto', 'Pasto'], ['spuntino', 'Spuntino']] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setRecipeCat(key)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium flex-shrink-0 transition-colors ${
                  recipeCat === key
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'border-[#2d2d3a] text-slate-400 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Recipe cards */}
          <div className="space-y-3">
            {filteredRecipes.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
