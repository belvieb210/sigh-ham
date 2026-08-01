/* Service worker — notifications push SIGH */
self.addEventListener("push", (event) => {
  let data = { titre: "SIGH", message: "", lien: null, notificationId: null };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    /* corps vide */
  }

  const options = {
    body: data.message,
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    tag: data.notificationId ?? "sigh-notification",
    renotify: true,
    data: { url: data.lien },
  };

  event.waitUntil(self.registration.showNotification(data.titre, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/sigh/reception/notifications";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ("focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
