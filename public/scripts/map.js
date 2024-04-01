// Tablica na wszystkie markery
let markers = [];

// Tablice na checkboxy do filtrów
let checkboxTypes = [];
let checkboxTypesValues = [];
let checkboxReligions = [];
let checkboxReligionsValues = [];
let checkboxEras = [];
let checkboxErasValues = [];
let checkboxPrefectures = [];
let checkboxPrefecturesValues = [];
let checkboxDeities = [];
let checkboxDeitiesValues = [];

// Input wyszukiwarki
let search_bar = document.getElementById('search-input');

// Routing
let routingControl;

let waypointsTab = [
];

// Funkcja do zmiany nulli na - 
function replaceNullsWithDash(obj) {
    for (var key in obj) {
      if (obj[key] === null) {
        obj[key] = "No information";
      } else if (typeof obj[key] === "object") {
        replaceNullsWithDash(obj[key]);
      }
    }
}

// Funkcja do ukrywania markerów na mapie
function hideMarker(marker, map) {
    if (map.hasLayer(markers[marker])) {
        map.removeLayer(markers[marker]);
    }
}

// Funkcja do pokazywania markerów na mapie
function showMarker(marker, map) {
    if (!map.hasLayer(markers[marker])) {
        map.addLayer(markers[marker]);
    }
}

// Funkcja do uzupełniania tablic na filtry
function addFilter(column, value){
    if (column === "type"){
        checkboxTypes.push(column);
        checkboxTypesValues.push(value);
    }
    else if (column === "religion"){
        checkboxReligions.push(column);
        checkboxReligionsValues.push(value);
    }
    else if (column === "era"){
        checkboxEras.push(column);
        checkboxErasValues.push(value);
    }
    else if (column === "prefecture"){
        checkboxPrefectures.push(column);
        checkboxPrefecturesValues.push(value);
    }
    else if (column === "deity"){
        checkboxDeities.push(column);
        checkboxDeitiesValues.push(value);
    }else{}

}

// Funkcja do usuwania z tablicy filtru
function removeFilter(column, value){
    if (column === "type"){
        const index = checkboxTypesValues.indexOf(value);
        if (index !== -1) {
            checkboxTypes.splice(index, 1);
            checkboxTypesValues.splice(index, 1);
        }
    }
    else if (column === "religion"){
        const index = checkboxReligionsValues.indexOf(value);
        if (index !== -1) {
            checkboxReligions.splice(index, 1);
            checkboxReligionsValues.splice(index, 1);
        }
    }
    else if (column === "era"){
        const index = checkboxErasValues.indexOf(value);
        if (index !== -1) {
            checkboxEras.splice(index, 1);
            checkboxErasValues.splice(index, 1);
        }
    }
    else if (column === "prefecture"){
        const index = checkboxPrefecturesValues.indexOf(value);
        if (index !== -1) {
            checkboxPrefectures.splice(index, 1);
            checkboxPrefecturesValues.splice(index, 1);
        }
    }
    else if (column === "deity"){
        const index = checkboxDeitiesValues.indexOf(value);
        if (index !== -1) {
            checkboxDeities.splice(index, 1);
            checkboxDeitiesValues.splice(index, 1);
        }
    }
}

// Funkcja do uzupełniania SQL o filtry
function addSqlFilters(from, to, search){
    const whereConditions = [];
    if (checkboxTypesValues.length > 0) {
        whereConditions.push(`o.Type IN (${checkboxTypesValues.map(value => `'${value}'`).join(',')})`);
    }
    if (checkboxReligionsValues.length > 0) {
        whereConditions.push(`o.Religion IN (${checkboxReligionsValues.map(value => `'${value}'`).join(',')})`);
    }
    if (checkboxErasValues.length > 0) {
        whereConditions.push(`o.Era IN (${checkboxErasValues.map(value => `'${value}'`).join(',')})`);
    }
    if (checkboxPrefecturesValues.length > 0) {
        whereConditions.push(`o.Prefecture IN (${checkboxPrefecturesValues.map(value => `'${value}'`).join(',')})`);
    }
    if (checkboxDeitiesValues.length > 0) {
        whereConditions.push(`d.name IN (${checkboxDeitiesValues.map(value => `'${value}'`).join(',')})`);
    }
    if (from !== undefined && to !== undefined){
        whereConditions.push(`(o.year BETWEEN ${from} AND ${to} OR o.year IS NULL)`);
    }
    if (search_bar.value.length > 0){
        whereConditions.push(`
        o.name LIKE '%${search}%' OR 
        o.religion LIKE '%${search}%' OR 
        o.type LIKE '%${search}%' OR 
        o.era LIKE '%${search}%' OR 
        o.year LIKE '%${search}%' OR 
        o.prefecture LIKE '%${search}%' OR 
        o.postal_code LIKE '%${search}%' OR 
        o.municipality LIKE '%${search}%' OR 
        o.subdivision LIKE '%${search}%' OR 
        o.apartment LIKE '%${search}%' OR 
        o.description LIKE '%${search}%' OR 
        d.name LIKE '%${search}%' OR 
        d.description LIKE '%${search}%' OR 
        d.[group] LIKE '%${search}%'`);
    }
    const conditions = whereConditions.join(' AND ');
    console.log(conditions);
    console.log("markers length: " + markers.length);
    const encodedConditions = encodeURIComponent(conditions);
    return encodedConditions;
}

// Funkcja do uzupełniania lat do filtrów
function yearChangeForFilters(){
    let y_from = document.getElementById('range-from').value;
    let y_to = document.getElementById('range-to').value;
    y_from = (y_from === '') ? 0 : y_from; // if empty = 0
    y_to = (y_to === '') ? 10000 : y_to;  // if empty = 10000
    return [y_from, y_to];
}

// Funkcja pod PRZYCISK DO WYŚWIETLANIA PEŁNYCH INFORMACJI
function showDescription(object_id, userID){
    readObjectDescription(object_id);
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
        console.error(error);
        const stars = document.querySelectorAll('.all-stars img');

        var rating = 0;
        handleRating(stars, userID, object_id, rating);
    });
}

// Funkcja pod PRZYCISK DO TWORZENIA TRASY
function createRoute(object_id, name, type){
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
        const { Latitude, Longitude } = data;
        for (let i = 0; i < waypointsTab.length; i++) {
            if (waypointsTab[i].lat === Latitude && waypointsTab[i].lng === Longitude) {
                var popup = L.popup()
                .setLatLng([Latitude, Longitude])
                .setContent("Object already added.")
                .openOn(map);
                return;
            }
        }
        waypointsTab.push(L.latLng(Latitude, Longitude));
        console.log(waypointsTab);
        
        updateRoute(map);
        updateItemsInRoute(object_id, name, type, Latitude, Longitude, map);
    })
    .catch(error => console.error(error));
}

// Funkcja do wybierania ikon
function chooseIcon(type){
    let iconType;
    switch (type) {
        case 'Shrine':
            iconType = '../assets/img/icons/icon_shrine.png';
            break;
        case 'Castle':
            iconType = '../assets/img/icons/icon_castle.png';
            break;
        case 'Temple':
            iconType = '../assets/img/icons/icon_temple.png';
            break;
        case 'Mausoleum':
            iconType = '../assets/img/icons/icon_mausoleum.png';
            break;
        default:
            iconType = '../assets/img/icons/icon_default.png';
    }
    let Icon = L.icon({
        iconUrl: iconType,
        shadowUrl: '../assets/img/icons/marker-shadow.png',
        iconSize:     [25, 41],
        shadowSize:   [29, 32],
        iconAnchor:   [12, 40],
        shadowAnchor: [10, 32],
        popupAnchor:  [0, -35]
    });
    return Icon;
}

// Funkcja do tworzenia kontentu popupa
function createPopup(name, apartment, subdivision, municipality, religion, postal_code, prefecture, type, year, object_id){
    const popupContent =
    '<span style="font-weight: bold; color: #f54b55; font-size: 18px;">' + name +'</span><br>'+
    '<b>Address:</b> '+ apartment +', '+ subdivision +', '+ municipality +', '+ postal_code +', '+ prefecture +'<br>'+
    '<b>Religion:</b> '+ religion +'<br>'+
    '<b>Type:</b> '+ type +'<br>'+
    '<b>Year:</b> '+ year +'<br>'+
    '<button id="toRoute" class="toRoute-butt">Add to route</button>'+
    '<button id="details" class="details-butt">Details</button>'+
    '<span id="popupid" hidden>'+ object_id +'</span>';

    const popup = L.popup({
        className: 'pop-up',
        autoPan: true,
        maxWidth:1000, 
        maxHeight:1000
    }).setContent(popupContent);
    return popup;
}

// Funkcja do stworzenia mapy
function displayMap(){
    fetch('/api/mapbox-token')
    .then(response => response.json())
    .then(data => {
        window.map = L.map('map-id').setView([36.239368, 137.1976891], 8);
        const mainLayer = 
        L.tileLayer(`https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${data.Token}`, 
        {
            minZoom: 3,
            maxZoom: 17,
            attribution: 'Map data &copy; <a href="https://www.mapbox.com/">Mapbox</a>',
            id: 'mapbox/dark-v10',
            tileSize: 512,
            zoomOffset: -1,
        });
        mainLayer.addTo(map);
        displayObjectsOnMap(map);
    })
    .catch(error => console.error('Błąd pobierania tokenu:', error));
}

// Funkcja do stworzenia wszystkich obiektów i ich danych
function displayObjectsOnMap(map) {
    fetch('/api/objects')
        .then(response => response.json())
        .then(data => {
            replaceNullsWithDash(data);
            data.forEach(row => {
                const userID = document.getElementById('user-id').value;
                const { object_id, name, religion, type, year, prefecture, postal_code, 
                    municipality, subdivision, apartment, Latitude, Longitude } = row;
                let iterator = 0;

                const Icon = chooseIcon(type);

                const popup = createPopup(name, apartment, subdivision, 
                    municipality, religion, postal_code, prefecture, type, year, object_id)

                const marker = new L.marker([Latitude, Longitude], {icon: Icon}).addTo(map)
                    .bindPopup(popup)
                    .on('popupopen', function(e) {
                        const detailsButton = e.popup._contentNode.querySelector('#details');
                        detailsButton.addEventListener('click', function() {
                            showDescription(object_id, userID)
                        });
                        const routeButton = e.popup._contentNode.querySelector('#toRoute');
                        routeButton.addEventListener('click', function() {
                            createRoute(object_id, name, type)
                        });
                    });

                markers.push(marker);
                map.addLayer(markers[iterator]);
                iterator++;   
            });
        })
        .catch(error => { console.error('Error fetching objects:', error); });
}

// Funkcja do wysyłania żądań do endpointu filtrów
async function filteredObjects(conditions){
    if (conditions.length > 0) {
        const response = await fetch(`/api/objects/filters/${conditions}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        for (let i = 0; i < markers.length; i++) {
            hideMarker(i, map);
        }
        data.forEach(item => {
            showMarker(item.object_id - 1, map);
        });
    } else {
        for (let i = 0; i < markers.length; i++) {
            showMarker(i, map);
        }
    }
}

window.addEventListener('load', () => {
    //Pozwolenie na notyfikacje
    Notification.requestPermission().then((result) => {
        console.log(result);
    });
    
    //Wyświetlanie bazowej mapy
    displayMap()
    displaySavedRoutes();
    displayUserRoutes();
    showRandomObject();

    // Funkcja do obsługi zmiany stanu checkboxa
    async function handleCheckboxChange(checkbox) {
        const value = checkbox.id;
        const column = checkbox.className;
        // Uzupełnienie tablic o odpowiednie filtry
        if (checkbox.checked) {
            addFilter(column, value);
        } else {
            removeFilter(column, value);
        }
        const [y_from, y_to] = yearChangeForFilters();
        // Uzupełnienie SQL
        const conditions = addSqlFilters(y_from, y_to);
        try {
            filteredObjects(conditions);
        } catch (error) {
            console.error('There was a problem with fetch operation:', error);
            for (let i = 0; i < markers.length; i++) {
                hideMarker(i, map);
            }
        }
    }
    
    // Opóźnienie aby checkboxy się stworzyły
    setTimeout(() => {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                handleCheckboxChange(event.target);
            });
        });
    }, 750);

    // Wyszukiwarka
    async function handleSearch_barChange(value) {
        const [y_from, y_to] = yearChangeForFilters();
        const conditions = addSqlFilters(y_from, y_to, value);
        try {
            filteredObjects(conditions);
        } catch (error) {
            console.error('There was a problem with fetch operation:', error);
            for (let i = 0; i < markers.length; i++) {
                hideMarker(i, map);
            }
        }
    }
    search_bar.addEventListener('change', () => { handleSearch_barChange(search_bar.value); });

    // Funkcja do filtrowania po roku
    async function handleInput_yearChange() {
        const [y_from, y_to] = yearChangeForFilters();
        const conditions = addSqlFilters(y_from, y_to);
        try {
            if (conditions.length > 0) {
                const response = await fetch(`/api/objects/filters/${conditions}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                for (let i = 0; i < markers.length; i++) {
                    hideMarker(i, map);
                }
                data.forEach(item => {
                    showMarker(item.object_id - 1, map);
                });
            } else {
                for (let i = 0; i < markers.length; i++) {
                    showMarker(i, map);
                }
            }
        } catch (error) {
            console.error('There was a problem with your fetch operation:', error);
            for (let i = 0; i < markers.length; i++) {
                hideMarker(i, map);
            }
        }
    }

    // Pobranie inputów lat do filtrów
    const year_from = document.getElementById('range-from');
    year_from.addEventListener('change', () => { handleInput_yearChange(); });
    year_from.addEventListener('input', () => { //Walidacja
        const rangeFromValue = parseFloat(year_from.value);
        const rangeToValue = parseFloat(year_to.value);
        if (rangeFromValue < 0) {
            year_from.value = 0;
        } else if (rangeToValue < rangeFromValue) {
            year_from.value = rangeToValue - 1;
        }
    });
    const year_to = document.getElementById('range-to');
    year_to.addEventListener('change', () => { handleInput_yearChange(); });
    year_to.addEventListener('input', () => { //Walidacja
        const rangeFromValue = parseFloat(year_from.value);
        const rangeToValue = parseFloat(year_to.value);
        if (rangeToValue > 2024) {
            year_to.value = 2024;
        } else if (rangeToValue < rangeFromValue) {
            year_to.value = rangeFromValue + 1;
        }
    });

});