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
    if (!waypointsTab.length){
        console.log("Waypoint list is empty.")
        routeBox.innerHTML = '';
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
