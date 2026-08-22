import { X } from 'lucide-react';

function PrivacyPolicyModal({ onClose }) {
  return (
    <div className="participant-modal-overlay fixed inset-0 z-50 grid place-items-center p-4" onMouseDown={onClose}>
      <section
        className="participant-modal max-h-[92svh] w-[min(760px,100%)] overflow-y-auto rounded-2xl p-6"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4 border-b border-[var(--line)] pb-4">
          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-[0.08em] text-[var(--gold-text)]">PPP Togo 2026</p>
            <h2 className="m-0 text-2xl font-black text-[var(--text)]">Politique de confidentialite</h2>
            <p className="mt-2 text-sm font-bold text-[var(--muted)]">Derniere mise a jour : septembre 2026</p>
          </div>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full border-2 border-[var(--line-strong)] text-[var(--text)] transition hover:border-[var(--accent)]"
            onClick={onClose}
            title="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 text-sm leading-relaxed text-[var(--muted)]">
          <section>
            <h3 className="mb-2 text-base font-black text-[var(--text)]">1. Responsable du traitement</h3>
            <p>
              La plateforme DKCover est mise a disposition par DEKA Editions, en charge de la couverture
              mediatique et de la communication de l&apos;evenement « Partenariats Public-Prive (PPP) Togo 2026 ».
              DEKA Editions n&apos;est pas l&apos;organisateur de l&apos;evenement. Le responsable du traitement
              des donnees reste l&apos;organisateur officiel du PPP Togo 2026, assisted par DEKA Editions pour
              l&apos;exploitation technique de la plateforme.
            </p>
          </section>

          <section>
            <h3 className="mb-2 text-base font-black text-[var(--text)]">2. Donnees traitees</h3>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong className="text-[var(--text)]">Acces participant :</strong> code badge ou QR,
                eventuel code d&apos;acces a l&apos;evenement, stocke localement dans votre navigateur
                (sessionStorage) le temps de la consultation.
              </li>
              <li>
                <strong className="text-[var(--text)]">Consultation des medias :</strong> statistiques
                anonymisees (action vue/telechargement, empreinte hash de l&apos;adresse IP, type de
                navigateur) afin de mesurer l&apos;usage de la galerie.
              </li>
              <li>
                <strong className="text-[var(--text)]">Recherche « Mes photos » :</strong> selfie
                transmis temporairement pour comparaison faciale. Il n&apos;est ni enregistre, ni conserve
                apres la recherche. Seules les photos deja publiees dans les albums auxquels vous avez
                acces sont analysees.
              </li>
              <li>
                <strong className="text-[var(--text)]">Donnees faciales des photos d&apos;album :</strong>
                des signatures numeriques (embeddings) sont generees a partir des visages detectes sur
                les photos officielles, uniquement pour permettre la recherche par selfie.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="mb-2 text-base font-black text-[var(--text)]">3. Finalites</h3>
            <p>
              Les donnees sont traitees exclusivement pour : donner acces aux albums autorises,
              permettre le telechargement des medias, retrouver vos photos via reconnaissance faciale,
              et produire des statistiques d&apos;audience agreges pour l&apos;organisateur.
            </p>
          </section>

          <section>
            <h3 className="mb-2 text-base font-black text-[var(--text)]">4. Base legale</h3>
            <p>
              L&apos;acces a la galerie repose sur votre participation a l&apos;evenement et, le cas echeant,
              sur le consentement implicite en utilisant la fonction « Mes photos ». Les statistiques
              anonymisees reposent sur l&apos;interet legitime de l&apos;organisateur a evaluer la frequentation
              du service.
            </p>
          </section>

          <section>
            <h3 className="mb-2 text-base font-black text-[var(--text)]">5. Duree de conservation</h3>
            <ul className="list-disc space-y-2 pl-5">
              <li>Selfie : supprime immediatement apres traitement (non stocke).</li>
              <li>Code d&apos;acces navigateur : 24 heures maximum (session locale).</li>
              <li>Photos et embeddings faciaux : conserves pendant la duree de l&apos;evenement et supprimés
                dans un delai raisonnable apres sa cloture, sauf obligation legale contraire.</li>
              <li>Statistiques anonymisees : conservees a des fins de reporting, sans identification directe.</li>
            </ul>
          </section>

          <section>
            <h3 className="mb-2 text-base font-black text-[var(--text)]">6. Destinataires</h3>
            <p>
              Les donnees sont accessibles aux equipes techniques habilitees (hebergement, maintenance)
              et aux organisateurs de l&apos;evenement. Aucune revente ni cession a des tiers commerciaux
              n&apos;est effectuee. L&apos;hebergement est assure sur des serveurs securises.
            </p>
          </section>

          <section>
            <h3 className="mb-2 text-base font-black text-[var(--text)]">7. Vos droits</h3>
            <p>
              Conformement aux principes de protection des donnees personnelles, vous pouvez demander
              l&apos;acces, la rectification ou la suppression de vos donnees, ainsi que vous opposer a
              certains traitements lorsque la loi l&apos;autorise. Pour exercer vos droits, contactez
              l&apos;organisateur de l&apos;evenement PPP Togo 2026 via les canaux officiels de communication
              de l&apos;evenement.
            </p>
          </section>

          <section>
            <h3 className="mb-2 text-base font-black text-[var(--text)]">8. Securite</h3>
            <p>
              Des mesures techniques et organisationnelles sont mises en oeuvre : acces restreint aux
              albums, chiffrement des communications (HTTPS), limitation des requetes, hash des adresses
              IP dans les statistiques, et traitement facial isole sur infrastructure controlee.
            </p>
          </section>

          <section>
            <h3 className="mb-2 text-base font-black text-[var(--text)]">9. Camera et scan QR</h3>
            <p>
              L&apos;acces a la camera est utilise uniquement localement dans votre navigateur pour scanner
              un QR code de badge. Aucun flux video n&apos;est enregistre ni transmis au serveur.
            </p>
          </section>
        </div>
      </section>
    </div>
  );
}

export default PrivacyPolicyModal;
