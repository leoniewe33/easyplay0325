
/*document.getElementById('changeUsernameButton').addEventListener('click', async function() {
    console.log("Namen Änderungs Button Klick funktioniert!");
    const newUsername = document.getElementById('newUsername').value;
    const userId = document.getElementById('userId').value;

    if (!newUsername || !userId) {
        alert("Bitte gib einen neuen Benutzernamen ein.");
        return;
    }

    try {
        const response = await fetch('http://localhost:10045/changeUsername', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: userId,
                newUsername: newUsername,
            }),
        });

        const result = await response.json();
        if (result.status === "SUCCESS") {
            alert("Benutzername erfolgreich geändert!");
            // Aktualisiere die Anzeige des Benutzernamens auf der Seite
            document.getElementById("HelloText").innerText = newUsername;
        } else {
            alert("Fehler: " + result.message);
        }
    } catch (err) {
        console.error("Fehler beim Ändern des Benutzernamens:", err);
        alert("Es gab ein Problem beim Ändern des Benutzernamens.");
    }
});


*/
document.addEventListener("DOMContentLoaded", function () {
    const button = document.getElementById("changeUsernameButton");

    if (button) {
        button.addEventListener("click", async function () {
            console.log("Button wurde geklickt!");

            const userId = document.getElementById("userId").value; // Die ID des Users
            const newUsername = document.getElementById("newUsername").value; // Der neue Name

            if (!userId || !newUsername) {
                console.error("Benutzer-ID oder neuer Benutzername fehlt!");
                return;
            }

            try {
                const response = await fetch("http://localhost:10045/changeUsername", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        userId: userId, 
                        newUsername: newUsername
                    }),
                });

                const data = await response.json();
                console.log("Antwort vom Server:", data);

                if (response.ok) {
                    alert("Benutzername erfolgreich geändert!");
                } else {
                    alert("Fehler: " + data.error);
                }
            } catch (error) {
                console.error("Fehler beim Senden der Anfrage:", error);
            }
        });
    } else {
        console.error("Button nicht gefunden!");
    }
});
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
});
