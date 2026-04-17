import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import CloturerBtn from '@/components/CloturerBtn'
import { BuildingIcon, CameraIcon, BookIcon, ChartIcon, DownloadIcon, PlusIcon, UsersIcon } from '@/components/Icons'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profil } = await supabase
    .from('profils')
    .select('entreprise_id, prenom_nom')
    .eq('id', user!.id)
    .single()

  const entrepriseId = profil?.entreprise_id

  const sept_jours_ago = new Date(Date.now() - 7 * 86400000).toISOString()

  const [chantiersActifsRes, chantiersCloturesRes, photosRes, journauxRes, photosRecentsRes, journauxRecentsRes] = await Promise.all([
    supabase.from('chantiers').select('id, nom').eq('entreprise_id', entrepriseId).eq('actif', true),
    supabase.from('chantiers').select('id, nom, ferme_le').eq('entreprise_id', entrepriseId).eq('actif', false),
    supabase.from('photos').select('id', { count: 'exact', head: true }).eq('entreprise_id', entrepriseId),
    supabase.from('journal_chantier').select('id', { count: 'exact', head: true }).in(
      'chantier_id',
      (await supabase.from('chantiers').select('id').eq('entreprise_id', entrepriseId)).data?.map((c: any) => c.id) ?? []
    ),
    // Photos des 7 derniers jours par chantier
    supabase
      .from('photos')
      .select('chantier_id')
      .eq('entreprise_id', entrepriseId)
      .gte('created_at', sept_jours_ago),
    // Journaux des 7 derniers jours
    supabase
      .from('journal_chantier')
      .select('chantier_id, incidents')
      .in(
        'chantier_id',
        (await supabase.from('chantiers').select('id').eq('entreprise_id', entrepriseId).eq('actif', true)).data?.map((c: any) => c.id) ?? []
      )
      .gte('created_at', sept_jours_ago),
  ])

  const chantiersActifs = chantiersActifsRes.data ?? []
  const chantiersClotures = chantiersCloturesRes.data ?? []
  const nbPhotos = photosRes.count ?? 0
  const nbJournaux = journauxRes.count ?? 0
  const prenom = profil?.prenom_nom?.split(' ')[0] ?? 'vous'
  const totalChantiers = chantiersActifs.length + chantiersClotures.length

  // Agréger activité par chantier_id pour les 7 derniers jours
  const photosParChantier: Record<string, number> = {}
  for (const p of (photosRecentsRes.data ?? [])) {
    if (p.chantier_id) photosParChantier[p.chantier_id] = (photosParChantier[p.chantier_id] ?? 0) + 1
  }
  const journauxParChantier: Record<string, number> = {}
  let incidentsTotal7j = 0
  for (const j of (journauxRecentsRes.data ?? [])) {
    if (j.chantier_id) journauxParChantier[j.chantier_id] = (journauxParChantier[j.chantier_id] ?? 0) + 1
    if (Array.isArray(j.incidents)) incidentsTotal7j += j.incidents.length
  }
  const photosTotal7j = (photosRecentsRes.data ?? []).length
  const journauxTotal7j = (journauxRecentsRes.data ?? []).length

  // Chantiers actifs avec activité cette semaine (triés par activité décroissante)
  const chantiersAvecActivite = chantiersActifs
    .map(c => ({
      ...c,
      photos7j: photosParChantier[c.id] ?? 0,
      journaux7j: journauxParChantier[c.id] ?? 0,
    }))
    .filter(c => c.photos7j > 0 || c.journaux7j > 0)
    .sort((a, b) => (b.photos7j + b.journaux7j) - (a.photos7j + a.journaux7j))

  return (
    <div className="p-8 max-w-5xl mx-auto">

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-xl font-700 tracking-tight" style={{ color: '#111827' }}>
            Bonjour, {prenom}
          </h1>
          <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
            Vue d'ensemble de vos chantiers
          </p>
        </div>
        <Link
          href="/dashboard/creer-chantier"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-600 transition-all"
          style={{ background: '#1B5FA8', color: '#fff', boxShadow: '0 2px 8px rgba(27,95,168,0.3)', textDecoration: 'none' }}
        >
          <PlusIcon size={14} />
          Nouveau chantier
        </Link>
      </div>

      {/* Onboarding — compte tout neuf */}
      {totalChantiers === 0 && (
        <OnboardingGuide prenom={prenom} />
      )}

      {/* Stats — affichées dès qu'il y a au moins un chantier */}
      {totalChantiers > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Chantiers actifs"   value={chantiersActifs.length}   color="#1B5FA8" icon={<BuildingIcon size={14} />} />
          <StatCard label="Chantiers clôturés" value={chantiersClotures.length} color="#059669" icon={<BuildingIcon size={14} />} />
          <StatCard label="Photos archivées"   value={nbPhotos}                 color="#D97706" icon={<CameraIcon size={14} />} />
          <StatCard label="Journaux soumis"    value={nbJournaux}               color="#7C3AED" icon={<BookIcon size={14} />} />
        </div>
      )}

      {/* Semaine en revue */}
      {chantiersActifs.length > 0 && (
        <SemaineEnRevue
          chantiersAvecActivite={chantiersAvecActivite}
          photosTotal={photosTotal7j}
          journauxTotal={journauxTotal7j}
          incidentsTotal={incidentsTotal7j}
        />
      )}

      {/* Chantiers actifs */}
      {totalChantiers > 0 && (
        <Section titre="Chantiers actifs" count={chantiersActifs.length} accentColor="#1B5FA8">
          {chantiersActifs.length === 0 ? (
            <EmptyState message="Aucun chantier actif" />
          ) : (
            <div className="flex flex-col gap-2">
              {chantiersActifs.map(c => <ChantierRow key={c.id} chantier={c} actif={true} />)}
            </div>
          )}
        </Section>
      )}

      {chantiersClotures.length > 0 && (
        <Section titre="Clôturés" count={chantiersClotures.length} accentColor="#9CA3AF">
          <div className="flex flex-col gap-1.5">
            {chantiersClotures.map(c => <ChantierRow key={c.id} chantier={c} actif={false} />)}
          </div>
        </Section>
      )}
    </div>
  )
}

// ─── Onboarding ──────────────────────────────────────────────────────────────

function OnboardingGuide({ prenom }: { prenom: string }) {
  const steps = [
    {
      num: '1',
      titre: 'Créez votre premier chantier',
      desc: 'Donnez un nom, une adresse, et définissez les zones de travail (structure, toiture, plomberie…)',
      href: '/dashboard/creer-chantier',
      cta: 'Créer un chantier',
      color: '#1B5FA8',
      done: false,
    },
    {
      num: '2',
      titre: 'Partagez le code d\'accès ST',
      desc: 'Chaque chantier génère un code 6 caractères. Vos sous-traitants l\'entrent dans l\'app mobile pour soumettre leurs journaux et photos.',
      href: '/dashboard/equipe',
      cta: 'Voir les codes',
      color: '#059669',
      done: false,
    },
    {
      num: '3',
      titre: 'Invitez un admin (optionnel)',
      desc: 'Un surintendant ou chef de chantier peut accéder au tableau de bord avec son propre compte.',
      href: '/dashboard/equipe',
      cta: 'Gérer l\'équipe',
      color: '#7C3AED',
      done: false,
    },
  ]

  return (
    <div
      className="rounded-2xl p-8 mb-8"
      style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #F5F3FF 100%)', border: '1px solid #DBEAFE' }}
    >
      <div className="mb-6">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-600 mb-3"
          style={{ background: '#DBEAFE', color: '#1B5FA8' }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
            <circle cx="5" cy="5" r="5" />
          </svg>
          Bienvenue sur TraceChantier
        </div>
        <h2 className="text-lg font-700 mb-1" style={{ color: '#111827' }}>
          Commençons, {prenom} !
        </h2>
        <p className="text-sm" style={{ color: '#6B7280' }}>
          3 étapes pour avoir votre premier journal de chantier soumis aujourd'hui.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {steps.map((step, i) => (
          <div
            key={i}
            className="bg-white rounded-xl p-4 flex items-start gap-4"
            style={{ border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-700"
              style={{ background: step.color + '18', color: step.color }}
            >
              {step.num}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-600 mb-0.5" style={{ color: '#111827' }}>{step.titre}</div>
              <div className="text-xs leading-relaxed" style={{ color: '#6B7280' }}>{step.desc}</div>
            </div>
            <Link
              href={step.href}
              className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-600 transition-all"
              style={{ background: step.color, color: '#fff', textDecoration: 'none', boxShadow: `0 1px 4px ${step.color}40` }}
            >
              {step.cta}
            </Link>
          </div>
        ))}
      </div>

      <div
        className="mt-6 pt-5 flex items-start gap-3"
        style={{ borderTop: '1px solid #DBEAFE' }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: '#FEF9C3', color: '#D97706' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
          </svg>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: '#6B7280' }}>
          <strong style={{ color: '#111827' }}>Astuce :</strong> vos sous-traitants n'ont pas besoin de créer un compte.
          Ils téléchargent l'app, entrent le code du chantier, et c'est tout. C'est fait pour les gens sur le terrain.
        </p>
      </div>
    </div>
  )
}

// ─── Semaine en revue ─────────────────────────────────────────────────────────

function SemaineEnRevue({
  chantiersAvecActivite,
  photosTotal,
  journauxTotal,
  incidentsTotal,
}: {
  chantiersAvecActivite: { id: string; nom: string; photos7j: number; journaux7j: number }[]
  photosTotal: number
  journauxTotal: number
  incidentsTotal: number
}) {
  const aucuneActivite = chantiersAvecActivite.length === 0

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-700 uppercase tracking-wider" style={{ color: '#9CA3AF', letterSpacing: '0.07em' }}>
            Semaine en revue
          </h2>
          <span className="text-xs px-2 py-0.5 rounded-full font-600" style={{ background: '#D97706' + '15', color: '#D97706' }}>
            7 jours
          </span>
        </div>
      </div>

      {aucuneActivite ? (
        <div
          className="bg-white rounded-xl px-5 py-8 flex flex-col items-center gap-2"
          style={{ border: '1px solid #E5E7EB', textAlign: 'center' }}
        >
          <div style={{ color: '#D1D5DB' }}>
            <BookIcon size={22} />
          </div>
          <p className="text-sm" style={{ color: '#9CA3AF' }}>Aucune activité cette semaine</p>
          <p className="text-xs" style={{ color: '#D1D5DB' }}>Les journaux et photos de vos chantiers actifs apparaîtront ici</p>
        </div>
      ) : (
        <div
          className="bg-white rounded-xl overflow-hidden"
          style={{ border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        >
          {/* Résumé global */}
          <div
            className="px-5 py-4 grid grid-cols-3 gap-4"
            style={{ borderBottom: '1px solid #F3F4F6', background: '#FAFAFA' }}
          >
            <MiniStat label="Photos" value={photosTotal} color="#1B5FA8" />
            <MiniStat label="Journaux" value={journauxTotal} color="#059669" />
            <MiniStat label="Incidents" value={incidentsTotal} color={incidentsTotal > 0 ? '#DC2626' : '#9CA3AF'} />
          </div>

          {/* Activité par chantier */}
          <div className="divide-y" style={{ borderColor: '#F3F4F6' }}>
            {chantiersAvecActivite.slice(0, 5).map(c => (
              <div key={c.id} className="px-5 py-3 flex items-center gap-4">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#059669' }} />
                <span className="flex-1 text-sm font-500 truncate" style={{ color: '#374151' }}>{c.nom}</span>
                <div className="flex items-center gap-3">
                  {c.photos7j > 0 && (
                    <span className="flex items-center gap-1 text-xs" style={{ color: '#1B5FA8' }}>
                      <CameraIcon size={11} />
                      {c.photos7j}
                    </span>
                  )}
                  {c.journaux7j > 0 && (
                    <span className="flex items-center gap-1 text-xs" style={{ color: '#059669' }}>
                      <BookIcon size={11} />
                      {c.journaux7j}
                    </span>
                  )}
                  <Link
                    href={`/dashboard/chantier/${c.id}/synthese`}
                    className="text-xs font-600 px-2.5 py-1 rounded-lg transition-all"
                    style={{ background: '#D97706' + '12', color: '#D97706', border: '1px solid ' + '#D97706' + '25', textDecoration: 'none' }}
                  >
                    Synthèse →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-2xl font-700 leading-none" style={{ color }}>{value}</span>
      <span className="text-xs" style={{ color: '#9CA3AF' }}>{label}</span>
    </div>
  )
}

// ─── Composants réutilisables ─────────────────────────────────────────────────

function StatCard({ label, value, color, icon }: {
  label: string; value: number; color: string; icon: React.ReactNode
}) {
  return (
    <div
      className="bg-white rounded-xl p-5 relative overflow-hidden"
      style={{ border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
    >
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl" style={{ background: color }} />
      <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-3" style={{ background: color + '18', color }}>
        {icon}
      </div>
      <div className="text-3xl font-700 tracking-tight leading-none mb-1.5" style={{ color: '#111827' }}>{value}</div>
      <div className="text-xs font-500" style={{ color: '#9CA3AF' }}>{label}</div>
    </div>
  )
}

function Section({ titre, count, accentColor, children }: {
  titre: string; count: number; accentColor: string; children: React.ReactNode
}) {
  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xs font-700 uppercase tracking-wider" style={{ color: '#9CA3AF', letterSpacing: '0.07em' }}>
          {titre}
        </h2>
        <span className="text-xs px-2 py-0.5 rounded-full font-600" style={{ background: accentColor + '15', color: accentColor }}>
          {count}
        </span>
      </div>
      {children}
    </section>
  )
}

function badgeSuppressionCloture(ferme_le: string | null) {
  if (!ferme_le) {
    return (
      <span
        className="text-xs px-2 py-0.5 rounded-full font-600 flex-shrink-0"
        style={{ background: '#F3F4F6', color: '#9CA3AF', border: '1px solid #E5E7EB' }}
      >
        Archivé
      </span>
    )
  }
  const joursRestants = 180 - Math.floor((Date.now() - new Date(ferme_le).getTime()) / 86400000)
  if (joursRestants <= 7) {
    return (
      <span
        className="text-xs px-2 py-0.5 rounded-full font-600 flex-shrink-0"
        style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}
      >
        Suppression dans {joursRestants} jour{joursRestants > 1 ? 's' : ''}
      </span>
    )
  }
  if (joursRestants <= 30) {
    return (
      <span
        className="text-xs px-2 py-0.5 rounded-full font-600 flex-shrink-0"
        style={{ background: '#FFFBEB', color: '#D97706', border: '1px solid #FDE68A' }}
      >
        Suppression dans {joursRestants} jours
      </span>
    )
  }
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full font-600 flex-shrink-0"
      style={{ background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0' }}
    >
      Suppression dans {joursRestants} jours
    </span>
  )
}

function ChantierRow({ chantier, actif }: { chantier: { id: string; nom: string; ferme_le?: string | null }; actif: boolean }) {
  const base = `/dashboard/chantier/${chantier.id}`
  return (
    <div
      className="tc-chantier-row bg-white rounded-xl px-5 py-3.5 flex items-center gap-4 transition-shadow"
      style={{ border: '1px solid #E5E7EB', boxShadow: '0 1px 2px rgba(0,0,0,0.03)', opacity: actif ? 1 : 0.7 }}
    >
      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: actif ? '#059669' : '#D1D5DB' }} />
      <span className="flex-1 text-sm font-600 truncate" style={{ color: '#111827' }}>{chantier.nom}</span>
      <div className="flex items-center gap-1.5 flex-wrap justify-end">
        {!actif && badgeSuppressionCloture(chantier.ferme_le ?? null)}
        <ActionLink href={`${base}/photos`} color="#1B5FA8" icon={<CameraIcon size={12} />}>Photos</ActionLink>
        {actif && <>
          <ActionLink href={`${base}/journal`} color="#059669" icon={<BookIcon size={12} />}>Journal</ActionLink>
          <ActionLink href={`${base}/synthese`} color="#D97706" icon={<ChartIcon size={12} />}>Synthèse</ActionLink>
        </>}
        {!actif && (
          <ActionLink href={`${base}/telecharger`} color="#7C3AED" icon={<DownloadIcon size={12} />}>Télécharger</ActionLink>
        )}
        {actif && <CloturerBtn chantierId={chantier.id} nomChantier={chantier.nom} />}
      </div>
    </div>
  )
}

function ActionLink({ href, color, icon, children }: {
  href: string; color: string; icon: React.ReactNode; children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="tc-action-link flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-600 transition-all"
      style={{ background: '#F8F9FA', color, border: '1px solid #E5E7EB' }}
    >
      {icon}{children}
    </Link>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-white rounded-xl py-12 flex flex-col items-center gap-2.5" style={{ border: '1px solid #E5E7EB' }}>
      <div style={{ color: '#D1D5DB' }}><BuildingIcon size={22} /></div>
      <p className="text-sm" style={{ color: '#9CA3AF' }}>{message}</p>
    </div>
  )
}
