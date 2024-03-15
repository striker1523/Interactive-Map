// Funkcja do uzupełniania pełnego opisu (bez komentarzy i bóstw)
function readObjectDescription(object_id){
    fetch(`api/objects/${object_id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) throw new Error('cojes5');
        return response.json();
    })
    .then(data => {
        replaceNullsWithDash(data);

        //Przypisanie danych z bazy
        const { object_id, image, name, religion, 
            type, era, year, prefecture, description } = data;
        const objectIdHidden = document.getElementById('obj-id');
        objectIdHidden.value = object_id;
        const objectNameLabel = document.querySelector('.obj-name');
        objectNameLabel.textContent = name;
        const objectDescLabel = document.querySelector('.object-desc');
        objectDescLabel.textContent = description;
        const objectDetTypelabel = document.querySelector('#type');
        objectDetTypelabel.innerHTML = '<b style="color:#f54b55;">Type: </b>' + type;
        const objectDetPrefLabel = document.querySelector('#prefecture');
        objectDetPrefLabel.innerHTML = '<b style="color:#f54b55;">Prefecture: </b>' + prefecture;
        const objectDetRelLabel = document.querySelector('#religion');
        objectDetRelLabel.innerHTML = '<b style="color:#f54b55;">Religion: </b>' + religion;
        const objectDetEraLabel = document.querySelector('#era');
        objectDetEraLabel.innerHTML = '<b style="color:#f54b55;">Era: </b>' + era;
        const objectDetYearLabel = document.querySelector('#year');
        objectDetYearLabel.innerHTML = '<b style="color:#f54b55;">Year: </b>' + year;

    })
    .catch(error => console.error(error));
}

// Funkcja do uzupełnienia komentarzy
function readComments(object_id){
    // Pobranie komentarzy
    fetch(`api/comments/${object_id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) throw new Error('cojes5');
        return response.json();
    })
    .then(comms => {
        const userID = document.getElementById('user-id').value;
        // Delete poprzednich
        const comment_list = document.getElementById(`comment-list`);
        while (comment_list.firstChild) {
            comment_list.removeChild(comment_list.firstChild);
        }
        comms.forEach(e => {
            const listItem = document.createElement('li');
            const divbox = document.createElement('div');
            const span_name = document.createElement('span');
            const span_date = document.createElement('span');
            const brl = document.createElement('br');
            const br2 = document.createElement('br');
            const span_content = document.createElement('span');
            listItem.id = 'comment-li'
            divbox.className = 'comment-box';
            span_name.className = 'comment-name';
            span_date.className = 'comment-date';
            span_content.className = 'comment-content';

            span_name.textContent = `${e.name}`;
            span_date.textContent = `${e.date}`;
            span_content.textContent = `${e.content}`;

            divbox.appendChild(span_name);
            divbox.appendChild(span_date);
            divbox.appendChild(brl);
            divbox.appendChild(br2);
            divbox.appendChild(span_content);
            if (e.user_id === Number(userID)){
                // Trash
                const trashcanIMGforComments = document.createElement('img');
                trashcanIMGforComments.src = 'assets/img/trashcan.png';
                trashcanIMGforComments.className = 'delete-comment';
                var deleteCommentHandler = function(event) {
                    deleteComment(e.comment_id, e.user_id, e.object_id);
                }
                trashcanIMGforComments.addEventListener('click', deleteCommentHandler, true);
                divbox.appendChild(trashcanIMGforComments)

                // Modify
                const modifyIMGforComments = document.createElement('img');
                modifyIMGforComments.src = 'assets/img/edit.png';
                modifyIMGforComments.className = 'edit-comment';
                var modifyCommentHandler = function(event) {
                    modifyComment(e.comment_id, e.user_id, e.object_id, span_content.textContent);
                }
                modifyIMGforComments.addEventListener('click', modifyCommentHandler, true);
                divbox.appendChild(modifyIMGforComments)
            }
            listItem.appendChild(divbox);
            comment_list.appendChild(listItem);
        });
    })
    .catch(error => console.error(error));    
}

//Funkcja do uzupełnienia bóstw obiektu
function readDeities(object_id){
    // Pobranie danych o bóstwach powiązanych z obiektem
    fetch(`api/objects/deities/${object_id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) throw new Error('cojes5');
        return response.json();
    })
    .then(deities => {
        replaceNullsWithDash(deities);

        // Delete poprzednich
        const deitiesList = document.getElementById('deities-list');
        while (deitiesList.firstChild) {
            deitiesList.removeChild(deitiesList.firstChild);
        }
        if (deities.length === 0){
            const listItem = document.createElement('li');
                listItem.textContent = `No supreme deities`;
                deitiesList.appendChild(listItem);
        }else{
            deities.forEach(deity => {
                const listItem = document.createElement('li');
                listItem.textContent = `${deity.name}`;
                deitiesList.appendChild(listItem);
            });
        }
    })
    .catch(error => console.error(error)); 
}

// Funkcja do uzupełniania oceny obiektu (zamiany gwiazdek)
function updateStars(averageRating) {
    const stars = document.querySelectorAll('.stars img');
    const filledStars = Math.floor(averageRating);
    const remainder = averageRating - filledStars;
    for (let i = 0; i < 5; i++){
        stars[i].src = "/assets/img/empty_star.png";
    }
    for (let i = 0; i < filledStars; i++) {
        stars[i].src = "/assets/img/star.png";
    }
    if (remainder > 0.49) {
        const nextStarIndex = filledStars;
        stars[nextStarIndex].src = "/assets/img/star.png";
    }
}
function readRatings(object_id){
    fetch(`/api/objects/ratings/average/${object_id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) throw new Error('cojes5');
            return response.json();
        })
        .then(data => {
            const averageRating = data[0].average_rating;
            const starsContainer = document.querySelector('.stars');

            starsContainer.addEventListener('mouseover', () => {
                const ratingText = `Average rating: ${averageRating}`;
                starsContainer.setAttribute('title', ratingText);
            });
            updateStars(averageRating);
        })
        .catch(error => console.error('Error:', error));
}

// Sprawdzanie czy obiekt został oceniony przez użytkownika
function readIfRatingIsAdded(userID, object_id){
    return new Promise((resolve, reject) => {
        fetch(`/api/rating/${userID}/${object_id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) throw new Error('Request failed');
            return response.json();
        })
        .then(data => {
            resolve(data); 
        })
        .catch(error => {
            console.error('Error:', error);
            reject(error);
        });
    });
}