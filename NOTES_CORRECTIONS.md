# Notes de corrections - FresCoop Mobile

## Session du 2026-05-20

### Corrections effectuees

1. **mobile/src/api.js** - TERMINE
   - Ajout timeout 15s avec AbortController
   - Support HTTP 304 (retourne null si pas de changement)
   - Versioning du store via parametre `?v=`

2. **mobile/App.js - FarmersScreen** - TERMINE
   - Conversion .map() -> FlatList virtualisee
   - Ajout useMemo pour filtrage des agriculteurs
   - Ajout useCallback pour renderItem

3. **mobile/App.js - AdminUsersScreen (NOUVEAU)** - TERMINE
   - Ecran complet de gestion utilisateurs pour admin
   - Recherche par nom/email/phone/region
   - Filtres par role (chips horizontaux)
   - Pull-to-refresh
   - Composant UserCard avec memo()
   - Header sticky avec stickyHeaderIndices
   - Suppression FlatList imbriquee (remplacee par .map dans le header)

4. **mobile/App.js - DossiersScreen** - TERMINE
   - Conversion .map() -> FlatList
   - useMemo pour usersMap (lookup par id au lieu de .find())
   - useMemo pour filtrage des dossiers

5. **mobile/App.js - LotsScreen** - TERMINE
   - Conversion .map() -> FlatList
   - useMemo pour calcul des lots

6. **mobile/App.js - VerificationScreen** - TERMINE
   - Conversion .map() -> FlatList
   - useMemo pour split verified/unverified
   - ListEmptyComponent quand tout est verifie

7. **mobile/App.js - ImpactScreen** - TERMINE
   - Ajout useMemo pour tous les calculs (farmers, products, orders, volume, bancables)

8. **mobile/App.js - fetchStore (bug fix)** - TERMINE
   - Remplacement useState(storeVersion) par useRef pour eviter boucle infinie
   - fetchStore dependait de storeVersion dans useCallback, ce qui recree fetchStore a chaque update
   - useRef ne provoque pas de re-render

9. **mobile/src/screens/HomeScreen.js** - TERMINE
   - useMemo pour buildBancabiliteScore (calcul lourd)
   - useMemo pour products, orders, completedOrders, pendingOrders, totalRevenue

10. **mobile/src/screens/MarketScreen.js** - TERMINE
    - useMemo pour usersMap (lookup O(1) au lieu de .find() O(n) dans renderItem)
    - useMemo pour filtrage des produits

11. **mobile/src/screens/OrdersScreen.js** - TERMINE
    - useMemo pour usersMap
    - useMemo pour allOrders et orders filtres
    - useMemo pour activeCount (evite recalcul dans le render)

12. **mobile/src/screens/ProductsScreen.js** - TERMINE
    - useMemo pour filtrage des produits de l'utilisateur

13. **mobile/src/screens/ProfileScreen.js** - TERMINE
    - useMemo pour dossiers, validDossiers, proofs, totalRevenue

14. **mobile/src/screens/ScoreScreen.js** - TERMINE
    - useMemo pour tout le calcul du score et criteres

### Verification syntaxique - TOUS OK
- App.js, HomeScreen, MarketScreen, OrdersScreen, ProductsScreen, ProfileScreen, ScoreScreen, api.js

### Prochaines corrections a faire

- [ ] Verifier que le backend supporte le parametre `?v=` dans /api/store
- [ ] Tester le comportement offline complet
- [ ] Tester sur device/emulateur
- [ ] Verifier les performances avec React DevTools profiler
