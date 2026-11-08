
import Link from "next/link";

const sections = [
  {
    title: "1. Verantwortlicher",
    content: (
      <>
        <p>
          Verantwortlich für die Verarbeitung personenbezogener Daten im
          Zusammenhang mit EXODUS RANKED ist:
        </p>
        <p>
          <strong>Philip Sturm</strong>
          <br />
          <a
            href="mailto:Lolyisteingott@gmail.com"
            className="text-purple-400 hover:text-purple-300"
          >
            Lolyisteingott@gmail.com
          </a>
        </p>
        <p>
          Website:{" "}
          <a
            href="https://exodus-ranked.vercel.app"
            className="text-purple-400 hover:text-purple-300"
          >
            exodus-ranked.vercel.app
          </a>
        </p>
      </>
    ),
  },
  {
    title: "2. Allgemeine Informationen",
    content: (
      <p>
        Der Schutz deiner personenbezogenen Daten ist uns wichtig. In dieser
        Datenschutzerklärung informieren wir darüber, welche personenbezogenen
        Daten bei der Nutzung von EXODUS RANKED verarbeitet werden, zu welchen
        Zwecken dies geschieht und welche Rechte du hast.
        Die Verarbeitung erfolgt im Rahmen der geltenden Datenschutzbestimmungen,
        insbesondere der Datenschutz-Grundverordnung (DSGVO).
      </p>
    ),
  },
  {
    title: "3. Welche Daten werden verarbeitet?",
    content: (
      <>
        <p><strong>Bei der Registrierung und Anmeldung:</strong></p>
        <ul>
          <li>E-Mail-Adresse</li>
          <li>Passwort bzw. erforderliche Authentifizierungsdaten</li>
          <li>Minecraft-Benutzername</li>
          <li>Minecraft-UUID</li>
          <li>Benutzerkonto-ID</li>
        </ul>

        <p><strong>Bei der Nutzung der Website:</strong></p>
        <ul>
          <li>Spielerprofile und Profilinformationen</li>
          <li>PvP-Ränge und Ranking-Ergebnisse</li>
          <li>Turnierteilnahmen und Turnierergebnisse</li>
          <li>Tier-Test-Anfragen und zugehörige Ergebnisse</li>
        </ul>

        <p><strong>Technische Daten:</strong></p>
        <ul>
          <li>IP-Adresse</li>
          <li>Informationen über Browser und Gerät</li>
          <li>Zugriffszeitpunkte und technische Protokolldaten</li>
        </ul>
        <p>
          Technische Daten können durch die eingesetzten Hosting- und
          Plattformdienste verarbeitet werden.
        </p>
      </>
    ),
  },
  {
    title: "4. Zweck und Rechtsgrundlage der Datenverarbeitung",
    content: (
      <>
        <p>Die Daten werden für folgende Zwecke verarbeitet:</p>
        <ul>
          <li>Erstellung und Verwaltung von Benutzerkonten</li>
          <li>Anmeldung und Authentifizierung</li>
          <li>Zuordnung von Minecraft-Profilen</li>
          <li>Anzeige und Verwaltung von PvP-Rankings</li>
          <li>Organisation und Durchführung von Turnieren</li>
          <li>Bearbeitung von Tier-Test-Anfragen</li>
          <li>Sicherstellung des technischen Betriebs und der Sicherheit</li>
        </ul>
        <p>
          Die Verarbeitung erfolgt – abhängig vom jeweiligen Zweck –
          insbesondere auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO,
          Art. 6 Abs. 1 lit. f DSGVO oder einer gegebenenfalls erteilten
          Einwilligung.
        </p>
      </>
    ),
  },
  {
    title: "5. Eingesetzte Dienste",
    content: (
      <>
        <h3 className="font-semibold text-white">Supabase</h3>
        <p>
          Für die Anmeldung, Authentifizierung und Speicherung der Daten
          verwenden wir Supabase. Dabei können insbesondere E-Mail-Adressen,
          Authentifizierungsdaten, Benutzerkonten, Minecraft-Informationen und
          Ranking-Daten verarbeitet werden.
        </p>
        <p>
          Datenschutzerklärung:{" "}
          <a
            href="https://supabase.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300"
          >
            supabase.com/privacy
          </a>
        </p>

        <h3 className="mt-5 font-semibold text-white">Vercel</h3>
        <p>
          Unsere Website wird über Vercel bereitgestellt und gehostet.
          Dabei können technisch notwendige Daten wie IP-Adressen,
          Zugriffszeitpunkte und Browserinformationen verarbeitet werden.
        </p>
        <p>
          Datenschutzerklärung:{" "}
          <a
            href="https://vercel.com/legal/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300"
          >
            vercel.com/legal/privacy-policy
          </a>
        </p>

        <h3 className="mt-5 font-semibold text-white">
          Minecraft-Dienste von Mojang
        </h3>
        <p>
          Zur Ermittlung von Minecraft-Profilinformationen und zum Abrufen
          von Skin-Texturen können Anfragen an öffentliche Minecraft-Dienste
          von Mojang erfolgen. Dabei werden je nach Anfrage Minecraft-
          Benutzernamen oder UUIDs verarbeitet.
        </p>
      </>
    ),
  },
  {
    title: "6. E-Mail-Kommunikation",
    content: (
      <p>
        Im Rahmen der Registrierung und Anmeldung können automatisch E-Mails
        versendet werden, beispielsweise zur Bestätigung einer E-Mail-Adresse
        oder zur Unterstützung der Kontoverwaltung. Der Versand erfolgt über
        die dafür eingesetzten Authentifizierungsdienste. Newsletter werden
        derzeit nicht versendet.
      </p>
    ),
  },
  {
    title: "7. Speicherung und Löschung der Daten",
    content: (
      <p>
        Personenbezogene Daten werden nur so lange gespeichert, wie dies für
        die genannten Zwecke erforderlich ist oder gesetzliche
        Aufbewahrungspflichten bestehen. Bei einer Anfrage auf Löschung
        werden die betreffenden Daten geprüft und gelöscht, soweit keine
        gesetzlichen oder sonstigen zulässigen Gründe für eine weitere
        Speicherung bestehen. Technische Protokoll- und Sicherungsdaten
        können entsprechend den Aufbewahrungsfristen der eingesetzten
        Anbieter länger gespeichert bleiben.
      </p>
    ),
  },
  {
    title: "8. Weitergabe von Daten",
    content: (
      <p>
        Eine Weitergabe personenbezogener Daten erfolgt nur, soweit dies
        für den Betrieb von EXODUS RANKED erforderlich ist, eine gesetzliche
        Verpflichtung besteht oder eine andere zulässige Rechtsgrundlage
        vorliegt. Insbesondere können Daten durch die genannten technischen
        Dienstleister verarbeitet werden. Eine Weitergabe zu Werbezwecken
        oder ein Verkauf personenbezogener Daten findet nicht statt.
      </p>
    ),
  },
  {
    title: "9. Deine Rechte",
    content: (
      <>
        <p>Du hast im Rahmen der gesetzlichen Bestimmungen insbesondere folgende Rechte:</p>
        <ul>
          <li>Recht auf Auskunft</li>
          <li>Recht auf Berichtigung unrichtiger Daten</li>
          <li>Recht auf Löschung deiner Daten</li>
          <li>Recht auf Einschränkung der Verarbeitung</li>
          <li>Recht auf Datenübertragbarkeit</li>
          <li>Recht auf Widerspruch gegen bestimmte Verarbeitungen</li>
          <li>Recht auf Widerruf einer erteilten Einwilligung</li>
        </ul>
        <p>
          Zur Ausübung deiner Rechte kannst du dich an die oben angegebene
          Kontaktadresse wenden.
        </p>
      </>
    ),
  },
  {
    title: "10. Beschwerderecht",
    content: (
      <p>
        Wenn du der Ansicht bist, dass die Verarbeitung deiner
        personenbezogenen Daten gegen Datenschutzrecht verstößt, hast du
        das Recht, Beschwerde bei der zuständigen Datenschutzaufsichtsbehörde
        einzulegen. In Österreich ist dies die{" "}
        <a
          href="https://www.dsb.gv.at/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-400 hover:text-purple-300"
        >
          Österreichische Datenschutzbehörde
        </a>.
      </p>
    ),
  },
  {
    title: "11. Änderungen dieser Datenschutzerklärung",
    content: (
      <p>
        Wir behalten uns vor, diese Datenschutzerklärung anzupassen, wenn
        sich Funktionen, technische Dienste oder rechtliche Anforderungen
        ändern. Es gilt jeweils die auf dieser Website veröffentlichte
        aktuelle Fassung.
      </p>
    ),
  },
];

export default function DatenschutzPage() {
  return (
    <main className="min-h-screen bg-[#090711] px-5 py-16 text-gray-300">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="mb-8 inline-flex text-sm text-purple-400 transition hover:text-purple-300"
        >
          ← Zurück zur Startseite
        </Link>

        <div className="mb-10 border-b border-white/10 pb-8">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-purple-400">
            EXODUS RANKED
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Datenschutzerklärung
          </h1>
          <p className="mt-4 text-sm text-gray-500">
            Stand: November 2026
          </p>
        </div>

        <div className="space-y-8">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-2xl border border-white/10 bg-[#12101c] p-6 sm:p-8"
            >
              <h2 className="mb-4 text-xl font-bold text-white">
                {section.title}
              </h2>
              <div className="space-y-4 text-sm leading-7 text-gray-400 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
                {section.content}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-center text-xs text-gray-600">
          © 2026 EXODUS RANKED. All rights reserved.
        </div>
      </div>
    </main>
  );
}
