import { useEffect, useRef } from "react";
import toast from "react-hot-toast";

export function WhatsappPolling() {
  const lastCheckRef = useRef<string | null>(null);

  useEffect(() => {
    // If we have not initialized the last check, use current UTC time
    if (!lastCheckRef.current) {
        lastCheckRef.current = new Date().toISOString().replace('T', ' ').substring(0, 19);
    }

    const interval = setInterval(async () => {
      try {
        const url = `/api/cobranzas/logs/recientes?last_check=${encodeURIComponent(lastCheckRef.current || '')}`;
        const res = await fetch(url);
        
        if (res.ok) {
          const logs = await res.json();
          if (logs.length > 0) {
            // Update last_check to the created_at of the most recent log
            const newest = logs[logs.length - 1];
            lastCheckRef.current = newest.created_at;

            // Show toasts for each log
            logs.forEach((log: any) => {
              if (log.estado === 'Enviado') {
                toast.success(`WhatsApp enviado a ${log.nombre_miembro || 'Miembro #' + log.miembro_id}`);
              } else {
                toast.error(`Fallo WhatsApp a ${log.nombre_miembro || 'Miembro #' + log.miembro_id}`);
              }
            });
          }
        }
      } catch (e) {
        // Silently fail to not interrupt user if internet drops momentarily
      }
    }, 15000); // Check every 15 seconds

    return () => clearInterval(interval);
  }, []);

  return null; // Invisible component
}
