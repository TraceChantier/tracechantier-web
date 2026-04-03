export default function CGUPage() {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px', fontFamily: 'system-ui, sans-serif', color: '#1A3A5C', lineHeight: 1.7 }}>
      <a href="/" style={{ color: '#1B5FA8', fontSize: 13, textDecoration: 'none', display: 'inline-block', marginBottom: 32 }}>← Retour</a>

      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>Conditions d&apos;utilisation — TraceChantier</h1>
      <p style={{ color: '#9BBAD6', fontSize: 13, marginBottom: 40 }}>Dernière mise à jour : 26 mars 2026</p>

      <p>Ces conditions d&apos;utilisation (« Conditions ») régissent votre accès et votre utilisation de l&apos;application mobile TraceChantier (« le Service »), exploité par TraceChantier (« nous », « notre »). En créant un compte ou en utilisant le Service, vous acceptez ces Conditions dans leur intégralité.</p>

      <Section titre="1. Description du service">
        <p>TraceChantier est une application mobile de gestion documentaire pour les chantiers de construction au Québec. Le Service permet notamment :</p>
        <ul>
          <li>La documentation photographique des chantiers par zones</li>
          <li>La rédaction et la génération de journaux de chantier par intelligence artificielle</li>
          <li>La génération de rapports PDF</li>
          <li>La communication entre entrepreneurs, surintendants et sous-traitants</li>
        </ul>
      </Section>

      <Section titre="2. Admissibilité">
        <p>Vous devez avoir au moins 18 ans et être légalement en mesure de conclure des contrats pour utiliser le Service. Le Service est destiné aux professionnels de la construction au Canada.</p>
      </Section>

      <Section titre="3. Comptes et accès">
        <p><strong>Entrepreneur :</strong> vous créez un compte et êtes responsable de votre organisation et de tous les utilisateurs que vous invitez.</p>
        <p><strong>Surintendant :</strong> vous accédez au Service via une invitation de votre entrepreneur.</p>
        <p><strong>Sous-traitant :</strong> vous accédez au Service via un code à 6 caractères fourni par votre entrepreneur. Aucun compte permanent n&apos;est créé.</p>
        <p>Vous êtes responsable de maintenir la confidentialité de vos identifiants et de toutes les activités effectuées sous votre compte.</p>
      </Section>

      <Section titre="4. Abonnements et paiements">
        <p><strong>Plans payants :</strong> TraceChantier est offert selon différents plans tarifaires décrits sur la page d&apos;abonnement. Les prix sont en dollars canadiens, taxes applicables en sus (TPS + TVQ).</p>
        <p><strong>Facturation :</strong> les abonnements sont facturés mensuellement via Stripe. Votre carte sera débitée automatiquement à chaque renouvellement.</p>
        <p><strong>Essai gratuit :</strong> un essai de 14 jours est offert sans carte de crédit. À la fin de l&apos;essai, l&apos;accès aux fonctionnalités payantes est suspendu si aucun abonnement n&apos;est souscrit.</p>
        <p><strong>Annulation :</strong> vous pouvez annuler votre abonnement à tout moment depuis l&apos;application. L&apos;annulation prend effet à la fin de la période de facturation en cours. Aucun remboursement n&apos;est accordé pour les périodes partielles.</p>
        <p><strong>Modifications tarifaires :</strong> nous nous réservons le droit de modifier nos tarifs avec un préavis de 30 jours par courriel.</p>
      </Section>

      <Section titre="5. Contenu utilisateur">
        <p>Vous conservez la propriété de tout le contenu que vous téléversez (photos, notes, journaux). En utilisant le Service, vous nous accordez une licence limitée, non exclusive, pour héberger et traiter ce contenu dans le seul but de vous fournir le Service.</p>
      </Section>

      <Section titre="6. Intelligence artificielle et exactitude des données">
        <p>Les résumés et rapports générés par intelligence artificielle sont fournis à titre informatif. TraceChantier ne garantit pas l&apos;exactitude, l&apos;exhaustivité ou la valeur légale des contenus générés automatiquement. Nous vous recommandons de consulter un avocat pour toute situation litigieuse.</p>
      </Section>

      <Section titre="7. Utilisation acceptable">
        <p>Il est interdit d&apos;utiliser le Service pour :</p>
        <ul>
          <li>Téléverser du contenu illégal, diffamatoire ou portant atteinte à la vie privée</li>
          <li>Tenter d&apos;accéder aux données d&apos;autres utilisateurs ou entreprises</li>
          <li>Contourner les mesures de sécurité</li>
          <li>Revendre ou sous-licencier l&apos;accès au Service sans notre autorisation</li>
        </ul>
      </Section>

      <Section titre="8. Limitation de responsabilité">
        <p>Notre responsabilité totale envers vous est limitée au montant que vous avez payé pour le Service au cours des 12 derniers mois.</p>
      </Section>

      <Section titre="9. Résiliation">
        <p>Nous nous réservons le droit de suspendre ou de résilier votre compte si vous violez ces Conditions. Vous pouvez résilier votre compte à tout moment depuis les paramètres de l&apos;application.</p>
      </Section>

      <Section titre="10. Droit applicable">
        <p>Ces Conditions sont régies par les lois de la province de Québec. Tout litige sera soumis à la compétence exclusive des tribunaux de Montréal, Québec.</p>
      </Section>

      <Section titre="11. Contact">
        <p>
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
