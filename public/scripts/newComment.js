document.addEventListener('DOMContentLoaded', function () {
    function getCurrentDate() {
        var today = new Date();
        var year = today.getFullYear();
        var month = ('0' + (today.getMonth() + 1)).slice(-2);
        var day = ('0' + today.getDate()).slice(-2);
        return year + '-' + month + '-' + day;
    }

    var textarea = document.getElementById('add-comment-content-id');
    var submitButton = document.getElementById('submit-new-comment-id');
    var modifyButton = document.getElementById('submit-modified-comment-id');
    var form = document.getElementById('add-comment-form-id');

    if (textarea.value.trim() === '') submitButton.disabled = true;
    textarea.addEventListener('input', function () {
        if (textarea.value.trim() !== '') {
            submitButton.disabled = false;
            modifyButton.disabled = false;
        } else {
            submitButton.disabled = true;
            modifyButton.disabled = true;
        }
    });

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        var userID = document.getElementById('user-id').value;
        var objectID = document.getElementById('obj-id').value;
        var comment = textarea.value.trim();
        var currentDate = getCurrentDate();
        

        var commentData = {
            uID: userID,
            oID: objectID,
            cContent: comment,
            cDate: currentDate
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
});