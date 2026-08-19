-- Alertes stock / péremption (notifications admin + pharmacie).
ALTER TYPE "TypeNotification" ADD VALUE IF NOT EXISTS 'STOCK_FAIBLE';
ALTER TYPE "TypeNotification" ADD VALUE IF NOT EXISTS 'STOCK_EPUISE';
ALTER TYPE "TypeNotification" ADD VALUE IF NOT EXISTS 'MEDICAMENT_EXPIRATION';
