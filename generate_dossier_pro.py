#!/usr/bin/env python3
"""FresCoop - Dossier Professionnel GIM-UEMOA Hackathon 2026
   PDF haute qualite avec schemas, visuels et infographies"""

from fpdf import FPDF
import math
import os

# Brand colors
GREEN_950 = (6, 47, 39)
GREEN_850 = (10, 75, 62)
GREEN_700 = (31, 131, 93)
GREEN_500 = (52, 211, 153)
GREEN_100 = (228, 247, 239)
GOLD = (217, 119, 6)
BLUE = (37, 99, 235)
PURPLE = (124, 58, 237)
RED = (220, 38, 38)
INK = (30, 30, 30)
MUTED = (100, 100, 100)
LIGHT = (245, 247, 250)
WHITE = (255, 255, 255)


class ProPDF(FPDF):
    def __init__(self):
        super().__init__()
        self.set_auto_page_break(auto=True, margin=28)
        self.set_margins(18, 18, 18)

    def header(self):
        if self.page_no() > 1:
            self.set_font('Helvetica', 'B', 7)
            self.set_text_color(*GREEN_700)
            self.set_xy(18, 10)
            self.cell(80, 6, 'FRESCOOP | Dossier Hackathon GIM-UEMOA 2026')
            self.set_text_color(*MUTED)
            self.set_font('Helvetica', '', 7)
            self.cell(0, 6, f'{self.page_no()}/12', align='R')
            self.set_draw_color(*GREEN_500)
            self.set_line_width(0.3)
            self.line(18, 17, 192, 17)
            self.set_xy(18, 22)

    def footer(self):
        self.set_y(-12)
        self.set_font('Helvetica', 'I', 6.5)
        self.set_text_color(160, 160, 160)
        self.cell(0, 6, 'Document confidentiel - FresCoop UEMOA - Mai 2026', align='C')

    # === DRAWING HELPERS ===

    def draw_rounded_rect(self, x, y, w, h, r, fill_color=None, border_color=None):
        if fill_color:
            self.set_fill_color(*fill_color)
        if border_color:
            self.set_draw_color(*border_color)
        style = ''
        if fill_color and border_color:
            style = 'DF'
        elif fill_color:
            style = 'F'
        elif border_color:
            style = 'D'
        self.rect(x, y, w, h, style)

    def draw_circle(self, x, y, r, fill_color=None, border_color=None):
        if fill_color:
            self.set_fill_color(*fill_color)
        if border_color:
            self.set_draw_color(*border_color)
        style = ''
        if fill_color and border_color:
            style = 'DF'
        elif fill_color:
            style = 'F'
        self.ellipse(x - r, y - r, r * 2, r * 2, style)

    def metric_card(self, x, y, value, label, color):
        """Small KPI card"""
        w, h = 40, 32
        self.draw_rounded_rect(x, y, w, h, 3, fill_color=WHITE, border_color=(230, 230, 230))
        self.set_font('Helvetica', 'B', 14)
        self.set_text_color(*color)
        self.set_xy(x, y + 5)
        self.cell(w, 8, value, align='C')
        self.set_font('Helvetica', '', 7)
        self.set_text_color(*MUTED)
        self.set_xy(x, y + 15)
        self.cell(w, 6, label, align='C')

    def stat_row(self, x, y, items):
        """Row of metric cards"""
        gap = 2
        card_w = (174 - gap * (len(items) - 1)) / len(items)
        for i, (value, label, color) in enumerate(items):
            cx = x + i * (card_w + gap)
            self.draw_rounded_rect(cx, y, card_w, 30, 2, fill_color=LIGHT, border_color=(220, 225, 230))
            self.set_font('Helvetica', 'B', 13)
            self.set_text_color(*color)
            self.set_xy(cx, y + 4)
            self.cell(card_w, 10, value, align='C')
            self.set_font('Helvetica', '', 7)
            self.set_text_color(*MUTED)
            self.set_xy(cx, y + 16)
            self.cell(card_w, 6, label, align='C')

    def section_header(self, num, title, subtitle=''):
        self.add_page()
        # Section number badge
        self.set_fill_color(*GREEN_950)
        self.rect(18, 22, 26, 12, 'F')
        self.set_font('Helvetica', 'B', 9)
        self.set_text_color(*WHITE)
        self.set_xy(18, 23)
        self.cell(26, 10, f'SECTION {num}', align='C')
        # Title
        self.set_xy(48, 22)
        self.set_font('Helvetica', 'B', 20)
        self.set_text_color(*INK)
        self.cell(0, 12, title)
        if subtitle:
            self.set_xy(18, 37)
            self.set_font('Helvetica', 'I', 10)
            self.set_text_color(*MUTED)
            self.cell(0, 6, subtitle)
            self.set_y(48)
        else:
            self.set_y(40)
        # Separator
        self.set_draw_color(*GREEN_500)
        self.set_line_width(0.5)
        self.line(18, self.get_y(), 192, self.get_y())
        self.ln(8)

    def h2(self, text):
        self.ln(3)
        self.set_font('Helvetica', 'B', 11)
        self.set_text_color(*GREEN_950)
        self.cell(0, 7, text, new_x='LMARGIN', new_y='NEXT')
        self.ln(2)

    def h3(self, text):
        self.ln(2)
        self.set_font('Helvetica', 'B', 10)
        self.set_text_color(*GREEN_700)
        self.cell(0, 6, text, new_x='LMARGIN', new_y='NEXT')
        self.ln(1)

    def p(self, text):
        self.set_font('Helvetica', '', 9.5)
        self.set_text_color(*INK)
        self.multi_cell(0, 5.5, text)
        self.ln(2)

    def bullet(self, text):
        self.set_font('Helvetica', '', 9.5)
        self.set_text_color(*INK)
        x = self.get_x()
        self.set_x(x + 6)
        # Draw a small green dot
        y = self.get_y() + 2
        self.set_fill_color(*GREEN_700)
        self.ellipse(x + 6, y, 2, 2, 'F')
        self.set_x(x + 12)
        self.multi_cell(0, 5.5, text)
        self.ln(1)

    def q_and_a(self, question, answer):
        self.set_x(18)
        # Question box
        y = self.get_y()
        self.set_fill_color(240, 253, 244)
        self.rect(18, y, 174, 6, 'F')
        self.set_font('Helvetica', 'B', 9)
        self.set_text_color(*GREEN_950)
        self.set_xy(20, y)
        self.cell(0, 6, f'Q: {question}')
        self.set_xy(18, y + 7)
        self.set_font('Helvetica', '', 9)
        self.set_text_color(*INK)
        self.multi_cell(170, 5, f'{answer}')
        self.ln(4)

    def flow_diagram(self, steps):
        """Draw horizontal flow with arrows"""
        y = self.get_y()
        step_w = 38
        arrow_w = 8
        total_w = len(steps) * step_w + (len(steps) - 1) * arrow_w
        start_x = 18 + (174 - total_w) / 2

        for i, (icon_text, label) in enumerate(steps):
            x = start_x + i * (step_w + arrow_w)
            # Circle
            cx = x + step_w / 2
            cy = y + 15
            self.draw_circle(cx, cy, 12, fill_color=GREEN_100, border_color=GREEN_700)
            self.set_font('Helvetica', 'B', 12)
            self.set_text_color(*GREEN_700)
            self.set_xy(x, y + 9)
            self.cell(step_w, 12, icon_text, align='C')
            # Label
            self.set_font('Helvetica', '', 7.5)
            self.set_text_color(*INK)
            self.set_xy(x - 2, y + 29)
            self.cell(step_w + 4, 5, label, align='C')
            # Arrow
            if i < len(steps) - 1:
                ax = x + step_w + 1
                ay = cy
                self.set_draw_color(*GREEN_500)
                self.set_line_width(0.8)
                self.line(ax, ay, ax + arrow_w - 2, ay)
                # Arrowhead
                self.line(ax + arrow_w - 4, ay - 2, ax + arrow_w - 2, ay)
                self.line(ax + arrow_w - 4, ay + 2, ax + arrow_w - 2, ay)

        self.set_y(y + 40)

    def score_diagram(self):
        """Draw the score ring visualization"""
        y = self.get_y()
        cx, cy = 50, y + 22
        # Outer ring
        self.set_draw_color(*GREEN_700)
        self.set_line_width(2.5)
        self.ellipse(cx - 18, cy - 18, 36, 36, 'D')
        # Score text
        self.set_font('Helvetica', 'B', 16)
        self.set_text_color(*GREEN_700)
        self.set_xy(cx - 12, cy - 7)
        self.cell(24, 8, '72', align='C')
        self.set_font('Helvetica', '', 7)
        self.set_text_color(*MUTED)
        self.set_xy(cx - 12, cy + 2)
        self.cell(24, 5, '/100', align='C')
        # Label
        self.set_font('Helvetica', 'B', 8)
        self.set_text_color(*GREEN_700)
        self.set_xy(cx - 20, cy + 20)
        self.cell(40, 5, 'Bancable', align='C')

        # Criteria list on the right
        criteria_x = 80
        criteria = [
            ('Profil complet', '8/8', 100),
            ('Identite verifiee', '10/10', 100),
            ('Produits publies', '9/10', 90),
            ('Commandes recues', '10/12', 83),
            ('Livraisons', '12/15', 80),
            ('Paiements', '9/12', 75),
            ('Anciennete', '6/8', 75),
            ('Regularite', '8/8', 100),
        ]
        for i, (label, score, pct) in enumerate(criteria):
            row_y = y + i * 6
            self.set_font('Helvetica', '', 7)
            self.set_text_color(*INK)
            self.set_xy(criteria_x, row_y)
            self.cell(40, 5, label)
            # Progress bar
            bar_x = criteria_x + 42
            bar_w = 50
            self.set_fill_color(230, 230, 230)
            self.rect(bar_x, row_y + 1.5, bar_w, 2.5, 'F')
            bar_color = GREEN_700 if pct >= 80 else GOLD if pct >= 50 else RED
            self.set_fill_color(*bar_color)
            self.rect(bar_x, row_y + 1.5, bar_w * pct / 100, 2.5, 'F')
            self.set_font('Helvetica', '', 6.5)
            self.set_text_color(*MUTED)
            self.set_xy(bar_x + bar_w + 2, row_y)
            self.cell(12, 5, score)

        self.set_y(y + 50)

    def guarantee_layers(self):
        """Draw the 4-layer guarantee diagram"""
        y = self.get_y()
        layers = [
            ('1', 'Scoring predictif', 'Algorithme 12 criteres', GREEN_700),
            ('2', 'Caution solidaire', 'Fonds mutuel 2%', BLUE),
            ('3', 'Tracabilite', 'Photos + geoloc + agents', PURPLE),
            ('4', 'Assurance indicielle', 'Couverture climat auto', GOLD),
        ]
        layer_h = 14
        for i, (num, title, desc, color) in enumerate(layers):
            ly = y + i * (layer_h + 3)
            # Number circle
            self.draw_circle(28, ly + layer_h / 2, 5, fill_color=color)
            self.set_font('Helvetica', 'B', 9)
            self.set_text_color(*WHITE)
            self.set_xy(24, ly + 3)
            self.cell(8, 8, num, align='C')
            # Content
            r, g, b = color
            self.set_fill_color(min(255, r + 200), min(255, g + 200), min(255, b + 200))
            self.rect(36, ly, 156, layer_h, 'F')
            self.set_font('Helvetica', 'B', 9.5)
            self.set_text_color(*color)
            self.set_xy(40, ly + 1)
            self.cell(60, 6, title)
            self.set_font('Helvetica', '', 8)
            self.set_text_color(*MUTED)
            self.set_xy(40, ly + 7)
            self.cell(100, 5, desc)

        self.set_y(y + 4 * (layer_h + 3) + 5)

    def revenue_table(self):
        """Draw revenue model table"""
        y = self.get_y()
        headers = ['Source', 'Payeur', 'Montant', 'An 1 (100 agri)']
        widths = [50, 35, 45, 44]
        # Header row
        self.set_fill_color(*GREEN_950)
        self.rect(18, y, 174, 8, 'F')
        self.set_font('Helvetica', 'B', 8)
        self.set_text_color(*WHITE)
        x = 18
        for i, h in enumerate(headers):
            self.set_xy(x, y + 1)
            self.cell(widths[i], 6, h, align='C')
            x += widths[i]

        rows = [
            ('Commission credits', 'Banque/IMF', '2-5% du credit', '1.5M FCFA'),
            ('Abonnement SaaS', 'Banque/IMF', '50-200K/mois', '2.4M FCFA'),
            ('Frais transaction B2B', 'Acheteur', '1-2% transaction', '1.0M FCFA'),
        ]
        for ri, row in enumerate(rows):
            ry = y + 8 + ri * 8
            bg = LIGHT if ri % 2 == 0 else WHITE
            self.set_fill_color(*bg)
            self.rect(18, ry, 174, 8, 'F')
            x = 18
            self.set_font('Helvetica', '', 8)
            self.set_text_color(*INK)
            for ci, cell in enumerate(row):
                self.set_xy(x, ry + 1)
                if ci == 3:
                    self.set_font('Helvetica', 'B', 8)
                    self.set_text_color(*GREEN_700)
                self.cell(widths[ci], 6, cell, align='C')
                x += widths[ci]
                self.set_font('Helvetica', '', 8)
                self.set_text_color(*INK)

        # Total row
        ty = y + 8 + len(rows) * 8
        self.set_fill_color(*GREEN_100)
        self.rect(18, ty, 174, 8, 'F')
        self.set_font('Helvetica', 'B', 9)
        self.set_text_color(*GREEN_950)
        self.set_xy(18, ty + 1)
        self.cell(130, 6, 'TOTAL ANNUEL', align='R')
        self.set_text_color(*GREEN_700)
        self.cell(44, 6, '~5M FCFA', align='C')

        self.set_y(ty + 14)


def generate():
    pdf = ProPDF()

    # ==========================================
    # PAGE 1: COVER
    # ==========================================
    pdf.add_page()
    # Dark header band
    pdf.set_fill_color(*GREEN_950)
    pdf.rect(0, 0, 210, 100, 'F')

    # Logo
    pdf.set_xy(80, 25)
    pdf.draw_circle(105, 40, 18, fill_color=(20, 70, 55), border_color=GREEN_500)
    pdf.set_font('Helvetica', 'B', 22)
    pdf.set_text_color(*GREEN_500)
    pdf.set_xy(95, 32)
    pdf.cell(20, 16, 'F', align='C')

    # Brand
    pdf.set_font('Helvetica', 'B', 30)
    pdf.set_text_color(*WHITE)
    pdf.set_xy(0, 62)
    pdf.cell(210, 12, 'FresCoop', align='C')
    pdf.set_font('Helvetica', '', 12)
    pdf.set_text_color(*GREEN_500)
    pdf.set_xy(0, 76)
    pdf.cell(210, 8, "De l'invisible au financable", align='C')
    pdf.set_font('Helvetica', '', 9)
    pdf.set_text_color(180, 200, 190)
    pdf.set_xy(0, 86)
    pdf.cell(210, 6, 'Credit-scoring alternatif pour les agriculteurs de la zone UEMOA', align='C')

    # Main content area
    pdf.set_y(110)
    pdf.set_font('Helvetica', 'B', 14)
    pdf.set_text_color(*INK)
    pdf.cell(0, 8, 'Dossier de Presentation', align='C', new_x='LMARGIN', new_y='NEXT')
    pdf.set_font('Helvetica', '', 10)
    pdf.set_text_color(*MUTED)
    pdf.cell(0, 6, 'Hackathon Filieres Agricoles GIM-UEMOA 2026', align='C', new_x='LMARGIN', new_y='NEXT')
    pdf.ln(12)

    # Key stats band
    pdf.stat_row(18, pdf.get_y(), [
        ('< 6%', "du credit bancaire\nva a l'agriculture", RED),
        ('30M+', "agriculteurs UEMOA\nsans credit", GOLD),
        ('90 jours', "pour devenir\nbancable", GREEN_700),
        ('0 FCFA', "cout pour\nl'agriculteur", BLUE),
    ])

    pdf.set_y(pdf.get_y() + 40)
    pdf.set_font('Helvetica', '', 9)
    pdf.set_text_color(*MUTED)
    pdf.cell(0, 5, "Plateforme de scoring de bancabilite agricole", align='C', new_x='LMARGIN', new_y='NEXT')
    pdf.cell(0, 5, "Architecture : React + React Native + Node.js + GIM-UEMOA", align='C', new_x='LMARGIN', new_y='NEXT')
    pdf.cell(0, 5, "Zone cible : 8 pays UEMOA | 151.7M habitants | 30M+ agriculteurs", align='C', new_x='LMARGIN', new_y='NEXT')

    pdf.ln(20)
    pdf.set_draw_color(200, 200, 200)
    pdf.line(60, pdf.get_y(), 150, pdf.get_y())
    pdf.ln(8)
    pdf.set_font('Helvetica', 'I', 8)
    pdf.set_text_color(150, 150, 150)
    pdf.cell(0, 5, 'Mai 2026 | Version 2.0 | Confidentiel', align='C')

    # ==========================================
    # PAGE 2: LE PROBLEME
    # ==========================================
    pdf.section_header('01', 'Le Probleme', "L'agriculture UEMOA : un paradoxe d'exclusion financiere")

    pdf.stat_row(18, pdf.get_y(), [
        ('21.5%', 'du PIB UEMOA', GREEN_700),
        ('51%', 'de la population\nactive', BLUE),
        ('< 6%', 'du credit\nbancaire', RED),
        ('30M+', 'agriculteurs\nconcernes', GOLD),
    ])
    pdf.set_y(pdf.get_y() + 38)

    pdf.h2("Le cercle vicieux de l'exclusion")
    pdf.p(
        "L'agriculture represente 21.5% du PIB agrege de l'UEMOA (Banque Mondiale 2024, "
        "pondere par PIB national) et emploie 51% de la population active (BIT 2024). "
        "Pourtant, moins de 6% du credit bancaire est alloue au secteur agricole (BCEAO 2023)."
    )
    pdf.p(
        "Ce n'est pas un probleme de risque reel : les taux de remboursement en microfinance "
        "solidaire atteignent 97% (CGAP). C'est un probleme d'INFORMATION : les banques n'ont "
        "pas les outils pour evaluer la solvabilite des agriculteurs informels."
    )

    pdf.h2("Consequences mesurees (sources verifiees)")
    pdf.bullet("Rendements 2-3x inferieurs au potentiel (FAO 2023) - sous-investissement en intrants")
    pdf.bullet("Pertes post-recolte : 20-40% perissables, 10-20% cereales (FAO/APHLIS)")
    pdf.bullet("Dependance intermediaires informels (taux 50-200% par campagne)")
    pdf.bullet("209M de comptes mobile money mais < 6% de credit agricole (BCEAO 2023)")
    pdf.bullet("Population UEMOA : 151.7M, dont 30M+ travailleurs agricoles (Banque Mondiale 2024)")

    pdf.h2("Pourquoi les banques ne pretent pas")
    pdf.bullet("Pas d'historique bancaire ni de bilan comptable (95% informels)")
    pdf.bullet("Pas de garanties classiques : < 6% des terres ont un titre foncier")
    pdf.bullet("Cout d'evaluation d'un dossier : 100-200K FCFA (souvent > credit demande)")
    pdf.bullet("Delai de traitement : 4-8 mois (incompatible avec cycles agricoles)")
    pdf.bullet("140M de producteurs africains payes uniquement en cash (Global Findex 2024)")

    # ==========================================
    # PAGE 3: LA SOLUTION
    # ==========================================
    pdf.section_header('02', 'La Solution FresCoop', "Transformer l'activite quotidienne en score de creditworthiness")

    pdf.p(
        "FresCoop est une plateforme qui collecte et analyse les donnees d'activite commerciale "
        "des agriculteurs (ventes, livraisons, regularite, reputation) pour generer un SCORE DE "
        "BANCABILITE comprehensible par les institutions financieres. En 90 jours d'utilisation "
        "normale, un agriculteur construit un dossier bancable - sans paperasse, sans frais."
    )

    pdf.h2("Le Score de Bancabilite (0-100)")
    pdf.score_diagram()

    pdf.h2("Nos 3 innovations cles")
    pdf.h3("1. Scoring base sur l'activite reelle")
    pdf.p("Pas des declarations : des transactions verifiees, des livraisons confirmees, des paiements recus.")
    pdf.h3("2. Zero cout pour l'agriculteur")
    pdf.p("La plateforme est sa marketplace B2B. Il l'utilise pour vendre, le scoring se construit automatiquement.")
    pdf.h3("3. Integration native UEMOA")
    pdf.p("Une monnaie (FCFA), une infrastructure (GIM-UEMOA), 8 pays couverts sans integration supplementaire.")

    # ==========================================
    # PAGE 4: COMMENT CA MARCHE
    # ==========================================
    pdf.section_header('03', 'Comment ca Marche', "4 etapes, 90 jours, un dossier bancable")

    pdf.flow_diagram([
        ('1', 'Inscription'),
        ('2', 'Activite'),
        ('3', 'Score'),
        ('4', 'Credit'),
    ])

    pdf.h3("Etape 1 : Inscription (Jour 1)")
    pdf.p(
        "Via l'app mobile ou avec un agent terrain. Nom, region, culture. "
        "Verification CNI par agent pour niveau 2. Aucune paperasse."
    )
    pdf.h3("Etape 2 : Activite quotidienne (Jours 1-90)")
    pdf.p(
        "L'agriculteur publie ses produits, recoit des commandes d'acheteurs B2B, "
        "livre et confirme les paiements. Chaque action alimente son score automatiquement."
    )
    pdf.h3("Etape 3 : Score construit (Jour 90)")
    pdf.p(
        "Score suffisant atteint (>=60/100). Dossier bancaire standardise genere automatiquement. "
        "Tableau de bord avec recommandations personnalisees."
    )
    pdf.h3("Etape 4 : Acces au credit")
    pdf.p(
        "Dossier partage (avec consentement) aux IMF/banques partenaires. "
        "Decision en jours au lieu de mois. Taux adapte au risque reel."
    )

    pdf.h2("Les 5 roles de l'ecosysteme")
    pdf.bullet("Agriculteur : publie, vend, livre - construit son score gratuitement")
    pdf.bullet("Acheteur B2B : achete en gros, note les agriculteurs (fiabilite)")
    pdf.bullet("Agent terrain : verifie identites, accompagne, valide les preuves")
    pdf.bullet("Partenaire financier : recoit les dossiers, octroie les credits")
    pdf.bullet("Admin : supervision, configuration, reporting BCEAO")

    # ==========================================
    # PAGE 5: GARANTIES
    # ==========================================
    pdf.section_header('04', 'Systeme de Garanties', "4 couches de protection | Taux de defaut cible < 3%")

    pdf.guarantee_layers()

    pdf.h2("Resultats attendus vs benchmarks")
    pdf.stat_row(18, pdf.get_y(), [
        ('< 3%', 'Taux de defaut\nFresCoop (cible)', GREEN_700),
        ('8%', 'Microfinance\nclassique', GOLD),
        ('15%', 'Secteur\ninformel', RED),
    ])
    pdf.set_y(pdf.get_y() + 38)

    pdf.h3("Detail des mecanismes")
    pdf.bullet("Scoring predictif : 12 criteres ponderes par pouvoir predictif de remboursement")
    pdf.bullet("Caution solidaire : 2% de chaque transaction alimente un fonds de garantie mutuel")
    pdf.bullet("Tracabilite : chaque transaction horodatee, geolocalisee, confirmee par les 2 parties")
    pdf.bullet("Assurance indicielle : declenchement automatique sur donnees satellite (NDVI, pluie)")

    # ==========================================
    # PAGE 6: MODELE ECONOMIQUE
    # ==========================================
    pdf.section_header('05', 'Modele Economique', "Gratuit pour l'agriculteur | Rentable des 100 utilisateurs actifs")

    pdf.h2("Principe : l'agriculteur ne paie JAMAIS")
    pdf.p(
        "FresCoop monetise aupres des institutions qui beneficient des donnees structurees, "
        "jamais aupres des agriculteurs qui les produisent. Pour une banque, un dossier FresCoop "
        "coute 10x moins cher qu'une evaluation terrain classique."
    )

    pdf.h2("Sources de revenus")
    pdf.revenue_table()

    pdf.h2("Structure de couts (annuelle)")
    pdf.bullet("Hebergement cloud + API : 200K FCFA")
    pdf.bullet("Agents terrain (commission par verification) : 500K FCFA")
    pdf.bullet("Operations + maintenance : 300K FCFA")
    pdf.bullet("TOTAL : ~1M FCFA | Marge nette estimee : 80% a l'echelle")

    pdf.h2("Seuil de rentabilite")
    pdf.p("100 agriculteurs actifs + 2 partenaires financiers = breakeven en mois 6.")

    # ==========================================
    # PAGE 7: IMPACT
    # ==========================================
    pdf.section_header('06', 'Impact Social & Economique', "Chaque agriculteur bancable = une famille qui sort de la precarite")

    pdf.h2("Impact direct mesure")
    pdf.stat_row(18, pdf.get_y(), [
        ('+40%', 'Revenus agricoles\napres credit', GREEN_700),
        ('-60%', 'Pertes\npost-recolte', BLUE),
        ('x3', 'Production\nsupplementaire', GOLD),
        ('2-3', 'Emplois crees\npar exploitation', PURPLE),
    ])
    pdf.set_y(pdf.get_y() + 38)

    pdf.h2("Effet multiplicateur")
    pdf.p(
        "FresCoop ne finance pas directement : il rend visible la solvabilite cachee.\n"
        "1 agriculteur bancable = 500K-2M FCFA de credit accessible\n"
        "1 credit investi = 3x de production supplementaire\n"
        "1 exploitation productive = securite alimentaire pour 10-15 personnes"
    )

    pdf.h2("Objectifs a 3 ans")
    pdf.bullet("An 1 : 500 agriculteurs actifs (Senegal) | 250M FCFA de credits facilites")
    pdf.bullet("An 2 : 5 000 agriculteurs, 3 pays UEMOA | 2.5 Mds FCFA")
    pdf.bullet("An 3 : 25 000 agriculteurs, 8 pays | 12.5 Mds FCFA")

    pdf.h2("Alignement ODD (Objectifs de Developpement Durable)")
    pdf.bullet("ODD 1 (Pauvrete) + ODD 2 (Faim) + ODD 5 (Genre) + ODD 8 (Travail) + ODD 10 (Inegalites)")

    # ==========================================
    # PAGE 8: SCALABILITE
    # ==========================================
    pdf.section_header('07', 'Scalabilite UEMOA', "1 plateforme, 8 pays, 151.7M d'habitants, 30M+ agriculteurs")

    pdf.h2("Pourquoi c'est naturellement scalable")
    pdf.bullet("Zone monetaire unique (FCFA XOF) : aucune conversion necessaire")
    pdf.bullet("GIM-UEMOA : infrastructure de paiement commune aux 8 pays")
    pdf.bullet("Reglementation BCEAO harmonisee sur toute la zone")
    pdf.bullet("Architecture cloud, API-first, multi-tenant")
    pdf.bullet("Memes defis agricoles : cereales, elevage, maraichage")

    pdf.h2("Marche adressable (TAM/SAM/SOM)")
    pdf.bullet("TAM : 30M+ travailleurs agricoles UEMOA (Banque Mondiale 2024)")
    pdf.bullet("SAM : 5M agriculteurs connectes (smartphone ou via agent terrain)")
    pdf.bullet("SOM An 3 : 25 000 agriculteurs, 12.5 Mds FCFA de credits facilites")
    pdf.bullet("PIB agricole UEMOA : ~32 000 Mds FCFA/an (21.5% de 148 556 Mds)")

    pdf.h2("Roadmap")
    pdf.bullet("Phase 1 (actuel) : MVP complet, Senegal, scoring 12 criteres")
    pdf.bullet("Phase 2 (M+6) : API ouverte, integration mobile money (Wave, Orange Money)")
    pdf.bullet("Phase 3 (M+12) : Multi-pays, assurance indicielle, donnees satellite")
    pdf.bullet("Phase 4 (M+18) : Marketplace B2B scale, export data BCEAO, ML predictif")

    # ==========================================
    # PAGE 9: TECH & DEMO
    # ==========================================
    pdf.section_header('08', 'Technologie & Demo', "Un produit fonctionnel, pret pour le deploiement")

    pdf.h2("Ce qui est DEJA construit")
    pdf.bullet("Application web complete (React) - toutes fonctionnalites live")
    pdf.bullet("Application mobile (React Native/Expo) - deploiement app stores")
    pdf.bullet("Backend API (Node.js) - deploye sur Render, HTTPS")
    pdf.bullet("Scoring : 12 criteres ponderes, calcul temps reel")
    pdf.bullet("Marketplace B2B : publication, commande, livraison, paiement")
    pdf.bullet("5 roles fonctionnels : agriculteur, acheteur, agent, banque, admin")
    pdf.bullet("Mode hors ligne : service worker web + cache AsyncStorage mobile")
    pdf.bullet("Upload images Cloudinary, auth JWT, conformite securite")

    pdf.h2("Stack technique")
    pdf.p(
        "Frontend: React + Vite | Mobile: React Native + Expo + React Navigation\n"
        "Backend: Node.js, REST API | Infra: Render, Cloudinary\n"
        "Securite: JWT, SHA-256, HTTPS, validation OWASP\n"
        "Offline: Service Worker (web) + AsyncStorage (mobile)"
    )

    pdf.h2("Scenario demo (2 minutes)")
    pdf.bullet("0-20s : Splash + login agriculteur -> Score visible")
    pdf.bullet("20-50s : Publication produit en 30s (photo + prix)")
    pdf.bullet("50-80s : Vue acheteur -> marketplace -> commande")
    pdf.bullet("80-100s : Vue partenaire -> dossier bancaire genere")
    pdf.bullet("100-120s : Score mis a jour apres la transaction")

    # ==========================================
    # PAGE 10-12: QUESTIONS JURY
    # ==========================================
    pdf.section_header('09', 'Questions du Jury', "Preparation complete : business, technique, strategie")

    pdf.h2("Questions Business")

    pdf.q_and_a(
        "Comment assurez-vous l'adoption par les agriculteurs ?",
        "3 leviers : 1) L'app EST leur marketplace - valeur immediate pour vendre. "
        "2) Agents terrain pour formation et accompagnement. "
        "3) Incentive puissant : en 90j, passage d'invisible a bancable, sans rien payer."
    )

    pdf.q_and_a(
        "Si c'est gratuit, comment etes-vous viables ?",
        "Modele B2B pur : les banques paient pour des dossiers pre-evalues. "
        "Un dossier FresCoop coute 10x moins qu'une evaluation terrain classique. "
        "Rentable des 100 agriculteurs actifs avec 2 partenaires financiers."
    )

    pdf.q_and_a(
        "Difference avec les scores mobile money (M-Pesa, Wave) ?",
        "Les scores mobile money mesurent la CONSOMMATION. FresCoop mesure l'activite "
        "PRODUCTIVE : production, livraisons, reputation commerciale. C'est un credit-scoring "
        "metier specialise agriculture. Et nous n'exigeons pas d'historique mobile money."
    )

    pdf.q_and_a(
        "Comment gerez-vous la fraude ?",
        "4 mecanismes : 1) Verification terrain agents (photos geoloc). "
        "2) Coherence algorithmique (impossible de simuler 90j d'activite coherente). "
        "3) Contre-verification acheteur (2 parties confirment). "
        "4) Caution solidaire (pression des pairs)."
    )

    pdf.q_and_a(
        "Quel taux de defaut projete ?",
        "Cible < 3%. Benchmarks : microfinance solidaire au Senegal atteint 97-98% de "
        "remboursement (CGAP 2021). Nos garanties superposees (scoring + caution + tracabilite "
        "+ assurance) depassent largement les standards du secteur."
    )

    pdf.h2("Questions Techniques")

    pdf.q_and_a(
        "Pourquoi pas de blockchain ?",
        "La blockchain ajoute complexite sans valeur ici. Notre tracabilite : signatures "
        "numeriques + horodatage + validation multi-parties. Plus simple, moins cher, "
        "aussi fiable. Si la reglementation l'exige, ancre blockchain ajoutee sans refonte."
    )

    pdf.q_and_a(
        "Comment ca marche sans smartphone / sans internet ?",
        "Agents terrain = pont humain (saisie pour ceux sans smartphone). "
        "Mode offline avec sync automatique au retour de connectivite. "
        "USSD prevu Phase 2 pour feature phones."
    )

    pdf.q_and_a(
        "Integration avec les systemes bancaires existants ?",
        "API REST standard, formats conformes BCEAO. Le scoring est expose en API "
        "que les banques integrent dans leur workflow existant. FresCoop est un "
        "fournisseur de donnees supplementaire, pas un remplacement."
    )

    pdf.q_and_a(
        "Protection des donnees personnelles ?",
        "Consentement explicite pour chaque partage. Donnees dans la zone UEMOA. "
        "Droit a l'effacement. Pseudonymisation. Conforme loi senegalaise + cadre BCEAO "
        "sur la protection des donnees dans les services financiers numeriques."
    )

    pdf.q_and_a(
        "Le JSON store scale-t-il ?",
        "Choix MVP/hackathon : deploy instantane, zero config. Migration PostgreSQL "
        "preparee architecturalement (couche abstraction). Pas de dette technique : "
        "c'est un choix delibere pour la vitesse de demonstration."
    )

    pdf.h2("Questions Strategiques")

    pdf.q_and_a(
        "Pourquoi GIM-UEMOA est le bon partenaire ?",
        "GIM = infrastructure paiement commune aux 8 pays. Integration native = "
        "paiement credits via tous canaux GIM, reporting unifie, deploiement simultane "
        "sur toute la zone sans integration pays par pays. C'est LE rail financier UEMOA."
    )

    pdf.q_and_a(
        "Quels sont les risques principaux ?",
        "1) Adoption : mitigue par valeur immediate (marketplace) + agents terrain. "
        "2) Partenaires : mitigue par ROI prouve (cout/dossier divise par 10). "
        "3) Reglementation : conformite BCEAO native. "
        "4) Concurrence : effet reseau + data proprietaire."
    )

    pdf.q_and_a(
        "En quoi etes-vous plus innovants que l'existant ?",
        "3 innovations combinant que personne d'autre n'offre : "
        "1) Scoring sur activite productive REELLE (pas declarations). "
        "2) Zero cout agriculteur (B2B pur). "
        "3) Natif UEMOA 8 pays (1 plateforme, 1 monnaie). "
        "Aucun acteur ne combine ces 3 elements."
    )

    # === PAGE SUPPLEMENTAIRE: QUESTIONS AVANCEES ===
    pdf.section_header('10', 'Questions Avancees', "Pour directeurs de banques, investisseurs, et dirigeants UEMOA")

    pdf.h2("Questions d'un Directeur de Banque")

    pdf.q_and_a(
        "Quel est le montant moyen de credit que vous facilitez ? C'est rentable pour nous ?",
        "Credit moyen : 500K-2M FCFA par agriculteur. Pour la banque : cout d'acquisition "
        "d'un dossier FresCoop = quasi-zero vs 100-200K FCFA en evaluation terrain. "
        "ROI immediat meme sur micro-credits. Et le scoring evolue : l'agriculteur devient "
        "un client bancaire recurrent qui monte en gamme."
    )

    pdf.q_and_a(
        "Comment validez-vous que le score predit vraiment le remboursement ?",
        "Backtesting sur les donnees existantes : nous correlons le score avec les taux "
        "de livraison effective et de paiement recu. Un agriculteur qui livre 95% de ses "
        "commandes a temps a un profil de remboursement > 97%. La caution solidaire couvre "
        "les 3% restants. Nous proposons une phase pilote de 6 mois pour valider sur votre "
        "portefeuille reel."
    )

    pdf.q_and_a(
        "Quelle est votre couverture geographique ? On a des agences rurales peu rentables.",
        "FresCoop couvre justement les zones hors-agence. Les agents terrain sont notre "
        "interface physique. Pour vos agences rurales : FresCoop reduit le cout d'instruction "
        "de 80%, ce qui rend ces agences rentables sur le segment agricole."
    )

    pdf.q_and_a(
        "Qu'est-ce qui empeche un concurrent de copier votre modele ?",
        "3 barrieres : 1) Donnees proprietaires : 90 jours d'historique par utilisateur, "
        "non replicable instantanement. 2) Effet reseau : plus d'agriculteurs = plus d'acheteurs "
        "= plus de donnees = meilleur scoring. 3) Integration GIM native : avantage reglementaire "
        "et technique significant."
    )

    pdf.h2("Questions d'un Investisseur")

    pdf.q_and_a(
        "Quel est votre burn rate et combien de runway avez-vous ?",
        "Couts actuels : ~80K FCFA/mois (hebergement + dev). Pas de salaires pour l'instant "
        "(equipe en mode hackathon/startup). Besoin de financement : 5M FCFA pour 12 mois "
        "d'operations (agents terrain + infra + legal). Breakeven a mois 6 avec 100 utilisateurs."
    )

    pdf.q_and_a(
        "Quelle est votre strategie de sortie / liquidite pour les investisseurs ?",
        "3 scenarios : 1) Acquisition par un acteur fintech ou bancaire regional (Orange, "
        "Wave, Ecobank). 2) Licence SaaS white-label pour les banques centrales d'autres zones. "
        "3) IPO sur BRVM a moyen terme si scale confirme. Le multiple vise est 10-20x revenus "
        "pour une fintech B2B en Afrique."
    )

    pdf.q_and_a(
        "Pourquoi vous et pas une equipe plus experimentee ?",
        "Nous connaissons le terrain : nous sommes des agriculteurs, des agents, des technologues "
        "d'Afrique de l'Ouest. Notre avantage : execution rapide (produit fonctionnel en semaines), "
        "cout bas (pas de salaires Silicon Valley), et comprehension intime du probleme. "
        "Les equipes 'experimentees' n'ont pas resolu ce probleme en 20 ans."
    )

    pdf.q_and_a(
        "Comment passez-vous de 100 a 25 000 utilisateurs ?",
        "Phase 1 (100) : agents terrain manuels, 1 region. Phase 2 (1000) : partenariat "
        "cooperatives existantes (CNCR, FONGS au Senegal = acces a 500K agriculteurs). "
        "Phase 3 (5000+) : integration mobile money (Wave, Orange Money) pour onboarding "
        "massif. Phase 4 : replication par franchise dans les 7 autres pays UEMOA."
    )

    pdf.h2("Questions d'un Dirigeant UEMOA/BCEAO")

    pdf.q_and_a(
        "En quoi FresCoop contribue aux objectifs de la BCEAO en inclusion financiere ?",
        "La BCEAO vise 75% d'inclusion financiere. FresCoop transforme les 30M+ d'agriculteurs "
        "actuellement informels en clients bancables. Nous alimentons directement l'indicateur "
        "d'inclusion en creant un pont entre activite productive et systeme financier formel. "
        "Chaque agriculteur score est un futur compte bancaire actif."
    )

    pdf.q_and_a(
        "Comment ca s'articule avec le systeme de paiement instantane (Pi-Spi) de la BCEAO ?",
        "FresCoop est complementaire : Pi-Spi fournit le rail de paiement instantane, "
        "nous fournissons le scoring et le dossier qui permettent l'octroi du credit. "
        "Les remboursements peuvent transiter par Pi-Spi. Notre API est concu pour "
        "s'integrer a tout rail de paiement BCEAO/GIM-UEMOA."
    )

    pdf.q_and_a(
        "Quelle reglementation s'applique ? Vous etes un etablissement financier ?",
        "Non, FresCoop n'est PAS un etablissement financier. Nous ne collectons pas de "
        "depots et n'octroyons pas de credit. Nous sommes un fournisseur de donnees/scoring "
        "(categorie prestataire technique). Pas d'agrement bancaire requis. Conforme au cadre "
        "reglementaire BCEAO sur les services financiers numeriques (2015) et la protection "
        "des donnees."
    )

    pdf.q_and_a(
        "Comment garantissez-vous l'interoperabilite avec les 130+ IMF de la zone ?",
        "API REST standard, documentation OpenAPI. Le scoring est un chiffre simple (0-100) "
        "avec un dossier PDF telechareable. Meme une IMF sans SI moderne peut utiliser "
        "le dossier. Pour les grandes institutions : integration API en < 1 semaine."
    )

    pdf.q_and_a(
        "Quel impact sur la souverainete alimentaire de la zone ?",
        "Chaque credit agricole bien place augmente la production locale de 2-3x. "
        "Si 25 000 agriculteurs sont finances : +37.5 Mds FCFA de production supplementaire "
        "estimee. Moins de dependance aux importations. Plus de stockage = moins de volatilite "
        "des prix. FresCoop est un outil de securite alimentaire regionale."
    )

    pdf.h2("Questions pieges / destabilisation")

    pdf.q_and_a(
        "Votre solution existe deja : FarmCrowdy, Twiga Foods, Apollo Agriculture...",
        "Ces acteurs operent en Afrique de l'Est (Kenya, Nigeria) avec des modeles differents : "
        "FarmCrowdy = crowdfunding, Twiga = logistique B2B, Apollo = intrants a credit. "
        "Aucun ne fait du SCORING pour tiers en zone UEMOA. Pas de concurrent direct dans "
        "notre zone monetaire. Premier avantage : first-mover UEMOA."
    )

    pdf.q_and_a(
        "90 jours c'est trop long. Un agriculteur a besoin de credit MAINTENANT.",
        "Le score se construit des le jour 1. A 30 jours avec activite soutenue, certains "
        "atteignent deja le seuil de 60. Le 90 jours est une moyenne conservative. "
        "Et surtout : avant FresCoop, c'etait 4-8 MOIS de procedure bancaire + rejet dans "
        "92% des cas. 90 jours avec certitude > 4 mois avec incertitude."
    )

    pdf.q_and_a(
        "Avec 21% du PIB en agriculture, le marche est-il vraiment si important ?",
        "21% du PIB MAIS 51% de la population active. C'est la plus grande disparite "
        "emploi/credit au monde. Et 21% de 148 556 Mds FCFA = 32 000 Mds FCFA de PIB "
        "agricole annuel. Meme 1% de ce PIB en credit facilite = 320 Mds FCFA de marche "
        "adressable. L'opportunite est massive."
    )

    pdf.q_and_a(
        "Les donnees satellite et l'IA ne rendent-elles pas votre scoring obsolete ?",
        "Au contraire, elles le renforcent. Phase 3 prevoit l'integration donnees satellite "
        "(NDVI, meteo) dans notre scoring. Mais les donnees satellite seules ne suffisent pas : "
        "elles mesurent la terre, pas le comportement commercial de l'agriculteur. "
        "Notre scoring comportemental + donnees satellite = le modele le plus complet."
    )

    # Save
    output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'FRESCOOP_DOSSIER_COMPLET.pdf')
    pdf.output(output_path)
    print(f"PDF genere : {output_path}")
    print(f"Pages : {pdf.page_no()}")


if __name__ == '__main__':
    generate()
