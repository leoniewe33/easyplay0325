async function logoutUser() {
    try {
        await fetch("http://localhost:10042/logout", {
            credentials: "include"
        });
        document.cookie = "connect.sid=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT";
        location.reload();
    } catch (error) {
        console.error("Fehler beim Logout:", error);
    }
}
function addLogoutEventListener() {
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) logoutBtn.addEventListener("click", logoutUser);
    else console.error("Logout-Button nicht gefunden!");
}
const observer = new MutationObserver(()=>{
    if (document.getElementById("logoutBtn")) {
        addLogoutEventListener();
        observer.disconnect();
    }
});
observer.observe(document.body, {
    childList: true,
    subtree: true
});

//# sourceMappingURL=index.3bb0576c.js.map
