# AndroidIRCX — build sans publicité

Cette version retire l'intégration Google Mobile Ads/AdMob :

- bannières publicitaires supprimées de l'interface principale ;
- rewarded ads supprimées ;
- écran « Privacy & Ads » supprimé ;
- boutons « Watch Ad » supprimés ;
- dépendance `react-native-google-mobile-ads` supprimée ;
- patch `react-native-google-mobile-ads+16.5.0.patch` supprimé ;
- identifiant AdMob et permission `AD_ID` supprimés du manifeste Android ;
- configuration AdMob supprimée de `app.json` ;
- service de consentement UMP remplacé par un stockage local de consentement, afin de ne plus embarquer le SDK publicitaire ;
- achats intégrés/Premium conservés ;
- système de temps de scripting conservé, mais il n'y a plus de gain de temps via une publicité.

## Compilation

La compilation n'a pas pu être effectuée dans l'environnement de travail actuel :
- les dépendances JavaScript (`node_modules`) ne sont pas présentes dans l'archive ;
- le registre npm est inaccessible depuis cet environnement ;
- Gradle 9.4.1 n'est pas présent en cache et son téléchargement est également bloqué.

Les fichiers TS/TSX modifiés ont néanmoins été vérifiés avec le parseur TypeScript et ne présentent pas d'erreur de syntaxe.
