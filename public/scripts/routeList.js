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
    if (waypointsTab.length === 1){
        routeBox.innerHTML = '';
    }
    if (!waypointsTab.length){
        console.log("Waypoint list is empty.")
        routeBox.innerHTML = '';
        deleteRoute.style.display = 'none';
        displaySavedRoutes();
    }else{
        const divbox = document.createElement('div');
        const imgBcg = document.createElement('img');
        const spanName = document.createElement('span');
        const imgTrash = document.createElement('img');
        const location = document.createElement('span');
        location.innerHTML = `L.latLng(${objectLat}, ${objectLong})`;
        location.style.display = 'none';
        divbox.className = `route-item ${objectID}`;
        imgBcg.className = 'route-item-bcg';
        spanName.className = 'route-item-name';
        imgTrash.className = `route-item-trash  ${objectID}`;
        location.className = `route-item-location`;

        imgTrash.addEventListener('click', function () {
            divbox.remove();
            waypointsTab.forEach((waypoint, index) => {
                if (waypoint.lat === objectLat && waypoint.lng === objectLong) {
                    waypointsTab.splice(index, 1);
                }
            });
            console.log(waypointsTab);
            updateRoute(map)
            if(!waypointsTab.length){
                updateItemsInRoute(objectID, objectName, objectType, objectLat, objectLong, map)
            }
        });

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
        imgTrash.src = '../assets/img/trashcan.png'
        spanName.textContent = `${objectName}`;
        divbox.appendChild(imgBcg);
        divbox.appendChild(spanName);
        divbox.appendChild(location);
        divbox.appendChild(imgTrash);
        routeBox.appendChild(divbox);
    }
}

// Funkcja do wyświetlenia zapisanych tras
function displaySavedRoutes(){
    var routeBox = document.querySelector('.route-box');
    const allRoutes = []
    const routeNames = [
        "Hachiman shrines",
        "Amaterasu shrines",
        "Ōkuninushi shrines",
        "Susanoo shrines",
        "Izanagi shrines",
    ]
    const deityIDs = [
        4, 1, 8, 13, 20
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