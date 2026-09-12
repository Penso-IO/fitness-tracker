'use client'
import { useState } from 'react'
import { useStore } from '@/lib/store'
import { NUTRITION_TARGETS } from '@/lib/store'
import { formatDate, todayStr } from '@/lib/utils'
import { Plus, Trash2, Droplets, Flame, ChevronDown, ChevronUp, BookOpen, Zap, ChefHat } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

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

// ── Sub-components ─────────────────────────────────────────────────
function MacroBar({ label, value, target, unit, color }: { label: string; value: number; target: number; unit: string; color: string }) {
  const pct = Math.min(100, Math.round((value / target) * 100))
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontFamily: 'Archivo, system-ui', fontWeight: 800, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color }}>{label}</span>
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>{value}{unit} / {target}{unit}</span>
      </div>
      <div style={{ height: 6, background: 'var(--neutral-300)' }}>
        <div style={{ height: 6, background: color, width: `${pct}%`, transition: 'width 0.3s' }} />
      </div>
    </div>
  )
}

function RecipeCard({ recipe }: { recipe: Recipe }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ border: '1px solid var(--divider)', background: 'var(--surface)', overflow: 'hidden' }}>
      <button style={{ width: '100%', padding: '14px 16px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setOpen(v => !v)}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, minWidth: 0 }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>{recipe.emoji}</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 13, lineHeight: 1.3, color: 'var(--text)' }}>{recipe.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5, flexWrap: 'wrap' }}>
                <span className="tag tag-accent">{CATEGORY_LABELS[recipe.category]}</span>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>{recipe.prepTime}</span>
              </div>
            </div>
          </div>
          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--accent)' }}>{recipe.kcal}</span>
            <span className="k">kcal</span>
            {open ? <ChevronUp size={14} style={{ color: 'var(--muted)' }} /> : <ChevronDown size={14} style={{ color: 'var(--muted)' }} />}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text)' }}>P {recipe.protein}g</span>
          <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)' }}>C {recipe.carbs}g</span>
          <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)' }}>G {recipe.fat}g</span>
        </div>
      </button>

      {open && (
        <div style={{ borderTop: '1px solid var(--divider)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Ingredients */}
          <div>
            <div className="k" style={{ marginBottom: 8 }}>Ingredienti</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {recipe.ingredients.map((ing, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                  <span style={{ color: 'var(--accent-dark)', fontWeight: 800, width: 56, flexShrink: 0, fontSize: 11 }}>{ing.qty}</span>
                  <span style={{ color: 'var(--text)' }}>{ing.item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Steps */}
          <div>
            <div className="k" style={{ marginBottom: 8 }}>Preparazione</div>
            <ol style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 0, margin: 0, listStyle: 'none' }}>
              {recipe.steps.map((step, i) => (
                <li key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--text)' }}>
                  <span style={{ color: 'var(--accent)', fontWeight: 800, flexShrink: 0 }}>{i + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Book note */}
          <div style={{ display: 'flex', gap: 8, border: '1px solid var(--divider)', background: 'var(--bg)', padding: 12 }}>
            <BookOpen size={12} style={{ color: 'var(--muted)', flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>{recipe.bookNote}</div>
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
  const updateNutritionEntry = useStore((s) => s.updateNutritionEntry)

  const [tab, setTab] = useState<'diario' | 'settimana' | 'ricette'>('diario')
  const [showForm, setShowForm] = useState(false)
  const [showPlan, setShowPlan] = useState(false)
  const [recipeCat, setRecipeCat] = useState<RecipeCategory | 'tutti'>('tutti')
  const [form, setForm] = useState({ date: todayStr(), calories: '', protein: '', carbs: '', fat: '', water: '', notes: '' })

  const today = todayStr()
  const todayEntry = nutritionLog.find((n) => n.date === today)
  const waterToday = todayEntry?.water ?? 0

  const addWater = (liters: number) => {
    if (todayEntry) {
      updateNutritionEntry(todayEntry.id, { water: +(todayEntry.water + liters).toFixed(3) })
    } else {
      addNutritionEntry({ date: today, calories: 0, protein: 0, carbs: 0, fat: 0, water: liters })
    }
  }

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const dateStr = d.toISOString().slice(0, 10)
    const entry = nutritionLog.find((n) => n.date === dateStr)
    return {
      date: dateStr.slice(5).replace('-', '/'),
      kcal: entry?.calories ?? 0,
      prot: entry?.protein ?? 0,
      acqua: entry ? Math.round(entry.water * 1000) : 0,
    }
  })

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

  const chartStyle = { background: 'var(--bg)', border: '1px solid var(--divider)', borderRadius: 0, color: 'var(--text)', fontSize: 11 }

  // Water glass tracker: 8 glasses (each ~250ml = 2L total)
  const totalGlasses = 8
  const filledGlasses = Math.min(totalGlasses, Math.round((waterToday / NUTRITION_TARGETS.water) * totalGlasses))

  return (
    <div style={{ paddingBottom: 26 }}>
      {/* Header */}
      <div style={{ padding: '58px 20px 14px', borderBottom: '2px solid rgba(32,30,29,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 28, marginBottom: 4 }}>Nutrizione</h1>
          <div className="k">Target: {NUTRITION_TARGETS.calories} kcal · {NUTRITION_TARGETS.protein}g P · {NUTRITION_TARGETS.carbs}g C · {NUTRITION_TARGETS.fat}g G</div>
        </div>
        {tab === 'diario' && (
          <button onClick={() => setShowForm(v => !v)} className="btn btn-primary" style={{ fontSize: 12 }}>
            <Plus size={14} />Aggiungi
          </button>
        )}
      </div>

      {/* Tab navigation */}
      <div style={{ display: 'flex', borderBottom: '2px solid rgba(32,30,29,0.4)' }}>
        {([['diario', 'Diario'], ['settimana', '7 Giorni'], ['ricette', 'Ricette']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              flex: 1, padding: '12px 0', fontFamily: 'Archivo, system-ui', fontWeight: 800, fontSize: 11,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              background: 'none', border: 'none', borderBottom: tab === key ? '2px solid var(--accent)' : '2px solid transparent',
              marginBottom: -2, cursor: 'pointer',
              color: tab === key ? 'var(--accent)' : 'var(--muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
            }}
          >
            {key === 'ricette' && <ChefHat size={12} />}{label}
          </button>
        ))}
      </div>

      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* ── DIARIO TAB ─────────────────────────────────────────── */}
        {tab === 'diario' && (
          <>
            {/* Water Tracker */}
            <div style={{ border: '1px solid var(--divider)', padding: '14px 16px', background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Droplets size={15} style={{ color: 'var(--text)' }} />
                  <span style={{ fontWeight: 800, fontSize: 14 }}>Acqua</span>
                </div>
                <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--accent)' }}>
                  {(waterToday * 1000).toFixed(0)}ml
                </span>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span className="k">{(waterToday * 1000).toFixed(0)} ml bevuti</span>
                  <span className="k">{NUTRITION_TARGETS.water * 1000} ml target</span>
                </div>
                {/* Water rectangles */}
                <div style={{ display: 'flex', gap: 3 }}>
                  {Array.from({ length: totalGlasses }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1, height: 20,
                        background: i < filledGlasses ? 'var(--text)' : 'var(--neutral-300)',
                      }}
                    />
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                {([
                  { label: '+100ml', value: 0.1 },
                  { label: '+250ml', value: 0.25 },
                  { label: '+330ml', value: 0.33 },
                  { label: '+500ml', value: 0.5 },
                ] as const).map(({ label, value }) => (
                  <button
                    key={label}
                    onClick={() => addWater(value)}
                    className="btn btn-secondary"
                    style={{ fontSize: 10, padding: '6px 4px', letterSpacing: '0.04em' }}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {waterToday >= NUTRITION_TARGETS.water && (
                <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--accent-dark)', fontWeight: 800 }}>Target raggiunto!</div>
              )}
            </div>

            {/* Today progress */}
            {todayEntry && (
              <div style={{ border: '1px solid var(--divider)', padding: '14px 16px', background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <span className="k">Oggi</span>
                <MacroBar label="Calorie" value={todayEntry.calories} target={NUTRITION_TARGETS.calories} unit=" kcal" color="var(--accent)" />
                <MacroBar label="Proteine" value={todayEntry.protein} target={NUTRITION_TARGETS.protein} unit="g" color="var(--text)" />
                <MacroBar label="Carboidrati" value={todayEntry.carbs} target={NUTRITION_TARGETS.carbs} unit="g" color="var(--neutral-700)" />
                <MacroBar label="Grassi" value={todayEntry.fat} target={NUTRITION_TARGETS.fat} unit="g" color="var(--neutral-600)" />
                {todayEntry.water > 0 && (
                  <MacroBar label="Acqua" value={todayEntry.water} target={NUTRITION_TARGETS.water} unit="L" color="var(--accent-dark)" />
                )}
              </div>
            )}

            {/* Add form */}
            {showForm && (
              <div style={{ border: '1px solid var(--divider)', padding: '14px 16px', background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>Registra giorno</div>
                  <button onClick={usePlan} className="btn btn-secondary" style={{ fontSize: 11, gap: 4 }}>
                    <Zap size={11} />Usa piano
                  </button>
                </div>
                <div>
                  <label className="k" style={{ display: 'block', marginBottom: 4 }}>Data</label>
                  <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {([
                    { label: 'Calorie', field: 'calories' as const, unit: 'kcal', color: 'var(--accent)' },
                    { label: 'Proteine', field: 'protein' as const, unit: 'g', color: 'var(--text)' },
                    { label: 'Carboidrati', field: 'carbs' as const, unit: 'g', color: 'var(--neutral-700)' },
                    { label: 'Grassi', field: 'fat' as const, unit: 'g', color: 'var(--neutral-600)' },
                  ] as const).map(({ label, field, unit, color }) => (
                    <div key={field}>
                      <label style={{ fontFamily: 'Archivo, system-ui', fontWeight: 800, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color, display: 'block', marginBottom: 4 }}>{label}</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <input type="number" value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} placeholder="0" className="input" style={{ flex: 1 }} />
                        <span className="k">{unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <label className="k" style={{ display: 'block', marginBottom: 4, color: 'var(--accent-dark)' }}>Acqua</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input type="number" value={form.water} onChange={(e) => setForm({ ...form, water: e.target.value })} placeholder="0" className="input" style={{ flex: 1 }} />
                    <span className="k">L</span>
                  </div>
                </div>
                <div>
                  <label className="k" style={{ display: 'block', marginBottom: 4 }}>Note</label>
                  <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Pasto cheat? Digiuno? Integrazione?" rows={2}
                    style={{ width: '100%', border: '1px solid var(--divider)', padding: '6px 10px', fontSize: 13, color: 'var(--text)', background: 'var(--bg)', fontFamily: 'Archivo, system-ui', resize: 'none', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setShowForm(false)} className="btn btn-secondary" style={{ flex: 1, minHeight: 44 }}>Annulla</button>
                  <button onClick={handleAdd} className="btn btn-primary" style={{ flex: 1, minHeight: 44 }}>Salva</button>
                </div>
              </div>
            )}

            {/* Piano Alimentare */}
            <div style={{ border: '1px solid var(--divider)', background: 'var(--surface)', overflow: 'hidden' }}>
              <button onClick={() => setShowPlan(v => !v)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <BookOpen size={14} style={{ color: 'var(--muted)' }} />
                  <span style={{ fontWeight: 800, fontSize: 13 }}>Piano Alimentare Tipo</span>
                  <span className="k">~2400 kcal</span>
                </div>
                {showPlan ? <ChevronUp size={15} style={{ color: 'var(--muted)' }} /> : <ChevronDown size={15} style={{ color: 'var(--muted)' }} />}
              </button>
              {showPlan && (
                <div style={{ borderTop: '1px solid var(--divider)' }}>
                  {MEALS.map((meal, i) => (
                    <div key={meal.name} style={{ padding: '12px 16px', borderBottom: i < MEALS.length - 1 ? '1px solid var(--divider)' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 16 }}>{meal.emoji}</span>
                          <div>
                            <span style={{ fontWeight: 800, fontSize: 13 }}>{meal.name}</span>
                            <span className="k" style={{ marginLeft: 8 }}>{meal.time}</span>
                          </div>
                        </div>
                        <div>
                          <span style={{ fontWeight: 800, fontSize: 13, color: 'var(--accent)' }}>~{meal.kcal}</span>
                          <span className="k" style={{ marginLeft: 3 }}>kcal</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 12, marginBottom: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text)' }}>P {meal.p}g</span>
                        <span style={{ fontSize: 11, color: 'var(--muted)' }}>C {meal.c}g</span>
                        <span style={{ fontSize: 11, color: 'var(--muted)' }}>G {meal.f}g</span>
                      </div>
                      <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {meal.items.map((item, j) => (
                          <li key={j} style={{ fontSize: 11, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ width: 4, height: 4, background: 'var(--neutral-400)', flexShrink: 0, display: 'inline-block' }} />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 6, borderTop: '1px solid var(--divider)' }}>
                    <Droplets size={13} style={{ color: 'var(--muted)' }} />
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>Minimo <strong>2.5L acqua</strong> al giorno · +500ml nei giorni di allenamento</span>
                  </div>
                </div>
              )}
            </div>

            {/* Log */}
            {nutritionLog.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0', color: 'var(--muted)', gap: 12 }}>
                <Flame size={48} strokeWidth={1} />
                <div style={{ fontSize: 13 }}>Nessun dato nutrizionale</div>
                <div style={{ fontSize: 12 }}>Aggiungi il tuo primo giorno</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <span className="k">Storico</span>
                {nutritionLog.map((entry) => (
                  <div key={entry.id} style={{ border: '1px solid var(--divider)', padding: '14px 16px', background: 'var(--surface)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 14 }}>{formatDate(entry.date)}</div>
                        {entry.notes && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{entry.notes}</div>}
                      </div>
                      <button onClick={() => deleteNutritionEntry(entry.id)} style={{ color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                      {[
                        { label: 'Kcal', value: entry.calories, color: 'var(--accent)' },
                        { label: 'Prot.', value: `${entry.protein}g`, color: 'var(--text)' },
                        { label: 'Carbo', value: `${entry.carbs}g`, color: 'var(--muted)' },
                        { label: 'Grassi', value: `${entry.fat}g`, color: 'var(--muted)' },
                      ].map((m) => (
                        <div key={m.label} style={{ textAlign: 'center', background: 'var(--bg)', border: '1px solid var(--divider)', padding: '8px 4px' }}>
                          <div style={{ fontWeight: 800, fontSize: 13, color: m.color }}>{m.value}</div>
                          <div className="k" style={{ marginTop: 3 }}>{m.label}</div>
                        </div>
                      ))}
                    </div>
                    {entry.water > 0 && (
                      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--muted)' }}>
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

        {/* ── SETTIMANA TAB ──────────────────────────────────────── */}
        {tab === 'settimana' && (
          <>
            {/* Calorie chart */}
            <div style={{ border: '1px solid var(--divider)', padding: '14px 16px', background: 'var(--surface)' }}>
              <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 2 }}>Calorie — ultimi 7 giorni</div>
              <div className="k" style={{ marginBottom: 12 }}>Target: {NUTRITION_TARGETS.calories} kcal/giorno</div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={last7Days} barSize={24}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(32,30,29,0.15)" vertical={false} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#605d5d', fontSize: 10 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#605d5d', fontSize: 10 }} />
                  <Tooltip contentStyle={chartStyle} formatter={(v) => [`${v} kcal`, 'Calorie']} />
                  <Bar dataKey="kcal" fill="var(--accent)" radius={[0, 0, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Protein chart */}
            <div style={{ border: '1px solid var(--divider)', padding: '14px 16px', background: 'var(--surface)' }}>
              <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 2 }}>Proteine — ultimi 7 giorni</div>
              <div className="k" style={{ marginBottom: 12 }}>Target: {NUTRITION_TARGETS.protein}g/giorno</div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={last7Days} barSize={24}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(32,30,29,0.15)" vertical={false} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#605d5d', fontSize: 10 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#605d5d', fontSize: 10 }} />
                  <Tooltip contentStyle={chartStyle} formatter={(v) => [`${v}g`, 'Proteine']} />
                  <Bar dataKey="prot" fill="var(--text)" radius={[0, 0, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Water chart */}
            <div style={{ border: '1px solid var(--divider)', padding: '14px 16px', background: 'var(--surface)' }}>
              <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 2 }}>Acqua — ultimi 7 giorni</div>
              <div className="k" style={{ marginBottom: 12 }}>Target: {NUTRITION_TARGETS.water * 1000}ml/giorno</div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={last7Days} barSize={24}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(32,30,29,0.15)" vertical={false} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#605d5d', fontSize: 10 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#605d5d', fontSize: 10 }} />
                  <Tooltip contentStyle={chartStyle} formatter={(v) => [`${v}ml`, 'Acqua']} />
                  <Bar dataKey="acqua" fill="var(--neutral-800)" radius={[0, 0, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Summary stats */}
            <div style={{ border: '1px solid var(--divider)', padding: '14px 16px', background: 'var(--surface)' }}>
              <span className="k" style={{ display: 'block', marginBottom: 12 }}>Media settimana</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {(() => {
                  const filled = last7Days.filter(d => d.kcal > 0)
                  const avgKcal = filled.length ? Math.round(filled.reduce((s, d) => s + d.kcal, 0) / filled.length) : 0
                  const avgProt = filled.length ? Math.round(filled.reduce((s, d) => s + d.prot, 0) / filled.length) : 0
                  const avgAcqua = filled.length ? Math.round(filled.reduce((s, d) => s + d.acqua, 0) / filled.length) : 0
                  return [
                    { label: 'Kcal/die', value: avgKcal, unit: '', color: 'var(--accent)' },
                    { label: 'Prot/die', value: avgProt, unit: 'g', color: 'var(--text)' },
                    { label: 'Acqua/die', value: avgAcqua, unit: 'ml', color: 'var(--muted)' },
                  ].map(m => (
                    <div key={m.label} style={{ textAlign: 'center', background: 'var(--bg)', border: '1px solid var(--divider)', padding: '10px 4px' }}>
                      <div style={{ fontWeight: 800, fontSize: 16, color: m.color }}>{m.value}{m.unit}</div>
                      <div className="k" style={{ marginTop: 4 }}>{m.label}</div>
                    </div>
                  ))
                })()}
              </div>
            </div>
          </>
        )}

        {/* ── RICETTE TAB ────────────────────────────────────────── */}
        {tab === 'ricette' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <BookOpen size={12} style={{ color: 'var(--muted)', flexShrink: 0 }} />
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>Basate su <strong>Nutrition Pyramid — Eric Helms</strong> · Obiettivo: massa muscolare lean</div>
            </div>

            {/* Category filter */}
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
              {([['tutti', 'Tutti'], ['colazione', 'Colazione'], ['pre-workout', 'Pre-WO'], ['post-workout', 'Post-WO'], ['pasto', 'Pasto'], ['spuntino', 'Spuntino']] as const).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setRecipeCat(key)}
                  style={{
                    border: '1px solid var(--divider)', padding: '5px 10px', fontSize: 11, flexShrink: 0,
                    fontFamily: 'Archivo, system-ui', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase',
                    background: recipeCat === key ? 'var(--accent)' : 'transparent',
                    color: recipeCat === key ? 'var(--bg)' : 'var(--muted)',
                    borderColor: recipeCat === key ? 'var(--accent)' : 'var(--divider)',
                    cursor: 'pointer',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Recipe cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filteredRecipes.map(recipe => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
