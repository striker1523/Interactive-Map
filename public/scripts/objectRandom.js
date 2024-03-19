// Funkcja do wyświetlania losowego obiektu w polu informacyjnym
function showRandomObject(){
    fetch(`api/randomobject`, {
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
        const userID = document.getElementById('user-id').value;
        const { object_id, image, name, religion, 
            type, era, year, prefecture, description } = data;
        const objectIdHidden = document.getElementById('obj-id');
        objectIdHidden.value = object_id;
        const objectImage = document.querySelector('.object-img');
        objectImage.src = image;
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
 
        readDeities(object_id);
        readComments(object_id);
        readRatings(object_id);
        readIfRatingIsAdded(userID, object_id)
        .then(data => {
            const stars = document.querySelectorAll('.all-stars img');

            var rating = data[0].rating;
            handleRating(stars, userID, object_id, rating);
        })
        .catch(error => {
            const stars = document.querySelectorAll('.all-stars img');

            var rating = 0;
            handleRating(stars, userID, object_id, rating);
        });
        
    })
    .catch(error => console.error(error));
}
