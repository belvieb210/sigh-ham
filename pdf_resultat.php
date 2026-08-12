<?php
/**
 * Génération de rapports PDF pour les résultats d'examens de laboratoire
 * Utilise la bibliothèque FPDF pour créer des rapports formatés
 *
 * Espace réservé :
 * - 40 unités en haut du papier
 * - 30 unités en bas du papier
 */

require_once 'fpdf186/fpdf.php';
require_once 'db.php';
require_once 'lib/qrcode.php';
//affichage des erreurs
// ====================== DEBUG ERREURS FORT - À METTRE EN HAUT DU FICHIER ======================
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

error_log("=== PDF_RESULTAT.PHP CHARGÉ AVEC DEBUG MAX ===");
// ============================================================================================
// Configuration des marges PDF
define('PDF_TOP_MARGIN', 40);    // Espace en haut
define('PDF_BOTTOM_MARGIN', 25); // Espace en bas
define('PDF_LEFT_MARGIN', 15);   // Marge gauche
define('PDF_RIGHT_MARGIN', 15);  // Marge droite
define('PDF_FONT_SIZE_SMALL', 8); // Taille de police petite pour grilles compactes
/** Dossier de stockage des ZIP et PDF consolidés (même répertoire que ce script) */
define('PDF_DOCUMENTS_PATIENTS_DIR', __DIR__ . DIRECTORY_SEPARATOR . 'documentsPatients');

/**
 * Crée le dossier documentsPatients et un .htaccess pour bloquer l'accès HTTP direct (Apache).
 *
 * @return string|false Chemin absolu du dossier ou false
 */
function pdf_ensure_documents_patients_dir() {
    $dir = PDF_DOCUMENTS_PATIENTS_DIR;
    if (!is_dir($dir)) {
        if (!@mkdir($dir, 0755, true)) {
            error_log('pdf_ensure_documents_patients_dir: impossible de créer ' . $dir);
            return false;
        }
    }
    $ht = $dir . DIRECTORY_SEPARATOR . '.htaccess';
    if (!is_file($ht)) {
        $rules = "<IfModule mod_authz_core.c>\n    Require all denied\n</IfModule>\n"
            . "<IfModule !mod_authz_core.c>\n    Order deny,allow\n    Deny from all\n</IfModule>\n";
        @file_put_contents($ht, $rules);
    }
    return is_dir($dir) ? $dir : false;
}

/**
 * Enregistre une copie du ZIP sur le disque (documentsPatients).
 *
 * @return bool true si le fichier a bien été écrit
 */
function pdf_save_zip_to_documents_patients($zipBinary, $zipFilename) {
    $zipFilename = basename(str_replace(["\0", '/', '\\'], '', (string) $zipFilename));
    if ($zipFilename === '' || strcasecmp(substr($zipFilename, -4), '.zip') !== 0) {
        return false;
    }
    $dir = pdf_ensure_documents_patients_dir();
    if ($dir === false) {
        return false;
    }
    $path = $dir . DIRECTORY_SEPARATOR . $zipFilename;
    $written = @file_put_contents($path, $zipBinary);
    if ($written === false) {
        error_log('pdf_save_zip_to_documents_patients: échec écriture ' . $path);
        return false;
    }
    return true;
}

/**
 * Enregistre une copie du PDF consolidé sur le disque (documentsPatients).
 * Utilisé pour l’aperçu « Imprimer PDF compilé » (GET inline) et le téléchargement PDF seul.
 *
 * @return bool true si le fichier a bien été écrit
 */
function pdf_save_pdf_to_documents_patients($pdfBinary, $pdfFilename) {
    $pdfFilename = basename(str_replace(["\0", '/', '\\'], '', (string) $pdfFilename));
    if ($pdfFilename === '' || strcasecmp(substr($pdfFilename, -4), '.pdf') !== 0) {
        return false;
    }
    $dir = pdf_ensure_documents_patients_dir();
    if ($dir === false) {
        return false;
    }
    $path = $dir . DIRECTORY_SEPARATOR . $pdfFilename;
    $written = @file_put_contents($path, $pdfBinary);
    if ($written === false) {
        error_log('pdf_save_pdf_to_documents_patients: échec écriture ' . $path);
        return false;
    }
    return true;
}

/**
 * Segment de nom de fichier (sans espaces / accents problématiques pour Content-Disposition).
 */
function pdf_sanitize_filename_segment($s) {
    $s = trim((string) $s);
    if ($s === '') {
        return '';
    }
    if (function_exists('iconv')) {
        $t = @iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $s);
        if ($t !== false && $t !== '') {
            $s = $t;
        }
    }
    $s = preg_replace('/[^a-zA-Z0-9]+/', '_', $s);
    return trim($s, '_');
}

/**
 * Préfixe Nom_Prenom depuis la table patients.
 */
function pdf_patient_name_prefix_for_filename($pdo, $patientId) {
    $patientId = (int) $patientId;
    if ($patientId <= 0) {
        return 'patient_' . max(0, $patientId);
    }
    try {
        $stmt = $pdo->prepare('SELECT nom, prenom FROM patients WHERE id = ? LIMIT 1');
        $stmt->execute([$patientId]);
        $r = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$r) {
            return 'patient_' . $patientId;
        }
        $nom = pdf_sanitize_filename_segment($r['nom'] ?? '');
        $pre = pdf_sanitize_filename_segment($r['prenom'] ?? '');
        $part = trim($nom . '_' . $pre, '_');
        return $part !== '' ? $part : ('patient_' . $patientId);
    } catch (Exception $e) {
        return 'patient_' . $patientId;
    }
}

/**
 * Nom de fichier téléchargé / onglet : Nom_Prenom_YYYY-mm-dd_Hi_suffix.pdf
 */
function pdf_build_download_filename($pdo, $patientId, $suffixBase) {
    $prefix = pdf_patient_name_prefix_for_filename($pdo, $patientId);
    $suffixBase = pdf_sanitize_filename_segment($suffixBase);
    if ($suffixBase === '') {
        $suffixBase = 'resultat';
    }
    return $prefix . '_' . date('Y-m-d_Hi') . '_' . $suffixBase . '.pdf';
}

/**
 * Suffixe type d'examen pour le nom de fichier (sans préfixe patient ni date).
 */
function pdf_mono_exam_filename_stem($examType, $examId) {
    $examTypeLower = strtolower((string) $examType);
    $examId = (int) $examId;
    $stem = 'resultat_examen_' . $examId;
    if ($examTypeLower === 'spermogramme') {
        $stem = 'spermogramme_' . $examId;
    } elseif ($examTypeLower === 'ionogramme') {
        $stem = 'ionogramme_' . $examId;
    } elseif ($examTypeLower === 'nfl') {
        $stem = 'nfl_' . $examId;
    } elseif ($examTypeLower === 'nfs' || $examTypeLower === 'hematologie' || strpos($examTypeLower, 'hemogramme') !== false || $examTypeLower === 'hb_hct' || strpos($examTypeLower, 'hb_hct') !== false) {
        $stem = 'hemogramme_' . $examId;
    } elseif ($examTypeLower === 'electrophorese' || strpos($examTypeLower, 'electrophorese') !== false || strpos($examTypeLower, 'électrophor') !== false) {
        $stem = 'electrophorese_' . $examId;
    } elseif ($examTypeLower === 'reticulocyte' || strpos($examTypeLower, 'reticulocyte') !== false) {
        $stem = 'reticulocyte_' . $examId;
    } elseif ($examTypeLower === 'spot_urines') {
        $stem = 'spoturines_' . $examId;
    } elseif ($examTypeLower === 'proteinurie24' || $examTypeLower === 'ppt') {
        $stem = 'proteinurie24_' . $examId;
    } elseif ($examTypeLower === 'bilans_azotes') {
        $stem = 'azt_' . $examId;
    } elseif ($examTypeLower === 'bilirubi' || strpos($examTypeLower, 'bilirubine') !== false) {
        $stem = 'bilirubi_' . $examId;
    } elseif ($examTypeLower === 'profil_lipidique') {
        $stem = 'plf_' . $examId;
    } elseif ($examTypeLower === 'rivalta' || strpos($examTypeLower, 'rivalta') !== false) {
        $stem = 'rivalta_' . $examId;
    } elseif ($examTypeLower === 'proteine_binces_jones' || $examTypeLower === 'proteine de binces-jones' || strpos($examTypeLower, 'binces') !== false) {
        $stem = 'proteine_binces_jones_' . $examId;
    } elseif ($examTypeLower === 'trypanosomiase' || strpos($examTypeLower, 'trypanosomiase') !== false) {
        $stem = 'trypanosomiase_' . $examId;
    } elseif ($examTypeLower === 'sang_occulte' || $examTypeLower === 'sang occulte' || strpos($examTypeLower, 'sang occulte') !== false) {
        $stem = 'sang_occulte_' . $examId;
    } elseif ($examTypeLower === 'chargeviral' || $examTypeLower === 'charge_viral' || $examTypeLower === 'charge viral' || strpos($examTypeLower, 'charge') !== false) {
        $stem = 'charge_viral_' . $examId;
    } elseif (
        $examTypeLower === 'malaria_tdr' ||
        $examTypeLower === 'malaria tdr' ||
        strpos($examTypeLower, 'tdr') !== false ||
        strpos($examTypeLower, 'malaria_ge') !== false ||
        strpos($examTypeLower, 'goutte') !== false
    ) {
        $stem = 'malaria_tdr_' . $examId;
    } elseif ($examTypeLower === 'malaria' || $examTypeLower === 'malaria teste rapide' || strpos($examTypeLower, 'malaria') !== false) {
        $stem = 'malaria_' . $examId;
    } elseif ($examTypeLower === 'histopathologie' || strpos($examTypeLower, 'histopathologie') !== false) {
        $stem = 'histopathologie_' . $examId;
    } elseif (in_array($examTypeLower, ['biocliahorm', 'biochimie', 'clia', 'hormones'], true) || strpos($examTypeLower, 'immuno') !== false) {
        $stem = 'biocliahorm_' . $examId;
    }
    return $stem;
}

/**
 * Envoie une archive ZIP contenant un seul PDF (téléchargement direct).
 *
 * @param string $pdfBinary       Contenu binaire du PDF
 * @param string $innerPdfName    Nom du fichier à l'intérieur du ZIP (ex. Dupont_Jean_2025-03-23_1430_examens_consolides.pdf)
 * @param string $zipDownloadName Nom du fichier .zip proposé au navigateur
 * @return bool true si la réponse a été envoyée, false si ZipArchive indisponible ou erreur
 */
function pdf_stream_zip_with_pdf($pdfBinary, $innerPdfName, $zipDownloadName) {
    if (!class_exists('ZipArchive')) {
        return false;
    }
    $innerPdfName = basename(str_replace(["\0", '/', '\\'], '', (string) $innerPdfName));
    if ($innerPdfName === '' || strcasecmp(substr($innerPdfName, -4), '.pdf') !== 0) {
        $innerPdfName = 'resultat_consolide.pdf';
    }
    $zipDownloadName = basename(str_replace(["\0", '/', '\\'], '', (string) $zipDownloadName));
    if ($zipDownloadName === '' || strcasecmp(substr($zipDownloadName, -4), '.zip') !== 0) {
        $zipDownloadName = pathinfo($innerPdfName, PATHINFO_FILENAME) . '.zip';
    }

    $tmpZip = tempnam(sys_get_temp_dir(), 'ham_pdf_zip_');
    if ($tmpZip === false) {
        return false;
    }
    $zip = new ZipArchive();
    if ($zip->open($tmpZip, ZipArchive::OVERWRITE | ZipArchive::CREATE) !== true) {
        @unlink($tmpZip);
        return false;
    }
    $zip->addFromString($innerPdfName, $pdfBinary);
    $zip->close();

    $data = @file_get_contents($tmpZip);
    @unlink($tmpZip);
    if ($data === false) {
        return false;
    }

    // Copie sur le serveur (dossier documentsPatients)
    if (!pdf_save_zip_to_documents_patients($data, $zipDownloadName)) {
        error_log('pdf_stream_zip_with_pdf: sauvegarde locale ignorée ou échouée pour ' . $zipDownloadName);
    }

    header('Content-Type: application/zip');
    header('Content-Disposition: attachment; filename="' . $zipDownloadName . '"');
    header('Content-Length: ' . strlen($data));
    echo $data;
    return true;
}

function safe_image_flatten_for_fpdf($sourcePath) {
    if (!file_exists($sourcePath)) {
        return false;
    }
    $tmp = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'img_flat_' . md5($sourcePath . microtime(true)) . '.png';

    // Try with GD if available
    if (function_exists('imagecreatefrompng')) {
        $img = @imagecreatefrompng($sourcePath);
        if ($img) {
            $w = imagesx($img);
            $h = imagesy($img);
            $dst = imagecreatetruecolor($w, $h);
            $white = imagecolorallocate($dst, 255, 255, 255);
            imagefilledrectangle($dst, 0, 0, $w, $h, $white);
            imagecopy($dst, $img, 0, 0, 0, 0, $w, $h);
            if (@imagepng($dst, $tmp)) {
                imagedestroy($img);
                imagedestroy($dst);
                return $tmp;
            }
            imagedestroy($img);
            imagedestroy($dst);
        }
    }

    // Fallback ImageMagick if installed
    $convertBin = trim(@shell_exec('command -v convert 2>/dev/null'));
    if ($convertBin !== '') {
        $cmd = escapeshellcmd($convertBin) . ' ' . escapeshellarg($sourcePath) . ' -background white -alpha remove -alpha off ' . escapeshellarg($tmp) . ' 2>&1';
        @exec($cmd, $output, $returnCode);
        if ($returnCode === 0 && file_exists($tmp)) {
            return $tmp;
        }
    }

    return false;
}

function safe_image_draw($pdf, $pathOrUrl, $x, $y, $w = 0, $h = 0, $sexe = '') {
    // Robust image drawing: accepts local path or URL, and falls back to sex-based avatars.
    error_log("safe_image_draw: Attempting to load image with sexe: $sexe, path: $pathOrUrl");
    // If an explicit path/URL is provided, try it first.
    if (!empty($pathOrUrl)) {
        if (preg_match('#^https?://#i', $pathOrUrl)) {
            // Try to fetch remote image and write to temp file (FPDF prefers file paths)
            $ctx = stream_context_create(['http' => ['method' => 'GET', 'timeout' => 5], 'ssl' => ['verify_peer' => false, 'verify_peer_name' => false]]);
            $data = @file_get_contents($pathOrUrl, false, $ctx);
            if ($data !== false && strlen($data) > 50) {
                $ext = 'png';
                if (strlen($data) >= 2 && ord($data[0]) === 0xFF && ord($data[1]) === 0xD8) { $ext = 'jpg'; }
                $tmp = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'remote_img_' . md5($pathOrUrl . microtime(true)) . '.' . $ext;
                if (@file_put_contents($tmp, $data) !== false) {
                    error_log("safe_image_draw: fetched remote image to $tmp");
                    try { $pdf->Image($tmp, $x, $y, $w, $h); @unlink($tmp); return true; } catch (Exception $e) { error_log('safe_image_draw: Image(tmp) failed: ' . $e->getMessage()); @unlink($tmp); }
                }
            } else { error_log('safe_image_draw: remote fetch failed or empty for ' . $pathOrUrl); }
        } else {
            if (file_exists($pathOrUrl)) {
                error_log('safe_image_draw: local file exists: ' . $pathOrUrl);
                $infoLocal = @getimagesize($pathOrUrl);
                // If PNG, proactively flatten transparency onto white to avoid black background in PDF viewers
                if ($infoLocal && isset($infoLocal['mime']) && $infoLocal['mime'] === 'image/png' && function_exists('imagecreatefrompng')) {
                    $imgLocal = @imagecreatefrompng($pathOrUrl);
                    if ($imgLocal) {
                        $fwl = imagesx($imgLocal); $fhl = imagesy($imgLocal);
                        $dstL = imagecreatetruecolor($fwl, $fhl);
                        $whiteL = imagecolorallocate($dstL, 255,255,255);
                        imagefilledrectangle($dstL, 0, 0, $fwl, $fhl, $whiteL);
                        imagecopy($dstL, $imgLocal, 0, 0, 0, 0, $fwl, $fhl);
                        $tmpFlatLocal = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'img_flat_' . md5($pathOrUrl . microtime(true)) . '.png';
                        if (@imagepng($dstL, $tmpFlatLocal)) {
                            imagedestroy($imgLocal); imagedestroy($dstL);
                            try { $pdf->Image($tmpFlatLocal, $x, $y, $w, $h); @unlink($tmpFlatLocal); return true; } catch (Exception $e) { error_log('safe_image_draw: Image() failed for flattened local PNG: ' . $e->getMessage()); @unlink($tmpFlatLocal); }
                        } else { imagedestroy($imgLocal); imagedestroy($dstL); error_log('safe_image_draw: failed to create flattened PNG for ' . $pathOrUrl); }
                    } else { error_log('safe_image_draw: imagecreatefrompng failed for local ' . $pathOrUrl); }
                }
                try {
                    $pdf->Image($pathOrUrl, $x, $y, $w, $h);
                    return true;
                } catch (Exception $e) {
                    error_log('safe_image_draw: Image() failed for local file: ' . $e->getMessage());
                    $flatten = safe_image_flatten_for_fpdf($pathOrUrl);
                    if ($flatten) {
                        try {
                            $pdf->Image($flatten, $x, $y, $w, $h);
                            @unlink($flatten);
                            return true;
                        } catch (Exception $e2) {
                            error_log('safe_image_draw: Image() failed for flattened local file: ' . $e2->getMessage());
                            @unlink($flatten);
                        }
                    }
                }
            } else { error_log('safe_image_draw: local file not found: ' . $pathOrUrl); }
        }
    }

    // No explicit image — attempt sex-based avatars. Try multiple candidate filenames and case-insensitive matches.
    $sexeNorm = strtolower(trim($sexe));
    $candidates = [];
    $assetsImgDir = realpath(__DIR__ . '/assets/images');
    if ($sexeNorm === 'masculin' || $sexeNorm === 'm') {
        $candidates = ['Picture2.png','Picture2.jpg','picture2.png','Picture2_noninterlaced.png','picture2.JPG','male.png'];
    } elseif (in_array($sexeNorm, ['féminin','f','feminin'])) {
        $candidates = ['Picture3.png','Picture3.jpg','picture3.png','Picture3_noninterlaced.png','female.png'];
    } else {
        $candidates = ['Picture2.png','Picture3.png','default_avatar.png','avatar.png'];
    }

    // If dir exists, scan for case-insensitive matches as well
    if ($assetsImgDir && is_dir($assetsImgDir)) {
        $files = scandir($assetsImgDir);
        $lowerFiles = array_change_key_case(array_flip($files), CASE_LOWER);
        foreach ($candidates as $cand) {
            $candLower = strtolower($cand);
            if (isset($lowerFiles[$candLower])) {
                $found = $assetsImgDir . DIRECTORY_SEPARATOR . $files[$lowerFiles[$candLower]];
                error_log('safe_image_draw: found candidate ' . $found);
                try {
                    $pdf->Image($found, $x, $y, $w, $h);
                    return true;
                } catch (Exception $e) {
                    error_log('safe_image_draw: Image() failed on candidate: ' . $e->getMessage());
                    // Try flattening PNG to avoid alpha/transparency issues on FPDF (alpha handles differently depending on PHP build).
                    $flattened = safe_image_flatten_for_fpdf($found);
                    if ($flattened) {
                        try {
                            $pdf->Image($flattened, $x, $y, $w, $h);
                            @unlink($flattened);
                            return true;
                        } catch (Exception $e2) {
                            error_log('safe_image_draw: Image() failed for flattened candidate: ' . $e2->getMessage());
                            @unlink($flattened);
                        }
                    }

                    // If we still have GD, try conversion path for better compatibility.
                    $info2 = @getimagesize($found);
                    if ($info2 && isset($info2['mime']) && $info2['mime'] === 'image/png' && function_exists('imagecreatefrompng')) {
                        $img = @imagecreatefrompng($found);
                        if ($img) {
                            @imageinterlace($img, 0);
                            $tmpConv = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'img_conv_' . md5($found . microtime(true)) . '.png';
                            $fw = imagesx($img); $fh = imagesy($img);
                            $dstFlat = imagecreatetruecolor($fw, $fh);
                            $white = imagecolorallocate($dstFlat, 255,255,255);
                            imagefilledrectangle($dstFlat, 0, 0, $fw, $fh, $white);
                            imagecopy($dstFlat, $img, 0, 0, 0, 0, $fw, $fh);
                            if (@imagepng($dstFlat, $tmpConv)) {
                                imagedestroy($img); imagedestroy($dstFlat);
                                try { $pdf->Image($tmpConv, $x, $y, $w, $h); @unlink($tmpConv); return true; } catch (Exception $e2) { error_log('safe_image_draw: Image() failed on converted PNG: ' . $e2->getMessage()); @unlink($tmpConv); }
                            } else { imagedestroy($img); imagedestroy($dstFlat); error_log('safe_image_draw: imagepng conversion failed for ' . $found); }
                        } else { error_log('safe_image_draw: imagecreatefrompng failed for ' . $found); }
                    }
                }
            }
        }
        // As a last resort, try any file that contains 'picture2' or 'picture3' case-insensitive
        foreach ($files as $f) {
            if (stripos($f, 'picture2') !== false && ($sexeNorm === 'masculin' || $sexeNorm === 'm')) {
                $found = $assetsImgDir . DIRECTORY_SEPARATOR . $f; error_log('safe_image_draw: fallback found ' . $found);
                try {
                    $pdf->Image($found, $x, $y, $w, $h);
                    return true;
                } catch (Exception $e) {
                    error_log('safe_image_draw: Image() failed on fallback: ' . $e->getMessage());
                }
            }
            if (stripos($f, 'picture3') !== false && in_array($sexeNorm, ['féminin','f','feminin'])) {
                $found = $assetsImgDir . DIRECTORY_SEPARATOR . $f; error_log('safe_image_draw: fallback found ' . $found); try { $pdf->Image($found, $x, $y, $w, $h); return true; } catch (Exception $e) { error_log('safe_image_draw: Image() failed on fallback: ' . $e->getMessage()); }
            }
        }
    } else { error_log('safe_image_draw: assets images dir not found: ' . (__DIR__ . '/assets/images')); }

    // Nothing found — draw placeholder
    error_log("safe_image_draw: No image found for sexe='$sexe', displaying placeholder");
    $phW = $w > 0 ? $w : 20; $phH = $h > 0 ? $h : 20;

    $pdf->SetDrawColor(180,180,180);
    $pdf->Rect($x, $y, $phW, $phH);
    $pdf->SetXY($x, $y + ($phH/2) - 2);

    // Use the PDF instance for text rendering, fallback to manual utf8 conversion if needed
    $placeholderText = 'Pas d\'image';
    if (method_exists($pdf, 'renderTexte')) {
        $placeholderText = $pdf->renderTexte($placeholderText);
    } else {
        $placeholderText = iconv('UTF-8', 'ISO-8859-1//TRANSLIT', $placeholderText) ?: $placeholderText;
    }

    $pdf->Cell($phW, 4, $placeholderText, 0, 0, 'C');
    return false;
}

function normalizeAttachmentPath($path) {
    if (empty($path)) {
        return '';
    }

    $normalized = str_replace(['\\', '/'], '/', trim($path));
    $docRoot = rtrim(str_replace('\\', '/', $_SERVER['DOCUMENT_ROOT']), '/');

    // Windows path: C:\wamp6\www\ham_project\api\../uploads...
    if (preg_match('#^[A-Za-z]:/#', $normalized)) {
        // Convert to Linux style and normaliser
        $lower = strtolower($normalized);
        $needle = '/wamp6/www/ham_project';
        $idx = strpos($lower, $needle);
        if ($idx !== false) {
            $rel = substr($normalized, $idx + strlen($needle));
            $rel = preg_replace('#^/api(/|$)#', '/', $rel);
            $candidate = $docRoot . '/' . ltrim($rel, '/');
            $real = @realpath($candidate);
            return $real !== false ? $real : $candidate;
        }

        // remove drive portion and map under DOCUMENT_ROOT
        $sansDrive = preg_replace('#^[A-Za-z]:#', '', $normalized);
        $candidate = $docRoot . '/' . ltrim($sansDrive, '/');
        $real = @realpath($candidate);
        return $real !== false ? $real : $candidate;
    }

    // Path with no leading /, treat as relative to DOCUMENT_ROOT
    if (strpos($normalized, '/') !== 0) {
        $candidate = $docRoot . '/' . ltrim($normalized, '/');
        $real = @realpath($candidate);
        return $real !== false ? $real : $candidate;
    }

    // Path starts with / (webroot style)
    $candidate = $docRoot . $normalized;
    $real = @realpath($candidate);
    if ($real !== false) {
        return $real;
    }

    // Keep absolute path if already valid
    if (file_exists($normalized)) {
        return $normalized;
    }

    // Fallback : return candidate form with docroot
    return $candidate;
}
/**
 * Convertit un fichier (PDF, DOCX, PPT, XLS) en images PNG belvie
 * Ou retourne directement les fichiers images (JPG, PNG, GIF, etc.)
 * Utilise Ghostscript pour les PDFs et LibreOffice pour les autres formats
 * 
 * @param string $filePath Chemin du fichier à convertir
 * @param int $maxPages Nombre maximum de pages à convertir (0 = toutes)
 * @return array Array de chemins vers les images PNG générées
 */
function resolveOfficeExecutable() {
    $candidates = [
        '/usr/bin/libreoffice',
        '/usr/bin/soffice',
        'libreoffice',
        'soffice'
    ];
    foreach ($candidates as $bin) {
        $which = trim(@shell_exec('command -v ' . escapeshellarg($bin)));
        if ($which !== '') {
            return $which;
        }
    }
    return null;
}

function convertFileToImages($filePath, $maxPages = 5) {
    if (!file_exists($filePath)) {
        error_log("convertFileToImages: File not found: $filePath");
        return [];
    }

    $ext = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
    $outputImages = [];
    $tempDir = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'document_conversions';
    
    // Créer le répertoire temporaire s'il n'existe pas
    if (!is_dir($tempDir)) {
        @mkdir($tempDir, 0777, true);
    }

    $fileHash = md5($filePath . microtime(true));
    $tempFileName = $tempDir . DIRECTORY_SEPARATOR . 'conv_' . $fileHash;

    try {
        // Vérifier si c'est déjà une image supportée
        $supportedImages = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp'];
        if (in_array($ext, $supportedImages)) {
            // C'est déjà une image - retourner directement
            error_log("convertFileToImages: File is already an image: $filePath");
            return [$filePath];
        }

        if ($ext === 'pdf') {
            // Convertir PDF en images PNG avec Ghostscript
            $gsBin = resolveGhostscriptExecutable();
            if (!$gsBin) {
                error_log('convertFileToImages: Ghostscript executable introuvable');
                return [];
            }

            $outputPattern = $tempFileName . '_%d.png';
            $maxPagesParam = $maxPages > 0 ? $maxPages : 999;
            
            // Command Ghostscript pour convertir PDF en PNG
            $cmd = sprintf(
                '%s -q -sDEVICE=png16m -dNOPAUSE -dBATCH -dSAFER -dGraphicsAlphaBits=4 -dTextAlphaBits=4 -dBackgroundColor=16#FFFFFF -dFirstPage=1 -dLastPage=%d -r150 -sOutputFile="%s" "%s" 2>&1',
                escapeshellcmd($gsBin),
                $maxPagesParam,
                $outputPattern,
                $filePath
            );

            error_log("convertFileToImages: Running Ghostscript: $cmd");
            $output = [];
            $returnCode = 0;
            exec($cmd, $output, $returnCode);

            if ($returnCode !== 0) {
                error_log("convertFileToImages: Ghostscript error - " . implode("\n", $output));
                return [];
            }

            // Chercher les fichiers générés
            $pattern = $tempFileName . '_*.png';
            $pngFiles = glob($pattern);
            if ($pngFiles) {
                natsort($pngFiles);
                $outputImages = $pngFiles;
                error_log("convertFileToImages: PDF converted to " . count($outputImages) . " images");
            }

        } else if (in_array($ext, ['docx', 'doc', 'ppt', 'pptx', 'xls', 'xlsx', 'odt', 'ods'])) {
            // Convertir document Office/LibreOffice en PDF d'abord avec LibreOffice
            $sofficeBin = resolveOfficeExecutable();
            if (!$sofficeBin) {
                error_log('convertFileToImages: LibreOffice executable introuvable');
                return [];
            }

            $pdfOutput = $tempFileName . '.pdf';
            
            $cmd = sprintf(
                '%s --headless --convert-to pdf --outdir "%s" "%s" 2>&1',
                escapeshellcmd((string)$sofficeBin),
                $tempDir,
                $filePath
            );

            error_log("convertFileToImages: Converting to PDF with LibreOffice: $cmd");
            $output = [];
            $returnCode = 0;
            exec($cmd, $output, $returnCode);

            if ($returnCode !== 0) {
                error_log("convertFileToImages: LibreOffice error - " . implode("\n", $output));
                return [];
            }

            // Le PDF généré est nommé selon le fichier original
            $baseName = pathinfo($filePath, PATHINFO_FILENAME);
            $libreOfficePdf = $tempDir . DIRECTORY_SEPARATOR . $baseName . '.pdf';

            if (file_exists($libreOfficePdf)) {
                // Maintenant convertir le PDF en images PNG
                $outputPattern = $tempFileName . '_%d.png';
                $maxPagesParam = $maxPages > 0 ? $maxPages : 999;

                $gsBin = resolveGhostscriptExecutable();
                if (!$gsBin) {
                    error_log('convertFileToImages: Ghostscript executable introuvable pour conversion du PDF LibreOffice');
                    @unlink($libreOfficePdf);
                    return [];
                }

                $cmd = sprintf(
                    '%s -q -sDEVICE=png16m -dNOPAUSE -dBATCH -dSAFER -dGraphicsAlphaBits=4 -dTextAlphaBits=4 -dBackgroundColor=16#FFFFFF -dFirstPage=1 -dLastPage=%d -r150 -sOutputFile="%s" "%s" 2>&1',
                    escapeshellcmd($gsBin),
                    $maxPagesParam,
                    $outputPattern,
                    $libreOfficePdf
                );

                exec($cmd, $output, $returnCode);

                if ($returnCode === 0) {
                    $pngFiles = glob($tempFileName . '_*.png');
                    if ($pngFiles) {
                        natsort($pngFiles);
                        $outputImages = $pngFiles;
                        error_log("convertFileToImages: Office document converted to " . count($outputImages) . " images");
                    }
                }

                // Nettoyer le PDF intermédiaire
                @unlink($libreOfficePdf);
            } else {
                error_log("convertFileToImages: LibreOffice PDF not found at $libreOfficePdf");
            }
        }

    } catch (Exception $e) {
        error_log("convertFileToImages: Exception - " . $e->getMessage());
    }

    return $outputImages;
}

// helper to normalize scalar values (copied from legacy project)
function normalize_result_scalar($v) {
    if (is_array($v)) return '';
    if ($v === null) return '';
    if (is_bool($v)) return $v ? '1' : '0';
    $s = (string)$v;
    // trim whitespace, collapse newlines
    $s = preg_replace('/\s+/u', ' ', trim($s));
    return $s;
}

// simple getter with case-insensitive matching
function get_result_field($results, $keys, $debugLabel = '') {
    if (!is_array($results)) return '';
    
    $searchLog = "[get_result_field $debugLabel] Searching for keys: " . json_encode($keys) . " in results with " . count($results) . " items\n";
    
    foreach ((array)$keys as $k) {
        if (isset($results[$k]) && $results[$k] !== null) {
            error_log($searchLog . "  ✓ Found via isset(): key='$k' => " . json_encode($results[$k]));
            return normalize_result_scalar($results[$k]);
        }
        $lk = strtolower($k);
        foreach ($results as $rk => $rv) {
            if (strtolower($rk) === $lk) {
                error_log($searchLog . "  ✓ Found via iteration: key='$rk' (searched: '$k') => " . json_encode($rv));
                return normalize_result_scalar($rv);
            }
        }
    }
    
    error_log($searchLog . "  ✗ NOT FOUND. Available keys in results: " . json_encode(array_keys($results)));
    return '';
}

// encode for PDF, replicating legacy behavior but using renderTexte/font
function pdf_encode($text) {
    // In the legacy code this might do utf8->ISO-8859-1 or similar.  In
    // current code most rendering is done via renderTexte which handles
    // encoding, so we simply return the text unchanged.  Helpers above already
    // ensure it's a normalized scalar string.
    if ($text === null) return '';
    return (string)$text;
}

/**
 * Classe pour générer des PDFs de résultats d'examens médicaux
 * Utilise la bibliothèque FPDF pour créer des rapports formatés
 *
 * Fonctions génériques disponibles pour tous les renders :
 * - renderExamDescription($description) : Affiche la description centrée
 * - renderComments($comments) : Affiche les commentaires
 *
 * Exemple d'utilisation dans un nouveau render :
 * public function renderMonNouveauModal() {
 *     // ... code spécifique du modal ...
 *     $this->renderExamDescription("Description de mon examen");
 *     $this->renderComments("Commentaires spécifiques");
 *     // ... suite du code ...
 * }
 */

/**
 * Détecteur Intelligent de Types d'Examen (Solution 2)
 * Reconnaissance basée sur multi-critères : fields, keywords, structure JSON
 * 
 * Utilise une approche multi-niveaux :
 * 1. Détection par field exact (modal_type, exam_type)
 * 2. Détection par keywords dans exam_name
 * 3. Analyse de la structure JSON des paramètres
 * 4. Ranking avec score de confiance
 */
class SmartExamDetector {
    
    private $knownExamTypes = [
        'spermogramme', 'ionogramme', 'nfl', 'nfs', 'hematologie', 'hemogramme', 
        'microfilaire', 'eosinophiles', 'ziehl_nelsen', 'microbiologie', 'goutte_fraiche',
        'groupage_sanguin', 'coagulation', 'temps_saignement', 'tp_inr', 'hemoculture',
        'coproculture', 'electrophorese', 'reticulocyte', 'surveillance_prostatique',
        'micro_albuminuries', 'bilans_torch', 'frottis_secretion', 'fluide', 
        'glycemie_gestationnelle', 'spot_urines', 'urines_routines', 'selles_routine', 'selles_routines', 'sediment_urinaire',
        'proteinurie24', 'bilans_azotes', 'bilirubi', 'widal', 'salmonella',
        'serologie', 'profil_lipidique', 'rivalta', 'proteine_binces_jones',
        'frottis_sang', 'trypanosomiase', 'sang_occulte', 'histopathologie', 'chargeviral',
        'malaria', 'biocliahorm', 'biochimie', 'clia', 'hormones'
    ];
    
    /**
     * Détection multi-niveaux avec score de confiance
     */
    public function detect($examData) {
        $results = [];
        
        // Niveau 1 : Détection par field exact
        $fieldDetection = $this->detectByField($examData);
        if ($fieldDetection) {
            $results[] = [
                'type' => $fieldDetection,
                'method' => 'field_exact',
                'confidence' => 1.0,
                'source' => 'modal_type ou exam_type'
            ];
        }
        
        // Niveau 2 : Détection par keywords dans exam_name
        $keywordDetection = $this->detectByKeywords($examData);
        if ($keywordDetection && (!$fieldDetection || $keywordDetection['type'] !== $fieldDetection)) {
            $results[] = [
                'type' => $keywordDetection['type'],
                'method' => 'keywords_match',
                'confidence' => $keywordDetection['confidence'],
                'source' => 'exam_name'
            ];
        }
        
        // Niveau 3 : Analyse de la structure JSON des paramètres
        $structureDetection = $this->detectByStructure($examData);
        if ($structureDetection && (!$fieldDetection || $structureDetection['type'] !== $fieldDetection)) {
            $results[] = [
                'type' => $structureDetection['type'],
                'method' => 'structure_analysis',
                'confidence' => $structureDetection['confidence'],
                'source' => 'parametres JSON'
            ];
        }
        
        // Retourner le meilleur résultat avec données de confiance
        if (!empty($results)) {
            usort($results, function($a, $b) {
                return $b['confidence'] <=> $a['confidence'];
            });
            return $results[0];
        }
        
        // Aucune détection - type inconnu
        return [
            'type' => 'generic',
            'method' => 'fallback',
            'confidence' => 0.0,
            'source' => 'unknown',
            'message' => 'Type d\'examen inconnu - utilisation rendu générique'
        ];
    }
    
    /**
     * Niveau 1 : Détection par field exact
     * Cherche modal_type ou exam_type dans les données
     */
    private function detectByField($examData) {
        $fields = ['modal_type', 'exam_type', 'type'];
        
        foreach ($fields as $field) {
            if (!empty($examData[$field])) {
                $normalizedType = $this->normalizeExamType($examData[$field]);
                if ($normalizedType !== 'generic') {
                    error_log("[SmartExamDetector] Field detection: $field => $normalizedType");
                    return $normalizedType;
                }
            }
        }
        
        return null;
    }
    
    /**
     * Niveau 2 : Détection par keywords dans exam_name
     * Recherche des mots-clés significatifs
     */
    private function detectByKeywords($examData) {
        if (empty($examData['exam_name'])) {
            return null;
        }
        
        $examName = strtolower(trim($examData['exam_name']));
        $results = [];
        
        // Keywords spécifiques avec poids
        $keywordPatterns = [
            'hemogramme' => ['hemogramme', 'nfs', 'hematologie', 'hb_hct', 'hemoglobine', 'hematocrite'],
            'ionogramme' => ['ionogramme', 'electrolytes', 'sodium', 'potassium'],
            'spermogramme' => ['spermogramme', 'sperme', 'mobilite des spermatozoides'],
            'microfilaire' => ['microfilaire', 'filaire'],
            'malaria' => ['malaria', 'paludisme', 'plasmodium'],
            'groupage_sanguin' => ['groupage', 'groupe sanguin', 'ab0', 'rhesus'],
            'microbiologie' => ['culture', 'microbiologie', 'antibiogramme', 'sensibilite'],
            'electrophorese' => ['electrophorese', 'proteines', 'albumine'],
            'urines_routines' => ['urines', 'urinaire', 'analyse urines', 'examen urines'],
            'selles_routine' => ['selles', 'selles routine', 'analyse selles'],
            'sediment_urinaire' => ['sediment', 'sediment urinaire'],
            'coagulation' => ['coagulation', 'temps coagulation', 'pt', 'aptt'],
            'histopathologie' => ['histopathologie', 'biopsy', 'tissu', 'pathologie'],
            'glucose' => ['glucose', 'glycemie'],
            'cholesterol' => ['cholesterol', 'lipides', 'triglycérides'],
            'proteine' => ['proteine', 'albuminurie'],
            'bilirubine' => ['bilirubine', 'bilirubin'],
            'serologie' => ['serologie', 'anticorps', 'vihtest', 'hbsag'],
        ];
        
        foreach ($keywordPatterns as $examType => $keywords) {
            $matchCount = 0;
            foreach ($keywords as $keyword) {
                if (strpos($examName, $keyword) !== false) {
                    $matchCount++;
                }
            }
            
            if ($matchCount > 0) {
                // Confiance proportionnelle au nombre de correspondances
                $confidence = min(1.0, ($matchCount / count($keywords)) * 0.9);
                $results[] = [
                    'type' => $examType,
                    'confidence' => $confidence,
                    'matches' => $matchCount
                ];
            }
        }
        
        if (!empty($results)) {
            // Trier par confiance décroissante
            usort($results, function($a, $b) {
                return $b['confidence'] <=> $a['confidence'];
            });
            
            $best = $results[0];
            error_log("[SmartExamDetector] Keywords detection: {$best['type']} (confidence: {$best['confidence']}");
            
            return [
                'type' => $best['type'],
                'confidence' => $best['confidence']
            ];
        }
        
        return null;
    }
    
    /**
     * Niveau 3 : Analyse de la structure JSON des paramètres
     * Détecte le type en analysant les clés des paramètres
     */
    private function detectByStructure($examData) {
        if (empty($examData['parameters_json'])) {
            return null;
        }
        
        try {
            $params = json_decode($examData['parameters_json'], true);
            if (!is_array($params)) {
                return null;
            }
            
            $paramKeys = array_map('strtolower', array_keys($params));
            $results = [];
            
            // Signatures structurelles de certains examens
            $structureSignatures = [
                'hemogramme' => ['rb', 'gb', 'plaquettes', 'hemoglobine', 'hematocrite', 'vgm'],
                'ionogramme' => ['sodium', 'potassium', 'chlore', 'calcium', 'bicarbonate'],
                'glucose' => ['fasting', 'post_meal', 'random', '2hpp'],
                'cholesterol' => ['total', 'ldl', 'hdl', 'triglycerides'],
                'coagulation' => ['pt', 'aptt', 'tt', 'temps'],
                'groupe_sanguin' => ['ab0', 'rhesus', 'result'],
                'urine' => ['colour', 'density', 'ph', 'protein', 'glucose', 'leucocytes'],
            ];
            
            foreach ($structureSignatures as $examType => $requiredKeys) {
                $matchCount = 0;
                foreach ($requiredKeys as $key) {
                    if (in_array(strtolower($key), $paramKeys)) {
                        $matchCount++;
                    }
                }
                
                if ($matchCount > 0) {
                    // Au moins 50% des clés attendues présentes
                    $confidence = min(1.0, ($matchCount / count($requiredKeys)) * 0.8);
                    $results[] = [
                        'type' => $examType,
                        'confidence' => $confidence,
                        'matches' => $matchCount
                    ];
                }
            }
            
            if (!empty($results)) {
                usort($results, function($a, $b) {
                    return $b['confidence'] <=> $a['confidence'];
                });
                
                $best = $results[0];
                error_log("[SmartExamDetector] Structure detection: {$best['type']} (confidence: {$best['confidence']})");
                
                return [
                    'type' => $best['type'],
                    'confidence' => $best['confidence']
                ];
            }
        } catch (Exception $e) {
            error_log("[SmartExamDetector] Erreur analyse structure: " . $e->getMessage());
        }
        
        return null;
    }
    
    /**
     * Normaliser un type d'examen (majuscules, underscores, etc.)
     */
    private function normalizeExamType($examType) {
        $raw = trim((string) $examType);
        if ($raw === '') {
            return 'generic';
        }

        // Convertir camelCase / PascalCase en snake_case avant nettoyage
        $snake = preg_replace('/([a-z0-9])([A-Z])/', '$1_$2', $raw);
        $snake = preg_replace('/([A-Z]+)([A-Z][a-z])/', '$1_$2', $snake);
        $normalized = strtolower($snake);
        $normalized = str_replace([' ', '-', '.'], '_', $normalized);
        $normalized = preg_replace('/_{2,}/', '_', $normalized);
        $normalized = trim($normalized, '_');
        $normalized = preg_replace('/[^a-z0-9_]/', '', $normalized);

        // Synonymes explicites (camelCase côté front, "Bince/Bence", etc.)
        static $synonyms = [
            'ptt' => 'proteinurie24',
            'proteinebincesjones' => 'proteine_binces_jones',
            'proteine_de_binces_jones' => 'proteine_binces_jones',
            'proteine_de_bince_jones' => 'proteine_binces_jones',
            'proteine_de_bence_jones' => 'proteine_binces_jones',
            'proteine_bince_jones' => 'proteine_binces_jones',
            'proteine_bence_jones' => 'proteine_binces_jones',
            'proteines_binces_jones' => 'proteine_binces_jones',
            'bence_jones' => 'proteine_binces_jones',
            'sangocculte' => 'sang_occulte',
            'sangoccultepdf' => 'sang_occulte',
        ];
        if (isset($synonyms[$normalized])) {
            return $synonyms[$normalized];
        }
        $compact = str_replace('_', '', $normalized);
        if (isset($synonyms[$compact])) {
            return $synonyms[$compact];
        }

        // FR: "groupe sanguin" en base → souvent groupe_sanguin (sans "groupage")
        if ($normalized === 'groupe_sanguin' || $normalized === 'groupesanguin'
            || (strpos($normalized, 'groupe') !== false && strpos($normalized, 'sanguin') !== false)) {
            return 'groupage_sanguin';
        }
        // Heuristique : tout libellé contenant binces/bince/bence + jones
        if (strpos($normalized, 'jones') !== false
            && (strpos($normalized, 'binces') !== false || strpos($normalized, 'bince') !== false || strpos($normalized, 'bence') !== false)) {
            return 'proteine_binces_jones';
        }

        // Vérifier si c'est un type connu
        if (in_array($normalized, $this->knownExamTypes, true)) {
            return $normalized;
        }
        if ($compact !== '' && in_array($compact, $this->knownExamTypes, true)) {
            return $compact;
        }

        // Chercher une correspondance partielle
        foreach ($this->knownExamTypes as $known) {
            if (strpos($normalized, $known) !== false || strpos($known, $normalized) !== false
                || ($compact !== '' && (strpos($compact, $known) !== false || strpos($known, $compact) !== false))) {
                return $known;
            }
        }

        return 'generic';
    }

    /**
     * Normalisation exposée pour le routage des méthodes generate*PDF (param URL, modal_type DB).
     */
    public function normalizeExamTypeForPdf($examType) {
        if ($examType === null || trim((string) $examType) === '') {
            return 'generic';
        }
        return $this->normalizeExamType($examType);
    }
}

/**
 * MethodDiscoveryRegistry - Auto-découvre les méthodes sans configuration statique
 * 
 * Responsabilités:
 * - Découverte dynamique des render** et generate** methods
 * - Convention over Configuration: 'hemogramme' → 'renderHemogramme'
 * - Gestion centralisée des aliases
 * - Caching pour performance
 * 
 * Pattern: Service Locator + Convention over Configuration (Enterprise-Grade)
 */
class MethodDiscoveryRegistry {
    
    private static $discoveryCache = [];
    
    /**
     * SEULE configuration statique: aliases spéciaux
     * Centralisée ICI pour éviter duplication partout!
     */
    private static $typeAliases = [
        'nfs' => 'hemogramme',
        'hematologie' => 'hemogramme',
        'nfl' => 'ionogramme',
        'ziehl_nelsen' => 'ziehlNelsen',
        'tp_inr' => 'tpInr',
        'micro_albuminuries' => 'microAlbuminuries',
        'frottis_sang' => 'frottiessangperiph',
        'selles_routine' => 'sellesRoutines',
        'bilans_azotes' => 'bilanAzotes',
        'bilans_torch' => 'bilansTorch',
        'proteine_binces_jones' => 'proteineBincesJones',
        'frottis_secretion' => 'frottisSecretion',
        'glycemie_gestationnelle' => 'glycemieGestationnelle',
        'spot_urines' => 'spotUrine',
        'sediment_urinaire' => 'sedimentUrinaire',
        'ptt' => 'bilanProtTot',
        'proteinurie24' => 'bilanProtTot',
        'bilirubi' => 'bilirCompl',
        'profil_lipidique' => 'profLip',
        'rivalta' => 'rivalta',
        'chargeviral' => 'chargeViral',
        'malaria_tdr' => 'malariaTDR',
        'biocliahorm' => 'bioCliaHorm',
        'biochimie' => 'bioCliaHorm',
        'clia' => 'bioCliaHorm',
        'hormones' => 'bioCliaHorm',
        'trypanosomiase' => 'trypanosomiase',
        'sang_occulte' => 'sangOcculte',
        'histopathologie' => 'histopathologie',
        'coagulation' => 'coagulation',
        'temps_saignement' => 'tempsSaignement',
        'surveillance_prostatique' => 'surveillanceProstat',
        'groupage_sanguin' => 'groupageSanguin',
        'hemoculture' => 'hemoculture',
        'coproculture' => 'coproculture',
        'electrophorese' => 'electrophorese',
        'reticulocyte' => 'reticulocyte',
    ];
    
    /**
     * Découvrir dynamiquement une méthode
     * ZÉRO mapping statique nécessaire!
     * 
     * @param object $instance L'objet PDf
     * @param string $detectedType Type d'examen ('hemogramme')
     * @param string $methodPrefix 'generate' ou 'render'
     * @param string $suffix 'PDF' ou ''
     * @return string|null Nom de méthode découverte
     */
    public static function resolveMethod(
        $instance, 
        $detectedType, 
        $methodPrefix = 'generate', 
        $suffix = 'PDF'
    ) {
        $cacheKey = self::generateCacheKey($instance, $detectedType, $methodPrefix, $suffix);
        
        if (isset(self::$discoveryCache[$cacheKey])) {
            return self::$discoveryCache[$cacheKey];
        }
        
        // Normaliser le type (appliquer les aliases)
        $normalizedType = self::normalizeType($detectedType);
        
        // Transformer type → methodName via convention
        $methodName = self::transformToMethodName($normalizedType, $methodPrefix, $suffix);
        
        // Vérifier si la méthode existe (Reflection)
        if (method_exists($instance, $methodName)) {
            self::$discoveryCache[$cacheKey] = $methodName;
            return $methodName;
        }
        
        // Pas trouvée → Fallback générique
        self::$discoveryCache[$cacheKey] = null;
        return null;
    }
    
    /**
     * Transformer type → methodName via convention
     * 'hemogramme' + 'render' + '' → 'renderHemogramme'
     * 'micro_filaire' + 'generate' + 'PDF' → 'generateMicrofilairePDF'
     */
    private static function transformToMethodName($type, $prefix, $suffix) {
        $parts = explode('_', $type);
        $camelCase = implode('', array_map('ucfirst', $parts));
        return $prefix . $camelCase . $suffix;
    }
    
    /**
     * Normaliser via aliases
     * 'nfs' → 'hemogramme'
     */
    private static function normalizeType($type) {
        return self::$typeAliases[$type] ?? $type;
    }
    
    /**
     * Cache key unique por instance + type
     */
    private static function generateCacheKey($instance, $type, $prefix, $suffix) {
        $instanceHash = spl_object_hash($instance);
        return "{$instanceHash}_{$type}_{$prefix}_{$suffix}";
    }
    
    /**
     * Invalider le cache
     */
    public static function clearCache() {
        self::$discoveryCache = [];
    }
    
    /**
     * Ajouter alias dynamiquement
     */
    public static function registerAlias($typeKey, $normalizedType) {
        self::$typeAliases[$typeKey] = $normalizedType;
        self::clearCache();
    }
}

class ExamResultPDF extends FPDF {
    protected $examData;
    protected $patientData;
    protected $labInfo;
    protected $isAnnexePage = false;
    protected $factureId = null; // Pour le QR code

    /**
     * Constructeur
     * @param array $examData Données de l'examen
     * @param array $patientData Données du patient
     * @param array $labInfo Informations du laboratoire
     */
    public function __construct($examData = [], $patientData = [], $labInfo = []) {
        parent::__construct('P', 'mm', 'A4');
        $this->examData = $examData;
        $this->patientData = $patientData;
        $this->labInfo = $labInfo;
        $this->isAnnexePage = false;
        
        if (isset($patientData['id_patient'])) {
            $this->factureId = $this->getLatestFactureForPatient($patientData['id_patient']);
        }

        $this->SetMargins(PDF_LEFT_MARGIN, PDF_TOP_MARGIN, PDF_RIGHT_MARGIN);
        $this->SetAutoPageBreak(true, PDF_BOTTOM_MARGIN);

        // ====================== POLICES CALIBRI - VERSION ULTRA SÉCURISÉE ======================
        $fontDir = __DIR__ . '/fpdf186/font/';

        // FPDF attend les fichiers de police dans fontpath + nom de fichier (sans chemin absolu)
        $this->fontpath = $fontDir;

        error_log("=== PDF CONSTRUCTOR START ===");
        error_log("Font directory: " . $fontDir);

        // Calibri normal
        if (file_exists($fontDir . 'Calibri.php')) {
            try {
                $this->AddFont('Calibri', '', 'Calibri.php');
                error_log("✓ Calibri.php chargée avec succès");
            } catch (Exception $e) {
                error_log("✗ Calibri.php erreur AddFont: " . $e->getMessage());
            }
        } else {
            error_log("✗ Calibri.php MANQUANT !");
        }

        // Calibri Bold
        if (file_exists($fontDir . 'CalibriB.php')) {
            try {
                $this->AddFont('Calibri', 'B', 'CalibriB.php');
                error_log("✓ CalibriB.php chargée avec succès");
            } catch (Exception $e) {
                error_log("✗ CalibriB.php erreur AddFont: " . $e->getMessage());
            }
        } else {
            error_log("✗ CalibriB.php MANQUANT !");
        }

        // Calibri Italic
        if (file_exists($fontDir . 'CalibriI.php')) {
            try {
                $this->AddFont('Calibri', 'I', 'CalibriI.php');
                error_log("✓ CalibriI.php chargée avec succès");
            } catch (Exception $e) {
                error_log("✗ CalibriI.php erreur AddFont: " . $e->getMessage());
            }
        } else {
            error_log("✗ CalibriI.php MANQUANT !");
        }

        // Si Calibri n'est pas disponible, on ajoute explicitement les polices Helvetica classiques
        if (!file_exists($fontDir . 'Calibri.php')) {
            if (file_exists($fontDir . 'helvetica.php')) {
                $this->AddFont('Helvetica', '', 'helvetica.php');
            }
            if (file_exists($fontDir . 'helveticab.php')) {
                $this->AddFont('Helvetica', 'B', 'helveticab.php');
            }
        }

        error_log("=== PDF CONSTRUCTOR END ===");
    }
    
    /**
     * Chercher la facture la plus récente pour ce patient
     */
    private function getLatestFactureForPatient($patientId) {
        global $pdo;
        $patientId = (int) $patientId;
        if ($patientId <= 0) {
            return null;
        }

        // Certains environnements VPS n'ont pas la colonne created_at dans factures.
        // On tente d'abord avec created_at puis fallback robuste par id.
        $queries = [
            "SELECT id FROM factures WHERE patient_id = ? ORDER BY created_at DESC, id DESC LIMIT 1",
            "SELECT id FROM factures WHERE patient_id = ? ORDER BY id DESC LIMIT 1",
            "SELECT id FROM factures WHERE id_patient = ? ORDER BY created_at DESC, id DESC LIMIT 1",
            "SELECT id FROM factures WHERE id_patient = ? ORDER BY id DESC LIMIT 1",
        ];

        try {
            foreach ($queries as $sql) {
                try {
                    $stmt = $pdo->prepare($sql);
                    $stmt->execute([$patientId]);
                    $row = $stmt->fetch(PDO::FETCH_ASSOC);
                    if ($row && isset($row['id'])) {
                        return (int) $row['id'];
                    }
                } catch (Exception $inner) {
                    error_log('[PDF_RESULTAT] Requête facture ignorée: ' . $inner->getMessage() . ' | SQL=' . $sql);
                }
            }

            return null;
        } catch (Exception $e) {
            error_log('[PDF_RESULTAT] Erreur récupération facture: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * En-tête du document
     */
    public function Header() {
        $this->SetDrawColor(0, 0, 0); // Couleur noire pour la bordure
        // Ne pas afficher les infos patient sur la page ANNEXE
        if (!$this->isAnnexePage) {
            $this->renderPatientInfo();
        }
    }

    /**
     * Pied de page du document
     */
    public function Footer() {
        // Signature de validation gérée explicitement par renderSignature().
    }

    /**
     * Générer la section informations patient
     */
    public function renderPatientInfo() {
        $this->renderPolice();
        // Dimensions et positions
        $startX = $this->GetX();
        $startY = $this->GetY();
        $boxWidth = $this->w - PDF_LEFT_MARGIN - PDF_RIGHT_MARGIN; // Largeur disponible entre les marges
        $boxHeight = 35;
        $this->SetLineWidth(0.4);
        $this->Rect($startX, $startY, $boxWidth, $boxHeight);
        $this->SetLineWidth(0.2);

        // Silhouette à gauche - Utiliser safe_image_draw pour l'avatar basé sur le sexe
        safe_image_draw($this, '', $startX + 2, $startY + 3, 25, 30, $this->patientData['sexe']);

        // QR code à droite - généré dynamiquement pour ce patient
        $qrCodeFile = null;
        $qrCodeSource = null;
        if (isset($this->patientData['id_patient']) && $this->factureId) {
            try {
                $patientId = $this->patientData['id_patient'];
                $factureId = $this->factureId;
                $hostname = $_SERVER['HTTP_HOST'] ?? 'localhost';
                $scheme = (!empty($_SERVER['HTTPS']) && strtolower((string)$_SERVER['HTTPS']) !== 'off') ? 'https' : 'http';
                $scriptDir = dirname($_SERVER['SCRIPT_NAME'] ?? '/ham_project/pdf_resultat.php');
                $scriptDir = str_replace('\\', '/', $scriptDir);
                $scriptDir = rtrim($scriptDir, '/');
                if ($scriptDir === '' || $scriptDir === '.') {
                    $scriptDir = '';
                }

                // Token ultra-compact en base36: "{patient}-{facture}".
                // On passe par une URL courte (/s.php) pour limiter la densité du QR.
                $compactToken = base_convert((string)((int)$patientId), 10, 36)
                    . '-' . base_convert((string)((int)$factureId), 10, 36);
                $scanUrl = $scheme . '://' . $hostname . $scriptDir . '/s.php?c=' . $compactToken;

                // Taille source plus grande pour un rendu imprimé plus net.
                $qrTempDir = __DIR__ . DIRECTORY_SEPARATOR . 'tmp_qr';
                if (!is_dir($qrTempDir)) {
                    @mkdir($qrTempDir, 0775, true);
                }
                $qrCodeFile = QRCode::generateQRCodeImage($scanUrl, 220, $qrTempDir . DIRECTORY_SEPARATOR . 'qrcode_results_' . md5($scanUrl) . '.png');
                if (is_string($qrCodeFile) && $qrCodeFile !== '') {
                    $isRemote = preg_match('#^https?://#i', $qrCodeFile) === 1;
                    if ($isRemote || file_exists($qrCodeFile)) {
                        $qrCodeSource = $qrCodeFile;
                    }
                }
                error_log('[PDF_RESULTAT] QR code source: ' . ($qrCodeSource ?: 'ÉCHEC') . ' | patient=' . (int)$patientId . ' | facture=' . (int)$factureId);
            } catch (Exception $e) {
                error_log('[PDF_RESULTAT] Erreur génération QR: ' . $e->getMessage());
            }
        } else {
            $pidLog = isset($this->patientData['id_patient']) ? (int)$this->patientData['id_patient'] : 0;
            error_log('[PDF_RESULTAT] QR fallback scan.jpg (facture introuvable) | patient=' . $pidLog . ' | facture=' . (int)$this->factureId);
        }
        
        // Afficher le QR code généré ou l'image de secours
        if ($qrCodeSource) {
            // Rendu volontairement non carré (comme l'ancien) pour un aspect moins "serré".
            safe_image_draw($this, $qrCodeSource, $startX + $boxWidth - 31, $startY + 7, 28, 20);
        } else {
            safe_image_draw($this, __DIR__ . '/assets/images/scan.jpg', $startX + $boxWidth - 31, $startY + 7, 28, 20);
        }

        // Informations patient (tableau)
        $infoX = $startX + 32; // après la silhouette avec marge (décalage supplémentaire à droite)
        $infoY = $startY + 4;
        $this->SetXY($infoX, $infoY);

        $labels = [
            ['NOM', $this->patientData['nom'] . ' ' . ($this->patientData['prenom'] ?? ''), 'TEL', $this->patientData['telephone'] ?? ''],
            ['ID PATIENT', $this->patientData['num_enreg'] ?? '', 'SEXE', $this->patientData['sexe'] ?? ''],
            ["DATE D'ANALYSE", $this->examData['exam_date'] ?? '', 'AGE', ($this->patientData['age'] ? $this->patientData['age'] . ' ans' : '')],
            ['DOCTEUR', !empty($this->examData['medecin_demandeur']) ? $this->examData['medecin_demandeur'] : 'Non spécifié', 'CNOM', !empty($this->examData['cnom_medecin']) ? $this->examData['cnom_medecin'] : 'Non spécifié'],
            ['ADRESSE', $this->patientData['adresse'] ?? '', '', '']
        ];

        // Donner plus d'espace à la valeur principale (NOM) pour éviter le chevauchement
        // avec la colonne secondaire (TEL/SEXE/AGE/CNOM).
        $col1w = 30; $col2w = 48; $col3w = 10; $col4w = 20;
        foreach ($labels as $i => $row) {
            $y = $infoY + $i * 5;
            $this->SetXY($infoX, $y);
            // Colonne 1 (label)
            $this->renderPolice('Calibri', '', 9);
            $this->Cell($col1w, 5, $this->renderTexte($this->renderMajuscule($row[0])), 0, 0, 'L');

            // If it's the ADRESSE row, use MultiCell so long addresses wrap inside the box
            if (trim(strtoupper($row[0])) === 'ADRESSE') {
                $this->renderPolice('Calibri', '', 9);
                // Move to the value column start
                $this->SetXY($infoX + $col1w, $y);
                $availableW = $col2w + $col3w + $col4w; // use remaining columns width
                // Use 4mm line height to reduce chance of overflow
                $this->MultiCell($availableW, 4, $this->renderTexte($this->renderMajuscule($row[1] ?? '')), 0, 'L');
                // Advance Y position manually for next row (height used by MultiCell)
                $multiHeight = $this->GetY() - $y;
                if ($multiHeight > 5) {
                    // bump base infoY so next row doesn't overlap
                    $infoY += ($multiHeight - 5);
                }
            } else {
                $this->renderPolice('Calibri', '', 9);
                $this->Cell($col2w, 5, $this->renderTexte($this->renderMajuscule($row[1])), 0, 0, 'L');
                if (!empty($row[2])) {
                    $this->renderPolice('Calibri', '', 9);
                    $this->Cell($col3w, 5, $this->renderTexte($this->renderMajuscule($row[2])), 0, 0, 'L');
                    $this->renderPolice('Calibri', '', 9);
                    $this->Cell($col4w, 5, $this->renderTexte($this->renderMajuscule($row[3])), 0, 0, 'L');
                }
                $this->Ln(0);
            }
        }

        $this->SetY($startY + $boxHeight + 2);
    }

    /**
     * Générer la section informations de l'examen
     */
    public function renderExamInfo() {
        $this->renderPolice();
        $this->renderPolice('Calibri', 'B', 12);
        $this->Cell(0, 8, $this->renderTexte('INFORMATIONS DE L\'EXAMEN'), 0, 1, 'L');
        $this->Ln(2);

        $this->renderPolice('Calibri', '', 10);

        // Informations de l'examen
        $examInfo = [
            'Type d\'examen' => $this->examData['exam_name'] ?? '',
            'Date de l\'examen' => $this->examData['exam_date'] ?? '',
            'Date de rendu' => date('d/m/Y'),
            'DOCTEUR' => $this->examData['medecin_demandeur'] ?? '',
            'Numéro d\'examen' => $this->examData['exam_id'] ?? ''
        ];

        foreach ($examInfo as $label => $value) {
            $this->Cell(40, 6, $label . ':', 0, 0, 'L');
            $this->Cell(0, 6, $this->renderTexte($value), 0, 1, 'L');
        }

        $this->Ln(5);
    }

    /**
     * Générer la section résultats
     */
    public function renderResults() {
        $this->renderPolice();
        $this->renderPolice('Calibri', 'B', 12);
        $this->Cell(0, 8, $this->renderTexte('RESULTATS'), 0, 1, 'L');
        $this->Ln(2);

        // En-têtes du tableau
        $this->renderPolice('Calibri', 'B', 10);
        $this->SetFillColor(240, 240, 240);

        $this->Cell(60, 8, $this->renderTexte('Paramètre'), 1, 0, 'C', true);
        $this->Cell(30, 8, $this->renderTexte('Résultat'), 1, 0, 'C', true);
        $this->Cell(20, 8, $this->renderTexte('Unité'), 1, 0, 'C', true);
        $this->Cell(40, 8, $this->renderTexte('Valeurs normales'), 1, 0, 'C', true);
        $this->Cell(15, 8, 'Flag', 1, 1, 'C', true);

        // Données des résultats
        $this->renderPolice('Calibri', '', 10);

        if (isset($this->examData['results']) && is_array($this->examData['results'])) {
            foreach ($this->examData['results'] as $result) {
                $parameterName = $result['name'] ?? '';
                $parameterValue = $result['value'] ?? '';
                $unit = $this->sanitizePlaceholderValue($result['unit'] ?? '');
                $referenceRange = $this->sanitizePlaceholderValue($result['reference_range'] ?? '');
                $flag = $result['flag'] ?? '';

                $this->Cell(60, 6, $this->renderTexte($parameterName), 1, 0, 'L');
                $this->Cell(30, 6, $this->renderTexte($parameterValue), 1, 0, 'C');
                $this->Cell(20, 6, $this->renderTexte($unit), 1, 0, 'C');
                $this->Cell(40, 6, $this->renderTexte($referenceRange), 1, 0, 'C');
                $this->Cell(15, 6, $flag, 1, 1, 'C');
            }
        }

        $this->Ln(5);
    }

    /**
     * Générer la section commentaires (générique)
     * Utilisation :
     * - $this->renderComments() // Utilise $this->examData['comments']
     * - $this->renderComments("Commentaires personnalisés") // Utilise le texte passé en paramètre
     * @param string $comments Texte des commentaires à afficher
     */
    public function renderComments($comments = null) {
        $this->renderPolice();
        $commentsText = $comments ?? $this->examData['comments'] ?? '';
        $commentsText = $this->normalizeRichTextList($commentsText);

        if (!empty($commentsText)) {
            $this->renderPolice('Calibri', 'B', 10);
            $this->Cell(0, 8, $this->renderTexte('COMMENTAIRES'), 0, 1, 'C');
            $this->Ln(1);

            $this->renderPolice('Calibri', '', 10);
            $this->MultiCell(0, 6, $this->renderTexte($commentsText));
            $this->Ln(2);
        }
    }

    /**
     * Générer la section signature
     */
    public function renderSignature() {
        $this->renderPolice();
        $this->renderPolice('Calibri', 'B', 10);
        $this->Cell(0, 8, $this->renderTexte('VALIDATION'), 0, 1, 'L');
        $this->Ln(2);

        // Espace pour signature
        $this->renderPolice('Calibri', '', 10);
        $this->Cell(80, 6, $this->renderTexte('Biologiste responsable:'), 0, 0, 'L');
        $this->Cell(80, 6, $this->renderTexte('Date: ' . date('d/m/Y H:i')), 0, 1, 'L');

        // Afficher l'image de signature si disponible
        $signaturePath = __DIR__ . '/assets/images/signature.png';
        $imageWidth = 40;
        $imageHeight = 10;
        $leftSignatureCellWidth = 82;
        $x = PDF_LEFT_MARGIN + max(0, ($leftSignatureCellWidth - $imageWidth) / 2);
        $imageYOffset = 3;
        $lineGap = 1;
        $y = $this->GetY() + $imageYOffset;
        if (file_exists($signaturePath)) {
            try {
                // Flatten PNG alpha when needed to avoid rendering issues in some FPDF setups.
                $imgToDraw = $signaturePath;
                $tmpFlatten = null;
                if (strtolower(pathinfo($signaturePath, PATHINFO_EXTENSION)) === 'png') {
                    $tmpFlatten = safe_image_flatten_for_fpdf($signaturePath);
                    if ($tmpFlatten && file_exists($tmpFlatten)) {
                        $imgToDraw = $tmpFlatten;
                    }
                }

                $this->Image($imgToDraw, $x, $y, $imageWidth, $imageHeight);

                if ($tmpFlatten && file_exists($tmpFlatten)) {
                    @unlink($tmpFlatten);
                }

                // Place the underline almost directly under the signature image.
                $this->SetY($y + $imageHeight + $lineGap);
            } catch (Exception $e) {
                error_log('[PDF_RESULTAT] renderSignature image failed: ' . $e->getMessage());
                $this->SetY($y + 10);
            }
        } else {
            $this->SetY($y + 10);
        }

        $this->Cell(82, 6, '________________________________________', 0, 0, 'C');
        $this->Cell(20, 6, 'FIN', 0, 0, 'C');
        $this->Cell(82, 6, '________________________________________', 0, 1, 'L');
    }

    /**
     * Générer la section validation puis les annexes éventuelles.
     * La section VALIDATION doit être affichée sur la dernière page du contenu
     * principal, juste avant la page des fichiers joints.
     */
    public function renderValidationAndAnnexes() {
        $this->renderSignature();
    }

    /**
     * Générer le bandeau de titre générique pour les examens
     * @param string $examNom Nom de l'examen
     * @param string $specimen Specimen de l'examen (optionnel)
     * @param int $tblW Largeur du bandeau (par défaut 190)
     */
    public function renderTitre($examNom, $specimen = '', $tblW = null) {
        // Si aucune largeur n'est spécifiée, utiliser la largeur disponible entre les marges
        if ($tblW === null) {
            $tblW = $this->w - PDF_LEFT_MARGIN - PDF_RIGHT_MARGIN;
        }
        // Title band (unified pastel bluish for print)
        $this->SetFillColor(210, 220, 230);
        $titleBandH = 10; // Réduit de 14 à 12
        $this->renderPolice('Calibri', 'B', 14); // Utilisation de Calibri Bold 14 au lieu de SetPdfFontRole
        $displayTitle = trim((string)$examNom) !== '' ? strtoupper((string)$examNom) : 'SPERMOGRAMME';
        if (!empty($specimen)) {
            $displayTitle .= ' (' . strtolower($specimen) . ')';
        }
        $this->Cell($tblW, $titleBandH, $this->renderTexte($displayTitle), 0, 1, 'C', true); // Utilisation de renderTexte au lieu de pdf_encode
        $this->Ln(1);
    }

    /**
     * Générer la section paramètres générique pour tous les types d'examens
     * Affiche tous les paramètres depuis parameters_json de manière dynamique
     */
    // $centerAll : si vrai, centre toutes les cellules (utile pour ZN)
    // $equalFour : si vrai et les 4 colonnes sont présentes (flag+range), force des largeurs égales
    public function renderParamètres($showFlag = true, $showRange = true, $showValues = false, $printHeader = true, $showUnit = true, $paramProportion = null, $centerAll = false, $equalFour = false) {
        // Calculer la largeur disponible
        $availableWidth = $this->w - PDF_LEFT_MARGIN - PDF_RIGHT_MARGIN;

        // Valeurs placeholders à ignorer (considérées comme "vide").
        $sanitizeUnit = static function ($unit) {
            $unit = trim((string) $unit);
            if ($unit === '') {
                return '';
            }

            $compact = preg_replace('/\s+/', '', $unit);
            if (preg_match('/^-+$/', $compact)) {
                return '';
            }

            $upper = strtoupper($compact);
            if (in_array($upper, ['N/A', 'NA', 'NONE', 'NULL'], true)) {
                return '';
            }

            return $unit;
        };

        // Normaliser les notations scientifiques pour l'affichage (ex: 10^3 -> 10³).
        $normalizeScientific = static function ($text) {
            $text = (string) $text;
            if ($text === '' || strpos($text, '^') === false) {
                return $text;
            }

            return preg_replace_callback('/\^(-?\d+)/', function ($m) {
                $map = [
                    '-' => '⁻',
                    '0' => '⁰',
                    '1' => '¹',
                    '2' => '²',
                    '3' => '³',
                    '4' => '⁴',
                    '5' => '⁵',
                    '6' => '⁶',
                    '7' => '⁷',
                    '8' => '⁸',
                    '9' => '⁹',
                ];

                $exp = $m[1];
                $out = '';
                $len = strlen($exp);
                for ($i = 0; $i < $len; $i++) {
                    $ch = $exp[$i];
                    $out .= $map[$ch] ?? $ch;
                }

                return $out;
            }, $text);
        };

        // Si un paramProportion est fourni, l'utiliser pour ajuster la colonne Paramètres
        // Permet à certains renders (ex: Rivalta) d'avoir 30% / 70% proportion
        $flagWidth = $showFlag ? round($availableWidth * 0.12) : 0;
        $valuesWidth = $showValues ? round($availableWidth * 0.20) : 0;

        if ($paramProportion !== null && is_numeric($paramProportion) && $paramProportion > 0 && $paramProportion < 1) {
            // Utiliser la proportion fournie pour la colonne Paramètres
            $paramWidth = round($availableWidth * $paramProportion);
            // Calculer le reste pour la colonne Résultat, puis pour Range si demandé
            $remaining = $availableWidth - $paramWidth - $flagWidth - $valuesWidth;
            if ($showRange) {
                // Donner une portion raisonnable à range (utilisé si nécessaire)
                $rangeWidth = round($availableWidth * 0.23);
                // Ajuster valueWidth en utilisant le reste
                $valueWidth = max(40, $availableWidth - $paramWidth - $flagWidth - $rangeWidth - $valuesWidth);
            } else {
                $rangeWidth = 0;
                $valueWidth = max(40, $remaining);
            }
        } else {
            // Ajuster les largeurs des colonnes proportionnellement selon les options (ancienne logique)
            if (!$showFlag && !$showRange && $showValues) {
                // SEROLOGIE: Paramètres + Résultat + Valeur
                $paramWidth = round($availableWidth * 0.35);
                $valueWidth = round($availableWidth * 0.325);
                $valuesWidth = $availableWidth - $paramWidth - $valueWidth;
                $flagWidth = 0;
                $rangeWidth = 0;
            } elseif ($showFlag && $showRange) {
                $paramWidth = round($availableWidth * 0.36);  // ~36% pour Paramètres
                $flagWidth = round($availableWidth * 0.10);   // ~10% pour FLAG
                $valueWidth = round($availableWidth * 0.28);  // ~28% pour Résultat
                $rangeWidth = $availableWidth - $paramWidth - $flagWidth - $valueWidth; // Le reste pour Range
                $valuesWidth = 0;
            } elseif ($showFlag && !$showRange) {
                $paramWidth = round($availableWidth * 0.38);  // ~38% pour Paramètres
                $flagWidth = round($availableWidth * 0.10);   // ~10% pour FLAG
                $valueWidth = $availableWidth - $paramWidth - $flagWidth; // Le reste pour Résultat
                $rangeWidth = 0;                               // Pas de Range
                $valuesWidth = 0;
            } elseif (!$showFlag && $showRange && $showValues) {
                // 4 colonnes: Paramètres + Résultat + Valeur + Range usuelle (TORCH, etc.)
                $paramWidth = round($availableWidth * 0.30);  // ~30% pour Paramètres
                $flagWidth = 0;                                // Pas de FLAG
                $valueWidth = round($availableWidth * 0.25);  // ~25% pour Résultat
                $valuesWidth = round($availableWidth * 0.225); // ~22.5% pour Valeur
                $rangeWidth = $availableWidth - $paramWidth - $valueWidth - $valuesWidth; // Le reste pour Range
            } elseif (!$showFlag && $showRange) {
                $paramWidth = round($availableWidth * 0.38);  // ~38% pour Paramètres (sans FLAG)
                $flagWidth = 0;                                // Pas de FLAG
                $valueWidth = round($availableWidth * 0.30);  // ~30% pour Résultat
                $rangeWidth = $availableWidth - $paramWidth - $valueWidth; // Le reste pour Range
                $valuesWidth = 0;
            } else {
                // !$showFlag && !$showRange && !$showValues
                $paramWidth = round($availableWidth * 0.40);  // ~40% pour Paramètres
                $flagWidth = 0;                                // Pas de FLAG
                $valueWidth = $availableWidth - $paramWidth;   // Le reste pour Résultat
                $rangeWidth = 0;                               // Pas de Range
                $valuesWidth = 0;
            }
        }
        // appliquer largeur égale si demandé
        if ($equalFour && $showFlag && $showRange && !$showValues) {
            $col = round($availableWidth / 4);
            $paramWidth = $flagWidth = $valueWidth = $rangeWidth = $col;
        }

        // En-têtes du tableau (optionnel)
        if ($printHeader) {
            $this->renderPolice('Calibri', 'B', 10);
            $this->SetFillColor(255, 255, 255); // Blanc pour les en-têtes
            $this->SetDrawColor(200, 210, 230); // Couleur des bordures

            $this->Cell($paramWidth, 8, $this->renderTexte($this->renderMajuscule('Paramètres')), 1, 0, 'C', true);
            if ($showFlag) {
                $this->Cell($flagWidth, 8, $this->renderTexte($this->renderMajuscule('Flag')), 1, 0, 'C', true);
            }
            $this->Cell($valueWidth, 8, $this->renderTexte($this->renderMajuscule('Résultat')), 1, 0, 'C', true);
            if ($showValues) {
                $this->Cell($valuesWidth, 8, $this->renderTexte($this->renderMajuscule('Valeur')), 1, 0, 'C', true);
            }
            if ($showRange) {
                $this->Cell($rangeWidth, 8, $this->renderTexte($this->renderMajuscule('Range usuelle')), 1, 1, 'C', true);
            } else {
                $this->Ln();
            }
        }

        // Données des résultats
        $this->renderPolice('Calibri', '', 10);
        $this->SetDrawColor(200, 210, 230); // Couleur des bordures pour les données

        if (isset($this->examData['results']) && is_array($this->examData['results'])) {
            // Mode SEROLOGIE: fusionner RESULTAT et VALEURS dans une seule ligne
            // Only do the single-line aggregation when printing the main header (avoid when rendering remaining rows)
            if ($showValues && !$showFlag && !$showRange && $printHeader) {
                $resultatValue = '';
                $valeursValue = '';
                
                foreach ($this->examData['results'] as $result) {
                    if (isset($result['is_not_required']) && $result['is_not_required'] == 1) {
                        continue;
                    }
                    
                    $parameterName = html_entity_decode($result['name'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8');
                    $value = $normalizeScientific(html_entity_decode($result['value'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8'));
                    $unit = $normalizeScientific($sanitizeUnit(html_entity_decode($result['unit'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8')));
                    
                    $valueUpper = $this->renderMajuscule($value);
                    $valueWithUnit = $valueUpper;
                    if ($showUnit && $unit !== '') {
                        // Garder l'unité exactement telle qu'enregistrée.
                        $valueWithUnit .= ' ' . $unit;
                    }

                    // Si l'utilisateur a rempli le champ 'other', l'afficher en priorité
                    $otherVal = $normalizeScientific(html_entity_decode($result['other'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8'));
                    $displayVal = ($otherVal !== '') ? $this->renderMajuscule($otherVal) : $valueWithUnit;

                    if ($parameterName === 'RESULTAT') {
                        $resultatValue = $displayVal;
                    } elseif ($parameterName === 'VALEURS') {
                        $valeursValue = $displayVal;
                    }
                }
                
                // Afficher une seule ligne avec RESULTAT et VALEURS
                $testName = $this->examData['exam_name'] ?? 'SEROLOGIE';
                $align = $centerAll ? 'C' : 'L';
                $this->Cell($paramWidth, 6, $this->renderTexte($testName), 1, 0, $align);
                $this->Cell($valueWidth, 6, $this->renderTexte($resultatValue), 1, 0, 'C');
                $this->Cell($valuesWidth, 6, $this->renderTexte($valeursValue), 1, 1, 'C');
            } else {
                // Mode normal: afficher chaque paramètre sur une ligne
                foreach ($this->examData['results'] as $result) {
                    // Ne pas afficher les paramètres marqués comme "Not Required"
                    if (isset($result['is_not_required']) && $result['is_not_required'] == 1) {
                        continue;
                    }

                    $parameterName = html_entity_decode($result['name'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8');
                    $flag = html_entity_decode($result['flag'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8');
                    $value = $normalizeScientific(html_entity_decode($result['value'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8'));
                    $unit = $normalizeScientific($sanitizeUnit(html_entity_decode($result['unit'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8')));
                    $range = $normalizeScientific($sanitizeUnit(html_entity_decode($result['range'] ?? $result['reference_range'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8')));

                    // Combiner valeur et unité dans la même colonne
                    $valueUpper = $this->renderMajuscule($value);
                    $valueWithUnit = $valueUpper;
                    if ($showUnit && $unit !== '') {
                        // Garder l'unité exactement telle qu'enregistrée.
                        $valueWithUnit .= ' ' . $unit;
                    }

                    // Si l'utilisateur a rempli le champ 'other', l'afficher en priorité
                    $otherVal = $normalizeScientific(html_entity_decode($result['other'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8'));
                    $displayVal = ($otherVal !== '') ? $this->renderMajuscule($otherVal) : $valueWithUnit;

                    // Pour SEROLOGIE: si le paramètre s'appelle VALEURS, afficher dans la colonne Valeur
                    $displayValue = $displayVal;
                    $displayValuesCol = '';
                    if ($showValues && $parameterName === 'VALEURS') {
                        // Afficher la valeur dans la colonne Valeur au lieu de Résultat
                        $displayValue = '';
                        $displayValuesCol = $displayVal;
                    }

                    $range = $this->renderMajuscule($range);

                    $alignParam = $centerAll ? 'C' : 'L';
                $this->Cell($paramWidth, 6, $this->renderTexte($parameterName), 1, 0, $alignParam);
                    if ($showFlag) {
                        $flagAlign = $centerAll ? 'C' : 'C';
                        $this->Cell($flagWidth, 6, $this->renderTexte($flag), 1, 0, $flagAlign);
                    }
                    $this->Cell($valueWidth, 6, $this->renderTexte($displayValue), 1, 0, 'C');
                    if ($showValues) {
                        $this->Cell($valuesWidth, 6, $this->renderTexte($displayValuesCol), 1, 0, 'C');
                    }
                    if ($showRange) {
                        $this->Cell($rangeWidth, 6, $this->renderTexte($range), 1, 1, 'C');
                    } else {
                        $this->Ln();
                    }
                }
            }
        }

        $this->Ln(2);
    }

    /**
     * Générer la section résultats pour spermogramme
     */
    public function renderSpermogramme() {
        $this->renderPolice();
        // Utilisation du bandeau de titre générique
        $this->renderTitre($this->examData['exam_name'] ?? 'SPERMOGRAMME', $this->examData['specimen'] ?? '');

        // Utilisation de la fonction générique pour afficher les paramètres (sans FLAG pour Spermogramme)
        $this->renderParamètres(false);

        // Afficher les commentaires individuels des paramètres
        $this->renderCommentIndividuel();
    }

    /**
     * Générer la section résultats pour SEDIMENT URINAIRE
     * Utilise les helpers génériques : titre, paramètres, commentaires individuels
     */
    public function renderSedimentUrinaire() {
        $this->renderPolice();
        // Utilisation du bandeau de titre générique
        $this->renderTitre($this->examData['exam_name'] ?? 'SEDIMENT URINAIRE', $this->examData['specimen'] ?? '');

        // Utilisation de la fonction générique pour afficher les paramètres (sans FLAG, avec range usuelle, sans unité)
        $this->renderParamètres(false, true, false, true, false);

        // Afficher les commentaires individuels des paramètres
        $this->renderCommentIndividuel();
    }

    /**
     * Générer la section résultats pour URINES ROUTINES
     * Utilise la même logique que SEDIMENT URINAIRE (titre, paramètres, commentaires individuels)
     */
    public function renderUrinesRoutines() {
        $this->renderPolice();
        // Bandeau titre générique
        $this->renderTitre($this->examData['exam_name'] ?? 'URINES ROUTINES', $this->examData['specimen'] ?? '');

        // Paramètres (sans FLAG, avec range usuelle, sans unité)
        $this->renderParamètres(false, true, false, true, false);

        // Commentaires individuels (utiliser 40% pour la colonne Paramètres)
        $this->renderCommentIndividuel(0.45);
    }

    /**
     * Générer la section description de l'examen (générique)
     * Utilisation :
     * - $this->renderExamDescription() // Utilise $this->examData['description']
     * - $this->renderExamDescription("Description personnalisée") // Utilise le texte passé en paramètre
     * @param string $description Texte de description à afficher
     */
    public function renderExamDescription($description = null) {
        $this->renderPolice();
        $descriptionText = $description ?? $this->examData['description'] ?? '';
        $descriptionText = $this->normalizeRichTextList($descriptionText);

        if (!empty($descriptionText)) {
            $this->renderPolice('Calibri', 'B', 10);
            $this->Cell(0, 8, $this->renderTexte('DESCRIPTION DE L\'EXAMEN'), 0, 1, 'C');
            $this->Ln(2);

            $this->renderPolice('Calibri', '', 10);
            $this->MultiCell(0, 5, $this->renderTexte($descriptionText));
            $this->Ln(3);
        }
    }

    /**
     * Définir la police pour tous les textes
     * @param string $famille Famille de police (par défaut 'Calibri')
     * @param string $style Style ('', 'B', 'I', 'U')
     * @param int $taille Taille de la police
     */
    public function renderPolice($famille = 'Calibri', $style = '', $taille = 10) {
        $this->SetFont($famille, $style, $taille);
    }

    /**
     * Normalise les textes riches saisis (puces/numérotations/espaces parasites).
     */
    private function normalizeRichTextList($text) {
        $text = (string) $text;
        if ($text === '') {
            return '';
        }

        $text = str_replace(["\r\n", "\r"], "\n", $text);
        $text = str_replace("\xEF\xBF\xBD", '', $text); // caractère de remplacement UTF-8
        $text = str_replace("\xEF\x82\xB7", '•', $text); // puce Word (U+F0B7)
        $text = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]+/u', '', $text);

        $lines = explode("\n", $text);
        foreach ($lines as &$line) {
            $line = rtrim($line);
            // Uniformiser les puces en "• " avec un seul espace.
            $line = preg_replace('/^\s*[•●◦▪▫■□\-*]+\s*/u', '• ', $line);
            // Uniformiser les numérotations "1." / "1)" avec un seul espace après le marqueur.
            $line = preg_replace('/^\s*(\d{1,3}[\.)])\s+/', '$1 ', $line);
            // Uniformiser aussi les lettres "a." / "a)".
            $line = preg_replace('/^\s*([a-zA-Z][\.)])\s+/', '$1 ', $line);
        }
        unset($line);

        return trim(implode("\n", $lines));
    }

    /**
     * Masque les placeholders techniques pour l'affichage dans les cellules PDF.
     */
    private function sanitizePlaceholderValue($value) {
        $value = trim((string) $value);
        if ($value === '') {
            return '';
        }

        $compact = preg_replace('/\s+/', '', $value);
        if (preg_match('/^-+$/', $compact)) {
            return '';
        }

        $upper = strtoupper($compact);
        if (in_array($upper, ['N/A', 'NA', 'NONE', 'NULL'], true)) {
            return '';
        }

        return $value;
    }

    /**
     * Encoder le texte pour FPDF (UTF-8 vers ISO-8859-1)
     * @param string $text Texte à encoder
     * @return string Texte encodé
     */
    public function renderTexte($text) {
        if ($text === null) {
            return '';
        }

        $text = (string) $text;

        // Décoder les entités HTML éventuelles stockées en base.
        $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');

        // Normalisations fréquentes (ponctuation/espaces) avant conversion FPDF.
        // Important: mb_strtoupper peut transformer "μ" en "Μ" (Mu grec majuscule),
        // non représentable en CP1252; on le ramène explicitement vers le signe micro.
        $text = str_replace('Μ', 'µ', $text);
        $text = str_replace('μ', 'µ', $text);
        $text = str_replace(["\xC2\xA0", "\xE2\x80\xAF"], ' ', $text); // nbsp, narrow nbsp
        $text = str_replace(["\xE2\x80\x98", "\xE2\x80\x99"], "'", $text); // apostrophes typographiques
        $text = str_replace(["\xE2\x80\x9C", "\xE2\x80\x9D"], '"', $text); // guillemets typographiques
        $text = str_replace("\xE2\x80\x93", '-', $text); // tiret demi-cadratin
        $text = str_replace("\xE2\x80\x94", '-', $text); // tiret cadratin
        $text = str_replace("\xE2\x80\xA6", '...', $text); // points de suspension

        // Notation scientifique: 10^3 -> 10³, 10^-3 -> 10⁻³.
        if (strpos($text, '^') !== false) {
            $text = preg_replace_callback('/\^(-?\d+)/', function ($m) {
                $map = [
                    '-' => '⁻',
                    '0' => '⁰',
                    '1' => '¹',
                    '2' => '²',
                    '3' => '³',
                    '4' => '⁴',
                    '5' => '⁵',
                    '6' => '⁶',
                    '7' => '⁷',
                    '8' => '⁸',
                    '9' => '⁹',
                ];

                $exp = $m[1];
                $out = '';
                $len = strlen($exp);
                for ($i = 0; $i < $len; $i++) {
                    $ch = $exp[$i];
                    $out .= $map[$ch] ?? $ch;
                }

                return $out;
            }, $text);
        }

        // Si la chaîne n'est pas en UTF-8 valide, tenter de la remettre en UTF-8 depuis encodages legacy.
        if (function_exists('mb_check_encoding') && !mb_check_encoding($text, 'UTF-8')) {
            if (function_exists('mb_convert_encoding')) {
                $repaired = @mb_convert_encoding($text, 'UTF-8', 'Windows-1252,ISO-8859-1');
                if (is_string($repaired) && $repaired !== '') {
                    $text = $repaired;
                }
            }
        }

        // Priorité Windows-1252 (souvent mieux supporté par les polices/FPDF en prod), puis ISO-8859-1.
        if (function_exists('iconv')) {
            $converted = @iconv('UTF-8', 'Windows-1252//TRANSLIT//IGNORE', $text);
            if (is_string($converted) && $converted !== '') {
                return $converted;
            }

            $converted = @iconv('UTF-8', 'ISO-8859-1//TRANSLIT//IGNORE', $text);
            if (is_string($converted) && $converted !== '') {
                return $converted;
            }
        }

        if (function_exists('mb_convert_encoding')) {
            $converted = @mb_convert_encoding($text, 'Windows-1252', 'UTF-8');
            if (is_string($converted) && $converted !== '') {
                return $converted;
            }

            $converted = @mb_convert_encoding($text, 'ISO-8859-1', 'UTF-8');
            if (is_string($converted) && $converted !== '') {
                return $converted;
            }
        }

        // Dernier recours: retirer les caractères de contrôle problématiques.
        $fallback = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $text);
        return is_string($fallback) ? $fallback : $text;
    }

    /**
     * Convertir du texte en majuscules
     * @param string $text Texte à convertir
     * @return string Texte en majuscules
     */
    public function renderMajuscule($text) {
        return mb_strtoupper($text, 'UTF-8');
    }

    /**
     * Afficher les commentaires individuels des paramètres (bouton ➕)
     * Fonction générique utilisable pour tous les modals
     */
    public function renderCommentIndividuel($paramProportion = null) {
        if (!isset($this->examData['results']) || !is_array($this->examData['results'])) {
            return;
        }

        $hasComments = false;
        foreach ($this->examData['results'] as $result) {
            if (!empty($result['comment'])) {
                $hasComments = true;
                break;
            }
        }

        if (!$hasComments) {
            return; // Pas de commentaires à afficher
        }

        $this->Ln(10);
        $this->renderPolice('Calibri', 'B', 10);
        $this->Cell(0, 8, $this->renderTexte($this->renderMajuscule('NOTES')), 0, 1, 'C');
        $this->Ln(2);

        $this->renderPolice('Calibri', '', 9);
        // Fusionner les commentaires RESULTAT/VALEUR par préfixe de paramètre
        $commentMap = [];
        foreach ($this->examData['results'] as $result) {
            if (empty($result['comment'])) continue;
            $name = html_entity_decode($result['name'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8');
            // Normaliser le préfixe en retirant les suffixes RESULTAT/VALEUR(S)
            $prefix = preg_replace('/\s+RESULTAT$/i', '', $name);
            $prefix = preg_replace('/\s+VALEURS?$/i', '', $prefix);
            $prefix = trim($prefix);
            // Ne conserver qu'un seul commentaire par préfixe (priorité au premier trouvé)
            if (!isset($commentMap[$prefix]) || $commentMap[$prefix] === '') {
                $commentMap[$prefix] = $this->normalizeRichTextList(html_entity_decode($result['comment'], ENT_QUOTES | ENT_HTML5, 'UTF-8'));
            }
        }

        // Calculer largeur pour la colonne Paramètres dans la section commentaires
        $availableWidth = $this->w - PDF_LEFT_MARGIN - PDF_RIGHT_MARGIN;
        if ($paramProportion !== null && is_numeric($paramProportion) && $paramProportion > 0 && $paramProportion < 1) {
            $paramWidth = round($availableWidth * $paramProportion);
        } else {
            // valeur par défaut: 30% si aucune proportion fournie
            $paramWidth = round($availableWidth * 0.30);
        }

        // Afficher les commentaires fusionnés
        foreach ($commentMap as $prefix => $commentText) {
            if (trim($commentText) === '') continue;
            $parameterName = $this->renderMajuscule($prefix);
            $comment = $this->renderMajuscule($this->normalizeRichTextList($commentText));

            $this->renderPolice('Calibri', '', 9);
            $this->Cell($paramWidth, 5, $this->renderTexte($parameterName . ' :'), 0, 0, 'L');
            $this->renderPolice('Calibri', '', 9);
            $this->MultiCell(0, 5, $this->renderTexte($comment), 0, 'L');
            $this->Ln(2);
        }
    }

    /**
     * Générer la section fichiers joints (générique)
     * Affiche tous les fichiers attachés à l'examen en convertissant documents/PDFs en images
     * Utilisation :
     * - $this->renderFichiers() // Affiche les fichiers depuis $this->examData['attachments']
     */
    public function renderFichiers() {
        $this->renderPolice();
        
        // Récupérer les attachments
        $attachments = [];
        if (!empty($this->examData['attachments'])) {
            // Les attachments peuvent être une chaîne JSON ou un array
            if (is_string($this->examData['attachments'])) {
                $attachments = json_decode($this->examData['attachments'], true);
            } elseif (is_array($this->examData['attachments'])) {
                $attachments = $this->examData['attachments'];
            }
        }

        // Si pas de fichiers, retour sans rien afficher
        if (!is_array($attachments) || count($attachments) === 0) {
            return;
        }

        // Marquer que nous sommes sur la page ANNEXE
        $this->isAnnexePage = true;
        
        // Ajouter une nouvelle page pour les annexes
        $this->AddPage();
        $this->SetY(PDF_TOP_MARGIN);

        // Titre "ANNEXE:"
        $this->renderPolice('Calibri', 'B', 14);

        $titleBandH = 10;
        $boxWidth = $this->w - PDF_LEFT_MARGIN - PDF_RIGHT_MARGIN;
        
        // Ne compter que les fichiers réellement présents côté serveur (avec 'path')
        $serverAttachments = array_filter($attachments, function($a) {
            return !empty($a['path']);
        });

        if (!is_array($serverAttachments) || count($serverAttachments) === 0) {
            // Aucun fichier serveur à afficher
            return;
        }

        // Ajuster le titre selon le nombre de fichiers serveur
        $annexeTitle = count($serverAttachments) === 1 ? 'ANNEXE: FICHIER JOINT' : 'ANNEXE: FICHIERS JOINTS';

        $this->Cell($boxWidth, $titleBandH, $this->renderTexte($annexeTitle), 0, 1, 'C', true);
        $this->Ln(5);

        // Traiter chaque fichier attaché (seulement ceux serveur)
        foreach ($serverAttachments as $fileIndex => $attachment) {
            $fileName = html_entity_decode($attachment['name'] ?? $attachment['original_name'] ?? $attachment['filename'] ?? 'Fichier inconnu', ENT_QUOTES | ENT_HTML5, 'UTF-8');
            $filePath = $attachment['path'] ?? '';
            $fileSize = isset($attachment['size']) ? $this->formatFileSize($attachment['size']) : 'N/A';
            $fileType = html_entity_decode($attachment['type'] ?? $attachment['mime_type'] ?? 'Type inconnu', ENT_QUOTES | ENT_HTML5, 'UTF-8');

            // Afficher le nom du fichier
            $this->renderPolice('Calibri', 'B', 11);
            $this->Cell($boxWidth, 8, $this->renderTexte($fileName), 0, 1, 'L');
            $this->Ln(2);

            // Ignorer les entrées sans chemin côté serveur (objets File côté client)
            if (empty($filePath)) {
                // Pas de chemin disponible -> fichier non uploadé, on ignore
                continue;
            }

            // Normaliser et résoudre le chemin attaché (gère Windows -> Linux ou chemins relatifs)
            $normalizedPath = normalizeAttachmentPath($filePath);
            error_log("renderFichiers: resolved path '$filePath' -> '$normalizedPath'");

            // Vérifier l'existence du fichier sur le disque
            if (!file_exists($normalizedPath)) {
                $altPath1 = rtrim($_SERVER['DOCUMENT_ROOT'], DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . ltrim($filePath, '/\\');
                $altPath2 = rtrim($_SERVER['DOCUMENT_ROOT'], DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . ltrim(str_replace('\\', '/', $filePath), '/');

                if (file_exists($altPath1)) {
                    $normalizedPath = $altPath1;
                } elseif (file_exists($altPath2)) {
                    $normalizedPath = $altPath2;
                }
            }

            if (!file_exists($normalizedPath)) {
                $this->renderPolice('Calibri', 'I', 9);
                $this->SetTextColor(200, 0, 0);
                $msg1 = 'Fichier non trouvé';
                $msg2 = " (chemin: $filePath, essayé: $normalizedPath)";
                $this->Cell(0, 5, $this->renderTexte($msg1 . $msg2), 0, 1, 'L');
                $this->SetTextColor(0, 0, 0);
                $this->Ln(3);
                error_log("renderFichiers: failed find '$filePath' => '$normalizedPath' / alt1 '$altPath1' / alt2 '$altPath2'");
                continue;
            }

            // Utiliser le chemin normalisé pour la suite
            $filePath = $normalizedPath;

            // Convertir le fichier en images
            error_log("renderFichiers: Converting file: $filePath");
            $images = convertFileToImages($filePath, 5); // Max 5 pages

            if (empty($images)) {
                // Fichier non converti - afficher un message
                $this->renderPolice('Calibri', 'I', 9);
                $this->SetTextColor(150, 100, 0);
                $this->Cell(0, 5, $this->renderTexte('Format non supporté ou conversion échouée.'), 0, 1, 'L');
                $this->SetTextColor(0, 0, 0);
                $this->Ln(3);
                continue;
            }

            // Afficher les images converties
            $imgIndex = 0;
            foreach ($images as $imagePath) {
                if (!file_exists($imagePath)) {
                    error_log("renderFichiers: Image not found: $imagePath");
                    continue;
                }

                $imgIndex++;

                // Vérifier les dimensions de l'image
                $imageInfo = @getimagesize($imagePath);
                if (!$imageInfo) {
                    error_log("renderFichiers: Cannot get image info: $imagePath");
                    continue;
                }

                $imgWidth = $imageInfo[0];
                $imgHeight = $imageInfo[1];
                $imgRatio = $imgWidth / $imgHeight;

                // Calculer l'espace disponible en tenant compte du bottom margin
                $currentY = $this->GetY();
                $availableHeight = $this->h - PDF_BOTTOM_MARGIN - $currentY - 5; // -5 pour la marge de sécurité

                // Calculer la taille de l'image dans le PDF (max largeur: boxWidth - 5mm)
                $maxWidth = $boxWidth - 4;
                $maxHeight = min(250, $availableHeight); // Limiter par la hauteur disponible aussi

                if ($imgRatio > ($maxWidth / $maxHeight)) {
                    // Limited by width
                    $displayWidth = $maxWidth;
                    $displayHeight = $displayWidth / $imgRatio;
                } else {
                    // Limited by height
                    $displayHeight = $maxHeight;
                    $displayWidth = $displayHeight * $imgRatio;
                }

                // Afficher un numéro de page si plusieurs pages
                if (count($images) > 1) {
                    $this->renderPolice('Calibri', '', 8);
                    $this->SetTextColor(100, 100, 100);
                    $this->Cell(0, 3, $this->renderTexte('Page ' . $imgIndex), 0, 1, 'R');
                    $this->SetTextColor(0, 0, 0);
                }

                // Calculer la position X pour centrer l'image
                $centerX = PDF_LEFT_MARGIN + ($boxWidth - $displayWidth) / 2;

                // Préserver fond blanc pour images PNG (transparence / conversion Ghostscript) : évite l'apparition d'une zone noire
                $imageToDraw = $imagePath;
                $tmpFlatten = null;
                if (isset($imageInfo[2]) && $imageInfo[2] === IMAGETYPE_PNG && function_exists('imagecreatefrompng')) {
                    $img = @imagecreatefrompng($imagePath);
                    if ($img) {
                        $fw = imagesx($img); $fh = imagesy($img);
                        $dst = imagecreatetruecolor($fw, $fh);
                        $white = imagecolorallocate($dst, 255, 255, 255);
                        imagefilledrectangle($dst, 0, 0, $fw, $fh, $white);
                        imagecopy($dst, $img, 0, 0, 0, 0, $fw, $fh);
                        $tmpFlatten = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'pdf_img_flat_' . md5($imagePath . microtime(true)) . '.png';
                        if (imagepng($dst, $tmpFlatten)) {
                            $imageToDraw = $tmpFlatten;
                        }
                        imagedestroy($img);
                        imagedestroy($dst);
                    }
                }

                // Afficher l'image centré - laisser FPDF gérer les sauts de page automatiquement
                try {
                    $this->Image($imageToDraw, $centerX, $this->GetY(), $displayWidth, $displayHeight);
                    $this->Ln($displayHeight + 3);
                } catch (Exception $e) {
                    error_log("renderFichiers: Error displaying image: " . $e->getMessage());
                    $this->renderPolice('Calibri', 'I', 8);
                    $this->SetTextColor(200, 0, 0);
                    $this->Cell(0, 5, $this->renderTexte('Erreur lors de l\'affichage de l\'image.'), 0, 1, 'L');
                    $this->SetTextColor(0, 0, 0);
                }

                if ($tmpFlatten && file_exists($tmpFlatten)) {
                    @unlink($tmpFlatten);
                }
            }

            $this->Ln(5);

            // Nettoyer les fichiers temporaires (mais pas les images natives/originales)
            $tempDir = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'document_conversions';
            foreach ($images as $imagePath) {
                // Ne supprimer que les fichiers dans le répertoire temporaire
                if (strpos($imagePath, $tempDir) === 0) {
                    @unlink($imagePath);
                }
            }
        }

        $this->Ln(3);

        // Message informatif supprimé (affichage volontairement silencieux)
    }

    /**
     * Dessiner un placeholder pour une image manquante
     * @param float $x Position X
     * @param float $y Position Y
     * @param float $w Largeur
     * @param float $h Hauteur
     */
    private function drawImagePlaceholder($x, $y, $w, $h) {
        $this->SetDrawColor(180, 180, 180);
        $this->Rect($x, $y, $w, $h);
        $this->SetXY($x, $y + ($h / 2) - 2);
        $this->SetFont('Calibri', '', 8);
        $this->Cell($w, 3, $this->renderTexte('Aperçu'), 0, 0, 'C');
    }

    /**
     * Dessiner une icône de fichier selon son type
     * @param float $x Position X
     * @param float $y Position Y
     * @param float $w Largeur
     * @param float $h Hauteur
     * @param string $mimeType Type MIME du fichier
     */
    private function drawFileIcon($x, $y, $w, $h, $mimeType) {
        // Déterminer l'icône selon le type MIME
        $iconMap = [
            'application/pdf' => '📄',
            'application/msword' => '📘',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => '📘',
            'application/vnd.ms-excel' => '📊',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' => '📊',
            'application/vnd.ms-powerpoint' => '📑',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation' => '📑',
            'text/plain' => '📝',
            'text/csv' => '📊',
            'application/zip' => '📦',
            'application/x-rar-compressed' => '📦'
        ];

        // Récupérer l'icône ou utiliser une icône par défaut
        $icon = $iconMap[$mimeType] ?? '📎';

        // Créer un rectangle pour l'icône
        $this->SetDrawColor(200, 210, 230);
        $this->Rect($x, $y, $w, $h);
        
        // Afficher l'icône
        $this->SetXY($x, $y + ($h / 2) - 3);
        $this->SetFont('Calibri', '', 16);
        $this->Cell($w, 6, $icon, 0, 0, 'C');
    }

    /**
     * Formater la taille d'un fichier en unités lisibles (B, KB, MB, GB)
     * @param int $bytes Taille en bytes
     * @return string Taille formatée
     */
    private function formatFileSize($bytes) {
        $bytes = (int)$bytes;
        if ($bytes === 0) return '0 B';
        
        $units = ['B', 'KB', 'MB', 'GB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= (1 << (10 * $pow));

        return round($bytes, 2) . ' ' . $units[$pow];
    }

    /**
     * Générer le PDF complet pour spermogramme
     */
    public function generateSpermogrammePDF() {
        $this->AddPage();
        $this->AliasNbPages();

        $this->renderSpermogramme();
        $this->renderComments($this->examData['comments'] ?? '');
        $this->renderExamDescription($this->examData['description'] ?? 'Le spermogramme est un examen qui évalue la qualité du sperme et permet de détecter d\'éventuels troubles de la fertilité masculine.');
        $this->renderSignature();
        $this->renderFichiers();

        return $this->Output('S'); // Retourner le PDF en string
    }

    /**
     * Générer le PDF complet pour SEDIMENT URINAIRE
     */
    public function generateSedimentUrinairePDF() {
        $this->AddPage();
        $this->AliasNbPages();

        $this->renderSedimentUrinaire();
        $this->renderComments($this->examData['comments'] ?? '');
        $this->renderExamDescription($this->examData['description'] ?? 'Le sediment urinaire est un examen qui étudie les éléments présents dans l\'urine.');
        $this->renderSignature();
        $this->renderFichiers();

        return $this->Output('S'); // Retourner le PDF en string
    }

    /**
     * Générer le PDF complet pour URINES ROUTINES
     */
    public function generateUrinesRoutinesPDF() {
        $this->AddPage();
        $this->AliasNbPages();

        $this->renderUrinesRoutines();
        $this->renderComments($this->examData['comments'] ?? '');
        $this->renderExamDescription($this->examData['description'] ?? 'L\'examen URINES ROUTINES étudie les différents paramètres urinaires de routine.');
        $this->renderSignature();
        $this->renderFichiers();

        return $this->Output('S');
    }

    /**
     * Générer la section résultats pour SELLES ROUTINE
     */
    public function renderSellesRoutines() {
        $this->renderPolice();
        // Bandeau titre générique
        $this->renderTitre($this->examData['exam_name'] ?? 'SELLES ROUTINE', $this->examData['specimen'] ?? '');

        // Paramètres (sans FLAG, avec range usuelle, sans unité)
        $this->renderParamètres(false, true, false, true, false);

        // Commentaires individuels
        $this->renderCommentIndividuel();
    }

    /**
     * Générer la section résultats para PDF SELLES ROUTINE
     */
    public function generateSellesRoutinesPDF() {
        $this->AddPage();
        $this->AliasNbPages();

        $this->renderSellesRoutines();
        $this->renderComments($this->examData['comments'] ?? '');
        $this->renderExamDescription($this->examData['description'] ?? 'L\'examen SELLES ROUTINE étudie les différents paramètres des selles de routine.');
        $this->renderSignature();
        $this->renderFichiers();

        return $this->Output('S');
    }

    /**
     * Générer la section résultats pour RIVALTA (TRANSSUDAT ET EXSUDAT)
     */
    public function renderRivalta() {
        $this->renderPolice();
        // Bandeau titre générique
        $this->renderTitre($this->examData['exam_name'] ?? 'RIVALTA (TRANSSUDAT ET EXSUDAT)', $this->examData['specimen'] ?? '');

        // Utiliser le rendu générique mais demander : pas d'unité, pas de range, proportion 30%/70%
        $this->renderParamètres(false, false, false, true, false, 0.30);

        // Commentaires individuels
        $this->renderCommentIndividuel();
    }

    /**
     * Rendu des paramètres pour RIVALTA avec proportions ajustées
     * Colonne PARAMÈTRES réduite pour plus d'espace à RÉSULTAT
     */
    private function renderRivaltaParametres() {
        $availableWidth = $this->w - PDF_LEFT_MARGIN - PDF_RIGHT_MARGIN;
        
        // Proportions : 30% Paramètres, 70% Résultat
        $paramWidth = round($availableWidth * 0.30);
        $valueWidth = $availableWidth - $paramWidth;

        // En-tête
        $this->renderPolice('Calibri', 'B', 9);
        $this->SetFillColor(255, 255, 255);
        $this->SetDrawColor(200, 210, 230);
        $this->Cell($paramWidth, 8, $this->renderTexte($this->renderMajuscule('Paramètres')), 1, 0, 'C', true);
        $this->Cell($valueWidth, 8, $this->renderTexte($this->renderMajuscule('Résultat')), 1, 1, 'C', true);

        // Données
        $this->renderPolice('Calibri', '', 9);
        $this->SetDrawColor(200, 210, 230);

        if (isset($this->examData['results']) && is_array($this->examData['results'])) {
            foreach ($this->examData['results'] as $result) {
                if (isset($result['is_not_required']) && $result['is_not_required'] == 1) {
                    continue;
                }

                $parameterName = html_entity_decode($result['name'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8');
                $value = html_entity_decode($result['value'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8');
                $otherVal = html_entity_decode($result['other'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8');
                $displayVal = ($otherVal !== '') ? $otherVal : $value;
                $displayVal = $this->renderMajuscule((string)$displayVal);

                $this->Cell($paramWidth, 6, $this->renderTexte($parameterName), 1, 0, 'L');
                $this->Cell($valueWidth, 6, $this->renderTexte($displayVal), 1, 1, 'C');
            }
        }

        $this->Ln(10);
    }

    /**
     * Générer le PDF pour RIVALTA
     */
    public function generateRivaltaPDF() {
        $this->AddPage();
        $this->AliasNbPages();

        $this->renderRivalta();
        $this->renderComments($this->examData['comments'] ?? '');
        $this->renderExamDescription($this->examData['description'] ?? 'Test Rivalta: différenciation transsudat / exsudat.');
        $this->renderSignature();
        $this->renderFichiers();

        return $this->Output('S');
    }

    /**
     * Générer la section résultats pour PROTEINE DE BINCES-JONES
     */
    public function renderProteineBincesJones() {
        $this->renderPolice();
        // Bandeau titre générique
        $this->renderTitre($this->examData['exam_name'] ?? 'PROTEINE DE BINCES-JONES', $this->examData['specimen'] ?? '');

        // Rendu spécialisé pour PROTEINE BINCES-JONES avec proportions ajustées
        $this->renderProteineBincesJonesParametres();

        // Commentaires individuels
        $this->renderCommentIndividuel();
    }

    /**
     * Générer la section résultats pour FROTTIS SANG PERIPHERIQUE
     * Reprend exactement le rendu de PROTEINE DE BINCES-JONES
     */
    public function renderFrottiessangperiph() {
        $this->renderPolice();
        // Bandeau titre générique
        $this->renderTitre($this->examData['exam_name'] ?? 'FROTTIS SANG PERIPHERIQUE', $this->examData['specimen'] ?? '');

        // Rendu spécialisé : utiliser le rendu générique des paramètres avec 40% pour la colonne Paramètres
        $this->renderParamètres(false, false, false, true, true, 0.45);

        // Commentaires individuels
        $this->renderCommentIndividuel();
    }

    /**
     * Rendu des paramètres pour PROTEINE BINCES-JONES avec proportions ajustées
     * Colonne PARAMÈTRES réduite pour plus d'espace à RÉSULTAT
     */
    private function renderProteineBincesJonesParametres() {
        $availableWidth = $this->w - PDF_LEFT_MARGIN - PDF_RIGHT_MARGIN;
        
        // Proportions : 30% Paramètres, 70% Résultat
        $paramWidth = round($availableWidth * 0.30);
        $valueWidth = $availableWidth - $paramWidth;

        // En-tête
        $this->renderPolice('Calibri', 'B', 9);
        $this->SetFillColor(255, 255, 255);
        $this->SetDrawColor(200, 210, 230);
        $this->Cell($paramWidth, 8, $this->renderTexte($this->renderMajuscule('Paramètres')), 1, 0, 'C', true);
        $this->Cell($valueWidth, 8, $this->renderTexte($this->renderMajuscule('Résultat')), 1, 1, 'C', true);

        // Données
        $this->renderPolice('Calibri', '', 9);
        $this->SetDrawColor(200, 210, 230);

        if (isset($this->examData['results']) && is_array($this->examData['results'])) {
            foreach ($this->examData['results'] as $result) {
                if (isset($result['is_not_required']) && $result['is_not_required'] == 1) {
                    continue;
                }

                $parameterName = html_entity_decode($result['name'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8');
                $value = html_entity_decode($result['value'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8');
                $otherVal = html_entity_decode($result['other'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8');
                $displayVal = ($otherVal !== '') ? $otherVal : $value;
                $displayVal = $this->renderMajuscule((string)$displayVal);

                $this->Cell($paramWidth, 6, $this->renderTexte($parameterName), 1, 0, 'L');
                $this->Cell($valueWidth, 6, $this->renderTexte($displayVal), 1, 1, 'C');
            }
        }

        $this->Ln(10);
    }

    /**
     * Générer le PDF pour PROTEINE DE BINCES-JONES
     */
    public function generateProteineBincesJonesPDF() {
        $this->AddPage();
        $this->AliasNbPages();

        $this->renderProteineBincesJones();
        $this->renderComments($this->examData['comments'] ?? '');
        $this->renderExamDescription($this->examData['description'] ?? 'Protéines Bence Jones urinaires: détection et diagnostic du myélome multiple.');
        $this->renderSignature();
        $this->renderFichiers();

        return $this->Output('S');
    }

    /**
     * Générer le PDF complet pour FROTTIS SANG PERIPHERIQUE
     */
    public function generateFrottiessangperiphPDF() {
        $this->AddPage();
        $this->AliasNbPages();

        $this->renderFrottiessangperiph();
        $this->renderComments($this->examData['comments'] ?? '');
        $this->renderExamDescription($this->examData['description'] ?? 'Frottis sanguin périphérique: morphologie des cellules sanguines.');
        $this->renderSignature();
        $this->renderFichiers();

        return $this->Output('S');
    }

    /**
     * Générer la section résultats pour TRYPANOSOMIASE
     */
    public function renderTrypanosomiase() {
        $this->renderPolice();
        // Bandeau titre générique
        $this->renderTitre($this->examData['exam_name'] ?? 'TRYPANOSOMIASE', $this->examData['specimen'] ?? '');

        // Rendu spécialisé pour TRYPANOSOMIASE avec proportions ajustées
        $this->renderTrypanosomiaseParametres();

        // Commentaires individuels
        $this->renderCommentIndividuel();
    }

    /**
     * Rendu des paramètres pour TRYPANOSOMIASE avec proportions ajustées
     * Colonne PARAMÈTRES réduite pour plus d'espace à RÉSULTAT
     */
    private function renderTrypanosomiaseParametres() {
        $availableWidth = $this->w - PDF_LEFT_MARGIN - PDF_RIGHT_MARGIN;
        
        // Proportions : 30% Paramètres, 70% Résultat
        $paramWidth = round($availableWidth * 0.30);
        $valueWidth = $availableWidth - $paramWidth;

        // En-tête
        $this->renderPolice('Calibri', 'B', 9);
        $this->SetFillColor(255, 255, 255);
        $this->SetDrawColor(200, 210, 230);
        $this->Cell($paramWidth, 8, $this->renderTexte($this->renderMajuscule('Paramètres')), 1, 0, 'C', true);
        $this->Cell($valueWidth, 8, $this->renderTexte($this->renderMajuscule('Résultat')), 1, 1, 'C', true);

        // Données
        $this->renderPolice('Calibri', '', 9);
        $this->SetDrawColor(200, 210, 230);

        if (isset($this->examData['results']) && is_array($this->examData['results'])) {
            foreach ($this->examData['results'] as $result) {
                if (isset($result['is_not_required']) && $result['is_not_required'] == 1) {
                    continue;
                }

                $parameterName = html_entity_decode($result['name'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8');
                $value = html_entity_decode($result['value'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8');
                $otherVal = html_entity_decode($result['other'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8');
                $displayVal = ($otherVal !== '') ? $otherVal : $value;

                $this->Cell($paramWidth, 6, $this->renderTexte($parameterName), 1, 0, 'L');
                $this->Cell($valueWidth, 6, $this->renderTexte($displayVal), 1, 1, 'C');
            }
        }

        $this->Ln(10);
    }

    /**
     * Générer le PDF pour TRYPANOSOMIASE
     */
    public function generateTrypanosomiasePDF() {
        $this->AddPage();
        $this->AliasNbPages();

        $this->renderTrypanosomiase();
        $this->renderComments($this->examData['comments'] ?? '');
        $this->renderExamDescription($this->examData['description'] ?? 'Test de Trypanosomiase: détection des parasites trypanosoma.');
        $this->renderSignature();
        $this->renderFichiers();

        return $this->Output('S');
    }

    /**
     * Rendu global pour SANG OCCULTE
     */
    public function renderSangOcculte() {
        $this->renderPolice();
        // Bandeau titre générique
        $this->renderTitre($this->examData['exam_name'] ?? 'SANG OCCULTE', $this->examData['specimen'] ?? '');

        // Rendu spécialisé pour SANG OCCULTE avec proportions ajustées
        $this->renderSangOcculteParametres();

        // Commentaires individuels
        $this->renderCommentIndividuel();
    }

    /**
     * Rendu des paramètres pour SANG OCCULTE avec proportions ajustées
     * Colonne PARAMÈTRES réduite pour plus d'espace à RÉSULTAT
     */
    private function renderSangOcculteParametres() {
        $availableWidth = $this->w - PDF_LEFT_MARGIN - PDF_RIGHT_MARGIN;
        
        // Proportions : 30% Paramètres, 70% Résultat
        $paramWidth = round($availableWidth * 0.30);
        $valueWidth = $availableWidth - $paramWidth;

        // En-tête
        $this->renderPolice('Calibri', 'B', 9);
        $this->SetFillColor(255, 255, 255);
        $this->SetDrawColor(200, 210, 230);
        $this->Cell($paramWidth, 8, $this->renderTexte($this->renderMajuscule('Paramètres')), 1, 0, 'C', true);
        $this->Cell($valueWidth, 8, $this->renderTexte($this->renderMajuscule('Résultat')), 1, 1, 'C', true);

        // Données
        $this->renderPolice('Calibri', '', 9);
        $this->SetDrawColor(200, 210, 230);

        if (isset($this->examData['results']) && is_array($this->examData['results'])) {
            foreach ($this->examData['results'] as $result) {
                if (isset($result['is_not_required']) && $result['is_not_required'] == 1) {
                    continue;
                }

                $parameterName = html_entity_decode($result['name'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8');
                $value = html_entity_decode($result['value'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8');
                $otherVal = html_entity_decode($result['other'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8');
                $displayVal = ($otherVal !== '') ? $otherVal : $value;

                $this->Cell($paramWidth, 6, $this->renderTexte($parameterName), 1, 0, 'L');
                $this->Cell($valueWidth, 6, $this->renderTexte($displayVal), 1, 1, 'C');
            }
        }

        $this->Ln(10);
    }

    /**
     * Générer le PDF pour SANG OCCULTE
     */
    public function generateSangOccultePDF() {
        $this->AddPage();
        $this->AliasNbPages();

        $this->renderSangOcculte();
        $this->renderComments($this->examData['comments'] ?? '');
        $this->renderExamDescription($this->examData['description'] ?? 'Test de Sang Occulte: recherche de saignement occulte dans les selles.');
        $this->renderSignature();
        $this->renderFichiers();

        return $this->Output('S');
    }

    /**
     * Rendu global pour HISTOPATHOLOGIE (calqué sur SANG OCCULTE)
     */
    public function renderHistopathologie() {
        $this->renderPolice();
        // Bandeau titre générique
        $this->renderTitre($this->examData['exam_name'] ?? 'HISTOPATHOLOGIE', $this->examData['specimen'] ?? '');

        // Rendu spécialisé pour HISTOPATHOLOGIE
        $this->renderHistopathologieParametres();

        // Commentaires individuels
        $this->renderCommentIndividuel();
    }

    /**
     * Rendu des paramètres pour HISTOPATHOLOGIE
     * Colonne PARAMÈTRES réduite pour plus d'espace à DESCRIPTION
     */
    private function renderHistopathologieParametres() {
        $availableWidth = $this->w - PDF_LEFT_MARGIN - PDF_RIGHT_MARGIN;
        // Proportions : 30% Paramètres, 70% Description
        $paramWidth = round($availableWidth * 0.30);
        $valueWidth = $availableWidth - $paramWidth;

        // En-tête
        $this->renderPolice('Calibri', 'B', 9);
        $this->SetFillColor(255, 255, 255);
        $this->SetDrawColor(200, 210, 230);
        $this->Cell($paramWidth, 8, $this->renderTexte($this->renderMajuscule('Paramètres')), 1, 0, 'C', true);
        $this->Cell($valueWidth, 8, $this->renderTexte($this->renderMajuscule('Description')), 1, 1, 'C', true);

        // Données
        $this->renderPolice('Calibri', '', 9);
        $this->SetDrawColor(200, 210, 230);

        if (isset($this->examData['results']) && is_array($this->examData['results'])) {
            foreach ($this->examData['results'] as $result) {
                if (isset($result['is_not_required']) && $result['is_not_required'] == 1) {
                    continue;
                }

                $parameterName = html_entity_decode($result['name'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8');
                $value = html_entity_decode($result['value'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8');
                $otherVal = html_entity_decode($result['other'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8');
                $displayVal = ($otherVal !== '') ? $otherVal : $value;

                $this->Cell($paramWidth, 6, $this->renderTexte($parameterName), 1, 0, 'L');
                $this->Cell($valueWidth, 6, $this->renderTexte($displayVal), 1, 1, 'L');
            }
        }

        $this->Ln(10);
    }

    /**
     * Générer le PDF pour HISTOPATHOLOGIE
     */
    public function generateHistopathologiePDF() {
        $this->AddPage();
        $this->AliasNbPages();

        $this->renderHistopathologie();
        $this->renderComments($this->examData['comments'] ?? '');
        $this->renderExamDescription($this->examData['description'] ?? 'Histopathologie: rapport de l\'examen histologique.');
        $this->renderSignature();
        $this->renderFichiers();

        return $this->Output('S');
    }

    /**
     * Rendu global pour CHARGE VIRAL (calqué sur HISTOPATHOLOGIE)
     */
    public function renderChargeViral() {
        $this->renderPolice();
        // Bandeau titre générique
        $this->renderTitre($this->examData['exam_name'] ?? 'CHARGE VIRAL', $this->examData['specimen'] ?? '');

        // Rendu spécialisé pour CHARGE VIRAL
        $this->renderChargeViralParametres();

        // Commentaires individuels
        $this->renderCommentIndividuel();
    }

    /**
     * Rendu des paramètres pour CHARGE VIRAL
     * Colonne PARAMÈTRES réduite pour plus d'espace à DESCRIPTION
     */
    private function renderChargeViralParametres() {
        $availableWidth = $this->w - PDF_LEFT_MARGIN - PDF_RIGHT_MARGIN;
        // Proportions : 30% Paramètres, 70% Description
        $paramWidth = round($availableWidth * 0.30);
        $valueWidth = $availableWidth - $paramWidth;

        // En-tête
        $this->renderPolice('Calibri', 'B', 9);
        $this->SetFillColor(255, 255, 255);
        $this->SetDrawColor(200, 210, 230);
        $this->Cell($paramWidth, 8, $this->renderTexte($this->renderMajuscule('Paramètres')), 1, 0, 'C', true);
        $this->Cell($valueWidth, 8, $this->renderTexte($this->renderMajuscule('Description')), 1, 1, 'C', true);

        // Données
        $this->renderPolice('Calibri', '', 9);
        $this->SetDrawColor(200, 210, 230);

        if (isset($this->examData['results']) && is_array($this->examData['results'])) {
            foreach ($this->examData['results'] as $result) {
                if (isset($result['is_not_required']) && $result['is_not_required'] == 1) {
                    continue;
                }

                $parameterName = html_entity_decode($result['name'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8');
                $value = html_entity_decode($result['value'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8');
                $otherVal = html_entity_decode($result['other'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8');
                $displayVal = ($otherVal !== '') ? $otherVal : $value;

                $this->Cell($paramWidth, 6, $this->renderTexte($parameterName), 1, 0, 'L');
                $this->Cell($valueWidth, 6, $this->renderTexte($displayVal), 1, 1, 'L');
            }
        }

        $this->Ln(10);
    }

    /**
     * Générer le PDF pour CHARGE VIRAL
     */
    public function generateChargeViralPDF() {
        $this->AddPage();
        $this->AliasNbPages();

        $this->renderChargeViral();
        $this->renderComments($this->examData['comments'] ?? '');
        // Pour CHARGE VIRAL afficher 'RESULTATS' au lieu de l'en-tête générique 'DESCRIPTION'
        $descriptionText = $this->examData['description'] ?? 'Charge virale: rapport de charge virale.';
        $descriptionText = $this->normalizeRichTextList($descriptionText);
        if (!empty($descriptionText)) {
            $this->renderPolice('Calibri', 'B', 10);
            $this->Cell(0, 8, $this->renderTexte('RESULTATS'), 0, 1, 'C');
            $this->Ln(2);

            $this->renderPolice('Calibri', '', 10);
            $this->MultiCell(0, 6, $this->renderTexte($descriptionText));
            $this->Ln(5);
        }
        $this->renderSignature();
        $this->renderFichiers();

        return $this->Output('S');
    }

    /**
     * Générer la section résultats pour MALARIA TESTE RAPIDE
     * Affiche : Paramètre | Résultat (+unité) | Valeur
     * Comportement identique à Salmonella et Widal pour grouper RESULTAT/VALEUR
     * Note: MALARIA envoie les paramètres SANS suffixe RESULTAT, avec suffixe VALEUR
     */
    public function renderMalaria() {
        $this->renderPolice();
        $this->renderTitre($this->examData['exam_name'] ?? 'MALARIA TESTE RAPIDE', $this->examData['specimen'] ?? '');

        // Calculer largeurs identiques à la logique SEROLOGIE
        $availableWidth = $this->w - PDF_LEFT_MARGIN - PDF_RIGHT_MARGIN;
        $paramWidth = round($availableWidth * 0.35);
        $valueWidth = round($availableWidth * 0.325);
        $valuesWidth = $availableWidth - $paramWidth - $valueWidth;

        // En-têtes
        $this->renderPolice('Calibri', 'B', 9);
        $this->SetFillColor(255, 255, 255);
        $this->SetDrawColor(200, 210, 230);
        $this->Cell($paramWidth, 8, $this->renderTexte($this->renderMajuscule('Paramètres')), 1, 0, 'C', true);
        $this->Cell($valueWidth, 8, $this->renderTexte($this->renderMajuscule('Résultat')), 1, 0, 'C', true);
        $this->Cell($valuesWidth, 8, $this->renderTexte($this->renderMajuscule('Valeur')), 1, 1, 'C', true);

        $this->renderPolice('Calibri', '', 9);

        $originalResults = $this->examData['results'] ?? [];
        $groups = [];
        $used = [];

        // Grouper les paramètres MALARIA
        // MALARIA envoie: "FALCIPARUM (Pf)" (sans suffixe) et "FALCIPARUM (Pf) VALEUR"
        foreach ($originalResults as $i => $r) {
            $name = html_entity_decode($r['name'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8');
            $val = html_entity_decode($r['value'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8');
            $unit = $this->sanitizePlaceholderValue(html_entity_decode($r['unit'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8'));
            $unit = str_replace(['Μ', 'μ'], 'µ', $unit);
            $valWithUnit = $val;
            if ($unit !== '') $valWithUnit .= ' ' . $unit;
            $other = html_entity_decode($r['other'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8');
            $display = ($other !== '') ? $other : $valWithUnit;

            // Vérifier si c'est un suffixe VALEUR(S)
            if (preg_match('/\s+VALEURS?$/i', $name)) {
                $prefix = preg_replace('/\s+VALEURS?$/i', '', $name);
                $prefix = trim($prefix);
                $groups[$prefix]['valeurs'] = $display;
                $used[$i] = true;
                continue;
            }

            // Vérifier si c'est un suffixe RESULTAT
            if (preg_match('/\s+RESULTAT$/i', $name)) {
                $prefix = preg_replace('/\s+RESULTAT$/i', '', $name);
                $prefix = trim($prefix);
                $groups[$prefix]['resultat'] = $display;
                $used[$i] = true;
                continue;
            }

            // Pour MALARIA: chercher les paramètres de base (Pf, PAN) SANS suffixe
            // Ils correspondent au paramètre "RESULTAT" quand pas de suffixe explicit
            if (preg_match('/^(FALCIPARUM\s*\(Pf\)|MALAIAE\s+ET\s+AUTRES\s*\(PAN\))$/i', $name)) {
                $prefix = trim($name);
                $groups[$prefix]['resultat'] = $display;
                $used[$i] = true;
                continue;
            }
        }

        // Afficher les groupes (Pf, PAN ...)
        foreach ($groups as $prefix => $vals) {
            $res = $vals['resultat'] ?? '';
            $val = $vals['valeurs'] ?? '';
            $this->Cell($paramWidth, 6, $this->renderTexte($prefix), 1, 0, 'L');
            $this->Cell($valueWidth, 6, $this->renderTexte($res), 1, 0, 'C');
            $this->Cell($valuesWidth, 6, $this->renderTexte($val), 1, 1, 'C');
        }

        // Construire la liste des résultats restants (non groupés)
        $remaining = [];
        foreach ($originalResults as $i => $r) {
            if (isset($used[$i])) continue;
            $remaining[] = $r;
        }

        if (!empty($remaining)) {
            // Appeler la fonction générique pour afficher les paramètres restants
            $backup = $this->examData['results'];
            $this->examData['results'] = $remaining;
            // Paramètres | Résultat(+unité) | Valeur (ne pas réimprimer l'en-tête)
            $this->renderParamètres(false, false, true, false);
            $this->examData['results'] = $backup;
        }

        // Afficher les commentaires individuels
        $this->renderCommentIndividuel();
    }

    /**
     * Générer la section résultats pour MALARIA TDR
     * Ce rendu est volontairement simple, identique à l'hémogramme :
     * titre, tableau générique de paramètres et commentaires individuels.
     */
    public function renderMalariaTDR() {
        // Spécifique à GOUTTE EPAISE ET TDR – deux tableaux : méthodes puis espèces de parasites
        $this->renderPolice();
        $this->renderTitre($this->examData['exam_name'] ?? 'MALARIA (GOUTTE EPAISE ET TDR)', $this->examData['specimen'] ?? '');

        $all = $this->examData['results'] ?? [];
        $methods = [];
        $species = [];
        foreach ($all as $r) {
            $name = html_entity_decode($r['name'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8');
            // Regrouper les espèces de parasites d'après leurs noms
            if (preg_match('/plasmodi|gam/i', $name)) {
                $species[] = $r;
            } else {
                $methods[] = $r;
            }
        }

        // Rechercher si un paramètre de densité parasitaire existe.
        // Souvent on trouve deux lignes : l'une pour la méthode (par ex. "Cytométrie")
        // dont la *valeur* indique "DENSITE PARASITAIRE", et l'autre dont le
        // *nom* est "DENSITE PARASITAIRE" et qui contient la valeur chiffrée.
        // Nous voulons afficher la densité chiffrée dans l'interprétation de la
        // première ligne et ne pas afficher la deuxième ligne lorsqu'elle est
        // redondante.
        $densityVal = '';
        $hasDensityRow = false;
        $remaining = [];
        $densityEntry = null;
        foreach ($methods as $m) {
            if (preg_match('/densit\p{L}* parasitaire/i', $m['name'] ?? '')) {
                $hasDensityRow = true;
                $densityVal = trim($m['value'] ?? '') !== ''
                    ? trim($m['value'])
                    : trim($m['other'] ?? '');
                $densityEntry = $m;
                // postpone adding until we know if we need it
                continue;
            }
            $remaining[] = $m;
        }
        if ($hasDensityRow) {
            // si une autre méthode mentionne la densité comme valeur, retirer
            // la ligne isolée afin d'éviter la duplication
            $drop = false;
            foreach ($remaining as $m) {
                if (strcasecmp(trim($m['value'] ?? ''), 'DENSITE PARASITAIRE') === 0) {
                    $drop = true;
                    break;
                }
            }
            if ($drop) {
                $methods = $remaining;
            } else {
                // conserver l'enregistrement de densité et remonter à la fin
                if ($densityEntry !== null) {
                    // flag pour rendering ultérieur
                    $densityEntry['_standalone'] = true;
                }
                $methods = array_merge($remaining, $densityEntry ? [$densityEntry] : []);
            }
        } else {
            $methods = $remaining;
        }

        $availableWidth = $this->w - PDF_LEFT_MARGIN - PDF_RIGHT_MARGIN;

        // --- tableau des méthodes simplifié (Méthodes | Résultat) ---
        if (!empty($methods)) {
            // utiliser la même séparation que pour le tableau des espèces afin que la
            // ligne verticale de séparation reste alignée entre les deux sections.
            // la première colonne prend la moitié de la largeur disponible.
            $col1 = round($availableWidth * 0.5);
            $col2 = $availableWidth - $col1;

            $this->renderPolice('Calibri', 'B', 9);
            // remove header fill color for a plain look
            $this->SetDrawColor(200, 210, 230);
            $this->Cell($col1, 8, $this->renderTexte($this->renderMajuscule('Méthodes')), 1, 0, 'C', false);
            $this->Cell($col2, 8, $this->renderTexte($this->renderMajuscule('Résultat')), 1, 1, 'C', false);

            $this->renderPolice('Calibri', '', 9);
            foreach ($methods as $r) {
                $rawName = $r['name'] ?? '';
                $name = $this->renderTexte($rawName);
                // determine result text
                $rawVal = $r['value'] ?? '';
                $otherVal = $r['other'] ?? '';
                if (trim($otherVal) !== '' ) {
                    $resText = $otherVal;
                } elseif (strcasecmp(trim($rawVal), 'AUTRES') === 0) {
                    $resText = '';
                } else {
                    $resText = $rawVal;
                }

                $resText = str_replace(['Μ', 'μ'], 'µ', $resText);

                // densité parasitaire : utiliser la valeur chiffrée si disponible
                $isDensity = preg_match('/densit\p{L}* parasitaire/i', $rawName);
                if ($isDensity && $densityVal !== '') {
                    // afficher le libellé dans la colonne méthode et la valeur dans colonne résultat
                    $resText = $densityVal;
                }

                $res = $this->renderTexte($resText);
                $this->Cell($col1, 6, $name, 1, 0, 'L');
                $this->Cell($col2, 6, $res, 1, 1, 'C');
            }
        }

        // --- tableau des espèces (Espèce des parasites | Semi chromatographie) ---
        if (!empty($species)) {
            $col1 = round($availableWidth * 0.5);
            $col2 = $availableWidth - $col1;

            $this->renderPolice('Calibri', 'B', 9);
            // plain headers without background color
            $this->SetDrawColor(200, 210, 230);
            $this->Cell($col1, 8, $this->renderTexte($this->renderMajuscule('Espèce des parasites')), 1, 0, 'C', false);
            $this->Cell($col2, 8, $this->renderTexte($this->renderMajuscule('Semi chromatographie')), 1, 1, 'C', false);

            $this->renderPolice('Calibri', '', 9);
            foreach ($species as $r) {
                $name = $this->renderTexte($r['name'] ?? '');
                $semiRaw = str_replace(['Μ', 'μ'], 'µ', (string)($r['value'] ?? ''));
                $semi = $this->renderTexte($semiRaw);
                $this->Cell($col1, 6, $name, 1, 0, 'L');
                $this->Cell($col2, 6, $semi, 1, 1, 'C');
            }
            $this->Ln(4);
        }

        // commentaires individuels éventuels
        $this->renderCommentIndividuel();
    }

    /**
     * Générer le PDF complet pour MALARIA TDR (utilise renderMalariaTDR)
     */
    public function generateMalariaTDRPDF() {
        $this->AddPage();
        $this->AliasNbPages();

        $this->renderMalariaTDR();
        $this->renderComments($this->examData['comments'] ?? '');
        $this->renderExamDescription($this->examData['description'] ?? '');
        $this->renderSignature();
        $this->renderFichiers();

        return $this->Output('S');
    }

    /**
     * Générer le PDF pour MALARIA TESTE RAPIDE
     */
    public function generateMalariaPDF() {
        $this->AddPage();
        $this->AliasNbPages();

        $this->renderMalaria();
        $this->renderComments($this->examData['comments'] ?? '');
        $this->renderExamDescription($this->examData['description'] ?? 'Test rapide de Malaria: détection du parasite Plasmodium.');
        $this->renderSignature();
        $this->renderFichiers();

        return $this->Output('S');
    }

    /**
     * Générer la section résultats pour Ionogramme
     * Utilise les helpers génériques : titre, paramètres, commentaires individuels
     */
    public function renderIonogramme() {
        $this->renderPolice();
        // Bandeau titre
        $this->renderTitre($this->examData['exam_name'] ?? 'IONOGRAMME', $this->examData['specimen'] ?? '');

        // Paramètres (générique)
        $this->renderParamètres();

        // Commentaires individuels si présents
        $this->renderCommentIndividuel();
    }

    /**
     * Générer la section résultats pour Hemogramme complet (NFS)
     * La logique est identique à l'ionogramme puisque le rendu est générique.
     */
    public function renderHemogramme() {
        $this->renderPolice();
        $this->renderTitre($this->examData['exam_name'] ?? 'HEMOGRAMME COMPLET (NFS)', $this->examData['specimen'] ?? '');
        $this->renderParamètres();
        $this->renderCommentIndividuel();
    }

    /**
     * Générer la section résultats pour MICROFILAIRE
     * Utilise un rendu spécifique : d'abord un petit tableau avec specimen, méthode
     * et éventuellement résultat, puis un tableau à trois colonnes pour les espèces.
     */
    public function renderMicrofilaire() {
        // disposition spéciale : deux lignes (SPECIMEN, METHODE) suivies d'un tableau
        // à trois colonnes pour les espèces, observation et pathologie.
        $this->renderPolice();
        $this->renderTitre($this->examData['exam_name'] ?? 'MICROFILAIRE', $this->examData['specimen'] ?? '');

        $all = $this->examData['results'] ?? [];
        $specimen = '';
        $methode = '';
        $result = '';
        $species = [];

        foreach ($all as $r) {
            $name = html_entity_decode($r['name'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8');
            if (preg_match('/^specimen$/i', $name)) {
                $specimen = trim($r['value'] ?? '') !== '' ? $r['value'] : trim($r['other'] ?? '');
            } elseif (preg_match('/^methode$/i', $name)) {
                $methode = trim($r['value'] ?? '') !== '' ? $r['value'] : trim($r['other'] ?? '');
            } elseif (preg_match('/^result(?:at)?$/i', $name)) {
                // certains envoient "RESULT" ou "RESULTAT"
                $result = trim($r['value'] ?? '') !== '' ? $r['value'] : trim($r['other'] ?? '');
            } else {
                $species[] = $r;
            }
        }

        $availableWidth = $this->w - PDF_LEFT_MARGIN - PDF_RIGHT_MARGIN;

        // tableau haut : seulement SPECIMEN et MÉTHODE
        // Align the vertical separator with the species table by using the same
        // relative width for the first column (40% of available width).
        if ($specimen !== '' || $methode !== '') {
            $col1 = round($availableWidth * 0.4);
            $col2 = $availableWidth - $col1;

            // première ligne : SPECIMEN label bold left, valeur normal centered
            $this->renderPolice('Calibri', 'B', 9);
            $this->SetDrawColor(200, 210, 230);
            $this->Cell($col1, 8, $this->renderTexte('SPECIMEN'), 1, 0, 'L', false);
            $this->renderPolice('Calibri', '', 9);
            $this->Cell($col2, 8, $this->renderTexte($specimen), 1, 1, 'L', false);

            // deuxième ligne : MÉTHODE label bold left, valeur normal centered
            $this->renderPolice('Calibri', 'B', 9);
            $this->Cell($col1, 6, $this->renderTexte('MÉTHODE'), 1, 0, 'L');
            $this->renderPolice('Calibri', '', 9);
            $this->Cell($col2, 6, $this->renderTexte($methode), 1, 1, 'L');


        }

        // tableau des espèces
        if (!empty($species)) {
            $col1 = round($availableWidth * 0.4);
            $col2 = round($availableWidth * 0.3);
            $col3 = $availableWidth - $col1 - $col2;

            $this->renderPolice('Calibri', 'B', 9);
            $this->SetDrawColor(200, 210, 230);
            $this->Cell($col1, 8, $this->renderTexte($this->renderMajuscule('Espèce des parasites')), 1, 0, 'C', false);
            $this->Cell($col2, 8, $this->renderTexte($this->renderMajuscule('Observation')), 1, 0, 'C', false);
            $this->Cell($col3, 8, $this->renderTexte($this->renderMajuscule('Pathologie')), 1, 1, 'C', false);

            $this->renderPolice('Calibri', '', 9);
            // affichage standard : nom, observation (prefère `other` si renseigné), et pathologie
            foreach ($species as $r) {
                $name = $this->renderTexte($r['name'] ?? '');
                $otherRaw = trim($r['other'] ?? '');
                if ($otherRaw !== '') {
                    $obs = $this->renderTexte($otherRaw);
                } else {
                    $obs = $this->renderTexte($r['value'] ?? '');
                }
                $patho = $this->renderTexte($r['value'] ?? '');
                $this->Cell($col1, 6, $name, 1, 0, 'L');
                $this->Cell($col2, 6, $obs, 1, 0, 'C');
                $this->Cell($col3, 6, $patho, 1, 1, 'C');
            }
            $this->Ln(4);
        }

        $this->renderCommentIndividuel();
    }

    /**
     * Générer section pour VALEUR ABSOLU DES EOSINOPHILES
     */
    public function renderValeurAbsoluEosinophiles() {
        $this->renderPolice();
        $this->renderTitre($this->examData['exam_name'] ?? 'VALEUR ABSOLU DES EOSINOPHILES', $this->examData['specimen'] ?? '');
        $this->renderParamètres();
        $this->renderCommentIndividuel();
    }

    /**
     * Générer la section résultats pour GOUTTE FRAICHE
     * Identique à l'hémogramme (structure générique)
     */
    public function renderGoutteFraiche() {
        // copier le rendu microfilaire mais remplacer MÉTHODE par RESULTAT
        $this->renderPolice();
        $this->renderTitre($this->examData['exam_name'] ?? 'GOUTTE FRAICHE', $this->examData['specimen'] ?? '');

        $all = $this->examData['results'] ?? [];
        $specimen = '';
        $result   = '';
        $species  = [];

        foreach ($all as $r) {
            $name = html_entity_decode($r['name'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8');
            if (preg_match('/^specimen$/i', $name)) {
                $specimen = trim($r['value'] ?? '') !== '' ? $r['value'] : trim($r['other'] ?? '');
            } elseif (preg_match('/^result(?:at)?$/i', $name)) {
                $result = trim($r['value'] ?? '') !== '' ? $r['value'] : trim($r['other'] ?? '');
            } else {
                $species[] = $r;
            }
        }

        $availableWidth = $this->w - PDF_LEFT_MARGIN - PDF_RIGHT_MARGIN;
        if ($specimen !== '' || $result !== '') {
            $col1 = round($availableWidth * 0.4);
            $col2 = $availableWidth - $col1;

            $this->renderPolice('Calibri', 'B', 9);
            $this->SetDrawColor(200, 210, 230);
            $this->Cell($col1, 8, $this->renderTexte('SPECIMEN'), 1, 0, 'L', false);
            $this->renderPolice('Calibri', '', 9);
            $this->Cell($col2, 8, $this->renderTexte($specimen), 1, 1, 'L', false);

            $this->renderPolice('Calibri', 'B', 9);
            $this->Cell($col1, 6, $this->renderTexte('RESULTAT'), 1, 0, 'L');
            $this->renderPolice('Calibri', '', 9);
            $this->Cell($col2, 6, $this->renderTexte($result), 1, 1, 'L');
        }

        if (!empty($species)) {
            $col1 = round($availableWidth * 0.4);
            $col2 = round($availableWidth * 0.3);
            $col3 = $availableWidth - $col1 - $col2;

            $this->renderPolice('Calibri', 'B', 9);
            $this->SetDrawColor(200, 210, 230);
            $this->Cell($col1, 8, $this->renderTexte($this->renderMajuscule('Espèce des parasites')), 1, 0, 'C', false);
            $this->Cell($col2, 8, $this->renderTexte($this->renderMajuscule('Observation')), 1, 0, 'C', false);
            $this->Cell($col3, 8, $this->renderTexte($this->renderMajuscule('Pathologie')), 1, 1, 'C', false);

            $this->renderPolice('Calibri', '', 9);
            // liste statique des pathologies ; utilisée dans la colonne Pathologie
            $staticPathologies = [
                'FILARIOSIS LYMPHATIQUES',
                'FILARIOSIS CUTANEES',
                'TROPISME OCULAIRE',
                'CHEVILLE ET PIED EN GENERAL',
                'MALADIE DU SOMMEIL'
            ];
            // adopt same display as microfilaire except swap obs/patho usage
            foreach ($species as $idx => $r) {
                $name = $this->renderTexte($r['name'] ?? '');
                $otherRaw = trim($r['other'] ?? '');
                if ($otherRaw !== '') {
                    $obs = $this->renderTexte($otherRaw);
                } else {
                    $obs = $this->renderTexte($r['value'] ?? '');
                }
                // override pathologie with static list entry if available
                $pathoText = isset($staticPathologies[$idx]) ? $staticPathologies[$idx] : '';
                $patho = $this->renderTexte($pathoText);

                $this->Cell($col1, 6, $name, 1, 0, 'L');
                $this->Cell($col2, 6, $obs, 1, 0, 'C');
                $this->Cell($col3, 6, $patho, 1, 1, 'C');
            }
            $this->Ln(4);
        }

        $this->renderCommentIndividuel();
    }

    /**
     * Générer la section résultats pour MICROBIOLOGIE
     * Idem hémogramme (paramètres + commentaires individuels)
     */
    public function renderMicrobiologie() {
        $this->renderPolice();
        $this->renderTitre($this->examData['exam_name'] ?? 'MICROBIOLOGIE', $this->examData['specimen'] ?? '');
        // Microbiologie n'affiche pas la colonne FLAG
        $this->renderParamètres(false);
        $this->renderCommentIndividuel();
    }

    /**
     * Before rendering coagulation we may need to massage the raw results array.
     *
     * Plusieurs analyses de coagulation (TCA, TP, etc.) envoient uniquement deux
     * lignes :
     *   - RESULT (ou RESULTAT) contenant la valeur et éventuellement l'unité/range
     *   - FLAG indiquant B, A, etc.
     *
     * Le rendu générique affiche chaque ligne dans la première colonne ce qui
     * donne l'apparence du premier exemple ci-dessus (paramètres "RESULT" et
     * "FLAG" séparés). Nous préférons que la première colonne contienne le nom
     * de l'examen ("TEMPS DE CEPHALINE ACTIVEE" par exemple) et que les
     * colonnes Résultat/Flag soient utilisées normalement.
     *
     * La méthode ci‑dessous détecte cette situation simple et remplace
     * l'array results par une unique ligne consolidée.
     */
    private function normalizeCoagulationResults() {
        if (!isset($this->examData['results']) || !is_array($this->examData['results'])) {
            return;
        }

        $orig = $this->examData['results'];
        // pattern élémentaire : exactement deux lignes RESULT/RESULTAT + FLAG
        if (count($orig) === 2) {
            $names = array_map(function($r){ return strtoupper(trim($r['name'] ?? '')); }, $orig);
            if ((in_array('RESULT', $names) || in_array('RESULTAT', $names)) && in_array('FLAG', $names)) {
                $rowResult = null;
                $rowFlag = null;
                foreach ($orig as $r) {
                    $name = strtoupper(trim($r['name'] ?? ''));
                    if ($name === 'RESULT' || $name === 'RESULTAT') {
                        $rowResult = $r;
                    } elseif ($name === 'FLAG') {
                        $rowFlag = $r;
                    }
                }
                if ($rowResult !== null && $rowFlag !== null) {
                    $newRow = [];
                    $newRow['name'] = $this->examData['exam_name'] ?? 'COAGULATION';
                    $newRow['value'] = $rowResult['value'] ?? '';
                    $newRow['unit'] = $rowResult['unit'] ?? '';
                    $newRow['other'] = $rowResult['other'] ?? '';
                    $newRow['flag'] = $rowFlag['value'] ?? '';
                    // conserver l'éventuelle plage de référence
                    $newRow['range'] = $rowResult['reference_range'] ?? $rowResult['range'] ?? '';
                    $this->examData['results'] = [$newRow];
                }
            }
        }
    }

    /**
     * Générer la section résultats pour COAGULATION
     * On utilise la mise en page générique de paramètres + commentaires.
     */
    public function renderCoagulation() {
        $this->renderPolice();
        $this->renderTitre($this->examData['exam_name'] ?? 'COAGULATION', $this->examData['specimen'] ?? '');
        // appliquer éventuelle normalisation spécifique
        $this->normalizeCoagulationResults();
        $this->renderParamètres();
        $this->renderCommentIndividuel();
    }

    /**
     * Générer section pour TEMPS DE SAIGNEMENT
     */
    public function renderTempsSaignement() {
        $this->renderPolice();
        $this->renderTitre($this->examData['exam_name'] ?? 'TEMPS DE SAIGNEMENT', $this->examData['specimen'] ?? '');
        $this->renderParamètres();
        $this->renderCommentIndividuel();
    }

    /**
     * Générer section pour TP_INR (Temps de prothrombine et INR)
     */
    public function renderTpInr() {
        $this->renderPolice();
        $this->renderTitre($this->examData['exam_name'] ?? 'TEMPS DE PROTHROMBINE ET INR', $this->examData['specimen'] ?? '');
        $this->renderParamètres();
        $this->renderCommentIndividuel();
    }

    /**
     * Générer section pour HEMOCULTURE
     */
    public function renderHemoculture() {
        $this->renderPolice();
        $this->renderTitre($this->examData['exam_name'] ?? 'HEMOCULTURE', $this->examData['specimen'] ?? '');
        // ne pas afficher la colonne FLAG pour l'hémoculture
        $this->renderParamètres(false);
        $this->renderCommentIndividuel();
    }

    /**
     * Générer section pour COPROCULTURE
     */
    public function renderCoproculture() {
        $this->renderPolice();
        $this->renderTitre($this->examData['exam_name'] ?? 'COPROCULTURE', $this->examData['specimen'] ?? '');
        // ne pas afficher la colonne FLAG pour la coproculture
        $this->renderParamètres(false);
        $this->renderCommentIndividuel();
    }

    /**
     * Générer la section résultats pour ZIEHL NEELSEN (ZN)
     * Utilise aussi la structure générique hémogramme
     */
    public function renderZiehlNelsen() {
        $this->renderPolice();
        // titre simple
        $this->renderTitre($this->examData['exam_name'] ?? 'ZIEHL NEELSEN', $this->examData['specimen'] ?? '');

        // assembler les lignes sous forme de tableau manuel
        $rows = [];
        if (isset($this->examData['results']) && is_array($this->examData['results'])) {
            foreach ($this->examData['results'] as $r) {
                $name = strtoupper(trim($r['name'] ?? ''));
                $val  = trim($r['value'] ?? '');
                if (preg_match('/LIGNE_(\d+)_DATE/i', $name, $m)) {
                    $rows[(int)$m[1]]['date'] = $val;
                } elseif (preg_match('/LIGNE_(\d+)_ECH/i', $name, $m)) {
                    $rows[(int)$m[1]]['ech'] = $val;
                } elseif (preg_match('/LIGNE_(\d+)_ASPECT/i', $name, $m)) {
                    $rows[(int)$m[1]]['aspect'] = $val;
                } elseif (preg_match('/^LIGNE_(\d+)$/i', $name, $m)) {
                    $rows[(int)$m[1]]['resultat'] = $val;
                }
            }
            ksort($rows);
        }

        if (!empty($rows)) {
            $this->renderPolice('Calibri', 'B', 9);
            // couleur d'en-tête identique aux autres tables (gris clair)
            $this->SetFillColor(255, 255, 255);
            // bordures bleu pâle comme pour Microfilaire
            $this->SetDrawColor(200, 210, 230);
            $availableWidth = $this->w - PDF_LEFT_MARGIN - PDF_RIGHT_MARGIN;
            $colW = round($availableWidth / 4);
            $this->Cell($colW, 8, $this->renderTexte('DATE'), 1, 0, 'C', true);
            $this->Cell($colW, 8, $this->renderTexte('ECHANTILLON'), 1, 0, 'C', true);
            $this->Cell($colW, 8, $this->renderTexte('ASPECT'), 1, 0, 'C', true);
            $this->Cell($colW, 8, $this->renderTexte('RÉSULTAT'), 1, 1, 'C', true);

            $this->renderPolice('Calibri', '', 9);
            foreach ($rows as $row) {
                $this->Cell($colW, 6, $this->renderTexte($row['date'] ?? ''), 1, 0, 'C');
                $this->Cell($colW, 6, $this->renderTexte($row['ech'] ?? ''), 1, 0, 'C');
                $this->Cell($colW, 6, $this->renderTexte($row['aspect'] ?? ''), 1, 0, 'C');
                $this->Cell($colW, 6, $this->renderTexte($row['resultat'] ?? ''), 1, 1, 'C');
            }
            $this->Ln(5);
        }

        $this->renderCommentIndividuel();
    }

    /**
     * Résultats pour GROUPAGE SANGUIN
     * Structure idem NFS/hemogramme
     */
    public function renderGroupageSanguin() {
        // adopt layout from legacy project (see original generate_exam_pdf.php)
        $this->renderPolice();
        $this->renderTitre($this->examData['exam_name'] ?? 'GROUPAGE SANGUIN', $this->examData['specimen'] ?? '');

        // helper data
        $results = $this->examData['results'] ?? [];
        $examNum = $this->examData['exam_id'] ?? null;
        
        // DEBUG: Log what we receive
        error_log("[renderGroupageSanguin] Results structure: " . json_encode($results));
        error_log("[renderGroupageSanguin] Exam ID: " . $examNum);
        error_log("[renderGroupageSanguin] Results type: " . gettype($results));
        if (is_array($results) && !empty($results)) {
            $firstKey = key($results);
            $firstVal = reset($results);
            error_log("[renderGroupageSanguin] First key: '$firstKey' (type: " . gettype($firstKey) . ")");
            error_log("[renderGroupageSanguin] First value: " . json_encode($firstVal));
        }

        // simple lookup helper adapted to this project
        $getVal = function($candidates) use ($results, $examNum) {
            $v = normalize_result_scalar(get_result_field($results, $candidates, 'groupage'));
            if ($v !== '') return $v;
            if ($examNum !== null && isset($results[(string)$examNum]) && is_array($results[(string)$examNum])) {
                $v2 = normalize_result_scalar(get_result_field($results[(string)$examNum], $candidates, 'groupage-exam_num'));
                if ($v2 !== '') return $v2;
            }
            return '';
        };

        // resolve main pieces
        $groupe = trim((string)$getVal([ (string)$examNum . '_groupe', (string)$examNum . '_group',
            'groupe', 'groupe_sanguin', 'groupe_abo', 'group', 'blood_group', 'abo_groupe', 'groupe_abo_result' ]));
        error_log("[renderGroupageSanguin] Groupe found: '$groupe'");
        
        if ($groupe !== '') $groupe = mb_strtoupper($groupe, 'UTF-8');
        $rhesus = trim((string)$getVal([ (string)$examNum . '_rhesus', (string)$examNum . '_rhesus_d',
            'rhesus_d', 'rh_d', 'rh', 'rhesus', 'rhesis_d', 'rhesus_d_', 'rhésus_d' ]));
        // Si parameters_json est encore au format liste [{name,value},…], lire RHESUS D directement
        if ($rhesus === '' && is_array($results)) {
            $first = reset($results);
            if (is_array($first) && isset($first['name'])) {
                foreach ($results as $item) {
                    if (!is_array($item)) {
                        continue;
                    }
                    $nm = mb_strtolower(trim((string)($item['name'] ?? '')), 'UTF-8');
                    $nm = strtr($nm, [
                        'é' => 'e', 'è' => 'e', 'ê' => 'e', 'ë' => 'e',
                        'à' => 'a', 'â' => 'a', 'ô' => 'o', 'ù' => 'u', 'û' => 'u',
                        'î' => 'i', 'ï' => 'i', 'ç' => 'c',
                    ]);
                    if (strpos($nm, 'rhesus') !== false || strpos($nm, 'rh d') !== false || $nm === 'rh') {
                        $rawRh = trim((string)($item['other'] ?? ''));
                        if ($rawRh === '') {
                            $rawRh = trim((string)($item['value'] ?? ''));
                        }
                        if ($rawRh !== '') {
                            $rhesus = $rawRh;
                            break;
                        }
                    }
                }
            }
        }
        error_log("[renderGroupageSanguin] Rhesus found: '$rhesus'");
        
        if ($rhesus !== '') {
            $up = mb_strtoupper($rhesus, 'UTF-8');
            if (stripos($up, 'POS') !== false || stripos($up, 'OUI') !== false) $rhesus = 'POSITIF';
            elseif (stripos($up, 'NEG') !== false || stripos($up, 'NON') !== false) $rhesus = 'NEGATIF';
            else $rhesus = $up;
        }
        $methode = trim((string)$getVal([ (string)$examNum . '_methode', 'methode', 'method',
            'methodes', 'methods', 'groupage_methode' ]));
        if ($methode !== '') $methode = strtoupper($methode);
        error_log("[renderGroupageSanguin] Methode found: '$methode'");

        // Helper: a value is considered "selected" if it is truthy (not empty and not '0/false')
        $isTruthySelected = function($v) {
            if (is_array($v)) return false;
            if ($v === null) return false;
            $s = trim((string)$v);
            if ($s === '') return false;
            $sl = strtolower($s);
            if ($sl === '0' || $sl === 'false' || $sl === 'non' || $sl === 'negatif' || $sl === 'n') return false;
            return true;
        };

        // Helper: check selection from base keys (beth_A, simonin_B, etc.)
        $selectedFromKey = function(string $chk) use ($results, $isTruthySelected) {
            if (!is_array($results) || $chk === '') return false;
            if (array_key_exists($chk, $results)) {
                return $isTruthySelected($results[$chk]);
            }
            foreach ($results as $rk => $rv) {
                if (strtolower((string)$rk) === strtolower($chk) && $isTruthySelected($rv)) {
                    return true;
                }
            }
            return false;
        };

        // Helper: if keys are missing, derive bubbles from $groupe.
        // A : BETH → A, AB | SIMONIN → B, O
        // B : BETH → B seul | SIMONIN → A, AB, O
        // AB : BETH → AB seul | SIMONIN → A, B, O
        // O : BETH → O seul | SIMONIN → A, B, AB
        $groupeNorm = strtoupper(trim((string)$groupe));
        $groupeNorm = str_replace('0', 'O', $groupeNorm);
        $selectedFromGroupe = function(string $methodKey, string $antigen) use ($groupeNorm) {
            if ($groupeNorm === 'A') {
                if ($methodKey === 'beth') {
                    return in_array($antigen, ['A', 'AB'], true);
                }
                if ($methodKey === 'simonin') {
                    return in_array($antigen, ['B'], true);
                }
                return null;
            }
            if ($groupeNorm === 'B') {
                if ($methodKey === 'beth') {
                    return in_array($antigen, ['B','AB'], true);
                }
                if ($methodKey === 'simonin') {
                    return in_array($antigen, ['A'], true);
                }
                return null;
            }
            if ($groupeNorm === 'AB') {
                if ($methodKey === 'beth') {
                    return in_array($antigen, ['A','AB','B'], true);
                }
                if ($methodKey === 'simonin') {
                    return in_array($antigen, [''], true);
                }
                return null;
            }
            if ($groupeNorm === 'O') {
                if ($methodKey === 'beth') {
                    return in_array($antigen, ['O'], true);
                }
                if ($methodKey === 'simonin') {
                    return in_array($antigen, ['A', 'B'], true);
                }
                return null;
            }
            return null;
        };

        $selectedForCell = function(string $methodKey, string $antigen, string $chk) use ($selectedFromKey, $selectedFromGroupe) {
            if ($selectedFromKey($chk)) return true;
            $derived = $selectedFromGroupe($methodKey, $antigen);
            return $derived === null ? false : (bool)$derived;
        };

        // table width
        $tblW = $this->w - PDF_LEFT_MARGIN - PDF_RIGHT_MARGIN;

        // Prepare left grid (methods x antigens) and right big result block
        $leftW = (int) floor($tblW * 0.58);
        $rightW = $tblW - $leftW;

        // Grid metrics: derive compact heights from the standardized small font size
        $this->renderPolice('Calibri', '', 8); // roughly equivalent to 'small'
        $lineH = defined('PDF_FONT_SIZE_SMALL') ? (PDF_FONT_SIZE_SMALL * 0.35) : 3.5; // mm per line (approx)
        $minRowH = 6;
        $rowH = max($minRowH, (int) ceil(1 * $lineH));
        $headerRows = 1; $methodRows = 2;
        $gridH = ($headerRows + $methodRows) * $rowH;
        $labelW = (int) floor($leftW * 0.50);
        $cellW = (int) floor(($leftW - $labelW) / 4);

        // Remember top position
        $startX = PDF_LEFT_MARGIN;
        $startY = $this->GetY();

        // Header row
        $this->renderPolice('Calibri', 'B', 9);
        $this->SetFillColor(235,240,245);
        $this->SetXY($startX, $startY);
        $this->Cell($labelW, $rowH, $this->renderTexte('MÉTHODES / ANTIGÈNES'), 1, 0, 'C', true);
        $cols = ['A','B','AB','O'];
        foreach ($cols as $c) { $this->Cell($cellW, $rowH, $this->renderTexte($c), 1, 0, 'C', true); }
        $this->Ln();
        $this->SetXY($startX, $startY + $rowH);

        // Methods rows with intermediate antibody label
        $methods = [ ['key' => 'beth', 'label' => 'BETH-VINCENT (Directe)'],
                     ['key' => 'simonin', 'label' => 'SIMONIN (Indirecte)'] ];
        $this->renderPolice('Calibri', '', 8);

        // beth row
        $bethRowY = $startY + $rowH;
        $this->SetXY($startX, $bethRowY);
        $this->Cell($labelW, $rowH, $this->renderTexte($methods[0]['label']), 1, 0, 'L');
        foreach ($cols as $c) {
            $this->Cell($cellW, $rowH, '', 1, 0, 'C');
            $cellLeftX = $this->GetX() - $cellW;
            $cellTopY = $bethRowY;
            $chk = $methods[0]['key'] . '_' . str_replace('-', '_', $c);
            $chk = str_replace('__', '_', $chk);
            $selected = (bool)$selectedForCell((string)$methods[0]['key'], (string)$c, $chk);
            $bubbleW = min(12, $cellW * 0.78);
            $bubbleH = max(6, (int) floor($bubbleW * 0.55));
            $imgX = $cellLeftX + ($cellW - $bubbleW) / 2;
            $imgY = $cellTopY + ($rowH - $bubbleH) / 2;
            if (extension_loaded('gd')) {
                $tmp = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'bubble_' . md5($chk . microtime(true) . rand()) . '.png';
                $pxW = 360; $pxH = 200; $img = imagecreatetruecolor($pxW, $pxH);
                imagesavealpha($img, true);
                $trans = imagecolorallocatealpha($img, 0, 0, 0, 127);
                imagefill($img, 0, 0, $trans);
                $red = imagecolorallocate($img, 192, 0, 0);
                $white = imagecolorallocate($img, 255, 255, 255);
                $cx = (int) ($pxW / 2); $cy = (int) ($pxH / 2);
                $diamX = (int) floor($pxW * 0.86); $diamY = (int) floor($pxH * 0.62);
                if ($selected) {
                    imagefilledellipse($img, $cx, $cy, $diamX, $diamY, $red);
                    $dotR = max(3, (int) floor($pxW * 0.01));
                    for ($y = $cy - (int)($diamY/2) + 6; $y < $cy + (int)($diamY/2) - 6; $y += 12) {
                        for ($x = $cx - (int)($diamX/2) + 6; $x < $cx + (int)($diamX/2) - 6; $x += 12) {
                            $nx = ($x - $cx) / ($diamX/2); $ny = ($y - $cy) / ($diamY/2);
                            if (($nx*$nx + $ny*$ny) <= 1.0) imagefilledellipse($img, $x, $y, $dotR, $dotR, $white);
                        }
                    }
                    imagesetthickness($img, 3);
                    imageellipse($img, $cx, $cy, $diamX, $diamY, $red);
                } else {
                    imagesetthickness($img, 5);
                    imageellipse($img, $cx, $cy, $diamX, $diamY, $red);
                }
                imagepng($img, $tmp);
                imagedestroy($img);
                safe_image_draw($this, $tmp, $imgX, $imgY, $bubbleW, $bubbleH);
                @unlink($tmp);
            } else {
                if ($selected) {
                    $this->renderPolice('Calibri','B',12);
                    $this->SetXY($cellLeftX + ($cellW - 6) / 2, $cellTopY + ($rowH - 6) / 2);
                    $this->Cell(6, 6, '●', 0, 0, 'C');
                    $this->renderPolice('Calibri','',10);
                }
            }
        }
        $this->Ln();
        $this->SetX($startX);

        // intermediate row
        $subH = max(6, (int) ceil($lineH * 2));
        $this->renderPolice('Calibri','I',8);
        $this->SetXY($startX, $this->GetY());
        $this->Cell($labelW + ($cellW * count($cols)), $subH,
            $this->renderTexte('Anticorps (hématies lavées)'), 1, 1, 'C');

        $gridH = ($headerRows + $methodRows) * $rowH + $subH;

        // simonin row
        $m2 = $methods[1];
        $this->renderPolice('Calibri','',8);
        $simoninRowY = $bethRowY + $rowH + $subH;
        $this->SetXY($startX, $simoninRowY);
        $this->Cell($labelW, $rowH, $this->renderTexte($m2['label']), 1, 0, 'L');
        foreach ($cols as $c) {
            $this->Cell($cellW, $rowH, '', 1, 0, 'C');
            $cellLeftX = $this->GetX() - $cellW;
            $cellTopY = $simoninRowY;
            $chk = $m2['key'] . '_' . str_replace('-', '_', $c);
            $chk = str_replace('__', '_', $chk);
            $selected = (bool)$selectedForCell((string)$m2['key'], (string)$c, $chk);
            $bubbleW = min(12, $cellW * 0.78); $bubbleH = max(6, (int) floor($bubbleW * 0.55));
            $imgX = $cellLeftX + ($cellW - $bubbleW) / 2; $imgY = $cellTopY + ($rowH - $bubbleH) / 2;
            if (extension_loaded('gd')) {
                $tmp = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'bubble_' . md5($chk . microtime(true) . rand()) . '.png';
                $pxW = 360; $pxH = 200; $img = imagecreatetruecolor($pxW, $pxH);
                imagesavealpha($img, true); $trans = imagecolorallocatealpha($img, 0,0,0,127); imagefill($img,0,0,$trans);
                $red = imagecolorallocate($img, 192, 0, 0); $white = imagecolorallocate($img, 255,255,255);
                $cx = (int) ($pxW/2); $cy = (int) ($pxH/2); $diamX = (int) floor($pxW * 0.86); $diamY = (int) floor($pxH * 0.62);
                if ($selected) {
                    imagefilledellipse($img, $cx, $cy, $diamX, $diamY, $red);
                    $dotR = max(2, (int) floor($pxW * 0.008));
                    for ($y = $cy - (int)($diamY/2) + 8; $y < $cy + (int)($diamY/2) - 8; $y += 16) {
                        for ($x = $cx - (int)($diamX/2) + 8; $x < $cx + (int)($diamX/2) - 8; $x += 16) {
                            $nx = ($x - $cx) / ($diamX/2); $ny = ($y - $cy) / ($diamY/2);
                            if (($nx*$nx + $ny*$ny) <= 1.0) imagefilledellipse($img, $x, $y, $dotR, $dotR, $white);
                        }
                    }
                    imagesetthickness($img, 3); imageellipse($img, $cx, $cy, $diamX, $diamY, $red);
                } else {
                    imagesetthickness($img, 5); imageellipse($img, $cx, $cy, $diamX, $diamY, $red);
                }
                imagepng($img, $tmp); imagedestroy($img); safe_image_draw($this, $tmp, $imgX, $imgY, $bubbleW, $bubbleH); @unlink($tmp);
            } else {
                if ($selected) { $this->renderPolice('Calibri','B',12); $this->SetXY($cellLeftX + ($cellW - 6) / 2, $cellTopY + ($rowH - 6) / 2); $this->Cell(6,6,'●',0,0,'C'); $this->renderPolice('Calibri','',10); }
            }
        }
        $this->Ln();

        // right block and remaining rendering (group text, Rh, methods, notes)
        // for brevity, reuse the legacy logic below adapted to $this-> context
        $yAfterGrid = $this->GetY();
        $this->SetXY($startX + $leftW, $startY);
        $availH = max(12, $gridH);
        $availW = max(30, $rightW - 4);

        $fit_font_size = function($pdfObj, $text, $fontName, $fontStyle, $maxSize, $w, $padding = 6, $minSize = 6) {
            $txt = pdf_encode($text);
            for ($s = $maxSize; $s >= $minSize; $s--) {
                $pdfObj->SetFont($fontName, $fontStyle, $s);
                $wstr = $pdfObj->GetStringWidth($txt);
                if ($wstr <= max(1, ($w - $padding))) return $s;
            }
            $pdfObj->SetFont($fontName, $fontStyle, $minSize);
            return $minSize;
        };

        // right block: ABO group and Rh factor
        $this->SetXY($startX + $leftW, $startY);
        $availH = max(12, $gridH);
        $availW = max(30, $rightW - 4);

        $fit_font_size = function($pdfObj, $text, $fontName, $fontStyle, $maxSize, $w, $padding = 6, $minSize = 6) {
            $txt = pdf_encode($text);
            for ($s = $maxSize; $s >= $minSize; $s--) {
                $pdfObj->SetFont($fontName, $fontStyle, $s);
                $wstr = $pdfObj->GetStringWidth($txt);
                if ($wstr <= max(1, ($w - $padding))) return $s;
            }
            $pdfObj->SetFont($fontName, $fontStyle, $minSize);
            return $minSize;
        };

        // allocate space
        $maxTopH = (int) floor($availH * 0.62);
        $maxBottomH = $availH - $maxTopH;
        if ($maxBottomH < 10) { $maxBottomH = 10; $maxTopH = $availH - $maxBottomH; }

        $maxGroupFontByHeight = max(8, (int) floor(($maxTopH / 0.3528) / 1.25));
        $groupFont = $fit_font_size($this, $groupe === '' ? ' ' : $groupe, 'Arial', 'B', min(48, $maxGroupFontByHeight), $availW, 6, 6);
        if ($groupFont > 8) { $groupFont = max(6, (int) floor($groupFont * 0.80)); }
        $groupH = max(10, (int) ceil($groupFont * 0.3528 * 1.25));

        $remainingH = $availH - $groupH;
        if ($remainingH < 10) {
            while ($groupFont > 6 && $remainingH < 10) {
                $groupFont -= 1;
                $groupH = max(8, (int) ceil($groupFont * 0.3528 * 1.25));
                $remainingH = $availH - $groupH;
            }
        }

        $rhLabelH = max(6, (int) floor($remainingH * 0.28));
        $rhValueH = max(6, $remainingH - $rhLabelH);

        $maxRhFontByHeight = max(6, (int) floor(($rhValueH / 0.3528) / 1.25));
        $rhFont = $fit_font_size($this, $rhesus === '' ? ' ' : $rhesus, 'Arial', 'B', min(28, $maxRhFontByHeight), $availW, 6, 6);
        if ($rhFont > 5) { $rhFont = max(6, (int) floor($rhFont * 0.60)); }
        $rhLabelFont = max(7, min(12, (int) floor($rhFont * 0.6)));

        // draw border
        $groupTopY = $startY + max(0, (int) floor(($maxTopH - $groupH) / 2));
        $this->SetXY($startX + $leftW, $groupTopY);
        $this->SetDrawColor(160,170,190);
        $this->Rect($startX + $leftW, $startY, $rightW, $availH);

        // render group and Rh
        $midY = $startY + ($availH / 2);
        $this->renderPolice('Calibri','B',$groupFont);
        $groupText = $this->renderTexte($groupe);
        $groupTextH = max(8, (int) ceil($groupFont * 0.3528 * 1.15));
        $groupY = $midY - ($groupTextH / 2);
        $this->SetXY($startX + $leftW + 6, $groupY);
        $groupTextW = $this->GetStringWidth($groupText);
        $glen = is_string($groupe) ? mb_strlen(trim($groupe), 'UTF-8') : 0;
        if ($glen <= 1) {
            $gapAfterGroup = 2;
        } elseif ($glen === 2) {
            $gapAfterGroup = 3;
        } else {
            $gapAfterGroup = 6;
        }
        $this->Cell(max(1, $groupTextW), $groupTextH, $groupText, 0, 0, 'L');

        $encRhesus = pdf_encode($rhesus);
        $rhFont = $fit_font_size($this, $rhesus === '' ? ' ' : $rhesus, 'Arial', 'B', min(28, $maxRhFontByHeight), $availW, 6, 6);
        if ($rhFont > 5) { $rhFont = max(6, (int) floor($rhFont * 0.60)); }
        $rhLabelFont = max(7, min(12, (int) floor($rhFont * 0.6)));

        $this->SetFont('Arial', 'I', $rhLabelFont);
        $labelText = pdf_encode('Rh ');
        $labelW = $this->GetStringWidth($labelText);
        $this->SetFont('Arial', 'B', $rhFont);
        $valueW = $this->GetStringWidth($encRhesus);
        $totalRhW = $labelW + $valueW;

        $desiredRhX = $startX + $leftW + 6 + $groupTextW + $gapAfterGroup;
        $maxAllowedRhX = $startX + $leftW + $rightW - 6 - $totalRhW;
        if ($desiredRhX <= $maxAllowedRhX) {
            $rhX = $desiredRhX;
        } else {
            $rhX = $maxAllowedRhX;
        }
        $minRhX = $startX + $leftW + 6 + $groupTextW;
        if ($rhX < $minRhX) {
            $rhX = max($maxAllowedRhX, $minRhX);
        }

        $rhY = $midY - ($lineH / 2);
        $valueOffset = max(1.2, ($rhFont * 0.3528) * 0.40);
        $labelY = $rhY - ($valueOffset * 0.5);
        $this->SetFont('Arial', 'I', $rhLabelFont);
        $this->SetXY($rhX, $labelY);
        $this->Cell($labelW, $lineH, $labelText, 0, 0, 'L');

        $valueY = $rhY + ($valueOffset * 0.5);
        $this->SetFont('Arial', 'B', $rhFont);
        $this->SetXY($rhX + $labelW, $valueY);
        $this->Cell($valueW + 2, $lineH, $encRhesus, 0, 0, 'L');

        $this->SetXY(PDF_LEFT_MARGIN, $startY + $gridH + 4);
        $this->SetXY(PDF_LEFT_MARGIN, $startY + $gridH + 4);

        // note: after drawing the right block we produce methods and notes area

        // MÉTHODES
        // Afficher MÉTHODES tel que stocké en base (sans reconstruction statique).
        $methodeDisplay = trim((string)$methode);
        // fallback: si méthode vide en base, on essaie de déduire à partir des bulles
        if ($methodeDisplay === '') {
            $hasBeth = false; $hasSimonin = false;
            $checkCols = ['A','B','AB','O'];
            $sub = (is_array($results) && isset($results[(string)$examNum]) && is_array($results[(string)$examNum])) ? $results[(string)$examNum] : null;
            if (is_array($results) || is_array($sub)) {
                foreach ($checkCols as $c) {
                    $k1 = 'beth_' . str_replace('-', '_', $c);
                    $k2 = 'simonin_' . str_replace('-', '_', $c);
                    if (is_array($results)) {
                        foreach ($results as $rk => $rv) {
                            if (!$hasBeth && strtolower($rk) === strtolower($k1) && trim((string)$rv) !== '') $hasBeth = true;
                            if (!$hasSimonin && strtolower($rk) === strtolower($k2) && trim((string)$rv) !== '') $hasSimonin = true;
                            if ($hasBeth && $hasSimonin) break 2;
                        }
                    }
                    if (!$hasBeth && is_array($sub)) {
                        foreach ($sub as $srk => $srv) {
                            if (strtolower($srk) === strtolower($k1) && trim((string)$srv) !== '') { $hasBeth = true; break; }
                        }
                    }
                    if (!$hasSimonin && is_array($sub)) {
                        foreach ($sub as $srk => $srv) {
                            if (strtolower($srk) === strtolower($k2) && trim((string)$srv) !== '') { $hasSimonin = true; break; }
                        }
                    }
                    if ($hasBeth && $hasSimonin) break;
                }
            }
            $parts = [];
            if ($hasBeth) $parts[] = 'BETH-VINCENT (Directe)';
            if ($hasSimonin) $parts[] = 'SIMONIN (Indirecte)';
            if (!empty($parts)) {
                $methodeDisplay = implode(' ; ', $parts);
            }
        }

        $this->renderPolice('Calibri','',10);
        $colLabel = (int) floor($tblW * 0.30);
        $colValue = $tblW - $colLabel;
        $this->Cell($colLabel, 8, $this->renderTexte('MÉTHODES'), 1, 0, 'L');
        $this->Cell($colValue, 8, $this->renderTexte($methodeDisplay), 1, 1, 'C');

        // notes area (adapted from legacy)
        $noteCandidates = [
            (string)$examNum . '_notes', (string)$examNum . '_note',
            (string)$examNum . 'notes', (string)$examNum . 'note',
            'groupage_notes', 'groupage_note',
            'notes', 'note', 'comment', 'interpretation'
        ];
        $notes = normalize_result_scalar(get_result_field($results, $noteCandidates));
        if ($notes === '' && is_array($results) && isset($results[(string)$examNum]) && is_array($results[(string)$examNum])) {
            $notes = normalize_result_scalar(get_result_field($results[(string)$examNum], $noteCandidates));
        }
        $notes = $this->normalizeRichTextList($notes);
        if ($notes !== '') {
            $this->Ln(2);
            $this->renderPolice('Calibri','I',9);
            $this->MultiCell($tblW, $lineH, $this->renderTexte($notes), 1, 'L');
            $this->Ln(3);
        }
    }

    /**
     * Générer la section résultats pour ÉLECTROPHORÈSE DE HÉMOGLOBINE
     * Le rendu est identique à l'hémogramme/NFS : titre, tableau générique, commentaires.
     */
    public function renderElectrophorese() {
        $this->renderPolice();
        // titre similaire à NFS mais laisser le nom fourni par examData si disponible
        $this->renderTitre($this->examData['exam_name'] ?? 'ÉLECTROPHORÈSE DE HÉMOGLOBINE', $this->examData['specimen'] ?? '');

        // tableau spécialisé à 4 colonnes
        $this->renderElectrophoreseParametres();

        // commentaires individuels comme d'habitude
        $this->renderCommentIndividuel();
    }

    /**
     * Rendu des paramètres spécifique à l'électrophorèse
     * Quatre colonnes et une cellule homozygote qui peut s'étendre verticalement.
     */
    private function renderElectrophoreseParametres() {
        $availableWidth = $this->w - PDF_LEFT_MARGIN - PDF_RIGHT_MARGIN;
        $col1 = round($availableWidth * 0.35);
        $col2 = round($availableWidth * 0.20);
        $col3 = round($availableWidth * 0.20);
        $col4 = $availableWidth - $col1 - $col2 - $col3;

        // déterminer libellé de l'en-tête et valeur à placer dans la colonne homozygote
        $header4 = 'Variante homozygote';
        $homoValue = '';
        if (isset($this->examData['results']) && is_array($this->examData['results'])) {
            foreach ($this->examData['results'] as $r) {
                $name = trim($r['name'] ?? '');
                $val  = trim($r['value'] ?? '');
                $oth  = trim($r['other'] ?? '');
                if (strcasecmp($name, 'NOM VARIANTE') === 0) {
                    if ($val !== '' && strcasecmp($val, 'AUTRES') !== 0) {
                        $header4 = 'Variante ' . $val;
                    } elseif ($oth !== '') {
                        $header4 = 'Variante ' . $oth;
                    } elseif ($val !== '') {
                        $header4 = 'Variante ' . $val;
                    }
                }
                if (strcasecmp($name, 'VARIANTE VALEUR') === 0) {
                    if ($val !== '' && strcasecmp($val, 'AUTRES') !== 0) {
                        $homoValue = $val;
                    } elseif ($oth !== '') {
                        $homoValue = $oth;
                    } elseif ($val !== '') {
                        $homoValue = $val;
                    }
                }
            }
        }

        // entête de colonnes
        $this->renderPolice('Calibri', 'B', 10);
        $this->SetFillColor(255, 255, 255);
        $this->SetDrawColor(200, 210, 230);
        $this->Cell($col1, 8, $this->renderTexte($this->renderMajuscule("Variante de l'hémoglobine")), 1, 0, 'C', true);
        $this->Cell($col2, 8, $this->renderTexte($this->renderMajuscule('Résultat %')), 1, 0, 'C', true);
        $this->Cell($col3, 8, $this->renderTexte($this->renderMajuscule('% Normal')), 1, 0, 'C', true);
        $this->Cell($col4, 8, $this->renderTexte($this->renderMajuscule($header4)), 1, 1, 'C', true);

        // filtrer les résultats à afficher
        $rows = [];
        if (isset($this->examData['results']) && is_array($this->examData['results'])) {
            foreach ($this->examData['results'] as $r) {
                $name = trim($r['name'] ?? '');
                if (strcasecmp($name, 'NOM VARIANTE') === 0) continue;
                if ($homoValue !== '' && strcasecmp($name, 'VARIANTE VALEUR') === 0) continue;
                $rows[] = $r;
            }
        }

        $rowHeight = 6;
        $count = count($rows);

        $this->renderPolice('Calibri', '', 10);
        $this->SetDrawColor(200, 210, 230);

        // x-position at start of homozygote column (for drawing border later)
        $xRightBorder = null;
        foreach ($rows as $index => $r) {
            $variant = html_entity_decode($r['name'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8');
            $value   = html_entity_decode($r['value'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8');
            $normal  = html_entity_decode($r['reference_range'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8');
            $other   = html_entity_decode($r['other'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8');

            $variantDisplay = $variant;
            if (strcasecmp(trim($variant), 'AUTRES') === 0 && $other !== '') {
                $variantDisplay = $other;
            }
            $valueDisplay = $value;
            if (strcasecmp(trim($value), 'AUTRES') === 0 && $other !== '') {
                $valueDisplay = $other;
            }

            // draw first three columns normally
            $this->Cell($col1, $rowHeight, $this->renderTexte($variantDisplay), 1, 0, 'L');
            $this->Cell($col2, $rowHeight, $this->renderTexte($valueDisplay), 1, 0, 'C');
            $this->Cell($col3, $rowHeight, $this->renderTexte($normal), 1, 0, 'C');

            // capture x position for right border
            if ($xRightBorder === null) {
                $xRightBorder = $this->GetX();
            }

            if ($index === 0 && $homoValue !== '') {
                // Augmenter la taille de police pour la valeur homozygote
                $this->renderPolice('Calibri', 'B', 13);
                $this->Cell($col4, $rowHeight * $count, $this->renderTexte($homoValue), 1, 0, 'C');
                $this->renderPolice('Calibri', '', 10); // Revenir à la police normale
            } else {
                if ($homoValue !== '') {
                    // leave empty cell area with only vertical borders
                    $this->Cell($col4, $rowHeight, '', 'LR', 0);
                } else {
                    $homoDisplay = '';
                    if (strcasecmp(trim($variant), 'VARIANTE VALEUR') === 0) {
                        $this->renderPolice('Calibri', 'B', 13);
                        $homoDisplay = $valueDisplay;
                        $this->Cell($col4, $rowHeight, $this->renderTexte($homoDisplay), 1, 0, 'C');
                        $this->renderPolice('Calibri', '', 10);
                    } else {
                        $this->Cell($col4, $rowHeight, $this->renderTexte($homoDisplay), 1, 0, 'C');
                    }
                }
            }
            // common line break for each row: always move by single rowHeight
            $this->Ln($rowHeight);
        }

        // if we removed cells for subsequent rows and still need a right border, draw it manually
        if ($homoValue !== '' && $xRightBorder !== null && $count > 1) {
            $yTop = $this->GetY() - ($rowHeight * $count);
            $yBottom = $this->GetY();
            $this->Line($xRightBorder, $yTop, $xRightBorder, $yBottom);
        }

        $this->Ln(10);
    }

    /**
     * Générer la section résultats pour NFL (Numerations et Formules Leucocytaires)
     * Le rendu est identique à l'hémogramme, seule la valeur par défaut du titre diffère.
     */
    public function renderNfl() {
        $this->renderPolice();
        $this->renderTitre($this->examData['exam_name'] ?? 'NUMERATIONS ET FORMULES LEUCOCYTAIRES (NFL)', $this->examData['specimen'] ?? '');
        $this->renderParamètres();
        $this->renderCommentIndividuel();
    }

    /**
     * Générer la section résultats pour Reticulocyte
     * Le rendu est identique à l'hémogramme, seule la valeur par défaut du titre diffère.
     */
    public function renderReticulocyte() {
        $this->renderPolice();
        $this->renderTitre($this->examData['exam_name'] ?? 'RETICULOCYTE', $this->examData['specimen'] ?? '');
        $this->renderParamètres();
        $this->renderCommentIndividuel();
    }

    /**
     * Générer la section résultats pour HEMATOLOGIE
     * Le rendu est identique à l'hémogramme, seule la valeur par défaut du titre diffère.
     */
    public function renderHematologie() {
        $this->renderPolice();
        $this->renderTitre($this->examData['exam_name'] ?? 'HEMATOLOGIE', $this->examData['specimen'] ?? '');
        $this->renderParamètres();
        $this->renderCommentIndividuel();
    }

    /**
     * Générer le PDF complet pour Reticulocyte
     */
    public function generateReticulocytePDF() {
        $this->AddPage();
        $this->AliasNbPages();

        $this->renderReticulocyte();
        $this->renderComments($this->examData['comments'] ?? '');
        $this->renderExamDescription($this->examData['description'] ?? '');
        $this->renderSignature();
        $this->renderFichiers();

        return $this->Output('S');
    }

    /**
     * Générer le PDF complet pour HEMATOLOGIE
     */
    public function generateHematologiePDF() {
        $this->AddPage();
        $this->AliasNbPages();

        $this->renderHematologie();
        $this->renderComments($this->examData['comments'] ?? '');
        $this->renderExamDescription($this->examData['description'] ?? '');
        $this->renderSignature();
        $this->renderFichiers();

        return $this->Output('S');
    }

    /**
     * Générer le PDF complet pour NFL
     */
    public function generateNflPDF() {
        $this->AddPage();
        $this->AliasNbPages();

        $this->renderNfl();
        $this->renderComments($this->examData['comments'] ?? '');
        $this->renderExamDescription($this->examData['description'] ?? '');
        $this->renderSignature();
        $this->renderFichiers();

        return $this->Output('S');
    }

    /**
     * Générer le PDF complet pour Ionogramme
     */
    public function generateIonogrammePDF() {
        $this->AddPage();
        $this->AliasNbPages();

        $this->renderIonogramme();
        $this->renderComments($this->examData['comments'] ?? '');
        $this->renderExamDescription($this->examData['description'] ?? '');
        $this->renderSignature();
        $this->renderFichiers();

        // Retourner le PDF généré en tant que chaîne
        return $this->Output('S');
    }

    /**
     * Générer le PDF complet pour Hemogramme (NFS)
     */
    public function generateHemogrammePDF() {
        $this->AddPage();
        $this->AliasNbPages();

        $this->renderHemogramme();
        $this->renderComments($this->examData['comments'] ?? '');
        $this->renderExamDescription($this->examData['description'] ?? '');
        $this->renderSignature();
        $this->renderFichiers();

        // Retourner le PDF généré en tant que chaîne
        return $this->Output('S');
    }

    /**
     * Générer le PDF complet pour MICROFILAIRE (structure personnalisée : specimen/méthode puis tableau 3 colonnes)
     */
    public function generateMicrofilairePDF() {
        $this->AddPage();
        $this->AliasNbPages();

        $this->renderMicrofilaire();
        $this->renderComments($this->examData['comments'] ?? '');
        $this->renderExamDescription($this->examData['description'] ?? '');
        $this->renderSignature();
        $this->renderFichiers();

        // Retourner le PDF généré en tant que chaîne
        return $this->Output('S');
    }

    /**
     * PDF complet pour VALEUR ABSOLU DES EOSINOPHILES
     */
    public function generateValeurAbsoluEosinophilesPDF() {
        $this->AddPage();
        $this->AliasNbPages();

        $this->renderValeurAbsoluEosinophiles();
        $this->renderComments($this->examData['comments'] ?? '');
        $this->renderExamDescription($this->examData['description'] ?? '');
        $this->renderSignature();
        $this->renderFichiers();

        // Retourner le PDF généré en tant que chaîne
        return $this->Output('S');
    }

    /**
     * Générer le PDF complet pour COAGULATION (structure générique)
     */
    public function generateCoagulationPDF() {
        $this->AddPage();
        $this->AliasNbPages();

        $this->renderCoagulation();
        $this->renderComments($this->examData['comments'] ?? '');
        $this->renderExamDescription($this->examData['description'] ?? '');
        $this->renderSignature();
        $this->renderFichiers();

        return $this->Output('S');
    }

    /**
     * Générer le PDF complet pour TEMPS DE SAIGNEMENT
     */
    public function generateTempsSaignementPDF() {
        $this->AddPage();
        $this->AliasNbPages();

        $this->renderTempsSaignement();
        $this->renderComments($this->examData['comments'] ?? '');
        $this->renderExamDescription($this->examData['description'] ?? '');
        $this->renderSignature();
        $this->renderFichiers();

        return $this->Output('S');
    }

    /**
     * Générer le PDF complet pour TP_INR (structure générique)
     */
    public function generateTpInrPDF() {
        $this->AddPage();
        $this->AliasNbPages();

        $this->renderTpInr();
        $this->renderComments($this->examData['comments'] ?? '');
        $this->renderExamDescription($this->examData['description'] ?? '');
        $this->renderSignature();
        $this->renderFichiers();

        return $this->Output('S');
    }

    /**
     * PDF complet pour HEMOCULTURE
     */
    public function generateHemoculturePDF() {
        $this->AddPage();
        $this->AliasNbPages();

        $this->renderHemoculture();
        $this->renderComments($this->examData['comments'] ?? '');
        $this->renderExamDescription($this->examData['description'] ?? '');
        $this->renderSignature();
        $this->renderFichiers();

        return $this->Output('S');
    }

    /**
     * PDF complet pour COPROCULTURE
     */
    public function generateCoproculturePDF() {
        $this->AddPage();
        $this->AliasNbPages();

        $this->renderCoproculture();
        $this->renderComments($this->examData['comments'] ?? '');
        $this->renderExamDescription($this->examData['description'] ?? '');
        $this->renderSignature();
        $this->renderFichiers();

        return $this->Output('S');
    }

    /**
     * Générer le PDF complet pour MICROBIOLOGIE (même structure que NFS)
     */
    public function generateMicrobiologiePDF() {
        $this->AddPage();
        $this->AliasNbPages();

        $this->renderMicrobiologie();
        $this->renderComments($this->examData['comments'] ?? '');
        $this->renderExamDescription($this->examData['description'] ?? '');
        $this->renderSignature();
        $this->renderFichiers();

        // Retourner le PDF généré en tant que chaîne
        return $this->Output('S');
    }

    /**
     * Générer le PDF complet pour ZIEHL NEELSEN
     */
    public function generateZiehlNelsenPDF() {
        $this->AddPage();
        $this->AliasNbPages();

        $this->renderZiehlNelsen();
        $this->renderComments($this->examData['comments'] ?? '');
        $this->renderExamDescription($this->examData['description'] ?? '');
        $this->renderSignature();
        $this->renderFichiers();

        return $this->Output('S');
    }

    /**
     * Générer le PDF complet pour GOUTTE FRAICHE (utilise mêmes tables que NFS)
     */
    public function generateGoutteFraichePDF() {
        $this->AddPage();
        $this->AliasNbPages();

        $this->renderGoutteFraiche();
        $this->renderComments($this->examData['comments'] ?? '');
        $this->renderExamDescription($this->examData['description'] ?? '');
        $this->renderSignature();
        $this->renderFichiers();

        return $this->Output('S');
    }

    /**
     * Générer le PDF complet pour GROUPAGE SANGUIN
     */
    public function generateGroupageSanguinPDF() {
        $this->AddPage();
        $this->AliasNbPages();

        $this->renderGroupageSanguin();
        $this->renderComments($this->examData['comments'] ?? '');
        $this->renderExamDescription($this->examData['description'] ?? '');
        $this->renderSignature();
        $this->renderFichiers();

        return $this->Output('S');
    }

    /**
     * Générer le PDF complet pour ÉLECTROPHORÈSE DE HÉMOGLOBINE
     */
    public function generateElectrophoresePDF() {
        $this->AddPage();
        $this->AliasNbPages();

        $this->renderElectrophorese();
        $this->renderComments($this->examData['comments'] ?? '');
        $this->renderExamDescription($this->examData['description'] ?? '');
        $this->renderSignature();
        $this->renderFichiers();

        // Retourner le PDF généré en tant que chaîne
        return $this->Output('S');
    }

    /**
     * Générer le PDF complet
     */
    public function generatePDF() {
        $this->AddPage();
        $this->AliasNbPages();

        $this->renderResults();
        $this->renderComments($this->examData['comments'] ?? '');
        $this->renderSignature();

        return $this->Output('S'); // Retourner le PDF en string
    }

    /**
     * Générer la section résultats pour BioChimie, CLIA, Hormones
     * Affiche: Paramètres | FLAG | Résultat | Range usuelle
     */
    public function renderBioCliaHorm() {
        $this->renderPolice();
        // Utilisation du bandeau de titre générique
        $this->renderTitre($this->examData['exam_name'] ?? 'BIOCHIMIE', $this->examData['specimen'] ?? '');

        // Calculer la largeur disponible
        $availableWidth = $this->w - PDF_LEFT_MARGIN - PDF_RIGHT_MARGIN;

        // Ajuster les largeurs des colonnes proportionnellement
        $paramWidth = round($availableWidth * 0.45);  // ~45% pour Paramètres
        $flagWidth = round($availableWidth * 0.12);   // ~12% pour FLAG
        $valueWidth = round($availableWidth * 0.23);  // ~23% pour Résultat
        $rangeWidth = $availableWidth - $paramWidth - $flagWidth - $valueWidth; // Le reste pour Range

        // En-têtes du tableau
        $this->renderPolice('Calibri', 'B', 9);
        $this->SetFillColor(255, 255, 255); // Blanc pour les en-têtes
        $this->SetDrawColor(200, 210, 230); // Couleur des bordures

        $this->Cell($paramWidth, 8, $this->renderTexte($this->renderMajuscule('Paramètres')), 1, 0, 'C', true);
        $this->Cell($flagWidth, 8, $this->renderTexte($this->renderMajuscule('Flag')), 1, 0, 'C', true);
        $this->Cell($valueWidth, 8, $this->renderTexte($this->renderMajuscule('Résultat')), 1, 0, 'C', true);
        $this->Cell($rangeWidth, 8, $this->renderTexte($this->renderMajuscule('Range usuelle')), 1, 1, 'C', true);

        // Données des résultats
        $this->renderPolice('Calibri', '', 9);
        $this->SetDrawColor(200, 210, 230); // Couleur des bordures pour les données

        if (isset($this->examData['results']) && is_array($this->examData['results'])) {
            foreach ($this->examData['results'] as $result) {
                // Ne pas afficher les paramètres marqués comme "Not Required"
                if (isset($result['is_not_required']) && $result['is_not_required'] == 1) {
                    continue;
                }

                $parameterName = html_entity_decode($result['name'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8');
                $flag = html_entity_decode($result['flag'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8');
                $value = html_entity_decode($result['value'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8');
                $unit = $this->sanitizePlaceholderValue(html_entity_decode($result['unit'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8'));
                $range = $this->sanitizePlaceholderValue(html_entity_decode($result['reference_range'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8'));

                // Combiner valeur et unité dans la même colonne
                $valueWithUnit = $value;
                if ($unit !== '') {
                    $valueWithUnit .= ' ' . $unit;
                }

                $this->Cell($paramWidth, 6, $this->renderTexte($parameterName), 1, 0, 'L');
                $this->Cell($flagWidth, 6, $this->renderTexte($flag), 1, 0, 'C');
                $this->Cell($valueWidth, 6, $this->renderTexte($valueWithUnit), 1, 0, 'C');
                $this->Cell($rangeWidth, 6, $this->renderTexte($range), 1, 1, 'C');
            }
        }

        $this->Ln(10);

        // Afficher les commentaires individuels des paramètres
        $this->renderCommentIndividuel();
    }

    /**
     * Générer le PDF complet pour BioChimie, CLIA, Hormones
     */
    public function generateBioCliaHormPDF() {
        $this->AddPage();
        $this->AliasNbPages();

        $this->renderBioCliaHorm();
        $this->renderComments($this->examData['comments'] ?? '');
        $this->renderExamDescription($this->examData['description'] ?? '');
        $this->renderSignature();
        $this->renderFichiers();

        return $this->Output('S'); // Retourner le PDF en string
    }

    public function renderSpotUrines() {
        $this->renderPolice();
        // Bandeau titre
        $this->renderTitre($this->examData['exam_name'] ?? 'SPOT URINES', $this->examData['specimen'] ?? '');

        // Paramètres (générique with FLAG)
        $this->renderParamètres();

        // Commentaires individuels si présents
        $this->renderCommentIndividuel();
    }

    /**
     * Générer la section résultats pour Protéinurie 24 heures
     * Utilise les helpers génériques : titre, paramètres, commentaires individuels
     */
    public function renderProteinurie24h() {
        $this->renderPolice();
        // Bandeau titre
        $this->renderTitre($this->examData['exam_name'] ?? 'PROTÉINURIE 24 HEURES', $this->examData['specimen'] ?? '');

        // Paramètres (générique with FLAG)
        $this->renderParamètres();

        // Commentaires individuels si présents
        $this->renderCommentIndividuel();
    }

    /**
     * Générer la section résultats pour Bilans Protéines Totales (PTT)
     * Utilise les helpers génériques : titre, paramètres, commentaires individuels
     */
    public function renderBilanProtTot() {
        $this->renderPolice();
        // Bandeau titre
        $this->renderTitre($this->examData['exam_name'] ?? 'BILANS PROTÉINES TOTALES', $this->examData['specimen'] ?? '');

        // Paramètres (générique with FLAG)
        $this->renderParamètres();

        // Commentaires individuels si présents
        $this->renderCommentIndividuel();
    }

    /**
     * Générer la section résultats pour Bilans Azotes (AZT)
     */
    public function renderBilanAzotes() {
        $this->renderPolice();
        // Bandeau titre
        $this->renderTitre($this->examData['exam_name'] ?? 'BILANS AZOTES', $this->examData['specimen'] ?? '');

        // Paramètres (générique with FLAG)
        $this->renderParamètres();

        // Commentaires individuels si présents
        $this->renderCommentIndividuel();
    }

    /**
     * Générer la section résultats pour Surveillance Prostatique (SP)
     * Comportement identique à Bilans Azotes / Profil Lipidique :
     * - Titre
     * - Tableau de paramètres
     * - Commentaires individuels
     */
    public function renderSurveillanceProstat() {
        $this->renderPolice();
        // Bandeau titre
        $this->renderTitre($this->examData['exam_name'] ?? 'SURVEILLANCE PROSTATIQUE', $this->examData['specimen'] ?? '');

        // Paramètres (générique with FLAG)
        $this->renderParamètres();

        // Commentaires individuels si présents
        $this->renderCommentIndividuel();
    }

    /**
     * Générer la section résultats pour Micro Albuminuries (MIC)
     */
    public function renderMicroAlbuminuries() {
        $this->renderPolice();
        // Bandeau titre
        $this->renderTitre($this->examData['exam_name'] ?? 'MICRO ALBUMINURIES', $this->examData['specimen'] ?? '');

        // Paramètres (générique with FLAG)
        $this->renderParamètres();

        // Commentaires individuels si présents
        $this->renderCommentIndividuel();
    }

    /**
     * Générer la section résultats pour Bilans de TORCH
     * Affiche : Paramètre | Résultat (+unité) | Valeur | Range usuelle
     * Regroupe les paires RESULTAT/VALEUR(S) comme Salmonella
     */
    public function renderBilansTorch() {
        $this->renderPolice();
        $this->renderTitre($this->examData['exam_name'] ?? 'BILANS DE TORCH', $this->examData['specimen'] ?? '');

        // Calculer largeurs pour 4 colonnes : Paramètres | Résultat | Valeur | Range usuelle
        $availableWidth = $this->w - PDF_LEFT_MARGIN - PDF_RIGHT_MARGIN;
        $paramWidth = round($availableWidth * 0.30);  // ~30% pour Paramètres
        $valueWidth = round($availableWidth * 0.25);  // ~25% pour Résultat
        $valuesWidth = round($availableWidth * 0.225); // ~22.5% pour Valeur
        $rangeWidth = $availableWidth - $paramWidth - $valueWidth - $valuesWidth; // Le reste pour Range

        // En-têtes
        $this->renderPolice('Calibri', 'B', 9);
        $this->SetFillColor(255, 255, 255);
        $this->SetDrawColor(200, 210, 230);
        $this->Cell($paramWidth, 8, $this->renderTexte($this->renderMajuscule('Paramètres')), 1, 0, 'C', true);
        $this->Cell($valueWidth, 8, $this->renderTexte($this->renderMajuscule('Résultat')), 1, 0, 'C', true);
        $this->Cell($valuesWidth, 8, $this->renderTexte($this->renderMajuscule('Valeur')), 1, 0, 'C', true);
        $this->Cell($rangeWidth, 8, $this->renderTexte($this->renderMajuscule('Range usuelle')), 1, 1, 'C', true);

        $this->renderPolice('Calibri', '', 9);

        $originalResults = $this->examData['results'] ?? [];
        $groups = [];
        $used = [];

        // Grouper les paramètres qui se terminent par ' RESULTAT' ou ' VALEUR(S)'
        foreach ($originalResults as $i => $r) {
            $name = html_entity_decode($r['name'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8');
            $val = html_entity_decode($r['value'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8');
            $unit = $this->sanitizePlaceholderValue(html_entity_decode($r['unit'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8'));
            $range = $this->sanitizePlaceholderValue(html_entity_decode($r['range'] ?? $r['reference_range'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8'));
            $other = html_entity_decode($r['other'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8');
            
            // Pour VALEUR: afficher avec unité
            $valWithUnit = $val;
            if ($unit !== '') $valWithUnit .= ' ' . $unit;
            
            // Pour RESULTAT: afficher sans unité
            $displayResultat = ($other !== '') ? $other : $val;
            $displayValeur = ($other !== '') ? $other : $valWithUnit;

            // RESULTAT suffix (sans unité)
            if (preg_match('/\s+RESULTAT$/i', $name)) {
                $prefix = preg_replace('/\s+RESULTAT$/i', '', $name);
                $prefix = trim($prefix);
                $groups[$prefix]['resultat'] = $displayResultat;
                $groups[$prefix]['range'] = $range;
                $used[$i] = true;
                continue;
            }

            // VALEUR or VALEURS or VALEUR(S) suffix (avec unité)
            if (preg_match('/\s+VALEUR(?:S|\(S\))?$/i', $name)) {
                $prefix = preg_replace('/\s+VALEUR(?:S|\(S\))?$/i', '', $name);
                $prefix = trim($prefix);
                $groups[$prefix]['valeurs'] = $displayValeur;
                $used[$i] = true;
                continue;
            }
        }

        // Afficher les groupes (RUBEOLE, CYTOMEGALOVIRUS, etc.)
        foreach ($groups as $prefix => $vals) {
            $res = $vals['resultat'] ?? '';
            $val = $vals['valeurs'] ?? '';
            $range = $vals['range'] ?? '';
            $this->Cell($paramWidth, 6, $this->renderTexte($prefix), 1, 0, 'L');
            $this->Cell($valueWidth, 6, $this->renderTexte($this->renderMajuscule($res)), 1, 0, 'C');
            $this->Cell($valuesWidth, 6, $this->renderTexte($val), 1, 0, 'C');
            $this->Cell($rangeWidth, 6, $this->renderTexte($range), 1, 1, 'C');
        }

        // Construire la liste des résultats restants (non groupés)
        $remaining = [];
        foreach ($originalResults as $i => $r) {
            if (isset($used[$i])) continue;
            $remaining[] = $r;
        }

        if (!empty($remaining)) {
            // Appeler la fonction générique pour afficher les paramètres restants
            $backup = $this->examData['results'];
            $this->examData['results'] = $remaining;
            // Paramètres | Résultat(+unité) | Valeur | Range usuelle
            // Note: renderParamètres avec (false, true, true, false) affiche aussi la Range usuelle
            $this->renderParamètres(false, true, true, false);
            $this->examData['results'] = $backup;
        }

        // Afficher les commentaires individuels
        $this->renderCommentIndividuel();
    }

    public function renderProfLip() {
        $this->renderPolice();
        // Bandeau titre
        $this->renderTitre($this->examData['exam_name'] ?? 'PROFIL LIPIDIQUE', $this->examData['specimen'] ?? '');

        // Paramètres (générique with FLAG)
        $this->renderParamètres();

        // Commentaires individuels si présents
        $this->renderCommentIndividuel();
    }

    /**
     * Générer la section résultats pour Glycémie Gestationnelle (GLG)
     */
    public function renderGlycemieGestationnelle() {
        $this->renderPolice();
        // Bandeau titre
        $this->renderTitre($this->examData['exam_name'] ?? 'GLYCÉMIE GESTATIONNELLE', $this->examData['specimen'] ?? '');

        // Paramètres (générique with FLAG)
        $this->renderParamètres();

        // Commentaires individuels si présents
        $this->renderCommentIndividuel();
    }

    /**
     * Générer la section résultats pour Bilirubine Complètes (BIL)
     */
    public function renderBilirCompl() {
        $this->renderPolice();
        // Bandeau titre
        $this->renderTitre($this->examData['exam_name'] ?? 'BILIRUBINE COMPLÈTES', $this->examData['specimen'] ?? '');

        // Paramètres (générique with FLAG)
        $this->renderParamètres();

        // Commentaires individuels si présents
        $this->renderCommentIndividuel();
    }

    /**
     * Générer la section résultats pour Sérologie
     */
    public function renderSerologie() {
        $this->renderPolice();
        // Bandeau titre
        $this->renderTitre($this->examData['exam_name'] ?? 'SÉROLOGIE', $this->examData['specimen'] ?? '');

        // Paramètres avec colonne VALEUR (SEROLOGIE a RESULTAT et VALEURS)
        $this->renderParamètres(false, false, true);

        // Commentaires individuels si présents
        $this->renderCommentIndividuel();
    }

    /**
     * Générer la section résultats pour Salmonella TYPHI IgG & IgM
     * Affiche : Paramètre | Résultat (+unité) | Valeur
     * Puis affiche les paramètres restants dans les mêmes colonnes.
     */
    public function renderSalmonella() {
        $this->renderPolice();
        $this->renderTitre($this->examData['exam_name'] ?? 'SALMONELLA TYPHI IgG & IgM', $this->examData['specimen'] ?? '');

        // Calculer largeurs identiques à la logique SEROLOGIE
        $availableWidth = $this->w - PDF_LEFT_MARGIN - PDF_RIGHT_MARGIN;
        $paramWidth = round($availableWidth * 0.35);
        $valueWidth = round($availableWidth * 0.325);
        $valuesWidth = $availableWidth - $paramWidth - $valueWidth;

        // En-têtes
        $this->renderPolice('Calibri', 'B', 9);
        $this->SetFillColor(255, 255, 255);
        $this->SetDrawColor(200, 210, 230);
        $this->Cell($paramWidth, 8, $this->renderTexte($this->renderMajuscule('Paramètres')), 1, 0, 'C', true);
        $this->Cell($valueWidth, 8, $this->renderTexte($this->renderMajuscule('Résultat')), 1, 0, 'C', true);
        $this->Cell($valuesWidth, 8, $this->renderTexte($this->renderMajuscule('Valeur')), 1, 1, 'C', true);

        $this->renderPolice('Calibri', '', 9);

        $originalResults = $this->examData['results'] ?? [];
        $groups = [];
        $used = [];

        // Grouper les paramètres qui se terminent par ' RESULTAT' ou ' VALEUR(S)'
        foreach ($originalResults as $i => $r) {
            $name = html_entity_decode($r['name'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8');
            $val = html_entity_decode($r['value'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8');
            $unit = $this->sanitizePlaceholderValue(html_entity_decode($r['unit'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8'));
            $valWithUnit = $val;
            if ($unit !== '') $valWithUnit .= ' ' . $unit;
            $other = html_entity_decode($r['other'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8');
            $display = ($other !== '') ? $other : $valWithUnit;

            // RESULTAT suffix
            if (preg_match('/\s+RESULTAT$/i', $name)) {
                $prefix = preg_replace('/\s+RESULTAT$/i', '', $name);
                $prefix = trim($prefix);
                $groups[$prefix]['resultat'] = $display;
                $used[$i] = true;
                continue;
            }

            // VALEUR or VALEURS suffix (accept both singular and plural)
            if (preg_match('/\s+VALEURS?$/i', $name)) {
                $prefix = preg_replace('/\s+VALEURS?$/i', '', $name);
                $prefix = trim($prefix);
                $groups[$prefix]['valeurs'] = $display;
                $used[$i] = true;
                continue;
            }
        }

        // Afficher les groupes (IgG, IgM ...)
        foreach ($groups as $prefix => $vals) {
            $res = $vals['resultat'] ?? '';
            $val = $vals['valeurs'] ?? '';
            $this->Cell($paramWidth, 6, $this->renderTexte($prefix), 1, 0, 'L');
            $this->Cell($valueWidth, 6, $this->renderTexte($res), 1, 0, 'C');
            $this->Cell($valuesWidth, 6, $this->renderTexte($val), 1, 1, 'C');
        }

        // Construire la liste des résultats restants (non groupés)
        $remaining = [];
        foreach ($originalResults as $i => $r) {
            if (isset($used[$i])) continue;
            $remaining[] = $r;
        }

        if (!empty($remaining)) {
            // Appeler la fonction générique pour afficher les paramètres restants
            $backup = $this->examData['results'];
            $this->examData['results'] = $remaining;
            // Paramètres | Résultat(+unité) | Valeur (ne pas réimprimer l'en-tête)
            $this->renderParamètres(false, false, true, false);
            $this->examData['results'] = $backup;
        }

        // Afficher les commentaires individuels
        $this->renderCommentIndividuel();
    }

    /**
     * Générer le PDF complet pour Salmonella
     */
    public function generateSalmonellaPDF() {
        $this->AddPage();
        $this->AliasNbPages();
        $this->renderSalmonella();
        $this->renderComments($this->examData['comments'] ?? '');
        $this->renderExamDescription($this->examData['description'] ?? '');
        $this->renderSignature();
        $this->renderFichiers();
        return $this->Output('S');
    }

    /**
     * Générer la section résultats pour WIDAL
     * Affiche : Paramètre | Résultat (+unité) | Valeur
     * Comportement identique à Salmonella pour grouper RESULTAT/VALEUR
     */
    public function renderWidal() {
        $this->renderPolice();
        $this->renderTitre($this->examData['exam_name'] ?? 'WIDAL TEST', $this->examData['specimen'] ?? '');

        // Nettoyer les suffixes techniques répétés en fin de libellé
        // ex: "... RESULTAT RESULTAT VALEUR" -> "..."
        $normalizeWidalParamName = function ($rawName) {
            $name = html_entity_decode((string)$rawName, ENT_QUOTES | ENT_HTML5, 'UTF-8');
            $name = preg_replace('/\s+/u', ' ', trim($name));
            $name = preg_replace('/(?:\s+(?:RESULTAT|VALEURS?))+$/iu', '', $name);
            return trim($name);
        };

        // Calculer largeurs identiques à la logique SEROLOGIE
        $availableWidth = $this->w - PDF_LEFT_MARGIN - PDF_RIGHT_MARGIN;
        $paramWidth = round($availableWidth * 0.35);
        $valueWidth = round($availableWidth * 0.325);
        $valuesWidth = $availableWidth - $paramWidth - $valueWidth;

        // En-têtes
        $this->renderPolice('Calibri', 'B', 9);
        $this->SetFillColor(255, 255, 255);
        $this->SetDrawColor(200, 210, 230);
        $this->Cell($paramWidth, 8, $this->renderTexte($this->renderMajuscule('Paramètres')), 1, 0, 'C', true);
        $this->Cell($valueWidth, 8, $this->renderTexte($this->renderMajuscule('Résultat')), 1, 0, 'C', true);
        $this->Cell($valuesWidth, 8, $this->renderTexte($this->renderMajuscule('Valeur')), 1, 1, 'C', true);

        $this->renderPolice('Calibri', '', 9);

        $originalResults = $this->examData['results'] ?? [];
        $groups = [];
        $used = [];

        // Grouper les paramètres qui se terminent par ' RESULTAT' ou ' VALEUR(S)'
        foreach ($originalResults as $i => $r) {
            $name = html_entity_decode($r['name'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8');
            $val = html_entity_decode($r['value'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8');
            $unit = $this->sanitizePlaceholderValue(html_entity_decode($r['unit'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8'));
            $valWithUnit = $val;
            if ($unit !== '') $valWithUnit .= ' ' . $unit;
            $other = html_entity_decode($r['other'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8');
            $display = ($other !== '') ? $other : $valWithUnit;

            // RESULTAT suffix
            if (preg_match('/\s+RESULTAT$/i', $name)) {
                $prefix = $normalizeWidalParamName($name);
                $groups[$prefix]['resultat'] = $display;
                $used[$i] = true;
                continue;
            }

            // VALEUR or VALEURS suffix (accept both singular and plural)
            if (preg_match('/\s+VALEURS?$/i', $name)) {
                $prefix = $normalizeWidalParamName($name);
                $groups[$prefix]['valeurs'] = $display;
                $used[$i] = true;
                continue;
            }
        }

        // Afficher les groupes (O, H, BH, AH ...)
        foreach ($groups as $prefix => $vals) {
            $res = $this->renderMajuscule((string)($vals['resultat'] ?? ''));
            $val = $this->renderMajuscule((string)($vals['valeurs'] ?? ''));
            $this->Cell($paramWidth, 6, $this->renderTexte($prefix), 1, 0, 'L');
            $this->Cell($valueWidth, 6, $this->renderTexte($res), 1, 0, 'C');
            $this->Cell($valuesWidth, 6, $this->renderTexte($val), 1, 1, 'C');
        }

        // Construire la liste des résultats restants (non groupés)
        $remaining = [];
        foreach ($originalResults as $i => $r) {
            if (isset($used[$i])) continue;
            $remaining[] = $r;
        }

        if (!empty($remaining)) {
            // Appeler la fonction générique pour afficher les paramètres restants
            $backup = $this->examData['results'];
            foreach ($remaining as &$rr) {
                if (!is_array($rr)) continue;
                $rr['name'] = $normalizeWidalParamName($rr['name'] ?? '');
                $rr['value'] = $this->renderMajuscule((string)($rr['value'] ?? ''));
                $rr['other'] = $this->renderMajuscule((string)($rr['other'] ?? ''));
                $rr['unit'] = $this->renderMajuscule((string)($rr['unit'] ?? ''));
            }
            unset($rr);
            $this->examData['results'] = $remaining;
            // Paramètres | Résultat(+unité) | Valeur (ne pas réimprimer l'en-tête)
            $this->renderParamètres(false, false, true, false);
            $this->examData['results'] = $backup;
        }

        // Afficher les commentaires individuels
        $this->renderCommentIndividuel();
    }

    /**
     * Générer le PDF complet pour WIDAL
     */
    public function generateWidalPDF() {
        $this->AddPage();
        $this->AliasNbPages();
        $this->renderWidal();
        $this->renderComments($this->examData['comments'] ?? '');
        $this->renderExamDescription($this->examData['description'] ?? '');
        $this->renderSignature();
        $this->renderFichiers();
        return $this->Output('S');
    }

    /**
     * Générer le PDF complet pour Spot Urines (BILANS DES ANALYSES MEDICALES)
     */
    public function generateSpotUrinePDF() {
        $this->AddPage();
        $this->AliasNbPages();

        $this->renderSpotUrines();
        $this->renderComments($this->examData['comments'] ?? '');
        $this->renderExamDescription($this->examData['description'] ?? '');
        $this->renderSignature();
        $this->renderFichiers();

        return $this->Output('S'); // Retourner le PDF en string
    }

    /**
     * Générer le PDF complet pour Protéinurie 24 heures
     */
    public function generateProteinurie24hPDF() {
        $this->AddPage();
        $this->AliasNbPages();

        $this->renderProteinurie24h();
        $this->renderComments($this->examData['comments'] ?? '');
        $this->renderExamDescription($this->examData['description'] ?? '');
        $this->renderSignature();
        $this->renderFichiers();

        return $this->Output('S'); // Retourner le PDF en string
    }

    /**
     * Générer le PDF complet pour Bilans Protéines Totales (PTT)
     */
    public function generateBilanProtTotPDF() {
        $this->AddPage();
        $this->AliasNbPages();

        $this->renderBilanProtTot();
        $this->renderComments($this->examData['comments'] ?? '');
        $this->renderExamDescription($this->examData['description'] ?? '');
        $this->renderSignature();
        $this->renderFichiers();

        return $this->Output('S'); // Retourner le PDF en string
    }

    /**
     * Générer le PDF complet pour Bilans Azotes (AZT)
     */
    public function generateBilanAzotesPDF() {
        $this->AddPage();
        $this->AliasNbPages();

        $this->renderBilanAzotes();
        $this->renderComments($this->examData['comments'] ?? '');
        $this->renderExamDescription($this->examData['description'] ?? '');
        $this->renderSignature();
        $this->renderFichiers();

        return $this->Output('S'); // Retourner le PDF en string
    }

    /**
     * Générer le PDF complet pour Surveillance Prostatique (SP)
     */
    public function generateSurveillanceProstatPDF() {
        $this->AddPage();
        $this->AliasNbPages();

        $this->renderSurveillanceProstat();
        $this->renderComments($this->examData['comments'] ?? '');
        $this->renderExamDescription($this->examData['description'] ?? '');
        $this->renderSignature();
        $this->renderFichiers();

        return $this->Output('S'); // Retourner le PDF en string
    }

    /**
     * Générer le PDF complet pour Micro Albuminuries (MIC)
     */
    public function generateMicroAlbuminuriesPDF() {
        $this->AddPage();
        $this->AliasNbPages();

        $this->renderMicroAlbuminuries();
        $this->renderComments($this->examData['comments'] ?? '');
        $this->renderExamDescription($this->examData['description'] ?? '');
        $this->renderSignature();
        $this->renderFichiers();

        return $this->Output('S'); // Retourner le PDF en string
    }

    /**
     * Générer le PDF complet pour Bilans de TORCH (TRC)
     */
    public function generateBilansTorchPDF() {
        $this->AddPage();
        $this->AliasNbPages();

        $this->renderBilansTorch();
        $this->renderComments($this->examData['comments'] ?? '');
        $this->renderExamDescription($this->examData['description'] ?? '');
        $this->renderSignature();
        $this->renderFichiers();

        return $this->Output('S'); // Retourner le PDF en string
    }

    /**
     * Générer la section résultats pour Frottis - Sécrétion
     * Utilise les helpers génériques : titre, paramètres, commentaires individuels
     */
    public function renderFrottisSecretion() {
        $this->renderPolice();
        // Bandeau titre
        $this->renderTitre($this->examData['exam_name'] ?? 'FROTTIS - SÉCRÉTION', $this->examData['specimen'] ?? '');

        // Paramètres (générique sans FLAG)
        $this->renderParamètres(false);

        // Commentaires individuels si présents
        $this->renderCommentIndividuel();
    }

    /**
     * Générer le PDF complet pour Frottis - Sécrétion
     */
    public function generateFrottisSecretionPDF() {
        $this->AddPage();
        $this->AliasNbPages();

        $this->renderFrottisSecretion();
        $this->renderComments($this->examData['comments'] ?? '');
        $this->renderExamDescription($this->examData['description'] ?? '');
        $this->renderSignature();
        $this->renderFichiers();

        return $this->Output('S'); // Retourner le PDF en string
    }

    /**
     * Générer la section résultats pour FLUIDE (LIQUIDE BIOLOGIQUE)
     * Utilise les helpers génériques : titre, paramètres, commentaires individuels
     */
    public function renderFluide() {
        $this->renderPolice();
        // Bandeau titre
        $this->renderTitre($this->examData['exam_name'] ?? 'FLUIDE (LIQUIDE BIOLOGIQUE)', $this->examData['specimen'] ?? '');

        // Paramètres (générique sans FLAG)
        $this->renderParamètres(false);

        // Commentaires individuels si présents
        $this->renderCommentIndividuel();
    }

    /**
     * Générer le PDF complet pour FLUIDE (LIQUIDE BIOLOGIQUE)
     */
    public function generateFluidePDF() {
        $this->AddPage();
        $this->AliasNbPages();

        $this->renderFluide();
        $this->renderComments($this->examData['comments'] ?? '');
        $this->renderExamDescription($this->examData['description'] ?? '');
        $this->renderSignature();
        $this->renderFichiers();

        return $this->Output('S'); // Retourner le PDF en string
    }

    /**
     * Générer le PDF complet pour Profil Lipidique (PLF)
     */
    public function generateProfLipPDF() {
        $this->AddPage();
        $this->AliasNbPages();

        $this->renderProfLip();
        $this->renderComments($this->examData['comments'] ?? '');
        $this->renderExamDescription($this->examData['description'] ?? '');
        $this->renderSignature();
        $this->renderFichiers();

        return $this->Output('S'); // Retourner le PDF en string
    }

    /**
     * Générer le PDF complet pour Glycémie Gestationnelle (GLG)
     */
    public function generateGlycemieGestationnellePDF() {
        $this->AddPage();
        $this->AliasNbPages();

        $this->renderGlycemieGestationnelle();
        $this->renderComments($this->examData['comments'] ?? '');
        $this->renderExamDescription($this->examData['description'] ?? '');
        $this->renderSignature();
        $this->renderFichiers();

        return $this->Output('S'); // Retourner le PDF en string
    }

    /**
     * Générer le PDF complet pour Bilirubine Complètes (BIL)
     */
    public function generateBilirComplPDF() {
        $this->AddPage();
        $this->AliasNbPages();

        $this->renderBilirCompl();
        $this->renderComments($this->examData['comments'] ?? '');
        $this->renderExamDescription($this->examData['description'] ?? '');
        $this->renderSignature();
        $this->renderFichiers();

        return $this->Output('S'); // Retourner le PDF en string
    }

    /**
     * Générer le PDF complet pour Sérologie
     */
    public function generateSerologiePDF() {
        $this->AddPage();
        $this->AliasNbPages();

        $this->renderSerologie();
        $this->renderComments($this->examData['comments'] ?? '');
        $this->renderExamDescription($this->examData['description'] ?? '');
        $this->renderSignature();
        $this->renderFichiers();

        return $this->Output('S'); // Retourner le PDF en string
    }

    // Alias rétrocompatible (ancienne faute de frappe)
    public function generateSeriologiePDF() {
        return $this->generateSerologiePDF();
    }

    /**
     * Exemple d'utilisation des fonctions génériques pour un nouveau modal
     * À utiliser comme modèle pour créer de nouveaux renders
     */
    /*
    public function renderExempleNouveauModal() {
        $this->renderPolice();
        // Section spécifique au nouveau modal
        $this->renderPolice('Calibri', 'B', 12);
        $this->Cell(0, 8, $this->renderTexte('RESULTATS DU NOUVEL EXAMEN'), 0, 1, 'L');
        $this->Ln(2);

        // Tableau spécifique au nouveau modal
        $this->renderPolice('Calibri', 'B', 9);
        $this->SetFillColor(240, 240, 240);
        $this->Cell(60, 8, $this->renderTexte('Paramètre'), 1, 0, 'C', true);
        $this->Cell(40, 8, $this->renderTexte('Valeur'), 1, 0, 'C', true);
        $this->Cell(50, 8, $this->renderTexte('Unité'), 1, 1, 'C', true);

        // Données spécifiques
        $this->renderPolice('Calibri', '', 9);
        // ... code pour afficher les données spécifiques ...

        $this->Ln(10);

        // Utilisation des fonctions génériques
        $this->renderExamDescription("Description spécifique à ce nouvel examen médical.");
        $this->renderComments("Commentaires particuliers pour ce type d'examen.");
    }
    */
}

/**
 * Fonction principale pour générer un PDF de résultats d'examen
 * @param int $examId ID de l'examen
 * @param int $patientId ID du patient
 * @param string $examType Type d'examen (optionnel, détecté automatiquement)
 * @param string|null &$failureReason Raison interne si échec : no_exam_row | no_pdf_method | exception
 * @return string|bool|false Contenu PDF (mode standard), true (mode append), ou false en cas d'erreur
 */
function generateExamResultPDF($examId, $patientId, $examType = null, &$failureReason = null, $existingPdf = null, $appendMode = false) {
    $failureReason = null;
    try {
        // Connexion à la base de données
        global $pdo;
        error_log("=== PDF GENERATION START ===");
        error_log("Exam ID: $examId");
        error_log("Patient ID: $patientId");
        error_log("Exam Type: " . ($examType ?? 'null'));
        error_log("=== generateExamResultPDF START === ExamID=$examId PatientID=$patientId Type=" . ($examType ?? 'null'));
        // Récupérer les données de l'examen depuis exam_results (requête simplifiée)
        $stmt = $pdo->prepare("
            SELECT er.*, p.nom, p.prenom, p.date_naissance, p.sexe, p.telephone, p.adresse, p.num_enreg,
                   p.id as patient_id, p.age as stored_age,
                   COALESCE(p.age, TIMESTAMPDIFF(YEAR, p.date_naissance, CURDATE())) as age,
                   COALESCE(eh.doctor, eh_fb.doctor) as eh_doctor,
                   COALESCE(eh.meta, eh_fb.meta) as eh_meta,
                   d.nom as r_doctor_nom
            FROM exam_results er
            LEFT JOIN patients p ON er.patient_id = p.id
            LEFT JOIN examen_hors eh ON eh.id = er.examen_hors_id
            LEFT JOIN examen_hors eh_fb ON eh_fb.id = (
                SELECT eh2.id
                FROM examen_hors eh2
                WHERE eh2.patient_id = er.patient_id
                ORDER BY eh2.created_at DESC, eh2.id DESC
                LIMIT 1
            )
            LEFT JOIN recommandations r ON r.patient_id = er.patient_id
            LEFT JOIN docteur d ON d.id_docteur = r.doctor_id
            WHERE er.exam_id = ? AND er.patient_id = ? AND er.is_latest = 1
            ORDER BY er.created_at DESC
            LIMIT 1
        ");
        $stmt->execute([$examId, $patientId]);
        $examData = $stmt->fetch(PDO::FETCH_ASSOC);

        // Debug: Log the query and parameters
        error_log("PDF Debug - Exam ID: $examId, Patient ID: $patientId");
        error_log("PDF Debug - Query result: " . ($examData ? 'Found' : 'Not found'));
        if ($examData) {
            error_log("PDF Debug - Exam data keys: " . implode(', ', array_keys($examData)));
        }

        if (!$examData) {
            $failureReason = 'no_exam_row';
            return false;
        }

        // Récupérer les informations de l'examen séparément
        $examInfo = [];
        if (isset($examData['exam_id'])) {
            $stmt2 = $pdo->prepare("SELECT nom as exam_name, description as exam_description, specimen FROM examens WHERE id = ?");
            $stmt2->execute([$examData['exam_id']]);
            $examInfo = $stmt2->fetch(PDO::FETCH_ASSOC) ?: [];
        }

        // Récupérer le CNOM du médecin
        $cNom = 'Non spécifié';
        if (!empty($examData['doctor_id'])) {
            $stmt3 = $pdo->prepare("SELECT cnom FROM docteur WHERE id_docteur = ?");
            $stmt3->execute([$examData['doctor_id']]);
            $doctorInfo = $stmt3->fetch(PDO::FETCH_ASSOC);
            if ($doctorInfo) {
                $cNom = $doctorInfo['cnom'];
            }
        } elseif (!empty($examData['created_by'])) {
            $stmt4 = $pdo->prepare("SELECT cnom FROM docteur WHERE id_docteur = ?");
            $stmt4->execute([$examData['created_by']]);
            $doctorInfo = $stmt4->fetch(PDO::FETCH_ASSOC);
            if ($doctorInfo) {
                $cNom = $doctorInfo['cnom'];
            }
        }

        // Déterminer le médecin demandeur depuis examen_hors ou recommandations
        $medecin_demandeur = '';
        if (!empty($examData['eh_doctor'])) {
            $medecin_demandeur = $examData['eh_doctor'];
        } elseif (!empty($examData['r_doctor_nom'])) {
            $medecin_demandeur = $examData['r_doctor_nom'];
        }

        // Récupérer le CNOM du médecin demandeur (interne ou externe)
        // Source prioritaire: examen_hors.meta.doctor_context (id/source), puis fallback par nom.
        $cnom_medecin = '';
        $requestDoctorId = 0;
        $requestDoctorSource = '';
        if (!empty($examData['eh_meta'])) {
            $ehMeta = json_decode((string)$examData['eh_meta'], true);
            if (is_array($ehMeta) && isset($ehMeta['doctor_context']) && is_array($ehMeta['doctor_context'])) {
                $requestDoctorId = !empty($ehMeta['doctor_context']['id']) ? intval($ehMeta['doctor_context']['id']) : 0;
                $requestDoctorSource = !empty($ehMeta['doctor_context']['source']) ? strtolower(trim((string)$ehMeta['doctor_context']['source'])) : '';
            }
        }

        if ($requestDoctorId > 0 && $requestDoctorSource === 'docteurs_externes') {
            $stmt_ext_id = $pdo->prepare("SELECT CONCAT(prenom, ' ', nom) AS full_name, cnom FROM docteurs_externes WHERE id_docteur_externe = ? LIMIT 1");
            $stmt_ext_id->execute([$requestDoctorId]);
            $row_ext_id = $stmt_ext_id->fetch(PDO::FETCH_ASSOC);
            if ($row_ext_id) {
                $cnom_medecin = $row_ext_id['cnom'] ?? '';
                if (empty($medecin_demandeur) && !empty($row_ext_id['full_name'])) {
                    $medecin_demandeur = $row_ext_id['full_name'];
                }
            }
        } elseif ($requestDoctorId > 0) {
            $stmt_int_id = $pdo->prepare("SELECT cnom FROM docteur WHERE id_docteur = ? AND role = 'MEDECIN' LIMIT 1");
            $stmt_int_id->execute([$requestDoctorId]);
            $row_int_id = $stmt_int_id->fetch(PDO::FETCH_ASSOC);
            if ($row_int_id) {
                $cnom_medecin = $row_int_id['cnom'] ?? '';
            }
        }

        if ($cnom_medecin === '' && !empty($medecin_demandeur)) {
            // Fallback externe par nom complet (tolérant casse/espaces)
            $stmt_ext_name = $pdo->prepare("SELECT cnom FROM docteurs_externes WHERE UPPER(TRIM(CONCAT(prenom, ' ', nom))) = UPPER(TRIM(?)) OR UPPER(TRIM(CONCAT(nom, ' ', prenom))) = UPPER(TRIM(?)) LIMIT 1");
            $stmt_ext_name->execute([$medecin_demandeur, $medecin_demandeur]);
            $row_ext_name = $stmt_ext_name->fetch(PDO::FETCH_ASSOC);
            if ($row_ext_name) {
                $cnom_medecin = $row_ext_name['cnom'] ?? '';
            }
        }

        if ($cnom_medecin === '' && !empty($medecin_demandeur)) {
            // Fallback interne: nom complet ou inversé, puis nom seul.
            $stmt_int_name = $pdo->prepare("SELECT cnom FROM docteur WHERE role = 'MEDECIN' AND (UPPER(TRIM(CONCAT(prenom, ' ', nom))) = UPPER(TRIM(?)) OR UPPER(TRIM(CONCAT(nom, ' ', prenom))) = UPPER(TRIM(?)) OR UPPER(TRIM(nom)) = UPPER(TRIM(?))) LIMIT 1");
            $stmt_int_name->execute([$medecin_demandeur, $medecin_demandeur, $medecin_demandeur]);
            $row_int_name = $stmt_int_name->fetch(PDO::FETCH_ASSOC);
            if ($row_int_name) {
                $cnom_medecin = $row_int_name['cnom'] ?? '';
            }
        }

        // Fusionner les données
        $examData = array_merge($examData, $examInfo, ['c_nom' => $cNom, 'medecin_demandeur' => $medecin_demandeur, 'cnom_medecin' => $cnom_medecin]);

        // Déterminer le type d'examen
        $detectedExamType = $examType ?: $examData['modal_type'];

        // Parser les paramètres JSON
        $results = [];
        if (!empty($examData['parameters_json'])) {
            $parameters = json_decode($examData['parameters_json'], true);
            if (is_array($parameters)) {
                $results = $parameters;
            }
        }

        // TRANSFORMATION: Convertir array d'objets en array plat pour renderGroupageSanguin
        // renderGroupageSanguin() attend: ['groupe' => 'AB+', 'beth_A' => 1, ...]
        // Mais l'API enregistre souvent: [['name' => 'groupe', 'value' => 'AB+'], ...]
        // Déclencher aussi si modal_type FR "groupe_sanguin" (sans sous-chaîne "groupage").
        $typeStr = strtolower((string) $detectedExamType);
        $modalStr = strtolower((string) ($examData['modal_type'] ?? ''));
        $isGroupageLike = (
            strpos($typeStr, 'groupage') !== false
            || (strpos($typeStr, 'groupe') !== false && strpos($typeStr, 'sanguin') !== false)
            || strpos($modalStr, 'groupage') !== false
            || (strpos($modalStr, 'groupe') !== false && strpos($modalStr, 'sanguin') !== false)
        );
        if ($isGroupageLike && is_array($results) && !empty($results)) {
            // Vérifier si c'est un array d'objets (structure: [0 => ['name' => ..., 'value' => ...], ...])
            $firstItem = reset($results);
            if (is_array($firstItem) && isset($firstItem['name']) && isset($firstItem['value'])) {
                // C'est un array d'objets → transformer en array plat
                error_log("[generateExamResultPDF] Transformation groupage: array d'objets → array plat");
                $flatResults = [];
                foreach ($results as $item) {
                    $rawName = trim((string)($item['name'] ?? ''));
                    $value = $item['value'] ?? '';
                    $other = $item['other'] ?? '';
                    
                    // Utiliser 'other' si rempli, sinon 'value'
                    $finalValue = (trim((string)$other) !== '') ? $other : $value;
                    
                    // Clé stable : minuscules + accents FR → ASCII + espaces → underscores
                    $name = mb_strtolower($rawName, 'UTF-8');
                    $name = strtr($name, [
                        'é' => 'e', 'è' => 'e', 'ê' => 'e', 'ë' => 'e',
                        'à' => 'a', 'â' => 'a', 'ô' => 'o', 'ù' => 'u', 'û' => 'u',
                        'î' => 'i', 'ï' => 'i', 'ç' => 'c', 'œ' => 'oe', 'æ' => 'ae',
                    ]);
                    $name = str_replace([' ', '-'], '_', $name);
                    $name = preg_replace('/[^a-z0-9_]/', '', $name);
                    if ($name !== '') {
                        $flatResults[$name] = $finalValue;
                    }
                }
                $results = $flatResults;
                error_log("[generateExamResultPDF] Résultats après transformation: " . json_encode($results));
            }
        }

        // Préparer les données pour le PDF
        $pdfData = [
            'exam_name' => $examData['exam_name'] ?: ucfirst($detectedExamType),
            'exam_date' => date('d/m/Y', strtotime($examData['created_at'])),
            'exam_id' => $examId,
            'medecin_demandeur' => $examData['medecin_demandeur'] ?: '',
            'cnom_medecin' => $examData['cnom_medecin'] ?? '',
            'results' => $results,
            'comments' => $examData['comments'] ?? '',
            'description' => $examData['exam_description'] ?? '',
            'exam_type' => $detectedExamType,
            'c_nom' => $examData['c_nom'] ?? 'Non spécifié',
            'specimen' => $examInfo['specimen'] ?? '',
            'attachments' => $examData['attachments'] ?? null
        ];

        $patientData = [
            'nom' => $examData['nom'],
            'prenom' => $examData['prenom'],
            'date_naissance' => $examData['date_naissance'] ? date('d/m/Y', strtotime($examData['date_naissance'])) : '',
            'sexe' => $examData['sexe'],
            'telephone' => $examData['telephone'],
            'adresse' => $examData['adresse'],
            'id_patient' => $examData['patient_id'],
            'num_enreg' => $examData['num_enreg'],
            'age' => $examData['age']
        ];

        $labInfo = [
            'name' => 'CENTRE HOSPITALIER UNIVERSITAIRE',
            'address' => 'Adresse du laboratoire',
            'phone' => 'Téléphone: 00-00-00-00'
        ];

        // Générer le PDF selon le type d'examen
        $pdf = ($appendMode && $existingPdf instanceof ExamResultPDF)
            ? $existingPdf
            : new ExamResultPDF($pdfData, $patientData, $labInfo);

        if ($appendMode && $pdf instanceof ExamResultPDF) {
            // En mode append, on réutilise le même document PDF et on injecte
            // les données de l'examen courant dans l'instance existante.
            $refPdf = new ReflectionObject($pdf);
            foreach ([
                'examData' => $pdfData,
                'patientData' => $patientData,
                'labInfo' => $labInfo,
                'isAnnexePage' => false,
            ] as $propName => $propValue) {
                if ($refPdf->hasProperty($propName)) {
                    $prop = $refPdf->getProperty($propName);
                    $prop->setAccessible(true);
                    $prop->setValue($pdf, $propValue);
                }
            }

            if ($pdf->PageNo() === 0) {
                $pdf->AddPage();
                $pdf->AliasNbPages();
            }
        }

        // ===== SOLUTION 2 : Reconnaissance Intelligente par Métadonnées =====
        // Utiliser le SmartExamDetector pour une détection multi-niveaux
        $detector = new SmartExamDetector();
        $detectionResult = $detector->detect($examData);
        
        $detectedType = $detectionResult['type'];
        $confidence = $detectionResult['confidence'];
        
        // Log de détection
        if ($confidence > 0) {
            error_log("[generateExamResultPDF] Type détecté: {$detectedType} (confidence: {$confidence}, method: {$detectionResult['method']})");
        } else {
            error_log("[generateExamResultPDF] Type inconnu par le détecteur (exam_id={$examId}), essai autres candidats pour generate*PDF");
        }

        // Candidats pour résoudre generate*PDF : d'abord le type explicite (URL/POST), puis détection, puis modal_type DB.
        // Le détecteur peut renvoyer "generic" alors que type= ou modal_type= est correct (ex. proteineBincesJones).
        $pdfTypeCandidates = [];
        if ($examType !== null && trim((string) $examType) !== '') {
            $pdfTypeCandidates[] = $detector->normalizeExamTypeForPdf(trim((string) $examType));
        }
        $pdfTypeCandidates[] = $detectedType;
        if (!empty($examData['modal_type'])) {
            $pdfTypeCandidates[] = $detector->normalizeExamTypeForPdf($examData['modal_type']);
        }
        $pdfTypeCandidates = array_values(array_unique(array_filter($pdfTypeCandidates, function ($t) {
            return $t !== null && $t !== '';
        })));

        $targetPrefix = $appendMode ? 'render' : 'generate';
        $targetSuffix = $appendMode ? '' : 'PDF';
        $targetMethod = null;
        $chosenType = null;
        foreach ($pdfTypeCandidates as $tryType) {
            $m = MethodDiscoveryRegistry::resolveMethod(
                $pdf,
                $tryType,
                $targetPrefix,
                $targetSuffix
            );
            if ($m && method_exists($pdf, $m)) {
                $targetMethod = $m;
                $chosenType = $tryType;
                break;
            }
        }

        if ($targetMethod && method_exists($pdf, $targetMethod)) {
            error_log("[generateExamResultPDF] Appelé: {$targetMethod}() (type routé: {$chosenType}, append=" . ($appendMode ? '1' : '0') . ")");

            if ($appendMode) {
                // Mode multi-examens continu : pas de AddPage forcé entre examens.
                $pdf->$targetMethod();
                $pdf->renderComments($pdfData['comments'] ?? '');
                $pdf->renderExamDescription($pdfData['description'] ?? '');
                $pdf->renderFichiers();

                // Repasser en mode principal après une éventuelle annexe.
                $refPdf = new ReflectionObject($pdf);
                if ($refPdf->hasProperty('isAnnexePage')) {
                    $pAnnexe = $refPdf->getProperty('isAnnexePage');
                    $pAnnexe->setAccessible(true);
                    $pAnnexe->setValue($pdf, false);
                }
                return true;
            }

            return $pdf->$targetMethod();
        }

        if ($appendMode) {
            error_log("[generateExamResultPDF] Aucune méthode render* pour candidats: " . implode(', ', $pdfTypeCandidates) . " (exam_id={$examId})");
        } else {
            error_log("[generateExamResultPDF] Aucune méthode generate*PDF pour candidats: " . implode(', ', $pdfTypeCandidates) . " (exam_id={$examId})");
        }
        $failureReason = 'no_pdf_method';
        return false;

    } catch (Exception $e) {
        $errorMsg = "Erreur PDF - Exam $examId - Patient $patientId : " . $e->getMessage();
        $fullTrace = $e->getTraceAsString();

        error_log("=== PDF EXCEPTION ===");
        error_log($errorMsg);
        error_log("File: " . $e->getFile() . " Line: " . $e->getLine());
        error_log("Trace:\n" . $fullTrace);
        error_log("=== END PDF EXCEPTION ===");

        $GLOBALS['lastPdfGenerationError'] = $errorMsg;
        $failureReason = 'exception';
        return false;
    }
}

/**
 * Fonction pour générer un PDF de spermogramme
 * @param int $examId ID de l'examen
 * @param int $patientId ID du patient
 * @return string|false Contenu du PDF ou false en cas d'erreur
 */
function generateSpermogrammePDF($examId, $patientId) {
    // Utiliser la fonction générique avec le type spermogramme
    return generateExamResultPDF($examId, $patientId, 'spermogramme');
}

/**
 * Fonction pour générer un PDF de BioChimie, CLIA, Hormones
 * @param int $examId ID de l'examen
 * @param int $patientId ID du patient
 * @return string|false Contenu du PDF ou false en cas d'erreur
 */
function generateBioCliaHormPDF($examId, $patientId) {
    // Utiliser la fonction générique avec le type biocliahorm
    return generateExamResultPDF($examId, $patientId, 'biocliahorm');
}

/**
 * Fonction pour générer un PDF consolidé avec plusieurs examens
 * @param int $patientId ID du patient
 * @param array $examIds Array des IDs d'examens
 * @return string|false Contenu du PDF ou false en cas d'erreur
 */
function resolveGhostscriptExecutable() {
    $candidates = [
        'C:\\Program Files\\gs\\gs10.06.0\\bin\\gswin64c.exe',
        'C:\\Program Files\\gs\\gs10.05.1\\bin\\gswin64c.exe',
        'C:\\Program Files\\gs\\gs10.04.0\\bin\\gswin64c.exe',
        'gswin64c',
        'gswin32c',
        'gs'
    ];

    foreach ($candidates as $bin) {
        // Absolute path available on disk
        if (strpos($bin, ':\\') !== false && is_file($bin)) {
            return $bin;
        }

        // Try executable from PATH
        $descriptors = [
            0 => ['pipe', 'r'],
            1 => ['pipe', 'w'],
            2 => ['pipe', 'w'],
        ];
        $process = @proc_open([$bin, '-version'], $descriptors, $pipes);
        if (is_resource($process)) {
            @fclose($pipes[0]);
            @stream_get_contents($pipes[1]);
            @stream_get_contents($pipes[2]);
            @fclose($pipes[1]);
            @fclose($pipes[2]);
            $exitCode = proc_close($process);
            if ($exitCode === 0) {
                return $bin;
            }
        }
    }

    return null;
}

function mergePdfFilesWithGhostscript($pdfPaths) {
    if (!is_array($pdfPaths) || empty($pdfPaths)) return false;

    $gsBin = resolveGhostscriptExecutable();
    if (!$gsBin) {
        $error = '[PDF_RESULTAT] Ghostscript introuvable pour fusion PDF';
        error_log($error);
        $GLOBALS['lastPdfGenerationError'] = $error;
        return false;
    }

    $tmpOutput = tempnam(sys_get_temp_dir(), 'merge_pdf_');
    if ($tmpOutput === false) return false;
    $tmpOutputPdf = $tmpOutput . '.pdf';
    @unlink($tmpOutput);

    $cmd = [
        $gsBin,
        '-q',
        '-dNOPAUSE',
        '-dBATCH',
        '-sDEVICE=pdfwrite',
        '-dCompatibilityLevel=1.4',
        '-dAutoRotatePages=/None',
        '-sOutputFile=' . $tmpOutputPdf
    ];
    foreach ($pdfPaths as $p) {
        $cmd[] = $p;
    }

    $descriptors = [
        0 => ['pipe', 'r'],
        1 => ['pipe', 'w'],
        2 => ['pipe', 'w'],
    ];
    $process = @proc_open($cmd, $descriptors, $pipes);
    if (!is_resource($process)) {
        $error = '[PDF_RESULTAT] Échec proc_open lors de la fusion Ghostscript';
        error_log($error);
        $GLOBALS['lastPdfGenerationError'] = $error;
        @unlink($tmpOutputPdf);
        return false;
    }

    @fclose($pipes[0]);
    $stdout = @stream_get_contents($pipes[1]);
    $stderr = @stream_get_contents($pipes[2]);
    @fclose($pipes[1]);
    @fclose($pipes[2]);
    $exitCode = proc_close($process);

    if ($exitCode !== 0 || !is_file($tmpOutputPdf)) {
        $error = sprintf('[PDF_RESULTAT] Erreur fusion Ghostscript: code=%d, stderr=%s, stdout=%s',
            $exitCode,
            trim((string)$stderr),
            trim((string)$stdout)
        );
        error_log($error);
        $GLOBALS['lastPdfGenerationError'] = $error;
        @unlink($tmpOutputPdf);
        return false;
    }

    $merged = @file_get_contents($tmpOutputPdf);
    @unlink($tmpOutputPdf);
    return $merged !== false ? $merged : false;
}

function generateMultiExamPDF($patientId, $examIds = []) {
    try {
        global $pdo;

        set_time_limit(300);
        $patientId = intval($patientId);
        if ($patientId <= 0 || empty($examIds) || !is_array($examIds)) return false;

        // Keep selection order, remove duplicates and invalid ids
        $normalizedExamIds = [];
        $seen = [];
        foreach ($examIds as $rawId) {
            $eid = intval($rawId);
            if ($eid <= 0 || isset($seen[$eid])) continue;
            $seen[$eid] = true;
            $normalizedExamIds[] = $eid;
        }
        if (empty($normalizedExamIds)) return false;

        // Validate patient existence once
        $stmtPatient = $pdo->prepare("SELECT id FROM patients WHERE id = ? LIMIT 1");
        $stmtPatient->execute([$patientId]);
        if (!$stmtPatient->fetch(PDO::FETCH_ASSOC)) return false;

        $sharedPdf = new ExamResultPDF(
            [],
            ['id_patient' => $patientId],
            [
                'name' => 'CENTRE HOSPITALIER UNIVERSITAIRE',
                'address' => 'Adresse du laboratoire',
                'phone' => 'Téléphone: 00-00-00-00'
            ]
        );
        $generatedCount = 0;
        $stmtType = $pdo->prepare("
            SELECT modal_type
            FROM exam_results
            WHERE exam_id = ? AND patient_id = ? AND is_latest = 1
            ORDER BY created_at DESC
            LIMIT 1
        ");

        // Générer les examens dans un seul flux PDF continu (pas de fusion Ghostscript).
        foreach ($normalizedExamIds as $examId) {
            $stmtType->execute([$examId, $patientId]);
            $rowType = $stmtType->fetch(PDO::FETCH_ASSOC);
            if (!$rowType) {
                // exam does not belong to this patient or not found
                continue;
            }

            $examType = !empty($rowType['modal_type']) ? $rowType['modal_type'] : null;
            $failureReason = null;
            $ok = generateExamResultPDF($examId, $patientId, $examType, $failureReason, $sharedPdf, true);
            if ($ok === false) {
                continue;
            }
            $generatedCount++;
        }

        if ($generatedCount === 0) {
            $error = 'génération multi-examens: aucun PDF valide produit pour les examens sélectionnés';
            error_log('[PDF_RESULTAT] ' . $error);
            $GLOBALS['lastPdfGenerationError'] = $error;
            return false;
        }

        // Signature unique en fin de PDF compilé (et non à chaque examen).
        $refPdf = new ReflectionObject($sharedPdf);
        if ($refPdf->hasProperty('isAnnexePage')) {
            $pAnnexe = $refPdf->getProperty('isAnnexePage');
            $pAnnexe->setAccessible(true);
            $pAnnexe->setValue($sharedPdf, false);
        }
        $sharedPdf->renderSignature();

        return $sharedPdf->Output('S');

    } catch (Exception $e) {
        error_log('generateMultiExamPDF error: ' . $e->getMessage());
        return false;
    }
}

// Gestion des requêtes HTTP
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['patient_id'])) {
    global $pdo;
    $patientId = (int) $_GET['patient_id'];

    // PDF consolidé : URL réelle (F5 / actualisation fonctionne, plus d'URL blob:)
    $examIdsList = [];
    if (isset($_GET['exam_ids'])) {
        if (is_array($_GET['exam_ids'])) {
            $examIdsList = array_values(array_filter(array_map('intval', $_GET['exam_ids'])));
        } else {
            $raw = trim((string) $_GET['exam_ids']);
            if ($raw !== '') {
                $examIdsList = array_values(array_filter(array_map('intval', preg_split('/[\s,;]+/', $raw))));
            }
        }
    }

    if (!empty($examIdsList)) {
        $pdfContent = generateMultiExamPDF($patientId, $examIdsList);
        if ($pdfContent !== false) {
            $filename = pdf_build_download_filename($pdo, $patientId, 'examens_consolides');
            $asZip = isset($_GET['zip']) && (string) $_GET['zip'] === '1';

            if ($asZip) {
                $zipName = pathinfo($filename, PATHINFO_FILENAME) . '.zip';
                if (pdf_stream_zip_with_pdf($pdfContent, $filename, $zipName)) {
                    exit;
                }
                http_response_code(500);
                header('Content-Type: application/json; charset=utf-8');
                echo json_encode([
                    'error' => 'Impossible de créer l\'archive ZIP. Vérifiez que l\'extension PHP zip (ZipArchive) est activée.',
                    'code' => 'zip_failed'
                ]);
                exit;
            }

            // Copie serveur : même PDF que l’aperçu / téléchargement (bouton « Imprimer PDF compilé »)
            if (!pdf_save_pdf_to_documents_patients($pdfContent, $filename)) {
                error_log('pdf_save_pdf_to_documents_patients: copie ignorée ou échouée pour ' . $filename);
            }

            $asDownload = isset($_GET['download']) && (string) $_GET['download'] === '1';
            $disposition = $asDownload ? 'attachment' : 'inline';
            header('Content-Type: application/pdf');
            header('Content-Disposition: ' . $disposition . '; filename="' . $filename . '"');
            header('Content-Length: ' . strlen($pdfContent));
            echo $pdfContent;
            exit;
        }
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
        $errorMsg = 'Erreur lors de la génération du PDF consolidé';
        if (!empty($GLOBALS['lastPdfGenerationError'])) {
            $errorMsg .= ' : ' . $GLOBALS['lastPdfGenerationError'];
        }
        echo json_encode([
            'error' => $errorMsg,
            'code' => 'multi_pdf_failed',
            'details' => $GLOBALS['lastPdfGenerationError'] ?? null
        ]);
        exit;
    }

    if (!isset($_GET['exam_id'])) {
        http_response_code(400);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['error' => 'exam_id ou exam_ids requis avec patient_id']);
        exit;
    }

    $examId = (int) $_GET['exam_id'];
    $examType = isset($_GET['type']) ? $_GET['type'] : null;

    $pdfFailReason = null;
    $pdfContent = generateExamResultPDF($examId, $patientId, $examType, $pdfFailReason);

    if ($pdfContent !== false) {
        $stem = pdf_mono_exam_filename_stem($examType, $examId);
        $filename = pdf_build_download_filename($pdo, $patientId, $stem);

        header('Content-Type: application/pdf');
        header('Content-Disposition: inline; filename="' . $filename . '"');
        header('Content-Length: ' . strlen($pdfContent));
        echo $pdfContent;
        exit;
    }
    header('Content-Type: application/json; charset=utf-8');
    if ($pdfFailReason === 'no_exam_row') {
        http_response_code(404);
        echo json_encode(['error' => 'Données d\'examen non trouvées', 'code' => 'no_exam_row']);
    } elseif ($pdfFailReason === 'no_pdf_method') {
        http_response_code(422);
        echo json_encode([
            'error' => 'Aucun modèle PDF pour ce type d\'examen. Vérifiez modal_type ou le paramètre type dans l\'URL.',
            'code' => 'no_pdf_method'
        ]);
    } else {
        http_response_code(500);
        $response = ['error' => 'Erreur lors de la génération du PDF', 'code' => $pdfFailReason ?: 'unknown'];
        if (isset($GLOBALS['lastPdfGenerationError']) && !empty($GLOBALS['lastPdfGenerationError'])) {
            $response['details'] = $GLOBALS['lastPdfGenerationError'];
        }
        echo json_encode($response);
    }
    exit;
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    global $pdo;
    // Traiter les données POST pour générer le PDF
    $input = json_decode(file_get_contents('php://input'), true);

    // Vérifier si c'est une requête multi-examen
    if (isset($input['exam_ids']) && isset($input['patient_id']) && is_array($input['exam_ids']) && !empty($input['exam_ids'])) {
        // Mode multi-examen consolidé
        $patientId = (int) $input['patient_id'];
        $examIds = array_filter(array_map('intval', $input['exam_ids']));

        if (!empty($examIds)) {
            $pdfContent = generateMultiExamPDF($patientId, $examIds);

            if ($pdfContent !== false) {
                $filename = pdf_build_download_filename($pdo, $patientId, 'examens_consolides');
                $examIdsEncoded = implode(',', array_map('urlencode', $examIds));
                $previewUrl = 'pdf_resultat.php?patient_id=' . urlencode($patientId) . '&exam_ids=' . $examIdsEncoded;

                echo json_encode([
                    'success' => true,
                    'pdf' => base64_encode($pdfContent),
                    'filename' => $filename,
                    'preview_url' => $previewUrl
                ]);
            } else {
                http_response_code(500);
                $errorMsg = 'Erreur lors de la génération du PDF consolidé';
                if (!empty($GLOBALS['lastPdfGenerationError'])) {
                    $errorMsg .= ' : ' . $GLOBALS['lastPdfGenerationError'];
                }
                $examIdsEncoded = isset($examIds) && is_array($examIds) ? implode(',', array_map('urlencode', $examIds)) : '';
                $previewUrl = 'pdf_resultat.php?patient_id=' . urlencode($patientId) . '&exam_ids=' . $examIdsEncoded;
                echo json_encode([
                    'error' => $errorMsg,
                    'details' => $GLOBALS['lastPdfGenerationError'] ?? null,
                    'preview_url' => $previewUrl
                ]);
            }
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Liste d\'examens invalide']);
        }

    } elseif (isset($input['exam_id']) && isset($input['patient_id'])) {
        // Mode mono-examen (comportement original)
        $examType = isset($input['type']) ? $input['type'] : null;
        $pdfContent = generateExamResultPDF($input['exam_id'], $input['patient_id'], $examType);

        if ($pdfContent !== false) {
            $stem = pdf_mono_exam_filename_stem($examType, (int) $input['exam_id']);
            $filename = pdf_build_download_filename($pdo, (int) $input['patient_id'], $stem);

            echo json_encode([
                'success' => true,
                'pdf' => base64_encode($pdfContent),
                'filename' => $filename
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Erreur lors de la génération du PDF']);
        }
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Paramètres manquants: exam_id et patient_id requis, ou exam_ids et patient_id pour PDF consolidé']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Méthode non autorisée']);
}
?>
