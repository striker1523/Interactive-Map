const trashcanIMG = document.querySelector('.delete-rating');

function handleRating(stars, userID, object_id, rating){
    const labelID = document.getElementById('user-rating-label-id');

    readRatings(object_id);
    const setStars = (x) => {
        stars.forEach((star, i) => {
            star.src = i < x ? "/assets/img/star.png" : "/assets/img/empty_star.png";
        });
    };

    if (rating === 0){
        labelID.textContent = 'Add rating:';
        setStars(0)
        stars.forEach(star => {
            const filler = parseInt(star.dataset.rating);
            star.addEventListener('click', clickHandler, true);
            star.addEventListener('mouseover', () => setStars(filler));
            star.addEventListener('mouseleave', () => setStars(rating));
        });
        trashcanIMG.style.display = 'none';
    }else{
        labelID.textContent = 'Change rating:';
        setStars(rating)
        stars.forEach(star => {
            const filler = parseInt(star.dataset.rating);
            star.addEventListener('click', clickHandler, true);
            star.addEventListener('mouseover', () => setStars(filler));
            star.addEventListener('mouseleave', () => setStars(rating));
        });
        trashcanIMG.style.display = 'block';
    }
}
// Funkcja pomocnicza do listenera zmiany/dodania ratingu
var clickHandler = function(event) {
    const stars = document.querySelectorAll('.all-stars img');
    const objectID = document.getElementById('obj-id').value;
    const userID = document.getElementById('user-id').value;
    const type = document.querySelector('.user-rating-label').textContent;
    if (type === "Add rating:"){
        stars.forEach(star => { // Usuwanie starych listenerów
            star.removeEventListener('click', clickHandler, true);
        });
        addRating(objectID, userID, event.target.dataset.rating);
        handleRating(stars, userID, objectID, event.target.dataset.rating)
    }else{
        stars.forEach(star => { // Usuwanie starych listenerów
            star.removeEventListener('click', clickHandler, true);
        });
        updateRating(objectID, userID, event.target.dataset.rating);
        handleRating(stars, userID, objectID, event.target.dataset.rating)
    }
}

// Dodaj ocenę
function addRating(oID, uID, rating) {
    fetch('/api/addrating', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            oID: oID,
            uID: uID,
            oRating: rating
        }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
    })
    .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
    });
}

// Zmień ocenę
function updateRating(oID, uID, rating) {
    fetch('/api/updaterating', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            oID: oID,
            uID: uID,
            oRating: rating
        }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
    })
    .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
    });
}

// Usuwanie oceny
trashcanIMG.addEventListener('click', function() {
    const s = document.querySelectorAll('.all-stars img');
    const oID = document.getElementById('obj-id').value;
    const uID = document.getElementById('user-id').value;
        fetch('/api/delete/rating', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                oID: oID,
                uID: uID
            }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log("Deleted rating")
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });
    handleRating(s, uID, oID, 0)
});