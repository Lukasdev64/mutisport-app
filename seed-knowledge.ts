import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import 'dotenv/config';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const knowledgeBase = [
  "Pour créer un tournoi, rendez-vous sur votre Dashboard et cliquez sur le bouton 'Nouveau Tournoi'. Cela lancera l'assistant de création (Wizard) qui vous guidera à travers le choix du sport, du format (élimination, championnat) et des règles.",
  "L'abonnement Premium offre plusieurs avantages exclusifs : tournois illimités, statistiques avancées, export des données, un badge Premium sur votre profil, et la vérification d'identité des participants. Vous pouvez y souscrire depuis la page Facturation.",
  "Oui, absolument. Nous avons un module spécifique pour le tennis (situé dans les réglages du tournoi) qui gère automatiquement les sets, les jeux, les tie-breaks et les configurations de match personnalisées.",
  "Vérifiez que vous êtes bien connecté. Si vous venez de créer le tournoi, assurez-vous d'avoir complété toutes les étapes du Wizard (Format, Règles, Participants). Vous pouvez aussi vérifier les filtres de sport sur le Dashboard.",
  "Vous pouvez gérer les invitations via le 'Registration Dashboard' de votre tournoi. Vous pouvez soit envoyer des invitations par email, soit partager un lien public d'inscription si le tournoi est ouvert.",
  "Le Bracket Display est la vue visuelle de l'arbre de votre tournoi. Il se met à jour automatiquement au fur et à mesure que vous entrez les scores des matchs dans l'arène du tournoi.",
  "Allez dans les Paramètres > Facturation (Billing). Vous pourrez y voir votre plan actuel. Si vous êtes en Free, vous pouvez cliquer sur 'Passer au Premium'. Si vous êtes déjà Premium, vous pouvez gérer votre abonnement via le portail Stripe intégré.",
  "Pour le Basket, notre système permet de saisir les scores par quart-temps ou le score global, et gère les fautes d'équipe si l'option est activée dans les paramètres du match.",
  "Si le paiement échoue, vérifiez que votre carte supporte le 3D Secure. Si le problème persiste, notez que nous utilisons Stripe pour sécuriser les transactions. Aucune donnée bancaire n'est stockée sur nos serveurs.",
  "L'export des données (CSV/PDF) est une fonctionnalité réservée aux membres Premium. Si vous avez l'abonnement adéquat, un bouton 'Exporter' apparaîtra dans le tableau de bord de votre tournoi.",
  "Au tennis, les points se comptent de manière standard : 0 (Zéro), 15, 30, 40, et Jeu. Si les deux joueurs sont à 40-40, il y a 'Égalité' (Deuce). Il faut alors marquer deux points consécutifs (Avantage, puis Jeu) pour remporter le jeu.",
  "Un Tie-break (ou jeu décisif) se joue généralement quand le score du set atteint 6-6. Contrairement aux jeux normaux, on compte les points 1, 2, 3... Le premier joueur à atteindre 7 points avec 2 points d'écart gagne le set (score final 7-6).",
  "Cela dépend du format du tournoi configuré dans l'application. Généralement, chez les hommes en Grand Chelem c'est au meilleur des 5 sets (3 sets gagnants), mais dans la plupart des tournois amateurs gérés par MultiSport App, c'est au meilleur des 3 sets (2 sets gagnants).",
  "Si la balle touche le filet lors du service mais retombe quand même dans le carré de service adverse, c'est un 'Let'. Le service n'est pas compté comme une faute, mais il doit être rejoué.",
  "Selon les règles FIBA (généralement utilisées en Europe), un joueur est exclu après 5 fautes personnelles. En NBA, c'est après 6 fautes. Dans MultiSport App, vous pouvez configurer cette limite dans les règles du tournoi."
];

async function main() {
  for (const text of knowledgeBase) {
    // Générer l'embedding
    const embeddingRes = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });
    const embedding = embeddingRes.data[0].embedding;

    // Insérer dans Supabase
    const { error } = await supabase
      .from('documents')
      .insert([{ content: text, embedding }]);

    if (error) {
      console.error('Erreur insertion:', error.message);
    } else {
      console.log('Ajouté:', text.slice(0, 40) + '...');
    }
  }
  console.log('Base de connaissances RAG remplie !');
}

main();
