// Code changes to enable manual editing of the rota
// Users can now edit the rota without validation against existing rules

function enableManualEditing() {
    // Logic for enabling manual editing
    const rota = getRota(); // Assuming a function to get the current rota
    // Allow users to edit the rota
    document.getElementById('rota-editor').value = rota;
    // Add event listener for saving changes
    document.getElementById('save-button').addEventListener('click', () => {
        const editedRota = document.getElementById('rota-editor').value;
        saveRota(editedRota); // Function to save the edited rota
    });
}