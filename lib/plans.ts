export type PlanId = 'gratuit' | 'demarrage' | 'pro' | 'maitre' | 'entreprise'

export const PLANS: Record<PlanId, {
  label: string
  prix_mensuel: number
  admins_max: number
  chantiers_max: number
  ia_appels_mois: number
  storage_go: number
}> = {
  gratuit:    { label: 'Gratuit',           prix_mensuel: 0,   admins_max: 0,  chantiers_max: 0,  ia_appels_mois: 0,   storage_go: 0   },
  demarrage:  { label: 'Entrepreneur solo', prix_mensuel: 59,  admins_max: 1,  chantiers_max: 3,  ia_appels_mois: 30,  storage_go: 5   },
  pro:        { label: 'Pro',               prix_mensuel: 99,  admins_max: 3,  chantiers_max: 10, ia_appels_mois: 150, storage_go: 10  },
  maitre:     { label: 'PME',               prix_mensuel: 149, admins_max: 5,  chantiers_max: 10, ia_appels_mois: 300, storage_go: 25  },
  entreprise: { label: 'Entreprise',        prix_mensuel: 249, admins_max: 10, chantiers_max: 20, ia_appels_mois: 500, storage_go: 100 },
}

export const PLANS_UI: Record<PlanId, { label: string; features: string[] }> = {
  gratuit:    { label: 'Gratuit',           features: ['Essai expiré'] },
  demarrage:  { label: 'Entrepreneur solo', features: ['1 admin', '3 chantiers', '30 appels IA/mois', '5 Go stockage'] },
  pro:        { label: 'Pro',               features: ['3 admins', '10 chantiers', '150 appels IA/mois', '10 Go stockage'] },
  maitre:     { label: 'PME',               features: ['5 admins', '10 chantiers', '300 appels IA/mois', 'Portail client', 'Synthèse hebdo', '25 Go stockage'] },
  entreprise: { label: 'Entreprise',        features: ['10 admins', '20 chantiers', '500 appels IA/mois', 'Portail client', 'Synthèse hebdo', 'Export CSV', '100 Go stockage'] },
}

export const LOOKUP_KEYS: Record<string, string> = {
  demarrage:  'demarrage_mensuel',
  maitre:     'maitre_mensuel',
  entreprise: 'entreprise_mensuel',
}
