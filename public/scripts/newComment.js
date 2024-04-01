function handleCommentButton(textarea, submitButton, modifyButton){
    if (textarea.value.trim() === '') submitButton.disabled = true;
    textarea.addEventListener('input', function () {
        if (textarea.value.trim() !== '') {
            submitButton.disabled = false;
        } else {
            submitButton.disabled = true;
        }
    });
}

function getCurrentDate() {
    var today = new Date();
    var year = today.getFullYear();
    var month = ('0' + (today.getMonth() + 1)).slice(-2);
    var day = ('0' + today.getDate()).slice(-2);
    return year + '-' + month + '-' + day;
}

document.addEventListener('DOMContentLoaded', function () {
    function addUserComment(){
    const textarea = document.getElementById('add-comment-content-id');
    const submitButton = document.getElementById('submit-new-comment-id');
    const form = document.getElementById('add-comment-form-id');
    handleCommentButton(textarea, submitButton)
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        var objectID = document.getElementById('obj-id').value;
        var commentData = {
            uID: document.getElementById('user-id').value,
            oID: objectID,
            cContent: textarea.value.trim(),
            cDate: getCurrentDate()
        };
        fetch('/api/addcoment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(commentData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Response from server:', data);
        })
        .catch(error => {
            console.error('Error adding comment:', error);
        });
        textarea.value = '';
        submitButton.disabled = true;
        readComments(objectID);
    });
    }
    addUserComment();
});