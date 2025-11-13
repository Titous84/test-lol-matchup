import fs from 'fs';
import path from 'path';
import mongoose, { Types } from 'mongoose';
import { Champion } from '../src/models/Champion';
import { Matchup } from '../src/models/Matchup';
import { env } from '../src/config/env';

type RawRecord = Record<string, unknown>;
type NormalizedRow = {
  original: RawRecord;
  normalized: Record<string, unknown>;
};

type MatchupSource = {
  principal: string;
  adverse: string;
  voie: 'Top' | 'Jungle' | 'Mid' | 'Bot' | 'Support';
  nbParties: number;
  nbVictoires: number;
  nbDefaites: number;
  tauxVictoire: number;
  kdaMoyen: number;
  niveauAvantage: number;
  difficulte: 'Facile' | 'Équilibré' | 'Difficile';
  favorable: boolean;
  conseils: string[];
  tags: string[];
};

const DATA_DIR = path.resolve(
  process.argv[2] ?? path.join(__dirname, '..', 'dev', 'data'),
);
const CHAMPIONS_SOURCE = path.resolve(
  process.argv[3] ?? path.join(__dirname, '..', 'dev', 'champions.json'),
);

const normaliserCle = (valeur: string) =>
  valeur
    .normalize('NFD')
    .replace(/[^\w]/g, '')
    .toLowerCase();

const normaliserRow = (row: RawRecord): NormalizedRow => {
  const normalized: Record<string, unknown> = {};
  Object.entries(row).forEach(([key, value]) => {
    normalized[normaliserCle(key)] = value;
  });
  return { original: row, normalized };
};

const lireJsonArray = (chemin: string): RawRecord[] => {
  const contenu = fs.readFileSync(chemin, 'utf8').trim();
  if (!contenu) return [];
  const parsed = JSON.parse(contenu);
  if (Array.isArray(parsed)) return parsed as RawRecord[];
  if (Array.isArray(parsed.data)) return parsed.data as RawRecord[];
  if (parsed && typeof parsed === 'object') {
    return Object.values(parsed as Record<string, RawRecord>);
  }
  return [];
};

const lireCsv = (chemin: string): RawRecord[] => {
  const contenu = fs.readFileSync(chemin, 'utf8');
  const lignes = contenu
    .split(/\r?\n/)
    .map((ligne) => ligne.trim())
    .filter((ligne) => ligne.length > 0);
  if (!lignes.length) return [];
  const entetes = lignes[0];
  const delimiteur = entetes.split(';').length > entetes.split(',').length ? ';' : ',';
  const colonnes = entetes.split(delimiteur).map((col) => col.trim());
  return lignes.slice(1).map((ligne) => {
    const cellules = ligne.split(delimiteur);
    const objet: RawRecord = {};
    colonnes.forEach((colonne, index) => {
      objet[colonne] = cellules[index]?.trim() ?? '';
    });
    return objet;
  });
};

const lireFichier = (chemin: string) => {
  const extension = path.extname(chemin).toLowerCase();
  if (extension === '.json') return lireJsonArray(chemin);
  if (extension === '.csv') return lireCsv(chemin);
  console.warn(`⏭️  Fichier ignoré (${path.basename(chemin)})`);
  return [];
};

const valeurNumerique = (valeur: unknown): number | undefined => {
  if (typeof valeur === 'number' && Number.isFinite(valeur)) return valeur;
  if (typeof valeur === 'string') {
    const nettoyee = valeur.replace(/,/g, '.').replace(/[^0-9.-]/g, '');
    if (!nettoyee) return undefined;
    const parsed = Number(nettoyee);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
};

const valeurTexte = (valeur: unknown): string | undefined => {
  if (typeof valeur === 'string') {
    const texte = valeur.trim();
    return texte.length ? texte : undefined;
  }
  if (typeof valeur === 'number') return String(valeur);
  return undefined;
};

const valeurListe = (valeur: unknown): string[] => {
  if (Array.isArray(valeur)) {
    return valeur
      .map((item) => valeurTexte(item))
      .filter((item): item is string => Boolean(item))
      .map((item) => item.trim())
      .filter(Boolean);
  }
  const texte = valeurTexte(valeur);
  if (!texte) return [];
  return texte
    .split(/[,|;]/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const valeurBooleenne = (valeur: unknown, fallback: boolean): boolean => {
  if (typeof valeur === 'boolean') return valeur;
  if (typeof valeur === 'number') return valeur > 0;
  if (typeof valeur === 'string') {
    const normalisee = valeur.toLowerCase();
    if (['true', 'vrai', 'oui', 'win', 'gagnant', 'favorable', '1'].includes(normalisee)) {
      return true;
    }
    if (['false', 'faux', 'non', 'perdant', 'loss', '0'].includes(normalisee)) {
      return false;
    }
  }
  return fallback;
};

const normaliserVoie = (valeur?: string): MatchupSource['voie'] => {
  if (!valeur) return 'Mid';
  const texte = valeur.toLowerCase();
  if (texte.includes('top')) return 'Top';
  if (texte.includes('jung')) return 'Jungle';
  if (texte.includes('bot') || texte.includes('adc') || texte.includes('carry')) return 'Bot';
  if (texte.includes('sup')) return 'Support';
  return 'Mid';
};

const normaliserDifficulte = (valeur?: string | number): MatchupSource['difficulte'] => {
  if (typeof valeur === 'number') {
    if (valeur <= 3) return 'Facile';
    if (valeur >= 7) return 'Difficile';
    return 'Équilibré';
  }
  if (typeof valeur === 'string') {
    const texte = valeur.toLowerCase();
    if (['easy', 'facile', 'free'].includes(texte)) return 'Facile';
    if (['hard', 'difficile'].includes(texte)) return 'Difficile';
    if (['even', 'balanced', 'medium', 'équilibré'].includes(texte)) return 'Équilibré';
  }
  return 'Équilibré';
};

const normaliserMatchup = (row: RawRecord): MatchupSource | undefined => {
  const donnees = normaliserRow(row);
  const principal = valeurTexte(
    donnees.normalized.championprincipal ??
      donnees.normalized.mainchampion ??
      donnees.normalized.main ??
      donnees.normalized.champion ??
      donnees.normalized.bluechampion,
  );
  const adverse = valeurTexte(
    donnees.normalized.championadverse ??
      donnees.normalized.opponentchampion ??
      donnees.normalized.enemy ??
      donnees.normalized.opponent ??
      donnees.normalized.redchampion,
  );
  if (!principal || !adverse) {
    return undefined;
  }
  const nbParties =
    valeurNumerique(
      donnees.normalized.nbparties ??
        donnees.normalized.totalgames ??
        donnees.normalized.games ??
        donnees.normalized.matches,
    ) ?? 1;
  const nbVictoires =
    valeurNumerique(
      donnees.normalized.nbvictoires ??
        donnees.normalized.wins ??
        donnees.normalized.victoires,
    ) ?? 0;
  const nbDefaites =
    valeurNumerique(
      donnees.normalized.nbdefaites ??
        donnees.normalized.losses ??
        donnees.normalized.defaites,
    ) ?? Math.max(nbParties - nbVictoires, 0);
  let tauxVictoire =
    valeurNumerique(
      donnees.normalized.tauxvictoire ??
        donnees.normalized.winrate ??
        donnees.normalized.winpercent ??
        donnees.normalized.wr,
    ) ?? ((nbVictoires / nbParties) * 100 || 50);
  if (tauxVictoire <= 1) tauxVictoire *= 100;
  const kda =
    valeurNumerique(donnees.normalized.kda ?? donnees.normalized.kdaratio) ?? 2;
  const niveauAvantage = Math.min(
    18,
    Math.max(
      1,
      valeurNumerique(
        donnees.normalized.niveauavantage ??
          donnees.normalized.advantagelevel ??
          donnees.normalized.leveladvantage ??
          donnees.normalized.powerspike,
      ) ?? 6,
    ),
  );
  const difficulte = normaliserDifficulte(
    donnees.normalized.difficulte ?? donnees.normalized.difficulty,
  );
  const voie = normaliserVoie(
    valeurTexte(
      donnees.normalized.voie ??
        donnees.normalized.lane ??
        donnees.normalized.role ??
        donnees.normalized.position,
    ),
  );
  const favorable = valeurBooleenne(
    donnees.normalized.favorable ??
      donnees.normalized.outcome ??
      donnees.normalized.result,
    tauxVictoire >= 50,
  );
  return {
    principal,
    adverse,
    voie,
    nbParties,
    nbVictoires,
    nbDefaites: Math.max(Math.min(nbDefaites, nbParties), 0),
    tauxVictoire: Math.max(0, Math.min(100, Math.round(tauxVictoire))),
    kdaMoyen: Number(kda.toFixed(2)),
    niveauAvantage: Math.round(niveauAvantage),
    difficulte,
    favorable,
    conseils: valeurListe(
      donnees.normalized.conseils ??
        donnees.normalized.tips ??
        donnees.normalized.notes,
    ),
    tags: valeurListe(
      donnees.normalized.tags ??
        donnees.normalized.keywords ??
        donnees.normalized.style,
    ),
  };
};

const chargerChampions = () => {
  if (!fs.existsSync(CHAMPIONS_SOURCE)) {
    throw new Error(`Fichier champions introuvable: ${CHAMPIONS_SOURCE}`);
  }
  const brut = JSON.parse(fs.readFileSync(CHAMPIONS_SOURCE, 'utf8'));
  const data = brut.data ?? {};
  return Object.values(data).map((champion: any) => {
    const info = champion.info ?? {};
    const stats = champion.stats ?? {};
    const roles: string[] =
      Array.isArray(champion.tags) && champion.tags.length
        ? champion.tags
        : ['Inconnu'];
    const portee = (stats.attackrange ?? 450) >= 400 ? 'Distance' : 'Corps à corps';
    const mobilite = Math.max(
      0,
      Math.min(10, Math.round(((stats.movespeed ?? 325) - 300) / 10)),
    );
    return {
      nom: champion.name,
      titre: champion.title,
      roles,
      region: champion.partype ?? 'Runeterra',
      difficulte: info.difficulty ?? 5,
      attaque: info.attack ?? 0,
      defense: info.defense ?? 0,
      magie: info.magic ?? 0,
      mobilite,
      portee,
      icone: `/images/champions/${champion.id}.png`,
      enRotation: false,
      tags: roles,
    };
  });
};

const chargerMatchups = () => {
  if (!fs.existsSync(DATA_DIR)) {
    console.warn(`ℹ️  Aucun dossier de données trouvé: ${DATA_DIR}`);
    return [];
  }
  const fichiers = fs
    .readdirSync(DATA_DIR)
    .filter((fichier) => /\.(json|csv)$/i.test(fichier));
  if (!fichiers.length) {
    console.warn('ℹ️  Aucun fichier .csv/.json détecté dans dev/data.');
    return [];
  }
  const contenus: { fichier: string; valeur: RawRecord }[] = [];
  fichiers.forEach((fichier) => {
    const chemin = path.join(DATA_DIR, fichier);
    const lignes = lireFichier(chemin);
    lignes.forEach((valeur) => contenus.push({ fichier, valeur }));
  });
  return contenus
    .map(({ fichier, valeur }) => {
      const normalise = normaliserMatchup(valeur);
      return normalise
        ? { source: fichier, ...normalise }
        : undefined;
    })
    .filter((item): item is MatchupSource & { source: string } => Boolean(item));
};

const normaliserCleNom = (nom: string) =>
  nom
    .normalize('NFD')
    .replace(/[^a-z0-9]/gi, '')
    .toLowerCase();

const insererChampions = async () => {
  const champions = chargerChampions();
  await Champion.deleteMany({});
  const docs = await Champion.insertMany(champions);
  const dictionnaire = new Map<string, Types.ObjectId>();
  docs.forEach((doc) => {
    dictionnaire.set(normaliserCleNom(doc.nom), doc._id);
  });
  return dictionnaire;
};

const insererMatchups = async (
  dictionnaire: Map<string, Types.ObjectId>,
  sources: (MatchupSource & { source: string })[],
) => {
  if (!sources.length) {
    console.warn('ℹ️  Aucun matchup à importer.');
    await Matchup.deleteMany({});
    return { inseres: 0, ignores: 0 };
  }
  const matchups: any[] = [];
  let ignores = 0;
  sources.forEach((source) => {
    const principalId = dictionnaire.get(normaliserCleNom(source.principal));
    const adverseId = dictionnaire.get(normaliserCleNom(source.adverse));
    if (!principalId || !adverseId) {
      ignores += 1;
      return;
    }
    const nbVictoires = Math.min(source.nbVictoires, source.nbParties);
    const nbDefaites = Math.min(
      source.nbDefaites,
      source.nbParties - nbVictoires,
    );
    const tauxVictoire = Math.round((nbVictoires / source.nbParties) * 100);
    matchups.push({
      championPrincipal: principalId,
      championAdverse: adverseId,
      voie: source.voie,
      nbParties: source.nbParties,
      nbVictoires,
      nbDefaites,
      tauxVictoire,
      kdaMoyen: source.kdaMoyen,
      niveauAvantage: source.niveauAvantage,
      difficulte: source.difficulte,
      favorable: source.favorable,
      conseils: source.conseils,
      tags: source.tags,
    });
  });
  await Matchup.deleteMany({});
  if (matchups.length) {
    await Matchup.insertMany(matchups);
  }
  return { inseres: matchups.length, ignores };
};

(async () => {
  try {
    await mongoose.connect(env.mongodbUri);
    const dictionnaire = await insererChampions();
    const matchups = chargerMatchups();
    const resultat = await insererMatchups(dictionnaire, matchups);
    console.log(
      `✅ Import terminé : ${dictionnaire.size} champions, ${resultat.inseres} matchups.`,
    );
    if (resultat.ignores) {
      console.warn(`⚠️  ${resultat.ignores} matchups ignorés (champion introuvable).`);
    }
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Import impossible :', error);
    process.exit(1);
  }
})();
