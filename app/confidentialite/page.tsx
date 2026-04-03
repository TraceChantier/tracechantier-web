export default function PolitiqueConfidentialitePage() {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px', fontFamily: 'system-ui, sans-serif', color: '#1A3A5C', lineHeight: 1.7 }}>
      <a href="/" style={{ color: '#1B5FA8', fontSize: 13, textDecoration: 'none', display: 'inline-block', marginBottom: 32 }}>← Retour</a>

      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>Politique de confidentialité — TraceChantier</h1>
      <p style={{ color: '#9BBAD6', fontSize: 13, marginBottom: 40 }}>Dernière mise à jour : 26 mars 2026</p>

      <p>TraceChantier est exploité par TraceChantier, Montréal, Québec, Canada.</p>

      <Section titre="1. Renseignements collectés">
        <p><strong>Lors de la création de compte :</strong> nom et prénom, adresse courriel, numéro de téléphone (optionnel), nom et ville de l&apos;entreprise, logo de l&apos;entreprise (optionnel).</p>
        <p><strong>Lors de l&apos;utilisation :</strong> photos de chantier, notes vocales et journaux de chantier, informations sur les chantiers, données de localisation GPS (si fournies), données de facturation (traitées exclusivement par Stripe).</p>
        <p><strong>Automatiquement :</strong> données d&apos;utilisation anonymisées, adresse IP lors des connexions.</p>
      </Section>

      <Section titre="2. Utilisation des renseignements">
        <ul>
          <li>Fournir et améliorer les services TraceChantier</li>
          <li>Générer des rapports et résumés par intelligence artificielle (Anthropic Claude, OpenAI Whisper)</li>
          <li>Envoyer des notifications relatives à vos chantiers</li>
          <li>Traiter les paiements via Stripe</li>
          <li>Répondre à vos demandes de soutien</li>
        </ul>
      </Section>

      <Section titre="3. Intelligence artificielle">
        <p>TraceChantier utilise des services d&apos;intelligence artificielle tiers : OpenAI Whisper (transcription vocale) et Anthropic Claude (génération de résumés). Les données transmises incluent le contenu de vos notes vocales, le nom du chantier et la date. Ces données sont transmises de manière sécurisée (HTTPS).</p>
      </Section>

      <Section titre="4. Partage des renseignements">
        <p>Nous ne vendons ni ne partageons vos renseignements personnels, sauf :</p>
        <ul>
          <li><strong>Fournisseurs de services :</strong> Supabase (hébergement), Stripe (paiements), Anthropic (IA), OpenAI (transcription)</li>
          <li><strong>Obligations légales :</strong> si requis par la loi ou une ordonnance judiciaire</li>
        </ul>
      </Section>

      <Section titre="5. Hébergement et transferts internationaux">
        <p>Vos données sont hébergées sur les serveurs de Supabase (infrastructure AWS, région us-east-1). Certains traitements peuvent impliquer des transferts hors du Québec, encadrés par des clauses contractuelles conformes à la Loi 25.</p>
      </Section>

      <Section titre="6. Conservation des données">
        <p>Vos données sont conservées aussi longtemps que votre compte est actif. Lors de la fermeture, vos données sont supprimées dans un délai de 30 jours, à l&apos;exception des données de facturation conservées 7 ans conformément à la Loi sur les impôts du Québec.</p>
      </Section>

      <Section titre="7. Vos droits (Loi 25 — Québec)">
        <p>Vous avez le droit d&apos;accéder, de rectifier, de retirer votre consentement, de demander la portabilité et la suppression de vos renseignements personnels.</p>
        <p>Pour exercer ces droits : <a href="mailto:tracechantier@outlook.com" style={{ color: '#1B5FA8' }}>tracechantier@outlook.com</a></p>
      </Section>

      <Section titre="8. Sécurité">
        <ul>
          <li>Chiffrement des communications (TLS 1.3)</li>
          <li>Authentification sécurisée (JWT, Row Level Security Supabase)</li>
          <li>Accès limité aux données selon le rôle</li>
          <li>Photos stockées dans des buckets privés avec accès signé temporaire</li>
        </ul>
      </Section>

      <Section titre="9. Témoins (cookies)">
        <p>L&apos;application mobile TraceChantier n&apos;utilise pas de témoins de navigation. Nous utilisons le stockage local de l&apos;appareil (AsyncStorage) pour mémoriser vos préférences et votre session.</p>
      </Section>

      <Section titre="10. Contact">
        <p>
          <strong>Responsable de la protection des renseignements personnels</strong><br />
          TraceChantier<br />
          Montréal, Québec, Canada<br />
          <a href="mailto:tracechantier@outlook.com" style={{ color: '#1B5FA8' }}>tracechantier@outlook.com</a>
        </p>
      </Section>
    </div>
  )
}

function Section({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 32 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: '#0D3A6E' }}>{titre}</h2>
      {children}
    </div>
  )
}
