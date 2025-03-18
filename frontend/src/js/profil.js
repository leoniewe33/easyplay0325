
document.getElementById("changeUsernameButton").addEventListener("click", async () => {
    const newUsername = document.getElementById("newUsername").value.trim();

    if (!newUsername) {
        console.log("Bitte einen neuen Benutzernamen eingeben.");
        return;
    }

    console.log("Gesendete Daten:", { newUsername });

    const response = await fetch("http://localhost:10045/user/username", {  // Falls dein Backend PUT erwartet
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newUsername }),
        credentials: "include"  // Wichtig, falls deine Session-Cookies mitgesendet werden müssen
    });

    const result = await response.json();
    console.log("Antwort vom Server:", result);
    window.location.reload();
});

document.getElementById("changePasswortButton").addEventListener("click", async () => {
    const newPassword = document.getElementById("newPasswort").value.trim();
    
    const response = await fetch("http://localhost:10045/user/password", {  // Falls dein Backend PUT erwartet
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newUsername }),
        credentials: "include"  // Wichtig, falls deine Session-Cookies mitgesendet werden müssen
    });

    const result = await response.json();
    console.log("Antwort vom Server:", result);
})


document.getElementById("deleteAccountButton").addEventListener("click", async () => {
    const confirmation = confirm("Möchtest du deinen Account wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.");

    if (!confirmation) {
        return;
    }

    try {
        const response = await fetch("http://localhost:10045/user/delete", {
            method: "DELETE",
            credentials: "include"  // Wichtig, um Session-Daten zu senden
        });

        const result = await response.json();

        if (response.ok) {
            // Erfolgsmeldung
            alert(result.message);
            // Benutzer zur Login-Seite weiterleiten oder zur Startseite
            window.location.href = "/login.html";  // Beispiel: Login-Seite
        } else {
            // Fehler anzeigen
            alert("Fehler beim Löschen des Accounts: " + result.message);
        }
    } catch (error) {
        console.error("Fehler beim Löschen des Accounts:", error);
        alert("Es gab ein Problem beim Löschen des Accounts. Bitte versuche es später noch einmal.");
    }
});
