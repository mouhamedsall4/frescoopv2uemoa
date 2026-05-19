#!/usr/bin/env python3
"""Generate FresCoop - Dossier Complet GIM-UEMOA Hackathon 2026 (PDF)"""

from fpdf import FPDF
import os

class FresCoop_PDF(FPDF):
    def __init__(self):
        super().__init__()
        self.set_auto_page_break(auto=True, margin=25)

    def header(self):
        if self.page_no() > 1:
            self.set_font('Helvetica', 'B', 8)
            self.set_text_color(31, 131, 93)
            self.cell(0, 8, 'FresCoop | Dossier GIM-UEMOA Hackathon 2026', align='L')
            self.cell(0, 8, f'Page {self.page_no()}', align='R', new_x='LMARGIN', new_y='NEXT')
            self.set_draw_color(31, 131, 93)
            self.line(10, 18, 200, 18)
            self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 7)
        self.set_text_color(150, 150, 150)
        self.cell(0, 10, 'Confidentiel - FresCoop UEMOA 2026', align='C')

    def title_page(self):
        self.add_page()
        self.ln(30)
        # Logo area
        self.set_fill_color(6, 47, 39)
        self.set_draw_color(31, 131, 93)
        self.rect(85, 40, 40, 40, style='DF')
        self.set_font('Helvetica', 'B', 28)
        self.set_text_color(52, 211, 153)
        self.set_xy(85, 50)
        self.cell(40, 20, 'F', align='C')

        self.ln(45)
        self.set_font('Helvetica', 'B', 32)
        self.set_text_color(6, 47, 39)
        self.cell(0, 14, 'FresCoop', align='C', new_x='LMARGIN', new_y='NEXT')

        self.set_font('Helvetica', '', 14)
        self.set_text_color(100, 100, 100)
        self.cell(0, 10, "De l'invisible au financable", align='C', new_x='LMARGIN', new_y='NEXT')

        self.ln(10)
        self.set_draw_color(52, 211, 153)
        self.set_line_width(0.8)
        self.line(70, self.get_y(), 140, self.get_y())
        self.ln(10)

        self.set_font('Helvetica', 'B', 12)
        self.set_text_color(31, 131, 93)
        self.cell(0, 8, 'Dossier Complet', align='C', new_x='LMARGIN', new_y='NEXT')
        self.cell(0, 8, 'GIM-UEMOA Hackathon FinTech 2026', align='C', new_x='LMARGIN', new_y='NEXT')

        self.ln(20)
        self.set_font('Helvetica', '', 10)
        self.set_text_color(80, 80, 80)
        items = [
            "Scoring de bancabilite agricole",
            "Credit-scoring alternatif pour agriculteurs UEMOA",
            "Zero frais pour les agriculteurs",
            "Scalable a 8 pays, 70M+ d'agriculteurs"
        ]
        for item in items:
            self.cell(0, 7, f"   {item}", align='C', new_x='LMARGIN', new_y='NEXT')

        self.ln(20)
        self.set_font('Helvetica', 'I', 9)
        self.set_text_color(130, 130, 130)
        self.cell(0, 6, 'Mai 2026 | Zone UEMOA', align='C', new_x='LMARGIN', new_y='NEXT')

    def section_title(self, num, title, subtitle=''):
        self.add_page()
        self.set_fill_color(6, 47, 39)
        self.rect(10, 25, 190, 0.5, 'F')
        self.ln(5)
        self.set_font('Helvetica', 'B', 10)
        self.set_text_color(31, 131, 93)
        self.cell(0, 8, f'SECTION {num}', new_x='LMARGIN', new_y='NEXT')
        self.set_font('Helvetica', 'B', 22)
        self.set_text_color(6, 47, 39)
        self.cell(0, 12, title, new_x='LMARGIN', new_y='NEXT')
        if subtitle:
            self.set_font('Helvetica', '', 11)
            self.set_text_color(100, 100, 100)
            self.cell(0, 7, subtitle, new_x='LMARGIN', new_y='NEXT')
        self.ln(8)

    def body_text(self, text):
        self.set_font('Helvetica', '', 10)
        self.set_text_color(50, 50, 50)
        self.multi_cell(0, 6, text)
        self.ln(3)

    def bold_text(self, text):
        self.set_font('Helvetica', 'B', 10)
        self.set_text_color(6, 47, 39)
        self.multi_cell(0, 6, text)
        self.ln(2)

    def bullet(self, text, indent=10):
        self.set_font('Helvetica', '', 10)
        self.set_text_color(50, 50, 50)
        x = self.get_x()
        self.set_x(x + indent)
        self.set_font('ZapfDingbats', '', 6)
        self.cell(4, 6, 'l')
        self.set_font('Helvetica', '', 10)
        self.multi_cell(0, 6, text)
        self.ln(1)

    def stat_box(self, stat, label):
        self.set_font('Helvetica', 'B', 16)
        self.set_text_color(31, 131, 93)
        self.cell(45, 8, stat, align='C')
        self.set_font('Helvetica', '', 9)
        self.set_text_color(100, 100, 100)
        self.cell(45, 8, label)
        self.ln(8)

    def sub_heading(self, text):
        self.ln(4)
        self.set_font('Helvetica', 'B', 12)
        self.set_text_color(6, 47, 39)
        self.cell(0, 8, text, new_x='LMARGIN', new_y='NEXT')
        self.ln(2)

    def question_block(self, question, answer):
        self.set_x(10)
        self.set_font('Helvetica', 'B', 10)
        self.set_text_color(31, 131, 93)
        self.multi_cell(0, 6, f'Q: {question}')
        self.set_x(10)
        self.set_font('Helvetica', '', 10)
        self.set_text_color(50, 50, 50)
        self.multi_cell(0, 6, f'R: {answer}')
        self.ln(5)


def generate():
    pdf = FresCoop_PDF()

    # === PAGE 1: TITLE ===
    pdf.title_page()

    # === PAGE 2: LE PROBLEME ===
    pdf.section_title('01', 'Le Probleme', "80% des agriculteurs UEMOA n'ont aucun acces au credit")

    pdf.bold_text("Le paradoxe agricole en Afrique de l'Ouest")
    pdf.body_text(
        "L'agriculture represente 35% du PIB de la zone UEMOA et emploie 60% de la population active. "
        "Pourtant, les agriculteurs ne recoivent que 3% des credits bancaires. "
        "Ce n'est pas un probleme de risque reel : c'est un probleme d'information."
    )

    pdf.sub_heading("Les chiffres cles")
    pdf.bullet("80% des agriculteurs UEMOA sont exclus du systeme financier formel")
    pdf.bullet("Taux de rejet des demandes de credit agricole : 92%")
    pdf.bullet("Seuls 6% des terres sont utilisees comme garantie (pas de titres fonciers)")
    pdf.bullet("Cout moyen d'evaluation d'un dossier agricole : 150 000 FCFA")
    pdf.bullet("Delai moyen de traitement : 4 a 8 mois")
    pdf.bullet("70M+ d'agriculteurs dans les 8 pays UEMOA")

    pdf.sub_heading("Pourquoi les banques refusent")
    pdf.body_text(
        "Les institutions financieres n'ont pas les outils pour evaluer le risque agricole. "
        "Les agriculteurs n'ont pas d'historique bancaire, pas de bilan comptable, pas de garanties classiques. "
        "Le cout d'evaluation depasse souvent le montant du credit demande.\n\n"
        "Resultat : un cercle vicieux ou les agriculteurs restent informels, ne construisent "
        "jamais d'historique, et ne deviennent jamais bancables."
    )

    pdf.sub_heading("Les consequences")
    pdf.bullet("Rendements agricoles 3x inferieurs au potentiel (pas d'investissement)")
    pdf.bullet("Pertes post-recolte de 30-40% (pas de stockage)")
    pdf.bullet("Dependance aux intermediaires predateurs (taux informels 50-200%)")
    pdf.bullet("Insecurite alimentaire pour 30M de personnes")

    # === PAGE 3: LA SOLUTION ===
    pdf.section_title('02', 'La Solution FresCoop', "Le credit-scoring alternatif qui rend visible l'invisible")

    pdf.bold_text("FresCoop transforme l'activite agricole quotidienne en score de bancabilite")
    pdf.body_text(
        "Nous avons cree une plateforme qui collecte et analyse les donnees d'activite commerciale "
        "des agriculteurs (ventes, livraisons, regularite, reputation) pour generer un score de "
        "creditworthiness comprehensible par les institutions financieres.\n\n"
        "En 90 jours d'utilisation normale, un agriculteur construit un dossier bancable "
        "- sans paperasse, sans frais, sans garantie traditionnelle."
    )

    pdf.sub_heading("Le Score de Bancabilite (0-100)")
    pdf.body_text("Notre algorithme analyse 12 criteres ponderes :")
    pdf.bullet("Profil complet et identite verifiee (18 pts) - KYC progressif")
    pdf.bullet("Produits publies et diversite (15 pts) - capacite productive")
    pdf.bullet("Commandes recues et livrees (27 pts) - fiabilite commerciale")
    pdf.bullet("Paiements recus reguliers (12 pts) - flux financiers")
    pdf.bullet("Anciennete et regularite (16 pts) - stabilite")
    pdf.bullet("Dossiers et preuves verifies (12 pts) - tracabilite")

    pdf.sub_heading("Les seuils")
    pdf.bullet("0-39 : Debutant - en construction de dossier")
    pdf.bullet("40-59 : En progression - premiers elements de creditworthiness")
    pdf.bullet("60-79 : Bancable - eligible aux microfinances partenaires")
    pdf.bullet("80-100 : Excellent - eligible aux credits bancaires classiques")

    pdf.sub_heading("Differenciation vs la concurrence")
    pdf.bullet("Zero frais pour l'agriculteur (modele B2B)")
    pdf.bullet("Pas de smartphone requis (agents terrain pour saisie)")
    pdf.bullet("Scoring base sur l'activite reelle, pas sur des declarations")
    pdf.bullet("Conforme BCEAO et reglementation GIM-UEMOA")
    pdf.bullet("Multi-acteurs : agriculteurs, acheteurs, agents, banques")

    # === PAGE 4: COMMENT CA MARCHE ===
    pdf.section_title('03', 'Comment ca Marche', "Un parcours simple en 4 etapes")

    pdf.sub_heading("Etape 1 : Inscription (Jour 1)")
    pdf.body_text(
        "L'agriculteur s'inscrit via l'app mobile ou avec l'aide d'un agent terrain. "
        "Il renseigne son nom, region, culture principale. Pas de paperasse. "
        "Un agent terrain peut verifier son identite (CNI) pour debloquer le niveau 2."
    )

    pdf.sub_heading("Etape 2 : Activite quotidienne (Jours 1-90)")
    pdf.body_text(
        "L'agriculteur utilise FresCoop comme sa marketplace B2B :\n"
        "- Il publie ses produits avec photos, prix, quantites\n"
        "- Il recoit des commandes d'acheteurs (commercants, cooperatives, export)\n"
        "- Il livre et confirme les paiements\n"
        "- Chaque action alimente son score automatiquement"
    )

    pdf.sub_heading("Etape 3 : Score construit (Jour 90)")
    pdf.body_text(
        "Apres 90 jours d'activite reguliere, l'agriculteur atteint un score suffisant. "
        "Son tableau de bord affiche son score, les criteres completes, et les recommandations. "
        "Un dossier bancaire standardise est genere automatiquement."
    )

    pdf.sub_heading("Etape 4 : Acces au credit")
    pdf.body_text(
        "Le dossier est partage (avec consentement) aux institutions financieres partenaires. "
        "La banque/IMF a toutes les donnees : historique de ventes, regularite, reputation. "
        "Decision en jours au lieu de mois. Taux adapte au profil de risque reel."
    )

    pdf.sub_heading("Les acteurs de l'ecosysteme")
    pdf.bullet("Agriculteur : vend, livre, construit son score gratuitement")
    pdf.bullet("Acheteur B2B : achete en gros, note les agriculteurs")
    pdf.bullet("Agent terrain : verifie identites, accompagne les agriculteurs")
    pdf.bullet("Partenaire financier : recoit les dossiers, octroie les credits")
    pdf.bullet("Admin : supervise, configure, analyse les donnees")

    # === PAGE 5: GARANTIES ===
    pdf.section_title('04', 'Systeme de Garanties', "4 couches de protection pour reduire le risque a quasi-zero")

    pdf.bold_text("Taux de defaut cible : < 3% (vs 15% secteur informel)")
    pdf.ln(3)

    pdf.sub_heading("Couche 1 : Scoring predictif")
    pdf.body_text(
        "Notre algorithme est base sur des donnees reelles et verifiees. "
        "Chaque critere est pondere par son pouvoir predictif de remboursement. "
        "Seuls les scores >= 60 sont recommandes pour un credit."
    )

    pdf.sub_heading("Couche 2 : Caution solidaire digitale")
    pdf.body_text(
        "Les agriculteurs d'une meme cooperative/zone se portent caution mutuellement. "
        "Un fonds de garantie mutuel est alimente par 2% de chaque transaction. "
        "Pression sociale positive : si un membre defaille, le groupe intervient."
    )

    pdf.sub_heading("Couche 3 : Tracabilite complete")
    pdf.body_text(
        "Chaque transaction est enregistree avec horodatage, geolocalisation, et preuves photo. "
        "L'agent terrain effectue des verifications terrain aleatoires. "
        "Impossible de falsifier un historique de 90 jours d'activite coherente."
    )

    pdf.sub_heading("Couche 4 : Assurance indicielle")
    pdf.body_text(
        "Partenariat avec des assureurs pour couvrir les aleas climatiques. "
        "Declenchement automatique base sur les donnees satellite (NDVI, pluviometrie). "
        "L'agriculteur est protege, la banque est couverte."
    )

    pdf.sub_heading("Resultats attendus")
    pdf.bullet("Taux de defaut < 3% (vs 15% informel, 8% microfinance classique)")
    pdf.bullet("Recovery rate > 95% grace a la caution solidaire")
    pdf.bullet("Cout du risque divise par 5 pour les partenaires financiers")

    # === PAGE 6: MODELE ECONOMIQUE ===
    pdf.section_title('05', 'Modele Economique', "Gratuit pour les agriculteurs, rentable des 100 utilisateurs actifs")

    pdf.bold_text("Principe fondamental : l'agriculteur ne paie JAMAIS")
    pdf.body_text(
        "FresCoop monetise aupres des institutions qui beneficient des donnees, "
        "jamais aupres des agriculteurs qui les produisent."
    )

    pdf.sub_heading("Sources de revenus")
    pdf.ln(2)

    pdf.bold_text("1. Commission sur credits octroyes (revenue principal)")
    pdf.bullet("2-5% du montant des credits facilites par FresCoop")
    pdf.bullet("Paye par l'institution financiere (inclus dans leurs frais de dossier)")
    pdf.bullet("Exemple : 100 agri x 500K FCFA credit moyen = 50M FCFA facilites")
    pdf.bullet("A 3% : 1 500 000 FCFA/an de cette source seule")

    pdf.bold_text("2. Abonnement SaaS partenaires")
    pdf.bullet("IMF/Banques : 50 000 - 200 000 FCFA/mois pour l'acces API scoring")
    pdf.bullet("Dashboard analytique, alertes, integration SI bancaire")
    pdf.bullet("Prix adapte au volume de dossiers traites")

    pdf.bold_text("3. Frais de transaction marketplace (optionnel)")
    pdf.bullet("1-2% sur les transactions B2B facilitees par la plateforme")
    pdf.bullet("Paye par l'acheteur (pas l'agriculteur)")
    pdf.bullet("Active uniquement quand le volume le justifie")

    pdf.sub_heading("Projection avec 100 agriculteurs actifs")
    pdf.bullet("Credits facilites : 50M FCFA/an")
    pdf.bullet("Revenue commissions : 1.5M FCFA/an")
    pdf.bullet("Revenue SaaS (2 partenaires) : 2.4M FCFA/an")
    pdf.bullet("Revenue transactions : 1M FCFA/an")
    pdf.bullet("TOTAL : ~5M FCFA/an | Breakeven en 6 mois")

    pdf.sub_heading("Couts")
    pdf.bullet("Hebergement cloud : 200K FCFA/an")
    pdf.bullet("Agents terrain (commission) : 500K FCFA/an")
    pdf.bullet("Operations : 300K FCFA/an")
    pdf.bullet("TOTAL couts : ~1M FCFA/an")
    pdf.bullet("Marge nette estimee : 80% a l'echelle")

    # === PAGE 7: IMPACT ===
    pdf.section_title('06', 'Impact Social & Economique', "Chaque agriculteur bancable, c'est une famille qui sort de la precarite")

    pdf.sub_heading("Impact direct mesurable")
    pdf.bullet("Revenus agricoles : +40% en moyenne apres acces au credit")
    pdf.bullet("Pertes post-recolte : -60% (investissement stockage)")
    pdf.bullet("Inclusion financiere : de 0 a 1 compte bancaire actif")
    pdf.bullet("Emploi : chaque exploitation financee cree 2-3 emplois saisonniers")

    pdf.sub_heading("Impact systemique")
    pdf.body_text(
        "FresCoop ne finance pas directement : il rend visible la solvabilite cachee. "
        "L'impact est multiplicateur :\n"
        "- 1 agriculteur bancable = 500K-2M FCFA de credit accessible\n"
        "- 1 credit investi = 3x de production supplementaire\n"
        "- 1 exploitation productive = securite alimentaire pour 10-15 personnes"
    )

    pdf.sub_heading("Objectifs a 3 ans")
    pdf.bullet("An 1 : 500 agriculteurs actifs, 1 pays (Senegal)")
    pdf.bullet("An 2 : 5 000 agriculteurs, 3 pays UEMOA")
    pdf.bullet("An 3 : 25 000 agriculteurs, 8 pays UEMOA")
    pdf.bullet("250M+ FCFA de credits facilites en cumule")

    pdf.sub_heading("Alignement ODD")
    pdf.bullet("ODD 1 : Pas de pauvrete - acces au capital productif")
    pdf.bullet("ODD 2 : Faim zero - augmentation production agricole")
    pdf.bullet("ODD 5 : Egalite des genres - 40% d'agricultrices ciblees")
    pdf.bullet("ODD 8 : Travail decent - formalisation de l'economie agricole")
    pdf.bullet("ODD 10 : Inegalites reduites - inclusion financiere")

    # === PAGE 8: SCALABILITE & ROADMAP ===
    pdf.section_title('07', 'Scalabilite UEMOA', "Une plateforme, 8 pays, 70M d'agriculteurs potentiels")

    pdf.sub_heading("Pourquoi c'est scalable")
    pdf.bullet("Zone monetaire unique (FCFA) = pas de conversion")
    pdf.bullet("GIM-UEMOA = infrastructure de paiement commune")
    pdf.bullet("Reglementation BCEAO harmonisee sur les 8 pays")
    pdf.bullet("Memes defis agricoles dans toute la zone")
    pdf.bullet("Architecture cloud, API-first, multi-tenant")

    pdf.sub_heading("Marche adressable")
    pdf.body_text(
        "UEMOA : 8 pays, 130M d'habitants, 70M+ d'agriculteurs\n"
        "Credit agricole annuel actuel : ~2 000 Mds FCFA\n"
        "Gap de financement estime : 8 000 Mds FCFA/an\n"
        "Meme 0.1% de ce gap = 8 Mds FCFA de credits a faciliter"
    )

    pdf.sub_heading("Roadmap technique")
    pdf.bullet("Phase 1 (actuel) : MVP web + mobile, scoring 12 criteres, Senegal")
    pdf.bullet("Phase 2 (M+6) : API scoring ouverte, integration mobile money, ML")
    pdf.bullet("Phase 3 (M+12) : Multi-pays, assurance indicielle, donnees satellite")
    pdf.bullet("Phase 4 (M+18) : Marketplace B2B a l'echelle, export data BCEAO")

    pdf.sub_heading("Avantage concurrentiel durable")
    pdf.bullet("Effet reseau : plus d'utilisateurs = meilleur scoring = plus de partenaires")
    pdf.bullet("Donnees proprietaires : historique unique et non replicable")
    pdf.bullet("First-mover sur le credit-scoring agricole UEMOA")
    pdf.bullet("Integration GIM-UEMOA native (avantage hackathon)")

    # === PAGE 9: EQUIPE & DEMO ===
    pdf.section_title('08', "L'Equipe & la Demo", "Une equipe technique et terrain, un produit fonctionnel")

    pdf.sub_heading("Ce qui est deja construit")
    pdf.bullet("Application web complete (React) - toutes les fonctionnalites")
    pdf.bullet("Application mobile (React Native/Expo) - prete pour deploiement")
    pdf.bullet("Backend API (Node.js) - deploye sur Render")
    pdf.bullet("Scoring algorithme - 12 criteres fonctionnels")
    pdf.bullet("Marketplace B2B - vente, commande, livraison, paiement")
    pdf.bullet("Multi-roles : agriculteur, acheteur, agent, banque, admin")
    pdf.bullet("Upload images Cloudinary, authentification JWT")
    pdf.bullet("200 produits, 50 utilisateurs demo en seed data")

    pdf.sub_heading("Stack technique")
    pdf.bullet("Frontend : React + Custom Router")
    pdf.bullet("Mobile : React Native + Expo + React Navigation")
    pdf.bullet("Backend : Node.js, JSON store (migration PostgreSQL prevue)")
    pdf.bullet("Infra : Render (API), Cloudinary (images)")
    pdf.bullet("Securite : JWT, SHA-256, HTTPS, validation inputs")

    pdf.sub_heading("Demo live")
    pdf.body_text(
        "Pendant la presentation de 2 minutes :\n"
        "- Connexion en tant qu'agriculteur\n"
        "- Score de bancabilite visible immediatement\n"
        "- Publication d'un produit en 30 secondes\n"
        "- Vue acheteur : marketplace et commande\n"
        "- Vue partenaire : dossier bancaire genere"
    )

    # === PAGE 10: QUESTIONS JURY ===
    pdf.section_title('09', 'Questions du Jury', "Preparation aux questions pieges et techniques")

    pdf.sub_heading("Questions business")

    pdf.question_block(
        "Comment vous assurez-vous que les agriculteurs utilisent reellement la plateforme ?",
        "Trois leviers : 1) L'app est leur marketplace - ils l'utilisent pour vendre, pas juste pour le score. "
        "2) Les agents terrain forment et accompagnent sur le terrain. "
        "3) L'incentive est puissant : en 90 jours, ils passent d'invisible a bancable, sans rien payer."
    )

    pdf.question_block(
        "Si c'est gratuit pour l'agriculteur, comment etes-vous viable ?",
        "Modele B2B : les banques paient pour acceder a des dossiers pre-evalues. "
        "Pour une banque, un dossier FresCoop coute 10x moins cher qu'une evaluation terrain classique. "
        "Nous sommes rentables des 100 agriculteurs actifs avec 2 partenaires financiers."
    )

    pdf.question_block(
        "Quelle difference avec les scores de credit mobile money (M-Pesa, Wave) ?",
        "Les scores mobile money mesurent la consommation personnelle. Nous mesurons l'activite productive : "
        "production, livraisons, reputation commerciale. C'est un credit-scoring metier specialise agriculture, "
        "pas un score de consommation generic. Et nous n'exigeons pas d'historique mobile money."
    )

    pdf.question_block(
        "Comment gerez-vous la fraude (fausses transactions pour gonfler le score) ?",
        "4 mecanismes anti-fraude : 1) Verification terrain par agents (photos geoloc). "
        "2) Coherence algorithmique (impossible de simuler 90 jours d'activite coherente). "
        "3) Contre-verification acheteur (les 2 parties confirment). "
        "4) Caution solidaire (les pairs se surveillent mutuellement)."
    )

    pdf.question_block(
        "Quel est votre taux de defaut projete et comment le garantissez-vous ?",
        "Cible < 3%. Garanties : scoring predictif valide, caution solidaire (2% provisions), "
        "tracabilite complete, et assurance indicielle climat. En microfinance solidaire au Senegal, "
        "les groupes de caution atteignent 97-98% de remboursement."
    )

    pdf.sub_heading("Questions techniques")

    pdf.question_block(
        "Pourquoi pas de blockchain pour la tracabilite ?",
        "La blockchain ajoute de la complexite sans valeur ajoutee ici. Notre tracabilite est basee sur "
        "des signatures numeriques, horodatage, et validation multi-parties. C'est plus simple, "
        "moins cher, et tout aussi fiable pour notre cas d'usage. Si la reglementation l'exige, "
        "nous pourrons ajouter une ancre blockchain sans changer l'architecture."
    )

    pdf.question_block(
        "Comment ca marche sans smartphone / sans internet ?",
        "Les agents terrain sont le pont. Ils saisissent les donnees pour les agriculteurs "
        "qui n'ont pas de smartphone. L'app fonctionne aussi en mode offline avec sync "
        "quand la connectivite revient. Et le USSD est prevu pour la Phase 2."
    )

    pdf.question_block(
        "Comment s'integre FresCoop avec les systemes bancaires existants ?",
        "API REST standard avec formats conformes BCEAO. Le scoring est expose en API "
        "que les banques/IMF integrent dans leur workflow existant. Pas besoin de changer "
        "leur SI : FresCoop est un fournisseur de donnees supplementaire."
    )

    pdf.question_block(
        "Quelle est votre strategie de protection des donnees (RGPD/reglementation locale) ?",
        "Consentement explicite de l'agriculteur pour chaque partage de donnees. "
        "Donnees stockees dans la zone UEMOA (serveurs conformes). "
        "Droit a l'effacement. Pseudonymisation des donnees partagees aux partenaires. "
        "Conformite avec la loi senegalaise sur les donnees personnelles et cadre BCEAO."
    )

    pdf.question_block(
        "Avec un JSON file store, comment gerez-vous la scalabilite ?",
        "Le JSON store est notre choix pour le MVP/hackathon : deploiement instantane, zero config. "
        "La migration vers PostgreSQL est prevue Phase 2 et preparee architecturalement "
        "(couche d'abstraction store). Le code est pret pour cette transition."
    )

    pdf.sub_heading("Questions strategiques")

    pdf.question_block(
        "Pourquoi GIM-UEMOA est le bon partenaire pour FresCoop ?",
        "GIM-UEMOA est l'infrastructure de paiement commune aux 8 pays. Notre integration native "
        "avec GIM permet : paiement des credits via tous les canaux GIM, reporting unifie, "
        "et deploiement simultane sur toute la zone sans integration pays par pays."
    )

    pdf.question_block(
        "Quels sont les risques principaux et comment les mitigez-vous ?",
        "1) Adoption : mitigue par le reseau d'agents terrain et la valeur immediate (marketplace). "
        "2) Partenaires financiers : mitigue par le modele de risque prouve (taux defaut < 3%). "
        "3) Reglementation : mitigue par la conformite BCEAO native et l'ancrage GIM-UEMOA. "
        "4) Concurrence : mitigue par l'effet reseau et la base de donnees proprietaire."
    )

    pdf.question_block(
        "En quoi votre solution est-elle plus innovante que ce qui existe deja ?",
        "Trois innovations : 1) Le scoring est base sur l'activite productive reelle (pas des declarations). "
        "2) Zero cout pour l'agriculteur (modele B2B pur). "
        "3) Integration native UEMOA (8 pays, 1 plateforme, 1 monnaie). "
        "Aucun acteur ne combine ces trois elements."
    )

    # Save
    output_path = os.path.join(os.path.dirname(__file__), 'FRESCOOP_DOSSIER_COMPLET.pdf')
    pdf.output(output_path)
    print(f"PDF genere : {output_path}")
    print(f"Pages : {pdf.page_no()}")

if __name__ == '__main__':
    generate()
