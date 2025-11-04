// Assuming Firebase dependencies (db, ref, push, onChildAdded, update, remove) are correctly imported.

// ✅ Send Message Function - CORRECTED
window.sendMessage = function () {
    // Check if the username field exists (important for robust code)
    const usernameInput = document.getElementById("user-name");
    
    if (!usernameInput) {
        alert("The username input field is missing from the HTML!");
        return;
    }

    const username = usernameInput.value.trim();
    const message = document.getElementById("message").value.trim();

    if (!username || !message) {
        alert("Please enter both name and message!");
        return;
    }

    // ✅ Push message to Firebase - 'name' property is now included
    push(ref(db, "messages"), {
        name: username, // 🌟 FIXED: Now sending the user's name
        text: message,
        time: new Date().toLocaleTimeString()
    });

    document.getElementById("message").value = "";
};

// ✅ Listen for new messages
const messageBox = document.getElementById("messages");
const messagesRef = ref(db, "messages");

onChildAdded(messagesRef, (snapshot) => {
    const data = snapshot.val();
    const messageId = snapshot.key; // unique Firebase key

    // Create message div
    const msg = document.createElement("div");
    msg.className = "msg";
    msg.setAttribute("data-id", messageId);
    msg.style.padding = "10px";
    msg.style.margin = "6px";
    msg.style.borderRadius = "10px";
    msg.style.background = "rgba(255,255,255,0.1)";
    msg.style.animation = "fadeIn 0.3s ease";

    // Inner message content
    // This part correctly uses data.name, which is now being saved above.
    const msgText = document.createElement("div");
    msgText.innerHTML = `<strong>${data.name}:</strong> <span class="msg-text">${data.text}</span> 
        <small style="opacity:0.6">${data.time}</small>`;

    // ✅ Buttons container
    const btnGroup = document.createElement("div");
    btnGroup.style.display = "inline-flex";
    btnGroup.style.gap = "6px";
    btnGroup.style.marginLeft = "10px";

    // ✏️ Edit button
    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️";
    editBtn.title = "Edit Message";
    editBtn.style.border = "none";
    editBtn.style.background = "transparent";
    editBtn.style.cursor = "pointer";

    editBtn.addEventListener("click", () => {
        const newText = prompt("Edit your message:", data.text);
        if (newText && newText.trim() !== "") {
            update(ref(db, "messages/" + messageId), {
                text: newText.trim()
            });
            msg.querySelector(".msg-text").textContent = newText.trim();
        }
    });

    // ❌ Delete button
    const delBtn = document.createElement("button");
    delBtn.textContent = "❌";
    delBtn.title = "Delete Message";
    delBtn.style.border = "none";
    delBtn.style.background = "transparent";
    delBtn.style.cursor = "pointer";

    delBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to delete this message?")) {
            remove(ref(db, "messages/" + messageId))
                .then(() => msg.remove())
                .catch((err) => alert("Error deleting: " + err.message));
        }
    });

    // Add buttons to container
    btnGroup.appendChild(editBtn);
    btnGroup.appendChild(delBtn);

    // Append message and buttons
    msg.appendChild(msgText);
    msg.appendChild(btnGroup);
    messageBox.appendChild(msg);

    messageBox.scrollTop = messageBox.scrollHeight;
});


// ---------------- Active Users ---------------- (No changes needed here for message sending fix)
const usersRef = ref(db, "users");
const usersListDiv = document.getElementById("users-list"); // Assuming this div exists somewhere

let currentUserKey = null; // track current user's key

// Add user function
function addUser(name, profile) {
    if (!currentUserKey) {
        const key = push(usersRef, { name, profile }).key;
        currentUserKey = key;
        return key;
    }
}

// Remove user function
function removeUser(userKey) {
    remove(ref(db, "users/" + userKey));
}

// Listen for added users
onChildAdded(usersRef, (snapshot) => {
    const data = snapshot.val();
    const key = snapshot.key;

    const div = document.createElement("div");
    div.className = "user-item";
    div.id = "user-" + key;
    div.innerHTML = `
        <img src="${data.profile}" alt="Profile">
        <span>${data.name}</span>
        <button onclick="removeUser('${key}')">❌</button>
    `;
    // Only append if the usersListDiv exists
    if (usersListDiv) {
        usersListDiv.appendChild(div);
    }
});

// Listen for removed users
onChildRemoved(usersRef, (snapshot) => {
    const key = snapshot.key;
    const div = document.getElementById("user-" + key);
    if (div) div.remove();
});