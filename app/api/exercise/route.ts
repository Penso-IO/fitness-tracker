import { NextRequest } from 'next/server'

// Italian → English search terms for wger.de exercise database
const NAME_MAP: Record<string, string> = {
  'Leg Extension': 'leg extension',
  'Hack Squat': 'hack squat',
  'Affondi': 'dumbbell lunge',
  'Affondi Alternati': 'dumbbell lunge',
  'Riscaldamento Spalle': 'lateral raise',
  'Alzate Laterali': 'lateral raise',
  'Trazioni Presa Larga': 'pull-up',
  'Trazioni Presa Stretta': 'chin-up',
  'Trazioni': 'pull-up',
  'Pectoral Fly': 'pec deck fly',
  'Chest Press': 'chest press',
  'Panca 30° Manubri Uniti': 'incline dumbbell press',
  'Estensione Tricipiti (Manubrio Verticale)': 'overhead tricep extension dumbbell',
  'Tricipiti ai Cavi': 'tricep pushdown',
  'Dips': 'dips',
  'Dips (Tricipiti)': 'dips',
  'Addominali + Flessioni': 'crunch',
  'Pulley (Cable Row)': 'seated cable row',
  'Pulley': 'seated cable row',
  'Pulley / Rematore al Cavo': 'seated cable row',
  'Pulley / Seated Cable Row': 'seated cable row',
  'Lat Machine Presa Larga': 'lat pulldown',
  'Lat Machine Presa Stretta (Triangolo)': 'lat pulldown close grip',
  'Lat Machine Presa Stretta': 'lat pulldown close grip',
  'Upper Back': 'barbell row',
  'Petto Panca Multi-Angolo': 'dumbbell bench press',
  'Pullover Panca Piana': 'dumbbell pullover',
  'Curl Manubri Panca Dritta': 'dumbbell curl',
  'Curl Manubri Panca Inclinata': 'incline dumbbell curl',
  'Curl Bilanciere': 'barbell curl',
  'Curl Martello': 'hammer curl',
  'Curl Martello Manubri': 'hammer curl',
  'Panca Piana Bilanciere': 'barbell bench press',
  'Panca Inclinata Bilanciere': 'incline barbell press',
  'Panca Inclinata Manubri': 'incline dumbbell press',
  'Panca Inclinata Manubri (30°)': 'incline dumbbell press',
  'Rematore Bilanciere': 'barbell row',
  'Rematore Bilanciere / Manubrio': 'barbell row',
  'Rematore al Cavo / Pulley': 'seated cable row',
  'Lento Avanti Bilanciere': 'overhead press barbell',
  'Squat Bilanciere': 'barbell squat',
  'Romanian Deadlift': 'romanian deadlift',
  'Leg Press': 'leg press',
  'Leg Curl Sdraiato': 'leg curl',
  'Leg Curl': 'leg curl',
  'Calf Raises': 'calf raise',
  'Plank': 'plank',
  'Plank / Core': 'plank',
  'Crunch + Leg Raise': 'crunch',
  'Plank + Crunch + Leg Raise': 'plank',
  'Stacco da Terra': 'deadlift',
  'Face Pull': 'face pull',
  'Croci ai Cavi': 'cable crossover',
  'Croci ai Cavi (Cable Fly)': 'cable crossover',
  'Croci ai Cavi / Pec Deck': 'pec deck fly',
  'Hip Thrust': 'hip thrust',
  'French Press / Overhead Tricep': 'french press',
  'Push-down Tricipiti ai Cavi': 'tricep pushdown',
  'Push-down ai Cavi': 'tricep pushdown',
  'Push-down Tricipiti': 'tricep pushdown',
}

function getSearchTerm(exerciseName: string): string {
  const exact = NAME_MAP[exerciseName]
  if (exact) return exact
  for (const [key, val] of Object.entries(NAME_MAP)) {
    if (exerciseName.toLowerCase().includes(key.toLowerCase())) return val
  }
  return exerciseName
}

export interface ExerciseInfo {
  name: string
  category: string
  muscles: string[]
  musclesSecondary: string[]
  images: string[]
  description: string
  equipment: string[]
}

export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get('name') || ''
  const term = getSearchTerm(name)

  try {
    const searchRes = await fetch(
      `https://wger.de/api/v2/exercise/search/?term=${encodeURIComponent(term)}&language=english&format=json`,
      { next: { revalidate: 86400 } }
    )
    if (!searchRes.ok) return Response.json(null)

    const searchData = await searchRes.json()
    const suggestions = searchData.suggestions ?? []
    if (!suggestions.length) return Response.json(null)

    const baseId = suggestions[0].data.base_id

    const infoRes = await fetch(
      `https://wger.de/api/v2/exerciseinfo/${baseId}/?format=json`,
      { next: { revalidate: 86400 } }
    )
    if (!infoRes.ok) return Response.json(null)

    const info = await infoRes.json()
    const eng = (info.translations ?? []).find((t: { language: number }) => t.language === 2)

    const result: ExerciseInfo = {
      name: eng?.name || name,
      category: info.category?.name || '',
      muscles: (info.muscles ?? []).map((m: { name_en: string }) => m.name_en).filter(Boolean),
      musclesSecondary: (info.muscles_secondary ?? []).map((m: { name_en: string }) => m.name_en).filter(Boolean),
      images: (info.images ?? []).map((img: { image: string }) => img.image),
      description: (eng?.description || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim(),
      equipment: (info.equipment ?? []).map((e: { name: string }) => e.name).filter(Boolean),
    }

    return Response.json(result)
  } catch {
    return Response.json(null)
  }
}
