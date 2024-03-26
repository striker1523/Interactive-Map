$(function() {
    $(".route-box").sortable({
        cursor: "move",
        containment: "parent",
        stop: function(event, ui) {
            updateWaypoints();
        }
    });
    $(".route-box").disableSelection();

    function updateWaypoints() {
        waypointsTab.splice(0, waypointsTab.length);
        $(".route-item").each(function() {
            let location = $(this).find(".route-item-location").text();
            let coordinates = location.match(/-?\d+\.\d+/g);
            if (coordinates && coordinates.length === 2) {
                waypointsTab.push(L.latLng(parseFloat(coordinates[0]), parseFloat(coordinates[1])));
            }
        });
        console.log(waypointsTab);
        updateRoute(map);
    }
});

// Kasowanie całej trasy:
const deleteRoute = document.querySelector('.flush-route-box');
deleteRoute.addEventListener('click', function () {
    waypointsTab.splice(0, waypointsTab.length);
    updateRoute(map);
    updateItemsInRoute();
})

// dodanie całej trasy do bazy:
const addtodbRoute = document.querySelector('.addtodb-route-box');
addtodbRoute.addEventListener('click', function () {
    addtodbRoute.style.display = 'none';
    const where = document.querySelector('.map-section');

    const modal = document.createElement('div');
    const inputOfModal = document.createElement('div');
    inputOfModal.className = "column"
    const buttonsOfModal = document.createElement('div');
    buttonsOfModal.className = "row"

    modal.className = "routeNameModal"
    const nameInputLabel = document.createElement('label');
    nameInputLabel.textContent = "Name of your route: "
    const nameInput = document.createElement('input');
    nameInput.className = "routeNameInput"
    nameInput.placeholder = `ex. "My first route`

    const addButton = document.createElement('button');
    addButton.className = "modalButtons"
    addButton.textContent = "Add";
    addButton.addEventListener('click', function () {
        const userID = document.getElementById('user-id').value;
        if (nameInput.value !== ''){
            fetch('/api/addroute', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: nameInput.value,
                    uID: userID,
                }),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                fetch(`api/routename/${nameInput.value}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => {
                    if (!response.ok) throw new Error('cojes5');
                    return response.json();
                })
                .then(fetch_route => {
                    waypointsTab.forEach(wp => {
                        fetch(`api/routeobjectid/${wp.lat}/${wp.lng}`, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        })
                        .then(response => {
                            if (!response.ok) throw new Error('cojes5');
                            return response.json();
                        })
                        .then(fetch_objectID => {
                            fetch('/api/addrouteobject', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    rID: fetch_route.route_id,
                                    oID: fetch_objectID.object_id,
                                }),
                            })
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error('Network response was not ok');
                                }
                                return response.json();
                            })
                            .then(data => {
                                console.log('added');
                            })
                            .catch(error => {
                                console.error('There has been a problem with your fetch operation:', error);
                            });
                        })
                        .catch(error => console.error(error));
                    });// KONIEC PĘTLI
                })
                .catch(error => console.error(error));
            })
            .catch(error => {
                console.error('There has been a problem with your fetch operation:', error);
            });
            if (modal) {
                where.removeChild(modal);
                if (waypointsTab.length > 1){
                    addtodbRoute.style.display = 'block';
                }
            }
        }else{

        }
    });

    const cancelButton = document.createElement('button');
    cancelButton.className = "modalButtons"
    cancelButton.textContent = "Cancel";
    cancelButton.addEventListener('click', function () {
        if (modal) {
            where.removeChild(modal);
            if (waypointsTab.length > 1){
                addtodbRoute.style.display = 'block';
            }
        }
    });

    inputOfModal.appendChild(nameInputLabel);
    inputOfModal.appendChild(nameInput);
    modal.appendChild(inputOfModal);
    buttonsOfModal.appendChild(addButton);
    buttonsOfModal.appendChild(cancelButton);
    modal.appendChild(buttonsOfModal);

    where.appendChild(modal);
})

// Umożliwienie scrollowania bez użycia shifta
const scrollContainer = document.querySelector(".route-box");
scrollContainer.addEventListener("wheel", (evt) => {
    evt.preventDefault();
    scrollContainer.scrollLeft += evt.deltaY;
});

// Funkcja do tworzenia trasy na mapie
function updateRoute(map){
    if (routingControl){
        map.removeControl(routingControl);
    }
    routingControl = setTimeout(() => {
        routingControl = L.Routing.control({
            router: new L.Routing.osrmv1({
                language: 'en'
              }),
            formatter:  new L.Routing.Formatter({
                language: 'en'
            }),
            language: 'en',
            waypoints: waypointsTab,
            collapsible: true,
            createMarker: function() {},
            draggableWaypoints: false,
            fitSelectedRoutes: true,
            addWaypoints: false,
            routeWhileDragging: false,
            useZoomParameter: false,
            lineOptions: {
                addWaypoints: false,
                styles: [{ color: '#f54b55', weight: 3 }],
                language: 'en'
            },
        }).addTo(map);
    }, 750);
}

// Funkcja do tworzenia listy obiektów pod mapą
function updateItemsInRoute(objectID, objectName, objectType, objectLat, objectLong, map) {
    var routeBox = document.querySelector('.route-box');
    deleteRoute.style.display = 'block';
    addtodbRoute.style.display = 'block';
    if (waypointsTab.length === 1){
        routeBox.innerHTML = '';
        addtodbRoute.style.display = 'none';
        modalToRemove = document.querySelector('.routeNameModal')
    }
    if (waypointsTab.length === 2){
        addtodbRoute.style.display = 'block';
    }
    if (!waypointsTab.length){
        console.log("Waypoint list is empty.")
        routeBox.innerHTML = '';
        deleteRoute.style.display = 'none';
        addtodbRoute.style.display = 'none';
        displaySavedRoutes();
        displayUserRoutes();
    }else{
        const divbox = document.createElement('div');
        const imgBcg = document.createElement('img');
        const spanName = document.createElement('span');
        const imgTrash = document.createElement('img');
        const imgDetails = document.createElement('img');
        const location = document.createElement('span');
        location.innerHTML = `L.latLng(${objectLat}, ${objectLong})`;
        location.style.display = 'none';
        divbox.className = `route-item ${objectID}`;
        imgBcg.className = 'route-item-bcg';
        spanName.className = 'route-item-name';
        imgTrash.className = `route-item-trash  ${objectID}`;
        imgDetails.className = `route-item-details  ${objectID}`;
        location.className = `route-item-location`;

        imgTrash.addEventListener('click', function () {
            divbox.remove();
            waypointsTab.forEach((waypoint, index) => {
                if (waypoint.lat === objectLat && waypoint.lng === objectLong) {
                    waypointsTab.splice(index, 1);
                }
            });
            if (waypointsTab.length === 1){
                addtodbRoute.style.display = 'none';
            }
            console.log(waypointsTab);
            updateRoute(map)
            if(!waypointsTab.length){
                updateItemsInRoute(objectID, objectName, objectType, objectLat, objectLong, map)
            }
        });

        imgDetails.addEventListener('click', function () {
            const userID = document.getElementById('user-id').value;
            markers[objectID-1].openPopup();
            readObjectDescription(objectID);
            readDeities(objectID);
            readComments(objectID);
            readRatings(objectID);
            readIfRatingIsAdded(userID, objectID)
            .then(data => {
                const stars = document.querySelectorAll('.all-stars img');

                var rating = data[0].rating;
                handleRating(stars, userID, objectID, rating);
            })
            .catch(error => {
                console.error(error);
                const stars = document.querySelectorAll('.all-stars img');

                var rating = 0;
                handleRating(stars, userID, objectID, rating);
            });
        })

        let iconType;
        switch (objectType) {
            case 'Shrine':
                iconType = '../assets/img/icons/icon_shrine_bcg.png';
                break;
            case 'Castle':
                iconType = '../assets/img/icons/icon_castle_bcg.png';
                break;
            case 'Temple':
                iconType = '../assets/img/icons/icon_temple_bcg.png';
                break;
            case 'Mausoleum':
                iconType = '../assets/img/icons/icon_mausoleum_bcg.png';
                break;
            default:
                iconType = '../assets/img/placeholder.jpg';
        }

        imgBcg.src = iconType;
        imgTrash.src = '../assets/img/trashcan.png';
        imgDetails.src = '../assets/img/details.png';
        spanName.textContent = `${objectName}`;
        divbox.appendChild(imgBcg);
        divbox.appendChild(spanName);
        divbox.appendChild(location);
        divbox.appendChild(imgDetails);
        divbox.appendChild(imgTrash);
        routeBox.appendChild(divbox);
    }
}

// Funkcja do wyświetlenia zapisanych tras
function displaySavedRoutes(){
    var routeBox = document.querySelector('.route-box');
    const allRoutes = []
    const routeNames = [
        "Amaterasu shrines",
        "Hachiman shrines",
        "Ōkuninushi shrines",
        "Susanoo shrines",
        "Izanagi shrines",
    ]
    const deityIDs = [
        1, 4, 8, 13, 20
    ]
    var index = 0;
    deityIDs.forEach(e => {
        fetch(`api/route/objects/${e}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Request failed');
            }
            return response.json();
        })
        .then(data => {
            var route = []
            data.forEach(e => {
                route.push(L.latLng(e.Latitude, e.Longitude));
            });
            allRoutes.push(route);
            const divbox = document.createElement('div');
            const imgBcg = document.createElement('img');
            const spanName = document.createElement('span');
            const imgRoute = document.createElement('img');

            divbox.className = `route-item`;
            imgBcg.className = 'route-item-bcg';
            spanName.className = 'route-item-name';
            imgRoute.className = `route-item-trash`;

            imgRoute.addEventListener('click', function () {
                routeBox.innerHTML = '';
                waypointsTab.splice(0, waypointsTab.length);
                waypointsTab = route;
                updateRoute(map);
                data.forEach(e => {
                    updateItemsInRoute(e.object_id, e.name, e.type, e.Latitude, e.Longitude, map);
                })
                console.log(waypointsTab);
            });

            imgBcg.src = '../assets/img/route.png'
            imgRoute.src = '../assets/img/japan.png'
            spanName.textContent = routeNames[index];
            divbox.appendChild(imgBcg);
            divbox.appendChild(spanName);
            divbox.appendChild(imgRoute);
            routeBox.appendChild(divbox);
            index +=1;
        })
        .catch(error => {
            console.error(error);
        });
    });
}

// Funkcja do wyświetlenia tras użytkowników z bazy
function displayUserRoutes(){
    var routeBox = document.querySelector('.route-box');
    const userID = document.getElementById('user-id').value;
    fetch(`api/userroutes/${userID}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) throw new Error('cojes5');
        return response.json();
    })
    .then(userRoutes => {
        userRoutes.forEach(data => {
            fetch(`api/routecoordinates/${data.route_id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Request failed');
                }
                return response.json();
            })
            .then(data => {
                console.log(data);
                var route = []
                data.forEach(e => {
                    route.push(L.latLng(e.Latitude, e.Longitude));
                });
                const divbox = document.createElement('div');
                const imgBcg = document.createElement('img');
                const spanName = document.createElement('span');
                const imgRoute = document.createElement('img');
    
                divbox.className = `route-item`;
                imgBcg.className = 'route-item-bcg';
                spanName.className = 'route-item-name user-route-span';
                imgRoute.className = `route-item-trash`;
    
                imgRoute.addEventListener('click', function () {
                    routeBox.innerHTML = '';
                    waypointsTab.splice(0, waypointsTab.length);
                    waypointsTab = route;
                    updateRoute(map);
                    data.forEach(e => {
                        updateItemsInRoute(e.object_id, e.name, e.type, e.Latitude, e.Longitude, map);
                    })
                    console.log(waypointsTab);
                });
                
                imgBcg.src = '../assets/img/route.png'
                imgRoute.src = '../assets/img/japan.png'
                spanName.textContent = data[0].route_name;
                divbox.appendChild(imgBcg);
                divbox.appendChild(spanName);
                divbox.appendChild(imgRoute);
                routeBox.appendChild(divbox);
            })
            .catch(error => {
                console.error(error);
            });
        });
    })
    .catch(error => console.error(error)); 
}