<!-- Modal générique pour formulaires d'examens BIOCHIMIE, CLIA, HORMONES -->
<div class="modal" id="examFormModal" aria-hidden="true" style="z-index:101000;">
    <div class="modal-dialog" id="examFormDialog" style="width:96%;max-width:1200px;padding:36px;">
        <h3 id="examFormTitle" style="font-size:28px;margin-bottom:3px;font-weight:600;">Saisir Résultat</h3>
        
        <div class="modal-body" id="examFormBody" style="padding:30px;font-size:17px;">
            <!-- Patient summary sera inséré ici -->
            <div id="examFormPatientSummary" style="margin-bottom:20px;"></div>
            
            <!-- Formulaire horizontal sur une seule ligne -->
            <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                <!-- Nom examen -->
                <div style="font-weight:600;min-width:120px;font-size:15px;">
                    <span id="examParamName">---</span>
                </div>
                
                <!-- Séparateur -->
                <div style="color:#ccc;">:</div>
                
                <!-- Flag dropdown (more compact) -->
                <select id="examFlagSelect" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;" required>
                    <option value="">---</option>
                       <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                </select>
                
                  <!-- Resultats input -->
                <input type="text" id="examResultInput" required 
                      style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;"
                      placeholder="Valeur">
                
                <!-- Unité -->
                <div style="min-width:60px;color:#555;font-size:14px;">
                    <span id="examUniteText">---</span>
                </div>
                
                <!-- Range usuelle -->
                <div style="min-width:80px;color:#555;font-size:14px;">
                    <span id="examRangeText">---</span>
                </div>
                
                <!-- Checkbox Not Required (checkbox at left, label to right) -->
                <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                    <input type="checkbox" id="examNotRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                    <span style="color:#333;font-size:14px;line-height:1;display:inline-block;transform:translateY(-1px);">Not Required ?</span>
                </label>
                
                <!-- Bouton ajouter -->
                <button class="btn small purple" style="padding:8px 12px;font-size:13px;">➕</button>
            </div>
            
            <!-- Info specimen et unite (optionnel, peut être caché) -->
            <div style="background:#f0f0f0;padding:12px;border-radius:4px;margin-top:15px;font-size:14px;color:#666;display:none;">
                <div><strong>Specimen:</strong> <span id="examSpecimenText">---</span></div>
                <div><strong>Unité (info):</strong> <span id="examUniteInfo">---</span></div>
            </div>
            
            <!-- Section Commentaires avec Pièces jointes -->
            <div style="margin-top:20px;">
                <label style="display:block;font-weight:600;margin-bottom:10px;font-size:15px;color:#333;">Commentaires :</label>
                <div style="position:relative;">
                    <textarea id="examCommentsInput" placeholder="Entrez vos commentaires ici..." style="width:100%;min-height:90px;padding:12px;padding-top:40px;border:2px dashed #999;border-radius:6px;font-size:14px;font-family:Arial,sans-serif;resize:vertical;box-sizing:border-box;background:#f9f9f9;color:#666;"></textarea>
                    <button id="attachmentBtn" class="btn small purple" style="position:absolute;top:8px;left:8px;padding:6px 10px;font-size:12px;white-space:nowrap;height:auto;">📎</button>
                </div>
                
                <!-- Input file caché -->
                <input type="file" id="examAttachmentInput" multiple style="display:none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt">
                
                <!-- Liste des fichiers attachés -->
                <div id="attachmentList" style="margin-top:12px;">
                    <!-- Les fichiers sélectionnés apparaîtront ici -->
                </div>
            </div>
        </div>
        
        <div class="modal-actions" style="display:flex;justify-content:flex-end;gap:18px;padding:24px;border-top:1px solid var(--border);background:transparent;">
            <button id="examFormCancel" class="btn muted" style="padding:10px 32px;font-size:16px;">Annuler</button>
            <button id="examFormSubmit" class="btn muted" style="padding:10px 32px;font-size:16px;">Enregistrer</button> 
            <button id="examFormVerify" class="btn muted" style="padding:10px 32px;font-size:16px;">Vérifier</button>
        </div>
    </div>
</div>

<!-- Modal générique pour BILANS DES ANALYSES MEDICALES (copie de examFormModal) -->
<div class="modal" id="bilansAnalysesModal" aria-hidden="true" style="z-index:101000;">
    <div class="modal-dialog" id="bilansAnalysesDialog" style="width:96%;max-width:1200px;padding:36px;">
        <h3 id="bilansAnalysesTitle" style="font-size:28px;margin-bottom:3px;font-weight:600;">BILANS DES ANALYSES MEDICALES - Saisir Résultat</h3>
        
        <div class="modal-body" id="bilansAnalysesBody" style="padding:30px;font-size:17px;">
            <!-- Patient summary sera inséré ici -->
            <div id="bilansAnalysesPatientSummary" style="margin-bottom:20px;"></div>
            
            <!-- Formulaire horizontal sur une seule ligne -->
            <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                <!-- Nom examen -->
                <div style="font-weight:600;min-width:120px;font-size:15px;">
                    <span id="bilansParamName">---</span>
                </div>
                
                <!-- Séparateur -->
                <div style="color:#ccc;">:</div>
                
                <!-- Flag dropdown (more compact) -->
                <select id="bilansFlagSelect" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;" required>
                    <option value="">---</option>
                       <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                </select>
                
                  <!-- Resultats input -->
                <input type="text" id="bilansResultInput" required 
                      style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;"
                      placeholder="Valeur">
                
                <!-- Unité -->
                <div style="min-width:60px;color:#555;font-size:14px;">
                    <span id="bilansUniteText">---</span>
                </div>
                
                <!-- Range usuelle -->
                <div style="min-width:80px;color:#555;font-size:14px;">
                    <span id="bilansRangeText">---</span>
                </div>
                
                <!-- Checkbox Not Required (checkbox at left, label to right) -->
                <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                    <input type="checkbox" id="bilansNotRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                    <span style="color:#333;font-size:14px;line-height:1;display:inline-block;transform:translateY(-1px);">Not Required ?</span>
                </label>
                
                <!-- Bouton ajouter -->
                <button class="btn small purple" style="padding:8px 12px;font-size:13px;">➕</button>
            </div>
            
            <!-- Info specimen et unite (optionnel, peut être caché) -->
            <div style="background:#f0f0f0;padding:12px;border-radius:4px;margin-top:15px;font-size:14px;color:#666;display:none;">
                <div><strong>Specimen:</strong> <span id="bilansSpecimenText">---</span></div>
                <div><strong>Unité (info):</strong> <span id="bilansUniteInfo">---</span></div>
            </div>
            
            <!-- Section Commentaires avec Pièces jointes -->
            <div style="margin-top:20px;">
                <label style="display:block;font-weight:600;margin-bottom:10px;font-size:15px;color:#333;">Commentaires :</label>
                <div style="position:relative;">
                    <textarea id="bilansCommentsInput" placeholder="Entrez vos commentaires ici..." style="width:100%;min-height:90px;padding:12px;padding-top:40px;border:2px dashed #999;border-radius:6px;font-size:14px;font-family:Arial,sans-serif;resize:vertical;box-sizing:border-box;background:#f9f9f9;color:#666;"></textarea>
                    <button id="bilansAttachmentBtn" class="btn small purple" style="position:absolute;top:8px;left:8px;padding:6px 10px;font-size:12px;white-space:nowrap;height:auto;">📎</button>
                </div>
                
                <!-- Input file caché -->
                <input type="file" id="bilansAttachmentInput" multiple style="display:none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt">
                
                <!-- Liste des fichiers attachés -->
                <div id="bilansAttachmentList" style="margin-top:12px;">
                    <!-- Les fichiers sélectionnés apparaîtront ici -->
                </div>
            </div>
        </div>
        
        <div class="modal-actions" style="display:flex;justify-content:flex-end;gap:18px;padding:24px;border-top:1px solid var(--border);background:transparent;">
            <button id="bilansAnalysesCancel" class="btn muted" style="padding:10px 32px;font-size:16px;">Annuler</button>
            <button id="bilansAnalysesSubmit" class="btn muted" style="padding:10px 32px;font-size:16px;">Enregistrer</button> 
            <button id="bilansAnalysesVerify" class="btn muted" style="padding:10px 32px;font-size:16px;">Vérifier</button>
        </div>
    </div>
</div>

<!-- Modal spécifique pour IONOGRAMME (Na+, Cl-, K+) -->
<div class="modal" id="ionogrammeModal" aria-hidden="true" style="z-index:101000;">
    <div class="modal-dialog" id="ionogrammeDialog" style="width:96%;max-width:1200px;padding:36px;">
        <h3 id="ionogrammeTitle" style="font-size:28px;margin-bottom:3px;font-weight:600;">Ionogramme (Na+, Cl-, K+) - Saisir Résultat</h3>
        
        <div class="modal-body" id="ionogrammeBody" style="padding:30px;font-size:17px;">
            <!-- Patient summary sera inséré ici -->
            <div id="ionogrammePatientSummary" style="margin-bottom:20px;"></div>
            
            <!-- Formulaire avec trois paramètres en lignes -->
            <div style="display:flex;flex-direction:column;gap:12px;">
                <!-- SODIUM (Na+) -->
                <div data-ionogramme-param="SODIUM" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">SODIUM (Na+)</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Flag dropdown -->
                    <select class="ionogramme-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    
                    <!-- Résultat input -->
                    <input type="text" class="ionogramme-param-valeur" placeholder="Valeur" required
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;">
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="ionogramme-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="ionogramme-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="ionogramme-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple ionogramme-param-btn" style="padding:8px 12px;font-size:13px;" data-param="SODIUM">➕</button>
                </div>

                <!-- POTASSIUM (K+) -->
                <div data-ionogramme-param="POTASSIUM" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">POTASSIUM (K+)</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Flag dropdown -->
                    <select class="ionogramme-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    
                    <!-- Résultat input -->
                    <input type="text" class="ionogramme-param-valeur" placeholder="Valeur" required
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;">
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="ionogramme-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="ionogramme-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="ionogramme-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple ionogramme-param-btn" style="padding:8px 12px;font-size:13px;" data-param="POTASSIUM">➕</button>
                </div>

                <!-- CHLORIDE (Cl-) -->
                <div data-ionogramme-param="CHLORIDE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">CHLORIDE (Cl-)</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Flag dropdown -->
                    <select class="ionogramme-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    
                    <!-- Résultat input -->
                    <input type="text" class="ionogramme-param-valeur" placeholder="Valeur" required
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;">
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="ionogramme-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="ionogramme-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="ionogramme-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple ionogramme-param-btn" style="padding:8px 12px;font-size:13px;" data-param="CHLORIDE">➕</button>
                </div>
            </div>
            
            <!-- Section Commentaires avec Pièces jointes -->
            <div style="margin-top:20px;">
                <label style="display:block;font-weight:600;margin-bottom:10px;font-size:15px;color:#333;">Commentaires :</label>
                <div style="position:relative;">
                    <textarea id="ionogrammeCommentsInput" placeholder="Entrez vos commentaires ici..." style="width:100%;min-height:90px;padding:12px;padding-top:40px;border:2px dashed #999;border-radius:6px;font-size:14px;font-family:Arial,sans-serif;resize:vertical;box-sizing:border-box;background:#f9f9f9;color:#666;"></textarea>
                    <button id="ionogrammeAttachmentBtn" class="btn small purple" style="position:absolute;top:8px;left:8px;padding:6px 10px;font-size:12px;white-space:nowrap;height:auto;">📎</button>
                </div>
                
                <!-- Input file caché -->
                <input type="file" id="ionogrammeAttachmentInput" multiple style="display:none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt">
                
                <!-- Liste des fichiers attachés -->
                <div id="ionogrammeAttachmentList" style="margin-top:12px;">
                    <!-- Les fichiers sélectionnés apparaîtront ici -->
                </div>
            </div>
        </div>
        
        <div class="modal-actions" style="display:flex;justify-content:flex-end;gap:18px;padding:24px;border-top:1px solid var(--border);background:transparent;">
            <button id="ionogrammeCancel" class="btn muted" style="padding:10px 32px;font-size:16px;">Annuler</button>
            <button id="ionogrammeSubmit" class="btn muted" style="padding:10px 32px;font-size:16px;">Enregistrer</button> 
            <button id="ionogrammeVerify" class="btn muted" style="padding:10px 32px;font-size:16px;">Vérifier</button>
        </div>
    </div>
</div>

<!-- Modal pour formulaires d'examens SPOT URINES NA+ CL- K+ -->
<div class="modal" id="spotUrinesModal" aria-hidden="true" style="z-index:101000;">
    <div class="modal-dialog" id="spotUrinesDialog" style="width:96%;max-width:1200px;padding:36px;">
        <h3 id="spotUrinesTitle" style="font-size:28px;margin-bottom:3px;font-weight:600;">Spot Urines Na+ Cl- K+ - Saisir Résultat</h3>
        
        <div class="modal-body" id="spotUrinesBody" style="padding:30px;font-size:17px;">
            <!-- Patient summary sera inséré ici -->
            <div id="spotUrinesPatientSummary" style="margin-bottom:20px;"></div>
            
            <!-- Formulaire avec trois paramètres en lignes -->
            <div style="display:flex;flex-direction:column;gap:12px;">
                <!-- SODIUM (Na+) -->
                <div data-spotUrines-param="SODIUM" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">SODIUM (Na+)</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Flag dropdown -->
                    <select class="spotUrines-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    
                    <!-- Résultat input -->
                    <input type="text" class="spotUrines-param-valeur" placeholder="Valeur" required
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;">
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="spotUrines-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="spotUrines-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="spotUrines-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple spotUrines-param-btn" style="padding:8px 12px;font-size:13px;" data-param="SODIUM">➕</button>
                </div>

                <!-- POTASSIUM (K+) -->
                <div data-spotUrines-param="POTASSIUM" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">POTASSIUM (K+)</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Flag dropdown -->
                    <select class="spotUrines-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    
                    <!-- Résultat input -->
                    <input type="text" class="spotUrines-param-valeur" placeholder="Valeur"
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="spotUrines-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="spotUrines-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="spotUrines-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple spotUrines-param-btn" style="padding:8px 12px;font-size:13px;" data-param="POTASSIUM">➕</button>
                </div>

                <!-- CHLORIDE (Cl-) -->
                <div data-spotUrines-param="CHLORIDE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">CHLORIDE (Cl-)</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Flag dropdown -->
                    <select class="spotUrines-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    
                    <!-- Résultat input -->
                    <input type="text" class="spotUrines-param-valeur" placeholder="Valeur" required
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;">
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="spotUrines-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="spotUrines-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="spotUrines-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple spotUrines-param-btn" style="padding:8px 12px;font-size:13px;" data-param="CHLORIDE">➕</button>
                </div>
            </div>
            
            <!-- Section Commentaires avec Pièces jointes -->
            <div style="margin-top:20px;">
                <label style="display:block;font-weight:600;margin-bottom:10px;font-size:15px;color:#333;">Commentaires :</label>
                <div style="position:relative;">
                    <textarea id="spotUrinesCommentsInput" placeholder="Entrez vos commentaires ici..." style="width:100%;min-height:90px;padding:12px;padding-top:40px;border:2px dashed #999;border-radius:6px;font-size:14px;font-family:Arial,sans-serif;resize:vertical;box-sizing:border-box;background:#f9f9f9;color:#666;"></textarea>
                    <button id="spotUrinesAttachmentBtn" class="btn small purple" style="position:absolute;top:8px;left:8px;padding:6px 10px;font-size:12px;white-space:nowrap;height:auto;">📎</button>
                </div>
                
                <!-- Input file caché -->
                <input type="file" id="spotUrinesAttachmentInput" multiple style="display:none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt">
                
                <!-- Liste des fichiers attachés -->
                <div id="spotUrinesAttachmentList" style="margin-top:12px;">
                    <!-- Les fichiers sélectionnés apparaîtront ici -->
                </div>
            </div>
        </div>
        
        <div class="modal-actions" style="display:flex;justify-content:flex-end;gap:18px;padding:24px;border-top:1px solid var(--border);background:transparent;">
            <button id="spotUrinesCancel" class="btn muted" style="padding:10px 32px;font-size:16px;">Annuler</button>
            <button id="spotUrinesSubmit" class="btn muted" style="padding:10px 32px;font-size:16px;">Enregistrer</button> 
            <button id="spotUrinesVerify" class="btn muted" style="padding:10px 32px;font-size:16px;">Vérifier</button>
        </div>
    </div>
</div>

<!-- Modal pour formulaires d'examens PROTEINURIE 24 HEURES -->
<div class="modal" id="proteinurie24Modal" aria-hidden="true" style="z-index:101000;">
    <div class="modal-dialog" id="proteinurie24Dialog" style="width:96%;max-width:1200px;padding:36px;">
        <h3 id="proteinurie24Title" style="font-size:28px;margin-bottom:3px;font-weight:600;">Protéinurie de 24 heures - Saisir Résultat</h3>
        
        <div class="modal-body" id="proteinurie24Body" style="padding:30px;font-size:17px;">
            <!-- Patient summary sera inséré ici -->
            <div id="proteinurie24PatientSummary" style="margin-bottom:20px;"></div>
            
            <!-- Formulaire avec trois paramètres en lignes -->
            <div style="display:flex;flex-direction:column;gap:12px;">
                <!-- TOTAL PROTEINURIE -->
                <div data-proteinurie24-param="TOTAL PROTEINURIE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">TOTAL PROTEINURIE</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Flag dropdown -->
                    <select class="proteinurie24-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    
                    <!-- Résultat input -->
                    <input type="text" class="proteinurie24-param-valeur" placeholder="Valeur" required
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;">
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="proteinurie24-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="proteinurie24-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="proteinurie24-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple proteinurie24-param-btn" style="padding:8px 12px;font-size:13px;" data-param="TOTAL PROTEINURIE">➕</button>
                </div>

                <!-- VOLUME URINE/24 H -->
                <div data-proteinurie24-param="VOLUME URINE/24 H" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">VOLUME URINE/24 H</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Flag dropdown -->
                    <select class="proteinurie24-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    
                    <!-- Résultat input -->
                    <input type="text" class="proteinurie24-param-valeur" placeholder="Valeur" required
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;">
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="proteinurie24-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="proteinurie24-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="proteinurie24-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple proteinurie24-param-btn" style="padding:8px 12px;font-size:13px;" data-param="VOLUME URINE/24 H">➕</button>
                </div>

                <!-- PROTEINURIE 24 HEURES -->
                <div data-proteinurie24-param="PROTEINURIE 24 HEURES" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">PROTEINURIE 24 HEURES</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Flag dropdown -->
                    <select class="proteinurie24-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    
                    <!-- Résultat input -->
                    <input type="text" class="proteinurie24-param-valeur" placeholder="Valeur"
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="proteinurie24-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="proteinurie24-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="proteinurie24-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple proteinurie24-param-btn" style="padding:8px 12px;font-size:13px;" data-param="PROTEINURIE 24 HEURES">➕</button>
                </div>
            </div>
            
            <!-- Section Commentaires avec Pièces jointes -->
            <div style="margin-top:20px;">
                <label style="display:block;font-weight:600;margin-bottom:10px;font-size:15px;color:#333;">Commentaires :</label>
                <div style="position:relative;">
                    <textarea id="proteinurie24CommentsInput" placeholder="Entrez vos commentaires ici..." style="width:100%;min-height:90px;padding:12px;padding-top:40px;border:2px dashed #999;border-radius:6px;font-size:14px;font-family:Arial,sans-serif;resize:vertical;box-sizing:border-box;background:#f9f9f9;color:#666;"></textarea>
                    <button id="proteinurie24AttachmentBtn" class="btn small purple" style="position:absolute;top:8px;left:8px;padding:6px 10px;font-size:12px;white-space:nowrap;height:auto;">📎</button>
                </div>
                
                <!-- Input file caché -->
                <input type="file" id="proteinurie24AttachmentInput" multiple style="display:none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt">
                
                <!-- Liste des fichiers attachés -->
                <div id="proteinurie24AttachmentList" style="margin-top:12px;">
                    <!-- Les fichiers sélectionnés apparaîtront ici -->
                </div>
            </div>
        </div>
        
        <div class="modal-actions" style="display:flex;justify-content:flex-end;gap:18px;padding:24px;border-top:1px solid var(--border);background:transparent;">
            <button id="proteinurie24Cancel" class="btn muted" style="padding:10px 32px;font-size:16px;">Annuler</button>
            <button id="proteinurie24Submit" class="btn muted" style="padding:10px 32px;font-size:16px;">Enregistrer</button> 
            <button id="proteinurie24Verify" class="btn muted" style="padding:10px 32px;font-size:16px;">Vérifier</button>
        </div>
    </div>
</div>

<!-- Modal pour formulaires d'examens BILANS PROTEINES TOTALES -->
<div class="modal" id="pttModal" aria-hidden="true" style="z-index:101000;">
    <div class="modal-dialog" id="pttDialog" style="width:96%;max-width:1200px;padding:36px;">
        <h3 id="pttTitle" style="font-size:28px;margin-bottom:3px;font-weight:600;">Bilans Protéines Totales - Saisir Résultat</h3>
        
        <div class="modal-body" id="pttBody" style="padding:30px;font-size:17px;">
            <!-- Patient summary sera inséré ici -->
            <div id="pttPatientSummary" style="margin-bottom:20px;"></div>
            
            <!-- Formulaire avec quatre paramètres en lignes -->
            <div style="display:flex;flex-direction:column;gap:12px;">
                <!-- PROTEINE TOTALES -->
                <div data-ptt-param="PROTEINE TOTALES" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">PROTEINE TOTALES</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Flag dropdown -->
                    <select class="ptt-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    
                    <!-- Résultat input -->
                    <input type="text" class="ptt-param-valeur" placeholder="Valeur" required
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;">
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="ptt-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="ptt-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="ptt-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple ptt-param-btn" style="padding:8px 12px;font-size:13px;" data-param="PROTEINE TOTALES">➕</button>
                </div>

                <!-- ALBUMINE -->
                <div data-ptt-param="ALBUMINE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">ALBUMINE</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Flag dropdown -->
                    <select class="ptt-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    
                    <!-- Résultat input -->
                    <input type="text" class="ptt-param-valeur" placeholder="Valeur"
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="ptt-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="ptt-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="ptt-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple ptt-param-btn" style="padding:8px 12px;font-size:13px;" data-param="ALBUMINE">➕</button>
                </div>

                <!-- GLOBULINE -->
                <div data-ptt-param="GLOBULINE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">GLOBULINE</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Flag dropdown -->
                    <select class="ptt-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    
                    <!-- Résultat input -->
                    <input type="text" class="ptt-param-valeur" placeholder="Valeur"
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="ptt-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="ptt-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="ptt-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple ptt-param-btn" style="padding:8px 12px;font-size:13px;" data-param="GLOBULINE">➕</button>
                </div>

                <!-- RAPPORT ALBU/GLOBU -->
                <div data-ptt-param="RAPPORT ALBU/GLOBU" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">RAPPORT ALBU/GLOBU</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Flag dropdown -->
                    <select class="ptt-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    
                    <!-- Résultat input -->
                    <input type="text" class="ptt-param-valeur" placeholder="Valeur"
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="ptt-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="ptt-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="ptt-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple ptt-param-btn" style="padding:8px 12px;font-size:13px;" data-param="RAPPORT ALBU/GLOBU">➕</button>
                </div>
            </div>
            
            <!-- Section Commentaires avec Pièces jointes -->
            <div style="margin-top:20px;">
                <label style="display:block;font-weight:600;margin-bottom:10px;font-size:15px;color:#333;">Commentaires :</label>
                <div style="position:relative;">
                    <textarea id="pttCommentsInput" placeholder="Entrez vos commentaires ici..." style="width:100%;min-height:90px;padding:12px;padding-top:40px;border:2px dashed #999;border-radius:6px;font-size:14px;font-family:Arial,sans-serif;resize:vertical;box-sizing:border-box;background:#f9f9f9;color:#666;"></textarea>
                    <button id="pttAttachmentBtn" class="btn small purple" style="position:absolute;top:8px;left:8px;padding:6px 10px;font-size:12px;white-space:nowrap;height:auto;">📎</button>
                </div>
                
                <!-- Input file caché -->
                <input type="file" id="pttAttachmentInput" multiple style="display:none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt">
                
                <!-- Liste des fichiers attachés -->
                <div id="pttAttachmentList" style="margin-top:12px;">
                    <!-- Les fichiers sélectionnés apparaîtront ici -->
                </div>
            </div>
        </div>
        
        <div class="modal-actions" style="display:flex;justify-content:flex-end;gap:18px;padding:24px;border-top:1px solid var(--border);background:transparent;">
            <button id="pttCancel" class="btn muted" style="padding:10px 32px;font-size:16px;">Annuler</button>
            <button id="pttSubmit" class="btn muted" style="padding:10px 32px;font-size:16px;">Enregistrer</button> 
            <button id="pttVerify" class="btn muted" style="padding:10px 32px;font-size:16px;">Vérifier</button>
        </div>
    </div>
</div>

<!-- Modal pour formulaires d'examens BILANS AZOTES -->
<div class="modal" id="bilansAzotesModal" aria-hidden="true" style="z-index:101000;">
    <div class="modal-dialog" id="bilansAzotesDialog" style="width:96%;max-width:1200px;padding:36px;">
        <h3 id="bilansAzotesTitle" style="font-size:28px;margin-bottom:3px;font-weight:600;">Bilans Azote - Saisir Résultat</h3>
        
        <div class="modal-body" id="bilansAzotesBody" style="padding:30px;font-size:17px;">
            <!-- Patient summary sera inséré ici -->
            <div id="bilansAzotesPatientSummary" style="margin-bottom:20px;"></div>
            
            <!-- Formulaire avec quatre paramètres en lignes -->
            <div style="display:flex;flex-direction:column;gap:12px;">
                <!-- UREE -->
                <div data-bilansAzotes-param="UREE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">URÉE</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Flag dropdown -->
                    <select class="bilansAzotes-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    
                    <!-- Résultat input -->
                    <input type="text" class="bilansAzotes-param-valeur" placeholder="Valeur" required
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;">
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="bilansAzotes-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="bilansAzotes-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="bilansAzotes-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple bilansAzotes-param-btn" style="padding:8px 12px;font-size:13px;" data-param="UREE">➕</button>
                </div>

                <!-- CREATININE -->
                <div data-bilansAzotes-param="CREATININE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">CRÉATININE</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Flag dropdown -->
                    <select class="bilansAzotes-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    
                    <!-- Résultat input -->
                    <input type="text" class="bilansAzotes-param-valeur" placeholder="Valeur"
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="bilansAzotes-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="bilansAzotes-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="bilansAzotes-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple bilansAzotes-param-btn" style="padding:8px 12px;font-size:13px;" data-param="CREATININE">➕</button>
                </div>

                <!-- ACIDE URIQUE -->
                <div data-bilansAzotes-param="ACIDE URIQUE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">ACIDE URIQUE</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Flag dropdown -->
                    <select class="bilansAzotes-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    
                    <!-- Résultat input -->
                    <input type="text" class="bilansAzotes-param-valeur" placeholder="Valeur"
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="bilansAzotes-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="bilansAzotes-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="bilansAzotes-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple bilansAzotes-param-btn" style="padding:8px 12px;font-size:13px;" data-param="ACIDE URIQUE">➕</button>
                </div>

                <!-- RAPPORT UREE/CREATININE -->
                <div data-bilansAzotes-param="RAPPORT UREE/CREATININE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">RAPPORT URÉE/CRÉATININE</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Flag dropdown -->
                    <select class="bilansAzotes-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    
                    <!-- Résultat input -->
                    <input type="text" class="bilansAzotes-param-valeur" placeholder="Valeur"
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="bilansAzotes-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="bilansAzotes-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="bilansAzotes-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple bilansAzotes-param-btn" style="padding:8px 12px;font-size:13px;" data-param="RAPPORT UREE/CREATININE">➕</button>
                </div>
            </div>
            
            <!-- Section Commentaires avec Pièces jointes -->
            <div style="margin-top:20px;">
                <label style="display:block;font-weight:600;margin-bottom:10px;font-size:15px;color:#333;">Commentaires :</label>
                <div style="position:relative;">
                    <textarea id="bilansAzotesCommentsInput" placeholder="Entrez vos commentaires ici..." style="width:100%;min-height:90px;padding:12px;padding-top:40px;border:2px dashed #999;border-radius:6px;font-size:14px;font-family:Arial,sans-serif;resize:vertical;box-sizing:border-box;background:#f9f9f9;color:#666;"></textarea>
                    <button id="bilansAzotesAttachmentBtn" class="btn small purple" style="position:absolute;top:8px;left:8px;padding:6px 10px;font-size:12px;white-space:nowrap;height:auto;">📎</button>
                </div>
                
                <!-- Input file caché -->
                <input type="file" id="bilansAzotesAttachmentInput" multiple style="display:none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt">
                
                <!-- Liste des fichiers attachés -->
                <div id="bilansAzotesAttachmentList" style="margin-top:12px;">
                    <!-- Les fichiers sélectionnés apparaîtront ici -->
                </div>
            </div>
        </div>
        
        <div class="modal-actions" style="display:flex;justify-content:flex-end;gap:18px;padding:24px;border-top:1px solid var(--border);background:transparent;">
            <button id="bilansAzotesCancel" class="btn muted" style="padding:10px 32px;font-size:16px;">Annuler</button>
            <button id="bilansAzotesSubmit" class="btn muted" style="padding:10px 32px;font-size:16px;">Enregistrer</button> 
            <button id="bilansAzotesVerify" class="btn muted" style="padding:10px 32px;font-size:16px;">Vérifier</button>
        </div>
    </div>
</div>

<!-- Modal pour formulaires d'examens PROFIL LIPIDIQUE -->
<div class="modal" id="profilLipidiqueModal" aria-hidden="true" style="z-index:101000;">
    <div class="modal-dialog" id="profilLipidiqueDialog" style="width:96%;max-width:1200px;padding:36px;">
        <h3 id="profilLipidiqueTitle" style="font-size:28px;margin-bottom:3px;font-weight:600;">Profil Lipidique - Saisir Résultat</h3>
        
        <div class="modal-body" id="profilLipidiqueBody" style="padding:30px;font-size:17px;">
            <!-- Patient summary sera inséré ici -->
            <div id="profilLipidiquePatientSummary" style="margin-bottom:20px;"></div>
            
            <!-- Formulaire avec sept paramètres en lignes -->
            <div style="display:flex;flex-direction:column;gap:12px;">
                <!-- TOTAL CHOLESTEROL -->
                <div data-profilLipidique-param="TOTAL CHOLESTEROL" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">TOTAL CHOLESTEROL</div>
                    <div style="color:#ccc;">:</div>
                    <select class="profilLipidique-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    <input type="text" class="profilLipidique-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="profilLipidique-param-unite">---</span></div>
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="profilLipidique-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="profilLipidique-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple profilLipidique-param-btn" style="padding:8px 12px;font-size:13px;" data-param="TOTAL CHOLESTEROL">➕</button>
                </div>

                <!-- HDL CHOLESTEROL -->
                <div data-profilLipidique-param="HDL CHOLESTEROL" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">HDL CHOLESTEROL</div>
                    <div style="color:#ccc;">:</div>
                    <select class="profilLipidique-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    <input type="text" class="profilLipidique-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="profilLipidique-param-unite">---</span></div>
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="profilLipidique-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="profilLipidique-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple profilLipidique-param-btn" style="padding:8px 12px;font-size:13px;" data-param="HDL CHOLESTEROL">➕</button>
                </div>

                <!-- TRIGLYCERIDE -->
                <div data-profilLipidique-param="TRIGLYCERIDE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">TRIGLYCERIDE</div>
                    <div style="color:#ccc;">:</div>
                    <select class="profilLipidique-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    <input type="text" class="profilLipidique-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="profilLipidique-param-unite">---</span></div>
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="profilLipidique-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="profilLipidique-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple profilLipidique-param-btn" style="padding:8px 12px;font-size:13px;" data-param="TRIGLYCERIDE">➕</button>
                </div>

                <!-- LDL CHOLESTEROL -->
                <div data-profilLipidique-param="LDL CHOLESTEROL" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">LDL CHOLESTEROL</div>
                    <div style="color:#ccc;">:</div>
                    <select class="profilLipidique-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    <input type="text" class="profilLipidique-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="profilLipidique-param-unite">---</span></div>
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="profilLipidique-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="profilLipidique-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple profilLipidique-param-btn" style="padding:8px 12px;font-size:13px;" data-param="LDL CHOLESTEROL">➕</button>
                </div>

                <!-- RAPPORT CHOL/HDL -->
                <div data-profilLipidique-param="RAPPORT CHOL/HDL" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">RAPPORT CHOL/HDL</div>
                    <div style="color:#ccc;">:</div>
                    <select class="profilLipidique-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    <input type="text" class="profilLipidique-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="profilLipidique-param-unite">---</span></div>
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="profilLipidique-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="profilLipidique-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple profilLipidique-param-btn" style="padding:8px 12px;font-size:13px;" data-param="RAPPORT CHOL/HDL">➕</button>
                </div>

                <!-- RAPPORT LDL/HDL -->
                <div data-profilLipidique-param="RAPPORT LDL/HDL" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">RAPPORT LDL/HDL</div>
                    <div style="color:#ccc;">:</div>
                    <select class="profilLipidique-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    <input type="text" class="profilLipidique-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="profilLipidique-param-unite">---</span></div>
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="profilLipidique-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="profilLipidique-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple profilLipidique-param-btn" style="padding:8px 12px;font-size:13px;" data-param="RAPPORT LDL/HDL">➕</button>
                </div>

                <!-- VLDL -->
                <div data-profilLipidique-param="VLDL" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">VLDL</div>
                    <div style="color:#ccc;">:</div>
                    <select class="profilLipidique-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    <input type="text" class="profilLipidique-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="profilLipidique-param-unite">---</span></div>
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="profilLipidique-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="profilLipidique-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple profilLipidique-param-btn" style="padding:8px 12px;font-size:13px;" data-param="VLDL">➕</button>
                </div>
            </div>
            
            <!-- Section Commentaires avec Pièces jointes -->
            <div style="margin-top:20px;">
                <label style="display:block;font-weight:600;margin-bottom:10px;font-size:15px;color:#333;">Commentaires :</label>
                <div style="position:relative;">
                    <textarea id="profilLipidiqueCommentsInput" placeholder="Entrez vos commentaires ici..." style="width:100%;min-height:90px;padding:12px;padding-top:40px;border:2px dashed #999;border-radius:6px;font-size:14px;font-family:Arial,sans-serif;resize:vertical;box-sizing:border-box;background:#f9f9f9;color:#666;"></textarea>
                    <button id="profilLipidiqueAttachmentBtn" class="btn small purple" style="position:absolute;top:8px;left:8px;padding:6px 10px;font-size:12px;white-space:nowrap;height:auto;">📎</button>
                </div>
                
                <!-- Input file caché -->
                <input type="file" id="profilLipidiqueAttachmentInput" multiple style="display:none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt">
                
                <!-- Liste des fichiers attachés -->
                <div id="profilLipidiqueAttachmentList" style="margin-top:12px;">
                    <!-- Les fichiers sélectionnés apparaîtront ici -->
                </div>
            </div>
        </div>
        
        <div class="modal-actions" style="display:flex;justify-content:flex-end;gap:18px;padding:24px;border-top:1px solid var(--border);background:transparent;">
            <button id="profilLipidiqueCancel" class="btn muted" style="padding:10px 32px;font-size:16px;">Annuler</button>
            <button id="profilLipidiqueSubmit" class="btn muted" style="padding:10px 32px;font-size:16px;">Enregistrer</button> 
            <button id="profilLipidiqueVerify" class="btn muted" style="padding:10px 32px;font-size:16px;">Vérifier</button>
        </div>
    </div>
</div>

<!-- Modal pour formulaires d'examens BILIRUBINE COMPLETES -->
<div class="modal" id="bilirubiModal" aria-hidden="true" style="z-index:101000;">
    <div class="modal-dialog" id="bilirubiDialog" style="width:96%;max-width:1200px;padding:36px;">
        <h3 id="bilirubiTitle" style="font-size:28px;margin-bottom:3px;font-weight:600;">Bilirubine Complètes - Saisir Résultat</h3>
        
        <div class="modal-body" id="bilirubiBody" style="padding:30px;font-size:17px;">
            <!-- Patient summary sera inséré ici -->
            <div id="bilirubiPatientSummary" style="margin-bottom:20px;"></div>
            
            <!-- Formulaire avec trois paramètres en lignes -->
            <div style="display:flex;flex-direction:column;gap:12px;">
                <!-- BILIRUBINE TOTAL -->
                <div data-bilirubi-param="BILIRUBINE TOTAL" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">BILIRUBINE TOTAL</div>
                    <div style="color:#ccc;">:</div>
                    <select class="bilirubi-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    <input type="text" class="bilirubi-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="bilirubi-param-unite">---</span></div>
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="bilirubi-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="bilirubi-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple bilirubi-param-btn" style="padding:8px 12px;font-size:13px;" data-param="BILIRUBINE TOTAL">➕</button>
                </div>

                <!-- BILIRUBINE DIRECT -->
                <div data-bilirubi-param="BILIRUBINE DIRECT" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">BILIRUBINE DIRECT</div>
                    <div style="color:#ccc;">:</div>
                    <select class="bilirubi-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    <input type="text" class="bilirubi-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="bilirubi-param-unite">---</span></div>
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="bilirubi-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="bilirubi-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple bilirubi-param-btn" style="padding:8px 12px;font-size:13px;" data-param="BILIRUBINE DIRECT">➕</button>
                </div>

                <!-- BILIRUBINE INDIRECT -->
                <div data-bilirubi-param="BILIRUBINE INDIRECT" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">BILIRUBINE INDIRECT</div>
                    <div style="color:#ccc;">:</div>
                    <select class="bilirubi-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    <input type="text" class="bilirubi-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="bilirubi-param-unite">---</span></div>
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="bilirubi-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="bilirubi-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple bilirubi-param-btn" style="padding:8px 12px;font-size:13px;" data-param="BILIRUBINE INDIRECT">➕</button>
                </div>
            </div>
            
            <!-- Section Commentaires avec Pièces jointes -->
            <div style="margin-top:20px;">
                <label style="display:block;font-weight:600;margin-bottom:10px;font-size:15px;color:#333;">Commentaires :</label>
                <div style="position:relative;">
                    <textarea id="bilirubiCommentsInput" placeholder="Entrez vos commentaires ici..." style="width:100%;min-height:90px;padding:12px;padding-top:40px;border:2px dashed #999;border-radius:6px;font-size:14px;font-family:Arial,sans-serif;resize:vertical;box-sizing:border-box;background:#f9f9f9;color:#666;"></textarea>
                    <button id="bilirubiAttachmentBtn" class="btn small purple" style="position:absolute;top:8px;left:8px;padding:6px 10px;font-size:12px;white-space:nowrap;height:auto;">📎</button>
                </div>
                
                <!-- Input file caché -->
                <input type="file" id="bilirubiAttachmentInput" multiple style="display:none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt">
                
                <!-- Liste des fichiers attachés -->
                <div id="bilirubiAttachmentList" style="margin-top:12px;">
                    <!-- Les fichiers sélectionnés apparaîtront ici -->
                </div>
            </div>
        </div>
        
        <div class="modal-actions" style="display:flex;justify-content:flex-end;gap:18px;padding:24px;border-top:1px solid var(--border);background:transparent;">
            <button id="bilirubiCancel" class="btn muted" style="padding:10px 32px;font-size:16px;">Annuler</button>
            <button id="bilirubiSubmit" class="btn muted" style="padding:10px 32px;font-size:16px;">Enregistrer</button> 
            <button id="bilirubiVerify" class="btn muted" style="padding:10px 32px;font-size:16px;">Vérifier</button>
        </div>
    </div>
</div>

<!-- Modal générique pour formulaires d'examens SEROLOGIE -->
<div class="modal" id="serologyFormModal" aria-hidden="true" style="z-index:101000;">
    <div class="modal-dialog" id="serologyFormDialog" style="width:96%;max-width:1200px;padding:36px;">
        <h3 id="serologyFormTitle" style="font-size:28px;margin-bottom:3px;font-weight:600;">Saisir Résultat</h3>
        
        <div class="modal-body" id="serologyFormBody" style="padding:30px;font-size:17px;">
            <!-- Patient summary sera inséré ici -->
            <div id="serologyFormPatientSummary" style="margin-bottom:20px;"></div>
            
            <!-- Formulaire horizontal sur une seule ligne -->
            <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                <!-- Nom examen -->
                <div style="font-weight:600;min-width:120px;font-size:15px;">
                    <span id="serologyParamName">---</span>
                </div>
                
                <!-- Séparateur -->
                <div style="color:#ccc;">:</div>
                
                <!-- RESULTAT Dropdown -->
                <div style="font-weight:600;font-size:12px;color:#666;margin-left:20px;min-width:70px;">RESULTAT:</div>
                <select id="serologyResultSelect" data-other-field="serology-resultat-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                    <option value="">---</option>
                    <option value="Négatif">Négatif</option>
                    <option value="Positif">Positif</option>
                    <option value="Autres">Autres</option>
                </select>
                <input type="text" id="serology-resultat-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                
                <!-- VALEURS input -->
                <div style="font-weight:600;font-size:12px;color:#666;margin-left:15px;min-width:70px;">VALEURS:</div>
                <input type="text" id="serologyResultInput" 
                    style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;"
                    placeholder="Titre/Valeur" required>
                
                <!-- Checkbox Not Required -->
                <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                    <input type="checkbox" id="serologyNotRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                    <span style="color:#333;font-size:14px;line-height:1;display:inline-block;transform:translateY(-1px);">Not Required ?</span>
                </label>
                
                <!-- Bouton ajouter -->
                <button class="btn small purple" style="padding:8px 12px;font-size:13px;">➕</button>
            </div>
            
            <!-- Info specimen et unite (optionnel, peut être caché) -->
            <div style="background:#f0f0f0;padding:12px;border-radius:4px;margin-top:15px;font-size:14px;color:#666;display:none;">
                <div><strong>Specimen:</strong> <span id="serologySpecimenText">---</span></div>
                <div><strong>Unité (info):</strong> <span id="serologyUniteInfo">---</span></div>
            </div>
            
            <!-- Section Commentaires avec Pièces jointes -->
            <div style="margin-top:20px;">
                <label style="display:block;font-weight:600;margin-bottom:10px;font-size:15px;color:#333;">Commentaires :</label>
                <div style="position:relative;">
                    <textarea id="serologyCommentsInput" placeholder="Entrez vos commentaires ici..." style="width:100%;min-height:90px;padding:12px;padding-top:40px;border:2px dashed #999;border-radius:6px;font-size:14px;font-family:Arial,sans-serif;resize:vertical;box-sizing:border-box;background:#f9f9f9;color:#666;"></textarea>
                    <button id="serologyAttachmentBtn" class="btn small purple" style="position:absolute;top:8px;left:8px;padding:6px 10px;font-size:12px;white-space:nowrap;height:auto;">📎</button>
                </div>
                
                <!-- Input file caché -->
                <input type="file" id="serologyAttachmentInput" multiple style="display:none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt">
                
                <!-- Liste des fichiers attachés -->
                <div id="serologyAttachmentList" style="margin-top:12px;">
                    <!-- Les fichiers sélectionnés apparaîtront ici -->
                </div>
            </div>
        </div>
        
        <div class="modal-actions" style="display:flex;justify-content:flex-end;gap:18px;padding:24px;border-top:1px solid var(--border);background:transparent;">
            <button id="serologyFormCancel" class="btn muted" style="padding:10px 32px;font-size:16px;">Annuler</button>
            <button id="serologyFormSubmit" class="btn muted" style="padding:10px 32px;font-size:16px;">Enregistrer</button> 
            <button id="serologyFormVerify" class="btn muted" style="padding:10px 32px;font-size:16px;">Vérifier</button>
        </div>
    </div>
</div>

<!-- Modal spécifique pour SALMONELLA TYPHI IgG & IgM -->
<div class="modal" id="salmonellaModal" aria-hidden="true" style="z-index:101000;">
    <div class="modal-dialog" id="salmonellaDialog" style="width:96%;max-width:1200px;padding:36px;">
        <h3 id="salmonellaTitle" style="font-size:28px;margin-bottom:3px;font-weight:600;">Saisir Résultat</h3>
        
        <div class="modal-body" id="salmonellaBody" style="padding:30px;font-size:17px;">
            <!-- Patient summary sera inséré ici -->
            <div id="salmonellaPatientSummary" style="margin-bottom:20px;"></div>
            
            <!-- Formulaire avec deux paramètres en lignes -->
            <div style="display:flex;flex-direction:column;gap:12px;">
                <!-- IgG SALMONELLA TYPHI -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">IgG SALMONELLA TYPHI</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- RESULTAT Dropdown -->
                    <div style="font-weight:600;font-size:12px;color:#666;margin-left:20px;min-width:70px;">RESULTAT:</div>
                    <select class="salmonella-param-result" data-other-field="salmonella-igg-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                        <option value="">---</option>
                        <option value="Négatif">Négatif</option>
                        <option value="Positif">Positif</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="salmonella-igg-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    
                    <!-- VALEURS input -->
                    <div style="font-weight:600;font-size:12px;color:#666;margin-left:15px;min-width:70px;">VALEURS:</div>
                    <input type="text" class="salmonella-param-valeur" placeholder="Titre/Valeur"
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="salmonella-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple salmonella-param-btn" style="padding:8px 12px;font-size:13px;" data-param="IgG SALMONELLA TYPHI">➕</button>
                </div>

                <!-- IgM SALMONELLA TYPHI -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">IgM SALMONELLA TYPHI</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- RESULTAT Dropdown -->
                    <div style="font-weight:600;font-size:12px;color:#666;margin-left:20px;min-width:70px;">RESULTAT:</div>
                    <select class="salmonella-param-result" data-other-field="salmonella-igm-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                        <option value="">---</option>
                        <option value="Négatif">Négatif</option>
                        <option value="Positif">Positif</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="salmonella-igm-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    
                    <!-- VALEURS input -->
                    <div style="font-weight:600;font-size:12px;color:#666;margin-left:15px;min-width:70px;">VALEURS:</div>
                    <input type="text" class="salmonella-param-valeur" placeholder="Titre/Valeur"
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="salmonella-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple salmonella-param-btn" style="padding:8px 12px;font-size:13px;" data-param="IgM SALMONELLA TYPHI">➕</button>
                </div>
            </div>

            <!-- Section Commentaires avec Pièces jointes -->
            <div style="margin-top:20px;">
                <label style="display:block;font-weight:600;margin-bottom:10px;font-size:15px;color:#333;">Commentaires :</label>
                <div style="position:relative;">
                    <textarea id="salmonellaCommentsInput" placeholder="Entrez vos commentaires ici..." style="width:100%;min-height:90px;padding:12px;padding-top:40px;border:2px dashed #999;border-radius:6px;font-size:14px;font-family:Arial,sans-serif;resize:vertical;box-sizing:border-box;background:#f9f9f9;color:#666;"></textarea>
                    <button id="salmonellaAttachmentBtn" class="btn small purple" style="position:absolute;top:8px;left:8px;padding:6px 10px;font-size:12px;white-space:nowrap;height:auto;">📎</button>
                </div>
                
                <!-- Input file caché -->
                <input type="file" id="salmonellaAttachmentInput" multiple style="display:none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt">
                
                <!-- Liste des fichiers attachés -->
                <div id="salmonellaAttachmentList" style="margin-top:12px;">
                    <!-- Les fichiers sélectionnés apparaîtront ici -->
                </div>
            </div>
        </div>
        
        <div class="modal-actions" style="display:flex;justify-content:flex-end;gap:18px;padding:24px;border-top:1px solid var(--border);background:transparent;">
            <button id="salmonellaCancel" class="btn muted" style="padding:10px 32px;font-size:16px;">Annuler</button>
            <button id="salmonellaSubmit" class="btn muted" style="padding:10px 32px;font-size:16px;">Enregistrer</button> 
            <button id="salmonellaVerify" class="btn muted" style="padding:10px 32px;font-size:16px;">Vérifier</button>
        </div>
    </div>
</div>

<!-- Modal spécifique pour WIDAL TEST -->
<div class="modal" id="widalModal" aria-hidden="true" style="z-index:101000;">
    <div class="modal-dialog" id="widalDialog" style="width:96%;max-width:1200px;padding:36px;">
        <h3 id="widalTitle" style="font-size:28px;margin-bottom:3px;font-weight:600;">Saisir Résultat</h3>
        
        <div class="modal-body" id="widalBody" style="padding:30px;font-size:17px;">
            <!-- Patient summary sera inséré ici -->
            <div id="widalPatientSummary" style="margin-bottom:20px;"></div>
            
            <!-- Formulaire avec quatre paramètres en lignes -->
            <div style="display:flex;flex-direction:column;gap:12px;">
                <!-- S TYPHI Ag O -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">S TYPHI Ag « O »</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- RESULTAT Dropdown -->
                    <div style="font-weight:600;font-size:12px;color:#666;margin-left:20px;min-width:70px;">RESULTAT:</div>
                    <select class="widal-param-result" data-other-field="widal-o-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                        <option value="">---</option>
                        <option value="Négatif">Négatif</option>
                        <option value="Positif">Positif</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="widal-o-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    
                    <!-- VALEURS input -->
                    <div style="font-weight:600;font-size:12px;color:#666;margin-left:15px;min-width:70px;">VALEURS:</div>
                    <input type="text" class="widal-param-valeur" placeholder="Titre/Valeur"
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="widal-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple widal-param-btn" style="padding:8px 12px;font-size:13px;" data-param="S TYPHI Ag O">➕</button>
                </div>

                <!-- S TYPHI Ag H -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">S TYPHI Ag « H »</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- RESULTAT Dropdown -->
                    <div style="font-weight:600;font-size:12px;color:#666;margin-left:20px;min-width:70px;">RESULTAT:</div>
                    <select class="widal-param-result" data-other-field="widal-h-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                        <option value="">---</option>
                        <option value="Négatif">Négatif</option>
                        <option value="Positif">Positif</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="widal-h-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    
                    <!-- VALEURS input -->
                    <div style="font-weight:600;font-size:12px;color:#666;margin-left:15px;min-width:70px;">VALEURS:</div>
                    <input type="text" class="widal-param-valeur" placeholder="Titre/Valeur"
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="widal-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple widal-param-btn" style="padding:8px 12px;font-size:13px;" data-param="S TYPHI Ag H">➕</button>
                </div>

                <!-- S PARATYPHI Ag BH -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">S PARATYPHI Ag « BH »</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- RESULTAT Dropdown -->
                    <div style="font-weight:600;font-size:12px;color:#666;margin-left:20px;min-width:70px;">RESULTAT:</div>
                    <select class="widal-param-result" data-other-field="widal-bh-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                        <option value="">---</option>
                        <option value="Négatif">Négatif</option>
                        <option value="Positif">Positif</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="widal-bh-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    
                    <!-- VALEURS input -->
                    <div style="font-weight:600;font-size:12px;color:#666;margin-left:15px;min-width:70px;">VALEURS:</div>
                    <input type="text" class="widal-param-valeur" placeholder="Titre/Valeur"
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="widal-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple widal-param-btn" style="padding:8px 12px;font-size:13px;" data-param="S PARATYPHI Ag BH">➕</button>
                </div>

                <!-- S PARATYPHI Ag AH -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">S PARATYPHI Ag « AH »</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- RESULTAT Dropdown -->
                    <div style="font-weight:600;font-size:12px;color:#666;margin-left:20px;min-width:70px;">RESULTAT:</div>
                    <select class="widal-param-result" data-other-field="widal-ah-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                        <option value="">---</option>
                        <option value="Négatif">Négatif</option>
                        <option value="Positif">Positif</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="widal-ah-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    
                    <!-- VALEURS input -->
                    <div style="font-weight:600;font-size:12px;color:#666;margin-left:15px;min-width:70px;">VALEURS:</div>
                    <input type="text" class="widal-param-valeur" placeholder="Titre/Valeur"
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="widal-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple widal-param-btn" style="padding:8px 12px;font-size:13px;" data-param="S PARATYPHI Ag AH">➕</button>
                </div>
            </div>

            <!-- Section Commentaires avec Pièces jointes -->
            <div style="margin-top:20px;">
                <label style="display:block;font-weight:600;margin-bottom:10px;font-size:15px;color:#333;">Commentaires :</label>
                <div style="position:relative;">
                    <textarea id="widalCommentsInput" placeholder="Entrez vos commentaires ici..." style="width:100%;min-height:90px;padding:12px;padding-top:40px;border:2px dashed #999;border-radius:6px;font-size:14px;font-family:Arial,sans-serif;resize:vertical;box-sizing:border-box;background:#f9f9f9;color:#666;"></textarea>
                    <button id="widalAttachmentBtn" class="btn small purple" style="position:absolute;top:8px;left:8px;padding:6px 10px;font-size:12px;white-space:nowrap;height:auto;">📎</button>
                </div>
                
                <!-- Input file caché -->
                <input type="file" id="widalAttachmentInput" multiple style="display:none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt">
                
                <!-- Liste des fichiers attachés -->
                <div id="widalAttachmentList" style="margin-top:12px;">
                    <!-- Les fichiers sélectionnés apparaîtront ici -->
                </div>
            </div>
        </div>
        
        <div class="modal-actions" style="display:flex;justify-content:flex-end;gap:18px;padding:24px;border-top:1px solid var(--border);background:transparent;">
            <button id="widalCancel" class="btn muted" style="padding:10px 32px;font-size:16px;">Annuler</button>
            <button id="widalSubmit" class="btn muted" style="padding:10px 32px;font-size:16px;">Enregistrer</button> 
            <button id="widalVerify" class="btn muted" style="padding:10px 32px;font-size:16px;">Vérifier</button>
        </div>
    </div>
</div>

<!-- Modal pour SEDIMENT URINAIRE -->
<div class="modal" id="sedimentUrinaireModal" aria-hidden="true" style="z-index:101000;">
    <div class="modal-dialog" id="sedimentUrinaireDialog" style="width:96%;max-width:1200px;padding:36px;">
        <h3 id="sedimentUrinaireTitle" style="font-size:28px;margin-bottom:3px;font-weight:600;">Saisir Résultat</h3>
        
        <div class="modal-body" id="sedimentUrinaireBody" style="padding:30px;font-size:17px;">
            <!-- Patient summary sera inséré ici -->
            <div id="sedimentUrinairePatientSummary" style="margin-bottom:20px;"></div>
            
            <!-- Formulaire avec plusieurs paramètres en lignes -->
            <div style="display:flex;flex-direction:column;gap:12px;">
                <!-- COULEUR -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">COULEUR</div>
                    <div style="color:#ccc;">:</div>
                    <select class="sediment-param-result" data-other-field="sediment-couleur-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="Incolore">Incolore</option>
                        <option value="Jaune clair">Jaune clair</option>
                        <option value="Jaune">Jaune</option>
                        <option value="Jaune foncé">Jaune foncé</option>
                        <option value="Ambre">Ambre</option>
                        <option value="Rougeâtre">Rougeâtre</option>
                        <option value="Rose">Rose</option>
                        <option value="Brun">Brun</option>
                        <option value="Noir">Noir</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="sediment-couleur-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    <div style="min-width:15px;color:#555;font-size:14px;" class="sediment-param-unite">---</div>
                    <div style="flex:1;min-width:20px;color:#555;font-size:14px;" class="sediment-param-range">---</div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="sediment-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple sediment-param-btn" style="padding:8px 12px;font-size:13px;" data-param="COULEUR">➕</button>
                </div>

                <!-- APPARANCE -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">APPARANCE</div>
                    <div style="color:#ccc;">:</div>
                    <select class="sediment-param-result" data-other-field="sediment-apparance-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="Claire">Claire</option>
                        <option value="Légèrement trouble">Légèrement trouble</option>
                        <option value="Trouble">Trouble</option>
                        <option value="Très trouble">Très trouble</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="sediment-apparance-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    <div style="min-width:15px;color:#555;font-size:14px;" class="sediment-param-unite">---</div>
                    <div style="flex:1;min-width:20px;color:#555;font-size:14px;" class="sediment-param-range">---</div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="sediment-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple sediment-param-btn" style="padding:8px 12px;font-size:13px;" data-param="APPARENCES">➕</button>
                </div>

                <!-- LEUCOCYTES -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">LEUCOCYTES</div>
                    <div style="color:#ccc;">:</div>
                    <select class="sediment-param-result" data-other-field="sediment-leucocytes-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                       <option value="0-1">0-1</option>
                        <option value="1-2">1-2</option>
                        <option value="2-3">2-3</option>
                        <option value="3-5">3-5</option>
                        <option value="5-7">5-7</option>
                        <option value="8-10">8-10</option>
                        <option value="10-15">10-15</option>
                        <option value="15-20">15-20</option>
                        <option value="20-30">20-30</option>
                        <option value="Nombreux (30-50)">Nombreux (30-50)</option>
                        <option value="Très nombreux(50-100) ">Très nombreux(50-100) </option>
                        <option value="Très nombreux (˃100)">Très nombreux (˃100)</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="sediment-leucocytes-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    <div style="min-width:15px;color:#555;font-size:14px;" class="sediment-param-unite">---</div>
                    <div style="flex:1;min-width:20px;color:#555;font-size:14px;" class="sediment-param-range">---</div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="sediment-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple sediment-param-btn" style="padding:8px 12px;font-size:13px;" data-param="LEUCOCYTES">➕</button>
                </div>

                <!-- CELLULE -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">CELLULE EPITHELIALE </div>
                    <div style="color:#ccc;">:</div>
                    <select class="sediment-param-result" data-other-field="sediment-cellule-epitheliale-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                         <option value="0-1">0-1</option>
                        <option value="1-2">1-2</option>
                        <option value="2-3">2-3</option>
                        <option value="3-5">3-5</option>
                        <option value="5-7">5-7</option>
                        <option value="8-10">8-10</option>
                        <option value="10-15">10-15</option>
                        <option value="15-20">15-20</option>
                        <option value="20-30">20-30</option>
                        <option value="Nombreux (30-50)">Nombreux (30-50)</option>
                        <option value="Très nombreux(50-100) ">Très nombreux(50-100) </option>
                        <option value="Très nombreux (˃100)">Très nombreux (˃100)</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="sediment-cellule-epitheliale-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    <div style="min-width:15px;color:#555;font-size:14px;" class="sediment-param-unite">---</div>
                    <div style="flex:1;min-width:20px;color:#555;font-size:14px;" class="sediment-param-range">---</div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="sediment-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple sediment-param-btn" style="padding:8px 12px;font-size:13px;" data-param="CELLULE EPITHELIALE">➕</button>
                </div>

                <!-- GLOBULE -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">GLOBULE ROUGE </div>
                    <div style="color:#ccc;">:</div>
                    <select class="sediment-param-result" data-other-field="sediment-globule-rouge-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                         <option value="0-1">0-1</option>
                        <option value="1-2">1-2</option>
                        <option value="2-3">2-3</option>
                        <option value="3-5">3-5</option>
                        <option value="5-7">5-7</option>
                        <option value="8-10">8-10</option>
                        <option value="10-15">10-15</option>
                        <option value="15-20">15-20</option>
                        <option value="20-30">20-30</option>
                        <option value="Nombreux (30-50)">Nombreux (30-50)</option>
                        <option value="Très nombreux(50-100) ">Très nombreux(50-100) </option>
                        <option value="Très nombreux (˃100)">Très nombreux (˃100)</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="sediment-globule-rouge-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    <div style="min-width:15px;color:#555;font-size:14px;" class="sediment-param-unite">---</div>
                    <div style="flex:1;min-width:20px;color:#555;font-size:14px;" class="sediment-param-range">---</div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="sediment-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple sediment-param-btn" style="padding:8px 12px;font-size:13px;" data-param="GLOBULE ROUGE">➕</button>
                </div>

                <!-- LEVURES -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">LEVURES</div>
                    <div style="color:#ccc;">:</div>
                    <select class="sediment-param-result" data-other-field="sediment-levures-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="Absent">Absent</option>
                        <option value="Présent">Présent</option>
                        <option value="+">+</option>
                        <option value="++">++</option>
                        <option value="+++">+++</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="sediment-levures-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    <div style="min-width:15px;color:#555;font-size:14px;" class="sediment-param-unite">---</div>
                    <div style="flex:1;min-width:20px;color:#555;font-size:14px;" class="sediment-param-range">---</div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="sediment-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple sediment-param-btn" style="padding:8px 12px;font-size:13px;" data-param="LEVURES">➕</button>
                </div>

                <!-- CRISTAUX -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">CRISTAUX</div>
                    <div style="color:#ccc;">:</div>
                    <select class="sediment-param-result" data-other-field="sediment-cristaux-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                       <option value="Absent">Absent</option>
                        <option value="Present">Present</option>
                        <option value="+">+</option>
                        <option value="++">++</option>
                        <option value="+++">+++</option>
                        <option value="++++">++++</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="sediment-cristaux-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    <div style="min-width:15px;color:#555;font-size:14px;" class="sediment-param-unite">---</div>
                    <div style="flex:1;min-width:20px;color:#555;font-size:14px;" class="sediment-param-range">---</div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="sediment-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple sediment-param-btn" style="padding:8px 12px;font-size:13px;" data-param="CRISTAUX">➕</button>
                </div>

                <!-- CILINDRE -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">CILINDRE</div>
                    <div style="color:#ccc;">:</div>
                    <select class="sediment-param-result" data-other-field="sediment-cilindre-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="Absent">Absent</option>
                        <option value="Hyalin">Hyalin</option>
                        <option value="Granuleux">Granuleux</option>
                        <option value="Hématoïde">Hématoïde</option>
                        <option value="Circoïde">Circoïde</option>
                        <option value="Ciré">Ciré</option>
                        <option value="Leucocytaire">Leucocytaire</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="sediment-cilindre-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    <div style="min-width:15px;color:#555;font-size:14px;" class="sediment-param-unite">---</div>
                    <div style="flex:1;min-width:20px;color:#555;font-size:14px;" class="sediment-param-range">---</div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="sediment-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple sediment-param-btn" style="padding:8px 12px;font-size:13px;" data-param="CILINDRE">➕</button>
                </div>

                <!-- BACTERIES -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">BACTERIES</div>
                    <div style="color:#ccc;">:</div>
                    <select class="sediment-param-result" data-other-field="sediment-bacteries-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                         <option value="Négatif">Négatif</option>
                        <option value="Peu">Peu</option>
                        <option value="Modéré">Modéré</option>
                        <option value="Nombreux">Nombreux</option>
                        <option value="+">+</option>
                        <option value="++">++</option>
                        <option value="+++">+++</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="sediment-bacteries-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    <div style="min-width:15px;color:#555;font-size:14px;" class="sediment-param-unite">---</div>
                    <div style="flex:1;min-width:20px;color:#555;font-size:14px;" class="sediment-param-range">---</div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="sediment-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple sediment-param-btn" style="padding:8px 12px;font-size:13px;" data-param="BACTERIES">➕</button>
                </div>

                <!-- AUTRES -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">AUTRES</div>
                    <div style="color:#ccc;">:</div>
                    <select class="sediment-param-result" data-other-field="sediment-autres-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="Absent">Absent</option>
                       <option value="À préciser">À préciser</option>
                    </select>
                    <input type="text" id="sediment-autres-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    <div style="min-width:15px;color:#555;font-size:14px;" class="sediment-param-unite">---</div>
                    <div style="flex:1;min-width:20px;color:#555;font-size:14px;" class="sediment-param-range">---</div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="sediment-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple sediment-param-btn" style="padding:8px 12px;font-size:13px;" data-param="AUTRES">➕</button>
                </div>
            </div>

            <!-- Section Commentaires avec Pièces jointes -->
            <div style="margin-top:20px;">
                <label style="display:block;font-weight:600;margin-bottom:10px;font-size:15px;color:#333;">Commentaires :</label>
                <div style="position:relative;">
                    <textarea id="sedimentUrinaireCommentsInput" placeholder="Entrez vos commentaires ici..." style="width:100%;min-height:90px;padding:12px;padding-top:40px;border:2px dashed #999;border-radius:6px;font-size:14px;font-family:Arial,sans-serif;resize:vertical;box-sizing:border-box;background:#f9f9f9;color:#666;"></textarea>
                    <button id="sedimentUrinaireAttachmentBtn" class="btn small purple" style="position:absolute;top:8px;left:8px;padding:6px 10px;font-size:12px;white-space:nowrap;height:auto;">📎</button>
                </div>
                
                <!-- Input file caché -->
                <input type="file" id="sedimentUrinaireAttachmentInput" multiple style="display:none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt">
                
                <!-- Liste des fichiers attachés -->
                <div id="sedimentUrinaireAttachmentList" style="margin-top:12px;">
                    <!-- Les fichiers sélectionnés apparaîtront ici -->
                </div>
            </div>
        </div>
        
        <div class="modal-actions" style="display:flex;justify-content:flex-end;gap:18px;padding:24px;border-top:1px solid var(--border);background:transparent;">
            <button id="sedimentUrinaireCancel" class="btn muted" style="padding:10px 32px;font-size:16px;">Annuler</button>
            <button id="sedimentUrinaireSubmit" class="btn muted" style="padding:10px 32px;font-size:16px;">Enregistrer</button> 
            <button id="sedimentUrinaireVerify" class="btn muted" style="padding:10px 32px;font-size:16px;">Vérifier</button>
        </div>
    </div>
</div>

<!-- Message de succès (optionnel, peut réutiliser successModal) -->
<div class="modal" id="examSuccessModal" aria-hidden="true" style="z-index:101000;">
    <div class="modal-dialog success-dialog" id="examSuccessDialog">
        <div class="check" aria-hidden="true">✓</div>
        <h3 id="examSuccessTitle">Succès</h3>
        <p id="examSuccessMessage">Résultat enregistré avec succès.</p>
        <div style="margin-top:8px"><button id="examSuccessOk" class="btn success">OK</button></div>
    </div>
</div>

<!-- Modal générique de confirmation -->
<div class="modal" id="confirmationModal" aria-hidden="true" style="z-index:101000;">
    <div class="modal-dialog confirmation-dialog" style="min-width:380px;text-align:center;padding:36px;">
        <div style="font-size:48px;margin-bottom:16px;color:#2c3e50;">⚠️</div>
        <h3 id="confirmationTitle" style="font-size:22px;margin-bottom:12px;font-weight:600;color:#2c3e50;">Confirmer l'action</h3>
        <p id="confirmationMessage" style="font-size:16px;color:#666;margin-bottom:24px;line-height:1.5;">Êtes-vous sûr de vouloir continuer ?</p>
        <div style="display:flex;justify-content:center;gap:12px;margin-top:24px;">
            <button id="confirmationCancel" class="btn muted">Annuler</button>
            <button id="confirmationOk" class="btn muted">Confirmer</button>
        </div>
    </div>
</div>

<!-- Modal pour URINES ROUTINES -->
<div class="modal" id="urinesRoutinesModal" aria-hidden="true" style="z-index:101000;">
    <div class="modal-dialog" id="urinesRoutinesDialog" style="width:96%;max-width:1200px;padding:36px;">
        <h3 id="urinesRoutinesTitle" style="font-size:28px;margin-bottom:3px;font-weight:600;">Saisir Résultat</h3>
        
        <div class="modal-body" id="urinesRoutinesBody" style="padding:30px;font-size:17px;">
            <!-- Patient summary sera inséré ici -->
            <div id="urinesRoutinesPatientSummary" style="margin-bottom:20px;"></div>
            
            <!-- Formulaire avec plusieurs paramètres en lignes -->
            <div style="display:flex;flex-direction:column;gap:12px;">
                <!-- COULEUR -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">COULEUR</div>
                    <div style="color:#ccc;">:</div>
                    <select class="urines-param-result" data-other-field="urines-couleur-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="Incolore">Incolore</option>
                        <option value="Jaune clair">Jaune </option>
                        <option value="Jaune">Jaune pale</option>
                        <option value="Jaune foncé">Jaune foncé</option>
                        <option value="Ambre">Ambre</option>
                        <option value="Orange">Orange</option>
                        <option value="Rouge pale">Rouge pale</option>
                        <option value="Rouge foncé">Rouge foncé</option>
                        <option value="Rose">Rose</option>
                        <option value="Brun">Brun</option>
                        <option value="Blanchâtre">Blanchâtre</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="urines-couleur-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    <div style="min-width:15px;color:#555;font-size:14px;" class="urines-param-unite">---</div>
                    <div style="flex:1;min-width:20px;color:#555;font-size:14px;" class="urines-param-range">---</div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="urines-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple urines-param-btn" style="padding:8px 12px;font-size:13px;" data-param="COULEUR">➕</button>
                </div>

                <!-- APPARANCE -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">APPARANCE</div>
                    <div style="color:#ccc;">:</div>
                    <select class="urines-param-result" data-other-field="urines-apparance-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="Claire">Claire</option>
                        <option value="Légèrement trouble">Légèrement trouble</option>
                        <option value="Trouble">Trouble</option>
                        <option value="Très trouble">Très trouble</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="urines-apparance-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    <div style="min-width:15px;color:#555;font-size:14px;" class="urines-param-unite">---</div>
                    <div style="flex:1;min-width:20px;color:#555;font-size:14px;" class="urines-param-range">---</div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="urines-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple urines-param-btn" style="padding:8px 12px;font-size:13px;" data-param="APPARENCES">➕</button>
                </div>

                <!-- PH -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">PH</div>
                    <div style="color:#ccc;">:</div>
                    <select class="urines-param-result" data-other-field="urines-ph-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="4.5">4.5</option>
                        <option value="5.0">5.0</option>
                        <option value="5.5">5.5</option>
                        <option value="6.0">6.0</option>
                        <option value="6.5">6.5</option>
                        <option value="7.0">7.0</option>
                        <option value="7.5">7.5</option>
                        <option value="8.0">8.0</option>
                        <option value="8.5">8.5</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="urines-ph-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    <div style="min-width:15px;color:#555;font-size:14px;" class="urines-param-unite">---</div>
                    <div style="flex:1;min-width:20px;color:#555;font-size:14px;" class="urines-param-range">---</div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="urines-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple urines-param-btn" style="padding:8px 12px;font-size:13px;" data-param="PH">➕</button>
                </div>

                <!-- GRAVITE SPECIFIQUE -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">GRAVITE SPECIFIQUE</div>
                    <div style="color:#ccc;">:</div>
                    <select class="urines-param-result" data-other-field="urines-gravite-specifique-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="1.005">1.005</option>
                        <option value="1.010">1.010</option>
                        <option value="1.015">1.015</option>
                        <option value="1.020">1.020</option>
                        <option value="1.025">1.025</option>
                        <option value="1.030">1.030</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="urines-gravite-specifique-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    <div style="min-width:15px;color:#555;font-size:14px;" class="urines-param-unite">---</div>
                    <div style="flex:1;min-width:20px;color:#555;font-size:14px;" class="urines-param-range">---</div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="urines-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple urines-param-btn" style="padding:8px 12px;font-size:13px;" data-param="GRAVITE SPECIFIQUE">➕</button>
                </div>

                <!-- GLUCOSURIE -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">GLUCOSURIE</div>
                    <div style="color:#ccc;">:</div>
                    <select class="urines-param-result" data-other-field="urines-glucosurie-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="Négatif">Négatif</option>
                        <option value="Traces">Traces</option>
                        <option value="+">+</option>
                        <option value="++">++</option>
                        <option value="+++">+++</option>
                        <option value="++++">++++</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="urines-glucosurie-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    <div style="min-width:15px;color:#555;font-size:14px;" class="urines-param-unite">---</div>
                    <div style="flex:1;min-width:20px;color:#555;font-size:14px;" class="urines-param-range">---</div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="urines-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple urines-param-btn" style="padding:8px 12px;font-size:13px;" data-param="GLUCOSURIE">➕</button>
                </div>

                <!-- PROTEINURIE -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">PROTEINURIE</div>
                    <div style="color:#ccc;">:</div>
                    <select class="urines-param-result" data-other-field="urines-proteinurie-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="Négatif">Négatif</option>
                        <option value="Traces">Traces</option>
                        <option value="+">+</option>
                        <option value="++">++</option>
                        <option value="+++">+++</option>
                        <option value="++++">++++</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="urines-proteinurie-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    <div style="min-width:15px;color:#555;font-size:14px;" class="urines-param-unite">---</div>
                    <div style="flex:1;min-width:20px;color:#555;font-size:14px;" class="urines-param-range">---</div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="urines-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple urines-param-btn" style="padding:8px 12px;font-size:13px;" data-param="PROTEINURIE">➕</button>
                </div>

                <!-- NITRATE -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">NITRATE</div>
                    <div style="color:#ccc;">:</div>
                    <select class="urines-param-result" data-other-field="urines-nitrate-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="Négatif">Négatif</option>
                        <option value="Positif">Positif</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="urines-nitrate-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    <div style="min-width:15px;color:#555;font-size:14px;" class="urines-param-unite">---</div>
                    <div style="flex:1;min-width:20px;color:#555;font-size:14px;" class="urines-param-range">---</div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="urines-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple urines-param-btn" style="padding:8px 12px;font-size:13px;" data-param="NITRATE">➕</button>
                </div>

                <!-- KETONE -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">KETONE</div>
                    <div style="color:#ccc;">:</div>
                    <select class="urines-param-result" data-other-field="urines-ketone-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="Négatif">Négatif</option>
                        <option value="Traces">Traces</option>
                        <option value="+">+</option>
                        <option value="++">++</option>
                        <option value="+++">+++</option>
                        <option value="++++">++++</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="urines-ketone-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    <div style="min-width:15px;color:#555;font-size:14px;" class="urines-param-unite">---</div>
                    <div style="flex:1;min-width:20px;color:#555;font-size:14px;" class="urines-param-range">---</div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="urines-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple urines-param-btn" style="padding:8px 12px;font-size:13px;" data-param="KETONE">➕</button>
                </div>

                <!-- BILIRUBINE -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">BILIRUBINE</div>
                    <div style="color:#ccc;">:</div>
                    <select class="urines-param-result" data-other-field="urines-bilirubine-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                         <option value="Négatif">Négatif</option>
                        <option value="Traces">Traces</option>
                        <option value="+">+</option>
                        <option value="++">++</option>
                        <option value="+++">+++</option>
                        <option value="++++">++++</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="urines-bilirubine-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    <div style="min-width:15px;color:#555;font-size:14px;" class="urines-param-unite">---</div>
                    <div style="flex:1;min-width:20px;color:#555;font-size:14px;" class="urines-param-range">---</div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="urines-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple urines-param-btn" style="padding:8px 12px;font-size:13px;" data-param="BILIRUBINE">➕</button>
                </div>

                <!-- UROBILIRINE -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">UROBILIRINE</div>
                    <div style="color:#ccc;">:</div>
                    <select class="urines-param-result" data-other-field="urines-urobilirine-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                         <option value="Négatif">Négatif</option>
                        <option value="Traces">Traces</option>
                        <option value="+">+</option>
                        <option value="++">++</option>
                        <option value="+++">+++</option>
                        <option value="++++">++++</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="urines-urobilirine-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    <div style="min-width:15px;color:#555;font-size:14px;" class="urines-param-unite">---</div>
                    <div style="flex:1;min-width:20px;color:#555;font-size:14px;" class="urines-param-range">---</div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="urines-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple urines-param-btn" style="padding:8px 12px;font-size:13px;" data-param="UROBILIRINE">➕</button>
                </div>

                <!-- LEUCOCYTES -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">LEUCOCYTES</div>
                    <div style="color:#ccc;">:</div>
                    <select class="urines-param-result" data-other-field="urines-leucocytes-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="0-1">0-1</option>
                        <option value="1-2">1-2</option>
                        <option value="2-3">2-3</option>
                        <option value="3-5">3-5</option>
                        <option value="5-7">5-7</option>
                        <option value="8-10">8-10</option>
                        <option value="10-15">10-15</option>
                        <option value="15-20">15-20</option>
                        <option value="20-30">20-30</option>
                        <option value="Nombreux (30-50)">Nombreux (30-50)</option>
                        <option value="Très nombreux(50-100) ">Très nombreux(50-100) </option>
                        <option value="Très nombreux (˃100)">Très nombreux (˃100)</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="urines-leucocytes-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    <div style="min-width:15px;color:#555;font-size:14px;" class="urines-param-unite">---</div>
                    <div style="flex:1;min-width:20px;color:#555;font-size:14px;" class="urines-param-range">---</div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="urines-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple urines-param-btn" style="padding:8px 12px;font-size:13px;" data-param="LEUCOCYTES">➕</button>
                </div>

                <!-- CELLULE EPITHELIALE -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">CELLULE EPITHELIALE</div>
                    <div style="color:#ccc;">:</div>
                    <select class="urines-param-result" data-other-field="urines-cellule-epitheliale-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                       <option value="0-1">0-1</option>
                        <option value="1-2">1-2</option>
                        <option value="2-3">2-3</option>
                        <option value="3-5">3-5</option>
                        <option value="5-7">5-7</option>
                        <option value="8-10">8-10</option>
                        <option value="10-15">10-15</option>
                        <option value="15-20">15-20</option>
                        <option value="20-30">20-30</option>
                        <option value="Nombreux (30-50)">Nombreux (30-50)</option>
                        <option value="Très nombreux(50-100) ">Très nombreux(50-100) </option>
                        <option value="Très nombreux (˃100)">Très nombreux (˃100)</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="urines-cellule-epitheliale-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    <div style="min-width:15px;color:#555;font-size:14px;" class="urines-param-unite">---</div>
                    <div style="flex:1;min-width:20px;color:#555;font-size:14px;" class="urines-param-range">---</div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="urines-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple urines-param-btn" style="padding:8px 12px;font-size:13px;" data-param="CELLULE EPITHELIALE">➕</button>
                </div>

                <!-- GLOBULE ROUGE -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">GLOBULE ROUGE</div>
                    <div style="color:#ccc;">:</div>
                    <select class="urines-param-result" data-other-field="urines-globule-rouge-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                       <option value="0-1">0-1</option>
                        <option value="1-2">1-2</option>
                        <option value="2-3">2-3</option>
                        <option value="3-5">3-5</option>
                        <option value="5-7">5-7</option>
                        <option value="8-10">8-10</option>
                        <option value="10-15">10-15</option>
                        <option value="15-20">15-20</option>
                        <option value="20-30">20-30</option>
                        <option value="Nombreux (30-50)">Nombreux (30-50)</option>
                        <option value="Très nombreux(50-100) ">Très nombreux(50-100) </option>
                        <option value="Très nombreux (˃100)">Très nombreux (˃100)</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="urines-globule-rouge-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    <div style="min-width:15px;color:#555;font-size:14px;" class="urines-param-unite">---</div>
                    <div style="flex:1;min-width:20px;color:#555;font-size:14px;" class="urines-param-range">---</div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="urines-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple urines-param-btn" style="padding:8px 12px;font-size:13px;" data-param="GLOBULE ROUGE">➕</button>
                </div>

                <!-- LEVURES -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">LEVURES</div>
                    <div style="color:#ccc;">:</div>
                    <select class="urines-param-result" data-other-field="urines-levures-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="Absent">Absent</option>
                        <option value="Présent">Présent</option>
                        <option value="+">+</option>
                        <option value="++">++</option>
                        <option value="+++">+++</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="urines-levures-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    <div style="min-width:15px;color:#555;font-size:14px;" class="urines-param-unite">---</div>
                    <div style="flex:1;min-width:20px;color:#555;font-size:14px;" class="urines-param-range">---</div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="urines-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple urines-param-btn" style="padding:8px 12px;font-size:13px;" data-param="LEVURES">➕</button>
                </div>

                <!-- CRISTAUX -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">CRISTAUX</div>
                    <div style="color:#ccc;">:</div>
                    <select class="urines-param-result" data-other-field="urines-cristaux-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="Absent">Absent</option>
                        <option value="Present">Present</option>
                        <option value="+">+</option>
                        <option value="++">++</option>
                        <option value="+++">+++</option>
                        <option value="++++">++++</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="urines-cristaux-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    <div style="min-width:15px;color:#555;font-size:14px;" class="urines-param-unite">---</div>
                    <div style="flex:1;min-width:20px;color:#555;font-size:14px;" class="urines-param-range">---</div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="urines-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple urines-param-btn" style="padding:8px 12px;font-size:13px;" data-param="CRISTAUX">➕</button>
                </div>

                <!-- CILINDRE -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">CILINDRE</div>
                    <div style="color:#ccc;">:</div>
                    <select class="urines-param-result" data-other-field="urines-cilindre-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="Absent">Absent</option>
                        <option value="Hyalin">Hyalin</option>
                        <option value="Granuleux">Granuleux</option>
                        <option value="Hématoïde">Hématoïde</option>
                        <option value="Circoïde">Circoïde</option>
                        <option value="Ciré">Ciré</option>
                        <option value="Leucocytaire">Leucocytaire</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="urines-cilindre-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    <div style="min-width:15px;color:#555;font-size:14px;" class="urines-param-unite">---</div>
                    <div style="flex:1;min-width:20px;color:#555;font-size:14px;" class="urines-param-range">---</div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="urines-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple urines-param-btn" style="padding:8px 12px;font-size:13px;" data-param="CILINDRE">➕</button>
                </div>

                <!-- BACTERIES -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">BACTERIES</div>
                    <div style="color:#ccc;">:</div>
                    <select class="urines-param-result" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="Négatif">Négatif</option>
                        <option value="Peu">Peu</option>
                        <option value="Modéré">Modéré</option>
                        <option value="Nombreux">Nombreux</option>
                        <option value="+">+</option>
                        <option value="++">++</option>
                        <option value="+++">+++</option>
                    </select>
                    <div style="min-width:15px;color:#555;font-size:14px;" class="urines-param-unite">---</div>
                    <div style="flex:1;min-width:20px;color:#555;font-size:14px;" class="urines-param-range">---</div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="urines-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple urines-param-btn" style="padding:8px 12px;font-size:13px;" data-param="BACTERIES">➕</button>
                </div>

                <!-- AUTRES -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">AUTRES</div>
                    <div style="color:#ccc;">:</div>
                    <select class="urines-param-result" data-other-field="urines-autres-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="Absent">Absent</option>
                        <option value="Présent">Présent</option>
                        <option value="Autres">À préciser</option>
                    </select>
                    <input type="text" id="urines-autres-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    <div style="min-width:15px;color:#555;font-size:14px;" class="urines-param-unite">---</div>
                    <div style="flex:1;min-width:20px;color:#555;font-size:14px;" class="urines-param-range">---</div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="urines-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple urines-param-btn" style="padding:8px 12px;font-size:13px;" data-param="AUTRES">➕</button>
                </div>
            </div>

            <!-- Section Commentaires avec Pièces jointes -->
            <div style="margin-top:20px;">
                <label style="display:block;font-weight:600;margin-bottom:10px;font-size:15px;color:#333;">Commentaires :</label>
                <div style="position:relative;">
                    <textarea id="urinesRoutinesCommentsInput" placeholder="Entrez vos commentaires ici..." style="width:100%;min-height:90px;padding:12px;padding-top:40px;border:2px dashed #999;border-radius:6px;font-size:14px;font-family:Arial,sans-serif;resize:vertical;box-sizing:border-box;background:#f9f9f9;color:#666;"></textarea>
                    <button id="urinesRoutinesAttachmentBtn" class="btn small purple" style="position:absolute;top:8px;left:8px;padding:6px 10px;font-size:12px;white-space:nowrap;height:auto;">📎</button>
                </div>
                
                <!-- Input file caché -->
                <input type="file" id="urinesRoutinesAttachmentInput" multiple style="display:none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt">
                
                <!-- Liste des fichiers attachés -->
                <div id="urinesRoutinesAttachmentList" style="margin-top:12px;">
                    <!-- Les fichiers sélectionnés apparaîtront ici -->
                </div>
            </div>
        </div>
        
        <div class="modal-actions" style="display:flex;justify-content:flex-end;gap:18px;padding:24px;border-top:1px solid var(--border);background:transparent;">
            <button id="urinesRoutinesCancel" class="btn muted" style="padding:10px 32px;font-size:16px;">Annuler</button>
            <button id="urinesRoutinesSubmit" class="btn muted" style="padding:10px 32px;font-size:16px;">Enregistrer</button> 
            <button id="urinesRoutinesVerify" class="btn muted" style="padding:10px 32px;font-size:16px;">Vérifier</button>
        </div>
    </div>
</div>

<!-- Modal pour SELLES ROUTINE -->
<div class="modal" id="sellesRoutineModal" aria-hidden="true" style="z-index:101000;">
    <div class="modal-dialog" id="sellesRoutineDialog" style="width:96%;max-width:1200px;padding:36px;">
        <h3 id="sellesRoutineTitle" style="font-size:28px;margin-bottom:3px;font-weight:600;">Saisir Résultat</h3>
        
        <div class="modal-body" id="sellesRoutineBody" style="padding:30px;font-size:17px;">
            <!-- Patient summary sera inséré ici -->
            <div id="sellesRoutinePatientSummary" style="margin-bottom:20px;"></div>
            
            <!-- Formulaire avec plusieurs paramètres en lignes -->
            <div style="display:flex;flex-direction:column;gap:12px;">
                <!-- COULEUR -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">COULEUR</div>
                    <div style="color:#ccc;">:</div>
                    <select class="selles-param-result" data-other-field="selles-couleur-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="Jaune">Jaune</option>
                        <option value="Brun">Brun</option>
                        <option value="Noir">Noir</option>
                        <option value="Gris">Gris</option>
                        <option value="Pâle">Pâle</option>
                        <option value="Verdâtre">Verdâtre</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="selles-couleur-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    <div style="min-width:15px;color:#555;font-size:14px;" class="selles-param-unite">---</div>
                    <div style="flex:1;min-width:20px;color:#555;font-size:14px;" class="selles-param-range">---</div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="selles-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple selles-param-btn" style="padding:8px 12px;font-size:13px;" data-param="COULEUR">➕</button>
                </div>

                <!-- ODEUR -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">ODEUR</div>
                    <div style="color:#ccc;">:</div>
                    <select class="selles-param-result" data-other-field="selles-odeur-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="Fecal">Fecal</option>
                        <option value="Nauséabond">Nauséabond</option>
                        <option value="Putride">Putride</option>
                        <option value="Acide">Acide</option>
                        <option value="Soufrée">Soufrée</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="selles-odeur-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    <div style="min-width:15px;color:#555;font-size:14px;" class="selles-param-unite">---</div>
                    <div style="flex:1;min-width:20px;color:#555;font-size:14px;" class="selles-param-range">---</div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="selles-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple selles-param-btn" style="padding:8px 12px;font-size:13px;" data-param="ODEUR">➕</button>
                </div>

                <!-- MUCUS -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">MUCUS</div>
                    <div style="color:#ccc;">:</div>
                    <select class="selles-param-result" data-other-field="selles-mucus-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="Absent">Absent</option>
                        <option value="Présence">Présence</option>
                        <option value="Peu">Peu</option>
                        <option value="Modéré">Modéré</option>
                        <option value="Nombreux">Nombreux</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="selles-mucus-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    <div style="min-width:15px;color:#555;font-size:14px;" class="selles-param-unite">---</div>
                    <div style="flex:1;min-width:20px;color:#555;font-size:14px;" class="selles-param-range">---</div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="selles-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple selles-param-btn" style="padding:8px 12px;font-size:13px;" data-param="MUCUS">➕</button>
                </div>

                <!-- CONSISTANCE -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">CONSISTANCE</div>
                    <div style="color:#ccc;">:</div>
                    <select class="selles-param-result" data-other-field="selles-consistance-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="Dures">Dures</option>
                        <option value="Solide Morceau dechiquetés">Solide Morceau dechiquetés</option>
                        <option value="Pâteuse">Pâteuse</option>
                        <option value="Molle">Molle</option>
                        <option value="Liquide">Liquide</option>
                        <option value="Diarrhéique">Diarrhéique</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="selles-consistance-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    <div style="min-width:15px;color:#555;font-size:14px;" class="selles-param-unite">---</div>
                    <div style="flex:1;min-width:20px;color:#555;font-size:14px;" class="selles-param-range">---</div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="selles-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple selles-param-btn" style="padding:8px 12px;font-size:13px;" data-param="CONSISTANCE">➕</button>
                </div>

                <!-- SANG VISIBLE -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">SANG VISIBLE</div>
                    <div style="color:#ccc;">:</div>
                    <select class="selles-param-result" data-other-field="selles-sang-visible-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="Absent">Absent</option>
                        <option value="Présent">Présent</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="selles-sang-visible-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    <div style="min-width:15px;color:#555;font-size:14px;" class="selles-param-unite">---</div>
                    <div style="flex:1;min-width:20px;color:#555;font-size:14px;" class="selles-param-range">---</div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="selles-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple selles-param-btn" style="padding:8px 12px;font-size:13px;" data-param="SANG VISIBLE">➕</button>
                </div>

                <!-- LEUCOCYTES -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">LEUCOCYTES</div>
                    <div style="color:#ccc;">:</div>
                    <select class="selles-param-result" data-other-field="selles-leucocytes-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="0-1">0-1</option>
                        <option value="1-2">1-2</option>
                        <option value="3-5">3-5</option>
                        <option value="5-10">5-10</option>
                        <option value="10-20">10-20</option>
                        <option value="20-30">20-30</option>
                        <option value="Nombreux (30-50)">Nombreux (30-50)</option>
                        <option value="Très nombreux(50-100) ">Très nombreux(50-100) </option>
                        <option value="Très nombreux (˃100)">Très nombreux (˃100)</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="selles-leucocytes-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    <div style="min-width:15px;color:#555;font-size:14px;" class="selles-param-unite">---</div>
                    <div style="flex:1;min-width:20px;color:#555;font-size:14px;" class="selles-param-range">---</div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="selles-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple selles-param-btn" style="padding:8px 12px;font-size:13px;" data-param="LEUCOCYTES">➕</button>
                </div>

                <!-- GLOBULE ROUGE -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">GLOBULE ROUGE</div>
                    <div style="color:#ccc;">:</div>
                    <select class="selles-param-result" data-other-field="selles-globule-rouge-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="0-1">0-1</option>
                        <option value="1-2">1-2</option>
                        <option value="3-5">3-5</option>
                        <option value="5-10">5-10</option>
                        <option value="10-20">10-20</option>
                        <option value="20-30">20-30</option>
                        <option value="Nombreux (30-50)">Nombreux (30-50)</option>
                        <option value="Très nombreux(50-100) ">Très nombreux(50-100) </option>
                        <option value="Très nombreux (˃100)">Très nombreux (˃100)</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="selles-globule-rouge-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    <div style="min-width:15px;color:#555;font-size:14px;" class="selles-param-unite">---</div>
                    <div style="flex:1;min-width:20px;color:#555;font-size:14px;" class="selles-param-range">---</div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="selles-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple selles-param-btn" style="padding:8px 12px;font-size:13px;" data-param="GLOBULE ROUGE">➕</button>
                </div>

                <!-- MACROPHAGES -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">MACROPHAGES</div>
                    <div style="color:#ccc;">:</div>
                    <select class="selles-param-result" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="Absent">Absent</option>
                        <option value="Présent">Présent</option>
                       
                    </select>
                    <div style="min-width:15px;color:#555;font-size:14px;" class="selles-param-unite">---</div>
                    <div style="flex:1;min-width:20px;color:#555;font-size:14px;" class="selles-param-range">---</div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="selles-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple selles-param-btn" style="padding:8px 12px;font-size:13px;" data-param="MACROPHAGES">➕</button>
                </div>

                <!-- KYSTE -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">KYSTE</div>
                    <div style="color:#ccc;">:</div>
                    <select class="selles-param-result" data-other-field="selles-kyste-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="Antemoeba coli">Antemoeba coli</option>
                        <option value="Antemoeba histolytica">Antemoeba histolytica</option>
                        <option value="Giardia lambia">Giardia lambia</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="selles-kyste-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    <div style="min-width:15px;color:#555;font-size:14px;" class="selles-param-unite">---</div>
                    <div style="flex:1;min-width:20px;color:#555;font-size:14px;" class="selles-param-range">---</div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="selles-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple selles-param-btn" style="padding:8px 12px;font-size:13px;" data-param="KYSTE">➕</button>
                </div>

                <!-- LARVE -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">LARVE</div>
                    <div style="color:#ccc;">:</div>
                    <select class="selles-param-result" data-other-field="selles-larve-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="Absent">Absent</option>
                        <option value="Anguillule">Anguillule</option>
                        <option value="Ankylostome">Ankylostome</option>
                        <option value="Strongyloides">Strongyloides</option>
                        <option value="Autres">Autres</option>                        
                    </select>
                    <input type="text" id="selles-larve-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    <div style="min-width:15px;color:#555;font-size:14px;" class="selles-param-unite">---</div>
                    <div style="flex:1;min-width:20px;color:#555;font-size:14px;" class="selles-param-range">---</div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="selles-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple selles-param-btn" style="padding:8px 12px;font-size:13px;" data-param="LARVE">➕</button>
                </div>

                <!-- LEVURE -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">LEVURE</div>
                    <div style="color:#ccc;">:</div>
                    <select class="selles-param-result" data-other-field="selles-levure-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="Absent">Absent</option>
                        <option value="Bourgeonnante">Bourgeonnante</option>
                        <option value="Bourgeonnantes +">Bourgeonnantes +</option>
                        <option value="Bourgeonnantes ++">Bourgeonnantes ++</option>
                        <option value="Bourgeonnantes +++">Bourgeonnantes +++</option>
                        <option value="Non bourgeonnante ++++">Non bourgeonnante ++++</option>
                        <option value="Non bourgeonnante">Non bourgeonnante</option>
                        <option value="Non bourgeonnante +">Non bourgeonnante +</option>
                        <option value="Non bourgeonnante ++">Non bourgeonnante ++</option>
                        <option value="Non bourgeonnante +++">Non bourgeonnante +++</option> 
                        <option value="Non bourgeonnante ++++">Non bourgeonnante ++++</option> 
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="selles-levure-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    <div style="min-width:15px;color:#555;font-size:14px;" class="selles-param-unite">---</div>
                    <div style="flex:1;min-width:20px;color:#555;font-size:14px;" class="selles-param-range">---</div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="selles-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple selles-param-btn" style="padding:8px 12px;font-size:13px;" data-param="LEVURE">➕</button>
                </div>

                <!-- CRISTAUX DE CHARCOT-LEYDEN -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">CRISTAUX CHARCOT-LEYDEN</div>
                    <div style="color:#ccc;">:</div>
                    <select class="selles-param-result" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="Absent">Absent</option>
                        <option value="Présent">Présent</option>
                        
                    </select>
                    <div style="min-width:15px;color:#555;font-size:14px;" class="selles-param-unite">---</div>
                    <div style="flex:1;min-width:20px;color:#555;font-size:14px;" class="selles-param-range">---</div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="selles-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple selles-param-btn" style="padding:8px 12px;font-size:13px;" data-param="CRISTAUX CHARCOT-LEYDEN">➕</button>
                </div>

                <!-- TROPHOZOITES -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">TROPHOZOITES</div>
                    <div style="color:#ccc;">:</div>
                    <select class="selles-param-result" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="Absent">Absent</option>
                        <option value="Présent">Présent</option>
                    </select>
                    <div style="min-width:15px;color:#555;font-size:14px;" class="selles-param-unite">---</div>
                    <div style="flex:1;min-width:20px;color:#555;font-size:14px;" class="selles-param-range">---</div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="selles-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple selles-param-btn" style="padding:8px 12px;font-size:13px;" data-param="TROPHOZOITES">➕</button>
                </div>

                <!-- OVULES -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">OVULES</div>
                    <div style="color:#ccc;">:</div>
                    <select class="selles-param-result" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="Absent">Absent</option>
                        <option value="Présent">Présent</option>
                    </select>
                    <div style="min-width:15px;color:#555;font-size:14px;" class="selles-param-unite">---</div>
                    <div style="flex:1;min-width:20px;color:#555;font-size:14px;" class="selles-param-range">---</div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="selles-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple selles-param-btn" style="padding:8px 12px;font-size:13px;" data-param="OVULES">➕</button>
                </div>

                <!-- PARASITE ADULTE -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">PARASITE ADULTE</div>
                    <div style="color:#ccc;">:</div>
                    <select class="selles-param-result" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="Absent">Absent</option>
                        <option value="Présent">Présent</option>
                    </select>
                    <div style="min-width:15px;color:#555;font-size:14px;" class="selles-param-unite">---</div>
                    <div style="flex:1;min-width:20px;color:#555;font-size:14px;" class="selles-param-range">---</div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="selles-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple selles-param-btn" style="padding:8px 12px;font-size:13px;" data-param="PARASITE ADULTE">➕</button>
                </div>

                <!-- AUTRES -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">AUTRES</div>
                    <div style="color:#ccc;">:</div>
                    <select class="selles-param-result" data-other-field="selles-autres-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="Non observé">Non observé</option>
                        <option value="À préciser">À préciser</option>
                    </select>
                    <input type="text" id="selles-autres-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    <div style="min-width:15px;color:#555;font-size:14px;" class="selles-param-unite">---</div>
                    <div style="flex:1;min-width:20px;color:#555;font-size:14px;" class="selles-param-range">---</div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="selles-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple selles-param-btn" style="padding:8px 12px;font-size:13px;" data-param="AUTRES">➕</button>
                </div>
            </div>

            <!-- Section Commentaires avec Pièces jointes -->
            <div style="margin-top:20px;">
                <label style="display:block;font-weight:600;margin-bottom:10px;font-size:15px;color:#333;">Commentaires :</label>
                <div style="position:relative;">
                    <textarea id="sellesRoutineCommentsInput" placeholder="Entrez vos commentaires ici..." style="width:100%;min-height:90px;padding:12px;padding-top:40px;border:2px dashed #999;border-radius:6px;font-size:14px;font-family:Arial,sans-serif;resize:vertical;box-sizing:border-box;background:#f9f9f9;color:#666;"></textarea>
                    <button id="sellesRoutineAttachmentBtn" class="btn small purple" style="position:absolute;top:8px;left:8px;padding:6px 10px;font-size:12px;white-space:nowrap;height:auto;">📎</button>
                </div>
                
                <!-- Input file caché -->
                <input type="file" id="sellesRoutineAttachmentInput" multiple style="display:none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt">
                
                <!-- Liste des fichiers attachés -->
                <div id="sellesRoutineAttachmentList" style="margin-top:12px;">
                    <!-- Les fichiers sélectionnés apparaîtront ici -->
                </div>
            </div>
        </div>
        
        <div class="modal-actions" style="display:flex;justify-content:flex-end;gap:18px;padding:24px;border-top:1px solid var(--border);background:transparent;">
            <button id="sellesRoutineCancel" class="btn muted" style="padding:10px 32px;font-size:16px;">Annuler</button>
            <button id="sellesRoutineSubmit" class="btn muted" style="padding:10px 32px;font-size:16px;">Enregistrer</button> 
            <button id="sellesRoutineVerify" class="btn muted" style="padding:10px 32px;font-size:16px;">Vérifier</button>
        </div>
    </div>
</div>

<!-- Modal pour RIVALTA (TRANSSUDAT ET EXSUDAT) -->
<div class="modal" id="rivaltaModal" aria-hidden="true" style="z-index:101000;">
    <div class="modal-dialog" id="rivaltaDialog" style="width:96%;max-width:1200px;padding:36px;">
        <h3 id="rivaltaTitle" style="font-size:28px;margin-bottom:3px;font-weight:600;">Saisir Résultat RIVALTA</h3>
        
        <div class="modal-body" id="rivaltaBody" style="padding:30px;font-size:17px;">
            <!-- Patient summary sera inséré ici -->
            <div id="rivaltaPatientSummary" style="margin-bottom:20px;"></div>
            
            <!-- Formulaire avec plusieurs paramètres en lignes -->
            <div style="display:flex;flex-direction:column;gap:12px;">
                <!-- SPECIMEN -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">SPECIMEN</div>
                    <div style="color:#ccc;">:</div>
                    <input type="text" class="rivalta-param-result" placeholder="Entrer le specimen" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:150px;height:28px;line-height:1;margin-left:20px;" required>
                    <div style="min-width:15px;color:#555;font-size:14px;" class="rivalta-param-unite">---</div>
                    <div style="flex:1;min-width:20px;color:#555;font-size:14px;" class="rivalta-param-range">---</div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="rivalta-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple rivalta-param-btn" style="padding:8px 12px;font-size:13px;" data-param="SPECIMEN">➕</button>
                </div>

                <!-- ASPECTS -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">ASPECTS</div>
                    <div style="color:#ccc;">:</div>
                    <select class="rivalta-param-result rivalta-aspects-select" data-other-field="rivalta-aspects-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="Clair">Clair</option>
                        <option value="Trouble">Trouble</option>
                        <option value="Purulent">Purulent</option>
                        <option value="Hémorragique">Hémorragique</option>
                        <option value="Lactescent">Lactescent</option>
                        <option value="Ictérique">Ictérique</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="rivalta-aspects-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;" required>
                    <div style="min-width:15px;color:#555;font-size:14px;" class="rivalta-param-unite">---</div>
                    <div style="flex:1;min-width:20px;color:#555;font-size:14px;" class="rivalta-param-range">---</div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="rivalta-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple rivalta-param-btn" style="padding:8px 12px;font-size:13px;" data-param="ASPECTS">➕</button>
                </div>

                <!-- COULEUR -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">COULEUR</div>
                    <div style="color:#ccc;">:</div>
                    <select class="rivalta-param-result rivalta-couleur-select" data-other-field="rivalta-couleur-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="Jaune citron">Jaune citron</option>
                        <option value="Blanchâtre">Blanchâtre</option>
                        <option value="Jaune">Jaune</option>
                        <option value="Rose sanglante">Rose sanglante</option>
                        <option value="Blanc laiteux">Blanc laiteux</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="rivalta-couleur-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;" required>
                    <div style="min-width:15px;color:#555;font-size:14px;" class="rivalta-param-unite">---</div>
                    <div style="flex:1;min-width:20px;color:#555;font-size:14px;" class="rivalta-param-range">---</div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="rivalta-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple rivalta-param-btn" style="padding:8px 12px;font-size:13px;" data-param="COULEUR">➕</button>
                </div>

                <!-- RESULTAT -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">RESULTAT</div>
                    <div style="color:#ccc;">:</div>
                    <select class="rivalta-param-result rivalta-resultat-select" data-other-field="rivalta-resultat-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="Transsudat">Transsudat</option>
                        <option value="Exsudat">Exsudat</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="rivalta-resultat-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;" required>
                    <div style="min-width:15px;color:#555;font-size:14px;" class="rivalta-param-unite">---</div>
                    <div style="flex:1;min-width:20px;color:#555;font-size:14px;" class="rivalta-param-range">---</div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="rivalta-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple rivalta-param-btn" style="padding:8px 12px;font-size:13px;" data-param="RESULTAT">➕</button>
                </div>
            </div>

            <!-- Section Commentaires avec Pièces jointes -->
            <div style="margin-top:20px;">
                <label style="display:block;font-weight:600;margin-bottom:10px;font-size:15px;color:#333;">Commentaires :</label>
                <div style="position:relative;">
                    <textarea id="rivaltaCommentsInput" placeholder="Entrez vos commentaires ici..." style="width:100%;min-height:90px;padding:12px;padding-top:40px;border:2px dashed #999;border-radius:6px;font-size:14px;font-family:Arial,sans-serif;resize:vertical;box-sizing:border-box;background:#f9f9f9;color:#666;"></textarea>
                    <button id="rivaltaAttachmentBtn" class="btn small purple" style="position:absolute;top:8px;left:8px;padding:6px 10px;font-size:12px;white-space:nowrap;height:auto;">📎</button>
                </div>
                
                <!-- Input file caché -->
                <input type="file" id="rivaltaAttachmentInput" multiple style="display:none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt">
                
                <!-- Liste des fichiers attachés -->
                <div id="rivaltaAttachmentList" style="margin-top:12px;">
                    <!-- Les fichiers sélectionnés apparaîtront ici -->
                </div>
            </div>
        </div>
        
        <div class="modal-actions" style="display:flex;justify-content:flex-end;gap:18px;padding:24px;border-top:1px solid var(--border);background:transparent;">
            <button id="rivaltaCancel" class="btn muted" style="padding:10px 32px;font-size:16px;">Annuler</button>
            <button id="rivaltaSubmit" class="btn muted" style="padding:10px 32px;font-size:16px;">Enregistrer</button> 
            <button id="rivaltaVerify" class="btn muted" style="padding:10px 32px;font-size:16px;">Vérifier</button>
        </div>
    </div>
</div>

<!-- Modal pour PROTEINE DE BINCES-JONES -->
<div class="modal" id="proteineBincesJonesModal" aria-hidden="true" style="z-index:101000;">
    <div class="modal-dialog" id="proteineBincesJonesDialog" style="width:96%;max-width:1200px;padding:36px;">
        <h3 id="proteineBincesJonesTitle" style="font-size:28px;margin-bottom:3px;font-weight:600;">Saisir Résultat</h3>
        
        <div class="modal-body" id="proteineBincesJonesBody" style="padding:30px;font-size:17px;">
            <!-- Patient summary sera inséré ici -->
            <div id="proteineBincesJonesPatientSummary" style="margin-bottom:20px;"></div>
            
            <!-- Formulaire avec plusieurs paramètres en lignes -->
            <div style="display:flex;flex-direction:column;gap:12px;">
                <!-- SPECIMEN -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">SPECIMEN</div>
                    <div style="color:#ccc;">:</div>
                    <select class="proteineBincesJones-param-result proteineBincesJones-specimen-select" data-other-field="proteineBincesJones-specimen-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="Plasma">Plasma</option>
                        <option value="Sérum">Sérum</option>
                        <option value="Urine">Urine</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="proteineBincesJones-specimen-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;" required>
                    <div style="min-width:15px;color:#555;font-size:14px;" class="proteineBincesJones-param-unite">---</div>
                    <div style="flex:1;min-width:20px;color:#555;font-size:14px;" class="proteineBincesJones-param-range">---</div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="proteineBincesJones-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple proteineBincesJones-param-btn" style="padding:8px 12px;font-size:13px;" data-param="SPECIMEN">➕</button>
                </div>

                <!-- RESULTAT -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">RESULTAT</div>
                    <div style="color:#ccc;">:</div>
                    <select class="proteineBincesJones-param-result proteineBincesJones-resultat-select" data-other-field="proteineBincesJones-resultat-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="Négatif">Négatif</option>
                        <option value="Positif">Positif</option>
                        <option value="Traces">Traces</option>
                        <option value="+">+</option>
                        <option value="++">++</option>
                        <option value="+++">+++</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="proteineBincesJones-resultat-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;" required>
                    <div style="min-width:15px;color:#555;font-size:14px;" class="proteineBincesJones-param-unite">---</div>
                    <div style="flex:1;min-width:20px;color:#555;font-size:14px;" class="proteineBincesJones-param-range">---</div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="proteineBincesJones-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple proteineBincesJones-param-btn" style="padding:8px 12px;font-size:13px;" data-param="RESULTAT">➕</button>
                </div>
            </div>

            <!-- Section Commentaires avec Pièces jointes -->
            <div style="margin-top:20px;">
                <label style="display:block;font-weight:600;margin-bottom:10px;font-size:15px;color:#333;">Commentaires :</label>
                <div style="position:relative;">
                    <textarea id="proteineBincesJonesCommentsInput" placeholder="Entrez vos commentaires ici..." style="width:100%;min-height:90px;padding:12px;padding-top:40px;border:2px dashed #999;border-radius:6px;font-size:14px;font-family:Arial,sans-serif;resize:vertical;box-sizing:border-box;background:#f9f9f9;color:#666;"></textarea>
                    <button id="proteineBincesJonesAttachmentBtn" class="btn small purple" style="position:absolute;top:8px;left:8px;padding:6px 10px;font-size:12px;white-space:nowrap;height:auto;">📎</button>
                </div>
                
                <!-- Input file caché -->
                <input type="file" id="proteineBincesJonesAttachmentInput" multiple style="display:none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt">
                
                <!-- Liste des fichiers attachés -->
                <div id="proteineBincesJonesAttachmentList" style="margin-top:12px;">
                    <!-- Les fichiers sélectionnés apparaîtront ici -->
                </div>
            </div>
        </div>
        
        <div class="modal-actions" style="display:flex;justify-content:flex-end;gap:18px;padding:24px;border-top:1px solid var(--border);background:transparent;">
            <button id="proteineBincesJonesCancel" class="btn muted" style="padding:10px 32px;font-size:16px;">Annuler</button>
            <button id="proteineBincesJonesSubmit" class="btn muted" style="padding:10px 32px;font-size:16px;">Enregistrer</button> 
            <button id="proteineBincesJonesVerify" class="btn muted" style="padding:10px 32px;font-size:16px;">Vérifier</button>
        </div>
    </div>
</div>

<!-- Modal pour TRYPANOSOMIASE -->
<div class="modal" id="trypanosomiaseModal" aria-hidden="true" style="z-index:101000;">
    <div class="modal-dialog" id="trypanosomiaseDialog" style="width:96%;max-width:1200px;padding:36px;">
        <h3 id="trypanosomiaseTitle" style="font-size:28px;margin-bottom:3px;font-weight:600;">Saisir Résultat TRYPANOSOMIASE</h3>
        
        <div class="modal-body" id="trypanosomiaseBody" style="padding:30px;font-size:17px;">
            <!-- Patient summary sera inséré ici -->
            <div id="trypanosomiasePatientSummary" style="margin-bottom:20px;"></div>
            
            <!-- Formulaire avec plusieurs paramètres en lignes -->
            <div style="display:flex;flex-direction:column;gap:12px;">
                <!-- METHODE -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">METHODE</div>
                    <div style="color:#ccc;">:</div>
                    <select class="trypanosomiase-param-result trypanosomiase-methode-select" data-other-field="trypanosomiase-methode-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="GOUTTE FRAICHE">GOUTTE FRAICHE</option>
                        <option value="BUFFY COAT">BUFFY COAT</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="trypanosomiase-methode-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;" required>
                    <div style="min-width:15px;color:#555;font-size:14px;" class="trypanosomiase-param-unite">---</div>
                    <div style="flex:1;min-width:20px;color:#555;font-size:14px;" class="trypanosomiase-param-range">---</div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="trypanosomiase-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple trypanosomiase-param-btn" style="padding:8px 12px;font-size:13px;" data-param="METHODE">➕</button>
                </div>

                <!-- SPECIMEN -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">SPECIMEN</div>
                    <div style="color:#ccc;">:</div>
                    <select class="trypanosomiase-param-result trypanosomiase-specimen-select" data-other-field="trypanosomiase-specimen-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="Sang">Sang</option>
                        <option value="LCS">LCS</option>
                        <option value="Urine">Urine</option>
                        <option value="liquebiologique">liquebiologique</option>
                        <option value="Autre fluide">Autre fluide</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="trypanosomiase-specimen-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;" required>
                    <div style="min-width:15px;color:#555;font-size:14px;" class="trypanosomiase-param-unite">---</div>
                    <div style="flex:1;min-width:20px;color:#555;font-size:14px;" class="trypanosomiase-param-range">---</div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="trypanosomiase-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple trypanosomiase-param-btn" style="padding:8px 12px;font-size:13px;" data-param="SPECIMEN">➕</button>
                </div>

                <!-- RESULTAT -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">RESULTAT</div>
                    <div style="color:#ccc;">:</div>
                    <select class="trypanosomiase-param-result trypanosomiase-resultat-select" data-other-field="trypanosomiase-resultat-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="Négatif">Négatif</option>
                        <option value="Positif">Positif</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="trypanosomiase-resultat-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;" required>
                    <div style="min-width:15px;color:#555;font-size:14px;" class="trypanosomiase-param-unite">---</div>
                    <div style="flex:1;min-width:20px;color:#555;font-size:14px;" class="trypanosomiase-param-range">---</div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="trypanosomiase-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple trypanosomiase-param-btn" style="padding:8px 12px;font-size:13px;" data-param="RESULTAT">➕</button>
                </div>
            </div>

            <!-- Section Commentaires avec Pièces jointes -->
            <div style="margin-top:20px;">
                <label style="display:block;font-weight:600;margin-bottom:10px;font-size:15px;color:#333;">Commentaires :</label>
                <div style="position:relative;">
                    <textarea id="trypanosomiaseCommentsInput" placeholder="Entrez vos commentaires ici..." style="width:100%;min-height:90px;padding:12px;padding-top:40px;border:2px dashed #999;border-radius:6px;font-size:14px;font-family:Arial,sans-serif;resize:vertical;box-sizing:border-box;background:#f9f9f9;color:#666;"></textarea>
                    <button id="trypanosomiaseAttachmentBtn" class="btn small purple" style="position:absolute;top:8px;left:8px;padding:6px 10px;font-size:12px;white-space:nowrap;height:auto;">📎</button>
                </div>
                
                <!-- Input file caché -->
                <input type="file" id="trypanosomiaseAttachmentInput" multiple style="display:none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt">
                
                <!-- Liste des fichiers attachés -->
                <div id="trypanosomiaseAttachmentList" style="margin-top:12px;">
                    <!-- Les fichiers sélectionnés apparaîtront ici -->
                </div>
            </div>
        </div>
        
        <div class="modal-actions" style="display:flex;justify-content:flex-end;gap:18px;padding:24px;border-top:1px solid var(--border);background:transparent;">
            <button id="trypanosomiaseCancel" class="btn muted" style="padding:10px 32px;font-size:16px;">Annuler</button>
            <button id="trypanosomiaseSubmit" class="btn muted" style="padding:10px 32px;font-size:16px;">Enregistrer</button> 
            <button id="trypanosomiaseVerify" class="btn muted" style="padding:10px 32px;font-size:16px;">Vérifier</button>
        </div>
    </div>
</div>

<!-- Modal pour SANG OCCULTE -->
<div class="modal" id="sangOcculteModal" aria-hidden="true" style="z-index:101000;">
    <div class="modal-dialog" id="sangOcculteDialog" style="width:96%;max-width:1200px;padding:36px;">
        <h3 id="sangOcculteTitle" style="font-size:28px;margin-bottom:3px;font-weight:600;">Saisir Résultat SANG OCCULTE</h3>
        
        <div class="modal-body" id="sangOcculteBody" style="padding:30px;font-size:17px;">
            <!-- Patient summary sera inséré ici -->
            <div id="sangOccultePatientSummary" style="margin-bottom:20px;"></div>
            
            <!-- Formulaire avec plusieurs paramètres en lignes -->
            <div style="display:flex;flex-direction:column;gap:12px;">
                <!-- SPECIMEN -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">SPECIMEN</div>
                    <div style="color:#ccc;">:</div>
                    <select class="sangOcculte-param-result sangOcculte-specimen-select" data-other-field="sangOcculte-specimen-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="Selles">Selles</option>
                        <option value="Vomitus">Vomitus</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="sangOcculte-specimen-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;" required>
                    <div style="min-width:15px;color:#555;font-size:14px;" class="sangOcculte-param-unite">---</div>
                    <div style="flex:1;min-width:20px;color:#555;font-size:14px;" class="sangOcculte-param-range">---</div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="sangOcculte-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple sangOcculte-param-btn" style="padding:8px 12px;font-size:13px;" data-param="SPECIMEN">➕</button>
                </div>

                <!-- CONSISTANCE -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">CONSISTANCE</div>
                    <div style="color:#ccc;">:</div>
                    <select class="sangOcculte-param-result sangOcculte-consistance-select" data-other-field="sangOcculte-consistance-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="Dures">Dures</option>
                        <option value="Solide Morceau dechiquetés">Solide Morceau dechiquetés</option>
                        <option value="Pâteuse">Pâteuse</option>
                        <option value="Molle">Molle</option>
                        <option value="Liquide">Liquide</option>
                        <option value="Diarrhéique">Diarrhéique</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="sangOcculte-consistance-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;" required>
                    <div style="min-width:15px;color:#555;font-size:14px;" class="sangOcculte-param-unite">---</div>
                    <div style="flex:1;min-width:20px;color:#555;font-size:14px;" class="sangOcculte-param-range">---</div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="sangOcculte-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple sangOcculte-param-btn" style="padding:8px 12px;font-size:13px;" data-param="CONSISTANCE">➕</button>
                </div>

                <!-- SANG VISIBLE -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">SANG VISIBLE</div>
                    <div style="color:#ccc;">:</div>
                    <select class="sangOcculte-param-result sangOcculte-sangVisible-select" data-other-field="sangOcculte-sangVisible-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="Absent">Absent</option>
                        <option value="Présent">Présent</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="sangOcculte-sangVisible-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;" required>
                    <div style="min-width:15px;color:#555;font-size:14px;" class="sangOcculte-param-unite">---</div>
                    <div style="flex:1;min-width:20px;color:#555;font-size:14px;" class="sangOcculte-param-range">---</div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="sangOcculte-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple sangOcculte-param-btn" style="padding:8px 12px;font-size:13px;" data-param="SANG VISIBLE">➕</button>
                </div>

                <!-- RESULTAT -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">RESULTAT</div>
                    <div style="color:#ccc;">:</div>
                    <select class="sangOcculte-param-result sangOcculte-resultat-select" data-other-field="sangOcculte-resultat-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="Négatif">Négatif</option>
                        <option value="Traces">Traces</option>
                        <option value="+">+</option>
                        <option value="++">++</option>
                        <option value="+++">+++</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="sangOcculte-resultat-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;" required>
                    <div style="min-width:15px;color:#555;font-size:14px;" class="sangOcculte-param-unite">---</div>
                    <div style="flex:1;min-width:20px;color:#555;font-size:14px;" class="sangOcculte-param-range">---</div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="sangOcculte-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple sangOcculte-param-btn" style="padding:8px 12px;font-size:13px;" data-param="RESULTAT">➕</button>
                </div>
            </div>

            <!-- Section Commentaires avec Pièces jointes -->
            <div style="margin-top:20px;">
                <label style="display:block;font-weight:600;margin-bottom:10px;font-size:15px;color:#333;">Commentaires :</label>
                <div style="position:relative;">
                    <textarea id="sangOcculteCommentsInput" placeholder="Entrez vos commentaires ici..." style="width:100%;min-height:90px;padding:12px;padding-top:40px;border:2px dashed #999;border-radius:6px;font-size:14px;font-family:Arial,sans-serif;resize:vertical;box-sizing:border-box;background:#f9f9f9;color:#666;"></textarea>
                    <button id="sangOcculteAttachmentBtn" class="btn small purple" style="position:absolute;top:8px;left:8px;padding:6px 10px;font-size:12px;white-space:nowrap;height:auto;">📎</button>
                </div>
                
                <!-- Input file caché -->
                <input type="file" id="sangOcculteAttachmentInput" multiple style="display:none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt">
                
                <!-- Liste des fichiers attachés -->
                <div id="sangOcculteAttachmentList" style="margin-top:12px;">
                    <!-- Les fichiers sélectionnés apparaîtront ici -->
                </div>
            </div>
        </div>
        
        <div class="modal-actions" style="display:flex;justify-content:flex-end;gap:18px;padding:24px;border-top:1px solid var(--border);background:transparent;">
            <button id="sangOcculteCancel" class="btn muted" style="padding:10px 32px;font-size:16px;">Annuler</button>
            <button id="sangOcculteSubmit" class="btn muted" style="padding:10px 32px;font-size:16px;">Enregistrer</button> 
            <button id="sangOcculteVerify" class="btn muted" style="padding:10px 32px;font-size:16px;">Vérifier</button>
        </div>
    </div>
</div>

<!-- Modal spécifique pour MALARIA TESTE RAPIDE -->
<div class="modal" id="malariaModal" aria-hidden="true" style="z-index:101000;">
    <div class="modal-dialog" id="malariaDialog" style="width:96%;max-width:1200px;padding:36px;">
        <h3 id="malariaTitle" style="font-size:28px;margin-bottom:3px;font-weight:600;">Saisir Résultat</h3>
        
        <div class="modal-body" id="malariaBody" style="padding:30px;font-size:17px;">
            <!-- Patient summary sera inséré ici -->
            <div id="malariaPatientSummary" style="margin-bottom:20px;"></div>
            
            <!-- Formulaire avec deux paramètres en lignes -->
            <div style="display:flex;flex-direction:column;gap:12px;">
                <!-- FALCIPARUM (Pf) -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">FALCIPARUM (Pf)</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- RESULTAT Dropdown -->
                    <div style="font-weight:600;font-size:12px;color:#666;margin-left:20px;min-width:70px;">RESULTAT:</div>
                    <select class="malaria-param-result" data-other-field="malaria-pf-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                        <option value="">---</option>
                        <option value="Négatif">Négatif</option>
                        <option value="Positif">Positif</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="malaria-pf-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    
                    <!-- VALEURS input -->
                    <div style="font-weight:600;font-size:12px;color:#666;margin-left:15px;min-width:70px;">VALEURS:</div>
                    <input type="text" class="malaria-param-valeur" placeholder="Titre/Valeur"
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="malaria-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple malaria-param-btn" style="padding:8px 12px;font-size:13px;" data-param="FALCIPARUM (Pf)">➕</button>
                </div>

                <!-- MALAIAE ET AUTRES (PAN) -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">MALAIAE ET AUTRES (PAN)</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- RESULTAT Dropdown -->
                    <div style="font-weight:600;font-size:12px;color:#666;margin-left:20px;min-width:70px;">RESULTAT:</div>
                    <select class="malaria-param-result" data-other-field="malaria-pan-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                        <option value="">---</option>
                        <option value="Négatif">Négatif</option>
                        <option value="Positif">Positif</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="malaria-pan-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    
                    <!-- VALEURS input -->
                    <div style="font-weight:600;font-size:12px;color:#666;margin-left:15px;min-width:70px;">VALEURS:</div>
                    <input type="text" class="malaria-param-valeur" placeholder="Titre/Valeur"
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="malaria-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple malaria-param-btn" style="padding:8px 12px;font-size:13px;" data-param="MALAIAE ET AUTRES (PAN)">➕</button>
                </div>
            </div>

            <!-- Section Commentaires avec Pièces jointes -->
            <div style="margin-top:20px;">
                <label style="display:block;font-weight:600;margin-bottom:10px;font-size:15px;color:#333;">Commentaires :</label>
                <div style="position:relative;">
                    <textarea id="malariaCommentsInput" placeholder="Entrez vos commentaires ici..." style="width:100%;min-height:90px;padding:12px;padding-top:40px;border:2px dashed #999;border-radius:6px;font-size:14px;font-family:Arial,sans-serif;resize:vertical;box-sizing:border-box;background:#f9f9f9;color:#666;"></textarea>
                    <button id="malariaAttachmentBtn" class="btn small purple" style="position:absolute;top:8px;left:8px;padding:6px 10px;font-size:12px;white-space:nowrap;height:auto;">📎</button>
                </div>
                
                <!-- Input file caché -->
                <input type="file" id="malariaAttachmentInput" multiple style="display:none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt">
                
                <!-- Liste des fichiers attachés -->
                <div id="malariaAttachmentList" style="margin-top:12px;">
                    <!-- Les fichiers sélectionnés apparaîtront ici -->
                </div>
            </div>
        </div>
        
        <div class="modal-actions" style="display:flex;justify-content:flex-end;gap:18px;padding:24px;border-top:1px solid var(--border);background:transparent;">
            <button id="malariaCancel" class="btn muted" style="padding:10px 32px;font-size:16px;">Annuler</button>
            <button id="malariaSubmit" class="btn muted" style="padding:10px 32px;font-size:16px;">Enregistrer</button> 
            <button id="malariaVerify" class="btn muted" style="padding:10px 32px;font-size:16px;">Vérifier</button>
        </div>
    </div>
</div>

<!-- Modal spécifique pour HISTOPATHOLOGIE -->
<div class="modal" id="histopathologieModal" aria-hidden="true" style="z-index:101000;">
    <div class="modal-dialog" id="histopathologieDialog" style="width:96%;max-width:1200px;padding:36px;">
        <h3 id="histopathologieTitle" style="font-size:28px;margin-bottom:3px;font-weight:600;">Saisir Résultat</h3>
        
        <div class="modal-body" id="histopathologieBody" style="padding:30px;font-size:17px;">
            <!-- Patient summary sera inséré ici -->
            <div id="histopathologiePatientSummary" style="margin-bottom:20px;"></div>
            
            <!-- Formulaire avec quatre paramètres en lignes -->
            <div style="display:flex;flex-direction:column;gap:12px;">
                <!-- SPECIMEN -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">SPECIMEN</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- RESULTAT Dropdown -->
                    <div style="font-weight:600;font-size:12px;color:#666;margin-left:20px;min-width:70px;">DESCRIPTION:</div>
                    <textarea class="histopathologie-param-result" placeholder="Description du spécimen..." 
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:300px;height:40px;line-height:1.4;resize:vertical;"></textarea>
                    
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="histopathologie-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple histopathologie-param-btn" style="padding:8px 12px;font-size:13px;" data-param="SPECIMEN">➕</button>
                </div>

                <!-- EXAMEN MACROSCOPIQUE -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">EXAMEN MACROSCOPIQUE</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- RESULTAT Dropdown -->
                    <div style="font-weight:600;font-size:12px;color:#666;margin-left:20px;min-width:70px;">DESCRIPTION:</div>
                    <textarea class="histopathologie-param-result" placeholder="Description macroscopique..." 
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:300px;height:40px;line-height:1.4;resize:vertical;"></textarea>
                    
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="histopathologie-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple histopathologie-param-btn" style="padding:8px 12px;font-size:13px;" data-param="EXAMEN MACROSCOPIQUE">➕</button>
                </div>

                <!-- EXAMEN MICROSCOPIQUE -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">EXAMEN MICROSCOPIQUE</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- RESULTAT Dropdown -->
                    <div style="font-weight:600;font-size:12px;color:#666;margin-left:20px;min-width:70px;">DESCRIPTION:</div>
                    <textarea class="histopathologie-param-result" placeholder="Description microscopique..." 
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:300px;height:40px;line-height:1.4;resize:vertical;"></textarea>
                    
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="histopathologie-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple histopathologie-param-btn" style="padding:8px 12px;font-size:13px;" data-param="EXAMEN MICROSCOPIQUE">➕</button>
                </div>

                <!-- CONCLUSION -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">CONCLUSION</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- RESULTAT Dropdown -->
                    <div style="font-weight:600;font-size:12px;color:#666;margin-left:20px;min-width:70px;">DESCRIPTION:</div>
                    <textarea class="histopathologie-param-result" placeholder="Conclusion diagnostique..." 
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:300px;height:40px;line-height:1.4;resize:vertical;"></textarea>
                    
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="histopathologie-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple histopathologie-param-btn" style="padding:8px 12px;font-size:13px;" data-param="CONCLUSION">➕</button>
                </div>
            </div>

            <!-- Section Commentaires avec Pièces jointes -->
            <div style="margin-top:20px;">
                <label style="display:block;font-weight:600;margin-bottom:10px;font-size:15px;color:#333;">Commentaires :</label>
                <div style="position:relative;">
                    <textarea id="histopathologieCommentsInput" placeholder="Entrez vos commentaires ici..." style="width:100%;min-height:90px;padding:12px;padding-top:40px;border:2px dashed #999;border-radius:6px;font-size:14px;font-family:Arial,sans-serif;resize:vertical;box-sizing:border-box;background:#f9f9f9;color:#666;"></textarea>
                    <button id="histopathologieAttachmentBtn" class="btn small purple" style="position:absolute;top:8px;left:8px;padding:6px 10px;font-size:12px;white-space:nowrap;height:auto;">📎</button>
                </div>
                
                <!-- Input file caché -->
                <input type="file" id="histopathologieAttachmentInput" multiple style="display:none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt">
                
                <!-- Liste des fichiers attachés -->
                <div id="histopathologieAttachmentList" style="margin-top:12px;">
                    <!-- Les fichiers sélectionnés apparaîtront ici -->
                </div>
            </div>
        </div>
        
        <div class="modal-actions" style="display:flex;justify-content:flex-end;gap:18px;padding:24px;border-top:1px solid var(--border);background:transparent;">
            <button id="histopathologieCancel" class="btn muted" style="padding:10px 32px;font-size:16px;">Annuler</button>
            <button id="histopathologieSubmit" class="btn muted" style="padding:10px 32px;font-size:16px;">Enregistrer</button> 
            <button id="histopathologieVerify" class="btn muted" style="padding:10px 32px;font-size:16px;">Vérifier</button>
        </div>
    </div>
</div>

<!-- Modal spécifique pour CHARGE VIRAL -->
<div class="modal" id="chargeViralModal" aria-hidden="true" style="z-index:101000;">
    <div class="modal-dialog" id="chargeViralDialog" style="width:96%;max-width:1200px;padding:36px;">
        <h3 id="chargeViralTitle" style="font-size:28px;margin-bottom:3px;font-weight:600;">Saisir Résultat</h3>
        
        <div class="modal-body" id="chargeViralBody" style="padding:30px;font-size:17px;">
            <!-- Patient summary sera inséré ici -->
            <div id="chargeViralPatientSummary" style="margin-bottom:20px;"></div>
            
            <!-- Formulaire avec quatre paramètres en lignes -->
            <div style="display:flex;flex-direction:column;gap:12px;">
                <!-- SPECIMEN -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">SPECIMEN</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- RESULTAT Dropdown -->
                    <div style="font-weight:600;font-size:12px;color:#666;margin-left:20px;min-width:70px;">DESCRIPTION:</div>
                    <textarea class="chargeViral-param-result" placeholder="Description du spécimen..." 
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:300px;height:40px;line-height:1.4;resize:vertical;"></textarea>
                    
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="chargeViral-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple chargeViral-param-btn" style="padding:8px 12px;font-size:13px;" data-param="SPECIMEN">➕</button>
                </div>

                <!-- PROCEDURE D'ESSAI -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">PROCEDURE D'ESSAI</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- RESULTAT Dropdown -->
                    <div style="font-weight:600;font-size:12px;color:#666;margin-left:20px;min-width:70px;">DESCRIPTION:</div>
                    <textarea class="chargeViral-param-result" placeholder="Description de la procédure..." 
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:300px;height:40px;line-height:1.4;resize:vertical;"></textarea>
                    
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="chargeViral-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple chargeViral-param-btn" style="padding:8px 12px;font-size:13px;" data-param="PROCEDURE D'ESSAI">➕</button>
                </div>

                <!-- RESULTAT -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">RESULTAT</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- RESULTAT Dropdown -->
                    <div style="font-weight:600;font-size:12px;color:#666;margin-left:20px;min-width:70px;">DESCRIPTION:</div>
                    <textarea class="chargeViral-param-result" placeholder="Description du résultat..." 
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:300px;height:40px;line-height:1.4;resize:vertical;"></textarea>
                    
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="chargeViral-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple chargeViral-param-btn" style="padding:8px 12px;font-size:13px;" data-param="RESULTAT">➕</button>
                </div>

                <!-- INTERPRETATION -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">INTERPRETATION</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- RESULTAT Dropdown -->
                    <div style="font-weight:600;font-size:12px;color:#666;margin-left:20px;min-width:70px;">DESCRIPTION:</div>
                    <textarea class="chargeViral-param-result" placeholder="Description de l'interprétation..." 
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:300px;height:40px;line-height:1.4;resize:vertical;"></textarea>
                    
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="chargeViral-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple chargeViral-param-btn" style="padding:8px 12px;font-size:13px;" data-param="INTERPRETATION">➕</button>
                </div>
            </div>

            <!-- Section Commentaires avec Pièces jointes -->
            <div style="margin-top:20px;">
                <label style="display:block;font-weight:600;margin-bottom:10px;font-size:15px;color:#333;">Commentaires :</label>
                <div style="position:relative;">
                    <textarea id="chargeViralCommentsInput" placeholder="Entrez vos commentaires ici..." style="width:100%;min-height:90px;padding:12px;padding-top:40px;border:2px dashed #999;border-radius:6px;font-size:14px;font-family:Arial,sans-serif;resize:vertical;box-sizing:border-box;background:#f9f9f9;color:#666;"></textarea>
                    <button id="chargeViralAttachmentBtn" class="btn small purple" style="position:absolute;top:8px;left:8px;padding:6px 10px;font-size:12px;white-space:nowrap;height:auto;">📎</button>
                </div>
                
                <!-- Input file caché -->
                <input type="file" id="chargeViralAttachmentInput" multiple style="display:none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt">
                
                <!-- Liste des fichiers attachés -->
                <div id="chargeViralAttachmentList" style="margin-top:12px;">
                    <!-- Les fichiers sélectionnés apparaîtront ici -->
                </div>
            </div>
        </div>
        
        <div class="modal-actions" style="display:flex;justify-content:flex-end;gap:18px;padding:24px;border-top:1px solid var(--border);background:transparent;">
            <button id="chargeViralCancel" class="btn muted" style="padding:10px 32px;font-size:16px;">Annuler</button>
            <button id="chargeViralSubmit" class="btn muted" style="padding:10px 32px;font-size:16px;">Enregistrer</button> 
            <button id="chargeViralVerify" class="btn muted" style="padding:10px 32px;font-size:16px;">Vérifier</button>
        </div>
    </div>
</div>

<!-- Modal spécifique pour FROTTIS DE SANG PERIPHERIQUES -->
<div class="modal" id="frottisBloodModal" aria-hidden="true" style="z-index:101000;">
    <div class="modal-dialog" id="frottisBloodDialog" style="width:96%;max-width:1200px;padding:36px;">
        <h3 id="frottisBloodTitle" style="font-size:28px;margin-bottom:3px;font-weight:600;">Saisir Résultat</h3>
        
        <div class="modal-body" id="frottisBloodBody" style="padding:30px;font-size:17px;">
            <!-- Patient summary sera inséré ici -->
            <div id="frottisBloodPatientSummary" style="margin-bottom:20px;"></div>
            
            <!-- Formulaire avec trois paramètres en lignes -->
            <div style="display:flex;flex-direction:column;gap:12px;">
                <!-- LIGNE LEUCOCYTAIRE -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">LIGNE LEUCOCYTAIRE</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- RESULTAT Dropdown -->
                    <div style="font-weight:600;font-size:12px;color:#666;margin-left:20px;min-width:70px;">DESCRIPTION:</div>
                    <textarea class="frottisBlood-param-result" placeholder="Description de la ligne leucocytaire (globules blancs)..." 
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:300px;height:40px;line-height:1.4;resize:vertical;"></textarea>
                    
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="frottisBlood-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple frottisBlood-param-btn" style="padding:8px 12px;font-size:13px;" data-param="LIGNE LEUCOCYTAIRE (GLOBULES BLANCS)">➕</button>
                </div>

                <!-- LIGNE ERYTHROCYTAIRE -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">LIGNE ERYTHROCYTAIRE</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- RESULTAT Dropdown -->
                    <div style="font-weight:600;font-size:12px;color:#666;margin-left:20px;min-width:70px;">DESCRIPTION:</div>
                    <textarea class="frottisBlood-param-result" placeholder="Description de la ligne érythrocytaire (globules rouges)..." 
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:300px;height:40px;line-height:1.4;resize:vertical;"></textarea>
                    
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="frottisBlood-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple frottisBlood-param-btn" style="padding:8px 12px;font-size:13px;" data-param="LIGNE ERYTHROCYTAIRE (GLOBULES ROUGES)">➕</button>
                </div>

                <!-- LIGNE THROBOCYTAIRE -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">LIGNE THROBOCYTAIRE</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- RESULTAT Dropdown -->
                    <div style="font-weight:600;font-size:12px;color:#666;margin-left:20px;min-width:70px;">DESCRIPTION:</div>
                    <textarea class="frottisBlood-param-result" placeholder="Description de la ligne throbocytaire (plaquettes)..." 
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:300px;height:40px;line-height:1.4;resize:vertical;"></textarea>
                    
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="frottisBlood-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple frottisBlood-param-btn" style="padding:8px 12px;font-size:13px;" data-param="LIGNE THROBOCYTAIRE (PLAQUETTE)">➕</button>
                </div>
            </div>

            <!-- Section Commentaires avec Pièces jointes -->
            <div style="margin-top:20px;">
                <label style="display:block;font-weight:600;margin-bottom:10px;font-size:15px;color:#333;">Commentaires :</label>
                <div style="position:relative;">
                    <textarea id="frottisBloodCommentsInput" placeholder="Entrez vos commentaires ici..." style="width:100%;min-height:90px;padding:12px;padding-top:40px;border:2px dashed #999;border-radius:6px;font-size:14px;font-family:Arial,sans-serif;resize:vertical;box-sizing:border-box;background:#f9f9f9;color:#666;"></textarea>
                    <button id="frottisBloodAttachmentBtn" class="btn small purple" style="position:absolute;top:8px;left:8px;padding:6px 10px;font-size:12px;white-space:nowrap;height:auto;">📎</button>
                </div>
                
                <!-- Input file caché -->
                <input type="file" id="frottisBloodAttachmentInput" multiple style="display:none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt">
                
                <!-- Liste des fichiers attachés -->
                <div id="frottisBloodAttachmentList" style="margin-top:12px;">
                    <!-- Les fichiers sélectionnés apparaîtront ici -->
                </div>
            </div>
        </div>
        
        <div class="modal-actions" style="display:flex;justify-content:flex-end;gap:18px;padding:24px;border-top:1px solid var(--border);background:transparent;">
            <button id="frottisBloodCancel" class="btn muted" style="padding:10px 32px;font-size:16px;">Annuler</button>
            <button id="frottisBloodSubmit" class="btn muted" style="padding:10px 32px;font-size:16px;">Enregistrer</button> 
            <button id="frottisBloodVerify" class="btn muted" style="padding:10px 32px;font-size:16px;">Vérifier</button>
        </div>
    </div>
</div>

<!-- Dropdown pour insérer un commentaire -->
<div id="commentDropdown" style="display:none;position:fixed;z-index:101001;background:#fff;border:1px solid #ddd;border-radius:6px;box-shadow:0 4px 12px rgba(0,0,0,0.15);width:380px;padding:16px;">
    <h3 style="margin:0 0 12px 0;font-size:18px;font-weight:600;color:#333;">Commentaire</h3>
    <textarea id="commentTextarea" placeholder="Entrez votre commentaire..." style="width:100%;min-height:70px;padding:10px;border:1px solid #ccc;border-radius:4px;font-size:14px;font-family:Arial,sans-serif;resize:vertical;box-sizing:border-box;"></textarea>
    <div style="margin-top:12px;display:flex;justify-content:flex-end;">
        <button id="commentSaveBtn" class="btn muted" style="padding:10px 24px;font-size:15px;background:#2c3e50;color:#fff;border:none;border-radius:4px;cursor:pointer;">Enregistrer</button>
    </div>
</div>

<!-- Modal pour Surveillance Prostatique (SP) -->
<div class="modal" id="surveillanceProstatiqueModal" aria-hidden="true" style="z-index:101000;">
    <div class="modal-dialog" id="surveillanceProstatiqueDialog" style="width:96%;max-width:1200px;padding:36px;">
        <h3 id="surveillanceProstatiqueTitle" style="font-size:28px;margin-bottom:3px;font-weight:600;">Surveillance Prostatique (SP) - Saisir Résultat</h3>
        
        <div class="modal-body" id="surveillanceProstatiqueBody" style="padding:30px;font-size:17px;">
            <!-- Patient summary sera inséré ici -->
            <div id="surveillanceProstatiquePatientSummary" style="margin-bottom:20px;"></div>
            
            <!-- Formulaire avec trois paramètres en lignes -->
            <div style="display:flex;flex-direction:column;gap:12px;">
                <!-- PSA TOTAL -->
                <div data-surveillanceProstatique-param="PSA TOTAL" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">PSA TOTAL</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Flag dropdown -->
                    <select class="surveillanceProstatique-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    
                    <!-- Résultat input -->
                    <input type="text" class="surveillanceProstatique-param-valeur" placeholder="Valeur"
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="surveillanceProstatique-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="surveillanceProstatique-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="surveillanceProstatique-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple surveillanceProstatique-param-btn" style="padding:8px 12px;font-size:13px;" data-param="PSA TOTAL">➕</button>
                </div>

                <!-- PSA SPECIFIQUE -->
                <div data-surveillanceProstatique-param="PSA SPECIFIQUE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">PSA SPECIFIQUE</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Flag dropdown -->
                    <select class="surveillanceProstatique-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    
                    <!-- Résultat input -->
                    <input type="text" class="surveillanceProstatique-param-valeur" placeholder="Valeur"
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="surveillanceProstatique-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="surveillanceProstatique-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="surveillanceProstatique-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple surveillanceProstatique-param-btn" style="padding:8px 12px;font-size:13px;" data-param="PSA SPECIFIQUE">➕</button>
                </div>

                <!-- PSA LIBRE -->
                <div data-surveillanceProstatique-param="PSA LIBRE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">PSA LIBRE</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Flag dropdown -->
                    <select class="surveillanceProstatique-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    
                    <!-- Résultat input -->
                    <input type="text" class="surveillanceProstatique-param-valeur" placeholder="Valeur"
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="surveillanceProstatique-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="surveillanceProstatique-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="surveillanceProstatique-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple surveillanceProstatique-param-btn" style="padding:8px 12px;font-size:13px;" data-param="PSA LIBRE">➕</button>
                </div>
            </div>
            
            <!-- Section Commentaires avec Pièces jointes -->
            <div style="margin-top:20px;">
                <label style="display:block;font-weight:600;margin-bottom:10px;font-size:15px;color:#333;">Commentaires :</label>
                <div style="position:relative;">
                    <textarea id="surveillanceProstatiqueCommentsInput" placeholder="Entrez vos commentaires ici..." style="width:100%;min-height:90px;padding:12px;padding-top:40px;border:2px dashed #999;border-radius:6px;font-size:14px;font-family:Arial,sans-serif;resize:vertical;box-sizing:border-box;background:#f9f9f9;color:#666;"></textarea>
                    <button id="surveillanceProstatiqueAttachmentBtn" class="btn small purple" style="position:absolute;top:8px;left:8px;padding:6px 10px;font-size:12px;white-space:nowrap;height:auto;">📎</button>
                </div>
                
                <!-- Input file caché -->
                <input type="file" id="surveillanceProstatiqueAttachmentInput" multiple style="display:none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt">
                
                <!-- Liste des fichiers attachés -->
                <div id="surveillanceProstatiqueAttachmentList" style="margin-top:12px;">
                    <!-- Les fichiers sélectionnés apparaîtront ici -->
                </div>
            </div>
        </div>
        
        <div class="modal-actions" style="display:flex;justify-content:flex-end;gap:18px;padding:24px;border-top:1px solid var(--border);background:transparent;">
            <button id="surveillanceProstatiqueCancel" class="btn muted" style="padding:10px 32px;font-size:16px;">Annuler</button>
            <button id="surveillanceProstatiqueSubmit" class="btn muted" style="padding:10px 32px;font-size:16px;">Enregistrer</button> 
            <button id="surveillanceProstatiqueVerify" class="btn muted" style="padding:10px 32px;font-size:16px;">Vérifier</button>
        </div>
    </div>
</div>

<!-- Modal pour Micro Albuminuries (MIC) -->
<div class="modal" id="microAlbuminuriesModal" aria-hidden="true" style="z-index:101000;">
    <div class="modal-dialog" id="microAlbuminuriesDialog" style="width:96%;max-width:1200px;padding:36px;">
        <h3 id="microAlbuminuriesTitle" style="font-size:28px;margin-bottom:3px;font-weight:600;">Micro Albuminuries (MIC) - Saisir Résultat</h3>
        
        <div class="modal-body" id="microAlbuminuriesBody" style="padding:30px;font-size:17px;">
            <!-- Patient summary sera inséré ici -->
            <div id="microAlbuminuriesPatientSummary" style="margin-bottom:20px;"></div>
            
            <!-- Formulaire avec trois paramètres en lignes -->
            <div style="display:flex;flex-direction:column;gap:12px;">
                <!-- ALBUMINURIE -->
                <div data-microAlbuminuries-param="ALBUMINURIE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">ALBUMINURIE</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Flag dropdown -->
                    <select class="microAlbuminuries-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    
                    <!-- Résultat input -->
                    <input type="text" class="microAlbuminuries-param-valeur" placeholder="Valeur"
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="microAlbuminuries-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="microAlbuminuries-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="microAlbuminuries-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple microAlbuminuries-param-btn" style="padding:8px 12px;font-size:13px;" data-param="ALBUMINURIE">➕</button>
                </div>

                <!-- CREATINURIE -->
                <div data-microAlbuminuries-param="CREATINURIE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">CREATINURIE</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Flag dropdown -->
                    <select class="microAlbuminuries-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    
                    <!-- Résultat input -->
                    <input type="text" class="microAlbuminuries-param-valeur" placeholder="Valeur"
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="microAlbuminuries-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="microAlbuminuries-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="microAlbuminuries-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple microAlbuminuries-param-btn" style="padding:8px 12px;font-size:13px;" data-param="CREATINURIE">➕</button>
                </div>

                <!-- RAPPORT ALBU/CREAT -->
                <div data-microAlbuminuries-param="RAPPORT ALBU/CREAT" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">RAPPORT ALBU/CREAT</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Flag dropdown -->
                    <select class="microAlbuminuries-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    
                    <!-- Résultat input -->
                    <input type="text" class="microAlbuminuries-param-valeur" placeholder="Valeur"
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="microAlbuminuries-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="microAlbuminuries-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="microAlbuminuries-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple microAlbuminuries-param-btn" style="padding:8px 12px;font-size:13px;" data-param="RAPPORT ALBU/CREAT">➕</button>
                </div>
            </div>
            
            <!-- Section Commentaires avec Pièces jointes -->
            <div style="margin-top:20px;">
                <label style="display:block;font-weight:600;margin-bottom:10px;font-size:15px;color:#333;">Commentaires :</label>
                <div style="position:relative;">
                    <textarea id="microAlbuminuriesCommentsInput" placeholder="Entrez vos commentaires ici..." style="width:100%;min-height:90px;padding:12px;padding-top:40px;border:2px dashed #999;border-radius:6px;font-size:14px;font-family:Arial,sans-serif;resize:vertical;box-sizing:border-box;background:#f9f9f9;color:#666;"></textarea>
                    <button id="microAlbuminuriesAttachmentBtn" class="btn small purple" style="position:absolute;top:8px;left:8px;padding:6px 10px;font-size:12px;white-space:nowrap;height:auto;">📎</button>
                </div>
                
                <!-- Input file caché -->
                <input type="file" id="microAlbuminuriesAttachmentInput" multiple style="display:none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt">
                
                <!-- Liste des fichiers attachés -->
                <div id="microAlbuminuriesAttachmentList" style="margin-top:12px;">
                    <!-- Les fichiers sélectionnés apparaîtront ici -->
                </div>
            </div>
        </div>
        
        <div class="modal-actions" style="display:flex;justify-content:flex-end;gap:18px;padding:24px;border-top:1px solid var(--border);background:transparent;">
            <button id="microAlbuminuriesCancel" class="btn muted" style="padding:10px 32px;font-size:16px;">Annuler</button>
            <button id="microAlbuminuriesSubmit" class="btn muted" style="padding:10px 32px;font-size:16px;">Enregistrer</button> 
            <button id="microAlbuminuriesVerify" class="btn muted" style="padding:10px 32px;font-size:16px;">Vérifier</button>
        </div>
    </div>
</div>

<!-- Modal pour Glycémie Gestationnelle (GLG) -->
<div class="modal" id="glycemieGestationnelleModal" aria-hidden="true" style="z-index:101000;">
    <div class="modal-dialog" id="glycemieGestationnelleDialog" style="width:96%;max-width:1200px;padding:36px;">
        <h3 id="glycemieGestationnelleTitle" style="font-size:28px;margin-bottom:3px;font-weight:600;">Glycémie Gestationnelle (GLG) - Saisir Résultat</h3>
        
        <div class="modal-body" id="glycemieGestationnelleBody" style="padding:30px;font-size:17px;">
            <!-- Patient summary sera inséré ici -->
            <div id="glycemieGestationnellePatientSummary" style="margin-bottom:20px;"></div>
            
            <!-- Formulaire avec trois paramètres en lignes -->
            <div style="display:flex;flex-direction:column;gap:12px;">
                <!-- GLYCÉMIE À JEÛNE -->
                <div data-glycemieGestationnelle-param="GLYCÉMIE À JEÛNE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">GLYCÉMIE À JEÛNE</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Flag dropdown -->
                    <select class="glycemieGestationnelle-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    
                    <!-- Résultat input -->
                    <input type="text" class="glycemieGestationnelle-param-valeur" placeholder="Valeur"
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="glycemieGestationnelle-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="glycemieGestationnelle-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="glycemieGestationnelle-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple glycemieGestationnelle-param-btn" style="padding:8px 12px;font-size:13px;" data-param="GLYCÉMIE À JEÛNE">➕</button>
                </div>

                <!-- GLYCÉMIE APRÈS 1 HEURE -->
                <div data-glycemieGestationnelle-param="GLYCÉMIE APRÈS 1 HEURE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">GLYCÉMIE APRÈS 1 HEURE</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Flag dropdown -->
                    <select class="glycemieGestationnelle-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    
                    <!-- Résultat input -->
                    <input type="text" class="glycemieGestationnelle-param-valeur" placeholder="Valeur"
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="glycemieGestationnelle-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="glycemieGestationnelle-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="glycemieGestationnelle-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple glycemieGestationnelle-param-btn" style="padding:8px 12px;font-size:13px;" data-param="GLYCÉMIE APRÈS 1 HEURE">➕</button>
                </div>

                <!-- GLYCÉMIE APRÈS 2 HEURES -->
                <div data-glycemieGestationnelle-param="GLYCÉMIE APRÈS 2 HEURES" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">GLYCÉMIE APRÈS 2 HEURES</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Flag dropdown -->
                    <select class="glycemieGestationnelle-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    
                    <!-- Résultat input -->
                    <input type="text" class="glycemieGestationnelle-param-valeur" placeholder="Valeur"
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="glycemieGestationnelle-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="glycemieGestationnelle-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="glycemieGestationnelle-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple glycemieGestationnelle-param-btn" style="padding:8px 12px;font-size:13px;" data-param="GLYCÉMIE APRÈS 2 HEURES">➕</button>
                </div>
            </div>
            
            <!-- Section Commentaires avec Pièces jointes -->
            <div style="margin-top:20px;">
                <label style="display:block;font-weight:600;margin-bottom:10px;font-size:15px;color:#333;">Commentaires :</label>
                <div style="position:relative;">
                    <textarea id="glycemieGestationnelleCommentsInput" placeholder="Entrez vos commentaires ici..." style="width:100%;min-height:90px;padding:12px;padding-top:40px;border:2px dashed #999;border-radius:6px;font-size:14px;font-family:Arial,sans-serif;resize:vertical;box-sizing:border-box;background:#f9f9f9;color:#666;"></textarea>
                    <button id="glycemieGestationnelleAttachmentBtn" class="btn small purple" style="position:absolute;top:8px;left:8px;padding:6px 10px;font-size:12px;white-space:nowrap;height:auto;">📎</button>
                </div>
                
                <!-- Input file caché -->
                <input type="file" id="glycemieGestationnelleAttachmentInput" multiple style="display:none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt">
                
                <!-- Liste des fichiers attachés -->
                <div id="glycemieGestationnelleAttachmentList" style="margin-top:12px;">
                    <!-- Les fichiers sélectionnés apparaîtront ici -->
                </div>
            </div>
        </div>
        
        <div class="modal-actions" style="display:flex;justify-content:flex-end;gap:18px;padding:24px;border-top:1px solid var(--border);background:transparent;">
            <button id="glycemieGestationnelleCancel" class="btn muted" style="padding:10px 32px;font-size:16px;">Annuler</button>
            <button id="glycemieGestationnelleSubmit" class="btn muted" style="padding:10px 32px;font-size:16px;">Enregistrer</button> 
            <button id="glycemieGestationnelleVerify" class="btn muted" style="padding:10px 32px;font-size:16px;">Vérifier</button>
        </div>
    </div>
</div>

<!-- BILANS DE TORCH (TRC) MODAL -->
<div class="modal" id="bilansTorchModal" aria-hidden="true" style="z-index:101000;">
    <div class="modal-dialog" id="bilansTorchDialog" style="width:96%;max-width:1200px;padding:36px;">
        <h3 id="bilansTorchTitle" style="font-size:28px;margin-bottom:3px;font-weight:600;">Bilans de TORCH (TRC) - Saisir Résultat</h3>
        
        <div class="modal-body" id="bilansTorchBody" style="padding:30px;font-size:17px;">
            <!-- Patient summary sera inséré ici -->
            <div id="bilansTorchPatientSummary" style="margin-bottom:20px;"></div>
            
            <!-- Formulaire avec 8 paramètres -->
            <div style="display:flex;flex-direction:column;gap:12px;">
                <!-- RUBEOLE IgG -->
                <div data-bilansTorch-param="RUBEOLE IgG" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">RUBEOLE IgG</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- RESULTAT Dropdown -->
                    <div style="font-weight:600;font-size:12px;color:#666;margin-left:20px;min-width:70px;">RESULTAT:</div>
                    <select class="bilansTorch-param-resultat" data-other-field="bilansTorch-rubIgG-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                        <option value="">---</option>
                        <option value="Négatif">Négatif</option>
                        <option value="Positif">Positif</option>
                        <option value="Autre">Autre</option>
                    </select>
                    <input type="text" class="bilansTorch-param-other" id="bilansTorch-rubIgG-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    
                    <!-- VALEURS input -->
                    <div style="font-weight:600;font-size:12px;color:#666;margin-left:15px;min-width:70px;">VALEURS:</div>
                    <input type="text" class="bilansTorch-param-valeur" placeholder="Titre/Valeur"
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="bilansTorch-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="bilansTorch-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="bilansTorch-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple bilansTorch-param-btn" style="padding:8px 12px;font-size:13px;" data-param="RUBEOLE IgG">➕</button>
                </div>

                <!-- RUBEOLE IgM -->
                <div data-bilansTorch-param="RUBEOLE IgM" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">RUBEOLE IgM</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- RESULTAT Dropdown -->
                    <div style="font-weight:600;font-size:12px;color:#666;margin-left:20px;min-width:70px;">RESULTAT:</div>
                    <select class="bilansTorch-param-resultat" data-other-field="bilansTorch-rubIgM-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                        <option value="">---</option>
                        <option value="Négatif">Négatif</option>
                        <option value="Positif">Positif</option>
                        <option value="Autre">Autre</option>
                    </select>
                    <input type="text" class="bilansTorch-param-other" id="bilansTorch-rubIgM-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    
                    <!-- VALEURS input -->
                    <div style="font-weight:600;font-size:12px;color:#666;margin-left:15px;min-width:70px;">VALEURS:</div>
                    <input type="text" class="bilansTorch-param-valeur" placeholder="Titre/Valeur"
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="bilansTorch-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="bilansTorch-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="bilansTorch-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple bilansTorch-param-btn" style="padding:8px 12px;font-size:13px;" data-param="RUBEOLE IgM">➕</button>
                </div>

                <!-- CYTOMEGALOVIRUS IgG -->
                <div data-bilansTorch-param="CYTOMEGALOVIRUS IgG" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">CYTOMEGALOVIRUS IgG</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- RESULTAT Dropdown -->
                    <div style="font-weight:600;font-size:12px;color:#666;margin-left:20px;min-width:70px;">RESULTAT:</div>
                    <select class="bilansTorch-param-resultat" data-other-field="bilansTorch-cmvIgG-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                        <option value="">---</option>
                        <option value="Négatif">Négatif</option>
                        <option value="Positif">Positif</option>
                        <option value="Autre">Autre</option>
                    </select>
                    <input type="text" class="bilansTorch-param-other" id="bilansTorch-cmvIgG-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    
                    <!-- VALEURS input -->
                    <div style="font-weight:600;font-size:12px;color:#666;margin-left:15px;min-width:70px;">VALEURS:</div>
                    <input type="text" class="bilansTorch-param-valeur" placeholder="Titre/Valeur"
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="bilansTorch-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="bilansTorch-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="bilansTorch-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple bilansTorch-param-btn" style="padding:8px 12px;font-size:13px;" data-param="CYTOMEGALOVIRUS IgG">➕</button>
                </div>

                <!-- CYTOMEGALOVIRUS IgM -->
                <div data-bilansTorch-param="CYTOMEGALOVIRUS IgM" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">CYTOMEGALOVIRUS IgM</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- RESULTAT Dropdown -->
                    <div style="font-weight:600;font-size:12px;color:#666;margin-left:20px;min-width:70px;">RESULTAT:</div>
                    <select class="bilansTorch-param-resultat" data-other-field="bilansTorch-cmvIgM-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                        <option value="">---</option>
                        <option value="Négatif">Négatif</option>
                        <option value="Positif">Positif</option>
                        <option value="Autre">Autre</option>
                    </select>
                    <input type="text" class="bilansTorch-param-other" id="bilansTorch-cmvIgM-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    
                    <!-- VALEURS input -->
                    <div style="font-weight:600;font-size:12px;color:#666;margin-left:15px;min-width:70px;">VALEURS:</div>
                    <input type="text" class="bilansTorch-param-valeur" placeholder="Titre/Valeur"
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="bilansTorch-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="bilansTorch-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="bilansTorch-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple bilansTorch-param-btn" style="padding:8px 12px;font-size:13px;" data-param="CYTOMEGALOVIRUS IgM">➕</button>
                </div>

                <!-- HERPES SIMPLEX VIRUS TYPE-1 IgG -->
                <div data-bilansTorch-param="HERPES SIMPLEX VIRUS TYPE-1 IgG" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">HSV-1 IgG</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- RESULTAT Dropdown -->
                    <div style="font-weight:600;font-size:12px;color:#666;margin-left:20px;min-width:70px;">RESULTAT:</div>
                    <select class="bilansTorch-param-resultat" data-other-field="bilansTorch-hsv1IgG-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                        <option value="">---</option>
                        <option value="Négatif">Négatif</option>
                        <option value="Positif">Positif</option>
                        <option value="Autre">Autre</option>
                    </select>
                    <input type="text" class="bilansTorch-param-other" id="bilansTorch-hsv1IgG-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    
                    <!-- VALEURS input -->
                    <div style="font-weight:600;font-size:12px;color:#666;margin-left:15px;min-width:70px;">VALEURS:</div>
                    <input type="text" class="bilansTorch-param-valeur" placeholder="Titre/Valeur"
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="bilansTorch-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="bilansTorch-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="bilansTorch-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple bilansTorch-param-btn" style="padding:8px 12px;font-size:13px;" data-param="HERPES SIMPLEX VIRUS TYPE-1 IgG">➕</button>
                </div>

                <!-- HERPES SIMPLEX VIRUS TYPE-2 IgM -->
                <div data-bilansTorch-param="HERPES SIMPLEX VIRUS TYPE-2 IgM" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">HSV-2 IgM</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- RESULTAT Dropdown -->
                    <div style="font-weight:600;font-size:12px;color:#666;margin-left:20px;min-width:70px;">RESULTAT:</div>
                    <select class="bilansTorch-param-resultat" data-other-field="bilansTorch-hsv2IgM-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                        <option value="">---</option>
                        <option value="Négatif">Négatif</option>
                        <option value="Positif">Positif</option>
                        <option value="Autre">Autre</option>
                    </select>
                    <input type="text" class="bilansTorch-param-other" id="bilansTorch-hsv2IgM-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    
                    <!-- VALEURS input -->
                    <div style="font-weight:600;font-size:12px;color:#666;margin-left:15px;min-width:70px;">VALEURS:</div>
                    <input type="text" class="bilansTorch-param-valeur" placeholder="Titre/Valeur"
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="bilansTorch-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="bilansTorch-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="bilansTorch-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple bilansTorch-param-btn" style="padding:8px 12px;font-size:13px;" data-param="HERPES SIMPLEX VIRUS TYPE-2 IgM">➕</button>
                </div>

                <!-- TOXOPLASMOSE IgG -->
                <div data-bilansTorch-param="TOXOPLASMOSE IgG" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">TOXOPLASMOSE IgG</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- RESULTAT Dropdown -->
                    <div style="font-weight:600;font-size:12px;color:#666;margin-left:20px;min-width:70px;">RESULTAT:</div>
                    <select class="bilansTorch-param-resultat" data-other-field="bilansTorch-toxoIgG-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                        <option value="">---</option>
                        <option value="Négatif">Négatif</option>
                        <option value="Positif">Positif</option>
                        <option value="Autre">Autre</option>
                    </select>
                    <input type="text" class="bilansTorch-param-other" id="bilansTorch-toxoIgG-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    
                    <!-- VALEURS input -->
                    <div style="font-weight:600;font-size:12px;color:#666;margin-left:15px;min-width:70px;">VALEURS:</div>
                    <input type="text" class="bilansTorch-param-valeur" placeholder="Titre/Valeur"
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="bilansTorch-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="bilansTorch-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="bilansTorch-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple bilansTorch-param-btn" style="padding:8px 12px;font-size:13px;" data-param="TOXOPLASMOSE IgG">➕</button>
                </div>

                <!-- TOXOPLASMOSE IgM -->
                <div data-bilansTorch-param="TOXOPLASMOSE IgM" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">TOXOPLASMOSE IgM</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- RESULTAT Dropdown -->
                    <div style="font-weight:600;font-size:12px;color:#666;margin-left:20px;min-width:70px;">RESULTAT:</div>
                    <select class="bilansTorch-param-resultat" data-other-field="bilansTorch-toxoIgM-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                        <option value="">---</option>
                        <option value="Négatif">Négatif</option>
                        <option value="Positif">Positif</option>
                        <option value="Autre">Autre</option>
                    </select>
                    <input type="text" class="bilansTorch-param-other" id="bilansTorch-toxoIgM-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    
                    <!-- VALEURS input -->
                    <div style="font-weight:600;font-size:12px;color:#666;margin-left:15px;min-width:70px;">VALEURS:</div>
                    <input type="text" class="bilansTorch-param-valeur" placeholder="Titre/Valeur"
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="bilansTorch-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="bilansTorch-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="bilansTorch-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple bilansTorch-param-btn" style="padding:8px 12px;font-size:13px;" data-param="TOXOPLASMOSE IgM">➕</button>
                </div>
            </div>
            
            <!-- Section Commentaires avec Pièces jointes -->
            <div style="margin-top:20px;">
                <label style="display:block;font-weight:600;margin-bottom:10px;font-size:15px;color:#333;">Commentaires :</label>
                <div style="position:relative;">
                    <textarea id="bilansTorchCommentsInput" placeholder="Entrez vos commentaires ici..." style="width:100%;min-height:90px;padding:12px;padding-top:40px;border:2px dashed #999;border-radius:6px;font-size:14px;font-family:Arial,sans-serif;resize:vertical;box-sizing:border-box;background:#f9f9f9;color:#666;"></textarea>
                    <button id="bilansTorchAttachmentBtn" class="btn small purple" style="position:absolute;top:8px;left:8px;padding:6px 10px;font-size:12px;white-space:nowrap;height:auto;">📎</button>
                </div>
                
                <!-- Input file caché -->
                <input type="file" id="bilansTorchFileInput" multiple style="display:none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt">
                
                <!-- Liste des fichiers attachés -->
                <div id="bilansTorchAttachmentList" style="margin-top:12px;">
                    <!-- Les fichiers sélectionnés apparaîtront ici -->
                </div>
            </div>
        </div>
        
        <div class="modal-actions" style="display:flex;justify-content:flex-end;gap:18px;padding:24px;border-top:1px solid var(--border);background:transparent;">
            <button id="bilansTorchCancel" class="btn muted" style="padding:10px 32px;font-size:16px;">Annuler</button>
            <button id="bilansTorchSubmit" class="btn muted" style="padding:10px 32px;font-size:16px;">Enregistrer</button> 
            <button id="bilansTorchVerify" class="btn muted" style="padding:10px 32px;font-size:16px;">Vérifier</button>
        </div>
    </div>
</div>

<!-- Modal pour FROTTIS - SECRETION -->
<div class="modal" id="frottisSecretionModal" aria-hidden="true" style="z-index:101000;">
    <div class="modal-dialog" id="frottisSecretionDialog" style="width:96%;max-width:1200px;padding:36px;">
        <h3 id="frottisSecretionTitle" style="font-size:28px;margin-bottom:3px;font-weight:600;">Frottis - Sécrétion - Saisir Résultat</h3>
        
        <div class="modal-body" id="frottisSecretionBody" style="padding:30px;font-size:17px;">
            <!-- Patient summary sera inséré ici -->
            <div id="frottisSecretionPatientSummary" style="margin-bottom:20px;"></div>
            
            <!-- Formulaire avec les paramètres en lignes -->
            <div style="display:flex;flex-direction:column;gap:12px;">
                <!-- HEURES DE COLLECTE -->
                <div data-frottisSecretion-param="HEURES DE COLLECTE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">HEURES DE COLLECTE</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Résultat input -->
                    <input type="text" class="frottisSecretion-param-valeur" placeholder="Résultat"
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:150px;text-align:left;height:28px;line-height:1;margin-left:20px;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="frottisSecretion-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="frottisSecretion-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="frottisSecretion-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple frottisSecretion-param-btn" style="padding:8px 12px;font-size:13px;" data-param="HEURES DE COLLECTE">➕</button>
                </div>

                <!-- HEURES D'EXAMINATION -->
                <div data-frottisSecretion-param="HEURES D'EXAMINATION" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">HEURES D'EXAMINATION</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Résultat input -->
                    <input type="text" class="frottisSecretion-param-valeur" placeholder="Résultat"
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:150px;text-align:left;height:28px;line-height:1;margin-left:20px;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="frottisSecretion-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="frottisSecretion-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="frottisSecretion-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple frottisSecretion-param-btn" style="padding:8px 12px;font-size:13px;" data-param="HEURES D'EXAMINATION">➕</button>
                </div>

                <!-- TEMPSCOMPLET -->
                <div data-frottisSecretion-param="TEMPSCOMPLET" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">TEMPS COMPLET</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Résultat input -->
                    <input type="text" class="frottisSecretion-param-valeur" placeholder="Résultat"
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:150px;text-align:left;height:28px;line-height:1;margin-left:20px;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="frottisSecretion-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="frottisSecretion-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="frottisSecretion-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple frottisSecretion-param-btn" style="padding:8px 12px;font-size:13px;" data-param="TEMPSCOMPLET">➕</button>
                </div>

                <!-- ABSTINENCE OBSERVES -->
                <div data-frottisSecretion-param="ABSTINENCE OBSERVES" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">ABSTINENCE OBSERVES</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Résultat select -->
                    <select class="frottisSecretion-param-valeur" data-other-field="frottisSecretion-abstinence-observes-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:150px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">-- Sélectionner --</option>
                        <option value="Oui">Oui</option>
                        <option value="Non">Non</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="frottisSecretion-abstinence-observes-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="frottisSecretion-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="frottisSecretion-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="frottisSecretion-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple frottisSecretion-param-btn" style="padding:8px 12px;font-size:13px;" data-param="ABSTINENCE OBSERVES">➕</button>
                </div>

                <!-- PENDANT L OVULATION -->
                <div data-frottisSecretion-param="PENDANT L OVULATION" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">PENDANT L OVULATION</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Résultat select -->
                    <select class="frottisSecretion-param-valeur" data-other-field="frottisSecretion-pendant-ovulation-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:150px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">-- Sélectionner --</option>
                        <option value="Oui">Oui</option>
                        <option value="Non">Non</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="frottisSecretion-pendant-ovulation-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="frottisSecretion-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="frottisSecretion-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="frottisSecretion-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple frottisSecretion-param-btn" style="padding:8px 12px;font-size:13px;" data-param="PENDANT L OVULATION">➕</button>
                </div>

                <!-- ODEUR -->
                <div data-frottisSecretion-param="ODEUR" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">ODEUR</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Résultat select -->
                    <select class="frottisSecretion-param-valeur" data-other-field="frottisSecretion-odeur-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:150px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">-- Sélectionner --</option>
                        <option value="Absent">Absent</option>
                        <option value="Présent">Présent</option>
                        <option value="Anormal">Anormal</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="frottisSecretion-odeur-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="frottisSecretion-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="frottisSecretion-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="frottisSecretion-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple frottisSecretion-param-btn" style="padding:8px 12px;font-size:13px;" data-param="ODEUR">➕</button>
                </div>

                <!-- ENCEINTE -->
                <div data-frottisSecretion-param="ENCEINTE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">ENCEINTE</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Résultat select -->
                    <select class="frottisSecretion-param-valeur" data-other-field="frottisSecretion-enceinte-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:150px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">-- Sélectionner --</option>
                        <option value="Oui">Oui</option>
                        <option value="Non">Non</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="frottisSecretion-enceinte-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="frottisSecretion-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="frottisSecretion-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="frottisSecretion-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple frottisSecretion-param-btn" style="padding:8px 12px;font-size:13px;" data-param="ENCEINTE">➕</button>
                </div>

                <!-- COULEUR -->
                <div data-frottisSecretion-param="COULEUR" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">COULEUR</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Résultat select -->
                    <select class="frottisSecretion-param-valeur" data-other-field="frottisSecretion-couleur-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:150px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">-- Sélectionner --</option>
                        <option value="Blanc">Blanc</option>
                        <option value="Jaune">Jaune</option>
                        <option value="Vert">Vert</option>
                        <option value="Gris">Gris</option>
                        <option value="Brun">Brun</option>
                        <option value="Transparent">Transparent</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="frottisSecretion-couleur-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="frottisSecretion-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="frottisSecretion-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="frottisSecretion-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple frottisSecretion-param-btn" style="padding:8px 12px;font-size:13px;" data-param="COULEUR">➕</button>
                </div>

                <!-- CONSISTANCE -->
                <div data-frottisSecretion-param="CONSISTANCE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">CONSISTANCE</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Résultat select -->
                    <select class="frottisSecretion-param-valeur" data-other-field="frottisSecretion-consistance-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:150px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">-- Sélectionner --</option>
                        <option value="Fluide">Fluide</option>
                        <option value="Mucoïde">Mucoïde</option>
                        <option value="Crémeux">Crémeux</option>
                        <option value="Gélatineux">Gélatineux</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="frottisSecretion-consistance-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="frottisSecretion-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="frottisSecretion-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="frottisSecretion-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple frottisSecretion-param-btn" style="padding:8px 12px;font-size:13px;" data-param="CONSISTANCE">➕</button>
                </div>

                <!-- SANG VISIBLE -->
                <div data-frottisSecretion-param="SANG VISIBLE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">SANG VISIBLE</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Résultat select -->
                    <select class="frottisSecretion-param-valeur" data-other-field="frottisSecretion-sang-visible-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:150px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">-- Sélectionner --</option>
                        <option value="Absent">Absent</option>
                        <option value="Peu">Peu</option>
                        <option value="Modéré">Modéré</option>
                        <option value="Abondant">Abondant</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="frottisSecretion-sang-visible-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="frottisSecretion-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="frottisSecretion-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="frottisSecretion-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple frottisSecretion-param-btn" style="padding:8px 12px;font-size:13px;" data-param="SANG VISIBLE">➕</button>
                </div>

                <!-- GLOBULES BLANCS -->
                <div data-frottisSecretion-param="GLOBULES BLANCS" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">GLOBULES BLANCS</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Résultat select -->
                    <select class="frottisSecretion-param-valeur" data-other-field="frottisSecretion-globules-blancs-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:150px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">-- Sélectionner --</option>
                        <option value="0-1">0-1</option>
                        <option value="1-2">1-2</option>
                        <option value="2-3">2-3</option>
                        <option value="3-5">3-5</option>
                        <option value="5-7">5-7</option>
                        <option value="8-10">8-10</option>
                        <option value="10-15">10-15</option>
                        <option value="15-20">15-20</option>
                        <option value="20-30">20-30</option>
                        <option value="Nombreux (30-50)">Nombreux (30-50)</option>
                        <option value="Très nombreux(50-100) ">Très nombreux(50-100) </option>
                        <option value="Très nombreux (˃100)">Très nombreux (˃100)</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="frottisSecretion-globules-blancs-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="frottisSecretion-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="frottisSecretion-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="frottisSecretion-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple frottisSecretion-param-btn" style="padding:8px 12px;font-size:13px;" data-param="GLOBULES BLANCS">➕</button>
                </div>

                <!-- GLOBULES ROUGES -->
                <div data-frottisSecretion-param="GLOBULES ROUGES" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">GLOBULES ROUGES</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Résultat select -->
                    <select class="frottisSecretion-param-valeur" data-other-field="frottisSecretion-globules-rouges-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:150px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">-- Sélectionner --</option>
                        <option value="0-1">0-1</option>
                        <option value="1-2">1-2</option>
                        <option value="2-3">2-3</option>
                        <option value="3-5">3-5</option>
                        <option value="5-7">5-7</option>
                        <option value="8-10">8-10</option>
                        <option value="10-15">10-15</option>
                        <option value="15-20">15-20</option>
                        <option value="20-30">20-30</option>
                        <option value="Nombreux (30-50)">Nombreux (30-50)</option>
                        <option value="Très nombreux(50-100) ">Très nombreux(50-100) </option>
                        <option value="Très nombreux (˃100)">Très nombreux (˃100)</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="frottisSecretion-globules-rouges-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="frottisSecretion-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="frottisSecretion-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="frottisSecretion-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple frottisSecretion-param-btn" style="padding:8px 12px;font-size:13px;" data-param="GLOBULES ROUGES">➕</button>
                </div>

                <!-- CELLULES EPITHELIALES -->
                <div data-frottisSecretion-param="CELLULES EPITHELIALES" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">CELLULES EPITHELIALES</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Résultat select -->
                    <select class="frottisSecretion-param-valeur" data-other-field="frottisSecretion-cellules-epitheliales-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:150px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">-- Sélectionner --</option>
                        <option value="0-1">0-1</option>
                        <option value="1-2">1-2</option>
                        <option value="2-3">2-3</option>
                        <option value="3-5">3-5</option>
                        <option value="5-7">5-7</option>
                        <option value="8-10">8-10</option>
                        <option value="10-15">10-15</option>
                        <option value="15-20">15-20</option>
                        <option value="20-30">20-30</option>
                        <option value="Nombreux (30-50)">Nombreux (30-50)</option>
                        <option value="Très nombreux(50-100) ">Très nombreux(50-100) </option>
                        <option value="Très nombreux (˃100)">Très nombreux (˃100)</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="frottisSecretion-cellules-epitheliales-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="frottisSecretion-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="frottisSecretion-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="frottisSecretion-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple frottisSecretion-param-btn" style="padding:8px 12px;font-size:13px;" data-param="CELLULES EPITHELIALES">➕</button>
                </div>

                <!-- LEVURES -->
                <div data-frottisSecretion-param="LEVURES" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">LEVURES</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Résultat select -->
                    <select class="frottisSecretion-param-valeur" data-other-field="frottisSecretion-levures-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:150px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">-- Sélectionner --</option>
                        <option value="Absent">Absent</option>
                        <option value="Présent">Présent</option>
                        <option value="+">+</option>
                        <option value="++">++</option>
                        <option value="+++">+++</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="frottisSecretion-levures-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="frottisSecretion-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="frottisSecretion-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="frottisSecretion-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple frottisSecretion-param-btn" style="padding:8px 12px;font-size:13px;" data-param="LEVURES">➕</button>
                </div>

                <!-- CILINDRE -->
                <div data-frottisSecretion-param="CILINDRE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">CILINDRE</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Résultat select -->
                    <select class="frottisSecretion-param-valeur" data-other-field="frottisSecretion-cilindre-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:150px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">-- Sélectionner --</option>
                        <option value="Absent">Absent</option>
                        <option value="Hyalin">Hyalin</option>
                        <option value="Granuleux">Granuleux</option>
                        <option value="Hématoïde">Hématoïde</option>
                        <option value="Circoïde">Circoïde</option>
                        <option value="Ciré">Ciré</option>
                        <option value="Leucocytaire">Leucocytaire</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="frottisSecretion-cilindre-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="frottisSecretion-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="frottisSecretion-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="frottisSecretion-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple frottisSecretion-param-btn" style="padding:8px 12px;font-size:13px;" data-param="CILINDRE">➕</button>
                </div>

                <!-- CRISTAUX -->
                <div data-frottisSecretion-param="CRISTAUX" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">CRISTAUX</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Résultat select -->
                    <select class="frottisSecretion-param-valeur" data-other-field="frottisSecretion-cristaux-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:150px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">-- Sélectionner --</option>
                        <option value="Absent">Absent</option>
                        <option value="Present">Present</option>
                        <option value="+">+</option>
                        <option value="++">++</option>
                        <option value="+++">+++</option>
                        <option value="++++">++++</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="frottisSecretion-cristaux-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="frottisSecretion-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="frottisSecretion-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="frottisSecretion-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple frottisSecretion-param-btn" style="padding:8px 12px;font-size:13px;" data-param="CRISTAUX">➕</button>
                </div>

                <!-- BACTERIE -->
                <div data-frottisSecretion-param="BACTERIE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">BACTERIE</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Résultat select -->
                    <select class="frottisSecretion-param-valeur" data-other-field="frottisSecretion-bacterie-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:150px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">-- Sélectionner --</option>
                        <option value="Négatif">Négatif</option>
                        <option value="Peu">Peu</option>
                        <option value="Modéré">Modéré</option>
                        <option value="Nombreux">Nombreux</option>
                        <option value="+">+</option>
                        <option value="++">++</option>
                        <option value="+++">+++</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="frottisSecretion-bacterie-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="frottisSecretion-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="frottisSecretion-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="frottisSecretion-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple frottisSecretion-param-btn" style="padding:8px 12px;font-size:13px;" data-param="BACTERIE">➕</button>
                </div>

                <!-- PARASITES ADULTES -->
                <div data-frottisSecretion-param="PARASITES ADULTES" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">PARASITES ADULTES</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Résultat select -->
                    <select class="frottisSecretion-param-valeur" data-other-field="frottisSecretion-parasites-adultes-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:150px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">-- Sélectionner --</option>
                        <option value="Absent">Absent</option>
                        <option value="Présent">Présent</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="frottisSecretion-parasites-adultes-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="frottisSecretion-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="frottisSecretion-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="frottisSecretion-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple frottisSecretion-param-btn" style="padding:8px 12px;font-size:13px;" data-param="PARASITES ADULTES">➕</button>
                </div>

                <!-- CELLULES ANORMALES -->
                <div data-frottisSecretion-param="CELLULES ANORMALES" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">CELLULES ANORMALES</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Résultat select -->
                    <select class="frottisSecretion-param-valeur" data-other-field="frottisSecretion-cellules-anormales-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:150px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">-- Sélectionner --</option>
                        <option value="Absent">Absent</option>
                        <option value="Présent">Présent</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="frottisSecretion-cellules-anormales-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="frottisSecretion-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="frottisSecretion-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="frottisSecretion-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple frottisSecretion-param-btn" style="padding:8px 12px;font-size:13px;" data-param="CELLULES ANORMALES">➕</button>
                </div>
            </div>
            
            <!-- Section Commentaires avec Pièces jointes -->
            <div style="margin-top:20px;">
                <label style="display:block;font-weight:600;margin-bottom:10px;font-size:15px;color:#333;">Commentaires :</label>
                <div style="position:relative;">
                    <textarea id="frottisSecretionCommentsInput" placeholder="Entrez vos commentaires ici..." style="width:100%;min-height:90px;padding:12px;padding-top:40px;border:2px dashed #999;border-radius:6px;font-size:14px;font-family:Arial,sans-serif;resize:vertical;box-sizing:border-box;background:#f9f9f9;color:#666;"></textarea>
                    <button id="frottisSecretionAttachmentBtn" class="btn small purple" style="position:absolute;top:8px;left:8px;padding:6px 10px;font-size:12px;white-space:nowrap;height:auto;">📎</button>
                </div>
                
                <!-- Input file caché -->
                <input type="file" id="frottisSecretionFileInput" multiple style="display:none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt">
                
                <!-- Liste des fichiers attachés -->
                <div id="frottisSecretionAttachmentList" style="margin-top:12px;">
                    <!-- Les fichiers sélectionnés apparaîtront ici -->
                </div>
            </div>
        </div>
        
        <div class="modal-actions" style="display:flex;justify-content:flex-end;gap:18px;padding:24px;border-top:1px solid var(--border);background:transparent;">
            <button id="frottisSecretionCancel" class="btn muted" style="padding:10px 32px;font-size:16px;">Annuler</button>
            <button id="frottisSecretionSubmit" class="btn muted" style="padding:10px 32px;font-size:16px;">Enregistrer</button> 
            <button id="frottisSecretionVerify" class="btn muted" style="padding:10px 32px;font-size:16px;">Vérifier</button>
        </div>
    </div>
</div>
<!-- Modal pour FLUIDE (LIQUIDE BIOLOGIQUE) -->
<div class="modal" id="fluideModal" aria-hidden="true" style="z-index:101000;">
    <div class="modal-dialog" id="fluideDialog" style="width:96%;max-width:1200px;padding:36px;">
        <h3 id="fluideTitle" style="font-size:28px;margin-bottom:3px;font-weight:600;">Fluide (Liquide Biologique) - Saisir Résultat</h3>
        
        <div class="modal-body" id="fluideBody" style="padding:30px;font-size:17px;">
            <!-- Patient summary sera inséré ici -->
            <div id="fluidePatientSummary" style="margin-bottom:20px;"></div>
            
            <!-- Formulaire avec les paramètres en lignes -->
            <div style="display:flex;flex-direction:column;gap:12px;">
                <!-- SPECIMEN -->
                <div data-fluide-param="SPECIMEN" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">SPECIMEN</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Résultat input -->
                    <input type="text" class="fluide-param-valeur" placeholder="Résultat"
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:150px;text-align:left;height:28px;line-height:1;margin-left:20px;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="fluide-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="fluide-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="fluide-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple fluide-param-btn" style="padding:8px 12px;font-size:13px;" data-param="SPECIMEN">➕</button>
                </div>

                <!-- COULEUR -->
                <div data-fluide-param="COULEUR" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">COULEUR</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Résultat select -->
                    <select class="fluide-param-valeur" data-other-field="fluide-couleur-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:150px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">-- Sélectionner --</option>
                        <option value="Blanc">Blanc</option>
                        <option value="Jaune">Jaune</option>
                        <option value="Vert">Vert</option>
                        <option value="Gris">Gris</option>
                        <option value="Brun">Brun</option>
                        <option value="Transparent">Transparent</option>
                        <option value="Hémorragique">Hémorragique</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="fluide-couleur-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="fluide-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="fluide-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="fluide-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple fluide-param-btn" style="padding:8px 12px;font-size:13px;" data-param="COULEUR">➕</button>
                </div>

                <!-- APPARANCE -->
                <div data-fluide-param="APPARANCE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">APPARANCE</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Résultat select -->
                    <select class="fluide-param-valeur" data-other-field="fluide-apparance-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:150px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">-- Sélectionner --</option>
                        <option value="Clair">Clair</option>
                        <option value="Trouble">Trouble</option>
                        <option value="Trouble léger">Trouble léger</option>
                        <option value="Gélatineux">Gélatineux</option>
                        <option value="Hémorragique">Hémorragique</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="fluide-apparance-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="fluide-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="fluide-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="fluide-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple fluide-param-btn" style="padding:8px 12px;font-size:13px;" data-param="APPARANCE">➕</button>
                </div>

                <!-- VOLUME -->
                <div data-fluide-param="VOLUME" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">VOLUME</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Résultat input -->
                    <input type="text" class="fluide-param-valeur" placeholder="Résultat"
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:150px;text-align:left;height:28px;line-height:1;margin-left:20px;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="fluide-param-unite">mL</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="fluide-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="fluide-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple fluide-param-btn" style="padding:8px 12px;font-size:13px;" data-param="VOLUME">➕</button>
                </div>

                <!-- PROTEIN -->
                <div data-fluide-param="PROTEIN" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">PROTEIN</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Résultat input -->
                    <input type="text" class="fluide-param-valeur" placeholder="Résultat"
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:150px;text-align:left;height:28px;line-height:1;margin-left:20px;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="fluide-param-unite">g/L</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="fluide-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="fluide-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple fluide-param-btn" style="padding:8px 12px;font-size:13px;" data-param="PROTEIN">➕</button>
                </div>

                <!-- GLUCOSE -->
                <div data-fluide-param="GLUCOSE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">GLUCOSE</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Résultat input -->
                    <input type="text" class="fluide-param-valeur" placeholder="Résultat"
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:150px;text-align:left;height:28px;line-height:1;margin-left:20px;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="fluide-param-unite">mg/dL</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="fluide-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="fluide-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple fluide-param-btn" style="padding:8px 12px;font-size:13px;" data-param="GLUCOSE">➕</button>
                </div>

                <!-- GLOBULES ROUGES -->
                <div data-fluide-param="GLOBULES ROUGES" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">GLOBULES ROUGES</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Résultat select -->
                    <select class="fluide-param-valeur" data-other-field="fluide-globules-rouges-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:150px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">-- Sélectionner --</option>
                        <option value="0-1">0-1</option>
                        <option value="1-2">1-2</option>
                        <option value="2-3">2-3</option>
                        <option value="3-5">3-5</option>
                        <option value="5-7">5-7</option>
                        <option value="8-10">8-10</option>
                        <option value="10-15">10-15</option>
                        <option value="15-20">15-20</option>
                        <option value="20-30">20-30</option>
                        <option value="Nombreux (30-50)">Nombreux (30-50)</option>
                        <option value="Très nombreux(50-100)">Très nombreux(50-100)</option>
                        <option value="Très nombreux (˃100)">Très nombreux (˃100)</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="fluide-globules-rouges-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="fluide-param-unite">/µL</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="fluide-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="fluide-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple fluide-param-btn" style="padding:8px 12px;font-size:13px;" data-param="GLOBULES ROUGES">➕</button>
                </div>

                <!-- CELLULE MESOTHELIALES -->
                <div data-fluide-param="CELLULE MESOTHELIALES" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">CELLULE MESOTHELIALES</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Résultat select -->
                    <select class="fluide-param-valeur" data-other-field="fluide-cellule-mesotheliales-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:150px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">-- Sélectionner --</option>
                        <option value="0-1">0-1</option>
                        <option value="1-2">1-2</option>
                        <option value="2-3">2-3</option>
                        <option value="3-5">3-5</option>
                        <option value="5-7">5-7</option>
                        <option value="8-10">8-10</option>
                        <option value="10-15">10-15</option>
                        <option value="15-20">15-20</option>
                        <option value="20-30">20-30</option>
                        <option value="Nombreux (30-50)">Nombreux (30-50)</option>
                        <option value="Très nombreux(50-100)">Très nombreux(50-100)</option>
                        <option value="Très nombreux (˃100)">Très nombreux (˃100)</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="fluide-cellule-mesotheliales-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="fluide-param-unite">/µL</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="fluide-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="fluide-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple fluide-param-btn" style="padding:8px 12px;font-size:13px;" data-param="CELLULE MESOTHELIALES">➕</button>
                </div>

                <!-- CELLULE ANORMALES -->
                <div data-fluide-param="CELLULE ANORMALES" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">CELLULE ANORMALES</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Résultat select -->
                    <select class="fluide-param-valeur" data-other-field="fluide-cellule-anormales-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:150px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">-- Sélectionner --</option>
                        <option value="Absent">Absent</option>
                        <option value="Présent">Présent</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="fluide-cellule-anormales-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="fluide-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="fluide-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="fluide-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple fluide-param-btn" style="padding:8px 12px;font-size:13px;" data-param="CELLULE ANORMALES">➕</button>
                </div>

                <!-- GLOBULES BLANCS -->
                <div data-fluide-param="GLOBULES BLANCS" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">GLOBULES BLANCS</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Résultat select -->
                    <select class="fluide-param-valeur" data-other-field="fluide-globules-blancs-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:150px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">-- Sélectionner --</option>
                        <option value="0-1">0-1</option>
                        <option value="1-2">1-2</option>
                        <option value="2-3">2-3</option>
                        <option value="3-5">3-5</option>
                        <option value="5-7">5-7</option>
                        <option value="8-10">8-10</option>
                        <option value="10-15">10-15</option>
                        <option value="15-20">15-20</option>
                        <option value="20-30">20-30</option>
                        <option value="Nombreux (30-50)">Nombreux (30-50)</option>
                        <option value="Très nombreux(50-100)">Très nombreux(50-100)</option>
                        <option value="Très nombreux (˃100)">Très nombreux (˃100)</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="fluide-globules-blancs-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="fluide-param-unite">/µL</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="fluide-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="fluide-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple fluide-param-btn" style="padding:8px 12px;font-size:13px;" data-param="GLOBULES BLANCS">➕</button>
                </div>

                <!-- NEUTROPHILES -->
                <div data-fluide-param="NEUTREPHILES" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">NEUTROPHILES</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Résultat select -->
                    <select class="fluide-param-valeur" data-other-field="fluide-neutrophiles-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:150px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">-- Sélectionner --</option>
                        <option value="0-1">0-1</option>
                        <option value="1-2">1-2</option>
                        <option value="2-3">2-3</option>
                        <option value="3-5">3-5</option>
                        <option value="5-7">5-7</option>
                        <option value="8-10">8-10</option>
                        <option value="10-15">10-15</option>
                        <option value="15-20">15-20</option>
                        <option value="20-30">20-30</option>
                        <option value="Nombreux (30-50)">Nombreux (30-50)</option>
                        <option value="Très nombreux(50-100)">Très nombreux(50-100)</option>
                        <option value="Très nombreux (˃100)">Très nombreux (˃100)</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="fluide-neutrophiles-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="fluide-param-unite">%</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="fluide-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="fluide-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple fluide-param-btn" style="padding:8px 12px;font-size:13px;" data-param="NEUTREPHILES">➕</button>
                </div>

                <!-- EOSINOPHILES -->
                <div data-fluide-param="EOSINEPHILES" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">EOSINOPHILES</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Résultat select -->
                    <select class="fluide-param-valeur" data-other-field="fluide-eosinophiles-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:150px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">-- Sélectionner --</option>
                        <option value="0-1">0-1</option>
                        <option value="1-2">1-2</option>
                        <option value="2-3">2-3</option>
                        <option value="3-5">3-5</option>
                        <option value="5-7">5-7</option>
                        <option value="8-10">8-10</option>
                        <option value="10-15">10-15</option>
                        <option value="15-20">15-20</option>
                        <option value="20-30">20-30</option>
                        <option value="Nombreux (30-50)">Nombreux (30-50)</option>
                        <option value="Très nombreux(50-100)">Très nombreux(50-100)</option>
                        <option value="Très nombreux (˃100)">Très nombreux (˃100)</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="fluide-eosinophiles-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="fluide-param-unite">%</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="fluide-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="fluide-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple fluide-param-btn" style="padding:8px 12px;font-size:13px;" data-param="EOSINEPHILES">➕</button>
                </div>

                <!-- LYMPHOCYTE -->
                <div data-fluide-param="LYMPHOCYTE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">LYMPHOCYTE</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Résultat select -->
                    <select class="fluide-param-valeur" data-other-field="fluide-lymphocyte-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:150px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">-- Sélectionner --</option>
                        <option value="0-1">0-1</option>
                        <option value="1-2">1-2</option>
                        <option value="2-3">2-3</option>
                        <option value="3-5">3-5</option>
                        <option value="5-7">5-7</option>
                        <option value="8-10">8-10</option>
                        <option value="10-15">10-15</option>
                        <option value="15-20">15-20</option>
                        <option value="20-30">20-30</option>
                        <option value="Nombreux (30-50)">Nombreux (30-50)</option>
                        <option value="Très nombreux(50-100)">Très nombreux(50-100)</option>
                        <option value="Très nombreux (˃100)">Très nombreux (˃100)</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="fluide-lymphocyte-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="fluide-param-unite">%</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="fluide-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="fluide-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple fluide-param-btn" style="padding:8px 12px;font-size:13px;" data-param="LYMPHOCYTE">➕</button>
                </div>

                <!-- MONOCYTE -->
                <div data-fluide-param="MONOCYTE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">MONOCYTE</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Résultat select -->
                    <select class="fluide-param-valeur" data-other-field="fluide-monocyte-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:150px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">-- Sélectionner --</option>
                        <option value="0-1">0-1</option>
                        <option value="1-2">1-2</option>
                        <option value="2-3">2-3</option>
                        <option value="3-5">3-5</option>
                        <option value="5-7">5-7</option>
                        <option value="8-10">8-10</option>
                        <option value="10-15">10-15</option>
                        <option value="15-20">15-20</option>
                        <option value="20-30">20-30</option>
                        <option value="Nombreux (30-50)">Nombreux (30-50)</option>
                        <option value="Très nombreux(50-100)">Très nombreux(50-100)</option>
                        <option value="Très nombreux (˃100)">Très nombreux (˃100)</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="fluide-monocyte-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="fluide-param-unite">%</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="fluide-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="fluide-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple fluide-param-btn" style="padding:8px 12px;font-size:13px;" data-param="MONOCYTE">➕</button>
                </div>

                <!-- MACROPHAGES -->
                <div data-fluide-param="MACROPHAGES" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">MACROPHAGES</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Résultat select -->
                    <select class="fluide-param-valeur" data-other-field="fluide-macrophages-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:150px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">-- Sélectionner --</option>
                        <option value="0-1">0-1</option>
                        <option value="1-2">1-2</option>
                        <option value="2-3">2-3</option>
                        <option value="3-5">3-5</option>
                        <option value="5-7">5-7</option>
                        <option value="8-10">8-10</option>
                        <option value="10-15">10-15</option>
                        <option value="15-20">15-20</option>
                        <option value="20-30">20-30</option>
                        <option value="Nombreux (30-50)">Nombreux (30-50)</option>
                        <option value="Très nombreux(50-100)">Très nombreux(50-100)</option>
                        <option value="Très nombreux (˃100)">Très nombreux (˃100)</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="fluide-macrophages-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="fluide-param-unite">%</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="fluide-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="fluide-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple fluide-param-btn" style="padding:8px 12px;font-size:13px;" data-param="MACROPHAGES">➕</button>
                </div>

                <!-- TOTAL -->
                <div data-fluide-param="TOTAL" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">TOTAL</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Résultat input -->
                    <input type="text" class="fluide-param-valeur" placeholder="Résultat"
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:150px;text-align:left;height:28px;line-height:1;margin-left:20px;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="fluide-param-unite">%</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="fluide-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="fluide-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple fluide-param-btn" style="padding:8px 12px;font-size:13px;" data-param="TOTAL">➕</button>
                </div>
            </div>
            
            <!-- Section Commentaires avec Pièces jointes -->
            <div style="margin-top:20px;">
                <label style="display:block;font-weight:600;margin-bottom:10px;font-size:15px;color:#333;">Commentaires :</label>
                <div style="position:relative;">
                    <textarea id="fluideCommentsInput" placeholder="Entrez vos commentaires ici..." style="width:100%;min-height:90px;padding:12px;padding-top:40px;border:2px dashed #999;border-radius:6px;font-size:14px;font-family:Arial,sans-serif;resize:vertical;box-sizing:border-box;background:#f9f9f9;color:#666;"></textarea>
                    <button id="fluideAttachmentBtn" class="btn small purple" style="position:absolute;top:8px;left:8px;padding:6px 10px;font-size:12px;white-space:nowrap;height:auto;">📎</button>
                </div>
                
                <!-- Input file caché -->
                <input type="file" id="fluideFileInput" multiple style="display:none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt">
                
                <!-- Liste des fichiers attachés -->
                <div id="fluideAttachmentList" style="margin-top:12px;">
                    <!-- Les fichiers sélectionnés apparaîtront ici -->
                </div>
            </div>
        </div>
        
        <div class="modal-actions" style="display:flex;justify-content:flex-end;gap:18px;padding:24px;border-top:1px solid var(--border);background:transparent;">
            <button id="fluideCancel" class="btn muted" style="padding:10px 32px;font-size:16px;">Annuler</button>
            <button id="fluideSubmit" class="btn muted" style="padding:10px 32px;font-size:16px;">Enregistrer</button> 
            <button id="fluideVerify" class="btn muted" style="padding:10px 32px;font-size:16px;">Vérifier</button>
        </div>
    </div>
</div>

<!-- Modal pour HEMOGRAMME COMPLET (NFS) - 20 paramètres -->
<div class="modal" id="nfsModal" aria-hidden="true" style="z-index:101000;">
    <div class="modal-dialog" id="nfsDialog" style="width:96%;max-width:1200px;padding:36px;">
        <h3 id="nfsTitle" style="font-size:28px;margin-bottom:3px;font-weight:600;">Hemogramme Complet (NFS) - Saisir Résultats</h3>
        
        <div class="modal-body" id="nfsBody" style="padding:30px;font-size:17px;">
            <!-- Patient summary sera inséré ici -->
            <div id="nfsPatientSummary" style="margin-bottom:20px;"></div>
            
            <!-- Formulaire avec 20 paramètres en lignes -->
            <div style="display:flex;flex-direction:column;gap:12px;">
                <!-- GR NUMERATION ERYTHROCYTAIRE -->
                <div data-nfs-param="GR" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">GLOBULES ROUGES</div>
                    <div style="color:#ccc;">:</div>
                    <select class="nfs-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    <input type="text" class="nfs-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="nfs-param-unite">---</span></div>
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="nfs-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="nfs-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple nfs-param-btn" style="padding:8px 12px;font-size:13px;" data-param="GR NUMERATION ERYTHROCYTAIRE (GLOBULES ROUGES)">➕</button>
                </div>

                <!-- HGB (HEMOGLOBINE) -->
                <div data-nfs-param="HGB" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">HEMOGLOBINE</div>
                    <div style="color:#ccc;">:</div>
                    <select class="nfs-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    <input type="text" class="nfs-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="nfs-param-unite">---</span></div>
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="nfs-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="nfs-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;">
                        <span style="color:#333;font-size:14px;line-height:1;">Not Required ?</span>
                    </label>
                    <button class="btn small purple nfs-param-btn" style="padding:8px 12px;font-size:13px;" data-param="HGB(CONCENTRATION EN HEMOGLOBINE)">➕</button>
                </div>

                <!-- HCT (HEMATOCRITE) -->
                <div data-nfs-param="HCT" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">HEMATOCRITE</div>
                    <div style="color:#ccc;">:</div>
                    <select class="nfs-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                         <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    <input type="text" class="nfs-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="nfs-param-unite">---</span></div>
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="nfs-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="nfs-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;">
                        <span style="color:#333;font-size:14px;line-height:1;">Not Required ?</span>
                    </label>
                    <button class="btn small purple nfs-param-btn" style="padding:8px 12px;font-size:13px;" data-param="HCT(HEMATOCRITE)">➕</button>
                </div>

                <!-- VGM -->
                <div data-nfs-param="VGM" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">VGM</div>
                    <div style="color:#ccc;">:</div>
                    <select class="nfs-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                         <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    <input type="text" class="nfs-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="nfs-param-unite">---</span></div>
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="nfs-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="nfs-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;">
                        <span style="color:#333;font-size:14px;line-height:1;">Not Required ?</span>
                    </label>
                    <button class="btn small purple nfs-param-btn" style="padding:8px 12px;font-size:13px;" data-param="VGM (VOLUME GLOBULAIRE MOYEN)">➕</button>
                </div>

                <!-- TCMH -->
                <div data-nfs-param="TCMH" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">TCMH</div>
                    <div style="color:#ccc;">:</div>
                    <select class="nfs-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                         <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    <input type="text" class="nfs-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="nfs-param-unite">---</span></div>
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="nfs-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="nfs-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;">
                        <span style="color:#333;font-size:14px;line-height:1;">Not Required ?</span>
                    </label>
                    <button class="btn small purple nfs-param-btn" style="padding:8px 12px;font-size:13px;" data-param="TCMH (TENEUR CORPUSCULAIRE MOYENNE EN HÉMOGLOBINE)">➕</button>
                </div>

                <!-- CCMH -->
                <div data-nfs-param="CCMH" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">CCMH</div>
                    <div style="color:#ccc;">:</div>
                    <select class="nfs-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    <input type="text" class="nfs-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="nfs-param-unite">---</span></div>
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="nfs-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="nfs-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;">
                        <span style="color:#333;font-size:14px;line-height:1;">Not Required ?</span>
                    </label>
                    <button class="btn small purple nfs-param-btn" style="padding:8px 12px;font-size:13px;" data-param="CCMH(CONCENTRATION CORPUSCULAIRE MOYENNE EN HÉMOGLOBINE)">➕</button>
                </div>

                <!-- RDW-SD -->
                <div data-nfs-param="RDW-SD" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">RDW-SD</div>
                    <div style="color:#ccc;">:</div>
                    <select class="nfs-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    <input type="text" class="nfs-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="nfs-param-unite">---</span></div>
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="nfs-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="nfs-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;">
                        <span style="color:#333;font-size:14px;line-height:1;">Not Required ?</span>
                    </label>
                    <button class="btn small purple nfs-param-btn" style="padding:8px 12px;font-size:13px;" data-param="RDW-SD (INDICE DE DISTRIBUTION ÉRYTHROCYTAIRE)">➕</button>
                </div>

                <!-- RDW-CV -->
                <div data-nfs-param="RDW-CV" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">RDW-CV</div>
                    <div style="color:#ccc;">:</div>
                    <select class="nfs-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    <input type="text" class="nfs-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="nfs-param-unite">---</span></div>
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="nfs-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="nfs-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;">
                        <span style="color:#333;font-size:14px;line-height:1;">Not Required ?</span>
                    </label>
                    <button class="btn small purple nfs-param-btn" style="padding:8px 12px;font-size:13px;" data-param="RDW-CV (INDICE DE DISTRIBUTION ÉRYTHROCYTAIRE)">➕</button>
                </div>

                <!-- PLT (PLAQUETTES) -->
                <div data-nfs-param="PLT" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">PLAQUETTES</div>
                    <div style="color:#ccc;">:</div>
                    <select class="nfs-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    <input type="text" class="nfs-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="nfs-param-unite">---</span></div>
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="nfs-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="nfs-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;">
                        <span style="color:#333;font-size:14px;line-height:1;">Not Required ?</span>
                    </label>
                    <button class="btn small purple nfs-param-btn" style="padding:8px 12px;font-size:13px;" data-param="PLT(PLAQUETTES)">➕</button>
                </div>

                <!-- MPV -->
                <div data-nfs-param="MPV" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">MPV</div>
                    <div style="color:#ccc;">:</div>
                    <select class="nfs-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    <input type="text" class="nfs-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="nfs-param-unite">---</span></div>
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="nfs-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="nfs-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;">
                        <span style="color:#333;font-size:14px;line-height:1;">Not Required ?</span>
                    </label>
                    <button class="btn small purple nfs-param-btn" style="padding:8px 12px;font-size:13px;" data-param="MPV (VOLUME PLAQUETTAIRE MOYEN)">➕</button>
                </div>

                <!-- PDW -->
                <div data-nfs-param="PDW" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">PDW</div>
                    <div style="color:#ccc;">:</div>
                    <select class="nfs-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    <input type="text" class="nfs-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="nfs-param-unite">---</span></div>
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="nfs-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="nfs-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;">
                        <span style="color:#333;font-size:14px;line-height:1;">Not Required ?</span>
                    </label>
                    <button class="btn small purple nfs-param-btn" style="padding:8px 12px;font-size:13px;" data-param="PDW (INDICE DE DISTRIBUTION DES PLAQUETTES)">➕</button>
                </div>

                <!-- PCT -->
                <div data-nfs-param="PCT" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">PCT</div>
                    <div style="color:#ccc;">:</div>
                    <select class="nfs-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    <input type="text" class="nfs-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="nfs-param-unite">---</span></div>
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="nfs-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="nfs-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;">
                        <span style="color:#333;font-size:14px;line-height:1;">Not Required ?</span>
                    </label>
                    <button class="btn small purple nfs-param-btn" style="padding:8px 12px;font-size:13px;" data-param="PCT (PLAQUETTOCRITE)">➕</button>
                </div>

                <!-- P-LCR -->
                <div data-nfs-param="P-LCR" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">P-LCR</div>
                    <div style="color:#ccc;">:</div>
                    <select class="nfs-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    <input type="text" class="nfs-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="nfs-param-unite">---</span></div>
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="nfs-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="nfs-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;">
                        <span style="color:#333;font-size:14px;line-height:1;">Not Required ?</span>
                    </label>
                    <button class="btn small purple nfs-param-btn" style="padding:8px 12px;font-size:13px;" data-param="P-LCR (PROPORTION DES GRANDES PLAQUETTES)">➕</button>
                </div>

                <!-- P-LCC -->
                <div data-nfs-param="P-LCC" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">P-LCC</div>
                    <div style="color:#ccc;">:</div>
                    <select class="nfs-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    <input type="text" class="nfs-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="nfs-param-unite">---</span></div>
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="nfs-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="nfs-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;">
                        <span style="color:#333;font-size:14px;line-height:1;">Not Required ?</span>
                    </label>
                    <button class="btn small purple nfs-param-btn" style="padding:8px 12px;font-size:13px;" data-param="P-LCC(COEFFICIENT DE GRANDES PLAQUETTES)">➕</button>
                </div>

                <!-- GB (GLOBULES BLANCS) -->
                <div data-nfs-param="GB" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">GLOBULES BLANCS</div>
                    <div style="color:#ccc;">:</div>
                    <select class="nfs-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    <input type="text" class="nfs-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="nfs-param-unite">---</span></div>
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="nfs-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="nfs-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;">
                        <span style="color:#333;font-size:14px;line-height:1;">Not Required ?</span>
                    </label>
                    <button class="btn small purple nfs-param-btn" style="padding:8px 12px;font-size:13px;" data-param="GB NUMERATION LEUCOCYTAIRE(GLOBULES BLANCS)">➕</button>
                </div>

                <!-- NEUT% -->
                <div data-nfs-param="NEUT%" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">NEUTROPHILES</div>
                    <div style="color:#ccc;">:</div>
                    <select class="nfs-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    <input type="text" class="nfs-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="nfs-param-unite">---</span></div>
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="nfs-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="nfs-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;">
                        <span style="color:#333;font-size:14px;line-height:1;">Not Required ?</span>
                    </label>
                    <button class="btn small purple nfs-param-btn" style="padding:8px 12px;font-size:13px;" data-param="NEUT% (POURCENTAGE DE NEUTROPHILES)">➕</button>
                </div>

                <!-- LYMPH% -->
                <div data-nfs-param="LYMPH%" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">LYMPHOCYTE</div>
                    <div style="color:#ccc;">:</div>
                    <select class="nfs-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    <input type="text" class="nfs-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="nfs-param-unite">---</span></div>
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="nfs-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="nfs-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;">
                        <span style="color:#333;font-size:14px;line-height:1;">Not Required ?</span>
                    </label>
                    <button class="btn small purple nfs-param-btn" style="padding:8px 12px;font-size:13px;" data-param="LYMPH% (POURCENTAGE DE LYMPHOCYTE)">➕</button>
                </div>

                <!-- MONO% -->
                <div data-nfs-param="MONO%" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">MONOCYTES</div>
                    <div style="color:#ccc;">:</div>
                    <select class="nfs-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    <input type="text" class="nfs-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="nfs-param-unite">---</span></div>
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="nfs-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="nfs-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;">
                        <span style="color:#333;font-size:14px;line-height:1;">Not Required ?</span>
                    </label>
                    <button class="btn small purple nfs-param-btn" style="padding:8px 12px;font-size:13px;" data-param="MONO% (POURCENTAGE DE MONOCYTES)">➕</button>
                </div>

                <!-- EOS% -->
                <div data-nfs-param="EOS%" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">EOSINOPHILES</div>
                    <div style="color:#ccc;">:</div>
                    <select class="nfs-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    <input type="text" class="nfs-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="nfs-param-unite">---</span></div>
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="nfs-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="nfs-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;">
                        <span style="color:#333;font-size:14px;line-height:1;">Not Required ?</span>
                    </label>
                    <button class="btn small purple nfs-param-btn" style="padding:8px 12px;font-size:13px;" data-param="EOS% (POURCENTAGE D'EOSINOPHILES)">➕</button>
                </div>

                <!-- BASO% -->
                <div data-nfs-param="BASO%" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">BASOPHILES</div>
                    <div style="color:#ccc;">:</div>
                    <select class="nfs-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    <input type="text" class="nfs-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="nfs-param-unite">---</span></div>
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="nfs-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="nfs-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;">
                        <span style="color:#333;font-size:14px;line-height:1;">Not Required ?</span>
                    </label>
                    <button class="btn small purple nfs-param-btn" style="padding:8px 12px;font-size:13px;" data-param="BASO% (POURCENTAGE DE BASOPHILES)">➕</button>
                </div>

                <!-- Total des leucocytes (calcul automatique) -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#e3f2fd;border-radius:4px;border:2px solid #2196f3;margin-top:8px;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;color:#1976d2;">📊 TOTAL LEUCOCYTES</div>
                    <div style="color:#ccc;">:</div>
                    <div id="nfs-leucocyte-total" style="font-weight:600;font-size:16px;color:#4caf50;min-width:120px;text-align:center;padding:4px 8px;background:#fff;border-radius:4px;border:1px solid #ddd;">
                        Total: 0.0%
                    </div>
                    <div style="font-size:13px;color:#666;margin-left:10px;">Vérification que le total ne dépasse pas 100%</div>
                </div>
            </div>
            
            <!-- Section Commentaires avec Pièces jointes -->
            <div style="margin-top:20px;">
                <label style="display:block;font-weight:600;margin-bottom:10px;font-size:15px;color:#333;">Commentaires :</label>
                <div style="position:relative;">
                    <textarea id="nfsCommentsInput" placeholder="Entrez vos commentaires ici..." style="width:100%;min-height:90px;padding:12px;padding-top:40px;border:2px dashed #999;border-radius:6px;font-size:14px;font-family:Arial,sans-serif;resize:vertical;box-sizing:border-box;background:#f9f9f9;color:#666;"></textarea>
                    <button id="nfsAttachmentBtn" class="btn small purple" style="position:absolute;top:8px;left:8px;padding:6px 10px;font-size:12px;white-space:nowrap;height:auto;">📎</button>
                </div>
                
                <!-- Input file caché -->
                <input type="file" id="nfsAttachmentInput" multiple style="display:none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt">
                
                <!-- Liste des fichiers attachés -->
                <div id="nfsAttachmentList" style="margin-top:12px;">
                    <!-- Les fichiers sélectionnés apparaîtront ici -->
                </div>
            </div>
        </div>
        
        <div class="modal-actions" style="display:flex;justify-content:flex-end;gap:18px;padding:24px;border-top:1px solid var(--border);background:transparent;">
            <button id="nfsCancel" class="btn muted" style="padding:10px 32px;font-size:16px;">Annuler</button>
            <button id="nfsSubmit" class="btn muted" style="padding:10px 32px;font-size:16px;">Enregistrer</button> 
            <button id="nfsVerify" class="btn muted" style="padding:10px 32px;font-size:16px;">Vérifier</button>
        </div>
    </div>
</div>

<!-- Modal générique pour NUMERATIONS ET FORMULES LEUCOCYTAIRES (NFL) -->
<div class="modal" id="nflModal" aria-hidden="true" style="z-index:101000;">
    <div class="modal-dialog" id="nflDialog" style="width:96%;max-width:1200px;padding:36px;">
        <h3 id="nflTitle" style="font-size:28px;margin-bottom:3px;font-weight:600;">Numerations et Formules Leucocytaires (NFL) - Saisir Résultats</h3>
        
        <div class="modal-body" id="nflBody" style="padding:30px;font-size:17px;">
            <!-- Patient summary sera inséré ici -->
            <div id="nflPatientSummary" style="margin-bottom:20px;"></div>
            
            <!-- Formulaire avec 6 paramètres en lignes -->
            <div style="display:flex;flex-direction:column;gap:12px;">
                <!-- GB NUMERATION LEUCOCYTAIRE -->
                <div data-nfl-param="GB" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">GLOBULES BLANCS</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Flag dropdown -->
                    <select class="nfl-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    
                    <!-- Résultat input -->
                    <input type="text" class="nfl-param-valeur" placeholder="Valeur"
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="nfl-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="nfl-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="nfl-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple nfl-param-btn" style="padding:8px 12px;font-size:13px;" data-param="GB NUMERATION LEUCOCYTAIRE(GLOBULES BLANCS)">➕</button>
                </div>

                <!-- NEUT% -->
                <div data-nfl-param="NEUT%" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">NEUTROPHILES</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Flag dropdown -->
                    <select class="nfl-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    
                    <!-- Résultat input -->
                    <input type="text" class="nfl-param-valeur" placeholder="Valeur"
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="nfl-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="nfl-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="nfl-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple nfl-param-btn" style="padding:8px 12px;font-size:13px;" data-param="NEUT% (POURCENTAGE DE NEUTROPHILES)">➕</button>
                </div>

                <!-- LYMPH% -->
                <div data-nfl-param="LYMPH%" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">LYMPHOCYTES</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Flag dropdown -->
                    <select class="nfl-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    
                    <!-- Résultat input -->
                    <input type="text" class="nfl-param-valeur" placeholder="Valeur"
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="nfl-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="nfl-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="nfl-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple nfl-param-btn" style="padding:8px 12px;font-size:13px;" data-param="LYMPH% (POURCENTAGE DE LYMPHOCYTE)">➕</button>
                </div>

                <!-- MONO% -->
                <div data-nfl-param="MONO%" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">MONOCYTES</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Flag dropdown -->
                    <select class="nfl-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    
                    <!-- Résultat input -->
                    <input type="text" class="nfl-param-valeur" placeholder="Valeur"
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="nfl-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="nfl-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="nfl-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple nfl-param-btn" style="padding:8px 12px;font-size:13px;" data-param="MONO% (POURCENTAGE DE MONOCYTES)">➕</button>
                </div>

                <!-- EOS% -->
                <div data-nfl-param="EOS%" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">EOSINOPHILES</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Flag dropdown -->
                    <select class="nfl-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    
                    <!-- Résultat input -->
                    <input type="text" class="nfl-param-valeur" placeholder="Valeur"
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="nfl-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="nfl-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="nfl-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple nfl-param-btn" style="padding:8px 12px;font-size:13px;" data-param="EOS% (POURCENTAGE D'EOSINOPHILES)">➕</button>
                </div>

                <!-- BASO% -->
                <div data-nfl-param="BASO%" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">BASOPHILES</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Flag dropdown -->
                    <select class="nfl-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    
                    <!-- Résultat input -->
                    <input type="text" class="nfl-param-valeur" placeholder="Valeur"
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="nfl-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="nfl-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="nfl-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple nfl-param-btn" style="padding:8px 12px;font-size:13px;" data-param="BASO% (POURCENTAGE DE BASOPHILES)">➕</button>
                </div>

                <!-- Total des leucocytes (vérification) -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#e3f2fd;border-radius:4px;border:2px solid #2196f3;margin-top:8px;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;color:#1976d2;">📊 TOTAL LEUCOCYTES</div>
                    <div style="color:#ccc;">:</div>
                    <div id="nfl-leucocyte-total" style="font-weight:600;font-size:16px;color:#4caf50;min-width:120px;text-align:center;padding:4px 8px;background:#fff;border-radius:4px;border:1px solid #ddd;">
                        Total: 0.0%
                    </div>
                    <div style="font-size:13px;color:#666;margin-left:10px;">Vérification que le total ne dépasse pas 100%</div>
                </div>
            </div>
            
            <!-- Section Commentaires avec Pièces jointes -->
            <div style="margin-top:20px;">
                <label style="display:block;font-weight:600;margin-bottom:10px;font-size:15px;color:#333;">Commentaires :</label>
                <div style="position:relative;">
                    <textarea id="nflCommentsInput" placeholder="Entrez vos commentaires ici..." style="width:100%;min-height:90px;padding:12px;padding-top:40px;border:2px dashed #999;border-radius:6px;font-size:14px;font-family:Arial,sans-serif;resize:vertical;box-sizing:border-box;background:#f9f9f9;color:#666;"></textarea>
                    <button id="nflAttachmentBtn" class="btn small purple" style="position:absolute;top:8px;left:8px;padding:6px 10px;font-size:12px;white-space:nowrap;height:auto;">📎</button>
                </div>
                
                <!-- Input file caché -->
                <input type="file" id="nflAttachmentInput" multiple style="display:none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt">
                
                <!-- Liste des fichiers attachés -->
                <div id="nflAttachmentList" style="margin-top:12px;">
                    <!-- Les fichiers sélectionnés apparaîtront ici -->
                </div>
            </div>
        </div>
        
        <div class="modal-actions" style="display:flex;justify-content:flex-end;gap:18px;padding:24px;border-top:1px solid var(--border);background:transparent;">
            <button id="nflCancel" class="btn muted" style="padding:10px 32px;font-size:16px;">Annuler</button>
            <button id="nflSubmit" class="btn muted" style="padding:10px 32px;font-size:16px;">Enregistrer</button> 
            <button id="nflVerify" class="btn muted" style="padding:10px 32px;font-size:16px;">Vérifier</button>
        </div>
    </div>
</div>

<!-- Modal générique pour RETICULOCYTE -->
<div class="modal" id="reticulocyteModal" aria-hidden="true" style="z-index:101000;">
    <div class="modal-dialog" id="reticulocyteDialog" style="width:96%;max-width:1200px;padding:36px;">
        <h3 id="reticulocyteTitle" style="font-size:28px;margin-bottom:3px;font-weight:600;">Reticulocyte - Saisir Résultats</h3>
        
        <div class="modal-body" id="reticulocyteBody" style="padding:30px;font-size:17px;">
            <!-- Patient summary sera inséré ici -->
            <div id="reticulocytePatientSummary" style="margin-bottom:20px;"></div>
            
            <!-- Formulaire avec 5 paramètres en lignes -->
            <div style="display:flex;flex-direction:column;gap:12px;">
                <!-- RET% -->
                <div data-reticulocyte-param="RET% (POURCENTAGE DE RETICULOCYTES)" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">RET%</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Flag dropdown -->
                    <select class="reticulocyte-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    
                    <!-- Résultat input -->
                    <input type="text" class="reticulocyte-param-valeur" placeholder="Valeur"
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="reticulocyte-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="reticulocyte-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="reticulocyte-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple reticulocyte-param-btn" style="padding:8px 12px;font-size:13px;" data-param="RET% (POURCENTAGE DE RETICULOCYTES)">➕</button>
                </div>

                <!-- RET# -->
                <div data-reticulocyte-param="RET# (NUMERATION DES RETICULOCYTES)" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">RET#</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Flag dropdown -->
                    <select class="reticulocyte-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    
                    <!-- Résultat input -->
                    <input type="text" class="reticulocyte-param-valeur" placeholder="Valeur"
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="reticulocyte-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="reticulocyte-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="reticulocyte-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple reticulocyte-param-btn" style="padding:8px 12px;font-size:13px;" data-param="RET# (NUMERATION DES RETICULOCYTES)">➕</button>
                </div>

                <!-- IRF -->
                <div data-reticulocyte-param="IRF (FRACTION DE RETICULOCYTES IMMATURES)" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">IRF</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Flag dropdown -->
                    <select class="reticulocyte-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    
                    <!-- Résultat input -->
                    <input type="text" class="reticulocyte-param-valeur" placeholder="Valeur"
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="reticulocyte-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="reticulocyte-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="reticulocyte-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple reticulocyte-param-btn" style="padding:8px 12px;font-size:13px;" data-param="IRF (FRACTION DE RETICULOCYTES IMMATURES)">➕</button>
                </div>

                <!-- RET-HE -->
                <div data-reticulocyte-param="RET-HE (EQUIVALENT DE LA CONCENTRATION EN HEMOGLOBINE DES RETICULOCYTES)" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">RET-HE</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Flag dropdown -->
                    <select class="reticulocyte-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    
                    <!-- Résultat input -->
                    <input type="text" class="reticulocyte-param-valeur" placeholder="Valeur"
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="reticulocyte-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="reticulocyte-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="reticulocyte-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple reticulocyte-param-btn" style="padding:8px 12px;font-size:13px;" data-param="RET-HE (EQUIVALENT DE LA CONCENTRATION EN HEMOGLOBINE DES RETICULOCYTES)">➕</button>
                </div>

                <!-- RBC-HE -->
                <div data-reticulocyte-param="RBC-HE (EQUIVALENCE EN HEMOGLOBINE DES RBC MATURE)" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">RBC-HE</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Flag dropdown -->
                    <select class="reticulocyte-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    
                    <!-- Résultat input -->
                    <input type="text" class="reticulocyte-param-valeur" placeholder="Valeur"
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="reticulocyte-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="reticulocyte-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="reticulocyte-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple reticulocyte-param-btn" style="padding:8px 12px;font-size:13px;" data-param="RBC-HE (EQUIVALENCE EN HEMOGLOBINE DES RBC MATURE)">➕</button>
                </div>
            </div>
            
            <!-- Section Commentaires avec Pièces jointes -->
            <div style="margin-top:20px;">
                <label style="display:block;font-weight:600;margin-bottom:10px;font-size:15px;color:#333;">Commentaires :</label>
                <div style="position:relative;">
                    <textarea id="reticulocyteCommentsInput" placeholder="Entrez vos commentaires ici..." style="width:100%;min-height:90px;padding:12px;padding-top:40px;border:2px dashed #999;border-radius:6px;font-size:14px;font-family:Arial,sans-serif;resize:vertical;box-sizing:border-box;background:#f9f9f9;color:#666;"></textarea>
                    <button id="reticulocyteAttachmentBtn" class="btn small purple" style="position:absolute;top:8px;left:8px;padding:6px 10px;font-size:12px;white-space:nowrap;height:auto;">📎</button>
                </div>
                
                <!-- Input file caché -->
                <input type="file" id="reticulocyteAttachmentInput" multiple style="display:none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt">
                
                <!-- Liste des fichiers attachés -->
                <div id="reticulocyteAttachmentList" style="margin-top:12px;">
                    <!-- Les fichiers sélectionnés apparaîtront ici -->
                </div>
            </div>
        </div>
        
        <div class="modal-actions" style="display:flex;justify-content:flex-end;gap:18px;padding:24px;border-top:1px solid var(--border);background:transparent;">
            <button id="reticulocyteCancel" class="btn muted" style="padding:10px 32px;font-size:16px;">Annuler</button>
            <button id="reticulocyteSubmit" class="btn muted" style="padding:10px 32px;font-size:16px;">Enregistrer</button> 
            <button id="reticulocyteVerify" class="btn muted" style="padding:10px 32px;font-size:16px;">Vérifier</button>
        </div>
    </div>
</div>

<!-- Modal HB_HCT - HEMOGLOBINE ET HEMATOCRITE -->
<div class="modal" id="hbHctModal" aria-hidden="true" style="z-index:101000;">
    <div class="modal-dialog" id="hbHctDialog" style="width:96%;max-width:1200px;padding:36px;">
        <h3 id="hbHctTitle" style="font-size:28px;margin-bottom:3px;font-weight:600;">Hemoglobine et Hematocrite (HB_HCT) - Saisir Résultats</h3>
        
        <div class="modal-body" id="hbHctBody" style="padding:30px;font-size:17px;">
            <!-- Patient summary sera inséré ici -->
            <div id="hbHctPatientSummary" style="margin-bottom:20px;"></div>
            
            <!-- Formulaire avec 2 paramètres en lignes -->
            <div style="display:flex;flex-direction:column;gap:12px;">
                <!-- HEMOGLOBINE -->
                <div data-hb-hct-param="HEMOGLOBINE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">HEMOGLOBINE</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Flag dropdown -->
                    <select class="hb-hct-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    
                    <!-- Résultat input -->
                    <input type="text" class="hb-hct-param-valeur" placeholder="Valeur"
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="hb-hct-param-unite">g/dL</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="hb-hct-param-range">(13.5-17.5)</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="hb-hct-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple hb-hct-param-btn" style="padding:8px 12px;font-size:13px;" data-param="HEMOGLOBINE">➕</button>
                </div>

                <!-- HEMATOCRITE -->
                <div data-hb-hct-param="HEMATOCRITE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">HEMATOCRITE</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Flag dropdown -->
                    <select class="hb-hct-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    
                    <!-- Résultat input -->
                    <input type="text" class="hb-hct-param-valeur" placeholder="Valeur"
                        style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;" required>
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="hb-hct-param-unite">%</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="hb-hct-param-range">(40-54)</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="hb-hct-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple hb-hct-param-btn" style="padding:8px 12px;font-size:13px;" data-param="HEMATOCRITE">➕</button>
                </div>
            </div>
            
            <!-- Section Commentaires avec Pièces jointes -->
            <div style="margin-top:20px;">
                <label style="display:block;font-weight:600;margin-bottom:10px;font-size:15px;color:#333;">Commentaires :</label>
                <div style="position:relative;">
                    <textarea id="hbHctCommentsInput" placeholder="Entrez vos commentaires ici..." style="width:100%;min-height:90px;padding:12px;padding-top:40px;border:2px dashed #999;border-radius:6px;font-size:14px;font-family:Arial,sans-serif;resize:vertical;box-sizing:border-box;background:#f9f9f9;color:#666;"></textarea>
                    <button id="hbHctAttachmentBtn" class="btn small purple" style="position:absolute;top:8px;left:8px;padding:6px 10px;font-size:12px;white-space:nowrap;height:auto;">📎</button>
                </div>
                
                <!-- Input file caché -->
                <input type="file" id="hbHctAttachmentInput" multiple style="display:none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt">
                
                <!-- Liste des fichiers attachés -->
                <div id="hbHctAttachmentList" style="margin-top:12px;">
                    <!-- Les fichiers sélectionnés apparaîtront ici -->
                </div>
            </div>
        </div>
        
        <div class="modal-actions" style="display:flex;justify-content:flex-end;gap:18px;padding:24px;border-top:1px solid var(--border);background:transparent;">
            <button id="hbHctCancel" class="btn muted" style="padding:10px 32px;font-size:16px;">Annuler</button>
            <button id="hbHctSubmit" class="btn muted" style="padding:10px 32px;font-size:16px;">Enregistrer</button> 
            <button id="hbHctVerify" class="btn muted" style="padding:10px 32px;font-size:16px;">Vérifier</button>
        </div>
    </div>
</div>

<!-- Modal générique pour formulaires d'examens HEMATOLOGIE -->
<div class="modal" id="hematologieFormModal" aria-hidden="true" style="z-index:101000;">
    <div class="modal-dialog" id="hematologieFormDialog" style="width:96%;max-width:1200px;padding:36px;">
        <h3 id="hematologieFormTitle" style="font-size:28px;margin-bottom:3px;font-weight:600;">Saisir Résultat</h3>
        
        <div class="modal-body" id="hematologieFormBody" style="padding:30px;font-size:17px;">
            <!-- Patient summary sera inséré ici -->
            <div id="hematologieFormPatientSummary" style="margin-bottom:20px;"></div>
            
            <!-- Formulaire horizontal sur une seule ligne -->
            <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                <!-- Nom examen -->
                <div style="font-weight:600;min-width:120px;font-size:15px;">
                    <span id="examParamName">---</span>
                </div>
                
                <!-- Séparateur -->
                <div style="color:#ccc;">:</div>
                
                <!-- Flag dropdown (more compact) -->
                <select id="examFlagSelect" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;" required>
                    <option value="">---</option>
                    <option value="B">B</option>
                    <option value="H">H</option>
                    <option value="L">L</option>
                </select>
                
                <!-- Resultats input -->
                <input type="text" id="examResultInput" 
                    style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;"
                    placeholder="Valeur" required>
                
                <!-- Unité -->
                <div style="min-width:60px;color:#555;font-size:14px;">
                    <span id="examUniteText">---</span>
                </div>
                
                <!-- Range usuelle -->
                <div style="min-width:80px;color:#555;font-size:14px;">
                    <span id="examRangeText">---</span>
                </div>
                
                <!-- Checkbox Not Required (checkbox at left, label to right) -->
                <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                    <input type="checkbox" id="examNotRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                    <span style="color:#333;font-size:14px;line-height:1;display:inline-block;transform:translateY(-1px);">Not Required ?</span>
                </label>
                
                <!-- Bouton ajouter -->
                <button class="btn small purple" style="padding:8px 12px;font-size:13px;">➕</button>
            </div>
            
            <!-- Info specimen et unite (optionnel, peut être caché) -->
            <div style="background:#f0f0f0;padding:12px;border-radius:4px;margin-top:15px;font-size:14px;color:#666;display:none;">
                <div><strong>Specimen:</strong> <span id="examSpecimenText">---</span></div>
                <div><strong>Unité (info):</strong> <span id="examUniteInfo">---</span></div>
            </div>
            
            <!-- Section Commentaires avec Pièces jointes -->
            <div style="margin-top:20px;">
                <label style="display:block;font-weight:600;margin-bottom:10px;font-size:15px;color:#333;">Commentaires :</label>
                <div style="position:relative;">
                    <textarea id="examCommentsInput" placeholder="Entrez vos commentaires ici..." style="width:100%;min-height:90px;padding:12px;padding-top:40px;border:2px dashed #999;border-radius:6px;font-size:14px;font-family:Arial,sans-serif;resize:vertical;box-sizing:border-box;background:#f9f9f9;color:#666;"></textarea>
                    <button id="attachmentBtn" class="btn small purple" style="position:absolute;top:8px;left:8px;padding:6px 10px;font-size:12px;white-space:nowrap;height:auto;">📎</button>
                </div>
                
                <!-- Input file caché -->
                <input type="file" id="examAttachmentInput" multiple style="display:none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt">
                
                <!-- Liste des fichiers attachés -->
                <div id="attachmentList" style="margin-top:12px;">
                    <!-- Les fichiers sélectionnés apparaîtront ici -->
                </div>
            </div>
        </div>
        
        <div class="modal-actions" style="display:flex;justify-content:flex-end;gap:18px;padding:24px;border-top:1px solid var(--border);background:transparent;">
            <button id="examFormCancel" class="btn muted" style="padding:10px 32px;font-size:16px;">Annuler</button>
            <button id="examFormSubmit" class="btn muted" style="padding:10px 32px;font-size:16px;">Enregistrer</button> 
            <button id="examFormVerify" class="btn muted" style="padding:10px 32px;font-size:16px;">Vérifier</button>
        </div>
    </div>
</div>
<!-- Modal spécifique pour SPERMOGRAMME -->
<div class="modal" id="spermogrammeModal" aria-hidden="true" style="z-index:101000;">
    <div class="modal-dialog" id="spermogrammeDialog" style="width:96%;max-width:1400px;padding:36px;">
        <h3 id="spermogrammeTitle" style="font-size:28px;margin-bottom:3px;font-weight:600;">Saisir Résultat</h3>
        
        <div class="modal-body" id="spermogrammeBody" style="padding:30px;font-size:17px;">
            <!-- Patient summary sera inséré ici -->
            <div id="spermogrammePatientSummary" style="margin-bottom:20px;"></div>
            
            <!-- Formulaire avec paramètres -->
            <div style="display:flex;flex-direction:column;gap:12px;">
                <!-- PERIODE D'ABSTINANCE -->
                <div data-spermogramme-param="PERIODE D'ABSTINANCE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:200px;font-size:15px;">PERIODE D'ABSTINANCE</div>
                    <div style="color:#ccc;">:</div>
                    <input type="text" class="spermogramme-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="spermogramme-param-unite">---</span></div>
                    <div style="min-width:100px;color:#555;font-size:14px;"><span class="spermogramme-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="spermogramme-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple spermogramme-param-btn" style="padding:8px 12px;font-size:13px;" data-param="PERIODE D'ABSTINANCE">➕</button>
                </div>

                <!-- METHODE DE COLLECTION -->
                <div data-spermogramme-param="METHODE DE COLLECTION" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:200px;font-size:15px;">METHODE DE COLLECTION</div>
                    <div style="color:#ccc;">:</div>
                    <input type="text" class="spermogramme-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="spermogramme-param-unite">---</span></div>
                    <div style="min-width:100px;color:#555;font-size:14px;"><span class="spermogramme-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="spermogramme-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple spermogramme-param-btn" style="padding:8px 12px;font-size:13px;" data-param="METHODE DE COLLECTION">➕</button>
                </div>

                <!-- COLLECTE A -->
                <div data-spermogramme-param="COLLECTE A" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:200px;font-size:15px;">COLLECTE A</div>
                    <div style="color:#ccc;">:</div>
                    <input type="text" class="spermogramme-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="spermogramme-param-unite">---</span></div>
                    <div style="min-width:100px;color:#555;font-size:14px;"><span class="spermogramme-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="spermogramme-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple spermogramme-param-btn" style="padding:8px 12px;font-size:13px;" data-param="COLLECTE A">➕</button>
                </div>

                <!-- SPECIMEN COMPLET -->
                <div data-spermogramme-param="SPECIMEN COMPLET" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:200px;font-size:15px;">QUANTITE COMPLETE ? </div>
                    <div style="color:#ccc;">:</div>
                    <select class="spermogramme-param-valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                        <option value="">-- Sélectionner --</option>
                            <option value="quantité incomplète">quantité incomplète</option>
                            <option value="quantité directe">quantité complète</option>
                            <option value="Autre">Autre</option>
                    </select>
                    <input type="text" class="spermogramme-param-autres" placeholder="Préciser autres..." style="display:none;margin-left:8px;padding:5px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="spermogramme-param-unite">---</span></div>
                    <div style="min-width:100px;color:#555;font-size:14px;"><span class="spermogramme-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="spermogramme-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple spermogramme-param-btn" style="padding:8px 12px;font-size:13px;" data-param="SPECIMEN COMPLET">➕</button>
                </div>

                <!-- TEMPS DE COLLECTION -->
                <div data-spermogramme-param="TEMPS DE COLLECTION" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:200px;font-size:15px;">TEMPS DE COLLECTION</div>
                    <div style="color:#ccc;">:</div>
                    <input type="text" class="spermogramme-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="spermogramme-param-unite">---</span></div>
                    <div style="min-width:100px;color:#555;font-size:14px;"><span class="spermogramme-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="spermogramme-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple spermogramme-param-btn" style="padding:8px 12px;font-size:13px;" data-param="TEMPS DE COLLECTION">➕</button>
                </div>

                <!-- TEMPS DE RECEPTION -->
                <div data-spermogramme-param="TEMPS DE RECEPTION" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:200px;font-size:15px;">TEMPS DE RECEPTION</div>
                    <div style="color:#ccc;">:</div>
                    <input type="text" class="spermogramme-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="spermogramme-param-unite">---</span></div>
                    <div style="min-width:100px;color:#555;font-size:14px;"><span class="spermogramme-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="spermogramme-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple spermogramme-param-btn" style="padding:8px 12px;font-size:13px;" data-param="TEMPS DE RECEPTION">➕</button>
                </div>

                <!-- TEMPS D'EXAMINATION -->
                <div data-spermogramme-param="TEMPS D'EXAMINATION" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:200px;font-size:15px;">TEMPS D'EXAMINATION</div>
                    <div style="color:#ccc;">:</div>
                    <input type="text" class="spermogramme-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="spermogramme-param-unite">---</span></div>
                    <div style="min-width:100px;color:#555;font-size:14px;"><span class="spermogramme-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="spermogramme-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple spermogramme-param-btn" style="padding:8px 12px;font-size:13px;" data-param="TEMPS D'EXAMINATION">➕</button>
                </div>

                <!-- COULEUR -->
                <div data-spermogramme-param="COULEUR" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:200px;font-size:15px;">COULEUR</div>
                    <div style="color:#ccc;">:</div>
                    <select class="spermogramme-param-valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                        <option value="">-- Sélectionner --</option>
                        <option value="Blanche grisâtre">Blanche grisâtre</option>
                        <option value="Blanche Jaunâtre">Blanche Jaunâtre</option>
                        <option value="Blanche rougeâtre">Blanche rougeâtre</option>
                        <option value="Transparent">Transparent</option>
                        <option value="Jaunâtre">Jaunâtre</option>
                        <option value="Rougeâtre">Rougeâtre</option>
                        <option value="Autre">Autre</option>
                    </select>
                    <input type="text" class="spermogramme-param-autres" placeholder="Préciser autres..." style="display:none;margin-left:8px;padding:5px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="spermogramme-param-unite">---</span></div>
                    <div style="min-width:100px;color:#555;font-size:14px;"><span class="spermogramme-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="spermogramme-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple spermogramme-param-btn" style="padding:8px 12px;font-size:13px;" data-param="COULEUR">➕</button>
                </div>

                <!-- VISCOSITÉ -->
                <div data-spermogramme-param="VISCOSITÉ" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:200px;font-size:15px;">VISCOSITÉ</div>
                    <div style="color:#ccc;">:</div>
                    <select class="spermogramme-param-valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                        <option value="">-- Sélectionner --</option>
                        <option value="Normale">Normale</option>
                        <option value="Anormale">Anormale</option>
                        <option value="Autre">Autre</option>
                    </select>
                    <input type="text" class="spermogramme-param-autres" placeholder="Préciser autres..." style="display:none;margin-left:8px;padding:5px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="spermogramme-param-unite">---</span></div>
                    <div style="min-width:100px;color:#555;font-size:14px;"><span class="spermogramme-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="spermogramme-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple spermogramme-param-btn" style="padding:8px 12px;font-size:13px;" data-param="VISCOSITÉ">➕</button>
                </div>

                <!-- VOLUME COLLECTE -->
                <div data-spermogramme-param="VOLUME COLLECTE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:200px;font-size:15px;">VOLUME COLLECTE</div>
                    <div style="color:#ccc;">:</div>
                    <input type="text" class="spermogramme-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="spermogramme-param-unite">---</span></div>
                    <div style="min-width:100px;color:#555;font-size:14px;"><span class="spermogramme-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="spermogramme-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple spermogramme-param-btn" style="padding:8px 12px;font-size:13px;" data-param="VOLUME COLLECTE">➕</button>
                </div>

                <!-- PH -->
                <div data-spermogramme-param="PH" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:200px;font-size:15px;">PH</div>
                    <div style="color:#ccc;">:</div>
                    <input type="text" class="spermogramme-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="spermogramme-param-unite">---</span></div>
                    <div style="min-width:100px;color:#555;font-size:14px;"><span class="spermogramme-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="spermogramme-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple spermogramme-param-btn" style="padding:8px 12px;font-size:13px;" data-param="PH">➕</button>
                </div>

                <!-- FRUCTOSE -->
                <div data-spermogramme-param="FRUCTOSE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:200px;font-size:15px;">FRUCTOSE</div>
                    <div style="color:#ccc;">:</div>
                    <input type="text" class="spermogramme-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="spermogramme-param-unite">---</span></div>
                    <div style="min-width:100px;color:#555;font-size:14px;"><span class="spermogramme-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="spermogramme-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple spermogramme-param-btn" style="padding:8px 12px;font-size:13px;" data-param="FRUCTOSE">➕</button>
                </div>

                <!-- LIQUEFACTION -->
                <div data-spermogramme-param="LIQUEFACTION" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:200px;font-size:15px;">LIQUEFACTION</div>
                    <div style="color:#ccc;">:</div>
                    <input type="text" class="spermogramme-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="spermogramme-param-unite">---</span></div>
                    <div style="min-width:100px;color:#555;font-size:14px;"><span class="spermogramme-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="spermogramme-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple spermogramme-param-btn" style="padding:8px 12px;font-size:13px;" data-param="LIQUEFACTION">➕</button>
                </div>

                <!-- CONCENTRATION DE SPERME -->
                <div data-spermogramme-param="CONCENTRATION DE SPERME" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:200px;font-size:15px;">CONCENTRATION DE SPERME</div>
                    <div style="color:#ccc;">:</div>
                    <input type="text" class="spermogramme-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="spermogramme-param-unite">---</span></div>
                    <div style="min-width:100px;color:#555;font-size:14px;"><span class="spermogramme-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="spermogramme-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple spermogramme-param-btn" style="padding:8px 12px;font-size:13px;" data-param="CONCENTRATION DE SPERME">➕</button>
                </div>

                <!-- NUMERATION DES SPERMATOZOIDES -->
                <div data-spermogramme-param="NUMERATION DES SPERMATOZOIDES" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:200px;font-size:15px;">NUMERATION DES SPERMATOZOIDES</div>
                    <div style="color:#ccc;">:</div>
                    <input type="text" class="spermogramme-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="spermogramme-param-unite">---</span></div>
                    <div style="min-width:100px;color:#555;font-size:14px;"><span class="spermogramme-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="spermogramme-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple spermogramme-param-btn" style="padding:8px 12px;font-size:13px;" data-param="NUMERATION DES SPERMATOZOIDES">➕</button>
                </div>

                <!-- MOBILITE TOTALE -->
                <div data-spermogramme-param="MOBILITE TOTALE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:200px;font-size:15px;">MOBILITE TOTALE</div>
                    <div style="color:#ccc;">:</div>
                    <input type="text" class="spermogramme-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="spermogramme-param-unite">---</span></div>
                    <div style="min-width:100px;color:#555;font-size:14px;"><span class="spermogramme-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="spermogramme-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple spermogramme-param-btn" style="padding:8px 12px;font-size:13px;" data-param="MOBILITE TOTALE">➕</button>
                </div>

                <!-- IMMOBILE -->
                <div data-spermogramme-param="IMMOBILE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:200px;font-size:15px;">IMMOBILE</div>
                    <div style="color:#ccc;">:</div>
                    <input type="text" class="spermogramme-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="spermogramme-param-unite">---</span></div>
                    <div style="min-width:100px;color:#555;font-size:14px;"><span class="spermogramme-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="spermogramme-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple spermogramme-param-btn" style="padding:8px 12px;font-size:13px;" data-param="IMMOBILE">➕</button>
                </div>

                <!-- MOBILITE PROGRESSIVE -->
                <div data-spermogramme-param="MOBILITE PROGRESSIVE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:200px;font-size:15px;">MOBILITE PROGRESSIVE</div>
                    <div style="color:#ccc;">:</div>
                    <input type="text" class="spermogramme-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="spermogramme-param-unite">---</span></div>
                    <div style="min-width:100px;color:#555;font-size:14px;"><span class="spermogramme-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="spermogramme-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple spermogramme-param-btn" style="padding:8px 12px;font-size:13px;" data-param="MOBILITE PROGRESSIVE">➕</button>
                </div>

                <!-- MOBILITE NON PROGRESSIVE -->
                <div data-spermogramme-param="MOBILITE NON PROGRESSIVE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:200px;font-size:15px;">MOBILITE NON PROGRESSIVE</div>
                    <div style="color:#ccc;">:</div>
                    <input type="text" class="spermogramme-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="spermogramme-param-unite">---</span></div>
                    <div style="min-width:100px;color:#555;font-size:14px;"><span class="spermogramme-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="spermogramme-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple spermogramme-param-btn" style="padding:8px 12px;font-size:13px;" data-param="MOBILITE NON PROGRESSIVE">➕</button>
                </div>

                <!-- VIABILITE -->
                <div data-spermogramme-param="VIABILITE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:200px;font-size:15px;">VIABILITE</div>
                    <div style="color:#ccc;">:</div>
                    <input type="text" class="spermogramme-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="spermogramme-param-unite">---</span></div>
                    <div style="min-width:100px;color:#555;font-size:14px;"><span class="spermogramme-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="spermogramme-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple spermogramme-param-btn" style="padding:8px 12px;font-size:13px;" data-param="VIABILITE">➕</button>
                </div>

                <!-- FORMES NORMALES -->
                <div data-spermogramme-param="FORMES NORMALES" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:200px;font-size:15px;">FORMES NORMALES</div>
                    <div style="color:#ccc;">:</div>
                    <input type="text" class="spermogramme-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="spermogramme-param-unite">---</span></div>
                    <div style="min-width:100px;color:#555;font-size:14px;"><span class="spermogramme-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="spermogramme-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple spermogramme-param-btn" style="padding:8px 12px;font-size:13px;" data-param="FORMES NORMALES">➕</button>
                </div>

                <!-- FORMES ANORMALES -->
                <div data-spermogramme-param="FORMES ANORMALES" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:200px;font-size:15px;">FORMES ANORMALES</div>
                    <div style="color:#ccc;">:</div>
                    <input type="text" class="spermogramme-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="spermogramme-param-unite">---</span></div>
                    <div style="min-width:100px;color:#555;font-size:14px;"><span class="spermogramme-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="spermogramme-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple spermogramme-param-btn" style="padding:8px 12px;font-size:13px;" data-param="FORMES ANORMALES">➕</button>
                </div>

                <!-- TETES ANORMALES -->
                <div data-spermogramme-param="TETES ANORMALES" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:200px;font-size:15px;">TETES ANORMALES</div>
                    <div style="color:#ccc;">:</div>
                    <input type="text" class="spermogramme-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="spermogramme-param-unite">---</span></div>
                    <div style="min-width:100px;color:#555;font-size:14px;"><span class="spermogramme-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="spermogramme-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple spermogramme-param-btn" style="padding:8px 12px;font-size:13px;" data-param="TETES ANORMALES">➕</button>
                </div>

                <!-- PIECES INTERMEDIAIRES -->
                <div data-spermogramme-param="PIECES INTERMEDIAIRES" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:200px;font-size:15px;">PIECES INTERMEDIAIRES(COU)</div>
                    <div style="color:#ccc;">:</div>
                    <input type="text" class="spermogramme-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="spermogramme-param-unite">---</span></div>
                    <div style="min-width:100px;color:#555;font-size:14px;"><span class="spermogramme-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="spermogramme-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple spermogramme-param-btn" style="padding:8px 12px;font-size:13px;" data-param="PIECES INTERMEDIAIRES">➕</button>
                </div>

                <!-- FLAGELLE -->
                <div data-spermogramme-param="FLAGELLE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:200px;font-size:15px;">FLAGELLE(QUEUES)</div>
                    <div style="color:#ccc;">:</div>
                    <input type="text" class="spermogramme-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="spermogramme-param-unite">---</span></div>
                    <div style="min-width:100px;color:#555;font-size:14px;"><span class="spermogramme-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="spermogramme-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple spermogramme-param-btn" style="padding:8px 12px;font-size:13px;" data-param="FLAGELLE">➕</button>
                </div>

                <!-- FORMES VIVANTES -->
                <div data-spermogramme-param="FORMES VIVANTES" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:200px;font-size:15px;">FORMES VIVANTES</div>
                    <div style="color:#ccc;">:</div>
                    <input type="text" class="spermogramme-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="spermogramme-param-unite">---</span></div>
                    <div style="min-width:100px;color:#555;font-size:14px;"><span class="spermogramme-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="spermogramme-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple spermogramme-param-btn" style="padding:8px 12px;font-size:13px;" data-param="FORMES VIVANTES">➕</button>
                </div>

                <!-- FORMES MORTES -->
                <div data-spermogramme-param="FORMES MORTES" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:200px;font-size:15px;">FORMES MORTES</div>
                    <div style="color:#ccc;">:</div>
                    <input type="text" class="spermogramme-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="spermogramme-param-unite">---</span></div>
                    <div style="min-width:100px;color:#555;font-size:14px;"><span class="spermogramme-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="spermogramme-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple spermogramme-param-btn" style="padding:8px 12px;font-size:13px;" data-param="FORMES MORTES">➕</button>
                </div>

                <!-- AGGLUTINATION -->
                <div data-spermogramme-param="AGGLUTINATION" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:200px;font-size:15px;">AGGLUTINATION</div>
                    <div style="color:#ccc;">:</div>
                    <select class="spermogramme-param-valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                        <option value="">Sélectionner</option>
                        <option value="ABSENTE">Absente</option>
                        <option value="PRESENTE">Présente</option>
                        <option value="Autre">Autre</option>
                    </select>
                    <input type="text" class="spermogramme-param-autres" placeholder="Préciser" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;display:none;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="spermogramme-param-unite">---</span></div>
                    <div style="min-width:100px;color:#555;font-size:14px;"><span class="spermogramme-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="spermogramme-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple spermogramme-param-btn" style="padding:8px 12px;font-size:13px;" data-param="AGGLUTINATION">➕</button>
                </div>

                <!-- TYPE D'AGGLUTINATION -->
                <div data-spermogramme-param="TYPE D'AGGLUTINATION" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:200px;font-size:15px;">TYPE D'AGGLUTINATION</div>
                    <div style="color:#ccc;">:</div>
                    <select class="spermogramme-param-valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                        <option value="">Sélectionner</option>
                        <option value="Tête-à-tête">Tête-à-tête</option>
                        <option value="Queue-queue">Queue-queue</option>
                        <option value="Tête-queue">Tête-queue</option>  
                        <option value="Mixte">Mixte</option>   
                        <option value="Autre">Autre</option>
                    </select>
                    <input type="text" class="spermogramme-param-autres" placeholder="Préciser" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;display:none;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="spermogramme-param-unite">---</span></div>
                    <div style="min-width:100px;color:#555;font-size:14px;"><span class="spermogramme-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="spermogramme-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple spermogramme-param-btn" style="padding:8px 12px;font-size:13px;" data-param="TYPE D'AGGLUTINATION">➕</button>
                </div>

                <!-- GRADE D'AGGLUTINATION -->
                <div data-spermogramme-param="GRADE D'AGGLUTINATION" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:200px;font-size:15px;">GRADE D'AGGLUTINATION</div>
                    <div style="color:#ccc;">:</div>
                    <select class="spermogramme-param-valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                        <option value="">Sélectionner</option>
                        <option value="1">Grade 1: ˂ 10 spermatozoîdes</option>
                        <option value="2">Grade 2: 10-50 spermatozoîdes</option>
                        <option value="3">Grade 3: ˃50-  spermatozoîdes</option>
                        <option value="4">Grade 4:Quasi-totalités</option>
                        <option value="Autre">Autre</option>
                    </select>
                    <input type="text" class="spermogramme-param-autres" placeholder="Préciser" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;display:none;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="spermogramme-param-unite">---</span></div>
                    <div style="min-width:100px;color:#555;font-size:14px;"><span class="spermogramme-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="spermogramme-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple spermogramme-param-btn" style="padding:8px 12px;font-size:13px;" data-param="GRADE D'AGGLUTINATION">➕</button>
                </div>

                <!-- ERYTHROCYTES -->
                <div data-spermogramme-param="ERYTHROCYTES" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:200px;font-size:15px;">ERYTHROCYTES</div>
                    <div style="color:#ccc;">:</div>
                    <select class="spermogramme-param-valeur" data-other-field="spermogramme-erythrocytes-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                        <option value="">selectionner</option>
                        <option value="0-1">0-1</option>
                        <option value="1-2">1-2</option>
                        <option value="2-3">2-3</option>
                        <option value="3-5">3-5</option>
                        <option value="5-7">5-7</option>
                        <option value="8-10">8-10</option>
                        <option value="10-15">10-15</option>
                        <option value="15-20">15-20</option>
                        <option value="20-30">20-30</option>
                        <option value="Nombreux (30-50)">Nombreux (30-50)</option>
                        <option value="Très nombreux(50-100) ">Très nombreux(50-100) </option>
                        <option value="Très nombreux (˃100)">Très nombreux (˃100)</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="spermogramme-erythrocytes-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="spermogramme-param-unite">---</span></div>
                    <div style="min-width:100px;color:#555;font-size:14px;"><span class="spermogramme-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="spermogramme-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple spermogramme-param-btn" style="padding:8px 12px;font-size:13px;" data-param="ERYTHROCYTES">➕</button>
                </div>

                <!-- LEUCOCYTES -->
                <div data-spermogramme-param="LEUCOCYTES" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:200px;font-size:15px;">LEUCOCYTES</div>
                    <div style="color:#ccc;">:</div>
                    <select class="spermogramme-param-valeur" data-other-field="spermogramme-leucocytes-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                        <option value="">selectionner</option>
                        <option value="0-1">0-1</option>
                        <option value="1-2">1-2</option>
                        <option value="2-3">2-3</option>
                        <option value="3-5">3-5</option>
                        <option value="5-7">5-7</option>
                        <option value="8-10">8-10</option>
                        <option value="10-15">10-15</option>
                        <option value="15-20">15-20</option>
                        <option value="20-30">20-30</option>
                        <option value="Nombreux (30-50)">Nombreux (30-50)</option>
                        <option value="Très nombreux(50-100) ">Très nombreux(50-100) </option>
                        <option value="Très nombreux (˃100)">Très nombreux (˃100)</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="spermogramme-leucocytes-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="spermogramme-param-unite">---</span></div>
                    <div style="min-width:100px;color:#555;font-size:14px;"><span class="spermogramme-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="spermogramme-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple spermogramme-param-btn" style="padding:8px 12px;font-size:13px;" data-param="LEUCOCYTES">➕</button>
                </div>

                <!-- CELLULE EPITHELIALE -->
                <div data-spermogramme-param="CELLULE EPITHELIALE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:200px;font-size:15px;">CELLULE EPITHELIALE</div>
                    <div style="color:#ccc;">:</div>
                    <select class="spermogramme-param-valeur" data-other-field="spermogramme-cellule-epitheliale-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                        <option value="">selectionner</option>
                        <option value="0-1">0-1</option>
                        <option value="1-2">1-2</option>
                        <option value="2-3">2-3</option>
                        <option value="3-5">3-5</option>
                        <option value="5-7">5-7</option>
                        <option value="8-10">8-10</option>
                        <option value="10-15">10-15</option>
                        <option value="15-20">15-20</option>
                        <option value="20-30">20-30</option>
                        <option value="Nombreux (30-50)">Nombreux (30-50)</option>
                        <option value="Très nombreux(50-100) ">Très nombreux(50-100) </option>
                        <option value="Très nombreux (˃100)">Très nombreux (˃100)</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="spermogramme-cellule-epitheliale-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="spermogramme-param-unite">---</span></div>
                    <div style="min-width:100px;color:#555;font-size:14px;"><span class="spermogramme-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="spermogramme-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple spermogramme-param-btn" style="padding:8px 12px;font-size:13px;" data-param="CELLULE EPITHELIALE">➕</button>
                </div>

                <!-- CRISTAUX -->
                <div data-spermogramme-param="CRISTAUX" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:200px;font-size:15px;">CRISTAUX</div>
                    <div style="color:#ccc;">:</div>
                    <select class="spermogramme-param-valeur" data-other-field="spermogramme-cristaux-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                        <option value="">selectionner </option>
                        <option value="Absent">Absent</option>
                        <option value="+">+</option>
                        <option value="++">++</option>
                        <option value="+++">+++</option>
                        <option value="++++">++++</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="spermogramme-cristaux-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="spermogramme-param-unite">---</span></div>
                    <div style="min-width:100px;color:#555;font-size:14px;"><span class="spermogramme-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="spermogramme-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple spermogramme-param-btn" style="padding:8px 12px;font-size:13px;" data-param="CRISTAUX">➕</button>
                </div>

                <!-- BACTERIES -->
                <div data-spermogramme-param="BACTERIES" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:200px;font-size:15px;">BACTERIES</div>
                    <div style="color:#ccc;">:</div>
                    <select class="spermogramme-param-valeur" data-other-field="spermogramme-bacteries-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                        <option value="">selectionner</option>
                        <option value="Négatif">Négatif</option>
                        <option value="Peu">Peu</option>
                        <option value="Modéré">Modéré</option>
                        <option value="Nombreux">Nombreux</option>
                        <option value="+">+</option>
                        <option value="++">++</option>
                        <option value="+++">+++</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="spermogramme-bacteries-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="spermogramme-param-unite">---</span></div>
                    <div style="min-width:100px;color:#555;font-size:14px;"><span class="spermogramme-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="spermogramme-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple spermogramme-param-btn" style="padding:8px 12px;font-size:13px;" data-param="BACTERIES">➕</button>
                </div>

                <!-- DEPOT DESAMORPHES -->
                <div data-spermogramme-param="DEPOT DESAMORPHES" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:200px;font-size:15px;">DEPOT DES AMORPHES</div>
                    <div style="color:#ccc;">:</div>
                    <select class="spermogramme-param-valeur" data-other-field="spermogramme-depot-desamorphes-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                        <option value="">selectionner</option>
                        <option value="Absent">Absent</option>
                        <option value="+">+</option>
                        <option value="++">++</option>
                        <option value="+++">+++</option>
                        <option value="++++">++++</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="spermogramme-depot-desamorphes-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="spermogramme-param-unite">---</span></div>
                    <div style="min-width:100px;color:#555;font-size:14px;"><span class="spermogramme-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="spermogramme-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple spermogramme-param-btn" style="padding:8px 12px;font-size:13px;" data-param="DEPOT DESAMORPHES">➕</button>
                </div>

                <!-- EXPRESSION DES RESULTATS -->
                <div data-spermogramme-param="EXPRESSION DES RESULTATS" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:200px;font-size:15px;">EXPRESSION DES RESULTATS</div>
                    <div style="color:#ccc;">:</div>
                    <select class="spermogramme-param-valeur" data-other-field="spermogramme-expression-resultats-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                        <option value="">selectionner</option>
                        <option value="Absent">Absent</option>
                        <option value="Normospermie">Normospermie</option>
                        <option value="Oligospermie">Oligospermie</option>
                        <option value="Asthenospermie">Asthenospermie</option>
                        <option value="Oligoasthenospermie">Oligoasthenospermie</option>
                        <option value="Azoospermie">Azoospermie</option>
                        <option value="Hypospermie">Hypospermie</option>
                        <option value="Hyperspermie">Hyperspermie</option>
                        <option value="Necrospermie">Necrospermie</option>
                        <option value="Cryptospermie">Cryptospermie</option>
                        <option value="Teratospermie">Teratospermie</option>
                        <option value="Autres">Autres</option>
                    </select>
                    <input type="text" id="spermogramme-expression-resultats-other" placeholder="Préciser..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;height:28px;line-height:1;margin-left:12px;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="spermogramme-param-unite">---</span></div>
                    <div style="min-width:100px;color:#555;font-size:14px;"><span class="spermogramme-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="spermogramme-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple spermogramme-param-btn" style="padding:8px 12px;font-size:13px;" data-param="EXPRESSION DES RESULTATS">➕</button>
                </div>
            </div>

            <!-- Section Commentaires avec Pièces jointes -->
            <div style="margin-top:20px;">
                <label style="display:block;font-weight:600;margin-bottom:10px;font-size:15px;color:#333;">Commentaires :</label>
                <div style="position:relative;">
                    <textarea id="spermogrammeCommentsInput" placeholder="Entrez vos commentaires ici..." style="width:100%;min-height:90px;padding:12px;padding-top:40px;border:2px dashed #999;border-radius:6px;font-size:14px;font-family:Arial,sans-serif;resize:vertical;box-sizing:border-box;background:#f9f9f9;color:#666;"></textarea>
                    <button id="spermogrammeAttachmentBtn" class="btn small purple" style="position:absolute;top:8px;left:8px;padding:6px 10px;font-size:12px;white-space:nowrap;height:auto;">📎</button>
                </div>
                
                <!-- Input file caché -->
                <input type="file" id="spermogrammeAttachmentInput" multiple style="display:none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt">
                
                <!-- Liste des fichiers attachés -->
                <div id="spermogrammeAttachmentList" style="margin-top:12px;">
                    <!-- Les fichiers sélectionnés apparaîtront ici -->
                </div>
            </div>
        </div>
        
        <div class="modal-actions" style="display:flex;justify-content:flex-end;gap:18px;padding:24px;border-top:1px solid var(--border);background:transparent;">
            <button id="spermogrammeCancel" class="btn muted" style="padding:10px 32px;font-size:16px;">Annuler</button>
            <button id="spermogrammeSubmit" class="btn muted" style="padding:10px 32px;font-size:16px;">Enregistrer</button> 
            <button id="spermogrammeVerify" class="btn muted" style="padding:10px 32px;font-size:16px;">Vérifier</button>
        </div>
    </div>
</div>

<!-- Modal spécifique pour ELECTROPHORESE DE HEMOGLOBINE -->
<div class="modal" id="electrophoreseModal" aria-hidden="true" style="z-index:101000;">
    <div class="modal-dialog" id="electrophoreseDialog" style="width:96%;max-width:1400px;padding:36px;">
        <h3 id="electrophoreseTitle" style="font-size:28px;margin-bottom:3px;font-weight:600;">Saisir Résultat</h3>

        <div class="modal-body" id="electrophoreseBody" style="padding:30px;font-size:17px;">
            <!-- Patient summary sera inséré ici -->
            <div id="electrophoresePatientSummary" style="margin-bottom:20px;"></div>

            <!-- Formulaire avec paramètres -->
            <div style="display:flex;flex-direction:column;gap:12px;">
                <!-- NOM VARIANTE -->
                <div data-electrophorese-param="NOM VARIANTE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:200px;font-size:15px;">NOM VARIANTE</div>
                    <div style="color:#ccc;">:</div>
                    <select class="electrophorese-param-valeur" data-other-field="electrophorese-nomvariante-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                        <option value="">-- Sélectionner --</option>
                        <option value="HOMOZYGOTE">HOMOZYGOTE</option>
                        <option value="HETEROZYGOTE">HETEROZYGOTE</option>
                        <option value="DREPANOCYTOSE">DREPANOCYTE</option>
                        <option value="AUTRES">Autres</option>
                    </select>
                    <input type="text" id="electrophorese-nomvariante-other" class="electrophorese-param-other" placeholder="Préciser" style="display:none;margin-left:10px;padding:4px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="electrophorese-param-unite">---</span></div>
                    <div style="min-width:100px;color:#555;font-size:14px;"><span class="electrophorese-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="electrophorese-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple electrophorese-param-btn" style="padding:8px 12px;font-size:13px;" data-param="NOM VARIANTE">➕</button>
                </div>

                <!-- VARIANTE VALEUR -->
                <div data-electrophorese-param="VARIANTE VALEUR" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:200px;font-size:15px;">VARIANTE D'HEMOGLOBINE</div>
                    <div style="color:#ccc;">:</div>
                    <select class="electrophorese-param-valeur" data-other-field="electrophorese-variante-other" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                        <option value="">-- Sélectionner --</option>
                        <option value="AA">AA</option>
                        <option value="AS">AS</option>
                        <option value="SS">SS</option>
                        <option value="AUTRES">Autres</option>
                    </select>
                    <input type="text" id="electrophorese-variante-other" class="electrophorese-param-other" placeholder="Préciser" style="display:none;margin-left:10px;padding:4px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="electrophorese-param-unite">---</span></div>
                    <div style="min-width:100px;color:#555;font-size:14px;"><span class="electrophorese-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="electrophorese-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple electrophorese-param-btn" style="padding:8px 12px;font-size:13px;" data-param="VARIANTE VALEUR">➕</button>
                </div>

                <!-- HEMOGLOBINE A -->
                <div data-electrophorese-param="HEMOGLOBINE A" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:200px;font-size:15px;">HEMOGLOBINE A</div>
                    <div style="color:#ccc;">:</div>
                    <input type="text" class="electrophorese-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="electrophorese-param-unite">---</span></div>
                    <div style="min-width:100px;color:#555;font-size:14px;"><span class="electrophorese-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="electrophorese-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple electrophorese-param-btn" style="padding:8px 12px;font-size:13px;" data-param="HEMOGLOBINE A">➕</button>
                </div>

                <!-- HEMOGLOBINE A2 -->
                <div data-electrophorese-param="HEMOGLOBINE A2" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:200px;font-size:15px;">HEMOGLOBINE A2</div>
                    <div style="color:#ccc;">:</div>
                    <input type="text" class="electrophorese-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="electrophorese-param-unite">---</span></div>
                    <div style="min-width:100px;color:#555;font-size:14px;"><span class="electrophorese-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="electrophorese-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple electrophorese-param-btn" style="padding:8px 12px;font-size:13px;" data-param="HEMOGLOBINE A2">➕</button>
                </div>

                <!-- HEMOGLOBINE F -->
                <div data-electrophorese-param="HEMOGLOBINE F" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:200px;font-size:15px;">HEMOGLOBINE F</div>
                    <div style="color:#ccc;">:</div>
                    <input type="text" class="electrophorese-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="electrophorese-param-unite">---</span></div>
                    <div style="min-width:100px;color:#555;font-size:14px;"><span class="electrophorese-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="electrophorese-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple electrophorese-param-btn" style="padding:8px 12px;font-size:13px;" data-param="HEMOGLOBINE F">➕</button>
                </div>

                <!-- HEMOGLOBINE S -->
                <div data-electrophorese-param="HEMOGLOBINE S" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:200px;font-size:15px;">HEMOGLOBINE S</div>
                    <div style="color:#ccc;">:</div>
                    <input type="text" class="electrophorese-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="electrophorese-param-unite">---</span></div>
                    <div style="min-width:100px;color:#555;font-size:14px;"><span class="electrophorese-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="electrophorese-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple electrophorese-param-btn" style="padding:8px 12px;font-size:13px;" data-param="HEMOGLOBINE S">➕</button>
                </div>

                <!-- HEMOGLOBINE D,C,E... -->
                <div data-electrophorese-param="HEMOGLOBINE D,C,E…" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:200px;font-size:15px;">HEMOGLOBINE D,C,E…</div>
                    <div style="color:#ccc;">:</div>
                    <input type="text" class="electrophorese-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;" required>
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="electrophorese-param-unite">---</span></div>
                    <div style="min-width:100px;color:#555;font-size:14px;"><span class="electrophorese-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="electrophorese-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple electrophorese-param-btn" style="padding:8px 12px;font-size:13px;" data-param="HEMOGLOBINE D,C,E…">➕</button>
                </div>
            </div>

            <!-- Affichage du total des hémoglobines -->
            <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#e3f2fd;border-radius:4px;border:2px solid #2196f3;margin-top:8px;">
                <div style="font-weight:600;min-width:200px;font-size:15px;color:#1976d2;">📊 TOTAL HEMOGLOBINE</div>
                <div style="color:#ccc;">:</div>
                <div id="electrophorese-hemoglobine-total" style="font-weight:600;font-size:16px;color:#4caf50;min-width:120px;text-align:center;padding:4px 8px;background:#fff;border-radius:4px;border:1px solid #ddd;">
                    <span id="electrophorese-total-value">0.0%</span>
                </div>
                <div style="font-size:13px;color:#666;margin-left:10px;">Vérification que le total ne dépasse pas 100%</div>
            </div>

            <!-- Section Commentaires avec Pièces jointes -->
            <div style="margin-top:20px;">
                <label style="display:block;font-weight:600;margin-bottom:10px;font-size:15px;color:#333;">Commentaires :</label>
                <div style="position:relative;">
                    <textarea id="electrophoreseCommentsInput" placeholder="Entrez vos commentaires ici..." style="width:100%;min-height:90px;padding:12px;padding-top:40px;border:2px dashed #999;border-radius:6px;font-size:14px;font-family:Arial,sans-serif;resize:vertical;box-sizing:border-box;background:#f9f9f9;color:#666;"></textarea>
                    <button id="electrophoreseAttachmentBtn" class="btn small purple" style="position:absolute;top:8px;left:8px;padding:6px 10px;font-size:12px;white-space:nowrap;height:auto;">📎</button>
                </div>

                <!-- Input file caché -->
                <input type="file" id="electrophoreseAttachmentInput" multiple style="display:none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt">

                <!-- Liste des fichiers attachés -->
                <div id="electrophoreseAttachmentList" style="margin-top:12px;">
                    <!-- Les fichiers sélectionnés apparaîtront ici -->
                </div>
            </div>
        </div>

        <div class="modal-actions" style="display:flex;justify-content:flex-end;gap:18px;padding:24px;border-top:1px solid var(--border);background:transparent;">
            <button id="electrophoreseCancel" class="btn muted" style="padding:10px 32px;font-size:16px;">Annuler</button>
            <button id="electrophoreseSubmit" class="btn muted" style="padding:10px 32px;font-size:16px;">Enregistrer</button>
            <button id="electrophoreseVerify" class="btn muted" style="padding:10px 32px;font-size:16px;">Vérifier</button>
        </div>
    </div>
</div>

<!-- Modal spécifique pour MALARIA GOUTTE EPAISSE ET TDR -->
<div class="modal" id="malariaGEModal" aria-hidden="true" style="z-index:101000;">
  <div class="modal-dialog" id="malariaGEDialog" style="width:96%;max-width:1400px;padding:36px;">
    <h3 id="malariaGETitle">Saisir Résultat</h3>

    <div class="modal-body" id="malariaGEBody">
      <div id="malariaGEPatientSummary"></div>

      <!-- GOUTTE ÉPAISSE -->
      <div data-malaria-ge-param="GOUTTE EPAISSE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
        <div style="font-weight:600;min-width:160px;font-size:15px;">GOUTTE ÉPAISSE</div>
        <div style="color:#ccc;">:</div>
        <select class="malaria-ge-param-valeur" data-param="GOUTTE ÉPAISSE" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;" required>
          <option value="">-- Sélectionner --</option>
          <option value="NEGATIF">NEGATIF</option>
          <option value="POSITIF">POSITIF</option>
          <option value="AUTRES">Autres</option>
        </select>
        <input type="text" class="malaria-ge-param-autres" placeholder="Préciser autres..." style="display:none;margin-left:8px;padding:5px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;" required>
        <span class="malaria-ge-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
        <span class="malaria-ge-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
        <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
          <input type="checkbox" class="malaria-ge-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
          <span>Not Required ?</span>
        </label>
        <button class="btn small purple malaria-ge-param-btn" data-param="GOUTTE ÉPAISSE">➕</button>
      </div>

      <!-- TROPHOZOIDE -->
      <div data-malaria-ge-param="TROPHOZOIDE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
        <div style="font-weight:600;min-width:160px;font-size:15px;">TROPHOZOIDE</div>
        <div style="color:#ccc;">:</div>
        <select class="malaria-ge-param-valeur" data-param="TROPHOZOIDE" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:140px;" required>
          <option value="">-- Sélectionner --</option>
          <option value="NEGATIF">NEGATIF</option>
          <option value="+">+</option>
          <option value="++">++</option>
          <option value="+++">+++</option>
          <option value="++++">++++</option>
          <option value="AUTRES">Autres</option>
        </select>
        <input type="text" class="malaria-ge-param-autres" placeholder="Préciser autres..." style="display:none;margin-left:8px;padding:5px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:140px;" required>
        <span class="malaria-ge-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
        <span class="malaria-ge-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
        <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
          <input type="checkbox" class="malaria-ge-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
          <span>Not Required ?</span>
        </label>
        <button class="btn small purple malaria-ge-param-btn" data-param="TROPHOZOIDE">➕</button>
      </div>

      <!-- SCHIZONTE -->
      <div data-malaria-ge-param="SCHIZONTE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
        <div style="font-weight:600;min-width:160px;font-size:15px;">SCHIZONTE</div>
        <div style="color:#ccc;">:</div>
        <select class="malaria-ge-param-valeur" data-param="SCHIZONTE" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:140px;" required>
          <option value="">-- Sélectionner --</option>
          <option value="NEGATIF">NEGATIF</option>
          <option value="+">+</option>
          <option value="++">++</option>
          <option value="+++">+++</option>
          <option value="++++">++++</option>
          <option value="AUTRES">Autres</option>
        </select>
        <input type="text" class="malaria-ge-param-autres" placeholder="Préciser autres..." style="display:none;margin-left:8px;padding:5px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:140px;" required>
        <span class="malaria-ge-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
        <span class="malaria-ge-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
        <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
          <input type="checkbox" class="malaria-ge-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
          <span>Not Required ?</span>
        </label>
        <button class="btn small purple malaria-ge-param-btn" data-param="SCHIZONTE">➕</button>
      </div>

      <!-- GAMÉTOCYTE -->
      <div data-malaria-ge-param="GAMÉTOCYTE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
        <div style="font-weight:600;min-width:160px;font-size:15px;">GAMÉTOCYTE</div>
        <div style="color:#ccc;">:</div>
        <select class="malaria-ge-param-valeur" data-param="GAMÉTOCYTE" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:140px;" required>
          <option value="">-- Sélectionner --</option>
          <option value="NEGATIF">NEGATIF</option>
          <option value="+">+</option>
          <option value="++">++</option>
          <option value="+++">+++</option>
          <option value="++++">++++</option>
          <option value="AUTRES">Autres</option>
        </select>
        <input type="text" class="malaria-ge-param-autres" placeholder="Préciser autres..." style="display:none;margin-left:8px;padding:5px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:140px;" required>
        <span class="malaria-ge-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
        <span class="malaria-ge-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
        <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
          <input type="checkbox" class="malaria-ge-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
          <span>Not Required ?</span>
        </label>
        <button class="btn small purple malaria-ge-param-btn" data-param="GAMÉTOCYTE">➕</button>
      </div>

      <!-- ETALEMENT MINCE (ÉTALEMENT MINCE) -->
      <div data-malaria-ge-param="ETALEMENT MINCE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
        <div style="font-weight:600;min-width:160px;font-size:15px;">ETALEMENT MINCE</div>
        <div style="color:#ccc;">:</div>
        <select class="malaria-ge-param-valeur" data-param="ETALEMENT MINCE" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;" required>
          <option value="">-- Sélectionner --</option>
          <option value="NON DETECTE">NON DETECTE</option>
          <option value="DETECTE">DETECTE</option>
          <option value="AUTRES">Autres</option>
        </select>
        <input type="text" class="malaria-ge-param-autres" placeholder="Préciser autres..." style="display:none;margin-left:8px;padding:5px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;" required>
        <span class="malaria-ge-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
        <span class="malaria-ge-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
        <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
          <input type="checkbox" class="malaria-ge-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
          <span>Not Required ?</span>
        </label>
        <button class="btn small purple malaria-ge-param-btn" data-param="ETALEMENT MINCE">➕</button>
      </div>

      <!-- DENSITEPARASITAIRE -->
      <div data-malaria-ge-param="DENSITE PARASITAIRE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
        <div style="font-weight:600;min-width:160px;font-size:15px;">DENSITEPARASITAIRE</div>
        <div style="color:#ccc;">:</div>
        <select class="malaria-ge-param-valeur" data-param="DENSITEPARASITAIRE" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:220px;" required>
          <option value="">-- Sélectionner --</option>
          <option value="&lt;20/µl">&lt;20/µl</option>
          <option value="800/µl">800/µl</option>
          <option value="2800/µl">2800/µl</option>
          <option value="5800/µl">5800/µl</option>
          <option value="&gt;10001/µl">&gt;10001/µl</option>
          <option value="AUTRES">Autres</option>
        </select>
        <input type="text" class="malaria-ge-param-autres" placeholder="Préciser autres..." style="display:none;margin-left:8px;padding:5px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;" required>
        <span class="malaria-ge-param-unite" style="min-width:80px;text-align:center;font-size:12px;">parasites/µL</span>
        <span class="malaria-ge-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
        <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
          <input type="checkbox" class="malaria-ge-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
          <span>Not Required ?</span>
        </label>
        <button class="btn small purple malaria-ge-param-btn" data-param="DENSITEPARASITAIRE">➕</button>
      </div>

      <!-- PLASMODIUM FALCIPARUM -->
      <div data-malaria-ge-param="PLASMODIUM FALCIPARUM" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
        <div style="font-weight:600;min-width:160px;font-size:15px;">PLASMODIUM FALCIPARUM</div>
        <div style="color:#ccc;">:</div>
        <select class="malaria-ge-param-valeur" data-param="PLASMODIUM FALCIPARUM" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:180px;" required>
          <option value="">-- Sélectionner --</option>
          <option value="NON DETECTE">NON DETECTE</option>
          <option value="NON DETECTE">DETECTE</option>
          <option value="AUTRES">Autres</option>
        </select>
        <input type="text" class="malaria-ge-param-autres" placeholder="Préciser autres..." style="display:none;margin-left:8px;padding:5px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:180px;" required>
        <span class="malaria-ge-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
        <span class="malaria-ge-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
        <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
          <input type="checkbox" class="malaria-ge-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
          <span>Not Required ?</span>
        </label>
        <button class="btn small purple malaria-ge-param-btn" data-param="PLASMODIUM FALCIPARUM">➕</button>
      </div>

      <!-- PLASMODIUM MALARIAE -->
      <div data-malaria-ge-param="PLASMODIUM MALARIAE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
        <div style="font-weight:600;min-width:160px;font-size:15px;">PLASMODIUM MALARIAE</div>
        <div style="color:#ccc;">:</div>
        <select class="malaria-ge-param-valeur" data-param="PLASMODIUM MALARIAE" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:180px;" required>
          <option value="">-- Sélectionner --</option>
          <option value="NON DETECTE">NON DETECTE</option>
          <option value="DETECTE">DETECTE</option>
          <option value="AUTRES">Autres</option>
        </select>
        <input type="text" class="malaria-ge-param-autres" placeholder="Préciser autres..." style="display:none;margin-left:8px;padding:5px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:180px;" required>
        <span class="malaria-ge-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
        <span class="malaria-ge-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
        <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
          <input type="checkbox" class="malaria-ge-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
          <span>Not Required ?</span>
        </label>
        <button class="btn small purple malaria-ge-param-btn" data-param="PLASMODIUM MALARIAE">➕</button>
      </div>

      <!-- PLASMODIUM OVALE -->
      <div data-malaria-ge-param="PLASMODIUM OVALE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
        <div style="font-weight:600;min-width:160px;font-size:15px;">PLASMODIUM OVALE</div>
        <div style="color:#ccc;">:</div>
        <select class="malaria-ge-param-valeur" data-param="PLASMODIUM OVALE" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:180px;" required>
          <option value="">-- Sélectionner --</option>
          <option value="NON DETECTE">NON DETECTE</option>
          <option value="DETECTE">DETECTE</option>
          <option value="AUTRES">Autres</option>
        </select>
        <input type="text" class="malaria-ge-param-autres" placeholder="Préciser autres..." style="display:none;margin-left:8px;padding:5px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:180px;" required>
        <span class="malaria-ge-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
        <span class="malaria-ge-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
        <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
          <input type="checkbox" class="malaria-ge-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
          <span>Not Required ?</span>
        </label>
        <button class="btn small purple malaria-ge-param-btn" data-param="PLASMODIUM OVALE">➕</button>
      </div>

      <!-- PLASMODIUM VIVAX -->
      <div data-malaria-ge-param="PLASMODIUM VIVAX" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
        <div style="font-weight:600;min-width:160px;font-size:15px;">PLASMODIUM VIVAX</div>
        <div style="color:#ccc;">:</div>
        <select class="malaria-ge-param-valeur" data-param="PLASMODIUM VIVAX" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:180px;" required>
          <option value="">-- Sélectionner --</option>
          <option value="NON DETECTE">NON DETECTE</option>
          <option value="DETECTE">DETECTE</option>
          <option value="AUTRES">Autres</option>
        </select>
        <input type="text" class="malaria-ge-param-autres" placeholder="Préciser autres..." style="display:none;margin-left:8px;padding:5px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:180px;" required>
        <span class="malaria-ge-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
        <span class="malaria-ge-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
        <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
          <input type="checkbox" class="malaria-ge-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
          <span>Not Required ?</span>
        </label>
        <button class="btn small purple malaria-ge-param-btn" data-param="PLASMODIUM VIVAX">➕</button>
      </div>

      <!-- Section Commentaires avec Pièces jointes -->
      <div style="margin-top:20px;">
        <label style="display:block;font-weight:600;margin-bottom:10px;font-size:15px;color:#333;">Commentaires :</label>
        <div style="position:relative;">
          <textarea id="malariaGECommentsInput" placeholder="Entrez vos commentaires ici..." style="width:100%;min-height:90px;padding:12px;padding-top:40px;border:2px dashed #999;border-radius:6px;font-size:14px;font-family:Arial,sans-serif;resize:vertical;box-sizing:border-box;background:#f9f9f9;color:#666;"></textarea>
          <button id="malariaGEAttachmentBtn" class="btn small purple" style="position:absolute;top:8px;left:8px;padding:6px 10px;font-size:12px;white-space:nowrap;height:auto;">📎</button>
        </div>

        <input type="file" id="malariaGEAttachmentInput" multiple style="display:none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt">
        <div id="malariaGEAttachmentList" style="margin-top:12px;"></div>
      </div>
    </div>

    <div class="modal-actions" style="display:flex;justify-content:flex-end;gap:18px;padding:24px;border-top:1px solid var(--border);background:transparent;">
      <button id="malariaGECancel" class="btn muted" style="padding:10px 32px;font-size:16px;">Annuler</button>
      <button id="malariaGESubmit" class="btn muted" style="padding:10px 32px;font-size:16px;">Enregistrer</button>
      <button id="malariaGEVerify" class="btn muted" style="padding:10px 32px;font-size:16px;">Vérifier</button>
    </div>
  </div>
</div>

<!-- Modal spécifique pour MICROFILAIRE -->
<div class="modal" id="microfilaireModal" aria-hidden="true" style="z-index:101000;">
  <div class="modal-dialog" id="microfilaireDialog" style="width:96%;max-width:1400px;padding:36px;">
    <h3 id="microfilaireTitle">Saisir Résultat</h3>

    <div class="modal-body" id="microfilaireBody">
      <div id="microfilairePatientSummary"></div>

      <!-- SPECIMEN -->
      <div data-microfilaire-param="SPECIMEN" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
        <div style="font-weight:600;min-width:160px;font-size:15px;">SPECIMEN</div>
        <div style="color:#ccc;">:</div>
        <input type="text" class="microfilaire-param-valeur" data-param="SPECIMEN" placeholder="Ex: Sang, Liquide pleural..." style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;" required>
        <span class="microfilaire-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
        <span class="microfilaire-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
        <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
          <input type="checkbox" class="microfilaire-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
          <span>Not Required ?</span>
        </label>
        <button class="btn small purple microfilaire-param-btn" data-param="SPECIMEN">➕</button>
      </div>

      <!-- METHODE -->
      <div data-microfilaire-param="METHODE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
        <div style="font-weight:600;min-width:160px;font-size:15px;">METHODE</div>
        <div style="color:#ccc;">:</div>
        <select class="microfilaire-param-valeur" data-param="METHODE" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;" required>
          <option value="">-- Sélectionner --</option>
          <option value="SANG FRAIS">SANG FRAIS</option>
          <option value="GOUTTE FRAICHE">GOUTTE FRAICHE</option>
          <option value="BUFFY COAT">BUFFY COAT</option>
          <option value="GOUTTE FRAICHE ET BUFFY COAT>FILM MINCE">GOUTTE FRAICHE ET BUFFY COAT</option>
          <option value="AUTRES">Autres</option>
        </select>
        <input type="text" class="microfilaire-param-autres" placeholder="Préciser autres..." style="display:none;margin-left:8px;padding:5px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;" required>
        <span class="microfilaire-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
        <span class="microfilaire-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
        <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
          <input type="checkbox" class="microfilaire-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
          <span>Not Required ?</span>
        </label>
        <button class="btn small purple microfilaire-param-btn" data-param="METHODE">➕</button>
      </div>

      <!-- WUCHERERIA BANCROFTI -->
      <div data-microfilaire-param="WUCHERERIA BANCROFTI" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
        <div style="font-weight:600;min-width:160px;font-size:15px;">WUCHERERIA BANCROFTI</div>
        <div style="color:#ccc;">:</div>
        <select class="microfilaire-param-valeur" data-param="WUCHERERIA BANCROFTI" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:180px;" required>
          <option value="">-- Sélectionner --</option>
          <option value="NON OBSERVE">NON OBSERVE</option>
          <option value="OBSERVE">OBSERVE</option>
          <option value="AUTRES">Autres</option>
        </select>
        <input type="text" class="microfilaire-param-autres" placeholder="Préciser autres..." style="display:none;margin-left:8px;padding:5px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:180px;" required>
        <span class="microfilaire-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
        <span class="microfilaire-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
        <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
          <input type="checkbox" class="microfilaire-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
          <span>Not Required ?</span>
        </label>
        <button class="btn small purple microfilaire-param-btn" data-param="WUCHERERIA BANCROFTI">➕</button>
      </div>

      <!-- FILARIOSES LYMPHATIQUES -->
      <div data-microfilaire-param="FILARIOSES LYMPHATIQUES" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
        <div style="font-weight:600;min-width:160px;font-size:15px;">FILARIOSES LYMPH.</div>
        <div style="color:#ccc;">:</div>
        <select class="microfilaire-param-valeur" data-param="FILARIOSES LYMPHATIQUES" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:180px;" required>
          <option value="">-- Sélectionner --</option>
          <option value="NON OBSERVE">NON OBSERVE</option>
          <option value="OBSERVE">OBSERVE</option>
          <option value="AUTRES">Autres</option>
        </select>
        <input type="text" class="microfilaire-param-autres" placeholder="Préciser autres..." style="display:none;margin-left:8px;padding:5px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:180px;" required>
        <span class="microfilaire-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
        <span class="microfilaire-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
        <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
          <input type="checkbox" class="microfilaire-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
          <span>Not Required ?</span>
        </label>
        <button class="btn small purple microfilaire-param-btn" data-param="FILARIOSES LYMPHATIQUES">➕</button>
      </div>

      <!-- LOA LOA -->
      <div data-microfilaire-param="LOA LOA" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
        <div style="font-weight:600;min-width:160px;font-size:15px;">LOA LOA</div>
        <div style="color:#ccc;">:</div>
        <select class="microfilaire-param-valeur" data-param="LOA LOA" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;" required>
          <option value="">-- Sélectionner --</option>
          <option value="NON OBSERVE">NON OBSERVE</option>
          <option value="OBSERVE">OBSERVE</option>
          <option value="AUTRES">Autres</option>
        </select>
        <input type="text" class="microfilaire-param-autres" placeholder="Préciser autres..." style="display:none;margin-left:8px;padding:5px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;" required>
        <span class="microfilaire-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
        <span class="microfilaire-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
        <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
          <input type="checkbox" class="microfilaire-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
          <span>Not Required ?</span>
        </label>
        <button class="btn small purple microfilaire-param-btn" data-param="LOA LOA">➕</button>
      </div>

      <!-- FILARIOSES CUTANÉES -->
      <div data-microfilaire-param="FILARIOSES CUTANEES" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
        <div style="font-weight:600;min-width:160px;font-size:15px;">FILARIOSES CUTANÉES</div>
        <div style="color:#ccc;">:</div>
        <select class="microfilaire-param-valeur" data-param="FILARIOSES CUTANEES" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:180px;" required>
          <option value="">-- Sélectionner --</option>
          <option value="NON OBSERVE">NON OBSERVE</option>
          <option value="OBSERVE">OBSERVE</option>
          <option value="AUTRES">Autres</option>
        </select>
        <input type="text" class="microfilaire-param-autres" placeholder="Préciser autres..." style="display:none;margin-left:8px;padding:5px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:180px;" required>
        <span class="microfilaire-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
        <span class="microfilaire-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
        <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
          <input type="checkbox" class="microfilaire-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
          <span>Not Required ?</span>
        </label>
        <button class="btn small purple microfilaire-param-btn" data-param="FILARIOSES CUTANEES">➕</button>
      </div>

      <!-- ONCHOCERCUS VOLVULUS -->
      <div data-microfilaire-param="ONCHOCERCUS VOLVULUS" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
        <div style="font-weight:600;min-width:160px;font-size:15px;">ONCHOCERCUS VOLVULUS</div>
        <div style="color:#ccc;">:</div>
        <select class="microfilaire-param-valeur" data-param="ONCHOCERCUS VOLVULUS" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:180px;" required>
          <option value="">-- Sélectionner --</option>
          <option value="NON OBSERVE">NON OBSERVE</option>
          <option value="OBSERVE">OBSERVE</option>
          <option value="AUTRES">Autres</option>
        </select>
        <input type="text" class="microfilaire-param-autres" placeholder="Préciser autres..." style="display:none;margin-left:8px;padding:5px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:180px;" required>
        <span class="microfilaire-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
        <span class="microfilaire-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
        <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
          <input type="checkbox" class="microfilaire-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
          <span>Not Required ?</span>
        </label>
        <button class="btn small purple microfilaire-param-btn" data-param="ONCHOCERCUS VOLVULUS">➕</button>
      </div>

      <!-- TROPISME OCULAIRE -->
      <div data-microfilaire-param="TROPISME OCULAIRE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
        <div style="font-weight:600;min-width:160px;font-size:15px;">TROPISME OCULAIRE</div>
        <div style="color:#ccc;">:</div>
        <select class="microfilaire-param-valeur" data-param="TROPISME OCULAIRE" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:180px;" required>
          <option value="">-- Sélectionner --</option>
          <option value="NON OBSERVE">NON OBSERVE</option>
          <option value="OBSERVE">OBSERVE</option>
          <option value="AUTRES">Autres</option>
        </select>
        <input type="text" class="microfilaire-param-autres" placeholder="Préciser autres..." style="display:none;margin-left:8px;padding:5px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:180px;" required>
        <span class="microfilaire-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
        <span class="microfilaire-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
        <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
          <input type="checkbox" class="microfilaire-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
          <span>Not Required ?</span>
        </label>
        <button class="btn small purple microfilaire-param-btn" data-param="TROPISME OCULAIRE">➕</button>
      </div>

      <!-- DRACUNCULUS MEDINENSIS -->
      <div data-microfilaire-param="DRACUNCULUS MEDINENSIS" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
        <div style="font-weight:600;min-width:160px;font-size:15px;">DRACUNCULUS MEDINENSIS</div>
        <div style="color:#ccc;">:</div>
        <select class="microfilaire-param-valeur" data-param="DRACUNCULUS MEDINENSIS" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:200px;" required>
          <option value="">-- Sélectionner --</option>
          <option value="NON OBSERVE">NON OBSERVE</option>
          <option value="OBSERVE">OBSERVE</option>
          <option value="AUTRES">Autres</option>
        </select>
        <input type="text" class="microfilaire-param-autres" placeholder="Préciser autres..." style="display:none;margin-left:8px;padding:5px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:200px;" required>
        <span class="microfilaire-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
        <span class="microfilaire-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
        <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
          <input type="checkbox" class="microfilaire-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
          <span>Not Required ?</span>
        </label>
        <button class="btn small purple microfilaire-param-btn" data-param="DRACUNCULUS MEDINENSIS">➕</button>
      </div>

      <!-- CHEVILLE -->
      <div data-microfilaire-param="CHEVILLE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
        <div style="font-weight:600;min-width:160px;font-size:15px;">CHEVILLE</div>
        <div style="color:#ccc;">:</div>
        <select class="microfilaire-param-valeur" data-param="CHEVILLE" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;" required>
          <option value="">-- Sélectionner --</option>
          <option value="NON OBSERVE">NON OBSERVE</option>
          <option value="OBSERVE">OBSERVE</option>
          <option value="AUTRES">Autres</option>
        </select>
        <input type="text" class="microfilaire-param-autres" placeholder="Préciser autres..." style="display:none;margin-left:8px;padding:5px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;" required>
        <span class="microfilaire-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
        <span class="microfilaire-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
        <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
          <input type="checkbox" class="microfilaire-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
          <span>Not Required ?</span>
        </label>
        <button class="btn small purple microfilaire-param-btn" data-param="CHEVILLE">➕</button>
      </div>

      <!-- PIED EN GENERAL -->
      <div data-microfilaire-param="PIED EN GENERAL" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
        <div style="font-weight:600;min-width:160px;font-size:15px;">PIED EN GÉNÉRAL</div>
        <div style="color:#ccc;">:</div>
        <select class="microfilaire-param-valeur" data-param="PIED EN GENERAL" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;" required>
          <option value="">-- Sélectionner --</option>
          <option value="NON OBSERVE">NON OBSERVE</option>
          <option value="OBSERVE">OBSERVE</option>
          <option value="AUTRES">Autres</option>
        </select>
        <input type="text" class="microfilaire-param-autres" placeholder="Préciser autres..." style="display:none;margin-left:8px;padding:5px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;" required>
        <span class="microfilaire-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
        <span class="microfilaire-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
        <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
          <input type="checkbox" class="microfilaire-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
          <span>Not Required ?</span>
        </label>
        <button class="btn small purple microfilaire-param-btn" data-param="PIED EN GENERAL">➕</button>
      </div>

      <!-- Section Commentaires avec Pièces jointes -->
      <div style="margin-top:20px;">
        <label style="display:block;font-weight:600;margin-bottom:10px;font-size:15px;color:#333;">Commentaires :</label>
        <div style="position:relative;">
          <textarea id="microfilaireCommentsInput" placeholder="Entrez vos commentaires ici..." style="width:100%;min-height:90px;padding:12px;padding-top:40px;border:2px dashed #999;border-radius:6px;font-size:14px;font-family:Arial,sans-serif;resize:vertical;box-sizing:border-box;background:#f9f9f9;color:#666;"></textarea>
          <button id="microfilaireAttachmentBtn" class="btn small purple" style="position:absolute;top:8px;left:8px;padding:6px 10px;font-size:12px;white-space:nowrap;height:auto;">📎</button>
        </div>

        <input type="file" id="microfilaireAttachmentInput" multiple style="display:none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt">
        <div id="microfilaireAttachmentList" style="margin-top:12px;"></div>
      </div>
    </div>

    <div class="modal-actions" style="display:flex;justify-content:flex-end;gap:18px;padding:24px;border-top:1px solid var(--border);background:transparent;">
      <button id="microfilaireCancel" class="btn muted" style="padding:10px 32px;font-size:16px;">Annuler</button>
      <button id="microfilaireSubmit" class="btn muted" style="padding:10px 32px;font-size:16px;">Enregistrer</button>
      <button id="microfilaireVerify" class="btn muted" style="padding:10px 32px;font-size:16px;">Vérifier</button>
    </div>
  </div>
</div>

<!-- Modal spécifique pour GOUTTE FRAICHE -->
<div class="modal" id="goutteFraicheModal" aria-hidden="true" style="z-index:101000;">
  <div class="modal-dialog" id="goutteFraicheDialog" style="width:96%;max-width:1400px;padding:36px;">
    <h3 id="goutteFraicheTitle">Saisir Résultat</h3>

    <div class="modal-body" id="goutteFraicheBody">
      <div id="goutteFraichePatientSummary"></div>

      <!-- SPECIMEN -->
      <div data-goutte-fraiche-param="SPECIMEN" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
        <div style="font-weight:600;min-width:160px;font-size:15px;">SPECIMEN</div>
        <div style="color:#ccc;">:</div>
        <input type="text" class="goutte-fraiche-param-valeur" data-param="SPECIMEN" placeholder="Ex: Sang, Liquide pleural..." style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;" required>
        <span class="goutte-fraiche-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
        <span class="goutte-fraiche-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
        <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
          <input type="checkbox" class="goutte-fraiche-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
          <span>Not Required ?</span>
        </label>
        <button class="btn small purple goutte-fraiche-param-btn" data-param="SPECIMEN">➕</button>
      </div>

      <!-- RESULTAT -->
      <div data-goutte-fraiche-param="RESULTAT" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
        <div style="font-weight:600;min-width:160px;font-size:15px;">RESULTAT</div>
        <div style="color:#ccc;">:</div>
        <select class="goutte-fraiche-param-valeur" data-param="RESULTAT" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:180px;" required>
          <option value="">-- Sélectionner --</option>
          <option value="ABSENT">ABSENT</option>
          <option value="PRESENT">PRESENT</option>
          <option value="AUTRES">Autres</option>
        </select>
        <input type="text" class="goutte-fraiche-param-autres" placeholder="Préciser autres..." style="display:none;margin-left:8px;padding:5px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:180px;" required>
        <span class="goutte-fraiche-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
        <span class="goutte-fraiche-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
        <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
          <input type="checkbox" class="goutte-fraiche-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
          <span>Not Required ?</span>
        </label>
        <button class="btn small purple goutte-fraiche-param-btn" data-param="RESULTAT">➕</button>
      </div>

      <!-- WUCHERERIA BANCROFTI -->
      <div data-goutte-fraiche-param="WUCHERERIA BANCROFTI" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
        <div style="font-weight:600;min-width:160px;font-size:15px;">WUCHERERIA BANCROFTI</div>
        <div style="color:#ccc;">:</div>
        <select class="goutte-fraiche-param-valeur" data-param="WUCHERERIA BANCROFTI" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:180px;" required>
          <option value="">-- Sélectionner --</option>
          <option value="ABSENT">ABSENT</option>
          <option value="PRESENT">PRESENT</option>
          <option value="AUTRES">Autres</option>
        </select>
        <input type="text" class="goutte-fraiche-param-autres" placeholder="Préciser autres..." style="display:none;margin-left:8px;padding:5px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:180px;" required>
        <span class="goutte-fraiche-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
        <span class="goutte-fraiche-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
        <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
          <input type="checkbox" class="goutte-fraiche-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
          <span>Not Required ?</span>
        </label>
        <button class="btn small purple goutte-fraiche-param-btn" data-param="WUCHERERIA BANCROFTI">➕</button>
      </div>

      <!-- LOA LOA -->
      <div data-goutte-fraiche-param="LOA LOA" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
        <div style="font-weight:600;min-width:160px;font-size:15px;">LOA LOA</div>
        <div style="color:#ccc;">:</div>
        <select class="goutte-fraiche-param-valeur" data-param="LOA LOA" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;" required>
          <option value="">-- Sélectionner --</option>
          <option value="ABSENT">ABSENT</option>
          <option value="PRESENT">PRESENT</option>
          <option value="AUTRES">Autres</option>
        </select>
        <input type="text" class="goutte-fraiche-param-autres" placeholder="Préciser autres..." style="display:none;margin-left:8px;padding:5px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;" required>
        <span class="goutte-fraiche-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
        <span class="goutte-fraiche-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
        <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
          <input type="checkbox" class="goutte-fraiche-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
          <span>Not Required ?</span>
        </label>
        <button class="btn small purple goutte-fraiche-param-btn" data-param="LOA LOA">➕</button>
      </div>

      <!-- ONCHOCERCUS VOLVULUS -->
      <div data-goutte-fraiche-param="ONCHOCERCUS VOLVULUS" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
        <div style="font-weight:600;min-width:160px;font-size:15px;">ONCHOCERCUS VOLVULUS</div>
        <div style="color:#ccc;">:</div>
        <select required class="goutte-fraiche-param-valeur" data-param="ONCHOCERCUS VOLVULUS" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:180px;">
          <option value="">-- Sélectionner --</option>
          <option value="ABSENT">ABSENT</option>
          <option value="PRESENT">PRESENT</option>
          <option value="AUTRES">Autres</option>
        </select>
        <input required type="text" class="goutte-fraiche-param-autres" placeholder="Préciser autres..." style="display:none;margin-left:8px;padding:5px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:180px;">
        <span class="goutte-fraiche-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
        <span class="goutte-fraiche-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
        <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
          <input type="checkbox" class="goutte-fraiche-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
          <span>Not Required ?</span>
        </label>
        <button class="btn small purple goutte-fraiche-param-btn" data-param="ONCHOCERCUS VOLVULUS">➕</button>
      </div>


      <!-- DRACUNCULUS MEDINENSIS -->
      <div data-goutte-fraiche-param="DRACUNCULUS MEDINENSIS" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
        <div style="font-weight:600;min-width:160px;font-size:15px;">DRACUNCULUS MEDINENSIS</div>
        <div style="color:#ccc;">:</div>
        <select required class="goutte-fraiche-param-valeur" data-param="DRACUNCULUS MEDINENSIS" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:200px;">
          <option value="">-- Sélectionner --</option>
          <option value="ABSENT">ABSENT</option>
          <option value="PRESENT">PRESENT</option>
          <option value="AUTRES">Autres</option>
        </select>
        <input required type="text" class="goutte-fraiche-param-autres" placeholder="Préciser autres..." style="display:none;margin-left:8px;padding:5px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:200px;">
        <span class="goutte-fraiche-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
        <span class="goutte-fraiche-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
        <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
          <input type="checkbox" class="goutte-fraiche-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
          <span>Not Required ?</span>
        </label>
        <button class="btn small purple goutte-fraiche-param-btn" data-param="DRACUNCULUS MEDINENSIS">➕</button>
      </div>

      <!-- TRYPANOSOMA -->
      <div data-goutte-fraiche-param="TRYPANOSOMA" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
        <div style="font-weight:600;min-width:160px;font-size:15px;">TRYPANOSOMA</div>
        <div style="color:#ccc;">:</div>
        <select required class="goutte-fraiche-param-valeur" data-param="TRYPANOSOMA" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;">
          <option value="">-- Sélectionner --</option>
          <option value="ABSENT">ABSENT</option>
          <option value="PRESENT">PRESENT</option>
          <option value="AUTRES">Autres</option>
        </select>
        <input required type="text" class="goutte-fraiche-param-autres" placeholder="Préciser autres..." style="display:none;margin-left:8px;padding:5px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;">
        <span class="goutte-fraiche-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
        <span class="goutte-fraiche-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
        <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
          <input type="checkbox" class="goutte-fraiche-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
          <span>Not Required ?</span>
        </label>
        <button class="btn small purple goutte-fraiche-param-btn" data-param="TRYPANOSOMA">➕</button>
      </div>


      <!-- Section Commentaires avec Pièces jointes -->
      <div style="margin-top:20px;">
        <label style="display:block;font-weight:600;margin-bottom:10px;font-size:15px;color:#333;">Commentaires :</label>
        <div style="position:relative;">
          <textarea id="goutteFraicheCommentsInput" placeholder="Entrez vos commentaires ici..." style="width:100%;min-height:90px;padding:12px;padding-top:40px;border:2px dashed #999;border-radius:6px;font-size:14px;font-family:Arial,sans-serif;resize:vertical;box-sizing:border-box;background:#f9f9f9;color:#666;"></textarea>
          <button id="goutteFraicheAttachmentBtn" class="btn small purple" style="position:absolute;top:8px;left:8px;padding:6px 10px;font-size:12px;white-space:nowrap;height:auto;">📎</button>
        </div>

        <input type="file" id="goutteFraicheAttachmentInput" multiple style="display:none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt">
        <div id="goutteFraicheAttachmentList" style="margin-top:12px;"></div>
      </div>
    </div>

    <div class="modal-actions" style="display:flex;justify-content:flex-end;gap:18px;padding:24px;border-top:1px solid var(--border);background:transparent;">
      <button id="goutteFraicheCancel" class="btn muted" style="padding:10px 32px;font-size:16px;">Annuler</button>
      <button id="goutteFraicheSubmit" class="btn muted" style="padding:10px 32px;font-size:16px;">Enregistrer</button>
      <button id="goutteFraicheVerify" class="btn muted" style="padding:10px 32px;font-size:16px;">Vérifier</button>
    </div>
  </div>
</div>

<!-- Modal spécifique pour GROUPAGE SANGUIN ABO ET RH D (GROUPAGE) -->
<div class="modal" id="groupageSanguinModal" aria-hidden="true" style="z-index:101000;">
  <div class="modal-dialog" id="groupageSanguinDialog" style="width:96%;max-width:1400px;padding:36px;">
    <h3 id="groupageSanguinTitle">Saisir Résultat</h3>

    <div class="modal-body" id="groupageSanguinBody">
      <div id="groupageSanguinPatientSummary"></div>

      <!-- GROUPE SANGUIN -->
      <div data-groupage-sanguin-param="GROUPE SANGUIN" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
        <div style="font-weight:600;min-width:160px;font-size:15px;">GROUPE SANGUIN</div>
        <div style="color:#ccc;">:</div>
        <select required class="groupage-sanguin-param-valeur" data-param="GROUPE SANGUIN" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;">
          <option value="">-- Sélectionner --</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="AB">AB</option>
          <option value="O">O</option>
          <option value="AUTRES">Autres</option>
        </select>
        <input required type="text" class="groupage-sanguin-param-autres" placeholder="Préciser autres..." style="display:none;margin-left:8px;padding:5px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;">
        <span class="groupage-sanguin-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
        <span class="groupage-sanguin-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
        <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
          <input type="checkbox" class="groupage-sanguin-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
          <span>Not Required ?</span>
        </label>
        <button class="btn small purple groupage-sanguin-param-btn" data-param="GROUPE SANGUIN">➕</button>
      </div>

      <!-- RHESUS D -->
      <div data-groupage-sanguin-param="RHESUS D" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
        <div style="font-weight:600;min-width:160px;font-size:15px;">RHESUS D</div>
        <div style="color:#ccc;">:</div>
        <select required class="groupage-sanguin-param-valeur" data-param="RHESUS D" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;">
          <option value="">-- Sélectionner --</option>
          <option value="NEGATIF">NEGATIF</option>
          <option value="POSITIF">POSITIF</option>
          <option value="AUTRES">Autres</option>
        </select>
        <input required type="text" class="groupage-sanguin-param-autres" placeholder="Préciser autres..." style="display:none;margin-left:8px;padding:5px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;">
        <span class="groupage-sanguin-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
        <span class="groupage-sanguin-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
        <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
          <input type="checkbox" class="groupage-sanguin-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
          <span>Not Required ?</span>
        </label>
        <button class="btn small purple groupage-sanguin-param-btn" data-param="RHESUS D">➕</button>
      </div>

      <!-- METHODES -->
      <div data-groupage-sanguin-param="METHODES" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
        <div style="font-weight:600;min-width:160px;font-size:15px;">METHODES</div>
        <div style="color:#ccc;">:</div>
        <select required class="groupage-sanguin-param-valeur" data-param="METHODES" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:200px;">
          <option value="">-- Sélectionner --</option>
          <option value="BETH-VINCEN(Directe)">BETH-VINCEN(Directe)</option>
          <option value="BETH-VINCEN(Indirecte)">SIMONNIN(Indirecte)</option>
          <option value="DIRECTE ET INDIRECTE">DIRECTE ET INDIRECTE</option>
          <option value="AUTRES">Autres</option>
        </select>
        <input required type="text" class="groupage-sanguin-param-autres" placeholder="Préciser autres..." style="display:none;margin-left:8px;padding:5px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:200px;">
        <span class="groupage-sanguin-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
        <span class="groupage-sanguin-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
        <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
          <input type="checkbox" class="groupage-sanguin-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
          <span>Not Required ?</span>
        </label>
        <button class="btn small purple groupage-sanguin-param-btn" data-param="METHODES">➕</button>
      </div>

      <!-- Section Commentaires avec Pièces jointes -->
      <div style="margin-top:20px;">
        <label style="display:block;font-weight:600;margin-bottom:10px;font-size:15px;color:#333;">Commentaires :</label>
        <div style="position:relative;">
          <textarea id="groupageSanguinCommentsInput" placeholder="Entrez vos commentaires ici..." style="width:100%;min-height:90px;padding:12px;padding-top:40px;border:2px dashed #999;border-radius:6px;font-size:14px;font-family:Arial,sans-serif;resize:vertical;box-sizing:border-box;background:#f9f9f9;color:#666;"></textarea>
          <button id="groupageSanguinAttachmentBtn" class="btn small purple" style="position:absolute;top:8px;left:8px;padding:6px 10px;font-size:12px;white-space:nowrap;height:auto;">📎</button>
        </div>

        <input type="file" id="groupageSanguinAttachmentInput" multiple style="display:none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt">
        <div id="groupageSanguinAttachmentList" style="margin-top:12px;"></div>
      </div>
    </div>

    <div class="modal-actions" style="display:flex;justify-content:flex-end;gap:18px;padding:24px;border-top:1px solid var(--border);background:transparent;">
      <button id="groupageSanguinCancel" class="btn muted" style="padding:10px 32px;font-size:16px;">Annuler</button>
      <button id="groupageSanguinSubmit" class="btn muted" style="padding:10px 32px;font-size:16px;">Enregistrer</button>
      <button id="groupageSanguinVerify" class="btn muted" style="padding:10px 32px;font-size:16px;">Vérifier</button>
    </div>
  </div>
</div>

<!-- Modal spécifique pour MICROBIOLOGIE -->
<div class="modal" id="microbiologieModal" aria-hidden="true" style="z-index:101000;">
  <div class="modal-dialog" id="microbiologieDialog" style="width:96%;max-width:1200px;padding:36px;">
    <h3 id="microbiologieTitle" style="font-size:28px;margin-bottom:3px;font-weight:600;">Saisir Résultat</h3>
    
    <div class="modal-body" id="microbiologieBody" style="padding:30px;font-size:17px;">
      <div id="microbiologiePatientSummary" style="margin-bottom:20px;"></div>
      
      <div style="display:flex;flex-direction:column;gap:12px;">
        <!-- DATE DE COLLECTE -->
        <div data-microbiologie-param="DATE DE COLLECTE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
          <div style="font-weight:600;min-width:160px;font-size:15px;">DATE DE COLLECTE</div>
          <div style="color:#ccc;">:</div>
          <input required type="date" class="microbiologie-param-valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;height:28px;">
          <span class="microbiologie-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
          <span class="microbiologie-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
          <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
            <input type="checkbox" class="microbiologie-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
            <span>Not Required ?</span>
          </label>
          <button class="btn small purple microbiologie-param-btn" data-param="DATE DE COLLECTE">➕</button>
        </div>

        <!-- DATE DE TRANSMISSION -->
        <div data-microbiologie-param="DATE DE TRANSMISSION" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
          <div style="font-weight:600;min-width:160px;font-size:15px;">DATE DE TRANSMISSION</div>
          <div style="color:#ccc;">:</div>
          <input required type="date" class="microbiologie-param-valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;height:28px;">
          <span class="microbiologie-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
          <span class="microbiologie-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
          <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
            <input type="checkbox" class="microbiologie-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
            <span>Not Required ?</span>
          </label>
          <button class="btn small purple microbiologie-param-btn" data-param="DATE DE TRANSMISSION">➕</button>
        </div>

        <!-- DATE DE RECEPTION -->
        <div data-microbiologie-param="DATE DE RECEPTION" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
          <div style="font-weight:600;min-width:160px;font-size:15px;">DATE DE RECEPTION</div>
          <div style="color:#ccc;">:</div>
          <input required type="date" class="microbiologie-param-valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;height:28px;">
          <span class="microbiologie-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
          <span class="microbiologie-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
          <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
            <input type="checkbox" class="microbiologie-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
            <span>Not Required ?</span>
          </label>
          <button class="btn small purple microbiologie-param-btn" data-param="DATE D'EXAMINATION">➕</button>
        </div>

        <!-- DATE D'EXAMINATION -->
        <div data-microbiologie-param="DATE D'EXAMINATION" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
          <div style="font-weight:600;min-width:160px;font-size:15px;">DATE D'EXAMINATION</div>
          <div style="color:#ccc;">:</div>
          <input required type="date" class="microbiologie-param-valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;height:28px;">
          <span class="microbiologie-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
          <span class="microbiologie-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
          <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
            <input type="checkbox" class="microbiologie-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
            <span>Not Required ?</span>
          </label>
          <button class="btn small purple microbiologie-param-btn" data-param="DATE D'ANALYSE">➕</button>
        </div>

        <!-- SPECIMEN -->
        <div data-microbiologie-param="SPECIMEN" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
          <div style="font-weight:600;min-width:160px;font-size:15px;">SPECIMEN</div>
          <div style="color:#ccc;">:</div>
          <select required class="microbiologie-param-valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;">
            <option value="">-- Sélectionner --</option>
            <option value="Urine">Urine</option>
            <option value="Fèces">Fèces</option>
            <option value="Sang">Sang</option>
            <option value="Salive">Salive</option>
            <option value="Sperme">Sperme</option>
            <option value="AUTRES">Autres</option>
          </select>
          <input required type="text" class="microbiologie-param-autres" placeholder="Préciser autres..." style="display:none;margin-left:8px;padding:5px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;">
          <span class="microbiologie-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
          <span class="microbiologie-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
          <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
            <input type="checkbox" class="microbiologie-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
            <span>Not Required ?</span>
          </label>
          <button class="btn small purple microbiologie-param-btn" data-param="SPECIMEN">➕</button>
        </div>

        <!-- COULEUR -->
        <div data-microbiologie-param="COULEUR" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
          <div style="font-weight:600;min-width:160px;font-size:15px;">COULEUR</div>
          <div style="color:#ccc;">:</div>
          <select required class="microbiologie-param-valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;">
            <option value="">-- Sélectionner --</option>
            <option value="Incolore">Incolore</option>
            <option value="Jaune clair">Jaune clair</option>
            <option value="Jaune foncé">Jaune foncé</option>
            <option value="Brun">Brun</option>
            <option value="Blanchâtre">Blanchâtre</option>
            <option value="AUTRES">Autres</option>
          </select>
          <input required type="text" class="microbiologie-param-autres" placeholder="Préciser autres..." style="display:none;margin-left:8px;padding:5px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;">
          <span class="microbiologie-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
          <span class="microbiologie-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
          <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
            <input type="checkbox" class="microbiologie-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
            <span>Not Required ?</span>
          </label>
          <button class="btn small purple microbiologie-param-btn" data-param="COULEUR">➕</button>
        </div>

        <!-- LEUCOCYTE -->
        <div data-microbiologie-param="LEUCOCYTE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
          <div style="font-weight:600;min-width:160px;font-size:15px;">LEUCOCYTE</div>
          <div style="color:#ccc;">:</div>
          <select required class="microbiologie-param-valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;">
            <option value="">-- Sélectionner --</option>
            <option value="Négatif">Négatif</option>
            <option value="Traces">Traces</option>
            <option value="+">+</option>
            <option value="++">++</option>
            <option value="+++">+++</option>
            <option value="AUTRES">Autres</option>
          </select>
          <input required type="text" class="microbiologie-param-autres" placeholder="Préciser autres..." style="display:none;margin-left:8px;padding:5px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;">
          <span class="microbiologie-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
          <span class="microbiologie-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
          <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
            <input type="checkbox" class="microbiologie-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
            <span>Not Required ?</span>
          </label>
          <button class="btn small purple microbiologie-param-btn" data-param="LEUCOCYTE">➕</button>
        </div>

        <!-- CELLULE EPITHELIALE -->
        <div data-microbiologie-param="CELLULE EPITHELIALE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
          <div style="font-weight:600;min-width:160px;font-size:15px;">CELLULE EPITHELIALE</div>
          <div style="color:#ccc;">:</div>
          <select required class="microbiologie-param-valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;">
            <option value="">-- Sélectionner --</option>
            <option value="Négatif">Négatif</option>
            <option value="Traces">Traces</option>
            <option value="+">+</option>
            <option value="++">++</option>
            <option value="+++">+++</option>
            <option value="AUTRES">Autres</option>
          </select>
          <input required type="text" class="microbiologie-param-autres" placeholder="Préciser autres..." style="display:none;margin-left:8px;padding:5px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;">
          <span class="microbiologie-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
          <span class="microbiologie-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
          <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
            <input type="checkbox" class="microbiologie-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
            <span>Not Required ?</span>
          </label>
          <button class="btn small purple microbiologie-param-btn" data-param="CELLULE EPITHELIALE">➕</button>
        </div>

        <!-- GLOBULES ROUGES -->
        <div data-microbiologie-param="GLOBULES ROUGES" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
          <div style="font-weight:600;min-width:160px;font-size:15px;">GLOBULES ROUGES</div>
          <div style="color:#ccc;">:</div>
          <select required class="microbiologie-param-valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;">
            <option value="">-- Sélectionner --</option>
            <option value="Négatif">Négatif</option>
            <option value="Traces">Traces</option>
            <option value="+">+</option>
            <option value="++">++</option>
            <option value="+++">+++</option>
            <option value="AUTRES">Autres</option>
          </select>
          <input required type="text" class="microbiologie-param-autres" placeholder="Préciser autres..." style="display:none;margin-left:8px;padding:5px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;">
          <span class="microbiologie-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
          <span class="microbiologie-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
          <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
            <input type="checkbox" class="microbiologie-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
            <span>Not Required ?</span>
          </label>
          <button class="btn small purple microbiologie-param-btn" data-param="GLOBULES ROUGES">➕</button>
        </div>

        <!-- CRISTAUX -->
        <div data-microbiologie-param="CRISTAUX" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
          <div style="font-weight:600;min-width:160px;font-size:15px;">CRISTAUX</div>
          <div style="color:#ccc;">:</div>
          <select required class="microbiologie-param-valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;">
            <option value="">-- Sélectionner --</option>
            <option value="Négatif">Négatif</option>
            <option value="Traces">Traces</option>
            <option value="+">+</option>
            <option value="++">++</option>
            <option value="+++">+++</option>
            <option value="AUTRES">Autres</option>
          </select>
          <input required type="text" class="microbiologie-param-autres" placeholder="Préciser autres..." style="display:none;margin-left:8px;padding:5px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;">
          <span class="microbiologie-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
          <span class="microbiologie-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
          <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
            <input type="checkbox" class="microbiologie-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
            <span>Not Required ?</span>
          </label>
          <button class="btn small purple microbiologie-param-btn" data-param="CRISTAUX">➕</button>
        </div>

        <!-- CYLINDRE -->
        <div data-microbiologie-param="CYLINDRE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
          <div style="font-weight:600;min-width:160px;font-size:15px;">CYLINDRE</div>
          <div style="color:#ccc;">:</div>
          <select required class="microbiologie-param-valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;">
            <option value="">-- Sélectionner --</option>
            <option value="Négatif">Négatif</option>
            <option value="Traces">Traces</option>
            <option value="+">+</option>
            <option value="++">++</option>
            <option value="+++">+++</option>
            <option value="AUTRES">Autres</option>
          </select>
          <input required type="text" class="microbiologie-param-autres" placeholder="Préciser autres..." style="display:none;margin-left:8px;padding:5px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;">
          <span class="microbiologie-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
          <span class="microbiologie-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
          <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
            <input type="checkbox" class="microbiologie-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
            <span>Not Required ?</span>
          </label>
          <button class="btn small purple microbiologie-param-btn" data-param="CYLINDRE">➕</button>
        </div>

        <!-- LEVURE -->
        <div data-microbiologie-param="LEVURE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
          <div style="font-weight:600;min-width:160px;font-size:15px;">LEVURE</div>
          <div style="color:#ccc;">:</div>
          <select required class="microbiologie-param-valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;">
            <option value="">-- Sélectionner --</option>
            <option value="Négatif">Négatif</option>
            <option value="Traces">Traces</option>
            <option value="+">+</option>
            <option value="++">++</option>
            <option value="+++">+++</option>
            <option value="AUTRES">Autres</option>
          </select>
          <input required type="text" class="microbiologie-param-autres" placeholder="Préciser autres..." style="display:none;margin-left:8px;padding:5px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;">
          <span class="microbiologie-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
          <span class="microbiologie-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
          <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
            <input type="checkbox" class="microbiologie-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
            <span>Not Required ?</span>
          </label>
          <button class="btn small purple microbiologie-param-btn" data-param="LEVURE">➕</button>
        </div>

        <!-- CULTURE -->
        <div data-microbiologie-param="CULTURE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
          <div style="font-weight:600;min-width:160px;font-size:15px;">CULTURE</div>
          <div style="color:#ccc;">:</div>
          <select required class="microbiologie-param-valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;">
            <option value="">-- Sélectionner --</option>
            <option value="Négatif">Négatif</option>
            <option value="Positif">Positif</option>
            <option value="AUTRES">Autres</option>
          </select>
          <input required type="text" class="microbiologie-param-autres" placeholder="Préciser autres..." style="display:none;margin-left:8px;padding:5px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;">
          <span class="microbiologie-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
          <span class="microbiologie-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
          <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
            <input type="checkbox" class="microbiologie-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
            <span>Not Required ?</span>
          </label>
          <button class="btn small purple microbiologie-param-btn" data-param="CULTURE">➕</button>
        </div>

        <!-- DENOMBREMENT -->
        <div data-microbiologie-param="DENOMBREMENT" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
          <div style="font-weight:600;min-width:160px;font-size:15px;">DENOMBREMENT</div>
          <div style="color:#ccc;">:</div>
          <input required type="text" class="microbiologie-param-valeur" placeholder="Ex: 1000 CFU/mL" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;">
          <span class="microbiologie-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
          <span class="microbiologie-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
          <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
            <input type="checkbox" class="microbiologie-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
            <span>Not Required ?</span>
          </label>
          <button class="btn small purple microbiologie-param-btn" data-param="DENOMBREMENT">➕</button>
        </div>

        <!-- COLORATION DE GRAM -->
        <div data-microbiologie-param="COLORATION DE GRAM" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
          <div style="font-weight:600;min-width:160px;font-size:15px;">COLORATION DE GRAM</div>
          <div style="color:#ccc;">:</div>
          <input required type="text" class="microbiologie-param-valeur" placeholder="Ex: Coque Gram positif" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;">
          <span class="microbiologie-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
          <span class="microbiologie-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
          <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
            <input type="checkbox" class="microbiologie-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
            <span>Not Required ?</span>
          </label>
          <button class="btn small purple microbiologie-param-btn" data-param="COLORATION DE GRAM">➕</button>
        </div>

        <!-- GERME ISOLE -->
        <div data-microbiologie-param="GERME ISOLE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
          <div style="font-weight:600;min-width:160px;font-size:15px;">GERME ISOLE</div>
          <div style="color:#ccc;">:</div>
          <input required type="text" class="microbiologie-param-valeur" placeholder="Ex: Staphylococcus aureus" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;">
          <span class="microbiologie-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
          <span class="microbiologie-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
          <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
            <input type="checkbox" class="microbiologie-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
            <span>Not Required ?</span>
          </label>
          <button class="btn small purple microbiologie-param-btn" data-param="GERME ISOLE">➕</button>
        </div>
      </div>

      <!-- Section Commentaires avec Pièces jointes -->
      <div style="margin-top:20px;">
        <label style="display:block;font-weight:600;margin-bottom:10px;font-size:15px;color:#333;">Commentaires :</label>
        <div style="position:relative;">
          <textarea id="microbiologieCommentsInput" placeholder="Entrez vos commentaires ici..." style="width:100%;min-height:90px;padding:12px;padding-top:40px;border:2px dashed #999;border-radius:6px;font-size:14px;font-family:Arial,sans-serif;resize:vertical;box-sizing:border-box;background:#f9f9f9;color:#666;"></textarea>
          <button id="microbiologieAttachmentBtn" class="btn small purple" style="position:absolute;top:8px;left:8px;padding:6px 10px;font-size:12px;white-space:nowrap;height:auto;">📎</button>
        </div>

        <input type="file" id="microbiologieAttachmentInput" multiple style="display:none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt">
        <div id="microbiologieAttachmentList" style="margin-top:12px;"></div>
      </div>
    </div>

    <div class="modal-actions" style="display:flex;justify-content:flex-end;gap:18px;padding:24px;border-top:1px solid var(--border);background:transparent;">
      <button id="microbiologieCancel" class="btn muted" style="padding:10px 32px;font-size:16px;">Annuler</button>
      <button id="microbiologieSubmit" class="btn muted" style="padding:10px 32px;font-size:16px;">Enregistrer</button>
      <button id="microbiologieVerify" class="btn muted" style="padding:10px 32px;font-size:16px;">Vérifier</button>
    </div>
  </div>
</div>

<!-- Modal spécifique pour ZIEHL NEELSEN (ZN) -->
<div class="modal" id="ziehlNelsenModal" aria-hidden="true" style="z-index:101000;">
  <div class="modal-dialog" id="ziehlNelsenDialog" style="width:96%;max-width:1400px;padding:36px;">
    <h3 id="ziehlNelsenTitle" style="font-size:28px;margin-bottom:3px;font-weight:600;">Ziehl Neelsen - Saisir Résultat</h3>

    <div class="modal-body" id="ziehlNelsenBody" style="padding:30px;font-size:17px;">
      <div id="ziehlNelsenPatientSummary" style="margin-bottom:20px;"></div>

      <!-- Formulaire avec trois lignes de résultats -->
      <div style="display:flex;flex-direction:column;gap:12px;">
        <!-- LIGNE 1 -->
        <div data-zn-param="RESULTAT_1" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
          <input type="date" class="zn-param-date" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:120px;height:28px;" placeholder="Date" required>
          <input type="text" class="zn-param-echantillon" placeholder="Échantillon" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:120px;height:28px;" required>
          <input type="text" class="zn-param-aspect" placeholder="Aspect" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:120px;height:28px;" required>
          
          <select required class="zn-param-valeur" data-other-field="zn-autres-1" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;height:28px;">
            <option value="">-- Résultats --</option>
            <option value="NEGATIF">NEGATIF</option>
            <option value="POSITIF +">POSITIF +</option>
            <option value="POSITIF ++">POSITIF ++</option>
            <option value="POSITIF +++">POSITIF +++</option>
            <option value="POSITIF ++++">POSITIF ++++</option>
            <option value="AUTRES">Autres (préciser)</option>
          </select>
          <input required type="text" id="zn-autres-1" class="zn-param-autres" placeholder="Préciser autres..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:120px;">
          
          <span class="zn-param-unite" style="min-width:80px;text-align:center;font-size:12px;font-weight:600;">---</span>
          <span class="zn-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
          
          <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;">
            <input type="checkbox" class="zn-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
            <span>Not Required ?</span>
          </label>
          <button class="btn small purple zn-param-btn" style="padding:8px 12px;font-size:13px;">➕</button>
        </div>

        <!-- LIGNE 2 -->
        <div data-zn-param="RESULTAT_2" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
          <input type="date" class="zn-param-date" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:120px;height:28px;" placeholder="Date" required>
          <input type="text" class="zn-param-echantillon" placeholder="Échantillon" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:120px;height:28px;" required>
          <input type="text" class="zn-param-aspect" placeholder="Aspect" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:120px;height:28px;" required>
          
          <select required class="zn-param-valeur" data-other-field="zn-autres-2" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;height:28px;">
            <option value="">-- Résultats --</option>
            <option value="NEGATIF">NEGATIF</option>
            <option value="POSITIF +">POSITIF +</option>
            <option value="POSITIF ++">POSITIF ++</option>
            <option value="POSITIF +++">POSITIF +++</option>
            <option value="POSITIF ++++">POSITIF ++++</option>
            <option value="AUTRES">Autres (préciser)</option>
          </select>
          <input required type="text" id="zn-autres-2" class="zn-param-autres" placeholder="Préciser autres..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:120px;">
          
          <span class="zn-param-unite" style="min-width:80px;text-align:center;font-size:12px;font-weight:600;">---</span>
          <span class="zn-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
          
          <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;">
            <input type="checkbox" class="zn-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
            <span>Not Required ?</span>
          </label>
          <button class="btn small purple zn-param-btn" style="padding:8px 12px;font-size:13px;">➕</button>
        </div>

        <!-- LIGNE 3 -->
        <div data-zn-param="RESULTAT_3" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
          <input type="date" class="zn-param-date" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:120px;height:28px;" placeholder="Date" required>
          <input type="text" class="zn-param-echantillon" placeholder="Échantillon" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:120px;height:28px;" required>
          <input type="text" class="zn-param-aspect" placeholder="Aspect" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:120px;height:28px;" required>
          
          <select required class="zn-param-valeur" data-other-field="zn-autres-3" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;height:28px;">
            <option value="">-- Résultats --</option>
            <option value="NEGATIF">NEGATIF</option>
            <option value="POSITIF +">POSITIF +</option>
            <option value="POSITIF ++">POSITIF ++</option>
            <option value="POSITIF +++">POSITIF +++</option>
            <option value="POSITIF ++++">POSITIF ++++</option>
            <option value="AUTRES">Autres (préciser)</option>
          </select>
          <input required type="text" id="zn-autres-3" class="zn-param-autres" placeholder="Préciser autres..." style="display:none;padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:120px;">
          
          <span class="zn-param-unite" style="min-width:80px;text-align:center;font-size:12px;font-weight:600;">---</span>
          <span class="zn-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
          
          <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;">
            <input type="checkbox" class="zn-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
            <span>Not Required ?</span>
          </label>
          <button class="btn small purple zn-param-btn" style="padding:8px 12px;font-size:13px;">➕</button>
        </div>
      </div>

      <!-- Section Commentaires avec Pièces jointes -->
      <div style="margin-top:20px;">
        <label style="display:block;font-weight:600;margin-bottom:10px;font-size:15px;color:#333;">Commentaires :</label>
        <div style="position:relative;">
          <textarea id="ziehlNelsenCommentsInput" placeholder="Entrez vos commentaires ici..." style="width:100%;min-height:90px;padding:12px;padding-top:40px;border:2px dashed #999;border-radius:6px;font-size:14px;font-family:Arial,sans-serif;resize:vertical;box-sizing:border-box;background:#f9f9f9;color:#666;"></textarea>
          <button id="ziehlNelsenAttachmentBtn" class="btn small purple" style="position:absolute;top:8px;left:8px;padding:6px 10px;font-size:12px;white-space:nowrap;height:auto;">📎</button>
        </div>

        <input type="file" id="ziehlNelsenAttachmentInput" multiple style="display:none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt">
        <div id="ziehlNelsenAttachmentList" style="margin-top:12px;"></div>
      </div>
    </div>

    <div class="modal-actions" style="display:flex;justify-content:flex-end;gap:18px;padding:24px;border-top:1px solid var(--border);background:transparent;">
      <button id="ziehlNelsenCancel" class="btn muted" style="padding:10px 32px;font-size:16px;">Annuler</button>
      <button id="ziehlNelsenSubmit" class="btn muted" style="padding:10px 32px;font-size:16px;">Enregistrer</button>
      <button id="ziehlNelsenVerify" class="btn muted" style="padding:10px 32px;font-size:16px;">Vérifier</button>
    </div>
  </div>
</div>

<!-- Modal générique pour formulaires d'examens COAGULATION -->
<div class="modal" id="coagulationFormModal" aria-hidden="true" style="z-index:101000;">
    <div class="modal-dialog" id="coagulationFormDialog" style="width:96%;max-width:1200px;padding:36px;">
        <h3 id="coagulationFormTitle" style="font-size:28px;margin-bottom:3px;font-weight:600;">Saisir Résultat</h3>
        
        <div class="modal-body" id="coagulationFormBody" style="padding:30px;font-size:17px;">
            <!-- Patient summary sera inséré ici -->
            <div id="coagulationFormPatientSummary" style="margin-bottom:20px;"></div>
            
            <!-- Formulaire horizontal sur une seule ligne -->
            <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                <!-- Nom examen -->
                <div style="font-weight:600;min-width:120px;font-size:15px;">
                    <span id="coagulationParamName">---</span>
                </div>
                
                <!-- Séparateur -->
                <div style="color:#ccc;">:</div>
                
                <!-- Flag dropdown (more compact) -->
                <select required id="coagulationFlagSelect" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;">
                    <option value="">---</option>
                       <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                </select>
                
                  <!-- Resultats input -->
                  <input required type="text" id="coagulationResultInput" 
                      style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;"
                      placeholder="Valeur">
                
                <!-- Unité -->
                <div style="min-width:60px;color:#555;font-size:14px;">
                    <span id="coagulationUniteText">---</span>
                </div>
                
                <!-- Range usuelle -->
                <div style="min-width:80px;color:#555;font-size:14px;">
                    <span id="coagulationRangeText">---</span>
                </div>
                
                <!-- Checkbox Not Required (checkbox at left, label to right) -->
                <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                    <input type="checkbox" id="coagulationNotRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                    <span style="color:#333;font-size:14px;line-height:1;display:inline-block;transform:translateY(-1px);">Not Required ?</span>
                </label>
                
                <!-- Bouton ajouter -->
                <button class="btn small purple" style="padding:8px 12px;font-size:13px;">➕</button>
            </div>
            
            <!-- Info specimen et unite (optionnel, peut être caché) -->
            <div style="background:#f0f0f0;padding:12px;border-radius:4px;margin-top:15px;font-size:14px;color:#666;display:none;">
                <div><strong>Specimen:</strong> <span id="coagulationSpecimenText">---</span></div>
                <div><strong>Unité (info):</strong> <span id="coagulationUniteInfo">---</span></div>
            </div>
            
            <!-- Section Commentaires avec Pièces jointes -->
            <div style="margin-top:20px;">
                <label style="display:block;font-weight:600;margin-bottom:10px;font-size:15px;color:#333;">Commentaires :</label>
                <div style="position:relative;">
                    <textarea id="coagulationCommentsInput" placeholder="Entrez vos commentaires ici..." style="width:100%;min-height:90px;padding:12px;padding-top:40px;border:2px dashed #999;border-radius:6px;font-size:14px;font-family:Arial,sans-serif;resize:vertical;box-sizing:border-box;background:#f9f9f9;color:#666;"></textarea>
                    <button id="coagulationAttachmentBtn" class="btn small purple" style="position:absolute;top:8px;left:8px;padding:6px 10px;font-size:12px;white-space:nowrap;height:auto;">📎</button>
                </div>
                
                <!-- Input file caché -->
                <input type="file" id="coagulationAttachmentInput" multiple style="display:none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt">
                
                <!-- Liste des fichiers attachés -->
                <div id="coagulationAttachmentList" style="margin-top:12px;">
                    <!-- Les fichiers sélectionnés apparaîtront ici -->
                </div>
            </div>
        </div>
        
        <div class="modal-actions" style="display:flex;justify-content:flex-end;gap:18px;padding:24px;border-top:1px solid var(--border);background:transparent;">
            <button id="coagulationFormCancel" class="btn muted" style="padding:10px 32px;font-size:16px;">Annuler</button>
            <button id="coagulationFormSubmit" class="btn muted" style="padding:10px 32px;font-size:16px;">Enregistrer</button> 
            <button id="coagulationFormVerify" class="btn muted" style="padding:10px 32px;font-size:16px;">Vérifier</button>
        </div>
    </div>
</div>

<!-- Modal spécifique pour TEMPS DE SAIGNEMENT ET COAGULATION -->
<div class="modal" id="tempsSaignementModal" aria-hidden="true" style="z-index:101000;">
    <div class="modal-dialog" id="tempsSaignementDialog" style="width:96%;max-width:1200px;padding:36px;">
        <h3 id="tempsSaignementTitle" style="font-size:28px;margin-bottom:3px;font-weight:600;">TEMPS DE SAIGNEMENT ET COAGULATION - Saisir Résultats</h3>
        <div class="modal-body" id="tempsSaignementBody" style="padding:30px;font-size:17px;">
            <div id="tempsSaignementPatientSummary" style="margin-bottom:20px;"></div>

            <div style="display:flex;flex-direction:column;gap:12px;">
                <!-- TEMPS DE SAIGNEMENT -->
                <div data-tempsSaignement-param="TEMPS DE SAIGNEMENT" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:220px;font-size:15px;">TEMPS DE SAIGNEMENT</div>
                    <div style="color:#ccc;">:</div>
                    <select required class="tempsSaignement-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;">
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    <input type="text" required class="tempsSaignement-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;">
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="tempsSaignement-param-unite">---</span></div>
                    <div style="min-width:120px;color:#555;font-size:14px;"><span class="tempsSaignement-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="tempsSaignement-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple tempsSaignement-param-btn" style="padding:8px 12px;font-size:13px;" data-param="TEMPS DE SAIGNEMENT">➕</button>
                </div>

                <!-- TEMPS DE COAGULATION -->
                <div data-tempsSaignement-param="TEMPS DE COAGULATION" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:220px;font-size:15px;">TEMPS DE COAGULATION</div>
                    <div style="color:#ccc;">:</div>
                    <select required class="tempsSaignement-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;">
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    <input type="text" required class="tempsSaignement-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;">
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="tempsSaignement-param-unite">---</span></div>
                    <div style="min-width:120px;color:#555;font-size:14px;"><span class="tempsSaignement-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="tempsSaignement-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple tempsSaignement-param-btn" style="padding:8px 12px;font-size:13px;" data-param="TEMPS DE COAGULATION">➕</button>
                </div>
            </div>

            <!-- Section Commentaires avec Pièces jointes -->
            <div style="margin-top:20px;">
                <label style="display:block;font-weight:600;margin-bottom:10px;font-size:15px;color:#333;">Commentaires :</label>
                <div style="position:relative;">
                    <textarea id="tempsSaignementCommentsInput" placeholder="Entrez vos commentaires ici..." style="width:100%;min-height:90px;padding:12px;padding-top:40px;border:2px dashed #999;border-radius:6px;font-size:14px;font-family:Arial,sans-serif;resize:vertical;box-sizing:border-box;background:#f9f9f9;color:#666;"></textarea>
                    <button id="tempsSaignementAttachmentBtn" class="btn small purple" style="position:absolute;top:8px;left:8px;padding:6px 10px;font-size:12px;white-space:nowrap;height:auto;">📎</button>
                </div>
                <input type="file" id="tempsSaignementAttachmentInput" multiple style="display:none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt">
                <div id="tempsSaignementAttachmentList" style="margin-top:12px;"></div>
            </div>

        </div>
        <div class="modal-actions" style="display:flex;justify-content:flex-end;gap:18px;padding:24px;border-top:1px solid var(--border);background:transparent;">
            <button id="tempsSaignementCancel" class="btn muted" style="padding:10px 32px;font-size:16px;">Annuler</button>
            <button id="tempsSaignementSubmit" class="btn muted" style="padding:10px 32px;font-size:16px;">Enregistrer</button>
            <button id="tempsSaignementVerify" class="btn muted" style="padding:10px 32px;font-size:16px;">Vérifier</button>
        </div>
    </div>
</div>
<!-- Modal spécifique pour TEMPS DE PROTHROMBINE ET INR -->
<div class="modal" id="tpInrModal" aria-hidden="true" style="z-index:101000;">
    <div class="modal-dialog" id="tpInrDialog" style="width:96%;max-width:1200px;padding:36px;">
        <h3 id="tpInrTitle" style="font-size:28px;margin-bottom:3px;font-weight:600;">TEMPS DE PROTHROMBINE ET INR - Saisir Résultats</h3>
        <div class="modal-body" id="tpInrBody" style="padding:30px;font-size:17px;">
            <div id="tpInrPatientSummary" style="margin-bottom:20px;"></div>

            <div style="display:flex;flex-direction:column;gap:12px;">
                <!-- PROTHROMBINE -->
                <div data-tpInr-param="PROTHROMBINE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:220px;font-size:15px;">PROTHROMBINE</div>
                    <div style="color:#ccc;">:</div>
                    <select required class="tpInr-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;">
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    <input type="text" required class="tpInr-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;">
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="tpInr-param-unite">---</span></div>
                    <div style="min-width:120px;color:#555;font-size:14px;"><span class="tpInr-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="tpInr-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple tpInr-param-btn" style="padding:8px 12px;font-size:13px;" data-param="PROTHROMBINE">➕</button>
                </div>

                <!-- INR -->
                <div data-tpInr-param="INR" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:220px;font-size:15px;">INR</div>
                    <div style="color:#ccc;">:</div>
                    <select required class="tpInr-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;">
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    <input type="text" required class="tpInr-param-valeur" placeholder="Valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:100px;text-align:center;height:28px;line-height:1;">
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="tpInr-param-unite">---</span></div>
                    <div style="min-width:120px;color:#555;font-size:14px;"><span class="tpInr-param-range">---</span></div>
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="tpInr-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple tpInr-param-btn" style="padding:8px 12px;font-size:13px;" data-param="INR">➕</button>
                </div>
            </div>

            <!-- Section Commentaires avec Pièces jointes -->
            <div style="margin-top:20px;">
                <label style="display:block;font-weight:600;margin-bottom:10px;font-size:15px;color:#333;">Commentaires :</label>
                <div style="position:relative;">
                    <textarea id="tpInrCommentsInput" placeholder="Entrez vos commentaires ici..." style="width:100%;min-height:90px;padding:12px;padding-top:40px;border:2px dashed #999;border-radius:6px;font-size:14px;font-family:Arial,sans-serif;resize:vertical;box-sizing:border-box;background:#f9f9f9;color:#666;"></textarea>
                    <button id="tpInrAttachmentBtn" class="btn small purple" style="position:absolute;top:8px;left:8px;padding:6px 10px;font-size:12px;white-space:nowrap;height:auto;">📎</button>
                </div>
                <input type="file" id="tpInrAttachmentInput" multiple style="display:none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt">
                <div id="tpInrAttachmentList" style="margin-top:12px;"></div>
            </div>

        </div>
        <div class="modal-actions" style="display:flex;justify-content:flex-end;gap:18px;padding:24px;border-top:1px solid var(--border);background:transparent;">
            <button id="tpInrCancel" class="btn muted" style="padding:10px 32px;font-size:16px;">Annuler</button>
            <button id="tpInrSubmit" class="btn muted" style="padding:10px 32px;font-size:16px;">Enregistrer</button>
            <button id="tpInrVerify" class="btn muted" style="padding:10px 32px;font-size:16px;">Vérifier</button>
        </div>
    </div>
</div>

<!-- Modal spécifique pour HEMOCULTURE -->
<div class="modal" id="hemocultureFormModal" aria-hidden="true" style="z-index:101000;">
  <div class="modal-dialog" id="hemocultureFormDialog" style="width:96%;max-width:1200px;padding:36px;">
    <h3 id="hemocultureFormTitle" style="font-size:28px;margin-bottom:3px;font-weight:600;">Saisir Résultat</h3>
    
    <div class="modal-body" id="hemocultureFormBody" style="padding:30px;font-size:17px;">
      <div id="hemocultureFormPatientSummary" style="margin-bottom:20px;"></div>
      
      <div style="display:flex;flex-direction:column;gap:12px;">
        <!-- DATE DE COLLECTE -->
        <div data-hemoculture-param="DATE DE COLLECTE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
          <div style="font-weight:600;min-width:160px;font-size:15px;">DATE DE COLLECTE</div>
          <div style="color:#ccc;">:</div>
          <input type="date" required class="hemoculture-param-valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;height:28px;">
          <span class="hemoculture-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
          <span class="hemoculture-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
          <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
            <input type="checkbox" class="hemoculture-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
            <span>Not Required ?</span>
          </label>
          <button class="btn small purple hemoculture-param-btn" data-param="DATE DE COLLECTE">➕</button>
        </div>

        <!-- DATE DE RECEPTION -->
        <div data-hemoculture-param="DATE DE RECEPTION" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
          <div style="font-weight:600;min-width:160px;font-size:15px;">DATE DE RECEPTION</div>
          <div style="color:#ccc;">:</div>
          <input type="date" required class="hemoculture-param-valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;height:28px;">
          <span class="hemoculture-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
          <span class="hemoculture-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
          <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
            <input type="checkbox" class="hemoculture-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
            <span>Not Required ?</span>
          </label>
          <button class="btn small purple hemoculture-param-btn" data-param="DATE DE RECEPTION">➕</button>
        </div>

        <!-- DATE FINALE -->
        <div data-hemoculture-param="DATE FINALE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
          <div style="font-weight:600;min-width:160px;font-size:15px;">DATE FINALE</div>
          <div style="color:#ccc;">:</div>
          <input type="date" required class="hemoculture-param-valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;height:28px;">
          <span class="hemoculture-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
          <span class="hemoculture-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
          <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
            <input type="checkbox" class="hemoculture-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
            <span>Not Required ?</span>
          </label>
          <button class="btn small purple hemoculture-param-btn" data-param="DATE FINALE">➕</button>
        </div>

        <!-- SPECIMEN -->
        <div data-hemoculture-param="SPECIMEN" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
          <div style="font-weight:600;min-width:160px;font-size:15px;">SPECIMEN</div>
          <div style="color:#ccc;">:</div>
          <input type="text" required class="hemoculture-param-valeur" placeholder="Ex: Sang" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;">
          <span class="hemoculture-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
          <span class="hemoculture-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
          <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
            <input type="checkbox" class="hemoculture-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
            <span>Not Required ?</span>
          </label>
          <button class="btn small purple hemoculture-param-btn" data-param="SPECIMEN">➕</button>
        </div>

        <!-- QUALITE D'ECHANTILLON -->
        <div data-hemoculture-param="QUALITE D'ECHANTILLON" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
          <div style="font-weight:600;min-width:160px;font-size:15px;">QUALITE D'ECHANTILLON</div>
          <div style="color:#ccc;">:</div>
          <select required class="hemoculture-param-valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;">
            <option value="">-- Sélectionner --</option>
            <option value="Normal">Normal</option>
            <option value="Anormal">Anormal</option>
            <option value="AUTRES">Autres</option>
          </select>
          <input type="text" required class="hemoculture-param-autres" placeholder="Préciser autres..." style="display:none;margin-left:8px;padding:5px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;">
          <span class="hemoculture-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
          <span class="hemoculture-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
          <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
            <input type="checkbox" class="hemoculture-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
            <span>Not Required ?</span>
          </label>
          <button class="btn small purple hemoculture-param-btn" data-param="QUALITE D'ECHANTILLON">➕</button>
        </div>

        <!-- VOLUME -->
        <div data-hemoculture-param="VOLUME" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
          <div style="font-weight:600;min-width:160px;font-size:15px;">VOLUME</div>
          <div style="color:#ccc;">:</div>
          <input type="text" required class="hemoculture-param-valeur" placeholder="Ex: 5mL" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;">
          <span class="hemoculture-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
          <span class="hemoculture-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
          <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
            <input type="checkbox" class="hemoculture-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
            <span>Not Required ?</span>
          </label>
          <button class="btn small purple hemoculture-param-btn" data-param="VOLUME">➕</button>
        </div>

        <!-- CULTURE FINALE -->
        <div data-hemoculture-param="CULTURE FINALE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
          <div style="font-weight:600;min-width:160px;font-size:15px;">CULTURE FINALE</div>
          <div style="color:#ccc;">:</div>
          <select required class="hemoculture-param-valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;">
            <option value="">-- Sélectionner --</option>
            <option value="Négatif">Négatif</option>
            <option value="Positif">Positif</option>
            <option value="AUTRES">Autres</option>
          </select>
          <input type="text" required class="hemoculture-param-autres" placeholder="Préciser autres..." style="display:none;margin-left:8px;padding:5px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;">
          <span class="hemoculture-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
          <span class="hemoculture-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
          <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
            <input type="checkbox" class="hemoculture-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
            <span>Not Required ?</span>
          </label>
          <button class="btn small purple hemoculture-param-btn" data-param="CULTURE FINALE">➕</button>
        </div>

        <!-- GRAM -->
        <div data-hemoculture-param="GRAM" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
          <div style="font-weight:600;min-width:160px;font-size:15px;">GRAM</div>
          <div style="color:#ccc;">:</div>
          <input type="text" required class="hemoculture-param-valeur" placeholder="Ex: Coque Gram positif" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;">
          <span class="hemoculture-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
          <span class="hemoculture-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
          <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
            <input type="checkbox" class="hemoculture-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
            <span>Not Required ?</span>
          </label>
          <button class="btn small purple hemoculture-param-btn" data-param="GRAM">➕</button>
        </div>

        <!-- DENOBREMENT -->
        <div data-hemoculture-param="DENOBREMENT" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
          <div style="font-weight:600;min-width:160px;font-size:15px;">DENOBREMENT</div>
          <div style="color:#ccc;">:</div>
          <input type="text" required class="hemoculture-param-valeur" placeholder="Ex: 1000 CFU/mL" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;">
          <span class="hemoculture-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
          <span class="hemoculture-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
          <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
            <input type="checkbox" class="hemoculture-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
            <span>Not Required ?</span>
          </label>
          <button class="btn small purple hemoculture-param-btn" data-param="DENOBREMENT">➕</button>
        </div>

        <!-- GERME ISOLE -->
        <div data-hemoculture-param="GERME ISOLE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
          <div style="font-weight:600;min-width:160px;font-size:15px;">GERME ISOLE</div>
          <div style="color:#ccc;">:</div>
          <input type="text" required class="hemoculture-param-valeur" placeholder="Ex: Staphylococcus aureus" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;">
          <span class="hemoculture-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
          <span class="hemoculture-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
          <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
            <input type="checkbox" class="hemoculture-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
            <span>Not Required ?</span>
          </label>
          <button class="btn small purple hemoculture-param-btn" data-param="GERME ISOLE">➕</button>
        </div>
      </div>

      <!-- Section Commentaires avec Pièces jointes -->
      <div style="margin-top:20px;">
        <label style="display:block;font-weight:600;margin-bottom:10px;font-size:15px;color:#333;">Commentaires :</label>
        <div style="position:relative;">
          <textarea id="hemocultureCommentsInput" placeholder="Entrez vos commentaires ici..." style="width:100%;min-height:90px;padding:12px;padding-top:40px;border:2px dashed #999;border-radius:6px;font-size:14px;font-family:Arial,sans-serif;resize:vertical;box-sizing:border-box;background:#f9f9f9;color:#666;"></textarea>
          <button id="hemocultureAttachmentBtn" class="btn small purple" style="position:absolute;top:8px;left:8px;padding:6px 10px;font-size:12px;white-space:nowrap;height:auto;">📎</button>
        </div>

        <input type="file" id="hemocultureAttachmentInput" multiple style="display:none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt">
        <div id="hemocultureAttachmentList" style="margin-top:12px;"></div>
      </div>
    </div>

    <div class="modal-actions" style="display:flex;justify-content:flex-end;gap:18px;padding:24px;border-top:1px solid var(--border);background:transparent;">
      <button id="hemocultureFormCancel" class="btn muted" style="padding:10px 32px;font-size:16px;">Annuler</button>
      <button id="hemocultureFormSubmit" class="btn muted" style="padding:10px 32px;font-size:16px;">Enregistrer</button>
      <button id="hemocultureFormVerify" class="btn muted" style="padding:10px 32px;font-size:16px;">Vérifier</button>
    </div>
  </div>
</div>

<!-- Modal spécifique pour COPROCULTURE -->
<div class="modal" id="coprocultureFormModal" aria-hidden="true" style="z-index:101000;">
  <div class="modal-dialog" id="coprocultureFormDialog" style="width:96%;max-width:1200px;padding:36px;">
    <h3 id="coprocultureFormTitle" style="font-size:28px;margin-bottom:3px;font-weight:600;">Saisir Résultat</h3>
    
    <div class="modal-body" id="coprocultureFormBody" style="padding:30px;font-size:17px;">
      <div id="coprocultureFormPatientSummary" style="margin-bottom:20px;"></div>
      
      <div style="display:flex;flex-direction:column;gap:12px;">
        <!-- DATE DE COLLECTE -->
        <div data-coproculture-param="DATE DE COLLECTE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
          <div style="font-weight:600;min-width:160px;font-size:15px;">DATE DE COLLECTE</div>
          <div style="color:#ccc;">:</div>
          <input type="date" required class="coproculture-param-valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;height:28px;">
          <span class="coproculture-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
          <span class="coproculture-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
          <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
            <input type="checkbox" class="coproculture-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
            <span>Not Required ?</span>
          </label>
          <button class="btn small purple coproculture-param-btn" data-param="DATE DE COLLECTE">➕</button>
        </div>

        <!-- DATE DE RECEPTION -->
        <div data-coproculture-param="DATE DE RECEPTION" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
          <div style="font-weight:600;min-width:160px;font-size:15px;">DATE DE RECEPTION</div>
          <div style="color:#ccc;">:</div>
          <input type="date" required class="coproculture-param-valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;height:28px;">
          <span class="coproculture-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
          <span class="coproculture-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
          <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
            <input type="checkbox" class="coproculture-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
            <span>Not Required ?</span>
          </label>
          <button class="btn small purple coproculture-param-btn" data-param="DATE DE RECEPTION">➕</button>
        </div>

        <!-- DATE FINALE -->
        <div data-coproculture-param="DATE FINALE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
          <div style="font-weight:600;min-width:160px;font-size:15px;">DATE FINALE</div>
          <div style="color:#ccc;">:</div>
          <input type="date" required class="coproculture-param-valeur" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;height:28px;">
          <span class="coproculture-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
          <span class="coproculture-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
          <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
            <input type="checkbox" class="coproculture-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
            <span>Not Required ?</span>
          </label>
          <button class="btn small purple coproculture-param-btn" data-param="DATE FINALE">➕</button>
        </div>

        <!-- SOURCE DES SPECIMEN -->
        <div data-coproculture-param="SOURCE DES SPECIMEN" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
          <div style="font-weight:600;min-width:160px;font-size:15px;">SOURCE DES SPECIMEN</div>
          <div style="color:#ccc;">:</div>
          <input type="text" required class="coproculture-param-valeur" placeholder="Ex: Fèces" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;">
          <span class="coproculture-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
          <span class="coproculture-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
          <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
            <input type="checkbox" class="coproculture-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
            <span>Not Required ?</span>
          </label>
          <button class="btn small purple coproculture-param-btn" data-param="SOURCE DES SPECIMEN">➕</button>
        </div>

        <!-- COLORATION DE GRAM -->
        <div data-coproculture-param="COLORATION DE GRAM" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
          <div style="font-weight:600;min-width:160px;font-size:15px;">COLORATION DE GRAM</div>
          <div style="color:#ccc;">:</div>
          <input type="text" required class="coproculture-param-valeur" placeholder="Ex: Gram négatif" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;">
          <span class="coproculture-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
          <span class="coproculture-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
          <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
            <input type="checkbox" class="coproculture-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
            <span>Not Required ?</span>
          </label>
          <button class="btn small purple coproculture-param-btn" data-param="COLORATION DE GRAM">➕</button>
        </div>

        <!-- CULTURE -->
        <div data-coproculture-param="CULTURE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
          <div style="font-weight:600;min-width:160px;font-size:15px;">CULTURE</div>
          <div style="color:#ccc;">:</div>
          <select class="coproculture-param-valeur" required style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;">
            <option value="">-- Sélectionner --</option>
            <option value="Négatif">Négatif</option>
            <option value="Positif">Positif</option>
            <option value="AUTRES">Autres</option>
          </select>
          <input type="text" required class="coproculture-param-autres" placeholder="Préciser autres..." style="display:none;margin-left:8px;padding:5px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;">
          <span class="coproculture-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
          <span class="coproculture-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
          <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
            <input type="checkbox" class="coproculture-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
            <span>Not Required ?</span>
          </label>
          <button class="btn small purple coproculture-param-btn" data-param="CULTURE">➕</button>
        </div>

        <!-- GERME ISOLE -->
        <div data-coproculture-param="GERME ISOLE" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
          <div style="font-weight:600;min-width:160px;font-size:15px;">GERME ISOLE</div>
          <div style="color:#ccc;">:</div>
          <input type="text" required class="coproculture-param-valeur" placeholder="Ex: Escherichia coli" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;">
          <span class="coproculture-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
          <span class="coproculture-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
          <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
            <input type="checkbox" class="coproculture-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
            <span>Not Required ?</span>
          </label>
          <button class="btn small purple coproculture-param-btn" data-param="GERME ISOLE">➕</button>
        </div>

        <!-- DENOBREMENT -->
        <div data-coproculture-param="DENOBREMENT" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
          <div style="font-weight:600;min-width:160px;font-size:15px;">DENOBREMENT</div>
          <div style="color:#ccc;">:</div>
          <input type="text" required class="coproculture-param-valeur" placeholder="Ex: 1000 CFU/g" style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:160px;">
          <span class="coproculture-param-unite" style="min-width:80px;text-align:center;font-size:12px;">---</span>
          <span class="coproculture-param-range" style="min-width:120px;text-align:center;font-size:12px;color:#666;">---</span>
          <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;margin-left:auto;">
            <input type="checkbox" class="coproculture-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;">
            <span>Not Required ?</span>
          </label>
          <button class="btn small purple coproculture-param-btn" data-param="DENOBREMENT">➕</button>
        </div>
      </div>

      <!-- Section Commentaires avec Pièces jointes -->
      <div style="margin-top:20px;">
        <label style="display:block;font-weight:600;margin-bottom:10px;font-size:15px;color:#333;">Commentaires :</label>
        <div style="position:relative;">
          <textarea id="coprocultureCommentsInput" placeholder="Entrez vos commentaires ici..." style="width:100%;min-height:90px;padding:12px;padding-top:40px;border:2px dashed #999;border-radius:6px;font-size:14px;font-family:Arial,sans-serif;resize:vertical;box-sizing:border-box;background:#f9f9f9;color:#666;"></textarea>
          <button id="coprocultureAttachmentBtn" class="btn small purple" style="position:absolute;top:8px;left:8px;padding:6px 10px;font-size:12px;white-space:nowrap;height:auto;">📎</button>
        </div>

        <input type="file" id="coprocultureAttachmentInput" multiple style="display:none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt">
        <div id="coprocultureAttachmentList" style="margin-top:12px;"></div>
      </div>
    </div>

    <div class="modal-actions" style="display:flex;justify-content:flex-end;gap:18px;padding:24px;border-top:1px solid var(--border);background:transparent;">
      <button id="coprocultureFormCancel" class="btn muted" style="padding:10px 32px;font-size:16px;">Annuler</button>
      <button id="coprocultureFormSubmit" class="btn muted" style="padding:10px 32px;font-size:16px;">Enregistrer</button>
      <button id="coprocultureFormVerify" class="btn muted" style="padding:10px 32px;font-size:16px;">Vérifier</button>
    </div>
  </div>
</div>

<!-- Modal pour VALEUR ABSOLU DES EOSINOPHILES (EOSINOPHILES) -->
<div class="modal" id="valeurAbsoluEosinophilesModal" aria-hidden="true" style="z-index:101000;">
    <div class="modal-dialog" id="valeurAbsoluEosinophilesDialog" style="width:96%;max-width:1200px;padding:36px;">
        <h3 id="valeurAbsoluEosinophilesTitle" style="font-size:28px;margin-bottom:3px;font-weight:600;">VALEUR ABSOLU DES EOSINOPHILES (EOSINOPHILES) - Saisir Résultat</h3>
        
        <div class="modal-body" id="valeurAbsoluEosinophilesBody" style="padding:30px;font-size:17px;">
            <!-- Patient summary sera inséré ici -->
            <div id="valeurAbsoluEosinophilesPatientSummary" style="margin-bottom:20px;"></div>
            
            <!-- Formulaire avec trois paramètres en lignes -->
            <div style="display:flex;flex-direction:column;gap:12px;">
                <!-- GLOBULES BLANCS -->
                <div data-valeurAbsoluEosinophiles-param="GLOBULES BLANCS" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">GLOBULES BLANCS</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Flag dropdown -->
                    <select required class="valeurAbsoluEosinophiles-param-flag" required style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    
                    <!-- Résultat input -->
                    <input type="text" class="valeurAbsoluEosinophiles-param-valeur" placeholder="Valeur" required
                        required style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;">
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="valeurAbsoluEosinophiles-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="valeurAbsoluEosinophiles-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="valeurAbsoluEosinophiles-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple valeurAbsoluEosinophiles-param-btn" style="padding:8px 12px;font-size:13px;" data-param="GLOBULES BLANCS">➕</button>
                </div>

                <!-- POURCENTAGE DES EOSINOPHILES -->
                <div data-valeurAbsoluEosinophiles-param="POURCENTAGE DES EOSINOPHILES" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">POURCENTAGE DES EOSINOPHILES</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Flag dropdown -->
                    <select required class="valeurAbsoluEosinophiles-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    
                    <!-- Résultat input -->
                    <input type="text" class="valeurAbsoluEosinophiles-param-valeur" placeholder="Valeur"
                        required style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;">
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="valeurAbsoluEosinophiles-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="valeurAbsoluEosinophiles-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="valeurAbsoluEosinophiles-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple valeurAbsoluEosinophiles-param-btn" style="padding:8px 12px;font-size:13px;" data-param="POURCENTAGE DES EOSINOPHILES">➕</button>
                </div>

                <!-- VALEUR ABSOLU DES EOSINOPHILES -->
                <div data-valeurAbsoluEosinophiles-param="VALEUR ABSOLU DES EOSINOPHILES" style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">
                    <div style="font-weight:600;min-width:160px;font-size:15px;">VALEUR ABSOLU DES EOSINOPHILES</div>
                    <div style="color:#ccc;">:</div>
                    
                    <!-- Flag dropdown -->
                    <select required class="valeurAbsoluEosinophiles-param-flag" style="padding:3px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;min-width:60px;height:28px;line-height:1;margin-left:20px;" required>
                        <option value="">---</option>
                        <option value="B">B</option>
                        <option value="H">H</option>
                        <option value="L">L</option>
                    </select>
                    
                    <!-- Résultat input -->
                    <input type="text" class="valeurAbsoluEosinophiles-param-valeur" placeholder="Valeur"
                        required style="padding:5px 6px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:80px;text-align:center;height:28px;line-height:1;">
                    
                    <!-- Unité -->
                    <div style="min-width:60px;color:#555;font-size:14px;"><span class="valeurAbsoluEosinophiles-param-unite">---</span></div>
                    
                    <!-- Range usuelle -->
                    <div style="min-width:80px;color:#555;font-size:14px;"><span class="valeurAbsoluEosinophiles-param-range">---</span></div>
                    
                    <!-- Checkbox Not Required -->
                    <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#333;min-width:0;cursor:pointer;height:28px;margin-left:auto;margin-right:12px;">
                        <input type="checkbox" class="valeurAbsoluEosinophiles-param-notRequired" style="width:14px;height:14px;margin:0;border:1px solid #d0d0d0;background:#fff;vertical-align:middle;display:inline-block;">
                        <span style="color:#333;font-size:14px;line-height:1;display:inline-block;">Not Required ?</span>
                    </label>
                    <button class="btn small purple valeurAbsoluEosinophiles-param-btn" style="padding:8px 12px;font-size:13px;" data-param="VALEUR ABSOLU DES EOSINOPHILES">➕</button>
                </div>
            </div>
            
            <!-- Section Commentaires avec Pièces jointes -->
            <div style="margin-top:20px;">
                <label style="display:block;font-weight:600;margin-bottom:10px;font-size:15px;color:#333;">Commentaires :</label>
                <div style="position:relative;">
                    <textarea id="valeurAbsoluEosinophilesCommentsInput" placeholder="Entrez vos commentaires ici..." style="width:100%;min-height:90px;padding:12px;padding-top:40px;border:2px dashed #999;border-radius:6px;font-size:14px;font-family:Arial,sans-serif;resize:vertical;box-sizing:border-box;background:#f9f9f9;color:#666;"></textarea>
                    <button id="valeurAbsoluEosinophilesAttachmentBtn" class="btn small purple" style="position:absolute;top:8px;left:8px;padding:6px 10px;font-size:12px;white-space:nowrap;height:auto;">📎</button>
                </div>
                
                <!-- Input file caché -->
                <input type="file" id="valeurAbsoluEosinophilesAttachmentInput" multiple style="display:none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt">
                
                <!-- Liste des fichiers attachés -->
                <div id="valeurAbsoluEosinophilesAttachmentList" style="margin-top:12px;">
                    <!-- Les fichiers sélectionnés apparaîtront ici -->
                </div>
            </div>
        </div>
        
        <div class="modal-actions" style="display:flex;justify-content:flex-end;gap:18px;padding:24px;border-top:1px solid var(--border);background:transparent;">
            <button id="valeurAbsoluEosinophilesCancel" class="btn muted" style="padding:10px 32px;font-size:16px;">Annuler</button>
            <button id="valeurAbsoluEosinophilesSubmit" class="btn muted" style="padding:10px 32px;font-size:16px;">Enregistrer</button> 
            <button id="valeurAbsoluEosinophilesVerify" class="btn muted" style="padding:10px 32px;font-size:16px;">Vérifier</button>
        </div>
    </div>
</div>


