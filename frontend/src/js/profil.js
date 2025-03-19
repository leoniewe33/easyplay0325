
document.getElementById("changeUsernameButton").addEventListener("click", async () => {
  const newUsername = document.getElementById("newUsername").value.trim();

  if (!newUsername) {
      console.log("Bitte einen neuen Benutzernamen eingeben.");
      alert("Bitte einen neuen Benutzernamen eingeben.");
      return;
  }

  console.log("Gesendete Daten:", { newUsername });

  try {
      const response = await fetch("http://webengineering.ins.hs-anhalt.de:10045/user/username", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newUsername }),
          credentials: "include"
      });

      const result = await response.json();
      console.log("Antwort vom Server:", result);

      if (!response.ok) {
          // Handle the error if username already exists
          alert(result.message || "Fehler beim Ändern des Benutzernamens.");
      } else {
          alert(result.message); // Success message
          window.location.reload(); // Reload the page to reflect the changes
      }

  } catch (error) {
      console.error("Fehler beim Ändern des Benutzernamens:", error);
      alert("Es gab einen Fehler beim Ändern des Benutzernamens.");
  }
});


document.getElementById("changePasswortButton").addEventListener("click", async () => {
    const newPassword = document.getElementById("newPasswort").value.trim();

    if (!newPassword) {
        alert("Bitte ein neues Passwort eingeben.");
        return;
    }

    console.log("Gesendete Daten:", { newPassword });

    const response = await fetch("http://webengineering.ins.hs-anhalt.de:10045/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
        credentials: "include" // Falls die Route geschützt ist
    });

    const result = await response.json();
    console.log("Antwort vom Server:", result);

    if (response.ok) {
        alert("Passwort erfolgreich geändert!");
        window.location.reload();
    } else {
        alert("Fehler: " + result.message);
    }
});



document.getElementById("deleteAccountButton").addEventListener("click", async () => {
  if (!confirm("Account wirklich löschen?\nDiese Aktion ist unwiderruflich!")) return;

  try {
    const response = await fetch("http://webengineering.ins.hs-anhalt.de:10045/user/delete", {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest"
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Löschen fehlgeschlagen');
    }
    localStorage.clear();
    sessionStorage.clear();
    setTimeout(() => {
      window.location.href = `/index.html?deleted=${Date.now()}`;
    }, 300);

  } catch (error) {
    console.error('Fehler:', error);
    alert(`Fehler: ${error.message}`);
    window.location.reload();
  }
});