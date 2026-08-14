-- Ordre paramètres MALARIA (GOUTTE EPAISSE ET TDR) : EM après GE, DP en dernier

UPDATE parametres_type_examen AS pte
SET ordre = ord.ordre
FROM types_examen AS te
JOIN (
  VALUES
    ('GOUTTE EPAISSE', 0),
    ('ETALEMENT MINCE', 1),
    ('TROPHOZOIDE', 2),
    ('GAMÉTOCYTE', 3),
    ('SCHIZONTE', 4),
    ('PLASMODIUM FALCIPARUM', 5),
    ('PLASMODIUM MALARIAE', 6),
    ('PLASMODIUM OVALE', 7),
    ('PLASMODIUM VIVAX', 8),
    ('DENSITE PARASITAIRE', 9)
) AS ord(nom, ordre) ON pte.nom = ord.nom
WHERE pte.type_examen_id = te.id
  AND te.formulaire = 'malaria_ge';
