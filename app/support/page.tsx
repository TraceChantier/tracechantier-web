export default function SupportPage() {
  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '48px 24px', fontFamily: 'system-ui, sans-serif', color: '#1A3A5C', lineHeight: 1.7 }}>
      <a href="/" style={{ color: '#1B5FA8', fontSize: 13, textDecoration: 'none', display: 'inline-block', marginBottom: 32 }}>← Retour</a>

      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>Assistance — TraceChantier</h1>
      <p style={{ color: '#5B87B5', fontSize: 15, marginBottom: 40 }}>
        Une question ? Un problème ? On est là.
      </p>

      {/* Contact */}
      <div style={{ backgroundColor: '#F0F6FC', borderRadius: 14, padding: '28px 32px', marginBottom: 32, borderLeft: '4px solid #1B5FA8' }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, marginTop: 0 }}>Nous écrire</h2>
        <p style={{ margin: 0, color: '#2C5282' }}>
          Pour toute question, problème technique ou demande de remboursement, écrivez-nous à :{' '}
          <a href="mailto:tracechantier@outlook.com" style={{ color: '#1B5FA8', fontWeight: 600 }}>
            tracechantier@outlook.com
          </a>
        </p>
        <p style={{ margin: '12px 0 0', color: '#5B87B5', fontSize: 13 }}>
          Réponse dans les 24 heures ouvrables (du lundi au vendredi).
        </p>
      </div>

      {/* FAQ */}
      <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 20 }}>Questions fréquentes</h2>

      <Question q="Comment inviter un sous-traitant ?">
        Dans l&apos;app, ouvrez votre chantier, puis allez dans l&apos;onglet <strong>ST</strong>. Copiez le code à 6 caractères et envoyez-le à votre sous-traitant par texto ou par courriel. Il n&apos;a pas besoin de créer un compte — il entre le code directement dans l&apos;app.
      </Question>

      <Question q="L'app fonctionne-t-elle sans internet ?">
        Oui. Les photos et journaux pris hors ligne sont sauvegardés localement et se synchronisent automatiquement dès que vous retrouvez une connexion réseau.
      </Question>

      <Question q="Comment annuler mon abonnement ?">
        Dans l&apos;app, allez dans <strong>Profil → Abonnement → Gérer mon abonnement</strong>. Vous pouvez annuler à tout moment. L&apos;accès reste actif jusqu&apos;à la fin de la période payée.
      </Question>

      <Question q="Mes photos sont-elles sécurisées ?">
        Oui. Toutes vos photos et données sont stockées sur des serveurs sécurisés (Supabase/AWS). Seuls vous et les membres que vous invitez peuvent y accéder. Consultez notre{' '}
        <a href="/confidentialite" style={{ color: '#1B5FA8' }}>politique de confidentialité</a> pour les détails.
      </Question>

      <Question q="J'ai perdu l'accès à mon compte, que faire ?">
        Sur l&apos;écran de connexion, tapez <strong>Mot de passe oublié</strong> et entrez votre courriel. Vous recevrez un lien pour réinitialiser votre mot de passe. Si vous ne recevez rien dans 5 minutes, vérifiez vos courriels indésirables ou écrivez-nous directement.
      </Question>

      <Question q="Est-ce que TraceChantier fonctionne sur Android ?">
        L&apos;application est présentement disponible sur iOS (iPhone). La version Android est en développement — écrivez-nous pour être notifié à sa sortie.
      </Question>

      {/* Liens légaux */}
      <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid #D0E4F4', display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <a href="/cgu" style={{ color: '#5B87B5', fontSize: 13, textDecoration: 'none' }}>Conditions d&apos;utilisation</a>
        <a href="/confidentialite" style={{ color: '#5B87B5', fontSize: 13, textDecoration: 'none' }}>Politique de confidentialité</a>
        <span style={{ color: '#9BBAD6', fontSize: 13 }}>© 2026 TraceChantier</span>
      </div>
    </div>
  )
}

function Question({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28, paddingBottom: 28, borderBottom: '1px solid #E8F2FC' }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, marginTop: 0, color: '#1A3A5C' }}>{q}</h3>
      <div style={{ color: '#2C5282', fontSize: 14 }}>{children}</div>
    </div>
  )
}
