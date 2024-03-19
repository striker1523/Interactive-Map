window.addEventListener('load', () => {

    // Przycisk panelu admina
    const userType = document.getElementById('user-type').value;
    const abutt = document.querySelector('.admin-panel');
    if (userType === '1'){
        abutt.style.display = 'block';
        abutt.addEventListener("click", function() {
            window.location.href = "/admin";
          });
    }

    // Zmiana hasła
    const change_password = document.querySelector('.change-password');
    const divbox = document.querySelector('.Activity-box');
    change_password.addEventListener("click", function() {
        const activitylabel = document.querySelector('.activity-title');
        divbox.innerHTML = '';
        activitylabel.style.display='none';

        var form = document.createElement('div');
        form.innerHTML = `
            <label for="old_password">Old Password:</label><br>
            <input type="password" id="old_password" name="old_password"><br><br>
            <label for="new_password">New Password:</label><br>
            <input type="password" id="new_password" name="new_password"><br><br>
            <span id="comm"></span><br><br>
            <button id="submit_password" class="submit-password">Submit</button>
            <button id="cancel_password" class="submit-password">Cancel</button>
        `;
        form.className="change-password-form";
        divbox.appendChild(form);
        document.getElementById('submit_password').addEventListener('click', function() {
            var email = document.getElementById('user-email').value;
            var oldPassword = document.getElementById('old_password').value;
            var newPassword = document.getElementById('new_password').value;

            fetch(`api/profile/passwordmatch/${email}/${oldPassword}`, {
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
                var spanlog = document.getElementById('comm');
                if(data.match && newPassword != ''){

                    fetch(`/api/profile/updatepassword/${email}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ password: newPassword }),
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.json();
                    })
                    .then(data => {
                        console.log(data);
                    })
                    .catch(error => {
                        console.error('There has been a problem with your fetch operation:', error);
                    });

                    divbox.innerHTML = '';
                    activitylabel.style.display='block';
                    LoadProfile();
                }else if(!data.match){
                    console.log("Passwords don't match")
                    spanlog.textContent = "Passwords don't match!"
                }else{
                    console.log("Error.")
                    spanlog.textContent = "Type new password"
                }
            })
            .catch(error => {
                console.error('There has been a problem with your fetch operation:', error);
            });
        });
        document.getElementById('cancel_password').addEventListener('click', function() {
            divbox.innerHTML = '';
            activitylabel.style.display='block';
            LoadProfile();
        });

      });

      //Ładowanie danych profilu
    function LoadProfile(){
        const userID = document.getElementById('user-id').value;
        const userNAME = document.getElementById('user-name').value;
        divbox.innerHTML = '';
        fetch(`api/profile/object/comments/${userID}`, {
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
            let previousObjectId = null;
            data.forEach(e =>{
                const { object_id, name, image, description } = e;
                const activitybox = document.createElement('div');
                activitybox.className = `activity`;
                //Obrazek
                const objimg = document.createElement('img');
                objimg.className = 'profile-object-img';
                objimg.src = image;
        
                //Nazwa i opis
                const descriptionbox = document.createElement('div');
                descriptionbox.className = "profile-object-description";
                const namespan = document.createElement('span');
                namespan.className = "profile-object-name";
                namespan.textContent = name;
                const descspan = document.createElement('span');
                descspan.className = "profile-object-desc";
                descspan.textContent = description;
        
                //Oceny
                const ratingbox = document.createElement('div');
                ratingbox.className = `profile-object-ratings`;
                ratingbox.id = `profile-object-ratings ${object_id}`
    
                const aratingspan = document.createElement('span');
                aratingspan.className = "profile-object-name";
                aratingspan.textContent = "Average rating: ";
                const astarsbox = document.createElement('div');
                astarsbox.className = "stars";
                const astar1 = document.createElement('img');
                astar1.className = "star first";
                astar1.src = "/assets/img/empty_star.png"
                const astar2 = document.createElement('img');
                astar2.className = "star second";
                astar2.src = "/assets/img/empty_star.png"
                const astar3 = document.createElement('img');
                astar3.className = "star third";
                astar3.src = "/assets/img/empty_star.png"
                const astar4 = document.createElement('img');
                astar4.className = "star fourth";
                astar4.src = "/assets/img/empty_star.png"
                const astar5 = document.createElement('img');
                astar5.className = "star fifth";
                astar5.src = "/assets/img/empty_star.png"
    
    
                const uratingspan = document.createElement('span');
                uratingspan.className = "profile-object-name";
                uratingspan.textContent = "Your rating: ";
                const ustarscontainer = document.createElement('div');
                ustarscontainer.className = "user-rating";
                const utrashcan = document.createElement('img');
                utrashcan.className = "delete-rating";
                utrashcan.src = "assets/img/trashcan.png";
                const ustarsbox = document.createElement('div');
                ustarsbox.className = "all-stars";
                ustarsbox.id = `all-stars-id ${object_id}`;
                const ustar1 = document.createElement('img');
                ustar1.className = "ustar first";
                ustar1.id = `${object_id}`;
                ustar1.src = "/assets/img/empty_star.png"
                ustar1.setAttribute('data-rating', '1');
                const ustar2 = document.createElement('img');
                ustar2.className = "ustar second";
                ustar2.id = `${object_id}`;
                ustar2.src = "/assets/img/empty_star.png"
                ustar2.setAttribute('data-rating', '2');
                const ustar3 = document.createElement('img');
                ustar3.className = "ustar third";
                ustar3.id = `${object_id}`;
                ustar3.src = "/assets/img/empty_star.png"
                ustar3.setAttribute('data-rating', '3');
                const ustar4 = document.createElement('img');
                ustar4.className = "ustar fourth";
                ustar4.id = `${object_id}`;
                ustar4.src = "/assets/img/empty_star.png"
                ustar4.setAttribute('data-rating', '4');
                const ustar5 = document.createElement('img');
                ustar5.className = "ustar fifth";
                ustar5.id = `${object_id}`;
                ustar5.src = "/assets/img/empty_star.png"
                ustar5.setAttribute('data-rating', '5');
                const iflabel = document.createElement('a');
                iflabel.id = `user-rating-profile ${object_id}`;
                iflabel.style.display = 'none';
                iflabel.textContent = 'Add rating:';
    
                //DODANIE
                activitybox.appendChild(objimg);
    
                descriptionbox.appendChild(namespan);
                descriptionbox.appendChild(descspan);
                activitybox.appendChild(descriptionbox);
    
                astarsbox.appendChild(astar1);
                astarsbox.appendChild(astar2);
                astarsbox.appendChild(astar3);
                astarsbox.appendChild(astar4);
                astarsbox.appendChild(astar5);
                ustarsbox.appendChild(ustar1);
                ustarsbox.appendChild(ustar2);
                ustarsbox.appendChild(ustar3);
                ustarsbox.appendChild(ustar4);
                ustarsbox.appendChild(ustar5);
                ustarscontainer.appendChild(ustarsbox);
                ustarscontainer.appendChild(utrashcan);
                ustarscontainer.appendChild(iflabel);
                ratingbox.appendChild(aratingspan);
                ratingbox.appendChild(astarsbox);
                ratingbox.appendChild(uratingspan);
                ratingbox.appendChild(ustarscontainer);
                activitybox.appendChild(ratingbox);
    
                //Komentarze
                const commentsbox = document.createElement('div');
                commentsbox.className = "profile-object-comments";
                const listul = document.createElement('ul');
                listul.id = `comment-ul ${object_id}`;
                fetch(`api/profile/comments/${userID}/${object_id}`, {
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
                    const listForComments = document.getElementById(`comment-ul ${object_id}`)
                    data.forEach(x =>{
                        const { comment_id, user_id, content, date } = x;
                        const listItem = document.createElement('li');
                        const commentbox = document.createElement('div');
                        const span_name = document.createElement('span');
                        const span_date = document.createElement('span');
                        const brl = document.createElement('br');
                        const br2 = document.createElement('br');
                        const span_content = document.createElement('span');
                        listItem.id = `comment-li ${comment_id}`
                        commentbox.className = 'comment-box';
                        span_name.className = 'comment-name';
                        span_date.className = 'comment-date';
                        span_content.className = 'comment-content';
            
                        span_name.textContent = `${userNAME}`;
                        span_date.textContent = `${date}`;
                        span_content.textContent = `${content}`;
    
                        commentbox.appendChild(span_name);
                        commentbox.appendChild(span_date);
                        commentbox.appendChild(brl);
                        commentbox.appendChild(br2);
    
                        // Delete
                        const trashcanIMGforComments = document.createElement('img');
                        trashcanIMGforComments.src = 'assets/img/trashcan.png';
                        trashcanIMGforComments.className = 'delete-comment';
                        var deleteCommentHandler = function(event) {
                            deleteProfileComment(comment_id, user_id, object_id);
                        }
                        trashcanIMGforComments.addEventListener('click', deleteCommentHandler, true);
                        commentbox.appendChild(trashcanIMGforComments)
                        
        
                        // Modify
                        const modifyIMGforComments = document.createElement('img');
                        modifyIMGforComments.src = 'assets/img/edit.png';
                        modifyIMGforComments.className = 'edit-comment';
                        var modifyCommentHandler = function(event) {
                            modifyProfileComment(comment_id, user_id, object_id);
                        }
                        modifyIMGforComments.addEventListener('click', modifyCommentHandler, true);
                        commentbox.appendChild(modifyIMGforComments)

                        // Accept
                        const acceptIMGforComments = document.createElement('img');
                        acceptIMGforComments.src = 'assets/img/accept.png';
                        acceptIMGforComments.className = 'accept-comment';
                        acceptIMGforComments.style.display = 'none';
                        commentbox.appendChild(acceptIMGforComments)
    

                        const tahidden = document.createElement('textarea');
                        tahidden.className = "add-comment-content-profile";
                        tahidden.id = "add-comment-content-id-profile";
                        tahidden.style.display = 'none';
                        tahidden.textContent = `${content}`;

                        commentbox.appendChild(tahidden);
                        commentbox.appendChild(span_content);
                        listItem.appendChild(commentbox);
                        listul.appendChild(listItem)
                    });
                    commentsbox.appendChild(listul);
                    activitybox.appendChild(commentsbox);

                    // Usuwanie oceny
                    utrashcan.addEventListener('click', function() {
                        var container = document.getElementById(`profile-object-ratings ${object_id}`);
                        const stars = container.querySelectorAll('.all-stars img');
                            fetch('/api/delete/rating', {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    oID: object_id,
                                    uID: userID
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
                                console.log(data);
                            })
                            .catch(error => {
                                console.error('There has been a problem with your fetch operation:', error);
                            });
                        handleRating(stars, userID, object_id, 0, utrashcan)
                    });
                })
                .catch(error => console.error(error));
                divbox.appendChild(activitybox);
                readProfileRatings(object_id);
                readIfRatingIsAdded(userID, object_id)
                .then(data => {
                    var container = document.getElementById(`profile-object-ratings ${object_id}`);
                    const stars = container.querySelectorAll('.all-stars img');

                    var rating = data[0].rating;
                    handleRating(stars, userID, object_id, rating, utrashcan);
                })
                .catch(error => {
                    var container = document.getElementById(`profile-object-ratings ${object_id}`);
                    const stars = container.querySelectorAll('.all-stars img');

                    var rating = 0;
                    handleRating(stars, userID, object_id, rating, utrashcan);
                });
            });
        })
        .catch(error => console.error(error));
    };
    LoadProfile();

    function deleteProfileComment(cID, uID, oID){
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

    }

    function modifyProfileComment(cID, uID, oID){
        var LI = document.getElementById(`comment-li ${cID}`);
        var modifyimage = LI.querySelector('.edit-comment');
        modifyimage.style.display = 'none';
        var acceptimage = LI.querySelector('.accept-comment');
        acceptimage.style.display = 'block';
        var spancontent = LI.querySelector('.comment-content');
        spancontent.style.display = 'none';
        var textArea = LI.querySelector('.add-comment-content-profile');
        textArea.style.display = 'block';

        acceptimage.addEventListener('click', function() {
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
            LoadProfile();
            modifyimage.style.display = 'block';
            acceptimage.style.display = 'none';
            spancontent.style.display = 'block';
            textArea.style.display = 'none';
            acceptimage.replaceWith(acceptimage.cloneNode(true)); // Zapobieganie dodawaniu listenera przy kliknięciu drugiego przycisku
        }, { once: true });
    }
    
    // Funkcja do uzupełniania oceny obiektu (zamiany gwiazdek)
    function updateProfileStars(averageRating, object_id) {
        var container = document.getElementById(`profile-object-ratings ${object_id}`);
        const stars = container.querySelectorAll('.stars img');
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
    function readProfileRatings(object_id){
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
                var container = document.getElementById(`profile-object-ratings ${object_id}`);
                const starsContainer = container.querySelector('.stars');

                starsContainer.addEventListener('mouseover', () => {
                    const ratingText = `Average rating: ${averageRating}`;
                    starsContainer.setAttribute('title', ratingText);
                });
                updateProfileStars(averageRating, object_id);
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
                reject(error);
            });
        });
    }

    function handleRating(stars, userID, object_id, rating, trashcan){
        const labelID = document.getElementById(`user-rating-profile ${object_id}`);

        readProfileRatings(object_id);
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
            trashcan.style.display = 'none';
        }else{
            labelID.textContent = 'Change rating:';
            setStars(rating)
            stars.forEach(star => {
                const filler = parseInt(star.dataset.rating);
                star.addEventListener('click', clickHandler, true);
                star.addEventListener('mouseover', () => setStars(filler));
                star.addEventListener('mouseleave', () => setStars(rating));
            });
            trashcan.style.display = 'block';
        }
    }
    // Funkcja pomocnicza do listenera zmiany/dodania ratingu
    var clickHandler = function(event) {
        var container = document.getElementById(`profile-object-ratings ${event.target.id}`);
        const type = document.getElementById(`user-rating-profile ${event.target.id}`);
        const stars = container.querySelectorAll('.all-stars img');
        const trashcan = container.querySelector('.delete-rating');
        const objectID = event.target.id;
        const userID = document.getElementById('user-id').value;
        if (type.textContent === "Add rating:"){
            stars.forEach(star => { // Usuwanie starych listenerów
                star.removeEventListener('click', clickHandler, true);
            });
            addRating(objectID, userID, event.target.dataset.rating);
            handleRating(stars, userID, objectID, event.target.dataset.rating, trashcan)
        }else{
            stars.forEach(star => { // Usuwanie starych listenerów
                star.removeEventListener('click', clickHandler, true);
            });
            updateRating(objectID, userID, event.target.dataset.rating);
            handleRating(stars, userID, objectID, event.target.dataset.rating, trashcan)
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
});