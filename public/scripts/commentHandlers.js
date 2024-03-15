function deleteComment(cID, uID, oID){
    console.log(cID +' '+ uID +' '+ oID);
    fetch('/api/delete/comment', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            cID: cID,
            uID: uID,
            oID: oID
        }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log("Deleted comment")
    })
    .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
    });
    readComments(oID);
}

function modifyComment(cID, uID, oID, oldContent){
    var addButton = document.getElementById('submit-new-comment-id');
    addButton.style.display = 'none';
    var modifyButton = document.getElementById('submit-modified-comment-id');
    modifyButton.style.display = 'block';
    var cancelButton = document.getElementById('cancel-modified-comment-id');
    cancelButton.style.display = 'block';
    var textArea = document.getElementById('add-comment-content-id');
    textArea.value = oldContent;
    console.log(cID +' '+ uID +' '+ oID +' '+ oldContent +' '+ textArea.value.trim())
    modifyButton.addEventListener('click', function() {
        console.log(textArea.value.trim());
    fetch('/api/update/comment', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                cContent: textArea.value.trim(),
                cID: cID,
                uID: uID,
                oID: oID
            }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log("Updated comment")
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });
        readComments(oID);
        textArea.value = '';
        addButton.style.display = 'block';
        modifyButton.style.display = 'none';
        cancelButton.style.display = 'none';
        cancelButton.replaceWith(cancelButton.cloneNode(true)); // Zapobieganie dodawaniu listenera przy kliknięciu drugiego przycisku
    }, { once: true });
    cancelButton.addEventListener('click', function() {
        textArea.value = '';
        addButton.style.display = 'block';
        modifyButton.style.display = 'none';
        cancelButton.style.display = 'none';
        modifyButton.replaceWith(modifyButton.cloneNode(true)); // Zapobieganie dodawaniu listenera przy kliknięciu drugiego przycisku
    }, { once: true });
}